export interface CampaignWaypoint {
  label: string;
  date: string;
  x: number;
  y: number;
  note: string;
}

export interface MilitaryCampaign {
  id: string;
  name: string;
  year: string;
  era: string;
  winnerSide: string;
  winnerCommander: string;
  defeatedSide: string;
  defeatedCommander: string;
  battleType: 'Kara Meydan Savaşı' | 'Kuşatma ve Fetih' | 'Deniz Savaşı' | 'Büyük Sefer';
  tactics: string;
  turningPoint: string;
  consequences: string[];
  waypoints: CampaignWaypoint[];
}

export interface SultanBattleOutcome {
  battle: string;
  year: string;
  opponent: string;
  result: 'Galip' | 'Mağlup' | 'Berabere / Antlaşma';
  note: string;
}

export interface SultanProfile {
  id: string;
  name: string;
  reign: string;
  period: 'Kuruluş' | 'Yükselme' | 'Duraklama & Yenileşme';
  mahlas: string;
  hiddenTalents: string[];
  talentStory: string;
  poemTitle: string;
  poemOriginal: string;
  poemModernTurkish: string;
  battles: SultanBattleOutcome[];
}

export interface HistoryWisdomItem {
  id: string;
  title: string;
  category: 'İlginç Anekdot' | 'Hikmetli Hikâye' | 'Tarihî Hiciv & Nükte';
  era: string;
  figures: string;
  content: string;
  lesson: string;
}

