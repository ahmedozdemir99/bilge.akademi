import {
  ArrowRight,
  BarChart3,
  BookMarked,
  Bot,
  Calculator,
  Compass,
  Feather,
  FlaskConical,
  Languages,
  MoonStar,
  Users,
} from 'lucide-react';
import { useAcademy } from '../../context/AcademyContext';
import type { ModuleId } from '../../types/academy';
import { calculateAverageScore, calculateTrialRobotSummary } from '../../utils/exportUtils';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import heroAcademyImg from '../../assets/images/hero_bilge_akademi_1795080262577.jpg';

const HERO_IMAGE = heroAcademyImg;

interface ModuleCardConfig {
  id: ModuleId;
  order: string;
  title: string;
  subtitle: string;
  description: string;
  stageLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  isReady: boolean;
}

const CORE_MODULES: ModuleCardConfig[] = [
  {
    id: 'student-tracking',
    order: '01',
    title: 'Öğrenci Takip ve Deneme Net Robotu',
    subtitle: 'Ortaokul Sınıfları, Ders Ders D/Y/Net Robotu ve Yapay Zekâ Analizi',
    description:
      '5–8. sınıf öğrenci kayıtlarını, yazılı notlarını ve 6 derslik LGS/Ortaokul deneme doğru-yanlış-net hesaplama robotunu yönetin; ortalama grafikler ve Excel/PDF raporları alın.',
    stageLabel: 'Ortaokul & LGS · Deneme Robotu',
    icon: Users,
    isReady: true,
  },
  {
    id: 'literature',
    order: '02',
    title: 'Şiir, Edebiyat ve Vecize Atölyesi',
    subtitle: 'Şiir Editörü, Veciz Sözler, Seçme Şiirler ve Hiciv/Taşlama',
    description:
      'Özgün şiirler yazın, hece ve kafiye ölçümünü anında görün; veciz sözler, seçme klasik şiirler, taşlama/hiciv örnekleri ve söz sanatlarıyla Türkçeyi derinlemesine keşfedin.',
    stageLabel: 'Ortaokul Türkçe · Edebiyat Hazinesi',
    icon: Feather,
    isReady: true,
  },
  {
    id: 'history',
    order: '03',
    title: 'İnteraktif Tarih ve Seferler Atlası',
    subtitle: 'Animasyonlu Sefer Haritaları, Padişah Yetenekleri, Hikmet ve Hiciv',
    description:
      'Harita üzerinde animasyonlu sefer rotalarını izleyin, savaşların galip/mağlup ayrıntılarını, padişahların gizli sanat ve şiir yeteneklerini, hikmetli hikâyeleri ve tarihî nükteleri keşfedin.',
    stageLabel: 'Sosyal Bilgiler & İnkılap · Sefer Atlası',
    icon: Compass,
    isReady: true,
  },
  {
    id: 'mathematics',
    order: '04',
    title: 'Ortaokul Matematik Dünyası',
    subtitle: 'Görsel İspatlar, 1 Kelime 1 İşlem, Bilim Tarihi ve Zekâ Soruları',
    description:
      '5–8. sınıf ve LGS müfredatına uygun adım adım çözümler, çizimli geometrik ispatlar, matematik hikâyeleri, bilim insanları, zekâ problemleri ve tam oynanabilir 1 Kelime 1 İşlem oyunu.',
    stageLabel: 'Ortaokul & LGS · Görsel İspat & Oyun',
    icon: Calculator,
    isReady: true,
  },
  {
    id: 'science',
    order: '05',
    title: 'Fen Bilimleri Sanal Deney Laboratuvarı',
    subtitle: '5 Canlı Deney, Periyodik Tablo (Bohr), DNA & Kalıtım ve 5×10 LGS Testi',
    description:
      'Elektrik devresi, asit-baz pH titrasyonu, kaldıraç dengesi, fotosentez ve mevsimler deneylerini canlı sürgülerle yönetin; Bohr atom modeli, Punnett karesi ve güvenli ev deneylerini keşfedin.',
    stageLabel: 'Ortaokul Fen & LGS · Etkileşimli Laboratuvar',
    icon: FlaskConical,
    isReady: true,
  },
  {
    id: 'english',
    order: '06',
    title: 'İngilizce Dil ve Ses Atölyesi',
    subtitle: 'Sesli Dinleme Stüdyosu (.WAV), 36 Telaffuz Kartı ve Cümle Kurma Oyunu',
    description:
      '6 LGS dinleme parçasını US/UK aksanıyla veya indirilebilir Stüdyo AI .wav ses dosyalarıyla dinleyin; fonetik kelime kartları, sesli cümle kurma oyunu ve 50 LGS sorusuyla pratik yapın.',
    stageLabel: 'Ortaokul İngilizce & LGS · Sesli Stüdyo',
    icon: Languages,
    isReady: true,
  },
  {
    id: 'religion',
    order: '07',
    title: 'Din Kültürü ve Ahlak Bilgisi Akademisi',
    subtitle: 'Abdest–Namaz–Hac Animasyonları, Oruç–Zekât ve Hikmetli Hikâyeler',
    description:
      'Canlı abdest ve namaz hareketleri animasyonlarını, Kâbe tavaf ve oruç-zekât simülatörlerini inceleyin; 8 hikmetli kıssa, sure mealleri ve 5×10 LGS testiyle değerleri keşfedin.',
    stageLabel: 'Din Kültürü & LGS · İbadet Animasyonları',
    icon: MoonStar,
    isReady: true,
  },
  {
    id: 'philosophy',
    order: '08',
    title: 'Düşünce ve Felsefe Akademisi',
    subtitle: 'Düşünürler, Kavramlar, Karşılaştırma ve Sokratik Diyalog',
    description:
      'İlk Çağ’dan Türk-İslam düşünce geleneğine kadar bilgelik hikâyelerini ve filozofları tanıyın, karşılaştırın ve eleştirel düşünmeyi geliştiren Sokratik diyaloglara katılın.',
    stageLabel: 'Eleştirel Düşünme · Bilgelik Atölyesi',
    icon: BookMarked,
    isReady: true,
  },
];

