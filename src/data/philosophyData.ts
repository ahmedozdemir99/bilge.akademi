export type PhilosophyEra =
  | 'İlk Çağ Felsefesi'
  | 'Orta Çağ Felsefesi'
  | 'İslam Felsefesi'
  | 'Türk Düşünce Tarihi'
  | 'Yeni Çağ Felsefesi'
  | 'Modern Felsefe'
  | 'Çağdaş Felsefe';

export interface PhilosophyEraInfo {
  id: PhilosophyEra;
  span: string;
  summary: string;
  coreProblems: string[];
}

export interface PhilosopherProfile {
  id: string;
  name: string;
  lifespan: string;
  era: PhilosophyEra;
  tradition: string;
  bio: string;
  coreViews: string[];
  keyWorks: string[];
  contributions: string[];
  relations: string;
  epistemology: string;
  ontology: string;
  ethics: string;
  politicsAndSociety: string;
  notableThought: string;
}

export interface PhilosophicalSchool {
  id: string;
  name: string;
  category: string;
  summary: string;
  coreThesis: string;
  representatives: string[];
  keyConcepts: string[];
}

export interface PhilosophyQuizQuestion {
  id: string;
  category: 'Kavram Eşleştirme' | 'Filozof–Eser' | 'Felsefi Akımlar';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface OpenEndedThoughtPrompt {
  id: string;
  title: string;
  question: string;
  guidingHints: string[];
}

export const PHILOSOPHY_ERAS: PhilosophyEraInfo[] = [
  {
    id: 'İlk Çağ Felsefesi',
    span: 'MÖ 6. yy – MS 5. yy',
    summary:
      'Doğa filozoflarının evrenin ilk maddesi (arkhe) arayışıyla başlayan, Sokrates, Platon ve Aristoteles ile bilgi, erdem, devlet ve mantık disiplinlerinin temellendiği dönemdir.',
    coreProblems: ['Arkhe (ilk neden)', 'Bilgi ve sanı ayrımı', 'Erdem ve iyi yaşam', 'İdeal devlet düzeni'],
  },
  {
    id: 'Orta Çağ Felsefesi',
    span: 'MS 5. yy – 15. yy',
    summary:
      'Akıl ile inanç arasındaki ilişkinin sorgulandığı, tümeller tartışmasının ve sistematik ilahiyat-felsefe sentezlerinin öne çıktığı dönemdir.',
    coreProblems: ['Akıl–inanç uyumu', 'Tümeller problemi', 'Tanrı’nın varlığının kanıtları', 'Özgür irade'],
  },
  {
    id: 'İslam Felsefesi',
    span: '8. yy – 14. yy',
    summary:
      'Antik Yunan birikimini özgün biçimde yorumlayıp geliştiren; mantık, tıp, siyaset, metafizik ve bilim yönteminde evrensel eserler üreten düşünce geleneğidir.',
    coreProblems: ['Akıl ve vahiy uyumu', 'Erdemli şehir (Medinetü’l-Fâzıla)', 'Zorunlu–mümkün varlık', 'Nefs ve akıl kuramı'],
  },
  {
    id: 'Türk Düşünce Tarihi',
    span: '11. yy – Günümüz',
    summary:
      'Yusuf Has Hâcib’in adalet ve devlet ahlakından Hoca Ahmed Yesevî, Mevlânâ ve Yunus Emre’nin insan sevgisine; modern dönemde ise çağdaşlaşma ve kültür felsefesine uzanan zengin mirastır.',
    coreProblems: ['İnsan-ı kâmil ve hoşgörü', 'Devlet yönetiminde adalet (Kutadgu Bilig)', 'Kültür ve medeniyet sentezi', 'Toplumsal dayanışma'],
  },
  {
    id: 'Yeni Çağ Felsefesi',
    span: '15. yy – 17. yy',
    summary:
      'Rönesans ve Bilimsel Devrim ile insan aklının, gözlemin ve yöntemin merkeze alındığı; rasyonalizm ile empirizm tartışmalarının doğduğu dönemdir.',
    coreProblems: ['Kesin bilginin yöntemi', 'Zihin–beden ilişkisi', 'Deneycilik ve akılcılık', 'Toplumsal sözleşme'],
  },
  {
    id: 'Modern Felsefe',
    span: '18. yy – 19. yy',
    summary:
      'Aydınlanma düşüncesiyle bireysel özerklik, eleştirel akıl, evrensel ahlak yasası, tarih bilinci ve değerlerin yeniden sorgulanmasının öne çıktığı çağdır.',
    coreProblems: ['Eleştirel akıl ve bilginin sınırları', 'Ödev ahlakı', 'Tarihsel diyalektik', 'Değerlerin eleştirisi'],
  },
  {
    id: 'Çağdaş Felsefe',
    span: '20. yy – Günümüz',
    summary:
      'Dil felsefesi, fenomenoloji, varoluşçuluk, bilim felsefesi ve teknoloji etiği üzerinden insan özgürlüğü, anlam ve bilimsel bilginin yapısını araştırır.',
    coreProblems: ['Özgürlük ve sorumluluk', 'Dil ve anlam', 'Bilimsel yanlışlanabilirlik', 'Yapay zekâ ve biyoetik'],
  },
];

export const PHILOSOPHERS: PhilosopherProfile[] = [
  {
    id: 'sokrates',
    name: 'Sokrates',
    lifespan: 'MÖ 469 – MÖ 399',
    era: 'İlk Çağ Felsefesi',
    tradition: 'Atina Klasik Felsefesi',
    bio: 'Yazılı eser bırakmayan ancak soru-cevap yöntemiyle (Sokratik yöntem) Batı felsefesinde etik ve eleştirel sorgulamanın yönünü belirleyen Atinalı düşünürdür.',
    coreViews: [
      'Erdem bilgidir; hiç kimse bilerek kötülük yapmaz.',
      'Sorgulanmamış bir hayat yaşamaya değmez.',
      'Gerçek bilgelik, bilmediğinin farkında olmaktır.',
    ],
    keyWorks: ['Yazılı eseri yoktur (Platon’un Savunma, Kriton ve Devlet diyaloglarından tanınır)'],
    contributions: [
      'İroni (alaysılama) ve maiötik (doğurtma) diyalektik yöntemini geliştirdi.',
      'Felsefenin odağını doğadan insana, ahlaka ve kavram tanımına çevirdi.',
    ],
    relations: 'Platon’un hocasıdır; sofistlerin göreceli bilgi anlayışına karşı evrensel ahlaki tanımları savundu.',
    epistemology: 'Doğru bilgi insanın zihninde gizlidir; sistemli soru sorma ve kavram çözümlemesiyle açığa çıkarılır.',
    ontology: 'Fiziksel evrenin yapısından çok, ruhun yetkinliği ve kavramların değişmez özüyle ilgilenir.',
    ethics: 'Bilgi ve erdem özdeştir; iyiyi gerçekten bilen kişi iyi davranır.',
    politicsAndSociety: 'Yasalara saygılı, eleştirel yurttaşlık ve bilgece yönetim anlayışını savunur.',
    notableThought: '“Bildiğim tek şey, hiçbir şey bilmediğimdir.”',
  },
  {
    id: 'platon',
    name: 'Platon',
    lifespan: 'MÖ 427 – MÖ 347',
    era: 'İlk Çağ Felsefesi',
    tradition: 'İdealizm · Akademia',
    bio: 'Sokrates’in öğrencisi ve Aristoteles’in hocası olan Platon, Atina’da Akademia’yı kurarak sistemli felsefe eğitiminin öncüsü olmuştur.',
    coreViews: [
      'Duyularla algılanan dünya geçicidir; gerçek varlık değişmeyen İdealar dünyasındadır.',
      'Bilgi (episteme), ruhun ideaları hatırlamasıyla (anamnesis) mümkündür.',
      'Adil devlet, bilgelik, cesaret ve ölçülülük erdemlerinin uyumuyla kurulur.',
    ],
    keyWorks: ['Devlet (Politeia)', 'Şölen (Symposion)', 'Phaidon', 'Sokrates’in Savunması'],
    contributions: [
      'İdealar Kuramı ile felsefe tarihindeki en etkili idealist sistemi kurdu.',
      'Mağara Alegorisi ile eğitim, hakikat ve algı yanılsamasını sembolleştirdi.',
    ],
    relations: 'Sokrates’in öğrencisi, Aristoteles’in hocasıdır; Farabi ve İslam siyaset felsefesini derinden etkilemiştir.',
    epistemology: 'Duyusal algı yalnızca sanı (doksa) verir; kesin bilgi akıl yoluyla kavranan idealardadır.',
    ontology: 'İkili evren kuramı: Değişen görünüşler dünyası ve ebedî, mükemmel İdealar dünyası.',
    ethics: 'En yüksek idea İyi İdeasıdır; erdemli yaşam ruhun akıl yönünün rehberliğinde kurulur.',
    politicsAndSociety: 'Filozof-krallar tarafından yönetilen, liyakat ve adalet temelli ideal devlet modeli.',
    notableThought: '“Eğitim, ruhun gözünü gölgelerden ışığa çevirme sanatıdır.”',
  },
  {
    id: 'aristoteles',
    name: 'Aristoteles',
    lifespan: 'MÖ 384 – MÖ 322',
    era: 'İlk Çağ Felsefesi',
    tradition: 'Peripatetik (Meşşai) Geleneğin Kurucusu',
    bio: 'Mantık, biyoloji, metafizik, etik, politika ve poetika alanlarında sistematik eserler vererek bilimlerin sınıflandırılmasını yapan düşünürdür.',
    coreViews: [
      'Form (öz), Platon’un dediği gibi ayrı bir dünyada değil, tekil varlıkların içindedir.',
      'Erdem, iki aşırı uç arasındaki “altın orta”yı (ölçülülüğü) alışkanlık hâline getirmektir.',
      'İnsan doğası gereği toplumsal ve siyasal bir varlıktır (zoon politikon).',
    ],
    keyWorks: ['Organon', 'Metafizik', 'Nikomakhos’a Etik', 'Politika', 'Poetika'],
    contributions: [
      'Biçimsel mantığın (kıyas teorisinin) kurucusudur.',
      'Dört Neden Öğretisi (maddi, formel, fail, ereksel) ile bilimsel açıklamayı sistemleştirdi.',
    ],
    relations: 'Platon’un öğrencisidir; eserleri Farabi, İbn Sina ve İbn Rüşd aracılığıyla hem İslam hem Avrupa düşüncesine taşındı.',
    epistemology: 'Bilgi duyusal gözlemle başlar, aklın soyutlama ve tümdengelim/tümevarım süreçleriyle kesinleşir.',
    ontology: 'Madde ve formun birliğinden oluşan somut tözler gerçektir (hylomorfizm).',
    ethics: 'Eudaimonia (mutluluk/yetkinlik) hedefli erdem etiği; aşırı uçlardan kaçınan “altın orta”.',
    politicsAndSociety: 'Orta sınıfın güçlü olduğu, yasaların üstünlüğüne dayalı karma anayasal düzen.',
    notableThought: '“Mükemmellik bir eylem değil, bir alışkanlıktır.”',
  },
  {
    id: 'farabi',
    name: 'Fârâbî (Muallim-i Sânî)',
    lifespan: '870 – 950',
    era: 'İslam Felsefesi',
    tradition: 'Meşşai İslam Felsefesi',
    bio: 'Aristoteles’ten sonra “İkinci Öğretmen” (Muallim-i Sânî) unvanıyla anılan Fârâbî; mantık, müzik teorisi, bilimler sınıflandırması ve siyaset felsefesinde öncüdür.',
    coreViews: [
      'Gerçek mutluluk ancak erdemli bir toplum ve iş birliği içinde elde edilebilir.',
      'Akıl ve vahiy aynı hakikate farklı dillerle ulaşır; felsefe ile din çelişmez.',
      'Bilimler sistemli biçimde sınıflandırılmalı ve mantık bütün bilimlerin ortak aracı olmalıdır.',
    ],
    keyWorks: ['El-Medînetü’l-Fâzıla (Erdemli Şehir)', 'İhsâü’l-Ulûm (Bilimlerin Sayımı)', 'Kitâbü’l-Mûsîka’l-Kebîr'],
    contributions: [
      'İslam dünyasında sistematik siyaset felsefesini ve bilim sınıflamasını kurdu.',
      'Müzik teorisi ve ses fiziği üzerine kapsamlı bilimsel incelemeler yazdı.',
    ],
    relations: 'Platon ve Aristoteles düşüncesini özgün bir senteze kavuşturdu; İbn Sina’nın metafizik anlayışına doğrudan ışık tuttu.',
    epistemology: 'İnsan aklı aşamalı olarak gelişir; Faal Akıl ile kurulan bağ evrensel kavramlara ulaşmayı sağlar.',
    ontology: 'Varlıklar Zorunlu Varlık’tan (İlk Neden) düzenli bir akılsal hiyerarşi (sudûr) ile doğar.',
    ethics: 'İnsanın en yüce amacı akıl ve erdemlerle donanarak gerçek mutluluğa (saadet) erişmektir.',
    politicsAndSociety: 'Dayanışma, bilgi ve adalet ilkeleriyle yönetilen “Erdemli Şehir” (El-Medînetü’l-Fâzıla) modeli.',
    notableThought: '“İnsan, tek başına tüm ihtiyaçlarını karşılayamaz; erdemli yaşam ancak toplumsal dayanışmayla kurulur.”',
  },
  {
    id: 'ibn-sina',
    name: 'İbn Sînâ (Avicenna)',
    lifespan: '980 – 1037',
    era: 'İslam Felsefesi',
    tradition: 'Meşşai Geleneğin Zirvesi · Tıp ve Metafizik',
    bio: 'Hem tıp tarihinin en etkili eserlerinden El-Kanun fi’t-Tıb’ı hem de kapsamlı felsefe ansiklopedisi Kitâbü’ş-Şifâ’yı kaleme alan çok yönlü bilgin ve filozoftur.',
    coreViews: [
      'Varlık, “Zorunlu Varlık” (Vâcibü’l-Vücûd) ve “Mümkün Varlık” olarak ikiye ayrılır.',
      '“Uçan Adam” düşünce deneyi, insanın beden duyumları olmaksızın kendi öz bilincini kavrayabileceğini gösterir.',
      'Tıpta ve doğa bilimlerinde deney, gözlem ve akıl yürütme birlikte kullanılmalıdır.',
    ],
    keyWorks: ['Kitâbü’ş-Şifâ', 'El-Kânûn fi’t-Tıb', 'El-İşârât ve’t-Tenbîhât'],
    contributions: [
      'Öz (mahiyet) ve varoluş (vücûd) ayrımını metafiziğin merkezine yerleştirdi.',
      'Uçan Adam düşünce deneyiyle Descartes’tan yüzyıllar önce öz-bilinç tartışmasını başlattı.',
    ],
    relations: 'Fârâbî’nin eserlerinden yararlandı; düşünceleri Orta Çağ Avrupa skolastik felsefesini ve tıp eğitimini yüzyıllarca etkiledi.',
    epistemology: 'Duyu verileri, hayal gücü ve aklın dereceleri birlikte çalışır; sezgi (hads) orta terimi hızla kavrayabilir.',
    ontology: 'Kendi başına var olması zorunlu olan tek varlık ile var olmak için nedene muhtaç mümkün varlıklar ayrımı.',
    ethics: 'Nefsin bilme ve uygulama güçlerinin dengelenmesiyle olgunlaşma ve toplumsal adalet.',
    politicsAndSociety: 'Adil yasalar, mesleki iş bölümü ve kamusal refahı gözeten düzenli toplum yapısı.',
    notableThought: '“Bilim ve sanat itibar görmediği toplumları terk eder.”',
  },
  {
    id: 'aquinas',
    name: 'Aquinolu Thomas',
    lifespan: '1225 – 1274',
    era: 'Orta Çağ Felsefesi',
    tradition: 'Skolastik Felsefe',
    bio: 'Orta Çağ Avrupa düşüncesinde Aristoteles felsefesi ile Hristiyan teolojisini sistemli bir akıl-inanç sentezi içinde birleştiren filozoftur.',
    coreViews: [
      'Akıl ile inanç çelişmez; akıl doğal dünyayı, inanç ise aklın ötesindeki hakikatleri aydınlatır.',
      'Doğal hukuk, insan aklının evrensel iyiyi kavrama kapasitesine dayanır.',
      'Evrendeki hareket, nedensellik ve düzen, ilk nedenin varlığına işaret eder.',
    ],
    keyWorks: ['Summa Theologiae', 'Summa Contra Gentiles'],
    contributions: [
      'Orta Çağ skolastik yönteminde tez, karşı-tez ve çözüm diyalektiğini yetkinleştirdi.',
      'Doğal hukuk ve insan aklının özerkliği tartışmalarına zemin hazırladı.',
    ],
    relations: 'Aristoteles’i İbn Sina ve İbn Rüşd şerhleri üzerinden okuyarak kendi sistemini inşa etti.',
    epistemology: 'Bilgi duyularla başlar; akıl duyulardan tümel kavramları soyutlar.',
    ontology: 'Varlıklar öz ve varoluş bileşimidir; yalnızca ilk nedenin özü varoluşuyla özdeştir.',
    ethics: 'Doğal yasa ve erdem etiği; aklın rehberliğinde iyiyi seçme sorumluluğu.',
    politicsAndSociety: 'Ortak iyiliği (bonum commune) gözeten adil yasa ve yönetim anlayışı.',
    notableThought: '“Akıl, hakikati ararken kendi sınırlarını da bilmelidir.”',
  },
  {
    id: 'yunus-emre',
    name: 'Yunus Emre',
    lifespan: 'y. 1240 – y. 1321',
    era: 'Türk Düşünce Tarihi',
    tradition: 'Anadolu Tasavvuf ve İnsan Felsefesi',
    bio: 'Duru Türkçesiyle Anadolu’da evrensel insan sevgisini, kendini bilmeyi, gönül kırmamayı ve eşitlikçi hoşgörüyü felsefi derinlikle işleyen büyük halk düşünürüdür.',
    coreViews: [
      'İlim, yalnızca dışsal bilgi yığmak değil; insanın kendini bilmesidir.',
      'Tüm insanlar ve varlıklar karşısında ayrımcılıktan uzak, sevgi ve merhamet temelli bir etik gerekir.',
      'Gösterişten uzak içtenlik, gönül onarmak ve paylaşmak erdemin özüdür.',
    ],
    keyWorks: ['Divan', 'Risâletü’n-Nushiyye (Öğütler Kitabı)'],
    contributions: [
      'Türkçeyi yüksek felsefi ve ahlaki kavramları ifade edebilen bir düşünce diline dönüştürdü.',
      'Anadolu hümanizminin ve hoşgörü kültürünün temel kavramlarını kalıcılaştırdı.',
    ],
    relations: 'Taptuk Emre ve Hoca Ahmed Yesevî geleneğiyle bağ kurar; Mevlânâ ile aynı çağın Anadolu irfanını temsil eder.',
    epistemology: 'Gerçek bilgi (irfan), kitap bilgisini öz-farkındalık ve ahlaki olgunlukla birleştirmektir.',
    ontology: 'Varlık bir bütündür; tüm yaratılanlar ortak bir anlam ve sevgi bağıyla birbirine bağlıdır.',
    ethics: 'Kendini bilme, kibri aşma, gönül kırmama ve “yetmiş iki millete bir gözle bakma” ilkesi.',
    politicsAndSociety: 'Kibir ve baskı yerine eşitlik, barış, kardeşlik ve toplumsal dayanışma kültürü.',
    notableThought: '“İlim ilim bilmektir, ilim kendin bilmektir; sen kendini bilmezsin, ya nice okumaktır.”',
  },
  {
    id: 'descartes',
    name: 'René Descartes',
    lifespan: '1596 – 1650',
    era: 'Yeni Çağ Felsefesi',
    tradition: 'Rasyonalizm · Modern Felsefenin Öncüsü',
    bio: 'Analitik geometrinin kurucusu ve metodik şüphe yaklaşımıyla Yeni Çağ rasyonalist felsefesinin temelini atan Fransız filozof ve matematikçidir.',
    coreViews: [
      'Kesin bilgiye ulaşmak için en ufak kuşku barındıran her bilgi geçici olarak askıya alınmalıdır (Metodik Şüphe).',
      'Şüphe ederken düşündüğümden kuşku duyamam: “Düşünüyorum, öyleyse varım” (Cogito ergo sum).',
      'Zihin (düşünen töz) ve madde (yer kaplayan töz) birbirinden farklı iki tözdür (Düalizm).',
    ],
    keyWorks: ['Yöntem Üzerine Konuşma', 'İlk Felsefe Üzerine Meditasyonlar', 'Felsefenin İlkeleri'],
    contributions: [
      'Kartezyen koordinat sistemini kurarak cebir ile geometriyi birleştirdi.',
      'Açık ve seçik bilgi ölçütünü modern epistemolojinin merkezine yerleştirdi.',
    ],
    relations: 'Spinoza ve Leibniz’in rasyonalizmine zemin hazırladı; John Locke ve David Hume’un empirist eleştirilerine hedef oldu.',
    epistemology: 'Kesin bilginin kaynağı duyular değil, doğuştan gelen fikirler ve akıl yürütmedir.',
    ontology: 'Töz düalizmi: Düşünen zihin (res cogitans) ve uzamlı madde (res extensa).',
    ethics: 'Sağlam akıl yürütmeyle tutkuları dengeleyen ve öngörülü davranan geçici/akılcı ahlak.',
    politicsAndSociety: 'Bilimsel ilerleme ve akılcı yöntemle toplumsal yaşamın iyileştirilmesi.',
    notableThought: '“Düşünüyorum, öyleyse varım.”',
  },
  {
    id: 'locke',
    name: 'John Locke',
    lifespan: '1632 – 1704',
    era: 'Yeni Çağ Felsefesi',
    tradition: 'Empirizm · Siyasal Liberalizm',
    bio: 'İnsan zihninin doğuştan boş bir levha (tabula rasa) olduğunu savunan ve doğal haklar ile kuvvetler ayrılığı düşüncesini biçimlendiren İngiliz filozoftur.',
    coreViews: [
      'İnsan zihninde doğuştan gelen fikirler yoktur; tüm bilgiler deneyim ve gözlemle kazanılır.',
      'Yaşam, özgürlük ve mülkiyet devredilemez doğal haklardır.',
      'Devletin meşruiyeti yönetilenlerin rızasına ve hukukun üstünlüğüne dayanır.',
    ],
    keyWorks: ['İnsan Anlığı Üzerine Bir Deneme', 'Yönetim Üzerine İki İnceleme', 'Hoşgörü Üzerine Bir Mektup'],
    contributions: [
      'Modern empirizmin (deneyciliğin) temel bilgi kuramını geliştirdi.',
      'Anayasal demokrasi, düşünce özgürlüğü ve hoşgörü kavramlarının felsefi temelini attı.',
    ],
    relations: 'Descartes’ın doğuştan fikirler kuramını eleştirdi; Aydınlanma düşünürlerini ve Kant’ı derinden etkiledi.',
    epistemology: 'Bilgi duyum (dış deneyim) ve düşünüm (iç deneyim) yoluyla sonradan edinilir.',
    ontology: 'Nesnelerin birincil (ölçülebilir) ve ikincil (duyusal) niteliklerini ayırır.',
    ethics: 'Akıl ve deneyimle kavranabilen, başkalarının haklarına saygılı özgürlük ahlakı.',
    politicsAndSociety: 'Toplumsal sözleşme, yönetilenlerin rızası, yasama-yürütme dengesi ve hoşgörü.',
    notableThought: '“Yasanın bittiği yerde zorbalık başlar.”',
  },
  {
    id: 'kant',
    name: 'Immanuel Kant',
    lifespan: '1724 – 1804',
    era: 'Modern Felsefe',
    tradition: 'Eleştirel Felsefe (Kritisizm) · Aydınlanma',
    bio: 'Rasyonalizm ile empirizm arasındaki derin ayrılığı eleştirel felsefe ile aşan ve evrensel ödev ahlakını kuran Alman Aydınlanma filozofudur.',
    coreViews: [
      'Deneysiz kavramlar boş, kavramsız deneyler kördür; bilgi duyu ve zihin formlarının iş birliğidir.',
      'İnsanları asla yalnızca bir araç olarak değil, her zaman bir amaç olarak gör.',
      'Aydınlanma, insanın kendi suçu ile düşmüş olduğu ergin olmama durumundan aklını kullanarak kurtulmasıdır.',
    ],
    keyWorks: ['Saf Aklın Eleştirisi', 'Pratik Aklın Eleştirisi', 'Yargı Gücünün Eleştirisi', 'Ahlak Metafiziğinin Temellendirilmesi'],
    contributions: [
      'Bilgi kuramında özneyi merkeze alan “Kopernik Devrimi”ni gerçekleştirdi.',
      'Kesin buyruk (kategorik imperatif) ile evrensel ödev etiğini tanımladı.',
    ],
    relations: 'Hume’un şüpheciliğiyle “dogmatik uykusundan uyandığını” belirtir; modern etik ve hukuk felsefesinin temel taşlarından biridir.',
    epistemology: 'Kritisizm: Bilgi deneyimle başlar ancak zihnin a priori zaman, mekân ve kategorileriyle biçimlenir.',
    ontology: 'Fenomen (bize görünen dünya) ile Numen (kendinde şey) ayrımı.',
    ethics: 'Sonuç veya çıkara değil, evrensel yasa olabilecek iyi niyete ve ödeve dayalı ahlak.',
    politicsAndSociety: 'Hukuk devleti, cumhuriyetçi anayasa ve uluslar arası “Ebedî Barış” ideali.',
    notableThought: '“Aklını kendin kullanma cesaretini göster! (Sapere Aude)”',
  },
  {
    id: 'sartre',
    name: 'Jean-Paul Sartre',
    lifespan: '1905 – 1980',
    era: 'Çağdaş Felsefe',
    tradition: 'Varoluşçuluk (Egzistansiyalizm)',
    bio: 'İnsan özgürlüğü, seçim sorumluluğu ve özgün yaşam kavramlarını felsefe, roman ve tiyatro eserleriyle 20. yüzyılın merkezine taşıyan Fransız düşünürdür.',
    coreViews: [
      'İnsan söz konusu olduğunda “varoluş özden önce gelir”; insan kendini seçimleriyle inşa eder.',
      'İnsan özgürlüğe mahkûmdur; seçim yapmamak bile bir seçimdir.',
      'Özgürlüğünden ve sorumluluğundan kaçarak bahanelere sığınmak “kötü niyet”tir (mauvaise foi).',
    ],
    keyWorks: ['Varlık ve Hiçlik', 'Varoluşçuluk Bir Hümanizmdir', 'Bulantı'],
    contributions: [
      'Bireysel özgürlük ve etik sorumluluk arasındaki kopmaz bağı çağdaş felsefeye taşıdı.',
      'Felsefeyi edebiyat ve toplumsal angajman ile buluşturdu.',
    ],
    relations: 'Husserl ve Heidegger’in fenomenolojisinden etkilendi; Simone de Beauvoir ile çağdaş varoluşçuluğu geliştirdi.',
    epistemology: 'Bilinç her zaman bir şeye yöneliktir (yönelimsellik); anlam insanın dünya ile etkileşiminde kurulur.',
    ontology: 'Kendinde varlık (nesneler) ile kendi için varlık (özgür insan bilinci) arasındaki temel ayrım.',
    ethics: 'Özgünlük ve sorumluluk etiği: Her seçimimizle yalnızca kendimizi değil, insanlık tasarımımızı da seçeriz.',
    politicsAndSociety: 'Baskıya karşı özgürlükçü, dayanışmacı ve eleştirel toplumsal katılım.',
    notableThought: '“İnsan, kendisini ne yapıyorsa odur.”',
  },
  {
    id: 'ziya-gokalp',
    name: 'Ziya Gökalp',
    lifespan: '1876 – 1924',
    era: 'Türk Düşünce Tarihi',
    tradition: 'Türk Sosyolojisi ve Kültür Felsefesi',
    bio: 'Türkiye’de sosyoloji ve çağdaş düşünce sistematiğinin kurulmasına öncülük eden; hars (kültür) ve medeniyet ayrımıyla modernleşme tartışmalarına yön veren düşünürdür.',
    coreViews: [
      'Hars (millî kültür) bir toplumun özgün değerleri ve dilidir; medeniyet ise bilim, teknik ve ortak yöntemlerdir.',
      'Çağdaşlaşma, kendi kültürel kimliğini yitirmeden evrensel bilim ve teknikle bütünleşmektir.',
      'Toplumsal dayanışma, eğitimde dil birliği ve yurttaşlık bilinciyle güçlenir.',
    ],
    keyWorks: ['Türkleşmek, İslamlaşmak, Muasırlaşmak', 'Türkçülüğün Esasları', 'Türk Töresi'],
    contributions: [
      'Türkiye’de ilk sosyoloji kürsüsünün ve bilimsel toplum araştırmalarının öncüsü oldu.',
      'Cumhuriyet dönemi eğitim, dil ve kültür politikalarına kavramsal zemin sundu.',
    ],
    relations: 'Émile Durkheim’ın toplumsal dayanışma sosyolojisini Anadolu’nun tarihsel gerçekliğiyle özgün biçimde yorumladı.',
    epistemology: 'Toplumsal olgular nesnel gözlem, tarihsel karşılaştırma ve sosyolojik yöntemle incelenmelidir.',
    ontology: 'Birey, dil ve ortak değerler ağı olan toplumsal bilinç içinde kişilik kazanır.',
    ethics: 'Bireysel çıkarın ötesinde toplumsal görev, dayanışma ve yüksek ülkü ahlakı.',
    politicsAndSociety: 'Halkçılık, eğitimde fırsat eşitliği, kadın-erkek eşitliği ve çağdaş ulus-devlet anlayışı.',
    notableThought: '“Kültür bir milletin kalbidir; medeniyet ise ortak insanlık aklının ürünüdür.”',
  },
  {
    id: 'mevlana',
    name: 'Mevlânâ Celâleddîn-i Rûmî',
    lifespan: '1207 – 1273',
    era: 'Türk Düşünce Tarihi',
    tradition: 'Anadolu İrfanı ve Sevgi Felsefesi',
    bio: 'Konya’da insan sevgisi, hoşgörü, öz-eleştiri ve hikmet dolu mesellerle tüm insanlığa seslenen, eserleri dünya çapında okunan büyük düşünür ve şairdir.',
    coreViews: [
      'İnsan sürekli gelişen ve olgunlaşan bir varlıktır; dünle kalmayıp her gün yeni bir anlayış kazanmalıdır.',
      'Hoşgörü, merhamet ve kusur örtmek sağlıklı toplumun temelidir.',
      'İçtenlik esastır: “Ya olduğun gibi görün, ya göründüğün gibi ol.”',
    ],
    keyWorks: ['Mesnevî-i Mânevî', 'Dîvân-ı Kebîr', 'Fîhi Mâ Fîh'],
    contributions: [
      'Sembolik hikâyelerle karmaşık ahlaki ve varoluşsal sorunları herkesin anlayabileceği bir dile kavuşturdu.',
      'Evrensel barış, empati ve çok kültürlü diyalog felsefesinin öncülerinden oldu.',
    ],
    relations: 'Şems-i Tebrîzî ile kurduğu fikrî diyalog düşüncesini derinleştirdi; Yunus Emre ve Anadolu irfan geleneğiyle ortak insan sevgisi paydasındadır.',
    epistemology: 'Bilgi yalnızca kuru akıl yürütmeyle değil, kalp dinginliği, sezgi ve yaşantıyla derinleşir.',
    ontology: 'Evren sevgi ve birlik ilkesi etrafında sürekli hareket ve dönüşüm hâlindedir.',
    ethics: 'Kibirden arınma, tevazu, bağışlayıcılık, dürüstlük ve başkalarının sevincini paylaşma.',
    politicsAndSociety: 'Ayrıştırmayan, “Ne olursan ol yine gel” çağrısıyla bütün insanları kucaklayan barışçıl toplum.',
    notableThought: '“Aynı dili konuşanlar değil, aynı duyguyu paylaşanlar anlaşabilir.”',
  },
  {
    id: 'ibn-haldun',
    name: 'İbn Haldun',
    lifespan: '1332 – 1406',
    era: 'İslam Felsefesi',
    tradition: 'Tarih Felsefesi ve Sosyoloji (Umran İlmi)',
    bio: 'Ünlü eseri “Mukaddime” ile modern sosyolojinin, ekonomi politiğin ve eleştirel tarih felsefesinin kurucusu kabul edilen büyük bilim insanı ve devlet adamıdır.',
    coreViews: [
      'Tarih yalnızca olayların sıralanması değil; toplumsal neden-sonuç yasalarının bilimidir (Umran İlmi).',
      'Toplumları bir arada tutan temel bağ “asabiyet” (toplumsal dayanışma ve ortak ülkü ruhu) kavramıdır.',
      'Devletler de canlı organizmalar gibi doğar, büyür, olgunlaşır ve adaletten uzaklaştıklarında zayıflar.',
    ],
    keyWorks: ['Mukaddime', 'Kitâbü’l-İber'],
    contributions: [
      'Coğrafya ve iklimin toplum yaşamı, kültür ve ekonomi üzerindeki etkilerini sistemli inceledi.',
      'Vergi adaleti, üretim emeği ve eğitim yöntemleri üzerine çağının çok ilerisinde analizler yaptı.',
    ],
    relations: 'Aristoteles ve İslam filozoflarının birikimini tarihsel gözlemle birleştirdi; Osmanlı tarihçilerini (Naima, Kâtip Çelebi) ve modern sosyologları derinden etkiledi.',
    epistemology: 'Tarihsel haberler körü körüne kabul edilmemeli; akıl, doğa yasaları ve toplumsal gerçeklikle sınanmalıdır.',
    ontology: 'Toplumsal varlık, bireylerin iş bölümü ve dayanışmasıyla oluşan dinamik bir yapıdır.',
    ethics: 'Eğitimde baskı ve şiddet yerine sevgi, örnek olma ve kademeli öğrenme savunusu; yönetimde adalet.',
    politicsAndSociety: 'Adil vergilendirme, güçlü dayanışma (asabiyet) ve üretim temelli sürdürülebilir devlet modeli.',
    notableThought: '“Coğrafya kaderdir; ancak adalet ve bilgi toplumların kaderini yükseltir.”',
  },
  {
    id: 'haci-bektas',
    name: 'Hacı Bektaş-ı Velî',
    lifespan: '1209 – 1271',
    era: 'Türk Düşünce Tarihi',
    tradition: 'Anadolu İrfanı, Ahîlik ve İnsan Hakları',
    bio: 'Horasan’dan Anadolu’ya gelerek Sulucakarahöyük’te (Hacıbektaş) kurduğu ocakla barışı, kadın-erkek eşitliğini, bilimi ve ahlaki özdenetimi öğreten büyük Anadolu bilgesidir.',
    coreViews: [
      '“İlimden gidilmeyen yolun sonu karanlıktır.” — Akıl ve bilim her yolculuğun ışığıdır.',
      '“Eline, beline, diline sahip ol.” — Kişisel sorumluluk ve başkasının hakkına saygı.',
      '“Kadınları okutunuz.” — Eğitimde cinsiyet eşitliği ve toplumsal aydınlanma.',
    ],
    keyWorks: ['Makâlât', 'Besmele Tefsiri', 'Kitâbü’l-Fevâid'],
    contributions: [
      'Anadolu’da birlik, dayanışma ve hoşgörü kültürünün kurumsallaşmasını sağladı.',
      '“İncinsen de incitme” ilkesiyle şiddetsiz iletişim ve empati etiğini yaygınlaştırdı.',
    ],
    relations: 'Hoca Ahmed Yesevî geleneğinin Anadolu’daki temsilcilerindendir; Ahî Evran ve Yunus Emre ile ortak ahlaki iklimi paylaşır.',
    epistemology: 'Gerçek bilgi hem akıl ve gözlemden hem de insanı kâmil kılan ahlaki bilinçten beslenir.',
    ontology: 'Tüm varlıklar ortak bir yaratılış bütünlüğü içindedir; hiçbir canlı hor görülmemelidir.',
    ethics: 'İncinsen de incitmemek, eline-beline-diline sahip olmak, çalışkanlık ve paylaşımcılık.',
    politicsAndSociety: 'Eğitimde fırsat eşitliği, kadınların toplumsal saygınlığı, zanaat ve dayanışma odaklı barış toplumu.',
    notableThought: '“Hararet nardadır, sacda değildir; keramet baştadır, tacda değildir. Her ne arar isen kendinde ara!”',
  },
];

export const PHILOSOPHICAL_SCHOOLS: PhilosophicalSchool[] = [
  {
    id: 'idealizm',
    name: 'İdealizm',
    category: 'Varlık Felsefesi',
    summary: 'Gerçekliğin temelinde maddenin değil; düşünce, akıl, ruh veya ideaların bulunduğunu savunan yaklaşımdır.',
    coreThesis: 'Varlık, zihinsel veya düşünsel ilkelere dayanır.',
    representatives: ['Platon', 'George Berkeley', 'G. W. F. Hegel'],
    keyConcepts: ['İdea', 'Tin (Geist)', 'Öz', 'Akılsal Gerçeklik'],
  },
  {
    id: 'materyalizm',
    name: 'Materyalizm',
    category: 'Varlık Felsefesi',
    summary: 'Var olan her şeyin temelinde maddenin ve maddi süreçlerin bulunduğunu, bilincin de maddi temelden doğduğunu savunur.',
    coreThesis: 'Madde birincildir; evren maddi yasalarla açıklanabilir.',
    representatives: ['Demokritos', 'Thomas Hobbes', 'Karl Marx'],
    keyConcepts: ['Atom', 'Madde', 'Nedensellik', 'Tarihsel Süreç'],
  },
  {
    id: 'rasyonalizm',
    name: 'Rasyonalizm (Akılcılık)',
    category: 'Bilgi Felsefesi',
    summary: 'Doğru ve kesin bilginin asıl kaynağının duyular değil, insan aklı ve mantıksal ilkeler olduğunu ileri sürer.',
    coreThesis: 'Duyular yanıltabilir; evrensel ve zorunlu bilgi akıl ile kurulur.',
    representatives: ['Sokrates', 'Platon', 'René Descartes', 'Baruch Spinoza'],
    keyConcepts: ['A priori', 'Doğuştan Fikirler', 'Tümdengelim', 'Açık ve Seçik Bilgi'],
  },
  {
    id: 'empirizm',
    name: 'Empirizm (Deneycilik)',
    category: 'Bilgi Felsefesi',
    summary: 'Tüm bilgilerin duyusal deneyim, gözlem ve yaşantı sonucunda kazanıldığını, zihnin doğuştan boş bir levha olduğunu savunur.',
    coreThesis: 'Deneyimden geçmeyen hiçbir kavram zihinde bulunmaz.',
    representatives: ['John Locke', 'David Hume', 'Francis Bacon'],
    keyConcepts: ['Tabula Rasa', 'A posteriori', 'Gözlem', 'Tümevarım'],
  },
  {
    id: 'varolusculuk',
    name: 'Varoluşçuluk (Egzistansiyalizm)',
    category: 'İnsan ve Ahlak Felsefesi',
    summary: 'İnsanın önceden belirlenmiş sabit bir özü olmadığını; özgür seçimleri ve eylemleriyle kendi anlamını yarattığını savunur.',
    coreThesis: 'Varoluş özden önce gelir; insan seçimlerinden bütünüyle sorumludur.',
    representatives: ['Søren Kierkegaard', 'Jean-Paul Sartre', 'Simone de Beauvoir'],
    keyConcepts: ['Özgürlük', 'Sorumluluk', 'Özgünlük', 'Bunalım'],
  },
  {
    id: 'pragmatizm',
    name: 'Pragmatizm (Faydacılık)',
    category: 'Bilgi ve Değer Felsefesi',
    summary: 'Bir düşüncenin veya bilginin doğruluğunu, yaşamda sağladığı pratik sonuçlara, problem çözme gücüne ve uygulanabilirliğine göre değerlendirir.',
    coreThesis: 'Doğruluk, eylem içinde işe yarayan ve deneyimde sınanan sonuçlarla ölçülür.',
    representatives: ['Charles S. Peirce', 'William James', 'John Dewey'],
    keyConcepts: ['Uygulanabilirlik', 'Deneyim', 'Problem Çözme', 'Araçsal Akıl'],
  },
  {
    id: 'pozitivizm',
    name: 'Pozitivizm (Olguculuk)',
    category: 'Bilim Felsefesi',
    summary: 'Yalnızca gözlem, deney ve mantıksal doğrulamaya dayanan bilimsel olguların güvenilir bilgi verebileceğini savunan akımdır.',
    coreThesis: 'Bilgi, metafizik kurgulardan arındırılıp olgusal bilim yöntemine dayanmalıdır.',
    representatives: ['Auguste Comte', 'Ernst Mach', 'Viyana Çevresi'],
    keyConcepts: ['Olgu', 'Doğrulanabilirlik', 'Üç Hâl Yasası', 'Bilimsel Yöntem'],
  },
  {
    id: 'stoacilik',
    name: 'Stoacılık',
    category: 'Ahlak Felsefesi',
    summary: 'Kontrol edebileceğimiz şeyler (düşüncelerimiz ve erdemimiz) ile kontrol edemeyeceğimiz dış olayları ayırarak içsel dinginliğe ulaşmayı öğütler.',
    coreThesis: 'Doğa ve akılla uyumlu, erdemli bir yaşam sarsılmaz iç huzuru getirir.',
    representatives: ['Kıbrıslı Zenon', 'Epiktetos', 'Seneca', 'Marcus Aurelius'],
    keyConcepts: ['Ataraksia (Dinginlik)', 'Özdenetim', 'Erdem', 'Dünya Yurttaşlığı'],
  },
  {
    id: 'suphecilik',
    name: 'Şüphecilik (Septisizm)',
    category: 'Bilgi Felsefesi',
    summary: 'Kesin ve mutlak bilgiye ulaşma iddialarını eleştirel biçimde sorgulayan, acele yargıdan kaçınmayı (epokhe) öneren yaklaşımdır.',
    coreThesis: 'Her bilgi iddiası sürekli sınanmalı; kesin kanıt olmadan yargı askıya alınmalıdır.',
    representatives: ['Pyrrhon', 'Sextus Empiricus', 'David Hume'],
    keyConcepts: ['Epokhe (Yargıyı Askıya Alma)', 'Eleştirel Sorgulama', 'Görelilik'],
  },
];

export const SOCRATIC_TOPICS = [
  'Özgürlük mü, güvenlik mi önce gelir?',
  'Gerçek bilgiye duyularla mı, akılla mı ulaşırız?',
  'Yapay zekâ çağında insanı insan yapan nedir?',
  'Adalet herkese eşit davranmak mıdır, hak ettiğini vermek midir?',
  'Mutluluk bir hedef midir, yoksa erdemli yaşamın sonucu mudur?',
  'Bilimsel bilgi mutlak mıdır, yoksa sürekli yenilenen bir süreç midir?',
  'Kurallar mı vicdandan üstündür, yoksa vicdan mı kuralları sorgulamalıdır?',
  'Teknoloji insanı daha özgür mü kılıyor, yoksa yeni bağımlılıklar mı üretiyor?',
];

export const DIALOGUE_PERSONAS = [
  { id: 'Sokratik Rehber', label: 'Sokratik Rehber (Tarafsız)', isSimulation: false },
  { id: 'Sokrates', label: 'Sokrates (Tarihî Simülasyon)', isSimulation: true },
  { id: 'Fârâbî', label: 'Fârâbî (Tarihî Simülasyon)', isSimulation: true },
  { id: 'Mevlânâ', label: 'Mevlânâ (Tarihî Simülasyon)', isSimulation: true },
  { id: 'İbn Haldun', label: 'İbn Haldun (Tarihî Simülasyon)', isSimulation: true },
  { id: 'René Descartes', label: 'René Descartes (Tarihî Simülasyon)', isSimulation: true },
  { id: 'Immanuel Kant', label: 'Immanuel Kant (Tarihî Simülasyon)', isSimulation: true },
  { id: 'Jean-Paul Sartre', label: 'Jean-Paul Sartre (Tarihî Simülasyon)', isSimulation: true },
];

export const PHILOSOPHY_QUIZ_QUESTIONS: PhilosophyQuizQuestion[] = [
  {
    id: 'pq-1',
    category: 'Kavram Eşleştirme',
    question: 'John Locke’un insan zihninin doğuştan boş olduğunu ifade etmek için kullandığı kavram hangisidir?',
    options: ['Tabula Rasa', 'Kategorik İmperatif', 'Anamnesis', 'Epokhe'],
    correctIndex: 0,
    explanation:
      '“Tabula Rasa” (boş levha), Locke’un deneyciliğinde zihnin doğuştan bilgi taşımadığını, deneyimlerle dolduğunu anlatır.',
  },
  {
    id: 'pq-2',
    category: 'Filozof–Eser',
    question: '“El-Medînetü’l-Fâzıla” (Erdemli Şehir) ve “İhsâü’l-Ulûm” eserleri hangi İslam filozofuna aittir?',
    options: ['İbn Rüşd', 'Fârâbî', 'Gazâlî', 'İbn Haldun'],
    correctIndex: 1,
    explanation:
      'Muallim-i Sânî (İkinci Öğretmen) olarak anılan Fârâbî, ideal toplum modelini El-Medînetü’l-Fâzıla eserinde temellendirmiştir.',
  },
  {
    id: 'pq-3',
    category: 'Felsefi Akımlar',
    question: '“Varoluş özden önce gelir” ilkesini merkeze alarak bireyin özgür seçim ve sorumluluğunu vurgulayan akım hangisidir?',
    options: ['Pozitivizm', 'Stoacılık', 'Varoluşçuluk', 'Rasyonalizm'],
    correctIndex: 2,
    explanation:
      'Jean-Paul Sartre ile özdeşleşen Varoluşçuluk (Egzistansiyalizm), insanın kendi özünü özgür kararlarıyla inşa ettiğini savunur.',
  },
  {
    id: 'pq-4',
    category: 'Kavram Eşleştirme',
    question: 'Aristoteles’in ahlak felsefesinde cesaretin korkaklık ile delice atılganlık arasında yer almasını ifade eden ilke nedir?',
    options: ['Metodik Şüphe', 'Altın Orta', 'Sudûr', 'Üç Hâl Yasası'],
    correctIndex: 1,
    explanation:
      'Aristoteles’e göre erdem, iki aşırı uç arasındaki ölçülü denge olan “Altın Orta”yı alışkanlık hâline getirmektir.',
  },
  {
    id: 'pq-5',
    category: 'Filozof–Eser',
    question: '“Saf Aklın Eleştirisi” adlı eseriyle rasyonalizm ve empirizmi uzlaştıran filozof kimdir?',
    options: ['René Descartes', 'David Hume', 'Immanuel Kant', 'Platon'],
    correctIndex: 2,
    explanation:
      'Immanuel Kant, eleştirel felsefesiyle bilginin hem duyu deneyimine hem de zihnin a priori formlarına dayandığını göstermiştir.',
  },
  {
    id: 'pq-6',
    category: 'Felsefi Akımlar',
    question: 'Kontrol edemediğimiz dış olaylara karşı sükûneti korumayı ve erdemli özdenetimi savunan antik ahlak okulu hangisidir?',
    options: ['Stoacılık', 'Pragmatizm', 'Materyalizm', 'Empirizm'],
    correctIndex: 0,
    explanation:
      'Epiktetos, Seneca ve Marcus Aurelius gibi temsilcileri olan Stoacılık, içsel dinginliği ve akılla uyumlu yaşamı öğütler.',
  },
  {
    id: 'pq-7',
    category: 'Filozof–Eser',
    question: '“Uçan Adam” düşünce deneyiyle öz-bilinç problemini tartışan ve “Kitâbü’ş-Şifâ”yı yazan düşünür kimdir?',
    options: ['Yunus Emre', 'Ziya Gökalp', 'İbn Sînâ', 'Aquinolu Thomas'],
    correctIndex: 2,
    explanation:
      'İbn Sînâ, duyu organlarından yoksun bir insanın dahi kendi varlığının bilincinde olacağını gösteren “Uçan Adam” deneyini geliştirmiştir.',
  },
  {
    id: 'pq-8',
    category: 'Felsefi Akımlar',
    question: 'Bir düşüncenin doğruluğunu pratik yaşamda problem çözme gücü ve işe yararlığı ile değerlendiren akım hangisidir?',
    options: ['İdealizm', 'Pragmatizm', 'Şüphecilik', 'Rasyonalizm'],
    correctIndex: 1,
    explanation:
      'William James ve John Dewey’nin öncülük ettiği Pragmatizm (Faydacılık), düşüncelerin değerini pratik sonuçlarıyla sınar.',
  },
];

export const OPEN_ENDED_THOUGHT_PROMPTS: OpenEndedThoughtPrompt[] = [
  {
    id: 'oe-1',
    title: 'Ödev mi, Sonuç mu?',
    question:
      'Bir eylemin ahlaki değerini niyetin doğruluğu mu (Kant), yoksa ürettiği toplumsal fayda mı belirler? Kendi örneğinizle savunun.',
    guidingHints: [
      'Önce temel ilkenizi açık bir cümleyle tanımlayın.',
      'Karşıt görüşün güçlü olduğu bir sınır durumu düşünün.',
      'Günlük yaşamdan somut bir örnek ekleyin.',
    ],
  },
  {
    id: 'oe-2',
    title: 'Bilgi ve Teknoloji Çağında Hakikat',
    question:
      'Bilgiye saniyeler içinde erişebildiğimiz bir çağda Platon’un “sanı (doksa) ile kesin bilgi (episteme)” ayrımı hâlâ geçerli midir?',
    guidingHints: [
      'Enformasyon bolluğu ile doğrulanmış bilgi arasındaki farkı belirtin.',
      'Eleştirel doğrulama ölçütlerinizi açıklayın.',
    ],
  },
  {
    id: 'oe-3',
    title: 'Kültür ve Evrensellik Dengesi',
    question:
      'Ziya Gökalp’in “hars (kültür) ve medeniyet” ayrımı, küreselleşen dünyada kültürel kimliği koruyarak bilimsel ilerleme sağlamak için nasıl yorumlanabilir?',
    guidingHints: [
      'Yerel kültürel değerler ile evrensel bilim-teknik arasındaki ilişkiyi tanımlayın.',
      'Eğitim ve dil boyutuna değinin.',
    ],
  },
  {
    id: 'oe-4',
    title: 'Yapay Zekâ, Ödev ve Emek Etiği',
    question:
      'Bir öğrenci kompozisyonunu veya matematik ödevini tamamen yapay zekâya yaptırıp kendi adıyla teslim ederse burada hangi etik ilkeler zedelenir? Teknoloji öğrenmeyi nasıl desteklemelidir?',
    guidingHints: [
      'Dürüstlük, emek ve kendi aklını kullanma (Kant / Aydınlanma) boyutlarını değerlendirin.',
      'Yapay zekânın “kopya aracı” yerine “rehber öğretmen” gibi kullanıldığı somut bir örnek verin.',
    ],
  },
  {
    id: 'oe-5',
    title: 'Adalet, Eşitlik ve Empati',
    question:
      'Bir sınıfta veya toplumda herkese tıpatıp aynı şeyi vermek (eşitlik) her zaman adil midir, yoksa ihtiyaçlara göre destek sunmak (hakkaniyet/adalet) daha mı doğrudur? Örnekle tartışın.',
    guidingHints: [
      'Eşitlik ile hakkaniyet arasındaki farkı somut bir okul örneğiyle (ör. farklı boylardaki öğrencilerin tahtayı görmesi) açıklayın.',
      'Aristoteles’in veya Fârâbî’nin adalet anlayışına atıfta bulunun.',
    ],
  },
];
