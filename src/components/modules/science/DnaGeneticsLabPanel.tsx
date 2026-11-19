import React, { useMemo, useState } from 'react';
import { CheckCircle2, Dna, RefreshCw, XCircle } from 'lucide-react';
import { GENETIC_TRAITS } from '../../../data/scienceRichData';

type GenotypeChoice = 'DD' | 'Dd' | 'dd';
type BaseLetter = 'A' | 'T' | 'G' | 'C';

const COMPLEMENT: Record<BaseLetter, BaseLetter> = {
  A: 'T',
  T: 'A',
  G: 'C',
  C: 'G',
};

const BASE_LABELS: Record<BaseLetter, string> = {
  A: 'Adenin',
  T: 'Timin',
  G: 'Guanin',
  C: 'Sitozin',
};

const KEDIGEN_HIERARCHY = [
  { key: 'K', title: 'Kromozom', detail: 'DNA’nın özel proteinlerle sarılarak oluşturduğu en büyük kalıtsal yapıdır (İnsanda 46 kromozom).' },
  { key: 'D', title: 'DNA', detail: 'Hücrenin yönetici molekülüdür; çift zincirli sarmal yapıdadır ve genetik bilgiyi taşır.' },
  { key: 'G', title: 'Gen', detail: 'DNA üzerinde göz rengi, kan grubu gibi belirli bir kalıtsal özelliği kodlayan görev birimidir.' },
  { key: 'N', title: 'Nükleotid', detail: 'DNA’nın en küçük yapı birimidir: Fosfat + Deoksiriboz Şekeri + Organik Baz (A, T, G, C).' },
];

function generateRandomStrand(): BaseLetter[] {
  const pool: BaseLetter[] = ['A', 'T', 'G', 'C'];
  return Array.from({ length: 8 }, () => pool[Math.floor(Math.random() * pool.length)]);
}

