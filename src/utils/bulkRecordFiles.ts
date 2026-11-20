import { normalizeSearchText } from './searchText';
import { LGS_SUBJECT_CONFIG } from './exportUtils';
import { readBulkColumns } from './bulkStudentRecords';
import type { Student } from '../types/academy';
import { extractTableRows } from './bulkTableLayout';

export interface ImportSheet {
  name: string;
  rows: string[][];
}

const MAX_ROWS = 5000;
const MAX_COLUMNS = 80;
const SCHOOL_NUMBER_HEADER = /^(okul|ogrenci) (no|numara|numarasi)$|^(okulno|ogrencino)$/;
const NAME_HEADER = /^(isim|ad(ı)? (ve )?soyad(ı)?|adi (ve )?soyadi|ogrenci( adi( soyadi)?)?)$/;
const SCORE_HEADER = /^(puan(i)?|not(u)?|sinav puani|toplam puan|yazili( (sinav|notu|puanı|puani))?)$/;
const EXTRA_HEADER = /^(sira( no)?|no|tc( kimlik( no)?)?|sinif|sube|net|bos|lgs|toplam.*)$/;
const SCORE_VALUE = /^\d+(?:[.,]\d+)?$/;
type Classmate = Pick<Student, 'studentNumber' | 'fullName'>;

