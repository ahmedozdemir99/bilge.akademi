import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Bot,
  Calculator,
  CheckCircle2,
  Lightbulb,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAcademy } from '../../context/AcademyContext';
import {
  analyzeLinear,
  checkMathAnswer,
  generateDeterministicExercise,
  MATH_TOPICS,
  sampleLinearEquation,
  type MathExerciseItem,
} from '../../utils/mathEngine';
import { MATH_TEST_PACKS } from '../../data/tests/mathTestsData';
import { MathFormula } from '../ui/MathFormula';
import { MultiTestQuizEngine } from '../ui/MultiTestQuizEngine';
import { Geometry3DNetLab } from './math/Geometry3DNetLab';
import { MathEncyclopediaPanel } from './math/MathEncyclopediaPanel';
import { OneWordOneOperationGame } from './math/OneWordOneOperationGame';
import { VisualProofsLab } from './math/VisualProofsLab';

type MathTab = 'proofs' | 'game' | 'encyclopedia' | 'tests' | 'solver' | 'graphs' | 'exercises';
type GraphMode = 'geometry' | 'linear' | 'coordinate';

function buildExerciseMcqOptions(acceptedAnswers: string[], questionText = ''): string[] {
  const correct = (acceptedAnswers[0] ?? '').trim();
  if (!correct) return [];
  const candidates = new Set<string>([correct]);
  const weekdays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  const dayIndex = weekdays.findIndex((day) => day.toLocaleLowerCase('tr') === correct.toLocaleLowerCase('tr'));
  if (dayIndex >= 0) {
    for (const offset of [-2, -1, 1, 2]) candidates.add(weekdays[(dayIndex + offset + 7) % 7]);
  } else if (/^-?\d+(?:[.,]\d+)?$/.test(correct)) {
    const base = Number(correct.replace(',', '.'));
    const isInteger = Number.isInteger(base);
    const step = isInteger ? (Math.abs(base) >= 100 ? 10 : Math.abs(base) >= 20 ? 2 : 1) : 0.5;
    for (const offset of [-2, -1, 1, 2, -3, 3]) {
      const value = Number((base + offset * step).toFixed(2));
      if (base >= 0 && value < 0) continue;
      candidates.add(String(value));
    }
  } else if (/^-?\d+\/\d+$/.test(correct)) {
    const [n, d] = correct.split('/').map(Number);
    for (const alt of [`${n + 1}/${d}`, `${Math.max(1, n - 1)}/${d}`, `${n}/${d + 1}`, `${n}/${d + 2}`]) candidates.add(alt);
  } else if (/^[a-zA-Z]\s*[+-]\s*\d+$/.test(correct)) {
    const match = correct.match(/^([a-zA-Z])\s*([+-])\s*(\d+)$/)!;
    const variable = match[1], signed = Number(match[3]) * (match[2] === '-' ? -1 : 1);
    for (const delta of [-2, -1, 1, 2]) {
      const value = signed + delta;
      candidates.add(`${variable} ${value < 0 ? '-' : '+'} ${Math.abs(value)}`);
    }
  }
  // Never display unrelated fallback answers. Require four plausible options.
  if (candidates.size < 4) return [];
  const arr = [...candidates].slice(0, 4);
  const shift = [...correct].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 4;
  return [...arr.slice(shift), ...arr.slice(0, shift)];
}

interface AIMathSolution {
  analysis: string;
  givens: string[];
  targets: string[];
  method: string;
  steps: { title: string; explanation: string; latex: string }[];
  finalAnswerLatex: string;
  finalAnswerText: string;
  verification: string;
  alternativeMethod: string;
}

const SAMPLE_PROBLEMS = [
  '36 ve 48 sayılarının EBOB ve EKOK değerlerini asal çarpanlarına ayırarak bulunuz.',
  'Bir dik üçgenin dik kenarları 6 cm ve 8 cm olduğuna göre hipotenüs uzunluğunu ve alanını hesaplayınız.',
  '(x + 5)² cebirsel ifadesini tam kare özdeşliği kullanarak açınız ve x = 4 için değerini bulunuz.',
  'Etiket fiyatı 240 TL olan bir ürüne önce %25 indirim yapılıyor. İndirimli satış fiyatı kaç TL olur?',
];

