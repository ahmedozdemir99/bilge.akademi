import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import type { ModuleId } from '../../types/academy';

interface Practice {
  module: ModuleId;
  subject: string;
  topic: string;
  question: string;
  answer: string;
}

const exercises: Practice[] = [
  {
    module: 'mathematics', subject: 'Matematik', topic: 'Yüzdeler',
    question: '200 TL’lik bir kitabın fiyatı önce %25 düşüyor, sonra yeni fiyat %20 artıyor. Son fiyat kaç TL olur?',
    answer: '180 TL. İndirimden sonra fiyat 150 TL olur. %20 artış bu tutar üzerinden hesaplanır: 150 × 1,20 = 180.',
  },
  {
    module: 'literature', subject: 'Türkçe ve Edebiyat', topic: 'Söz sanatları',
    question: '“Rüzgâr bütün gece pencereye masal anlattı.” cümlesinde hangi söz sanatı kullanılmıştır? Gerekçenizi söyleyin.',
    answer: 'Kişileştirme. İnsanlara özgü masal anlatma eylemi rüzgâra yüklenmiştir.',
  },
  {
    module: 'history', subject: 'Tarih', topic: 'Kaynak karşılaştırma',
    question: 'Bir günlük ile yıllar sonra yazılmış bir anı aynı olayı farklı anlatıyor. İki metni değerlendirirken hangi iki soruyu sorardınız?',
    answer: '“Yazar olayın doğrudan tanığı mı?” ve “Metin ne zaman, hangi amaçla yazılmış?” İki anlatıyı bağımsız kaynaklarla da karşılaştırabilirsiniz.',
  },
  {
    module: 'science', subject: 'Fen Bilimleri', topic: 'Elektrik devreleri',
    question: 'Özdeş iki ampul paralel bağlanıyor. Ampullerden biri çıkarılırsa diğer ampul neden yanmaya devam eder?',
    answer: 'Her ampul ayrı bir koldadır. Bir kol açıldığında diğer kol üzerinden akım geçmeye devam eder.',
  },
  {
    module: 'english', subject: 'İngilizce', topic: 'Davet ve öneri',
    question: '“Would you like to study together after school?” sorusunu bir gerekçe vererek kibarca reddedin ve başka bir zaman önerin.',
    answer: '“I’d love to, but I have basketball practice today. How about tomorrow?” Önce daveti nazikçe karşılayıp sonra bir alternatif öneriyoruz.',
  },
  {
    module: 'religion', subject: 'Din Kültürü', topic: 'Sorumluluk',
    question: 'Bir grup çalışmasında bir arkadaşınız görevini yetiştiremedi. Sorumluluğu paylaşırken onun emeğini nasıl koruyabilirsiniz?',
    answer: 'Önce hangi desteğe ihtiyacı olduğunu sorun. Kalan işleri birlikte bölüşün, teslimde de herkesin katkısını olduğu gibi belirtin.',
  },
  {
    module: 'philosophy', subject: 'Felsefe', topic: 'Gerekçe ve karşı örnek',
    question: '“Çoğu insan bir fikre inanıyorsa o fikir doğrudur.” iddiasına nasıl bir karşı örnek verebilirsiniz?',
    answer: 'Bir sınıfta çoğu kişi bir sorunun cevabını B sanabilir, ama çözüm C’yi gösterebilir. Bir fikrin yaygınlığı, doğruluğunu tek başına kanıtlamaz.',
  },
];

function getDailyIndex() {
  const today = new Date();
  const day = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 86400000;
  return day % exercises.length;
}

export function DailyPractice({ openModule }: { openModule: (module: ModuleId) => void }) {
  const [index, setIndex] = useState(getDailyIndex);
  const [revealed, setRevealed] = useState(false);
  const exercise = exercises[index];

  return (
    <section id="gunluk-alistirma" tabIndex={-1} aria-labelledby="practice-title" className="grid scroll-mt-24 gap-5 rounded-xl bg-navy-900 p-6 text-white sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-8">
      <div className="flex items-start gap-4">
        <span className="hidden size-12 shrink-0 place-items-center rounded-xl bg-teal-500/20 text-teal-200 sm:grid">
          <BookOpen aria-hidden="true" className="size-6" />
        </span>
        <div>
          <h2 id="practice-title" className="text-2xl font-semibold">Günlük alıştırma</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-200 sm:text-base">Soruyu düşünün, ardından kendi yanıtınızı örnek çözümle karşılaştırın.</p>
        </div>
      </div>
      <div className="border-t border-white/15 pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
        <div aria-live="polite">
          <p className="text-sm font-medium text-teal-200">{exercise.subject} · {exercise.topic}</p>
          <p className="mt-2 text-base leading-relaxed">{exercise.question}</p>
        </div>
        <p id="daily-practice-answer" hidden={!revealed} className="mt-3 border-l-2 border-teal-300 pl-3 text-base leading-relaxed text-slate-200">
          {exercise.answer}
        </p>
        <div className="control-grid mt-4 gap-2 [--control-min-width:12rem] sm:[--control-min-width:8.5rem]">
          <button type="button" aria-expanded={revealed} aria-controls="daily-practice-answer" onClick={() => setRevealed(!revealed)} className="min-h-11 rounded-lg bg-gold-400 px-4 py-2 text-sm font-semibold text-navy-950 hover:bg-gold-500">
            {revealed ? 'Yanıtı gizle' : 'Yanıtı göster'}
          </button>
          <button type="button" onClick={() => { setIndex((index + 1) % exercises.length); setRevealed(false); }} className="min-h-11 rounded-lg border border-white/30 px-4 py-2 text-sm font-medium hover:bg-white/10">
            Başka alıştırma
          </button>
          <button type="button" onClick={() => openModule(exercise.module)} className="min-h-11 rounded-lg border border-white/30 px-4 py-2 text-sm font-medium hover:bg-white/10">
            Ders modülünü aç
          </button>
        </div>
      </div>
    </section>
  );
}
