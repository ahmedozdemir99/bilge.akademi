import { normalizeSearchText } from './searchText';
import { LGS_SUBJECT_CONFIG } from './exportUtils';

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

type PdfTextItem = { str: string; width: number; height: number; transform: number[] };

export function extractPdfPageRows(items: (PdfTextItem | { type: string })[]): string[][] {
  const pieces = items.flatMap((item) => {
    if (!('str' in item) || !item.str.trim()) return [];
    const value = item.str.trim();
    const widthPerCharacter = item.width / value.length;
    return [...value.matchAll(/\S(?:.*?\S)?(?=\s{2,}|$)/g)].map((part) => ({
      x: item.transform[4] + part.index * widthPerCharacter,
      y: item.transform[5],
      width: part[0].length * widthPerCharacter,
      height: item.height,
      value: part[0],
    }));
  }).sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: { y: number; pieces: typeof pieces }[] = [];
  for (const piece of pieces) {
    const line = lines.at(-1);
    if (line && Math.abs(line.y - piece.y) <= 2.5) line.pieces.push(piece);
    else lines.push({ y: piece.y, pieces: [piece] });
  }
  const pageRows = lines.map(({ pieces: line }) => {
    const cells: { x: number; end: number; value: string }[] = [];
    for (const piece of line.sort((a, b) => a.x - b.x)) {
      const previous = cells.at(-1);
      const end = piece.x + piece.width;
      if (previous && piece.x - previous.end < Math.max(2.5, piece.height * 0.37)) {
        previous.value += ' ' + piece.value;
        previous.end = Math.max(previous.end, end);
      } else {
        cells.push({ x: piece.x, end, value: piece.value });
      }
    }
    return cells;
  });
  const frequencies = new Map<number, number>();
  for (const row of pageRows) {
    if (row.length >= 2 && row.some(({ value }) => /^\d+$/.test(value))) {
      frequencies.set(row.length, (frequencies.get(row.length) ?? 0) + 1);
    }
  }
  const commonWidth = [...frequencies.entries()].sort(([a, n], [b, m]) => m - n || b - a)[0]?.[0];
  const reference = pageRows.find((row) => row.length === commonWidth);
  const result: string[][] = [];
  for (const row of pageRows) {
    if (!reference || row.length >= reference.length || row.length < 2) {
      result.push(row.map(({ value }) => value));
      continue;
    }
    // Empty published score cells have no text object. Align the remaining cells by position.
    const aligned = Array<string>(reference.length).fill('');
    for (const cell of row) {
      let column = 0;
      let distance = Infinity;
      for (const [index, anchor] of reference.entries()) {
        const delta = Math.min(Math.abs(cell.x - anchor.x), Math.abs(cell.end - anchor.end));
        if (delta < distance) { distance = delta; column = index; }
      }
      aligned[column] += (aligned[column] ? ' ' : '') + cell.value;
    }
    result.push(aligned);
  }
  return result;
}

async function readPdf(file: File): Promise<ImportSheet[]> {
  const [{ getDocument, GlobalWorkerOptions }, { default: workerUrl }] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ]);
  GlobalWorkerOptions.workerSrc = workerUrl;
  const task = getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    useWasm: false,
    stopAtErrors: true,
  });
  try {
    const pdf = await task.promise;
    if (pdf.numPages > 60) throw new Error('PDF en fazla 60 sayfa olabilir. İlgili sınıfın sayfalarını ayrı dosyaya alın.');
    const rows: string[][] = [];
    let readableLines = 0;
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageRows = extractPdfPageRows(content.items);
      rows.push(...pageRows);
      readableLines += pageRows.filter((row) => row.filter(Boolean).length >= 2).length;
      page.cleanup();
      checkedRows(rows);
    }
    if (!readableLines) throw new Error('PDF’de okunabilir tablo bulunamadı. Taranmış belgeler için Excel, CSV veya metin katmanı bulunan bir PDF kullanın.');
    return [{ name: 'PDF', rows }];
  } finally {
    await task.destroy();
  }
}

export async function readImportWorkbook(file: File): Promise<ImportSheet[]> {
  if (file.size > 10 * 1024 * 1024) throw new Error('Excel veya PDF dosyası en fazla 10 MB olabilir.');
  if (/\.pdf$/i.test(file.name)) return readPdf(file);
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
  throw new Error('Excel’i .xlsx veya .csv biçiminde kaydedin ya da metin içeren bir PDF seçin.');
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
