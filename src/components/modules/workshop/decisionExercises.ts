import type { DecisionRound } from './DecisionLab';

export const inference = [
  {
    context: 'Duru sabah evden çıkarken gökyüzü açıktı. Ders sonunda koridordaki öğrencilerden bazıları ayakkabılarını kapının önündeki paspasa siliyordu. Duru çantasından küçük şemsiyesini çıkardı.',
    question: 'Metinden hangi çıkarım en güçlü biçimde desteklenir?',
    answer: 1,
    choices: [
      { text: 'Duru sabah hava durumunu kontrol etti.', feedback: 'Şemsiye taşıması hava durumuna baktığını göstermez. Okul çıkışındaki iki ipucuna bak.' },
      { text: 'Duru okul çıkışında yağmur olabileceğini düşündü.', feedback: 'Doğru. Paspasın kullanılması ve şemsiyenin hazırlanması bu çıkarımı destekler. Metin yağdığını kesin olarak söylemez.' },
      { text: 'Yağmur bütün ders boyunca sürdü.', feedback: 'Metinde yağışın başladığı zaman veya süresi hakkında bilgi yok.' },
    ],
  },
  {
    context: 'Okul bahçesine kuşlar için iki suluk kondu. Birine güneş alan yerde, diğerine gölgede aynı miktarda su bırakıldı. Öğleden sonra güneşteki sulukta daha az su vardı. Öğrenciler sebebi anlamak için ertesi gün aynı gözlemi tekrarlamaya karar verdi.',
    question: 'Öğrencilerin tutumuyla ilgili hangi yorum metne dayanır?',
    answer: 2,
    choices: [
      { text: 'Sonucun yalnızca kuşlardan kaynaklandığını biliyorlardı.', feedback: 'Metin sulukların neden farklı miktarda su içerdiğini kesinleştirmiyor.' },
      { text: 'Gölgede kalan suyu eritmek istediler.', feedback: 'Metinde donma veya erimeyle ilgili bir ipucu yok.' },
      { text: 'İlk gözlemle yetinmeyip sonucu yeniden incelemek istediler.', feedback: 'Doğru. “Aynı gözlemi tekrarlamaya karar verdi” ifadesi yorumun açık kanıtıdır.' },
    ],
  },
  {
    context: 'Kütüphaneci, en çok okunan kitapların bulunduğu rafın yanında sessiz bir köşe hazırladı. Bazı öğrenciler ilk hafta oraya ders çalışmaya, bazıları yalnızca okumaya geldi. Kütüphaneci, yeni köşeye farklı amaçlarla gelenlerin sayısını ayrı ayrı kaydetti.',
    question: 'Hangi bilgi doğrudan veriliyor, çıkarım gerektirmiyor?',
    answer: 0,
    choices: [
      { text: 'Kütüphaneci farklı amaçlarla gelen öğrencileri ayrı ayrı saydı.', feedback: 'Doğru. Son cümle bunu doğrudan bildiriyor.' },
      { text: 'Sessiz köşe kurulmadan önce öğrenciler hiç okumazdı.', feedback: 'Yeni alanın ne amaçla kullanıldığı anlatılıyor. Önceki okuma alışkanlıkları verilmemiş.' },
      { text: 'Kütüphaneci sessiz köşeyi daha sonra kaldıracak.', feedback: 'Gelecekte ne yapacağı metinde yer almıyor.' },
    ],
  },
] satisfies readonly DecisionRound[];

export const announcements = [
  {
    context: 'Attention, passengers. The train to Oxford will leave from platform six instead of platform four.',
    audio: true,
    question: 'Oxford yolcusu şimdi hangi perona gitmeli?',
    answer: 2,
    choices: [
      { text: 'Dördüncü perona', feedback: '“Instead of platform four” dördüncü peronun eski bilgi olduğunu gösterir.' },
      { text: 'İkinci perona', feedback: 'Saat veya sıra sayısı yerine doğrudan “platform” sözcüğünden sonra gelen yeni sayıyı dinle.' },
      { text: 'Altıncı perona', feedback: 'Doğru. “From platform six instead of platform four” peronun dörtten altıya değiştiğini bildiriyor.' },
    ],
  },
  {
    context: 'The science club usually meets on Tuesdays. This week only, we are meeting on Thursday at half past three.',
    audio: true,
    question: 'Bu haftaki buluşma ne zaman?',
    answer: 0,
    choices: [
      { text: 'Perşembe, 15.30', feedback: 'Doğru. “This week only” istisnayı, “half past three” üç buçuğu bildirir.' },
      { text: 'Salı, 15.30', feedback: 'Salı alışılmış gün. Bu haftaki değişiklik “This week only” ifadesinden sonra geliyor.' },
      { text: 'Perşembe, 15.00', feedback: 'Gün doğru. “Half past” saatin üzerinden yarım saat geçtiğini belirtir.' },
    ],
  },
  {
    context: 'Please bring a pencil and your student card. You don’t need to bring a dictionary because we will give you one.',
    audio: true,
    question: 'Öğrencinin yanında getirmesi gereken iki şey ne?',
    answer: 1,
    choices: [
      { text: 'Kalem ve sözlük', feedback: '“You don’t need to bring” getirmene gerek yok demektir. Bu sözler sözlük için kullanılıyor.' },
      { text: 'Kalem ve öğrenci kartı', feedback: 'Doğru. “Bring a pencil and your student card” iki gerekli eşyayı birlikte söylüyor.' },
      { text: 'Öğrenci kartı ve sözlük', feedback: 'Öğrenci kartı doğru. Sözlük ise orada verilecek, ilk cümleyi tekrar dinle.' },
    ],
  },
] satisfies readonly DecisionRound[];

