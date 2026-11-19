import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BookOpen,
  Bot,
  Compass,
  Info,
  Loader2,
  MapPin,
  RotateCcw,
  Search,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useAcademy } from '../../context/AcademyContext';
import {
  CHRONOLOGY_CHALLENGE_IDS,
  HISTORICAL_EVENTS,
  HISTORY_QUIZ_ITEMS,
  TURKISH_PERIODS,
  WORLD_PERIODS,
  type HistoricalEvent,
} from '../../data/historyData';
import { HISTORY_TEST_PACKS } from '../../data/tests/historyTestsData';
import { MultiTestQuizEngine } from '../ui/MultiTestQuizEngine';
import {
  AnimatedCampaignsMap,
  HistoryWisdomPanel,
  SultansGalleryPanel,
} from './history/HistoryRichSections';

type HistoryTab =
  | 'campaigns'
  | 'sultans'
  | 'wisdom'
  | 'timeline'
  | 'map'
  | 'tutor'
  | 'quiz';

interface AIHistoryLesson {
  title: string;
  overview: string;
  causesAndContext: string[];
  keyDevelopments: string[];
  consequences: string[];
  historicalCaution: string;
  recommendedSources: string[];
}

const CATEGORY_LABELS: Record<HistoricalEvent['category'], string> = {
  devlet: 'Devlet / Siyaset',
  savas: 'Savaş / Sefer',
  antlasma: 'Antlaşma / Ferman',
  kultur: 'Kültür / Bilim',
};

const CATEGORY_FILL: Record<HistoricalEvent['category'], string> = {
  devlet: '#0B1F3A',
  savas: '#DC2626',
  antlasma: '#C89B3C',
  kultur: '#0D9488',
};