export interface ImportRange {
  firstRow: number;
  lastRow: number;
  firstColumn: number;
  lastColumn: number;
}

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
  if (/\.(csv|tsv|txt)$/i.test(file.name)) {
    const rows = checkedRows((await file.text()).replace(/^\uFEFF/, '').split(/\r\n|\n|\r/).map(readBulkColumns));
    if (!rows.some((row) => row.length >= 2)) throw new Error('CSV tablosunda okunabilir sütun bulunamadı.');
    return [{ name: 'CSV', rows }];
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

function studentName(value: string): string {
  return normalizeSearchText(value).replace(/\s+/g, ' ');
}

function studentLookup(students: Classmate[]) {
  const numbers = new Map<string, Classmate[]>();
  const names = new Map<string, Classmate[]>();
  for (const student of students) {
    const number = student.studentNumber.trim();
    const name = studentName(student.fullName);
    numbers.set(number, [...(numbers.get(number) ?? []), student]);
    names.set(name, [...(names.get(name) ?? []), student]);
  }
  return { numbers, match: (value: string) => numbers.get(value) ?? names.get(studentName(value)) ?? [] };
}

export function importSheetWidth(rows: string[][]): number {
  return rows.reduce((width, row) => Math.max(width, row.length), 0);
}

function headerType(value: string): boolean {
  return SCHOOL_NUMBER_HEADER.test(value) || NAME_HEADER.test(value) || SCORE_HEADER.test(value);
}

function detectedHeader(rows: string[][], firstColumn: number, lastColumn: number, firstRow?: number) {
  const from = firstRow ? Math.max(0, firstRow - 10) : 0;
  const to = firstRow ? Math.min(rows.length, firstRow + 2) : Math.min(rows.length, 40);
  let candidate = { rowIndex: -1, score: 0, labels: [] as string[] };
  for (let rowIndex = from; rowIndex < to; rowIndex += 1) {
    const row = rows[rowIndex];
    const labels = row.map(normalizeColumn);
    const bounded = labels.slice(firstColumn - 1, lastColumn);
    // A header can be directly above a range that starts in the middle of the table.
    const score = bounded.filter(headerType).length + bounded.filter((label) => / (d|y|dogru|yanlis)$/.test(label)).length;
    if (score > candidate.score) candidate = { rowIndex, score, labels };
  }
  return candidate;
}

export function suggestImportRange(rows: string[][]): ImportRange {
  const width = importSheetWidth(rows);
  const header = detectedHeader(rows, 1, width);
  const next = rows[header.rowIndex + 1]?.map(normalizeColumn) ?? [];
  const hasSubheader = header.rowIndex >= 0 && next.filter((value) => /^(d|y|dogru|yanlis|net|bos)$/.test(value)).length >= 2;
  let lastRow = rows.length;
  while (lastRow > 1 && !rows[lastRow - 1].some(Boolean)) lastRow -= 1;
  return { firstRow: Math.min(lastRow, header.rowIndex + (hasSubheader ? 3 : 2)), lastRow, firstColumn: 1, lastColumn: width };
}

function subjectForHeading(label: string): number {
  const aliases = [
    ['turkce', 'turk', 'trk'],
    ['matematik', 'mat'],
    ['fen bilimleri', 'fen'],
    ['inkilap tarihi sosyal', 'inkilap', 'ink', 'sosyal', 'tc inkilap tarihi ve ataturkculuk', 'inkilap tarihi'],
    ['din kulturu', 'din k', 'din', 'dkab', 'din kulturu ve ahlak bilgisi'],
    ['ingilizce', 'ing', 'yabanci dil'],
  ];
  return aliases.findIndex((subject) => subject.includes(label));
}

function markForHeading(label: string): string {
  return label.replace(/\bdogru$/, 'd').replace(/\byanlis$/, 'y').replace(/\bbos$/, 'b');
}

function trialSlot(label: string, section: number): number {
  const match = /^(?:(.+) )?([dy])$/.exec(markForHeading(label));
  if (!match) return -1;
  const subject = match[1] ? subjectForHeading(match[1]) : section;
  return subject < 0 ? -1 : 1 + subject * 2 + (match[2] === 'y' ? 1 : 0);
}

function checkImportRange(rows: string[][], range: ImportRange) {
  const { firstRow, lastRow, firstColumn, lastColumn } = range;
  if (![firstRow, lastRow, firstColumn, lastColumn].every(Number.isInteger) ||
    firstRow < 1 || firstRow > lastRow || lastRow > rows.length ||
    firstColumn < 1 || firstColumn > lastColumn || lastColumn > importSheetWidth(rows)) {
    throw new Error('İlk ve son satır ile ilk ve son sütun değerlerini kontrol edin.');
  }
}

export function inferImportColumns(rows: string[][], fields: string[], range: ImportRange, students: Classmate[]): number[] {
  checkImportRange(rows, range);
  const { firstRow, lastRow, firstColumn, lastColumn } = range;
  const indices = Array.from({ length: lastColumn - firstColumn + 1 }, (_, index) => firstColumn - 1 + index);
  const candidates: number[][] = fields.map(() => []);
  const header = detectedHeader(rows, firstColumn, lastColumn, firstRow);
  const before = rows[header.rowIndex - 1]?.map(normalizeColumn) ?? [];
  const after = rows[header.rowIndex + 1]?.map(normalizeColumn) ?? [];
  const data = rows.slice(firstRow - 1, lastRow).filter((row) => !isTableHeader(row));
  const names: number[] = [];
  let aboveSubject = -1;
  let sameRowSubject = -1;

  for (const column of indices) {
    const label = header.labels[column] ?? '';
    if (SCHOOL_NUMBER_HEADER.test(label)) candidates[0].push(column);
    if (NAME_HEADER.test(label)) names.push(column);
    if (fields[1] === 'Puan' && SCORE_HEADER.test(label)) candidates[1].push(column);
    if (fields.length > 2) {
      const above = subjectForHeading(before[column] ?? '');
      const same = subjectForHeading(label);
      if (above >= 0) aboveSubject = above;
      if (same >= 0) sameRowSubject = same;
      const slot = trialSlot(label, aboveSubject);
      const splitSlot = trialSlot(after[column] ?? '', sameRowSubject);
      if (slot > 0) candidates[slot].push(column);
      if (splitSlot > 0 && splitSlot !== slot) candidates[splitSlot].push(column);
    }
  }
  const only = (columns: number[]) => columns.length === 1 ? columns[0] : -1;
  const columns = candidates.map(only);
  const values = (column: number) => data.map((row) => row[column]?.trim() ?? '').filter(Boolean);
  const numeric = (column: number) => {
    const cells = values(column);
    return cells.length > 0 && cells.every((cell) => SCORE_VALUE.test(cell));
  };

  if (fields[1] === 'Ad Soyad') {
    columns[1] = only(names);
    if (indices.length === 2) {
      const numbers = indices.filter((column) => numeric(column));
      if (columns[0] < 0) columns[0] = only(numbers);
      if (columns[1] < 0 && columns[0] >= 0) {
        const nameColumn = indices.find((column) => column !== columns[0]);
        if (nameColumn !== undefined && values(nameColumn).some((cell) => /\p{L}/u.test(cell))) columns[1] = nameColumn;
      }
    }
  } else {
    if (columns[0] < 0 && candidates[0].length === 0) columns[0] = only(names);
    if (columns[0] < 0 && candidates[0].length === 0 && students.length) {
      const roster = studentLookup(students);
      const matchesRoster = indices.filter((column) => {
        const cells = values(column);
        return cells.length > 0 && cells.every((value) => roster.match(value).length === 1);
      });
      const numericIds = matchesRoster.filter((column) => values(column).every((value) => roster.numbers.has(value)));
      columns[0] = only(numericIds.length ? numericIds : matchesRoster);
    }
    const scoreColumns = indices.filter((column) => column !== columns[0] && !names.includes(column) && !EXTRA_HEADER.test(header.labels[column] ?? '') && numeric(column));
    if (fields.length === 2 && candidates[1].length === 0) columns[1] = only(scoreColumns);
    if (fields.length > 2 && columns[0] >= 0 && scoreColumns.length === LGS_SUBJECT_CONFIG.length * 2 &&
      candidates.slice(1).every((matches, index) => matches.length === 0 || (matches.length === 1 && matches[0] === scoreColumns[index]))) {
      scoreColumns.forEach((column, index) => { columns[index + 1] = column; });
    }
  }
  return columns;
}

function isTableHeader(row: string[]): boolean {
  const cells = row.map(normalizeColumn);
  return cells.some((value) => SCHOOL_NUMBER_HEADER.test(value) || NAME_HEADER.test(value)) ||
    cells.filter((value) => /^(d|y|dogru|yanlis|net|bos)$/.test(value)).length >= 2;
}

export function extractMappedRows(rows: string[][], columns: number[], range: ImportRange, students?: Classmate[]): string {
  checkImportRange(rows, range);
  const { firstRow, lastRow, firstColumn, lastColumn } = range;
  if (columns.some((column) => column < firstColumn - 1 || column >= lastColumn) || new Set(columns).size !== columns.length) {
    throw new Error('Sütunlar kesin eşleşmedi. Aralığı daraltın veya sütun seçimini düzeltin.');
  }
  const selected: string[] = [];
  const roster = students ? studentLookup(students) : null;
  for (let rowIndex = firstRow - 1; rowIndex < lastRow; rowIndex += 1) {
    const row = rows[rowIndex];
    if (isTableHeader(row)) continue;
    const [identifier, ...values] = columns.map((column) => (row[column] ?? '').replace(/[\t\n\r]+/g, ' ').trim());
    if (!identifier && !values.some(Boolean)) continue;
    if (roster && !values.some(Boolean)) continue;
    if (!identifier) throw new Error(`${rowIndex + 1}. satırda öğrenci bilgisi eksik. Satır aralığını kontrol edin.`);
    if (roster) {
      const matches = roster.match(identifier);
      if (matches.length !== 1) {
        throw new Error(`${rowIndex + 1}. satırdaki öğrenci sınıfta tek bir kayıtla eşleşmedi. Okul numarasını veya adı kontrol edin.`);
      }
      selected.push([matches[0].studentNumber, ...values].join('\t'));
    } else {
      selected.push([identifier, ...values].join('\t'));
    }
  }
  if (!selected.length) throw new Error('Seçilen aralıkta kullanılabilir öğrenci kaydı bulunamadı.');
  return selected.join('\n');
}
