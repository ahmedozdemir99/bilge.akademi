import React, { useState } from 'react';
import {
  BookOpen,
  Bot,
  ClipboardCheck,
  HeartHandshake,
  Loader2,
  MoonStar,
  Send,
  Volume2,
} from 'lucide-react';
import { useAcademy } from '../../context/AcademyContext';
import {
  SURAH_DUA_LIBRARY,
  WISDOM_STORIES,
  type WisdomStory,
} from '../../data/religionRichData';
import { RELIGION_TEST_PACKS } from '../../data/tests/religionTestsData';
import { speakInstant, stopAllSpeech } from '../../utils/englishAudio';
import { MultiTestQuizEngine } from '../ui/MultiTestQuizEngine';
import { WorshipAnimationsLab } from './religion/WorshipAnimationsLab';

type ReligionTab = 'worship' | 'stories' | 'surahs' | 'tests' | 'ai-tutor';

const IMAN_SHARTLARI = [
  'Allah’ın varlığına ve birliğine inanmak',
  'Meleklere inanmak',
  'İlahi kitaplara inanmak',
  'Peygamberlere inanmak',
  'Ahiret gününe inanmak',
  'Kader ve kazaya (hayır ve şerrin Allah’tan olduğuna) inanmak',
];

const ISLAM_SHARTLARI = [
  'Kelime-i Şehadet getirmek',
  'Günde beş vakit namaz kılmak',
  'Ramazan ayında oruç tutmak',
  'Zengin olanların yılda bir kez zekât vermesi',
  'İmkânı olanların ömründe bir kez hacca gitmesi',
];

const STORY_THEMES: Array<'Tümü' | WisdomStory['theme']> = [
  'Tümü',
  'Dürüstlük',
  'Adalet ve Merhamet',
  'İlim ve Tevazu',
  'Vefa ve Aile',
  'Sabır ve Şükür',
];

const AI_QUICK_QUESTIONS = [
  'Kader, kaza ve tevekkül arasındaki ilişkiyi 8. sınıf LGS düzeyinde günlük örneklerle anlat.',
  'Abdestin farzları ile sünnetleri arasındaki farkı kolay ezberlenecek şekilde özetle.',
  'Zekât, fitre ve sadaka-i cariye kavramlarını karşılaştırmalı bir tablo gibi açıkla.',
  'Hz. Muhammed’in (s.a.v.) istişare, merhamet ve güvenilirlik (El-Emîn) örneklerini sırala.',
];