export const compareSources = [
  {
    context: 'Kurmaca kasaba arşivi. Belediye tutanağında “pazar yeri 12 Mayıs’ta açıldı” yazıyor. Bir esnafın günlüğünde ise “ilk tezgâhlar 14 Mayıs’ta kuruldu” deniyor.',
    question: 'Görünürdeki farkı sınamak için önce ne yaparsın?',
    answer: 1,
    choices: [
      { text: 'Resmî belgenin tarihini seçer, günlüğü kullanmam.', feedback: 'Resmî belge tören tarihini verebilir. Günlük ise fiilî kullanım hakkında ayrı bilgi sağlayabilir.' },
      { text: 'İki kaynağın aynı olayı anlatıp anlatmadığını kontrol ederim.', feedback: 'Doğru. Resmî açılış ve ilk satış farklı olaylar olabilir. Her kaynağın sözünü ettiği eylemi ayırt etmek gerekir.' },
      { text: 'İki tarihi ortalar, açılışın 13 Mayıs olduğunu yazarım.', feedback: 'Tarihleri ortalamak iki kaynaktan da destek almayan yeni bir tarih üretir.' },
    ],
  },
  {
    context: 'Aynı kasabada bir fotoğrafın arkasına “1934 pazarı” yazılmış. Fotoğraftaki tabelalar seçiliyor, ancak notu kimin yazdığı ve fotoğrafın günü bilinmiyor.',
    question: 'Fotoğraftan hangi iddiayı daha güvenle kurabilirsin?',
    answer: 0,
    choices: [
      { text: 'Fotoğrafta bazı tezgâh ve tabelalar görünüyor.', feedback: 'Doğru. Bu, fotoğrafta doğrudan gözlenebilir. Tarih ve yer için bağımsız doğrulama gerekir.' },
      { text: 'Fotoğraf kesinlikle 12 Mayıs sabahı çekilmiş.', feedback: 'Arka yüzde gün sayısı yok. Tabelaların görünmesi de çekim gününü vermez.' },
      { text: 'Kasabadaki bütün esnafın dükkânı fotoğrafta görünüyor.', feedback: 'Bir fotoğraf yalnızca kadraja giren bölümü gösterir.' },
    ],
  },
  {
    context: 'Sergide kullanılmak üzere ikinci bir günlük, aynı haftaya ait belediye duyurusu ve olaydan on yıllar sonra yazılmış bir anı bulunuyor.',
    question: 'Açılış töreninin tarihini araştırırken hangi ilk adım daha sağlam?',
    answer: 2,
    choices: [
      { text: 'En uzun metni seçip diğerlerini bir kenara bırakmak', feedback: 'Metin uzunluğu, tarihe ilişkin kanıtın güvenilirliğini tek başına göstermez.' },
      { text: 'Üç kaynaktan ikisinin söylediği her bilgiyi otomatik doğru saymak', feedback: 'Kaynakların ortak bir söylentiyi kopyalayıp kopyalamadığını da düşünmek gerekir.' },
      { text: 'Duyurunun tarihini ve içeriğini günlükteki bağımsız gözlemle karşılaştırmak', feedback: 'Doğru. Zamanı, amacı ve bağımsızlığı bilinen kaynakları karşılaştırmak iddiayı sınar.' },
    ],
  },
] satisfies readonly DecisionRound[];

