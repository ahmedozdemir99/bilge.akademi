import type { MultiTestPack } from '../../components/ui/MultiTestQuizEngine';

export const SCIENCE_TEST_PACKS: MultiTestPack[] = [
  {
    id: 'sci-test-1',
    testNumber: 1,
    title: 'Mevsimler, İklim ve Gökyüzü',
    subtitle: 'Eksen eğikliği, gündönümleri, rüzgâr oluşumu ve iklim–hava olayları',
    difficulty: 'Temel',
    questions: [
      {
        id: 'sc1-q1',
        topicTag: 'Mevsimlerin Oluşumu',
        question: 'Dünya üzerinde farklı yarım kürelerde aynı anda farklı mevsimlerin yaşanmasının temel sebebi hangisidir?',
        options: [
          'Dünya’nın Güneş’e olan uzaklığının yıl içinde değişmesi',
          'Dünya’nın dönme ekseninin 23° 27′ eğik olması ve Güneş etrafında dolanması',
          'Ay’ın Dünya etrafında dolanma hareketi yapması',
          'Dünya’nın kendi ekseni etrafında batıdan doğuya dönmesi',
        ],
        correctIndex: 1,
        explanation:
          'Mevsimlerin temel nedeni eksen eğikliği (23° 27′) ve Dünya’nın Güneş etrafındaki dolanma hareketidir; Güneş’e yakınlık/uzaklık mevsimleri oluşturmaz.',
      },
      {
        id: 'sc1-q2',
        topicTag: 'Gündönümü Tarihleri',
        question: '21 Haziran tarihinde Türkiye’nin bulunduğu Kuzey Yarım Küre için aşağıdakilerden hangisi doğrudur?',
        options: [
          'En uzun gece yaşanır ve kış mevsimi başlar.',
          'Güneş ışınları Oğlak Dönencesi’ne dik düşer.',
          'En uzun gündüz yaşanır ve yaz mevsimi başlar.',
          'Gece ve gündüz süreleri tüm dünyada eşittir.',
        ],
        correctIndex: 2,
        explanation:
          '21 Haziran’da Güneş ışınları Kuzey Yarım Küre’deki Yengeç Dönencesi’ne dik düşer; Kuzey Yarım Küre’de yaz başlar ve en uzun gündüz yaşanır.',
      },
      {
        id: 'sc1-q3',
        topicTag: 'Ekinoks',
        question: 'Dünya genelinde gece ve gündüz sürelerinin eşit (12 saat gündüz, 12 saat gece) olduğu tarihler hangileridir?',
        options: [
          '21 Haziran ve 21 Aralık',
          '21 Mart ve 23 Eylül',
          '1 Ocak ve 1 Temmuz',
          '21 Mart ve 21 Haziran',
        ],
        correctIndex: 1,
        explanation:
          '21 Mart ve 23 Eylül ekinoks tarihlerinde Güneş ışınları Ekvator’a dik düşer ve eksen eğikliğinin etkisi ortadan kalktığı için tüm dünyada gece-gündüz eşit olur.',
      },
      {
        id: 'sc1-q4',
        topicTag: 'Rüzgâr Oluşumu',
        question: 'Rüzgârın yönü ve oluşumu ile ilgili aşağıdaki ifadelerden hangisi doğrudur?',
        options: [
          'Yatay yönde alçak basınç alanından yüksek basınç alanına doğru eser.',
          'Yatay yönde yüksek basınç (soğuk) alanından alçak basınç (sıcak) alanına doğru eser.',
          'Yalnızca kış mevsiminde ve geceleri oluşur.',
          'Hava sıcaklığının her yerde eşit olduğu durumlarda hızlanır.',
        ],
        correctIndex: 1,
        explanation:
          'Sıcak bölgede hava yükselerek alçak basınç, soğuk bölgede alçalarak yüksek basınç oluşturur. Rüzgâr daima yüksek basınçtan alçak basınca doğru yatay hareket eder.',
      },
      {
        id: 'sc1-q5',
        topicTag: 'İklim ve Hava Olayları',
        question: '“Antalya’da yazlar sıcak ve kurak, kışlar ılık ve yağışlı geçer.” cümlesi aşağıdakilerden hangisine örnektir?',
        options: ['Günlük hava tahmini', 'Meteoroloji bülteni', 'İklim özelliği', 'Ani hava olayı'],
        correctIndex: 2,
        explanation:
          'Geniş bir bölgede en az 30–35 yıllık ortalama hava koşullarını anlatan kesin ve genel ifadeler iklim bilgisidir (Klimatoloji).',
      },
      {
        id: 'sc1-q6',
        topicTag: 'Bilim Dalları',
        question: 'Hava olaylarını kısa süreli ve dar bölgeler için inceleyip tahmin yürüten bilim dalı ile uzmanına ne ad verilir?',
        options: [
          'Klimatoloji – Klimatolog',
          'Meteoroloji – Meteorolog',
          'Biyoloji – Biyolog',
          'Jeoloji – Jeolog',
        ],
        correctIndex: 1,
        explanation:
          'Hava olaylarını inceleyen bilim dalı meteoroloji, uzmanı ise meteorologdur. İklimi inceleyen bilim ise klimatolojidir.',
      },
      {
        id: 'sc1-q7',
        topicTag: 'Işık Açısı ve Isınma',
        question: 'Güneş ışınlarının yeryüzüne düşme açısı büyüdükçe (90°’ye yaklaştıkça) aşağıdakilerden hangisi gerçekleşir?',
        options: [
          'Aydınlanan yüzey alanı genişler ve sıcaklık düşer.',
          'Birim yüzeye düşen enerji miktarı artar ve sıcaklık yükselir.',
          'Gölge boyu en uzun hâline ulaşır.',
          'Mevsim mutlaka kışa döner.',
        ],
        correctIndex: 1,
        explanation:
          'Dik veya dike yakın açıyla gelen ışınlar daha dar bir alana yoğunlaşır; birim yüzeye aktarılan ısı enerjisi artar ve gölge boyu kısalır.',
      },
      {
        id: 'sc1-q8',
        topicTag: 'Yağış Türleri',
        question: 'Yeryüzüne yakın yerlerde su buharının soğuk nesneler üzerinde doğrudan buz kristallerine dönüşmesiyle oluşan hava olayı hangisidir?',
        options: ['Yağmur', 'Dolu', 'Kırağı', 'Çiy'],
        correctIndex: 2,
        explanation:
          'Su buharının yeryüzüne yakın soğuk zeminlerde sıvı hâle geçmeden doğrudan buz kristallerine (donmaya) uğramasıyla kırağı oluşur; sıvı damlacık oluşursa çiy denir.',
      },
      {
        id: 'sc1-q9',
        topicTag: 'Güneş Sistemi',
        question: 'Güneş’e en yakın gezegen ile halkalarıyla en belirgin tanınan gazsal gezegen hangi seçenekte doğru verilmiştir?',
        options: [
          'Venüs – Mars',
          'Merkür – Satürn',
          'Dünya – Neptün',
          'Mars – Jüpiter',
        ],
        correctIndex: 1,
        explanation:
          'Güneş’e en yakın gezegen Merkür’dür; belirgin buz ve kaya halkalarıyla en ünlü gezegen ise Satürn’dür.',
      },
      {
        id: 'sc1-q10',
        topicTag: 'Küresel İklim Değişikliği',
        question: 'Aşağıdakilerden hangisi sera etkisini ve küresel ısınmayı azaltmaya yönelik doğru bir önlemdir?',
        options: [
          'Fosil yakıt (kömür, petrol) kullanımını artırmak',
          'Orman alanlarını azaltmak',
          'Güneş ve rüzgâr gibi yenilenebilir enerji kaynaklarına yönelmek',
          'Bireysel araç kullanımını toplu taşıma yerine tercih etmek',
        ],
        correctIndex: 2,
        explanation:
          'Yenilenebilir enerji kaynakları atmosferdeki CO₂ gibi sera gazı salımını azaltarak küresel iklim değişikliğiyle mücadelede temel rol oynar.',
      },
    ],
  },
  {
    id: 'sci-test-2',
    testNumber: 2,
    title: 'DNA, Genetik Kod ve Kalıtım',
    subtitle: 'Nükleotid, DNA eşlenmesi, Mendel çaprazlamaları, mutasyon ve adaptasyon',
    difficulty: 'Orta',
    questions: [
      {
        id: 'sc2-q1',
        topicTag: 'Genetik Yapılar Sıralaması',
        question: 'Hücre çekirdeğindeki kalıtsal yapıların karmaşıktan basite (büyükten küçüğe) doğru sıralanışı hangisidir?',
        options: [
          'Nükleotid > Gen > DNA > Kromozom',
          'Kromozom > DNA > Gen > Nükleotid',
          'DNA > Kromozom > Nükleotid > Gen',
          'Gen > DNA > Kromozom > Nükleotid',
        ],
        correctIndex: 1,
        explanation:
          'Büyükten küçüğe doğru “KeDiGeN” şifresiyle hatırlanır: Kromozom > DNA > Gen > Nükleotid.',
      },
      {
        id: 'sc2-q2',
        topicTag: 'DNA Eşleşmesi',
        question: 'Bir DNA molekülünün tek zincirinde baz dizilimi “A – G – T – C – A – C” ise karşı zincirdeki eşleşen dizilim hangisidir?',
        options: [
          'T – C – A – G – T – G',
          'A – G – T – C – A – C',
          'C – T – G – A – C – A',
          'G – A – C – T – G – T',
        ],
        correctIndex: 0,
        explanation:
          'DNA’da daima Adenin (A) karşısına Timin (T), Guanin (G) karşısına Sitozin (C) gelir. Bu yüzden A-G-T-C-A-C karşısı T-C-A-G-T-G olur.',
      },
      {
        id: 'sc2-q3',
        topicTag: 'Nükleotid Yapısı',
        question: 'Bir nükleotidin yapısında aşağıdaki moleküllerden hangisi KESİNLİKLE birlikte bulunur?',
        options: [
          'Fosfat + Deoksiriboz Şekeri + Organik Baz',
          'Protein + Yağ + Su',
          'Klorofil + Glikoz + Oksijen',
          'Yalnızca Adenin ve Timin bazları',
        ],
        correctIndex: 0,
        explanation:
          'Her DNA nükleotidi 1 fosfat, 1 beş karbonlu deoksiriboz şekeri ve 1 organik bazdan (A, T, G veya C) oluşur; nükleotid adını içerdiği organik bazdan alır.',
      },
      {
        id: 'sc2-q4',
        topicTag: 'Mendel Çaprazlaması',
        question: 'İki melez uzun boylu bezelyenin (Uu × Uu) çaprazlanması sonucu kısa boylu (uu) bezelye oluşma olasılığı yüzde kaçtır?',
        options: ['%0', '%25', '%50', '%75'],
        correctIndex: 1,
        explanation:
          'Uu × Uu çaprazlamasından UU, Uu, Uu, uu genotipleri oluşur. 4 ihtimalden yalnızca 1’i (uu) kısa boylu olduğu için olasılık %25’tir.',
      },
      {
        id: 'sc2-q5',
        topicTag: 'Mendel Çaprazlaması',
        question: 'Saf döl sarı tohumlu (SS) ile saf döl yeşil tohumlu (ss) bezelye çaprazlandığında 1. kuşakta oluşan tüm bezelyelerin genotipi ve fenotipi ne olur?',
        options: [
          '%50 SS, %50 ss – Yarısı sarı yarısı yeşil',
          '%100 Ss – Tamamı sarı tohumlu',
          '%100 ss – Tamamı yeşil tohumlu',
          '%75 Sarı, %25 Yeşil tohumlu',
        ],
        correctIndex: 1,
        explanation:
          'SS × ss çaprazlamasında her yavru bir ebeveynden S, diğerinden s alır. Tamamı %100 melez (Ss) ve baskın özellik olan sarı tohumlu olur.',
      },
      {
        id: 'sc2-q6',
        topicTag: 'Mutasyon ve Modifikasyon',
        question: 'Çuha çiçeğinin 15–20 °C’de kırmızı, 30–35 °C’de beyaz çiçek açması ancak tohumlarının eski sıcaklığa alınınca tekrar kırmızı açması neye örnektir?',
        options: ['Kalıtsal mutasyon', 'Modifikasyon', 'Doğal seçilim', 'Yapay seçilim'],
        correctIndex: 1,
        explanation:
          'Çevre etkisiyle genlerin yapısı değil yalnızca işleyişi değişir ve bu değişim kalıtsal değildir. Bu olaya modifikasyon denir.',
      },
      {
        id: 'sc2-q7',
        topicTag: 'Mutasyon',
        question: 'Aşağıdakilerden hangisi DNA’nın yapısında meydana gelen bir MUTASYON örneğidir?',
        options: [
          'Spor yapan kişinin kaslarının gelişmesi',
          'Güneşte kalan insanın teninin bronzlaşması',
          'Van kedisinin bir gözünün mavi, bir gözünün kehribar olması',
          'Arı larvalarının beslenme türüne göre kraliçe veya işçi arı olması',
        ],
        correctIndex: 2,
        explanation:
          'Van kedisinin farklı göz renkleri, altı parmaklılık, albinoluk ve orak hücreli anemi gen yapısındaki değişimlere (mutasyon) örnektir.',
      },
      {
        id: 'sc2-q8',
        topicTag: 'Adaptasyon',
        question: 'Kutup ayılarının beyaz kürklü, kalın yağ tabakalı ve geniş tabanlı olması aşağıdakilerden hangisinin sonucudur?',
        options: ['Modifikasyon', 'Adaptasyon (Çevreye uyum)', 'Hızlı kimyasal tepkime', 'Yapay gübreleme'],
        correctIndex: 1,
        explanation:
          'Canlıların yaşadığı ortamda hayatta kalma ve üreme şansını artıran kalıtsal özelliklere adaptasyon denir.',
      },
      {
        id: 'sc2-q9',
        topicTag: 'DNA Kendini Eşleme',
        question: 'Toplam 1200 nükleotid içeren bir DNA molekülünde 350 tane Adenin (A) varsa, bu DNA’da kaç tane Guanin (G) nükleotidi bulunur?',
        options: ['350', '250', '500', '700'],
        correctIndex: 1,
        explanation:
          'A = T = 350 olduğuna göre A + T = 700’dür. Geriye 1200 - 700 = 500 nükleotid kalır. G = C olduğu için Guanin sayısı 500 / 2 = 250 olur.',
      },
      {
        id: 'sc2-q10',
        topicTag: 'Biyoteknoloji',
        question: 'Bakterilere gen aktarımı yapılarak şeker hastaları için insülin hormonu üretilmesi hangi bilimsel uygulama alanına girer?',
        options: ['Jeoloji', 'Biyoteknoloji ve Genetik Mühendisliği', 'Astronomi', 'Optik Fizik'],
        correctIndex: 1,
        explanation:
          'Canlı hücrelere istenilen genin aktarılması genetik mühendisliği; bu yöntemle tıbbi ürün (insülin, aşı) üretilmesi ise biyoteknoloji uygulamasıdır.',
      },
    ],
  },
  {
    id: 'sci-test-3',
    testNumber: 3,
    title: 'Basınç ve Basit Makineler',
    subtitle: 'Katı–sıvı–gaz basıncı, Pascal Prensibi, kaldıraç, makara ve eğik düzlem',
    difficulty: 'LGS Düzeyi',
    questions: [
      {
        id: 'sc3-q1',
        topicTag: 'Katı Basıncı',
        question: 'Ağırlığı 60 N ve taban yüzey alanı 3 m² olan bir küpün zemine uyguladığı katı basıncı kaç Pascal’dır?',
        options: ['180 Pa', '20 Pa', '63 Pa', '15 Pa'],
        correctIndex: 1,
        explanation:
          'Katı basıncı P = G / S (Ağırlık / Yüzey Alanı) formülüyle hesaplanır. P = 60 / 3 = 20 Pa olur.',
      },
      {
        id: 'sc3-q2',
        topicTag: 'Katı Basıncı Günlük Yaşam',
        question: 'İş makinelerinde palet kullanılması ve kar ayakkabılarının geniş tabanlı yapılması hangi amaca yöneliktir?',
        options: [
          'Yüzey alanını küçültüp basıncı artırmak',
          'Yüzey alanını büyüterek zemine uygulanan basıncı azaltmak',
          'Aracın kütlesini sıfırlamak',
          'Sıvı basıncını artırmak',
        ],
        correctIndex: 1,
        explanation:
          'Katı basıncı yüzey alanı ile ters orantılıdır. Yüzey alanı arttıkça basınç azalır ve kar/çamurda batma önlenir.',
      },
      {
        id: 'sc3-q3',
        topicTag: 'Sıvı Basıncı',
        question: 'Durgun bir sıvının kabın tabanına uyguladığı sıvı basıncı hangi iki büyüklüğe bağlıdır?',
        options: [
          'Kabın şekline ve sıvı hacmine',
          'Sıvının derinliğine (h) ve sıvının yoğunluğuna (d)',
          'Yalnızca kabın taban alanına',
          'Sıvının rengine ve kütlesine',
        ],
        correctIndex: 1,
        explanation:
          'Sıvı basıncı P = h · d · g formülüne göre sıvının derinliğine ve yoğunluğuna bağlıdır; kabın genişliğine veya şekline bağlı değildir.',
      },
      {
        id: 'sc3-q4',
        topicTag: 'Pascal Prensibi',
        question: 'Berber koltukları, hidrolik fren sistemleri ve itfaiye merdivenleri hangi fizik ilkesine göre çalışır?',
        options: [
          'Pascal Prensibi (Sıvıların basıncı her yöne aynen iletmesi)',
          'Kütlenin Korunumu Yasası',
          'Işığın Kırılması Yasası',
          'Ohm Yasası',
        ],
        correctIndex: 0,
        explanation:
          'Kapalı kaptaki sıvılar sıkıştırılamaz ve üzerlerine uygulanan basıncı kabın her noktasına dik ve aynen iletir (Pascal Prensibi).',
      },
      {
        id: 'sc3-q5',
        topicTag: 'Açık Hava Basıncı',
        question: 'Torricelli’nin deniz seviyesinde 0 °C’de yaptığı barometre deneyinde cıva yüksekliği 76 cm ölçülmüştür. Aynı deney yüksek bir dağın zirvesinde yapılsaydı ne olurdu?',
        options: [
          'Cıva seviyesi 76 cm’den daha yüksek çıkardı.',
          'Açık hava basıncı azaldığı için cıva seviyesi 76 cm’nin altına düşerdi.',
          'Cıva seviyesi hiç değişmezdi.',
          'Boru içindeki cıva tamamen donardı.',
        ],
        correctIndex: 1,
        explanation:
          'Deniz seviyesinden yukarılara çıkıldıkça atmosfer tabakasının kalınlığı ve açık hava basıncı azalır; bu nedenle borudaki cıva yüksekliği 76 cm’den küçük olur.',
      },
      {
        id: 'sc3-q6',
        topicTag: 'Basit Makineler Temel İlke',
        question: 'Sürtünmelerin ihmal edildiği TÜM basit makineler için aşağıdakilerden hangisi kesinlikle doğrudur?',
        options: [
          'Hepsi enerjiden kazanç sağlar.',
          'Hiçbir basit makine işten veya enerjiden kazanç sağlamaz; yalnızca iş yapma kolaylığı sunar.',
          'Hepsi kuvvetten kazanç sağlar.',
          'Yoldan kazanç sağlarken aynı anda kuvvetten de kazanç sağlar.',
        ],
        correctIndex: 1,
        explanation:
          'Basit makinelerde işten ve enerjiden asla kazanç sağlanmaz. Kuvvetten ne oranda kazanç varsa yoldan aynı oranda kayıp olur.',
      },
      {
        id: 'sc3-q7',
        topicTag: 'Kaldıraç Hesabı',
        question: 'Ağırlığı önemsiz bir kaldıraçta 80 N’luk yük desteğe 2 m uzaklıktadır. Desteğin diğer tarafında 4 m uzaklıktan uygulanan dengeleyici kuvvet kaç N olmalıdır?',
        options: ['160 N', '80 N', '40 N', '20 N'],
        correctIndex: 2,
        explanation:
          'Kaldıraç denge eşitliği: Yük × Yük Kolu = Kuvvet × Kuvvet Kolu → 80 × 2 = F × 4 → 160 = 4F → F = 40 N (2 kat kuvvet kazancı!).',
      },
      {
        id: 'sc3-q8',
        topicTag: 'Makaralar',
        question: 'Sürtünmesiz ve ağırlıksız TEK bir hareketli makara ile 100 N’luk yükü 2 metre yukarı kaldırmak için uygulanan kuvvet ve çekilen ip uzunluğu nedir?',
        options: [
          '100 N kuvvet, 2 m ip',
          '50 N kuvvet, 4 m ip',
          '50 N kuvvet, 1 m ip',
          '200 N kuvvet, 4 m ip',
        ],
        correctIndex: 1,
        explanation:
          'Tek hareketli makara 2 kat kuvvet kazancı sağlar (F = 100 / 2 = 50 N), ancak yoldan 2 kat kayıp olduğu için ip 2 × 2 = 4 m çekilmelidir.',
      },
      {
        id: 'sc3-q9',
        topicTag: 'Kaldıraç Türleri',
        question: 'Aşağıdaki günlük araçlardan hangisi yükün ortada olduğu ve DAİMA kuvvetten kazanç sağlayan kaldıraca örnektir?',
        options: ['Maşa', 'Cımbız', 'El arabası', 'Olta kamışı'],
        correctIndex: 2,
        explanation:
          'El arabası ve ceviz kıracağında yük, destek ile kuvvet arasındadır; kuvvet kolu her zaman yük kolundan uzun olduğu için daima kuvvetten kazanç vardır.',
      },
      {
        id: 'sc3-q10',
        topicTag: 'Eğik Düzlem',
        question: 'Bir kamyona ağır bir sandığı çıkaran işçi, kullandığı rampanın (eğik düzlemin) uzunluğunu artırıp yüksekliğini sabit tutarsa ne değişir?',
        options: [
          'Uygulaması gereken kuvvet azalır, kuvvet kazancı artar.',
          'Uygulaması gereken kuvvet artar.',
          'Yapılan iş miktarı yarıya iner.',
          'Sandığın ağırlığı azalır.',
        ],
        correctIndex: 0,
        explanation:
          'Eğik düzlemde kuvvet kazancı L / h (Boy / Yükseklik) oranına eşittir. Rampanın boyu uzadıkça eğim azalır ve daha küçük kuvvetle çıkılır.',
      },
    ],
  },
  {
    id: 'sci-test-4',
    testNumber: 4,
    title: 'Periyodik Sistem, Kimyasal Tepkimeler ve Asit-Baz',
    subtitle: 'Element sınıfları, fiziksel–kimyasal değişim, pH ölçeği ve öz ısı',
    difficulty: 'Orta',
    questions: [
      {
        id: 'sc4-q1',
        topicTag: 'Periyodik Sistem',
        question: 'Modern periyodik sistemde elementler hangi özelliğe göre artan sırayla dizilmiştir?',
        options: [
          'Kütle numaralarına göre',
          'Atom numaralarına (proton sayılarına) göre',
          'Alfabetik sıraya göre',
          'Nötron sayılarına göre',
        ],
        correctIndex: 1,
        explanation:
          'Henry Moseley’in çalışmasıyla modern periyodik sistemde elementler artan atom numaralarına (proton sayılarına) göre sıralanır.',
      },
      {
        id: 'sc4-q2',
        topicTag: 'Element Sınıfları',
        question: 'Atom numarası 1 olan Hidrojen (H) için aşağıdakilerden hangisi doğrudur?',
        options: [
          '1A grubunda yer alan bir metaldir.',
          '1A grubunda yer alan bir ametaldir.',
          '8A grubunda yer alan bir soygazdır.',
          'Oda sıcaklığında katı hâldedir.',
        ],
        correctIndex: 1,
        explanation:
          'Hidrojen (H), 1. periyot 1A grubunda bulunmasına rağmen metal değil AMETAL olan çok önemli bir istisnadır.',
      },
      {
        id: 'sc4-q3',
        topicTag: 'Katman Elektron Dizilimi',
        question: 'Nötr hâlde katman elektron dizilimi “2 – 8 – 6” olan bir element periyodik tablonun hangi periyot ve grubundadır?',
        options: [
          '2. Periyot, 6A Grubu',
          '3. Periyot, 6A Grubu',
          '6. Periyot, 3A Grubu',
          '3. Periyot, 2A Grubu',
        ],
        correctIndex: 1,
        explanation:
          'Katman sayısı periyodu (3 katman → 3. periyot), son katmandaki elektron sayısı ise A grubunu (6 → 6A grubu) verir. Bu element Kükürt’tür (S).',
      },
      {
        id: 'sc4-q4',
        topicTag: 'Fiziksel ve Kimyasal Değişim',
        question: 'Aşağıdaki olaylardan hangisi maddenin iç yapısını değiştiren bir KİMYASAL değişimdir?',
        options: [
          'Buzun eriyerek suya dönüşmesi',
          'Şekerin çay içinde çözünmesi',
          'Demirin nemli havada paslanması',
          'Cam bardağın kırılması',
        ],
        correctIndex: 2,
        explanation:
          'Paslanma (oksitlenme), yanma, ekşime ve pişme yeni maddeler oluşturduğu için kimyasal değişimdir; erime, çözünme ve kırılma fizikseldir.',
      },
      {
        id: 'sc4-q5',
        topicTag: 'Kütlenin Korunumu',
        question: 'Kapalı bir kapta 16 g Metan (CH₄) ile 64 g Oksijen (O₂) tamamen tepkimeye girerek 44 g Karbondioksit (CO₂) ve bir miktar Su (H₂O) oluşturuyor. Oluşan su kaç gramdır?',
        options: ['18 g', '28 g', '36 g', '48 g'],
        correctIndex: 2,
        explanation:
          'Kimyasal tepkimelerde toplam kütle korunur: Girenler = 16 + 64 = 80 g. Ürünler = 44 + Su = 80 → Su = 80 - 44 = 36 g.',
      },
      {
        id: 'sc4-q6',
        topicTag: 'Asit ve Baz Belirteçleri',
        question: 'Sulu çözeltisine mavi turnusol kâğıdı batırıldığında kâğıdı KIRMIZIYA çeviren ve sulu çözeltisine H⁺ iyonu veren madde hangisi olabilir?',
        options: ['Sabunlu su', 'Limon suyu', 'Çamaşır suyu', 'Diş macunu'],
        correctIndex: 1,
        explanation:
          'Asitler sulu çözeltilerine H⁺ iyonu verir ve mavi turnusol kâğıdını kırmızıya çevirir. Limon suyu sitrik asit içerir.',
      },
      {
        id: 'sc4-q7',
        topicTag: 'pH Ölçeği',
        question: 'pH değeri 11 olan bir çözelti için aşağıdakilerden hangisi doğrudur?',
        options: [
          'Kuvvetli asittir ve tadı ekşidir.',
          'Nötrdür ve turnusol rengini değiştirmez.',
          'Baziktir, ele kayganlık hissi verir ve kırmızı turnusolu maviye çevirir.',
          'Mermer yüzeyleri aşındırır.',
        ],
        correctIndex: 2,
        explanation:
          'pH > 7 olan çözeltiler baziktir. Bazlar ele kayganlık hissi verir, fenolftalein ile pembe renk oluşturur ve kırmızı turnusolu maviye çevirir.',
      },
      {
        id: 'sc4-q8',
        topicTag: 'Asit Yağmurları',
        question: 'Fosil yakıtların yanmasıyla atmosfere salınan hangi gazlar su buharıyla birleşerek asit yağmurlarına yol açar?',
        options: [
          'Helyum (He) ve Neon (Ne)',
          'Kükürt dioksit (SO₂), Azot dioksit (NO₂) ve Karbondioksit (CO₂)',
          'Yalnızca Oksijen (O₂)',
          'Yalnızca Su buharı (H₂O)',
        ],
        correctIndex: 1,
        explanation:
          'Fabrika bacaları ve araç egzozlarından çıkan SO₂, NO₂ ve CO₂ gazları bulutlardaki suyla tepkimeye girerek sülfürik, nitrik ve karbonik asit yağmurlarını oluşturur.',
      },
      {
        id: 'sc4-q9',
        topicTag: 'Öz Isı',
        question: 'Eşit kütleli su (öz ısısı büyük) ve zeytinyağı (öz ısısı küçük) özdeş ısıtıcılarla 5 dakika ısıtılırsa hangisinin sıcaklık artışı daha fazla olur?',
        options: [
          'Suyun sıcaklığı daha fazla artar.',
          'Zeytinyağının sıcaklığı daha fazla artar.',
          'İkisinin de sıcaklığı aynı miktarda artar.',
          'Hiçbirinin sıcaklığı değişmez.',
        ],
        correctIndex: 1,
        explanation:
          'Öz ısısı küçük olan maddeler aynı ısıyı aldıklarında daha çabuk ısınır ve daha çabuk soğur; bu nedenle zeytinyağının sıcaklığı sudan çok yükselir.',
      },
      {
        id: 'sc4-q10',
        topicTag: 'Soygazlar',
        question: 'Helyum (He), Neon (Ne) ve Argon (Ar) elementlerinin ortak özelliği nedir?',
        options: [
          'Elektriği çok iyi ileten katı metallerdir.',
          '8A grubunda yer alan, kararlı yapıdaki oda sıcaklığında gaz hâlindeki soygazlardır.',
          'Suyla şiddetli patlama tepkimesi verirler.',
          'Hepsi 1. periyotta bulunur.',
        ],
        correctIndex: 1,
        explanation:
          'He, Ne ve Ar periyodik sistemin en sağındaki 8A (Soygazlar) grubundadır; son katmanları dolu olduğu için bileşik oluşturmaya yatkın değillerdir.',
      },
    ],
  },
  {
    id: 'sci-test-5',
    testNumber: 5,
    title: 'Enerji Dönüşümleri ve Elektrik Devreleri',
    subtitle: 'Besin zinciri, fotosentez–solunum, elektriklenme ve Ohm Yasası devreleri',
    difficulty: 'LGS Düzeyi',
    questions: [
      {
        id: 'sc5-q1',
        topicTag: 'Fotosentez',
        question: 'Yeşil bitkilerin fotosentez yapabilmesi için dışarıdan alıp kullandığı maddeler ve ürettiği ürünler hangi seçenekte doğru eşleştirilmiştir?',
        options: [
          'Kullanılan: Oksijen + Besin → Üretilen: Karbondioksit + Su',
          'Kullanılan: Karbondioksit + Su → Üretilen: Besin (Glikoz) + Oksijen',
          'Kullanılan: Azot + Oksijen → Üretilen: Tuz + Su',
          'Kullanılan: Glikoz + Su → Üretilen: Karbondioksit + Enerji',
        ],
        correctIndex: 1,
        explanation:
          'Fotosentezde klorofil taşıyan canlılar ışık enerjisiyle CO₂ ve H₂O kullanarak Besin (glikoz) ve O₂ üretir.',
      },
      {
        id: 'sc5-q2',
        topicTag: 'Fotosentez Hızı ve Işık Rengi',
        question: 'Özdeş su bitkilerine eşit şiddette farklı renklerde ışık gönderildiğinde fotosentez hızı hangi renkte EN YAVAŞ gerçekleşir?',
        options: ['Mor ışık', 'Kırmızı ışık', 'Yeşil ışık', 'Mavi ışık'],
        correctIndex: 2,
        explanation:
          'Klorofil yeşil ışığın büyük bölümünü soğurmayıp yansıttığı için (bitkiler bu yüzden yeşil görünür) fotosentez hızı yeşil ışıkta en düşüktür; mor ve kırmızı ışıkta en yüksektir.',
      },
      {
        id: 'sc5-q3',
        topicTag: 'Besin Piramidi',
        question: 'Bir ekoloji piramidinde üreticilerden son tüketicilere doğru (aşağıdan yukarıya) çıkıldıkça aşağıdakilerden hangisi ARTAR?',
        options: [
          'Aktarılan enerji miktarı',
          'Toplam biyokütle',
          'Birey sayısı',
          'Dokulardaki biyolojik birikim (zehirli madde oranı)',
        ],
        correctIndex: 3,
        explanation:
          'Besin piramidinde yukarı çıkıldıkça aktarılan enerji (%10 kuralı), biyokütle ve genellikle birey sayısı azalır; buna karşın dokulardaki zehirli madde (biyolojik birikim) artar.',
      },
      {
        id: 'sc5-q4',
        topicTag: 'Hücresel Solunum',
        question: 'Canlı hücrelerin oksijenli solunumla ATP enerjisi ürettiği temel organel hangisidir?',
        options: ['Kloroplast', 'Mitokondri', 'Koful', 'Sentrozom'],
        correctIndex: 1,
        explanation:
          'Mitokondri, besin (glikoz) ve oksijeni kullanarak hücrenin enerji santrali gibi ATP ürettiği organeldir. Fotosentez ise kloroplastta yapılır.',
      },
      {
        id: 'sc5-q5',
        topicTag: 'Elektrik Yükleri',
        question: 'Nötr bir ebonit (plastik) çubuk yün kumaşa sürtüldüğünde yük geçişi nasıl gerçekleşir?',
        options: [
          'Yün kumaştan ebonit çubuğa negatif (-) yükler (elektronlar) geçer; ebonit (-) yüklenir.',
          'Ebonit çubuktan yün kumaşa pozitif (+) protonlar geçer.',
          'Her ikisi de aynı cins yükle yüklenir.',
          'Hiçbir yük alışverişi olmaz.',
        ],
        correctIndex: 0,
        explanation:
          'Katılarda yalnızca elektronlar (-) hareket eder. Sürtünmede yün kumaş elektron verir (+), ebonit çubuk elektron alır (-) yüklenir.',
      },
      {
        id: 'sc5-q6',
        topicTag: 'Topraklama',
        question: 'Negatif (-) yüklü iletken bir küre topraklama kablosuyla toprağa bağlanırsa ne gerçekleşir?',
        options: [
          'Topraktan küreye proton geçer.',
          'Kürenin üzerindeki fazla elektronlar toprağa akar ve küre nötrlenir.',
          'Küre daha fazla negatif yük kazanır.',
          'Küre pozitif yüklü kalır.',
        ],
        correctIndex: 1,
        explanation:
          'Topraklama, yüklü cisimlerin nötr hâle gelmesini sağlar. Negatif yüklü cisimdeki fazla (-) yükler toprağa geçerek cisim nötr olur.',
      },
      {
        id: 'sc5-q7',
        topicTag: 'Ohm Yasası',
        question: 'Gerilimi 12 Volt olan bir pilin bağlı olduğu basit devrede direnç 4 Ohm ise devreden geçen akım şiddeti kaç Amper’dir?',
        options: ['48 A', '16 A', '3 A', '0,33 A'],
        correctIndex: 2,
        explanation:
          'Ohm Yasası: V = I · R → I = V / R = 12 / 4 = 3 Amper olur.',
      },
      {
        id: 'sc5-q8',
        topicTag: 'Seri ve Paralel Devreler',
        question: 'Özdeş bir pile iki özdeş ampul önce SERİ, sonra PARALEL bağlanıyor. Paralel devredeki ampullerin parlaklığı seri devreye göre nasıldır?',
        options: [
          'Daha parlak yanarlar ve biri patlasa da diğeri yanmaya devam eder.',
          'Daha sönük yanarlar ve biri patlarsa diğeri de söner.',
          'İki devrede parlaklık tamamen aynıdır.',
          'Paralel devrede ampuller hiç ışık vermez.',
        ],
        correctIndex: 0,
        explanation:
          'Paralel bağlı devrede her ampul pilin tam gerilimini (V) doğrudan alır, bu yüzden seri bağlamaya göre daha parlak yanar ve bir kol kesilse de diğer kol çalışır.',
      },
      {
        id: 'sc5-q9',
        topicTag: 'Elektrik Enerjisi Dönüşümü',
        question: 'Elektrikli ütü, su ısıtıcısı (kettle) ve elektrikli soba gibi araçlarda elektrik enerjisi temel olarak hangi enerji türüne dönüşür?',
        options: ['Hareket enerjisi', 'Isı enerjisi', 'Kimyasal enerji', 'Ses enerjisi'],
        correctIndex: 1,
        explanation:
          'Yüksek dirençli rezistans tellerinden akım geçtiğinde elektrik enerjisi doğrudan ısı enerjisine dönüşür.',
      },
      {
        id: 'sc5-q10',
        topicTag: 'Madde Döngüleri',
        question: 'Atmosferdeki serbest azotun (N₂) toprağa bağlanmasında ve canlıların kullanımına sunulmasında aşağıdakilerden hangileri görev alır?',
        options: [
          'Yalnızca insanlar',
          'Yıldırım/şimşek olayları ve baklagil köklerindeki azot bağlayıcı bakteriler',
          'Sadece güneş ışınları',
          'Kutup buzulları',
        ],
        correctIndex: 1,
        explanation:
          'Azot döngüsünde atmosferdeki azot gazı yıldırım/şimşek ve baklagillerin kök yumrularındaki azot bağlayıcı bakteriler sayesinde toprağa azotlu bileşikler olarak kazandırılır.',
      },
    ],
  },
];
