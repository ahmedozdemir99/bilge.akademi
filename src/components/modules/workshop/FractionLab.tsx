import { useState } from 'react';
import { Feedback, primaryButton, RangeField, secondaryButton, type LabCallbacks } from './workshopControls';

const rounds = [
  { numerator: 1, denominator: 2, targetDenominator: 6 },
  { numerator: 2, denominator: 3, targetDenominator: 9 },
  { numerator: 3, denominator: 4, targetDenominator: 8 },
];

function FractionBar({ numerator, denominator, label }: {
  numerator: number;
  denominator: number;
  label: string;
}) {
  return (
    <div>
      <p className="mb-2 flex justify-between gap-3 text-sm font-medium">
        <span>{label}</span><span className="font-mono">{numerator}/{denominator}</span>
      </p>
      <div
        className="relative h-12 overflow-hidden rounded-lg border border-teal-600/50 bg-white dark:bg-slate-900"
        aria-hidden="true"
      >
        <div
          className="absolute inset-y-0 left-0 bg-teal-600 transition-[width] duration-300 dark:bg-teal-400"
          style={{ width: `${numerator / denominator * 100}%` }}
        />
        <div className="absolute inset-0 grid divide-x divide-slate-600/60" style={{ gridTemplateColumns: `repeat(${denominator}, minmax(0, 1fr))` }}>
          {Array.from({ length: denominator }, (_, index) => <span key={index} />)}
        </div>
      </div>
    </div>
  );
}

export function FractionLab({ onComplete, onMistake }: LabCallbacks) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [numerator, setNumerator] = useState(0);
  const [result, setResult] = useState<boolean | null>(null);
  const round = rounds[roundIndex];
  const isLastRound = roundIndex === rounds.length - 1;

  function check() {
    const matches = round.numerator * round.targetDenominator === numerator * round.denominator;
    setResult(matches);
    if (!matches && result !== false) onMistake();
    if (matches && isLastRound) onComplete();
  }

  function next() {
    setRoundIndex((roundIndex + 1) % rounds.length);
    setNumerator(0);
    setResult(null);
  }

  return (
    <>
      <div className="space-y-5 rounded-xl bg-teal-50 p-4 dark:bg-teal-950/35 sm:p-6">
        <FractionBar numerator={round.numerator} denominator={round.denominator} label="Verilen kesir" />
        <FractionBar numerator={numerator} denominator={round.targetDenominator} label="Oluşturduğun kesir" />
      </div>
      <p className="text-sm text-slate-700 dark:text-slate-200">Payı değiştirerek iki çubuğun boyalı kısımlarını eşitle. Soru {roundIndex + 1}/{rounds.length}.</p>
      <RangeField label="Boyalı parça sayısı" value={numerator} min={0} max={round.targetDenominator} onChange={(value) => {
        setNumerator(value);
        setResult(null);
      }} />
      {result !== null && (
        <Feedback correct={result}>
          {result
            ? `Doğru. Pay ve payda ${round.targetDenominator / round.denominator} ile çarpılınca kesrin değeri değişmez.`
            : 'Boyalı kısımlar henüz eşit değil. Sürgüyü oynatarak çubukları yeniden karşılaştır.'}
        </Feedback>
      )}
      <div className="control-grid gap-2">
        <button type="button" className={primaryButton} onClick={check}>Kontrol et</button>
        {result && <button type="button" className={secondaryButton} onClick={next}>{isLastRound ? 'Baştan oyna' : 'Sonraki kesir'}</button>}
      </div>
    </>
  );
}
