import type { ClassInput, GradeInput, PracticeExamInput, StudentInput } from '../context/AcademyContext';
import type { ExamType, Grade, PracticeExamRecord, SchoolClass, Student } from '../types/academy';
import { computePracticeExamTotals, LGS_SUBJECT_CONFIG } from './exportUtils';
import { normalizeSearchText } from './searchText';

export const BULK_EXAM_TYPES: ExamType[] = ['Yazılı', 'Deneme', 'Sözlü', 'Proje', 'Performans'];

export type BulkMode = 'roster' | 'grades' | 'trials';
export type BulkInput =
  | { mode: 'roster'; classId: string; newClass?: ClassInput; text: string }
  | { mode: 'grades'; classId: string; text: string; assessment: Pick<GradeInput, 'subjectName' | 'examTitle' | 'examType' | 'examDate' | 'maxScore'> }
  | { mode: 'trials'; classId: string; text: string; assessment: Pick<PracticeExamInput, 'examTitle' | 'examDate' | 'wrongPenalty'> };

interface BulkSnapshot {
  classes: SchoolClass[];
  students: Student[];
  grades: Grade[];
  practiceExams: PracticeExamRecord[];
}

type BulkPracticeExam = PracticeExamInput & Pick<PracticeExamRecord, 'totalCorrect' | 'totalWrong' | 'totalNet' | 'estimatedLgsScore'>;

export type BulkRow = { key: string; student: string; detail: string; skip: boolean } & (
  | { collection: 'students'; data: StudentInput }
  | { collection: 'grades'; data: GradeInput }
  | { collection: 'practiceExams'; data: BulkPracticeExam }
);

export interface BulkPlan {
  classId: string;
  className: string;
  newClass?: ClassInput;
  rows: BulkRow[];
}

export function bulkHeaders(mode: BulkMode): string[] {
  if (mode === 'roster') return ['Okul No', 'Ad Soyad'];
  if (mode === 'grades') return ['Okul No', 'Puan'];
  return ['Okul No', ...LGS_SUBJECT_CONFIG.flatMap(({ label }) => [label + ' D', label + ' Y'])];
}

function readColumns(line: string): string[] {
  if (line.includes('\t')) return line.split('\t').map((cell) => cell.trim());
  const pattern = /(?:^|;)(?:"((?:[^"]|"")*)"|([^";]*))(?=;|$)/gy;
  const matches = [...line.matchAll(pattern)];
  const last = matches.at(-1);
  if (!last || last.index + last[0].length !== line.length) throw new Error('CSV sütunları okunamadı.');
  return matches.map((match) => (match[1]?.replace(/""/g, '"') ?? match[2]).trim());
}

function numberCell(text: string, label: string): number {
  if (!/^\d+(?:[.,]\d+)?$/.test(text)) throw new Error(label + ' sayı olmalıdır.');
  return Number(text.replace(',', '.'));
}

function validDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const value = new Date(date + 'T00:00:00Z');
  return Number.isFinite(value.getTime()) && value.toISOString().slice(0, 10) === date;
}

function cleanLabel(value: string, max: number, label: string): string {
  const trimmed = value.trim();
  if (trimmed.length < 2 || trimmed.length > max) throw new Error(`${label} 2–${max} karakter olmalıdır.`);
  return trimmed;
}

function classIdentity(value: Pick<ClassInput, 'academicYear' | 'gradeLevel' | 'section'>): string {
  return [value.academicYear.trim().replace(/[–—]/g, '-').replace(/\s/g, ''), value.gradeLevel, normalizeSearchText(value.section)].join('|');
}

export async function bulkRecordId(teacherId: string, collection: string, key: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify([teacherId, collection, key])));
  return 'bulk_' + Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

const gradeKey = (record: Pick<GradeInput, 'classId' | 'studentId' | 'subjectName' | 'examTitle' | 'examDate' | 'examType'>) =>
  JSON.stringify([record.classId, record.studentId, normalizeSearchText(record.subjectName), normalizeSearchText(record.examTitle), record.examDate, record.examType]);
const trialKey = (record: Pick<PracticeExamInput, 'classId' | 'studentId' | 'examTitle' | 'examDate'>) =>
  JSON.stringify([record.classId, record.studentId, normalizeSearchText(record.examTitle), record.examDate]);

