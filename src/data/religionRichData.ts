export interface WuduStep {
  stepNumber: number;
  title: string;
  arabicOrShort: string;
  ruleType: 'Farz' | 'Sünnet';
  repeatCount: number;
  bodyHighlight: 'hands' | 'mouth' | 'nose' | 'face' | 'arms' | 'head' | 'ears' | 'feet' | 'heart';
  description: string;
  duaOrNote: string;
}

export interface PrayerPostureStep {
  stepNumber: number;
  title: string;
  postureKey: 'niyyah' | 'takbir' | 'qiyam' | 'ruku' | 'qawmah' | 'sujud1' | 'jalsa' | 'sujud2' | 'tashahhud' | 'salam';
  ruleType: 'Farz' | 'Vacip' | 'Sünnet';
  recitationTr: string;
  meaningTr: string;
  howToPerform: string;
}

export interface DailyPrayerRow {
  name: string;
  sunnahBefore: number;
  fard: number;
  sunnahAfter: number;
  wajib: number;
  total: number;
  timeNote: string;
}

export interface HajjStage {
  step: number;
  name: string;
  ruleType: 'Farz' | 'Vacip' | 'Sünnet';
  location: string;
  summary: string;
  spiritualMeaning: string;
}

export interface WisdomStory {
  id: string;
  title: string;
  figure: string;
  theme: 'Dürüstlük' | 'Sabır ve Şükür' | 'Vefa ve Aile' | 'Adalet ve Merhamet' | 'İlim ve Tevazu';
  era: string;
  storyParagraphs: string[];
  moralLesson: string;
  relatedVerseOrHadith: string;
}

export interface QariOption {
  id: 'husary' | 'alafasy' | 'abdulbasit' | 'minshawi';
  name: string;
  countryAndStyle: string;
  surahBaseUrl: string;
  ayahBaseUrl: string;
}

export const QARI_OPTIONS: QariOption[] = [
  {
    id: 'husary',
    name: 'Mahmud Halil el-Husarî',
    countryAndStyle: 'Mısır · Tecvid ve Eğitim Odaklı Murattel',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/mahmood_khaleel_al-husaree',
    ayahBaseUrl: 'https://everyayah.com/data/Husary_128kbps',
  },
  {
    id: 'alafasy',
    name: 'Mişâri Râşid el-Afâsî',
    countryAndStyle: 'Kuveyt · Akıcı ve Berrak Tilavet',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee',
    ayahBaseUrl: 'https://everyayah.com/data/Alafasy_128kbps',
  },
  {
    id: 'abdulbasit',
    name: 'Abdülbâsit Abdüssamed',
    countryAndStyle: 'Mısır · Klasik Murattel Tilavet',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/abdul_basit_murattal',
    ayahBaseUrl: 'https://everyayah.com/data/Abdul_Basit_Murattal_192kbps',
  },
  {
    id: 'minshawi',
    name: 'Muhammed Sıddîk el-Minşâvî',
    countryAndStyle: 'Mısır · Huşu Dolu Murattel Tilavet',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/muhammad_siddeeq_al-minshaawee',
    ayahBaseUrl: 'https://everyayah.com/data/Minshawy_Murattal_128kbps',
  },
];

export interface SurahDuaEntry {
  id: string;
  title: string;
  category: 'Namaz Suresi' | 'Namaz Duası' | 'Ayet';
  audioType: 'surah' | 'ayah' | 'dua';
  surahNumber?: string;
  ayahCode?: string;
  quranApiRef?: { type: 'surah' | 'ayah'; ref: string };
  staticArabicText?: string;
  transliteration: string;
  turkishMeaning: string;
  keyMessage: string;
}

export function getQariAudioUrl(
  entry: SurahDuaEntry,
  qariId: QariOption['id']
): string | null {
  const qari = QARI_OPTIONS.find((q) => q.id === qariId) ?? QARI_OPTIONS[0];
  if (entry.audioType === 'surah' && entry.surahNumber) {
    return `${qari.surahBaseUrl}/${entry.surahNumber}.mp3`;
  }
  if (entry.audioType === 'ayah' && entry.ayahCode) {
    return `${qari.ayahBaseUrl}/${entry.ayahCode}.mp3`;
  }
  return null;
}