export function HomeDashboard() {
  const {
    setActiveModule,
    classes,
    students,
    grades,
    practiceExams,
    poems,
    quizAttempts,
    mathAttempts,
    isDemoMode,
    workspaceView,
    setWorkspaceView,
    signInWithGoogle,
  } = useAcademy();

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
              Ders ders deneme net robotundan etkileşimli Fen Bilimleri deney laboratuvarına,
              sesli İngilizce dinleme stüdyosundan abdest–namaz–hac ibadet animasyonlarına,
              görsel matematik ispatlarından animasyonlu tarih seferlerine kadar dopdolu eğitim platformu.
            </p>
          </div>

          <div className="mt-7 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveModule('student-tracking')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>Öğrenci Takip Sistemini Aç</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setActiveModule('ai-assistant')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Yapay Zekâ Asistanı</span>
            </button>

            {/* Segmented Role Switcher */}
            <div
              className="ml-auto inline-flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800"
              role="group"
              aria-label="Çalışma görünümü seçici"
            >
              <button
                type="button"
                onClick={() => setWorkspaceView('teacher')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  workspaceView === 'teacher'
                    ? 'bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Öğretmen
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceView('student')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  workspaceView === 'student'
                    ? 'bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Öğrenci
              </button>
            </div>
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
                ? 'Tüm özellikleri örnek verilerle hemen deneyebilir veya Google hesabınızla kalıcı veritabanına geçebilirsiniz.'
                : 'Sınıf, öğrenci, sınav ve devam kayıtlarınız yalnızca size özel güvenlik kurallarıyla korunur.'}
            </p>
            {isDemoMode && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => void signInWithGoogle()}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-gold-400 text-navy-950 hover:bg-gold-500 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Google ile Kalıcı Hesaba Geç
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Full-Width Live KPI Strip */}
      <section aria-label="Platform Özet Göstergeleri">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-navy-900 dark:text-white">
            Akademik Özet Göstergeleri
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isDemoMode ? 'Gösterilen değerler örnek demo kayıtlarıdır' : 'Gerçek zamanlı Firestore kayıtları'}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      <section aria-label="Ana Eğitim Modülleri">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-navy-900 dark:text-white">
              Eğitim Modülleri
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Her modül bağımsız çalışır, ortak kullanıcı ve raporlama altyapısını paylaşır.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveModule('reports')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 dark:text-teal-400 hover:underline self-start sm:self-auto cursor-pointer whitespace-nowrap"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Tüm Raporlar ve İstatistikler</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {CORE_MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <article
                key={mod.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-teal-600/50 dark:hover:border-teal-500/50 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        mod.isReady
                          ? 'bg-navy-900 text-gold-400 dark:bg-teal-600/20 dark:text-teal-300'
                          : 'bg-slate-100 text-navy-800 dark:bg-slate-800 dark:text-gold-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500 tabular-nums">
                      Modül {mod.order}
                    </span>
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
                    onClick={() => setActiveModule(mod.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      mod.isReady
                        ? 'bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500'
                        : 'border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>Modülü Aç</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            );
          })}

          {/* Common AI Assistant Quick Card */}
          <article className="bg-navy-900 text-white border border-navy-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 text-gold-400 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-gold-400/90">Ortak Servis</span>
              </div>
              <p className="text-xs font-medium text-teal-300 mb-1.5">
                Aktif · Gemini API Destekli
              </p>
              <h3 className="text-lg font-semibold text-white leading-snug">
                Ortak Yapay Zekâ Asistanı
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Ders Anlatımı, Soru Taslağı ve Çalışma Planı
              </p>
              <p className="mt-3 text-sm text-slate-200/90 leading-relaxed">
                Bulunduğunuz modüle ve rolünüze göre Türkçe rehberlik alın. Özel öğrenci verileri
                açık onayınız olmadan başka modüllere aktarılmaz.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setActiveModule('ai-assistant')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gold-400 text-navy-950 hover:bg-gold-500 transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>Asistanı Aç</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
