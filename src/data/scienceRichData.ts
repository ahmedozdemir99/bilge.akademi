export type ElementCategory = 'Metal' | 'Yarı Metal' | 'Ametal' | 'Soygaz';

export interface PeriodicElement {
  atomicNumber: number;
  symbol: string;
  name: string;
  massNumber: number;
  period: number;
  group: string;
  column: number; // 1..8 compact main-group grid (1A..8A)
  category: ElementCategory;
  stateAtRoom: 'Katı' | 'Sıvı' | 'Gaz';
  shells: number[];
  summary: string;
  everydayUses: string[];
  funFact: string;
}

export interface PhSubstance {
  id: string;
  name: string;
  formula?: string;
  ph: number;
  type: 'Asit' | 'Nötr' | 'Baz';
  liquidColor: string;
  redLitmus: string;
  blueLitmus: string;
  phenolphthalein: string;
  methylOrange: string;
  note: string;
}

export interface GeneticTrait {
  id: string;
  name: string;
  dominantSymbol: string;
  recessiveSymbol: string;
  dominantLabel: string;
  recessiveLabel: string;
  dominantColor: string;
  recessiveColor: string;
  description: string;
}

export interface ScienceStoryOrScientist {
  id: string;
  name: string;
  era: string;
  field: 'Fizik' | 'Kimya' | 'Biyoloji' | 'Astronomi & Mühendislik';
  summary: string;
  story: string;
  lgsConnection: string;
  quote: string;
}

export interface SafeHomeExperiment {
  id: string;
  title: string;
  gradeLevel: '5. Sınıf' | '6. Sınıf' | '7. Sınıf' | '8. Sınıf';
  topic: string;
  duration: string;
  materials: string[];
  steps: string[];
  scienceBehind: string;
  safetyNote: string;
}

