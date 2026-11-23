import { useCallback, useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAcademy } from '../../context/AcademyContext';

type Account = { uid: string; displayName: string; role: string };

export function TeacherApprovals() {
  const { user, profile } = useAcademy();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const isAdmin = profile?.role === 'admin';

  const load = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError('');
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      setAccounts(snapshot.docs.map((entry) => ({
        uid: entry.id,
        displayName: String(entry.data().displayName || 'Kullanıcı'),
        role: String(entry.data().role || 'student'),
      })));
    } catch {
      setError('Hesap listesi yüklenemedi. Firestore kurallarının yayınlandığını kontrol edin.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { void load(); }, [load]);

  const changeRole = async (account: Account, role: 'student' | 'teacher') => {
    if (!isAdmin || account.uid === user?.uid || busy) return;
    if (!window.confirm(`${account.displayName} için rol ${role === 'teacher' ? 'ÖĞRETMEN' : 'ÖĞRENCİ'} olarak değiştirilsin mi?`)) return;
    setBusy(account.uid);
    setError('');
    try {
      await updateDoc(doc(db, 'users', account.uid), { role, updatedAt: serverTimestamp() });
      await load();
    } catch {
      setError('Rol değiştirilemedi. Yönetici yetkisini ve Firestore kurallarını kontrol edin.');
    } finally {
      setBusy(null);
    }
  };

  if (!isAdmin) return null;
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold">Öğretmen Onayları (Yönetici)</h2>
          <p className="text-xs text-slate-500">Yeni hesaplar öğrenci olarak açılır. Onaylanan hesaplar bir sonraki girişte öğretmen menülerini görür.</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading} className="rounded-lg border px-3 py-2 text-sm">Yenile</button>
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm">Hesaplar yükleniyor…</p>}
      <div className="space-y-2">
        {accounts.filter((account) => account.uid !== user?.uid && account.role !== 'admin').map((account) => (
          <div key={account.uid} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <div className="min-w-0">
              <p className="font-medium text-sm break-words">{account.displayName}</p>
              <p className="text-xs text-slate-500">{account.role === 'teacher' ? 'Öğretmen (onaylı)' : 'Öğrenci'}</p>
            </div>
            <button type="button" disabled={busy !== null} onClick={() => void changeRole(account, account.role === 'teacher' ? 'student' : 'teacher')}
              className="rounded-lg bg-navy-900 px-3 py-2 text-xs font-medium text-white disabled:opacity-50">
              {busy === account.uid ? 'Kaydediliyor…' : account.role === 'teacher' ? 'Öğrenciye çevir' : 'Öğretmen olarak onayla'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
