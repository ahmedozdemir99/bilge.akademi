import React, { useState } from 'react';
import {
  BarChart3,
  BookMarked,
  Bot,
  Calculator,
  Compass,
  Feather,
  FlaskConical,
  GraduationCap,
  Home,
  Languages,
  LogIn,
  LogOut,
  Menu,
  Moon,
  MoonStar,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sun,
  Users,
  X,
} from 'lucide-react';
import { useAcademy } from '../../context/AcademyContext';
import type { ModuleId } from '../../types/academy';

export interface NavItem {
  id: ModuleId;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Ana Sayfa', shortLabel: 'Ana Sayfa', icon: Home },
  { id: 'student-tracking', label: 'Öğrenci Takip Sistemi', shortLabel: 'Öğrenci Takip', icon: Users },
  { id: 'literature', label: 'Şiir ve Edebiyat Atölyesi', shortLabel: 'Edebiyat', icon: Feather },
  { id: 'history', label: 'İnteraktif Tarih Atlası', shortLabel: 'Tarih Atlası', icon: Compass },
  { id: 'mathematics', label: 'Matematik Öğretmeni', shortLabel: 'Matematik', icon: Calculator },
  { id: 'science', label: 'Fen Bilimleri Laboratuvarı', shortLabel: 'Fen Bilimleri', icon: FlaskConical },
  { id: 'english', label: 'İngilizce Dil Atölyesi', shortLabel: 'İngilizce', icon: Languages },
  { id: 'religion', label: 'Din Kültürü ve Ahlak Bilgisi', shortLabel: 'Din Kültürü', icon: MoonStar },
  { id: 'philosophy', label: 'Felsefe Akademisi', shortLabel: 'Felsefe', icon: BookMarked },
  { id: 'ai-assistant', label: 'Yapay Zekâ Asistanı', shortLabel: 'YZ Asistanı', icon: Bot },
  { id: 'reports', label: 'Raporlar ve İstatistikler', shortLabel: 'Raporlar', icon: BarChart3 },
  { id: 'settings', label: 'Ayarlar', shortLabel: 'Ayarlar', icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const {
    activeModule,
    setActiveModule,
    theme,
    toggleTheme,
    user,
    profile,
    isDemoMode,
    workspaceView,
    signInWithGoogle,
    signOutUser,
  } = useAcademy();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleNavItems = NAV_ITEMS.filter((item) => workspaceView === 'teacher' || item.id !== 'reports');
  const currentNav = visibleNavItems.find((item) => item.id === activeModule) ?? visibleNavItems[0];

  const handleSelect = (id: ModuleId) => {
    setActiveModule(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside
        aria-label="Ana Modül Menüsü"
        className={`hidden lg:flex flex-col shrink-0 bg-navy-900 text-slate-100 border-r border-navy-800 transition-all duration-200 no-print ${
          collapsed ? 'w-[76px]' : 'w-[272px]'
        }`}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/10">
          <button
            type="button"
            onClick={() => handleSelect('home')}
            className="flex items-center gap-3 min-w-0 text-left cursor-pointer focus-visible:outline-teal-400 rounded-md"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-600/20 border border-gold-400/40 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-gold-400" />
            </div>
            {!collapsed && (
              <span className="font-display text-lg font-semibold tracking-tight text-white whitespace-nowrap truncate">
                BİLGE AKADEMİ
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
            title={collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                title={collapsed ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-300 hover:bg-white/8 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gold-400/90'}`} />
                {!collapsed && <span className="truncate whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Account Summary */}
        <div className="p-3 border-t border-white/10">
          {!collapsed ? (
            <div className="px-2 py-2 space-y-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user ? profile?.displayName || user.displayName || 'Kullanıcı' : 'Demo Oturumu'}
                </p>
                <p className="text-xs text-slate-300 truncate">
                  {workspaceView === 'teacher' ? 'Öğretmen Görünümü' : 'Öğrenci Görünümü'} ·{' '}
                  {isDemoMode ? 'Örnek Veri' : 'Bulut Kayıt'}
                </p>
              </div>
              {user ? (
                <button
                  type="button"
                  onClick={() => void signOutUser()}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 bg-white/8 hover:bg-white/15 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Çıkış Yap</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void signInWithGoogle()}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-navy-950 bg-gold-400 hover:bg-gold-500 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Google ile Giriş Yap</span>
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => (user ? void signOutUser() : void signInWithGoogle())}
              title={user ? 'Çıkış Yap' : 'Google ile Giriş Yap'}
              aria-label={user ? 'Çıkış Yap' : 'Google ile Giriş Yap'}
              className="w-full flex items-center justify-center p-2.5 rounded-lg text-gold-400 hover:bg-white/10 transition-colors cursor-pointer"
            >
              {user ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex bg-slate-950/60"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            aria-label="Mobil Menü"
            className="w-72 max-w-[85vw] bg-navy-900 text-slate-100 h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-14 px-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-gold-400" />
                <span className="font-display text-base font-semibold text-white">BİLGE AKADEMİ</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Menüyü kapat"
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-teal-600 text-white'
                        : 'text-slate-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-gold-400" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-white/10">
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    void signOutUser();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-white/10 text-white cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Çıkış Yap</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    void signInWithGoogle();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gold-400 text-navy-950 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Google ile Giriş Yap</span>
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar (3 clean zones) */}
        <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 no-print">
          {/* Zone 1: Mobile Menu Trigger + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menüyü aç"
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <button
                type="button"
                onClick={() => setActiveModule('home')}
                className="hidden sm:inline text-slate-500 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Bilge Akademi
              </button>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-600" aria-hidden="true">
                /
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {currentNav.label}
              </span>
            </div>
          </div>

          {/* Zone 2: Unboxed Mode & Role Metadata */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0">
            <span>{workspaceView === 'teacher' ? 'Öğretmen Modu' : 'Öğrenci Modu'}</span>
            <span aria-hidden="true">·</span>
            <span>{isDemoMode ? 'Demo Modu (Örnek Veri)' : 'Firestore Bulut Eşitleme'}</span>
          </div>

          {/* Zone 3: Theme Toggle + Primary Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
              title={theme === 'dark' ? 'Açık tema' : 'Koyu tema'}
              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4 text-navy-900" />}
            </button>
            {user ? (
              <button
                type="button"
                onClick={() => setActiveModule('settings')}
                className="px-3.5 py-2 rounded-lg text-xs font-medium bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {profile?.displayName?.split(' ')[0] || 'Hesabım'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                className="px-3.5 py-2 rounded-lg text-xs font-medium bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Giriş Yap
              </button>
            )}
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 w-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