export function HistoryAtlasModule() {
  const { recordQuizAttempt, notify } = useAcademy();
  const [activeTab, setActiveTab] = useState<HistoryTab>('campaigns');

  // Timeline & Event inspection
  const [scopeFilter, setScopeFilter] = useState<'all' | 'turkish' | 'world'>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>(HISTORICAL_EVENTS[3].id);

  // Interactive Map state
  const [mapZoom, setMapZoom] = useState(1);
  const [mapCategory, setMapCategory] = useState<'all' | HistoricalEvent['category']>('all');

  // AI History Tutor state
  const [tutorMode, setTutorMode] = useState<'explain' | 'compare'>('explain');
  const [tutorLevel, setTutorLevel] = useState('Ortaokul');
  const [tutorTopic, setTutorTopic] = useState('Malazgirt Meydan Muharebesi ve Anadolu’nun Türkleşmesi');
  const [periodA, setPeriodA] = useState('Anadolu Selçuklu Devleti');
  const [periodB, setPeriodB] = useState('Osmanlı Devleti Kuruluş Dönemi');
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorError, setTutorError] = useState('');
  const [tutorLesson, setTutorLesson] = useState<AIHistoryLesson | null>(null);

  // Quiz state (5x10 MCQ + Chronology & Map Pin Challenge)
  const [quizSubMode, setQuizSubMode] = useState<'tests' | 'challenge'>('tests');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [chronoOrder, setChronoOrder] = useState<string[]>([
    'istanbul-fethi',
    'talas-savasi',
    'tanzimat-fermani',
    'malazgirt-1071',
  ]);
  const [mapGuessId, setMapGuessId] = useState<string>('');
  const [quizFinished, setQuizFinished] = useState(false);

  const periodOptions = useMemo(() => {
    if (scopeFilter === 'turkish') return TURKISH_PERIODS;
    if (scopeFilter === 'world') return WORLD_PERIODS;
    return [...TURKISH_PERIODS, ...WORLD_PERIODS];
  }, [scopeFilter]);

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase('tr');
    return HISTORICAL_EVENTS.filter((ev) => {
      if (scopeFilter !== 'all' && ev.scope !== scopeFilter) return false;
      if (periodFilter !== 'all' && ev.period !== periodFilter) return false;
      if (q) {
        const hit =
          ev.title.toLocaleLowerCase('tr').includes(q) ||
          ev.locationName.toLocaleLowerCase('tr').includes(q) ||
          ev.period.toLocaleLowerCase('tr').includes(q);
        if (!hit) return false;
      }
      return true;
    }).sort((a, b) => a.year - b.year);
  }, [periodFilter, scopeFilter, searchQuery]);

  const mapEvents = useMemo(() => {
    return filteredEvents.filter((ev) => mapCategory === 'all' || ev.category === mapCategory);
  }, [filteredEvents, mapCategory]);

  const selectedEvent =
    HISTORICAL_EVENTS.find((e) => e.id === selectedEventId) ??
    filteredEvents[0] ??
    HISTORICAL_EVENTS[0];

  const handleRunHistoryTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    setTutorLoading(true);
    setTutorError('');
    try {
      const response = await fetch('/api/ai/history-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: tutorMode,
          level: tutorLevel,
          topic: tutorTopic,
          periodA,
          periodB,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setTutorError(data.error || 'Tarih öğretmeni yanıtı alınamadı.');
        return;
      }
      setTutorLesson(data.lesson as AIHistoryLesson);
    } catch {
      setTutorError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
    } finally {
      setTutorLoading(false);
    }
  };

  const moveChrono = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= chronoOrder.length) return;
    const next = [...chronoOrder];
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    setChronoOrder(next);
  };

  const isChronoCorrect = useMemo(
    () => CHRONOLOGY_CHALLENGE_IDS.every((id, idx) => chronoOrder[idx] === id),
    [chronoOrder]
  );

  const isMapGuessCorrect = mapGuessId === 'orhun-yazitlari';

  const totalQuizPoints = useMemo(() => {
    const base = HISTORY_QUIZ_ITEMS.reduce(
      (sum, q) => sum + (quizAnswers[q.id] === q.correctIndex ? 1 : 0),
      0
    );
    return base + (isChronoCorrect ? 1 : 0) + (isMapGuessCorrect ? 1 : 0);
  }, [isChronoCorrect, isMapGuessCorrect, quizAnswers]);

  const maxQuizPoints = HISTORY_QUIZ_ITEMS.length + 2;

  const handleFinishHistoryQuiz = async () => {
    setQuizFinished(true);
    await recordQuizAttempt({
      moduleName: 'tarih',
      topic: 'Tarih Atlası Karma Sınavı (Kronoloji & Harita)',
      score: totalQuizPoints,
      totalQuestions: maxQuizPoints,
    });
    notify(
      'success',
      'Tarih sınavı kaydedildi',
      `${maxQuizPoints} soruda ${totalQuizPoints} doğru puanınız raporlara işlendi.`
    );
  };

  const handleResetHistoryQuiz = () => {
    setQuizAnswers({});
    setChronoOrder(['istanbul-fethi', 'talas-savasi', 'tanzimat-fermani', 'malazgirt-1071']);
    setMapGuessId('');
    setQuizFinished(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
            Modül 03 · Ortaokul Sosyal Bilgiler, İnkılap ve İnteraktif Sefer Atlası
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-navy-900 dark:text-white tracking-tight">
            İnteraktif Tarih Atlası
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Animasyonlu sefer haritaları, padişahların gizli yetenekleri ve şiirleri, hikmetli
            hikâyeler, tarihî hicivler, zaman çizelgesi ve bilgi yarışmasıyla tarihi keşfedin.
          </p>
        </div>

        <div
          className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          role="tablist"
        >
          {(
            [
              { id: 'campaigns', label: 'Animasyonlu Seferler' },
              { id: 'sultans', label: 'Padişahlar ve Yetenekleri' },
              { id: 'wisdom', label: 'Anekdot, Hikmet & Hiciv' },
              { id: 'timeline', label: 'Zaman Çizelgesi' },
              { id: 'map', label: 'Tarihî Harita' },
              { id: 'tutor', label: 'Tarih Öğretmeni' },
              { id: 'quiz', label: 'Testler (5×10)' },
            ] as { id: HistoryTab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activeTab === t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === t.id
                  ? 'bg-white dark:bg-slate-800 text-navy-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* NEW RICH HISTORY TABS */}
      {activeTab === 'campaigns' && <AnimatedCampaignsMap />}
      {activeTab === 'sultans' && <SultansGalleryPanel />}
      {activeTab === 'wisdom' && <HistoryWisdomPanel />}

      {/* Shared Period Filter Bar for Timeline & Map */}
      {(activeTab === 'timeline' || activeTab === 'map') && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
              {(
                [
                  { id: 'all', label: 'Tümü' },
                  { id: 'turkish', label: 'Türk Tarihi' },
                  { id: 'world', label: 'Dünya Tarihi' },
                ] as const
              ).map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => {
                    setScopeFilter(sc.id);
                    setPeriodFilter('all');
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer whitespace-nowrap ${
                    scopeFilter === sc.id
                      ? 'bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>

            <select
              aria-label="Tarihî dönem filtresi"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
            >
              <option value="all">Tüm Dönemler</option>
              {periodOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Olay, dönem veya konum ara..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      )}

      {/* TAB 1: INTERACTIVE TIMELINE & EVENT DOSSIER */}
      {activeTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Chronology List */}
          <aside className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 max-h-[680px] overflow-y-auto">
            <h2 className="text-sm font-semibold text-navy-900 dark:text-white px-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              Kronolojik Zaman Çizelgesi ({filteredEvents.length} olay)
            </h2>
            {filteredEvents.length === 0 ? (
              <p className="p-6 text-xs text-slate-500 text-center">
                Seçili filtreye uygun tarihî olay bulunamadı.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-1">
                {filteredEvents.map((ev) => {
                  const isSel = ev.id === selectedEvent.id;
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => setSelectedEventId(ev.id)}
                      className={`w-full text-left p-3.5 rounded-lg transition-colors cursor-pointer ${
                        isSel
                          ? 'bg-navy-900 text-white dark:bg-teal-600'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <p
                        className={`text-xs font-mono tabular-nums ${
                          isSel ? 'text-gold-400 dark:text-white/90' : 'text-teal-700 dark:text-teal-400'
                        }`}
                      >
                        {ev.displayDate} · {ev.period}
                      </p>
                      <p
                        className={`mt-1 text-sm font-semibold ${
                          isSel ? 'text-white' : 'text-navy-900 dark:text-white'
                        }`}
                      >
                        {ev.title}
                      </p>
                      <p
                        className={`mt-0.5 text-xs ${
                          isSel ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {ev.locationName} · {CATEGORY_LABELS[ev.category]}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          {/* Detailed Historical Event Inspection */}
          <article className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
            <div className="pb-5 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                {selectedEvent.scope === 'turkish' ? 'Türk Tarihi' : 'Dünya Tarihi'} ·{' '}
                {selectedEvent.period} · {CATEGORY_LABELS[selectedEvent.category]}
              </p>
              <h2 className="mt-1.5 text-2xl font-semibold text-navy-900 dark:text-white">
                {selectedEvent.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-mono tabular-nums">Tarih: {selectedEvent.displayDate}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
                  {selectedEvent.locationName} (yaklaşık tarihî konum)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-semibold text-navy-900 dark:text-gold-400 mb-2">
                  Nedenleri
                </h3>
                <ul className="list-disc pl-4 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                  {selectedEvent.causes.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-2">
                  Sonuçları
                </h3>
                <ul className="list-disc pl-4 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                  {selectedEvent.consequences.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Olayın Gelişimi
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {selectedEvent.development}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tarihsel Önemi
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {selectedEvent.significance}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  İlgili Tarihî Kişiler
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  {selectedEvent.keyFigures.join(', ')}
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Güvenilir Başvuru Kaynakları
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  {selectedEvent.sources.join(' · ')}
                </p>
              </div>
            </div>
          </article>
        </div>
      )}

      {/* TAB 2: INTERACTIVE ZOOMABLE HISTORICAL MAP */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <span>
              <strong>Tarihsel Coğrafya Notu:</strong> Bu harita modern siyasi ülke sınırlarını
              tarihî devlet sınırı gibi göstermez; yalnızca ana kara kütleleri üzerinde tarihî
              merkezlerin, savaşların ve antlaşmaların <strong>yaklaşık tarihî konumlarını</strong>{' '}
              temsil eder.
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex flex-wrap gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                  {(
                    [
                      { id: 'all', label: 'Tüm İşaretler' },
                      { id: 'devlet', label: 'Devlet' },
                      { id: 'savas', label: 'Savaş' },
                      { id: 'antlasma', label: 'Antlaşma' },
                      { id: 'kultur', label: 'Kültür' },
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setMapCategory(cat.id)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer whitespace-nowrap ${
                        mapCategory === cat.id
                          ? 'bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="inline-flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMapZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))))}
                    aria-label="Haritayı uzaklaştır"
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300 w-12 text-center">
                    %{Math.round(mapZoom * 100)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMapZoom((z) => Math.min(2.25, Number((z + 0.25).toFixed(2))))}
                    aria-label="Haritayı yakınlaştır"
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Zoomable Cartographic SVG Canvas */}
              <div className="overflow-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-[#0D213B]">
                <svg
                  viewBox="0 0 1000 500"
                  className="block transition-transform duration-200 origin-center"
                  style={{ width: `${mapZoom * 100}%`, minWidth: '100%', height: 'auto' }}
                  role="img"
                  aria-label="Tarihî olayların yaklaşık coğrafi konum haritası"
                >
                  {/* Cartographic Grid */}
                  <defs>
                    <pattern id="atlasGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                      <path
                        d="M 50 0 L 0 0 0 50"
                        fill="none"
                        stroke="#38BDF8"
                        strokeOpacity="0.10"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect width="1000" height="500" fill="url(#atlasGrid)" />

                  {/* Stylized Natural Landmasses (No Modern Political Borders) */}
                  {/* Americas (West simplified contour) */}
                  <path
                    d="M 55 110 L 185 115 L 220 190 L 180 265 L 225 340 L 195 450 L 145 435 L 125 320 L 85 240 Z"
                    fill="#1C395E"
                    stroke="#C89B3C"
                    strokeOpacity="0.35"
                    strokeWidth="1.2"
                  />
                  {/* Europe & Anatolia & Asia */}
                  <path
                    d="M 290 135 L 355 110 L 445 95 L 610 85 L 815 95 L 920 150 L 895 245 L 820 310 L 735 320 L 665 345 L 615 295 L 555 325 L 500 280 L 455 240 L 410 218 L 360 220 L 300 205 Z"
                    fill="#1C395E"
                    stroke="#C89B3C"
                    strokeOpacity="0.45"
                    strokeWidth="1.4"
                  />
                  {/* Africa */}
                  <path
                    d="M 310 245 L 435 248 L 495 280 L 535 345 L 485 455 L 415 455 L 370 365 L 305 315 Z"
                    fill="#183254"
                    stroke="#C89B3C"
                    strokeOpacity="0.35"
                    strokeWidth="1.2"
                  />

                  {/* Geographic Region Labels */}
                  <text x="485" y="203" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">
                    Anadolu
                  </text>
                  <text x="695" y="150" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">
                    Orta Asya Bozkırları
                  </text>
                  <text x="345" y="150" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">
                    Avrupa
                  </text>
                  <text x="548" y="308" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">
                    Mezopotamya
                  </text>
                  <text x="405" y="236" fill="#38BDF8" fontSize="10" opacity="0.6" fontFamily="sans-serif">
                    Akdeniz
                  </text>

                  {/* Historical Event Markers */}
                  {mapEvents.map((ev) => {
                    const isSelected = ev.id === selectedEvent.id;
                    const fill = CATEGORY_FILL[ev.category];
                    return (
                      <g
                        key={ev.id}
                        transform={`translate(${ev.mapX}, ${ev.mapY})`}
                        onClick={() => setSelectedEventId(ev.id)}
                        className="cursor-pointer"
                      >
                        {isSelected && (
                          <circle r="15" fill="#DDB75F" fillOpacity="0.28" stroke="#DDB75F" strokeWidth="1.5" />
                        )}
                        <circle
                          r={isSelected ? 8 : 6}
                          fill={fill}
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                        <text
                          x="11"
                          y="4"
                          fill="#F8FAFC"
                          fontSize="11"
                          fontWeight={isSelected ? '700' : '500'}
                          fontFamily="sans-serif"
                        >
                          {ev.displayDate}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Selected Location Detail Card */}
            <aside className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
              <p className="text-xs font-mono text-teal-700 dark:text-teal-400">
                {selectedEvent.displayDate} · {selectedEvent.period}
              </p>
              <h3 className="text-lg font-semibold text-navy-900 dark:text-white">
                {selectedEvent.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Yaklaşık Konum: {selectedEvent.locationName}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedEvent.development}
              </p>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  Başlıca Sonuçlar
                </p>
                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  {selectedEvent.consequences.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('timeline')}
                className="w-full px-4 py-2 text-xs font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 cursor-pointer"
              >
                Olayın Tam İncelemesini Aç
              </button>
            </aside>
          </div>
        </div>
      )}

      {/* TAB 3: AI HISTORY TEACHER */}
      {activeTab === 'tutor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleRunHistoryTutor}
            className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h2 className="text-base font-semibold text-navy-900 dark:text-white">
                Yapay Zekâ Tarih Öğretmeni
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTutorMode('explain')}
                className={`px-3 py-2 text-xs font-medium rounded-lg border cursor-pointer ${
                  tutorMode === 'explain'
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/50 text-navy-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                Olay / Konu Anlat
              </button>
              <button
                type="button"
                onClick={() => setTutorMode('compare')}
                className={`px-3 py-2 text-xs font-medium rounded-lg border cursor-pointer ${
                  tutorMode === 'compare'
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/50 text-navy-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                İki Dönemi Karşılaştır
              </button>
            </div>

            <div>
              <label htmlFor="hist-lvl" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Anlatım Seviyesi
              </label>
              <select
                id="hist-lvl"
                value={tutorLevel}
                onChange={(e) => setTutorLevel(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                <option value="Ortaokul">Ortaokul Düzeyi</option>
                <option value="Lise">Lise / YKS Düzeyi</option>
                <option value="Üniversite / Akademik">Üniversite / Akademik Düzey</option>
              </select>
            </div>

            {tutorMode === 'explain' ? (
              <div>
                <label htmlFor="hist-topic" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Tarihî Olay veya Konu
                </label>
                <textarea
                  id="hist-topic"
                  rows={3}
                  value={tutorTopic}
                  onChange={(e) => setTutorTopic(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label htmlFor="per-a" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    1. Dönem / Devlet
                  </label>
                  <input
                    id="per-a"
                    type="text"
                    value={periodA}
                    onChange={(e) => setPeriodA(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label htmlFor="per-b" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    2. Dönem / Devlet
                  </label>
                  <input
                    id="per-b"
                    type="text"
                    value={periodB}
                    onChange={(e) => setPeriodB(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={tutorLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 disabled:opacity-60 cursor-pointer"
            >
              {tutorLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
              <span>{tutorLoading ? 'Hazırlanıyor...' : 'Anlatım Oluştur'}</span>
            </button>
          </form>

          <section className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 min-h-[340px]">
            {tutorError && (
              <div className="flex items-start gap-2.5 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{tutorError}</span>
              </div>
            )}

            {!tutorLesson && !tutorLoading && !tutorError && (
              <div className="py-14 text-center">
                <BookOpen className="w-8 h-8 text-gold-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Neden-sonuç ilişkileri ve kaynak önerileriyle tarih anlatımı burada yer alacaktır.
                </p>
              </div>
            )}

            {tutorLesson && (
              <div className="space-y-5">
                <div>
                  <p className="text-xs text-teal-700 dark:text-teal-400">{tutorLevel}</p>
                  <h3 className="mt-1 text-xl font-semibold text-navy-900 dark:text-white">
                    {tutorLesson.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {tutorLesson.overview}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-semibold text-navy-900 dark:text-gold-400 mb-2">
                      Nedenler ve Tarihsel Bağlam
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {tutorLesson.causesAndContext.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-2">
                      Sonuçlar ve Etkileri
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {tutorLesson.consequences.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    Önemli Gelişmeler
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                    {tutorLesson.keyDevelopments.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
                  <p>
                    <strong>Tarihsel Yöntem Notu:</strong> {tutorLesson.historicalCaution}
                  </p>
                  <p>
                    <strong>Önerilen Kaynaklar:</strong> {tutorLesson.recommendedSources.join(' · ')}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 4: HISTORY 5x10 MCQ TESTS + CHRONOLOGY & MAP CHALLENGE */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          <div className="inline-flex p-1 rounded-lg bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setQuizSubMode('tests')}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                quizSubMode === 'tests'
                  ? 'bg-white dark:bg-slate-800 text-navy-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Çoktan Seçmeli Testler (5 Test · 50 Soru)
            </button>
            <button
              type="button"
              onClick={() => setQuizSubMode('challenge')}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                quizSubMode === 'challenge'
                  ? 'bg-white dark:bg-slate-800 text-navy-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Kronoloji ve Harita Meydan Okuması
            </button>
          </div>

          {quizSubMode === 'tests' ? (
            <MultiTestQuizEngine
              moduleLabel="Sosyal Bilgiler ve Tarih"
              tests={HISTORY_TEST_PACKS}
              onCompleteTest={async ({ testTitle, correctCount, totalQuestions }) => {
                await recordQuizAttempt({
                  moduleName: 'tarih',
                  topic: testTitle,
                  score: correctCount,
                  totalQuestions,
                });
                notify(
                  'success',
                  'Tarih testi kaydedildi',
                  `${totalQuestions} soruda ${correctCount} doğru sonucunuz raporlara işlendi.`
                );
              }}
            />
          ) : (
            <div className="max-w-4xl space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-semibold text-navy-900 dark:text-white">
                      Kronoloji ve Harita Meydan Okuması
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Olay-tarih eşleştirme, kronoloji sıralama ve harita konum bulma sorularını
                      tamamlayın.
                    </p>
                  </div>
              {quizFinished && (
                <div className="flex items-center gap-3">
                  <span className="font-mono font-semibold text-base text-teal-700 dark:text-teal-400 tabular-nums">
                    Sonuç: {totalQuizPoints}/{maxQuizPoints}
                  </span>
                  <button
                    type="button"
                    onClick={handleResetHistoryQuiz}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Yeniden Dene</span>
                  </button>
                </div>
              )}
            </div>

            {/* 1. MCQ & Match Items */}
            {HISTORY_QUIZ_ITEMS.map((q, idx) => (
              <div key={q.id} className="space-y-2.5 pb-5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {idx + 1}. {q.question}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => {
                    const selected = quizAnswers[q.id] === optIdx;
                    const isRight = quizFinished && optIdx === q.correctIndex;
                    const isWrong = quizFinished && selected && optIdx !== q.correctIndex;
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={quizFinished}
                        onClick={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                        className={`text-left px-3.5 py-2.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                          isRight
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                            : isWrong
                              ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200'
                              : selected
                                ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-navy-900 dark:text-white font-medium'
                                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {quizFinished && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{q.explanation}</p>
                )}
              </div>
            ))}

            {/* 2. Chronology Ordering Challenge */}
            <div className="space-y-3 pb-5 border-b border-slate-100 dark:border-slate-800">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                5. Kronoloji Sıralama: Aşağıdaki Türk tarihi olaylarını <strong>eskiden yeniye</strong>{' '}
                doğru sıralayın.
              </p>
              <div className="space-y-2">
                {chronoOrder.map((id, idx) => {
                  const ev = HISTORICAL_EVENTS.find((e) => e.id === id);
                  if (!ev) return null;
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60"
                    >
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        {idx + 1}. {ev.title}
                        {quizFinished && (
                          <span className="ml-2 font-mono text-teal-700 dark:text-teal-400">
                            ({ev.displayDate})
                          </span>
                        )}
                      </span>
                      {!quizFinished && (
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveChrono(idx, -1)}
                            disabled={idx === 0}
                            aria-label="Yukarı taşı"
                            className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveChrono(idx, 1)}
                            disabled={idx === chronoOrder.length - 1}
                            aria-label="Aşağı taşı"
                            className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {quizFinished && (
                <p
                  className={`text-xs font-medium ${
                    isChronoCorrect
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-red-700 dark:text-red-400'
                  }`}
                >
                  {isChronoCorrect
                    ? 'Doğru sıralama: Talas (751) → Malazgirt (1071) → İstanbul’un Fethi (1453) → Tanzimat (1839).'
                    : 'Doğru kronoloji: Talas Savaşı (751) → Malazgirt (1071) → İstanbul’un Fethi (1453) → Tanzimat Fermanı (1839).'}
                </p>
              )}
            </div>

            {/* 3. Map Location Finding */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                6. Haritada Yer Bulma: <strong>Orhun Yazıtları</strong> haritada hangi işaretli
                bölgede yer alır? (Seçmek için noktalardan birine tıklayın)
              </p>
              <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#0D213B]">
                <svg viewBox="0 0 1000 320" className="w-full h-auto block">
                  <path
                    d="M 290 95 L 445 65 L 610 55 L 815 65 L 920 120 L 895 215 L 735 280 L 615 255 L 500 240 L 410 185 L 300 175 Z"
                    fill="#1C395E"
                    stroke="#C89B3C"
                    strokeOpacity="0.4"
                  />
                  {[
                    { id: 'istanbul-fethi', label: 'A (Boğazlar)', x: 462, y: 175 },
                    { id: 'malazgirt-1071', label: 'B (Doğu Anadolu)', x: 530, y: 185 },
                    { id: 'talas-savasi', label: 'C (Batı Türkistan)', x: 670, y: 158 },
                    { id: 'orhun-yazitlari', label: 'D (Orhun Vadisi)', x: 790, y: 125 },
                  ].map((pt) => {
                    const selected = mapGuessId === pt.id;
                    return (
                      <g
                        key={pt.id}
                        transform={`translate(${pt.x}, ${pt.y})`}
                        onClick={() => !quizFinished && setMapGuessId(pt.id)}
                        className="cursor-pointer"
                      >
                        <circle
                          r={selected ? 11 : 8}
                          fill={selected ? '#DDB75F' : '#0D9488'}
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                        <text x="14" y="4" fill="#F8FAFC" fontSize="12" fontFamily="sans-serif">
                          {pt.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              {quizFinished && (
                <p
                  className={`text-xs font-medium ${
                    isMapGuessCorrect
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-red-700 dark:text-red-400'
                  }`}
                >
                  {isMapGuessCorrect
                    ? 'Doğru! Orhun Yazıtları Orta Asya’daki Orhun Vadisi’nde (D) yer alır.'
                    : 'Doğru yanıt D (Orhun Vadisi) noktasıdır.'}
                </p>
              )}
            </div>

            {!quizFinished && (
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => void handleFinishHistoryQuiz()}
                  className="px-5 py-2.5 text-xs font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 cursor-pointer"
                >
                  Sınavı Değerlendir ve Kaydet
                </button>
              </div>
            )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