export function ReligionModule() {
  const { recordQuizAttempt, workspaceView, notify } = useAcademy();
  const [activeTab, setActiveTab] = useState<ReligionTab>('worship');

  // Stories state
  const [themeFilter, setThemeFilter] = useState<'Tümü' | WisdomStory['theme']>('Tümü');
  const [selectedStoryId, setSelectedStoryId] = useState<string>(WISDOM_STORIES[0].id);

  // Surah/Dua filter
  const [surahCategory, setSurahCategory] = useState<'Tümü' | 'Namaz Suresi' | 'Namaz Duası' | 'Ayet'>('Tümü');

  // AI Tutor state
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Merhaba! Ben BİLGE AKADEMİ Din Kültürü ve Ahlak Bilgisi Öğretmeniyim. 5–8. sınıf ve LGS konuları, ibadetlerin yapılışı, sure mealleri veya ahlaki kıssalar hakkında her sorunuzu yanıtlayabilirim.',
    },
  ]);

  const filteredStories =
    themeFilter === 'Tümü'
      ? WISDOM_STORIES
      : WISDOM_STORIES.filter((s) => s.theme === themeFilter);

  const activeStory =
    filteredStories.find((s) => s.id === selectedStoryId) ?? filteredStories[0];

  const filteredSurahs =
    surahCategory === 'Tümü'
      ? SURAH_DUA_LIBRARY
      : SURAH_DUA_LIBRARY.filter((s) => s.category === surahCategory);

  const handleAskAI = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || aiLoading) return;

    const next = [...aiHistory, { role: 'user' as const, text: trimmed }];
    setAiHistory(next);
    setAiInput('');
    setAiLoading(true);
    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          moduleContext: 'Din Kültürü ve Ahlak Bilgisi',
          roleView: workspaceView,
          history: next.slice(-6),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        notify('error', 'Yapay Zekâ Yanıtı Alınamadı', data.error || 'Lütfen tekrar deneyin.');
        return;
      }
      setAiHistory((prev) => [...prev, { role: 'assistant', text: String(data.reply || '') }]);
    } catch {
      notify('error', 'Bağlantı Hatası', 'Sunucuya ulaşılamadı.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
            Ortaokul (5–8. Sınıf &amp; LGS) · İbadet Animasyonları, Hikmetli Kıssalar ve 5×10 Test
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-navy-900 dark:text-white tracking-tight">
            Din Kültürü ve Ahlak Bilgisi Akademisi
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
            Adım adım abdest ve namaz hareketleri animasyonları, Kâbe tavaf ve oruç-zekât simülatörleri,
            hikmetli hikâyeler, sure mealleri ve 50 soruluk LGS test bankası.
          </p>
        </div>

        <button
          type="button"
          onClick={() => stopAllSpeech()}
          className="self-start md:self-auto px-3.5 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
        >
          Seslendirmeyi Durdur
        </button>
      </header>

      {/* Primary Module Tabs */}
      <nav
        aria-label="Din Kültürü Modül Sekmeleri"
        className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-3"
      >
        {(
          [
            { id: 'worship', label: 'İbadet Animasyonları', icon: MoonStar },
            { id: 'stories', label: 'Hikmetli Hikâyeler (8)', icon: HeartHandshake },
            { id: 'surahs', label: 'Sure, Dua & İnanç', icon: BookOpen },
            { id: 'tests', label: 'Testler (5×10)', icon: ClipboardCheck },
            { id: 'ai-tutor', label: 'YZ Din Kültürü Öğretmeni', icon: Bot },
          ] as { id: ReligionTab; label: string; icon: React.ComponentType<{ className?: string }> }[]
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-navy-900 text-white dark:bg-teal-600'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* TAB 1: WORSHIP ANIMATIONS */}
      {activeTab === 'worship' && <WorshipAnimationsLab />}

      {/* TAB 2: WISDOM STORIES */}
      {activeTab === 'stories' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 w-fit">
            {STORY_THEMES.map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => setThemeFilter(theme)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  themeFilter === theme
                    ? 'bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <aside className="lg:col-span-5 space-y-2.5">
              {filteredStories.map((story) => {
                const isSelected = activeStory?.id === story.id;
                return (
                  <button
                    key={story.id}
                    type="button"
                    onClick={() => setSelectedStoryId(story.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-navy-900 bg-navy-900 text-white dark:border-teal-500 dark:bg-teal-600'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500/60'
                    }`}
                  >
                    <p
                      className={`text-[11px] font-medium ${
                        isSelected ? 'text-gold-300 dark:text-white/90' : 'text-teal-700 dark:text-teal-400'
                      }`}
                    >
                      {story.theme} · {story.era}
                    </p>
                    <h3
                      className={`mt-1 text-sm font-semibold ${
                        isSelected ? 'text-white' : 'text-navy-900 dark:text-white'
                      }`}
                    >
                      {story.title}
                    </h3>
                    <p
                      className={`mt-0.5 text-xs ${
                        isSelected ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {story.figure}
                    </p>
                  </button>
                );
              })}
            </aside>

            {activeStory && (
              <article className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                      {activeStory.theme} · {activeStory.figure} · {activeStory.era}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-navy-900 dark:text-white">
                      {activeStory.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      speakInstant(
                        `${activeStory.title}. ${activeStory.storyParagraphs.join(' ')} Hikmet ve ders: ${activeStory.moralLesson}`,
                        { lang: 'tr-TR', rate: 0.94 }
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 cursor-pointer whitespace-nowrap"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Hikâyeyi Sesli Dinle</span>
                  </button>
                </div>

                <div className="space-y-3 text-sm sm:text-[15px] text-slate-700 dark:text-slate-200 leading-relaxed">
                  {activeStory.storyParagraphs.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                    Çıkarılacak Hikmet ve Ahlaki Ders
                  </p>
                  <p className="text-sm text-navy-900 dark:text-white leading-relaxed">
                    {activeStory.moralLesson}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic pt-1">
                    {activeStory.relatedVerseOrHadith}
                  </p>
                </div>
              </article>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SURAHS, DUAS & PILLARS */}
      {activeTab === 'surahs' && (
        <div className="space-y-6">
          {/* Pillars of Iman & Islam */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">İnanç Esasları (Amentü)</p>
              <h2 className="mt-1 text-base font-semibold text-navy-900 dark:text-white">
                İmanın 6 Şartı
              </h2>
              <ol className="mt-3 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                {IMAN_SHARTLARI.map((item, idx) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="font-mono text-xs font-semibold text-gold-600 dark:text-gold-400 mt-0.5 tabular-nums">
                      0{idx + 1}.
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">Temel İbadetler</p>
              <h2 className="mt-1 text-base font-semibold text-navy-900 dark:text-white">
                İslam’ın 5 Şartı
              </h2>
              <ol className="mt-3 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                {ISLAM_SHARTLARI.map((item, idx) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="font-mono text-xs font-semibold text-teal-700 dark:text-teal-400 mt-0.5 tabular-nums">
                      0{idx + 1}.
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Surahs & Duas Library */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-navy-900 dark:text-white">
                  Namaz Sureleri, Dualar ve Türkçe Mealleri
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Okunuş, Türkçe meal ve ana mesajları inceleyip sesli dinleyebilirsiniz.
                </p>
              </div>
              <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                {(['Tümü', 'Namaz Suresi', 'Namaz Duası', 'Ayet'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSurahCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      surahCategory === cat
                        ? 'bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredSurahs.map((entry) => (
                <article
                  key={entry.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-teal-700 dark:text-teal-400">{entry.category}</p>
                        <h3 className="text-base font-semibold text-navy-900 dark:text-white">
                          {entry.title}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          speakInstant(`${entry.title} Türkçe meali: ${entry.turkishMeaning}`, {
                            lang: 'tr-TR',
                            rate: 0.92,
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>Meali Dinle</span>
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-navy-900 dark:text-slate-100 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                      {entry.transliteration}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      <strong>Meali:</strong> {entry.turkishMeaning}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <strong>Temel Mesaj:</strong> {entry.keyMessage}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: 5x10 LGS TESTS */}
      {activeTab === 'tests' && (
        <MultiTestQuizEngine
          moduleLabel="Din Kültürü ve Ahlak Bilgisi"
          tests={RELIGION_TEST_PACKS}
          onCompleteTest={async ({ testTitle, correctCount, totalQuestions }) => {
            await recordQuizAttempt({
              moduleName: 'din',
              topic: testTitle,
              score: correctCount,
              totalQuestions,
            });
            notify(
              'success',
              'Din Kültürü Testi Kaydedildi',
              `${testTitle}: ${correctCount}/${totalQuestions} doğru.`
            );
          }}
        />
      )}

      {/* TAB 5: AI TUTOR */}
      {activeTab === 'ai-tutor' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
              {aiHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-navy-900 text-white dark:bg-teal-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                  <span>Yanıt hazırlanıyor...</span>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleAskAI(aiInput);
              }}
              className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2.5"
            >
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Din Kültürü, ibadetler, sure mealleri veya LGS soruları hakkında yazın..."
                className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                disabled={aiLoading || !aiInput.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                <Send className="w-4 h-4" />
                <span>Gönder</span>
              </button>
            </form>
          </div>

          <aside className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-navy-900 dark:text-white">
              Hazır Çalışma Soruları
            </h2>
            <div className="space-y-2">
              {AI_QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={aiLoading}
                  onClick={() => void handleAskAI(q)}
                  className="w-full text-left p-3 rounded-lg text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-teal-500/70 transition-colors cursor-pointer leading-relaxed"
                >
                  {q}
                </button>
              ))}
            </div>
          </aside>
        </section>
      )}
    </div>
  );
}
