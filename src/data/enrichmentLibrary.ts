export type EnrichmentModule = 'mathematics' | 'science' | 'english' | 'history' | 'literature' | 'religion' | 'philosophy';
export interface EnrichmentActivity { topic: string; question: string; answer: string; explanation: string }
export const ENRICHMENT_LIBRARY: Record<EnrichmentModule, EnrichmentActivity[]> = {
  "mathematics": [
    {
      "topic": "EBOB",
      "question": "24 ve 36 sayfalık iki kitapçık eşit büyüklükte, artmayacak sayfa gruplarına ayrılacak. En büyük grup kaç sayfa olur?",
      "answer": "12",
      "explanation": "24 ve 36'nın ortak bölenlerinin en büyüğü 12'dir."
    },
    {
      "topic": "EKOK",
      "question": "Bir zil 8, diğeri 12 dakikada bir çalıyor. Birlikte çaldıktan kaç dakika sonra yeniden birlikte çalarlar?",
      "answer": "24",
      "explanation": "8 ve 12'nin en küçük ortak katı 24'tür."
    },
    {
      "topic": "Yüzde",
      "question": "240 TL'lik ürün %25 indirimle kaç TL olur?",
      "answer": "180 TL",
      "explanation": "240'ın dörtte biri 60 TL; 240−60=180."
    },
    {
      "topic": "Oran",
      "question": "Bir sınıfta kız/erkek oranı 3/4 ve toplam 28 öğrenci var. Kız sayısı kaçtır?",
      "answer": "12",
      "explanation": "Toplam 7 pay vardır; her pay 4 öğrenci, kızlar 3×4=12."
    },
    {
      "topic": "Denklem",
      "question": "3x+7=28 denklemini çözünüz.",
      "answer": "x=7",
      "explanation": "28−7=21 ve 21÷3=7."
    },
    {
      "topic": "Olasılık",
      "question": "Torbadaki 3 kırmızı ve 5 mavi bilyeden rastgele birinin kırmızı olma olasılığı nedir?",
      "answer": "3/8",
      "explanation": "8 eş olasılıklı bilyenin 3'ü kırmızıdır."
    },
    {
      "topic": "Üslü sayılar",
      "question": "2³×2⁴ işleminin sonucu nedir?",
      "answer": "128",
      "explanation": "Aynı tabanlı çarpımda üsler toplanır: 2⁷=128."
    },
    {
      "topic": "Karekök",
      "question": "√144 + √81 kaçtır?",
      "answer": "21",
      "explanation": "12+9=21."
    },
    {
      "topic": "Geometri",
      "question": "Tabanı 10 cm, yüksekliği 6 cm olan üçgenin alanı nedir?",
      "answer": "30 cm²",
      "explanation": "Üçgen alanı taban×yükseklik÷2'dir."
    },
    {
      "topic": "Veri analizi",
      "question": "4, 6, 6, 8, 11 veri grubunun aritmetik ortalaması kaçtır?",
      "answer": "7",
      "explanation": "Toplam 35, veri sayısı 5; ortalama 7."
    }
  ],
  "science": [
    {
      "topic": "Maddenin hâlleri",
      "question": "Buz erirken sıcaklık neden bir süre sabit kalır?",
      "answer": "Enerji hâl değişimine harcanır.",
      "explanation": "Alınan ısı, tanecikler arası etkileşimleri değiştirmeye gider."
    },
    {
      "topic": "Basınç",
      "question": "Aynı ağırlıkta iki cismin zemine uyguladığı basınç hangi durumda daha büyüktür?",
      "answer": "Temas alanı küçükken.",
      "explanation": "Basınç, kuvvetin yüzey alanına bölümüdür."
    },
    {
      "topic": "Elektrik",
      "question": "Seri bağlı iki ampulden biri çıkarılırsa diğerine ne olur?",
      "answer": "Söner.",
      "explanation": "Seri devrede akım yolu kesilir."
    },
    {
      "topic": "DNA",
      "question": "DNA'da adenin hangi bazla eşleşir?",
      "answer": "Timin.",
      "explanation": "DNA'nın tamamlayıcı baz eşleşmesi A–T, G–C'dir."
    },
    {
      "topic": "Fotosentez",
      "question": "Bitki fotosentezde hangi gazı tüketir?",
      "answer": "Karbondioksit.",
      "explanation": "Işık enerjisiyle CO₂ ve su kullanılarak organik besin üretilir."
    },
    {
      "topic": "Mevsimler",
      "question": "Dünya'da mevsimlerin temel nedeni nedir?",
      "answer": "Eksen eğikliği ve dolanma hareketi.",
      "explanation": "Güneş ışınlarının geliş açısı yıl boyunca değişir."
    },
    {
      "topic": "Asit-baz",
      "question": "pH değeri 3 olan çözelti asidik mi bazik mi?",
      "answer": "Asidik.",
      "explanation": "pH 7'nin altı asidik kabul edilir."
    },
    {
      "topic": "Kaldırma kuvveti",
      "question": "Sıvıda yüzen cisme etki eden kaldırma kuvveti ağırlığına göre nasıldır?",
      "answer": "Eşittir.",
      "explanation": "Dengede yüzen cisimde düşey kuvvetler dengelenir."
    },
    {
      "topic": "Periyodik sistem",
      "question": "Aynı gruptaki elementlerin hangi özelliği çoğu zaman benzerdir?",
      "answer": "Kimyasal özellikleri.",
      "explanation": "Benzer değerlik elektron düzenleri benzer tepkimelere yol açar."
    },
    {
      "topic": "Ekosistem",
      "question": "Besin zincirinde üreticiler neden ilk basamakta yer alır?",
      "answer": "Enerjiyi besine dönüştürürler.",
      "explanation": "Üreticiler ışık veya kimyasal enerjiden organik madde sentezler."
    }
  ],
  "english": [
    {
      "topic": "Present simple",
      "question": "Complete: She ___ to school every day. (go)",
      "answer": "goes",
      "explanation": "Third-person singular takes -s/-es in affirmative present simple."
    },
    {
      "topic": "Past simple",
      "question": "Complete: We ___ a film yesterday. (watch)",
      "answer": "watched",
      "explanation": "Regular verbs take -ed in past simple."
    },
    {
      "topic": "Comparatives",
      "question": "Complete: A train is ___ than a bicycle. (fast)",
      "answer": "faster",
      "explanation": "Short adjectives typically take -er."
    },
    {
      "topic": "Modals",
      "question": "Choose the advice: You ___ drink water when thirsty.",
      "answer": "should",
      "explanation": "Should expresses advice."
    },
    {
      "topic": "Vocabulary",
      "question": "What does 'borrow' mean in Turkish?",
      "answer": "Ödünç almak",
      "explanation": "Borrow means receiving something temporarily, not lending it."
    },
    {
      "topic": "Time",
      "question": "How do you say 07:30 in English?",
      "answer": "Half past seven",
      "explanation": "Half past means thirty minutes after the hour."
    },
    {
      "topic": "Directions",
      "question": "Translate: Turn left at the traffic lights.",
      "answer": "Trafik ışıklarında sola dön.",
      "explanation": "Turn left is a direction instruction."
    },
    {
      "topic": "Questions",
      "question": "Make a question: You like science.",
      "answer": "Do you like science?",
      "explanation": "Present-simple questions with you use do."
    },
    {
      "topic": "Future",
      "question": "Complete: I think it ___ rain tomorrow. (will)",
      "answer": "will",
      "explanation": "Will is commonly used for predictions."
    },
    {
      "topic": "Reading",
      "question": "Read: 'Mia studies at night because it is quiet.' Why does Mia study at night?",
      "answer": "Because it is quiet.",
      "explanation": "The reason follows because."
    }
  ],
  "history": [
    {
      "topic": "Kronoloji",
      "question": "Malazgirt Savaşı hangi yılda gerçekleşti?",
      "answer": "1071",
      "explanation": "Malazgirt 1071 yılında Bizans ve Büyük Selçuklu arasında yaşandı."
    },
    {
      "topic": "Osmanlı",
      "question": "İstanbul'un fethi hangi yıldadır?",
      "answer": "1453",
      "explanation": "II. Mehmet dönemindeki fetih 1453'tedir."
    },
    {
      "topic": "Millî Mücadele",
      "question": "Samsun'a çıkış tarihi nedir?",
      "answer": "19 Mayıs 1919",
      "explanation": "Mustafa Kemal'in Samsun'a çıkışı Millî Mücadele'nin önemli başlangıç aşamasıdır."
    },
    {
      "topic": "TBMM",
      "question": "TBMM hangi tarihte açıldı?",
      "answer": "23 Nisan 1920",
      "explanation": "Ankara'da 23 Nisan 1920'de açıldı."
    },
    {
      "topic": "Cumhuriyet",
      "question": "Cumhuriyet hangi tarihte ilan edildi?",
      "answer": "29 Ekim 1923",
      "explanation": "Yönetim biçimi 29 Ekim 1923'te cumhuriyet olarak belirlendi."
    },
    {
      "topic": "Lozan",
      "question": "Lozan Barış Antlaşması hangi yılda imzalandı?",
      "answer": "1923",
      "explanation": "24 Temmuz 1923 tarihinde imzalandı."
    },
    {
      "topic": "Coğrafya-tarih",
      "question": "İpek Yolu'nun tarihî önemini bir cümleyle açıklayın.",
      "answer": "Ticaret ve kültürel etkileşimi sağladı.",
      "explanation": "Kervan yolları mal, fikir ve teknolojilerin aktarımına aracılık etti."
    },
    {
      "topic": "Tarihî kaynak",
      "question": "Bir dönemde yazılmış mektup birincil kaynak mıdır?",
      "answer": "Evet.",
      "explanation": "Olayın yaşandığı dönemden doğrudan iz taşıyan belgedir."
    },
    {
      "topic": "Reform",
      "question": "Matbaanın yaygınlaşması bilgiye erişimi nasıl etkiledi?",
      "answer": "Kitap üretimini hızlandırdı ve yaygınlaştırdı.",
      "explanation": "Kopyalama maliyetleri azaldı."
    },
    {
      "topic": "Kültürel miras",
      "question": "Bir tarihî eseri korumak neden önemlidir?",
      "answer": "Geçmişe ilişkin kanıtları gelecek kuşaklara aktarır.",
      "explanation": "Somut miras, tarihsel hafıza ve araştırma için kaynak oluşturur."
    }
  ],
  "literature": [
    {
      "topic": "Söz sanatı",
      "question": "'Güneş gülümsedi' ifadesinde hangi söz sanatı vardır?",
      "answer": "Kişileştirme",
      "explanation": "İnsan davranışı olan gülümseme güneşe aktarılır."
    },
    {
      "topic": "Benzetme",
      "question": "'Aslan gibi cesur' sözünde benzeyen kimdir?",
      "answer": "Cesur kişi",
      "explanation": "Aslana benzetilen insandır."
    },
    {
      "topic": "Şiir",
      "question": "Dört dizelik şiir birimine ne ad verilir?",
      "answer": "Dörtlük",
      "explanation": "Dört dizeden oluşan nazım birimidir."
    },
    {
      "topic": "Tema",
      "question": "Bir şiirin temasını bulurken neye bakılır?",
      "answer": "Şiirde işlenen temel duygu veya düşünceye.",
      "explanation": "Tema, metnin merkezindeki soyut anlamdır."
    },
    {
      "topic": "Ana fikir",
      "question": "Bir metnin ana düşüncesi nasıl belirlenir?",
      "answer": "Yazarın vermek istediği temel yargı bulunur.",
      "explanation": "Örnekler değil metnin bütününü kapsayan mesaj seçilir."
    },
    {
      "topic": "Anlatıcı",
      "question": "'Sabah erkenden uyandım' cümlesinde anlatıcı bakış açısı nedir?",
      "answer": "Birinci kişi anlatımı",
      "explanation": "Anlatıcı 'ben' dilini kullanır."
    },
    {
      "topic": "Deyim",
      "question": "'Etekleri zil çalmak' deyimi ne anlama gelir?",
      "answer": "Çok sevinmek",
      "explanation": "Deyimler sözcüklerin gerçek anlamından farklılaşabilir."
    },
    {
      "topic": "Atasözü",
      "question": "'Damlaya damlaya göl olur' sözü hangi düşünceyi anlatır?",
      "answer": "Küçük birikimler zamanla büyür.",
      "explanation": "Düzenli küçük katkılar önemli sonuç doğurabilir."
    },
    {
      "topic": "Metin türü",
      "question": "Olay, kişi, yer ve zaman içeren kısa kurmaca metin türü nedir?",
      "answer": "Hikâye",
      "explanation": "Hikâye genellikle tek olay çevresinde gelişir."
    },
    {
      "topic": "Yazım",
      "question": "'Her şey' nasıl yazılır?",
      "answer": "Ayrı",
      "explanation": "'Şey' sözcüğü bu kullanımda ayrı yazılır."
    }
  ],
  "religion": [
    {
      "topic": "İbadet",
      "question": "Namazın başlangıcında alınan tekbirin adı nedir?",
      "answer": "İftitah tekbiri",
      "explanation": "Namaza girişte 'Allahu ekber' denir."
    },
    {
      "topic": "Oruç",
      "question": "Ramazan ayında oruç ibadeti hangi vakitte başlar?",
      "answer": "İmsak",
      "explanation": "Oruç imsak vaktinde başlar, akşam ezanıyla sona erer."
    },
    {
      "topic": "Zekât",
      "question": "Zekâtın toplumsal amaçlarından biri nedir?",
      "answer": "Yardımlaşma ve dayanışmayı güçlendirmek.",
      "explanation": "İhtiyaç sahiplerinin desteklenmesine katkı sağlar."
    },
    {
      "topic": "Ahlak",
      "question": "Emanete riayet etmek hangi ahlaki ilkeyle ilişkilidir?",
      "answer": "Güvenilirlik",
      "explanation": "Emaneti korumak verilen sözü ve sorumluluğu yerine getirmektir."
    },
    {
      "topic": "Kul hakkı",
      "question": "Bir başkasının hakkını izinsiz almak neden yanlıştır?",
      "answer": "Adalete ve kul hakkına aykırıdır.",
      "explanation": "İnsanların haklarına saygı toplumsal güveni korur."
    },
    {
      "topic": "İsraf",
      "question": "İsrafın önlenmesine günlük yaşamdan bir örnek verin.",
      "answer": "İhtiyaç kadar su kullanmak.",
      "explanation": "Kaynakları ölçülü kullanmak israfı azaltır."
    },
    {
      "topic": "Kur'an",
      "question": "Kur'an-ı Kerim'in ilk suresi hangisidir?",
      "answer": "Fâtiha",
      "explanation": "Mushaf sıralamasında ilk sure Fâtiha'dır."
    },
    {
      "topic": "Peygamberler",
      "question": "Hz. Muhammed'in güvenilirliğini anlatan unvanı nedir?",
      "answer": "el-Emîn",
      "explanation": "Güvenilir kişi anlamına gelir."
    },
    {
      "topic": "Dua",
      "question": "Duanın ibadet hayatındaki işlevlerinden biri nedir?",
      "answer": "Allah'a yönelme ve dilekte bulunma.",
      "explanation": "Dua şükür, bağışlanma ve yardım isteme gibi anlamlar taşır."
    },
    {
      "topic": "Paylaşma",
      "question": "Sadaka yalnızca maddi yardım mıdır?",
      "answer": "Hayır.",
      "explanation": "İyilik ve gönüllü yardımlar da sadaka kapsamında değerlendirilebilir."
    }
  ],
  "philosophy": [
    {
      "topic": "Sorgulama",
      "question": "Felsefede bir iddiayı kabul etmeden önce ne yapılmalıdır?",
      "answer": "Gerekçeleri sorgulanmalıdır.",
      "explanation": "Eleştirel düşünme kanıt ve tutarlılık arar."
    },
    {
      "topic": "Mantık",
      "question": "'Bütün insanlar ölümlüdür; Sokrates insandır' öncüllerinden ne çıkar?",
      "answer": "Sokrates ölümlüdür.",
      "explanation": "Genel öncül tekil örneğe uygulanır."
    },
    {
      "topic": "Etik",
      "question": "Bir davranışın iyi olup olmadığını sorgulayan alan hangisidir?",
      "answer": "Etik",
      "explanation": "Etik doğru ve yanlış eylemi inceler."
    },
    {
      "topic": "Epistemoloji",
      "question": "Bilginin kaynağını ve sınırlarını inceleyen disiplin nedir?",
      "answer": "Bilgi felsefesi",
      "explanation": "Epistemoloji bilmenin koşullarını araştırır."
    },
    {
      "topic": "Ontoloji",
      "question": "'Varlık nedir?' sorusu hangi alana aittir?",
      "answer": "Varlık felsefesi",
      "explanation": "Ontoloji var olanın doğasını inceler."
    },
    {
      "topic": "Argüman",
      "question": "Bir argümanın öncülleri ne işe yarar?",
      "answer": "Sonucu gerekçelendirmeye çalışır.",
      "explanation": "Öncüller sonuç için destek sunar."
    },
    {
      "topic": "Çelişki",
      "question": "'Aynı anda hem yağmur yağıyor hem yağmıyor' ifadesi hangi ilkeye aykırıdır?",
      "answer": "Çelişmezlik ilkesi",
      "explanation": "Aynı koşullarda bir önerme hem doğru hem yanlış olamaz."
    },
    {
      "topic": "Özgür irade",
      "question": "Özgür irade tartışmasının temel sorusu nedir?",
      "answer": "İnsan seçimlerinde ne ölçüde özgürdür?",
      "explanation": "Belirlenim ve seçim arasındaki ilişki tartışılır."
    },
    {
      "topic": "Estetik",
      "question": "'Güzel nedir?' sorusu hangi felsefe alanındadır?",
      "answer": "Estetik",
      "explanation": "Sanat ve güzellik üzerine felsefi inceleme yapar."
    },
    {
      "topic": "Sokrates",
      "question": "Sokratik yöntemde soruların amacı nedir?",
      "answer": "Varsayımları açığa çıkarıp düşünmeyi derinleştirmek.",
      "explanation": "Diyalog ve takip soruları kavramların netleşmesini sağlar."
    }
  ]
};
