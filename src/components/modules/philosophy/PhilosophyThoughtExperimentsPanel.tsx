import React, { useState } from 'react';
import { Brain, CheckCircle2, Compass, Lightbulb } from 'lucide-react';

interface ThoughtExperiment {
  id: string;
  title: string;
  philosopher: string;
  era: string;
  theme: string;
  scenario: string;
  coreQuestion: string;
  choices: {
    id: string;
    label: string;
    philosophicalLens: string;
    analysis: string;
  }[];
  middleSchoolTakeaway: string;
}

const THOUGHT_EXPERIMENTS: ThoughtExperiment[] = [
  {
    id: 'ship-of-theseus',
    title: 'Theseus’un Gemisi',
    philosopher: 'Plutarkhos & Thomas Hobbes',
    era: 'Antik Çağ – 17. Yüzyıl',
    theme: 'Kimlik ve Değişim',
    scenario:
      'Ünlü kahraman Theseus’un ahşap gemisi bir müzede sergilenmektedir. Yıllar geçtikçe çürüyen her tahta çıkarılıp yerine tıpatıp aynı yeni bir tahta takılır. 50 yıl sonra geminin ilk hâlinden tek bir parça bile kalmamıştır. Üstelik bir marangoz, atılan eski tahtaları toplayıp kenarda ikinci bir gemi kurar.',
    coreQuestion: 'Sizce gerçek “Theseus’un Gemisi” hangisidir?',
    choices: [
      {
        id: 'new',
        label: 'Müzede duran, parçaları zamanla yenilenmiş gemi',
        philosophicalLens: 'Biçim ve Süreklilik Yaklaşımı (Aristoteles)',
        analysis:
          'İnsan vücudundaki hücreler de yıllar içinde yenilenir ama biz hâlâ aynı kişi kalırız. Önemli olan maddenin kendisi değil, biçim, amaç ve tarihsel sürekliliktir.',
      },
      {
        id: 'old',
        label: 'Eski tahtalardan yeniden birleştirilen gemi',
        philosophicalLens: 'Maddi Özdeşlik Yaklaşımı',
        analysis:
          'Bir nesneyi o nesne yapan şey onu oluşturan özgün maddesidir. Orijinal parçalar yeniden bir araya geldiğinde ilk varlık geri dönmüş sayılır.',
      },
      {
        id: 'both',
        label: 'Artık iki farklı kimlik doğmuştur; hiçbiri tek başına ilk gemi değildir',
        philosophicalLens: 'Süreç Felsefesi (Herakleitos)',
        analysis:
          'Herakleitos’un “Aynı nehirde iki kez yıkanılmaz” sözündeki gibi her şey sürekli değişir; kimlik sabit bir taş değil, yaşayan bir süreçtir.',
      },
    ],
    middleSchoolTakeaway:
      'Büyüdükçe boyumuz, bilgimiz ve alışkanlıklarımız değişir; peki bizi “biz” yapan değişmeyen öz nedir? Bu deney öz-kimlik üzerine düşünmemizi sağlar.',
  },
  {
    id: 'plato-cave',
    title: 'Platon’un Mağara Alegorisi',
    philosopher: 'Platon',
    era: 'MÖ 4. Yüzyıl',
    theme: 'Bilgi, Algı ve Eğitim',
    scenario:
      'Doğduklarından beri karanlık bir mağarada yüzleri duvara dönük yaşayan insanlar hayal edin. Arkalarında yanan bir ateş vardır ve ateşin önünden geçen nesnelerin gölgeleri duvara yansır. Bu insanlar yalnızca gölgeleri gördükleri için tüm gerçekliğin o gölgelerden ibaret olduğunu sanırlar. Bir gün içlerinden biri dışarı çıkıp güneşi ve gerçek nesneleri görür.',
    coreQuestion: 'Güneşi gören kişi mağaraya geri dönüp arkadaşlarına gerçeği anlatsa sizce nasıl bir yol izlemelidir?',
    choices: [
      {
        id: 'gradual',
        label: 'Gözleri kamaşmasın diye onları adım adım ve sorular sorarak ışığa alıştırmalıdır',
        philosophicalLens: 'Sokratik Eğitim Anlayışı',
        analysis:
          'Platon’a göre eğitim zorla bilgi doldurmak değil, zihnin gözünü yavaşça gölgelerden gerçeğe çevirme sanatıdır.',
      },
      {
        id: 'evidence',
        label: 'Dışarıdan somut bir nesne getirip duvardaki gölgesiyle karşılaştırmalıdır',
        philosophicalLens: 'Deneysel Kanıt Yaklaşımı (Empirizm)',
        analysis:
          'Soyut anlatım yerine gözlemlenebilir karşılaştırmalar sunmak, önyargıları kırmanın en ikna edici yollarından biridir.',
      },
      {
        id: 'choice',
        label: 'Gerçeği anlatıp dışarı çıkma kararını herkesin kendi özgür iradesine bırakmalıdır',
        philosophicalLens: 'Özerklik ve Eleştirel Özgürlük',
        analysis:
          'Hakikat arayışı ancak kişinin kendi merakı ve özgür seçimiyle anlam kazanır; baskı gerçek kavrayış üretmez.',
      },
    ],
    middleSchoolTakeaway:
      'Günümüzde sosyal medyada veya internette gördüğümüz her haber bir “gölge” olabilir. Kaynağını araştırıp doğrulamak mağaradan çıkıp ışığa yürümektir.',
  },
  {
    id: 'ring-of-gyges',
    title: 'Gyges’in Görünmezlik Yüzüğü',
    philosopher: 'Platon (Devlet Diyaloğu)',
    era: 'MÖ 4. Yüzyıl',
    theme: 'Ahlak ve Vicdan',
    scenario:
      'Çoban Gyges, bir fırtına sonrası toprakta sihirli bir yüzük bulur. Yüzüğün taşını içine çevirdiğinde tamamen görünmez olmakta, kimse onun ne yaptığını görememektedir. Artık hiçbir kurala yakalanma riski olmadan istediğini yapabilecek güçtedir.',
    coreQuestion: 'Hiç kimse görmeyecek ve ceza olmayacak olsa bile bir insan neden dürüst ve adil kalmalıdır?',
    choices: [
      {
        id: 'character',
        label: 'Çünkü dürüstlük başkası için değil, kendi iç huzurumuz ve karakterimiz içindir',
        philosophicalLens: 'Erdem Etiği (Sokrates & Aristoteles)',
        analysis:
          'Sokrates’e göre haksızlık yapmak, haksızlığa uğramaktan daha çok insanın kendi ruhuna zarar verir; erdem insanı bütünlüklü kılar.',
      },
      {
        id: 'universal',
        label: 'Çünkü herkes gizlice hile yapsa kimsenin güvenemeyeceği bir dünya oluşur',
        philosophicalLens: 'Evrensel Ödev Ahlakı (Immanuel Kant)',
        analysis:
          'Kant’ın kesin buyruğuna göre, herkesin yapmasını istemeyeceğimiz bir eylemi kendimize de hak görmemeliyiz.',
      },
      {
        id: 'empathy',
        label: 'Çünkü yapılan haksızlık başka bir insanın hakkına ve emeğine zarar verir',
        philosophicalLens: 'Empati ve Toplumsal Sorumluluk (Yunus Emre & Fârâbî)',
        analysis:
          'Adalet, yalnızca görünür kurallar değil; başkasının emeğini ve gönlünü incitmeme bilincidir.',
      },
    ],
    middleSchoolTakeaway:
      'Sınavda gözetmen bakmıyorken kopya çekmemek veya yerde bulunan eşyayı sahibine teslim etmek, Gyges’in yüzüğüne karşı karakter sınavından geçmektir.',
  },
  {
    id: 'flying-man',
    title: 'İbn Sînâ’nın Uçan Adam Deneyi',
    philosopher: 'İbn Sînâ',
    era: '11. Yüzyıl',
    theme: 'Öz-Bilinç ve Zihin',
    scenario:
      'Gözleri kapalı, kulakları hiçbir ses duymayan, uzuvları birbirine değmeyen ve boşlukta süzülen bir insan düşünün. Hava o kadar ılık ki teni soğuk ya da sıcak bile hissetmiyor; yani beş duyusundan hiçbir veri almıyor.',
    coreQuestion: 'Hiçbir duyu verisi almayan bu insan yine de kendi varlığının farkında olur mu?',
    choices: [
      {
        id: 'yes-self',
        label: 'Evet, dış dünyayı hissetmese bile “ben varım” bilincine sahip olur',
        philosophicalLens: 'İbn Sînâ’nın Öz-Bilinç Tezi',
        analysis:
          'İbn Sînâ’ya göre insanın kendi benliğini bilmesi duyu organlarına bağlı değildir; bilinç doğrudan kendi varlığını kavrar.',
      },
      {
        id: 'need-senses',
        label: 'Hayır, zihin ancak dış dünyayla ve duyularla etkileşerek kendini tanır',
        philosophicalLens: 'Empirizm (John Locke)',
        analysis:
          'Deneycilere göre zihin dış dünyadan gelen izlenimler olmadan düşünce içeriği üretemez; öz-farkındalık deneyimle gelişir.',
      },
      {
        id: 'memory',
        label: 'Ancak geçmiş anıları veya düşünme yetisi varsa kendi varlığını kavrar',
        philosophicalLens: 'Bilinç ve Yönelimsellik Yaklaşımı',
        analysis:
          'Çağdaş zihin felsefesi, bilincin her zaman bir düşünceye veya anıya yönelerek işlediğini vurgular.',
      },
    ],
    middleSchoolTakeaway:
      'İbn Sînâ bu zekice düşünce deneyiyle Descartes’ın “Düşünüyorum, öyleyse varım” sözünden 600 yıl önce zihin ve bilinç üzerine devrimsel bir soru ortaya atmıştır.',
  },
  {
    id: 'chinese-room',
    title: 'Çin Odası ve Yapay Zekâ',
    philosopher: 'John Searle',
    era: '1980 · Çağdaş Felsefe',
    theme: 'Yapay Zekâ ve Anlamak',
    scenario:
      'Hiç Çince bilmeyen bir kişi kapalı bir odada oturuyor. Önünde kalın bir kural kitabı var: Kapı altından Çince semboller geldiğinde kitaba bakıp hangi sembolü geri göndereceğini buluyor ve dışarı uzatıyor. Dışarıdaki Çince konuşanlar onun mükemmel Çince bildiğini sanıyor.',
    coreQuestion: 'Odadaki kişi (veya benzer şekilde çalışan bir bilgisayar) sizce gerçekten Çince “anlıyor” mu?',
    choices: [
      {
        id: 'no-syntax',
        label: 'Hayır, sadece sembolleri kurallara göre eşleştiriyor; anlamını hissetmiyor',
        philosophicalLens: 'Sözdizim – Anlambilim Ayrımı (John Searle)',
        analysis:
          'Searle’e göre kuralları hızlı uygulamak (sözdizim), o sözcüklerin gerçek anlamını yaşamak (anlambilim) ile aynı şey değildir.',
      },
      {
        id: 'system',
        label: 'Kişi tek başına anlamasa da oda + kitap + kişi bir bütün olarak anlıyor sayılır',
        philosophicalLens: 'Sistem Yanıtı (Bilgisayar Bilimi Yaklaşımı)',
        analysis:
          'Beynimizdeki tek bir sinir hücresi de tek başına Türkçe bilmez; ancak tüm sistem birlikte çalıştığında anlama ortaya çıkar.',
      },
      {
        id: 'tool',
        label: 'Makineler güçlü yardımcı araçlardır ama bilinç ve duygudaşlık insana özgüdür',
        philosophicalLens: 'İnsan Merkezli Teknoloji Etiği',
        analysis:
          'Yapay zekâ bilgiyi düzenlemede büyük kolaylık sağlar; eleştirel yargı, vicdan ve sorumluluk ise daima insanda kalır.',
      },
    ],
    middleSchoolTakeaway:
      'Bir formülü veya tanımı yalnızca kurala göre ezberlemek “Çin Odası” gibidir; gerçekten öğrenmek ise nedenini ve anlamını kavramaktır.',
  },
];