export const MILITARY_CAMPAIGNS: MilitaryCampaign[] = [
  {
    id: 'malazgirt-1071',
    name: 'Malazgirt Meydan Muharebesi',
    year: '26 Ağustos 1071',
    era: 'Büyük Selçuklu Devleti',
    winnerSide: 'Büyük Selçuklu Devleti',
    winnerCommander: 'Sultan Alparslan',
    defeatedSide: 'Bizans İmparatorluğu',
    defeatedCommander: 'İmparator IV. Romen Diyojen',
    battleType: 'Kara Meydan Savaşı',
    tactics: 'Turan (Hilal / Sahte Ricat) Taktiği — Merkez birliklerin kontrollü geri çekilmesiyle düşmanı kanatlardan çembere alma.',
    turningPoint: 'Bizans ordusundaki Peçenek ve Uz Türklerinin Selçuklu safına geçmesi ve hilal kapanının tamamlanması.',
    consequences: [
      'Anadolu’nun kapıları Türklere kesin olarak açıldı.',
      'Anadolu’da ilk Türk beylikleri (Saltuklular, Mengücekliler, Danişmentliler, Artuklular) kuruldu.',
      'Türkiye tarihinin Anadolu devri başladı.',
    ],
    waypoints: [
      { label: 'Halep / Suriye', date: 'Bahar 1071', x: 525, y: 245, note: 'Sultan Alparslan, Bizans ordusunun yürüyüş haberini alınca hızla kuzeye yöneldi.' },
      { label: 'Diyarbakır / Ahlat', date: 'Ağustos 1071', x: 545, y: 222, note: 'Selçuklu süvarileri Ahlat bölgesinde toplanarak ovaya yerleşti.' },
      { label: 'Malazgirt Ovası (Muş)', date: '26 Ağustos 1071', x: 562, y: 205, note: 'Beyaz kefenini giyen Sultan Alparslan Cuma namazından sonra Hilal taktiğiyle zaferi kazandı.' },
    ],
  },
  {
    id: 'istanbul-1453',
    name: 'İstanbul’un Fethi Kuşatması',
    year: '6 Nisan – 29 Mayıs 1453',
    era: 'Osmanlı Yükselme Dönemi',
    winnerSide: 'Osmanlı Devleti',
    winnerCommander: 'Fatih Sultan Mehmet (II. Mehmed)',
    defeatedSide: 'Doğu Roma (Bizans) İmparatorluğu',
    defeatedCommander: 'İmparator XI. Konstantinos',
    battleType: 'Kuşatma ve Fetih',
    tactics: 'Şahi adı verilen dev topların dökülmesi, Rumeli Hisarı ile boğaz kontrolü ve 72 parça geminin kızaklarla karadan Haliç’e indirilmesi.',
    turningPoint: '21–22 Nisan gecesi Osmanlı donanmasının Tophane–Kasımpaşa hattından karadan yürütülerek Haliç’e indirilmesi.',
    consequences: [
      'Orta Çağ kapandı, Yeni Çağ başladı.',
      'Osmanlı Devleti’nin Anadolu ve Rumeli toprakları bütünleşti; İstanbul başkent oldu.',
      'İpek Yolu’nun önemli kolları Osmanlı kontrolüne geçti, Coğrafi Keşifler hızlandı.',
    ],
    waypoints: [
      { label: 'Edirne (Hazırlık & Top Dökümü)', date: 'Mart 1453', x: 432, y: 186, note: 'Şahi topları Edirne’de dökülüp yüzlerce öküzle yola çıkarıldı.' },
      { label: 'Rumeli Hisarı (Boğazkesen)', date: 'Nisan 1453', x: 454, y: 192, note: 'Karadeniz’den Bizans’a gelebilecek yardımlar kesildi.' },
      { label: 'İstanbul Surları ve Haliç', date: '29 Mayıs 1453', x: 462, y: 196, note: '53 günlük kuşatmanın ardından Ulubatlı Hasan’ın sancağı surlara dikmesiyle fetih tamamlandı.' },
    ],
  },
  {
    id: 'misir-1517',
    name: 'Büyük Mısır Seferi (Mercidâbık & Ridâniye)',
    year: '1516 – 1517',
    era: 'Osmanlı Yükselme Dönemi',
    winnerSide: 'Osmanlı Devleti',
    winnerCommander: 'Yavuz Sultan Selim (I. Selim)',
    defeatedSide: 'Memlük Devleti',
    defeatedCommander: 'Kansu Gavri & Tomanbay',
    battleType: 'Büyük Sefer',
    tactics: 'Sina Çölü’nün yalnızca 13 günde geçilmesi ve El-Mukattam Dağı’nın etrafından dolaşılarak Memlük topçusunun arkasına sarkılması.',
    turningPoint: 'Sina Çölü geçişi sırasında yağan bereketli yağmur ve Ridâniye’de Osmanlı topçusunun üstün manevra kabiliyeti.',
    consequences: [
      'Suriye, Filistin, Mısır ve Hicaz Osmanlı topraklarına katıldı.',
      'Baharat Yolu Osmanlı denetimine geçti, hazine tam doluluğa ulaştı.',
      'Halifelik makamı ve Kutsal Emanetler İstanbul’a taşındı.',
    ],
    waypoints: [
      { label: 'İstanbul (Hareket)', date: 'Haziran 1516', x: 462, y: 196, note: 'Yavuz Sultan Selim büyük orduyla Anadolu üzerinden güneye ilerledi.' },
      { label: 'Mercidâbık (Halep Kuzeyi)', date: '24 Ağustos 1516', x: 525, y: 244, note: 'İlk büyük meydan savaşında Memlük ordusu yenildi, Suriye alındı.' },
      { label: 'Sina Çölü Geçişi', date: 'Ocak 1517', x: 498, y: 278, note: 'Ordunun imkânsız görülen çölü 13 günde geçmesi tarihî bir lojistik başarısı oldu.' },
      { label: 'Ridâniye / Kahire', date: '22 Ocak 1517', x: 478, y: 288, note: 'Memlük Devleti sona erdi, Mısır Osmanlı eyaleti oldu.' },
    ],
  },
  {
    id: 'mohac-1526',
    name: 'Mohaç Meydan Muharebesi',
    year: '29 Ağustos 1526',
    era: 'Osmanlı Yükselme Dönemi',
    winnerSide: 'Osmanlı Devleti',
    winnerCommander: 'Kanuni Sultan Süleyman',
    defeatedSide: 'Macar Krallığı ve Müttefikleri',
    defeatedCommander: 'Macar Kralı II. Lajos',
    battleType: 'Kara Meydan Savaşı',
    tactics: 'Öncü birliklerin geri çekilerek ağır zırhlı Macar şövalyelerini 300 topun kurulu olduğu gizli ateş hattına çekmesi.',
    turningPoint: 'Osmanlı topçu bataryalarının ve yeniçeri tüfekçilerinin eş zamanlı ateşiyle savaşın yalnızca 2 saatte sonuçlanması.',
    consequences: [
      'Dünya tarihinin en kısa süren büyük meydan savaşlarından biri (yaklaşık 2 saat) kazanıldı.',
      'Macaristan Osmanlı egemenliğine girdi ve Orta Avrupa kapıları açıldı.',
    ],
    waypoints: [
      { label: 'İstanbul', date: 'Nisan 1526', x: 462, y: 196, note: 'Kanuni Sultan Süleyman Orta Avrupa seferine çıktı.' },
      { label: 'Belgrad', date: 'Temmuz 1526', x: 405, y: 168, note: 'Tuna ve Sava nehirleri üzerinden ikmal sağlandı.' },
      { label: 'Mohaç Ovası (Macaristan)', date: '29 Ağustos 1526', x: 386, y: 152, note: '2 saatte kazanılan kesin zaferle Macaristan fethedildi.' },
    ],
  },
  {
    id: 'preveze-1538',
    name: 'Preveze Deniz Zaferi',
    year: '28 Eylül 1538',
    era: 'Osmanlı Yükselme Dönemi',
    winnerSide: 'Osmanlı Donanması',
    winnerCommander: 'Barbaros Hayreddin Paşa',
    defeatedSide: 'Kutsal İttifak Haçlı Donanması',
    defeatedCommander: 'Amiral Andrea Doria',
    battleType: 'Deniz Savaşı',
    tactics: 'Rüzgârın durduğu anda kürekli çevik Osmanlı kadırgalarıyla dev yelkenli kalyonları çevirip bölme.',
    turningPoint: 'Barbaros’un 122 gemilik hilal düzeniyle kendisinden sayıca çok üstün Haçlı donanmasını dağıtarak geri çekilmeye zorlaması.',
    consequences: [
      'Akdeniz kesin olarak bir Türk gölü hâline geldi.',
      '28 Eylül günü bugün hâlâ Türk Deniz Kuvvetleri Günü olarak kutlanmaktadır.',
    ],
    waypoints: [
      { label: 'İstanbul Tersanesi', date: 'Haziran 1538', x: 462, y: 196, note: 'Kaptan-ı Derya Barbaros Hayreddin Paşa Ege’ye açıldı.' },
      { label: 'Girit / Ege Adaları', date: 'Ağustos 1538', x: 435, y: 228, note: 'Venedik üslerine karşı deniz hâkimiyeti kuruldu.' },
      { label: 'Preveze Açıkları (Yunanistan Batısı)', date: '28 Eylül 1538', x: 402, y: 214, note: 'Andrea Doria komutasındaki Haçlı donanması ağır yenilgiye uğratıldı.' },
    ],
  },
  {
    id: 'buyuk-taarruz-1922',
    name: 'Büyük Taarruz ve Başkomutanlık Meydan Muharebesi',
    year: '26 Ağustos – 9 Eylül 1922',
    era: 'Kurtuluş Savaşı (8. Sınıf İnkılap Tarihi)',
    winnerSide: 'TBMM Türk Ordusu',
    winnerCommander: 'Başkomutan Gazi Mustafa Kemal Paşa',
    defeatedSide: 'Yunan İşgal Ordusu',
    defeatedCommander: 'General Nikolaos Trikupis',
    battleType: 'Büyük Sefer',
    tactics: 'Gizlilik ve şaşırtma planı — Ordunun gece yürüyüşleriyle Kocatepe güneyinde yoğunlaştırılıp düşman cephesinin beklenmedik yerden yarılması.',
    turningPoint: '30 Ağustos’ta Dumlupınar’da kuşatmanın tamamlanması ve “Ordular! İlk hedefiniz Akdeniz’dir. İleri!” emri.',
    consequences: [
      '9 Eylül 1922’de İzmir kurtarıldı, Kurtuluş Savaşı’nın askerî safhası kesin zaferle sona erdi.',
      'Mudanya Ateşkes Antlaşması ve ardından Lozan Barış Antlaşması’nın yolu açıldı.',
    ],
    waypoints: [
      { label: 'Ankara / Polatlı', date: 'Ağustos 1922', x: 486, y: 204, note: 'Gizli hazırlıklar tamamlandı; komutanlar gece vakti cepheye geçti.' },
      { label: 'Kocatepe (Afyon)', date: '26 Ağustos 1922', x: 472, y: 212, note: 'Saat 05.30’da topçu ateşiyle Büyük Taarruz başladı.' },
      { label: 'Dumlupınar (30 Ağustos)', date: '30 Ağustos 1922', x: 464, y: 209, note: 'Başkomutanlık Meydan Muharebesi kazanıldı.' },
      { label: 'İzmir (Kurtuluş)', date: '9 Eylül 1922', x: 446, y: 216, note: 'Türk süvarileri 400 km’lik takibin sonunda İzmir’e girdi.' },
    ],
  },
  {
    id: 'caldiran-1514',
    name: 'Çaldıran Seferi ve Meydan Muharebesi',
    year: '23 Ağustos 1514',
    era: 'Osmanlı Yükselme Dönemi',
    winnerSide: 'Osmanlı Devleti',
    winnerCommander: 'Yavuz Sultan Selim (I. Selim)',
    defeatedSide: 'Safevi Devleti',
    defeatedCommander: 'Şah İsmail',
    battleType: 'Kara Meydan Savaşı',
    tactics: 'Araba topları ve zincirle bağlanmış tabur cengi düzeniyle tüfekli yeniçeri ateş üstünlüğü.',
    turningPoint: 'Osmanlı sahra topçusunun Safevi ağır süvari hücumlarını durdurması ve merkez cephenin çökmesi.',
    consequences: [
      'Doğu Anadolu’nun büyük bölümü kesin olarak Osmanlı hâkimiyetine geçti.',
      'Tebriz–Halep ve İpek Yolu ticaret hatlarının güvenliği sağlandı.',
    ],
    waypoints: [
      { label: 'İstanbul (Hareket)', date: 'Mart 1514', x: 462, y: 196, note: 'Yavuz Sultan Selim doğu güvenliğini sağlamak için büyük sefere çıktı.' },
      { label: 'Sivas (Ordu Yoklaması)', date: 'Temmuz 1514', x: 520, y: 204, note: 'Ordunun ikmal düzeni yenilendi ve doğuya yürüyüş hızlandı.' },
      { label: 'Erzincan / Eleşkirt', date: 'Ağustos 1514', x: 550, y: 200, note: 'Zorlu dağ geçitleri aşılarak Van Gölü kuzeydoğusuna ulaşıldı.' },
      { label: 'Çaldıran Ovası', date: '23 Ağustos 1514', x: 576, y: 208, note: 'Ateşli silah üstünlüğüyle Osmanlı ordusu kesin zafer kazandı.' },
    ],
  },
  {
    id: 'canakkale-1915',
    name: 'Çanakkale Deniz ve Kara Savaşları',
    year: '18 Mart – Aralık 1915',
    era: 'I. Dünya Savaşı (8. Sınıf İnkılap Tarihi)',
    winnerSide: 'Osmanlı Devleti (Türk Ordusu)',
    winnerCommander: 'Cevat Paşa, Esat Paşa & Yarbay Mustafa Kemal',
    defeatedSide: 'İtilaf Devletleri (İngiltere & Fransa)',
    defeatedCommander: 'Amiral de Robeck & General Ian Hamilton',
    battleType: 'Deniz Savaşı',
    tactics: 'Nusret Mayın Gemisi’nin karanlıkta Erenköy Koyu’na kıyıya paralel döşediği 26 mayın ve kara cephesinde Conkbayırı–Anafartalar savunması.',
    turningPoint: '18 Mart’ta dev zırhlıların mayın ve topçu ateşiyle durdurulması; 25 Nisan’da Mustafa Kemal’in 57. Alay ile Arıburnu çıkarmasını kırması.',
    consequences: [
      '“Çanakkale Geçilmez!” gerçeği tarihe yazıldı; İstanbul işgalden kurtuldu.',
      'I. Dünya Savaşı en az iki yıl uzadı, Rusya’ya yardım ulaştırılamadı.',
      'Mustafa Kemal’in askerî dehası tüm yurtta tanındı ve Millî Mücadele liderliği doğdu.',
    ],
    waypoints: [
      { label: 'Erenköy Koyu (Nusret Mayınları)', date: '8 Mart 1915', x: 441, y: 203, note: 'Nusret Mayın Gemisi 26 mayını boğaza paralel döşeyerek savaşın kaderini değiştirdi.' },
      { label: 'Çanakkale Boğazı (18 Mart)', date: '18 Mart 1915', x: 445, y: 199, note: 'Seyit Onbaşı ve kıyı bataryaları İtilaf donanmasını geri püskürttü.' },
      { label: 'Arıburnu & Conkbayırı', date: '25 Nisan – Ağustos 1915', x: 443, y: 196, note: 'Mustafa Kemal’in “Ben size taarruzu değil, ölmeyi emrediyorum” sözüyle cephe tutuldu.' },
    ],
  },
  {
    id: 'sakarya-1921',
    name: 'Sakarya Meydan Muharebesi',
    year: '23 Ağustos – 13 Eylül 1921',
    era: 'Kurtuluş Savaşı (8. Sınıf İnkılap Tarihi)',
    winnerSide: 'TBMM Türk Ordusu',
    winnerCommander: 'Başkomutan Mustafa Kemal Paşa',
    defeatedSide: 'Yunan Ordusu',
    defeatedCommander: 'General Anastasios Papulas',
    battleType: 'Kara Meydan Savaşı',
    tactics: '“Hattı müdafaa yoktur, sathı müdafaa vardır. O satıh bütün vatandır!” — Alan savunması doktrini.',
    turningPoint: '22 gün 22 gece süren kesintisiz çarpışmaların ardından Dua Tepe’nin geri alınması ve düşmanın Sakarya batısına atılması.',
    consequences: [
      '1683 II. Viyana’dan beri süren Türk geri çekilişi kesin olarak sona erdi.',
      'TBMM tarafından Mustafa Kemal Paşa’ya “Gazi” unvanı ve “Mareşal” rütbesi verildi.',
      'Kars ve Ankara Antlaşmaları imzalandı, uluslararası destek arttı.',
    ],
    waypoints: [
      { label: 'Ankara (TBMM & Başkomutanlık)', date: 'Ağustos 1921', x: 491, y: 202, note: 'Tekâlif-i Millîye Emirleri ile tüm millet ordunun arkasında kenetlendi.' },
      { label: 'Polatlı / Alagöz Karargâhı', date: '23 Ağustos 1921', x: 484, y: 204, note: 'Sakarya doğusunda 100 kilometrelik savunma hattı kuruldu.' },
      { label: 'Haymana & Dua Tepe', date: '10–13 Eylül 1921', x: 480, y: 208, note: 'Dua Tepe zaferiyle Yunan taarruz gücü tamamen kırıldı.' },
    ],
  },
];

