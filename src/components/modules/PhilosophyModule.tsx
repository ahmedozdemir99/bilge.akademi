import { secureAiFetch } from '../../lib/secureAiFetch';
import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookMarked,
  BookOpen,
  Brain,
  GitCompare,
  HelpCircle,
  Loader2,
  MessageSquare,
  Printer,
  RotateCcw,
  Search,
  Send,
  Sparkles,
} from 'lucide-react';
import { useAcademy } from '../../context/AcademyContext';
import {
  DIALOGUE_PERSONAS,
  OPEN_ENDED_THOUGHT_PROMPTS,
  PHILOSOPHERS,
  PHILOSOPHICAL_SCHOOLS,
  PHILOSOPHY_ERAS,
  SOCRATIC_TOPICS,
  type PhilosophyEra,
} from '../../data/philosophyData';
import { PHILOSOPHY_TEST_PACKS } from '../../data/tests/philosophyTestsData';
import { triggerPrintReport } from '../../utils/exportUtils';
import { MultiTestQuizEngine } from '../ui/MultiTestQuizEngine';
import { PhilosophyThoughtExperimentsPanel } from './philosophy/PhilosophyThoughtExperimentsPanel';

type PhilosophyTab = 'library' | 'experiments' | 'compare' | 'socratic' | 'quiz';

interface AIComparisonResult {
  epistemology: string;
  ontology: string;
  ethics: string;
  politicsAndSociety: string;
  commonalities: string[];
  differences: string[];
}

interface SocraticMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  personaLabel: string;
}

