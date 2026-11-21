import * as XLSX from 'xlsx';
import {
  ExamArchiveState,
  ExamMeta,
  ExamRanks,
  ParsedExamBundle,
  SUBJECT_LIST,
  SUBJECT_MAP,
  SubjectKey,
  SubjectScore,
  StudentExamRecord,
  StudentProfile,
  TOTAL_LGS_QUESTIONS,
} from '../types/exam';
import {
  buildStudentKey,
  matchSubjectLabel,
  normalizeClassName,
  normalizeTurkish,
} from './pdfParser';
import {
  aggregateStudentKazanimlar,
  buildClassComparison,
  getSortedExams,
} from './analytics';

function parseCellNumber(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return Number.isFinite(val) ? val : null;
  let cleaned = String(val).trim().replace(/%/g, '').replace(/\s+/g, '');
  if (!cleaned || cleaned === '-' || cleaned === '—') return null;
  if (cleaned.includes(',') && cleaned.includes('.')) {
    if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.');
  }
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function makeSubjectScore(
  key: SubjectKey,
  d: number | null,
  y: number | null,
  b: number | null,
  n: number | null
): SubjectScore {
  const soru = SUBJECT_MAP[key].questionCount;
  // Handle Net-only Excel sheets gracefully
  if (d === null && y === null && n !== null) {
    const estD = Math.max(0, Math.min(soru, Math.round(n)));
    const net = round2(n);
    return {
      soru,
      dogru: estD,
      yanlis: 0,
      bos: Math.max(0, soru - estD),
      net,
      basariYuzdesi: Math.round((net / soru) * 100),
    };
  }

  const dogru = Math.max(0, Math.min(soru, Math.round(d ?? 0)));
  const yanlis = Math.max(0, Math.min(soru - dogru, Math.round(y ?? 0)));
  const bos =
    b !== null ? Math.max(0, Math.min(soru, Math.round(b))) : Math.max(0, soru - dogru - yanlis);
  const net = n !== null ? round2(n) : round2(dogru - yanlis / 3);
  const basariYuzdesi = Math.round((net / soru) * 100);
  return { soru, dogru, yanlis, bos, net, basariYuzdesi };
}

type MetricType = 'D' | 'Y' | 'B' | 'N';

interface ColMapping {
  noIdx: number;
  nameIdx: number;
  surnameIdx: number;
  sinifIdx: number;
  lgsIdx: number;
  okulRankIdx: number;
  sinifRankIdx: number;
  genelRankIdx: number;
  yuzdelikIdx: number;
  subjectCols: Record<SubjectKey, Partial<Record<MetricType, number>>>;
  toplamCols: Partial<Record<MetricType, number>>;
  dataStartRow: number;
  matchedSubjectCount: number;
}

function detectMetricSuffix(norm: string): MetricType | null {
  // Check trailing word/token like "TURKCE D", "MAT NET", "FEN YANLIS", "ING B"
  const tokens = norm.split(/\s+/).filter(Boolean);
  const last = tokens[tokens.length - 1] || '';
  if (last === 'D' || last === 'DOGRU' || last === 'DOG') return 'D';
  if (last === 'Y' || last === 'YANLIS' || last === 'YAN') return 'Y';
  if (last === 'B' || last === 'BOS') return 'B';
  if (last === 'N' || last === 'NET') return 'N';
  return null;
}

function detectExcelColumns(rows: unknown[][]): ColMapping | null {
  const maxScan = Math.min(rows.length, 20);
  let bestMapping: ColMapping | null = null;
  let bestScore = -1;

  for (let r = 0; r < maxScan; r++) {
    const row = rows[r] || [];
    const nextRow = rows[r + 1] || [];
    const colCount = Math.max(row.length, nextRow.length);
    if (colCount < 4) continue;

    // Check if nextRow looks like a sub-header row (D / Y / B / N)
    let subHeaderHits = 0;
    for (let c = 0; c < nextRow.length; c++) {
      const n = normalizeTurkish(String(nextRow[c] ?? ''));
      if (/^(D|Y|B|N|NET|DOGRU|YANLIS|BOS)$/.test(n)) subHeaderHits++;
    }
    const hasTwoRowHeader = subHeaderHits >= 6;

    const subjectCols: Record<SubjectKey, Partial<Record<MetricType, number>>> = {
      turkce: {},
      tarih: {},
      din: {},
      ingilizce: {},
      matematik: {},
      fen: {},
    };
    const toplamCols: Partial<Record<MetricType, number>> = {};

    let noIdx = -1;
    let nameIdx = -1;
    let surnameIdx = -1;
    let sinifIdx = -1;
    let lgsIdx = -1;
    let okulRankIdx = -1;
    let sinifRankIdx = -1;
    let genelRankIdx = -1;
    let yuzdelikIdx = -1;

    // Carry forward merged group headers in row[r] when hasTwoRowHeader is true
    let activeGroup: SubjectKey | 'toplam' | null = null;

    for (let c = 0; c < colCount; c++) {
      const topRaw = String(row[c] ?? '').trim();
      const subRaw = hasTwoRowHeader ? String(nextRow[c] ?? '').trim() : '';
      const topNorm = normalizeTurkish(topRaw);
      const subNorm = normalizeTurkish(subRaw);
      const combinedNorm = `${topNorm} ${subNorm}`.trim();

      // Identity & meta columns
      if (
        noIdx === -1 &&
        /^(O NO|ONO|OGR NO|OGRENCI NO|NUMARA|OKUL NO|NO)$/.test(topNorm)
      ) {
        noIdx = c;
        activeGroup = null;
        continue;
      }
      if (
        nameIdx === -1 &&
        /(ADI SOYADI|AD SOYAD|OGRENCI ADI|OGRENCI|ISIM|^AD$|^ADI$)/.test(topNorm) &&
        !topNorm.includes('SINAV')
      ) {
        nameIdx = c;
        activeGroup = null;
        continue;
      }
      if (surnameIdx === -1 && /^(SOYAD|SOYADI)$/.test(topNorm)) {
        surnameIdx = c;
        activeGroup = null;
        continue;
      }
      if (sinifIdx === -1 && /^(SINIF|SUBE|SINIFI|SNF|SINIF SUBE)$/.test(topNorm)) {
        sinifIdx = c;
        activeGroup = null;
        continue;
      }
      if (lgsIdx === -1 && (topNorm === 'LGS' || topNorm.includes('LGS PUAN') || topNorm === 'PUAN' || topNorm === 'PUANI' || combinedNorm.includes('LGS PUAN'))) {
        lgsIdx = c;
        activeGroup = null;
        continue;
      }
      if (yuzdelikIdx === -1 && (topNorm.includes('YUZDE') || subNorm.includes('YUZDE') || topNorm === '%')) {
        yuzdelikIdx = c;
        continue;
      }
      if (okulRankIdx === -1 && (combinedNorm.includes('OKUL SIRA') || combinedNorm.includes('KURUM SIRA') || subNorm === 'OKUL' || subNorm === 'KURUM')) {
        okulRankIdx = c;
        continue;
      }
      if (sinifRankIdx === -1 && (combinedNorm.includes('SINIF SIRA') || subNorm === 'SNF')) {
        sinifRankIdx = c;
        continue;
      }
      if (genelRankIdx === -1 && (combinedNorm.includes('GENEL SIRA') || subNorm === 'GENEL')) {
        genelRankIdx = c;
        continue;
      }

      if (hasTwoRowHeader) {
        if (topNorm) {
          if (topNorm.startsWith('TOPLAM') || topNorm === 'TOP') {
            activeGroup = 'toplam';
          } else {
            const subj = matchSubjectLabel(topRaw);
            if (subj) activeGroup = subj;
            else if (topNorm.includes('DERECE') || topNorm.includes('SIRA')) activeGroup = null;
          }
        }
        const metric = detectMetricSuffix(subNorm);
        if (activeGroup && metric) {
          if (activeGroup === 'toplam') {
            if (toplamCols[metric] === undefined) toplamCols[metric] = c;
          } else {
            if (subjectCols[activeGroup][metric] === undefined) subjectCols[activeGroup][metric] = c;
          }
        }
      } else {
        // Single-row flat header: e.g. "Türkçe D", "TÜR Net", "Matematik Yanlış", "Toplam Net", or plain "Türkçe"
        if (topNorm.startsWith('TOPLAM') || topNorm.startsWith('TOP ')) {
          const metric = detectMetricSuffix(topNorm) ?? 'N';
          if (toplamCols[metric] === undefined) toplamCols[metric] = c;
          continue;
        }
        const metric = detectMetricSuffix(topNorm);
        const labelPart = metric
          ? topNorm.replace(/\s+(D|DOGRU|DOG|Y|YANLIS|YAN|B|BOS|N|NET)$/, '').trim()
          : topNorm;
        const subj = matchSubjectLabel(labelPart);
        if (subj) {
          const targetMetric: MetricType = metric ?? 'N';
          if (subjectCols[subj][targetMetric] === undefined) {
            subjectCols[subj][targetMetric] = c;
          }
        }
      }
    }

    const matchedSubjects = SUBJECT_LIST.filter(
      (s) => Object.keys(subjectCols[s.key]).length > 0
    ).length;

    if (matchedSubjects >= 3) {
      const score =
        matchedSubjects * 10 +
        (nameIdx !== -1 ? 8 : 0) +
        (lgsIdx !== -1 ? 4 : 0) +
        (Object.keys(toplamCols).length > 0 ? 4 : 0) +
        (hasTwoRowHeader ? 5 : 0);
      if (score > bestScore) {
        bestScore = score;
        bestMapping = {
          noIdx,
          nameIdx,
          surnameIdx,
          sinifIdx,
          lgsIdx,
          okulRankIdx,
          sinifRankIdx,
          genelRankIdx,
          yuzdelikIdx,
          subjectCols,
          toplamCols,
          dataStartRow: r + (hasTwoRowHeader ? 2 : 1),
          matchedSubjectCount: matchedSubjects,
        };
      }
    }
  }

  return bestMapping;
}

export async function parseExamExcel(
  source: ArrayBuffer,
  fileName: string,
  options?: {
    customExamName?: string;
    examDate?: string;
    examOrder?: number;
  }
): Promise<ParsedExamBundle> {
  const workbook = XLSX.read(source, { type: 'array' });
  if (!workbook.SheetNames.length) {
    throw new Error('Excel dosyasında okunabilir bir sayfa bulunamadı.');
  }

  let selectedRows: unknown[][] = [];
  let mapping: ColMapping | null = null;
  let detectedSheetTitle = '';

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: '',
      blankrows: false,
    });
    const m = detectExcelColumns(rows);
    if (m && (!mapping || m.matchedSubjectCount > mapping.matchedSubjectCount)) {
      mapping = m;
      selectedRows = rows;
      detectedSheetTitle = sheetName;
    }
  }

  if (!mapping) {
    throw new Error(
      'Excel dosyasında LGS ders sütunları (Türkçe, İnkılap/Tarih, Din, İngilizce, Matematik, Fen) algılanamadı. Örnek Excel şablonunu indirip sütun başlıklarını kontrol edebilirsiniz.'
    );
  }

  // Try to detect exam name / school name from top title rows above header
  let detectedExamName = options?.customExamName?.trim() || '';
  let detectedSchoolName = '';
  for (let r = 0; r < Math.min(mapping.dataStartRow - 1, 5); r++) {
    const text = (selectedRows[r] || [])
      .map((cell) => String(cell ?? '').trim())
      .filter(Boolean)
      .join(' ');
    const norm = normalizeTurkish(text);
    if (!detectedSchoolName && /(ORTAOKUL|OKULU|KOLEJ|IMAM HATIP|KURS)/.test(norm)) {
      detectedSchoolName = text;
    } else if (!detectedExamName && /(DENEME|GELISIM|IZLEME|LGS|SINAV|TARAMA)/.test(norm) && text.length < 80) {
      detectedExamName = text;
    }
  }

  if (!detectedExamName) {
    detectedExamName = fileName.replace(/\.(xlsx|xls|csv)$/i, '');
  }
  if (!detectedSchoolName) {
    detectedSchoolName = detectedSheetTitle && detectedSheetTitle !== 'Sheet1'
      ? `8. Sınıf LGS Okul Arşivi (${detectedSheetTitle})`
      : '8. Sınıf LGS Okul Arşivi';
  }

  const nowIso = new Date().toISOString();
  const examDate = options?.examDate || nowIso.slice(0, 10);
  const examOrder = options?.examOrder ?? 1;
  const examId = `exam_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  let schoolAvgLgs: number | undefined;
  let generalAvgLgs: number | undefined;
  let schoolAvgToplamNet: number | undefined;
  let generalAvgToplamNet: number | undefined;
  const schoolSubjectNets: Partial<Record<SubjectKey, number>> = {};
  const generalSubjectNets: Partial<Record<SubjectKey, number>> = {};

  const records: ParsedExamBundle['records'] = [];

  for (let r = mapping.dataStartRow; r < selectedRows.length; r++) {
    const row = selectedRows[r] || [];
    const rowJoined = row.map((c) => String(c ?? '').trim()).join(' ').trim();
    if (!rowJoined) continue;

    const normJoined = normalizeTurkish(rowJoined);

    // Check benchmark rows (Genel Ortalama / Okul Ortalaması)
    if (
      normJoined.includes('GENEL ORTALAMA') ||
      normJoined.includes('OKUL ORTALAMA') ||
      normJoined.includes('KURUM ORTALAMA')
    ) {
      const isGen = normJoined.includes('GENEL ORTALAMA');
      for (const s of SUBJECT_LIST) {
        const nIdx = mapping.subjectCols[s.key].N;
        const val = nIdx !== undefined ? parseCellNumber(row[nIdx]) : null;
        if (val !== null) {
          if (isGen) generalSubjectNets[s.key] = round2(val);
          else schoolSubjectNets[s.key] = round2(val);
        }
      }
      if (mapping.toplamCols.N !== undefined) {
        const tVal = parseCellNumber(row[mapping.toplamCols.N]);
        if (tVal !== null) {
          if (isGen) generalAvgToplamNet = round2(tVal);
          else schoolAvgToplamNet = round2(tVal);
        }
      }
      if (mapping.lgsIdx !== -1) {
        const lVal = parseCellNumber(row[mapping.lgsIdx]);
        if (lVal !== null && lVal > 50 && lVal <= 500) {
          if (isGen) generalAvgLgs = round2(lVal);
          else schoolAvgLgs = round2(lVal);
        }
      }
      continue;
    }

    if (normJoined.includes('SUBE ORTALAMA') || normJoined.includes('SINIF ORTALAMA')) {
      continue;
    }

    // Build student name
    let name = '';
    if (mapping.nameIdx !== -1) {
      const firstPart = String(row[mapping.nameIdx] ?? '').trim();
      const secondPart =
        mapping.surnameIdx !== -1 ? String(row[mapping.surnameIdx] ?? '').trim() : '';
      name = `${firstPart} ${secondPart}`.replace(/\s+/g, ' ').trim();
    } else {
      // Fallback: pick first text cell with letters
      const firstText = row.find((cell) => /[A-Za-zÇĞİÖŞÜçğıöşü]{3,}/.test(String(cell ?? '')));
      name = firstText ? String(firstText).trim() : '';
    }

    if (!name || name.length < 2) continue;
    if (/^(ADI SOYADI|AD SOYAD|OGRENCI|ISIM|TOPLAM|ORTALAMA)$/.test(normalizeTurkish(name))) {
      continue;
    }

    const numaraRaw = mapping.noIdx !== -1 ? String(row[mapping.noIdx] ?? '').trim() : '';
    const numara = numaraRaw.replace(/\D/g, '') || '0';
    const sinifRaw = mapping.sinifIdx !== -1 ? String(row[mapping.sinifIdx] ?? '').trim() : '8-A';
    const sinif = normalizeClassName(sinifRaw || '8-A');

    // Parse all 6 subjects
    const subjects = {} as Record<SubjectKey, SubjectScore>;
    let hasAnyNumeric = false;

    for (const s of SUBJECT_LIST) {
      const cols = mapping.subjectCols[s.key];
      const d = cols.D !== undefined ? parseCellNumber(row[cols.D]) : null;
      const y = cols.Y !== undefined ? parseCellNumber(row[cols.Y]) : null;
      const b = cols.B !== undefined ? parseCellNumber(row[cols.B]) : null;
      const n = cols.N !== undefined ? parseCellNumber(row[cols.N]) : null;
      if (d !== null || y !== null || b !== null || n !== null) {
        hasAnyNumeric = true;
      }
      subjects[s.key] = makeSubjectScore(s.key, d, y, b, n);
    }

    if (!hasAnyNumeric) continue;

    // Parse Toplam
    const sumD = SUBJECT_LIST.reduce((acc, s) => acc + subjects[s.key].dogru, 0);
    const sumY = SUBJECT_LIST.reduce((acc, s) => acc + subjects[s.key].yanlis, 0);
    const sumNet = round2(SUBJECT_LIST.reduce((acc, s) => acc + subjects[s.key].net, 0));

    const tD =
      mapping.toplamCols.D !== undefined ? parseCellNumber(row[mapping.toplamCols.D]) ?? sumD : sumD;
    const tY =
      mapping.toplamCols.Y !== undefined ? parseCellNumber(row[mapping.toplamCols.Y]) ?? sumY : sumY;
    const tB =
      mapping.toplamCols.B !== undefined
        ? parseCellNumber(row[mapping.toplamCols.B]) ?? Math.max(0, TOTAL_LGS_QUESTIONS - tD - tY)
        : Math.max(0, TOTAL_LGS_QUESTIONS - tD - tY);
    const tN =
      mapping.toplamCols.N !== undefined
        ? parseCellNumber(row[mapping.toplamCols.N]) ?? sumNet
        : sumNet;

    const toplam: SubjectScore = {
      soru: TOTAL_LGS_QUESTIONS,
      dogru: Math.round(tD),
      yanlis: Math.round(tY),
      bos: Math.max(0, Math.round(tB)),
      net: round2(tN),
      basariYuzdesi: Math.round((tN / TOTAL_LGS_QUESTIONS) * 100),
    };

    let lgsPuan = mapping.lgsIdx !== -1 ? parseCellNumber(row[mapping.lgsIdx]) ?? 0 : 0;
    if (lgsPuan <= 0 && toplam.net > 0) {
      lgsPuan = round2(Math.min(500, Math.max(100, 190 + toplam.net * 3.45)));
    } else {
      lgsPuan = Math.round(lgsPuan * 1000) / 1000;
    }

    const dereceler: ExamRanks = {
      sinif:
        mapping.sinifRankIdx !== -1
          ? parseCellNumber(row[mapping.sinifRankIdx]) ?? undefined
          : undefined,
      okul:
        mapping.okulRankIdx !== -1
          ? parseCellNumber(row[mapping.okulRankIdx]) ?? undefined
          : undefined,
      genel:
        mapping.genelRankIdx !== -1
          ? parseCellNumber(row[mapping.genelRankIdx]) ?? undefined
          : undefined,
      yuzdelik:
        mapping.yuzdelikIdx !== -1
          ? parseCellNumber(row[mapping.yuzdelikIdx]) ?? undefined
          : undefined,
    };

    const record: StudentExamRecord = {
      examId,
      examName: detectedExamName,
      examOrder,
      examDate,
      uploadedAt: nowIso,
      lgsPuan,
      genelOrtPuan: generalAvgLgs,
      okulOrtPuan: schoolAvgLgs,
      dereceler,
      subjects,
      toplam,
      kazanimlar: [],
    };

    records.push({
      studentKey: buildStudentKey(numara, name, sinif),
      numara,
      name,
      sinif,
      record,
    });
  }

  if (records.length === 0) {
    throw new Error('Excel sayfasında geçerli öğrenci deneme satırı bulunamadı.');
  }

  // Compute school averages from parsed students if not provided in benchmark rows
  const computedAvgLgs =
    schoolAvgLgs ?? round2(records.reduce((s, r) => s + r.record.lgsPuan, 0) / records.length);
  const computedAvgNet =
    schoolAvgToplamNet ??
    round2(records.reduce((s, r) => s + r.record.toplam.net, 0) / records.length);

  for (const s of SUBJECT_LIST) {
    if (schoolSubjectNets[s.key] === undefined) {
      schoolSubjectNets[s.key] = round2(
        records.reduce((acc, r) => acc + r.record.subjects[s.key].net, 0) / records.length
      );
    }
  }

  // Fill school/general benchmarks & rank inside school if missing
  const sortedByLgs = [...records].sort((a, b) => b.record.lgsPuan - a.record.lgsPuan);
  sortedByLgs.forEach((r, idx) => {
    if (!r.record.dereceler.okul) {
      r.record.dereceler.okul = idx + 1;
    }
    r.record.okulOrtPuan = computedAvgLgs;
    r.record.genelOrtPuan = generalAvgLgs;
    r.record.toplam.kurumOrt = computedAvgNet;
    r.record.toplam.genelOrt = generalAvgToplamNet;
    for (const s of SUBJECT_LIST) {
      r.record.subjects[s.key].kurumOrt = schoolSubjectNets[s.key];
      r.record.subjects[s.key].genelOrt = generalSubjectNets[s.key];
    }
  });

  const examMeta: ExamMeta = {
    id: examId,
    name: detectedExamName,
    fileName,
    schoolName: detectedSchoolName,
    location: '',
    examDate,
    uploadedAt: nowIso,
    examOrder,
    studentCount: records.length,
    schoolAvgLgs: computedAvgLgs,
    generalAvgLgs,
    schoolAvgToplamNet: computedAvgNet,
    generalAvgToplamNet,
    schoolSubjectNets,
    generalSubjectNets,
  };

  return { examMeta, records };
}

/**
 * Generates and downloads a clean, ready-to-fill .xlsx template for teachers.
 */
export function downloadExcelTemplate(): void {
  const headers = [
    'Öğrenci No',
    'Adı Soyadı',
    'Sınıf',
    ...SUBJECT_LIST.flatMap((s) => [
      `${s.label} D`,
      `${s.label} Y`,
      `${s.label} B`,
      `${s.label} Net`,
    ]),
    'Toplam D',
    'Toplam Y',
    'Toplam B',
    'Toplam Net',
    'LGS Puanı',
  ];

  const exampleRow = [
    571,
    'ÖRNEK ÖĞRENCİ',
    '8-A',
    18, 2, 0, 17.33,
    9, 1, 0, 8.67,
    8, 2, 0, 7.33,
    7, 2, 1, 6.33,
    14, 3, 3, 13.0,
    16, 2, 2, 15.33,
    72, 12, 6, 68.0,
    428.5,
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
  ws['!cols'] = [
    { wch: 12 },
    { wch: 24 },
    { wch: 8 },
    ...SUBJECT_LIST.flatMap(() => [{ wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 11 }]),
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Deneme Sonuçları');
  XLSX.writeFile(wb, 'LGS_Deneme_Yukleme_Sablonu.xlsx');
}

/**
 * Exports a single student's full exam archive + kazanım analysis to a multi-sheet .xlsx workbook.
 */
export function exportStudentToExcel(student: StudentProfile): void {
  const sorted = getSortedExams(student);
  const archiveHeaders = [
    'Deneme Adı',
    'Tarih',
    'LGS Puanı',
    'Okul Sıra',
    'Genel Sıra',
    ...SUBJECT_LIST.flatMap((s) => [
      `${s.shortLabel} D`,
      `${s.shortLabel} Y`,
      `${s.shortLabel} B`,
      `${s.shortLabel} Net`,
    ]),
    'Toplam D',
    'Toplam Y',
    'Toplam B',
    'Toplam Net',
  ];

  const archiveRows = sorted.map((ex) => [
    ex.examName,
    ex.examDate,
    ex.lgsPuan,
    ex.dereceler.okul ?? '',
    ex.dereceler.genel ?? '',
    ...SUBJECT_LIST.flatMap((s) => {
      const sc = ex.subjects[s.key];
      return [sc.dogru, sc.yanlis, sc.bos, sc.net];
    }),
    ex.toplam.dogru,
    ex.toplam.yanlis,
    ex.toplam.bos,
    ex.toplam.net,
  ]);

  const wb = XLSX.utils.book_new();
  const wsArchive = XLSX.utils.aoa_to_sheet([
    [`Öğrenci: ${student.name}`, `Şube: ${student.sinif}`, `No: ${student.numara}`],
    [],
    archiveHeaders,
    ...archiveRows,
  ]);
  XLSX.utils.book_append_sheet(wb, wsArchive, 'Deneme Arşivi');

  const kazanimlar = aggregateStudentKazanimlar(student);
  if (kazanimlar.length > 0) {
    const kHeaders = ['Ders', 'Kazanım', 'Deneme Sayısı', 'Soru', 'Doğru', 'Yanlış', 'Boş', 'Başarı %', 'Durum'];
    const kRows = kazanimlar.map((k) => [
      SUBJECT_MAP[k.subject].label,
      k.text,
      k.examCount,
      k.totalSoru,
      k.totalDogru,
      k.totalYanlis,
      k.totalBos,
      k.basariYuzdesi,
      k.status === 'eksik' ? 'Eksik' : k.status === 'gelistirilmeli' ? 'Geliştirilmeli' : 'Başarılı',
    ]);
    const wsKazanim = XLSX.utils.aoa_to_sheet([kHeaders, ...kRows]);
    wsKazanim['!cols'] = [{ wch: 16 }, { wch: 64 }, { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, wsKazanim, 'Kazanım Analizi');
  }

  XLSX.writeFile(wb, `${student.name.replace(/\s+/g, '_')}_Deneme_Arsivi.xlsx`);
}

/**
 * Exports the entire school's archive (Şube Ortalamaları + Tüm Öğrenciler + Satır Satır Tüm Denemeler) to .xlsx.
 */
export function exportSchoolArchiveToExcel(
  state: ExamArchiveState,
  activeExamId?: string,
  compareExamId?: string
): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Şube Ortalamaları & Öğrenci Netleri
  const classRows = buildClassComparison(state, activeExamId, compareExamId);
  const classHeaders = [
    'Şube / Öğrenci',
    'Öğr. Sayısı / No',
    ...SUBJECT_LIST.map((s) => `${s.label} Net`),
    'Toplam Net',
    'LGS Puanı',
  ];
  const classSheetRows: unknown[][] = [classHeaders];
  for (const cls of classRows) {
    classSheetRows.push([
      `${cls.sinif} (Şube Ortalaması)`,
      cls.studentCount,
      ...SUBJECT_LIST.map((s) => cls.subjectNets[s.key]),
      cls.avgToplamNet,
      cls.avgLgs,
    ]);
    for (const st of cls.students) {
      classSheetRows.push([
        `   ${st.name}`,
        st.numara,
        ...SUBJECT_LIST.map((s) => st.subjectNets[s.key]),
        st.toplamNet,
        st.lgsPuan,
      ]);
    }
  }
  const wsClass = XLSX.utils.aoa_to_sheet(classSheetRows);
  XLSX.utils.book_append_sheet(wb, wsClass, 'Şube ve Öğrenciler');

  // Sheet 2: Tüm Denemeler Satır Satır Arşiv (Every student × every exam)
  const fullHeaders = [
    'Öğrenci No',
    'Adı Soyadı',
    'Şube',
    'Deneme Adı',
    'Tarih',
    ...SUBJECT_LIST.flatMap((s) => [
      `${s.shortLabel} D`,
      `${s.shortLabel} Y`,
      `${s.shortLabel} B`,
      `${s.shortLabel} Net`,
    ]),
    'Toplam D',
    'Toplam Y',
    'Toplam B',
    'Toplam Net',
    'LGS Puanı',
  ];
  const fullRows: unknown[][] = [fullHeaders];
  for (const st of state.students) {
    for (const ex of getSortedExams(st)) {
      fullRows.push([
        st.numara,
        st.name,
        st.sinif,
        ex.examName,
        ex.examDate,
        ...SUBJECT_LIST.flatMap((s) => {
          const sc = ex.subjects[s.key];
          return [sc.dogru, sc.yanlis, sc.bos, sc.net];
        }),
        ex.toplam.dogru,
        ex.toplam.yanlis,
        ex.toplam.bos,
        ex.toplam.net,
        ex.lgsPuan,
      ]);
    }
  }
  const wsFull = XLSX.utils.aoa_to_sheet(fullRows);
  XLSX.utils.book_append_sheet(wb, wsFull, 'Tüm Deneme Arşivi');

  XLSX.writeFile(wb, `LGS_Okul_Deneme_Arsivi_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export interface LeaderboardExportRow {
  student: StudentProfile;
  schoolRank: number;
  examMap: Map<string, StudentExamRecord>;
  attendedCount: number;
  avgLgs: number;
  avgToplamNet: number;
  avgSubjectNets: Record<SubjectKey, number>;
}

