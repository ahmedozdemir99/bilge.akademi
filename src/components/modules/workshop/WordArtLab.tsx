import { useState } from 'react';
import { Feedback, primaryButton, secondaryButton, type LabCallbacks } from './workshopControls';

const options = ['Benzetme', 'Kişileştirme', 'Abartma', 'Karşıtlık'] as const;
type Figure = typeof options[number];

const examples: { before: string; clue: string; after: string; answer: Figure; hint: string; explanation: string }[] = [
  {
    before: 'Kardeşim ',
    clue: 'karınca gibi',
    after: ' çalışkandır.',
    answer: 'Benzetme',
    hint: 'Kardeşin çalışkanlığı hangi canlının özelliğiyle karşılaştırılıyor?',
    explanation: 'Kardeşin çalışkanlığı, “gibi” sözcüğüyle karıncanın çalışkanlığına benzetiliyor.',
  },
  {
    before: 'Güneş sabah ',
    clue: 'bize gülümsedi',
    after: '.',
    answer: 'Kişileştirme',
    hint: 'Gülümsemek kime özgü bir davranış? Cümlede bu davranışı kim yapıyor?',
    explanation: 'İnsana özgü gülümseme davranışı güneşe yükleniyor.',
  },
  {
    before: 'Seni beklerken ',
    clue: 'bir ömür geçti',
    after: '.',
    answer: 'Abartma',
    hint: 'Bekleyişin gerçekten bir ömür sürdüğünü mü anlıyoruz?',
    explanation: 'Bekleyişin uzunluğu, gerçekte olduğundan çok daha büyük gösteriliyor.',
  },
  {
    before: 'O gün ',
    clue: 'hem güldüm hem ağladım',
    after: '.',
    answer: 'Karşıtlık',
    hint: 'Altı çizili bölümde birbirine zıt iki davranışı ara.',
    explanation: 'Gülmek ve ağlamak karşıt davranışlar olarak aynı cümlede bir araya getiriliyor.',
  },
];

export function WordArtLab({ onComplete, onMistake }: LabCallbacks) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<Figure | null>(null);
  const example = examples[index];
  const correct = choice === example.answer;
  const last = index === examples.length - 1;

  return (
    <>
      <blockquote className="rounded-xl bg-amber-50 p-5 text-xl leading-relaxed text-amber-950 dark:bg-amber-950/40 dark:text-amber-50 sm:p-7 sm:text-2xl">
        “{example.before}
        <span className={`transition-colors duration-300 ${choice ? 'rounded-sm bg-amber-200 underline decoration-amber-600 dark:bg-amber-800 dark:decoration-amber-400' : ''}`}>{example.clue}</span>
        {example.after}”
      </blockquote>
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Bu cümlede hangi söz sanatı kullanılmıştır? {index + 1}/{examples.length}</legend>
        <div className="grid max-w-xl grid-cols-2 gap-2">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={choice === option}
              className={secondaryButton}
              onClick={() => {
                if (option !== example.answer && option !== choice) onMistake();
                setChoice(option);
                if (option === example.answer && last) onComplete();
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>
      {choice && <Feedback correct={correct}>{correct ? `Doğru. ${example.explanation}` : `İpucu. ${example.hint}`}</Feedback>}
      {correct && (
        <div>
          <button type="button" className={primaryButton} onClick={() => {
            setIndex((index + 1) % examples.length);
            setChoice(null);
          }}>{last ? 'Baştan oyna' : 'Sonraki cümle'}</button>
        </div>
      )}
    </>
  );
}
