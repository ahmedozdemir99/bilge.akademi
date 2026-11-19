export type AphorismCategory =
  | 'Bilim ve Eğitim'
  | 'Erdem ve Adalet'
  | 'Dil ve Sanat'
  | 'Sabır ve Emek'
  | 'Vatan ve Özgürlük';

export interface AphorismItem {
  id: string;
  quote: string;
  author: string;
  era: string;
  category: AphorismCategory;
  reflection: string;
}

export interface ClassicPoemEntry {
  id: string;
  title: string;
  poet: string;
  era: string;
  genre: string;
  meterInfo: string;
  theme: string;
  content: string;
  explanation: string;
}

export interface SatireExample {
  id: string;
  title: string;
  poet: string;
  century: string;
  workTitle: string;
  excerpt: string;
  modernMeaning: string;
  critiqueTarget: string;
}

export const APHORISM_CATEGORIES: AphorismCategory[] = [
  'Bilim ve Eğitim',
  'Erdem ve Adalet',
  'Dil ve Sanat',
  'Sabır ve Emek',
  'Vatan ve Özgürlük',
];

export const APHORISMS_DATA: AphorismItem[] = [
  {
    id: 'vec-1',
    quote: 'Hayatta en hakiki mürşit ilimdir, fendir.',
    author: 'Mustafa Kemal Atatürk',
    era: '20. Yüzyıl',
    category: 'Bilim ve Eğitim',
    reflection: 'Doğru karar vermede ve ilerlemede akıl, gözlem ve bilimsel yöntemin rehberliğini vurgular.',
  },
  {
    id: 'vec-2',
    quote: 'İlim ilim bilmektir, ilim kendin bilmektir. Sen kendini bilmezsin, ya nice okumaktır.',
    author: 'Yunus Emre',
    era: '13. Yüzyıl',
    category: 'Bilim ve Eğitim',
    reflection: 'Gerçek öğrenmenin yalnızca bilgi ezberlemek değil, insanın kendini ve sorumluluklarını tanıması olduğunu anlatır.',
  },
  {
    id: 'vec-3',
    quote: 'Bilim ve sanat takdir edilmediği yerden göç eder.',
    author: 'İbn Sînâ',
    era: '10.–11. Yüzyıl',
    category: 'Bilim ve Eğitim',
    reflection: 'Merakın, emeğin ve üretken düşüncenin ancak değer gördüğü toplumlarda gelişebileceğini hatırlatır.',
  },
  {
    id: 'vec-4',
    quote: 'Matematik esas olarak sabır olayıdır; belleyerek değil, keşfederek anlamak gerekir.',
    author: 'Cahit Arf',
    era: '20. Yüzyıl',
    category: 'Bilim ve Eğitim',
    reflection: 'Ortaokuldan üniversiteye her öğrenciye ezber yerine neden-sonuç kurarak öğrenmeyi öğütler.',
  },
  {
    id: 'vec-5',
    quote: 'Ya olduğun gibi görün, ya göründüğün gibi ol.',
    author: 'Mevlânâ Celâleddîn-i Rûmî',
    era: '13. Yüzyıl',
    category: 'Erdem ve Adalet',
    reflection: 'İçtenlik, dürüstlük ve karakter tutarlılığının insan ilişkilerindeki temelini özetler.',
  },
  {
    id: 'vec-6',
    quote: 'Eline, beline, diline sahip ol.',
    author: 'Hacı Bektaş-ı Velî',
    era: '13. Yüzyıl',
    category: 'Erdem ve Adalet',
    reflection: 'Davranışlarda ölçülü olmayı, başkasının hakkına saygı duymayı ve incitici sözden kaçınmayı öğütler.',
  },
  {
    id: 'vec-7',
    quote: 'Adalet mülkün temelidir.',
    author: 'Hz. Ömer / Türk-İslam Devlet Geleneği',
    era: 'Klasik Devlet Geleneği',
    category: 'Erdem ve Adalet',
    reflection: 'Bir toplumun ve devletin kalıcılığının ancak eşitlik ve hukuk düzeniyle mümkün olduğunu ifade eder.',
  },
  {
    id: 'vec-8',
    quote: 'İnsan, hakikati aradığı sürece bilge olur; bulduğunu sandığı an yanılgıya düşer.',
    author: 'Fârâbî',
    era: '9.–10. Yüzyıl',
    category: 'Erdem ve Adalet',
    reflection: 'Eleştirel düşünmenin ve ömür boyu öğrenmeye açık kalmanın önemini gösterir.',
  },
  {
    id: 'vec-9',
    quote: 'Türkçe benim ses bayrağımdır.',
    author: 'Fazıl Hüsnü Dağlarca (Kültürel Özdeyiş)',
    era: '20. Yüzyıl',
    category: 'Dil ve Sanat',
    reflection: 'Ana dilin bir milletin hafızasını, duygusunu ve ortak kültürünü taşıyan en güçlü değer olduğunu vurgular.',
  },
  {
    id: 'vec-10',
    quote: 'Sanatsız kalan bir milletin hayat damarlarından biri kopmuş demektir.',
    author: 'Mustafa Kemal Atatürk',
    era: '20. Yüzyıl',
    category: 'Dil ve Sanat',
    reflection: 'Edebiyat, müzik, resim ve mimarinin toplumların ruhsal canlılığı için taşıdığı değeri belirtir.',
  },
  {
    id: 'vec-11',
    quote: 'Söz ola kese savaşı, söz ola bitire başı.',
    author: 'Yunus Emre',
    era: '13. Yüzyıl',
    category: 'Dil ve Sanat',
    reflection: 'İletişimde doğru seçilen kelimelerin barışı ve anlayışı kurabileceğini, dikkatsiz sözün ise çatışma doğurabileceğini anlatır.',
  },
  {
    id: 'vec-12',
    quote: 'Âyînesi iştir kişinin lâfa bakılmaz; şahsın görünür rütbe-i aklı eserinde.',
    author: 'Ziya Paşa',
    era: '19. Yüzyıl',
    category: 'Sabır ve Emek',
    reflection: 'Bir insanın yetkinliği söylediklerinden çok ortaya koyduğu somut eser ve davranışlardan anlaşılır.',
  },
  {
    id: 'vec-13',
    quote: 'Bekayı hak tanıyan sa’yi bir vazife bilir; çalış, çalış ki beka sa’y olursa hak edilir.',
    author: 'Mehmet Âkif Ersoy',
    era: '20. Yüzyıl',
    category: 'Sabır ve Emek',
    reflection: 'Kalıcı başarının ve toplumsal yükselmenin ancak düzenli ve özverili çalışmayla elde edileceğini vurgular.',
  },
  {
    id: 'vec-14',
    quote: 'Dün geçti, yarın henüz gelmedi; bugün ise çalışmak ve üretmek için en kıymetli vakittir.',
    author: 'Ali Kuşçu (Bilim Geleneği)',
    era: '15. Yüzyıl',
    category: 'Sabır ve Emek',
    reflection: 'Zaman yönetimini ve ertelemeden harekete geçmenin akademik başarıdaki payını hatırlatır.',
  },
  {
    id: 'vec-15',
    quote: 'Bir tek mum, binlerce mumu yakabilir ve kendi ışığından hiçbir şey kaybetmez.',
    author: 'Anadolu İrfan Geleneği',
    era: 'Geleneksel',
    category: 'Sabır ve Emek',
    reflection: 'Bilgiyi ve iyiliği arkadaşlarla paylaşmanın eksilmek değil, çoğalmak anlamına geldiğini öğretir.',
  },
  {
    id: 'vec-16',
    quote: 'Özgürlük ve bağımsızlık benim karakterimdir.',
    author: 'Mustafa Kemal Atatürk',
    era: '20. Yüzyıl',
    category: 'Vatan ve Özgürlük',
    reflection: 'Millî Mücadele ruhunun ve kendi kaderini tayin etme bilincinin özlü ifadesidir.',
  },
  {
    id: 'vec-17',
    quote: 'Vatanın bağrına düşman dayamış hançerini; yoğimiş kurtaracak bahtı kara mâderini. (Karşılık: Bulunur kurtaracak bahtı kara mâderini.)',
    author: 'Nâmık Kemal & Mustafa Kemal Atatürk',
    era: '19.–20. Yüzyıl',
    category: 'Vatan ve Özgürlük',
    reflection: 'Nâmık Kemal’in vatan sevgisini dile getiren dizelerine Atatürk’ün TBMM kürsüsünden verdiği umut dolu tarihi yanıttır.',
  },
  {
    id: 'vec-18',
    quote: 'Bildiğim tek şey, hiçbir şey bilmediğimdir.',
    author: 'Sokrates',
    era: 'MÖ 5. Yüzyıl',
    category: 'Bilim ve Eğitim',
    reflection: 'Öğrenmeye açık olmanın ilk adımının merak etmek ve soru sormaktan çekinmemek olduğunu gösterir.',
  },
  {
    id: 'vec-19',
    quote: 'Dünle beraber gitti cancağızım, ne kadar söz varsa düne ait; şimdi yeni şeyler söylemek lazım.',
    author: 'Mevlânâ Celâleddîn-i Rûmî',
    era: '13. Yüzyıl',
    category: 'Sabır ve Emek',
    reflection: 'Geçmiş hatalara takılıp kalmak yerine her gün yenilenmenin, gelişmenin ve üretmenin önemini anlatır.',
  },
  {
    id: 'vec-20',
    quote: 'Bilgi ile göğe yol bulunur; akıl karanlıkta insanın önünü aydınlatan meşaledir.',
    author: 'Yusuf Has Hâcib (Kutadgu Bilig)',
    era: '11. Yüzyıl',
    category: 'Bilim ve Eğitim',
    reflection: 'Türk düşünce tarihinin ilk büyük siyasetnamesinde aklın ve bilginin mutluluğa götüren temel rehber olduğu vurgulanır.',
  },
  {
    id: 'vec-21',
    quote: 'Erdemin başı dildir.',
    author: 'Kaşgarlı Mahmud (Dîvânu Lugâti’t-Türk)',
    era: '11. Yüzyıl',
    category: 'Dil ve Sanat',
    reflection: 'Güzel, doğru ve saygılı konuşmanın hem ahlaki olgunluğun hem de sağlıklı iletişimin ilk adımı olduğunu öğretir.',
  },
  {
    id: 'vec-22',
    quote: 'İnsanı yaşat ki devlet yaşasın.',
    author: 'Şeyh Edebali',
    era: '13. Yüzyıl',
    category: 'Erdem ve Adalet',
    reflection: 'Her türlü kurumun ve yönetimin nihai amacının insanın huzuru, güvenliği ve onurunu korumak olduğunu özetler.',
  },
  {
    id: 'vec-23',
    quote: 'Sahipsiz olan memleketin batması haktır; sen sahip olursan bu vatan batmayacaktır.',
    author: 'Mehmet Âkif Ersoy',
    era: '20. Yüzyıl',
    category: 'Vatan ve Özgürlük',
    reflection: 'Yurttaşlık bilincinin ve ülkesi için çalışıp sorumluluk üstlenmenin bağımsızlıktaki hayati rolünü hatırlatır.',
  },
  {
    id: 'vec-24',
    quote: 'Güzelliğin on par’etmez, bu bendeki aşk olmasa.',
    author: 'Âşık Veysel (Halk Şiiri Özdeyişi)',
    era: '20. Yüzyıl',
    category: 'Dil ve Sanat',
    reflection: 'Dünyaya anlam ve güzellik katan şeyin insanın içindeki sevgi, bakış açısı ve gönül zenginliği olduğunu gösterir.',
  },
  {
    id: 'vec-25',
    quote: 'Hak ile sabır dileyip bize gelen bizdendir; akıl ve ahlak ile çalışıp bizi geçen bizdendir.',
    author: 'Ahî Evran-ı Velî',
    era: '13. Yüzyıl',
    category: 'Sabır ve Emek',
    reflection: 'Gerçek ustalığın yalnızca eskiyi tekrar etmek değil; ahlak ve akılla daha iyisini üretmek olduğunu öğretir.',
  },
  {
    id: 'vec-26',
    quote: 'İlimsiz şiir, temeli olmayan bir duvar gibidir.',
    author: 'Fuzûlî',
    era: '16. Yüzyıl',
    category: 'Dil ve Sanat',
    reflection: 'Sanat ve edebiyatın kalıcı olabilmesi için sağlam bir bilgi, kültür ve düşünce temeline yaslanması gerektiğini vurgular.',
  },
  {
    id: 'vec-27',
    quote: 'Kitap, zekâyı kibarlaştırır; okumak iki ruh arasında kurulan en derin köprüdür.',
    author: 'Cemil Meriç (Kültürel Özdeyiş)',
    era: '20. Yüzyıl',
    category: 'Bilim ve Eğitim',
    reflection: 'Düzenli kitap okumanın empati gücünü, söz varlığını ve düşüncedeki inceliği geliştirdiğini anlatır.',
  },
  {
    id: 'vec-28',
    quote: 'Barika-i hakikat, müsademe-i efkârdan doğar (Gerçeğin şimşeği, fikirlerin çarpışmasından doğar).',
    author: 'Nâmık Kemal',
    era: '19. Yüzyıl',
    category: 'Bilim ve Eğitim',
    reflection: 'Farklı görüşleri saygıyla tartışmanın ve eleştirel düşünmenin doğruya ulaşmadaki rolünü belirtir.',
  },
  {
    id: 'vec-29',
    quote: 'Kişi noksanını bilmek gibi irfan olmaz.',
    author: 'Bursalı İsmail Hakkı / Anadolu İrfanı',
    era: '17.–18. Yüzyıl',
    category: 'Erdem ve Adalet',
    reflection: 'Kendi eksiklerini görebilmenin ve öz eleştiri yapabilmenin en büyük bilgelik olduğunu öğretir.',
  },
  {
    id: 'vec-30',
    quote: 'Bir milleti yaşatan, kendi diline ve tarihine duyduğu sevgidir.',
    author: 'Ömer Seyfettin (Millî Edebiyat Geleneği)',
    era: '20. Yüzyıl Başı',
    category: 'Vatan ve Özgürlük',
    reflection: 'Sade ve güzel Türkçeye sahip çıkmanın kültürel bağımsızlıktaki yerini vurgular.',
  },
];