/**
 * Exports the multi-exam leaderboard (ranked highest to lowest with 1., 2., 3. exam subject nets & averages) to .xlsx.
 */
export function exportLeaderboardToExcel(
  sortedExams: ExamMeta[],
  rows: LeaderboardExportRow[]
): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Genel Sıralama ve Ortalamalar
  const summaryHeaders = [
    'Sıra',
    'Adı Soyadı',
    'Şube',
    'Öğrenci No',
    'Katıldığı Deneme',
    'Ortalama LGS',
    'Ortalama Toplam Net',
    ...SUBJECT_LIST.map((s) => `Ort. ${s.label} Net`),
    ...sortedExams.flatMap((ex, idx) => [
      `${idx + 1}. Deneme Net (${ex.name})`,
      `${idx + 1}. Deneme LGS`,
    ]),
  ];

  const summaryData: Array<Array<string | number>> = rows.map((row, idx) => [
    idx + 1,
    row.student.name,
    row.student.sinif,
    row.student.numara,
    `${row.attendedCount}/${sortedExams.length}`,
    row.avgLgs,
    row.avgToplamNet,
    ...SUBJECT_LIST.map((s) => row.avgSubjectNets[s.key]),
    ...sortedExams.flatMap<string | number>((ex) => {
      const rec = row.examMap.get(ex.id);
      return rec ? [rec.toplam.net, rec.lgsPuan] : ['', ''];
    }),
  ]);

  const wsSummary = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryData]);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Genel Sıralama');

  // Sheet 2: Tüm Denemeler Ders Bazlı Matris
  const matrixHeaders = [
    'Sıra',
    'Adı Soyadı',
    'Şube',
    ...SUBJECT_LIST.map((s) => `Ort. ${s.shortLabel}`),
    'Ort. Net',
    'Ort. LGS',
    ...sortedExams.flatMap((_, idx) => [
      ...SUBJECT_LIST.map((s) => `${idx + 1}.D ${s.shortLabel}`),
      `${idx + 1}.D Net`,
      `${idx + 1}.D LGS`,
    ]),
  ];

  const matrixData: Array<Array<string | number>> = rows.map((row, idx) => [
    idx + 1,
    row.student.name,
    row.student.sinif,
    ...SUBJECT_LIST.map((s) => row.avgSubjectNets[s.key]),
    row.avgToplamNet,
    row.avgLgs,
    ...sortedExams.flatMap<string | number>((ex) => {
      const rec = row.examMap.get(ex.id);
      if (!rec) return [...SUBJECT_LIST.map(() => ''), '', ''];
      return [...SUBJECT_LIST.map((s) => rec.subjects[s.key].net), rec.toplam.net, rec.lgsPuan];
    }),
  ]);

  const wsMatrix = XLSX.utils.aoa_to_sheet([matrixHeaders, ...matrixData]);
  XLSX.utils.book_append_sheet(wb, wsMatrix, 'Tüm Dersler Matrisi');

  XLSX.writeFile(wb, `LGS_Basari_Siralamasi_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
