import { useRef, useState } from 'react';
import { CloudDownload, CloudUpload, Download, FileUp } from 'lucide-react';
import { useAcademy } from '../../../context/AcademyContext';
import { buildBulkPlan } from '../../../utils/bulkStudentRecords';
import { parseTrialArchiveBackup, trialArchiveRestoreInputs, type TrialArchiveBackup } from '../../../utils/trialArchiveBackup';
import { connectTrialDrive, downloadTrialCloudFile, listTrialCloudFiles, TrialDriveError, uploadTrialCloudFile, type TrialCloudFile } from '../../../utils/trialCloudFiles';
import { listTrialFirestoreBackups, readTrialFirestoreBackup, saveTrialFirestoreBackup, type TrialFirestoreBackup } from '../../../utils/trialFirestoreBackups';

const grid = 'grid grid-cols-1 gap-2 min-[480px]:grid-cols-2';
const button = 'inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-lg border border-teal-300 px-3 py-2 text-center text-sm font-semibold text-teal-800 hover:bg-teal-50 disabled:opacity-50 dark:border-teal-800 dark:text-teal-200 dark:hover:bg-teal-950 [&>svg]:shrink-0';
const primary = 'inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-lg bg-teal-700 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60 [&>svg]:shrink-0';
const panel = 'min-w-0 space-y-3 rounded-lg bg-teal-50 p-3 dark:bg-teal-950/60';