export const WUDU_STEPS: WuduStep[] = [
  {
    stepNumber: 1,
    title: 'Niyet ve Besmele',
    arabicOrShort: 'Bismillâhirrahmânirrahîm',
    ruleType: 'Sünnet',
    repeatCount: 1,
    bodyHighlight: 'heart',
    description: 'Kalpten "Niyet ettim Allah rızası için abdest almaya" diye niyet edilir ve Eûzü Besmele çekilir.',
    duaOrNote: 'Her hayırlı işe Besmele ile başlamak bereket ve bilinç kazandırır.',
  },
  {
    stepNumber: 2,
    title: 'Elleri Bileklere Kadar Yıkamak',
    arabicOrShort: 'Önce sağ, parmak aralarıyla',
    ruleType: 'Sünnet',
    repeatCount: 3,
    bodyHighlight: 'hands',
    description: 'Eller bileklere kadar, parmak araları hilallenerek (ovalanarak) üç kez yıkanır.',
    duaOrNote: 'Suyu israf etmeden musluğu dengeli açmak Peygamberimizin (s.a.v.) önemli bir tavsiyesidir.',
  },
  {
    stepNumber: 3,
    title: 'Ağıza Su Vermek (Mazmaza)',
    arabicOrShort: 'Sağ avuçla 3 kez çalkalama',
    ruleType: 'Sünnet',
    repeatCount: 3,
    bodyHighlight: 'mouth',
    description: 'Sağ avuçla ağıza üç kez su alınır ve ağız içi iyice çalkalanır.',
    duaOrNote: 'Oruçlu değilken suyu boğaza kaçırmadan biraz daha derinden çalkalamak sünnettir.',
  },
  {
    stepNumber: 4,
    title: 'Buruna Su Çekmek (İstinşak)',
    arabicOrShort: 'Sağ elle çekip sol elle temizleme',
    ruleType: 'Sünnet',
    repeatCount: 3,
    bodyHighlight: 'nose',
    description: 'Sağ avuçla buruna üç kez hafifçe su çekilir, sol elle sümkürerek temizlenir.',
    duaOrNote: 'Solunum yollarının temizlenmesine ve ferahlamaya vesile olur.',
  },
  {
    stepNumber: 5,
    title: 'Yüzü Yıkamak',
    arabicOrShort: 'Abdestin 1. Farzı',
    ruleType: 'Farz',
    repeatCount: 3,
    bodyHighlight: 'face',
    description: 'Alnın saç bitiminden çene altına ve bir kulak yumuşağından diğerine kadar yüzün tamamı üç kez yıkanır.',
    duaOrNote: 'Yüzün tamamında kuru yer kalmaması abdestin farzlarındandır (Maide Suresi, 6).',
  },
  {
    stepNumber: 6,
    title: 'Kolları Dirseklerle Beraber Yıkamak',
    arabicOrShort: 'Abdestin 2. Farzı (Önce Sağ, Sonra Sol)',
    ruleType: 'Farz',
    repeatCount: 3,
    bodyHighlight: 'arms',
    description: 'Önce sağ kol, ardından sol kol parmak uçlarından dirsekler de dâhil olmak üzere üçer kez yıkanır.',
    duaOrNote: 'Dirseklerin arkası ve kol saatlerinin/bilekliklerin altı kuru kalmamalıdır.',
  },
  {
    stepNumber: 7,
    title: 'Başı Mesh Etmek',
    arabicOrShort: 'Abdestin 3. Farzı',
    ruleType: 'Farz',
    repeatCount: 1,
    bodyHighlight: 'head',
    description: 'Islak sağ el (veya her iki el) ile başın en az dörtte biri (sünnet olarak tamamı) mesh edilir.',
    duaOrNote: 'Mesh, ıslak eli yıkamadan hafifçe başın üzerinden geçirmektir.',
  },
  {
    stepNumber: 8,
    title: 'Kulakları ve Enseyi Mesh Etmek',
    arabicOrShort: 'İşaret ve başparmaklarla',
    ruleType: 'Sünnet',
    repeatCount: 1,
    bodyHighlight: 'ears',
    description: 'Islak şehadet parmaklarıyla kulak içi, başparmaklarla kulak arkası; kalan üç parmağın dışıyla ense mesh edilir.',
    duaOrNote: 'Boğaz (ön boyun) mesh edilmez; yalnızca kulaklar ve ense hafifçe mesh edilir.',
  },
  {
    stepNumber: 9,
    title: 'Ayakları Topuklarla Beraber Yıkamak',
    arabicOrShort: 'Abdestin 4. Farzı (Önce Sağ, Sonra Sol)',
    ruleType: 'Farz',
    repeatCount: 3,
    bodyHighlight: 'feet',
    description: 'Önce sağ ayak, ardından sol ayak parmak araları ve topuk kemikleri dâhil olmak üzere üçer kez yıkanır.',
    duaOrNote: 'Abdest bitince Kelime-i Şehadet getirmek ve şükretmek güzel bir sünnettir.',
  },
];