export const PERIODIC_ELEMENTS: PeriodicElement[] = [
  {
    atomicNumber: 1,
    symbol: 'H',
    name: 'Hidrojen',
    massNumber: 1,
    period: 1,
    group: '1A',
    column: 1,
    category: 'Ametal',
    stateAtRoom: 'Gaz',
    shells: [1],
    summary: '1A grubunda yer almasına rağmen metal değil, AMETAL olan tek istisna elementtir (LGS favori sorusu!).',
    everydayUses: ['Su (H₂O) molekülünün yapı taşı', 'Güneş ve yıldızların enerji yakıtı', 'Temiz hidrojen yakıt hücreleri'],
    funFact: 'Evrendeki en hafif ve en bol bulunan elementtir.',
  },
  {
    atomicNumber: 2,
    symbol: 'He',
    name: 'Helyum',
    massNumber: 4,
    period: 1,
    group: '8A',
    column: 8,
    category: 'Soygaz',
    stateAtRoom: 'Gaz',
    shells: [2],
    summary: 'Son katmanında 2 elektron bulundurmasına rağmen kararlı (dublet) olduğu için 8A grubunda yer alan soygazdır.',
    everydayUses: ['Uçan balonlar ve meteoroloji balonları', 'MR (Emar) cihazlarının soğutulması'],
    funFact: 'Dünya’da bulunmadan önce Güneş ışığının tayfında keşfedilmiştir.',
  },
  {
    atomicNumber: 3,
    symbol: 'Li',
    name: 'Lityum',
    massNumber: 7,
    period: 2,
    group: '1A',
    column: 1,
    category: 'Metal',
    stateAtRoom: 'Katı',
    shells: [2, 1],
    summary: 'Periyodik tablonun en hafif alkali metalidir; bıçakla kesilebilecek kadar yumuşaktır.',
    everydayUses: ['Telefon ve elektrikli araç pilleri (Lityum-İyon)', 'Seramik ve cam sanayii'],
    funFact: 'Suyun üzerinde yüzebilecek kadar düşük yoğunluğa sahip metallerdendir.',
  },
  {
    atomicNumber: 4,
    symbol: 'Be',
    name: 'Berilyum',
    massNumber: 9,
    period: 2,
    group: '2A',
    column: 2,
    category: 'Metal',
    stateAtRoom: 'Katı',
    shells: [2, 2],
    summary: 'Hafif ama son derece sağlam bir toprak alkali metalidir.',
    everydayUses: ['Uzay teleskobu aynaları (James Webb)', 'Uçak ve uydu alaşımları'],
    funFact: 'Zümrüt değerli taşının yapısında berilyum bulunur.',
  },
  {
    atomicNumber: 5,
    symbol: 'B',
    name: 'Bor',
    massNumber: 11,
    period: 2,
    group: '3A',
    column: 3,
    category: 'Yarı Metal',
    stateAtRoom: 'Katı',
    shells: [2, 3],
    summary: 'Hem metal hem ametal özellikleri taşıyan, Türkiye’nin dünya rezervlerinin %70’inden fazlasına sahip olduğu yarı metaldir.',
    everydayUses: ['Isıya dayanıklı borosilikat cam (borcam)', 'Deterjan ve tarım gübreleri', 'Roket yakıtı katkıları'],
    funFact: 'Türkiye, dünya bor rezervlerinde açık ara birinci sıradadır.',
  },
  {
    atomicNumber: 6,
    symbol: 'C',
    name: 'Karbon',
    massNumber: 12,
    period: 2,
    group: '4A',
    column: 4,
    category: 'Ametal',
    stateAtRoom: 'Katı',
    shells: [2, 4],
    summary: 'Canlılığın ve organik kimyanın temel yapı taşıdır; bağlanma şekline göre elmasa ya da kurşun kalem ucuna dönüşür.',
    everydayUses: ['Tüm canlı dokuları ve DNA’nın iskeleti', 'Kurşun kalem ucu (grafit) ve elmas', 'Karbon fiber bisiklet/uçak gövdesi'],
    funFact: 'Yumuşacık kalem ucu (grafit) ile dünyanın en sert doğal maddesi (elmas) tamamen karbon atomlarından oluşur!',
  },
  {
    atomicNumber: 7,
    symbol: 'N',
    name: 'Azot (Nitrojen)',
    massNumber: 14,
    period: 2,
    group: '5A',
    column: 5,
    category: 'Ametal',
    stateAtRoom: 'Gaz',
    shells: [2, 5],
    summary: 'Soluduğumuz atmosferin yaklaşık %78’ini oluşturan renksiz, kokusuz ametal gazdır.',
    everydayUses: ['Protein ve DNA üretimi', 'Gıda paketlerinin taze tutulması', 'Sıvı azot ile dondurma işlemleri'],
    funFact: 'Cips paketlerinin şişkin olmasını sağlayan gaz hava değil, bozulmayı önleyen azot gazıdır.',
  },
  {
    atomicNumber: 8,
    symbol: 'O',
    name: 'Oksijen',
    massNumber: 16,
    period: 2,
    group: '6A',
    column: 6,
    category: 'Ametal',
    stateAtRoom: 'Gaz',
    shells: [2, 6],
    summary: 'Atmosferin %21’ini oluşturan, solunum ve yanma olaylarının gerçekleşmesini sağlayan yakıcı gazdır.',
    everydayUses: ['Hücresel solunum', 'Hastanelerde solunum desteği', 'Ozon (O₃) tabakası ile UV koruması'],
    funFact: 'Yer kabuğunun kütlesinin neredeyse yarısı bileşikler hâlinde oksijenden oluşur.',
  },
  {
    atomicNumber: 9,
    symbol: 'F',
    name: 'Flor',
    massNumber: 19,
    period: 2,
    group: '7A',
    column: 7,
    category: 'Ametal',
    stateAtRoom: 'Gaz',
    shells: [2, 7],
    summary: '7A (Halojenler) grubunun en aktif ametalidir; elektron alma isteği en yüksek elementtir.',
    everydayUses: ['Diş macunlarında çürük önleyici florür bileşikleri', 'Yapışmaz tava kaplamaları (teflon)'],
    funFact: 'Tepkimeye girme isteği o kadar yüksektir ki doğada asla saf hâlde bulunmaz.',
  },
  {
    atomicNumber: 10,
    symbol: 'Ne',
    name: 'Neon',
    massNumber: 20,
    period: 2,
    group: '8A',
    column: 8,
    category: 'Soygaz',
    stateAtRoom: 'Gaz',
    shells: [2, 8],
    summary: 'Son katmanı 8 elektronla dolu (oktet) olan, kimyasal tepkimeye girmeyen kararlı soygazdır.',
    everydayUses: ['Parlak turuncu-kırmızı reklam tabelaları', 'Yüksek gerilim uyarı lambaları'],
    funFact: 'Elektrik akımı geçirildiğinde kendiliğinden parlak kırmızımsı turuncu ışık yayar.',
  },
  {
    atomicNumber: 11,
    symbol: 'Na',
    name: 'Sodyum',
    massNumber: 23,
    period: 3,
    group: '1A',
    column: 1,
    category: 'Metal',
    stateAtRoom: 'Katı',
    shells: [2, 8, 1],
    summary: 'Suyla çok şiddetli tepkime veren yumuşak alkali metaldir; klor ile birleşince sofra tuzunu oluşturur.',
    everydayUses: ['Sofra tuzu (NaCl)', 'Sokak aydınlatma lambaları', 'Sinir hücrelerinde impuls iletimi'],
    funFact: 'Zehirli klor gazı ve suyla patlayan sodyum birleşince her gün yediğimiz sofra tuzu (NaCl) oluşur!',
  },
  {
    atomicNumber: 12,
    symbol: 'Mg',
    name: 'Magnezyum',
    massNumber: 24,
    period: 3,
    group: '2A',
    column: 2,
    category: 'Metal',
    stateAtRoom: 'Katı',
    shells: [2, 8, 2],
    summary: 'Bitkilerde fotosentezi sağlayan klorofil molekülünün tam merkezinde yer alan hafif metaldir.',
    everydayUses: ['Klorofil yapısı', 'Hafif uçak ve fotoğraf makinesi gövdeleri', 'İşaret fişekleri'],
    funFact: 'Yandığında göz kamaştırıcı parlak beyaz bir alev çıkarır.',
  },
  {
    atomicNumber: 13,
    symbol: 'Al',
    name: 'Alüminyum',
    massNumber: 27,
    period: 3,
    group: '3A',
    column: 3,
    category: 'Metal',
    stateAtRoom: 'Katı',
    shells: [2, 8, 3],
    summary: 'Yer kabuğunda en bol bulunan metaldir; hafif, paslanmaya dirençli ve elektrik iletkenidir.',
    everydayUses: ['Uçak gövdeleri ve pencere doğramaları', 'Mutfak folyoları ve içecek kutuları', 'Elektrik iletim hatları'],
    funFact: 'Geri dönüştürülmesi, sıfırdan üretilmesine göre %95 oranında enerji tasarrufu sağlar.',
  },
  {
    atomicNumber: 14,
    symbol: 'Si',
    name: 'Silisyum',
    massNumber: 28,
    period: 3,
    group: '4A',
    column: 4,
    category: 'Yarı Metal',
    stateAtRoom: 'Katı',
    shells: [2, 8, 4],
    summary: 'Modern bilgisayar işlemcilerinin, güneş panellerinin ve camın temelini oluşturan yarı metaldir.',
    everydayUses: ['Bilgisayar ve telefon mikroçipleri', 'Güneş enerjisi panelleri', 'Cam ve kum (SiO₂)'],
    funFact: 'ABD’deki teknoloji merkezi “Silikon Vadisi” adını bu elementten alır.',
  },
  {
    atomicNumber: 15,
    symbol: 'P',
    name: 'Fosfor',
    massNumber: 31,
    period: 3,
    group: '5A',
    column: 5,
    category: 'Ametal',
    stateAtRoom: 'Katı',
    shells: [2, 8, 5],
    summary: 'DNA’daki fosfat grubunun, kemiklerin ve dişlerin temel ametal bileşenidir.',
    everydayUses: ['Kibrit kutusu yan şeritleri', 'Kemik, diş ve DNA yapısı', 'Tarım gübreleri'],
    funFact: 'Adı Yunanca “ışık taşıyan” anlamına gelir.',
  },
  {
    atomicNumber: 16,
    symbol: 'S',
    name: 'Kükürt',
    massNumber: 32,
    period: 3,
    group: '6A',
    column: 6,
    category: 'Ametal',
    stateAtRoom: 'Katı',
    shells: [2, 8, 6],
    summary: 'Parlak sarı renkli, kırılgan, elektrik ve ısıyı iletmeyen tipik bir katı ametaldir.',
    everydayUses: ['Kayısı kurutma ve tarımda koruyucu', 'Araç lastiği kauçuk işleme', 'Sülfürik asit (H₂SO₄) üretimi'],
    funFact: 'Yanardağ ağızlarında doğal parlak sarı kristaller hâlinde birikir.',
  },
  {
    atomicNumber: 17,
    symbol: 'Cl',
    name: 'Klor',
    massNumber: 35,
    period: 3,
    group: '7A',
    column: 7,
    category: 'Ametal',
    stateAtRoom: 'Gaz',
    shells: [2, 8, 7],
    summary: 'Sarımsı yeşil renkli keskin kokulu halojen ametaldir; mikropları yok etme özelliğine sahiptir.',
    everydayUses: ['İçme sularının ve yüzme havuzlarının dezenfeksiyonu', 'Sofra tuzu (NaCl) ve PVC borular'],
    funFact: 'Son katmanına yalnızca 1 elektron alarak soy gaz kararlılığına ulaşmak ister.',
  },
  {
    atomicNumber: 18,
    symbol: 'Ar',
    name: 'Argon',
    massNumber: 40,
    period: 3,
    group: '8A',
    column: 8,
    category: 'Soygaz',
    stateAtRoom: 'Gaz',
    shells: [2, 8, 8],
    summary: 'Atmosferde azot ve oksijenden sonra en çok bulunan üçüncü gaz (%0,93) ve kararlı bir soygazdır.',
    everydayUses: ['Klasik ampullerin iç dolgu gazı', 'Isı yalıtımlı çift cam pencereler', 'Metal kaynak koruma gazı'],
    funFact: 'Adı Yunanca “tembel/etkisiz” anlamına gelen “argos” sözcüğünden gelir.',
  },
  {
    atomicNumber: 19,
    symbol: 'K',
    name: 'Potasyum',
    massNumber: 39,
    period: 4,
    group: '1A',
    column: 1,
    category: 'Metal',
    stateAtRoom: 'Katı',
    shells: [2, 8, 8, 1],
    summary: 'Canlılarda kas kasılması ve sinir iletimi için hayati öneme sahip 4. periyot alkali metalidir.',
    everydayUses: ['Muz, patates ve ıspanak gibi besinlerde mineral', 'Bitki gelişimi için gübreler'],
    funFact: 'Sembolü “K”, Latince “Kalium” adından gelir.',
  },
  {
    atomicNumber: 20,
    symbol: 'Ca',
    name: 'Kalsiyum',
    massNumber: 40,
    period: 4,
    group: '2A',
    column: 2,
    category: 'Metal',
    stateAtRoom: 'Katı',
    shells: [2, 8, 8, 2],
    summary: 'Kemik ve dişlerin sertliğini sağlayan, kireçtaşı ve mermerin temel bileşeni olan toprak alkali metalidir.',
    everydayUses: ['Kemik, diş ve süt ürünleri', 'Alçı, çimento ve mermer', 'Tebeşir (kalsiyum karbonat)'],
    funFact: 'İnsan vücudunda en yüksek miktarda bulunan metal elementtir.',
  },
];

