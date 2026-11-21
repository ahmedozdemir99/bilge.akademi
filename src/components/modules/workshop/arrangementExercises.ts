import type { Arrangement } from './ArrangeLab';

export const paragraph: Arrangement = {
  prompt: 'Fırtınadan sonra okul bahçesinde başlayan öyküyü yeniden kur. “Bu gövde”, “ertesi sabah” ve “bu gözlem” ifadelerinin neye bağlandığını düşün.',
  cards: [
    { text: 'Ertesi sabah aynı gövdenin nemli yüzeyinde ince bir mantar tabakası fark etti.' },
    { text: 'Bu gözlem, Ece’nin bahçedeki küçük canlıları düzenli olarak kaydetmeye başlamasını sağladı.' },
    { text: 'Fırtına dindikten sonra Ece, bahçede yere devrilmiş bir ağacın gövdesini gördü.' },
    { text: 'Bu gövdeyi kaldırmak yerine olduğu yerde bırakıp yakından incelemeye karar verdi.' },
  ],
  slots: [
    { label: 'Giriş · Olayı başlat', card: 2, clue: 'Gövde ilk kez hangi cümlede tanıtılıyor?' },
    { label: 'Gelişme · İlk karar', card: 3, clue: '“Bu gövde” diyebilmek için önce gövdenin görülmesi gerekir.' },
    { label: 'Gelişme · Yeni gözlem', card: 0, clue: '“Ertesi sabah” ilk inceleme kararından sonraki zamanı anlatır.' },
    { label: 'Sonuç · Gözlemin etkisi', card: 1, clue: 'Düzenli kayıt tutma kararı hangi önceki gözlemden doğuyor?' },
  ],
  explanation: 'Metni doğru kurdun. Gönderme ifadeleri önce sözü edilen varlığı veya olayı izler. Zaman sözcükleri olaylar arasındaki sırayı görünür kılar.',
};

export const invitation: Arrangement = {
  language: 'en',
  prompt: 'İki arkadaşın çalışma planını kur. Davet, gerekçeli yanıt, yeni zaman önerisi ve kabul kartlarını yerleştir.',
  cards: [
    { text: 'Yes, four works for me. See you then!' },
    { text: 'Would you like to study together this afternoon?' },
    { text: 'No problem. How about tomorrow at four?' },
    { text: 'I’d love to, but I have basketball practice today.' },
  ],
  slots: [
    { label: 'Davet', card: 1, clue: '“Would you like to …?” bir davet kalıbıdır.' },
    { label: 'Kibar ret ve gerekçe', card: 3, clue: '“I’d love to, but …” istek ile engeli aynı cümlede gösterir.' },
    { label: 'Alternatif öneri', card: 2, clue: '“How about …?” yeni planı ortaya koyar.' },
    { label: 'Kabul', card: 0, clue: '“Works for me” önerilen zamanın uygun olduğunu bildirir.' },
  ],
  explanation: 'Plan oluştu. “I’d love to, but …” reddi yumuşatır. “How about …?” yeni bir seçenek sunar ve “works for me” bu seçeneği kabul eder.',
};

