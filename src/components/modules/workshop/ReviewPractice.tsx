import { useState } from 'react';
import { Feedback, secondaryButton } from './workshopControls';
import type { ActivityId } from './activityTitles';
import { reviewExercises } from './reviewExercises';

export function ReviewPractice({ activityId }: { activityId: ActivityId }) {
  const [choice, setChoice] = useState<number | null>(null);
  const review = reviewExercises[activityId];

  return (
    <details className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
      <summary className="cursor-pointer font-semibold text-amber-950 dark:text-amber-100">Aynı beceriyi başka örnekle dene</summary>
      <div className="mt-3 space-y-3">
        <p className="text-sm leading-relaxed">{review.rule}</p>
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">{review.question}</legend>
          <div className="grid gap-2">
            {review.choices.map((answer, index) => (
              <button key={answer} type="button" aria-pressed={choice === index} className={`${secondaryButton} bg-white text-left dark:bg-slate-900`}
                onClick={() => setChoice(index)}>{answer}</button>
            ))}
          </div>
        </fieldset>
        {choice !== null && (
          <Feedback correct={choice === review.answer}>
            {choice === review.answer ? `${review.explanation} Şimdi asıl göreve dönüp yeniden deneyebilirsin.` : `Kuralı bu örneğe uygula ve diğer seçenekleri karşılaştır. ${review.rule}`}
          </Feedback>
        )}
      </div>
    </details>
  );
}