export const CLASSIC_POEMS_ANTHOLOGY: ClassicPoemEntry[] = [
  {
    id: 'poem-yunus-ilim',
    title: 'İlim İlim Bilmektir',
    poet: 'Yunus Emre',
    era: '13. Yüzyıl · Tasavvuf Halk Şiiri',
    genre: 'Didaktik',
    meterInfo: '7’li / 8’li Hece Ölçüsü',
    theme: 'Kendini Tanıma ve Gerçek Bilgi',
    content: `İlim ilim bilmektir
İlim kendin bilmektir
Sen kendini bilmezsin
Ya nice okumaktır

Okumaktan murat ne
Kişi Hakk’ı bilmektir
Çün okudun bilmezsin
Ha bir kuru emektir`,
    explanation:
      'Yunus Emre, bilginin insanı kibirlendirmek için değil; kendini tanıması, tevazu kazanması ve faydalı olması için edinilmesi gerektiğini sade bir Türkçe ile anlatır.',
  },
  {
    id: 'poem-karacaoglan-incecikten',
    title: 'İncecikten Bir Kar Yağar',
    poet: 'Karacaoğlan',
    era: '17. Yüzyıl · Âşık Tarzı Halk Şiiri',
    genre: 'Pastoral',
    meterInfo: '8’li Hece Ölçüsü (Semai)',
    theme: 'Doğa, Özlem ve Anadolu Yaşamı',
    content: `İncecikten bir kar yağar
Tozar Elif Elif diye
Deli gönül abdal olmuş
Gezer Elif Elif diye

Elif’in uğru nakışlı
Yavru balaban bakışlı
Yayla çiçeği kokuşlu
Kokar Elif Elif diye`,
    explanation:
      'Türk halk şiirinin en duru örneklerinden olan bu semai, Anadolu doğasından alınan benzetmelerle lirik ve akıcı bir söyleyiş sunar.',
  },
  {
    id: 'poem-dadaloglu-ferman',
    title: 'Kalktı Göç Eyledi Avşar Elleri',
    poet: 'Dadaloğlu',
    era: '19. Yüzyıl · Koçaklama / Epik Halk Şiiri',
    genre: 'Epik',
    meterInfo: '11’li Hece Ölçüsü (Koşma)',
    theme: 'Özgürlük, Yiğitlik ve Toroslar',
    content: `Kalktı göç eyledi Avşar elleri
Ağır ağır giden eller bizimdir
Arap atlar yakın eder ırağı
Yüce dağdan aşan yollar bizimdir

Belimizde kılıcımız Kirmanî
Taşı deler mızrağımın temreni
Hakkımızda devlet etmiş fermanı
Ferman padişahın dağlar bizimdir`,
    explanation:
      'Ortaokul Türkçe derslerinde koçaklama türünün en tanınmış örneği olarak işlenir; güçlü, coşkulu ve yiğitçe bir söyleyiş taşır.',
  },
  {
    id: 'poem-pirsultan-dost',
    title: 'Dostun Bahçesine Bir Hoyrat Girmiş',
    poet: 'Pir Sultan Abdal',
    era: '16. Yüzyıl · Tekke / Halk Şiiri',
    genre: 'Lirik',
    meterInfo: '11’li Hece Ölçüsü',
    theme: 'Dostluk, Doğa ve Vefa',
    content: `Öt benim sarı tamburam
Senin aslın ağaçtandır
Ağaç dersem gönüllenme
Kırmızı gül ağaçtandır

Ali Fâtıma yâridir
Ali cömertler eridir
Cümle evliya piridir
Hakk’ın yolu inançtandır`,
    explanation:
      'Sazı (tamburayı) kişileştirerek (teşhis sanatı) seslenen ozan, mütevazı olmanın ve gönül kırmamanın önemini işler.',
  },
  {
    id: 'poem-namik-hurriyet',
    title: 'Hürriyet Kasidesi (Seçme Beyitler)',
    poet: 'Nâmık Kemal',
    era: '19. Yüzyıl · Tanzimat Edebiyatı',
    genre: 'Epik',
    meterInfo: 'Aruz Ölçüsü (Kaside)',
    theme: 'Vatan, Özgürlük ve Toplumsal Sorumluluk',
    content: `Görüp ahkâm-ı asrı münharif sıdk u selâmetten
Çekildik izzet ü ikbâl ile bâb-ı hükûmetten

Ne mümkündür zulüm ile bîdâd ile imhâ-yı hürriyet
Çalış idrâki kaldır muktedirsen âdemiyyetten

Ne efsunkâr imişsin âh ey dîdâr-ı hürriyet
Esîr-i aşkın olduk gerçi kurtulduk esâretten`,
    explanation:
      'Türk edebiyatında "vatan" ve "hürriyet" kavramlarını merkeze taşıyan ilk büyük şiirlerden biridir; baskının insanın düşünme ve özgür olma arzusunu yok edemeyeceğini savunur.',
  },
  {
    id: 'poem-akif-istiklal',
    title: 'İstiklâl Marşı (İlk İki Kıta)',
    poet: 'Mehmet Âkif Ersoy',
    era: '1921 · Millî Edebiyat / Millî Mücadele',
    genre: 'Epik',
    meterInfo: 'Aruz Ölçüsü (4’lükler)',
    theme: 'Bağımsızlık, İnanç ve Millî Birlik',
    content: `Korkma, sönmez bu şafaklarda yüzen al sancak;
Sönmeden yurdumun üstünde tüten en son ocak.
O benim milletimin yıldızıdır, parlayacak;
O benimdir, o benim milletimindir ancak.

Çatma, kurban olayım çehreni ey nazlı hilâl!
Kahraman ırkıma bir gül! Ne bu şiddet, bu celâl?
Sana olmaz dökülen kanlarımız sonra helâl;
Hakkıdır, Hakk’a tapan, milletimin istiklâl!`,
    explanation:
      '12 Mart 1921’de TBMM tarafından kabul edilen millî marşımız, bağımsızlık tutkusunu yüksek bir hitabet ve teşhis (hilâle seslenme) sanatıyla dile getirir.',
  },
  {
    id: 'poem-ziya-lisan',
    title: 'Lisan (Güzel Dilimiz Türkçe)',
    poet: 'Ziya Gökalp',
    era: '20. Yüzyıl Başı · Millî Edebiyat',
    genre: 'Didaktik',
    meterInfo: '11’li Hece Ölçüsü',
    theme: 'Sade Türkçe ve Dil Bilinci',
    content: `Güzel dil Türkçe bize
Başka dil gece bize
İstanbul konuşması
En saf, en ince bize

Uydurma söz yapmayız
Yapma yola sapmayız
Türkçeleşmiş Türkçedir
Eski köke tapmayız`,
    explanation:
      'Türkçenin sadeleşmesini ve halkın konuştuğu canlı dilin yazı dili olmasını savunan Millî Edebiyat anlayışının özetidir.',
  },
  {
    id: 'poem-fuzuli-su',
    title: 'İlimsiz Şiir (Mukaddime ve Gazel Beyitleri)',
    poet: 'Fuzûlî',
    era: '16. Yüzyıl · Divan Edebiyatı',
    genre: 'Lirik',
    meterInfo: 'Aruz Ölçüsü',
    theme: 'Bilginin Değeri ve Gönül İnceliği',
    content: `İlimsiz şiir esası yok duvar gibidir
Ve esassız duvar gayet bî-itibardır

Dost bî-pervâ felek bî-rahm ü devran bî-sükûn
Derd çoh hem-derd yoh düşmen kavî tâli’ zebûn`,
    explanation:
      'Fuzûlî, Türkçe Divan’ının önsözünde bilgiye dayanmayan sanatın temelsiz bir duvar gibi dayanıksız kalacağını vurgular.',
  },
  {
    id: 'poem-koroglu-kocaklama',
    title: 'Benden Selam Olsun Bolu Beyi’ne',
    poet: 'Köroğlu',
    era: '16. Yüzyıl · Koçaklama / Halk Şiiri',
    genre: 'Epik',
    meterInfo: '11’li Hece Ölçüsü (Koşma)',
    theme: 'Yiğitlik, Haksızlığa Başkaldırı ve Cesaret',
    content: `Benden selam olsun Bolu Beyi’ne
Çıkıp şu dağlara yaslanmalıdır
Ok gıcırtısından kalkan sesinden
Dağlar seda verip seslenmelidir

Düşman geldi tabur tabur dizildi
Alnımıza kara yazı yazıldı
Tüfek icad oldu mertlik bozuldu
Eğri kılıç kında paslanmalıdır`,
    explanation:
      'Türk halk edebiyatında koçaklama türünün en güçlü ustası Köroğlu, mertliği ve haksızlığa karşı duruşu gür bir sesle dile getirir.',
  },
  {
    id: 'poem-erzurumlu-emrah',
    title: 'Sabahtan Uğradım Ben Bir Fidana',
    poet: 'Erzurumlu Emrah',
    era: '19. Yüzyıl · Âşık Tarzı Halk Şiiri',
    genre: 'Lirik',
    meterInfo: '11’li Hece Ölçüsü (Koşma)',
    theme: 'Sevgi, Doğa ve Gönül İnceliği',
    content: `Sabahtan uğradım ben bir fidana
Dedim mahmur musun söyledi yok yok
Ak elleri boğum boğum kınalı
Dedim bayram mıdır söyledi yok yok

Dedim Erzurum nen dedi ilimdir
Dedim gider misin dedi yolumdur
Dedim Emrah nedir dedi kulumdur
Dedim satar mısın söyledi yok yok`,
    explanation:
      'Karşılıklı konuşma (dedim–dedi) üslubunun en sevilen örneklerinden biridir; akıcı ritmi ve sıcak halk Türkçesiyle dikkat çeker.',
  },
  {
    id: 'poem-baki-baki-kalan',
    title: 'Bâkî Kalan Bu Kubbede Bir Hoş Sadâ İmiş',
    poet: 'Bâkî (Sultânü’ş-Şuarâ)',
    era: '16. Yüzyıl · Divan Edebiyatı',
    genre: 'Didaktik',
    meterInfo: 'Aruz Ölçüsü (Gazel)',
    theme: 'Kalıcı Eser Bırakmak ve Güzel İz',
    content: `Âvâzeyi bu âleme Dâvûd gibi sal
Bâkî kalan bu kubbede bir hoş sadâ imiş

Kadrini seng-i musallâda bilüp ey Bâkî
Durup el bağlayalar karşına yârân saf saf`,
    explanation:
      '“Şairler Sultanı” Bâkî, dünyada mal mülkün geçici olduğunu; insanın ardında bırakacağı en büyük mirasın iyilik, sanat ve “hoş bir sadâ” olduğunu anlatır.',
  },
  {
    id: 'poem-seyh-galip',
    title: 'Hoşça Bak Zâtına Kim Zübde-i Âlemsin Sen',
    poet: 'Şeyh Galip',
    era: '18. Yüzyıl · Divan Edebiyatı',
    genre: 'Didaktik',
    meterInfo: 'Aruz Ölçüsü (Terkîb-i Bend)',
    theme: 'İnsan Onuru ve Özsaygı',
    content: `Hoşça bak zâtına kim zübde-i âlemsin sen
Merdüm-i dîde-i ekvân olan âdemsin sen`,
    explanation:
      '“Kendine değer ver ve güzel bak; çünkü sen kâinatın özü ve bütün varlığın gözbebeği olan insansın!” anlamına gelen bu beyit, insan onurunu yücelten en ünlü klasik dizelerdendir.',
  },
  {
    id: 'poem-yunus-gelin-tanisalim',
    title: 'Gelin Tanış Olalım',
    poet: 'Yunus Emre',
    era: '13. Yüzyıl · Tasavvuf Halk Şiiri',
    genre: 'Lirik',
    meterInfo: '8’li Hece Ölçüsü (İlahi)',
    theme: 'Sevgi, Barış ve Kardeşlik',
    content: `Gelin tanış olalım
İşi kolay kılalım
Sevelim sevilelim
Dünya kimseye kalmaz

Ben gelmedim dava için
Benim işim sevi için
Dostun evi gönüllerdir
Gönüller yapmaya geldim`,
    explanation:
      'Yunus Emre’nin barış, sevgi ve gönül kırmama felsefesini en sade, en ezberlenebilir Türkçeyle özetleyen ölümsüz dörtlükleridir.',
  },
  {
    id: 'poem-akif-zulmu-alkislayamam',
    title: 'Zulmü Alkışlayamam (Seçme Dizeler)',
    poet: 'Mehmet Âkif Ersoy',
    era: '20. Yüzyıl Başı · Safahat',
    genre: 'Didaktik',
    meterInfo: 'Aruz Ölçüsü',
    theme: 'Dürüstlük, İlkeli Duruş ve Hakkaniyet',
    content: `Zulmü alkışlayamam, zâlimi asla sevemem;
Gelenin keyfi için geçmişe kalkıp sövemem.
Üç buçuk soysuzun ardından zağarlık yapamam;
Hele hak nâmına haksızlığa ölsem tapamam.

Yumuşak başlı isem, kim dedi uysal koyunum?
Kesilir belki, fakat çekmeye gelmez boyunum!`,
    explanation:
      'Mehmet Âkif Ersoy, karakter sağlamlığını, haksızlık karşısında susmamayı ve ilkeli duruşu güçlü bir hitabetle ifade eder.',
  },
  {
    id: 'poem-karacaoglan-yuru-bre-yalan-dunya',
    title: 'Üryan Geldim Yine Üryan Giderim',
    poet: 'Karacaoğlan',
    era: '17. Yüzyıl · Âşık Tarzı Halk Şiiri',
    genre: 'Didaktik',
    meterInfo: '11’li Hece Ölçüsü (Koşma)',
    theme: 'Tevazu ve Yaşamın Değeri',
    content: `Üryan geldim yine üryan giderim
Ölmemeğe elde fermanım mı var
Azrail gelmiş de can talep eyler
Benim can vermeğe dermanım mı var

Karac’oğlan der ki ismim öğerler
Ağu oldu yediğimiz şekerler
Güzel sever deyi isnad ederler
Benim Hak’tan özge sevdiğim mi var`,
    explanation:
      'İnsanın geçici dünya malına kibirle bağlanmaması gerektiğini akıcı 11’li hece ölçüsüyle işleyen klasik bir halk koşmasıdır.',
  },
];