export const chronology: Arrangement = {
  prompt: 'Millî egemenlikle ilgili dönüm noktalarını yeniden sırala. Tarihler kadar her kartın neyi değiştirdiğine de dikkat et.',
  cards: [
    { text: 'Türkiye’nin yönetim biçimi Cumhuriyet olarak ilan edildi.', note: '29 Ekim 1923' },
    { text: 'İlk Büyük Millet Meclisi Ankara’da açıldı.', note: '23 Nisan 1920' },
    { text: 'Yeni Teşkilât-ı Esâsiye Kanunu kabul edildi.', note: '20 Nisan 1924' },
    { text: '1921 Teşkilât-ı Esâsiye Kanunu kabul edildi.', note: '20 Ocak 1921' },
  ],
  slots: [
    { label: '1. Meclisin toplanması', card: 1, clue: '1920 tarihli kartı ara.' },
    { label: '2. İlk anayasal düzenleme', card: 3, clue: 'Meclisin açılmasını izleyen yılın anayasa kartını ara.' },
    { label: '3. Yönetim biçiminin ilanı', card: 0, clue: '1923’te mevcut anayasada yapılan değişiklik Cumhuriyet’i ilan etti.' },
    { label: '4. Cumhuriyet döneminin yeni anayasası', card: 2, clue: 'Dizideki en geç tarihli kartı seç.' },
  ],
  explanation: '1920’de Meclis açıldı. 1921 Anayasası millî egemenliği anayasal ilke olarak ifade etti. 1923 değişikliğiyle Cumhuriyet ilan edildi. 1924’te yeni anayasa kabul edildi.',
  sources: [
    { label: 'TBMM · 1921 Anayasası ve millî egemenlik', url: 'https://cdn.tbmm.gov.tr/TbmmWeb/Yayinlar/Dosya/721864aa-a76f-4579-8c11-37e98072cbd1.pdf' },
    { label: 'TBMM · 1924 Teşkilât-ı Esâsiye Kanunu', url: 'https://tbmm.gov.tr/anayasa/yirmi-dort-teskilati-esasiye-kanunu' },
  ],
};

export const sourceTypes: Arrangement = {
  prompt: 'Kurmaca bir kasaba sergisi için dört kaynağı incele. Her kaynağı uzaklığına veya biçimine göre uygun alana yerleştir.',
  cards: [
    { text: '2018’de, 1934 pazarını araştıran bir tarihçinin makalesi.' },
    { text: '1934’te o günkü alışverişini yazan bir esnafın defteri.' },
    { text: '1934 pazar yerini gösteren, tarihi doğrulanmış fotoğraf.' },
    { text: 'Pazara giden birinin yıllar sonra torununa anlattığı hatıra.' },
  ],
  slots: [
    { label: 'Olay sırasında yazılmış kayıt', card: 1, clue: 'Kayıt olayla aynı yıl ve doğrudan bir katılımcı tarafından tutulmuş.' },
    { label: 'Olay sırasında üretilmiş görsel kaynak', card: 2, clue: 'Pazar yerini yazı yerine görüntüyle belgeleyen kartı ara.' },
    { label: 'Tanığın geriye dönük anlatısı', card: 3, clue: 'Anlatan kişi olaya katılmış, ancak anlatı daha sonra oluşmuş.' },
    { label: 'Daha sonra hazırlanmış tarih incelemesi', card: 0, clue: 'Olaydan uzun süre sonra başka kaynakları inceleyen araştırmacıyı ara.' },
  ],
  explanation: 'Kaynağın üretildiği zaman, yazarın olaya yakınlığı ve belgenin biçimi farklı soruları yanıtlar. Tanık anlatısı birincil kaynak olabilir, ancak yıllar sonra aktarılmış olması belleğin etkisini düşünmeyi gerektirir.',
};

export const worship: Arrangement = {
  prompt: 'İbadet ve yardımlaşma örneklerini kavramlarla eşleştir. Özellikle düzenli bir yükümlülük ile gönüllü yardımı ayırt et.',
  cards: [
    { text: 'Bir komşuya gönüllü olarak yiyecek desteği vermek.' },
    { text: 'Ramazan’da imsak ile iftar arasında ibadet niyetiyle yeme ve içmeden uzak durmak.' },
    { text: 'Belirli vakitlerde kıyam, rükû ve secde gibi bölümleri olan ibadeti yerine getirmek.' },
    { text: 'Gerekli şartları taşıdığında malının belirli bir payını hak sahiplerine vermek.' },
  ],
  slots: [
    { label: 'Namaz', card: 2, clue: 'Vakit, rükû ve secde ifadelerine bak.' },
    { label: 'Oruç', card: 1, clue: 'İmsak ve iftar hangi ibadetin zamanını belirler?' },
    { label: 'Zekât', card: 3, clue: 'Belirli şartlara ve bir yükümlülüğe bağlı paylaşımı bul.' },
    { label: 'Gönüllü yardım', card: 0, clue: 'Örneklerden hangisi herhangi bir yükümlülükten söz etmiyor?' },
  ],
  explanation: 'Namaz ve oruç farklı ibadetlerdir. Zekât belirli şartları ve hak sahipleri olan bir ibadettir. Gönüllü maddi yardım da dayanışmaya katkı sağlar.',
  sources: [{ label: 'Diyanet · İbadet Çeşitleri', url: 'https://dijital.diyanet.gov.tr/File/Download?id=4132&path=4132_1.pdf' }],
};

