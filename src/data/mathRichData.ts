export interface MathStoryItem {
  id: string;
  title: string;
  era: string;
  tag: string;
  summary: string;
  story: string;
  mathTakeaway: string;
  formulaLatex?: string;
}

export interface MathematicianProfile {
  id: string;
  name: string;
  lifespan: string;
  origin: string;
  specialty: string;
  bio: string;
  keyDiscoveries: string[];
  middleSchoolLink: string;
  quote: string;
}

export interface ScienceMilestone {
  id: string;
  year: string;
  title: string;
  inventorOrCulture: string;
  description: string;
  impact: string;
}

export interface LogicPuzzleItem {
  id: string;
  title: string;
  category: 'Mantık' | 'Sayı Bilmecesi' | 'Geometri Zekâsı' | 'Olasılık & Strateji';
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  question: string;
  hints: [string, string];
  answer: string;
  explanation: string;
}

export const MATH_STORIES_ANECDOTES: MathStoryItem[] = [
  {
    id: 'gauss-100',
    title: 'Küçük Gauss ve 1’den 100’e Saniyelik Toplam',
    era: '1785 · Almanya',
    tag: 'İlginç Anekdot',
    summary: 'Henüz 8 yaşındayken öğretmenini hayrete düşüren eşleştirme zekâsı.',
    story:
      'Rivayete göre ilkokul öğretmeni sınıfı bir süre meşgul etmek için öğrencilerinden 1’den 100’e kadar tüm doğal sayıları toplamalarını istedi. Herkes taş tabletine tek tek 1+2+3... diye yazmaya koyulurken küçük Carl Friedrich Gauss saniyeler içinde cevabı önüne koydu: 5050! Gauss, sayıları sırayla toplamak yerine baştan ve sondan eşleştirmişti: 1+100=101, 2+99=101, 3+98=101... Toplam 50 çift olduğuna göre 50 × 101 = 5050 ediyordu.',
    mathTakeaway: 'Bir problemi uzun yoldan çözmeden önce örüntüyü görmek zamanı ve emeği mucizevi biçimde kısaltır.',
    formulaLatex: '1 + 2 + \\dots + n = \\frac{n(n+1)}{2}',
  },
  {
    id: 'chess-wheat',
    title: 'Satranç Tahtası ve Üslü Büyümenin Gücü',
    era: 'Antik Hindistan Efsanesi',
    tag: 'Matematik Hikâyesi',
    summary: 'Her karede iki katına çıkan buğday taneleri nasıl bütün krallığın ambarını aşar?',
    story:
      'Efsaneye göre satranç oyununu bulan bilge Sissa, ödül olarak hükümdardan mütevazı görünen bir dilekte bulunur: Satranç tahtasının 1. karesine 1 buğday tanesi, 2. karesine 2, 3. karesine 4 ve her sonraki kareye bir öncekinin iki katı buğday konulması. Hükümdar bunu çok küçük bir istek sanır; ancak 64. kareye gelindiğinde toplam buğday sayısı 2⁶⁴ - 1 ≈ 18,4 kentilyon taneye ulaşır — bu, günümüzdeki bütün dünya buğday üretiminin yüzlerce yıllık toplamından bile fazladır!',
    mathTakeaway: '8. sınıf Üslü İfadeler konusunda gördüğümüz 2ⁿ büyümesi (üstel artış), başta yavaş görünse de kısa sürede devasa boyutlara ulaşır.',
    formulaLatex: '1 + 2 + 2^2 + \\dots + 2^{63} = 2^{64} - 1',
  },
  {
    id: 'archimedes-eureka',
    title: 'Arşimet’in “Evreka!” Çığlığı ve Altın Taç',
    era: 'MÖ 3. Yüzyıl · Siraküza',
    tag: 'Bilim & Matematik Hikâyesi',
    summary: 'Hacim ve yoğunluk hesabıyla kralın tacına gümüş karıştırıldığını tacı eritmeden ispatlamak.',
    story:
      'Siraküza Kralı II. Hieron, kuyumcuya verdiği saf altından yapılan tacın içine gümüş karıştırıldığından şüphelenir ve Arşimet’ten taca zarar vermeden gerçeği bulmasını ister. Arşimet hamamda ağzına kadar dolu küvete girdiğinde taşan suyun kendi vücudunun hacmine eşit olduğunu fark eder. Aynı ağırlıktaki gümüş, altından daha az yoğun olduğu için daha fazla su taşıracaktır. “Evreka! (Buldum!)” diye sevinçle evine koşarak tacı suya daldırır ve hileyi matematiksel olarak kanıtlar.',
    mathTakeaway: 'Düzensiz şekilli cisimlerin hacmini ölçmek ve yoğunluk (d = m/V) oranını kullanmak fizik ile matematiğin birleşimidir.',
    formulaLatex: 'd = \\frac{m}{V}',
  },
  {
    id: 'kharizmi-algebra',
    title: 'Hârizmî: “Cebir” ve “Algoritma” Kelimelerinin Doğuşu',
    era: '9. Yüzyıl · Bağdat (Beytü’l-Hikme)',
    tag: 'Türk-İslam Bilim Tarihi',
    summary: 'Bugün bilgisayar biliminin kalbi olan “algoritma” kelimesi aslında bir bilim insanının adıdır.',
    story:
      'Harezm bölgesinde doğup Bağdat’taki Beytü’l-Hikme’de çalışan Muhammed bin Mûsâ el-Hârizmî, denklem çözmeyi sistemli bir bilim dalına dönüştürdü. “El-Kitâbü’l-Muhtasar fî Hisâbi’l-Cebr ve’l-Mukâbele” kitabındaki “el-cebr” (tamamlama/dengeleme) sözcüğü dünyaya “Algebra / Cebir” olarak geçti. Eserleri Latinceye çevrilirken adının “Algoritmi” diye okunmasıyla adım adım problem çözme yöntemine “Algoritma” adı verildi.',
    mathTakeaway: 'Ortaokulda denklem çözerken eşitliğin iki tarafına aynı işlemi uygulamamız, Hârizmî’nin “cebir ve mukabele” yönteminin mirasıdır.',
  },
  {
    id: 'cahit-arf',
    title: 'Cahit Arf: “Matematik Ezber Değil, Bir Sabır ve Sezgi İşidir”',
    era: '20. Yüzyıl · Türkiye',
    tag: 'İlham Veren Anekdot',
    summary: '10 TL banknotun arkasındaki formülün sahibi büyük Türk matematikçisinin öğrencilere mirası.',
    story:
      'Ord. Prof. Dr. Cahit Arf, zor matematik problemleriyle uğraşırken saatlerce kâğıt kalemle düşünür, öğrencilerine “Ben matematiğe hayatımı adadım, karşılığında bana hayatımı geri verdi” derdi. Bir keresinde bir öğrencisi formülleri ezberleyemediğinden yakınınca Arf gülümseyerek şöyle karşılık vermiştir: “Matematikte hiçbir şeyi ezberleme; nereden geldiğini kendin keşfet, o zaman bir ömür unutmazsın.”',
    mathTakeaway: 'Formülleri görsel ispatlarla ve mantığıyla kavramak, LGS ve tüm matematik yolculuğunda en kalıcı öğrenme yoludur.',
  },
  {
    id: 'zero-journey',
    title: 'Sıfırın (0) Mucizevî Yolculuğu',
    era: '5. – 13. Yüzyıl · Hindistan → İslam Dünyası → Avrupa',
    tag: 'Sayılar Tarihi',
    summary: '“Hiçlik” nasıl oldu da modern matematiğin ve bilgisayarların temel taşına dönüştü?',
    story:
      'Antik Roma rakamlarında (I, V, X, L, C, M) sıfır yoktu; bu yüzden büyük sayılarla çarpma ve bölme yapmak son derece zordu. Hint matematikçi Brahmagupta sıfırı bir sayı olarak tanımladı. Hârizmî’nin eserleriyle İslam dünyasında “sıfır” (boş) adıyla yaygınlaştı ve Fibonacci aracılığıyla Avrupa’ya taşındı. Bugün 0 ve 1’den oluşan ikili (binary) sistem olmasa telefonlar ve bilgisayarlar var olamazdı.',
    mathTakeaway: 'Basamak değeri kavramı ve negatif-pozitif tam sayı ekseninin merkezi sıfır üzerine kuruludur.',
  },
  {
    id: 'ali-kuscu',
    title: 'Ali Kuşçu ve Ayasofya Medresesi’nde Matematik Dersleri',
    era: '15. Yüzyıl · Semerkand ve İstanbul',
    tag: 'Osmanlı Bilim Tarihi',
    summary: 'Fatih Sultan Mehmet’in özel davetiyle İstanbul’a gelip bilim hayatını dönüştüren astronom ve matematikçi.',
    story:
      'Uluğ Bey’in Semerkand Rasathanesi’nde yetişen Ali Kuşçu, Akkoyunlu elçisi olarak İstanbul’a geldiğinde Fatih Sultan Mehmet onun bilgisinden çok etkilenir ve İstanbul’da kalmasını rica eder. Ali Kuşçu, Ayasofya Medresesi’ne başmüderris atanır, İstanbul’un enlem ve boylamını yeniden hesaplar ve orta düzey öğrencilerin bile kolayca okuyabileceği “El-Muhammediyye” adlı matematik kitabını yazar.',
    mathTakeaway: 'Astronomi, takvim ve haritacılık tamamen açılar, oranlar ve hassas matematiksel hesaplamalara dayanır.',
  },
  {
    id: 'ramanujan-1729',
    title: '1729 Taksi Sayısı: Sıradan Bir Plakada Saklı Güzellik',
    era: '1918 · Cambridge',
    tag: 'İlginç Anekdot',
    summary: 'Ünlü matematikçi Ramanujan’ın hastane odasında 1729 sayısının eşsiz özelliğini anında fark etmesi.',
    story:
      'İngiliz matematikçi G. H. Hardy, hasta yatan Hintli dâhi Srinivasa Ramanujan’ı ziyarete gittiğinde bindiği taksinin plakasının 1729 olduğunu ve bunun “oldukça sıkıcı bir sayı” gibi göründüğünü söyler. Ramanujan hemen itiraz eder: “Hayır Hardy, o çok ilginç bir sayı! İki farklı yoldan iki küpün toplamı olarak yazılabilen en küçük pozitif tam sayıdır: 1³ + 12³ = 1729 ve 9³ + 10³ = 1729!”',
    mathTakeaway: 'Sayıların küpleri ve çarpanları arasında keşfedilmeyi bekleyen şaşırtıcı ilişkiler vardır.',
    formulaLatex: '1729 = 1^3 + 12^3 = 9^3 + 10^3',
  },
  {
    id: 'fibonacci-rabbits',
    title: 'Fibonacci Tavşanları ve Doğadaki Gizli Örüntü',
    era: '1202 · Pisa (İtalya)',
    tag: 'Matematik Hikâyesi',
    summary: 'Basit bir tavşan üreme bilmecesinden ayçiçeği çekirdeklerine ve deniz kabuklarına uzanan sayı dizisi.',
    story:
      'İtalyan matematikçi Leonardo Fibonacci, 1202 yılında yazdığı “Liber Abaci” kitabında merak uyandıran bir soru sordu: Her ay yeni bir çift doğuran tavşanların sayısı bir yıl sonunda kaça ulaşır? Cevap 1, 1, 2, 3, 5, 8, 13, 21, 34... şeklinde her terimin kendisinden önceki iki terimin toplamı olduğu meşhur Fibonacci Dizisi’ni verdi. Şaşırtıcı olan şuydu: Papatya yaprakları, çam kozalağı spiralleri ve ayçiçeğinin çekirdek dizilimi hep bu sayılara uyuyordu!',
    mathTakeaway: 'Sayı örüntüleri yalnızca kâğıt üzerindeki kurallar değil; doğanın büyüme ve denge dilidir.',
    formulaLatex: 'F_n = F_{n-1} + F_{n-2} \\quad (1, 1, 2, 3, 5, 8, 13, \\dots)',
  },
  {
    id: 'eratosthenes-earth',
    title: 'Eratosthenes: İki Çubuk ve Bir Gölgeyle Dünya’yı Ölçmek',
    era: 'MÖ 240 · İskenderiye ve Syene',
    tag: 'Bilim & Geometri Hikâyesi',
    summary: 'Uzay aracı ve uydu olmadan, yalnızca 7. sınıf oran-orantı ve açı bilgisiyle Dünya’nın çevresini hesaplamak.',
    story:
      'İskenderiye Kütüphanesi’nin başındaki bilgin Eratosthenes, 21 Haziran öğle vaktinde Mısır’ın güneyindeki Syene şehrinde güneş ışınlarının derin bir kuyunun dibine dik vurduğunu öğrendi. Aynı gün ve saatte İskenderiye’de dikilen bir direğin gölgesini ölçtüğünde güneş ışınlarının dikeyden yaklaşık 7,2 derece (çemberin 1/50’si) eğik geldiğini buldu. İki şehir arası mesafeyi 50 ile çarpınca Dünya’nın çevresini yaklaşık 40.000 km olarak hesapladı — modern ölçümlere neredeyse tıpatıp yakındı!',
    mathTakeaway: 'Paralel doğrular, iç ters açılar ve doğru orantı kullanarak gözle göremediğimiz dev mesafeleri ölçebiliriz.',
    formulaLatex: '\\frac{7,2^\\circ}{360^\\circ} = \\frac{1}{50} \\Rightarrow \\text{Çevre} \\approx 50 \\times d',
  },
  {
    id: 'pythagoras-music',
    title: 'Pisagor’un Demirci Dükkânı ve Müzikteki Kesirler',
    era: 'MÖ 6. Yüzyıl · Antik Akdeniz',
    tag: 'Matematik ve Sanat',
    summary: 'Kulağa hoş gelen müzik notalarının ardında tam sayı kesirlerinin gizli uyumu vardır.',
    story:
      'Rivayete göre Pisagor bir demirci dükkânının önünden geçerken örse vuran farklı ağırlıktaki çekiçlerin bazılarının kulağa çok uyumlu, bazılarının ise uyumsuz sesler çıkardığını fark etti. Eve dönüp gergin bir tel üzerinde deney yaptı: Telin uzunluğunu tam yarısına (1/2) indirdiğinde aynı notanın bir oktav incesini, 2/3’üne indirdiğinde ise mükemmel beşli uyumunu duydu. Böylece müziğin temelinde 1/2, 2/3 ve 3/4 gibi basit rasyonel oranların yattığını keşfetti.',
    mathTakeaway: 'Kesirler ve oranlar yalnızca test sorularında değil, dinlediğimiz her melodinin ve ritmin içinde yaşar.',
    formulaLatex: '\\frac{1}{2} \\text{ (Oktav)}, \\quad \\frac{2}{3} \\text{ (Beşli)}, \\quad \\frac{3}{4} \\text{ (Dörtlü)}',
  },
  {
    id: 'sinan-golden-ratio',
    title: 'Mimar Sinan’ın Kubbelerindeki Geometri ve Dayanıklılık',
    era: '16. Yüzyıl · İstanbul ve Edirne',
    tag: 'Osmanlı Mühendisliği',
    summary: 'Süleymaniye ve Selimiye Camilerinin yüzyıllardır depremlere meydan okumasının matematiksel sırrı.',
    story:
      'Büyük usta Mimar Sinan, “ustalık eserim” dediği Edirne Selimiye Camii’nde 31 metreyi aşan dev kubbeyi sekizgen bir taşıyıcı sistem üzerine oturttu. Yükün zemine dengeli dağılması için simetri, sekizgen çokgen geometrisi ve ağırlık merkezi hesaplarını kusursuz biçimde uyguladı. Kubbe yüksekliği ile taban açıklığı arasındaki oranlar hem göz estetiği hem de yapı statiği bakımından bugün hâlâ mimarlık fakültelerinde ders olarak incelenmektedir.',
    mathTakeaway: 'Çokgenlerin simetrisi, çember-daire geometrisi ve oran hesapları güvenli ve estetik mimarinin temelidir.',
  },
];

