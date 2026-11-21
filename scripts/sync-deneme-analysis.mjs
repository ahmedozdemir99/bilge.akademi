import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const [sourceDirectory] = process.argv.slice(2);
if (!sourceDirectory) throw new Error('Usage: node scripts/sync-deneme-analysis.mjs <upstream-checkout>');

const destination = 'src/deneme-analysis';
const revisionFile = join(destination, 'upstream-revision.txt');
const upstream = resolve(sourceDirectory);
const git = (...args) => execFileSync('git', ['-C', upstream, ...args], {
  encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
});
const previous = readFileSync(revisionFile, 'utf8').trim();
const next = git('rev-parse', 'HEAD').trim();

if (!/^[0-9a-f]{40}$/.test(previous)) throw new Error('Invalid upstream revision in upstream-revision.txt.');
if (previous === next) {
  console.log('Deneme Analizi is up to date.');
  process.exit(0);
}

// Leave the destination unchanged if upstream rewrites the imported history.
git('merge-base', '--is-ancestor', previous, next);

const standaloneFiles = new Set([
  'components/CloudBackupControl.tsx',
  'components/PWAInstallButton.tsx',
  'hooks/useCloudBackup.ts',
  'utils/cloudBackup.ts',
]);

function embeddedPath(path) {
  if (path === 'src/App.tsx') return 'DenemeAnalysis.tsx';
  const relative = path.slice('src/'.length);
  if (/^src\/(components|hooks|types|utils)\/(?:[\w-]+\/)*[\w.-]+\.(ts|tsx|css)$/.test(path) &&
      !standaloneFiles.has(relative)) return relative;
}

function sourceFile(revision, path) {
  const entry = git('ls-tree', revision, '--', path);
  if (!entry) return undefined;
  if (!entry.startsWith('100644 blob ') && !entry.startsWith('100755 blob ')) {
    throw new Error('Upstream sync requires a regular text file: ' + path);
  }
  return git('show', revision + ':' + path);
}

const temp = mkdtempSync(join(tmpdir(), 'deneme-merge-'));
const changes = [];
const conflicts = [];
try {
  const paths = git('diff', '--no-renames', '--name-only', '-z', previous, next, '--', 'src').split('\0').filter(Boolean);
  for (const path of paths) {
    const relative = embeddedPath(path);
    if (!relative) continue;
    const file = join(destination, relative);
    const current = existsSync(file) ? readFileSync(file, 'utf8') : undefined;
    const before = sourceFile(previous, path);
    const after = sourceFile(next, path);

    if (current === after) continue;
    if (current === before) {
      changes.push({ file, content: after });
      continue;
    }
    if (current === undefined || before === undefined || after === undefined) {
      conflicts.push(file);
      continue;
    }

    const versions = ['embedded', 'previous', 'upstream'].map((name) => join(temp, name));
    [current, before, after].forEach((content, index) => writeFileSync(versions[index], content));
    const result = spawnSync('git', ['merge-file', '-p', ...versions], {
      encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
    });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      conflicts.push(file);
    } else {
      changes.push({ file, content: result.stdout });
    }
  }

  if (conflicts.length) {
    throw new Error('Review overlapping Deneme Analizi changes before publishing:\n' + conflicts.join('\n'));
  }

  for (const { file, content } of changes) {
    if (content === undefined) {
      rmSync(file);
    } else {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, content);
    }
  }
  writeFileSync(revisionFile, next + '\n');
  console.log(`Deneme Analizi ${previous.slice(0, 7)} → ${next.slice(0, 7)} (${changes.length} files).`);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
