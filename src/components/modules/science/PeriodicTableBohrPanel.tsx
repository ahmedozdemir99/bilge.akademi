import React, { useMemo, useState } from 'react';
import { Atom, CheckCircle2, Sparkles, XCircle } from 'lucide-react';
import type { ElementCategory } from '../../../data/scienceRichData';
import { FULL_PERIODIC_TABLE } from '../../../data/periodicTableData';

const CATEGORY_FILTERS: ('Tümü' | ElementCategory)[] = [
  'Tümü',
  'Metal',
  'Yarı Metal',
  'Ametal',
  'Soygaz',
];

const CATEGORY_CELL_COLORS: Record<ElementCategory, string> = {
  Metal: 'border-sky-300 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30',
  'Yarı Metal': 'border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30',
  Ametal: 'border-teal-300 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/30',
  Soygaz: 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/30',
};

const GROUPS = Array.from({ length: 18 }, (_, index) => index + 1);
const DETACHED_SERIES = [
  { name: 'Lantanitler', first: 57, last: 71, period: 6, row: 9 },
  { name: 'Aktinitler', first: 89, last: 103, period: 7, row: 10 },
];

export function PeriodicTableBohrPanel() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('C');
  const [categoryFilter, setCategoryFilter] = useState<'Tümü' | ElementCategory>('Tümü');
  const [quizGuessGroup, setQuizGuessGroup] = useState('');
  const [quizFeedback, setQuizFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const selected = useMemo(
    () => FULL_PERIODIC_TABLE.find((element) => element.symbol === selectedSymbol) ?? FULL_PERIODIC_TABLE[0],
    [selectedSymbol]
  );
  const lesson = selected.lesson;
  const neutronCount = lesson ? lesson.massNumber - selected.atomicNumber : null;
  const shellSpacing = Math.min(24, 79 / Math.max(1, selected.shells.length - 1));
  const groupLabel = selected.group === null
    ? DETACHED_SERIES.find((series) => series.period === selected.period)?.name
    : lesson ? `${selected.group}. Grup (${lesson.group})` : `${selected.group}. Grup`;

  const handleSelectElement = (sym: string) => {
    setSelectedSymbol(sym);
    setQuizGuessGroup('');
    setQuizFeedback('idle');
  };

  const handleCheckGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = quizGuessGroup.trim().toLocaleUpperCase('tr-TR').replace(/\s+/g, '');
    if (!cleaned) return;
    const isCorrect = cleaned === lesson?.group || cleaned === String(selected.group);
    setQuizFeedback(isCorrect ? 'correct' : 'wrong');
  };

  return (
    <div className="space-y-6">
      {/* Header & Category Filter */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-5 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-navy-900 dark:text-white">
              Etkileşimli Periyodik Tablo
            </h2>
            <p id="periodic-table-help" className="text-xs text-slate-600 dark:text-slate-300">
              118 element · Ayrıntılar için bir element seçin.
              <span className="md:hidden"> Tablonun devamı için yana kaydırabilirsiniz.</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-1">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                aria-pressed={categoryFilter === cat}
                className={`border px-2 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat
                    ? 'border-navy-900 dark:border-teal-400 bg-navy-900 dark:bg-teal-900 text-white'
                    : cat === 'Tümü' ? 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200' : CATEGORY_CELL_COLORS[cat]
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div
          role="region"
          aria-label="118 elementli periyodik tablo"
          aria-describedby="periodic-table-help"
          tabIndex={0}
          className="max-w-full overflow-x-auto px-0.5 pb-2 focus-visible:outline-2 focus-visible:outline-teal-600"
        >
          <div className="mx-auto grid w-full min-w-[29rem] max-w-[49rem] grid-cols-[repeat(18,minmax(0,1fr))] gap-0.5 sm:gap-1">
            {GROUPS.map((group) => (
              <span key={group} style={{ gridColumn: group, gridRow: 1 }} className="text-center text-[10px] tabular-nums text-slate-600 dark:text-slate-300">
                {group}
              </span>
            ))}
            {DETACHED_SERIES.map((series) => (
              <React.Fragment key={series.name}>
                <span
                  title={series.name}
                  style={{ gridColumn: 3, gridRow: series.period + 1 }}
                  className="grid place-items-center rounded border border-dashed border-slate-300 text-[8px] font-semibold tabular-nums text-slate-600 dark:border-slate-600 dark:text-slate-300"
                >
                  {series.first}–{series.last}
                </span>
                <span
                  title={series.name}
                  style={{ gridColumn: '1 / span 2', gridRow: series.row }}
                  className="self-center text-center text-[9px] font-medium leading-none text-slate-600 dark:text-slate-300"
                >
                  {series.name}
                </span>
              </React.Fragment>
            ))}
            {FULL_PERIODIC_TABLE.map((element) => {
              const series = element.group === null
                ? DETACHED_SERIES.find(({ first, last }) => element.atomicNumber >= first && element.atomicNumber <= last)
                : undefined;
              const active = element.symbol === selected.symbol;
              const dimmed = !active && categoryFilter !== 'Tümü' && element.category !== categoryFilter;

              return (
                <button
                  key={element.symbol}
                  type="button"
                  title={element.name}
                  aria-label={`${element.atomicNumber}. ${element.name} (${element.symbol})`}
                  aria-pressed={active}
                  onClick={() => handleSelectElement(element.symbol)}
                  style={{
                    gridColumn: series ? element.atomicNumber - series.first + 3 : element.group ?? undefined,
                    gridRow: series ? series.row : element.period + 1,
                  }}
                  className={`flex h-8 min-w-0 cursor-pointer flex-col items-center justify-center rounded border text-center leading-none sm:h-9 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-teal-600 ${
                    active
                      ? 'border-navy-900 bg-navy-900 text-white dark:border-teal-400 dark:bg-teal-900'
                      : `${CATEGORY_CELL_COLORS[element.category]} text-navy-900 hover:border-navy-900 dark:text-white dark:hover:border-teal-400`
                  } ${dimmed ? 'opacity-30' : ''}`}
                >
                  <span className="text-[9px] tabular-nums">{element.atomicNumber}</span>
                  <span className="mt-0.5 text-xs font-bold sm:text-sm">{element.symbol}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Selected Element Interactive Bohr Model + Details */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Bohr Atom Visualizer */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-between">
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
              <Atom className="w-4 h-4" />
              <span>Bohr Atom Modeli</span>
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              Dizilim{selected.predictedShells ? ' (öngörülen)' : ''}: {selected.shells.join(' – ')}
            </span>
          </div>

          <svg viewBox="0 0 260 260" className="w-full max-w-[250px] h-auto my-3" role="img" aria-label={`${selected.name} Bohr atom modeli`}>
            {/* Shells & Electrons */}
            {selected.shells.map((electronCount, shellIdx) => {
              const radius = 38 + shellIdx * shellSpacing;
              return (
                <g key={shellIdx}>
                  <circle
                    cx="130"
                    cy="130"
                    r={radius}
                    fill="none"
                    stroke="#94A3B8"
                    strokeOpacity="0.45"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  {Array.from({ length: electronCount }).map((_, eIdx) => {
                    const angle = (eIdx / electronCount) * Math.PI * 2 - Math.PI / 2;
                    const cx = 130 + Math.cos(angle) * radius;
                    const cy = 130 + Math.sin(angle) * radius;
                    return (
                      <circle
                        key={eIdx}
                        cx={cx}
                        cy={cy}
                        r={selected.shells.length > 4 ? 3 : 4.5}
                        fill={shellIdx === selected.shells.length - 1 ? '#0D9488' : '#C89B3C'}
                      />
                    );
                  })}
                </g>
              );
            })}

            {/* Nucleus */}
            <circle cx="130" cy="130" r="22" fill="#0B1F3A" />
            <text x="130" y="128" textAnchor="middle" className="fill-white text-[13px] font-bold">
              {selected.symbol}
            </text>
            <text x="130" y="141" textAnchor="middle" className="fill-gold-400 text-[9px] font-mono">
              {selected.atomicNumber}p⁺{neutronCount !== null && ` ${neutronCount}n⁰`}
            </text>
          </svg>

          <div className="w-full grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] text-slate-500">Proton</p>
              <p className="font-mono font-semibold tabular-nums">{selected.atomicNumber}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] text-slate-500">{neutronCount === null ? 'Elektron' : 'Nötron'}</p>
              <p className="font-mono font-semibold tabular-nums">{neutronCount ?? selected.atomicNumber}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] text-slate-500">Katman</p>
              <p className="font-mono font-semibold tabular-nums">{selected.shells.length}</p>
            </div>
          </div>
        </div>

        {/* Element Information & Mini Check */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                  {selected.category} · {selected.period}. Periyot · {groupLabel}
                </p>
                <h3 className="text-2xl font-semibold text-navy-900 dark:text-white mt-0.5">
                  {selected.atomicNumber}. {selected.name} ({selected.symbol})
                </h3>
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-300">
                Oda koşulundaki hâli: {selected.phase ?? 'belirsiz'}
              </span>
              {lesson && (
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  Kütle No: {lesson.massNumber}
                </span>
              )}
            </div>

            {lesson && (
              <>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {lesson.summary}
                </p>

                <div>
                  <p className="text-xs font-semibold text-navy-900 dark:text-white mb-2">
                    Günlük Yaşamda ve Teknolojide Kullanımı
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {lesson.everydayUses.map((use) => (
                      <li key={use} className="flex items-start gap-2">
                        <span className="text-teal-600 dark:text-teal-400 font-bold">•</span>
                        <span>{use}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <strong className="text-navy-900 dark:text-white">İlginç Bilim Notu:</strong> {lesson.funFact}
                </div>
              </>
            )}
          </div>

          {/* Interactive Mini Check: Group from Shells */}
          {lesson && (
            <form onSubmit={handleCheckGroup} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label htmlFor="bohr-group-check" className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                Hızlı Kural Kontrolü: Katman dizilimi <strong className="font-mono">{selected.shells.join(' – ')}</strong> olan {selected.name} hangi A grubundadır?
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  id="bohr-group-check"
                  type="text"
                  value={quizGuessGroup}
                  onChange={(e) => {
                    setQuizGuessGroup(e.target.value);
                    setQuizFeedback('idle');
                  }}
                  placeholder="Örn: 4A veya 8A"
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 w-40"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Kontrol Et</span>
                </button>
                {quizFeedback === 'correct' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Doğru! {lesson.group} Grubu ({selected.period}. Periyot).</span>
                  </span>
                )}
                {quizFeedback === 'wrong' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 dark:text-red-400">
                    <XCircle className="w-4 h-4" />
                    <span>
                      İpucu: {selected.symbol === 'He' ? 'Helyum istisnadır (2 elektronla 8A soygazı!).' : `Son katmanda ${selected.shells[selected.shells.length - 1]} elektron var → ${lesson.group}`}
                    </span>
                  </span>
                )}
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
