import { CloudDataNotice } from '../ui/CloudDataNotice';
import { useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  BookMarked,
  Bot,
  Calculator,
  Compass,
  Feather,
  FlaskConical,
  Languages,
  MoonStar,
  Search,
  Users,
  Zap,
} from 'lucide-react';
import { isModuleAvailable, useAcademy } from '../../context/AcademyContext';
import type { ModuleId } from '../../types/academy';
import { calculateAverageScore, calculateTrialRobotSummary } from '../../utils/exportUtils';
import { normalizeSearchText } from '../../utils/searchText';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { WorkspaceRoleControl } from '../ui/WorkspaceRoleControl';
import { isGeminiConfigured } from '../../utils/aiStatus';
import { DailyPractice } from './DailyPractice';
import { activityTitles, type ActivityId } from './workshop/activityTitles';
import heroAcademyImg from '../../assets/images/hero_bilge_akademi_1795080262577.jpg';

const HERO_IMAGE = heroAcademyImg;
const workshopActivityIds = Object.keys(activityTitles) as ActivityId[];

interface ModuleCardConfig {
  id: ModuleId;
  title: string;
  subtitle: string;
  description: string;
  stageLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CORE_MODULES: ModuleCardConfig[] = [
  {
    id: 'student-tracking',
    title: 'Deneme Analizi',
    subtitle: 'LGS ve Ortaokul Deneme Sonuçları, Netler ve Gelişim Analizi',
    description:
      'Deneme sonuçlarını ders bazında inceleyin, doğru-yanlış-net dağılımlarını ve öğrenci gelişimini analiz edin.',
    stageLabel: 'Ortaokul & LGS · Deneme Analizi',
    icon: Users,
  },
  {
    id: 'literature',
    title: 'Şiir, Edebiyat ve Vecize Atölyesi',
    subtitle: 'Şiir Editörü, Veciz Sözler, Seçme Şiirler ve Hiciv/Taşlama',
    description:
      'Özgün şiirler yazın, hece ve kafiye ölçümünü anında görün; veciz sözler, seçme klasik şiirler, taşlama/hiciv örnekleri ve söz sanatlarıyla Türkçeyi derinlemesine keşfedin.',
    stageLabel: 'Ortaokul Türkçe · Edebiyat Hazinesi',
    icon: Feather,
  },
  {
    id: 'history',
    title: 'İnteraktif Tarih ve Seferler Atlası',
    subtitle: 'Animasyonlu Sefer Haritaları, Padişah Yetenekleri, Hikmet ve Hiciv',
    description:
      'Harita üzerinde animasyonlu sefer rotalarını izleyin, savaşların galip/mağlup ayrıntılarını, padişahların gizli sanat ve şiir yeteneklerini, hikmetli hikâyeleri ve tarihî nükteleri keşfedin.',
    stageLabel: 'Sosyal Bilgiler & İnkılap · Sefer Atlası',
    icon: Compass,
  },
  {
    id: 'mathematics',
    title: 'Ortaokul Matematik Dünyası',
    subtitle: 'Görsel İspatlar, 1 Kelime 1 İşlem, Bilim Tarihi ve Zekâ Soruları',
    description:
      '5–8. sınıf ve LGS müfredatına uygun adım adım çözümler, Pisagor gibi çizimli geometrik ispatlar, matematik hikâyeleri, bilim insanları, zekâ problemleri ve tam oynanabilir 1 Kelime 1 İşlem oyunu.',
    stageLabel: 'Ortaokul & LGS · Görsel İspat & Oyun',
    icon: Calculator,
  },
  {
    id: 'science',
    title: 'Fen Bilimleri Sanal Deney Laboratuvarı',
    subtitle: '5 Canlı Deney, Periyodik Tablo (Bohr), DNA & Kalıtım ve 5×10 LGS Testi',
    description:
      'Elektrik devresi, asit-baz pH titrasyonu, kaldıraç dengesi, fotosentez ve mevsimler deneylerini canlı sürgülerle yönetin; Bohr atom modeli, Punnett karesi ve güvenli ev deneylerini keşfedin.',
    stageLabel: 'Ortaokul Fen & LGS · Etkileşimli Laboratuvar',
    icon: FlaskConical,
  },
  {
    id: 'english',
    title: 'İngilizce Dil ve Ses Atölyesi',
    subtitle: 'Sesli Dinleme Stüdyosu (.WAV), 36 Telaffuz Kartı ve Cümle Kurma Oyunu',
    description:
      '6 LGS dinleme parçasını US/UK aksanıyla veya indirilebilir Stüdyo AI .wav ses dosyalarıyla dinleyin; fonetik kelime kartları, sesli cümle kurma oyunu ve 50 LGS sorusuyla pratik yapın.',
    stageLabel: 'Ortaokul İngilizce & LGS · Sesli Stüdyo',
    icon: Languages,
  },
  {
    id: 'religion',
    title: 'Din Kültürü ve Ahlak Bilgisi Akademisi',
    subtitle: 'Abdest–Namaz–Hac Animasyonları, Oruç–Zekât ve Hikmetli Hikâyeler',
    description:
      'Canlı abdest ve namaz hareketleri animasyonlarını, Kâbe tavaf ve oruç-zekât simülatörlerini inceleyin; 8 hikmetli kıssa, sure mealleri ve 5×10 LGS testiyle değerleri keşfedin.',
    stageLabel: 'Din Kültürü & LGS · İbadet Animasyonları',
    icon: MoonStar,
  },
  {
    id: 'philosophy',
    title: 'Düşünce ve Felsefe Akademisi',
    subtitle: 'Düşünürler, Kavramlar, Karşılaştırma ve Sokratik Diyalog',
    description:
      'İlk Çağ’dan Türk-İslam düşünce geleneğine kadar bilgelik hikâyelerini ve filozofları tanıyın, karşılaştırın ve eleştirel düşünmeyi geliştiren Sokratik diyaloglara katılın.',
    stageLabel: 'Eleştirel Düşünme · Bilgelik Atölyesi',
    icon: BookMarked,
  },
];

export function HomeDashboard() {
  const {
    setActiveModule,
    openWorkshopActivity,
    classes,
    students,
    grades,
    practiceExams,
    poems,
    quizAttempts,
    mathAttempts,
    isDemoMode,
    workspaceView,
    teacherCloudStatus,
    retryTeacherData,
    profileIssue,
    retryProfile,
    setSignInOpen,
  } = useAcademy();

  const [geminiConfigured, setGeminiConfigured] = useState<boolean | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 8000);
    isGeminiConfigured(controller.signal)
      .then(setGeminiConfigured)
      .catch(() => {});
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, []);

  const [moduleSearch, setModuleSearch] = useState('');
  const moduleSearchRef = useRef<HTMLInputElement>(null);
  const searchTerms = normalizeSearchText(moduleSearch).split(/\s+/).filter(Boolean);
  const isSearching = searchTerms.length > 0;
  const matchesSearch = (value: string) => {
    const searchableText = normalizeSearchText(value);
    return searchTerms.every((term) => searchableText.includes(term));
  };
  const matchingModules = CORE_MODULES.filter(({ id, title, subtitle, description, stageLabel }) =>
    isModuleAvailable(id, workspaceView) && matchesSearch([title, subtitle, description, stageLabel].join(' ')));
  const showAssistant = matchesSearch('Ortak Yapay Zekâ Asistanı Gemini Ders Anlatımı Soru Taslağı Çalışma Planı');
  const matchingActivities = isSearching
    ? workshopActivityIds.filter((id) => matchesSearch(`Keşif Atölyesi ${activityTitles[id]}`))
    : [];
  const assistantSpan = [
    matchingModules.length % 2 === 0 ? 'md:col-span-2' : 'md:col-span-1',
    ['xl:col-span-3', 'xl:col-span-2', 'xl:col-span-1'][matchingModules.length % 3],
  ].join(' ');
  const moduleCount = matchingModules.length + Number(showAssistant);
  const hasResults = moduleCount > 0 || matchingActivities.length > 0;

  const overallAverage = calculateAverageScore(grades);
  const trialStats = calculateTrialRobotSummary(practiceExams);

  return (
    <div className="space-y-8">
      {/* Editorial Hero Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-teal-700 dark:text-teal-400 mb-3">
              BİLGE AKADEMİ · Ortaokul Müfredatı (5–8. Sınıf &amp; LGS) ·{' '}
              {isDemoMode ? 'Demo Modu' : 'Bulut Hesabı Aktif'} ·{' '}
              {workspaceView === 'teacher' ? 'Öğretmen Paneli' : 'Öğrenci Paneli'}
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold text-navy-900 dark:text-white tracking-tight leading-[1.15]">
              Ortaokul ve LGS İçin Zengin, Etkileşimli ve Yapay Zekâ Destekli Akademi
            </h1>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Deneme analizinden etkileşimli Fen Bilimleri deney laboratuvarına,
              sesli İngilizce dinleme stüdyosundan abdest–namaz–hac ibadet animasyonlarına,
              görsel matematik ispatlarından animasyonlu tarih seferlerine kadar dopdolu eğitim platformu.
            </p>
          </div>

          <div className="mt-7 grid gap-2.5 border-t border-slate-200 pt-6 dark:border-slate-800">
            <div className="control-grid gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (workspaceView === 'teacher') setActiveModule('student-tracking');
                  else moduleSearchRef.current?.focus();
                }}
                className="inline-flex min-h-11 items-center justify-center gap-2 px-4 py-2 text-center rounded-lg text-sm font-medium bg-navy-900 text-white hover:bg-navy-800 active:bg-navy-800 dark:bg-teal-300 dark:text-navy-950 dark:hover:bg-teal-200 dark:active:bg-teal-200 transition-colors cursor-pointer"
              >
                {workspaceView === 'teacher' ? 'Öğrenci Takip Sistemini Aç' : 'Ders ve Etkinlik Bul'}
              </button>

              <button
                type="button"
                onClick={() => setActiveModule('ai-assistant')}
                className="inline-flex min-h-11 items-center justify-center gap-2 px-4 py-2 text-center rounded-lg text-sm font-medium border border-slate-400 dark:border-slate-500 text-slate-800 dark:text-slate-100 hover:bg-slate-100 active:bg-teal-100 dark:hover:bg-slate-800 dark:active:bg-slate-700 transition-colors cursor-pointer"
              >
                <Bot className="w-4 h-4 text-teal-700 dark:text-teal-300" />
                <span>Yapay Zekâ Asistanı</span>
              </button>
            </div>

            <WorkspaceRoleControl />
          </div>
        </div>

        {/* Hero Visual Anchor */}
        <div className="lg:col-span-5 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 min-h-[240px]">
          <ImageWithFallback
            src={HERO_IMAGE}
            alt="Bilge Akademi kütüphane ve çalışma salonu"
            fallbackTitle="BİLGE AKADEMİ"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/35 to-transparent flex flex-col justify-end p-6">
            <p className="text-xs font-medium text-gold-400">
              {isDemoMode ? 'Demo Modu Aktif' : 'Firebase Bulut Veritabanı Bağlı'}
            </p>
            <p className="mt-1 text-sm text-white/95 leading-snug">
              {isDemoMode
                ? 'Tüm özellikleri örnek verilerle hemen deneyebilir veya hesabınızla kalıcı veritabanına geçebilirsiniz.'
                : 'Sınıf, öğrenci, sınav ve devam kayıtlarınız yalnızca size özel güvenlik kurallarıyla korunur.'}
            </p>
            {isDemoMode && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setSignInOpen(true)}
                  className="min-h-11 px-4 py-2 rounded-lg text-sm font-medium bg-gold-400 text-navy-950 hover:bg-gold-500 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Kalıcı Hesaba Geç
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Full-Width Live KPI Strip */}
      <section aria-label="Platform Özet Göstergeleri">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="text-lg font-semibold text-navy-900 dark:text-white">
            Akademik Özet Göstergeleri
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isDemoMode ? 'Gösterilen değerler örnek demo kayıtlarıdır' : 'Gerçek zamanlı Firestore kayıtları'}
          </p>
        </div>

        {profileIssue && <CloudDataNotice status={profileIssue} onRetry={retryProfile} label="Öğretmen profili" />}
        {workspaceView === 'teacher' && teacherCloudStatus !== 'ready' && (
          <CloudDataNotice status={teacherCloudStatus} onRetry={retryTeacherData} label="Sınıf ve öğrenci kayıtları" />
        )}
        <div className={workspaceView === 'teacher' ? "mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4" : "mt-3 grid gap-4"}>
          {workspaceView === 'teacher' && teacherCloudStatus === 'ready' && (
            <>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Toplam Öğrenci</p>
                <p className="mt-2 text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-navy-900 dark:text-white">
                  {students.length}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  {classes.length} aktif sınıf · {students.filter((s) => s.status === 'active').length} kayıtlı
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Genel Sınav Ortalaması</p>
                <p className="mt-2 text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-teal-700 dark:text-teal-400">
                  {grades.length > 0 ? overallAverage.toFixed(1) : '—'}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  {grades.length} kayıtlı sınav notu
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Deneme Ortalama Net</p>
                <p className="mt-2 text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-navy-900 dark:text-white">
                  {trialStats.examCount > 0 ? trialStats.avgTotalNet.toFixed(2) : '—'}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  {trialStats.examCount} deneme · Ort. {trialStats.avgTotalCorrect.toFixed(1)} doğru
                </p>
              </div>
            </>
          )}

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Atölye ve Alıştırmalar</p>
            <p className="mt-2 text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-gold-600 dark:text-gold-400">
              {poems.length + mathAttempts.length + quizAttempts.length}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {poems.length} şiir · {mathAttempts.length} matematik · {quizAttempts.length} yarışma
            </p>
          </div>
        </div>
      </section>

      {/* Five Academic Modules Grid */}
      <section id="egitim-modulleri" aria-labelledby="module-directory-title" className="scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
          <div>
            <h2 id="module-directory-title" className="text-xl font-semibold text-navy-900 dark:text-white">
              Eğitim Modülleri
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Ders, konu veya Keşif Atölyesi etkinliği arayın.
            </p>
          </div>
          {isModuleAvailable('reports', workspaceView) && (
            <button
              type="button"
              onClick={() => setActiveModule('reports')}
              className="inline-flex min-h-11 items-center gap-1.5 text-left text-sm font-medium text-teal-700 dark:text-teal-400 hover:underline self-start sm:self-auto cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Tüm Raporlar ve İstatistikler</span>
            </button>
          )}
        </div>

        <nav aria-label="Alıştırma kısayolları" className="control-grid mb-3 max-w-sm gap-2">
          <a href="#kesif-atolyesi" className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-3 text-sm font-medium text-navy-900 hover:bg-slate-100 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800">
            Keşif Atölyesi
          </a>
          <a href="#gunluk-alistirma" className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-3 text-sm font-medium text-navy-900 hover:bg-slate-100 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800">
            Günlük alıştırma
          </a>
        </nav>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="relative block w-full max-w-md">
            <span className="sr-only">Eğitim modüllerinde ara</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
            <input
              ref={moduleSearchRef}
              type="search"
              value={moduleSearch}
              onChange={(event) => setModuleSearch(event.target.value)}
              placeholder="Ör. Pisagor, deney, şiir"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-base scroll-mt-24 text-navy-900 focus-visible:outline-2 focus-visible:outline-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
          <p role="status" className="text-sm text-slate-600 dark:text-slate-400">
            {isSearching && `${moduleCount} modül · ${matchingActivities.length} etkinlik`}
          </p>
        </div>

        {!hasResults && (
          <div className="mb-5 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <p>Aramanıza uygun modül veya etkinlik bulunamadı.</p>
            <button type="button" onClick={() => {
              setModuleSearch('');
              moduleSearchRef.current?.focus();
            }} className="mt-2 min-h-11 font-medium text-teal-700 underline underline-offset-4 dark:text-teal-400">
              Aramayı temizle
            </button>
          </div>
        )}

        {matchingActivities.length > 0 && (
          <section aria-labelledby="activity-results-title" className="mb-5 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h3 id="activity-results-title" className="font-semibold text-navy-900 dark:text-white">Keşif Atölyesi etkinlikleri</h3>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {matchingActivities.map((id) => (
                <li key={id}>
                  <button type="button" onClick={() => openWorkshopActivity(id)}
                    className="min-h-11 w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm font-medium text-teal-800 hover:bg-teal-50 dark:border-slate-700 dark:text-teal-200 dark:hover:bg-slate-800">
                    {activityTitles[id]}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {moduleCount > 0 && <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {matchingModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <article
                key={mod.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-teal-600/50 dark:hover:border-teal-500/50 transition-colors"
              >
                <div>
                  <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-navy-900 text-gold-400 dark:bg-teal-600/20 dark:text-teal-300">
                    <Icon className="size-5" />
                  </div>

                  <p className="text-xs font-medium text-teal-700 dark:text-teal-400 mb-1.5">
                    {mod.stageLabel}
                  </p>
                  <h3 className="text-lg font-semibold text-navy-900 dark:text-white leading-snug">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{mod.subtitle}</p>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      if (mod.id === 'student-tracking') {
                        const url = new URL(window.location.href);
                        url.searchParams.set('denemeAnalizi', '1');
                        window.location.assign(url.toString());
                      } else {
                        setActiveModule(mod.id);
                      }
                    }}
                    aria-label={`${mod.title} modülünü aç`}
                    className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500"
                  >
                    Modülü Aç
                  </button>
                </div>
              </article>
            );
          })}

          {showAssistant && (
            <article className={`@container rounded-xl border border-navy-800 bg-navy-900 text-white ${assistantSpan}`}>
              <div className="flex h-full flex-col justify-between gap-5 p-6 @xl:flex-row @xl:items-center @xl:p-8">
                <div className="flex flex-col gap-4 @xl:flex-row @xl:items-start">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/10 text-gold-400 @xl:size-12">
                    <Bot aria-hidden="true" className="size-5 @xl:size-6" />
                  </div>
                  <div className="max-w-2xl">
                    <p className="mb-1.5 text-xs font-medium text-teal-300">
                      {geminiConfigured === true ? 'Gemini anahtarı tanımlı'
                        : geminiConfigured === false ? 'Gemini anahtarı bekleniyor' : 'Gemini API desteği'}
                    </p>
                    <h3 className="text-lg font-semibold leading-snug text-white @xl:text-2xl">
                      Ortak Yapay Zekâ Asistanı
                    </h3>
                    <p className="mt-1 text-sm text-slate-300">
                      Ders Anlatımı, Soru Taslağı ve Çalışma Planı
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-200">
                      Bulunduğunuz modüle ve rolünüze göre Türkçe rehberlik alın. Özel öğrenci verileri
                      açık onayınız olmadan başka modüllere aktarılmaz.
                    </p>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4 @xl:shrink-0 @xl:border-0 @xl:pt-0">
                  <button
                    type="button"
                    onClick={() => setActiveModule('ai-assistant')}
                    className="min-h-11 w-full cursor-pointer rounded-lg bg-gold-400 px-4 py-2 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-500 @xl:w-auto"
                  >
                    Asistanı aç
                  </button>
                </div>
              </div>
            </article>
          )}
        </div>}
      </section>

      <section id="kesif-atolyesi" tabIndex={-1} aria-labelledby="workshop-title" className="flex scroll-mt-24 flex-col gap-5 rounded-xl bg-navy-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-4">
          <span className="hidden size-12 shrink-0 place-items-center rounded-xl bg-teal-500/20 text-teal-200 sm:grid">
            <Zap aria-hidden="true" className="size-6" />
          </span>
          <div>
            <h2 id="workshop-title" className="text-2xl font-semibold">Keşif Atölyesi</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
              Yedi ders alanında 21 etkinlik. Modellerle deney yap, bir zaman çizelgesi kur, İngilizce duyuruları dinle ve seçimini gerekçelendir.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setActiveModule('activity-workshop')}
          className="min-h-11 w-full self-start rounded-lg bg-gold-400 px-4 py-2 sm:w-auto sm:shrink-0 text-sm font-semibold text-navy-950 hover:bg-gold-500 sm:self-center"
        >
          Atölyeyi aç
        </button>
      </section>

      <DailyPractice openModule={setActiveModule} />
    </div>
  );
}