export const PRAYER_POSTURE_STEPS: PrayerPostureStep[] = [
  {
    stepNumber: 1,
    title: 'Kıbleye Yönelme ve Niyet',
    postureKey: 'niyyah',
    ruleType: 'Farz',
    recitationTr: 'Niyet ettim Allah rızası için bugünkü (ör. Sabah) namazının farzını kılmaya.',
    meaningTr: 'Gönülden Allah’a yönelmek ve hangi namazı kılacağını bilmek.',
    howToPerform: 'Kıbleye (Kâbe yönüne) dönülür, ayaklar omuz hizasına yakın doğal bir açıklıkta tutulur ve niyet edilir.',
  },
  {
    stepNumber: 2,
    title: 'İftitah (Başlangıç) Tekbiri',
    postureKey: 'takbir',
    ruleType: 'Farz',
    recitationTr: 'Allâhu Ekber',
    meaningTr: 'Allah en büyüktür.',
    howToPerform: 'Erkekler başparmakları kulak yumuşağına değecek şekilde, hanımlar elleri omuz hizasına kaldırarak tekbir alır ve namaza girer.',
  },
  {
    stepNumber: 3,
    title: 'Kıyam ve Kıraat (Ayakta Okuma)',
    postureKey: 'qiyam',
    ruleType: 'Farz',
    recitationTr: 'Sübhaneke · Eûzü-Besmele · Fatiha Suresi · Zamm-ı Sure (ör. İhlas)',
    meaningTr: 'Allah’ı tesbih eder, yalnızca O’ndan yardım ve doğru yol dileriz.',
    howToPerform: 'Eller bağlanır (erkekler göbek altında, hanımlar göğüs üzerinde), gözler secde yerine bakar ve sureler huşu içinde okunur.',
  },
  {
    stepNumber: 4,
    title: 'Rükû (Eğilme)',
    postureKey: 'ruku',
    ruleType: 'Farz',
    recitationTr: 'Allâhu Ekber (eğilirken) · 3 kez: Sübhâne Rabbiye’l-Azîm',
    meaningTr: 'Yüce Rabbim her türlü eksiklikten uzaktır.',
    howToPerform: 'Eller diz kapaklarına konur, sırt yere paralel olacak şekilde düz tutulur ve üç defa rükû tesbihi okunur.',
  },
  {
    stepNumber: 5,
    title: 'Kavme (Rükûdan Doğrulma)',
    postureKey: 'qawmah',
    ruleType: 'Vacip',
    recitationTr: 'Semiallâhu limen hamideh · Rabbenâ leke’l-hamd',
    meaningTr: 'Allah kendisine hamd edeni işitir. Rabbimiz, hamd yalnız sanadır.',
    howToPerform: 'Rükûdan tam olarak doğrulunur, bir an ayakta sakinleşilir (tâdil-i erkân) ve ardından tekbirle secdeye inilir.',
  },
  {
    stepNumber: 6,
    title: 'Birinci Secde',
    postureKey: 'sujud1',
    ruleType: 'Farz',
    recitationTr: 'Allâhu Ekber (inerken) · 3 kez: Sübhâne Rabbiye’l-A’lâ',
    meaningTr: 'En yüce olan Rabbim her türlü eksiklikten uzaktır.',
    howToPerform: 'Dizler, eller, alın ve burun yere konur; ayak parmak uçları kıbleye dönük olur ve üç kez secde tesbihi okunur.',
  },
  {
    stepNumber: 7,
    title: 'Celse (İki Secde Arası Oturuş)',
    postureKey: 'jalsa',
    ruleType: 'Vacip',
    recitationTr: 'Allâhu Ekber (kalkarken) · Kısa sükûnet (Rabbiğfir lî)',
    meaningTr: 'Rabbim beni bağışla.',
    howToPerform: 'Birinci secdeden doğrulup kısa bir süre eller dizlerin üzerinde olacak şekilde oturulur.',
  },
  {
    stepNumber: 8,
    title: 'İkinci Secde',
    postureKey: 'sujud2',
    ruleType: 'Farz',
    recitationTr: 'Allâhu Ekber · 3 kez: Sübhâne Rabbiye’l-A’lâ',
    meaningTr: 'En yüce olan Rabbim her türlü eksiklikten uzaktır.',
    howToPerform: 'Tekrar secdeye varılır. Böylece bir rekatın secdeleri tamamlanmış olur (1. rekat sonunda kıyama, son rekatta oturuşa geçilir).',
  },
  {
    stepNumber: 9,
    title: 'Ka’de-i Âhire (Son Oturuş)',
    postureKey: 'tashahhud',
    ruleType: 'Farz',
    recitationTr: 'Ettehiyyâtü · Allâhümme Salli · Allâhümme Bârik · Rabbenâ Âtinâ & Rabbenâğfirlî',
    meaningTr: 'Dil, beden ve mal ile yapılan tüm ibadetler Allah’adır; Peygamberimize salat ve ümmete dua edilir.',
    howToPerform: 'Son rekatın ikinci secdesinden sonra oturulur; eller uyluklar üzerinde dizlere yakın tutulur ve dualar okunur.',
  },
  {
    stepNumber: 10,
    title: 'Sağa ve Sola Selam Verme',
    postureKey: 'salam',
    ruleType: 'Vacip',
    recitationTr: 'Es-selâmü aleyküm ve rahmetullâh (Önce sağa, sonra sola)',
    meaningTr: 'Allah’ın selamı ve rahmeti üzerinize olsun.',
    howToPerform: 'Baş önce sağ omuza, ardından sol omuza çevrilerek selam verilir ve namaz tamamlanır.',
  },
];

export const DAILY_PRAYER_TABLE: DailyPrayerRow[] = [
  { name: 'Sabah Namazı', sunnahBefore: 2, fard: 2, sunnahAfter: 0, wajib: 0, total: 4, timeNote: 'İmsak ile güneş doğuşu arası' },
  { name: 'Öğle Namazı', sunnahBefore: 4, fard: 4, sunnahAfter: 2, wajib: 0, total: 10, timeNote: 'Güneş tepeyi aştıktan ikindiye kadar' },
  { name: 'İkindi Namazı', sunnahBefore: 4, fard: 4, sunnahAfter: 0, wajib: 0, total: 8, timeNote: 'Öğleden sonra güneş batımına kadar' },
  { name: 'Akşam Namazı', sunnahBefore: 0, fard: 3, sunnahAfter: 2, wajib: 0, total: 5, timeNote: 'Güneş batımından yatsı vaktine kadar' },
  { name: 'Yatsı ve Vitir', sunnahBefore: 4, fard: 4, sunnahAfter: 2, wajib: 3, total: 13, timeNote: 'Gece karanlığından imsak vaktine kadar' },
];