export const donationPlan: Arrangement = {
  prompt: 'Sınıfınız bir okul için kitap desteği hazırlıyor. İhtiyacı belirleme, planlama, uygulama ve değerlendirme adımlarına uygun kartları yerleştir.',
  cards: [
    { text: 'Öğretmenlerle birlikte kitapları teslim et ve teslim edilenleri listele.' },
    { text: 'Yaş gruplarını ve hangi tür kitaplara ihtiyaç olduğunu okuldan öğren.' },
    { text: 'Kitapların kullanılıp kullanılmadığını sor ve sonraki çalışma için önerileri kaydet.' },
    { text: 'Uygun kitapları belirle, görevleri böl ve teslim zamanını kararlaştır.' },
  ],
  slots: [
    { label: 'İhtiyacı dinle', card: 1, clue: 'İyi bir katkı, ihtiyacın ne olduğunu öğrenmekle başlar.' },
    { label: 'Görevleri planla', card: 3, clue: 'İhtiyaç öğrenildikten sonra kim, neyi, ne zaman yapacak?' },
    { label: 'Planı uygula', card: 0, clue: 'Kitapların karşı tarafa ulaştığı adımı ara.' },
    { label: 'Etkisini değerlendir', card: 2, clue: 'Teslimden sonra çalışmanın işe yarayıp yaramadığını öğren.' },
  ],
  explanation: 'Dayanışma, ihtiyacı dinlemekle başlar ve yardımın etkisini öğrenmekle devam eder. Böylece iyilik niyeti, işe yarayan bir katkıya dönüşür.',
};

export const argument: Arrangement = {
  prompt: '“Okul kütüphanesi öğle arası açık olmalı” görüşünün parçalarını ayır. Bir verinin, veriden kurulan gerekçenin ve sonuç önerisinin görevleri farklıdır.',
  cards: [
    { text: 'Okul kütüphanesi öğle arasının bir bölümünde açık olmalıdır.' },
    { text: 'Bir haftalık ankette 60 öğrenciden 38’i öğle arasında sessiz bir çalışma alanı aradığını söyledi.' },
    { text: 'Öğle nöbeti için yeterli görevli bulunamazsa salonun denetimi zorlaşabilir.' },
    { text: 'Kütüphanenin açık olması, sessiz bir yer arayan öğrenciler için alan sağlayabilir.' },
  ],
  slots: [
    { label: 'İddia', card: 0, clue: 'Savunulan ana öneriyi bul.' },
    { label: 'Kanıt', card: 1, clue: 'Ölçülmüş veya kayda geçmiş bilgi hangisi?' },
    { label: 'Gerekçe', card: 3, clue: 'Önerinin neden yararlı olacağını açıklayan bağlantıyı bul.' },
    { label: 'İtiraz', card: 2, clue: 'Önerinin uygulanmasının önündeki olası engeli ara.' },
  ],
  explanation: 'Anket talebi gösterir, gerekçe bu taleple öneri arasında bağ kurar, itiraz ise uygulamadaki bir koşulu açığa çıkarır.',
};
