import { normalizeSearchText } from './searchText';
import { LGS_SUBJECT_CONFIG } from './exportUtils';
import { extractTableRows } from './bulkTableLayout';

export interface ImportSheet {
  name: string;
  rows: string[][];
}

const MAX_ROWS = 5000;
const MAX_COLUMNS = 80;
const SCHOOL_NUMBER_HEADER = /^(okul|ogrenci) (no|numara|numarasi)$|^okulno$/;

function normalizeColumn(value: string): string {
  return normalizeSearchText(value).replace(/[^a-z0-9 ]+/g, '').replace(/\s+/g, ' ');
}

function checkedRows(rows: string[][]): string[][] {
  if (rows.length > MAX_ROWS || rows.some((row) => row.length > MAX_COLUMNS)) {
    throw new Error('Dosya çok geniş. En fazla 5.000 satır ve 80 sütun içeren bir sayfa kullanın.');
  }
  return rows;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_PDF_PAGES_PER_SCAN = 60;

function checkFileSize(file: File) {
  if (file.size > MAX_FILE_BYTES) throw new Error('PDF, Excel veya görüntü dosyası en fazla 10 MB olabilir.');
}

async function loadPdf(file: File) {
  checkFileSize(file);
  const [{ getDocument, GlobalWorkerOptions }, { default: workerUrl }] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ]);
  GlobalWorkerOptions.workerSrc = workerUrl;
  return getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    useWasm: false,
    stopAtErrors: true,
  });
}

export function parsePdfPages(selection: string, pageCount: number): { first: number; last: number } {
  const match = /^(\d+)(?:\s*[-–]\s*(\d+))?$/.exec(selection.trim());
  if (!match) throw new Error('Bir sayfa numarası veya aralığı girin (ör. 3 veya 3-5).');
  const first = Number(match[1]);
  const last = Number(match[2] ?? match[1]);
  if (!Number.isSafeInteger(first) || !Number.isSafeInteger(last) || first < 1 || last < first || last > pageCount) {
    throw new Error(`Bu PDF için 1–${pageCount} arasında bir sayfa veya aralık seçin.`);
  }
  if (last - first + 1 > MAX_PDF_PAGES_PER_SCAN) throw new Error('Bir seferde en fazla 60 PDF sayfası okunabilir.');
  return { first, last };
}

export async function readPdfPageCount(file: File): Promise<number> {
  const task = await loadPdf(file);
  try {
    return (await task.promise).numPages;
  } finally {
    await task.destroy();
  }
}

export async function readPdfImport(
  file: File,
  selection: string,
  imageScan: boolean,
  onProgress: (message: string) => void
): Promise<ImportSheet[]> {
  const task = await loadPdf(file);
  let reader: Awaited<ReturnType<typeof import('./bulkOcr').createBulkOcr>> | undefined;
  try {
    const pdf = await task.promise;
    const { first, last } = parsePdfPages(selection, pdf.numPages);
    const rows: string[][] = [];
    for (let pageNumber = first; pageNumber <= last; pageNumber += 1) {
      onProgress(`${pageNumber}. sayfa okunuyor…`);
      const page = await pdf.getPage(pageNumber);
      try {
        const content = imageScan ? null : await page.getTextContent();
        const textRows = content ? extractTableRows(content.items) : [];
        const isTable = textRows.some((row) => row.filter(Boolean).length >= 2 && row.some((cell) => /^\d+(?:[.,]\d+)?$/.test(cell)));
        if (isTable) {
          rows.push(...textRows);
        } else {
          const { createBulkOcr, createOcrCanvas } = await import('./bulkOcr');
          onProgress(`${pageNumber}. sayfa görüntüden okunuyor…`);
          reader ??= await createBulkOcr();
          const base = page.getViewport({ scale: 1 });
          const scale = Math.min(3, 2800 / Math.max(base.width, base.height));
          const viewport = page.getViewport({ scale });
          const canvas = createOcrCanvas(viewport.width, viewport.height);
          try {
            await page.render({ canvas, viewport, background: '#ffffff' }).promise;
            rows.push(...await reader.read(canvas));
          } finally {
            canvas.width = canvas.height = 0;
          }
        }
        checkedRows(rows);
      } finally {
        page.cleanup();
      }
    }
    if (!rows.some((row) => row.filter(Boolean).length >= 2)) {
      throw new Error('Seçilen PDF sayfalarında okunabilir tablo bulunamadı. Daha net bir sayfa görüntüsü veya Excel dosyası kullanın.');
    }
    const pageLabel = first === last ? String(first) : `${first}–${last}`;
    return [{ name: `PDF · Sayfa ${pageLabel}`, rows }];
  } finally {
    try {
      await reader?.close();
    } finally {
      await task.destroy();
    }
  }
}

