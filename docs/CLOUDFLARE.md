# Cloudflare Pages kurulumu

- GitHub deposunu Cloudflare Pages'e bağlayın.
- Build command: `npm run build`; output directory: `dist`; root directory: `/`.
- Pages Functions otomatik algılanır. `API_ORIGIN` ortam değişkenini **HTTPS üzerinden çalışan ayrı Node/Express API sunucunuzun** kök adresine ayarlayın.
- Gemini API anahtarı **yalnızca Node API sunucusunda** `GEMINI_API_KEY` olarak tutulmalıdır. Cloudflare Pages'e veya `VITE_*` değişkenlerine eklemeyin.
- Node sunucusunda Firebase Admin SDK için `GOOGLE_APPLICATION_CREDENTIALS` veya platformun desteklediği güvenli kimlik bilgisi yapılandırması gerekir.
- Firebase Auth authorized domains listesine Pages ve özel alan adınızı ekleyin.
- Cloudflare Pages tek başına `server.ts` dosyasını çalıştırmaz. `API_ORIGIN` tanımlanmazsa eğitim arayüzü açılır ama sunucu gerektiren AI ve Kur'an proxy istekleri 503 döner.
- `public/sw.js` yalnızca anonim uygulama kabuğunu önbelleğe alır; öğrenci verilerini ve API yanıtlarını önbelleğe almaz.
- PWA ikonu SVG'dir. iOS için daha geniş destek istenirse 180px PNG apple-touch-icon ekleyin.

## Dağıtımdan önce

`npm ci && npm run lint && npm run build` çalıştırın; Firebase Emulator ile erişim kurallarını test edin. Bu dalda CI testleri çalıştırılmamıştır.
