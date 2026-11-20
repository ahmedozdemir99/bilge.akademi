import React, { useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Flag,
  RotateCcw,
  Shuffle,
  XCircle,
} from 'lucide-react';
import { Modal } from './Modal';

export interface MultiTestQuestion {
  id: string;
  topicTag: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface MultiTestPack {
  id: string;
  testNumber: number;
  title: string;
  subtitle: string;
  difficulty: 'Temel' | 'Orta' | 'LGS Düzeyi';
  questions: MultiTestQuestion[];
}

interface MultiTestQuizEngineProps {
  moduleLabel: string;
  tests: MultiTestPack[];
  onCompleteTest: (payload: {
    testTitle: string;
    correctCount: number;
    totalQuestions: number;
  }) => Promise<void> | void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

export function MultiTestQuizEngine({
  moduleLabel,
  tests,
  onCompleteTest,
}: MultiTestQuizEngineProps) {
  const [selectedTestId, setSelectedTestId] = useState<string>(tests[0]?.id ?? '');
  const [mixedQuestions, setMixedQuestions] = useState<MultiTestQuestion[] | null>(null);
  const [feedbackMode, setFeedbackMode] = useState<'instant' | 'exam'>('instant');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(() => new Set());
  const [confirmation, setConfirmation] = useState<{
    kind: 'switch' | 'finish';
    proceed: () => void;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [showMissedOnly, setShowMissedOnly] = useState(false);
  const saving = useRef(false);
  const [completedScores, setCompletedScores] = useState<Record<string, { score: number; total: number }>>({});

  const activePack = useMemo<MultiTestPack | undefined>(() => {
    if (selectedTestId === '__mixed__' && mixedQuestions) {
      return {
        id: '__mixed__',
        testNumber: 0,
        title: `${moduleLabel} Karışık 10 Soruluk Karma Deneme`,
        subtitle: 'Tüm testlerden rastgele seçilmiş 10 çoktan seçmeli soru',
        difficulty: 'LGS Düzeyi',
        questions: mixedQuestions,
      };
    }
    return tests.find((t) => t.id === selectedTestId) ?? tests[0];
  }, [mixedQuestions, moduleLabel, selectedTestId, tests]);

  const questions = activePack?.questions ?? [];
  const currentQuestion = questions[currentIndex] ?? questions[0];

  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q.id] !== undefined).length,
    [answers, questions]
  );

  const correctCount = useMemo(
    () => questions.reduce((sum, q) => sum + (answers[q.id] === q.correctIndex ? 1 : 0), 0),
    [answers, questions]
  );

  const blankCount = questions.length - answeredCount;

  const confirmSwitch = (switchTest: () => void) => {
    if (!submitted && (answeredCount > 0 || markedQuestions.size > 0)) {
      setConfirmation({ kind: 'switch', proceed: switchTest });
      return;
    }
    switchTest();
  };

  const handleSelectPack = (id: string) => {
    if (saving.current || id === activePack?.id) return;
    confirmSwitch(() => {
      setSelectedTestId(id);
      setMixedQuestions(null);
      handleResetActive();
    });
  };

