import { useEffect, useState } from 'react';
import { BookOpen, Coffee, Flag, GraduationCap, MapPin, Music, Store, Trees, Volume2 } from 'lucide-react';
import { speakInstant, stopAllSpeech } from '../../../utils/englishAudio';
import { Feedback, primaryButton, secondaryButton, type LabCallbacks } from './workshopControls';

const places = [
  { name: 'Meydan', icon: Flag },
  { name: 'Müzik okulu', icon: Music },
  { name: 'Market', icon: Store },
  { name: 'Park', icon: Trees },
  { name: 'Okul', icon: GraduationCap },
  { name: 'Durak', icon: Flag },
  { name: 'Başlangıç', icon: MapPin },
  { name: 'Kafe', icon: Coffee },
  { name: 'Kütüphane', icon: BookOpen },
];

const route = [
  { cell: 3, direction: 'north', line: 'Go one block north to the park.', hint: 'North, haritanın üst tarafını gösterir.' },
  { cell: 4, direction: 'east', line: 'Go one block east to the school.', hint: 'East, haritanın sağ tarafını gösterir.' },
  { cell: 7, direction: 'south', line: 'Go one block south to the café.', hint: 'South, haritanın alt tarafını gösterir.' },
  { cell: 8, direction: 'east', line: 'Go one block east to the library.', hint: 'East, haritanın sağ tarafını gösterir.' },
];

const directions = [
  { id: 'north', label: 'Kuzey' },
  { id: 'east', label: 'Doğu' },
  { id: 'south', label: 'Güney' },
  { id: 'west', label: 'Batı' },
];

export function EnglishMapLab({ onComplete, onMistake }: LabCallbacks) {
  const [step, setStep] = useState(0);
  const [hint, setHint] = useState('');
  const [lastDirection, setLastDirection] = useState('');
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const instruction = route[step];
  const cell = step === 0 ? 6 : route[step - 1].cell;
  const location = places[cell].name;

  useEffect(() => () => stopAllSpeech(), []);

  function move(direction: string) {
    if (!instruction) return;
    if (direction !== instruction.direction) {
      if (lastDirection !== direction) onMistake();
      setLastDirection(direction);
      setHint(instruction.hint);
      return;
    }
    stopAllSpeech();
    setHint('');
    setLastDirection('');
    setStep(step + 1);
    if (step + 1 === route.length) onComplete();
  }

  return (
    <>
      <div className="max-w-xl rounded-xl bg-sky-50 p-3 dark:bg-sky-950/40 sm:p-5">
        <p className="mb-2 text-center text-sm font-semibold text-sky-950 dark:text-sky-100">↑ Kuzey</p>
        <div className="relative grid grid-cols-3 gap-2" role="img" aria-label={`Mahalle haritası. Şu anki konum: ${location}. Hedef: Kütüphane.`}>
          {places.map(({ name, icon: Icon }, index) => (
            <div key={name} aria-hidden="true" className={`flex h-20 flex-col items-center justify-center gap-1 rounded-lg border px-1 text-center text-xs sm:h-24 sm:text-sm ${index === 8
              ? 'border-sky-500 bg-sky-100 font-semibold text-sky-950 dark:border-sky-600 dark:bg-sky-900 dark:text-sky-100'
              : 'border-sky-100 bg-white text-slate-800 dark:border-sky-900 dark:bg-slate-900 dark:text-slate-200'}`}>
              <Icon className="size-5 text-sky-700 dark:text-sky-300" />
              {name}
            </div>
          ))}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-navy-900 text-white shadow-sm transition-[left,top] duration-500 motion-reduce:transition-none"
            style={{ left: `${(cell % 3 + 0.5) / 3 * 100}%`, top: `${(Math.floor(cell / 3) + 0.19) / 3 * 100}%` }}
          >
            <MapPin className="size-3.5" />
          </span>
        </div>
        <p className="mt-3 text-sm text-sky-950 dark:text-sky-100" aria-live="polite">Konum: <strong>{location}</strong></p>
      </div>
      {instruction ? (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-lg font-semibold" lang="en">{instruction.line}</p>
            <button type="button" className={`${secondaryButton} inline-flex items-center gap-2`} onClick={() => {
              setAudioUnavailable(!speakInstant(instruction.line, { rate: 0.85 }));
            }}>
              <Volume2 className="size-4" aria-hidden="true" /> Dinle
            </button>
          </div>
          {audioUnavailable && <p role="status" className="text-sm text-slate-600 dark:text-slate-300">Bu tarayıcıda sesli okuma kullanılamıyor. Yazılı yönergeyle devam edebilirsin.</p>}
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold">Hangi yöne gitmelisin? Adım {step + 1}/{route.length}</legend>
            <div className="control-grid gap-2 [--control-min-width:6rem]">
              {directions.map(({ id, label }) => (
                <button key={id} type="button" className={secondaryButton} onClick={() => move(id)}>{label}</button>
              ))}
            </div>
          </fieldset>
          {hint && <Feedback correct={false}>{hint}</Feedback>}
        </>
      ) : (
        <>
          <Feedback correct>Kütüphaneye ulaştın. Kuzey, doğu ve güney yönlerini İngilizce tariflerden takip ettin.</Feedback>
          <div><button type="button" className={primaryButton} onClick={() => setStep(0)}>Rotayı yeniden başlat</button></div>
        </>
      )}
    </>
  );
}