export const MATHEMATICIANS: MathematicianProfile[] = [
  {
    id: 'harizmi',
    name: 'Muhammed bin Mûsâ el-Hârizmî',
    lifespan: 'y. 780 – 850',
    origin: 'Harezm (Türkistan) / Bağdat',
    specialty: 'Cebir, Algoritma, Astronomi ve Coğrafya',
    bio: 'Beytü’l-Hikme’nin önde gelen bilginlerinden Hârizmî, cebiri bağımsız bir bilim dalı hâline getirdi ve Hint-Arap onluk sayı sisteminin dünyaya yayılmasını sağladı.',
    keyDiscoveries: [
      'İlk sistematik cebir kitabı (El-Cebr ve’l-Mukâbele)',
      'Sıfırın ve onluk basamak sisteminin yaygınlaştırılması',
      'Birinci ve ikinci dereceden denklemlerin geometrik çözümleri',
    ],
    middleSchoolLink: '7. ve 8. Sınıf Cebirsel İfadeler ve Denklem Çözme',
    quote: 'Cebir, bilinmeyeni bilinenler yardımıyla dengeleyerek bulma sanatıdır.',
  },
  {
    id: 'oklid',
    name: 'Öklid (Euclid)',
    lifespan: 'y. MÖ 325 – 265',
    origin: 'İskenderiye',
    specialty: 'Geometri ve Sayılar Kuramı',
    bio: '“Geometrinin Babası” olarak bilinen Öklid, 13 ciltlik “Elementler” kitabında geometriyi birkaç temel aksiyomdan mantıksal ispatlarla inşa etti. Kitabı 2000 yılı aşkın süre ders kitabı olarak okutuldu.',
    keyDiscoveries: [
      'Asal sayıların sonsuz olduğunun zarif ispatı',
      'İki sayının EBOB’unu bulan Öklid Algoritması',
      'Üçgenler, paralel doğrular ve Pisagor ispatlarının sistematik sunumu',
    ],
    middleSchoolLink: '6. ve 8. Sınıf Asal Sayılar, EBOB-EKOK ve Üçgen Geometrisi',
    quote: 'Geometriye giden bir kral yolu yoktur (herkes aynı emekle öğrenir).',
  },
  {
    id: 'arsimet',
    name: 'Arşimet (Archimedes)',
    lifespan: 'MÖ 287 – 212',
    origin: 'Siraküza',
    specialty: 'Geometri, Fizik, Mühendislik',
    bio: 'Antik çağın en büyük matematikçi ve mucitlerinden biri olan Arşimet, çemberin çevresi ile çapı arasındaki π sayısını çokgenler kullanarak şaşırtıcı bir hassasiyetle hesapladı.',
    keyDiscoveries: [
      'π sayısının 3 + 10/71 ile 3 + 1/7 arasında olduğunun ispatı',
      'Küre ve silindir hacim oranları',
      'Kaldıraç yasası ve suyun kaldırma kuvveti',
    ],
    middleSchoolLink: '7. ve 8. Sınıf Çember, Daire, Silindir Hacmi ve π Sayısı',
    quote: 'Bana yeterince uzun bir kaldıraç ve sağlam bir dayanak noktası verin, dünyayı yerinden oynatayım.',
  },
  {
    id: 'cahit-arf',
    name: 'Ord. Prof. Dr. Cahit Arf',
    lifespan: '1910 – 1997',
    origin: 'Selanik / Türkiye',
    specialty: 'Cebir ve Sayılar Teorisi',
    bio: 'Dünya matematik literatürüne kendi adıyla geçen teoremler kazandıran, TÜBİTAK’ın kuruluşunda öncü rol oynayan ve portresi 10 Türk Lirası üzerinde yer alan büyük Türk matematikçisi.',
    keyDiscoveries: [
      'Arf Değişmezi (Arf Invariant) ve Arf Halkaları',
      'Hasse-Arf Teoremi',
      'Türkiye’de modern matematik araştırmalarının kurumsallaşması',
    ],
    middleSchoolLink: 'Matematiksel düşünme, örüntü keşfi ve cebirsel yapıların temelleri',
    quote: 'Matematik esas olarak sabır olayıdır; belleyerek değil, keşfederek anlamak gerekir.',
  },
  {
    id: 'ali-kuscu',
    name: 'Ali Kuşçu',
    lifespan: '1403 – 1474',
    origin: 'Semerkand / İstanbul',
    specialty: 'Matematik, Astronomi, Dil Bilimi',
    bio: 'Uluğ Bey’in öğrencisi ve Semerkand Rasathanesi yöneticisi olan Ali Kuşçu, Fatih Sultan Mehmet döneminde İstanbul’a gelerek Osmanlı medreselerinde matematik ve astronomi eğitimini yeniledi.',
    keyDiscoveries: [
      'El-Muhammediyye (Aritmetik ve Geometri ders kitabı)',
      'Ay’ın ilk ayrıntılı haritalarından biri',
      'İstanbul’un enlem ve boylamının hassas ölçümü',
    ],
    middleSchoolLink: 'Oran-orantı, kesirler, açı ölçümü ve koordinat sistemi',
    quote: 'Bilim, akıl ve gözlemin uyumuyla insanı hakikate yaklaştırır.',
  },
  {
    id: 'omer-hayyam',
    name: 'Ömer Hayyam',
    lifespan: '1048 – 1131',
    origin: 'Nişabur (Horasan)',
    specialty: 'Cebir, Geometri, Takvim ve Şiir',
    bio: 'Dünya çapında rubaileriyle tanınsa da kendi çağında en büyük matematikçilerden ve astronomlardan biriydi. Pascal’dan yüzlerce yıl önce binom açılımı katsayılarını üçgen düzeninde inceledi.',
    keyDiscoveries: [
      'Üçüncü dereceden denklemlerin geometrik çözümü',
      'Binom açılımı (Hayyam-Pascal Üçgeni)',
      'Güneş yılına dayalı yüksek hassasiyetli Celâlî Takvimi',
    ],
    middleSchoolLink: '8. Sınıf Cebirsel Özdeşlikler ve (a+b)² Açılımları',
    quote: 'Bilgi, ölçü ve akıl ile sınandığında sağlamlaşır.',
  },
  {
    id: 'gauss',
    name: 'Carl Friedrich Gauss',
    lifespan: '1777 – 1855',
    origin: 'Almanya',
    specialty: 'Sayılar Teorisi, İstatistik, Astronomi',
    bio: '“Matematikçilerin Prensi” olarak anılan Gauss, çocukluk yaşından itibaren sayılar teorisi, olasılık dağılımı (çan eğrisi) ve astronomide çığır açan sonuçlar üretti.',
    keyDiscoveries: [
      'Ardışık sayıların toplam formülü',
      'Normal dağılım (Gauss eğrisi) ve veri analizi temelleri',
      'Pergel ve cetvelle 17-gen çizilebileceğinin ispatı',
    ],
    middleSchoolLink: 'Örüntüler, Veri Analizi ve Çokgenler',
    quote: 'Matematik bilimlerin kraliçesi, sayılar teorisi ise matematiğin kraliçesidir.',
  },
  {
    id: 'hypatia',
    name: 'İskenderiyeli Hypatia',
    lifespan: 'y. 355 – 415',
    origin: 'İskenderiye',
    specialty: 'Matematik, Astronomi, Felsefe',
    bio: 'Tarihte bilinen ilk kadın matematikçilerden ve öğretmenlerden biri olan Hypatia, İskenderiye Kütüphanesi geleneğinde geometri ve astronomi dersleri verdi, usturlap geliştirdi.',
    keyDiscoveries: [
      'Koni kesitleri (çember, elips, parabol) üzerine açıklamalar',
      'Gök cisimlerini ölçmeye yarayan usturlap ve sıvı yoğunluğu ölçen hidrometre',
      'Bilimsel merakı savunan eğitim yöntemi',
    ],
    middleSchoolLink: 'Geometrik şekiller, çemberler ve eleştirel düşünme',
    quote: 'Düşünme hakkını koru; çünkü yanlış düşünmek bile hiç düşünmemekten iyidir.',
  },
  {
    id: 'mirzakhani',
    name: 'Meryem Mirzahani',
    lifespan: '1977 – 2017',
    origin: 'İran / Stanford',
    specialty: 'Geometri ve Dinamik Sistemler',
    bio: 'Matematik dünyasının en büyük ödülü sayılan Fields Madalyası’nı kazanan ilk kadın matematikçidir. Zor geometri problemlerini büyük kâğıtlara çizimler yaparak çözmesiyle tanınır.',
    keyDiscoveries: [
      'Hiperbolik yüzeyler ve karmaşık geometrik şekiller üzerine teoremler',
      'Uluslararası Matematik Olimpiyatı’nda art arda altın madalyalar',
      'Çizim ve görselleştirme ile derin matematiksel sezgi geliştirme',
    ],
    middleSchoolLink: 'Geometrik düşünme, çokgenler ve görsel problem çözme',
    quote: 'Matematiğin güzelliği yalnızca en sabırlı takipçilerine kendini gösterir.',
  },
  {
    id: 'biruni',
    name: 'Ebû Reyhân el-Bîrûnî',
    lifespan: '973 – 1048',
    origin: 'Harezm / Gazne',
    specialty: 'Matematik, Astronomi, Jeodezi, Fizik',
    bio: 'Bilim tarihçilerinin “Evrensel Dâhi” olarak andığı Bîrûnî; astronomiden coğrafyaya, trigonometriden özgül ağırlık ölçümlerine kadar 100’ü aşkın eser yazdı ve deneysel gözlem yöntemini savundu.',
    keyDiscoveries: [
      'Bir dağın zirvesinden ufuk eğimini ölçerek Dünya’nın yarıçapını yüksek hassasiyetle hesapladı',
      'Trigonometrik fonksiyonları bağımsız bir matematik alanı olarak geliştirdi',
      '18 farklı maden ve taşın özgül ağırlığını günümüz değerlerine çok yakın ölçtü',
    ],
    middleSchoolLink: '7. ve 8. Sınıf Dik Üçgenler, Açılar, Oran ve Ölçme',
    quote: 'Bilgiyi ararken önyargıdan uzak durmak ve doğayı bizzat gözlemlemek gerekir.',
  },
  {
    id: 'ulug-bey',
    name: 'Uluğ Bey',
    lifespan: '1394 – 1449',
    origin: 'Semerkand (Timurlu Devleti)',
    specialty: 'Astronomi, Trigonometri ve Eğitim Hamiliği',
    bio: 'Hem hükümdar hem de birinci sınıf bir gökbilimci olan Uluğ Bey, Semerkand’da dev bir rasathane ve medrese kurarak Ali Kuşçu gibi büyük bilginleri yetiştirdi.',
    keyDiscoveries: [
      'Zîc-i Uluğ Bey: 1000’e yakın yıldızın konumunu içeren olağanüstü hassas katalog',
      'Bir yıldız yılının uzunluğunu yalnızca 1 dakikalık farkla doğru hesapladı',
      'sin(1°) değerini virgülden sonra dokuz basamağa kadar doğru hesaplayan trigonometri tabloları',
    ],
    middleSchoolLink: 'Açı ölçümü, ondalık gösterim hassasiyeti ve bilimsel veri tabloları',
    quote: 'Dinler dağılır, krallıklar yıkılır; fakat bilginlerin eserleri sonsuza dek yaşar.',
  },
  {
    id: 'euler',
    name: 'Leonhard Euler',
    lifespan: '1707 – 1783',
    origin: 'İsviçre (Basel)',
    specialty: 'Sayılar Teorisi, Geometri, Çizge (Graf) Kuramı',
    bio: 'Matematik tarihinin en üretken isimlerinden Euler, yaşamının son yıllarında görme yetisini kaybetmesine rağmen zihninden yüzlerce makale yazdı. Bugün kullandığımız f(x) ve π sembollerini yaygınlaştırdı.',
    keyDiscoveries: [
      'Königsberg’in Yedi Köprüsü problemiyle Çizge Kuramı’nı (navigasyon ve ağ matematiği) başlattı',
      'Çok yüzlüler için ünlü Euler Formülü: Köşe - Ayrıt + Yüz = 2 (K - A + Y = 2)',
      'Fonksiyon f(x) ve π gösterimlerinin standartlaştırılması',
    ],
    middleSchoolLink: '8. Sınıf Geometrik Cisimler (Prizma & Piramitler) ve Mantık Ağları',
    quote: 'Kuşku duyduğunuzda hesaplayın; doğanın dili sayılar ve şekillerle konuşur.',
  },
];