export function DnaGeneticsLabPanel() {
  // --- Mendel Punnett Square State ---
  const [traitId, setTraitId] = useState(GENETIC_TRAITS[0].id);
  const [parent1, setParent1] = useState<GenotypeChoice>('Dd');
  const [parent2, setParent2] = useState<GenotypeChoice>('Dd');

  const trait = useMemo(
    () => GENETIC_TRAITS.find((t) => t.id === traitId) ?? GENETIC_TRAITS[0],
    [traitId]
  );

  const formatGenotype = (g: GenotypeChoice) => {
    const D = trait.dominantSymbol;
    const d = trait.recessiveSymbol;
    if (g === 'DD') return `${D}${D}`;
    if (g === 'Dd') return `${D}${d}`;
    return `${d}${d}`;
  };

  const punnett = useMemo(() => {
    const D = trait.dominantSymbol;
    const d = trait.recessiveSymbol;
    const alleles1 = parent1 === 'DD' ? [D, D] : parent1 === 'Dd' ? [D, d] : [d, d];
    const alleles2 = parent2 === 'DD' ? [D, D] : parent2 === 'Dd' ? [D, d] : [d, d];

    const cells: { code: string; isDominant: boolean; isHomozygous: boolean }[] = [];
    for (const a1 of alleles1) {
      for (const a2 of alleles2) {
        const isDom = a1 === D || a2 === D;
        const code = a1 === d && a2 === D ? `${D}${d}` : `${a1}${a2}`;
        cells.push({
          code,
          isDominant: isDom,
          isHomozygous: a1 === a2,
        });
      }
    }

    const domCount = cells.filter((c) => c.isDominant).length;
    const recCount = 4 - domCount;
    const homoDom = cells.filter((c) => c.code === `${D}${D}`).length;
    const hetero = cells.filter((c) => c.code === `${D}${d}`).length;
    const homoRec = cells.filter((c) => c.code === `${d}${d}`).length;

    return {
      alleles1,
      alleles2,
      cells,
      domPct: domCount * 25,
      recPct: recCount * 25,
      homoDomPct: homoDom * 25,
      heteroPct: hetero * 25,
      homoRecPct: homoRec * 25,
    };
  }, [parent1, parent2, trait]);

  // --- Interactive DNA Complementary Strand Game ---
  const [templateStrand, setTemplateStrand] = useState<BaseLetter[]>(['A', 'G', 'T', 'C', 'A', 'C', 'G', 'T']);
  const [userStrand, setUserStrand] = useState<(BaseLetter | null)[]>(Array(8).fill(null));
  const [checkedDna, setCheckedDna] = useState(false);

  const dnaScore = useMemo(() => {
    return templateStrand.reduce(
      (sum, base, idx) => sum + (userStrand[idx] === COMPLEMENT[base] ? 1 : 0),
      0
    );
  }, [templateStrand, userStrand]);

  const handleNewStrand = () => {
    setTemplateStrand(generateRandomStrand());
    setUserStrand(Array(8).fill(null));
    setCheckedDna(false);
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: MENDEL PUNNETT SQUARE SIMULATOR */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
              8. Sınıf Kalıtım Laboratuvarı · Gregor Mendel Çaprazlama Simülatörü
            </p>
            <h2 className="mt-0.5 text-lg font-semibold text-navy-900 dark:text-white">
              İnteraktif Punnett Karesi ve Olasılık Hesaplayıcı
            </h2>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {GENETIC_TRAITS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTraitId(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer ${
                  traitId === item.id
                    ? 'border-navy-900 bg-navy-900 text-white dark:border-teal-500 dark:bg-teal-600'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Parent Selectors + Punnett Grid */}
          <div className="lg:col-span-7 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="text-xs font-semibold text-navy-900 dark:text-white">1. Ata Genotipi</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['DD', 'Dd', 'dd'] as GenotypeChoice[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setParent1(g)}
                      className={`py-2 rounded-lg text-xs font-mono font-semibold border cursor-pointer ${
                        parent1 === g
                          ? 'border-navy-900 bg-navy-900 text-white dark:border-teal-500 dark:bg-teal-600'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {formatGenotype(g)}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {parent1 === 'DD'
                    ? 'Homozigot (Saf) Baskın'
                    : parent1 === 'Dd'
                      ? 'Heterozigot (Melez) Baskın'
                      : 'Homozigot (Saf) Çekinik'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="text-xs font-semibold text-navy-900 dark:text-white">2. Ata Genotipi</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['DD', 'Dd', 'dd'] as GenotypeChoice[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setParent2(g)}
                      className={`py-2 rounded-lg text-xs font-mono font-semibold border cursor-pointer ${
                        parent2 === g
                          ? 'border-navy-900 bg-navy-900 text-white dark:border-teal-500 dark:bg-teal-600'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {formatGenotype(g)}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {parent2 === 'DD'
                    ? 'Homozigot (Saf) Baskın'
                    : parent2 === 'Dd'
                      ? 'Heterozigot (Melez) Baskın'
                      : 'Homozigot (Saf) Çekinik'}
                </p>
              </div>
            </div>

            {/* 2x2 Visual Punnett Table */}
            <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto">
              <div className="flex items-center justify-center text-xs font-mono font-bold text-slate-400">
                {formatGenotype(parent1)} × {formatGenotype(parent2)}
              </div>
              {punnett.alleles2.map((a, i) => (
                <div
                  key={`top-${i}`}
                  className="py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-center font-mono font-bold text-sm text-navy-900 dark:text-white"
                >
                  {a}
                </div>
              ))}

              {[0, 1].map((rowIdx) => (
                <React.Fragment key={`row-${rowIdx}`}>
                  <div className="flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 font-mono font-bold text-sm text-navy-900 dark:text-white">
                    {punnett.alleles1[rowIdx]}
                  </div>
                  {[0, 1].map((colIdx) => {
                    const cell = punnett.cells[rowIdx * 2 + colIdx];
                    return (
                      <div
                        key={`cell-${rowIdx}-${colIdx}`}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/60 text-center space-y-1"
                      >
                        <div
                          className="w-6 h-6 rounded-full mx-auto border border-black/15"
                          style={{
                            backgroundColor: cell.isDominant
                              ? trait.dominantColor
                              : trait.recessiveColor,
                          }}
                        />
                        <p className="font-mono text-base font-bold text-navy-900 dark:text-white">
                          {cell.code}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {cell.isDominant ? trait.dominantLabel.split(' ')[0] : trait.recessiveLabel.split(' ')[0]}
                        </p>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Phenotype & Genotype Probability Breakdown */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <p className="text-xs font-semibold text-navy-900 dark:text-white">Fenotip (Dış Görünüş) Oranları</p>
              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>{trait.dominantLabel}</span>
                    <span className="font-mono font-semibold tabular-nums">%{punnett.domPct}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-teal-600 transition-all" style={{ width: `${punnett.domPct}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>{trait.recessiveLabel}</span>
                    <span className="font-mono font-semibold tabular-nums">%{punnett.recPct}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gold-500 transition-all" style={{ width: `${punnett.recPct}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <p className="font-semibold text-navy-900 dark:text-white">Genotip (Gen Yapısı) Dağılımı</p>
              <div className="grid grid-cols-3 gap-2 text-center font-mono tabular-nums pt-1">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] text-slate-500">{trait.dominantSymbol}{trait.dominantSymbol}</p>
                  <p className="text-sm font-bold text-navy-900 dark:text-white">%{punnett.homoDomPct}</p>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] text-slate-500">{trait.dominantSymbol}{trait.recessiveSymbol}</p>
                  <p className="text-sm font-bold text-teal-700 dark:text-teal-400">%{punnett.heteroPct}</p>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] text-slate-500">{trait.recessiveSymbol}{trait.recessiveSymbol}</p>
                  <p className="text-sm font-bold text-gold-600 dark:text-gold-400">%{punnett.homoRecPct}</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {trait.description}
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: DNA COMPLEMENTARY STRAND BUILDER + KEDIGEN */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                <Dna className="w-3.5 h-3.5" />
                <span>Etkileşimli DNA Eşleme Atölyesi (A ↔ T · G ↔ C)</span>
              </p>
              <h3 className="text-base font-semibold text-navy-900 dark:text-white mt-0.5">
                Karşı DNA Zincirini Tamamla
              </h3>
            </div>
            <button
              type="button"
              onClick={handleNewStrand}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Yeni Zincir Üret</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {templateStrand.map((base, idx) => {
              const picked = userStrand[idx];
              const isRight = picked === COMPLEMENT[base];
              return (
                <div
                  key={idx}
                  className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-mono text-slate-400 w-5">{idx + 1}.</span>
                    <span className="px-2.5 py-1 rounded-md bg-navy-900 text-white font-mono text-xs font-bold">
                      {base} ({BASE_LABELS[base]})
                    </span>
                    <span className="text-xs font-mono text-slate-400">══</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {(['A', 'T', 'G', 'C'] as BaseLetter[]).map((choice) => (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => {
                          setCheckedDna(false);
                          setUserStrand((prev) => {
                            const next = [...prev];
                            next[idx] = choice;
                            return next;
                          });
                        }}
                        className={`w-9 h-8 rounded-md font-mono text-xs font-bold border transition-colors cursor-pointer ${
                          picked === choice
                            ? 'border-teal-600 bg-teal-600 text-white'
                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-teal-500'
                        }`}
                      >
                        {choice}
                      </button>
                    ))}
                    {checkedDna && (
                      <span className="ml-1.5">
                        {isRight ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCheckedDna(true)}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer whitespace-nowrap"
            >
              DNA Eşleşmesini Kontrol Et
            </button>
            {checkedDna && (
              <span
                className={`text-xs font-semibold tabular-nums ${
                  dnaScore === 8
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}
              >
                Sonuç: {dnaScore} / 8 doğru eşleşme{' '}
                {dnaScore === 8 ? '— Hatasız DNA Eşlenmesi!' : '(Kural: A↔T, G↔C)'}
              </span>
            )}
          </div>
        </div>

        {/* KeDiGeN Visual Hierarchy */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
              Büyükten Küçüğe Kalıtım Şifresi
            </p>
            <h3 className="text-base font-semibold text-navy-900 dark:text-white mt-0.5">
              KeDiGeN Sıralaması
            </h3>
          </div>

          <div className="space-y-3">
            {KEDIGEN_HIERARCHY.map((item, idx) => (
              <div
                key={item.key}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-navy-900 dark:text-white">
                    {idx + 1}. {item.title}
                  </p>
                  <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400">
                    [{item.key}]
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