export function PhilosophyModule() {
  const { recordQuizAttempt, notify } = useAcademy();
  const [activeTab, setActiveTab] = useState<PhilosophyTab>('library');

  // Tab 1: Library & Philosophers
  const [selectedEra, setSelectedEra] = useState<'ALL' | PhilosophyEra>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhilosopherId, setSelectedPhilosopherId] = useState<string>(PHILOSOPHERS[0].id);

  // Tab 2: Compare
  const [compareAId, setCompareAId] = useState<string>('farabi');
  const [compareBId, setCompareBId] = useState<string>('kant');
  const [aiComparison, setAiComparison] = useState<AIComparisonResult | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // Tab 3: Socratic Dialogue
  const [dialogueTopic, setDialogueTopic] = useState<string>(SOCRATIC_TOPICS[0]);
  const [customTopic, setCustomTopic] = useState<string>('');
  const [personaId, setPersonaId] = useState<string>(DIALOGUE_PERSONAS[0].id);
  const [dialogueInput, setDialogueInput] = useState('');
  const [dialogueLoading, setDialogueLoading] = useState(false);
  const [messages, setMessages] = useState<SocraticMessage[]>([
    {
      id: 'welcome-socratic',
      role: 'assistant',
      personaLabel: 'Sokratik Rehber',
      text: 'Hoş geldiniz. Seçtiğiniz felsefi soru üzerine ilk görüşünüzü veya savınızı yazın. Birlikte varsayımları inceleyelim, karşıt açıları görelim ve düşüncenizi derinleştirelim.',
    },
  ]);

  // Tab 4: Open-Ended Critical Thinking
  const [openPromptId, setOpenPromptId] = useState(OPEN_ENDED_THOUGHT_PROMPTS[0].id);
  const [openEssay, setOpenEssay] = useState('');
  const [openFeedback, setOpenFeedback] = useState('');
  const [openLoading, setOpenLoading] = useState(false);

  const filteredPhilosophers = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase('tr-TR');
    return PHILOSOPHERS.filter((p) => {
      const matchesEra = selectedEra === 'ALL' || p.era === selectedEra;
      if (!matchesEra) return false;
      if (!q) return true;
      return (
        p.name.toLocaleLowerCase('tr-TR').includes(q) ||
        p.tradition.toLocaleLowerCase('tr-TR').includes(q) ||
        p.bio.toLocaleLowerCase('tr-TR').includes(q) ||
        p.keyWorks.some((w) => w.toLocaleLowerCase('tr-TR').includes(q))
      );
    });
  }, [searchQuery, selectedEra]);

  const selectedPhilosopher =
    PHILOSOPHERS.find((p) => p.id === selectedPhilosopherId) ??
    filteredPhilosophers[0] ??
    PHILOSOPHERS[0];

  const philosopherA = PHILOSOPHERS.find((p) => p.id === compareAId) ?? PHILOSOPHERS[0];
  const philosopherB = PHILOSOPHERS.find((p) => p.id === compareBId) ?? PHILOSOPHERS[1];
  const selectedPersona =
    DIALOGUE_PERSONAS.find((p) => p.id === personaId) ?? DIALOGUE_PERSONAS[0];
  const activeOpenPrompt =
    OPEN_ENDED_THOUGHT_PROMPTS.find((p) => p.id === openPromptId) ??
    OPEN_ENDED_THOUGHT_PROMPTS[0];

  const handleRunAIComparison = async () => {
    if (philosopherA.id === philosopherB.id) {
      notify('info', 'Karşılaştırma için lütfen iki farklı filozof seçin.');
      return;
    }
    setCompareLoading(true);
    setAiComparison(null);
    try {
      const res = await secureAiFetch('/api/ai/philosopher-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          philosopherA: philosopherA.name,
          philosopherB: philosopherB.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Karşılaştırma oluşturulamadı.');
      }
      setAiComparison(data.comparison);
      notify('success', 'Yapay zekâ filozof karşılaştırması hazırlandı.');
    } catch (error) {
      notify(
        'error',
        error instanceof Error ? error.message : 'Karşılaştırma sırasında hata oluştu.'
      );
    } finally {
      setCompareLoading(false);
    }
  };

  const handleSendSocraticMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = dialogueInput.trim();
    if (!trimmed || dialogueLoading) return;

    const effectiveTopic = customTopic.trim() || dialogueTopic;
    const userMsg: SocraticMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      personaLabel: 'Siz',
      text: trimmed,
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setDialogueInput('');
    setDialogueLoading(true);

    try {
      const res = await secureAiFetch('/api/ai/socratic-dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: effectiveTopic,
          philosopherPersona: selectedPersona.id,
          message: trimmed,
          history: nextHistory.map((m) => ({ role: m.role, text: m.text })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Sokratik yanıt üretilemedi.');
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          personaLabel: selectedPersona.label,
          text: data.reply,
        },
      ]);
    } catch (error) {
      notify(
        'error',
        error instanceof Error ? error.message : 'Diyalog sırasında bir hata oluştu.'
      );
    } finally {
      setDialogueLoading(false);
    }
  };

  const handleResetDialogue = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'assistant',
        personaLabel: selectedPersona.label,
        text: selectedPersona.isSimulation
          ? `[Eğitim Amaçlı Tarihî Simülasyon — ${selectedPersona.id}] Seçili konu hakkındaki temel düşüncenizi paylaşın; varsayımları birlikte sorgulayalım.`
          : 'Yeni bir Sokratik sorgulamaya hazırız. Konu hakkındaki düşüncenizi ve gerekçenizi yazın.',
      },
    ]);
  };

  const handleEvaluateOpenEssay = async () => {
    if (openEssay.trim().length < 20) {
      notify('info', 'Değerlendirme için en az birkaç cümlelik bir düşünce yazın.');
      return;
    }
    setOpenLoading(true);
    setOpenFeedback('');
    try {
      const res = await secureAiFetch('/api/ai/socratic-dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `${activeOpenPrompt.title}: ${activeOpenPrompt.question}`,
          philosopherPersona: 'Sokratik Rehber',
          message: `Öğrencinin açık uçlu felsefe değerlendirme metni:\n${openEssay.trim()}`,
          history: [],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Eleştirel değerlendirme alınamadı.');
      }
      setOpenFeedback(data.reply);
      notify('success', 'Sokratik geri bildirim oluşturuldu.');
    } catch (error) {
      notify(
        'error',
        error instanceof Error ? error.message : 'Değerlendirme sırasında hata oluştu.'
      );
    } finally {
      setOpenLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
            Modül 05 · Felsefe ve Düşünce Akademisi
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-navy-900 dark:text-white tracking-tight">
            Felsefe ve Düşünce Akademisi
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
            İlk Çağ’dan Türk düşünce tarihine kadar filozofları inceleyin, felsefi akımları
            karşılaştırın ve eleştirel Sokratik diyaloglarla argüman geliştirin.
          </p>
        </div>

        <button
          type="button"
          onClick={triggerPrintReport}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap self-start md:self-auto no-print"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Sayfayı Yazdır / PDF</span>
        </button>
      </header>

      {/* Navigation Tabs */}
      <nav
        aria-label="Felsefe Akademisi Sekmeleri"
        className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 no-print"
      >
        {[
          { id: 'library' as const, label: 'Kütüphane ve Filozoflar', icon: BookOpen },
          { id: 'experiments' as const, label: 'Düşünce Deneyleri', icon: Brain },
          { id: 'compare' as const, label: 'Filozof Karşılaştırma', icon: GitCompare },
          { id: 'socratic' as const, label: 'Sokratik Diyalog', icon: MessageSquare },
          { id: 'quiz' as const, label: 'Testler (5×10) ve Düşünme', icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-navy-900 text-white dark:bg-teal-600'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* NEW TAB: INTERACTIVE THOUGHT EXPERIMENTS */}
      {activeTab === 'experiments' && <PhilosophyThoughtExperimentsPanel />}

      {/* TAB 1: PHILOSOPHY LIBRARY, PHILOSOPHER PROFILES & 9 SCHOOLS */}
      {activeTab === 'library' && (
        <div className="space-y-8">
          {/* 7 Eras Overview */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-semibold text-navy-900 dark:text-white">
                  Felsefe Tarihinin 7 Dönemi
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dönem seçerek filozofları filtreleyebilirsiniz.
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filozof, eser veya akım ara..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedEra('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  selectedEra === 'ALL'
                    ? 'bg-navy-900 text-white dark:bg-teal-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Tüm Dönemler ({PHILOSOPHERS.length})
              </button>
              {PHILOSOPHY_ERAS.map((era) => (
                <button
                  key={era.id}
                  type="button"
                  onClick={() => setSelectedEra(era.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    selectedEra === era.id
                      ? 'bg-navy-900 text-white dark:bg-teal-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {era.id}
                </button>
              ))}
            </div>

            {selectedEra !== 'ALL' && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                {(() => {
                  const info = PHILOSOPHY_ERAS.find((e) => e.id === selectedEra);
                  if (!info) return null;
                  return (
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-mono text-teal-700 dark:text-teal-400">
                          {info.id} · {info.span}
                        </p>
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {info.summary}
                        </p>
                      </div>
                      <div className="shrink-0 md:max-w-xs">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Temel Sorunlar
                        </p>
                        <p className="text-xs text-slate-700 dark:text-slate-300">
                          {info.coreProblems.join(' · ')}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </section>

          {/* Philosopher Master-Detail */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-navy-900 dark:text-white">
                  Filozof Profilleri
                </h2>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {filteredPhilosophers.length} kayıt
                </span>
              </div>
              {filteredPhilosophers.length === 0 ? (
                <p className="p-5 text-sm text-slate-500 dark:text-slate-400">
                  Arama ölçütünüze uygun filozof bulunamadı.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[540px] overflow-y-auto">
                  {filteredPhilosophers.map((p) => {
                    const isSelected = p.id === selectedPhilosopher.id;
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedPhilosopherId(p.id)}
                          className={`w-full text-left px-4 py-3.5 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-teal-50/80 dark:bg-teal-950/40'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`text-sm font-semibold ${
                                isSelected
                                  ? 'text-teal-800 dark:text-teal-300'
                                  : 'text-navy-900 dark:text-white'
                              }`}
                            >
                              {p.name}
                            </p>
                            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0 tabular-nums">
                              {p.lifespan}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {p.era} · {p.tradition}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Philosopher Dossier */}
            <article className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                  <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                    {selectedPhilosopher.era} · {selectedPhilosopher.tradition}
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-navy-900 dark:text-white">
                    {selectedPhilosopher.name}
                  </h2>
                  <p className="mt-0.5 text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                    Yaşam Dönemi: {selectedPhilosopher.lifespan}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCompareAId(selectedPhilosopher.id);
                    setActiveTab('compare');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap shrink-0 no-print"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Başka Filozofla Karşılaştır</span>
                </button>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedPhilosopher.bio}
              </p>

              <blockquote className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-medium text-gold-600 dark:text-gold-400 mb-1">
                  Öne Çıkan Düşünce
                </p>
                <p className="text-base font-serif italic text-navy-900 dark:text-white">
                  {selectedPhilosopher.notableThought}
                </p>
              </blockquote>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <h3 className="text-sm font-semibold text-navy-900 dark:text-white mb-2">
                    Temel Görüşleri
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    {selectedPhilosopher.coreViews.map((v, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-teal-600 dark:text-teal-400 font-mono text-xs mt-1">
                          0{i + 1}
                        </span>
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-navy-900 dark:text-white mb-2">
                    Önemli Eserleri ve Katkıları
                  </h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Başlıca Eserler
                  </p>
                  <p className="text-sm text-slate-800 dark:text-slate-200 mb-3">
                    {selectedPhilosopher.keyWorks.join(' · ')}
                  </p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Felsefe Tarihine Katkıları
                  </p>
                  <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300 list-disc pl-4">
                    {selectedPhilosopher.contributions.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 4 Philosophical Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                {[
                  { label: 'Bilgi Anlayışı (Epistemoloji)', value: selectedPhilosopher.epistemology },
                  { label: 'Varlık Anlayışı (Ontoloji)', value: selectedPhilosopher.ontology },
                  { label: 'Ahlak Anlayışı (Etik)', value: selectedPhilosopher.ethics },
                  { label: 'Toplum ve Siyaset Görüşü', value: selectedPhilosopher.politicsAndSociety },
                ].map((dim) => (
                  <div
                    key={dim.label}
                    className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800"
                  >
                    <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                      {dim.label}
                    </p>
                    <p className="mt-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {dim.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-navy-900 dark:text-white">
                  Diğer Filozoflarla İlişkisi:{' '}
                </span>
                {selectedPhilosopher.relations}
              </div>
            </article>
          </section>

          {/* 9 Philosophical Schools Encyclopedia */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-navy-900 dark:text-white">
                Temel Felsefi Akımlar ({PHILOSOPHICAL_SCHOOLS.length})
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                İdealizm, Materyalizm, Rasyonalizm, Empirizm, Varoluşçuluk, Pragmatizm, Pozitivizm,
                Stoacılık ve Şüphecilik rehberi.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {PHILOSOPHICAL_SCHOOLS.map((school) => (
                <article
                  key={school.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                      {school.category}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-navy-900 dark:text-white">
                      {school.name}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {school.summary}
                    </p>
                    <p className="mt-3 text-xs text-navy-900 dark:text-slate-200 font-medium">
                      Temel Sav: <span className="font-normal">{school.coreThesis}</span>
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <p>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Temsilciler:
                      </span>{' '}
                      {school.representatives.join(', ')}
                    </p>
                    <p>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Anahtar Kavramlar:
                      </span>{' '}
                      {school.keyConcepts.join(' · ')}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: PHILOSOPHER COMPARISON */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  1. Filozof
                </label>
                <select
                  value={compareAId}
                  onChange={(e) => {
                    setCompareAId(e.target.value);
                    setAiComparison(null);
                  }}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  {PHILOSOPHERS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.era})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  2. Filozof
                </label>
                <select
                  value={compareBId}
                  onChange={(e) => {
                    setCompareBId(e.target.value);
                    setAiComparison(null);
                  }}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  {PHILOSOPHERS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.era})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4">
                <button
                  type="button"
                  onClick={() => void handleRunAIComparison()}
                  disabled={compareLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 disabled:opacity-60 cursor-pointer whitespace-nowrap"
                >
                  {compareLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>Yapay Zekâ Derin Karşılaştırma</span>
                </button>
              </div>
            </div>
          </section>

          {/* Instant Structured Matrix */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-semibold text-navy-900 dark:text-white">
                {philosopherA.name} ve {philosopherB.name} Karşılaştırma Tablosu
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Bilgi, varlık, ahlak ve toplum eksenlerinde yan yana özet görünüm
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-950/40">
                    <th className="py-3 px-4 font-medium w-44">Karşılaştırma Ekseni</th>
                    <th className="py-3 px-4 font-semibold text-navy-900 dark:text-white">
                      {philosopherA.name} · {philosopherA.lifespan}
                    </th>
                    <th className="py-3 px-4 font-semibold text-navy-900 dark:text-white">
                      {philosopherB.name} · {philosopherB.lifespan}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {[
                    {
                      label: 'Dönem ve Gelenek',
                      a: `${philosopherA.era} · ${philosopherA.tradition}`,
                      b: `${philosopherB.era} · ${philosopherB.tradition}`,
                    },
                    {
                      label: 'Bilgi Anlayışı',
                      a: philosopherA.epistemology,
                      b: philosopherB.epistemology,
                    },
                    {
                      label: 'Varlık Anlayışı',
                      a: philosopherA.ontology,
                      b: philosopherB.ontology,
                    },
                    {
                      label: 'Ahlak Anlayışı',
                      a: philosopherA.ethics,
                      b: philosopherB.ethics,
                    },
                    {
                      label: 'Toplum ve Siyaset',
                      a: philosopherA.politicsAndSociety,
                      b: philosopherB.politicsAndSociety,
                    },
                    {
                      label: 'Önemli Eserler',
                      a: philosopherA.keyWorks.join(', '),
                      b: philosopherB.keyWorks.join(', '),
                    },
                  ].map((row) => (
                    <tr key={row.label} className="align-top">
                      <td className="py-3.5 px-4 font-medium text-teal-800 dark:text-teal-400 text-xs sm:text-sm">
                        {row.label}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                        {row.a}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                        {row.b}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* AI Deep Comparison Result */}
          {aiComparison && (
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
              <div>
                <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                  Gemini Akademik Sentez · {philosopherA.name} & {philosopherB.name}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-navy-900 dark:text-white">
                  Derin Karşılaştırmalı Analiz
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Bilgi Anlayışı (Epistemoloji)', text: aiComparison.epistemology },
                  { title: 'Varlık Anlayışı (Ontoloji)', text: aiComparison.ontology },
                  { title: 'Ahlak Anlayışı (Etik)', text: aiComparison.ethics },
                  { title: 'Toplum ve Siyaset Görüşleri', text: aiComparison.politicsAndSociety },
                ].map((block) => (
                  <div
                    key={block.title}
                    className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800"
                  >
                    <h4 className="text-xs font-semibold text-navy-900 dark:text-white mb-1.5">
                      {block.title}
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {block.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-semibold text-teal-700 dark:text-teal-400 mb-2">
                    Ortak Düşünce Noktaları
                  </h4>
                  <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300 list-disc pl-4">
                    {aiComparison.commonalities.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gold-600 dark:text-gold-400 mb-2">
                    Temel Ayrışma Noktaları
                  </h4>
                  <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300 list-disc pl-4">
                    {aiComparison.differences.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* TAB 3: AI SOCRATIC DIALOGUE */}
      {activeTab === 'socratic' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Panel */}
          <aside className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-navy-900 dark:text-white">
                Diyalog Ayarları
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Yapay zekâ argümanınızdaki varsayımları inceler, karşıt açılar sunar ve Sokratik
                sorularla düşünmeyi derinleştirir.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Diyalog Rehberi / Bakış Açısı
              </label>
              <select
                value={personaId}
                onChange={(e) => setPersonaId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                {DIALOGUE_PERSONAS.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedPersona.isSimulation && (
              <div
                role="note"
                className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-semibold">Eğitim Amaçlı Simülasyon Bildirimi</p>
                  <p className="mt-0.5 leading-relaxed">
                    Şu an <strong>{selectedPersona.id}</strong> düşünce çizgisinin yapay zekâ
                    tarafından canlandırılan eğitim amaçlı bir simülasyonuyla konuşuyorsunuz. Bu
                    yanıtlar tarihî filozofun birebir sözleri değil, kavramsal bir yorumudur.
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Hazır Felsefi Tartışma Sorusu
              </label>
              <div className="space-y-1.5">
                {SOCRATIC_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => {
                      setDialogueTopic(topic);
                      setCustomTopic('');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      dialogueTopic === topic && !customTopic
                        ? 'bg-navy-900 text-white dark:bg-teal-600'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Veya Kendi Felsefi Sorunuz
              </label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Örn: Sanatın amacı taklit mi, dönüşüm mü?"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>

            <button
              type="button"
              onClick={handleResetDialogue}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Diyalogu Sıfırla</span>
            </button>
          </aside>

          {/* Chat Workspace */}
          <section className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col min-h-[540px]">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                Aktif Tartışma · {selectedPersona.label}
              </p>
              <h2 className="mt-0.5 text-base font-semibold text-navy-900 dark:text-white">
                {customTopic.trim() || dialogueTopic}
              </h2>
            </div>

            <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[460px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    {msg.personaLabel}
                  </span>
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-navy-900 text-white dark:bg-teal-600'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {dialogueLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                  <span>Sokratik sorular hazırlanıyor...</span>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => void handleSendSocraticMessage(e)}
              className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-end gap-2"
            >
              <textarea
                rows={2}
                value={dialogueInput}
                onChange={(e) => setDialogueInput(e.target.value)}
                placeholder="Görüşünüzü ve gerekçenizi yazın (Örn: Bence özgürlük başkalarının hakkına zarar vermedikçe sınırsız olmalıdır...)"
                className="flex-1 px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
              <button
                type="submit"
                disabled={dialogueLoading || !dialogueInput.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>Gönder</span>
              </button>
            </form>
          </section>
        </div>
      )}

      {/* TAB 4: PHILOSOPHY 5x10 TESTS + OPEN-ENDED CRITICAL THINKING */}
      {activeTab === 'quiz' && (
        <div className="space-y-8">
          <MultiTestQuizEngine
            moduleLabel="Felsefe ve Eleştirel Düşünme"
            tests={PHILOSOPHY_TEST_PACKS}
            onCompleteTest={async ({ testTitle, correctCount, totalQuestions }) => {
              await recordQuizAttempt({
                moduleName: 'felsefe',
                topic: testTitle,
                score: correctCount,
                totalQuestions,
              });
              notify(
                'success',
                'Felsefe testi kaydedildi',
                `${totalQuestions} soruda ${correctCount} doğru sonucunuz raporlara işlendi.`
              );
            }}
          />

          {/* Open-Ended Critical Thinking Evaluation */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-2.5">
              <BookMarked className="w-5 h-5 text-gold-600 dark:text-gold-400" />
              <div>
                <h2 className="text-lg font-semibold text-navy-900 dark:text-white">
                  Açık Uçlu Felsefi Düşünme Atölyesi
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bir felsefi soruya kendi argümanınızı yazın; yapay zekâ rehberi akıl yürütmenizi
                  Sokratik olarak değerlendirsin.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {OPEN_ENDED_THOUGHT_PROMPTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setOpenPromptId(item.id);
                    setOpenFeedback('');
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    openPromptId === item.id
                      ? 'bg-navy-900 text-white dark:bg-teal-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-sm font-medium text-navy-900 dark:text-white">
                {activeOpenPrompt.question}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Yol Gösterici İpuçları: {activeOpenPrompt.guidingHints.join(' · ')}
              </p>
            </div>

            <textarea
              rows={5}
              value={openEssay}
              onChange={(e) => setOpenEssay(e.target.value)}
              placeholder="Felsefi argümanınızı, gerekçelerinizi ve örneğinizi buraya yazın..."
              className="w-full px-4 py-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void handleEvaluateOpenEssay()}
                disabled={openLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {openLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Sokratik Geri Bildirim Al</span>
              </button>
            </div>

            {openFeedback && (
              <div className="p-5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60">
                <p className="text-xs font-semibold text-teal-800 dark:text-teal-300 mb-2">
                  Sokratik Rehber Değerlendirmesi
                </p>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {openFeedback}
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
