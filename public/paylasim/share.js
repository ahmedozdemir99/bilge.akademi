const shareButton = document.querySelector('#share');
const copyButton = document.querySelector('#copy');
const caption = document.querySelector('#caption');
const status = document.querySelector('#status');

copyButton.hidden = false;
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(caption.value);
    status.textContent = 'Tanıtım ve bağlantı kopyalandı.';
  } catch {
    caption.focus();
    caption.select();
    status.textContent = 'Seçili metni kopyalayabilirsiniz.';
  }
});

if (navigator.share && navigator.canShare) {
  shareButton.hidden = false;
  shareButton.disabled = true;

  fetch('/bilge-akademi-paylasim-v1.jpg')
    .then(async (response) => {
      if (!response.ok) throw new Error('Görsel alınamadı.');
      const image = await response.blob();
      const files = [new File([image], 'Bilge-Akademi.jpg', { type: 'image/jpeg' })];

      if (!navigator.canShare({ files })) {
        shareButton.hidden = true;
        return;
      }

      shareButton.disabled = false;
      shareButton.addEventListener('click', async () => {
        try {
          await navigator.share({ files, title: 'Bilge Akademi', text: caption.value });
          status.textContent = 'Seçtiğiniz uygulama açıklamayı eklemezse metni ayrı kopyalayabilirsiniz.';
        } catch (error) {
          if (error.name !== 'AbortError') {
            status.textContent = 'Görseli indirip paylaşabilir ve metni açıklama olarak ekleyebilirsiniz.';
          }
        }
      });
    })
    .catch(() => {
      shareButton.hidden = true;
    });
}
