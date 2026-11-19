import { useState } from 'react';
import { ENRICHMENT_LIBRARY, type EnrichmentModule } from '../../data/enrichmentLibrary';

const colors = ['#0d9488','#2563eb','#e11d48','#7c3aed','#d97706','#059669','#db2777','#0891b2','#ea580c','#65a30d'];
const labels: Record<EnrichmentModule,string> = {mathematics:'Matematik',science:'Fen',english:'İngilizce',history:'Tarih',literature:'Edebiyat',religion:'Din Kültürü',philosophy:'Felsefe'};
const icons: Record<EnrichmentModule,string[]> = {
 mathematics:['24 ÷ 12 = 2','8 · 3 = 24','%25','3 : 4','3x + 7','3 / 8','2³ × 2⁴','√144','10 × 6 / 2','Σ / n'],
 science:['❄ → 💧','F / A','💡 — 💡','A ↔ T','☀ → 🌱','23,4°','pH 3','↑ Fₖ','1–18','☀ → 🌿 → 🐛'],
 english:['go → goes','watch → watched','fast → faster','should','borrow ↔ lend','7:30','← LEFT','Do + you','will','because'],
 history:['1071','1453','1919','1920','1923','1923','🌍','✉','📚','🏛'],
 literature:['☀ ☺','🦁 ≈ 💪','▰ ▰ ▰ ▰','♡','✦','BEN','♫','💧 → 🌊','📖','her + şey'],
 religion:['☪','☀ → 🌙','🤲','✓','⚖','💧','١','✦','♡','🤝'],
 philosophy:['?','∀ → ∴','⚖','? → bilgi','∃','P₁ + P₂ → S','¬(P ∧ ¬P)','⚖ → ?','✧','? → ?']
};
const descriptors: Record<EnrichmentModule,string[]> = {
 mathematics:['Ortak bölenler','Ortak katların buluşması','İndirim yüzdesi','Parçaların oranı','Denklemin dengesi','Olasılık modeli','Üslerin birleşmesi','Karelerin kökü','Alan modeli','Verilerin ortalaması'],
 science:['Hâl değişimi','Temas alanı ve basınç','Seri devre','Tamamlayıcı bazlar','Fotosentez girdileri','Eksen eğikliği','pH ölçeği','Kuvvet dengesi','Periyodik gruplar','Enerji aktarımı'],
 english:['Third-person singular','Past tense','Comparative adjective','Giving advice','Vocabulary contrast','Telling the time','Giving directions','Question structure','Prediction','Cause and effect'],
 history:['Anadolu tarihi','Fetih dönemi','Millî Mücadele','Meclisin açılması','Cumhuriyetin ilanı','Barış antlaşması','Ticaret ağları','Birincil kaynak','Bilginin yayılması','Kültürel miras'],
 literature:['Kişileştirme','Benzetme','Dörtlük','Tema','Ana düşünce','Anlatıcı','Deyim','Atasözü','Hikâye','Yazım kuralı'],
 religion:['Namaza giriş','Oruç vakitleri','Dayanışma','Emanet','Hak ve adalet','Ölçülü tüketim','Fâtiha','Güvenilirlik','Dua','İyilik'],
 philosophy:['Eleştirel düşünme','Tümdengelim','Ahlak felsefesi','Bilgi felsefesi','Varlık felsefesi','Argüman yapısı','Çelişmezlik','Özgür irade','Estetik','Sokratik diyalog']
};


function MathConceptDiagram({index,stage}:{index:number;stage:number}) {
 const steps = [
  [['24','36'],['2 × 12','3 × 12'],['EBOB = 12']],
  [['8, 16, 24','12, 24'],['24 = 3 × 8','24 = 2 × 12'],['EKOK = 24']],
  [['240 TL','%25'],['240 × 25/100','60 TL'],['240 − 60 = 180 TL']],
  [['3 pay','4 pay'],['7 pay = 28 kişi','1 pay = 4'],['3 × 4 = 12 kız']],
  [['3x + 7 = 28'],['3x = 21'],['x = 7']],
  [['3 kırmızı','5 mavi'],['Toplam 8 bilye'],['P(kırmızı) = 3/8']],
  [['2³ × 2⁴'],['2³⁺⁴'],['2⁷ = 128']],
  [['√144','√81'],['12 + 9'],['21']],
  [['Taban = 10','Yükseklik = 6'],['Alan = 10 × 6 / 2'],['30 cm²']],
  [['4, 6, 6, 8, 11'],['Toplam = 35','Adet = 5'],['Ortalama = 7']],
 ][index];
 return <div className="flex flex-wrap items-center justify-center gap-2" aria-label={`Matematik modelinin ${stage+1}. aşaması`}>
 {steps[stage].map((part,i)=><span key={i} className="rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-700 px-2 py-2 text-sm sm:text-base font-semibold text-indigo-900 dark:text-indigo-100">{part}</span>)}
 </div>;
}
function ScienceConceptDiagram({index,stage}:{index:number;stage:number}) {
 const steps = [
  [['Katı','❄'],['Isı alır','→'],['Sıvı','💧']],
  [['Kuvvet: F'],['Alan: A'],['Basınç = F/A']],
  [['Pil','→'],['Ampul 1','→'],['Ampul 2']],
  [['A','↔','T'],['G','↔','C'],['DNA eşleşmesi']],
  [['Güneş ışığı','☀'],['CO₂ + H₂O','→'],['Besin + O₂']],
  [['Dünya ekseni','23,4°'],['Güneş çevresinde dolanma'],['Mevsimler']],
  [['0–6','Asit'],['7','Nötr'],['8–14','Baz']],
  [['Ağırlık','↓'],['Kaldırma kuvveti','↑'],['Dengede eşit']],
  [['Aynı grup'],['Benzer dış elektron'],['Benzer özellik']],
  [['Üretici','🌿'],['Tüketici','→'],['Enerji aktarımı']],
 ][index];
 return <div className="flex flex-wrap items-center justify-center gap-2" aria-label={`Fen modeli ${stage+1}. aşama`}>
 {steps[stage].map((part,i)=><span key={i} className="rounded-lg bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-700 px-2 py-2 text-sm sm:text-base font-semibold text-cyan-900 dark:text-cyan-100">{part}</span>)}
 </div>;
}

