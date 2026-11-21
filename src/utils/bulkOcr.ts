import type { Block, Worker as OcrWorker } from 'tesseract.js';
import { extractTableRows } from './bulkTableLayout';

const OCR_ERROR = 'Görüntü okunamadı. Daha küçük ve net bir görüntüyle tekrar deneyin.';

function withScanTimeout<T>(operation: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error(message)), timeoutMs);
  });
  return Promise.race([operation, timeout]).finally(() => clearTimeout(timer));
}

export function createOcrCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil(width));
  canvas.height = Math.max(1, Math.ceil(height));
  return canvas;
}

export function extractOcrRows(blocks: Block[] | null): string[][] {
  const items = (blocks ?? []).flatMap((block) =>
    block.paragraphs.flatMap((paragraph) =>
      paragraph.lines.flatMap((line) =>
        line.words.map(({ text, bbox }) => ({
          str: text,
          width: bbox.x1 - bbox.x0,
          height: bbox.y1 - bbox.y0,
          transform: [1, 0, 0, 1, bbox.x0, -(bbox.y0 + bbox.y1) / 2],
        })))));
  return extractTableRows(items, true);
}

export async function createBulkOcr() {
  const [{ createWorker, OEM, PSM }, { default: workerPath }, { default: corePath }, { default: languageUrl }] = await Promise.all([
    import('tesseract.js'),
    import('tesseract.js/dist/worker.min.js?url'),
    import('tesseract.js-core/tesseract-core-lstm.wasm.js?url'),
    import('@tesseract.js-data/tur/4.0.0_best_int/tur.traineddata.gz?url'),
  ]);
  const langPath = new URL('.', new URL(languageUrl, window.location.href)).href;
  let setupWorker: OcrWorker | undefined;
  let abandon = false;
  try {
    setupWorker = await withScanTimeout(new Promise<OcrWorker>((resolve, reject) => {
      createWorker('tur', OEM.LSTM_ONLY, {
        workerPath,
        corePath,
        langPath,
        workerBlobURL: false,
        cacheMethod: 'none',
        errorHandler: () => reject(new Error(OCR_ERROR)),
      }).then((worker) => {
        if (abandon) void worker.terminate();
        else resolve(worker);
      }, () => reject(new Error(OCR_ERROR)));
    }), 45000, 'Görüntü okuma başlatılamadı. Bağlantınızı kontrol edip tekrar deneyin.');
    await withScanTimeout(setupWorker.setParameters({ tessedit_pageseg_mode: PSM.AUTO, preserve_interword_spaces: '1' }), 10000, OCR_ERROR);
  } catch (error) {
    abandon = true;
    await setupWorker?.terminate();
    throw error;
  }
  const worker = setupWorker;
  return {
    async read(image: HTMLCanvasElement): Promise<string[][]> {
      const { data } = await withScanTimeout(worker.recognize(image, {}, { blocks: true, text: false }), 120000, OCR_ERROR);
      return extractOcrRows(data.blocks);
    },
    close: () => worker.terminate(),
  };
}

async function decodeScreenshot(file: File) {
  if (!file.size) throw new Error('Görüntü dosyası boş. Ekran görüntüsünü telefona kaydedip yeniden seçin.');
  if (typeof createImageBitmap === 'function') {
    try {
      const image = await createImageBitmap(file);
      return { image, width: image.width, height: image.height, release: () => image.close() };
    } catch {
      // Some mobile file pickers return JPEGs that only the browser image element can decode.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = await withScanTimeout(new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('Görüntü açılamadı. Ekran görüntüsünü telefona kaydedip tekrar seçin.'));
      element.src = url;
    }), 10000, 'Görüntü açılırken zaman aşımı oluştu.');
    return { image, width: image.naturalWidth, height: image.naturalHeight, release: () => URL.revokeObjectURL(url) };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

export async function readScreenshotRows(file: File): Promise<string[][]> {
  const { image, width, height, release } = await decodeScreenshot(file);
  const scale = Math.min(2, 1900 / width, 2800 / Math.max(width, height));
  const canvas = createOcrCanvas(width * scale, height * scale);
  try {
    const context = canvas.getContext('2d');
    if (!context) throw new Error(OCR_ERROR);
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
  } finally {
    release();
  }
  try {
    const reader = await createBulkOcr();
    try {
      return await reader.read(canvas);
    } finally {
      await reader.close();
    }
  } finally {
    canvas.width = canvas.height = 0;
  }
}