export const SATIRE_TASLAMA_EXAMPLES: SatireExample[] = [
  {
    id: 'sat-harname',
    title: 'Harnâme — Boynuz Ararken Kulaktan Olmak',
    poet: 'Şeyhî',
    century: '15. Yüzyıl (Divan Edebiyatı · Fabl & Hiciv)',
    workTitle: 'Harnâme Mesnevisi',
    excerpt: `Bâtıl isteyü haktan ayrıldım
Boynuz umdum kulaktan ayrıldım`,
    modernMeaning:
      '“Olmayacak bir şeyin peşine düşüp doğru yoldan ayrıldım; boynuz kazanayım derken kendi kulaklarımdan da oldum.”',
    critiqueTarget:
      'Açgözlülüğü, kendi emeğiyle yetinmeyip başkasının hakkına göz dikmeyi ve haddini bilmemeyi ince bir fabl kurgusuyla eleştirir.',
  },
  {
    id: 'sat-fuzuli',
    title: 'Şikâyetnâme — Selam Verdim, Rüşvet Değildir Diye Almadılar',
    poet: 'Fuzûlî',
    century: '16. Yüzyıl (Divan Nesri · Sosyal Hiciv)',
    workTitle: 'Şikâyetnâme Mektubu',
    excerpt: `Selâm verdüm rüşvet değüldür deyü almadılar.
Hükm gösterdüm fâidesüzdür deyü mültefit olmadılar.`,
    modernMeaning:
      '“Selam verdim, rüşvet değildir diye almadılar; resmî fermanı gösterdim, faydasızdır diye yüzüne bile bakmadılar.”',
    critiqueTarget:
      'Dönemin bazı vakıf memurlarındaki bürokratik duyarsızlığı ve rüşvet kültürünü zekice bir mizahla eleştiren Türk edebiyatının en ünlü edebî mektubudur.',
  },
  {
    id: 'sat-seyrani',
    title: 'Mahkeme Meclisi ve Adalet Taşlaması',
    poet: 'Everekli Seyrânî',
    century: '19. Yüzyıl (Halk Edebiyatı · Taşlama)',
    workTitle: 'Taşlamalar',
    excerpt: `Mahkeme meclisi icad olduğu
Çeşme-i rüşvetin akmaklığından
Kaza bela ile âlem dolduğu
Kazların kadıya uçmaklığından`,
    modernMeaning:
      '“Adalet meclislerinin bozulması rüşvet çeşmesinin akmasından, toplumun dertle dolması ise hediye kazların kadıya uçmasındandır.”',
    critiqueTarget:
      'Halk ozanı Seyrânî, adaletin tarafsızlığını zedeleyen çıkar ilişkilerini kinaye ve mecaz kullanarak cesurca taşlar.',
  },
  {
    id: 'sat-kazak-abdal',
    title: 'Eşeği Saldım Çayıra',
    poet: 'Kazak Abdal',
    century: '17. Yüzyıl (Halk Edebiyatı · Taşlama)',
    workTitle: 'Taşlama',
    excerpt: `Ormanda büyüyen adam azgını
Çarşıda pazarda insan beğenmez
Medrese kaçkını softa bozgunu
Selam vermek için insan beğenmez`,
    modernMeaning:
      '“Kendi eksiklerini görmeyen kibirli kimseler, çarşıda pazarda kimseyi beğenmez ve bir selamı bile çok görür.”',
    critiqueTarget:
      'Kibri, görgüsüzlüğü, yarım yamalak bilgiyle başkalarını küçümsemeyi ve ikiyüzlülüğü alaycı bir halk diliyle eleştirir.',
  },
  {
    id: 'sat-ziya-pasa',
    title: 'Terkîb-i Bend — Bilgi ve Görgü Eleştirisi',
    poet: 'Ziya Paşa',
    century: '19. Yüzyıl (Tanzimat · Hikemî Hiciv)',
    workTitle: 'Terkîb-i Bend',
    excerpt: `Bed-asla necâbet mi verir hiç üniforma
Zer-dûz palan ursan eşek yine eşektir`,
    modernMeaning:
      '“Soylu bir karaktere sahip olmayana gösterişli giysi asalet kazandırmaz; altın işlemeli semer vursan bile öz değişmez.”',
    critiqueTarget:
      'Dış görünüşe, makama ve gösterişe aldanmayı; gerçek değerin süslü kıyafette değil ahlak ve liyakatte olduğunu vurgular.',
  },
  {
    id: 'sat-ruhi',
    title: 'Terkîb-i Bend — Dünya Hırsı ve Samimiyetsizlik',
    poet: 'Bağdatlı Rûhî',
    century: '16. Yüzyıl (Divan Edebiyatı · Sosyal Eleştiri)',
    workTitle: 'Terkîb-i Bend',
    excerpt: `Sanman bizi kim şîre-i engûr ile mestiz
Biz ehl-i harâbâtdanız mest-i elestiz
...
Dün gün arayıp bulmadık bir gönül ehli
Herkes kendi çıkarının peşinde kalmış`,
    modernMeaning:
      'Şair, gösteriş düşkünlüğünü, çıkarcılığı ve gerçek dostluğun azalmasını dönemin toplum yaşamı üzerinden eleştirir.',
    critiqueTarget:
      'Toplumdaki yapmacık övgüleri, çıkar ilişkilerini ve samimiyet eksikliğini ince bir ironiyle ortaya koyar.',
  },
  {
    id: 'sat-nefi',
    title: 'Sihâm-ı Kazâ — Sözün Gücü ve Eleştiri Cesareti',
    poet: 'Nef’î',
    century: '17. Yüzyıl (Divan Edebiyatı · Hiciv Ustası)',
    workTitle: 'Sihâm-ı Kazâ (Kaza Okları)',
    excerpt: `Sözümde şûhî vü şîve tamâm olur ammâ
Hicivde tîr-i zebânım hedefden şaşmaz`,
    modernMeaning:
      '“Şiirimde zarafet ve incelik vardır; ancak haksızlığı eleştirdiğimde söz oklarım hedeften asla şaşmaz.”',
    critiqueTarget:
      'Dönemindeki liyakatsizliği ve gösterişçi kibri güçlü belagat ve keskin hiciv diliyle eleştirir.',
  },
  {
    id: 'sat-sair-esref',
    title: 'Gölge Etme Başka İhsan İstemem Geleneği',
    poet: 'Şair Eşref',
    century: '19.–20. Yüzyıl (Meşrutiyet · Modern Hiciv)',
    workTitle: 'Hicviyeler',
    excerpt: `Kabrimi kimse ziyaret etmesin Allah için
Gelmesin reddeylerim billâhi öz kardeşimi
Gözlerim ebnâ-yı âdemden o rütbe yıldı kim
İstemem ben fâtiha, tek çalmasınlar taşımı`,
    modernMeaning:
      '“İnsanların samimiyetsizliğinden ve çıkar hesabından o kadar yoruldum ki, mezar taşıma dokunmasınlar yeter!”',
    critiqueTarget:
      'Toplumdaki ikiyüzlülüğü, çıkarcılığı ve sözde dostluğu kara mizah (ironi) yoluyla eleştirir.',
  },
  {
    id: 'sat-dertli',
    title: 'Telli Saz — “Şeytan Bunun Neresinde?”',
    poet: 'Âşık Dertli',
    century: '19. Yüzyıl (Halk Edebiyatı · Taşlama)',
    workTitle: 'Telli Saz Taşlaması',
    excerpt: `Telli sazdır bunun adı
Ne âyet dinler ne kadı
Bunu çalan anlar kendi
Şeytan bunun neresinde

Abdest alsan aldın demez
Namaz kılsan kıldın demez
Kadı gibi haram yemez
Şeytan bunun neresinde`,
    modernMeaning:
      '“Müzik ve saz insana zarar vermez, kimsenin hakkını yemez; onu yasaklamaya çalışan bağnazlık asıl sorgulanması gerekendir.”',
    critiqueTarget:
      'Sanata ve müziğe karşı ön yargılı, dar görüşlü tutumları mizahi ve akıcı bir halk şiiri diliyle eleştirir.',
  },
  {
    id: 'sat-kaygusuz-abdal',
    title: 'Kaplu Kaplu Bağalar — Mizahi Şathiye & Taşlama',
    poet: 'Kaygusuz Abdal',
    century: '14.–15. Yüzyıl (Tekke Halk Edebiyatı · Mizahi Hiciv)',
    workTitle: 'Şathiyeler',
    excerpt: `Kaplu kaplu bağalar
Kanatlanmış uçmağa
Kertenkele derilmiş
Kırım suyun geçmeğe`,
    modernMeaning:
      '“Kaplumbağalar kanatlanıp uçmaya kalkmış, kertenkeleler toplanıp koca denizi geçmeye soyunmuş!”',
    critiqueTarget:
      'Yeteneği ve birikimi olmadığı hâlde büyük iddialarda bulunanları eğlenceli, masalsı bir abartma (mübalağa) sanatı ile hicveder.',
  },
  {
    id: 'sat-nabi-hayriyye',
    title: 'Hayriyye — Liyakat ve Cehalet Eleştirisi',
    poet: 'Nâbî',
    century: '17. Yüzyıl (Divan Edebiyatı · Hikemî Hiciv)',
    workTitle: 'Hayriyye (Oğluna Öğütler)',
    excerpt: `Câhilin sohbeti zehr-i kâtildir
Âlimin meclisi bâğ-ı fâzıldır`,
    modernMeaning:
      '“Bilgisiz ve önyargılı meclisler zihni zehirler; bilgi ve erdem sahiplerinin sohbeti ise insanı büyüten bir bahçedir.”',
    critiqueTarget:
      'Oğlu Ebulhayr’a hitaben yazdığı eserde dönemin tembelliğini, rüşveti ve ilimden uzaklaşmayı hikmetli bir dille eleştirir.',
  },
];
