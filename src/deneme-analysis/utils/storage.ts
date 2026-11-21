import { ExamArchiveState, ParsedExamBundle, StudentExamRecord, StudentProfile } from '../types/exam';
import { buildStudentKey, normalizeClassName, normalizeTurkish } from './pdfParser';

const STORAGE_KEY = 'lgs_deneme_arsivi_v1';

export const EMPTY_ARCHIVE_STATE: ExamArchiveState = {
  exams: [],
  students: [],
};

export function loadArchiveState(owner: string): ExamArchiveState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY + ':' + owner);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ExamArchiveState;
    if (!parsed || !Array.isArray(parsed.exams) || !Array.isArray(parsed.students)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveArchiveState(owner: string, state: ExamArchiveState): { ok: boolean; error?: string } {
  try {
    localStorage.setItem(STORAGE_KEY + ':' + owner, JSON.stringify(state));
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: 'Tarayıcı depolama alanı doldu. JSON yedek indirip eski denemeleri temizleyebilirsiniz.',
    };
  }
}

/**
 * Simple Levenshtein edit distance to handle minor Turkish glyph drops across publishers
 * (e.g. "ALI AVCIO LU" vs "ALI AVCIOGLU").
 */
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 3) return 99;
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = dp[j];
      if (a[i - 1] === b[j - 1]) {
        dp[j] = prev;
      } else {
        dp[j] = 1 + Math.min(prev, dp[j], dp[j - 1]);
      }
      prev = temp;
    }
  }
  return dp[b.length];
}

function buildNameSignature(name: string): string {
  return normalizeTurkish(name).replace(/\s+/g, '');
}

function buildSortedTokensSignature(name: string): string {
  return normalizeTurkish(name).split(/\s+/).filter(Boolean).sort().join(' ');
}

export function mergeExamBundle(
  prev: ExamArchiveState,
  bundle: ParsedExamBundle
): { nextState: ExamArchiveState; matchedCount: number; newStudentsCount: number } {
  const existingExams = [...prev.exams];
  const nextOrder =
    existingExams.length > 0 ? Math.max(...existingExams.map((e) => e.examOrder)) + 1 : 1;

  const examMeta = {
    ...bundle.examMeta,
    examOrder: nextOrder,
  };

  const studentMap = new Map<string, StudentProfile>();
  const exactNameIndex = new Map<string, string>();
  const sortedTokenNameIndex = new Map<string, string>();

  for (const s of prev.students) {
    studentMap.set(s.id, {
      ...s,
      sinif: normalizeClassName(s.sinif),
      exams: [...s.exams],
    });
    if (!s.id.startsWith('bilge-ornek-ogrenci-')) {
      exactNameIndex.set(buildNameSignature(s.name), s.id);
      sortedTokenNameIndex.set(buildSortedTokensSignature(s.name), s.id);
    }
  }

  let matchedCount = 0;
  let newStudentsCount = 0;

  for (const item of bundle.records) {
    const cleanSinif = normalizeClassName(item.sinif);
    const updatedRecord: StudentExamRecord = {
      ...item.record,
      examId: examMeta.id,
      examName: examMeta.name,
      examOrder: examMeta.examOrder,
    };

    const incomingSig = buildNameSignature(item.name);
    const incomingSortedTokens = buildSortedTokensSignature(item.name);

    // 1. Primary match by Student Key (NO_<numara>)
    let targetId: string | undefined = studentMap.has(item.studentKey)
      ? item.studentKey
      : undefined;

    // Verify if matched by student number across different publishers that names are compatible
    // (guards against rare cases where a different publisher assigned arbitrary sequential numbers)
    if (targetId) {
      const existingByNo = studentMap.get(targetId)!;
      const existingSig = buildNameSignature(existingByNo.name);
      const dist = editDistance(existingSig, incomingSig);
      const sameTokens = buildSortedTokensSignature(existingByNo.name) === incomingSortedTokens;
      if (!sameTokens && dist > 3 && existingSig.slice(0, 4) !== incomingSig.slice(0, 4)) {
        // Number collided with a completely different student name; fall back to name matching
        targetId = undefined;
      }
    }

    // 2. Exact normalized name match (ignoring spaces/diacritics)
    if (!targetId && !examMeta.isSample) {
      targetId = exactNameIndex.get(incomingSig);
    }

    // 3. Reversed "SOYAD AD" vs "AD SOYAD" token match
    if (!targetId && !examMeta.isSample) {
      targetId = sortedTokenNameIndex.get(incomingSortedTokens);
    }

    // 4. Fuzzy 1-2 character match (handles dropped Turkish letters like Ğ/Ş/İ in PDF fonts)
    if (!targetId && !examMeta.isSample && incomingSig.length >= 6) {
      for (const [existingId, existingStudent] of studentMap.entries()) {
        if (!existingId.startsWith('bilge-ornek-ogrenci-') && editDistance(buildNameSignature(existingStudent.name), incomingSig) <= 2) {
          targetId = existingId;
          break;
        }
      }
    }

    const existing = targetId ? studentMap.get(targetId) : undefined;
    if (existing) {
      matchedCount += 1;
      if ((!existing.numara || existing.numara === '0') && item.numara && item.numara !== '0') {
        existing.numara = item.numara;
      }
      if (cleanSinif) {
        existing.sinif = cleanSinif;
      }
      // Keep cleaner/longer version of the student name
      if (item.name.length > existing.name.length && !item.name.includes('  ')) {
        existing.name = item.name;
      }
      existing.exams = existing.exams.filter((e) => e.examId !== examMeta.id);
      existing.exams.push(updatedRecord);
    } else {
      newStudentsCount += 1;
      let newId = examMeta.isSample ? item.studentKey : buildStudentKey(item.numara, item.name, cleanSinif);
      if (studentMap.has(newId)) {
        newId = `${newId}_${incomingSig.slice(0, 6)}`;
      }
      const newProfile: StudentProfile = {
        id: newId,
        numara: item.numara || '0',
        name: item.name,
        sinif: cleanSinif,
        exams: [updatedRecord],
      };
      studentMap.set(newProfile.id, newProfile);
      if (!examMeta.isSample) {
        exactNameIndex.set(incomingSig, newProfile.id);
        sortedTokenNameIndex.set(incomingSortedTokens, newProfile.id);
      }
    }
  }

  const nextState: ExamArchiveState = {
    exams: [...existingExams, examMeta],
    students: Array.from(studentMap.values()),
  };

  return { nextState, matchedCount, newStudentsCount };
}

