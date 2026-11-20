import { useState } from 'react';
import { Feedback, primaryButton, secondaryButton, type LabCallbacks } from './workshopControls';

export interface Arrangement {
  prompt: string;
  cards: readonly { text: string; note?: string }[];
  slots: readonly { label: string; card: number; clue: string }[];
  explanation: string;
  sources?: readonly { label: string; url: string }[];
  language?: string;
}

function firstEmpty(placed: readonly (number | null)[]) {
  return Math.max(0, placed.indexOf(null));
}

export function ArrangeLab({ exercise, onComplete, onMistake }: { exercise: Arrangement } & LabCallbacks) {
  const [placed, setPlaced] = useState<(number | null)[]>(() => exercise.slots.map(() => null));
  const [target, setTarget] = useState(0);
  const [checked, setChecked] = useState(false);
  const wrong = placed.findIndex((value, index) => value !== exercise.slots[index].card);
  const correct = checked && wrong === -1;

  function place(card: number) {
    const next = placed.map((item, index) => index === target ? card : item === card ? null : item);
    setPlaced(next);
    setTarget(firstEmpty(next));
    setChecked(false);
  }

  function reset() {
    setPlaced(exercise.slots.map(() => null));
    setTarget(0);
    setChecked(false);
  }

  return (
    <>
      <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200">{exercise.prompt}</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/50">
          <h3 className="mb-2 text-sm font-semibold">Yerleştirilecek kartlar</h3>
          <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">Bir alan seç, ardından o alana koymak istediğin karta dokun.</p>
          <div className="grid gap-2">
            {exercise.cards.map(({ text, note }, index) => (
              <button key={text} type="button" lang={exercise.language} onClick={() => place(index)} disabled={correct}
                className={`${secondaryButton} bg-white text-left dark:bg-slate-900 ${placed.includes(index) ? 'border-teal-600 dark:border-teal-400' : ''}`}>
                {text}
                {note && <span className="mt-1 block text-xs font-normal text-slate-600 dark:text-slate-300">{note}</span>}
                {placed.includes(index) && <span className="sr-only"> (Yerleştirildi)</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-teal-50 p-4 dark:bg-teal-950/30">
          <h3 className="mb-3 text-sm font-semibold">Yerleştirme alanı</h3>
          <ol className="space-y-2">
            {exercise.slots.map(({ label }, index) => {
              const card = placed[index];
              return (
                <li key={label}>
                  <button type="button" aria-pressed={target === index} onClick={() => setTarget(index)} disabled={correct}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${target === index ? 'border-teal-700 bg-white ring-1 ring-teal-700 dark:border-teal-400 dark:bg-slate-900 dark:ring-teal-400' : 'border-teal-200 dark:border-teal-800'}`}>
                    <span className="block font-semibold">{label}</span>
                    <span lang={card === null ? undefined : exercise.language} className="mt-1 block text-slate-600 dark:text-slate-300">
                      {card === null ? 'Henüz kart yok' : exercise.cards[card].text}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      {checked && (
        <Feedback correct={correct}>
          {correct ? exercise.explanation : `“${exercise.slots[wrong].label}” alanını yeniden düşün. ${exercise.slots[wrong].clue}`}
        </Feedback>
      )}
      <div className="control-grid gap-2">
        <button type="button" className={`${primaryButton} disabled:opacity-50`} disabled={placed.includes(null) || correct} onClick={() => {
          setChecked(true);
          if (wrong === -1) onComplete();
          else {
            if (!checked) onMistake();
            setTarget(wrong);
          }
        }}>Kontrol et</button>
        <button type="button" className={secondaryButton} onClick={reset}>Baştan başla</button>
      </div>
      {exercise.sources && (
        <ul aria-label="Kaynaklar" className="space-y-1 text-sm">
          {exercise.sources.map(({ label, url }) => <li key={url}><a href={url} target="_blank" rel="noreferrer" className="text-teal-800 underline dark:text-teal-300">{label}</a></li>)}
        </ul>
      )}
    </>
  );
}