export async function buildBulkPlan(input: BulkInput, snapshot: BulkSnapshot, teacherId: string): Promise<BulkPlan> {
  const belongs = <T extends { teacherId: string }>(record: T) => record.teacherId === teacherId;
  const classes = snapshot.classes.filter(belongs);
  let selected = classes.find((value) => value.id === input.classId);
  let newClass: ClassInput | undefined;
  if (!selected && input.mode === 'roster' && input.newClass) {
    const candidate = input.newClass;
    const name = cleanLabel(candidate.name, 60, 'Sınıf adı');
    const section = candidate.section.trim();
    const academicYear = candidate.academicYear.trim();
    if (!Number.isInteger(candidate.gradeLevel) || candidate.gradeLevel < 1 || candidate.gradeLevel > 12 || !section || section.length > 10 || !/^\d{4}[-–]\d{4}$/.test(academicYear)) {
      throw new Error('Sınıf düzeyi, şube ve öğretim yılını kontrol edin (ör. 2026-2027).');
    }
    const classData = { name, section, academicYear, gradeLevel: candidate.gradeLevel };
    const matches = classes.filter((value) => classIdentity(value) === classIdentity(classData));
    selected = matches[0];
    if (matches.length > 1 || (selected && normalizeSearchText(selected.name) !== normalizeSearchText(name))) {
      throw new Error('Bu düzey, şube ve öğretim yılı zaten kayıtlı. Mevcut sınıfı listeden seçin.');
    }
    if (!selected) newClass = classData;
  }
  if (!selected && !newClass) throw new Error('Bir sınıf seçin.');
  const classId = selected?.id ?? await bulkRecordId(teacherId, 'classes', classIdentity(newClass!));
  const className = selected?.name ?? newClass!.name;
  const classmates = snapshot.students.filter((item) => belongs(item) && item.classId === classId);
  const studentsByNumber = new Map<string, Student[]>();
  for (const student of classmates) {
    const key = student.studentNumber.trim();
    studentsByNumber.set(key, [...(studentsByNumber.get(key) ?? []), student]);
  }
  const priorGrades = new Map(snapshot.grades.filter(belongs).map((grade) => [gradeKey(grade), grade]));
  const priorTrials = new Map(snapshot.practiceExams.filter(belongs).map((trial) => [trialKey(trial), trial]));
  const title = input.mode === 'roster' ? '' : cleanLabel(input.assessment.examTitle, 120, 'Değerlendirme adı');
  if (input.mode !== 'roster' && !validDate(input.assessment.examDate)) throw new Error('Geçerli bir tarih girin.');
  const subject = input.mode === 'grades' ? cleanLabel(input.assessment.subjectName, 80, 'Ders adı') : '';
  if (input.mode === 'grades' && (!BULK_EXAM_TYPES.includes(input.assessment.examType) || !Number.isFinite(input.assessment.maxScore) || input.assessment.maxScore < 1 || input.assessment.maxScore > 100)) {
    throw new Error('Not türü ve tam puanı kontrol edin. Tam puan 1–100 arasında olmalıdır.');
  }
  if (input.mode === 'trials' && ![3, 4].includes(input.assessment.wrongPenalty)) throw new Error('Net hesaplama kuralını seçin.');
  if (input.text.length > 100000) throw new Error('Liste çok uzun. En fazla 100.000 karakter yapıştırabilirsiniz.');

  const rows: BulkRow[] = [];
  const seen = new Set<string>();
  const errors: string[] = [];
  const lines = input.text.replace(/^\uFEFF/, '').split(/\r\n|\n|\r/);
  let firstRow = true;
  for (const [index, line] of lines.entries()) {
    if (!line.trim()) continue;
    try {
      const [studentNumber, ...values] = readColumns(line);
      if (firstRow && /^(okul no|okul numarasi|ogrenci no)$/.test(normalizeSearchText(studentNumber))) continue;
      if (input.mode !== 'roster' && values.every((value) => !value) && studentNumber) continue;
      const expected = input.mode === 'trials' ? 12 : 1;
      if (values.length !== expected || !studentNumber || studentNumber.length > 24) {
        throw new Error(`Okul numarası ve ardından ${expected} sütun girin.`);
      }
      if (seen.has(studentNumber)) throw new Error(`${studentNumber} numarası listede birden fazla kez geçiyor.`);
      seen.add(studentNumber);
      const matches = studentsByNumber.get(studentNumber) ?? [];
      if (matches.length > 1) throw new Error(`${studentNumber} numarası bu sınıfta birden fazla öğrenciye ait.`);
      const match = matches[0];

      if (input.mode === 'roster') {
        const fullName = cleanLabel(values[0], 100, 'Ad soyad');
        if (match && normalizeSearchText(match.fullName) !== normalizeSearchText(fullName)) {
          throw new Error(`${studentNumber} numarası farklı bir öğrenciye ait.`);
        }
        rows.push({ collection: 'students', key: JSON.stringify([classId, studentNumber]), student: fullName, detail: studentNumber, skip: Boolean(match), data: {
          classId, studentNumber, fullName, gradeLevel: selected?.gradeLevel ?? newClass!.gradeLevel, status: 'active',
        } });
        continue;
      }
      if (!match) throw new Error(`${studentNumber} numarası seçili sınıfta bulunamadı.`);
      const common = { studentId: match.id, classId, examTitle: title, examDate: input.assessment.examDate };

      if (input.mode === 'grades') {
        const score = numberCell(values[0], 'Puan');
        const data: GradeInput = { ...common, subjectName: subject, examType: input.assessment.examType, maxScore: input.assessment.maxScore, score };
        if (score > data.maxScore) throw new Error(`Puan, tam puanı (${data.maxScore}) aşamaz.`);
        const key = gradeKey(data);
        const prior = priorGrades.get(key);
        if (prior && (prior.score !== score || prior.maxScore !== data.maxScore)) throw new Error('Bu değerlendirme farklı bir puanla kayıtlı. Kaydı Notlar sekmesinden düzenleyin.');
        rows.push({ collection: 'grades', key, student: match.fullName, detail: `${score} / ${data.maxScore}`, skip: Boolean(prior), data });
        continue;
      }

      const pairs = LGS_SUBJECT_CONFIG.flatMap(({ label, maxQuestions }, subjectIndex) => {
        const d = numberCell(values[subjectIndex * 2], label + ' doğru');
        const y = numberCell(values[subjectIndex * 2 + 1], label + ' yanlış');
        if (!Number.isInteger(d) || !Number.isInteger(y) || d + y > maxQuestions) {
          throw new Error(`${label} doğru ve yanlış toplamı en fazla ${maxQuestions} olmalıdır.`);
        }
        return [d, y];
      });
      const [turkceD, turkceY, matematikD, matematikY, fenD, fenY, inkilapD, inkilapY, dinD, dinY, ingilizceD, ingilizceY] = pairs;
      const scores = { wrongPenalty: input.assessment.wrongPenalty, turkceD, turkceY, matematikD, matematikY, fenD, fenY, inkilapD, inkilapY, dinD, dinY, ingilizceD, ingilizceY };
      const { totalCorrect, totalWrong, totalNet, estimatedLgsScore } = computePracticeExamTotals(scores);
      const key = trialKey(common);
      const prior = priorTrials.get(key);
      if (prior && Object.keys(scores).some((field) => prior[field as keyof typeof scores] !== scores[field as keyof typeof scores])) {
        throw new Error('Bu deneme farklı sonuçlarla kayıtlı. Deneme kaydını kontrol edin.');
      }
      rows.push({ collection: 'practiceExams', key, student: match.fullName, detail: `${totalCorrect} D / ${totalWrong} Y · ${totalNet.toLocaleString('tr-TR')} net`, skip: Boolean(prior), data: { ...common, ...scores, totalCorrect, totalWrong, totalNet, estimatedLgsScore } });
    } catch (error) {
      errors.push(`Satır ${index + 1} — ${error instanceof Error ? error.message : 'Geçersiz kayıt.'}`);
    } finally {
      firstRow = false;
    }
  }
  if (errors.length) throw new Error(errors.slice(0, 8).join('\n') + (errors.length > 8 ? `\n${errors.length - 8} satır daha hatalı.` : ''));
  if (!rows.length) throw new Error('Kaydedilecek satır bulunamadı.');
  if (rows.length > 250) throw new Error('Bir seferde en fazla 250 kayıt ekleyin.');
  return { classId, className, newClass, rows };
}
