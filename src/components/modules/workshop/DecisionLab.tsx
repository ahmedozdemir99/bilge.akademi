import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { speakInstant, stopAllSpeech } from '../../../utils/englishAudio';
import { Feedback, primaryButton, secondaryButton, type LabCallbacks } from './workshopControls';

export interface DecisionRound {
  context: string;
  question: string;
  choices: readonly { text: string; feedback: string }[];
  answer: number;
  audio?: boolean;
}

export function DecisionLab({ rounds, onComplete, onMistake }: { rounds: readonly DecisionRound[] } & LabCallbacks) {
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const current = rounds[step];
  const correct = choice === current.answer;
  const last = step === rounds.length - 1;

  useEffect(() => {
    if (current.audio) return stopAllSpeech;
  }, [current]);

  return (
    <>
      <div className="rounded-xl border-l-4 border-teal-600 bg-slate-50 p-4 text-base leading-relaxed dark:bg-slate-950/50 sm:p-6">
        {(!current.audio || showTranscript || audioUnavailable) && <p lang={current.audio ? 'en' : undefined}>{current.context}</p>}
        {current.audio && (
          <div className={`control-grid gap-2 ${showTranscript || audioUnavailable ? 'mt-3' : ''}`}>
            <button type="button" className={`${primaryButton} inline-flex items-center gap-2`} onClick={() => {
              setAudioUnavailable(!speakInstant(current.context, { rate: 0.85 }));
            }}><Volume2 className="size-4" aria-hidden="true" /> Duyuruyu dinle</button>
            <button type="button" className={secondaryButton} aria-expanded={showTranscript || audioUnavailable}
              onClick={() => setShowTranscript(!showTranscript)} disabled={audioUnavailable}>
              {showTranscript ? 'Yazılı metni gizle' : 'Yazılı metni aç'}
            </button>
          </div>
        )}
        {audioUnavailable && current.audio && <p role="status" className="mt-2 text-sm">Ses bu tarayıcıda kullanılamıyor. Yazılı metinle devam edebilirsin.</p>}
      </div>
      <fieldset className="space-y-3">
        <legend className="font-semibold">{current.question} <span className="text-sm font-normal">({step + 1}/{rounds.length})</span></legend>
        <div className="grid gap-2">
          {current.choices.map(({ text }, index) => (
            <button key={text} type="button" aria-pressed={index === choice}
              className={`${secondaryButton} text-left aria-pressed:border-teal-700 aria-pressed:bg-teal-50 dark:aria-pressed:border-teal-400 dark:aria-pressed:bg-teal-950/60`}
              onClick={() => {
                if (index !== current.answer && index !== choice) onMistake();
                setChoice(index);
                if (index === current.answer && last) onComplete();
              }}>{text}</button>
          ))}
        </div>
      </fieldset>
      {choice !== null && <Feedback correct={correct}>{current.choices[choice].feedback}</Feedback>}
      {correct && <div><button type="button" className={primaryButton} onClick={() => {
        setStep((step + 1) % rounds.length);
        setChoice(null);
        setShowTranscript(false);
      }}>{last ? 'Baştan oyna' : 'Sonraki duruma geç'}</button></div>}
    </>
  );
}
