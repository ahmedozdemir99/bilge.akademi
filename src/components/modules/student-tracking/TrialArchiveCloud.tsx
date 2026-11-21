import { useRef, useState } from 'react';
import { CloudDownload, CloudUpload, Download, FileUp } from 'lucide-react';
import { useAcademy } from '../../../context/AcademyContext';
import { buildBulkPlan } from '../../../utils/bulkStudentRecords';
import { trialArchiveRestoreInputs, type TrialArchiveBackup } from '../../../utils/trialArchiveBackup';
import { connectTrialDrive, downloadTrialCloudFile, listTrialCloudFiles, TrialDriveError, uploadTrialCloudFile, type TrialCloudFile } from '../../../utils/trialCloudFiles';

const button = 'inline-flex min-h-10 items-center gap-2 rounded-lg border border-teal-300 px-3 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-50 disabled:opacity-50 dark:border-teal-800 dark:text-teal-200 dark:hover:bg-teal-950';

export function TrialArchiveCloud({ pending, onClear, onRestored }: {
  pending?: { backup: TrialArchiveBackup; owner?: string };
  onClear: () => void;
  onRestored: (classId: string) => void;
}) {
  const { user, dataLoading, signInWithGoogle, classes, students, grades, practiceExams, saveBulkRecords } = useAcademy();
  const session = useRef<{ owner: string; token: string } | undefined>(undefined);
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [files, setFiles] = useState<{ owner: string; items: TrialCloudFile[] }>();
  const [restoring, setRestoring] = useState<{ owner: string; backup: TrialArchiveBackup }>();
  const candidate = pending && (!pending.owner || pending.owner === user?.uid) ? pending.backup : undefined;
  const preview = restoring && restoring.owner === user?.uid ? restoring.backup : undefined;

  async function run(action: (owner: string) => Promise<void>) {
    if (!user || lock.current || dataLoading) return;
    lock.current = true;
    setBusy(true);
    setMessage('');
    setError('');
    try {
      await action(user.uid);
    } catch (issue) {
      if (issue instanceof TrialDriveError && issue.status === 401) session.current = undefined;
      const code = (issue as { code?: string } | null)?.code;
      setError(code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request'
        ? 'Google Drive bağlantısı tamamlanmadı. Firebase’e kaydedebilir veya yedek dosyasını indirebilirsiniz.'
        : issue instanceof Error ? issue.message : 'Bulut işlemi tamamlanamadı.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function driveToken() {
    if (!user) throw new Error('Google ile giriş yapın.');
    if (session.current?.owner === user.uid) return session.current.token;
    const token = await connectTrialDrive(user);
    session.current = { owner: user.uid, token };
    return token;
  }

  async function restore(backup: TrialArchiveBackup, fromArchive = false) {
    await run(async (owner) => {
      const inputs = trialArchiveRestoreInputs(backup);
      const snapshot = { classes, students, grades, practiceExams };
      await Promise.all(inputs.map((input) => buildBulkPlan(input, snapshot, owner)));
      let saved = 0;
      let firstClass = '';
      for (const input of inputs) {
        const result = await saveBulkRecords(input);
        saved += result.saved;
        firstClass ||= result.classId;
        if (result.error) throw new Error(saved + ' kayıt eklendi. ' + result.error);
      }
      setRestoring(undefined);
      if (fromArchive) onClear();
      setMessage(saved ? saved + ' yeni kayıt Firebase’e eklendi.' : 'Deneme sonuçları, sınıflar ve öğrenci listeleri zaten Firebase arşivinizde kayıtlı.');
      if (firstClass) onRestored(firstClass);
    });
  }

  function downloadBackup(backup: TrialArchiveBackup) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = backup.title + ' · ' + backup.date + '.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function readBackup(owner: string, file: File) {
    if (file.size > 10 * 1024 * 1024) throw new Error('Yedek dosyası en fazla 10 MB olabilir.');
    const backup = JSON.parse(await file.text()) as TrialArchiveBackup;
    trialArchiveRestoreInputs(backup);
    setRestoring({ owner, backup });
  }

  return <section aria-label="Deneme arşivi bulut yedeği" className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
    <h3 className="font-semibold">Deneme Arşivi Bulut Yedeği</h3>
    {candidate && <div className="space-y-2 rounded-lg bg-teal-50 p-3 dark:bg-teal-950/60">
      <p className="text-sm"><strong>{candidate.title}</strong> · {candidate.classes.length} sınıf · {candidate.classes.reduce((n, item) => n + item.students.length, 0)} öğrenci</p>
      <div className="flex flex-wrap gap-2">
        {user ? <button type="button" className={button} disabled={busy || dataLoading}
          onClick={() => void restore(candidate, true)}>
          <CloudUpload size={16} aria-hidden="true" /> Firebase’e Kaydet
        </button> : <button type="button" className={button} onClick={() => void signInWithGoogle()}>Google ile Giriş Yap</button>}
        <button type="button" className={button} disabled={busy} onClick={() => downloadBackup(candidate)}>
          <Download size={16} aria-hidden="true" /> Yedek Dosyasını İndir
        </button>
        <button type="button" className="px-3 py-2 text-sm underline" onClick={onClear} disabled={busy}>Vazgeç</button>
      </div>
    </div>}
    {user ? <>
      <label className={button + ' cursor-pointer focus-within:outline-2'}>
        <FileUp size={16} aria-hidden="true" /> Yedek Dosyasından Geri Yükle
        <input type="file" accept=".json,application/json" className="sr-only" disabled={busy || dataLoading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) void run((owner) => readBackup(owner, file));
          }} />
      </label>
      <details className="space-y-2 text-sm">
        <summary className="cursor-pointer text-slate-600 dark:text-slate-300">Google Drive yedekleri</summary>
        <p>Drive, ayrı Google izni ister. Firebase’e kaydetmek için bu izin gerekmez.</p>
        <div className="flex flex-wrap gap-2">
          {candidate && <button type="button" className={button} disabled={busy || dataLoading} onClick={() => void run(async () => {
            const file = new File([JSON.stringify(candidate)], candidate.title + ' · ' + candidate.date + '.json', { type: 'application/json' });
            await uploadTrialCloudFile(await driveToken(), file, null, 'archive');
            onClear();
            setMessage('Deneme sonuçları, sınıflar ve öğrenci listeleri Google Drive’a yedeklendi.');
          })}><CloudUpload size={16} aria-hidden="true" /> Drive’a Yedekle</button>}
          <button type="button" className={button} disabled={busy || dataLoading} onClick={() => void run(async (owner) => {
            setFiles({ owner, items: await listTrialCloudFiles(await driveToken(), 'archive') });
          })}><CloudDownload size={16} aria-hidden="true" /> Drive Yedeklerini Aç</button>
        </div>
        {files && files.owner === user.uid && (files.items.length
          ? <ul className="max-h-60 space-y-1 overflow-auto">
            {files.items.map((file) => <li key={file.id}><button type="button" className={button} disabled={busy} onClick={() => void run(async (owner) => {
              await readBackup(owner, await downloadTrialCloudFile(await driveToken(), file));
              setFiles(undefined);
            })}>{file.name.replace(/\.json$/i, '')}</button></li>)}
          </ul> : <p>Drive’da deneme arşivi yedeği yok.</p>)}
      </details>
    </> : !candidate && <p className="text-sm text-slate-600 dark:text-slate-300">Yedek geri yüklemek için Google ile giriş yapın.</p>}
    {preview && <div className="space-y-2 rounded-lg bg-teal-50 p-3 dark:bg-teal-950/60">
      <p className="text-sm"><strong>{preview.title}</strong> · {preview.classes.length} sınıf · {preview.classes.reduce((n, item) => n + item.results.length, 0)} deneme sonucu</p>
      <button type="button" className={button} disabled={busy || dataLoading} onClick={() => void restore(preview)}>Eksik Kayıtları Firebase’e Ekle</button>
    </div>}
    {busy && <p role="status" className="text-sm">Bulut işlemi sürüyor…</p>}
    {message && <p role="status" className="text-sm">{message}</p>}
    {error && <p role="alert" className="whitespace-pre-line text-sm text-red-700 dark:text-red-300">{error}</p>}
  </section>;
}
