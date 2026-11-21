import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  RotateCcw,
  Volume2,
  XCircle,
} from 'lucide-react';
import {
  ENGLISH_GRAMMAR_GUIDES,
  ENGLISH_VOCAB_CARDS,
  SENTENCE_BUILDER_CHALLENGES,
} from '../../../data/englishRichData';
import { playStudioAudio, speakInstant, type SpeechAccent } from '../../../utils/englishAudio';

interface EnglishVocabAndBuilderPanelProps {
  mode: 'vocab' | 'grammar-builder';
  onNotify: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export function EnglishVocabAndBuilderPanel({
  mode,
  onNotify,
}: EnglishVocabAndBuilderPanelProps) {
  // Vocab state
  const units = useMemo(
    () => ['Tümü', ...Array.from(new Set(ENGLISH_VOCAB_CARDS.map((c) => c.unit)))],
    []
  );
  const [selectedUnit, setSelectedUnit] = useState('Tümü');
  const [accent, setAccent] = useState<SpeechAccent>('en-US');
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [loadingStudioWordId, setLoadingStudioWordId] = useState<string | null>(null);

  // Sentence Builder state
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [pickedIndices, setPickedIndices] = useState<number[]>([]);
  const [checkedStatus, setCheckedStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showHint, setShowHint] = useState(false);

  const filteredVocab =
    selectedUnit === 'Tümü'
      ? ENGLISH_VOCAB_CARDS
      : ENGLISH_VOCAB_CARDS.filter((c) => c.unit === selectedUnit);

  const activeChallenge = SENTENCE_BUILDER_CHALLENGES[challengeIdx];
  const builtSentence = pickedIndices
    .map((idx) => activeChallenge.scrambledWords[idx])
    .join(' ');

  const handleToggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStudioWord = async (id: string, text: string) => {
    setLoadingStudioWordId(id);
    try {
      await playStudioAudio(text, { voiceName: 'Kore', rate: 0.95 });
    } catch {
      speakInstant(text, { lang: accent, rate: 0.88 });
      onNotify('info', 'Tarayıcı Telaffuzu Çalındı', 'Stüdyo ses yerine anında tarayıcı sesi kullanıldı.');
    } finally {
      setLoadingStudioWordId(null);
    }
  };

  const handleSelectChallenge = (idx: number) => {
    setChallengeIdx(idx);
    setPickedIndices([]);
    setCheckedStatus('idle');
    setShowHint(false);
  };

  const handleCheckSentence = () => {
    if (builtSentence.trim() === activeChallenge.correctSentence.trim()) {
      setCheckedStatus('correct');
      speakInstant(activeChallenge.correctSentence, { lang: accent, rate: 0.92 });
    } else {
      setCheckedStatus('wrong');
    }
  };

  if (mode === 'vocab') {
    return (
      <div className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="control-grid gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80">
            {units.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setSelectedUnit(u)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedUnit === u
                    ? 'bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white'
                }`}
              >
                {u}
              </button>
            ))}
          </div>

          <div className="inline-flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800 self-start">
            {(
              [
                { id: 'en-US', label: 'US Aksanı' },
                { id: 'en-GB', label: 'UK Aksanı' },
              ] as { id: SpeechAccent; label: string }[]
            ).map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAccent(a.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer whitespace-nowrap ${
                  accent === a.id
                    ? 'bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredVocab.map((card) => {
            const isRevealed = revealedIds[card.id] ?? true;
            return (
              <article
                key={card.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] text-teal-700 dark:text-teal-400">
                        {card.unit} · {card.partOfSpeech}
                      </p>
                      <h3 className="text-lg font-semibold text-navy-900 dark:text-white">
                        {card.word}
                      </h3>
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {card.phonetic}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => speakInstant(card.word, { lang: accent, rate: 0.85 })}
                        title="Kelimeyi Hızlı Dinle"
                        aria-label={`${card.word} kelimesini dinle`}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-teal-700 dark:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={loadingStudioWordId === card.id}
                        onClick={() =>
                          void handleStudioWord(card.id, `${card.word}. ${card.exampleEn}`)
                        }
                        title="Stüdyo AI Ses ile Dinle"
                        className="px-2 py-1.5 rounded-lg text-[11px] font-medium bg-gold-400/90 text-navy-950 hover:bg-gold-500 cursor-pointer whitespace-nowrap"
                      >
                        {loadingStudioWordId === card.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          'AI Ses'
                        )}
                      </button>
                    </div>
                  </div>

                  {isRevealed ? (
                    <div className="pt-2 space-y-1.5">
                      <p className="text-sm font-medium text-navy-900 dark:text-gold-300">
                        {card.turkish}
                      </p>
                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                        “{card.exampleEn}”
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {card.exampleTr}
                      </p>
                    </div>
                  ) : (
                    <p className="pt-2 text-xs text-slate-400 italic">
                      Türkçe anlam gizli — Kendini test ettikten sonra açabilirsin.
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => speakInstant(card.exampleEn, { lang: accent, rate: 0.9 })}
                    className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline cursor-pointer whitespace-nowrap"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Örnek Cümleyi Dinle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleReveal(card.id)}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white cursor-pointer whitespace-nowrap"
                  >
                    {isRevealed ? 'Anlamı Gizle' : 'Anlamı Göster'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  /* GRAMMAR GUIDES + INTERACTIVE SENTENCE BUILDER GAME */
  return (
    <div className="space-y-8">
      {/* Interactive Audio Sentence Builder Game */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
              Etkileşimli Oyun · Dinle ve Doğru İngilizce Cümleyi Kur
            </p>
            <h2 className="mt-0.5 text-lg font-semibold text-navy-900 dark:text-white">
              Sesli Cümle Kurma Atölyesi ({challengeIdx + 1}/{SENTENCE_BUILDER_CHALLENGES.length})
            </h2>
          </div>

          <div className="control-grid gap-2 [--control-min-width:4rem]">
            {SENTENCE_BUILDER_CHALLENGES.map((ch, idx) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => handleSelectChallenge(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-mono font-semibold tabular-nums border transition-colors cursor-pointer ${
                  idx === challengeIdx
                    ? 'border-navy-900 bg-navy-900 text-white dark:border-teal-500 dark:bg-teal-600'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{activeChallenge.unit}</p>
            <p className="mt-1 text-base font-medium text-navy-900 dark:text-white">
              Türkçe Hedef: “{activeChallenge.turkishPrompt}”
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              speakInstant(activeChallenge.correctSentence, { lang: accent, rate: 0.85 })
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-gold-400 text-navy-950 hover:bg-gold-500 cursor-pointer whitespace-nowrap self-start"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Hedef Cümleyi Sesli Dinle (İpucu)</span>
          </button>
        </div>

        {/* Built Sentence Drop Zone */}
        <div className="min-h-[60px] p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
          {pickedIndices.length === 0 ? (
            <span className="text-xs text-slate-400">
              Aşağıdaki karışık kelimelere sırayla tıklayarak cümleyi oluşturun...
            </span>
          ) : (
            pickedIndices.map((wordIdx, pos) => (
              <button
                key={`${wordIdx}-${pos}`}
                type="button"
                onClick={() => {
                  setCheckedStatus('idle');
                  setPickedIndices((prev) => prev.filter((_, i) => i !== pos));
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-900 text-white dark:bg-teal-600 cursor-pointer"
              >
                {activeChallenge.scrambledWords[wordIdx]}
              </button>
            ))
          )}
        </div>

        {/* Scrambled Word Bank */}
        <div className="flex flex-wrap gap-2">
          {activeChallenge.scrambledWords.map((word, idx) => {
            const used = pickedIndices.includes(idx);
            return (
              <button
                key={`${activeChallenge.id}-${idx}`}
                type="button"
                disabled={used}
                onClick={() => {
                  setCheckedStatus('idle');
                  setPickedIndices((prev) => [...prev, idx]);
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  used
                    ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 opacity-40 cursor-not-allowed'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:border-teal-500'
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>

        <div className="control-grid gap-2.5 pt-2">
          <button
            type="button"
            disabled={pickedIndices.length === 0}
            onClick={handleCheckSentence}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            Cümleyi Kontrol Et
          </button>
          <button
            type="button"
            onClick={() => {
              setPickedIndices([]);
              setCheckedStatus('idle');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Temizle</span>
          </button>
          <button
            type="button"
            onClick={() => setShowHint((s) => !s)}
            className="px-3.5 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer whitespace-nowrap"
          >
            {showHint ? 'İpucunu Gizle' : 'Gramer İpucu'}
          </button>
        </div>

        {showHint && (
          <p className="text-xs text-amber-800 dark:text-gold-300 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
            <strong>İpucu:</strong> {activeChallenge.hint}
          </p>
        )}

        {checkedStatus === 'correct' && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Harika! Cümleyi tam doğru sırayla kurdun: “{activeChallenge.correctSentence}”</span>
          </div>
        )}
        {checkedStatus === 'wrong' && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-900 dark:text-red-200">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>Kelime sırası tam uymadı. İpucuna bakabilir veya sesli dinleyip tekrar deneyebilirsin.</span>
          </div>
        )}
      </section>

      {/* 6 LGS Grammar Guides with Audio Examples */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-navy-900 dark:text-white">
            Ortaokul &amp; LGS Temel İngilizce Gramer Rehberi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Her yapının Türkçe özeti, formülü ve sesli dinlenebilir örnek cümleleri
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ENGLISH_GRAMMAR_GUIDES.map((guide) => (
            <article
              key={guide.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3"
            >
              <div>
                <p className="text-xs text-teal-700 dark:text-teal-400">{guide.unitFocus}</p>
                <h3 className="text-base font-semibold text-navy-900 dark:text-white">
                  {guide.title}
                </h3>
              </div>
              <p className="text-xs font-mono bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-navy-900 dark:text-teal-300">
                {guide.formula}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {guide.explanationTr}
              </p>
              <div className="space-y-2 pt-1">
                {guide.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800"
                  >
                    <div>
                      <p className="text-xs font-medium text-navy-900 dark:text-white">{ex.en}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{ex.tr}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => speakInstant(ex.en, { lang: accent, rate: 0.9 })}
                      aria-label="Örnek cümleyi dinle"
                      className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer shrink-0"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <strong>LGS İpucu:</strong> {guide.tipTr}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