export const PH_SUBSTANCES: PhSubstance[] = [
  {
    id: 'hcl',
    name: 'Mide Asidi (HCl)',
    formula: 'HCl',
    ph: 1.5,
    type: 'Asit',
    liquidColor: '#EF4444',
    redLitmus: 'Kırmızı kalır',
    blueLitmus: 'Kırmızıya döner',
    phenolphthalein: 'Renksiz kalır',
    methylOrange: 'Kırmızıya döner',
    note: 'Çok kuvvetli bir asittir; midede besinlerin kimyasal sindirimini başlatır ve mikropları öldürür.',
  },
  {
    id: 'lemon',
    name: 'Limon Suyu (Sitrik Asit)',
    formula: 'C₆H₈O₇',
    ph: 2.2,
    type: 'Asit',
    liquidColor: '#F97316',
    redLitmus: 'Kırmızı kalır',
    blueLitmus: 'Kırmızıya döner',
    phenolphthalein: 'Renksiz kalır',
    methylOrange: 'Kırmızıya döner',
    note: 'Ekşi tada sahiptir; mermer yüzeylere döküldüğünde mermeri aşındırır!',
  },
  {
    id: 'vinegar',
    name: 'Sirke (Asetik Asit)',
    formula: 'CH₃COOH',
    ph: 3.0,
    type: 'Asit',
    liquidColor: '#FB923C',
    redLitmus: 'Kırmızı kalır',
    blueLitmus: 'Kırmızıya döner',
    phenolphthalein: 'Renksiz kalır',
    methylOrange: 'Kırmızıya döner',
    note: 'Çaydanlık kirecini çözmek ve karbonatla CO₂ gazı çıkarmak için günlük hayatta kullanılır.',
  },
  {
    id: 'tomato',
    name: 'Domates Suyu',
    ph: 4.2,
    type: 'Asit',
    liquidColor: '#F59E0B',
    redLitmus: 'Kırmızı kalır',
    blueLitmus: 'Kırmızıya döner',
    phenolphthalein: 'Renksiz kalır',
    methylOrange: 'Kırmızımsı turuncu',
    note: 'Zayıf bir besin asididir; sulu çözeltisinde H⁺ iyonu bulunur.',
  },
  {
    id: 'water',
    name: 'Saf Su',
    formula: 'H₂O',
    ph: 7.0,
    type: 'Nötr',
    liquidColor: '#10B981',
    redLitmus: 'Renk değişmez',
    blueLitmus: 'Renk değişmez',
    phenolphthalein: 'Renksiz kalır',
    methylOrange: 'Turuncu kalır',
    note: 'Ne asit ne bazdır (pH = 7). Asit ve baz tepkimesinin temel ürünlerinden biridir.',
  },
  {
    id: 'baking-soda',
    name: 'Karbonatlı Su',
    formula: 'NaHCO₃',
    ph: 8.5,
    type: 'Baz',
    liquidColor: '#14B8A6',
    redLitmus: 'Maviye döner',
    blueLitmus: 'Mavi kalır',
    phenolphthalein: 'Açık pembe',
    methylOrange: 'Sarıya döner',
    note: 'Zayıf bazdır; mide ekşimesini hafifletmek ve kek kabartmak için kullanılır.',
  },
  {
    id: 'soap',
    name: 'Sabunlu Su',
    ph: 10.2,
    type: 'Baz',
    liquidColor: '#0284C7',
    redLitmus: 'Maviye döner',
    blueLitmus: 'Mavi kalır',
    phenolphthalein: 'Pembe / morumsu',
    methylOrange: 'Sarıya döner',
    note: 'Ele kayganlık hissi verir ve tadı acıdır; temizlik ürünlerinin çoğu bazik özelliktedir.',
  },
  {
    id: 'bleach',
    name: 'Çamaşır Suyu / Amonyak',
    formula: 'NaClO / NaOH',
    ph: 12.5,
    type: 'Baz',
    liquidColor: '#4F46E5',
    redLitmus: 'Maviye döner',
    blueLitmus: 'Mavi kalır',
    phenolphthalein: 'Koyu pembe',
    methylOrange: 'Sarıya döner',
    note: 'Kuvvetli bazdır; cam ve porselenleri matlaştırır. Asla tuz ruhu (HCl) ile karıştırılmamalıdır!',
  },
];