export const HAJJ_STAGES: HajjStage[] = [
  {
    step: 1,
    name: 'İhrama Girmek',
    ruleType: 'Farz',
    location: 'Mîkât Sınırları',
    summary: 'Hac veya umre niyetiyle dikişsiz beyaz örtülere (erkekler) bürünüp Telbiye ("Lebbeyk Allâhümme Lebbeyk") getirilir.',
    spiritualMeaning: 'Tüm dünyevi makam ve statü farklarının ortadan kalktığını, Allah katında herkesin eşit olduğunu simgeler.',
  },
  {
    step: 2,
    name: 'Arafat Vakfesi',
    ruleType: 'Farz',
    location: 'Arafat Meydanı (Zilhicce 9)',
    summary: 'Arefe günü öğleden bayram sabahına kadar Arafat’ta bir süre bulunup dua ve tövbe edilir. ("Hac Arafat’tır.")',
    spiritualMeaning: 'Mahşer gününü hatırlatır; insanın kendini muhasebe edip yenilenme sözü vermesidir.',
  },
  {
    step: 3,
    name: 'Müzdelife Vakfesi ve Taş Toplama',
    ruleType: 'Vacip',
    location: 'Müzdelife',
    summary: 'Arefe gecesi Müzdelife’de akşam ve yatsı namazları cem edilerek kılınır, Mina’da atılacak küçük taşlar toplanır.',
    spiritualMeaning: 'Müminlerin dayanışma, sabır ve ortak bilinç içinde geceyi ihya etmesidir.',
  },
  {
    step: 4,
    name: 'Şeytan Taşlama ve Kurban',
    ruleType: 'Vacip',
    location: 'Mina (Cemerat)',
    summary: 'Bayram günlerinde sembolik olarak şeytan taşlanır; temettü ve kıran haccı yapanlar şükür kurbanı keser ve tıraş olur.',
    spiritualMeaning: 'Hz. İbrahim’in teslimiyetini örnek alarak nefsin kötülüğe çağıran vesveselerine "hayır" demektir.',
  },
  {
    step: 5,
    name: 'Ziyaret Tavafı (7 Şavt)',
    ruleType: 'Farz',
    location: 'Mescid-i Haram (Kâbe)',
    summary: 'Hacerü’l-Esved hizasından başlayarak Kâbe’yi sola alıp saat yönünün tersine 7 kez dönülür.',
    spiritualMeaning: 'Evrendeki gezegenlerin ve atomların yörüngesi gibi tüm yaşamı Allah’ın rızası merkezine oturtmaktır.',
  },
  {
    step: 6,
    name: 'Safa ile Merve Arasında Sa’y',
    ruleType: 'Vacip',
    location: 'Safa – Merve Tepeleri',
    summary: 'Safa’dan Merve’ye 4 gidiş, Merve’den Safa’ya 3 dönüş olmak üzere toplam 7 şavt yürünür.',
    spiritualMeaning: 'Hz. Hacer’in oğlu Hz. İsmail için su arayışındaki ümit, gayret ve tevekkülü hatırlatır.',
  },
];

export const ZAKAT_RECIPIENTS = [
  { group: 'Fakirler', note: 'Temel ihtiyaçlarını karşılayacak yeterli geliri olmayanlar' },
  { group: 'Miskinler', note: 'Hiçbir geliri ve malı bulunmayan düşkünler' },
  { group: 'Zekât Görevlileri', note: 'Zekâtı toplayıp ihtiyaç sahiplerine ulaştıran görevliler' },
  { group: 'Kalpleri Isındırılanlar', note: 'İslam’a gönlü ısındırılmak istenenler' },
  { group: 'Özgürlüğüne Kavuşturulacaklar', note: 'Esaretten veya ağır mağduriyetten kurtarılacaklar' },
  { group: 'Borçlular', note: 'Borcunu ödemekte zorlanan ihtiyaç sahipleri' },
  { group: 'Allah Yolunda Olanlar', note: 'İlim, eğitim ve toplum yararına hayır hizmetleri' },
  { group: 'Yolda Kalmışlar', note: 'Memleketinde imkânı olsa da yolculukta çaresiz kalanlar' },
];