export const ethicalChoices = [
  {
    context: 'Ödev için üç kişilik gruptasınız. Bir arkadaşın evde internet erişimi olmadığı için kaynak taraması yapamıyor. Sunumda herkesin katkısının olmasını istiyorsunuz.',
    question: 'Sorumluluğu paylaşırken erişim engelini hangi öneri en iyi giderir?',
    answer: 1,
    choices: [
      { text: 'Herkese aynı çevrimiçi görevi verir, yetişemeyenin puanını düşürürüz.', feedback: 'Görevler eşit görünür, ancak erişim şartları farklıdır. Bu çözüm engeli yerinde bırakır.' },
      { text: 'Görevleri birlikte yeniden böleriz. Kaynakları ona ulaştırır, birlikte seçtiğimiz bir katkıyı sunuma ekleriz.', feedback: 'Doğru. Erişimi sağlıyor, arkadaşın karara katılmasını ve katkı vermesini de koruyorsun.' },
      { text: 'Görevini sessizce biz yapar, sunumda onu hiç anmayız.', feedback: 'Teslim yetişebilir. Arkadaşın katkı sunma ve ekipte yer alma fırsatı azalır.' },
    ],
  },
  {
    context: 'Sınıf dayanışma etkinliğinde yardım alan öğrencileri gösteren bir fotoğraf paylaşılması öneriliyor. Bazı öğrencilerin fotoğrafta görünmek istemediğini biliyorsunuz.',
    question: 'Etkinliği anlatırken kişisel sınırları hangi seçenek gözetir?',
    answer: 2,
    choices: [
      { text: 'İsimleri yazmadan yüzleri paylaşmak', feedback: 'Yüzlerden tanınmak mümkün. İsmin yazılmaması tek başına yeterli olmaz.' },
      { text: 'Fotoğrafı yalnızca sınıfın mesaj grubunda paylaşmak', feedback: 'Dar bir grupta paylaşım da kişisel sınırları aşabilir.' },
      { text: 'Kişileri tanıtmadan, toplanan kitap sayısını ve sonucu paylaşmak', feedback: 'Doğru. Dayanışmanın sonucunu anlatırken yardım alan kişilerin mahremiyetini koruyorsun.' },
    ],
  },
  {
    context: 'Teslimden önce sayım hatası yaptığını fark ettin. Arkadaşların duyuruda yanlış toplamı kullanmak üzere.',
    question: 'Hangi davranış dürüstlük ve sorumluluğu birlikte gösterir?',
    answer: 0,
    choices: [
      { text: 'Hatayı bildirip sayımı ekipçe kontrol ederek duyuruyu düzeltmek', feedback: 'Doğru. Hatayı görünür kılıyor, doğru bilgiye ulaşmak için sorumluluk alıyorsun.' },
      { text: 'Duyuruyu olduğu gibi bırakıp bir sonraki etkinlikte dikkat etmek', feedback: 'Sonraki çalışmada dikkat etmek değerli. Buradaki yanlış bilgi de düzeltilmeli.' },
      { text: 'Hata için en son listeye bakan kişiyi suçlamak', feedback: 'Suçlamak yanlış toplamı düzeltmez. Kendi payını belirtip birlikte kontrol etmeyi düşün.' },
    ],
  },
] satisfies readonly DecisionRound[];

export const counterexamples = [
  {
    context: 'Bir öğrenci “Bütün sessiz öğrenciler derse hazırlıksızdır” diyor.',
    question: 'Hangi gözlem bu genellemeyi tek başına çürütür?',
    answer: 2,
    choices: [
      { text: 'Konuşkan bir öğrencinin derse hazırlıksız gelmesi', feedback: 'İddia sessiz öğrencilerle ilgili. Konuşkan öğrencinin durumu iddianın kapsamına girmiyor.' },
      { text: 'Sessiz bir öğrencinin derse hazırlıksız gelmesi', feedback: 'Bu gözlem iddiayla uyumlu. Çürütmek için sessiz olup hazırlıklı gelen bir öğrenci gerekir.' },
      { text: 'Sessiz bir öğrencinin çalışıp notlarını hazır getirmesi', feedback: 'Doğru. “Bütün” sözcüğü nedeniyle koşulu sağlayıp sonuca uymayan tek örnek yeterlidir.' },
    ],
  },
  {
    context: 'Bir arkadaşın “Daha pahalı olan her defter daha uzun süre dayanır” diyor.',
    question: 'İddiayı hangi karşılaştırma zayıflatır?',
    answer: 0,
    choices: [
      { text: 'Aynı şekilde kullanılan ucuz defterin pahalı defterden daha uzun dayanması', feedback: 'Doğru. Benzer kullanımda fiyat sıralaması dayanıklılık sırasına uymamıştır.' },
      { text: 'Pahalı defterin farklı renkte olması', feedback: 'İddia renk hakkında değil. Dayanıklılıkla ilgili bir karşılaştırma ara.' },
      { text: 'Pahalı defterin daha uzun süre dayanması', feedback: 'Bu sonuç iddiayı destekler. Karşı örnek sonucun tersini göstermeli.' },
    ],
  },
  {
    context: 'İlk iddia bir karşı örnekle çürütüldükten sonra öğrenci “Bazı sessiz öğrenciler hazırlıksız olabilir” diyor.',
    question: 'Yeni iddiayı değerlendirmek için hangi yaklaşım uygun?',
    answer: 1,
    choices: [
      { text: 'Hazırlıklı bir sessiz öğrenci bulunca “bazı” iddiasını da çürütmüş saymak', feedback: '“Bazı” iddiası istisnalara izin verir. Tek bir hazırlıklı öğrenci bunu çürütmez.' },
      { text: 'Sessiz olup hazırlıksız gelen en az bir örnek aramak', feedback: 'Doğru. “Bazı” iddiası için en az bir uygun örnek yeterli olabilir.' },
      { text: 'Sessiz öğrencilerin çoğuna bakmadan “bazı” denemeyeceğini söylemek', feedback: '“Bazı” ile “çoğu” aynı iddia değildir. “Bazı” için çoğunluk gerekmez.' },
    ],
  },
] satisfies readonly DecisionRound[];