export const SULTAN_PROFILES: SultanProfile[] = [
  {
    id: 'fatih',
    name: 'Fatih Sultan Mehmet (II. Mehmed)',
    reign: '1444–1446 / 1451–1481',
    period: 'Yükselme',
    mahlas: 'Avnî (Yardım eden)',
    hiddenTalents: [
      'Divan sahibi usta şair (Avnî mahlası)',
      '6 yabancı dil (Arapça, Farsça, Yunanca, Latince, Sırpça, İtalyanca)',
      'Top mühendisliği ve havan topu tasarımı',
      'Bahçıvanlık ve özel gül yetiştiriciliği',
    ],
    talentStory:
      'Fatih yalnızca büyük bir komutan değil, rönesans düzeyinde bir bilim ve sanat hamisiydi. Kendi el çizimleriyle şahi ve havan toplarının balistik hesaplarına katılmış, İtalyan ressam Gentile Bellini’yi İstanbul’a davet etmiş ve Ali Kuşçu’yu Ayasofya Medresesi’ne getirmiştir.',
    poemTitle: 'Avnî Divanı’ndan (Kamu Malı Beyit)',
    poemOriginal: 'İmtisâl-i câhidû fillâh olupdur niyyetüm\nDîn-i İslâm’un mücerred gayretidür gayretüm',
    poemModernTurkish:
      'Niyetim yalnızca hak yolunda gayret etmektir; bütün çabam ve çalışmam bu yüce idealin hizmetindedir.',
    battles: [
      { battle: 'İstanbul’un Fethi', year: '1453', opponent: 'Bizans İmparatorluğu', result: 'Galip', note: 'Çağ açıp çağ kapayan zafer.' },
      { battle: 'Belgrad Kuşatması', year: '1456', opponent: 'Macar Krallığı (Hunyadi)', result: 'Mağlup', note: 'Şehir kuşatıldı ancak alınamadı; Belgrad’ı 1521’de Kanuni fethetti.' },
      { battle: 'Otlukbeli Savaşı', year: '1473', opponent: 'Akkoyunlular (Uzun Hasan)', result: 'Galip', note: 'Doğu Anadolu güvenliği sağlandı.' },
    ],
  },
  {
    id: 'bayezid2',
    name: 'II. Bayezid',
    reign: '1481 – 1512',
    period: 'Yükselme',
    mahlas: 'Adlî (Adaletli)',
    hiddenTalents: [
      'Usta hattat (Şeyh Hamdullah’ın öğrencisi ve hamisi)',
      'Türk musikisi bestekârı (peşrev ve saz semaileri)',
      'Şair ve astronomi kitapları koleksiyoneri',
    ],
    talentStory:
      'II. Bayezid, Osmanlı hat sanatının piri sayılan Şeyh Hamdullah yazı yazarken hokkasını bizzat elinde tutacak kadar sanata saygı gösterirdi. 1492’de İspanya’dan sürülen Sefarad Yahudilerine Osmanlı gemilerini göndererek insanlık tarihinde örnek bir sığınma politikası uygulamıştır.',
    poemTitle: 'Adlî Divanı’ndan (Kamu Malı Beyit)',
    poemOriginal: 'Hüdâ’dan iste tevfîki, gönül dünyâya meyl etme\nGeçer bu devr-i fânîdir, sakın bîhûde seyl etme',
    poemModernTurkish:
      'Başarıyı ve yardımı Yaradan’dan iste, geçici dünya malına kapılma; bu ömür gelip geçicidir, vaktini boş yere harcama.',
    battles: [
      { battle: 'Kili ve Akkerman Fethi', year: '1484', opponent: 'Boğdan Voyvodalığı', result: 'Galip', note: 'Karadeniz kıyı bütünlüğü tamamlandı.' },
      { battle: 'İnebahtı (Modon-Koron) Deniz Seferi', year: '1499–1500', opponent: 'Venedik Cumhuriyeti', result: 'Galip', note: 'Kemal Reis öncülüğünde büyük deniz zaferleri.' },
      { battle: 'Osmanlı–Memlük Sınır Savaşları', year: '1485–1491', opponent: 'Memlük Devleti', result: 'Berabere / Antlaşma', note: 'Çukurova bölgesinde kesin sonuç alınamayınca barış yapıldı.' },
    ],
  },
  {
    id: 'yavuz',
    name: 'Yavuz Sultan Selim (I. Selim)',
    reign: '1512 – 1520',
    period: 'Yükselme',
    mahlas: 'Selîmî',
    hiddenTalents: [
      'Güçlü divan şairi (Selîmî mahlası)',
      'Usta kuyumcu (şehzadeliğinde Trabzon’da öğrendi)',
      'Olağanüstü hızlı okuyan bir kitap tutkunu (seferde bile kütüphane taşırdı)',
    ],
    talentStory:
      'Sert askerî disipliniyle tanınan Yavuz Sultan Selim, gece geç saatlere kadar kitap okur, tarih ve edebiyat tartışmalarına katılırdı. 8 yıllık kısa saltanatında Osmanlı topraklarını yaklaşık 2,5 kat büyütmüştür.',
    poemTitle: 'Selîmî’den (Kamu Malı Beyit)',
    poemOriginal: 'Şîrler pençe-i kahrımda olurken lerzân\nBeni bir gözleri âhûya zebûn etti felek',
    poemModernTurkish:
      'Aslanlar bile gücümün karşısında titrerken, kader beni ceylan gözlü bir sevgilinin önünde çaresiz bıraktı.',
    battles: [
      { battle: 'Çaldıran Savaşı', year: '1514', opponent: 'Safevi Devleti (Şah İsmail)', result: 'Galip', note: 'Doğu Anadolu Osmanlı hâkimiyetine girdi.' },
      { battle: 'Mercidâbık Savaşı', year: '1516', opponent: 'Memlük Devleti', result: 'Galip', note: 'Suriye ve Filistin fethedildi.' },
      { battle: 'Ridâniye Savaşı', year: '1517', opponent: 'Memlük Devleti', result: 'Galip', note: 'Mısır alındı, halifelik Osmanlı’ya geçti.' },
    ],
  },
  {
    id: 'kanuni',
    name: 'Kanuni Sultan Süleyman',
    reign: '1520 – 1566',
    period: 'Yükselme',
    mahlas: 'Muhibbî (Seven, dost)',
    hiddenTalents: [
      'Divan edebiyatının en çok gazel yazan şairi (2700’den fazla gazel!)',
      'Usta kuyumcu ve altın işlemecisi',
      'Hukuk ve kanunname düzenleyicisi',
    ],
    talentStory:
      '46 yıl tahtta kalarak en uzun hüküm süren Osmanlı padişahı olan Kanuni, “Muhibbî” mahlasıyla yazdığı şiirlerle edebiyat tarihimizin en üretken şairlerinden biridir. Sağlığın her türlü saltanattan üstün olduğunu anlatan beyti bugün hâlâ herkesin ezberindedir.',
    poemTitle: 'Muhibbî Divanı’ndan Ünlü Beyit (Kamu Malı)',
    poemOriginal: 'Halk içinde muteber bir nesne yok devlet gibi\nOlmaya devlet cihânda bir nefes sıhhat gibi',
    poemModernTurkish:
      'İnsanların gözünde devlet ve makam kadar kıymetli bir şey yok sanılır; oysa dünyada bir nefeslik sağlık gibi gerçek bir devlet (zenginlik) yoktur.',
    battles: [
      { battle: 'Belgrad ve Rodos’un Fethi', year: '1521–1522', opponent: 'Macaristan & Rodos Şövalyeleri', result: 'Galip', note: 'Orta Avrupa ve Doğu Akdeniz kilidi açıldı.' },
      { battle: 'Mohaç Meydan Muharebesi', year: '1526', opponent: 'Macar Krallığı', result: 'Galip', note: '2 saatlik tarihî zafer.' },
      { battle: 'I. Viyana Kuşatması', year: '1529', opponent: 'Avusturya Arşidüklüğü', result: 'Mağlup', note: 'Kış şartları ve ağır kuşatma toplarının getirilmemesi nedeniyle kuşatma kaldırıldı.' },
    ],
  },
  {
    id: 'murad4',
    name: 'IV. Murad',
    reign: '1623 – 1640',
    period: 'Duraklama & Yenileşme',
    mahlas: 'Murâdî',
    hiddenTalents: [
      'Şair (Murâdî mahlası) ve bestekâr',
      'İleri düzey hattat',
      'Olağanüstü fiziksel güç: gürz, okçuluk (kemankeş) ve cirit şampiyonu',
    ],
    talentStory:
      'Henüz 11 yaşında tahta çıkan IV. Murad, devlet otoritesini yeniden kurarken aynı zamanda ince ruhlu bir şair ve bestekârdı. Bağdat Seferi’nde ordunun başında bizzat savaştı ve devletin sorunları için Koçi Bey’e ünlü reform risalesini hazırlattı.',
    poemTitle: 'Murâdî’den (Kamu Malı Beyit)',
    poemOriginal: 'Hâb-ı gafletten uyan ey dil, zamân elden gider\nFırsatı fevt eyleme, ömr-i revân elden gider',
    poemModernTurkish:
      'Ey gönül, gaflet uykusundan uyan; zaman hızla geçiyor! Fırsatı kaçırma, akıp giden ömür elden gidiyor.',
    battles: [
      { battle: 'Revan Seferi', year: '1635', opponent: 'Safevi Devleti', result: 'Galip', note: 'Revan Kalesi fethedildi.' },
      { battle: 'Bağdat’ın Fethi', year: '1638', opponent: 'Safevi Devleti', result: 'Galip', note: 'Bağdat yeniden alındı; 1639 Kasr-ı Şirin Antlaşması ile bugünkü Türkiye–İran sınırının temeli atıldı.' },
    ],
  },
  {
    id: 'selim3',
    name: 'III. Selim',
    reign: '1789 – 1807',
    period: 'Duraklama & Yenileşme',
    mahlas: 'İlhâmî',
    hiddenTalents: [
      'Büyük Türk musikisi bestekârı (14 yeni makam icat etti: Sûzidilârâ vb.)',
      'Usta neyzen ve tambur icracısı',
      'Divan şairi (İlhâmî mahlası) ve Nizâm-ı Cedîd reformcusu',
    ],
    talentStory:
      'III. Selim klasik Türk müziğinin en büyük bestekârlarından biri kabul edilir. Hammâmîzâde İsmail Dede Efendi gibi büyük sanatçıları sarayda desteklemiş, aynı zamanda mühendishane ve matbaa gibi modern eğitim kurumlarını güçlendirmiştir.',
    poemTitle: 'İlhâmî’den (Kamu Malı Beyit)',
    poemOriginal: 'Gönül bir ney gibi inler, sadâsı arşa yükselir\nMuhabbet sırrını anlar, kimin kim kalbi sâf olur',
    poemModernTurkish:
      'Temiz ve samimi kalbe sahip olanlar sevginin sırrını anlar; gönül tıpkı bir ney gibi içten ses verir.',
    battles: [
      { battle: 'Akka Savunması (Cezzar Ahmed Paşa)', year: '1799', opponent: 'Fransa (Napolyon Bonapart)', result: 'Galip', note: 'Nizâm-ı Cedîd ordusu Napolyon’u ilk kez mağlup etti.' },
      { battle: 'Osmanlı–Rus–Avusturya Savaşı', year: '1787–1792', opponent: 'Rusya ve Avusturya', result: 'Mağlup', note: 'Yaş Antlaşması ile Kırım’ın Rusya’ya ait olduğu kabul edildi; bu yenilgi Nizâm-ı Cedîd reformlarını başlattı.' },
    ],
  },
  {
    id: 'abdulhamid2',
    name: 'II. Abdülhamid',
    reign: '1876 – 1909',
    period: 'Duraklama & Yenileşme',
    mahlas: 'Usta Marangoz & Arşivci',
    hiddenTalents: [
      'Usta marangoz ve sedef kakma mobilya sanatçısı (Yıldız Marangozhanesi)',
      'Dünyanın en büyük tarihî fotoğraf koleksiyonlarından biri (Yıldız Fotoğraf Albümleri)',
      'Piyano ve klasik müzik meraklısı; polisiye roman okuru',
    ],
    talentStory:
      'Yıldız Sarayı’nda kendi marangoz atölyesi bulunan II. Abdülhamid, devlet işlerinden arta kalan vakitlerde bizzat masa, yazıhane ve sedef işlemeli dolaplar yapmıştır. Aynı zamanda imparatorluğun dört bir yanındaki okulları, köprüleri ve şehirleri fotoğraflatarak bugün çok değerli olan tarihî görsel arşivi oluşturmuştur.',
    poemTitle: 'Eğitim ve Sanata Dair Tarihî Sözü',
    poemOriginal: '“Bir insanın elinde mutlaka bir zanaat ve meslek bulunmalıdır; el emeği insanın zihnini dinlendirir.”',
    poemModernTurkish:
      'Zanaat ve üretkenlik her insan için hem bir erdem hem de zihinsel berraklık kaynağıdır.',
    battles: [
      { battle: '93 Harbi (1877–1878 Osmanlı–Rus Savaşı)', year: '1877–1878', opponent: 'Rus İmparatorluğu', result: 'Mağlup', note: 'Plevne’de Gazi Osman Paşa destansı savunma yapsa da Berlin Antlaşması ile toprak kaybı yaşandı.' },
      { battle: 'Dömeke Meydan Muharebesi', year: '1897', opponent: 'Yunanistan Krallığı', result: 'Galip', note: 'Osmanlı ordusu sahada kesin askerî zafer kazandı.' },
    ],
  },
  {
    id: 'osman1',
    name: 'Osman Gazi (I. Osman)',
    reign: '1299 – 1326',
    period: 'Kuruluş',
    mahlas: 'Gazi & Adalet Kurucusu',
    hiddenTalents: [
      'Ahî teşkilatı ve halk meclisiyle istişare kültürü',
      'Pazar güvenliği ve din-dil ayrımı yapmayan adalet uygulaması',
      'Sade yaşam: Vefatında geriye hazine değil birkaç koyun sürüsü ve kılıç bıraktı',
    ],
    talentStory:
      'Osmanlı Devleti’nin kurucusu Osman Gazi, Söğüt ve Karacahisar pazarlarında Müslüman ile Hristiyan tüccarlar arasında çıkan bir anlaşmazlıkta haklı olan Bizanslı tüccarın yanında durarak adaletiyle ün kazandı. Kayınpederi Şeyh Edebali’nin “İnsanı yaşat ki devlet yaşasın” ilkesini devletin temel harcı yaptı.',
    poemTitle: 'Oğlu Orhan Gazi’ye Tarihî Vasiyetinden',
    poemOriginal: '“Oğul! İlim ehli kişilere rağbet et, askere ve mala gururlanma; adaletten ayrılma!”',
    poemModernTurkish:
      'Bilgi insanlarına değer ver, gücüne kapılıp kibirlenme ve her işinde adaleti rehber edin.',
    battles: [
      { battle: 'Koyunhisar (Bapheus) Savaşı', year: '1302', opponent: 'Bizans İmparatorluğu', result: 'Galip', note: 'Osmanlı ile Bizans arasındaki ilk düzenli meydan savaşı zaferi.' },
      { battle: 'Bursa Kuşatması (Başlatılması)', year: '1316–1326', opponent: 'Bizans Tekfurluğu', result: 'Galip', note: 'Uzun abluka stratejisiyle şehri oğlu Orhan Gazi teslim aldı.' },
    ],
  },
  {
    id: 'yildirim-bayezid',
    name: 'Yıldırım Bayezid (I. Bayezid)',
    reign: '1389 – 1402',
    period: 'Kuruluş',
    mahlas: 'Yıldırım (Hız ve Kararlılık)',
    hiddenTalents: [
      'Olağanüstü hızlı askerî intikal ve strateji planlaması',
      'Bursa Ulu Camii ve Anadolu Hisarı gibi anıtsal eserlerin banisi',
      'İlk büyük deniz tersanesi (Gelibolu) ve devlet hastanesi (Bursa Darüşşifası) kurucusu',
    ],
    talentStory:
      'Anadolu’dan Rumeli’ye ordusuyla akıl almaz hızda geçiş yaptığı için “Yıldırım” unvanını alan I. Bayezid, İstanbul’u kuşatan ilk Osmanlı padişahıdır. Bursa’da inşa ettirdiği 20 kubbeli Ulu Camii’nin açılışında büyük âlim Somuncu Baba ile yaşadığı tevazu hikâyesi bugün hâlâ anlatılır.',
    poemTitle: 'Devlet ve Mimari Mirasından',
    poemOriginal: '“Hız yalnız savaş meydanında değil, imar ve adalette de gereklidir.”',
    poemModernTurkish:
      'Bursa Ulu Camii, Anadolu Hisarı ve Gelibolu Tersanesi ile Anadolu-Rumeli birliğinin öncüsü oldu.',
    battles: [
      { battle: 'Niğbolu Savaşı', year: '1396', opponent: 'Avrupa Haçlı Ordusu', result: 'Galip', note: 'Bulgaristan Osmanlı topraklarına katıldı; “Sultân-ı İklîm-i Rûm” unvanını aldı.' },
      { battle: 'Ankara Savaşı', year: '1402', opponent: 'Timur Devleti', result: 'Mağlup', note: 'Osmanlı’da 11 yıllık Fetret Devri’nin başlamasına yol açtı.' },
    ],
  },
  {
    id: 'murad2',
    name: 'II. Murad',
    reign: '1421–1444 / 1446–1451',
    period: 'Kuruluş',
    mahlas: 'Murâdî',
    hiddenTalents: [
      'Türkçe bilim ve edebiyat eserlerinin en büyük destekçisi',
      'Divan sahibi şair ve musikişinas',
      'Tarihte kendi isteğiyle tahtı genç oğluna (II. Mehmed) bırakan tek Osmanlı padişahı',
    ],
    talentStory:
      'Fatih Sultan Mehmet’in babası olan II. Murad, sarayında Türkçe tarih, tıp ve edebiyat kitapları yazdırarak Türkçenin bilim ve kültür dili olarak güçlenmesine büyük katkı sağladı. Barış sağlandığına inanınca Manisa’da kitaplarıyla sakin bir yaşam sürmek için tahtı 12 yaşındaki oğluna devretmiş, ancak Haçlı tehlikesi doğunca devletin çağrısıyla yeniden ordunun başına geçmiştir.',
    poemTitle: 'Murâdî’den (Kamu Malı Beyit)',
    poemOriginal: 'Gerçi kim haddim değildir bûseni kılmak dilek\nÂrif olan çün bilür ânı ne lâzım söylemek',
    poemModernTurkish:
      'İnce ruhlu ve arif olan kimse, söylenmese bile gönüldeki zarif meramı anlar.',
    battles: [
      { battle: 'Varna Meydan Muharebesi', year: '1444', opponent: 'Macar–Leh Haçlı Ordusu', result: 'Galip', note: 'Balkanlar’daki Osmanlı hâkimiyeti güvence altına alındı.' },
      { battle: 'II. Kosova Savaşı', year: '1448', opponent: 'Hunyadi Yanoş Komutasındaki Haçlılar', result: 'Galip', note: 'Balkanlar kesin olarak Türk yurdu hâline geldi; İstanbul’un fethine giden yol açıldı.' },
    ],
  },
];

