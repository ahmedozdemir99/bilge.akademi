import { useState } from 'react';
import { ENRICHMENT_LIBRARY, type EnrichmentModule } from '../../data/enrichmentLibrary';

const colors = ['#0d9488','#2563eb','#e11d48','#7c3aed','#d97706','#059669','#db2777','#0891b2','#ea580c','#65a30d'];
const labels: Record<EnrichmentModule,string> = {mathematics:'Matematik',science:'Fen',english:'İngilizce',history:'Tarih',literature:'Edebiyat',religion:'Din Kültürü',philosophy:'Felsefe'};
const descriptors: Record<EnrichmentModule,string[]> = {
 mathematics:['Ortak bölenler','Ortak katların buluşması','İndirim yüzdesi','Parçaların oranı','Denklemin dengesi','Olasılık modeli','Üslerin birleşmesi','Karelerin kökü','Alan modeli','Verilerin ortalaması'],
 science:['Hâl değişimi','Temas alanı ve basınç','Seri devre','Tamamlayıcı bazlar','Fotosentez girdileri','Eksen eğikliği','pH ölçeği','Kuvvet dengesi','Periyodik gruplar','Enerji aktarımı'],
 english:['Third-person singular','Past tense','Comparative adjective','Giving advice','Vocabulary contrast','Telling the time','Giving directions','Question structure','Prediction','Cause and effect'],
 history:['Anadolu tarihi','Fetih dönemi','Millî Mücadele','Meclisin açılması','Cumhuriyetin ilanı','Barış antlaşması','Ticaret ağları','Birincil kaynak','Bilginin yayılması','Kültürel miras'],
 literature:['Kişileştirme','Benzetme','Dörtlük','Tema','Ana düşünce','Anlatıcı','Deyim','Atasözü','Hikâye','Yazım kuralı'],
 religion:['Namaza giriş','Oruç vakitleri','Dayanışma','Emanet','Hak ve adalet','Ölçülü tüketim','Fâtiha','Güvenilirlik','Dua','İyilik'],
 philosophy:['Eleştirel düşünme','Tümdengelim','Ahlak felsefesi','Bilgi felsefesi','Varlık felsefesi','Argüman yapısı','Çelişmezlik','Özgür irade','Estetik','Sokratik diyalog']
};