export const GENETIC_TRAITS: GeneticTrait[] = [
  {
    id: 'pea-color',
    name: 'Bezelye Tohum Rengi',
    dominantSymbol: 'S',
    recessiveSymbol: 's',
    dominantLabel: 'Sarı Tohum (Baskın)',
    recessiveLabel: 'Yeşil Tohum (Çekinik)',
    dominantColor: '#EAB308',
    recessiveColor: '#16A34A',
    description: 'Gregor Mendel’in kalıtım yasalarını keşfederken kullandığı en klasik çaprazlama özelliğidir.',
  },
  {
    id: 'pea-height',
    name: 'Bezelye Gövde Uzunluğu',
    dominantSymbol: 'U',
    recessiveSymbol: 'u',
    dominantLabel: 'Uzun Boylu (Baskın)',
    recessiveLabel: 'Kısa Boylu (Çekinik)',
    dominantColor: '#0D9488',
    recessiveColor: '#64748B',
    description: 'Uzun boy aleli (U), kısa boy aleline (u) tam baskındır. Kısa boy yalnızca "uu" durumunda görülür.',
  },
  {
    id: 'eye-color',
    name: 'Göz Rengi (Basit Mendel Modeli)',
    dominantSymbol: 'K',
    recessiveSymbol: 'k',
    dominantLabel: 'Kahverengi Göz (Baskın)',
    recessiveLabel: 'Mavi Göz (Çekinik)',
    dominantColor: '#92400E',
    recessiveColor: '#0284C7',
    description: 'Melez (Kk) iki kahverengi gözlü anne-babanın %25 ihtimalle mavi gözlü (kk) çocuğu olabilir.',
  },
  {
    id: 'seed-shape',
    name: 'Bezelye Tohum Şekli',
    dominantSymbol: 'D',
    recessiveSymbol: 'd',
    dominantLabel: 'Düzgün Tohum (Baskın)',
    recessiveLabel: 'Buruşuk Tohum (Çekinik)',
    dominantColor: '#0F766E',
    recessiveColor: '#B45309',
    description: 'Düzgün tohum (DD veya Dd), buruşuk tohuma (dd) baskındır.',
  },
];

