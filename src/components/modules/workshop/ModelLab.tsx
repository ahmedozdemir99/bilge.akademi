import { useState, type ReactNode } from 'react';
import { Feedback, primaryButton, RangeField, secondaryButton, type LabCallbacks } from './workshopControls';

export interface ModelExercise {
  intro: string;
  controls: readonly { label: string; min: number; max: number; initial: number; options?: readonly string[] }[];
  rounds: readonly { goal: string; check: (values: number[]) => boolean; hint: string; explanation: string }[];
  draw: (values: number[]) => ReactNode;
}

export function ModelLab({ exercise, onComplete, onMistake }: { exercise: ModelExercise } & LabCallbacks) {
  const [values, setValues] = useState(() => exercise.controls.map(({ initial }) => initial));
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<boolean | null>(null);
  const round = exercise.rounds[index];
  const last = index === exercise.rounds.length - 1;

  function change(control: number, value: number) {
    setValues((previous) => previous.map((item, i) => i === control ? value : item));
    setResult(null);
  }

  return (
    <>
      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{exercise.intro}</p>
      <div className="rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950/40 sm:p-6">{exercise.draw(values)}</div>
      <p className="font-semibold">Görev {index + 1}/{exercise.rounds.length} · {round.goal}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {exercise.controls.map((control, i) => control.options ? (
          <label key={control.label} className="grid gap-2 text-sm font-medium">
            {control.label}
            <select value={values[i]} onChange={(event) => change(i, Number(event.currentTarget.value))}
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900">
              {control.options.map((option, optionIndex) => <option key={option} value={optionIndex}>{option}</option>)}
            </select>
          </label>
        ) : <RangeField key={control.label} {...control} value={values[i]} onChange={(value) => change(i, value)} />)}
      </div>
      {result !== null && <Feedback correct={result}>{result ? round.explanation : round.hint}</Feedback>}
      <div className="control-grid gap-2">
        <button type="button" className={primaryButton} onClick={() => {
          const correct = round.check(values);
          setResult(correct);
          if (!correct && result !== false) onMistake();
          if (correct && last) onComplete();
        }}>Kontrol et</button>
        {result && <button type="button" className={secondaryButton} onClick={() => {
          setIndex((index + 1) % exercise.rounds.length);
          setResult(null);
          if (last) setValues(exercise.controls.map(({ initial }) => initial));
        }}>{last ? 'Baştan oyna' : 'Sonraki göreve geç'}</button>}
      </div>
    </>
  );
}