const SUBJECT_STORYBOARDS: Record<'english'|'history'|'literature'|'religion'|'philosophy',string[][]> = {"english":[["go","he/she/it","goes"],["watch","yesterday","watched"],["fast","compare two things","faster"],["advice","should","should + verb"],["borrow","receive temporarily","lend = give"],["07:30","30 minutes past 7","half past seven"],["traffic lights","turn left","←"],["You like science","do + you + like","Do you like science?"],["tomorrow","prediction","will rain"],["Mia studies at night","because","it is quiet"]],"history":[["1071","Malazgirt","Anadolu"],["1453","İstanbul","II. Mehmet"],["19 Mayıs 1919","Samsun","Millî Mücadele"],["23 Nisan 1920","Ankara","TBMM"],["29 Ekim 1923","Cumhuriyet","yönetim biçimi"],["24 Temmuz 1923","Lozan","barış antlaşması"],["Doğu ↔ Batı","İpek Yolu","ticaret ve kültür"],["Mektup","olayın dönemi","birincil kaynak"],["Matbaa","kitap üretimi","bilgi yayılımı"],["Tarihî eser","koruma","gelecek kuşaklar"]],"literature":[["Güneş","gülümsedi","kişileştirme"],["Cesur kişi","aslan gibi","benzetme"],["Dize 1 + 2","Dize 3 + 4","dörtlük"],["Şiir","temel duygu","tema"],["Metin","temel mesaj","ana fikir"],["Ben","anlatıcı","birinci kişi"],["Etekleri zil çalmak","mecaz","çok sevinmek"],["Küçük birikim","zaman","büyük sonuç"],["Kişi + yer","zaman + olay","hikâye"],["her + şey","ayrı yazım","her şey"]],"religion":[["Namaza giriş","Allahu ekber","iftitah tekbiri"],["İmsak","oruç süresi","akşam"],["Paylaşma","ihtiyaç sahibi","dayanışma"],["Emanet","sorumluluk","güven"],["Hak","saygı","adalet"],["Kaynaklar","ölçülü kullanım","israfı önleme"],["Kur'an-ı Kerim","ilk sure","Fâtiha"],["Hz. Muhammed","güvenilirlik","el-Emîn"],["Şükür ve dilek","dua","Allah'a yönelme"],["İyilik","gönüllü yardım","sadaka"]],"philosophy":[["İddia","gerekçe","sorgulama"],["Bütün insanlar ölümlü","Sokrates insandır","Sokrates ölümlüdür"],["Eylem","iyi / kötü?","etik"],["Bilgi","kaynağı ve sınırları","epistemoloji"],["Var olan","varlık nedir?","ontoloji"],["Öncüller","gerekçelendirme","sonuç"],["P","P ve değil P","çelişki"],["Seçim","belirlenim","özgür irade"],["Sanat","güzellik","estetik"],["Soru","varsayımı açığa çıkar","yeni soru"]]};
function ConceptCanvas({module,index,stage}:{module:EnrichmentModule;index:number;stage:number}) {
 const nodes=module==='mathematics'
  ? [['24','36','EBOB = 12'],['8 ve 12','Katlar','24'],['240 TL','%25 indirim','180 TL'],['3 : 4','7 pay = 28','12 kız'],['3x + 7 = 28','3x = 21','x = 7'],['3 kırmızı','8 toplam','3/8'],['2³ · 2⁴','2³⁺⁴','128'],['√144','√81','21'],['10 × 6','÷ 2','30 cm²'],['35 toplam','5 sayı','7 ortalama']][index]
  :module==='science'
  ? [['Katı','Isı alır','Sıvı'],['Kuvvet','Yüzey alanı','Basınç'],['Pil','Seri bağlantı','Ampuller'],['A – T','G – C','DNA'],['Işık + su','Karbondioksit','Besin + oksijen'],['Eksen eğikliği','Dolanma','Mevsimler'],['Asit','Nötr','Baz'],['Ağırlık ↓','Kaldırma ↑','Denge'],['Aynı grup','Dış elektron','Benzer özellik'],['Üretici','Tüketici','Enerji akışı']][index]
  :SUBJECT_STORYBOARDS[module][index];
 const accent=colors[index];
 return <div className="relative mx-auto w-full max-w-[680px]" role="img" aria-label={`${nodes.slice(0,stage+1).join(' → ')} kavram akış şeması`}>
   <svg viewBox="0 0 680 235" className="block h-auto w-full" aria-hidden="true">
     <defs><linearGradient id="concept-card" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#ffffff"/><stop offset="1" stopColor="#eef5fa"/></linearGradient></defs>
     <path d="M115 118 H565" stroke={accent} strokeOpacity=".16" strokeWidth="7" strokeLinecap="round"/>
     {[0,1].map(i=><g key={i} opacity={stage>=i+1?1:.12}><path d={`M${210+i*180} 118 h70`} stroke={accent} strokeWidth="4" strokeDasharray="7 8" strokeLinecap="round"/><path d={`M${267+i*180} 109 l13 9 -13 9`} stroke={accent} fill="none" strokeWidth="4" strokeLinecap="round"/></g>)}
     {nodes.map((label,i)=><g key={i} opacity={i<=stage?1:.3} style={{transition:'opacity .35s ease'}}>
       <rect x={20+i*230} y="60" width="180" height="116" rx="24" fill="url(#concept-card)" stroke={i===stage?accent:'#d7e3ec'} strokeWidth={i===stage?3:2}/>
       <rect x={34+i*230} y="72" width="33" height="25" rx="8" fill={accent} opacity=".12"/>
       <text x={50+i*230} y="89" fill={accent} textAnchor="middle" fontSize="14" fontWeight="800">{i+1}</text>
       {(()=>{const words=label.split(' ');const lines:string[]=[];let line='';for(const word of words){if((line+' '+word).trim().length>16&&line){lines.push(line);line=word;}else line=(line+' '+word).trim();}if(line)lines.push(line);return lines.slice(0,3).map((part,j)=><text key={j} x={110+i*230} y={122+(j-(Math.min(lines.length,3)-1)/2)*19} fill="#163047" fontSize={part.length>16?12:15} fontWeight="700" textAnchor="middle">{part}</text>);})()}
     </g>)}
     <circle cx="340" cy="213" r="4" fill={accent} opacity=".45"/>
   </svg>
   <div className="mt-1 flex flex-wrap justify-center gap-2" aria-hidden="true">{nodes.slice(0,stage+1).map((node,i)=><span key={i} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">{node}</span>)}</div>
 </div>;
}
export function InteractiveVisualLab({module}:{module:EnrichmentModule}) {
 const [index,setIndex]=useState(0);
 const [stage,setStage]=useState(0);
 const [revealed,setRevealed]=useState(false);
 const [completed,setCompleted]=useState<number[]>([]);
 const [filter,setFilter]=useState<'all'|'remaining'>('all');
 const activities=ENRICHMENT_LIBRARY[module];
 const item=activities[index];
 const color=colors[index];
 const isComplete=completed.includes(index);
 const goTo=(next:number)=>{setIndex(next);setStage(0);setRevealed(false);};
 const finish=()=>{setRevealed(true);setCompleted(current=>current.includes(index)?current:[...current,index]);};
 const diagramStage=stage;
 const visible=activities.map((entry,i)=>({entry,i})).filter(({i})=>filter==='all'||!completed.includes(i));
 return <section className="mt-10 overflow-hidden rounded-2xl sm:rounded-[24px] border border-slate-200 bg-white shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900" aria-label={`${labels[module]} etkileşimli materyal atölyesi`}>
   <header className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 px-5 py-7 text-white sm:px-8 sm:py-9">
     <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border-[36px] border-white/5"/>
     <div className="relative flex flex-wrap items-start justify-between gap-4">
       <div className="max-w-xl">
         <p className="text-xs font-bold uppercase tracking-[.22em] text-teal-300">Bilge Akademi · Keşif Stüdyosu</p>
         <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{labels[module]} <span className="text-teal-300">Görsel Atölyesi</span></h2>
         <p className="mt-2 text-sm leading-6 text-slate-300">Kavramı keşfet, modeli incele, soruyu çöz. Yanıtı görmeden önce kendi düşünceni oluştur.</p>
       </div>
       <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-center backdrop-blur-sm">
         <div className="text-2xl font-black tabular-nums">{completed.length}<span className="text-base text-slate-300">/10</span></div>
         <p className="text-xs text-slate-300">Tamamlanan</p>
       </div>
     </div>
     <div className="relative mt-6 h-2 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-label="Tamamlanan materyaller" aria-valuenow={completed.length} aria-valuemin={0} aria-valuemax={10}>
       <div className="h-full rounded-full bg-gradient-to-r from-teal-300 to-emerald-400 transition-[width] duration-500" style={{width:`${completed.length*10}%`}}/>
     </div>
   </header>
   <div className="grid gap-0 xl:grid-cols-[220px_minmax(0,1fr)]">
     <aside className="border-b border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-950/40 xl:border-b-0 xl:border-r xl:p-4" aria-label="Materyal listesi">
       <div className="mb-3 flex items-center justify-between gap-2">
         <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Konu Haritası</h3>
         <button type="button" onClick={()=>setFilter(v=>v==='all'?'remaining':'all')} aria-pressed={filter==='remaining'} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">{filter==='all'?'Kalanlar':'Tümü'}</button>
       </div>
       <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 xl:grid-cols-1">
         {visible.map(({entry,i})=><button type="button" key={i} onClick={()=>goTo(i)} aria-current={index===i?'step':undefined} className={`flex min-w-0 items-center gap-2 rounded-xl border p-2.5 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${index===i?'border-teal-500 bg-teal-50 shadow-sm dark:border-teal-400 dark:bg-teal-950/40':'border-transparent bg-white hover:border-slate-300 dark:bg-slate-800/70 dark:hover:border-slate-600'}`}>
           <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${completed.includes(i)?'bg-emerald-600 text-white':index===i?'bg-teal-700 text-white':'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200'}`}>{completed.includes(i)?'✓':i+1}</span>
           <span className="min-w-0 truncate text-xs font-semibold text-slate-800 dark:text-slate-100" title={entry.topic}>{entry.topic}</span>
         </button>)}
       </div>
       {visible.length===0&&<p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">Tebrikler! Tüm materyalleri tamamladın.</p>}
     </aside>
     <div className="min-w-0 p-4 sm:p-7">
       <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
         <div>
           <p className="text-xs font-bold uppercase tracking-widest text-teal-700 dark:text-teal-300">Materyal {index+1} / {activities.length}</p>
           <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">{item.topic}</h3>
           <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{descriptors[module][index]}</p>
         </div>
         <span className={`rounded-full px-3 py-1 text-xs font-bold ${isComplete?'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200':'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'}`}>{isComplete?'✓ İncelendi':'● Keşfediliyor'}</span>
       </div>
       <div className="mb-4 grid grid-cols-3 gap-2" aria-label="Öğrenme aşamaları">
         {['Keşfet','İlişkilendir','Düşün'].map((label,i)=><button type="button" key={label} onClick={()=>setStage(i)} aria-current={stage===i?'step':undefined} className={`min-w-0 rounded-xl border px-2 py-3 text-center text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 sm:text-sm ${stage===i?'border-teal-600 bg-teal-700 text-white':'border-slate-200 bg-slate-50 text-slate-600 hover:border-teal-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>{i+1}. {label}</button>)}
       </div>
       <div className="relative flex min-h-[220px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white px-4 py-8 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900 sm:min-h-[280px] sm:px-8">
         <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-20" style={{backgroundImage:`radial-gradient(${color} 1px, transparent 1px)`,backgroundSize:'24px 24px'}}/>
         <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-black text-white shadow-lg sm:h-16 sm:w-16" style={{backgroundColor:color}}>{index+1}</div>
         <div className="relative flex min-h-[150px] w-full max-w-3xl items-center justify-center rounded-2xl border border-slate-200 bg-white/95 px-4 py-5 shadow-sm dark:border-slate-600 dark:bg-slate-950/90" aria-live="polite">
           <ConceptCanvas module={module} index={index} stage={diagramStage}/>
         </div>
         <div className="relative mt-5 max-w-lg text-center">
           <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{stage===0?'Önce modeldeki öğeleri tanı.':stage===1?'Öğeler arasındaki bağlantıyı düşün.':'Soruyu çöz; sonucu hazır olduğunda aç.'}</p>
           {stage===2&&<p className="mt-3 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-medium leading-6 text-indigo-950 dark:bg-indigo-950/50 dark:text-indigo-100">{item.question}</p>}
         </div>
       </div>
       <div className="mt-5 flex flex-wrap items-center gap-2">
         <button type="button" onClick={()=>setStage(v=>Math.max(0,v-1))} disabled={stage===0} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-100">← Önceki adım</button>
         {stage<2?<button type="button" onClick={()=>setStage(v=>Math.min(2,v+1))} className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500">Devam Et →</button>:<button type="button" onClick={()=>revealed?setRevealed(false):finish()} className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500">{revealed?'Çözümü Gizle':'Çözümü Göster ✓'}</button>}
         <button type="button" onClick={()=>goTo((index+1)%activities.length)} className="ml-auto rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800">Sonraki Konu →</button>
       </div>
       {revealed&&<div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950/30" role="status">
         <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Açıklamalı Çözüm</p>
         <p className="mt-2 text-lg font-extrabold text-emerald-950 dark:text-emerald-100">{item.answer}</p>
         <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-200">{item.explanation}</p>
       </div>}
       <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">Materyaller eğitim amaçlı şematik modellerdir; ölçekli fiziksel simülasyon değildir. Adımlar kullanıcı denetiminde ilerler.</p>
     </div>
   </div>
 </section>;
}
