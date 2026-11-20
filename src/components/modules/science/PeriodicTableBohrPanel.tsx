import React, { useMemo, useState } from 'react';
import { Atom, CheckCircle2, Sparkles, XCircle } from 'lucide-react';
import {
  PERIODIC_ELEMENTS,
  type ElementCategory,
  type PeriodicElement,
} from '../../../data/scienceRichData';

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

export function PeriodicTableBohrPanel() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('C');
  const [categoryFilter, setCategoryFilter] = useState<'Tümü' | ElementCategory>('Tümü');
  const [quizGuessGroup, setQuizGuessGroup] = useState('');
  const [quizFeedback, setQuizFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const selected: PeriodicElement = useMemo(
    () => PERIODIC_ELEMENTS.find((el) => el.symbol === selectedSymbol) ?? PERIODIC_ELEMENTS[0],
    [selectedSymbol]
  );

  const neutronCount = selected.massNumber - selected.atomicNumber;

  const handleSelectElement = (sym: string) => {
    setSelectedSymbol(sym);
    setQuizGuessGroup('');
    setQuizFeedback('idle');
  };

  const handleCheckGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = quizGuessGroup.trim().toLocaleUpperCase('tr-TR').replace(/\s+/g, '');
    if (!cleaned) return;
    setQuizFeedback(cleaned === selected.group ? 'correct' : 'wrong');
  };

  return (
    <div className="space-y-6">
      {/* Header & Category Filter */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
              8. Sınıf LGS Periyodik Sistem · İlk 20 Element ve Bohr Atom Modeli
            </p>
            <h2 className="mt-0.5 text-lg font-semibold text-navy-900 dark:text-white">
              Etkileşimli Periyodik Tablo (1A – 8A)
            </h2>
          </div>

          <div className="control-grid gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 8-Column Main Group Periodic Grid */}
        <div className="overflow-x-auto pb-1">
          <div className="min-w-[640px] space-y-2">
            <div className="grid grid-cols-8 gap-2 text-center text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
              {['1A', '2A', '3A', '4A', '5A', '6A', '7A', '8A'].map((grp) => (
                <div key={grp}>{grp}</div>
              ))}
            </div>

            {[1, 2, 3, 4].map((periodNum) => (
              <div key={periodNum} className="grid grid-cols-8 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((colNum) => {
                  const el = PERIODIC_ELEMENTS.find(
                    (item) => item.period === periodNum && item.column === colNum
                  );
                  if (!el) {
                    return <div key={`${periodNum}-${colNum}`} className="h-[68px]" />;
                  }
                  const dimmed = categoryFilter !== 'Tümü' && el.category !== categoryFilter;
                  const isActive = el.symbol === selected.symbol;
                  return (
                    <button
                      key={el.symbol}
                      type="button"
                      onClick={() => handleSelectElement(el.symbol)}
                      className={`h-[68px] p-2 rounded-lg border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        isActive
                          ? 'border-navy-900 bg-navy-900 text-white dark:border-teal-400 dark:bg-teal-600 ring-2 ring-teal-500/40'
                          : `${CATEGORY_CELL_COLORS[el.category]} text-navy-900 dark:text-white hover:border-navy-900 dark:hover:border-teal-400`
                      } ${dimmed ? 'opacity-25' : 'opacity-100'}`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono tabular-nums">
                        <span>{el.atomicNumber}</span>
                        <span className={isActive ? 'text-gold-300 dark:text-white/80' : 'text-slate-500 dark:text-slate-400'}>
                          {el.stateAtRoom}
                        </span>
                      </div>
                      <p className="text-base font-bold leading-none">{el.symbol}</p>
                      <p className={`text-[10px] truncate ${isActive ? 'text-slate-200' : 'text-slate-600 dark:text-slate-300'}`}>
                        {el.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Selected Element Interactive Bohr Model + Details */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Bohr Atom Visualizer */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-medium text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
              <Atom className="w-4 h-4" />
              <span>Bohr Atom Modeli</span>
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              Dizilim: {selected.shells.join(' – ')}
            </span>
          </div>

          <svg viewBox="0 0 260 260" className="w-full max-w-[250px] h-auto my-3" role="img" aria-label={`${selected.name} Bohr atom modeli`}>
            {/* Shells & Electrons */}
            {selected.shells.map((electronCount, shellIdx) => {
              const radius = 38 + shellIdx * 24;
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
                        r="4.5"
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
              {selected.atomicNumber}p⁺ {neutronCount}n⁰
            </text>
          </svg>

          <div className="w-full grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] text-slate-500">Proton</p>
              <p className="font-mono font-semibold tabular-nums">{selected.atomicNumber}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] text-slate-500">Nötron</p>
              <p className="font-mono font-semibold tabular-nums">{neutronCount}</p>
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
                  {selected.category} · {selected.period}. Periyot · {selected.group} Grubu · Oda Koşulunda {selected.stateAtRoom}
                </p>
                <h3 className="text-2xl font-semibold text-navy-900 dark:text-white mt-0.5">
                  {selected.atomicNumber}. {selected.name} ({selected.symbol})
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                Kütle No: {selected.massNumber}
              </span>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {selected.summary}
            </p>

            <div>
              <p className="text-xs font-semibold text-navy-900 dark:text-white mb-2">
                Günlük Yaşamda ve Teknolojide Kullanımı
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {selected.everydayUses.map((use) => (
                  <li key={use} className="flex items-start gap-2">
                    <span className="text-teal-600 dark:text-teal-400 font-bold">•</span>
                    <span>{use}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <strong className="text-navy-900 dark:text-white">İlginç Bilim Notu:</strong> {selected.funFact}
            </div>
          </div>

          {/* Interactive Mini Check: Group from Shells */}
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
                  <span>Doğru! {selected.group} Grubu ({selected.period}. Periyot).</span>
                </span>
              )}
              {quizFeedback === 'wrong' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 dark:text-red-400">
                  <XCircle className="w-4 h-4" />
                  <span>
                    İpucu: {selected.symbol === 'He' ? 'Helyum istisnadır (2 elektronla 8A soygazı!).' : `Son katmanda ${selected.shells[selected.shells.length - 1]} elektron var → ${selected.group}`}
                  </span>
                </span>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