export const WISDOM_STORIES: WisdomStory[] = [
  {
    id: 'ws-1',
    title: 'Hz. Ömer ve Sütüne Su Katmayan Genç Kız',
    figure: 'Hz. Ömer (r.a.)',
    theme: 'Dürüstlük',
    era: 'Dört Halife Dönemi',
    storyParagraphs: [
      'Halife Hz. Ömer (r.a.), Medine halkının durumunu yerinde görmek için geceleri sokakları dolaşırdı. Bir gece dinlenmek üzere bir evin duvarına yaslandığında içeriden anne ile kızının konuşmasını duydu.',
      'Anne, sabah satacakları süte biraz su katmasını söyledi. Genç kız ise: "Anneciğim, Halife Ömer süte su katılmasını yasakladı" diyerek itiraz etti. Anne: "Bu saatte Ömer bizi nereden görecek?" deyince genç kız şu tarihî cevabı verdi: "Ömer bizi görmese de Ömer’in Rabbi bizi görüyor!"',
      'Bu üstün ahlak ve özdenetim karşısında çok duygulanan Hz. Ömer, ertesi gün bu dürüst aileyle tanıştı ve oğlu Asım’ı bu erdemli kızla evlendirdi. Bu evlilikten İslam tarihinin adalet sembolü Ömer bin Abdülaziz’in annesi dünyaya geldi.',
    ],
    moralLesson: 'Gerçek dürüstlük, yalnızca insanların gördüğü yerde değil; kimsenin görmediği anlarda da doğruluktan ayrılmamaktır (İhsan bilinci).',
    relatedVerseOrHadith: '"Nerede olursanız olun, O sizinle beraberdir. Allah yaptıklarınızı görendir." (Hadid Suresi, 4)',
  },
  {
    id: 'ws-2',
    title: 'Hz. Lokman’ın Oğluna Altın Öğütleri',
    figure: 'Hz. Lokman (a.s.)',
    theme: 'İlim ve Tevazu',
    era: 'Peygamber ve Hikmet Kıssaları',
    storyParagraphs: [
      'Kur’an-ı Kerim’de kendisine hikmet verildiği bildirilen Hz. Lokman, oğlunu sevgi dolu bir üslupla ("Yavrucuğum!") diye çağırarak hayat boyu rehber olacak temel ahlak ilkelerini öğretmiştir.',
      'Oğluna önce Allah’a şirk koşmamasını, anne ve babasına iyi davranmasını, hardal tanesi kadar küçük bir iyilik veya kötülüğün bile Allah katında gizli kalmayacağını hatırlatmıştır.',
      'Ardından toplumsal nezaketi öğütlemiştir: "İnsanlara küçümseyerek yüz çevirme, yeryüzünde böbürlenerek yürüme. Yürüyüşünde ölçülü ol ve konuşurken sesini alçalt."',
    ],
    moralLesson: 'Hikmetli insan; tevazuyu, ölçülü davranmayı, anne-babaya hürmeti ve başkalarına karşı nazik bir dili hayat tarzı hâline getirir.',
    relatedVerseOrHadith: '"Yürüyüşünde tabii ol, sesini alçalt..." (Lokman Suresi, 19)',
  },
  {
    id: 'ws-3',
    title: 'İmam-ı Azam Ebu Hanife ve Kumaşın Kusuru',
    figure: 'İmam-ı Azam Ebu Hanife',
    theme: 'Dürüstlük',
    era: 'İslam Medeniyeti (8. Yüzyıl)',
    storyParagraphs: [
      'Büyük İslam bilgini İmam-ı Azam Ebu Hanife aynı zamanda dürüstlüğüyle tanınan bir kumaş tüccarıydı. Bir gün ortağı Hafs’a satması için bir top ipek kumaş bırakmış ve kumaşın bir kenarında küçük bir kusur bulunduğunu, müşteriye bunu mutlaka söylemesini tembihlemişti.',
      'Hafs kumaşı sattı ancak yoğunluktan müşteriye o küçük kusuru söylemeyi unuttu. Müşterinin kim olduğunu da bilmiyordu. Durumu öğrenen Ebu Hanife, o satıştan elde edilen bütün parayı kendi cebine koymayı içine sindiremedi.',
      'Haksız kazanç şüphesi taşıyan bu gelirin tamamını ihtiyaç sahiplerine sadaka olarak dağıttı ve ortaklığını helal kazanç hassasiyeti üzerine yeniden düzenledi.',
    ],
    moralLesson: 'Ticarette ve günlük hayatta kusuru gizlememek, helal kazanç ve kul hakkı gözetmek İslam ahlakının temel direklerindendir.',
    relatedVerseOrHadith: '"Bizi aldatan bizden değildir." (Hadis-i Şerif, Müslim)',
  },
  {
    id: 'ws-4',
    title: 'Veysel Karani ve Anne Sevgisi',
    figure: 'Üveys el-Karanî (Veysel Karani)',
    theme: 'Vefa ve Aile',
    era: 'Asr-ı Saadet',
    storyParagraphs: [
      'Yemen’in Karen köyünde yaşayan Veysel Karani, Peygamber Efendimiz’i (s.a.v.) görmeyi ve sohbetinde bulunmayı her şeyden çok arzuluyordu. Ancak yaşlı ve bakıma muhtaç annesini yalnız bırakamıyordu.',
      'Nihayet annesinden izin alarak Medine’ye kadar uzun bir yolculuk yaptı. Eve vardığında Peygamberimizin seferde olduğunu öğrendi. Annesine verdiği "fazla kalmadan döneceğim" sözünü tutmak için Efendimiz’i göremeden Yemen’e geri döndü.',
      'Peygamber Efendimiz döndüğünde onun vefasını ve annesine hizmetini övdü, hırkasının kendisine hediye edilmesini vasiyet etti. Bugün İstanbul Fatih’te bulunan Hırka-i Şerif bu eşsiz anne sevgisinin hatırasıdır.',
    ],
    moralLesson: 'Anne ve babaya gösterilen şefkat, verilen söze sadakat ve sorumluluk bilinci en kıymetli ibadetler arasındadır.',
    relatedVerseOrHadith: '"Cennet annelerin ayakları altındadır." (Hadis-i Şerif, Nesâî)',
  },
  {
    id: 'ws-5',
    title: 'Yunus Emre’nin Dergâha Getirdiği Düzgün Odunlar',
    figure: 'Yunus Emre & Taptuk Emre',
    theme: 'Sabır ve Şükür',
    era: 'Anadolu Selçuklu Dönemi (13. Yüzyıl)',
    storyParagraphs: [
      'Yunus Emre, hocası Taptuk Emre’nin dergâhında yıllarca hizmet etmiş, ormandan sırtında odun taşıyarak nefsini terbiye etmiştir. Dikkat çeken ilginç bir ayrıntı vardır: Yunus’un getirdiği odunların arasında tek bir eğri odun bile bulunmazmış.',
      'Bir gün Taptuk Emre gülümseyerek sormuş: "Yunus, ormanda hiç mi eğri odun kalmadı?" Yunus Emre edeple başını eğip şu ölümsüz cevabı vermiş: "Ormanda eğri odun çoktur sultanım; ama bu kapıdan içeri eğrilik girmez!"',
      'Bu samimiyet ve doğruluk terbiyesi, Yunus Emre’yi Türkçenin ve gönül dünyamızın en berrak şairlerinden biri hâline getirmiştir.',
    ],
    moralLesson: 'Yaptığımız en küçük işi bile özenle, doğrulukla ve samimiyetle yapmak karakterimizi olgunlaştırır.',
    relatedVerseOrHadith: '"Emrolunduğun gibi dosdoğru ol!" (Hûd Suresi, 112)',
  },
  {
    id: 'ws-6',
    title: 'Hilfü’l-Fudûl (Erdemliler İttifakı)',
    figure: 'Hz. Muhammed (s.a.v.)',
    theme: 'Adalet ve Merhamet',
    era: 'Peygamberlik Öncesi Mekke',
    storyParagraphs: [
      'Yemenli bir tüccar Mekke’ye gelip mallarını güçlü bir kimseye satmış, ancak alacağını alamamıştı. Şehirde kimsesi olmadığı için Kâbe yakınındaki tepeden feryat ederek adalet istedi.',
      'Bunun üzerine Mekke’nin vicdanlı insanları toplanarak "Hilfü’l-Fudûl" (Erdemliler İttifakı) adlı bir topluluk kurdular. Kim olursa olsun haksızlığa uğrayan herkesin hakkını savunmaya yemin ettiler ve tüccarın hakkını geri aldılar.',
      'Henüz genç yaşta bu topluluğa katılan Hz. Muhammed (s.a.v.), peygamber olduktan sonra bile bu antlaşmayı övmüş ve: "Bugün de öyle bir adalet çağrısı yapılsa tereddüt etmeden katılırım" buyurmuştur.',
    ],
    moralLesson: 'Adalet, mazlumun yanında durmak ve haksızlığa karşı birleşmek insanlığın ortak erdemidir.',
    relatedVerseOrHadith: '"Ey iman edenler! Adaleti titizlikle ayakta tutan şahitler olun." (Nisa Suresi, 135)',
  },
  {
    id: 'ws-7',
    title: 'Mevlana’nın Pergel Metaforu',
    figure: 'Mevlana Celaleddin-i Rumi',
    theme: 'İlim ve Tevazu',
    era: 'Anadolu Selçuklu (Konya)',
    storyParagraphs: [
      'Mevlana Celaleddin-i Rumi, öğrencilerine kendi değerlerine bağlı kalarak dünyaya açık olmayı harika bir geometri metaforuyla anlatmıştır: Pergel.',
      'Mevlana şöyle der: "Biz pergel gibiyiz. Bir ayağımız sağlamca kendi değerlerimizde ve inancımızda sabit durur; diğer ayağımızla yetmiş iki milleti dolaşır, bütün insanlığa sevgi ve merhametle yaklaşırız."',
      'Bu denge, insanın hem kendi köklerini ve kimliğini korumasını hem de farklı kültürlerle saygı ve hoşgörü içinde yaşamasını sağlar.',
    ],
    moralLesson: 'Köklerine sağlam basan insan, dünyayı ve farklılıkları korkmadan, hoşgörü ve merhametle kucaklayabilir.',
    relatedVerseOrHadith: '"Ey insanlar! Sizi bir erkek ve bir dişiden yarattık; tanışasınız diye milletlere ve kabilelere ayırdık." (Hucurat Suresi, 13)',
  },
  {
    id: 'ws-8',
    title: 'Şeyh Edebali’nin Osman Gazi’ye Nasihati',
    figure: 'Şeyh Edebali',
    theme: 'Adalet ve Merhamet',
    era: 'Osmanlı Kuruluş Dönemi',
    storyParagraphs: [
      'Anadolu’nun gönül mimarlarından Şeyh Edebali, Osmanlı Devleti’nin kurucusu Osman Gazi’ye devlet yönetiminin ve insan olmanın özünü anlatan meşhur nasihatini vermiştir.',
      '"Ey oğul! Artık bey sensin. Bundan sonra öfke bize, uysallık sana; güceniklik bize, gönül almak sana; geçimsizlikler, çatışmalar bize, adalet sana! Sabretmesini bil; vaktinden önce çiçek açmaz."',
      'Nasihatin kalbinde ise bugün hâlâ yönetim ve ahlak felsefesinin zirvesi sayılan o cümle yer alır: "Ey oğul, insanı yaşat ki devlet yaşasın!"',
    ],
    moralLesson: 'Liderlik, üstünlük taslamak değil; öfkesine hâkim olmak, sabretmek, gönül almak ve insanı merkeze koymaktır.',
    relatedVerseOrHadith: '"İnsanların en hayırlısı, insanlara en faydalı olanıdır." (Hadis-i Şerif)',
  },
];