export const SCIENCE_STORIES_AND_SCIENTISTS: ScienceStoryOrScientist[] = [
  {
    id: 'aziz-sancar',
    name: 'Prof. Dr. Aziz Sancar',
    era: '1946 – Günümüz · Mardin / Nobel Kimya (2015)',
    field: 'Biyoloji',
    summary: 'Hücrelerin hasar gören DNA’yı nasıl onardığını moleküler düzeyde haritalandırarak 2015 Nobel Kimya Ödülü’nü kazandı.',
    story:
      'Mardin’in Savur ilçesinde büyüyen Aziz Sancar, güneş ışığındaki morötesi (UV) ışınların DNA’ya verdiği zararı hücrelerin “nükleotid eksizyon onarımı” mekanizmasıyla nasıl tamir ettiğini ortaya çıkardı. Nobel madalyasını Anıtkabir’e armağan ederek gençlere “Çoğu insan zekâya inanır, ben inanmıyorum; bizi birbirimizden ayıran emektir, ben çalışmaya inanıyorum” mesajını verdi.',
    lgsConnection: '8. Sınıf DNA, Genetik Kod, Mutasyon ve DNA Onarımı',
    quote: 'Bizi birbirimizden ayıran şey zekâ değil, düzenli ve azimli çalışmaktır.',
  },
  {
    id: 'ibnul-heysem',
    name: 'İbnü’l-Heysem (Alhazen)',
    era: '965 – 1040 · Basra / Kahire',
    field: 'Fizik',
    summary: 'Modern optiğin ve deneysel bilimsel yöntemin kurucusu; karanlık oda (camera obscura) düzeneğinin öncüsü.',
    story:
      'Yüzyıllarca insanların gözünden ışın çıkarak cisimleri gördüğü sanılıyordu. İbnü’l-Heysem karanlık bir odada açtığı küçük delikten geçen ışığın karşı duvara ters görüntü düşürdüğünü deneyle kanıtlayarak ışığın cisimlerden yansıyıp gözümüze geldiğini ispatladı. Bu deney modern fotoğraf makinelerinin ve mercek optiğinin temelini attı.',
    lgsConnection: '5. ve 7. Sınıf Işığın Yayılması, Yansıma, Mercekler ve Göz',
    quote: 'Gerçeği arayan kişi, okuduklarını sorgulamalı ve deneyle sınamalıdır.',
  },
  {
    id: 'el-cezeri',
    name: 'İsmail el-Cezerî',
    era: '1136 – 1206 · Cizre (Artuklu Dönemi)',
    field: 'Astronomi & Mühendislik',
    summary: 'Su gücü, dişli çarklar ve krank miliyle kendi kendine çalışan makineler tasarlayan sibernetik ve robotik öncüsü.',
    story:
      'Cizre’de yaşayan El-Cezerî, “El-Câmi Beyne’l-İlm ve’l-Amel” kitabında 50’den fazla otomatik makine çizdi: Filli Su Saati, abdest almak için su döken robot, şifreli kilitler ve suyu yükseğe çıkaran krank-biyel pompaları… Bugün otomobil motorlarındaki krank mili prensibini 800 yıl önce çizimlerle göstermiştir.',
    lgsConnection: '8. Sınıf Basit Makineler (Dişli Çarklar, Kaldıraçlar, Kasnaklar)',
    quote: 'Uygulamaya dönüşmeyen her teknik bilgi doğru ile yanlış arasında asılı kalır.',
  },
  {
    id: 'marie-curie',
    name: 'Marie Curie',
    era: '1867 – 1934 · Polonya / Fransa',
    field: 'Kimya',
    summary: 'Hem Fizik hem Kimya alanında iki farklı Nobel Ödülü kazanan tarihteki ilk bilim insanı.',
    story:
      'Polonyum ve Radyum elementlerini keşfeden Marie Curie, radyoaktivite kavramını bilim dünyasına kazandırdı. I. Dünya Savaşı’nda cepheye taşınabilir röntgen cihazları (“Küçük Curieler”) kurarak binlerce yaralının hayatını kurtardı.',
    lgsConnection: '7. ve 8. Sınıf Atomun Yapısı, Elementler ve Periyodik Sistem',
    quote: 'Hayatta hiçbir şeyden korkulmamalı, yalnızca her şey anlaşılmaya çalışılmalıdır.',
  },
  {
    id: 'gregor-mendel',
    name: 'Gregor Mendel',
    era: '1822 – 1884 · Çekya',
    field: 'Biyoloji',
    summary: '28.000’den fazla bezelye bitkisini sabırla çaprazlayarak modern genetik biliminin yasalarını keşfetti.',
    story:
      'Mendel, bezelyelerin kısa sürede döl vermesi, kolay yetiştirilmesi ve çok sayıda belirgin özelliğe (sarı/yeşil tohum, uzun/kısa boy) sahip olması nedeniyle onları seçti. Matematiksel olasılık hesaplarını biyolojiye uygulayarak baskın ve çekinik gen kavramlarını ortaya koydu.',
    lgsConnection: '8. Sınıf Kalıtım, Baskın-Çekinik Alel ve Çaprazlama',
    quote: 'Sabırla toplanmış veriler doğanın gizli matematiğini ortaya çıkarır.',
  },
  {
    id: 'isaac-newton',
    name: 'Isaac Newton',
    era: '1643 – 1727 · İngiltere',
    field: 'Fizik',
    summary: 'Kütle çekimi, hareket yasaları ve beyaz ışığın prizmada renklere ayrılmasını keşfeden fizik dehası.',
    story:
      'Newton yalnızca düşen elma hikâyesiyle değil, güneş ışığını cam bir prizmadan geçirerek beyaz ışığın aslında gökkuşağının tüm renklerinden (kırmızıdan mora) oluştuğunu kanıtlamasıyla da çığır açtı. Kuvvetin birimi bugün onun onuruna “Newton (N)” olarak adlandırılır.',
    lgsConnection: '6. ve 7. Sınıf Kuvvet, Kütle-Ağırlık İlişkisi ve Işığın Kırılması',
    quote: 'Daha uzağı görebildiysem, bu benden önceki devlerin omuzlarında durduğum içindir.',
  },
  {
    id: 'nikola-tesla',
    name: 'Nikola Tesla',
    era: '1856 – 1943 · Sırbistan / ABD',
    field: 'Fizik',
    summary: 'Evlerimize kilometrelerce uzaktan elektrik ulaşmasını sağlayan alternatif akım (AC) sisteminin mucidi.',
    story:
      'Alternatif akım motoru, transformatör ve kablosuz enerji deneyleriyle modern elektrik çağını başlatan Tesla, Niagara Şelalesi’ndeki ilk büyük hidroelektrik santralin tasarımına öncülük etti.',
    lgsConnection: '8. Sınıf Elektrik Yükleri, Elektrik Enerjisinin Dönüşümü ve Güç Santralleri',
    quote: 'Gelecek gerçeği gösterecek ve herkesi emeğinin, buluşlarının değerine göre yargılayacaktır.',
  },
  {
    id: 'louis-pasteur',
    name: 'Louis Pasteur',
    era: '1822 – 1895 · Fransa',
    field: 'Biyoloji',
    summary: 'Mikropların hastalıklara yol açtığını kanıtlayan, kuduz aşısını ve pastörizasyon yöntemini geliştiren bilim insanı.',
    story:
      'Sütün bozulmasını engellemek için ısıtıp hızla soğutma (pastörizasyon) yöntemini geliştiren Pasteur, kuğu boyunlu cam balon deneyiyle mikroorganizmaların kendiliğinden değil havadaki mikroplardan ürediğini ispatladı.',
    lgsConnection: '5. Sınıf Mikroskobik Canlılar ve 8. Sınıf Biyoteknoloji',
    quote: 'Şans, yalnızca hazırlanmış zihinlere yardım eder.',
  },
];

