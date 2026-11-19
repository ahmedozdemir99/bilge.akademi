# BİLGE AKADEMİ

Türkçe, modüler ve yapay zekâ destekli eğitim, edebiyat, tarih, matematik ve felsefe platformu.

## Özellikler ve Modüller

1. **Öğrenci Takip ve Analiz Sistemi**: Sınıf/şube yönetimi, öğrenci profilleri, sınav notları, mazeretli/mazeretsiz devamsızlık kayıtları, Recharts başarı grafikleri, anonimleştirilmiş yapay zekâ değerlendirmeleri ve PDF/CSV dışa aktarma.
2. **Şiir ve Edebiyat Atölyesi**: Şiir yazma editörü (taslak/tamamlandı kaydı, PDF çıktı), algoritmik Türkçe hece ölçüsü ve kafiye/redif analizi (belirsizlik uyarılı), Gemini destekli şiir inceleme ve özgün şiir üretimi, Türk edebiyatı dönem/akım/sanat/yazar kütüphanesi ve bilgi yarışması.
3. **İnteraktif Tarih Atlası**: Dünya ve Türk tarihi dönemleri, kronolojik zaman çizelgesi, yakınlaştırılabilir etkileşimli tarihî harita (tarihî yaklaşık konum uyarılı), neden-sonuç inceleme dosyaları, seviye uyarlı yapay zekâ tarih öğretmeni ve kronoloji/harita/bilgi yarışması.
4. **Yapay Zekâ Matematik Öğretmeni**: KaTeX formül görselleştirme, 6 aşamalı bilimsel çözüm rehberi, deterministik `mathjs` destekli parabol/doğru/özel fonksiyon ve geometri görselleştirici, 3 kademeli ipucu sunan akıllı alıştırmalar.
5. **Felsefe ve Düşünce Akademisi**: 7 felsefe dönemi, 12 filozof profili, 9 temel felsefi akım, yan yana ve yapay zekâ destekli filozof karşılaştırma, tarihî simülasyon uyarılı Sokratik diyalog atölyesi, bilgi yarışması ve açık uçlu eleştirel düşünme geri bildirimi.
6. **Ortak Yapay Zekâ Asistanı ve Raporlar**: Rol ve modül bağlamına uyumlu Türkçe asistan, modüller arası istatistik ve raporlama merkezi, açık/koyu tema ve demo/bulut veri yönetimi.

## Güvenlik ve Veri Mimarisi

- **Sunucu Tarafı Yapay Zekâ**: Tüm Gemini API çağrıları `server.ts` üzerindeki `/api/ai/*` uç noktaları üzerinden yapılır; istemci koduna API anahtarı sızdırılmaz.
- **Veri Kalıcılığı**: Firebase Authentication (Google ile giriş) ve Firestore veritabanı kullanılır. Oturum açılmadığında `localStorage` destekli örnek veri (Demo Modu) çalışır.
- **Gizlilik**: Öğrenci verileri yapay zekâ analizine gönderilmeden önce ad, soyad, numara gibi kişisel tanımlayıcılar çıkarılır.

## Geliştirme ve Test Komutları

```bash
npm run dev
npm run build
npm run lint
npx tsx src/utils/academicUtils.test.ts
npx tsx src/utils/modules.test.ts
```
