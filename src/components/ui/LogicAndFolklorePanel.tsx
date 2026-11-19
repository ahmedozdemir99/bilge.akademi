import { useState } from 'react';
import { NUMERIC_LOGIC, ORIGINAL_MANIS, RIDDLES, VERBAL_LOGIC, type SolvedLogic } from '../../data/logicRiddlesManis';

type Mode = 'verbal' | 'numeric' | 'riddles' | 'manis';
const tabs: {id:Mode;label:string;count:number}[] = [
  {id:'verbal',label:'Sözel Mantık',count:10},
  {id:'numeric',label:'Sayısal Mantık',count:10},
  {id:'riddles',label:'Bilmeceler',count:20},
  {id:'manis',label:'Maniler',count:10},
];
const library: Record<Exclude<Mode,'manis'>,SolvedLogic[]> = {verbal:VERBAL_LOGIC,numeric:NUMERIC_LOGIC,riddles:RIDDLES};
export function LogicAndFolklorePanel({ module }:{module:'mathematics'|'literature'}) {
 const [mode,setMode]=useState<Mode>(module==='mathematics'?'numeric':'verbal');
 const [index,setIndex]=useState(0);
 const [revealed,setRevealed]=useState(false);
 const available=tabs.filter(t=>module==='literature'?t.id!=='numeric':t.id!=='verbal'&&t.id!=='manis');
 const current=mode==='manis'?ORIGINAL_MANIS:library[mode];
 const item=current[index];
 const selectMode=(next:Mode)=>{setMode(next);setIndex(0);setRevealed(false);};
 return <section className="mt-8 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm" aria-label="Mantık soruları ve halk edebiyatı">
  <p className="text-xs font-semibold tracking-wider text-indigo-700 dark:text-indigo-300 uppercase">Yeni öğrenme koleksiyonu</p>
  <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Mantık, Bilmeceler ve Maniler</h2>
  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Soruyu çözmeden önce yanıt görünmez. Her sorunun gerekçeli çözümü vardır.</p>
  <div className="flex gap-2 overflow-x-auto mt-4 pb-3" role="group" aria-label="İçerik türü">
   {available.map(tab=><button type="button" key={tab.id} onClick={()=>selectMode(tab.id)} aria-pressed={mode===tab.id} className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${mode===tab.id?'bg-indigo-700 text-white':'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'}`}>{tab.label} ({tab.count})</button>)}
  </div>
  <div className="flex items-center justify-between gap-2 my-3 text-xs text-slate-500 dark:text-slate-400"><span>{tabs.find(t=>t.id===mode)?.label}</span><span>{index+1} / {current.length}</span></div>
  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden mb-4"><div className="h-full bg-indigo-500 transition-all duration-500" style={{width:`${(index+1)/current.length*100}%`}}/></div>
  {mode==='manis' ? <article className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-5">
   <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">{ORIGINAL_MANIS[index].title} · Özgün dörtlük</p>
   <p className="mt-3 whitespace-pre-line text-center text-lg leading-9 font-serif text-slate-900 dark:text-white">{ORIGINAL_MANIS[index].text}</p>
  </article> : <article className="rounded-xl bg-slate-50 dark:bg-slate-800 p-5">
   <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">{(item as SolvedLogic).topic}</p>
   <p className="mt-3 text-base font-medium text-slate-900 dark:text-white">{(item as SolvedLogic).question}</p>
   {revealed&&<div className="mt-4 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 p-3" aria-live="polite">
    <p className="font-bold text-emerald-900 dark:text-emerald-200">Cevap: {(item as SolvedLogic).answer}</p>
    <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">Çözüm: {(item as SolvedLogic).solution}</p>
   </div>}
  </article>}
  <div className="flex flex-wrap gap-2 mt-4">
   {mode!=='manis'&&<button type="button" onClick={()=>setRevealed(v=>!v)} className="rounded-lg bg-indigo-700 text-white px-4 py-2 text-sm font-semibold">{revealed?'Çözümü Gizle':'Cevabı ve Çözümü Göster'}</button>}
   <button type="button" onClick={()=>{setIndex(i=>(i+1)%current.length);setRevealed(false);}} className="rounded-lg border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 px-4 py-2 text-sm font-semibold">Sonraki</button>
   <button type="button" disabled={index===0} onClick={()=>{setIndex(i=>Math.max(0,i-1));setRevealed(false);}} className="rounded-lg border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 px-4 py-2 text-sm font-semibold disabled:opacity-40">Önceki</button>
  </div>
 </section>;
}