export const SAFE_HOME_EXPERIMENTS: SafeHomeExperiment[] = [
  {
    id: 'exp-cabbage',
    title: 'Mor Lahana ile Doğal pH İndikatörü',
    gradeLevel: '8. Sınıf',
    topic: 'Asitler ve Bazlar',
    duration: '15 dk',
    materials: ['3–4 yaprak mor lahana', 'Sıcak su', 'Şeffaf bardaklar', 'Limon suyu, sirke, karbonat, sabunlu su'],
    steps: [
      'Doğranmış mor lahana yapraklarını sıcak suda 10 dakika bekletip mor renkli suyunu süzün.',
      'Şeffaf bardaklara eşit miktarda mor lahana suyu koyun.',
      'Birinci bardağa limon suyu, ikinciye sirke, üçüncüye karbonat, dördüncüye sabunlu su ekleyin.',
      'Asitlerde pembe-kırmızıya, bazlarda mavi-yeşile dönen renk cümbüşünü gözlemleyin.',
    ],
    scienceBehind:
      'Mor lahanadaki “antosiyanin” pigmenti doğal bir belirteçtir (indikatör). Ortamdaki H⁺ ve OH⁻ iyon derişimine göre molekül yapısı değişir ve farklı renkler yansıtır.',
    safetyNote: 'Sıcak su kullanırken yetişkin desteği alın; çamaşır suyu gibi yakıcı kimyasalları kullanmayın.',
  },
  {
    id: 'exp-egg-pressure',
    title: 'Açık Hava Basıncı ve Ters Çevrilen Su Bardağı',
    gradeLevel: '8. Sınıf',
    topic: 'Gaz Basıncı (Torricelli İlkesi)',
    duration: '5 dk',
    materials: ['Ağzı düz bir su bardağı', 'Su', 'Bardak ağzından büyük sert bir karton/kâğıt'],
    steps: [
      'Bardağı ağzına kadar suyla doldurun (içinde hava kabarcığı kalmamasına dikkat edin).',
      'Kartonu bardağın ağzına tam kapatın ve elinizle bastırarak lavabo üzerinde bardağı hızla ters çevirin.',
      'Alttaki elinizi yavaşça çekin — karton düşmez ve su dökülmez!',
    ],
    scienceBehind:
      'Dışarıdan yukarı doğru etki eden açık hava basıncı (P₀), bardaktaki suyun aşağı yönlü sıvı basıncından çok daha büyük olduğu için kartonu dengede tutar.',
    safetyNote: 'Deneyi mutlaka lavabo veya geniş bir tepsi üzerinde yapın.',
  },
  {
    id: 'exp-balloon-static',
    title: 'Sürtünme ile Elektriklenme ve Su Akışını Bükme',
    gradeLevel: '8. Sınıf',
    topic: 'Elektrik Yükleri ve Elektriklenme',
    duration: '5 dk',
    materials: ['Şişirilmiş balon', 'Yün kazak veya kuru saç', 'İnce akan musluk suyu'],
    steps: [
      'Balonu yün kazağa yaklaşık 15–20 saniye sürterek negatif (-) yükle yüklenmesini sağlayın.',
      'Musluğu ince bir iplik gibi akacak şekilde açın.',
      'Balonu suya değdirmeden 1–2 cm yaklaştırın; suyun balona doğru büküldüğünü görün!',
    ],
    scienceBehind:
      'Yün kumaştan balona geçen elektronlar balonu (-) yüklü yapar. Nötr su moleküllerindeki (+) kutuplar balona doğru çekildiği için su akışı bükülür (etki ile elektriklenme).',
    safetyNote: 'Deney sonrası musluğu kapatarak su israfını önleyin.',
  },
  {
    id: 'exp-density-tower',
    title: 'Renkli Yoğunluk Kulesi',
    gradeLevel: '6. Sınıf',
    topic: 'Madde ve Yoğunluk (d = m/V)',
    duration: '10 dk',
    materials: ['Uzun şeffaf bardak', 'Bal veya pekmez', 'Bulaşık deterjanı', 'Su (gıda boyalı)', 'Sıvı yağ'],
    steps: [
      'Bardağın dibine önce en yoğun sıvı olan balı/pekmezi yavaşça dökün.',
      'Bardağı eğerek kenarından sırasıyla bulaşık deterjanı, renkli su ve en üste sıvı yağ ekleyin.',
      'Sıvıların birbirine karışmadan katman katman sıralandığını gözlemleyin.',
    ],
    scienceBehind:
      'Birbiri içinde çözünmeyen sıvılar yoğunluklarına (d = m/V) göre dizilir: Yoğunluğu en büyük olan bal altta, yoğunluğu en küçük olan yağ en üstte kalır.',
    safetyNote: 'Karışımı içmeyin; gözlem sonrası lavaboya döküp bardağı yıkayın.',
  },
  {
    id: 'exp-refraction-arrow',
    title: 'Su Dolu Bardak Arkasında Ters Dönen Ok',
    gradeLevel: '7. Sınıf',
    topic: 'Işığın Kırılması ve İnce Kenarlı Mercek',
    duration: '5 dk',
    materials: ['Küçük bir kâğıt ve kalem', 'Silindirik şeffaf cam bardak', 'Su'],
    steps: [
      'Kâğıda yatay yönde (örneğin sağa bakan) kalın bir ok çizin ve dik olarak masaya yaslayın.',
      'Boş bardağı kâğıdın 10–15 cm önüne koyun — ok hâlâ sağa bakıyordur.',
      'Bardağı suyla doldurun ve suyun içinden oka bakın: Ok tersine (sola) dönmüş görünecektir!',
    ],
    scienceBehind:
      'Su dolu silindirik bardak bir ince kenarlı (yakınsak) mercek gibi davranır. Işık ışınları hava → cam → su → cam → hava geçişlerinde kırılıp odak noktasında kesiştiği için görüntü ters oluşur.',
    safetyNote: 'Cam bardağı düşürmemeye dikkat edin.',
  },
  {
    id: 'exp-baking-volcano',
    title: 'Karbonat ve Sirke ile Kimyasal Tepkime & Gaz Çıkışı',
    gradeLevel: '8. Sınıf',
    topic: 'Kimyasal Tepkimeler ve Kütlenin Korunumu',
    duration: '10 dk',
    materials: ['Küçük pet şişe', '1 balon', '2 tatlı kaşığı karbonat', 'Yarım çay bardağı sirke'],
    steps: [
      'Şişenin içine yarım çay bardağı sirke koyun.',
      'Sönük balonun içine huni yardımıyla 2 tatlı kaşığı karbonat doldurun.',
      'Balonun ağzını şişeye geçirin, sonra balonu dik kaldırarak karbonatın sirkeye dökülmesini sağlayın.',
      'Şişede köpürme başlarken balonun kendi kendine şiştiğini izleyin!',
    ],
    scienceBehind:
      'Asit (sirke) ile bazik tuz (karbonat) kimyasal tepkimeye girerek karbondioksit (CO₂) gazı açığa çıkarır. Kapalı sistem olduğu için toplam kütle değişmez ama oluşan gaz balonu şişirir.',
    safetyNote: 'Balonu şişeye sıkı geçirin; karışımı gözünüze sıçratmayın.',
  },
];