export const fairness = [
  {
    context: 'Atölyede bir tablet var. Bir öğrenci bütün çalışmasını tablette yapıyor. Diğerinin yalnızca son dosyasını yüklemesi gerekiyor. İkisi de dersi zamanında bitirmek istiyor.',
    question: 'Karar vermeden önce hangi bilgi farkı anlamaya yardım eder?',
    answer: 1,
    choices: [
      { text: 'Tableti kimin daha çok sevdiği', feedback: 'Beğeni, görevlerin gerekleri hakkında yeterli bilgi vermez.' },
      { text: 'İki görevin süresi, teslim zamanı ve başka araçla yapılıp yapılamadığı', feedback: 'Doğru. Süreyi, aciliyeti ve alternatifi bilmek paylaşım kararını gerekçelendirir.' },
      { text: 'Hangisinin daha önce sınıfa girdiği', feedback: 'Geliş sırası bir paylaşım kuralı olabilir. Görevlerin gerçek ihtiyacını açıklamaz.' },
    ],
  },
  {
    context: 'Dosya yükleme iki dakika sürüyor ve hemen teslim edilmeli. Diğer öğrencinin işi 15 dakika sürüyor ve teslimi yarım saat sonra. İkisi de uzmanlık gerektirmeyen kendi işini yapabiliyor.',
    question: 'Belirtilen koşullarda ikisinin de işini zamanında bitirmesini hangi plan sağlar?',
    answer: 2,
    choices: [
      { text: 'Yarım saati ikiye böler ve tableti önce uzun işi olana veririz.', feedback: 'Eşit süre veriyor, ancak ilk teslim hemen olduğu için kısa iş gecikebilir.' },
      { text: 'Beş dakika tartışır, sonra kimin başlayacağına kura çekeriz.', feedback: 'Kura sırayı belirleyebilir. Tartışma süresi bile yakın teslimi riske atıyor.' },
      { text: 'Önce iki dakikalık acil yükleme, sonra 15 dakikalık çalışma yapılır.', feedback: 'Doğru. Sırayı görevlerin süreleri ve teslim koşulları belirliyor. Her iki iş de tamamlanabilir.' },
    ],
  },
  {
    context: 'Ertesi gün iki öğrencinin teslim süresi ve tablet ihtiyacı gerçekten eşit. Başka araç da yok.',
    question: 'Önceki öncelik kuralını yeni durumda nasıl gözden geçirirsin?',
    answer: 0,
    choices: [
      { text: 'Aciliyet farkı kalmadığı için erişilebilir eşit süre veya dönüşümlü sıra düşünürüm.', feedback: 'Doğru. Koşullar değişince kuralın gerekçesi de yeniden değerlendirilir.' },
      { text: 'Dün ilk kullanan bugün de her durumda ilk kullanır.', feedback: 'Dünkü öncelik acil teslimden geliyordu. Bugün o fark yok.' },
      { text: 'Tableti en hızlı isteyen kişiye bütün süre boyunca veririm.', feedback: 'Talebi ilk söylemek, eşit ihtiyacı olan diğer öğrenciyi neden dışarıda bırakacağımızı açıklamıyor.' },
    ],
  },
] satisfies readonly DecisionRound[];
