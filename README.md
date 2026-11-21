# BİLGE AKADEMİ (`bilge.akademi`)

**Ortaokul (5–8. Sınıf & LGS)** öğretmenleri ve öğrencileri için geliştirilmiş; Türkçe, modüler, etkileşimli ve yapay zekâ destekli kapsamlı eğitim platformu.

---

## Modüller ve Özellikler

1. **Öğrenci Takip ve LGS Deneme Analizi**
   - Sınıf/şube yönetimi, öğrenci profilleri, ders bazlı yazılı notları ve LGS deneme sonuçlarını içe aktarma, ortalamalar ve gelişim grafikleri.
   - Kişisel bilgiler anonimleştirilerek çalışan Yapay Zekâ öğrenci/sınıf gelişim analizi, PDF yazdırma ve Excel/CSV dışa aktarma.

2. **Ortaokul Matematik Dünyası (5–8. Sınıf & LGS)**
   - **Görsel İspat Laboratuvarı**: Pisagor, `(a+b)²` ve `a²-b²` özdeşlikleri, üçgen iç açıları ve π sayısı için etkileşimli SVG ispatlar.
   - **1 Kelime 1 İşlem Oyunu**: Süreli zihinden işlem ve kelime bulma oyunu.
   - **İnteraktif Grafikler & Geometri**: MEB müfredatına tam uyumlu **Doğrusal İlişkiler ve Eğim (`y = mx + n`)**, **Koordinat Sistemi ve 4 Bölge (Yansımalar)**, **Dik Üçgen / Daire / Dikdörtgen / Silindir** görselleştirici.
   - **Matematik Hikâyeleri, Bilim İnsanları, Bilim Tarihi & Zekâ Soruları**.
   - **6 Aşamalı KaTeX Çözüm Rehberi**, akıllı çoktan seçmeli/yazılı alıştırmalar ve **5×10 (50 soru) LGS Matematik Test Bankası**.

3. **Fen Bilimleri Deney Laboratuvarı**
   - **Etkileşimli Sanal Deneyler**: Basit Elektrik Devresi (Ohm Kanunu), Asit-Baz pH Ölçer, Basit Makineler (Kaldıraç), Katı/Sıvı Basıncı, Fotosentez ve Mevsimler-Eksen Eğikliği simülatörleri.
   - Bilim insanları, icatlar, periyodik tablo rehberi ve **5×10 (50 soru) LGS Fen Bilimleri Test Bankası**.

4. **İngilizce Dil ve Ses Atölyesi**
   - **Çift Motorlu Ses Sistemi**: Anında telaffuz (US/UK aksanı) ve Gemini TTS destekli **Stüdyo AI Ses (.wav indirme)** özelliği.
   - 8. Sınıf LGS ünitelerine göre sesli kelime kartları, diyaloglar, dinleme anlama etkinlikleri, dilbilgisi rehberi ve **5×10 (50 soru) LGS İngilizce Test Bankası**.

5. **Din Kültürü ve Ahlak Bilgisi Akademisi**
   - **İbadet Animasyonları**: Adım adım **Abdest** ve **Namaz Hareketleri** etkileşimli SVG animasyonları, 5 vakit rekat tablosu, **Hac & Kâbe Tavafı**, **Oruç & İmsak-İftar**, **Zekât Hesaplama** simülatörleri.
   - **Arapça Harekeli Sure & Dualar + Gerçek Kâri Tilavet**: Fatiha, İhlas, Felak, Nâs, Asr, Kevser, Ayetel Kürsi, Rabbenâ Âtinâ, Rabbenâğfirlî, Sübhaneke ve Ettehiyyâtü için harekeli Arapça metinler ve 4 dünyaca ünlü kâriden (**Mahmud Halil el-Husarî**, **Mişâri Râşid el-Afâsî**, **Abdülbâsit Abdüssamed**, **Muhammed Sıddîk el-Minşâvî**) gerçek tilavet dinleme.
   - **8 Hikmetli Kıssa** ve **5×10 (50 soru) LGS Din Kültürü Test Bankası**.

6. **Şiir ve Edebiyat Atölyesi**
   - Şiir yazma editörü (taslak/tamamlandı kaydı, PDF çıktı), algoritmik Türkçe hece ölçüsü ve kafiye/redif analizi, veciz sözler, atasözü-deyim/edebî sanatlar, yazarlar, hiciv ve **5×10 (50 soru) Türkçe/Edebiyat Test Bankası**.

7. **İnteraktif Tarih Atlası**
   - Kronolojik zaman çizelgesi, etkileşimli tarihî harita ve sefer animasyonları, Osmanlı padişahları (gizli yetenekleri ve mahlaslı şiirleriyle), tarihî anekdotlar, hikmetli hikâyeler ve **5×10 (50 soru) Tarih & İnkılap Test Bankası**.

