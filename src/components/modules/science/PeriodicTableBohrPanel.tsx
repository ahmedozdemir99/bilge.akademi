import React, { useMemo, useState } from 'react';
import { FULL_PERIODIC_ELEMENTS } from '../../../data/fullPeriodicElements';
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
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
              8. Sınıf LGS · 118 Elementin Tamamı · İlk 20 Element için Bohr Atom Modeli
            </p>
            <h2 className="mt-0.5 text-lg font-semibold text-navy-900 dark:text-white">
              Tam Periyodik Tablo (1–18. Gruplar)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
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

        <p className="text-xs text-slate-500 dark:text-slate-400">Tablonun tamamını görmek için yatay kaydırın. İlk 20 elemente dokunarak Bohr modelini inceleyebilirsiniz.</p>
        <div className="flex flex-wrap gap-2 text-[11px] font-medium">
          {[['Metal','bg-sky-300 text-sky-950'],['Yarı Metal','bg-amber-300 text-amber-950'],['Ametal','bg-emerald-300 text-emerald-950'],['Soygaz','bg-violet-300 text-violet-950'],['Geçiş Metali','bg-rose-300 text-rose-950'],['Lantanit','bg-orange-300 text-orange-950'],['Aktinit','bg-fuchsia-300 text-fuchsia-950']].map(([label, color]) => <span key={label} className={`rounded-md px-2 py-1 ${color}`}>{label}</span>)}
        </div>
        <div className="overflow-x-auto pb-3" aria-label="118 elementli tam periyodik tablo">
          <div className="min-w-[630px] max-w-[820px] mx-auto space-y-0.5">
            <div className="grid grid-cols-18 gap-0.5 text-center text-[9px] font-semibold text-slate-500">
              {Array.from({length:18},(_,i)=><span key={i}>{i+1}</span>)}
            </div>
            {[1,2,3,4,5,6,7,8,9].map((period) => (
              <div key={period} className="grid grid-cols-18 gap-0.5">
                {Array.from({length:18},(_,i)=>{
                  const item=FULL_PERIODIC_ELEMENTS.find(el=>el.p===period && el.g===i+1);
                  if(!item) return <div key={i} className="h-[39px]" />;
                  const detailed=PERIODIC_ELEMENTS.find(el=>el.atomicNumber===item.n);
                  const category = detailed?.category ?? ([8,9].includes(period) ? (period===8?'Lantanit':'Aktinit') : item.g>=3&&item.g<=12?'Geçiş Metali' : [2,10,18,36,54,86,118].includes(item.n)?'Soygaz' : [5,14,32,33,51,52].includes(item.n)?'Yarı Metal' : [1,6,7,8,9,15,16,17,34,35,53,85,117].includes(item.n)?'Ametal':'Metal');
                  const palette:Record<string,string>={
                    'Metal':'bg-sky-200 border-sky-500 text-sky-950 dark:bg-sky-900 dark:text-sky-50',
                    'Yarı Metal':'bg-amber-200 border-amber-500 text-amber-950 dark:bg-amber-900 dark:text-amber-50',
                    'Ametal':'bg-emerald-200 border-emerald-500 text-emerald-950 dark:bg-emerald-900 dark:text-emerald-50',
                    'Soygaz':'bg-violet-200 border-violet-500 text-violet-950 dark:bg-violet-900 dark:text-violet-50',
                    'Geçiş Metali':'bg-rose-200 border-rose-500 text-rose-950 dark:bg-rose-900 dark:text-rose-50',
                    'Lantanit':'bg-orange-200 border-orange-500 text-orange-950 dark:bg-orange-900 dark:text-orange-50',
                    'Aktinit':'bg-fuchsia-200 border-fuchsia-500 text-fuchsia-950 dark:bg-fuchsia-900 dark:text-fuchsia-50'
                  };
                  const dimmed=categoryFilter!=='Tümü' && category!==categoryFilter;
                  const cls=`h-[39px] min-w-0 p-0 rounded-[3px] border flex flex-col items-center justify-center transition-all ${palette[category]} ${dimmed?'opacity-25':'opacity-100'} ${detailed?'cursor-pointer hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2':'cursor-default'} ${selected.atomicNumber===item.n?'ring-2 ring-offset-1 ring-slate-900 dark:ring-white':''}`;
                  const inner=<><span className="text-[7px] leading-none">{item.n}</span><strong className="text-[11px] leading-tight">{item.s}</strong><span className="text-[6px] leading-tight truncate w-full text-center" title={item.name}>{item.name}</span></>;
                  return detailed?<button key={item.n} type="button" title={`${item.n}. ${item.name} — ${category}`} aria-label={`${item.n}. ${item.name}`} onClick={()=>handleSelectElement(item.s)} className={cls}>{inner}</button>:<div key={item.n} title={`${item.n}. ${item.name} — ${category}`} className={cls}>{inner}</div>;
                })}
              </div>
            ))}
            <p className="text-[11px] text-slate-500 pt-1">Alt iki sıra: Lantanitler (58–71) ve Aktinitler (90–103). İlk 20 elementin ayrıntılı Bohr modeli aşağıdadır.</p>
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

          <svg viewBox="0 0 260 260" className="w-full max-w-[200px] h-auto my-3" role="img" aria-label={`${selected.name} Bohr atom modeli`}>
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
