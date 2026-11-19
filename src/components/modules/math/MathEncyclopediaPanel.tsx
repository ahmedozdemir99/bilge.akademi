import { useState } from 'react';
import { BookOpen, Brain, CheckCircle2, Compass, Lightbulb, Users } from 'lucide-react';
import {
  LOGIC_PUZZLES,
  MATH_STORIES_ANECDOTES,
  MATHEMATICIANS,
  SCIENCE_HISTORY_TIMELINE,
} from '../../../data/mathRichData';
import { MathFormula } from '../../ui/MathFormula';

type EncTab = 'stories' | 'scientists' | 'timeline' | 'puzzles';

export function MathEncyclopediaPanel() {
  const [subTab, setSubTab] = useState<EncTab>('stories');
  const [hintSteps, setHintSteps] = useState<Record<string, number>>({});
  const [revealedPuzzles, setRevealedPuzzles] = useState<Record<string, boolean>>({});
  const [solvedPuzzles, setSolvedPuzzles] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-5">
      <div className="inline-flex flex-wrap gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {(
          [
            { id: 'stories', label: `Hikâyeler ve Anekdotlar (${MATH_STORIES_ANECDOTES.length})`, icon: BookOpen },
            { id: 'scientists', label: `Matematik Bilim İnsanları (${MATHEMATICIANS.length})`, icon: Users },
            { id: 'timeline', label: `Bilim Tarihi ve İcatlar (${SCIENCE_HISTORY_TIMELINE.length})`, icon: Compass },
            { id: 'puzzles', label: `Zekâ ve Mantık Soruları (${LOGIC_PUZZLES.length})`, icon: Brain },
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer whitespace-nowrap transition-colors ${
                subTab === t.id
                  ? 'bg-white dark:bg-slate-800 text-navy-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* STORIES & ANECDOTES */}
      {subTab === 'stories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {MATH_STORIES_ANECDOTES.map((item) => (
            <article
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                  {item.tag} · {item.era}
                </p>
                <h3 className="text-lg font-semibold text-navy-900 dark:text-white leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.summary}</p>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {item.story}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                {item.formulaLatex && (
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center overflow-x-auto">
                    <MathFormula latex={item.formulaLatex} />
                  </div>
                )}
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  <strong className="text-navy-900 dark:text-gold-400">Matematiksel Ders:</strong>{' '}
                  {item.mathTakeaway}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* MATHEMATICIANS */}
      {subTab === 'scientists' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {MATHEMATICIANS.map((sci) => (
            <article
              key={sci.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <p className="text-xs font-mono text-teal-700 dark:text-teal-400">
                  {sci.lifespan} · {sci.origin}
                </p>
                <h3 className="text-base font-semibold text-navy-900 dark:text-white">{sci.name}</h3>
                <p className="text-xs font-medium text-gold-600 dark:text-gold-400">{sci.specialty}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{sci.bio}</p>
                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 dark:text-slate-300 pt-1">
                  {sci.keyDiscoveries.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <p className="text-slate-600 dark:text-slate-300">
                  <strong>Ortaokul Bağlantısı:</strong> {sci.middleSchoolLink}
                </p>
                <p className="font-display italic text-slate-700 dark:text-slate-200">
                  “{sci.quote}”
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* SCIENCE HISTORY & INVENTIONS */}
      {subTab === 'timeline' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
          {SCIENCE_HISTORY_TIMELINE.map((m) => (
            <div key={m.id} className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                <p className="font-mono text-sm font-semibold text-teal-700 dark:text-teal-400 tabular-nums">
                  {m.year}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {m.inventorOrCulture}
                </p>
              </div>
              <div className="md:col-span-9 space-y-1.5">
                <h3 className="text-base font-semibold text-navy-900 dark:text-white">{m.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {m.description}
                </p>
                <p className="text-xs text-navy-900 dark:text-gold-400">
                  <strong>Günümüze Etkisi:</strong> {m.impact}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LOGIC & BRAINTEASER PUZZLES */}
      {subTab === 'puzzles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>İpuçlarını sırayla açarak kendi çözümünüzü geliştirin, ardından cevabı kontrol edin.</span>
            <span className="font-mono font-semibold text-teal-700 dark:text-teal-400 tabular-nums">
              Çözülen: {Object.values(solvedPuzzles).filter(Boolean).length} / {LOGIC_PUZZLES.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {LOGIC_PUZZLES.map((puz) => {
              const shownHints = hintSteps[puz.id] ?? 0;
              const isRevealed = Boolean(revealedPuzzles[puz.id]);
              const isSolved = Boolean(solvedPuzzles[puz.id]);

              return (
                <article
                  key={puz.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                        {puz.category} · Zorluk: {puz.difficulty}
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-navy-900 dark:text-white">
                        {puz.title}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSolvedPuzzles((prev) => ({ ...prev, [puz.id]: !prev[puz.id] }))
                      }
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer whitespace-nowrap ${
                        isSolved
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isSolved ? 'Çözdüm' : 'İşaretle'}</span>
                    </button>
                  </div>

                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {puz.question}
                  </p>

                  {shownHints > 0 && (
                    <div className="space-y-2">
                      {puz.hints.slice(0, shownHints).map((h, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-950 dark:text-amber-200"
                        >
                          <strong>{i + 1}. İpucu:</strong> {h}
                        </div>
                      ))}
                    </div>
                  )}

                  {isRevealed && (
                    <div className="p-4 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-1.5 text-xs">
                      <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                        Cevap: {puz.answer}
                      </p>
                      <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                        {puz.explanation}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {shownHints < puz.hints.length && (
                      <button
                        type="button"
                        onClick={() =>
                          setHintSteps((prev) => ({
                            ...prev,
                            [puz.id]: Math.min(puz.hints.length, (prev[puz.id] ?? 0) + 1),
                          }))
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span>İpucu Al ({shownHints}/{puz.hints.length})</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setRevealedPuzzles((prev) => ({ ...prev, [puz.id]: !prev[puz.id] }))
                      }
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 cursor-pointer"
                    >
                      {isRevealed ? 'Çözümü Gizle' : 'Çözümü Göster'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
