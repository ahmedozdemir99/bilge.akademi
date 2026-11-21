import { normalizeSearchText } from './searchText';
import { LGS_SUBJECT_CONFIG } from './exportUtils';
import { publishedTrialKey, readBulkColumns } from './bulkStudentRecords';
import type { SchoolClass, Student } from '../types/academy';
import { extractTableRows } from './bulkTableLayout';
import { isSchoolNetList, readIsleyenZekaPage } from './isleyenZekaReport';

export interface ImportSheet {
  name: string;
  rows: string[][];
  published?: NonNullable<ReturnType<typeof readIsleyenZekaPage>>;
}

const MAX_ROWS = 5000;
const MAX_COLUMNS = 80;
const SCHOOL_NUMBER_HEADER = /^(okul|ogrenci) (no|numara|numarasi)$|^(okulno|ogrencino)$/;
const NAME_HEADER = /^(isim|ad(ı)? (ve )?soyad(ı)?|adi (ve )?soyadi|ogrenci( adi( soyadi)?| ad soyad)?)$/;
const SCORE_HEADER = /^(puan(i)?|not(u)?|sinav puani|toplam puan|yazili( (sinav|notu|puanı|puani))?)$/;
const EXTRA_HEADER = /^(sira( no)?|no|tc( kimlik( no)?)?|sinif|sube|net|bos|lgs|toplam.*)$/;
const SUMMARY_ROW = /^(?:(?:genel|sinif|sube|okul|ilce|il|kurum|grup|turkiye) ortalama(?:si)?\b|ortalama(?:si)?\b|(?:sinif|sube)(?: adi)?(?= [1-9])|(?:toplam )?katilimci sayisi\b)/;
const SCHOOL_NUMBER_VALUE = /^\d{1,24}$/;
const PERSON_NAME_VALUE = /^\p{L}[\p{L}'’.-]*(?: +\p{L}[\p{L}'’.-]*)+$/u;
const ROSTER_NAME_VALUE = /^\p{L}[\p{L}'’.-]*(?: +\p{L}[\p{L}'’.-]*)*$/u;
const ROSTER_NUMBER_VALUE = /^[\p{L}\d-]*\d[\p{L}\d-]*$/u;
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

export async function inspectTrialPdf(file: File) {
  const task = await loadPdf(file);
  try {
    const pdf = await task.promise;
    let end = 0;
    for (let number = 1; number <= Math.min(pdf.numPages, MAX_PDF_PAGES_PER_SCAN); number += 1) {
      const page = await pdf.getPage(number);
      try {
        const content = await page.getTextContent();
        if (!isSchoolNetList(content.items)) break;
        end = number;
      } finally {
        page.cleanup();
      }
    }
    return { count: pdf.numPages, schoolPages: end ? (end === 1 ? '1' : '1-' + end) : '' };
  } finally {
    await task.destroy();
  }
}

