import React, { useState } from 'react';
import {
  BookOpenCheck,
  Bot,
  ClipboardCheck,
  Headphones,
  Loader2,
  Puzzle,
  Send,
} from 'lucide-react';
import { useAcademy } from '../../context/AcademyContext';
import { ENGLISH_TEST_PACKS } from '../../data/tests/englishTestsData';
import { stopAllSpeech } from '../../utils/englishAudio';
import { MultiTestQuizEngine } from '../ui/MultiTestQuizEngine';
import { EnglishAudioLabPanel } from './english/EnglishAudioLabPanel';
import { EnglishVocabAndBuilderPanel } from './english/EnglishVocabAndBuilderPanel';

type EnglishTab = 'listening' | 'vocab' | 'grammar' | 'tests' | 'ai-tutor';

const AI_QUICK_PROMPTS = [
  '8. sınıf Friendship ünitesinde davet etme, kabul etme ve mazeret bildirerek reddetme kalıplarını diyalogla anlat.',
  'Prefer ve Would Rather arasındaki farkı 5 örnek cümleyle Türkçe açıklamalı öğret.',
  'In the Kitchen ünitesinden bir yemek tarifi yaz ve First, Next, Then, Finally bağlaçlarını vurgula.',
  'LGS İngilizce sınavında kelime sorularını hızlı çözmek için çalışma stratejileri öner.',
];

export function EnglishModule() {
  const { recordQuizAttempt, workspaceView, notify } = useAcademy();
  const [activeTab, setActiveTab] = useState<EnglishTab>('listening');

  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Hello! Merhaba! Ben BİLGE AKADEMİ İngilizce Öğretmeniyim. 5–8. sınıf ve LGS İngilizce üniteleri, telaffuz ipuçları, diyalog pratiği veya gramer soruları için bana Türkçe ya da İngilizce yazabilirsin.',
    },
  ]);

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
          moduleContext: 'İngilizce Dil Atölyesi',
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
            Ortaokul (5–8. Sınıf &amp; LGS) · Sesli Dinleme Stüdyosu, WAV Dosyaları ve 5×10 Test
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-navy-900 dark:text-white tracking-tight">
            İngilizce Dil ve Ses Atölyesi
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
            6 sesli dinleme parçası (US/UK aksan, hız ayarı ve indirilebilir Stüdyo AI .wav ses dosyaları),
            36 telaffuzlu kelime kartı, sesli cümle kurma oyunu, LGS gramer rehberi ve 50 soruluk test bankası.
          </p>
        </div>

        <button
          type="button"
          onClick={() => stopAllSpeech()}
          className="self-start md:self-auto px-3.5 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
        >
          Tüm Sesleri Durdur
        </button>
      </header>

      {/* Primary Module Tabs */}
      <nav
        aria-label="İngilizce Modül Sekmeleri"
        className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-3"
      >
        {(
          [
            { id: 'listening', label: 'Sesli Dinleme Stüdyosu (6)', icon: Headphones },
            { id: 'vocab', label: 'Kelime & Telaffuz (36)', icon: BookOpenCheck },
            { id: 'grammar', label: 'Gramer & Cümle Kurma', icon: Puzzle },
            { id: 'tests', label: 'Testler (5×10)', icon: ClipboardCheck },
            { id: 'ai-tutor', label: 'YZ İngilizce Öğretmeni', icon: Bot },
          ] as { id: EnglishTab; label: string; icon: React.ComponentType<{ className?: string }> }[]
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

      {/* TAB 1: AUDIO LISTENING LAB */}
      {activeTab === 'listening' && <EnglishAudioLabPanel onNotify={notify} />}

      {/* TAB 2: VOCAB FLASHCARDS */}
      {activeTab === 'vocab' && <EnglishVocabAndBuilderPanel mode="vocab" onNotify={notify} />}

      {/* TAB 3: GRAMMAR & SENTENCE BUILDER */}
      {activeTab === 'grammar' && (
        <EnglishVocabAndBuilderPanel mode="grammar-builder" onNotify={notify} />
      )}

      {/* TAB 4: 5x10 LGS TESTS */}
      {activeTab === 'tests' && (
        <MultiTestQuizEngine
          moduleLabel="İngilizce (LGS)"
          tests={ENGLISH_TEST_PACKS}
          onCompleteTest={async ({ testTitle, correctCount, totalQuestions }) => {
            await recordQuizAttempt({
              moduleName: 'ingilizce',
              topic: testTitle,
              score: correctCount,
              totalQuestions,
            });
            notify(
              'success',
              'İngilizce Testi Kaydedildi',
              `${testTitle}: ${correctCount}/${totalQuestions} doğru.`
            );
          }}
        />
      )}

      {/* TAB 5: AI ENGLISH TUTOR */}
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
                placeholder="İngilizce diyalog, kelime, gramer veya LGS sorusu yazın..."
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
              Hazır İngilizce Pratik İstemleri
            </h2>
            <div className="space-y-2">
              {AI_QUICK_PROMPTS.map((q) => (
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