export const SCIENCE_HISTORY_TIMELINE: ScienceMilestone[] = [
  {
    id: 'sc-1',
    year: 'MÖ 3000',
    title: 'Mezopotamya ve Mısır’da İlk Sayı Sistemleri',
    inventorOrCulture: 'Sümerler ve Antik Mısırlılar',
    description: 'Sümerler 60’lık sayı sistemini geliştirerek bugünkü 1 saat = 60 dakika ve çemberin 360 derece olmasının temelini attı; Mısırlılar Nil taşkınlarından sonra tarlaları ölçmek için geometriyi kullandı.',
    impact: 'Zaman ölçümü, açı dereceleri ve alan hesaplarının doğuşu.',
  },
  {
    id: 'sc-2',
    year: 'MÖ 530',
    title: 'Pisagor Bağıntısı ve Müzikteki Oranlar',
    inventorOrCulture: 'Pisagor Okulu',
    description: 'Dik üçgenlerde dik kenarların kareleri toplamının hipotenüsün karesine eşit olduğu sistematik biçimde incelendi; ayrıca tel uzunlukları ile müzik notaları arasındaki kesir oranları keşfedildi.',
    impact: '8. sınıf dik üçgen geometrisi ve irrasyonel sayıların (√2) keşfi.',
  },
  {
    id: 'sc-3',
    year: 'MÖ 240',
    title: 'Dünya’nın Çevresinin Gölgeyle Hesaplanması',
    inventorOrCulture: 'Eratosthenes',
    description: 'İskenderiye Kütüphanesi yöneticisi Eratosthenes, iki şehirdeki güneş gölgesi açı farkını ve aradaki mesafeyi kullanarak yalnızca oran-orantı ile Dünya’nın çevresini %2’den az hatayla hesapladı.',
    impact: 'Basit bir 7. sınıf oran-orantı mantığıyla gezegen boyutunun ölçülmesi.',
  },
  {
    id: 'sc-4',
    year: 'MS 628',
    title: 'Sıfırın (0) Sayı Olarak Tanımlanması',
    inventorOrCulture: 'Brahmagupta (Hindistan)',
    description: 'Sıfır ile toplama, çıkarma ve negatif sayıların kuralları ilk kez açık biçimde yazıldı.',
    impact: 'Tam sayılar kümesinin ve modern aritmetiğin kurulması.',
  },
  {
    id: 'sc-5',
    year: 'MS 820',
    title: 'Cebir ve Algoritmanın Doğuşu',
    inventorOrCulture: 'Hârizmî (Bağdat)',
    description: 'Bilinmeyenli denklemleri adım adım çözme yöntemleri sistemleştirildi; onluk sayı sistemi dünyaya tanıtıldı.',
    impact: 'Bugünkü cebir derslerinin ve bilgisayar algoritmalarının temeli.',
  },
  {
    id: 'sc-6',
    year: '1021',
    title: 'Bilimsel Deney Yöntemi ve Optik (Kitâbü’l-Menâzır)',
    inventorOrCulture: 'İbnü’l-Heysem',
    description: 'Gözün nesnelerden yansıyan ışığı algıladığını deneylerle kanıtladı, karanlık oda (camera obscura) düzeneğini kurdu.',
    impact: 'Modern fotoğraf makineleri, teleskoplar ve deneysel bilim yöntemi.',
  },
  {
    id: 'sc-7',
    year: '1206',
    title: 'İlk Otomatik Mekanik Makineler ve Robotik Öncülüğü',
    inventorOrCulture: 'El-Cezerî (Cizre)',
    description: 'Su saatleri, otomatik el yıkama makineleri, krank mili ve dişli çark sistemlerini geometrik çizimlerle tasarladı.',
    impact: 'Sibernetik, mekanik mühendislik ve robotik biliminin öncüsü.',
  },
  {
    id: 'sc-8',
    year: '1637',
    title: 'Koordinat Sistemi (Analitik Geometri)',
    inventorOrCulture: 'René Descartes',
    description: 'Yatay (x) ve dikey (y) sayı doğrularını dik kesiştirerek geometrik şekilleri cebirsel denklemlerle ifade etmeyi başardı.',
    impact: '8. sınıf Doğrusal Denklemler, harita GPS sistemleri ve bilgisayar grafikleri.',
  },
  {
    id: 'sc-9',
    year: '1687',
    title: 'Evrensel Kütle Çekimi ve Hareket Yasaları',
    inventorOrCulture: 'Isaac Newton',
    description: 'Elmanın yere düşmesi ile Ay’ın Dünya etrafında dönmesinin aynı matematiksel yasaya uyduğunu gösterdi.',
    impact: 'Uzay yolculukları, mühendislik ve modern fizik.',
  },
  {
    id: 'sc-10',
    year: '1936',
    title: 'Modern Bilgisayarın Matematiksel Modeli',
    inventorOrCulture: 'Alan Turing',
    description: 'Herhangi bir algoritmayı adım adım çalıştırabilen soyut hesaplama makinesini (Turing Makinesi) tanımladı.',
    impact: 'Akıllı telefonlar, internet ve yapay zekâ çağının başlaması.',
  },
  {
    id: 'sc-11',
    year: '1030',
    title: 'Dünya Yarıçapının Dağ Zirvesinden Hesaplanması',
    inventorOrCulture: 'El-Bîrûnî (Nandana Kalesi)',
    description: 'Bîrûnî, yalnızca bir dağın yüksekliğini ve zirveden ufka bakış açısını ölçerek dik üçgen geometrisiyle Dünya’nın yarıçapını %1’den az hata payıyla hesapladı.',
    impact: 'Jeodezi biliminin ve uzaktan geometrik ölçüm yöntemlerinin doğuşu.',
  },
  {
    id: 'sc-12',
    year: '1437',
    title: 'Semerkand Rasathanesi ve Zîc-i Uluğ Bey',
    inventorOrCulture: 'Uluğ Bey, Kadızâde-i Rûmî ve Ali Kuşçu',
    description: 'Teleskop henüz icat edilmeden 40 metrelik mermer sekstant ile gökyüzü gözlemleri yapıldı ve yüzyıllarca Avrupa’da da başvurulan yıldız cetvelleri hazırlandı.',
    impact: 'Gözlemsel astronomide hassas veri kaydı ve trigonometri tablolarının gelişimi.',
  },
  {
    id: 'sc-13',
    year: '1513',
    title: 'Pîrî Reis’in Dünya Haritası ve Kartografya',
    inventorOrCulture: 'Pîrî Reis (Gelibolu)',
    description: 'Osmanlı denizcisi ve haritacısı Pîrî Reis, 20’den fazla harita ve denizci gözlemini matematiksel rüzgâr gülleriyle birleştirerek Atlantik ve Amerika kıyılarını çizdi.',
    impact: 'Ölçek, koordinat, pusula açıları ve küresel haritacılıkta çığır açan bir miras.',
  },
];