export function isScreenshot(file: File): boolean {
  return /\.(png|jpe?g|webp)$/i.test(file.name) || /^(image\/(png|jpeg|webp))$/.test(file.type);
}

export async function readImportWorkbook(file: File, onProgress: (message: string) => void = () => {}): Promise<ImportSheet[]> {
  checkFileSize(file);
  if (isScreenshot(file)) {
    const { readScreenshotRows } = await import('./bulkOcr');
    onProgress('Görüntüdeki satırlar okunuyor…');
    const rows = checkedRows(await readScreenshotRows(file));
    if (!rows.some((row) => row.filter(Boolean).length >= 2)) {
      throw new Error('Görüntüde okunabilir tablo bulunamadı. Yazıları ve sütunları net gösteren bir ekran görüntüsü kullanın.');
    }
    return [{ name: 'Ekran görüntüsü', rows }];
  }
  if (/\.xlsx$/i.test(file.name)) {
    const { default: readXlsxFile } = await import('read-excel-file/universal');
    const sheets = await readXlsxFile(file);
    const result = sheets
      .map((sheet) => ({ name: sheet.sheet, rows: checkedRows(sheet.data.map((row) => row.map((cell) => {
        if (cell == null) return '';
        if (cell instanceof Date) return cell.toISOString().slice(0, 10);
        return String(cell).trim();
      }))) }))
      .filter(({ rows }) => rows.some((row) => row.length >= 2));
    if (!result.length) throw new Error('Excel dosyasında okunabilir tablo bulunamadı.');
    return result;
  }
  throw new Error('Excel (.xlsx), CSV, PDF veya PNG, JPEG, WebP biçiminde bir görüntü seçin.');
}

export function suggestFileColumns(rows: string[][], fields: string[]) {
  const headerIndex = rows.slice(0, 40).findIndex((row) => row.some((value) => SCHOOL_NUMBER_HEADER.test(normalizeColumn(value))));
  const header = rows[headerIndex] ?? [];
  const columns = fields.map((field, index) => {
    const expected = normalizeColumn(field);
    const matches = header.flatMap((name, column) => isMatch(name) ? [column] : []);
    return matches.length === 1 ? matches[0] : -1;

    function isMatch(name: string) {
      const candidate = normalizeColumn(name);
      if (index === 0) return SCHOOL_NUMBER_HEADER.test(candidate);
      if (candidate === expected) return true;
      if (expected === 'ad soyad') return /^(adi soyadi|ad soyad|ogrenci adi( soyadi)?)$/.test(candidate);
      if (expected === 'puan') return /^(puan|not|sinav puani|toplam puan)$/.test(candidate);
      const subject = LGS_SUBJECT_CONFIG[Math.floor((index - 1) / 2)];
      const suffix = index % 2 === 1 ? ' d' : ' y';
      const trialColumn = candidate.replace(/ dogru$/, ' d').replace(/ yanlis$/, ' y');
      return trialColumn === expected ||
        Boolean(subject && [subject.shortLabel, subject.key].some((alias) => trialColumn === normalizeColumn(alias) + suffix));
    }
  });
  // Repeated column labels need an explicit choice in the column mapper.
  return { header, columns, firstRow: headerIndex < 0 ? 1 : headerIndex + 2 };
}

export function extractMappedRows(rows: string[][], columns: number[], first: number, last: number): string {
  if (columns.some((column) => column < 0) || new Set(columns).size !== columns.length) {
    throw new Error('Her alan için farklı bir sütun seçin.');
  }
  if (!Number.isInteger(first) || !Number.isInteger(last) || first < 1 || last < first || last > rows.length) {
    throw new Error('İlk ve son veri satırını kontrol edin.');
  }
  const selected = rows.slice(first - 1, last).map((row) =>
    columns.map((column) => (row[column] ?? '').replace(/[\t\n\r]+/g, ' ').trim()));
  if (!selected.some(([studentNumber, ...values]) => studentNumber && values.some(Boolean))) {
    throw new Error('Seçilen satırlarda kullanılabilir öğrenci kaydı bulunamadı.');
  }
  return selected.filter((row) => row.some(Boolean) && !SCHOOL_NUMBER_HEADER.test(normalizeColumn(row[0]))).map((row) => row.join('\t')).join('\n');
}