export const HISTORY_ANECDOTES_WISDOM: HistoryWisdomItem[] = [
  {
    id: 'wis-1',
    title: 'Fatih’in Tevazusu ve Hocası Akşemseddin',
    category: 'Hikmetli Hikâye',
    era: '1453 · İstanbul’un Fethi',
    figures: 'Fatih Sultan Mehmet & Akşemseddin',
    content:
      'İstanbul fethedilip Osmanlı ordusu şehre girerken halk ellerinde çiçeklerle yürüyen ak sakallı, vakur duruşlu Akşemseddin’i padişah sanıp çiçekleri ona uzatır. Akşemseddin gülümseyerek yanındaki genç padişahı işaret eder: “Padişah ben değilim, odur!” Genç Fatih ise hocasını göstererek tarihe geçen cevabı verir: “Gidiniz, çiçekleri yine ona veriniz; padişah benim ama o benim hocamdır!”',
    lesson: 'En büyük zafer anında bile öğretmene ve ilme gösterilen saygı, gerçek büyüklüğün ölçüsüdür.',
  },
  {
    id: 'wis-2',
    title: 'İbn Kemal’in Atından Sıçrayan Çamur',
    category: 'Hikmetli Hikâye',
    era: '1517 · Mısır Dönüşü',
    figures: 'Yavuz Sultan Selim & Şeyhülislam İbn Kemal',
    content:
      'Mısır seferinden dönülürken büyük âlim İbn Kemal’in atının ayağı kayar ve sıçrayan çamur Yavuz Sultan Selim’in beyaz kaftanını kirletir. İbn Kemal mahcubiyetle donakalır. Yavuz ise gülümseyerek şöyle der: “Üzülmeyiniz hocam! Âlimlerin atının ayağından sıçrayan çamur bizim için süs ve şereftir. Vasiyetimdir: Bu kaftan vefatımda sandukamın üzerine örtülsün!”',
    lesson: 'Bilgi insanlarına duyulan hürmet, bir toplumun yükselişinin en güçlü işaretidir.',
  },
  {
    id: 'wis-3',
    title: 'Kanuni’nin Karınca Fetvası (Şiirli Yazışma)',
    category: 'İlginç Anekdot',
    era: '16. Yüzyıl · Topkapı Sarayı',
    figures: 'Kanuni Sultan Süleyman & Şeyhülislam Ebussuud Efendi',
    content:
      'Topkapı Sarayı bahçesindeki meyve ağaçlarını karıncalar sarınca Kanuni, ağaçları kireçleyerek karıncalara zarar vermenin doğru olup olmadığını Şeyhülislam Ebussuud Efendi’ye bir beyitle sorar: “Dırahta ger ziyân etse karınca / Zarar var mıdır ânı kırınca?” (Ağaca zarar veren karıncayı yok etmenin vebali var mıdır?). Ebussuud Efendi yine aynı zarafetle şiirle cevap verir: “Yarın Hakk’ın divânına varınca / Süleyman’dan hakkın alır karınca!”',
    lesson: 'Doğa sevgisi, canlı haklarına duyarlılık ve devlet yönetiminde nezaketli iletişim.',
  },
  {
    id: 'wis-4',
    title: 'Mimar Sinan, Süleymaniye’de Nargile ve Akustik Sırrı',
    category: 'İlginç Anekdot',
    era: '1557 · İstanbul',
    figures: 'Mimar Sinan & Kanuni Sultan Süleyman',
    content:
      'Süleymaniye Camii’nin inşaatı biterken Kanuni camiye girdiğinde Mimar Sinan’ın mihrap önünde tönbekisiz (tütünsüz) bir nargileyi fokurdattığını görür ve şaşırır. Mimar Sinan hemen açıklar: “Padişahım, su sesinin caminin her köşesinde ve kubbesinde nasıl yankılandığını ölçüyorum!” Sinan kubbenin içine yerleştirdiği 64 boş testi (rezonatör) sayesinde mikrofon olmadan sesin binlerce kişiye berrak ulaşmasını sağlamıştır.',
    lesson: 'Bilim, fizik (akustik) ve sanat birleştiğinde yüzyıllara meydan okuyan eserler ortaya çıkar.',
  },
  {
    id: 'wis-5',
    title: 'Fuzûlî’nin Şikâyetnâme Hicvi: “Selam Verdim, Almadılar!”',
    category: 'Tarihî Hiciv & Nükte',
    era: '16. Yüzyıl · Bağdat',
    figures: 'Büyük Şair Fuzûlî',
    content:
      'Kanuni Bağdat’ı fethettiğinde Fuzûlî’ye vakıftan günlük 9 akçe maaş bağlanmasını emreder. Ancak bürokratik aksaklıklar yüzünden Fuzûlî maaşını alamaz. Bunun üzerine edebiyat tarihimizin en ünlü hiciv mektubu olan Şikâyetnâme’de şu unutulmaz cümleyi yazar: “Selâm verdim, rüşvet değildir deyü almadılar; hüküm gösterdim, fâidesizdir deyü mültefit olmadılar!”',
    lesson: 'Edebî hiciv, kaba söz kullanmadan ince bir zekâ ve ironi ile haksızlıkları eleştirme sanatıdır.',
  },
  {
    id: 'wis-6',
    title: 'Nasreddin Hoca’nın Timur’a Fil Nüktesi',
    category: 'Tarihî Hiciv & Nükte',
    era: '15. Yüzyıl · Akşehir (Halk Anlatısı)',
    figures: 'Nasreddin Hoca & Timur',
    content:
      'Halk anlatısına göre Timur’un Akşehir’e bıraktığı fil köyün bütün ekinlerini tüketir. Köylüler şikâyet için Nasreddin Hoca’nın peşine takılıp Timur’un huzuruna gider; fakat kapıda herkes korkup kaçar, Hoca tek başına kalır. Timur “Ne istersin Hoca?” deyince Hoca etrafına bakıp kimseyi göremeyince zarif bir taşlama yapar: “Hünkârım, gönderdiğiniz fil pek yalnız kalmış, yanına bir de dişi fil istiyoruz!”',
    lesson: 'Halk mizahı, cesaret ve hazırcevaplık ile hem yöneticilere hem de sorumluluktan kaçanlara ayna tutar.',
  },
  {
    id: 'wis-7',
    title: 'Ziya Paşa’nın Unutulmaz Sosyal Hiciv Beyti',
    category: 'Tarihî Hiciv & Nükte',
    era: '19. Yüzyıl · Tanzimat Dönemi',
    figures: 'Ziya Paşa',
    content:
      'Tanzimat döneminin önemli devlet adamı ve şairi Ziya Paşa, Terkîb-i Bend eserinde toplumda liyakat ve adalet eksikliğini şu keskin ama zarif beyitle eleştirmiştir: “Âyînesi iştir kişinin lâfa bakılmaz / Şahsın görünür rütbe-i aklı eserinde.” (İnsanın aynası yaptığı iştir, boş söze bakılmaz; kişinin aklının düzeyi ortaya koyduğu eserden anlaşılır.)',
    lesson: 'İddialı sözler değil, somut emek ve ortaya konan nitelikli eserler insanın gerçek değerini gösterir.',
  },
  {
    id: 'wis-8',
    title: 'Atatürk’ün “Geldikleri Gibi Giderler” Sözü ve İnanç',
    category: 'Hikmetli Hikâye',
    era: '13 Kasım 1918 · İstanbul Boğazı',
    figures: 'Mustafa Kemal Paşa & Yaveri Cevat Abbas',
    content:
      'Mondros Ateşkesi’nin ardından İtilaf Devletleri’nin dev zırhlıları İstanbul Boğazı’na demirlediği gün, yaveri Cevat Abbas gözyaşlarını tutamaz. Mustafa Kemal Paşa, soğukkanlı ve sarsılmaz bir kararlılıkla yaverine dönerek tarihe kazınan o cümleyi söyler: “Ağlama çocuk, geldikleri gibi giderler!” Dört yıl sonra 6 Ekim 1923’te işgal donanması Türk bayrağını selamlayarak Boğaz’dan ayrılmıştır.',
    lesson: 'En zorlu koşullarda dahi umudu korumak, akılcı planlama ve kararlılıkla birleştiğinde imkânsızı başarır.',
  },
  {
    id: 'wis-9',
    title: 'Şeyh Edebali’nin Osman Gazi’ye Unutulmaz Öğüdü',
    category: 'Hikmetli Hikâye',
    era: '13. Yüzyıl Sonu · Bilecik / Söğüt',
    figures: 'Şeyh Edebali & Osman Gazi',
    content:
      'Osmanlı Beyliği kurulurken Şeyh Edebali genç Osman Bey’e yalnızca kılıç değil, bir yönetim ahlakı emanet etti: “Ey oğul! Beysin; bundan sonra öfke bize, uysallık sana; güceniklik bize, gönül almak sana; suçlamak bize, katlanmak sana… Geçmişini bilmeyen geleceğini bilemez. İnsanı yaşat ki devlet yaşasın!”',
    lesson: 'Gerçek liderlik öfkeyle değil; sabır, adalet, kapsayıcılık ve insan onuruna saygıyla kalıcı olur.',
  },
  {
    id: 'wis-10',
    title: 'Pîrî Reis’in 1513 Dünya Haritasındaki Bilimsel Dürüstlüğü',
    category: 'İlginç Anekdot',
    era: '1513 · Gelibolu',
    figures: 'Pîrî Reis (Denizci ve Haritacı)',
    content:
      'Pîrî Reis, ceylan derisi üzerine çizdiği ünlü 1513 Dünya Haritası’nın kenarına hangi kaynaklardan yararlandığını tek tek not etmiştir: Portekiz haritaları, Arap denizcilerin çizimleri, Kristof Kolomb’un haritası ve kendi Akdeniz gözlemleri… Bilmediği veya emin olmadığı yerler hakkında uydurma bilgi yazmayıp kaynak göstererek bugünkü bilimsel atıf ahlakının 500 yıl önceki örneğini vermiştir.',
    lesson: 'Bilimsel çalışmada kaynak göstermek, dürüstlük ve araştırmacı titizliği başarının temelidir.',
  },
  {
    id: 'wis-11',
    title: 'Şair Nef’î’nin Keskin Zekâsı ve Söz Gücü',
    category: 'Tarihî Hiciv & Nükte',
    era: '17. Yüzyıl · İstanbul',
    figures: 'Divan Şairi Nef’î',
    content:
      'Türk edebiyatında kaside ve hicvin en büyük ustalarından Nef’î’ye bir gün dönemin önde gelen bir devlet adamı takılarak “Nef’î, senin dilin çok keskin, hiciv yazmaktan vazgeçmeyecek misin?” diye sorar. Nef’î gülümseyerek “Haksızlık ve gösteriş durduğu sürece kalemim susmaz; ama iyiyi övmekte de benden cömerdi yoktur” cevabıyla hem övgüde hem eleştiride ölçüye vurgu yapar.',
    lesson: 'Eleştiri hakikati göstermek için yapıldığında değerlidir; dilin gücü özen ve sorumluluk ister.',
  },
  {
    id: 'wis-12',
    title: 'Çanakkale’de Seyit Onbaşı ve İmkânsızı Aşan Azim',
    category: 'Hikmetli Hikâye',
    era: '18 Mart 1915 · Rumeli Mecidiye Tabyası',
    figures: 'Koca Seyit (Seyit Ali Çabuk)',
    content:
      '18 Mart 1915’te Rumeli Mecidiye Tabyası ağır bombardıman altında kalınca topun mermi kaldıran vinci bozuldu. Düşman zırhlısı Ocean boğaza doğru ilerlerken Havranlı Seyit Onbaşı arkadaşının yardımıyla 215 okkalık (yaklaşık 275 kg) top mermisini sırtlayıp namluya sürdü ve zırhlının dümen donanımını vurdu. Savaş sonrası fotoğraf çekilmesi istendiğinde aynı ağırlığı kaldıramayınca “O gün vatan aşkıyla kaldırdım; yine düşman gelse yine kaldırırım” demiştir.',
    lesson: 'İnanç, dayanışma ve yüksek bir amaç uğruna kenetlenmek insanın sınırlarını aşmasını sağlar.',
  },
];
