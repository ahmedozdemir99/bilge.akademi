import { useState, type ReactNode } from 'react';
import type { ActivityId } from './activityTitles';
import { primaryButton, secondaryButton } from './workshopControls';

interface Investigation {
  question: string;
  choices: readonly string[];
  explain: string;
}

export const investigations: Partial<Record<ActivityId, Investigation>> = {
  fractions: {
    question: 'Bir bütünü altı eşit parçaya bölersek yarısını boyamak için kaç parça gerekir?',
    choices: ['İki parça', 'Üç parça', 'Dört parça'],
    explain: 'İki çubuk farklı sayıda parçaya bölünmüşken aynı uzunluğun boyandığını nasıl anladın?',
  },
  line: {
    question: 'Başlangıç değeri aynı kalırken eğimi 1’den 2’ye çıkarırsak x bir birim arttığında ne değişir?',
    choices: ['y daha az artar.', 'y aynı miktarda artar.', 'y daha çok artar.'],
    explain: 'Tablodan iki değer seçip değişimlerini karşılaştır. Eğim ile başlangıç değerini nasıl ayırt ettin?',
  },
  area: {
    question: 'Aynı çevreyi koruyup dikdörtgeni daha dar ve uzun yaparsak alan nasıl değişir?',
    choices: ['Değişebilir.', 'Her zaman aynı kalır.', 'Her zaman çevreye eşit olur.'],
    explain: 'Kurduğun iki dikdörtgenin alan ve çevre değerlerini karşılaştır. Gözlemin tahminini nasıl etkiledi?',
  },
  waves: {
    question: 'Sabit genişlikte daha fazla tam dalga görünürse komşu tepelerin arası nasıl değişir?',
    choices: ['Uzaklaşır.', 'Yakınlaşır.', 'Aynı kalır.'],
    explain: 'Dalga sayısı sürgüsünü değiştirirken ne gözlemledin? Genlik ile tepe aralığı arasındaki farkı yaz.',
  },
  circuit: {
    question: 'İki paralel koldan A kolunu açarsak B ampulüne ne olur?',
    choices: ['Yanmayı sürdürür.', 'Söner.', 'Bağlantı türü sonucu etkilemez.'],
    explain: 'A anahtarı açıkken seri ve paralel modellerde B ampulünün davranışını akım yoluyla açıkla.',
  },
  mirror: {
    question: 'Gelen ışın normalden uzaklaşınca yansıyan ışının normalle yaptığı açıya ne olur?',
    choices: ['Azalır.', 'Değişmez.', 'Artar.'],
    explain: 'Modelde bir açı seç. Normalden ölçülen yansıma açısı ile yüzeyden ölçülen açının nasıl ilişkili olduğunu yaz.',
  },
};

export function InvestigationLab({ investigation, children, onComplete }: {
  investigation: Investigation;
  children: (onModelComplete: () => void) => ReactNode;
  onComplete: () => void;
}) {
  const [choice, setChoice] = useState('');
  const [prediction, setPrediction] = useState('');
  const [observed, setObserved] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [finished, setFinished] = useState(false);

  return (
    <>
      {prediction ? (
        <p className="rounded-lg bg-indigo-50 px-4 py-3 text-sm dark:bg-indigo-950/35"><strong>Tahminin</strong> · {prediction}</p>
      ) : (
        <form className="space-y-4 rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950/35 sm:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (choice) setPrediction(choice);
          }}>
          <fieldset className="space-y-3">
            <legend className="text-base font-semibold">Tahmin et</legend>
            <p className="text-sm leading-relaxed">{investigation.question}</p>
            <div className="grid gap-2">
              {investigation.choices.map((option) => (
                <label key={option} className="flex min-h-11 items-center gap-3 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm dark:border-indigo-800 dark:bg-slate-900">
                  <input type="radio" name="investigation-prediction" checked={choice === option} onChange={() => setChoice(option)} className="size-4 shrink-0 accent-teal-700" />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>
          <button type="submit" disabled={!choice} className={`${primaryButton} disabled:opacity-50`}>Tahmini kaydet</button>
        </form>
      )}
      <h3 className="text-lg font-semibold">Etkileşimli model</h3>
      {children(() => setObserved(true))}
      {observed && !prediction && <p role="status" className="text-sm text-slate-700 dark:text-slate-200">Gözlemini yazmak için yukarıdaki tahminini kaydet.</p>}
      {observed && prediction && (
        <form className="space-y-3 rounded-xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-950/30 sm:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (explanation.trim().length < 10) return;
            setFinished(true);
            onComplete();
          }}>
          <label htmlFor="investigation-explanation" className="block font-semibold">Gözlemini açıkla</label>
          <p id="investigation-prompt" className="text-sm leading-relaxed">{investigation.explain}</p>
          <textarea id="investigation-explanation" aria-describedby="investigation-prompt" rows={3} value={explanation}
            onChange={(event) => {
              setExplanation(event.currentTarget.value);
              setFinished(false);
            }}
            placeholder="Modelde neyi değiştirdiğini ve ne gördüğünü bir cümleyle yaz."
            className="w-full rounded-lg border border-teal-200 bg-white px-3 py-2 text-base dark:border-teal-800 dark:bg-slate-900" />
          {finished ? <p role="status" className="font-semibold text-teal-900 dark:text-teal-100">Deney tamamlandı.</p> : (
            <button type="submit" disabled={explanation.trim().length < 10} className={`${secondaryButton} disabled:opacity-50`}>Deneyi tamamla</button>
          )}
        </form>
      )}
    </>
  );
}
