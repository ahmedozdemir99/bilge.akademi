import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import type { ExamArchiveState } from '../types/exam';
import { loadArchiveFromCloud, mergeArchives, syncArchiveToCloud } from '../utils/cloudBackup';

function actualRecords(archive: ExamArchiveState): ExamArchiveState {
  const exams = archive.exams.filter((exam) => !exam.id.startsWith('bilge-ornek-'));
  const ids = new Set(exams.map((exam) => exam.id));
  return {
    exams,
    students: archive.students.flatMap((student) => {
      const records = student.exams.filter((record) => ids.has(record.examId));
      return records.length ? [{ ...student, exams: records }] : [];
    }),
  };
}

function errorText(issue: unknown) {
  const code = issue && typeof issue === 'object' && 'code' in issue && typeof issue.code === 'string'
    ? issue.code
    : undefined;
  switch (code) {
    case 'auth/unauthorized-domain':
      return `Google girişi ${window.location.hostname} için kullanılamıyor. Bilge Akademi’ye e-posta ile giriş yapıp tekrar deneyin.`;
    case 'auth/user-token-expired':
    case 'unauthenticated':
      return 'Oturumunuzun süresi doldu. Bilge Akademi’ye yeniden giriş yapıp tekrar deneyin.';
    case 'permission-denied':
      return 'Firebase bu arşive erişim izni vermedi. Bilge Akademi hesabınız doğrulanmışsa Firestore kurallarının yayımlandığını kontrol edin.';
    case 'resource-exhausted':
      return 'Firebase kullanım sınırına ulaşıldı. Arşivinizi JSON dosyası olarak indirebilirsiniz.';
    case 'auth/network-request-failed':
    case 'deadline-exceeded':
    case 'unavailable':
      return 'Firebase bağlantısı kesildi. Arşiviniz bu tarayıcıda duruyor. Bağlantınızı kontrol edip tekrar deneyin.';
    default:
      return issue instanceof Error && !code ? issue.message : 'Firebase yedekleme işlemi tamamlanamadı. Arşiviniz bu tarayıcıda duruyor.';
  }
}

export function useCloudBackup(user: User | null, archive: ExamArchiveState, onRestore: (archive: ExamArchiveState) => void) {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [phase, setPhase] = useState('');
  const active = useRef<Promise<boolean> | null>(null);
  const dirty = useRef(false);
  const latest = useRef(archive);
  latest.current = archive;

  const save = useCallback((): Promise<boolean> => {
    if (active.current) return active.current;
    if (!user?.emailVerified || auth.currentUser?.uid !== user.uid) {
      setError('Firebase yedeği için doğrulanmış hesabınızla giriş yapın.');
      return Promise.resolve(false);
    }
    const source = latest.current;
    const local = actualRecords(source);
    if (local.exams.length === 0) {
      dirty.current = false;
      setError('');
      setStatus('Yedeklenecek deneme bulunamadı.');
      return Promise.resolve(true);
    }
    setBusy(true);
    setSlow(false);
    setProgress(null);
    setPhase('Buluttaki kayıtlar kontrol ediliyor…');
    const slowTimer = window.setTimeout(() => setSlow(true), 20000);
    setStatus('Firebase’e yedekleniyor…');
    setError('');
    const task = (async () => {
      try {
        const remote = await loadArchiveFromCloud(user.uid);
        if (auth.currentUser?.uid !== user.uid) return false;
        setPhase('Kayıtlar hazırlanıyor…');
        await syncArchiveToCloud(user.uid, user.displayName || 'Öğretmen', mergeArchives(local, remote.archive), remote.manifest, {
          onProgress: (completed, total) => {
            setProgress(Math.round((completed / total) * 100));
            setPhase(completed === total ? 'Firebase kaydı tamamlandı.' : `Firebase kayıtları gönderiliyor (${completed}/${total})`);
          },
        });
        dirty.current = source !== latest.current;
        setStatus('Deneme Analiz arşivi Firebase’e yedeklendi.');
        return true;
      } catch (issue) {
        setStatus('');
        setProgress(null);
        setPhase('');
        setError(errorText(issue));
        return false;
      }
    })().finally(() => {
      window.clearTimeout(slowTimer);
      setSlow(false);
      active.current = null;
      setBusy(false);
    });
    active.current = task;
    return task.then((saved) => {
      if (saved && dirty.current && latest.current !== source && auth.currentUser?.uid === user.uid) return save();
      return saved;
    });
  }, [user]);

  const restore = useCallback(async () => {
    if (active.current) return;
    if (!user?.emailVerified || auth.currentUser?.uid !== user.uid) {
      setError('Firebase yedeği için doğrulanmış hesabınızla giriş yapın.');
      return;
    }
    setBusy(true);
    setSlow(false);
    setProgress(null);
    setPhase('Buluttaki kayıtlar okunuyor…');
    const slowTimer = window.setTimeout(() => setSlow(true), 20000);
    setStatus('Firebase yedeği okunuyor…');
    setError('');
    const task = (async () => {
      try {
        const result = await loadArchiveFromCloud(user.uid);
        if (auth.currentUser?.uid !== user.uid) return false;
        if (!result.exists || !result.archive.exams.length) {
          setStatus('Firebase’de Deneme Analiz yedeği bulunamadı.');
          return true;
        }
        onRestore(mergeArchives(latest.current, result.archive));
        setPhase('Buluttan geri yükleme tamamlandı.');
        setStatus('Firebase yedeği mevcut deneme arşivinizle birleştirildi.');
        return true;
      } catch (issue) {
        setStatus('');
        setPhase('');
        setError(errorText(issue));
        return false;
      }
    })().finally(() => {
      window.clearTimeout(slowTimer);
      setSlow(false);
      active.current = null;
      setBusy(false);
    });
    active.current = task;
    await task;
  }, [onRestore, user]);

  useEffect(() => {
    if (!user?.emailVerified || !dirty.current) return;
    const timer = window.setTimeout(() => { void save(); }, 1200);
    return () => window.clearTimeout(timer);
  }, [archive, save, user]);

  useEffect(() => {
    if (!user?.emailVerified) return;
    const flush = () => { if (dirty.current) void save(); };
    const onHide = () => { if (document.visibilityState === 'hidden') flush(); };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('online', flush);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('online', flush);
      flush();
    };
  }, [save, user]);

  const markDirty = useCallback(() => { dirty.current = true; }, []);
  return { status, error, busy, slow, progress, phase, save, restore, markDirty };
}
