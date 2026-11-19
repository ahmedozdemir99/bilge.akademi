export interface LiteraryPeriod {
  id: string;
  name: string;
  era: string;
  summary: string;
  keyTraits: string[];
  majorFigures: string[];
}

export interface LiteraryMovement {
  id: string;
  name: string;
  originEra: string;
  coreIdea: string;
  turkishRepresentatives: string[];
}

export interface LiteraryAuthor {
  id: string;
  name: string;
  lifespan: string;
  period: string;
  bio: string;
  keyWorks: string[];
  styleNotes: string;
}

export interface LiteraryDevice {
  name: string;
  turkishMeaning: string;
  explanation: string;
  example: string;
}

export interface PublicDomainWork {
  id: string;
  title: string;
  author: string;
  period: string;
  genre: string;
  summary: string;
  themes: string[];
  publicDomainExcerpt: string;
  literarySignificance: string;
}

export interface LiteratureQuizQuestion {
  id: string;
  type: 'mcq' | 'tf' | 'match';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const LITERARY_PERIODS: LiteraryPeriod[] = [
  {
    id: 'islamiyet-oncesi',
    name: 'İslamiyet Öncesi Türk Edebiyatı',
    era: 'Başlangıç – 11. Yüzyıl',
    summary:
      'Sözlü geleneğin baskın olduğu; koşuk, sagu, sav ve destan türlerinin kopuz eşliğinde icra edildiği, arı Türkçenin ve hece ölçüsünün kullanıldığı dönemdir.',
    keyTraits: [
      'Hece ölçüsü (çoğunlukla 7’li, 8’li, 11’li) ve yarım kafiye yaygındır.',
      'Göktürk (Orhun) Yazıtları yazılı edebiyatın en önemli anıtlarıdır.',
      'Doğa, kahramanlık, göç ve yas temel temalardır.',
    ],
    majorFigures: ['Yolluğ Tigin', 'Aprın Çor Tigin'],
  },
  {
    id: 'divan-edebiyati',
    name: 'Divan Edebiyatı',
    era: '13. Yüzyıl – 19. Yüzyıl',
    summary:
      'Aruz ölçüsü, beyit nazım birimi ve zengin mazmun dünyasıyla estetik mükemmelliği hedefleyen klasik Türk edebiyatı geleneğidir.',
    keyTraits: [
      'Gazel, kaside, mesnevi, rubai ve şarkı başlıca nazım biçimleridir.',
      'Söz sanatları, ahenk ve biçim kusursuzluğu ön plandadır.',
      'Tasavvufi aşk, beşerî aşk, hikmet ve övgü temel temalardır.',
    ],
    majorFigures: ['Fuzulî', 'Bâkî', 'Nedim', 'Şeyh Galip', 'Nef’î'],
  },
  {
    id: 'halk-edebiyati',
    name: 'Halk Edebiyatı',
    era: '13. Yüzyıl – Günümüz',
    summary:
      'Halkın konuşma diliyle, dörtlük nazım birimi ve hece ölçüsüyle oluşturulan; Anonim, Âşık ve Dinî-Tasavvufi kollarıyla yaşayan köklü gelenektir.',
    keyTraits: [
      'Koşma, semai, varsağı, mâni, türkü ve ilahi yaygın türlerdir.',
      'Saz şairleri şiirlerini bağlama eşliğinde doğaçlama söylemiştir.',
      'Yalın dil, içtenlik ve toplumsal duyarlılık belirgindir.',
    ],
    majorFigures: ['Yunus Emre', 'Karacaoğlan', 'Pir Sultan Abdal', 'Dadaloğlu', 'Âşık Veysel'],
  },
  {
    id: 'tanzimat',
    name: 'Tanzimat Edebiyatı',
    era: '1860 – 1896',
    summary:
      'Batı etkisinde gelişen ilk modern Türk edebiyatı dönemidir. Roman, hikâye, tiyatro ve gazete gibi türler bu dönemde edebiyatımıza girmiştir.',
    keyTraits: [
      '1. Dönemde “toplum için sanat” ve vatan, hürriyet, adalet temaları işlenmiştir.',
      '2. Dönemde bireysel duygulara ve “sanat için sanat” anlayışına yönelinmiştir.',
      'Dil sadeleştirme çabası başlamış, ancak tam olarak Millî Edebiyat’ta gerçekleşmiştir.',
    ],
    majorFigures: ['Şinasi', 'Namık Kemal', 'Ziya Paşa', 'Recaizade Mahmut Ekrem', 'Abdülhak Hamit Tarhan'],
  },
  {
    id: 'milli-edebiyat',
    name: 'Millî Edebiyat Dönemi',
    era: '1911 – 1923',
    summary:
      'Genç Kalemler dergisinde yayımlanan “Yeni Lisan” makalesiyle sade Türkçeyi, hece ölçüsünü ve Anadolu gerçeğini merkeze alan dönemdir.',
    keyTraits: [
      'Konuşma diline dayalı sade ve duru İstanbul Türkçesi benimsenmiştir.',
      'Anadolu insanı, tarih bilinci ve bağımsızlık duygusu öne çıkmıştır.',
      'Beş Hececiler hece ölçüsünü modern şiire taşımıştır.',
    ],
    majorFigures: ['Ömer Seyfettin', 'Ziya Gökalp', 'Ali Canip Yöntem', 'Halide Edib Adıvar', 'Yakup Kadri Karaosmanoğlu'],
  },
  {
    id: 'cumhuriyet',
    name: 'Cumhuriyet Dönemi Türk Edebiyatı',
    era: '1923 – Günümüz',
    summary:
      'Öz şiir, toplumcu gerçekçilik, Garip (I. Yeni), II. Yeni ve modern roman akımlarıyla çok sesli ve zengin bir edebî üretim dönemidir.',
    keyTraits: [
      'Serbest ölçü yaygınlaşmış, imge ve anlatım teknikleri çeşitlenmiştir.',
      'Anadolu’nun tüm katmanları ve modern bireyin iç dünyası işlenmiştir.',
      'Deneme, eleştiri ve modern öykücülük olgunlaşmıştır.',
    ],
    majorFigures: ['Ahmet Hamdi Tanpınar', 'Yahya Kemal Beyatlı', 'Orhan Veli Kanık', 'Sait Faik Abasıyanık'],
  },
];

export const LITERARY_MOVEMENTS: LiteraryMovement[] = [
  {
    id: 'klasisizm',
    name: 'Klasisizm',
    originEra: '17. Yüzyıl Fransa',
    coreIdea: 'Akıl, sağduyu, ölçü ve antik Yunan-Latin estetiğine bağlılık; seçkin ve kusursuz dil.',
    turkishRepresentatives: ['Şinasi', 'Ahmet Vefik Paşa'],
  },
  {
    id: 'romantizm',
    name: 'Romantizm',
    originEra: '18. Yüzyıl Sonu – 19. Yüzyıl',
    coreIdea: 'Duygu, hayal gücü, doğa sevgisi, özgürlük ve bireyin coşkusu; klasisizmin katı kurallarına tepki.',
    turkishRepresentatives: ['Namık Kemal', 'Abdülhak Hamit Tarhan', 'Ahmet Mithat Efendi'],
  },
  {
    id: 'realizm',
    name: 'Realizm',
    originEra: '19. Yüzyıl İkinci Yarısı',
    coreIdea: 'Gözlem, nesnellik ve toplumsal gerçekliği olduğu gibi yansıtma; yazarın kişiliğini gizlemesi.',
    turkishRepresentatives: ['Recaizade Mahmut Ekrem', 'Halit Ziya Uşaklıgil', 'Refik Halit Karay'],
  },
  {
    id: 'sembolizm',
    name: 'Sembolizm',
    originEra: '19. Yüzyıl Sonu',
    coreIdea: 'Dış dünyayı imgeler, simgeler ve musiki ile sezdirme; anlam kapalılığı ve çağrışım zenginliği.',
    turkishRepresentatives: ['Ahmet Haşim', 'Cenap Şahabettin', 'Cahit Sıtkı Tarancı'],
  },
  {
    id: 'parnasizm',
    name: 'Parnasizm',
    originEra: '19. Yüzyıl Fransa',
    coreIdea: 'Şiirde gerçekçilik, biçim mükemmelliği, betimleme gücü ve “sanat için sanat” ilkesi.',
    turkishRepresentatives: ['Tevfik Fikret', 'Yahya Kemal Beyatlı'],
  },
];

export const LITERARY_AUTHORS: LiteraryAuthor[] = [
  {
    id: 'yunus-emre',
    name: 'Yunus Emre',
    lifespan: 'y. 1240 – y. 1320',
    period: 'Dinî-Tasavvufi Halk Edebiyatı',
    bio: 'Anadolu’da Türkçe tasavvuf şiirinin öncüsüdür. İnsanı, hoşgörüyü ve ilahî aşkı son derece yalın ve derin bir Türkçe ile işlemiştir.',
    keyWorks: ['Divan', 'Risâletü’n-Nushiyye'],
    styleNotes: 'Sehl-i mümteni (kolay görünmesine karşın taklit edilemeyen derin yalınlık) ustasıdır.',
  },
  {
    id: 'fuzuli',
    name: 'Fuzulî',
    lifespan: 'y. 1483 – 1556',
    period: 'Divan Edebiyatı',
    bio: '16. yüzyılın en büyük divan şairlerinden biridir. Aşk acısını olgunlaştıran bir değer olarak gören derin lirizmiyle tanınır.',
    keyWorks: ['Leylâ vü Mecnun', 'Türkçe Divan', 'Şikâyetnâme', 'Beng ü Bâde'],
    styleNotes: 'Azeri Türkçesi özelliklerini taşıyan içten, musiki dolu ve derinlikli gazeller yazmıştır.',
  },
  {
    id: 'namik-kemal',
    name: 'Namık Kemal',
    lifespan: '1840 – 1888',
    period: 'Tanzimat I. Dönem',
    bio: '“Vatan Şairi” olarak anılır. Türk edebiyatında ilk edebî roman ve sahnelenen ilk modern tiyatro örneklerini vermiştir.',
    keyWorks: ['İntibah', 'Cezmi', 'Vatan yahut Silistre', 'Hürriyet Kasidesi'],
    styleNotes: 'Romantizm akımından etkilenmiş, coşkulu ve hitabet gücü yüksek bir üslup benimsemiştir.',
  },
  {
    id: 'omer-seyfettin',
    name: 'Ömer Seyfettin',
    lifespan: '1884 – 1920',
    period: 'Millî Edebiyat',
    bio: 'Modern Türk hikâyeciliğinin kurucularındandır. “Yeni Lisan” hareketiyle dilde sadeleşmenin öncülüğünü yapmıştır.',
    keyWorks: ['Kaşağı', 'Yüksek Ökçeler', 'Falaka', 'Başını Vermeyen Şehit', 'Bomba'],
    styleNotes: 'Maupassant tarzı olay öykücülüğünün çarpıcı sonlu, yalın ve akıcı örneklerini vermiştir.',
  },
  {
    id: 'mehmet-akif',
    name: 'Mehmet Âkif Ersoy',
    lifespan: '1873 – 1936',
    period: 'Bağımsız / Millî Mücadele Dönemi',
    bio: 'İstiklâl Marşı’nın şairidir. Toplumsal gerçekçiliği, aruz ölçüsünü Türkçeye ustaca uyarlaması ve manzum hikâyeleriyle tanınır.',
    keyWorks: ['Safahat (7 kitap)', 'İstiklâl Marşı', 'Çanakkale Şehitlerine'],
    styleNotes: 'Konuşma dilini aruz kalıplarına başarıyla yerleştirmiş, yüksek ahlaki duyarlılıkla yazmıştır.',
  },
  {
    id: 'ahmet-hamdi',
    name: 'Ahmet Hamdi Tanpınar',
    lifespan: '1901 – 1962',
    period: 'Cumhuriyet Dönemi',
    bio: 'Zaman, rüya, musiki ve Doğu-Batı sentezi temalarını hem şiirde hem romanda benzersiz bir estetikle işlemiş şair, romancı ve edebiyat tarihçisidir.',
    keyWorks: ['Huzur', 'Saatleri Ayarlama Enstitüsü', 'Beş Şehir', '19. Asır Türk Edebiyatı Tarihi'],
    styleNotes: 'Öz şiir anlayışına bağlı, simgeci ve kültür tarihini derinlemesine kavrayan bir dil kurmuştur.',
  },
];

export const LITERARY_DEVICES: LiteraryDevice[] = [
  {
    name: 'Teşbih (Benzetme)',
    turkishMeaning: 'Aralarında ilgi bulunan iki unsurdan zayıf olanı güçlü olana benzetme.',
    explanation: 'Benzeyen, kendisine benzetilen, benzetme yönü ve benzetme edatı olmak üzere dört ögeden oluşabilir.',
    example: '“Zaman, sessiz akan berrak bir ırmak gibi geçiyor.”',
  },
  {
    name: 'İstiare (Eğretileme)',
    turkishMeaning: 'Benzetmenin temel ögelerinden yalnızca birini kullanarak yapılan söz sanatı.',
    explanation: 'Yalnızca kendisine benzetilen söylenirse açık istiare, yalnızca benzeyen söylenirse kapalı istiare olur.',
    example: '“Gökyüzünün altın feneri dağların ardına çekildi.” (Güneş söylenmeden benzetme yapılmıştır.)',
  },
  {
    name: 'Teşhis (Kişileştirme)',
    turkishMeaning: 'İnsana özgü özellikleri insan dışındaki varlıklara aktarma.',
    explanation: 'Doğa betimlemelerine duygusal derinlik kazandırmak için sık kullanılır.',
    example: '“Rüzgâr, eski konakların pencerelerine hüzünle fısıldıyordu.”',
  },
  {
    name: 'Tezat (Karşıtlık)',
    turkishMeaning: 'Birbirine zıt kavram, duygu veya durumları aynı dizede bir arada kullanma.',
    explanation: 'Anlamı güçlendirmek ve gerilim oluşturmak için tercih edilir.',
    example: '“Ağlarım hatıra geldikçe gülüştüklerimiz.” (Mahir Baba)',
  },
  {
    name: 'Telmih (Hatırlatma)',
    turkishMeaning: 'Herkesçe bilinen tarihî bir olaya, kişiye veya kıssaya üstü kapalı gönderme yapma.',
    explanation: 'Şiirde yoğun çağrışım alanı açar.',
    example: '“Gökyüzünde İsa ile / Tur dağında Musa ile…” (Yunus Emre)',
  },
  {
    name: 'Hüsn-i Talil (Güzel Nedene Bağlama)',
    turkishMeaning: 'Bir doğa olayını gerçek sebebi dışında şairane ve güzel bir nedene bağlama.',
    explanation: 'Duygusal etkiyi yükseltmek amacıyla yapılır.',
    example: '“Sen geldin diye açtı bahçedeki bütün erik çiçekleri.”',
  },
];

export const PUBLIC_DOMAIN_WORKS: PublicDomainWork[] = [
  {
    id: 'kutadgu-bilig',
    title: 'Kutadgu Bilig',
    author: 'Yusuf Has Hacib',
    period: 'Geçiş Dönemi (1069–1070)',
    genre: 'Mesnevi / Siyasetname',
    summary:
      '“Mutluluk Veren Bilgi” anlamına gelen eser; adalet (Kün Togdı), devlet/saadet (Ay Toldı), akıl (Ögdülmiş) ve kanaat/akıbet (Odgurmış) sembolik karakterleri üzerinden ideal insan ve devlet yönetimini anlatır.',
    themes: ['Adalet', 'Devlet Yönetimi', 'Akıl ve Bilgi', 'Erdemli Yaşam'],
    publicDomainExcerpt: '“Bilgi bil, insan ol; bilgisiz kişi yürüyen bir gölge gibidir.” (Anlam aktarımı)',
    literarySignificance:
      'Türk edebiyatında aruz ölçüsü ve mesnevi nazım biçimiyle yazılan ilk büyük eserdir.',
  },
  {
    id: 'yunus-divan',
    title: 'Yunus Emre Divanı',
    author: 'Yunus Emre',
    period: '13.–14. Yüzyıl Halk & Tasavvuf Edebiyatı',
    genre: 'İlahi / Şiir',
    summary:
      'İnsanın kendini bilmesini, gönül kırmamayı ve sevgiyi merkeze alan; hem hece hem aruz ölçüsüyle söylenmiş Türkçe şiirlerin bir araya geldiği temel eserdir.',
    themes: ['Kendini Bilmek', 'Sevgi ve Hoşgörü', 'Gönül İnşası', 'Tevazu'],
    publicDomainExcerpt: '“İlim ilim bilmektir / İlim kendin bilmektir / Sen kendini bilmezsin / Ya nice okumaktır”',
    literarySignificance: 'Anadolu Türkçesinin edebî dil olarak kurumsallaşmasında eşsiz bir rol oynamıştır.',
  },
  {
    id: 'intibah',
    title: 'İntibah (Son Pişmanlık)',
    author: 'Namık Kemal',
    period: 'Tanzimat I. Dönem (1876)',
    genre: 'Roman',
    summary:
      'İyi eğitimli ancak yaşam deneyimi eksik Ali Bey’in yanlış kararları sonucunda yaşadığı trajik çöküşü işler. Tanzimat dönemi toplum ve ahlak duyarlılığını yansıtır.',
    themes: ['Yanlış Seçimler', 'Aile ve Eğitim', 'Pişmanlık', 'Toplumsal Ahlak'],
    publicDomainExcerpt: 'Eser, Çamlıca’nın bahar tasviriyle başlar ve romantik anlatım özelliklerini taşır.',
    literarySignificance: 'Türk edebiyatının ilk edebî romanı kabul edilir.',
  },
];

export const LITERATURE_QUIZ_QUESTIONS: LiteratureQuizQuestion[] = [
  {
    id: 'lq1',
    type: 'mcq',
    question: 'Türk edebiyatında aruz ölçüsü ve mesnevi biçimiyle yazılmış ilk büyük siyasetname hangisidir?',
    options: ['Divânu Lugâti’t-Türk', 'Kutadgu Bilig', 'Atabetü’l-Hakâyık', 'Dede Korkut Hikâyeleri'],
    correctIndex: 1,
    explanation:
      'Yusuf Has Hacib tarafından 1069–1070 yıllarında yazılan Kutadgu Bilig, Türk edebiyatında aruz ölçüsü ve mesnevi biçiminin ilk büyük örneğidir.',
  },
  {
    id: 'lq2',
    type: 'tf',
    question: 'Doğru / Yanlış: “Yeni Lisan” makalesi Genç Kalemler dergisinde yayımlanarak Millî Edebiyat’ın dil anlayışını belirlemiştir.',
    options: ['Doğru', 'Yanlış'],
    correctIndex: 0,
    explanation:
      'Doğrudur. 1911 yılında Selanik’te yayımlanan Genç Kalemler dergisindeki “Yeni Lisan” makalesi, sade Türkçeyi savunan Millî Edebiyat hareketini başlatmıştır.',
  },
  {
    id: 'lq3',
    type: 'match',
    question: 'Yazar–Eser Eşleştirme: “Leylâ vü Mecnun” ve “Şikâyetnâme” eserleri hangi şaire aittir?',
    options: ['Bâkî', 'Nedim', 'Fuzulî', 'Şeyh Galip'],
    correctIndex: 2,
    explanation:
      '16. yüzyıl divan şairi Fuzulî, Türk edebiyatının en ünlü Leylâ vü Mecnun mesnevisini ve ilk edebî mektup örneklerinden Şikâyetnâme’yi yazmıştır.',
  },
  {
    id: 'lq4',
    type: 'mcq',
    question: 'Bir doğa olayını gerçek nedeni dışında şairane ve güzel bir sebebe bağlama sanatına ne ad verilir?',
    options: ['Tecahül-i Arif', 'Hüsn-i Talil', 'Kinaye', 'Tevriye'],
    correctIndex: 1,
    explanation:
      'Hüsn-i Talil “güzel nedene bağlama” demektir; örneğin çiçeklerin açmasını sevgilinin gelişine bağlamak bu sanata örnektir.',
  },
  {
    id: 'lq5',
    type: 'match',
    question: 'Yazar–Eser Eşleştirme: “Saatleri Ayarlama Enstitüsü” ve “Beş Şehir” eserlerinin yazarı kimdir?',
    options: ['Yakup Kadri Karaosmanoğlu', 'Reşat Nuri Güntekin', 'Ahmet Hamdi Tanpınar', 'Peyami Safa'],
    correctIndex: 2,
    explanation:
      'Ahmet Hamdi Tanpınar, modern Türk edebiyatında zaman ve kültür değişimi temalarını işlediği Saatleri Ayarlama Enstitüsü, Huzur ve Beş Şehir eserlerinin yazarıdır.',
  },
  {
    id: 'lq6',
    type: 'tf',
    question: 'Doğru / Yanlış: Divan edebiyatında temel nazım birimi dörtlük, ölçü ise hece ölçüsüdür.',
    options: ['Doğru', 'Yanlış'],
    correctIndex: 1,
    explanation:
      'Yanlıştır. Dörtlük ve hece ölçüsü Halk Edebiyatı’nın temel özellikleridir; Divan Edebiyatı’nda ağırlıklı olarak beyit ve aruz ölçüsü kullanılır.',
  },
];
