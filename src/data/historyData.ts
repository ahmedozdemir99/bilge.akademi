export interface HistoricalEvent {
  id: string;
  year: number; // negative for MÖ
  displayDate: string;
  title: string;
  scope: 'turkish' | 'world';
  period: string;
  category: 'devlet' | 'savas' | 'antlasma' | 'kultur';
  locationName: string;
  mapX: number; // 0-1000 SVG coordinate (approximate historical location)
  mapY: number; // 0-500 SVG coordinate
  causes: string[];
  development: string;
  consequences: string[];
  significance: string;
  keyFigures: string[];
  sources: string[];
}

export interface HistoryQuizItem {
  id: string;
  type: 'mcq' | 'match';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const WORLD_PERIODS = [
  'İlk Çağ',
  'Orta Çağ',
  'Yeni Çağ',
  'Yakın Çağ',
  'Çağdaş Dünya Tarihi',
];

export const TURKISH_PERIODS = [
  'İlk Türk Devletleri',
  'Türk-İslam Devletleri',
  'Selçuklular',
  'Osmanlı Devleti',
  'Millî Mücadele',
  'Türkiye Cumhuriyeti Tarihi',
];

export const HISTORICAL_EVENTS: HistoricalEvent[] = [
  {
    id: 'sumer-yazi',
    year: -3200,
    displayDate: 'MÖ y. 3200',
    title: 'Sümerlerde Çivi Yazısının İcadı',
    scope: 'world',
    period: 'İlk Çağ',
    category: 'kultur',
    locationName: 'Aşağı Mezopotamya (Uruk Bölgesi)',
    mapX: 545,
    mapY: 288,
    causes: [
      'Tapınak (ziggurat) depolarındaki tarım ürünlerinin kayıt altına alınması ihtiyacı.',
      'Ticaret ve vergi hesaplarının kalıcı biçimde saklanması zorunluluğu.',
    ],
    development:
      'Sümer rahipleri kil tabletler üzerine piktogramlarla başlayan işaretler kazıdı; zamanla bu işaretler hece temelli çivi yazısına dönüştü.',
    consequences: [
      'Tarih öncesi devirler sona erdi ve yazılı tarih (İlk Çağ) başladı.',
      'Yasalar, antlaşmalar, edebî metinler ve bilimsel gözlemler sonraki kuşaklara aktarıldı.',
    ],
    significance: 'İnsanlık tarihinde bilgi birikiminin nesiller arası kalıcı aktarımını başlatan kırılma noktasıdır.',
    keyFigures: ['Sümer tapınak kâtipleri', 'Urukagina (ilk yazılı reformlar)'],
    sources: ['Samuel Noah Kramer, Tarih Sümer’de Başlar', 'UNESCO Dünya Bellek Arşivi'],
  },
  {
    id: 'orhun-yazitlari',
    year: 732,
    displayDate: 'MS 732 – 735',
    title: 'II. Göktürk Devleti ve Orhun Yazıtları',
    scope: 'turkish',
    period: 'İlk Türk Devletleri',
    category: 'kultur',
    locationName: 'Orhun Vadisi (Orta Asya)',
    mapX: 785,
    mapY: 162,
    causes: [
      'Bağımsızlık mücadelesini, devlet felsefesini ve töreyi gelecek nesillere öğüt olarak bırakma amacı.',
      'Türk boylarının birlik bilincini pekiştirme ihtiyacı.',
    ],
    development:
      'Bilge Kağan, Kül Tigin ve Vezir Tonyukuk adına dikilen anıtlar, Yolluğ Tigin tarafından Göktürk alfabesiyle taşa kazındı.',
    consequences: [
      'Türk dilinin ve tarihinin bilinen en eski büyük yazılı belgeleri ortaya çıktı.',
      '“Sosyal devlet” ve kağanın halka karşı sorumluluğu yazılı siyasetname geleneğine dönüştü.',
    ],
    significance: 'Türk adının geçtiği ilk Türkçe yazılı belgeler olup Türk dil tarihi açısından temel kaynaktır.',
    keyFigures: ['Bilge Kağan', 'Kül Tigin', 'Vezir Tonyukuk', 'Yolluğ Tigin'],
    sources: ['Talat Tekin, Orhon Yazıtları', 'Muharrem Ergin, Orhun Abideleri'],
  },
  {
    id: 'talas-savasi',
    year: 751,
    displayDate: '751',
    title: 'Talas Savaşı ve Türk-İslam Etkileşimi',
    scope: 'turkish',
    period: 'Türk-İslam Devletleri',
    category: 'savas',
    locationName: 'Talas Irmağı Havzası (Batı Türkistan)',
    mapX: 675,
    mapY: 196,
    causes: [
      'Çin Tang Hanedanı’nın Orta Asya’da egemenlik kurma girişimi.',
      'Abbasî Devleti ile Karluk Türklerinin ortak güvenlik arayışı.',
    ],
    development:
      'Karluk Türklerinin Abbasî kuvvetlerinin yanında yer almasıyla Tang ordusu ağır yenilgiye uğratıldı.',
    consequences: [
      'Orta Asya’da Çin baskısı uzun süre durduruldu.',
      'Türkler ile İslam dünyası arasında ticari, kültürel ve dinî etkileşim hızlandı; kâğıt üretimi Semerkant üzerinden İslam dünyasına yayıldı.',
    ],
    significance: 'Türk-İslam medeniyetinin doğuşunu hazırlayan tarihî dönüm noktasıdır.',
    keyFigures: ['Ziyad bin Salih', 'Karluk Yabgusu'],
    sources: ['İbrahim Kafesoğlu, Türk Millî Kültürü', 'TDV İslâm Ansiklopedisi'],
  },
  {
    id: 'malazgirt-1071',
    year: 1071,
    displayDate: '26 Ağustos 1071',
    title: 'Malazgirt Meydan Muharebesi',
    scope: 'turkish',
    period: 'Selçuklular',
    category: 'savas',
    locationName: 'Malazgirt Ovası (Doğu Anadolu)',
    mapX: 525,
    mapY: 224,
    causes: [
      'Büyük Selçuklu Devleti’nin Anadolu’ya yönelik keşif ve yurt edinme akınları.',
      'Bizans İmparatoru IV. Romen Diyojen’in Türk akınlarını kalıcı olarak durdurma hedefi.',
    ],
    development:
      'Sultan Alparslan, sayıca üstün Bizans ordusuna karşı hilal (Turan) taktiğini uygulayarak kesin bir zafer kazandı.',
    consequences: [
      'Anadolu’nun kapıları Türklere açıldı ve ilk Türk beylikleri (Saltuklular, Mengücekliler, Danişmentliler, Artuklular) kuruldu.',
      'Anadolu’da hızlı bir Türkleşme ve İslamlaşma süreci başladı; Türkiye Selçuklu Devleti’nin temeli atıldı.',
    ],
    significance: 'Anadolu’nun Türk yurdu hâline gelmesinin başlangıç noktasıdır.',
    keyFigures: ['Sultan Alparslan', 'IV. Romen Diyojen', 'Afşin Bey', 'Artuk Bey'],
    sources: ['Osman Turan, Selçuklular Tarihi ve Türk-İslâm Medeniyeti', 'Claude Cahen, Osmanlılardan Önce Anadolu'],
  },
  {
    id: 'magna-carta',
    year: 1215,
    displayDate: '15 Haziran 1215',
    title: 'Magna Carta Libertatum',
    scope: 'world',
    period: 'Orta Çağ',
    category: 'antlasma',
    locationName: 'Runnymede (İngiltere)',
    mapX: 306,
    mapY: 148,
    causes: [
      'İngiltere Kralı Yurtsuz John’un keyfî vergileri ve feodal baronlarla yaşadığı yetki çatışması.',
    ],
    development:
      'Baronların baskısı sonucunda kral, kendi yetkilerini yasalarla sınırlandıran Büyük Özgürlük Fermanı’nı onayladı.',
    consequences: [
      'Kralın da hukuk kurallarına bağlı olduğu ilkesi yazılı belgeye geçti.',
      'Keyfî tutuklamaya karşı yargılama güvencesi modern anayasalcılığın ilk adımlarından sayıldı.',
    ],
    significance: 'Modern hukuk devleti ve anayasal demokrasi tarihinin öncü belgelerindendir.',
    keyFigures: ['Kral John', 'Başpiskopos Stephen Langton'],
    sources: ['British Library Magna Carta Arşivi'],
  },
  {
    id: 'istanbul-fethi',
    year: 1453,
    displayDate: '29 Mayıs 1453',
    title: 'İstanbul’un Fethi',
    scope: 'turkish',
    period: 'Osmanlı Devleti',
    category: 'savas',
    locationName: 'İstanbul (Konstantiniyye)',
    mapX: 462,
    mapY: 212,
    causes: [
      'Osmanlı toprak bütünlüğünün sağlanması ve Boğazların stratejik kontrolü.',
      'Bizans’ın Osmanlı şehzadelerini kışkırtması ve Haçlı ittifakları araması.',
    ],
    development:
      'II. Mehmed (Fatih), Şahi toplarının dökülmesi, Rumeli Hisarı’nın inşası ve donanmanın karadan Haliç’e indirilmesi gibi hamlelerle 53 günlük kuşatma sonunda şehri fethetti.',
    consequences: [
      'Bin yıllık Doğu Roma (Bizans) İmparatorluğu sona erdi; İstanbul Osmanlı başkenti oldu.',
      'Orta Çağ kapanıp Yeni Çağ başladı; büyük surların toplarla yıkılabileceği görülerek Avrupa’da feodalite zayıfladı.',
      'İtalya’ya giden bilginler Rönesans hareketlerine ivme kazandırdı; ticaret yollarının kontrolü Coğrafi Keşifleri teşvik etti.',
    ],
    significance: 'Hem Türk tarihi hem de dünya tarihi bakımından çağ açıp çağ kapatan küresel bir kırılmadır.',
    keyFigures: ['Fatih Sultan Mehmed (II. Mehmed)', 'Akşemseddin', 'Ulubatlı Hasan', 'XI. Konstantinos'],
    sources: ['Halil İnalcık, Osmanlı İmparatorluğu Klasik Çağ', 'Feridun Emecen, Fetih ve Kıyamet 1453'],
  },
  {
    id: 'matbaa-ronesans',
    year: 1455,
    displayDate: 'y. 1450 – 1455',
    title: 'Gutenberg Matbaası ve Rönesans’ın Yayılması',
    scope: 'world',
    period: 'Yeni Çağ',
    category: 'kultur',
    locationName: 'Mainz (Orta Avrupa)',
    mapX: 360,
    mapY: 162,
    causes: [
      'Avrupa’da üniversitelerin çoğalması ve kitaplara duyulan yüksek talep.',
      'Hareketli metal harf teknolojisinin geliştirilmesi.',
    ],
    development:
      'Johannes Gutenberg’in geliştirdiği baskı makinesi sayesinde kitap üretimi hızlandı ve maliyetler dramatik biçimde düştü.',
    consequences: [
      'Bilimsel ve felsefi metinler kısa sürede kıta genelinde dolaşıma girdi.',
      'Rönesans, Reform ve Bilimsel Devrim hareketlerinin toplumsal tabanı genişledi.',
    ],
    significance: 'Bilginin demokratikleşmesini sağlayan ilk büyük iletişim devrimidir.',
    keyFigures: ['Johannes Gutenberg', 'Erasmus', 'Leonardo da Vinci'],
    sources: ['Elizabeth Eisenstein, The Printing Press as an Agent of Change'],
  },
  {
    id: 'fransiz-ihtilali',
    year: 1789,
    displayDate: '14 Temmuz 1789',
    title: 'Fransız İhtilali',
    scope: 'world',
    period: 'Yakın Çağ',
    category: 'devlet',
    locationName: 'Paris (Fransa)',
    mapX: 325,
    mapY: 174,
    causes: [
      'Mutlak monarşinin mali krizi, ağır vergi adaletsizliği ve toplumsal sınıf eşitsizliği.',
      'Aydınlanma filozoflarının (Montesquieu, Rousseau, Voltaire) eşitlik ve özgürlük fikirleri.',
    ],
    development:
      'Bastille Hapishanesi’nin basılmasıyla başlayan halk hareketi mutlak krallığı yıktı; İnsan ve Yurttaş Hakları Bildirisi ilan edildi.',
    consequences: [
      'Milliyetçilik, eşitlik, adalet ve halk egemenliği akımları tüm dünyaya yayıldı.',
      'Çok uluslu imparatorluklar milliyetçi hareketlerle karşılaştı; Yakın Çağ başladı.',
    ],
    significance: 'Modern yurttaşlık, insan hakları ve ulus-devlet anlayışının temelini atmıştır.',
    keyFigures: ['Jean-Jacques Rousseau (fikir öncüsü)', 'Montesquieu', 'Maximilien Robespierre'],
    sources: ['Eric Hobsbawm, Devrim Çağı', 'TDV İslâm Ansiklopedisi'],
  },
  {
    id: 'tanzimat-fermani',
    year: 1839,
    displayDate: '3 Kasım 1839',
    title: 'Tanzimat Fermanı (Gülhane Hatt-ı Hümâyunu)',
    scope: 'turkish',
    period: 'Osmanlı Devleti',
    category: 'antlasma',
    locationName: 'İstanbul (Gülhane Parkı)',
    mapX: 465,
    mapY: 215,
    causes: [
      'Devletin hukuk, maliye ve yönetim kurumlarını çağın gereksinimlerine göre yenileme ihtiyacı.',
      'Tüm tebaanın devlete bağlılığını güçlendirme hedefi.',
    ],
    development:
      'Sultan Abdülmecid döneminde Hariciye Nazırı Mustafa Reşid Paşa tarafından Gülhane’de okunarak ilan edildi.',
    consequences: [
      'Padişah ilk kez kanun gücünün üstünlüğünü tanıdı.',
      'Can, mal ve namus güvenliği, adil vergilendirme ve açık yargılama ilkeleri güvenceye alındı.',
    ],
    significance: 'Osmanlı Devleti’nde modern anayasacılığa ve hukuk devletine geçişin ilk büyük adımıdır.',
    keyFigures: ['Sultan Abdülmecid', 'Mustafa Reşid Paşa'],
    sources: ['Halil İnalcık & Mehmet Seyitdanlıoğlu, Tanzimat'],
  },
  {
    id: 'tbmm-acilisi',
    year: 1920,
    displayDate: '23 Nisan 1920',
    title: 'Türkiye Büyük Millet Meclisinin Açılması',
    scope: 'turkish',
    period: 'Millî Mücadele',
    category: 'devlet',
    locationName: 'Ankara (Orta Anadolu)',
    mapX: 492,
    mapY: 222,
    causes: [
      'İstanbul’un resmen işgali ve Mebusan Meclisinin dağıtılması.',
      'Millî Mücadele’nin ulusal iradeye dayalı kurumsal bir merkezden yürütülmesi zorunluluğu.',
    ],
    development:
      'Mustafa Kemal Paşa’nın çağrısıyla Anadolu’nun dört bir yanından gelen milletvekilleri Ankara’da toplanarak TBMM’yi açtı.',
    consequences: [
      '“Egemenlik kayıtsız şartsız milletindir” ilkesi kurumsallaştı.',
      'Kurtuluş Savaşı’nı yönetecek meşru ulusal hükümet ve düzenli ordu oluşturuldu.',
    ],
    significance: 'Yeni Türk devletinin fiilen kuruluşu ve millî egemenliğin resmî başlangıcıdır.',
    keyFigures: ['Mustafa Kemal Atatürk', 'İsmet İnönü', 'Fevzi Çakmak', 'Kâzım Karabekir'],
    sources: ['Mustafa Kemal Atatürk, Nutuk', 'Türk Tarih Kurumu Arşivi'],
  },
  {
    id: 'lozan-cumhuriyet',
    year: 1923,
    displayDate: '24 Temmuz / 29 Ekim 1923',
    title: 'Lozan Barış Antlaşması ve Cumhuriyetin İlanı',
    scope: 'turkish',
    period: 'Türkiye Cumhuriyeti Tarihi',
    category: 'antlasma',
    locationName: 'Lozan & Ankara',
    mapX: 496,
    mapY: 226,
    causes: [
      'Büyük Taarruz zaferinin ardından tam bağımsızlığın uluslararası hukukta tescil edilmesi gereği.',
      'Devlet rejiminin ve yönetim sisteminin açık biçimde tanımlanması ihtiyacı.',
    ],
    development:
      '24 Temmuz 1923’te Lozan Barış Antlaşması ile kapitülasyonlar kaldırılıp bağımsızlık tanındı; 29 Ekim 1923’te TBMM’de Cumhuriyet ilan edildi.',
    consequences: [
      'Tam bağımsız, çağdaş ve egemen Türkiye Cumhuriyeti kuruldu.',
      'Hukuk, eğitim, bilim, ekonomi ve toplumsal alanda kapsamlı inkılaplar hayata geçirildi.',
    ],
    significance: 'Modern Türkiye Cumhuriyeti’nin uluslararası hukuk ve anayasal temelidir.',
    keyFigures: ['Mustafa Kemal Atatürk', 'İsmet İnönü'],
    sources: ['TBMM Zabıt Cerideleri', 'Bernard Lewis, Modern Türkiye’nin Doğuşu'],
  },
  {
    id: 'bm-kurulusu',
    year: 1945,
    displayDate: '24 Ekim 1945',
    title: 'Birleşmiş Milletlerin Kurulması',
    scope: 'world',
    period: 'Çağdaş Dünya Tarihi',
    category: 'antlasma',
    locationName: 'San Francisco / Küresel Konferans',
    mapX: 160,
    mapY: 220,
    causes: [
      'II. Dünya Savaşı’nın yol açtığı ağır yıkımın tekrarlanmasını önleme amacı.',
      'Uluslararası barış, güvenlik ve insan hakları iş birliği ihtiyacı.',
    ],
    development:
      'Türkiye’nin de kurucu üyeleri arasında yer aldığı 51 ülke Birleşmiş Milletler Antlaşması’nı imzaladı.',
    consequences: [
      '1948 İnsan Hakları Evrensel Beyannamesi gibi uluslararası standartlar kabul edildi.',
      'UNESCO, UNICEF ve WHO gibi küresel eğitim, bilim ve sağlık kurumları oluşturuldu.',
    ],
    significance: 'Çağdaş uluslararası hukuk ve çok taraflı diplomasi düzeninin ana çatısıdır.',
    keyFigures: ['Kurucu üye devlet heyetleri'],
    sources: ['Birleşmiş Milletler Resmî Tarih Arşivi'],
  },
];

export const HISTORY_QUIZ_ITEMS: HistoryQuizItem[] = [
  {
    id: 'hq1',
    type: 'mcq',
    question: 'Anadolu’nun kapılarını Türklere açan ve 26 Ağustos 1071’de kazanılan savaş hangisidir?',
    options: ['Dandanakan Savaşı', 'Pasinler Savaşı', 'Malazgirt Meydan Muharebesi', 'Miryokefalon Savaşı'],
    correctIndex: 2,
    explanation:
      'Büyük Selçuklu Sultanı Alparslan’ın 1071’de kazandığı Malazgirt Zaferi ile Anadolu’da kalıcı Türk yerleşimi başlamıştır.',
  },
  {
    id: 'hq2',
    type: 'match',
    question: 'Olay–Tarih Eşleştirme: Gülhane Hatt-ı Hümâyunu (Tanzimat Fermanı) hangi yılda ilan edilmiştir?',
    options: ['1789', '1839', '1876', '1908'],
    correctIndex: 1,
    explanation:
      'Tanzimat Fermanı 3 Kasım 1839’da Sultan Abdülmecid döneminde ilan edilerek kanun üstünlüğü ilkesini gündeme getirmiştir.',
  },
  {
    id: 'hq3',
    type: 'mcq',
    question: 'Türkler ile İslam dünyası arasında yakınlaşmayı hızlandıran ve kâğıt üretiminin batıya yayılmasında etkili olan 751 tarihli savaş hangisidir?',
    options: ['Talas Savaşı', 'Katvan Savaşı', 'Kösedağ Savaşı', 'Ankara Savaşı'],
    correctIndex: 0,
    explanation:
      '751 Talas Savaşı’nda Karluk Türkleri Abbasîlerin yanında yer almış, bu süreç Türk-İslam kültür etkileşimini başlatmıştır.',
  },
  {
    id: 'hq4',
    type: 'match',
    question: 'Olay–Tarih Eşleştirme: Türkiye Büyük Millet Meclisinin açılış tarihi hangisidir?',
    options: ['19 Mayıs 1919', '23 Nisan 1920', '30 Ağustos 1922', '29 Ekim 1923'],
    correctIndex: 1,
    explanation:
      'TBMM 23 Nisan 1920’de Ankara’da açılarak millî egemenlik ilkesini kurumsallaştırmıştır.',
  },
];

export const CHRONOLOGY_CHALLENGE_IDS = [
  'talas-savasi',
  'malazgirt-1071',
  'istanbul-fethi',
  'tanzimat-fermani',
];