export function TrialArchiveCloud({ pending, onClear, onRestored }: {
  pending?: { backup: TrialArchiveBackup; owner?: string };
  onClear: () => void;
  onRestored: (classId: string) => void;
}) {
  const { user, dataLoading, setSignInOpen, classes, students, grades, practiceExams, saveBulkRecords } = useAcademy();
  const session = useRef<{ owner: string; token: string } | undefined>(undefined);
  const lock = useRef(false);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [cloudFiles, setCloudFiles] = useState<{ owner: string; items: TrialFirestoreBackup[] }>();
  const [driveFiles, setDriveFiles] = useState<{ owner: string; items: TrialCloudFile[] }>();
  const [restoring, setRestoring] = useState<{ owner: string; backup: TrialArchiveBackup }>();
  const [savedBackup, setSavedBackup] = useState<TrialArchiveBackup>();
  const candidate = pending?.owner === user?.uid ? pending?.backup : undefined;
  const preview = restoring && restoring.owner === user?.uid ? restoring.backup : undefined;

  async function run(status: string, action: (owner: string) => Promise<void>) {
    if (!user || lock.current) return;
    lock.current = true;
    setBusy(status);
    setMessage('');
    setError('');
    try {
      await action(user.uid);
    } catch (issue) {
      if (issue instanceof TrialDriveError && issue.status === 401) session.current = undefined;
      const code = (issue as { code?: string } | null)?.code;
      const messages: Record<string, string> = {
        'auth/popup-closed-by-user': 'Drive bağlantısı tamamlanmadı.',
        'auth/cancelled-popup-request': 'Drive bağlantısı tamamlanmadı.',
        'auth/user-mismatch': 'Drive yedeği için Bilge Akademi hesabınıza bağlı Google hesabını seçin.',
        'permission-denied': 'Firebase bu yedek işlemine izin vermedi. Hesabınızla yeniden giriş yapıp deneyin.',
        unavailable: 'Firebase’e ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin.',
        'resource-exhausted': 'Firebase kullanım sınırına ulaşıldı. Yedeği dosya olarak indirebilirsiniz.',
      };
      setError((code && messages[code]) || (issue instanceof Error ? issue.message : 'Yedek işlemi tamamlanamadı.'));
    } finally {
      lock.current = false;
      setBusy('');
    }
  }

  async function driveToken() {
    if (!user) throw new Error('Önce giriş yapın.');
    if (session.current?.owner === user.uid) return session.current.token;
    const token = await connectTrialDrive(user);
    session.current = { owner: user.uid, token };
    return token;
  }

  function restore(backup: TrialArchiveBackup) {
    void run('Kayıtlar geri yükleniyor…', async (owner) => {
      const inputs = trialArchiveRestoreInputs(backup, classes);
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
      setMessage(saved ? saved + ' eksik kayıt geri yüklendi.' : 'Yedekteki kayıtların tamamı zaten arşivinizde.');
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
    setRestoring({ owner, backup: parseTrialArchiveBackup(await file.text()) });
  }

  function showCloudBackups() {
    void run('Firebase yedekleri açılıyor…', async (owner) => {
      setCloudFiles({ owner, items: await listTrialFirestoreBackups(owner) });
      setRestoring(undefined);
    });
  }

  return (
    <section aria-label="Deneme arşivi yedekleri" className="min-w-0 space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800 sm:p-4">
      <h3 className="font-semibold">Deneme Arşivi Yedekleri</h3>

      {candidate && (
        <div className={panel}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 text-sm">
              <p className="break-words font-semibold">{candidate.title}</p>
              <p>{candidate.classes.length} sınıf · {candidate.classes.reduce((count, item) => count + item.students.length, 0)} öğrenci</p>
            </div>
            <button type="button" className="shrink-0 px-1 py-1 text-sm underline" onClick={onClear} disabled={Boolean(busy)}>Kapat</button>
          </div>
          <div className={grid}>
            {user ? (
              <button type="button" className={primary} disabled={Boolean(busy) || savedBackup === candidate}
                onClick={() => void run('Firebase’e yedekleniyor…', async (owner) => {
                  const added = await saveTrialFirestoreBackup(owner, candidate);
                  setSavedBackup(candidate);
                  setMessage(added ? 'Deneme arşivi Firebase’e yedeklendi.' : 'Bu yedek zaten Firebase’de kayıtlı.');
                  setCloudFiles(undefined);
                })}>
                <CloudUpload size={16} aria-hidden="true" /> {savedBackup === candidate ? 'Firebase’e Yedeklendi' : 'Firebase’e Yedekle'}
              </button>
            ) : (
              <button type="button" className={primary} onClick={() => setSignInOpen(true)}>Yedeklemek İçin Giriş Yap</button>
            )}
            <button type="button" className={button} disabled={Boolean(busy)} onClick={() => downloadBackup(candidate)}>
              <Download size={16} aria-hidden="true" /> Yedek Dosyasını İndir
            </button>
          </div>
        </div>
      )}

      {user ? (
        <>
          <div className={grid}>
            <button type="button" className={button} disabled={Boolean(busy)} onClick={showCloudBackups}>
              <CloudDownload size={16} aria-hidden="true" /> Firebase Yedeklerini Aç
            </button>
            <label className={button + ' cursor-pointer focus-within:outline-2 has-disabled:cursor-default has-disabled:opacity-50'}>
              <FileUp size={16} aria-hidden="true" /> Dosyadan Geri Yükle
              <input type="file" accept=".json,application/json" className="sr-only" disabled={Boolean(busy)}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = '';
                  if (file) void run('Yedek dosyası okunuyor…', (owner) => readBackup(owner, file));
                }} />
            </label>
          </div>
          {cloudFiles?.owner === user.uid && (
            <div className="space-y-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold">Firebase Yedekleri</h4>
                <button type="button" className="text-sm underline" disabled={Boolean(busy)} onClick={() => setCloudFiles(undefined)}>Kapat</button>
              </div>
              {cloudFiles.items.length ? (
                <ul className="max-h-64 space-y-2 overflow-auto">
                  {cloudFiles.items.map((file) => (
                    <li key={file.id}>
                      <button type="button" className={button + ' flex-col items-start gap-0 text-left'} disabled={Boolean(busy)}
                        onClick={() => void run('Firebase yedeği okunuyor…', async (owner) => {
                          setRestoring({ owner, backup: await readTrialFirestoreBackup(owner, file) });
                        })}>
                        <span className="w-full break-words">{file.title}</span>
                        <span className="text-xs font-normal">{file.examDate} · {file.classCount} sınıf · {file.studentCount} öğrenci</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm">Henüz Firebase yedeği yok.</p>}
            </div>
          )}

          <details className="space-y-2 text-sm">
            <summary className="cursor-pointer text-slate-600 dark:text-slate-300">Google Drive yedekleri</summary>
            <p>Bu işlemler, hesabınıza bağlı Google hesabının Drive iznini gerektirir.</p>
            <div className={grid}>
              {candidate && (
                <button type="button" className={button} disabled={Boolean(busy)} onClick={() => void run('Drive’a yedekleniyor…', async () => {
                  const file = new File([JSON.stringify(candidate)], candidate.title + ' · ' + candidate.date + '.json', { type: 'application/json' });
                  await uploadTrialCloudFile(await driveToken(), file, null, 'archive');
                  setMessage('Deneme arşivi Google Drive’a yedeklendi.');
                })}><CloudUpload size={16} aria-hidden="true" /> Drive’a Yedekle</button>
              )}
              <button type="button" className={button} disabled={Boolean(busy)} onClick={() => void run('Drive yedekleri açılıyor…', async (owner) => {
                setDriveFiles({ owner, items: await listTrialCloudFiles(await driveToken(), 'archive') });
              })}><CloudDownload size={16} aria-hidden="true" /> Drive Yedeklerini Aç</button>
            </div>
            {driveFiles?.owner === user.uid && (driveFiles.items.length
              ? <ul className="max-h-60 space-y-2 overflow-auto">
                {driveFiles.items.map((file) => <li key={file.id}><button type="button" className={button + ' break-words'} disabled={Boolean(busy)}
                  onClick={() => void run('Drive yedeği okunuyor…', async (owner) => {
                    await readBackup(owner, await downloadTrialCloudFile(await driveToken(), file));
                  })}>{file.name.replace(/\.json$/i, '')}</button></li>)}
              </ul> : <p>Drive’da deneme arşivi yedeği yok.</p>)}
          </details>
        </>
      ) : !candidate && <button type="button" className={button} onClick={() => setSignInOpen(true)}>Yedekler İçin Giriş Yap</button>}

      {preview && (
        <div className={panel}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 text-sm">
              <p className="break-words font-semibold">{preview.title}</p>
              <p>{preview.classes.length} sınıf · {preview.classes.reduce((n, item) => n + item.results.length, 0)} deneme sonucu</p>
            </div>
            <button type="button" className="shrink-0 px-1 py-1 text-sm underline" disabled={Boolean(busy)} onClick={() => setRestoring(undefined)}>Kapat</button>
          </div>
          <div className={grid}>
            <button type="button" className={primary} disabled={Boolean(busy) || dataLoading} onClick={() => restore(preview)}>Eksik Kayıtları Geri Yükle</button>
            <button type="button" className={button} disabled={Boolean(busy)} onClick={() => downloadBackup(preview)}>
              <Download size={16} aria-hidden="true" /> Yedek Dosyasını İndir
            </button>
          </div>
        </div>
      )}
      {busy && <p role="status" className="text-sm">{busy}</p>}
      {message && <p role="status" className="text-sm font-medium text-teal-800 dark:text-teal-200">{message}</p>}
      {error && <p role="alert" className="whitespace-pre-line text-sm text-red-700 dark:text-red-300">{error}</p>}
    </section>
  );
}
