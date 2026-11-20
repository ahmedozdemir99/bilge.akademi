import type { ReactNode } from 'react';

export interface LabCallbacks {
  onComplete: () => void;
  onMistake: () => void;
}

export const primaryButton = 'min-h-11 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 dark:bg-teal-700 dark:hover:bg-teal-600';
export const secondaryButton = 'min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-navy-900 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800';

export function Feedback({ correct, children }: { correct: boolean; children: ReactNode }) {
  return (
    <p role="status" className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${correct
      ? 'border-teal-200 bg-teal-50 text-teal-950 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-100'
      : 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100'}`}>
      {children}
    </p>
  );
}

export function RangeField({ label, value, min, max, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
      <span className="flex justify-between gap-4">
        <span>{label}</span>
        <span aria-hidden="true" className="font-mono tabular-nums text-teal-800 dark:text-teal-200">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
        className="h-8 w-full accent-teal-700 dark:accent-teal-400"
      />
    </label>
  );
}
