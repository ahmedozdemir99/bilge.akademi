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
  const code = (issue as { code?: string } | null)?.code;
  if (code === 'permission-denied') return 'Deneme Analiz yedeğine erişilemedi. Doğrulanmış Bilge Akademi hesabınızla tekrar deneyin.';
  if (code === 'resource-exhausted') return 'Firebase kotası doldu. Arşivinizi JSON dosyası olarak indirebilirsiniz.';
  return issue instanceof Error && !code ? issue.message : 'Firebase’e ulaşılamadı. Arşiviniz bu tarayıcıda duruyor.';
}

export function useCloudBackup(user: User | null, archive: ExamArchiveState, onRestore: (archive: ExamArchiveState) => void) {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const active = useRef<Promise<boolean> | null>(null);
  const dirty = useRef(false);
  const latest = useRef(archive);
  latest.current = archive;

  const save = useCallback((): Promise<boolean> => {
    if (active.current) return active.current;
    if (!user?.emailVerified || auth.currentUser?.uid !== user.uid) return Promise.resolve(false);
    const source = latest.current;
    const local = actualRecords(source);
    if (local.exams.length === 0) {
      setError('');
      setStatus('Yedeklenecek deneme bulunamadı.');
      return Promise.resolve(true);
    }
    setBusy(true);
    setStatus('Firebase’e yedekleniyor…');
    setError('');
    const task = (async () => {
      try {
        const remote = await loadArchiveFromCloud(user.uid);
        if (auth.currentUser?.uid !== user.uid) return false;
        await syncArchiveToCloud(user.uid, user.displayName || 'Öğretmen', mergeArchives(local, remote.archive), remote.manifest);
        dirty.current = source !== latest.current;
        setStatus('Deneme Analiz arşivi Firebase’e yedeklendi.');
        return true;
      } catch (issue) {
        setStatus('');
        setError(errorText(issue));
        return false;
      }
    })().finally(() => {
      active.current = null;
      setBusy(false);
      if (dirty.current && latest.current !== source && auth.currentUser?.uid === user.uid) void save();
    });
    active.current = task;
    return task;
  }, [user]);

  const restore = useCallback(async () => {
    if (!user?.emailVerified || auth.currentUser?.uid !== user.uid || active.current) return;
    setBusy(true);
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
        dirty.current = false;
        setStatus('Firebase yedeği mevcut deneme arşivinizle birleştirildi.');
        return true;
      } catch (issue) {
        setStatus('');
        setError(errorText(issue));
        return false;
      }
    })().finally(() => {
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
  return { status, error, busy, save, restore, markDirty };
}