  const handleStartMixedTest = () => {
    if (saving.current) return;
    const shuffled = tests.flatMap((t) => t.questions);
    const sampleSize = Math.min(shuffled.length, 10);
    for (let i = 0; i < sampleSize; i++) {
      const j = i + Math.floor(Math.random() * (shuffled.length - i));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    confirmSwitch(() => {
      setMixedQuestions(shuffled.slice(0, sampleSize));
      setSelectedTestId('__mixed__');
      handleResetActive();
    });
  };

  const handlePickOption = (questionId: string, optionIdx: number) => {
    if (submitted || saving.current) return;
    if (feedbackMode === 'instant' && answers[questionId] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleFinishTest = async () => {
    if (submitted || saving.current || !activePack || !questions.length) return;
    saving.current = true;
    setIsSaving(true);
    setSaveError(false);
    try {
      await onCompleteTest({
        testTitle: activePack.title,
        correctCount,
        totalQuestions: questions.length,
      });
      setCompletedScores((prev) => ({
        ...prev,
        [activePack.id]: { score: correctCount, total: questions.length },
      }));
      setSubmitted(true);
    } catch {
      setSaveError(true);
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };

  const requestFinish = () => {
    if (blankCount === 0 || saveError) {
      void handleFinishTest();
      return;
    }
    setConfirmation({ kind: 'finish', proceed: () => void handleFinishTest() });
  };

  const handleResetActive = () => {
    setAnswers({});
    setCurrentIndex(0);
    setSubmitted(false);
    setSaveError(false);
    setShowMissedOnly(false);
    setMarkedQuestions(new Set());
  };

  if (!activePack || !currentQuestion) {
    return <p className="text-sm text-slate-600 dark:text-slate-300">Bu bölümde henüz test bulunmuyor.</p>;
  }

  const nextPack = tests[tests.findIndex((pack) => pack.id === activePack.id) + 1];
  const markedForCurrent = markedQuestions.has(currentQuestion.id);
  const nextMarkedIndex = questions.findIndex((question, index) => index > currentIndex && markedQuestions.has(question.id));
  const firstMarkedIndex = questions.findIndex((question) => markedQuestions.has(question.id));
  const chosenForCurrent = answers[currentQuestion.id];
  const revealCurrent = submitted || (feedbackMode === 'instant' && chosenForCurrent !== undefined);

  const confirmingFinish = confirmation?.kind === 'finish';

  return (
    <div className="space-y-6">
      <Modal
        open={confirmation !== null}
        onClose={() => setConfirmation(null)}
        title={confirmingFinish ? 'Test bitirilsin mi?' : 'Başka bir teste geçilsin mi?'}
        subtitle={confirmingFinish
          ? `${blankCount} soru boş bırakıldı. Testi bitirirseniz bu yanıtlar boş olarak değerlendirilir.`
          : 'Bu testteki yanıtlarınız ve soru işaretleriniz silinecek.'}
        maxWidthClass="max-w-md"
      >
        <div className="control-grid ml-auto max-w-sm gap-3">
          <button type="button" onClick={() => setConfirmation(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-700 dark:text-white">
            Teste dön
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirmation(null);
              confirmation?.proceed();
            }}
            className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white dark:bg-teal-600"
          >
            {confirmingFinish ? 'Testi bitir' : 'Testi değiştir'}
          </button>
        </div>
      </Modal>
      {/* Test Pack Selector Grid */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
              {moduleLabel} Test Bankası · {tests.length} Test · Toplam{' '}
              {tests.reduce((acc, t) => acc + t.questions.length, 0)} Çoktan Seçmeli Soru
            </p>
            <h2 className="mt-0.5 text-lg font-semibold text-navy-900 dark:text-white">
              Test Seçin ve Çoktan Seçmeli Sınavı Başlatın
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setFeedbackMode('instant')}
                disabled={isSaving || (answeredCount > 0 && !submitted)}
                aria-pressed={feedbackMode === 'instant'}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer disabled:cursor-default ${
                  feedbackMode === 'instant'
                    ? 'bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Anında Kontrol
              </button>
              <button
                type="button"
                onClick={() => setFeedbackMode('exam')}
                disabled={isSaving || (answeredCount > 0 && !submitted)}
                aria-pressed={feedbackMode === 'exam'}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer disabled:cursor-default ${
                  feedbackMode === 'exam'
                    ? 'bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Sınav Modu
              </button>
            </div>

            <button
              type="button"
              onClick={handleStartMixedTest}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-gold-500/60 bg-gold-50/70 dark:bg-gold-950/20 text-navy-900 dark:text-gold-300 hover:bg-gold-100 dark:hover:bg-gold-950/40 cursor-pointer whitespace-nowrap"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Karışık 10 Soru Üret</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {tests.map((pack) => {
            const isSelected = activePack.id === pack.id;
            const prevScore = completedScores[pack.id];
            return (
              <button
                key={pack.id}
                type="button"
                onClick={() => handleSelectPack(pack.id)}
                disabled={isSaving}
                aria-pressed={isSelected}
                className={`text-left p-4 rounded-xl border transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'border-navy-900 bg-navy-900 text-white dark:border-teal-500 dark:bg-teal-600'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 hover:border-teal-500/70'
                }`}
              >
                <div>
                  <p
                    className={`text-[11px] font-mono tabular-nums ${
                      isSelected ? 'text-gold-300 dark:text-white/90' : 'text-teal-700 dark:text-teal-400'
                    }`}
                  >
                    Test 0{pack.testNumber} · {pack.questions.length} Soru · {pack.difficulty}
                  </p>
                  <p
                    className={`mt-1 text-sm font-semibold leading-snug ${
                      isSelected ? 'text-white' : 'text-navy-900 dark:text-white'
                    }`}
                  >
                    {pack.title}
                  </p>
                </div>
                <p
                  className={`text-[11px] leading-snug ${
                    isSelected ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {prevScore
                    ? `Son Sonuç: ${prevScore.score}/${prevScore.total} (%${Math.round(
                        (prevScore.score / prevScore.total) * 100
                      )})`
                    : pack.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Active Test Workspace */}
      {!submitted ? (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          {/* Header & Question Number Navigator */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs text-teal-700 dark:text-teal-400">
                {activePack.title} · {currentQuestion.topicTag}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                Soru {currentIndex + 1} / {questions.length} · Yanıtlanan: {answeredCount} /{' '}
                {questions.length}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5" aria-label="Soru numaraları">
              {questions.map((q, idx) => {
                const picked = answers[q.id];
                const isCurrent = idx === currentIndex;
                let btnStyle =
                  'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-950';
                if (isCurrent) {
                  btnStyle =
                    'border-navy-900 bg-navy-900 text-white dark:border-teal-500 dark:bg-teal-600';
                } else if (picked !== undefined) {
                  if (feedbackMode === 'instant') {
                    btnStyle =
                      picked === q.correctIndex
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                        : 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300';
                  } else {
                    btnStyle =
                      'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300';
                  }
                }
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-label={`Soru ${idx + 1}${picked !== undefined ? ', yanıtlandı' : ''}${markedQuestions.has(q.id) ? ', işaretli' : ''}`}
                    className={`relative size-9 rounded-lg border text-xs font-mono font-semibold tabular-nums transition-colors cursor-pointer ${btnStyle}`}
                  >
                    {idx + 1}
                    {markedQuestions.has(q.id) && (
                      <Flag aria-hidden="true" className="absolute -right-1 -top-1 size-3 rounded-sm bg-gold-300 p-px text-navy-950" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <progress aria-label="Yanıtlanan soru sayısı" value={answeredCount} max={questions.length} className="h-2 w-36 max-w-full accent-teal-600" />
            <div className="control-grid gap-2 sm:max-w-sm">
              <button
                type="button"
                aria-pressed={markedForCurrent}
                disabled={isSaving}
                onClick={() => setMarkedQuestions((previous) => {
                  const next = new Set(previous);
                  if (next.has(currentQuestion.id)) next.delete(currentQuestion.id);
                  else next.add(currentQuestion.id);
                  return next;
                })}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 aria-pressed:border-gold-500 aria-pressed:bg-gold-100 dark:border-slate-700 dark:text-slate-200 dark:aria-pressed:bg-gold-950/50"
              >
                <Flag aria-hidden="true" className="size-4" />
                {markedForCurrent ? 'İşareti kaldır' : 'Sonra dönmek için işaretle'}
              </button>
              {firstMarkedIndex !== -1 && (
                <button
                  type="button"
                  onClick={() => setCurrentIndex(nextMarkedIndex === -1 ? firstMarkedIndex : nextMarkedIndex)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-teal-700 underline underline-offset-4 dark:text-teal-400"
                >
                  İşaretli soruya git ({markedQuestions.size})
                </button>
              )}
            </div>
          </div>

          {/* Question Prompt */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-navy-900 dark:text-white leading-relaxed">
              {currentIndex + 1}. {currentQuestion.question}
            </h3>

            {/* 4 Multiple Choice Options (A, B, C, D) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentQuestion.options.map((opt, optIdx) => {
                const isPicked = chosenForCurrent === optIdx;
                const isRightOption = optIdx === currentQuestion.correctIndex;

                let optionClass =
                  'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 hover:border-teal-500';
                if (revealCurrent) {
                  if (isRightOption) {
                    optionClass =
                      'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-medium';
                  } else if (isPicked && !isRightOption) {
                    optionClass =
                      'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200';
                  }
                } else if (isPicked) {
                  optionClass =
                    'border-navy-900 dark:border-teal-500 bg-navy-900 text-white dark:bg-teal-600 font-medium';
                }

                return (
                  <button
                    key={`${currentQuestion.id}-${optIdx}`}
                    type="button"
                    onClick={() => handlePickOption(currentQuestion.id, optIdx)}
                    aria-pressed={isPicked}
                    disabled={isSaving || revealCurrent}
                    className={`w-full text-left p-4 rounded-xl border transition-colors flex items-start gap-3 cursor-pointer ${optionClass}`}
                  >
                    <span className="font-mono font-semibold text-xs mt-0.5 shrink-0">
                      {OPTION_LETTERS[optIdx]})
                    </span>
                    <span className="text-sm leading-relaxed flex-1">{opt}</span>
                    {revealCurrent && isRightOption && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    {revealCurrent && isPicked && !isRightOption && (
                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {feedbackMode === 'exam' && chosenForCurrent !== undefined && (
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setAnswers(({ [currentQuestion.id]: _cleared, ...remaining }) => remaining)}
                className="text-sm font-medium text-teal-700 underline underline-offset-4 dark:text-teal-400 disabled:opacity-60"
              >
                Yanıtı temizle
              </button>
            )}

            {/* Instant Solution Feedback */}
            {revealCurrent && (
              <div
                role="status"
                className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                  chosenForCurrent === currentQuestion.correctIndex
                    ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200'
                    : 'border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/30 text-slate-800 dark:text-amber-100'
                }`}
              >
                <p className="font-semibold mb-1">
                  {chosenForCurrent === currentQuestion.correctIndex
                    ? 'Doğru Cevap!'
                    : `Doğru Seçenek: ${OPTION_LETTERS[currentQuestion.correctIndex]} — ${
                        currentQuestion.options[currentQuestion.correctIndex]
                      }`}
                </p>
                <p>{currentQuestion.explanation}</p>
              </div>
            )}
          </div>

          {saveError && (
            <p role="alert" className="text-sm text-red-700 dark:text-red-300">
              Test sonucu kaydedilemedi. Yanıtlarınız burada duruyor. Tekrar deneyebilirsiniz.
            </p>
          )}

          {/* Footer Controls */}
          <div className="control-grid gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer whitespace-nowrap"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Önceki Soru</span>
            </button>

            {currentIndex < questions.length - 1 && (
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer whitespace-nowrap"
              >
                <span>Sonraki Soru</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={requestFinish}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-gold-500 text-navy-950 hover:bg-gold-400 cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>{isSaving ? 'Kaydediliyor…' : blankCount > 0 ? `Testi Bitir (${blankCount} boş)` : 'Testi Bitir ve Değerlendir'}</span>
            </button>
          </div>
        </section>
      ) : (
        /* Results Summary & Detailed Review */
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                Test Değerlendirme Raporu · {activePack.title}
              </p>
              <h3 className="mt-1 text-2xl font-semibold font-mono tabular-nums text-navy-900 dark:text-white">
                {correctCount} Doğru · {answeredCount - correctCount} Yanlış ·{' '}
                {questions.length - answeredCount} Boş (%
                {Math.round((correctCount / questions.length) * 100)})
              </h3>
            </div>
            <div className="control-grid gap-2 sm:max-w-sm">
              <button
                type="button"
                onClick={handleResetActive}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Bu Testi Yeniden Çöz</span>
              </button>
              {activePack.id !== '__mixed__' && nextPack && (
                <button
                  type="button"
                  onClick={() => handleSelectPack(nextPack.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 cursor-pointer whitespace-nowrap"
                >
                  <span>Sonraki Teste Geç</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={showMissedOnly}
              onChange={(event) => setShowMissedOnly(event.target.checked)}
              className="size-4 accent-teal-600"
            />
            Yalnızca yanlış ve boş soruları göster
          </label>
          {showMissedOnly && correctCount === questions.length && (
            <p role="status" className="text-sm text-slate-600 dark:text-slate-300">Bütün soruları doğru yanıtladınız.</p>
          )}
          <div className="space-y-3">
            {questions.map((q, idx) => {
              const picked = answers[q.id];
              const isCorrect = picked === q.correctIndex;
              const isBlank = picked === undefined;
              if (showMissedOnly && isCorrect) return null;
              return (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-navy-900 dark:text-white">
                      {idx + 1}. {q.question}
                    </p>
                    <span
                      className={`text-xs font-semibold shrink-0 whitespace-nowrap ${
                        isCorrect
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : isBlank
                            ? 'text-slate-500 dark:text-slate-400'
                            : 'text-red-700 dark:text-red-400'
                      }`}
                    >
                      {isCorrect ? 'Doğru' : isBlank ? 'Boş' : 'Yanlış'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    Doğru Cevap:{' '}
                    <strong>
                      {OPTION_LETTERS[q.correctIndex]}) {q.options[q.correctIndex]}
                    </strong>
                    {!isCorrect && !isBlank && (
                      <>
                        {' '}
                        · Seçiminiz: {OPTION_LETTERS[picked]}) {q.options[picked]}
                      </>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
