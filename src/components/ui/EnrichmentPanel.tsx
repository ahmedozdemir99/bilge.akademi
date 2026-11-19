import { useState } from 'react';
import { ENRICHMENT_LIBRARY, type EnrichmentModule } from '../../data/enrichmentLibrary';

const LABELS: Record<EnrichmentModule,string> = {
  mathematics:'Matematik', science:'Fen Bilimleri', english:'İngilizce',
  history:'Tarih', literature:'Türkçe ve Edebiyat', religion:'Din Kültürü', philosophy:'Felsefe',
};

export function EnrichmentPanel({ module }: { module: EnrichmentModule }) {
  const [selected, setSelected] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const activities = ENRICHMENT_LIBRARY[module];
  const item = activities[selected];
  return (
    <section className="mt-6 w-full min-w-0 overflow-hidden rounded-2xl border border-teal-200 dark:border-teal-900 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm" aria-label={`${LABELS[module]} ek öğrenme etkinlikleri`}>
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-wide text-teal-700 dark:text-teal-300">Kazanım odaklı ek çalışmalar</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{LABELS[module]} · 10 Etkinlik</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Soruyu düşünün; yanıtı ve açıklamayı hazır olduğunuzda açın. Cevap önceden gösterilmez.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 pb-3" role="group" aria-label="Etkinlik seçimi">
        {activities.map((activity, index) => (
          <button type="button" key={index} onClick={() => {setSelected(index);setRevealed(false);}} aria-pressed={selected===index}
            className={`min-w-0 break-words rounded-lg border px-2.5 py-2.5 text-left text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${selected===index?'bg-teal-700 text-white border-teal-700':'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-500'}`}>
            {index+1}. {activity.topic}
          </button>
        ))}
      </div>
      <div className="min-w-0 rounded-xl bg-slate-50 dark:bg-slate-800 p-4 sm:p-5">
        <p className="text-xs text-teal-700 dark:text-teal-300 font-semibold">Etkinlik {selected+1} / {activities.length} · {item.topic}</p>
        <p className="mt-3 max-w-prose text-base leading-7 font-medium text-slate-900 dark:text-white">{item.question}</p>
        {revealed && <div className="mt-4 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 p-3" aria-live="polite">
          <p className="font-semibold text-emerald-900 dark:text-emerald-200">Yanıt: {item.answer}</p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{item.explanation}</p>
        </div>}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={()=>setRevealed(value=>!value)} className="rounded-lg bg-slate-900 dark:bg-teal-700 text-white px-4 py-2 text-sm font-medium">
          {revealed?'Yanıtı Gizle':'Yanıtı ve Açıklamayı Göster'}
        </button>
        <button type="button" onClick={()=>{setSelected(i=>(i+1)%activities.length);setRevealed(false);}} className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-100">Sonraki Etkinlik</button>
      </div>
    </section>
  );
}