8. **Felsefe ve Düşünce Akademisi**
   - Filozof profilleri, düşünce akımları, karşılaştırma masası, Sokratik diyalog atölyesi ve **5×10 (50 soru) Eleştirel Düşünme & Felsefe Test Bankası**.

9. **Ortak Yapay Zekâ Asistanı, Raporlar ve Ayarlar**
   - Rol (Öğretmen/Öğrenci) ve modül bağlamlı Türkçe YZ asistanı, çapraz modül başarı raporları, koyu/açık tema ve demo/bulut veri yönetimi.

---

## Teknoloji Yığını ve Güvenlik

- **Ön Yüz**: React 19, TypeScript, Tailwind CSS v4, Recharts, KaTeX, Lucide Icons, Motion.
- **Arka Uç**: Express (`server.ts`) + Vite middleware.
- **Yapay Zekâ**: `@google/genai` SDK — tüm Gemini API çağrıları (`/api/ai/*`) yalnızca sunucu tarafında çalışır; istemci koduna hiçbir API anahtarı sızdırılmaz.
- **Veri Kalıcılığı**: Firebase Authentication (Google ile giriş) ve Cloud Firestore güvenlik kuralları (`firestore.rules`). Oturum açılmadığında `localStorage` destekli Demo Modu ile tüm platform eksiksiz çalışır.

---

## Kurulum ve Çalıştırma

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Ortam Değişkenlerini Hazırlayın

`.env.example` dosyasını `.env` olarak kopyalayıp kendi Gemini API anahtarınızı ekleyin (`.env` dosyası `.gitignore` ile korunur ve Git'e eklenmez):

```bash
cp .env.example .env
```

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
```

### 3. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde açılır.

### 4. Derleme, Kontrol ve Birim Testleri

```bash
npm run build
npm run lint
npx tsx src/utils/academicUtils.test.ts
npx tsx src/utils/modules.test.ts
```

---

## ChatGPT Sites’ta Gemini’yi etkinleştirme

1. [Google AI Studio](https://aistudio.google.com/apikey) üzerinden bir Gemini API anahtarı oluşturun.
2. Bilge Akademi’nin Sites ayarlarında **Environment variables** bölümüne `GEMINI_API_KEY` adlı bir **Secret** ekleyin.
3. Siteyi yeniden yayınlayın. Bilge Akademi’de **Ayarlar → Gemini bağlantısı → Bağlantıyı test et** yolunu izleyin.

## Deneme Analizi güncellemeleri

GitHub Actions, `ahmedozdemir99/Deneme.analiz` deposunun `main` dalını saatte bir kontrol eder. Bilge Akademi’deki kaynak sürüm `src/deneme-analysis/upstream-revision.txt` dosyasında kayıtlıdır. İş akışını GitHub Actions’taki **Sync Deneme Analizi** ekranından elle de başlatabilirsiniz.

Ortak ekran, tür ve yardımcı kodlar yeni sürümle birleştirilir. Bilge Akademi kendi Firebase bağlantısını, yedekleme akışını ve uygulama ayarlarını kullanır. Çakışma, tür hatası veya derleme hatası olursa iş akışı durur ve Cloudflare Pages’in yayındaki sürümü çalışmaya devam eder. Çakışan dosyalar iş akışının çıktısında görünür.

## Cloudflare Pages Yayınlama Rehberi

Bu proje hem Node.js/Express (`server.ts`) hem de **Cloudflare Pages Functions (`functions/api/[[path]].ts`)** ile tam uyumludur.

| Ayar | Değer |
| --- | --- |
| GitHub deposu | `ahmedozdemir99/bilge.akademi` |
| Production branch | `cloudflare-pages` |
| Framework preset | `None` |
| Build command | `bun install --frozen-lockfile && npm run build:pages` |
| Build output directory | `dist` |
| Root directory | Boş bırakın (depo kökü) |
| Build değişkenleri | `NODE_VERSION=24`, `BUN_VERSION=1.4.5`, `SKIP_DEPENDENCY_INSTALL=true` |

- **Yapay zekâ ve seslendirme:** Pages projesinin **Settings → Variables and Secrets** bölümünde `GEMINI_API_KEY` değerini şifreli bir gizli değişken olarak ekleyin. Önizlemede de kullanacaksanız Preview ortamında ayrıca tanımlayın. Değişkeni kaydettikten sonra dağıtımı yeniden başlatın.
- **Google ile giriş:** Firebase Console → **Authentication → Settings → Authorized domains** listesine yayının alan adını ekleyin. Önizlemede giriş yapacaksanız kullandığınız önizleme alan adını da ekleyin.
- **Telefona kurulum:** Yayın adresini Android’de Chrome ile açıp menüden **Uygulamayı yükle** veya **Ana ekrana ekle** seçeneğini kullanın. iPhone’da Safari’nin **Paylaş → Ana Ekrana Ekle** seçeneğini kullanın.

---

## Lisans

Bu proje eğitim amaçlı geliştirilmiştir.
