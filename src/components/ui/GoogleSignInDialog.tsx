import { useRef, useState } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { Modal } from './Modal';

const siteUrl = new URL('https://bilge-akademi.toughtamarind.chatgpt.site/');
const chromeIntent = `intent://${siteUrl.host}/#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(siteUrl.href)};end`;
const messages = {
  browser: 'Google hesabınızla giriş yapmak için Bilge Akademi’yi Chrome, Safari veya varsayılan tarayıcınızda açın.',
  connection: 'Google giriş hizmetine ulaşılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin. Siteyi bir uygulama içinden açtıysanız normal tarayıcınıza geçin.',
  popup: 'Tarayıcınız Google giriş penceresini engelledi. Bu site için açılır pencerelere izin verip tekrar deneyin.',
  storage: 'Bu tarayıcı Google oturumunu açamadı. Siteyi Chrome, Safari veya varsayılan tarayıcınızda açıp tekrar deneyin.',
};

export function GoogleSignInDialog() {
  const { googleSignInHelp, dismissGoogleSignInHelp, signInWithGoogle } = useAcademy();
  const addressRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  if (!googleSignInHelp) return null;

  const useChromeIntent = /Android/i.test(navigator.userAgent);
  const dismiss = () => {
    setCopied(false);
    dismissGoogleSignInHelp();
  };

  return (
    <Modal open onClose={dismiss} title="Google ile giriş" subtitle={messages[googleSignInHelp]} maxWidthClass="max-w-md">
      <div className="control-grid gap-2">
        {(googleSignInHelp === 'connection' || googleSignInHelp === 'popup') && (
          <button
            type="button"
            onClick={() => {
              setCopied(false);
              void signInWithGoogle();
            }}
            className="cursor-pointer rounded-lg bg-navy-900 px-3 py-2 text-sm font-medium text-white dark:bg-teal-700"
          >
            Tekrar dene
          </button>
        )}
        {googleSignInHelp !== 'popup' && (
          <a
            href={useChromeIntent ? chromeIntent : siteUrl.href}
            target={useChromeIntent ? undefined : '_blank'}
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium dark:border-slate-600"
          >
            {useChromeIntent ? 'Chrome’da aç' : 'Siteyi yeni sekmede aç'}
          </a>
        )}
        <button
          type="button"
          onClick={dismiss}
          className="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium dark:border-slate-600"
        >
          Demo Moduna dön
        </button>
      </div>
      {googleSignInHelp !== 'popup' && (
        <div className="mt-4">
          <label htmlFor="google-sign-in-address" className="text-sm font-medium">Tarayıcıda açmak için site adresi</label>
          <div className="mt-1 flex flex-wrap gap-2">
            <input
              ref={addressRef}
              id="google-sign-in-address"
              readOnly
              value={siteUrl.href}
              onFocus={(event) => event.currentTarget.select()}
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-2 text-sm dark:border-slate-600"
            />
            {navigator.clipboard && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(siteUrl.href);
                    setCopied(true);
                  } catch {
                    addressRef.current?.focus();
                  }
                }}
                className="cursor-pointer rounded-lg px-2 py-2 text-sm font-medium text-teal-700 dark:text-teal-300"
              >
                Kopyala
              </button>
            )}
          </div>
          {copied && <p role="status" className="mt-1 text-sm">Adres kopyalandı.</p>}
        </div>
      )}
    </Modal>
  );
}
