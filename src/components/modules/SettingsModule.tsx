import React, { useEffect, useState } from 'react';
import {
  Database,
  Loader2,
  LogIn,
  LogOut,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sun,
} from 'lucide-react';
import { useAcademy } from '../../context/AcademyContext';
import { WorkspaceRoleControl } from '../ui/WorkspaceRoleControl';

export function SettingsModule() {
  const {
    user,
    profile,
    isDemoMode,
    signInWithGoogle,
    signOutUser,
    updateProfileInfo,
    theme,
    setTheme,
    workspaceView,
    compactMode,
    setCompactMode,
    seedDemoToFirestore,
    resetDemoData,
  } = useAcademy();

  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [schoolName, setSchoolName] = useState(profile?.schoolName ?? 'Bilge Akademi');
  const [branch, setBranch] = useState(profile?.branch ?? 'Genel Eğitim');
  const [savingProfile, setSavingProfile] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setSchoolName(profile.schoolName ?? 'Bilge Akademi');
      setBranch(profile.branch ?? 'Genel Eğitim');
    }
  }, [profile]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfileInfo(schoolName, branch, displayName);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
          Platform Tercihleri ve Güvenlik
        </p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-navy-900 dark:text-white tracking-tight">
          Ayarlar ve Hesap Yönetimi
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Oturumunuzu, görünüm temanızı ve veri ayarlarınızı yönetin.
        </p>
      </div>

      {/* Account & Auth */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-navy-900 dark:text-white">
              Kimlik Doğrulama ve Bulut Eşitleme
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {user
                ? `Oturum açık: ${user.email} · Firebase Firestore aktif`
                : 'Şu anda yerel tarayıcı destekli Demo Modundasınız. Kalıcı bulut kayıtları için Google ile giriş yapın.'}
            </p>
          </div>
          {user ? (
            <button
              type="button"
              onClick={() => void signOutUser()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap shrink-0"
            >
              <LogOut className="w-4 h-4" />
              <span>Oturumu Kapat</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void signInWithGoogle()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer whitespace-nowrap shrink-0"
            >
              <LogIn className="w-4 h-4" />
              <span>Google ile Giriş Yap</span>
            </button>
          )}
        </div>

        {user && (
          <form onSubmit={handleProfileSave} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="prof-name" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                Ad Soyad
              </label>
              <input
                id="prof-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={100}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label htmlFor="prof-school" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                Okul / Kurum
              </label>
              <input
                id="prof-school"
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                maxLength={120}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label htmlFor="prof-branch" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                Branş / Alan
              </label>
              <input
                id="prof-branch"
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                maxLength={80}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 disabled:opacity-60 cursor-pointer"
              >
                {savingProfile ? 'Kaydediliyor...' : 'Profil Bilgilerini Kaydet'}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Theme & Role View Preferences */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
        <h2 className="text-base font-semibold text-navy-900 dark:text-white">
          Görünüm ve Çalışma Modu
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Renk Teması
            </p>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setTheme('light')}
                aria-pressed={theme === 'light'}
                className="appearance-option cursor-pointer"
              >
                <Sun aria-hidden="true" className="size-4 shrink-0" />
                <span>Açık Tema</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                aria-pressed={theme === 'dark'}
                className="appearance-option cursor-pointer"
              >
                <Moon aria-hidden="true" className="size-4 shrink-0" />
                <span>Koyu Tema</span>
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              {isDemoMode ? 'Demo Görünümü' : 'Hesap Görünümü'}
            </p>
            <WorkspaceRoleControl />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Yoğun Tablo Görünümü
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Öğrenci ve sınav tablolarında daha fazla satırı tek ekranda gösterir.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={compactMode}
            onClick={() => setCompactMode(!compactMode)}
            className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
              compactMode ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                compactMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Data Tools & Privacy */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-base font-semibold text-navy-900 dark:text-white">
            Veri Yönetimi ve Gizlilik İlkeleri
          </h2>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Öğrenci verileri Firestore güvenlik kurallarıyla yalnızca ilgili öğretmenin kimliğine
          (<code className="font-mono text-xs">teacherId == auth.uid</code>) kilitlidir. Yapay zekâ
          analizine gönderilen verilerden ad-soyad, okul numarası ve kişisel rehberlik notları
          otomatik olarak çıkarılır.
        </p>

        <div className="control-grid gap-3 pt-2">
          {user && workspaceView === 'teacher' && (
            <button
              type="button"
              disabled={seeding}
              onClick={async () => {
                setSeeding(true);
                try {
                  await seedDemoToFirestore();
                } finally {
                  setSeeding(false);
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60 cursor-pointer"
            >
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4 text-teal-600" />}
              <span>{seeding ? 'Yükleniyor...' : 'Örnek Sınıfları Firestore Hesabıma Ekle'}</span>
            </button>
          )}
          {isDemoMode && (
            <button
              type="button"
              onClick={resetDemoData}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-gold-600" />
              <span>Demo Örnek Verilerini Sıfırla</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
