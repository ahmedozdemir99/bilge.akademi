import { WorkshopLinks } from './workshop/WorkshopLinks';
import React, { useMemo, useState } from 'react';
import {
  Atom,
  BookOpen,
  Bot,
  ClipboardList,
  Dna,
  FlaskConical,
  Loader2,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { useAcademy } from '../../context/AcademyContext';
import {
  SAFE_HOME_EXPERIMENTS,
  SCIENCE_STORIES_AND_SCIENTISTS,
} from '../../data/scienceRichData';
import { SCIENCE_TEST_PACKS } from '../../data/tests/scienceTestsData';
import { MultiTestQuizEngine } from '../ui/MultiTestQuizEngine';
import { DnaGeneticsLabPanel } from './science/DnaGeneticsLabPanel';
import { InteractiveExperimentsLab } from './science/InteractiveExperimentsLab';
import { PeriodicTableBohrPanel } from './science/PeriodicTableBohrPanel';

type ScienceTab =
  | 'experiments'
  | 'periodic'
  | 'dna'
  | 'stories'
  | 'tests'
  | 'ai-tutor';

const SCIENCE_AI_PROMPTS = [
  '8. sınıf LGS için katı, sıvı ve gaz basıncı arasındaki farkları günlük hayat örnekleriyle özetle.',
  'Fotosentez ile oksijenli solunumun birbirini nasıl tamamladığını tablo hâlinde anlat.',
  'Sınıf ortamında 15 dakikada yapılabilecek güvenli bir asit-baz deneyi planla.',
  'Mevsimlerin oluşumunda neden Güneş’e yakınlık değil eksen eğikliği belirleyicidir? Basitçe açıkla.',
];

export function ScienceLabModule() {
  const { recordQuizAttempt, workspaceView, notify } = useAcademy();
  const [activeTab, setActiveTab] = useState<ScienceTab>('experiments');

  // Stories & Safe Experiments filters
  const [fieldFilter, setFieldFilter] = useState<string>('Tümü');
  const [expandedExpId, setExpandedExpId] = useState<string>(SAFE_HOME_EXPERIMENTS[0].id);

  // AI Science Tutor state
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const filteredScientists = useMemo(() => {
    if (fieldFilter === 'Tümü') return SCIENCE_STORIES_AND_SCIENTISTS;
    return SCIENCE_STORIES_AND_SCIENTISTS.filter((s) => s.field === fieldFilter);
  }, [fieldFilter]);

  const handleAskScienceAI = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || aiLoading) return;
    setAiQuestion(trimmed);
    setAiLoading(true);
    setAiAnswer('');
    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          moduleContext: 'Fen Bilimleri Laboratuvarı',
          roleView: workspaceView,
          history: [],
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        notify('error', 'Fen Asistanı Hatası', data.error || 'Yanıt alınamadı.');
        return;
      }
      setAiAnswer(String(data.reply || 'Yanıt oluşturulamadı.'));
    } catch {
      notify('error', 'Bağlantı Hatası', 'Sunucuya ulaşılamadı. Lütfen tekrar deneyin.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
            Modül 06 · 5–8. Sınıf &amp; LGS Fen Bilimleri · 5 Canlı Simülasyon · 50 Çoktan Seçmeli Test
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-navy-900 dark:text-white tracking-tight">
            Fen Bilimleri ve Etkileşimli Deney Laboratuvarı
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
            Elektrik devresi, pH ve nötralleşme, kaldıraç dengesi, fotosentez ve mevsim simülasyonlarını canlı yönetin; Bohr atom modelini ve Mendel kalıtım çaprazlamalarını keşfedin.
          </p>
        </div>

        <nav
          aria-label="Fen Bilimleri Sekmeleri"
          className="control-grid gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
        >
          {[
            { id: 'experiments', label: 'Sanal Deneyler (5)', icon: FlaskConical },
            { id: 'periodic', label: 'Periyodik Tablo', icon: Atom },
            { id: 'dna', label: 'DNA & Kalıtım', icon: Dna },
            { id: 'stories', label: 'Bilim & Ev Deneyleri', icon: BookOpen },
            { id: 'tests', label: 'Testler (5×10)', icon: ClipboardList },
            { id: 'ai-tutor', label: 'YZ Fen Öğretmeni', icon: Bot },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ScienceTab)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white dark:bg-slate-800 text-navy-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* TAB 1: INTERACTIVE VIRTUAL EXPERIMENTS */}
      {activeTab === 'experiments' && <InteractiveExperimentsLab />}

      {/* TAB 2: PERIODIC TABLE & BOHR MODEL */}
      {activeTab === 'periodic' && <PeriodicTableBohrPanel />}

      {/* TAB 3: DNA & MENDEL GENETICS */}
      {activeTab === 'dna' && <DnaGeneticsLabPanel />}

      {/* TAB 4: SCIENTISTS & SAFE HOME EXPERIMENTS */}
      {activeTab === 'stories' && (
        <div className="space-y-8">
          {/* Scientists & Science Stories */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                  Bilim Tarihi ve İlham Veren Keşifler · {SCIENCE_STORIES_AND_SCIENTISTS.length} Bilim İnsanı
                </p>
                <h2 className="mt-0.5 text-xl font-semibold text-navy-900 dark:text-white">
                  Fen Bilimlerine Yön Veren Bilim İnsanları
                </h2>
              </div>

              <div className="control-grid gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                {['Tümü', 'Fizik', 'Kimya', 'Biyoloji', 'Astronomi & Mühendislik'].map((fld) => (
                  <button
                    key={fld}
                    type="button"
                    onClick={() => setFieldFilter(fld)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      fieldFilter === fld
                        ? 'bg-white dark:bg-slate-800 text-navy-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {fld}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredScientists.map((sci) => (
                <article
                  key={sci.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <p className="text-xs text-teal-700 dark:text-teal-400">
                      {sci.field} · {sci.era}
                    </p>
                    <h3 className="text-base font-semibold text-navy-900 dark:text-white">
                      {sci.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                      {sci.summary}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {sci.story}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    <p className="text-[11px] italic text-slate-500 dark:text-slate-400">
                      “{sci.quote}”
                    </p>
                    <p className="text-[11px] font-medium text-gold-600 dark:text-gold-400">
                      Müfredat Bağı: {sci.lgsConnection}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Safe Home / Classroom Experiment Guides */}
          <section className="space-y-4">
            <div>
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                Uygulamalı Öğrenme · {SAFE_HOME_EXPERIMENTS.length} Güvenli Deney Föyü
              </p>
              <h2 className="mt-0.5 text-xl font-semibold text-navy-900 dark:text-white">
                Evde ve Sınıfta Yapılabilecek Güvenli Fen Deneyleri
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {SAFE_HOME_EXPERIMENTS.map((exp) => {
                const expanded = expandedExpId === exp.id;
                return (
                  <article
                    key={exp.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-teal-700 dark:text-teal-400">
                          {exp.gradeLevel} · {exp.topic} · {exp.duration}
                        </p>
                        <h3 className="text-base font-semibold text-navy-900 dark:text-white mt-0.5">
                          {exp.title}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedExpId(expanded ? '' : exp.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap cursor-pointer"
                      >
                        {expanded ? 'Özete Dön' : 'Deney Föyünü Aç'}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      <strong>Gerekli Malzemeler:</strong> {exp.materials.join(', ')}
                    </p>

                    {expanded && (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                        <div>
                          <p className="font-semibold text-navy-900 dark:text-white mb-1.5">
                            Uygulama Adımları
                          </p>
                          <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                            {exp.steps.map((step) => (
                              <li key={step}>{step}</li>
                            ))}
                          </ol>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 leading-relaxed">
                          <strong className="text-teal-700 dark:text-teal-400">Bilimsel Açıklama: </strong>
                          {exp.scienceBehind}
                        </div>

                        <p className="flex items-start gap-1.5 text-amber-800 dark:text-amber-300">
                          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>
                            <strong>Güvenlik Notu:</strong> {exp.safetyNote}
                          </span>
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* TAB 5: 5 x 10 MULTIPLE CHOICE SCIENCE TESTS */}
      {activeTab === 'tests' && (
        <MultiTestQuizEngine
          moduleLabel="Fen Bilimleri"
          tests={SCIENCE_TEST_PACKS}
          onCompleteTest={async ({ testTitle, correctCount, totalQuestions }) => {
            await recordQuizAttempt({
              moduleName: 'fen',
              topic: testTitle,
              score: correctCount,
              totalQuestions,
            });
          }}
        />
      )}

      {/* TAB 6: AI SCIENCE TUTOR */}
      {activeTab === 'ai-tutor' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
            <div>
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                Yapay Zekâ Fen Öğretmeni · Gemini Destekli Türkçe Rehberlik
              </p>
              <h2 className="mt-0.5 text-lg font-semibold text-navy-900 dark:text-white">
                Deney Yorumlatın veya LGS Fen Sorusu Sorun
              </h2>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleAskScienceAI(aiQuestion);
              }}
              className="space-y-3"
            >
              <textarea
                rows={4}
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Örn: Bir sıvı basıncı sorusunda kabın şekli değişirse tabandaki basınç neden değişmez?"
                maxLength={1000}
                className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:border-teal-600 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={aiLoading || !aiQuestion.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{aiLoading ? 'Yanıt Hazırlanıyor...' : 'Fen Öğretmenine Sor'}</span>
                </button>
              </div>
            </form>

            {aiAnswer && (
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {aiAnswer}
              </div>
            )}
          </div>

          <aside className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-navy-900 dark:text-white">
              Hazır Fen Bilimleri İstemleri
            </h3>
            <div className="space-y-2">
              {SCIENCE_AI_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={aiLoading}
                  onClick={() => void handleAskScienceAI(prompt)}
                  className="w-full text-left p-3 rounded-lg text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition-colors cursor-pointer leading-relaxed"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </aside>
        </section>
      )}

      <WorkshopLinks activities={['circuit', 'mirror', 'waves']} />
    </div>
  );
}