export function MathTutorModule() {
  const { recordMathAttempt, recordQuizAttempt, mathAttempts, notify } = useAcademy();
  const [activeTab, setActiveTab] = useState<MathTab>('proofs');

  // 1. 6-Step Solver State
  const [solverTopic, setSolverTopic] = useState<string>(MATH_TOPICS[0]);
  const [solverGrade, setSolverGrade] = useState<string>('8. Sınıf (LGS)');
  const [problemText, setProblemText] = useState(SAMPLE_PROBLEMS[0]);
  const [solving, setSolving] = useState(false);
  const [solveError, setSolveError] = useState('');
  const [solution, setSolution] = useState<AIMathSolution | null>(null);

  // 2. Deterministic Graphs, Coordinate Plane & 3D Geometry Net State (MEB 5–8. Sınıf)
  const [graphMode, setGraphMode] = useState<GraphMode>('geometry');
  const [xRange, setXRange] = useState(8);

  const [linM, setLinM] = useState(2);
  const [linN, setLinN] = useState(-2);

  const [coordX, setCoordX] = useState(4);
  const [coordY, setCoordY] = useState(3);

  // 3. Smart Exercises + Progressive Hint Tutor Mode
  const [exGrade, setExGrade] = useState('8. Sınıf (LGS)');
  const [exTopic, setExTopic] = useState<string>(MATH_TOPICS[0]);
  const [exDifficulty, setExDifficulty] = useState<'kolay' | 'orta' | 'zor'>('orta');
  const [exercise, setExercise] = useState<MathExerciseItem>(() =>
    generateDeterministicExercise(MATH_TOPICS[0], 'orta')
  );
  const [exLoading, setExLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [exerciseInputMode, setExerciseInputMode] = useState<'mcq' | 'text'>('mcq');
  const [hintsShown, setHintsShown] = useState(0);
  const [attemptStatus, setAttemptStatus] = useState<'idle' | 'correct' | 'wrong' | 'revealed'>('idle');
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });

  const exerciseMcqOptions = useMemo(
    () => buildExerciseMcqOptions(exercise.acceptedAnswers, exercise.questionText),
    [exercise]
  );

  // Linear equation memoization (MEB 8. Sınıf Doğrusal İlişkiler ve Eğim)
  const linearInfo = useMemo(() => analyzeLinear(linM, linN), [linM, linN]);
  const linearPoints = useMemo(
    () => sampleLinearEquation(linM, linN, -xRange, xRange, 32),
    [linM, linN, xRange]
  );

  const coordinateRegion = useMemo(() => {
    if (coordX === 0 && coordY === 0) return 'Orijin (0, 0)';
    if (coordX === 0) return 'y Ekseni Üzerinde';
    if (coordY === 0) return 'x Ekseni Üzerinde';
    if (coordX > 0 && coordY > 0) return 'I. Bölge (+, +)';
    if (coordX < 0 && coordY > 0) return 'II. Bölge (-, +)';
    if (coordX < 0 && coordY < 0) return 'III. Bölge (-, -)';
    return 'IV. Bölge (+, -)';
  }, [coordX, coordY]);

  const handleSolveProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (problemText.trim().length < 2) return;
    setSolving(true);
    setSolveError('');
    try {
      const response = await fetch('/api/ai/math-solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: problemText,
          topic: solverTopic,
          gradeLevel: solverGrade,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setSolveError(data.error || 'Çözüm oluşturulamadı.');
        return;
      }
      setSolution(data.solution as AIMathSolution);
    } catch {
      setSolveError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
    } finally {
      setSolving(false);
    }
  };

  const handleNewDeterministicExercise = (topic = exTopic, diff = exDifficulty) => {
    setExercise(generateDeterministicExercise(topic, diff));
    setUserAnswer('');
    setHintsShown(0);
    setAttemptStatus('idle');
  };

  const handleNewAIExercise = async () => {
    setExLoading(true);
    try {
      const response = await fetch('/api/ai/math-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel: exGrade,
          topic: exTopic,
          difficulty: exDifficulty,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        notify('error', 'Soru üretilemedi', data.error || 'Deterministik soru üreticisi kullanılıyor.');
        handleNewDeterministicExercise();
        return;
      }
      setExercise({
        topic: exTopic,
        difficulty: exDifficulty,
        ...(data.exercise as Omit<MathExerciseItem, 'topic' | 'difficulty'>),
      });
      setUserAnswer('');
      setHintsShown(0);
      setAttemptStatus('idle');
    } catch {
      notify('error', 'Bağlantı hatası', 'Yapay zekâ servisine ulaşılamadı.');
    } finally {
      setExLoading(false);
    }
  };

  const evaluateExerciseAnswer = async (candidate: string) => {
    if (!candidate.trim() || attemptStatus === 'correct' || attemptStatus === 'revealed') return;
    setUserAnswer(candidate);

    const isRight = checkMathAnswer(candidate, exercise.acceptedAnswers);
    if (isRight) {
      setAttemptStatus('correct');
      setSessionScore((s) => ({ correct: s.correct + 1, total: s.total + 1 }));
      await recordMathAttempt({
        topic: exercise.topic,
        difficulty: exercise.difficulty,
        isCorrect: true,
        hintsUsed: hintsShown,
      });
      notify('success', 'Tebrikler, doğru cevap!', `${exercise.topic} alıştırması kaydedildi.`);
    } else {
      setAttemptStatus('wrong');
      notify('info', 'Tekrar dene', 'Cevabını yeniden değerlendir. İpucu gösterilmiyor.');
    }
  };

  const handleCheckAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    await evaluateExerciseAnswer(userAnswer);
  };

  const handleRevealSolution = async () => {
    setAttemptStatus('revealed');
    setSessionScore((s) => ({ ...s, total: s.total + 1 }));
    await recordMathAttempt({
      topic: exercise.topic,
      difficulty: exercise.difficulty,
      isCorrect: false,
      hintsUsed: exercise.hints.length,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
            Modül 04 · Ortaokul Müfredatı (5–8. Sınıf &amp; LGS) · Görsel İspatlar · 1 Kelime 1 İşlem
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-navy-900 dark:text-white tracking-tight">
            Ortaokul Matematik Dünyası
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Çizimli görsel ispatlar, 1 Kelime 1 İşlem oyunu, matematik hikâyeleri, bilim insanları,
            zekâ soruları, interaktif grafikler ve 6 aşamalı LGS çözüm rehberi.
          </p>
        </div>

        <div
          className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start"
          role="tablist"
        >
          {(
            [
              { id: 'proofs', label: 'Görsel İspatlar' },
              { id: 'game', label: '1 Kelime 1 İşlem' },
              { id: 'encyclopedia', label: 'Hikâyeler, Bilim & Zekâ' },
              { id: 'tests', label: 'Testler (5×10)' },
              { id: 'exercises', label: `LGS Alıştırmaları (${mathAttempts.length})` },
              { id: 'solver', label: '6 Aşamalı Çözücü' },
              { id: 'graphs', label: 'İnteraktif Grafikler' },
            ] as { id: MathTab; label: string }[]
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

      {/* NEW TAB: VISUAL INTERACTIVE PROOFS */}
      {activeTab === 'proofs' && <VisualProofsLab />}

      {/* NEW TAB: 1 KELİME 1 İŞLEM + MENTAL MATH GAME */}
      {activeTab === 'game' && <OneWordOneOperationGame />}

      {/* NEW TAB: STORIES, SCIENTISTS, SCIENCE HISTORY & LOGIC PUZZLES */}
      {activeTab === 'encyclopedia' && <MathEncyclopediaPanel />}

      {/* NEW TAB: 5x10 MULTIPLE CHOICE MATH TEST BANK */}
      {activeTab === 'tests' && (
        <MultiTestQuizEngine
          moduleLabel="Ortaokul Matematik"
          tests={MATH_TEST_PACKS}
          onCompleteTest={async ({ testTitle, correctCount, totalQuestions }) => {
            await recordQuizAttempt({
              moduleName: 'matematik',
              topic: testTitle,
              score: correctCount,
              totalQuestions,
            });
            notify(
              'success',
              'Matematik testi kaydedildi',
              `${totalQuestions} soruda ${correctCount} doğru sonucunuz raporlara işlendi.`
            );
          }}
        />
      )}

      {/* TAB 1: 6-STEP PROBLEM SOLVER */}
      {activeTab === 'solver' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleSolveProblem}
            className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4"
          >
            <h2 className="text-base font-semibold text-navy-900 dark:text-white">
              Matematik Problemini Yazın
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="m-topic" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Konu
                </label>
                <select
                  id="m-topic"
                  value={solverTopic}
                  onChange={(e) => setSolverTopic(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  {MATH_TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="m-grade" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Seviye
                </label>
                <select
                  id="m-grade"
                  value={solverGrade}
                  onChange={(e) => setSolverGrade(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="5. Sınıf (Ortaokul)">5. Sınıf (Ortaokul)</option>
                  <option value="6. Sınıf (Ortaokul)">6. Sınıf (Ortaokul)</option>
                  <option value="7. Sınıf (Ortaokul)">7. Sınıf (Ortaokul)</option>
                  <option value="8. Sınıf (LGS)">8. Sınıf (LGS)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="m-prob" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Soru Metni
              </label>
              <textarea
                id="m-prob"
                rows={4}
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                required
                placeholder="Örn. 3x + 7 = 25 denklemini sağlayan x değerini adım adım bulunuz."
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={solving}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 disabled:opacity-60 cursor-pointer"
            >
              {solving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
              <span>{solving ? 'Adım Adım Çözülüyor...' : '6 Aşamada Çöz'}</span>
            </button>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Örnek Problemler
              </p>
              {SAMPLE_PROBLEMS.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => setProblemText(sample)}
                  className="w-full text-left p-2.5 rounded-lg text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-teal-600/60 cursor-pointer"
                >
                  {sample}
                </button>
              ))}
            </div>
          </form>

          {/* Solution Output */}
          <section className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 min-h-[420px]">
            {solveError && (
              <div className="flex items-start gap-2.5 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{solveError}</span>
              </div>
            )}

            {!solution && !solving && !solveError && (
              <div className="py-16 text-center">
                <Calculator className="w-8 h-8 text-gold-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  1. Analiz · 2. Verilen-İstenen · 3. Yöntem · 4. İşlemler · 5. Doğrulama · 6. Alternatif
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tüm matematiksel ifadeler KaTeX ile düzgün biçimde görüntülenir.
                </p>
              </div>
            )}

            {solution && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-1">
                    1. Soru Analizi
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {solution.analysis}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-semibold text-navy-900 dark:text-gold-400 mb-1.5">
                      2a. Verilenler
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {solution.givens.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-1.5">
                      2b. İstenenler
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {solution.targets.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    3. Çözüm Yöntemi
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{solution.method}</p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    4. Adım Adım Çözüm
                  </h3>
                  {solution.steps.map((st, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2"
                    >
                      <p className="text-xs font-semibold text-navy-900 dark:text-white">
                        Adım {idx + 1}: {st.title}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{st.explanation}</p>
                      {st.latex && (
                        <div className="overflow-x-auto py-1 text-navy-900 dark:text-teal-300">
                          <MathFormula latex={st.latex} display />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-navy-900 text-white space-y-2">
                  <p className="text-xs text-gold-400 font-semibold">Sonuç</p>
                  <div className="overflow-x-auto text-lg">
                    <MathFormula latex={solution.finalAnswerLatex || solution.finalAnswerText} display />
                  </div>
                  <p className="text-xs text-slate-200">{solution.finalAnswerText}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                      5. Sonucun Doğrulanması
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {solution.verification}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-navy-900 dark:text-gold-400 mb-1">
                      6. Alternatif Yaklaşım
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {solution.alternativeMethod}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 2: MIDDLE-SCHOOL INTERACTIVE GRAPHS, COORDINATE SYSTEM & GEOMETRY */}
      {activeTab === 'graphs' && (
        <div className="space-y-5">
          <div className="inline-flex flex-wrap gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {(
              [
                { id: 'geometry', label: 'Prizma, Piramit & Açınım Animasyonları' },
                { id: 'linear', label: 'Doğrusal İlişkiler ve Eğim (y = mx + n)' },
                { id: 'coordinate', label: 'Koordinat Sistemi ve 4 Bölge' },
              ] as { id: GraphMode; label: string }[]
            ).map((gm) => (
              <button
                key={gm.id}
                type="button"
                onClick={() => setGraphMode(gm.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer whitespace-nowrap ${
                  graphMode === gm.id
                    ? 'bg-white dark:bg-slate-800 text-navy-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {gm.label}
              </button>
            ))}
          </div>

          {graphMode === 'linear' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Interactive Linear Graph Stage (Left 8 cols) */}
              <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-base text-navy-900 dark:text-white">
                    <MathFormula latex={linearInfo.latex} />
                  </div>
                  <span className="text-xs font-mono text-slate-500 tabular-nums">
                    8. Sınıf Doğrusal İlişkiler · Aralık: [{-xRange}, {xRange}]
                  </span>
                </div>

                <div className="h-[360px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={linearPoints} margin={{ top: 12, right: 16, left: -12, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} />
                      <XAxis
                        dataKey="x"
                        type="number"
                        domain={[-xRange, xRange]}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                      <ReferenceLine x={0} stroke="#0B1F3A" strokeOpacity={0.65} strokeWidth={1.5} />
                      <ReferenceLine y={0} stroke="#0B1F3A" strokeOpacity={0.65} strokeWidth={1.5} />
                      <Tooltip
                        formatter={(val) => [val ?? '—', 'y']}
                        labelFormatter={(l) => `x = ${l}`}
                      />
                      <Line
                        type="linear"
                        dataKey="y"
                        stroke="#0D9488"
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Live (x, y) Value Table for Middle Schoolers */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">
                    Doğrusal İlişki Değer Tablosu (x → y)
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-center border border-slate-200 dark:border-slate-800 rounded-lg">
                      <thead className="bg-slate-50 dark:bg-slate-950/70">
                        <tr>
                          <th className="py-1.5 px-2 font-semibold text-navy-900 dark:text-white border-r border-slate-200 dark:border-slate-800">
                            x
                          </th>
                          {linearInfo.tablePoints.map((pt) => (
                            <th
                              key={`x-${pt.x}`}
                              className="py-1.5 px-2 font-mono tabular-nums text-slate-700 dark:text-slate-300"
                            >
                              {pt.x}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-slate-200 dark:border-slate-800">
                          <td className="py-1.5 px-2 font-semibold text-teal-700 dark:text-teal-400 border-r border-slate-200 dark:border-slate-800">
                            y
                          </td>
                          {linearInfo.tablePoints.map((pt) => (
                            <td
                              key={`y-${pt.x}`}
                              className="py-1.5 px-2 font-mono font-semibold tabular-nums text-navy-900 dark:text-white"
                            >
                              {pt.y}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Parameter Control Deck (Right 4 cols) */}
              <aside className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <h3 className="text-sm font-semibold text-navy-900 dark:text-white">
                    Doğru Parametreleri
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Eğim (m = Dikey / Yatay)</span>
                      <span className="font-mono font-semibold tabular-nums">{linM}</span>
                    </div>
                    <input
                      type="range"
                      min={-5}
                      max={5}
                      step={0.5}
                      value={linM}
                      onChange={(e) => setLinM(Number(e.target.value))}
                      className="w-full accent-teal-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Sabit Terim / y-Kesen (n)</span>
                      <span className="font-mono font-semibold tabular-nums">{linN}</span>
                    </div>
                    <input
                      type="range"
                      min={-8}
                      max={8}
                      step={1}
                      value={linN}
                      onChange={(e) => setLinN(Number(e.target.value))}
                      className="w-full accent-teal-600"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <p>
                      <strong>Eğim Yönü:</strong> {linearInfo.slopeDirection}
                    </p>
                    <p>
                      <strong>Orijin (0, 0) Durumu:</strong>{' '}
                      {linearInfo.passesOrigin ? 'Orijinden Geçer (n = 0)' : 'Orijinden Geçmez'}
                    </p>
                    <p className="font-mono tabular-nums">
                      <strong>y-Eksenini Kestiği Nokta:</strong> (0, {linearInfo.yIntercept})
                    </p>
                    <p className="font-mono tabular-nums">
                      <strong>x-Eksenini Kestiği Nokta:</strong>{' '}
                      {linearInfo.xIntercept !== null ? `(${linearInfo.xIntercept}, 0)` : 'x Eksenine Paralel'}
                    </p>
                    <p className="font-mono tabular-nums">
                      <strong>Eğim Açısı:</strong> {linearInfo.angleDeg}°
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs mb-1">
                    <span>x Ekseni Aralığı</span>
                    <span className="font-mono tabular-nums">±{xRange}</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={14}
                    step={2}
                    value={xRange}
                    onChange={(e) => setXRange(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>
              </aside>
            </div>
          )}

          {graphMode === 'coordinate' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Interactive Coordinate Plane SVG (Left 7 cols) */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-navy-900 dark:text-white">
                    A({coordX}, {coordY}) Noktası ve Eksen Yansımaları
                  </p>
                  <span className="text-xs font-medium text-teal-700 dark:text-teal-400">
                    {coordinateRegion}
                  </span>
                </div>
                <svg viewBox="0 0 360 360" className="w-full max-w-[380px] h-auto">
                  {/* Grid lines (-8 to +8, center 180,180, step 20px) */}
                  {Array.from({ length: 17 }, (_, i) => i - 8).map((val) => {
                    const pos = 180 + val * 20;
                    return (
                      <g key={val}>
                        <line
                          x1={pos}
                          y1={20}
                          x2={pos}
                          y2={340}
                          stroke={val === 0 ? '#0B1F3A' : '#cbd5e1'}
                          strokeWidth={val === 0 ? 2 : 0.7}
                          strokeOpacity={val === 0 ? 0.8 : 0.5}
                        />
                        <line
                          x1={20}
                          y1={pos}
                          x2={340}
                          y2={pos}
                          stroke={val === 0 ? '#0B1F3A' : '#cbd5e1'}
                          strokeWidth={val === 0 ? 2 : 0.7}
                          strokeOpacity={val === 0 ? 0.8 : 0.5}
                        />
                      </g>
                    );
                  })}

                  {/* Quadrant labels */}
                  <text x="275" y="42" fill="#94a3b8" fontSize="11" fontWeight="600">I. Bölge (+,+)</text>
                  <text x="34" y="42" fill="#94a3b8" fontSize="11" fontWeight="600">II. Bölge (-,+)</text>
                  <text x="34" y="330" fill="#94a3b8" fontSize="11" fontWeight="600">III. Bölge (-,-)</text>
                  <text x="270" y="330" fill="#94a3b8" fontSize="11" fontWeight="600">IV. Bölge (+,-)</text>
                  <text x="344" y="176" fill="#0B1F3A" fontSize="12" fontWeight="700">x</text>
                  <text x="186" y="16" fill="#0B1F3A" fontSize="12" fontWeight="700">y</text>

                  {/* Dashed projections to axes */}
                  <line
                    x1={180 + coordX * 20}
                    y1={180 - coordY * 20}
                    x2={180 + coordX * 20}
                    y2={180}
                    stroke="#0D9488"
                    strokeDasharray="4 3"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={180 + coordX * 20}
                    y1={180 - coordY * 20}
                    x2={180}
                    y2={180 - coordY * 20}
                    stroke="#0D9488"
                    strokeDasharray="4 3"
                    strokeWidth="1.5"
                  />

                  {/* Reflection across x-axis */}
                  <circle
                    cx={180 + coordX * 20}
                    cy={180 + coordY * 20}
                    r="5"
                    fill="#C89B3C"
                    fillOpacity="0.85"
                  />
                  {/* Reflection across y-axis */}
                  <circle
                    cx={180 - coordX * 20}
                    cy={180 - coordY * 20}
                    r="5"
                    fill="#6366f1"
                    fillOpacity="0.85"
                  />
                  {/* Main Point A(x, y) */}
                  <circle
                    cx={180 + coordX * 20}
                    cy={180 - coordY * 20}
                    r="7"
                    fill="#0D9488"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <text
                    x={Math.min(285, Math.max(28, 180 + coordX * 20 + 10))}
                    y={Math.max(30, 180 - coordY * 20 - 10)}
                    fill="#0F766E"
                    fontSize="12"
                    fontWeight="700"
                  >
                    A({coordX}, {coordY})
                  </text>
                </svg>
              </div>

              {/* Coordinate Controls & Analysis (Right 5 cols) */}
              <aside className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <h3 className="text-sm font-semibold text-navy-900 dark:text-white">
                    Koordinat ve Yansıma (8. Sınıf LGS)
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Apsis (x değeri)</span>
                      <span className="font-mono font-semibold tabular-nums">{coordX}</span>
                    </div>
                    <input
                      type="range"
                      min={-7}
                      max={7}
                      step={1}
                      value={coordX}
                      onChange={(e) => setCoordX(Number(e.target.value))}
                      className="w-full accent-teal-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Ordinat (y değeri)</span>
                      <span className="font-mono font-semibold tabular-nums">{coordY}</span>
                    </div>
                    <input
                      type="range"
                      min={-7}
                      max={7}
                      step={1}
                      value={coordY}
                      onChange={(e) => setCoordY(Number(e.target.value))}
                      className="w-full accent-teal-600"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
                  <p>
                    <strong>Bulunduğu Konum:</strong> {coordinateRegion}
                  </p>
                  <p className="font-mono tabular-nums">
                    <strong>x Eksenine Uzaklık (|y|):</strong> {Math.abs(coordY)} birim
                  </p>
                  <p className="font-mono tabular-nums">
                    <strong>y Eksenine Uzaklık (|x|):</strong> {Math.abs(coordX)} birim
                  </p>
                  <p className="font-mono tabular-nums text-amber-700 dark:text-amber-400">
                    <strong>x Eksenine Göre Yansıması (Altın):</strong> ({coordX}, {coordY === 0 ? 0 : -coordY})
                  </p>
                  <p className="font-mono tabular-nums text-indigo-700 dark:text-indigo-400">
                    <strong>y Eksenine Göre Yansıması (Mor):</strong> ({coordX === 0 ? 0 : -coordX}, {coordY})
                  </p>
                </div>
              </aside>
            </div>
          )}

          {graphMode === 'geometry' && <Geometry3DNetLab />}
        </div>
      )}

      {/* TAB 3: SMART EXERCISES WITH PROGRESSIVE HINT TUTOR MODE */}
      {activeTab === 'exercises' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <aside className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-navy-900 dark:text-white">
              Alıştırma Ayarları
            </h2>

            <div>
              <label htmlFor="ex-grade" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Sınıf Seviyesi
              </label>
              <select
                id="ex-grade"
                value={exGrade}
                onChange={(e) => setExGrade(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                <option value="5. Sınıf">5. Sınıf (Ortaokul)</option>
                <option value="6. Sınıf">6. Sınıf (Ortaokul)</option>
                <option value="7. Sınıf">7. Sınıf (Ortaokul)</option>
                <option value="8. Sınıf (LGS)">8. Sınıf (LGS)</option>
              </select>
            </div>

            <div>
              <label htmlFor="ex-topic" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Konu
              </label>
              <select
                id="ex-topic"
                value={exTopic}
                onChange={(e) => {
                  setExTopic(e.target.value);
                  handleNewDeterministicExercise(e.target.value, exDifficulty);
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                {MATH_TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                Zorluk Derecesi
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {(['kolay', 'orta', 'zor'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setExDifficulty(d);
                      handleNewDeterministicExercise(exTopic, d);
                    }}
                    className={`py-2 text-xs font-medium rounded-lg border capitalize cursor-pointer ${
                      exDifficulty === d
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/50 text-navy-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleNewDeterministicExercise()}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Hızlı Yeni Soru Üret</span>
              </button>
              <button
                type="button"
                disabled={exLoading}
                onClick={() => void handleNewAIExercise()}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
              >
                {exLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5 text-teal-600" />}
                <span>{exLoading ? 'Üretiliyor...' : 'Yapay Zekâ ile Özgün Soru Üret'}</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-mono tabular-nums">
              Oturum Başarısı: {sessionScore.correct} / {sessionScore.total} doğru
            </div>
          </aside>

          {/* Interactive Exercise + Progressive Hint Tutor */}
          <section className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
            <div>
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                Öğretici Mod · {exercise.topic} · Zorluk: {exercise.difficulty}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-navy-900 dark:text-white">
                {exercise.questionText}
              </h3>
              {(attemptStatus === 'correct' || attemptStatus === 'revealed') && exercise.expressionLatex && (
                <div className="mt-4 p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 overflow-x-auto text-center text-lg">
                  <MathFormula latex={exercise.expressionLatex} display />
                </div>
              )}
            </div>

            {exerciseMcqOptions.length < 4 && <p className="text-xs text-slate-600 dark:text-slate-300">Bu soru için güvenilir dört çeldirici üretilemediğinden klasik cevap alanı kullanılır.</p>}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setExerciseInputMode('mcq')}\n                  disabled={exerciseMcqOptions.length < 4}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer whitespace-nowrap ${
                    exerciseInputMode === 'mcq'
                      ? 'bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Çoktan Seçmeli (A–D)
                </button>
                <button
                  type="button"
                  onClick={() => setExerciseInputMode('text')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer whitespace-nowrap ${
                    exerciseInputMode === 'text'
                      ? 'bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Klasik Cevap Yazma
                </button>
              </div>
              {attemptStatus === 'wrong' && (
                <button
                  type="button"
                  onClick={() => void handleRevealSolution()}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer whitespace-nowrap"
                >
                  Çözümü Göster
                </button>
              )}
            </div>

            {exerciseInputMode === 'mcq' && exerciseMcqOptions.length === 4 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {exerciseMcqOptions.map((opt, idx) => {
                  const letters = ['A', 'B', 'C', 'D'];
                  const isPicked = userAnswer === opt;
                  const isSolved = attemptStatus === 'correct' || attemptStatus === 'revealed';
                  const isRightOpt = checkMathAnswer(opt, exercise.acceptedAnswers);
                  let cls =
                    'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/60 text-slate-800 dark:text-slate-200 hover:border-teal-500';
                  if (isSolved && isRightOpt) {
                    cls =
                      'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-semibold';
                  } else if (isPicked && attemptStatus === 'wrong') {
                    cls =
                      'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200';
                  }
                  return (
                    <button
                      key={`${opt}-${idx}`}
                      type="button"
                      disabled={isSolved}
                      onClick={() => void evaluateExerciseAnswer(opt)}
                      className={`text-left px-4 py-3 rounded-xl border text-sm font-mono transition-colors flex items-center gap-3 cursor-pointer disabled:cursor-default ${cls}`}
                    >
                      <span className="font-semibold text-xs text-teal-700 dark:text-teal-400">
                        {letters[idx]})
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <form onSubmit={handleCheckAnswer} className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={attemptStatus === 'correct' || attemptStatus === 'revealed'}
                  placeholder="Cevabınızı yazın (ör. 12 veya 3/4)..."
                  className="flex-1 min-w-[200px] px-4 py-2.5 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
                <button
                  type="submit"
                  disabled={!userAnswer.trim() || attemptStatus === 'correct' || attemptStatus === 'revealed'}
                  className="px-5 py-2.5 text-sm font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                >
                  Cevabı Kontrol Et
                </button>
              </form>
            )}

            {/* Correct or Revealed Solution */}
            {(attemptStatus === 'correct' || attemptStatus === 'revealed') && (
              <div className="p-5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {attemptStatus === 'correct' ? 'Doğru Cevap!' : 'Çözüm Açıklaması'}
                  </span>
                </div>
                <div className="text-sm text-slate-900 dark:text-white">
                  Sonuç: <MathFormula latex={exercise.answerDisplayLatex} />
                </div>
                <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {['Soruyu anlama', 'Verilenleri belirleme', 'İstenen sonucu belirleme', 'Yöntemi seçme', 'İşlemleri uygulama', 'Sonucu kontrol etme'].map((title, index) => (
                    <div key={title} className="rounded-lg border border-emerald-200 dark:border-emerald-900 p-3">
                      <strong>{index + 1}. Adım — {title}</strong>
                      <p className="mt-1">{index === 0 ? exercise.questionText : index === 1 ? 'Sorudaki sayıları ve koşulları ayırt et.' : index === 2 ? 'Soruda istenen büyüklüğü belirle.' : index === 3 ? 'Uygun matematiksel işlemi veya bağıntıyı seç.' : index === 4 ? exercise.fullSolution : 'Bulduğun cevabın soru koşullarını sağlayıp sağlamadığını kontrol et.'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
