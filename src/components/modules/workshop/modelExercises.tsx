import { Lightbulb } from 'lucide-react';
import type { ModelExercise } from './ModelLab';
import { CircuitDiagram } from './CircuitDiagram';

export const lineModel: ModelExercise = {
  intro: 'y = mx + b bağıntısında m, x bir birim arttığında y’nin ne kadar değiştiğini gösterir. b ise doğrunun y eksenini kestiği değerdir.',
  controls: [
    { label: 'Eğim (m)', min: -2, max: 2, initial: 1 },
    { label: 'Başlangıç değeri (b)', min: -2, max: 2, initial: 0 },
  ],
  rounds: [
    { goal: 'Doğru (0, 1) ve (2, 5) noktalarından geçsin.', check: ([m, b]) => b === 1 && 2 * m + b === 5, hint: 'Önce (0, 1) için başlangıç değerini ayarla. İki yatay birimde 4 birim yükselmek için bir yatay birimde ne kadar yükselmelisin?', explanation: 'b = 1 ve m = 2. x iki birim artınca y dört birim artar, 1’den 5’e ulaşır.' },
    { goal: 'Doğru (0, 2) ve (3, −1) noktalarından geçsin.', check: ([m, b]) => b === 2 && 3 * m + b === -1, hint: 'x üç birim artarken y üç birim azalıyor. Eğimin işaretini düşün.', explanation: 'b = 2 ve m = −1. x bir birim artınca y bir birim azalır.' },
  ],
  draw: ([m, b]) => {
    const leftY = -9 * m + b;
    const rightY = 9 * m + b;
    const length = Math.hypot(18, rightY - leftY);
    return (
      <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,240px)_1fr]">
        <div className="relative mx-auto aspect-square w-full max-w-60 overflow-hidden rounded-lg border border-indigo-200 bg-white dark:border-indigo-900 dark:bg-slate-900" aria-hidden="true">
          <div className="absolute inset-0 grid grid-cols-[repeat(18,minmax(0,1fr))] grid-rows-[repeat(18,minmax(0,1fr))]">
            {Array.from({ length: 324 }, (_, i) => <span className="border-r border-b border-indigo-100/70 dark:border-indigo-950" key={i} />)}
          </div>
          <div className="absolute inset-x-0 top-1/2 border-t border-slate-400" />
          <div className="absolute inset-y-0 left-1/2 border-l border-slate-400" />
          <span className="absolute top-1 left-[53%] font-mono text-xs">y</span>
          <span className="absolute top-[52%] right-1 font-mono text-xs">x</span>
          <div className="absolute left-0 h-0.5 origin-left bg-indigo-700 dark:bg-indigo-300"
            style={{ top: `${(9 - leftY) / 18 * 100}%`, width: `${length / 18 * 100}%`, transform: `rotate(${Math.atan2(leftY - rightY, 18)}rad)` }} />
          {[0, 1, 2, 3].map((x) => <span key={x} className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-700 dark:bg-indigo-300"
            style={{ left: `${(9 + x) / 18 * 100}%`, top: `${(9 - (m * x + b)) / 18 * 100}%` }} />)}
        </div>
        <div className="space-y-2">
          <p className="font-mono font-semibold">y = {m}x {b < 0 ? '−' : '+'} {Math.abs(b)}</p>
          <table className="w-full max-w-64 table-fixed text-center text-sm tabular-nums">
            <caption className="sr-only">Doğru üzerindeki noktalar</caption>
            <tbody>
              <tr><th scope="row">x</th>{[0, 1, 2, 3].map((x) => <td className="border p-1" key={x}>{x}</td>)}</tr>
              <tr><th scope="row">y</th>{[0, 1, 2, 3].map((x) => <td className="border p-1" key={x}>{m * x + b}</td>)}</tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  },
};

export const areaModel: ModelExercise = {
  intro: 'Birim karelerle dikdörtgen kur. Alan kaplanan birim karelerin sayısıdır. Çevre ise sınır boyunca ölçülen toplam uzunluktur.',
  controls: [
    { label: 'Genişlik', min: 1, max: 9, initial: 3 },
    { label: 'Yükseklik', min: 1, max: 9, initial: 2 },
  ],
  rounds: [
    { goal: 'Alanı 24 birim², çevresi 20 birim olan bir dikdörtgen oluştur.', check: ([w, h]) => w * h === 24 && 2 * (w + h) === 20, hint: 'Kenarlar çarpılınca 24, toplanınca 10 olmalı. 24’ün çarpan çiftlerini dene.', explanation: 'Kenarlar 4 ve 6 birimdir. 4 × 6 = 24 birim², 2 × (4 + 6) = 20 birim.' },
    { goal: 'Aynı çevreyle 16 birim² alan elde et.', check: ([w, h]) => w * h === 16 && 2 * (w + h) === 20, hint: 'Kenarlar toplamı yine 10 olmalı. 4 × 4 alanı sağlar. Çevreyi sağlamak için 16’nın başka bir çarpan çiftini ara.', explanation: 'Kenarlar 2 ve 8 birimdir. Çevre aynı olsa da alan değişebilir.' },
  ],
  draw: ([w, h]) => (
    <div className="flex flex-wrap items-center gap-5">
      <div className="grid aspect-square w-40 grid-cols-9 gap-px rounded-lg bg-indigo-200 p-px dark:bg-indigo-900 sm:w-52" aria-hidden="true">
        {Array.from({ length: 81 }, (_, i) => <span key={i} className={`transition-colors duration-200 ${i % 9 < w && Math.floor(i / 9) < h ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-white dark:bg-slate-900'}`} />)}
      </div>
      <dl className="grid gap-2 text-sm tabular-nums">
        <div><dt>Alan</dt><dd className="text-lg font-semibold">{w} × {h} = {w * h} birim²</dd></div>
        <div><dt>Çevre</dt><dd className="text-lg font-semibold">2 × ({w} + {h}) = {2 * (w + h)} birim</dd></div>
      </dl>
    </div>
  ),
};