export const LOGIC_PUZZLES: LogicPuzzleItem[] = [
  {
    id: 'puz-1',
    title: 'Üç Işık Anahtarı ve Kapalı Oda',
    category: 'Mantık',
    difficulty: 'Orta',
    question:
      'Kapalı bir odanın içinde bir adet klasik akkor ampul var. Dışarıda ise 3 adet anahtar bulunuyor ama hangisinin içerideki ampulü yaktığını bilmiyorsunuz. Odaya yalnızca BİR KEZ girme hakkınız var. Doğru anahtarı kesin olarak nasıl bulursunuz?',
    hints: [
      'Ampul yandığında sadece ışık değil, bir fiziksel özellik daha üretir.',
      '1. anahtarı birkaç dakika açık tutup sonra kapatın; ardından 2. anahtarı açıp hemen içeri girin.',
    ],
    answer: 'Işık + sıcaklık testiyle (1. anahtar ısıtır, 2. anahtar yakar, 3. anahtar soğuk ve sönük kalır).',
    explanation:
      '1. anahtarı açıp 3 dakika bekleyin, sonra kapatın. Hemen 2. anahtarı açıp odaya girin. Ampul yanıyorsa doğru anahtar 2’dir. Sönük ama elinizle dokunduğunuzda sıcaksa doğru anahtar 1’dir. Sönük ve soğuksa doğru anahtar 3’tür!',
  },
  {
    id: 'puz-2',
    title: 'Nilüfer Çiçeği ve Gölün Yarısı',
    category: 'Sayı Bilmecesi',
    difficulty: 'Kolay',
    question:
      'Bir göldeki nilüfer bitkisi her gün kapladığı alanı iki katına çıkarıyor. Nilüferin bütün gölü tamamen kaplaması 30 gün sürdüğüne göre, gölün tam YARISINI kaplaması kaç gün sürmüştür?',
    hints: [
      'Cevap 15 değil! Her gün bir önceki günün iki katı olduğunu unutmayın.',
      '30. gün gölün tamamı (1/1) kaplıysa, bir gün önce ne kadarı kaplıydı?',
    ],
    answer: '29. gün',
    explanation:
      'Bitki her gün iki katına çıktığı için 30. günün tamamına ulaşmadan tam bir gün önce, yani 29. günde gölün yarısını kaplamış olmalıdır. Bu soru üslü büyümenin (2ⁿ) zihnimizi nasıl şaşırttığını gösterir.',
  },
  {
    id: 'puz-3',
    title: '3 Litre ve 5 Litrelik Kovalarla Tam 4 Litre',
    category: 'Mantık',
    difficulty: 'Orta',
    question:
      'Elinizde üzerinde hiç ölçü çizgisi olmayan tam 5 litrelik ve tam 3 litrelik iki kova ile sınırsız su var. Bu iki kovayı kullanarak tam olarak 4 litre suyu nasıl ölçersiniz?',
    hints: [
      'Önce 5 litrelik kovayı doldurup 3 litrelik kovaya aktarın; geriye 2 litre kalır.',
      '3 litrelik kovayı boşaltıp o 2 litreyi içine koyun. Şimdi 3’lük kovada ne kadar boş yer kaldı?',
    ],
    answer: '5’likten 3’lüğe dök (2L kalır) → 3’lüğü boşaltıp 2L’yi aktar → 5’liği doldurup 3’lüğe 1L ekle → 5’likte tam 4L kalır!',
    explanation:
      '1) 5L’yi doldur, 3L’ye boşalt (5L’de 2L kalır). 2) 3L’yi dök, kalan 2L’yi 3L’lik kovaya aktar (artık 1L boşluğu var). 3) 5L’yi tekrar tam doldur ve 3L’lik kova dolana kadar (yani tam 1L) su aktar. 5L’lik kovada 5 - 1 = 4 litre kalır.',
  },
  {
    id: 'puz-4',
    title: '9 Bilye ve En Az Tartım',
    category: 'Olasılık & Strateji',
    difficulty: 'Orta',
    question:
      'Görünüşleri tamamen aynı olan 9 altın bilyeden 8’i eşit ağırlıkta, 1’i ise diğerlerinden biraz daha ağırdır. İki kefeli eşit kollu bir teraziyi EN AZ kaç kez kullanarak ağır bilyeyi kesin olarak bulabilirsiniz?',
    hints: [
      'Bilyeleri ikiye değil, üç eşit gruba (3 - 3 - 3) ayırmayı deneyin!',
      'İlk tartımda 3’e 3 koyduğunuzda ağır bilyenin hangi 3’lü grupta olduğu hemen ortaya çıkar.',
    ],
    answer: 'Yalnızca 2 tartımda!',
    explanation:
      '1. Tartım: 3 bilyeyi sol, 3 bilyeyi sağ kefeye koyun. Eşit çıkarsa ağır bilye dışarıdaki 3’lüdedir; biri ağır basarsa o 3’lüdedir. 2. Tartım: Şüpheli 3 bilyeden 1’ini sola, 1’ini sağa koyun. Eşitse dışarıdaki, değilse ağır basan bilye aranan bilyedir!',
  },
  {
    id: 'puz-5',
    title: 'Salyangozun Kuyudan Çıkış Günü',
    category: 'Sayı Bilmecesi',
    difficulty: 'Kolay',
    question:
      'Bir salyangoz 10 metre derinliğindeki bir kuyunun dibindedir. Gündüzleri 3 metre yukarı tırmanmakta, geceleri uyurken 2 metre aşağı kaymaktadır. Salyangoz kuyunun ağzına kaçıncı gün ulaşır?',
    hints: [
      'Her tam gün (gündüz + gece) net 1 metre yükseliyor, ama son gün tepesine ulaştığında artık aşağı kaymaz!',
      '7. günün sonunda 7 metrededir. 8. günün gündüzünde ne olur?',
    ],
    answer: '8. günün gündüzünde',
    explanation:
      'İlk 7 günde her gün net 3 - 2 = 1 metre ilerleyerek 7. günün gecesinde 7 metreye ulaşır. 8. günün gündüzünde 3 metre daha tırmanarak 7 + 3 = 10 metreye varır ve kuyudan dışarı çıkar!',
  },
  {
    id: 'puz-6',
    title: '100 Kapı ve Çarpan Sayısı Sırrı',
    category: 'Sayı Bilmecesi',
    difficulty: 'Zor',
    question:
      '1’den 100’e kadar numaralandırılmış 100 kapalı kapı var. 1. öğrenci tüm kapıları açıyor. 2. öğrenci 2’nin katı olan kapıların durumunu değiştiriyor (açıksa kapatıyor, kapalıysa açıyor). 3. öğrenci 3’ün katlarını... Bu işlem 100. öğrenciye kadar sürüyor. Sonunda hangi kapılar AÇIK kalır?',
    hints: [
      'Bir kapıya kaç kez dokunulur? O kapı numarasının pozitif tam sayı bölenleri (çarpanları) sayısı kadar!',
      'Başta kapalı olan bir kapının açık kalması için TEK sayıda böleni olmalıdır. Hangi sayıların tek sayıda böleni vardır?',
    ],
    answer: 'Tam kare numaralı 10 kapı: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100',
    explanation:
      'Çarpanlar genellikle çiftler hâlinde gelir (ör. 12 = 1×12, 2×6, 3×4 → 6 çarpan, yani çift). Yalnızca tam kare sayılarda bir çarpan kendisiyle eşleştiği için (ör. 9 = 1×9, 3×3 → 3 çarpan) bölen sayısı TEK olur. Bu yüzden 1’den 100’e kadar olan 10 tam kare kapı açık kalır!',
  },
  {
    id: 'puz-7',
    title: 'Karanlıkta Çorap Çekme (Güvercin Yuvası İlkesi)',
    category: 'Olasılık & Strateji',
    difficulty: 'Kolay',
    question:
      'Bir çekmecede 10 siyah, 10 lacivert ve 10 beyaz çorap karışık hâlde duruyor. Elektrikler kesik ve renkleri göremiyorsunuz. Aynı renkten kesinlikle bir çift (2 adet) çorap elde etmek için en az kaç çorap çekmelisiniz?',
    hints: [
      'En şanssız senaryoyu düşünün: ilk 3 çekişte hep farklı renkler gelirse ne olur?',
      '3 farklı renk olduğuna göre 4. çorap mutlaka elinizdeki renklerden biriyle eşleşecektir.',
    ],
    answer: 'En az 4 çorap',
    explanation:
      'En kötü ihtimalle ilk 3 çorabın üçü de farklı renk olur (1 siyah, 1 lacivert, 1 beyaz). Çekeceğiniz 4. çorap bu üç renkten biri olacağı için kesinlikle bir çift oluşur. Buna matematikte “Güvercin Yuvası İlkesi” denir.',
  },
  {
    id: 'puz-8',
    title: 'Kibrit Çöplerinden Eşit Alanlı Kareler',
    category: 'Geometri Zekâsı',
    difficulty: 'Orta',
    question:
      'Bir kare bahçenin çevresi 40 metredir. Bahçenin her bir kenar uzunluğu %20 artırılırsa, bahçenin ALANI yüzde kaç artar?',
    hints: [
      'Önce karenin bir kenarını bulun (40 / 4 = 10 m) ve başlangıç alanını hesaplayın (10 × 10 = 100 m²).',
      '10 metreyi %20 artırırsanız yeni kenar 12 metre olur. Yeni alan kaç m² dir?',
    ],
    answer: '%44 artar (yanıt %20 veya %40 değildir!)',
    explanation:
      'İlk kenar 10 m → İlk alan = 100 m². Kenar %20 artınca yeni kenar 12 m olur → Yeni alan = 12 × 12 = 144 m². Alan 100’den 144’e çıktığı için artış tam %44 olur. Kenar uzunluğu 1,2 katına çıkınca alan (1,2)² = 1,44 katına çıkar.',
  },
  {
    id: 'puz-9',
    title: 'Karanlık Köprü ve Tek El Feneri',
    category: 'Olasılık & Strateji',
    difficulty: 'Zor',
    question:
      'Dört arkadaş gece karanlığında en fazla 2 kişinin aynı anda geçebileceği bir köprüden geçmek istiyor ve tek bir el fenerleri var. Köprüyü geçme süreleri sırasıyla 1 dk, 2 dk, 5 dk ve 10 dk. İki kişi birlikte giderken yavaş olanın hızında yürürler. En az kaç dakikada dördü de karşıya geçebilir?',
    hints: [
      'Cevap 19 dakika değil! En yavaş iki kişiyi (5 ve 10 dk) mutlaka AYNI SEFERDE geçirmelisiniz ki 5 dakika kaybolmasın.',
      'Önce (1 ve 2) geçer (2 dk) → 1 geri döner (1 dk) → şimdi (5 ve 10) birlikte geçer (10 dk) → karşıda bekleyen 2 geri döner!',
    ],
    answer: '17 dakika',
    explanation:
      '1) 1 ve 2 karşıya geçer (2 dk). 2) 1 fenerle geri döner (1 dk). 3) 5 ve 10 birlikte karşıya geçer (10 dk). 4) Karşıda bekleyen 2 fenerle geri döner (2 dk). 5) 1 ve 2 son kez karşıya geçer (2 dk). Toplam: 2 + 1 + 10 + 2 + 2 = 17 dakika!',
  },
  {
    id: 'puz-10',
    title: 'Kurt, Kuzu ve Lahana Nehir Geçişi',
    category: 'Mantık',
    difficulty: 'Kolay',
    question:
      'Bir çiftçi yanında bir kurt, bir kuzu ve bir lahana ile nehrin karşı kıyısına geçmek istiyor. Kayık sadece çiftçiyi ve yanına alacağı TEK bir şeyi taşıyabiliyor. Çiftçi yokken kurt kuzuyu, kuzu da lahanayı yer. Çiftçi hepsini sağ salim karşıya nasıl geçirir?',
    hints: [
      'İlk seferde karşıya kimi geçirirseniz geride kalan ikili birbirine zarar vermez?',
      'İkinci veya üçüncü adımda kuzuyu geçici olarak GERİ getirebileceğinizi unutmayın!',
    ],
    answer: 'Kuzu → Boş dön → Kurt (veya Lahana) → Kuzuyu geri getir → Lahana (veya Kurt) → Boş dön → Kuzu',
    explanation:
      '1) Önce kuzuyu karşıya geçir (kurt ile lahana baş başa kalabilir). 2) Boş dön, kurdu karşıya götür. 3) Dönüşte kuzuyu yanında geri getir ki kurt kuzuyu yemesin. 4) Kuzuyu bırakıp lahanayı kurdun yanına götür. 5) Boş dönüp son olarak kuzuyu karşıya geçir!',
  },
  {
    id: 'puz-11',
    title: 'Saat 03:30’da Akrep ile Yelkovan Arasındaki Açı',
    category: 'Geometri Zekâsı',
    difficulty: 'Orta',
    question:
      'Analog bir duvar saatinde saat tam 03:30’u gösterdiğinde akrep ile yelkovan arasındaki dar açı kaç derecedir? (Dikkat: 90° değildir!)',
    hints: [
      'Her bir saat aralığı 360° / 12 = 30° dir. Saat 03:30’da yelkovan tam 6’nın (180°) üzerindedir.',
      'Yelkovan yarım saat ilerlediğinde akrep 3’ün üzerinde sabit kalmaz; 3 ile 4’ün tam ORTASINA gelir!',
    ],
    answer: '75°',
    explanation:
      'Saat 03:30’da yelkovan 6’nın üzerindedir (6 × 30° = 180°). Akrep ise 3 ile 4’ün tam ortasında olduğu için 3,5 × 30° = 105° konumundadır. İkisi arasındaki açı: 180° - 105° = 75° olur.',
  },
  {
    id: 'puz-12',
    title: '1000 Altın ve 10 Kese Sırrı (İkili Sistem)',
    category: 'Sayı Bilmecesi',
    difficulty: 'Zor',
    question:
      'Bir tüccarın elinde 1000 adet altın sikke ve 10 adet boş kese var. Tüccar altınları bu 10 keseye öyle bir dağıtmak istiyor ki, kendisinden 1’den 1000’e kadar HANGİ tam sayı kadar altın istenirse istensin, keseleri hiç açmadan birkaç keseyi birleştirerek o miktarı tam olarak verebilsin. Keselere kaçar altın koymalıdır?',
    hints: [
      '2’nin kuvvetlerini (üslü sayılar: 2⁰, 2¹, 2², 2³...) düşünün!',
      'İlk 9 keseye 1, 2, 4, 8, 16, 32, 64, 128, 256 altın koyarsanız toplam 511 eder. 10. keseye kaç altın kalır?',
    ],
    answer: '1, 2, 4, 8, 16, 32, 64, 128, 256 ve son keseye 489 altın!',
    explanation:
      'İkili (binary) sayı sistemi sayesinde 1, 2, 4, 8, 16, 32, 64, 128, 256 sayılarının toplamlarıyla 1’den 511’e kadar HER tam sayı elde edilebilir. 10. keseye kalan 1000 - 511 = 489 altın konulduğunda, 512’den 1000’e kadar olan tüm sayılar da (489 + ilk 9 keseden uygun toplam) eksiksiz oluşturulur!',
  },
];
