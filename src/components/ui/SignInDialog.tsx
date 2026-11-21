import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { useAcademy } from '../../context/AcademyContext';
import { auth } from '../../lib/firebase';

type SignInMode = 'login' | 'register' | 'reset';

const titles: Record<SignInMode, string> = {
  login: 'E-posta ile giriş',
  register: 'Hesap oluştur',
  reset: 'Parolayı sıfırla',
};

const messages: Record<string, string> = {
  'auth/email-already-in-use': 'Bu adresle bir hesap var. Giriş yapın veya parola sıfırlama bağlantısı isteyin.',
  'auth/invalid-credential': 'E-posta veya parola hatalı.',
  'auth/operation-not-allowed': 'E-posta ile giriş şu anda kullanılamıyor.',
  'auth/too-many-requests': 'Çok fazla deneme yapıldı. Bir süre sonra tekrar deneyin.',
  'auth/weak-password': 'Daha güçlü bir parola seçin.',
};

export function SignInDialog() {
  const { signInOpen, setSignInOpen, signInWithGoogle } = useAcademy();
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<SignInMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const element = dialog.current;
    if (signInOpen && !element?.open) element?.showModal();
    if (!signInOpen && element?.open) element.close();
  }, [signInOpen]);

  function changeMode(next: SignInMode) {
    setMode(next);
    setPassword('');
    setMessage('');
    setError('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage('');
    setError('');
    const address = email.trim();

    try {
      if (mode === 'reset') {
        await sendPasswordResetEmail(auth, address);
        setMessage('Bu adresle bir hesap varsa parola sıfırlama bağlantısı gönderildi.');
        return;
      }

      const credential =
        mode === 'register'
          ? await createUserWithEmailAndPassword(auth, address, password)
          : await signInWithEmailAndPassword(auth, address, password);
      if (!credential.user.emailVerified) {
        try {
          await sendEmailVerification(credential.user);
          setMessage('Doğrulama bağlantısı gönderildi. E-postanızı doğrulayıp tekrar giriş yapın.');
        } finally {
          await signOut(auth);
          setMode('login');
        }
      }
    } catch (failure) {
      const code = (failure as { code?: string }).code ?? '';
      if (mode === 'reset' && code === 'auth/user-not-found') {
        setMessage('Bu adresle bir hesap varsa parola sıfırlama bağlantısı gönderildi.');
      } else {
        setError(messages[code] ?? 'İşlem tamamlanamadı. Bir süre sonra tekrar deneyin.');
      }
    } finally {
      setPassword('');
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      onCancel={(event) => { if (busy) event.preventDefault(); }}
      onClose={() => { setSignInOpen(false); changeMode('login'); }}
      aria-labelledby="sign-in-title"
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl backdrop:bg-slate-950/60 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 id="sign-in-title" className="text-xl font-semibold">{titles[mode]}</h2>
        <button type="button" disabled={busy} onClick={() => dialog.current?.close()} className="text-sm underline">Kapat</button>
      </div>
      <form onSubmit={submit} className="grid gap-4">
        <label className="grid gap-1.5">
          E-posta
          <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)}
            className="rounded-lg border border-slate-400 bg-transparent px-3 py-2" />
        </label>
        {mode !== 'reset' && (
          <label className="grid gap-1.5">
            Bilge Akademi parolası
            <input type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              required minLength={mode === 'register' ? 8 : undefined} value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-lg border border-slate-400 bg-transparent px-3 py-2" />
          </label>
        )}
        {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
        {message && <p role="status" className="text-sm">{message}</p>}
        <button type="submit" disabled={busy}
          className="rounded-lg bg-indigo-700 px-4 py-2 font-semibold text-white disabled:opacity-60">
          {busy ? 'İşleniyor…' : titles[mode]}
        </button>
      </form>
      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-sm">
        {mode === 'login' ? (
          <>
            <button type="button" disabled={busy} onClick={() => changeMode('register')} className="underline">Hesap oluştur</button>
            <button type="button" disabled={busy} onClick={() => changeMode('reset')} className="underline">Parolamı unuttum</button>
            <button type="button" disabled={busy} onClick={() => { dialog.current?.close(); void signInWithGoogle(); }} className="underline">Google ile giriş</button>
          </>
        ) : (
          <button type="button" disabled={busy} onClick={() => changeMode('login')} className="underline">Girişe dön</button>
        )}
      </div>
    </dialog>
  );
}