const circuitOptions = ['Seri', 'Paralel'];
export const circuitModel: ModelExercise = {
  intro: 'İki özdeş ampullü ideal devreyi incele. A anahtarını açmak A ampulünün bulunduğu hattı keser. B ampulünün durumunu izle.',
  controls: [
    { label: 'Bağlantı türü', min: 0, max: 1, initial: 0, options: circuitOptions },
    { label: 'A anahtarı', min: 0, max: 1, initial: 1, options: ['Açık · hat kesik', 'Kapalı · hat tamam'] },
  ],
  rounds: [
    { goal: 'A anahtarı açıkken yalnız B ampulü yansın.', check: ([parallel, closed]) => parallel === 1 && closed === 0, hint: 'B ampulünün çalışması için A anahtarından geçmeyen ayrı bir yol gerekiyor.', explanation: 'Paralel devrede B’nin kolu kapalı kalır. A’nın kolu kesilse de B yanar.' },
    { goal: 'Açık tek anahtarla iki ampulü de söndür.', check: ([parallel, closed]) => parallel === 0 && closed === 0, hint: 'İki ampul de aynı hattan akım alırsa o hattın kesilmesi her ikisini etkiler.', explanation: 'Seri devrede tek akım yolu vardır. Anahtar açılınca iki ampul de söner.' },
  ],
  draw: ([parallel, closed]) => (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm font-medium">{parallel ? 'İki ayrı akım yolu' : 'Tek akım yolu'}</p>
      <CircuitDiagram parallel={parallel === 1} closed={closed === 1} />
      <div className={`grid w-full max-w-lg gap-2 ${parallel ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {['A', 'B'].map((name, i) => {
          const lit = Boolean(closed || (parallel && i === 1));
          return (
            <div key={name} className={`flex items-center gap-2 rounded-lg border-2 border-dashed px-3 py-2 transition-colors ${lit
              ? 'border-amber-500 bg-amber-100 text-amber-950 dark:bg-amber-950/50 dark:text-amber-100'
              : 'border-slate-400 bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200'}`}>
              <Lightbulb aria-hidden="true" className={`size-6 ${lit ? 'fill-amber-400 text-amber-700 dark:text-amber-300' : ''}`} />
              <span className="text-sm font-semibold">{name} ampulü · {lit ? 'Yanıyor' : 'Sönük'}</span>
            </div>
          );
        })}
      </div>
    </div>
  ),
};

export const mirrorModel: ModelExercise = {
  intro: 'Düz aynada geliş açısı ve yansıma açısı birbirine eşittir. Açıları ayna yüzeyine göre değil, yüzeye dik kesikli normal çizgisine göre ölç.',
  controls: [{ label: 'Geliş açısı (°)', min: 0, max: 80, initial: 20 }],
  rounds: [
    { goal: 'Yansıma açısını 35° yap.', check: ([angle]) => angle === 35, hint: 'Düz aynada geliş ve yansıma açıları eşittir.', explanation: '35° ile gelen ışın, normalin öbür tarafında yine 35° ile yansır.' },
    { goal: 'Yansıyan ışın ile ayna yüzeyi arasındaki açıyı 25° yap.', check: ([angle]) => angle === 65, hint: 'Ayna ile normal arasında 90° var. Aradığın ışın yüzeyden 25° uzaktaysa normalden kaç derece uzaktadır?', explanation: '90° − 25° = 65°. Yansıma açısı 65° olduğu için geliş açısı da 65° olmalıdır.' },
  ],
  draw: ([angle]) => (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative aspect-[4/3] w-full max-w-72 overflow-hidden rounded-lg bg-white dark:bg-slate-900" aria-hidden="true">
        <div className="absolute inset-x-[12%] top-[76%] border-t-4 border-indigo-800 dark:border-indigo-200" />
        <div className="absolute top-[8%] bottom-[24%] left-1/2 border-l border-dashed border-slate-500" />
        <div className="absolute bottom-[24%] left-1/2 h-[52%] w-1 origin-bottom bg-teal-600 transition-transform dark:bg-teal-400" style={{ transform: `rotate(${-angle}deg)` }} />
        <div className="absolute bottom-[24%] left-1/2 h-[52%] w-1 origin-bottom bg-amber-500 transition-transform" style={{ transform: `rotate(${angle}deg)` }} />
      </div>
      <dl className="grid gap-2 text-sm">
        <div><dt className="font-medium text-teal-800 dark:text-teal-200">Gelen ışın · normalden</dt><dd>{angle}°</dd></div>
        <div><dt className="font-medium text-amber-800 dark:text-amber-300">Yansıyan ışın · normalden</dt><dd>{angle}°</dd></div>
        <div><dt>Yansıyan ışın · yüzeyden</dt><dd>{90 - angle}°</dd></div>
      </dl>
    </div>
  ),
};