export function PhilosophyThoughtExperimentsPanel() {
  const [selectedId, setSelectedId] = useState<string>(THOUGHT_EXPERIMENTS[0].id);
  const [pickedChoices, setPickedChoices] = useState<Record<string, string>>({});

  const active =
    THOUGHT_EXPERIMENTS.find((e) => e.id === selectedId) ?? THOUGHT_EXPERIMENTS[0];
  const pickedId = pickedChoices[active.id];
  const pickedChoice = active.choices.find((c) => c.id === pickedId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Experiment Selector List */}
      <aside className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-navy-900 dark:text-white">
            İnteraktif Düşünce Deneyleri ({THOUGHT_EXPERIMENTS.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Bir senaryo seçin, kendi kararınızı verin ve felsefi açılımı keşfedin.
          </p>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {THOUGHT_EXPERIMENTS.map((exp, idx) => {
            const isSel = exp.id === active.id;
            const answered = Boolean(pickedChoices[exp.id]);
            return (
              <button
                key={exp.id}
                type="button"
                onClick={() => setSelectedId(exp.id)}
                className={`w-full text-left p-4 transition-colors cursor-pointer ${
                  isSel
                    ? 'bg-navy-900 text-white dark:bg-teal-600'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-mono ${
                      isSel ? 'text-gold-300 dark:text-white/90' : 'text-teal-700 dark:text-teal-400'
                    }`}
                  >
                    0{idx + 1} · {exp.theme}
                  </span>
                  {answered && (
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSel ? 'text-emerald-300' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    />
                  )}
                </div>
                <p
                  className={`mt-1 text-sm font-semibold ${
                    isSel ? 'text-white' : 'text-navy-900 dark:text-white'
                  }`}
                >
                  {exp.title}
                </p>
                <p
                  className={`mt-0.5 text-xs ${
                    isSel ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {exp.philosopher} · {exp.era}
                </p>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Active Thought Experiment Stage */}
      <article className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-7 space-y-6">
        <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
              {active.theme} · {active.philosopher} ({active.era})
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-navy-900 dark:text-white">
              {active.title}
            </h2>
          </div>
          <Brain className="w-6 h-6 text-gold-600 dark:text-gold-400 shrink-0" />
        </div>

        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-xs font-semibold text-navy-900 dark:text-gold-400">Senaryo</p>
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            {active.scenario}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-navy-900 dark:text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>{active.coreQuestion}</span>
          </p>

          <div className="space-y-2.5">
            {active.choices.map((ch) => {
              const isPicked = pickedId === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() =>
                    setPickedChoices((prev) => ({ ...prev, [active.id]: ch.id }))
                  }
                  className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                    isPicked
                      ? 'border-teal-600 bg-teal-50/80 dark:bg-teal-950/40 text-navy-900 dark:text-white font-medium'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/40 text-slate-700 dark:text-slate-200 hover:border-teal-500'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{ch.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {pickedChoice && (
          <div className="p-5 rounded-xl bg-navy-900 text-white space-y-2.5">
            <p className="text-xs font-medium text-gold-400">
              Seçiminizin Felsefi Bakış Açısı · {pickedChoice.philosophicalLens}
            </p>
            <p className="text-sm text-slate-100 leading-relaxed">{pickedChoice.analysis}</p>
          </div>
        )}

        <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-slate-700 dark:text-amber-100 leading-relaxed">
          <Lightbulb className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-navy-900 dark:text-gold-300">Günlük Yaşam Bağlantısı: </strong>
            {active.middleSchoolTakeaway}
          </div>
        </div>
      </article>
    </div>
  );
}