export function deleteExamFromState(prev: ExamArchiveState, examId: string): ExamArchiveState {
  const exams = prev.exams.filter((e) => e.id !== examId);
  const students = prev.students
    .map((s) => ({
      ...s,
      exams: s.exams.filter((ex) => ex.examId !== examId),
    }))
    .filter((s) => s.exams.length > 0);
  return { exams, students };
}

export function renameExamInState(
  prev: ExamArchiveState,
  examId: string,
  newName: string
): ExamArchiveState {
  const trimmed = newName.trim();
  if (!trimmed) return prev;
  return {
    exams: prev.exams.map((e) => (e.id === examId ? { ...e, name: trimmed } : e)),
    students: prev.students.map((s) => ({
      ...s,
      exams: s.exams.map((ex) => (ex.examId === examId ? { ...ex, examName: trimmed } : ex)),
    })),
  };
}

export function addManualExamToStudent(
  prev: ExamArchiveState,
  studentId: string,
  newRecord: StudentExamRecord
): ExamArchiveState {
  const examExists = prev.exams.some((e) => e.id === newRecord.examId);
  const exams = examExists
    ? prev.exams
    : [
        ...prev.exams,
        {
          id: newRecord.examId,
          name: newRecord.examName,
          fileName: 'Manuel Giriş',
          schoolName: prev.exams[0]?.schoolName || '8. Sınıf LGS Okul Arşivi',
          location: prev.exams[0]?.location || '',
          examDate: newRecord.examDate,
          uploadedAt: newRecord.uploadedAt,
          examOrder: newRecord.examOrder,
          studentCount: 1,
          schoolAvgLgs: newRecord.lgsPuan,
          schoolAvgToplamNet: newRecord.toplam.net,
        },
      ];

  const students = prev.students.map((s) =>
    s.id === studentId ? { ...s, exams: [...s.exams, newRecord] } : s
  );
  return { exams, students };
}
