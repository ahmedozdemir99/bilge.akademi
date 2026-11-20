import { mkdir, mkdtemp, rename, rm, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';

const staging = await mkdtemp('.sites-output-');
try {
  await rename('dist', `${staging}/client`);
  await mkdir(`${staging}/server`);
  await build({
    entryPoints: ['worker/sites.ts'],
    outfile: `${staging}/server/index.js`,
    bundle: true,
    platform: 'browser',
    format: 'esm',
    target: 'es2022',
  });
  await writeFile(`${staging}/server/wrangler.json`, JSON.stringify({
    main: 'index.js',
    assets: { directory: '../client', binding: 'ASSETS' },
  }));
  await rename(staging, 'dist');
} finally {
  await rm(staging, { recursive: true, force: true });
}