export function InteractiveVisualLab({module}:{module:EnrichmentModule}) {
 const [index,setIndex]=useState(0);
 const [stage,setStage]=useState(0);
 const [showAnswer,setShowAnswer]=useState(false);
 const item=ENRICHMENT_LIBRARY[module][index];
 const color=colors[index];
 const reset=(next:number)=>{setIndex(next);setStage(0);setShowAnswer(false);};
 return <section className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm" aria-label={`${labels[module]} görsel materyalleri`}>
   <header className="mb-4">
     <p className="text-xs font-semibold tracking-widest uppercase text-teal-700 dark:text-teal-300">Görsel ve etkileşimli öğrenme laboratuvarı</p>
     <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{labels[module]} · 10 Görsel Materyal</h2>
     <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Matematik ve fen için konuya özgü modeller; diğer derslerde kavram kartları. Adımları ilerletip soruyu çözün.</p>
   </header>
   <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 mb-5">
     {ENRICHMENT_LIBRARY[module].map((entry,i)=><button key={i} type="button" title={entry.topic} aria-label={`${i+1}. ${entry.topic}`} aria-pressed={index===i} onClick={()=>reset(i)} className={`rounded-lg py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${index===i?'text-white shadow-md':'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}`} style={index===i?{backgroundColor:colors[i]}:undefined}>{i+1}</button>)}
   </div>
   <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
     <div className="px-4 py-3 flex items-center justify-between gap-2 text-white" style={{backgroundColor:color}}>
       <strong className="text-sm">{item.topic}</strong><span className="text-xs font-semibold">Materyal {index+1}/10</span>
     </div>
     <div className="relative min-h-56 p-5 sm:p-7 flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950 overflow-hidden">
       <div aria-hidden="true" className="absolute inset-0 opacity-20" style={{backgroundImage:`radial-gradient(${color} 1px, transparent 1px)`,backgroundSize:'22px 22px'}}/>
       <div className="relative flex items-center gap-3 w-full max-w-md justify-center">
         <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-md transition-all duration-500" style={{backgroundColor:color,transform:stage>0?'translateY(-5px) scale(1.05)':'none'}}>{index+1}</div>
         <div className="flex-1 min-w-0">
           <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div className="h-full transition-all duration-700" style={{backgroundColor:color,width:`${(stage+1)*33.34}%`}}/></div>
           <div className="mt-3 text-center rounded-xl border-2 bg-white dark:bg-slate-900 px-3 py-4 text-lg sm:text-xl font-bold break-words transition-all duration-500" style={{borderColor:color,color}}>{module==='mathematics' ? <MathConceptDiagram index={index} stage={stage} /> : module==='science' ? <ScienceConceptDiagram index={index} stage={stage} /> : icons[module][index]}</div>
         </div>
       </div>
       <div className="relative text-center max-w-lg">
         <p className="font-semibold text-slate-900 dark:text-white">{descriptors[module][index]}</p>
         <p className="mt-2 text-sm text-slate-600 dark:text-slate-300" aria-live="polite">{stage===0?'Modeldeki sembolleri ve ilişkileri inceleyin.':stage===1?item.question:'Şimdi kendi yanıtınızı oluşturun. Hazır olduğunuzda açıklamayı açın.'}</p>
       </div>
       <div className="relative flex gap-2" role="group" aria-label="Öğrenme aşamaları">
         {[0,1,2].map(step=><button key={step} type="button" aria-label={`Görsel adım ${step+1}`} aria-pressed={stage===step} onClick={()=>setStage(step)} className={`h-3 rounded-full transition-all duration-300 ${stage===step?'w-10':'w-3 bg-slate-300 dark:bg-slate-600'}`} style={stage===step?{backgroundColor:color}:undefined}/>)}
       </div>
     </div>
   </div>
   <div className="mt-4 flex flex-wrap gap-2">
     <button type="button" onClick={()=>setStage(v=>(v+1)%3)} className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{backgroundColor:color}}>Sonraki Aşama</button>
     <button type="button" onClick={()=>setShowAnswer(v=>!v)} className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-900 dark:text-white">{showAnswer?'Yanıtı Gizle':'Yanıtı Kontrol Et'}</button>
     <button type="button" onClick={()=>reset((index+1)%10)} className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-900 dark:text-white">Sonraki Materyal</button>
   </div>
   {showAnswer&&<div className="mt-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4" aria-live="polite">
     <p className="font-semibold text-emerald-900 dark:text-emerald-200">{item.answer}</p>
     <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{item.explanation}</p>
   </div>}
   <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Görseller şematiktir; tarih, bilim ve kavram modelleri ölçekli fiziksel simülasyon değildir. Hareketler kullanıcı kontrolüyle ilerler.</p>
 </section>;
}