export async function readPdfImport(
  file: File,
  selection: string,
  imageScan: boolean,
  onProgress: (message: string) => void,
  keepPages = false,
): Promise<ImportSheet[]> {
  const task = await loadPdf(file);
  let reader: Awaited<ReturnType<typeof import('./bulkOcr').createBulkOcr>> | undefined;
  try {
    const pdf = await task.promise;
    const { first, last } = parsePdfPages(selection, pdf.numPages);
    const rows: string[][] = [];
    const pageSheets: ImportSheet[] = [];
    for (let pageNumber = first; pageNumber <= last; pageNumber += 1) {
      onProgress(`${pageNumber}. sayfa okunuyor…`);
      const page = await pdf.getPage(pageNumber);
      try {
        const start = rows.length;
        const content = imageScan ? null : await page.getTextContent();
        const published = keepPages && content ? readIsleyenZekaPage(content.items) : null;
        const textRows = published?.results.length ? published.results.map((row) => [
          row.number, row.name, row.section, ...row.scores, String(row.totalNet), String(row.score),
        ]) : content ? extractTableRows(content.items) : [];
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
        if (keepPages && rows.length > start) pageSheets.push({ name: 'Sayfa ' + pageNumber, rows: rows.slice(start), published: published ?? undefined });
      } finally {
        page.cleanup();
      }
    }
    if (!rows.some((row) => row.filter(Boolean).length >= 2)) {
      throw new Error('Seçilen PDF sayfalarında okunabilir tablo bulunamadı. Daha net bir sayfa görüntüsü veya Excel dosyası kullanın.');
    }
    const pageLabel = first === last ? String(first) : `${first}–${last}`;
    return keepPages ? pageSheets : [{ name: `PDF · Sayfa ${pageLabel}`, rows }];
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

function readDelimitedRows(text: string): string[][] {
  const lines = text.replace(/^\uFEFF/, '').split(/\r\n|\n|\r/);
  for (const delimiter of [';', ','] as const) {
    let rows: string[][];
    try {
      rows = lines.map((line) => readBulkColumns(line, delimiter));
    } catch {
      continue;
    }
    if (rows.some((row) => row.length >= 2)) return checkedRows(rows);
  }
  throw new Error('CSV tablosunda okunabilir sütun bulunamadı.');
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
    return [{ name: 'CSV', rows: readDelimitedRows(await file.text()) }];
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

function studentLookup<T extends Classmate>(students: T[]) {
  const numbers = new Map<string, T[]>();
  const names = new Map<string, T[]>();
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
    ['inkilap tarihi sosyal', 'inkilap', 'ink', 'sosyal', 'sosyal bilgiler', 'tc inkilap tarihi ve ataturkculuk', 'tc inkilap', 'inkilap tarihi'],
    ['din kulturu', 'din k', 'din', 'dkab', 'din kulturu ve ahlak bilgisi', 'din kulturu ahlak bilgisi'],
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
  const data = rows.slice(firstRow - 1, lastRow).filter((row) => !isTableHeader(row) && !isReportSummary(row));
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
  if (fields.length > 2) {
    // Group labels can be centered above several columns. Use the printed
    // subject order and the actual D/Y positions when both sequences are complete.
    const layouts = [[before, header.labels], [header.labels, after]];
    for (const [subjects, marks] of layouts) {
      const order = indices.map((column) => subjectForHeading(subjects[column] ?? '')).filter((subject) => subject >= 0);
      const pairs = indices.filter((column) => /^[dy]$/.test(markForHeading(marks[column] ?? '')));
      if (order.length !== LGS_SUBJECT_CONFIG.length || new Set(order).size !== order.length ||
        pairs.length !== order.length * 2 || !pairs.every((column, index) => markForHeading(marks[column]) === (index % 2 ? 'y' : 'd'))) continue;
      order.forEach((subject, index) => {
        candidates[1 + subject * 2] = [pairs[index * 2]];
        candidates[2 + subject * 2] = [pairs[index * 2 + 1]];
      });
      break;
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
    if (columns[1] < 0 && names.length === 0) {
      const people = indices.filter((column) => {
        const cells = values(column);
        return cells.length > 0 && cells.every((cell) => PERSON_NAME_VALUE.test(cell));
      });
      columns[1] = only(people);
    }
    if (columns[0] < 0 && candidates[0].length === 0 && columns[1] >= 0) {
      const nameColumn = columns[1];
      const namedRows = data.filter((row) => PERSON_NAME_VALUE.test(row[nameColumn] ?? ''));
      const identifiers = indices.filter((column) => column !== nameColumn && namedRows.length > 0 &&
        !EXTRA_HEADER.test(header.labels[column] ?? '') &&
        namedRows.every((row) => SCHOOL_NUMBER_VALUE.test(row[column] ?? '')));
      const beforeName = identifiers.filter((column) => column < nameColumn);
      columns[0] = only(beforeName.length ? beforeName : identifiers);
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

function isReportSummary(row: string[]): boolean {
  const first = row.find(Boolean);
  return Boolean(first && SUMMARY_ROW.test(normalizeColumn(first)));
}

export function extractMappedRows(rows: string[][], columns: number[], range: ImportRange, students?: Classmate[], ignoreReportRows = true): string {
  checkImportRange(rows, range);
  const { firstRow, lastRow, firstColumn, lastColumn } = range;
  if (columns.some((column) => column < firstColumn - 1 || column >= lastColumn) || new Set(columns).size !== columns.length) {
    throw new Error('Tablo alanı belirlenemedi. Öğrenci bilgilerinin bulunduğu alanı seçin.');
  }
  const selected: string[] = [];
  const roster = students ? studentLookup(students) : null;
  for (let rowIndex = firstRow - 1; rowIndex < lastRow; rowIndex += 1) {
    const row = rows[rowIndex];
    if (ignoreReportRows && (isTableHeader(row) || isReportSummary(row))) continue;
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
      if (!ROSTER_NUMBER_VALUE.test(identifier) || !ROSTER_NAME_VALUE.test(values[0] ?? '')) {
        throw new Error(`${rowIndex + 1}. satırda okul numarası ve ad soyad doğrulanamadı. Tabloda öğrenci satırlarını seçin.`);
      }
      selected.push([identifier, ...values].join('\t'));
    }
  }
  if (!selected.length) throw new Error('Seçilen aralıkta kullanılabilir öğrenci kaydı bulunamadı.');
  return selected.join('\n');
}

export function readTrialPdfResults(sheets: ImportSheet[], students: Student[], fields: string[], classes: SchoolClass[] = []) {
  const groups = new Map<string, string[][]>();
  const issues: string[] = [];
  const publishedResults = new Map<string, { totalNet: number; score: number }>();
  const seen = new Map<string, string>();
  const roster = studentLookup(students);
  const byNumber = new Map<string, Student[]>();
  const byName = new Map<string, Student[]>();
  for (const student of students) {
    const number = student.studentNumber.trim();
    const name = studentName(student.fullName);
    byNumber.set(number, [...(byNumber.get(number) ?? []), student]);
    byName.set(name, [...(byName.get(name) ?? []), student]);
  }

  const sections = new Map(classes.map((item) => [item.id, normalizeSearchText(item.gradeLevel + item.section).replace(/[^a-z0-9]/g, '')]));

  let previous: { width: number; columns: number[]; numberColumn: number; nameColumn: number } | undefined;
  for (const sheet of sheets) {
    if (sheet.published) {
      const { results, invalid } = sheet.published;
      if (invalid) issues.push(sheet.name + ' · ' + invalid + ' satırın net veya puan bilgisi doğrulanamadı.');
      let unmatched = 0;
      for (const row of results) {
        const section = normalizeSearchText(row.section).replace(/[^a-z0-9]/g, '');
        const candidates = (byNumber.get(row.number) ?? []).filter((item) => sections.get(item.classId) === section);
        const pdfName = studentName(row.name).replace(/\s/g, '');
        const named = candidates.filter((item) => studentName(item.fullName).replace(/\s/g, '') === pdfName);
        const student = named.length === 1 ? named[0] : undefined;
        if (!student) { unmatched += 1; continue; }
        const signature = [...row.scores, row.totalNet, row.score].join(',');
        if (seen.has(student.id)) {
          if (seen.get(student.id) !== signature) throw new Error('Aynı öğrenci için iki farklı PDF sonucu bulundu.');
          continue;
        }
        seen.set(student.id, signature);
        const group = groups.get(student.classId) ?? [];
        group.push([student.studentNumber, ...row.scores]);
        groups.set(student.classId, group);
        publishedResults.set(publishedTrialKey(student.classId, student.studentNumber), { totalNet: row.totalNet, score: row.score });
      }
      if (unmatched) issues.push(sheet.name + ' · ' + unmatched + ' sonuç okul numarası ve sınıfla eşleşmedi.');
      previous = undefined;
      continue;
    }
    const { rows } = sheet;
    if (!rows.some((row) => row.filter(Boolean).length >= 3)) continue;
    const range = suggestImportRange(rows);
    const header = detectedHeader(rows, 1, range.lastColumn, range.firstRow);
    let columns = inferImportColumns(rows, fields, range, students);
    let numberColumn = header.labels.findIndex((label) => SCHOOL_NUMBER_HEADER.test(label));
    let nameColumn = header.labels.findIndex((label) => NAME_HEADER.test(label));
    const complete = (mapping: number[]) => mapping.every((column) => column >= 0) && new Set(mapping).size === fields.length;
    if (header.rowIndex < 0 && previous?.width === range.lastColumn) {
      ({ columns, numberColumn, nameColumn } = previous);
    } else if (complete(columns)) {
      previous = { width: range.lastColumn, columns, numberColumn, nameColumn };
    }
    if (!complete(columns)) {
      issues.push(sheet.name + ' · Altı dersin doğru ve yanlış sütunları belirlenemedi.');
      previous = undefined;
      continue;
    }

    for (const [index, row] of rows.entries()) {
      if (index + 1 < range.firstRow || isTableHeader(row) || isReportSummary(row)) continue;
      const values = columns.slice(1).map((column) => row[column]?.trim() ?? '');
      if (values.every((value) => !value)) continue;
      const line = sheet.name + ' · ' + (index + 1) + '. satır';
      const identifier = row[columns[0]]?.trim() ?? '';
      const rawName = nameColumn >= 0 ? (row[nameColumn] ?? '').trim() : '';
      const rawNumber = numberColumn >= 0 ? (row[numberColumn] ?? '').trim() : '';
      const names = rawName ? byName.get(studentName(rawName)) ?? [] : undefined;
      const numbers = rawNumber ? byNumber.get(rawNumber) ?? [] : undefined;
      const matches = names && numbers
        ? names.filter((item) => numbers.some((student) => student.id === item.id))
        : names ?? numbers ?? roster.match(identifier);
      const student = matches.length === 1 && !(rawName && PERSON_NAME_VALUE.test(rawName) && !names?.length) ? matches[0] : undefined;
      if (!student) {
        issues.push(line + ' · Öğrenci Bilge Akademi’de tek bir kayıtla eşleşmedi.');
        continue;
      }

      const valid = LGS_SUBJECT_CONFIG.every(({ maxQuestions }, subject) => {
        const [d, y] = values.slice(subject * 2, subject * 2 + 2);
        return /^\d+$/.test(d) && /^\d+$/.test(y) && Number(d) + Number(y) <= maxQuestions;
      });
      if (!valid) {
        issues.push(line + ' · Doğru ve yanlış sayılarında eksik veya geçersiz değer var.');
        continue;
      }
      const scores = values.map((value) => String(Number(value)));
      const signature = scores.join(',');
      if (seen.has(student.id)) {
        if (seen.get(student.id) !== signature) throw new Error(line + ' · Aynı öğrenci için iki farklı sonuç bulundu. PDF sayfalarını ayrı ayrı seçin.');
        continue;
      }
      seen.set(student.id, signature);
      const group = groups.get(student.classId) ?? [];
      group.push([student.studentNumber, ...scores]);
      groups.set(student.classId, group);
    }
  }
  return { groups, issues, publishedResults };
}
