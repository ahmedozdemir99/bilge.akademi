export interface SolvedLogic { topic:string; question:string; answer:string; solution:string }
export const VERBAL_LOGIC: SolvedLogic[] = [
  {
    "topic": "Sıralama",
    "question": "Ayşe, Bora ve Cem yan yana oturuyor. Ayşe en solda, Cem Bora'nın sağında. Ortada kim oturur?",
    "answer": "Bora",
    "solution": "Ayşe soldadır. Cem, Bora'nın sağında olacağı için sıra Ayşe–Bora–Cem olur."
  },
  {
    "topic": "Koşullu çıkarım",
    "question": "Kütüphane açıksa görevli içeridedir. Görevli içeride değil. Kütüphane açık olabilir mi?",
    "answer": "Hayır",
    "solution": "Açık olsaydı görevli içeride olurdu. Sonucun yanlışlığı koşulun gerçekleşmediğini gösterir."
  },
  {
    "topic": "Küme mantığı",
    "question": "Bütün martılar kuştur. Bazı kuşlar uçamaz. 'Bazı martılar uçamaz' kesin çıkar mı?",
    "answer": "Hayır",
    "solution": "Uçamayan kuşların martı olduğu belirtilmemiştir."
  },
  {
    "topic": "Yerleştirme",
    "question": "Üç raftan kırmızı kitap üstte, mavi kitap kırmızının altında, yeşil kitap mavinin altında. Ortadaki kitap hangisi?",
    "answer": "Mavi",
    "solution": "Üstten alta sıralama kırmızı, mavi, yeşildir."
  },
  {
    "topic": "Takvim",
    "question": "Toplantı salıdan iki gün sonra, perşembeden bir gün önce değildir. Toplantı hangi gün?",
    "answer": "Perşembe",
    "solution": "Salıdan iki gün sonrası perşembedir. 'Perşembeden bir gün önce değildir' koşuluyla çelişmez."
  },
  {
    "topic": "Sözel ilişki",
    "question": "Kalem : yazmak ilişkisine benzer olarak makas : ?",
    "answer": "Kesmek",
    "solution": "Araç ile temel kullanım amacı eşleştirilir."
  },
  {
    "topic": "Öncelik",
    "question": "Deniz, Ece'den önce; Ece, Fırat'tan önce yarışmayı bitirdi. İlk bitiren kim?",
    "answer": "Deniz",
    "solution": "Geçişlilik: Deniz < Ece < Fırat."
  },
  {
    "topic": "Olumsuzlama",
    "question": "'Bütün öğrenciler kitap okudu' önermesinin mantıksal değili nedir?",
    "answer": "En az bir öğrenci kitap okumadı.",
    "solution": "Tümel olumlu önermenin değili varlıksal olumsuz önermedir."
  },
  {
    "topic": "Doğru-yanlış",
    "question": "Ali 'Berk yalan söylüyor' diyor. Berk 'İkimiz de yalan söylüyoruz' diyor. Kim doğru söylüyor?",
    "answer": "Ali",
    "solution": "Berk doğru söylese kendisi yalan söylüyor olur, çelişki çıkar. Berk yalancı, Ali doğrudur."
  },
  {
    "topic": "Çıkarım",
    "question": "Bir şehirde tüm elektrikli otobüsler mavidir. 34 numaralı otobüs kırmızıdır. 34 numaralı otobüs elektrikli olabilir mi?",
    "answer": "Hayır",
    "solution": "Elektrikli olsaydı mavi olması gerekirdi; kırmızı olduğu için elektrikli değildir."
  }
];
export const NUMERIC_LOGIC: SolvedLogic[] = [
  {
    "topic": "Sayı örüntüsü",
    "question": "3, 7, 15, 31, ? dizisinin sonraki terimi kaçtır?",
    "answer": "63",
    "solution": "Her terim öncekinin iki katının bir fazlasıdır: 31×2+1=63."
  },
  {
    "topic": "İşçi problemi",
    "question": "Aynı hızda çalışan 4 işçi bir işi 12 günde bitiriyor. 6 işçi aynı işi kaç günde bitirir?",
    "answer": "8 gün",
    "solution": "İş miktarı 4×12=48 işçi-gündür. 48÷6=8."
  },
  {
    "topic": "Yaş problemi",
    "question": "Ali'nin yaşı Ayşe'nin yaşının iki katıdır. 6 yıl sonra yaşları toplamı 42 olacak. Ali bugün kaç yaşında?",
    "answer": "20",
    "solution": "Bugünkü toplam 42−12=30. Ayşe x, Ali 2x ise 3x=30; Ali=20."
  },
  {
    "topic": "Ortalama",
    "question": "Dört sayının ortalaması 18'dir. İlk üçü 12, 16 ve 20 ise dördüncü sayı kaçtır?",
    "answer": "24",
    "solution": "Toplam 72; bilinenlerin toplamı 48; eksik sayı 24."
  },
  {
    "topic": "Hız",
    "question": "Bir araç 180 km yolu 3 saatte alıyor. Aynı hızla 5 saatte kaç km gider?",
    "answer": "300 km",
    "solution": "Hız 180÷3=60 km/sa. Yol=60×5=300."
  },
  {
    "topic": "Kalan",
    "question": "Bir sayının 5'e bölümünden kalan 3'tür. Bu sayının 5 katının 5'e bölümünden kalan kaçtır?",
    "answer": "0",
    "solution": "5n her zaman 5'in tam katıdır."
  },
  {
    "topic": "Olasılık",
    "question": "Bir torbada 4 kırmızı, 6 mavi bilye var. Yerine koymadan iki bilye çekilirse ikisinin de kırmızı olma olasılığı nedir?",
    "answer": "2/15",
    "solution": "(4/10)×(3/9)=12/90=2/15."
  },
  {
    "topic": "Yüzde değişim",
    "question": "100 TL'lik ürün önce %20 zamlanıp sonra yeni fiyatından %20 indirilirse son fiyat kaç TL olur?",
    "answer": "96 TL",
    "solution": "100×1,20×0,80=96. Zam ve indirim birbirini götürmez."
  },
  {
    "topic": "Geometrik mantık",
    "question": "Çevresi 48 cm olan bir dikdörtgenin uzun kenarı kısa kenarının iki katıdır. Alanı kaç cm²?",
    "answer": "128 cm²",
    "solution": "2(a+2a)=48 ⇒ a=8; kenarlar 8 ve 16, alan 128."
  },
  {
    "topic": "Tablo okuma",
    "question": "Pazartesi 12, salı 18, çarşamba 15 kitap ödünç verildi. Günlük ortalama kaç kitaptır?",
    "answer": "15",
    "solution": "(12+18+15)÷3=15."
  }
];
export const RIDDLES: SolvedLogic[] = [
  {
    "topic": "Bilmece 1",
    "question": "Ne kadar çok alırsan o kadar büyür?",
    "answer": "Çukur",
    "solution": "Çukurdan toprak aldıkça çukur genişler."
  },
  {
    "topic": "Bilmece 2",
    "question": "Dili yoktur ama konuşur; kulağı yoktur ama yanıt verir. Nedir?",
    "answer": "Yankı",
    "solution": "Sesin yansıması konuşma gibi geri döner."
  },
  {
    "topic": "Bilmece 3",
    "question": "İçine ne kadar koyarsan o kadar hafifleyen şey nedir?",
    "answer": "Delikli sepet",
    "solution": "Bilmece mecazidir: Delik açıldıkça sepetten malzeme eksilir."
  },
  {
    "topic": "Bilmece 4",
    "question": "Gece ortaya çıkar, gündüz kaybolur; gökte parlar. Nedir?",
    "answer": "Yıldız",
    "solution": "Gündüz Güneş'in parlaklığı nedeniyle çoğu yıldız görünmez."
  },
  {
    "topic": "Bilmece 5",
    "question": "Bir odanın dört köşesinde birer kedi var. Her kedi üç kedi görüyor. Toplam kaç kedi vardır?",
    "answer": "4",
    "solution": "Her köşedeki kedi diğer üç kediyi görür."
  },
  {
    "topic": "Bilmece 6",
    "question": "Hangi ayda 28 gün vardır?",
    "answer": "Hepsinde",
    "solution": "Bütün aylar en az 28 gün sürer."
  },
  {
    "topic": "Bilmece 7",
    "question": "Bir yarışta ikinciyi geçersen kaçıncı olursun?",
    "answer": "İkinci",
    "solution": "İkinci sıradakinin yerini alırsın."
  },
  {
    "topic": "Bilmece 8",
    "question": "Kırılmadan kullanılamayan şey nedir?",
    "answer": "Yumurta",
    "solution": "Yemek için kabuğu kırılır."
  },
  {
    "topic": "Bilmece 9",
    "question": "Yürür ama ayağı yoktur, akar ama su değildir. Nedir?",
    "answer": "Zaman",
    "solution": "Zamanın akması mecazdır."
  },
  {
    "topic": "Bilmece 10",
    "question": "Bir kutuda 10 mum var, 3'ü söndü. Geriye kaç mum kalır?",
    "answer": "10",
    "solution": "Sönmek mumun yok olması değildir."
  },
  {
    "topic": "Bilmece 11",
    "question": "Ağzı vardır konuşmaz, yatağı vardır uyumaz. Nedir?",
    "answer": "Nehir",
    "solution": "Nehir ağzı ve yatağı coğrafi terimlerdir."
  },
  {
    "topic": "Bilmece 12",
    "question": "Her zaman önündedir ama onu göremezsin. Nedir?",
    "answer": "Gelecek",
    "solution": "Gelecek henüz yaşanmamıştır."
  },
  {
    "topic": "Bilmece 13",
    "question": "Kendisi ıslanırken başkasını kurutur. Nedir?",
    "answer": "Havlu",
    "solution": "Su havluya geçer."
  },
  {
    "topic": "Bilmece 14",
    "question": "Bir şeyi paylaştıkça çoğalır. Nedir?",
    "answer": "Bilgi",
    "solution": "Bilgi başkalarına aktarıldığında daha çok kişi tarafından bilinir."
  },
  {
    "topic": "Bilmece 15",
    "question": "İki baba ve iki oğul balığa çıktı, toplam üç balık yakaladı. Her biri bir balık aldı. Nasıl?",
    "answer": "Dede, baba ve oğul",
    "solution": "Üç kişi, iki baba ve iki oğul rolünü karşılar."
  },
  {
    "topic": "Bilmece 16",
    "question": "Sabah dört, öğle iki, akşam üç ayakla yürüyen nedir?",
    "answer": "İnsan",
    "solution": "Bebek emekler, yetişkin iki ayakla yürür, yaşlı baston kullanabilir."
  },
  {
    "topic": "Bilmece 17",
    "question": "Sahibi onu başkalarından daha az kullanır. Nedir?",
    "answer": "İsim",
    "solution": "İnsanın adını çoğunlukla başkaları söyler."
  },
  {
    "topic": "Bilmece 18",
    "question": "Yazdıkça kısalır. Nedir?",
    "answer": "Kurşun kalem",
    "solution": "Ucu açılıp kullanıldıkça kalem kısalır."
  },
  {
    "topic": "Bilmece 19",
    "question": "Her soruya cevap verir ama hiçbir şey bilmez. Nedir?",
    "answer": "Ayna",
    "solution": "Ayna görüntüyü yansıtır; bu bir mecazdır."
  },
  {
    "topic": "Bilmece 20",
    "question": "Bir kapının anahtarı yok, kilidi yok; içinde sarı bir hazine var. Nedir?",
    "answer": "Yumurta",
    "solution": "Kabuk içindeki sarı kısım yumurta sarısıdır."
  }
];
export const ORIGINAL_MANIS = [
  {
    "title": "Mani 1",
    "text": "Bahçelerde mor menekşe\nGülümser bize güneşe\nBir kitap aç her akşam\nBilgi dolar her köşeye"
  },
  {
    "title": "Mani 2",
    "text": "Dağ başında ince duman\nYollar uzar zaman zaman\nDost elini tutunca\nGüzel geçer her zaman"
  },
  {
    "title": "Mani 3",
    "text": "Penceremde küçük kuşlar\nSabah erken ötüşürler\nBirlik olup çalışınca\nZor işler de çözülürler"
  },
  {
    "title": "Mani 4",
    "text": "Gökte yıldız sayılır mı\nSevgi gönle yayılır mı\nGüzel sözle açan kalp\nKırgınlığa kayılır mı"
  },
  {
    "title": "Mani 5",
    "text": "Dere akar taş üstüne\nGüneş vurur baş üstüne\nBir fidan dik bugün sen\nGölge olsun yar üstüne"
  },
  {
    "title": "Mani 6",
    "text": "Defterimde mavi çizgi\nHer sayfada yeni bilgi\nSoru soran çocuklar\nAçar geleceğe çizgi"
  },
  {
    "title": "Mani 7",
    "text": "Yağmur yağar tane tane\nGül açılır hane hane\nPaylaşınca çoğalır\nSevinç düşer her haneye"
  },
  {
    "title": "Mani 8",
    "text": "Kırlangıçlar uçar gider\nRüzgâr dalları eğdirir\nSabır ile çalışanı\nEmek hedefine götürür"
  },
  {
    "title": "Mani 9",
    "text": "Ay doğmuş dağın ardına\nIşık düşmüş yol ardına\nBir iyilik bırak bugün\nDönsün yarın yurduna"
  },
  {
    "title": "Mani 10",
    "text": "Deniz mavi gökler mavi\nYelken açar küçük gemi\nDüşün, araştır, öğren sen\nBilgi olsun yol rehberi"
  }
];