export const SURAH_DUA_LIBRARY: SurahDuaEntry[] = [
  {
    id: 'sd-1',
    title: 'Fatiha Suresi',
    category: 'Namaz Suresi',
    audioType: 'surah',
    surahNumber: '001',
    quranApiRef: { type: 'surah', ref: '1' },
    transliteration:
      'Bismillâhirrahmânirrahîm. Elhamdü lillâhi rabbi’l-âlemîn. Er-rahmânirrahîm. Mâliki yevmiddîn. İyyâke na’büdü ve iyyâke nesta’în. İhdinas-sırâtal müstakîm. Sırâtallezîne en’amte aleyhim ğayril mağdûbi aleyhim veleddâllîn.',
    turkishMeaning:
      'Rahmân ve Rahîm olan Allah’ın adıyla. Hamd, âlemlerin Rabbi Allah’a mahsustur. O, Rahmân’dır ve Rahîm’dir. Ceza (hesap) gününün sahibidir. (Rabbimiz!) Ancak sana kulluk eder ve yalnız senden yardım dileriz. Bizi doğru yola, kendilerine nimet verdiklerinin yoluna ilet; gazaba uğrayanların ve sapıtanların yoluna değil.',
    keyMessage: 'Kur’an’ın özeti ve namazın her rekatında okunan temel dua suresidir.',
  },
  {
    id: 'sd-2',
    title: 'İhlas Suresi',
    category: 'Namaz Suresi',
    audioType: 'surah',
    surahNumber: '112',
    quranApiRef: { type: 'surah', ref: '112' },
    transliteration:
      'Kul hüvallâhü ehad. Allâhüs-samed. Lem yelid ve lem yûled. Ve lem yekün lehû küfüven ehad.',
    turkishMeaning:
      'De ki: O, Allah’tır, bir tektir. Allah Samed’dir (her şey O’na muhtaçtır; O hiçbir şeye muhtaç değildir). O doğurmamış ve doğmamıştır. O’nun hiçbir dengi yoktur.',
    keyMessage: 'Tevhid inancını (Allah’ın birliğini ve eşsizliğini) en yalın biçimde ifade eder.',
  },
  {
    id: 'sd-8',
    title: 'Felak Suresi',
    category: 'Namaz Suresi',
    audioType: 'surah',
    surahNumber: '113',
    quranApiRef: { type: 'surah', ref: '113' },
    transliteration:
      'Kul eûzü birabbil felak. Min şerri mâ halak. Ve min şerri ğâsikın izâ vekab. Ve min şerrin-neffâsâti fil ukad. Ve min şerri hâsidin izâ hased.',
    turkishMeaning:
      'De ki: Yarattığı şeylerin kötülüğünden, karanlığı çöktüğü zaman gecenin kötülüğünden, düğümlere üfleyenlerin kötülüğünden ve haset ettiği zaman hasetçinin kötülüğünden sabah aydınlığının Rabbine sığınırım.',
    keyMessage: 'Her türlü görünür ve görünmez kötülükten yalnızca Allah’a sığınmayı öğretir.',
  },
  {
    id: 'sd-9',
    title: 'Nâs Suresi',
    category: 'Namaz Suresi',
    audioType: 'surah',
    surahNumber: '114',
    quranApiRef: { type: 'surah', ref: '114' },
    transliteration:
      'Kul eûzü birabbin-nâs. Melikin-nâs. İlâhin-nâs. Min şerril vesvâsil hannâs. Ellezî yüvesvisü fî sudûrin-nâs. Minel cinneti ven-nâs.',
    turkishMeaning:
      'De ki: Cinlerden ve insanlardan; insanların kalplerine vesvese veren sinsi vesvesecinin kötülüğünden, insanların Rabbine, insanların Melik’ine, insanların İlah’ına sığınırım.',
    keyMessage: 'İçsel vesveselere ve olumsuz telkinlere karşı Allah’a sığınma duasıdır.',
  },
  {
    id: 'sd-3',
    title: 'Asr Suresi',
    category: 'Namaz Suresi',
    audioType: 'surah',
    surahNumber: '103',
    quranApiRef: { type: 'surah', ref: '103' },
    transliteration:
      'Vel-asr. İnnel insâne lefî husr. İllellezîne âmenû ve amilus-sâlihâti ve tevâsav bil-hakkı ve tevâsav bis-sabr.',
    turkishMeaning:
      'Asra (zamana) yemin olsun ki, insan gerçekten ziyandadır. Ancak iman edip salih amel işleyenler, birbirlerine hakkı tavsiye edenler ve birbirlerine sabrı tavsiye edenler müstesna.',
    keyMessage: 'Zamanın kıymetini ve kurtuluşun dört şartını (iman, salih amel, hak, sabır) öğretir.',
  },
  {
    id: 'sd-4',
    title: 'Kevser Suresi',
    category: 'Namaz Suresi',
    audioType: 'surah',
    surahNumber: '108',
    quranApiRef: { type: 'surah', ref: '108' },
    transliteration:
      'İnnâ a’taynâkel kevser. Fesalli lirabbike venhar. İnne şânieke hüvel ebter.',
    turkishMeaning:
      'Şüphesiz biz sana Kevser’i (bitmez tükenmez nimetleri) verdik. Öyleyse Rabbin için namaz kıl ve kurban kes. Doğrusu sana buğzeden, soyu kesik olanın ta kendisidir.',
    keyMessage: 'Nimetlere karşı şükür bilincini, namaz ve kurban ibadetlerini hatırlatır.',
  },
  {
    id: 'sd-5',
    title: 'Ayetel Kürsi (Bakara, 255)',
    category: 'Ayet',
    audioType: 'ayah',
    ayahCode: '002255',
    quranApiRef: { type: 'ayah', ref: '2:255' },
    transliteration:
      'Allâhü lâ ilâhe illâ hüvel hayyül kayyûm. Lâ te’huzühû sinetün ve lâ nevm. Lehû mâ fis-semâvâti ve mâ fil-ard. Men zellezî yeşfeu indehû illâ bi-iznih. Ya’lemü mâ beyne eydîhim ve mâ halfehüm ve lâ yuhîtûne bişey’in min ilmihî illâ bimâ şâe. Vesia kürsiyyühüs-semâvâti vel-ard ve lâ yeûdühû hıfzuhümâ ve hüvel aliyyül azîm.',
    turkishMeaning:
      'Allah’tan başka hiçbir ilah yoktur. O daima diridir (Hayy), bütün varlığın idaresini yürütendir (Kayyûm). O’nu ne uyuklama tutar ne de uyku. Göklerde ve yerde ne varsa O’nundur. O’nun izni olmadan katında kim şefaat edebilir? O, kullarının yaptıklarını ve yapacaklarını bilir. O’nun kürsüsü gökleri ve yeri içine alır; onları koruyup gözetmek kendisine zor gelmez. O, yücedir, büyüktür.',
    keyMessage: 'Allah’ın sonsuz kudretini, ilmini ve evren üzerindeki hâkimiyetini anlatır.',
  },
  {
    id: 'sd-7a',
    title: 'Rabbenâ Âtinâ Duası (Bakara, 201)',
    category: 'Namaz Duası',
    audioType: 'ayah',
    ayahCode: '002201',
    quranApiRef: { type: 'ayah', ref: '2:201' },
    transliteration:
      'Rabbenâ âtinâ fid-dünyâ haseneten ve fil-âhirati haseneten ve kınâ azâbennâr.',
    turkishMeaning:
      'Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver ve bizi ateş azabından koru.',
    keyMessage: 'Namazın son oturuşunda okunan, hem dünya hem ahiret iyiliği dileyen Kur’an duasıdır.',
  },
  {
    id: 'sd-7b',
    title: 'Rabbenâğfirlî Duası (İbrahim, 41)',
    category: 'Namaz Duası',
    audioType: 'ayah',
    ayahCode: '014041',
    quranApiRef: { type: 'ayah', ref: '14:41' },
    transliteration:
      'Rabbenâğfirlî ve livâlideyye ve lil-mü’minîne yevme yekûmül hisâb.',
    turkishMeaning:
      'Rabbimiz! Hesap görülecek günde beni, anne-babamı ve bütün müminleri bağışla.',
    keyMessage: 'Anne-babaya vefa ve tüm müminler için bağışlanma dileyen Kur’an duasıdır.',
  },
  {
    id: 'sd-6',
    title: 'Sübhaneke Duası',
    category: 'Namaz Duası',
    audioType: 'dua',
    staticArabicText:
      'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَجَلَّ ثَنَاؤُكَ وَلَا إِلَهَ غَيْرُكَ',
    transliteration:
      'Sübhânekellâhümme ve bihamdik ve tebârakesmük ve teâlâ ceddük (ve celle senâük*) ve lâ ilâhe ğayrük.',
    turkishMeaning:
      'Allah’ım! Sen eksik sıfatlardan uzaksın; seni daima hamd ile anarım. Senin adın mübarektir, şanın yücedir. Senden başka ilah yoktur. (*"ve celle senâük" yalnız cenaze namazında okunur.)',
    keyMessage: 'Namaza başlarken Allah’ı yüceltmek için okunan ilk sünnet duasıdır.',
  },
  {
    id: 'sd-10',
    title: 'Ettehiyyâtü (Tahiyyat) Duası',
    category: 'Namaz Duası',
    audioType: 'dua',
    staticArabicText:
      'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ ۝ السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ ۝ السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ ۝ أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    transliteration:
      'Ettehiyyâtü lillâhi ves-salevâtü vet-tayyibât. Es-selâmü aleyke eyyühen-nebiyyü ve rahmetullâhi ve berekâtüh. Es-selâmü aleynâ ve alâ ibâdillâhis-sâlihîn. Eşhedü en lâ ilâhe illallâh ve eşhedü enne Muhammeden abdühû ve rasûlüh.',
    turkishMeaning:
      'Dil, beden ve mal ile yapılan bütün ibadetler Allah’a mahsustur. Ey Peygamber! Allah’ın selamı, rahmeti ve bereketi senin üzerine olsun. Selam bize ve Allah’ın salih kullarının üzerine olsun. Şahitlik ederim ki Allah’tan başka ilah yoktur ve yine şahitlik ederim ki Hz. Muhammed O’nun kulu ve elçisidir.',
    keyMessage: 'Namazların ilk ve son oturuşlarında okunan temel şehadet ve selam duasıdır.',
  },
];
