import type {
  AttendanceRecord,
  Grade,
  MiddleSchoolTrialSubjectKey,
  PracticeExamRecord,
  Student,
} from '../types/academy';

export interface SubjectAverage {
  subject: string;
  average: number;
  count: number;
}

export interface AttendanceSummary {
  present: number;
  excused: number;
  unexcused: number;
  late: number;
  total: number;
  attendanceRate: number;
}

export interface TimeSeriesPoint {
  date: string;
  label: string;
  score: number;
  subject: string;
  examTitle: string;
}

export interface AnonymizedStudentPayload {
  anonymousCode: string;
  gradeLevel: number;
  subjectAverages: SubjectAverage[];
  recentGrades: {
    date: string;
    subject: string;
    examType: string;
    score: number;
    maxScore: number;
  }[];
  attendanceSummary: AttendanceSummary;
}

export function normalizeScore(score: number, maxScore: number): number {
  if (!Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, (score / maxScore) * 100));
}

export function calculateAverageScore(grades: Grade[]): number {
  if (grades.length === 0) return 0;
  const total = grades.reduce((acc, g) => acc + normalizeScore(g.score, g.maxScore), 0);
  return Number((total / grades.length).toFixed(1));
}

export function calculateSubjectAverages(grades: Grade[]): SubjectAverage[] {
  const map = new Map<string, { sum: number; count: number }>();
  for (const grade of grades) {
    const key = grade.subjectName.trim();
    const current = map.get(key) ?? { sum: 0, count: 0 };
    current.sum += normalizeScore(grade.score, grade.maxScore);
    current.count += 1;
    map.set(key, current);
  }
  return Array.from(map.entries())
    .map(([subject, stat]) => ({
      subject,
      average: Number((stat.sum / stat.count).toFixed(1)),
      count: stat.count,
    }))
    .sort((a, b) => b.average - a.average);
}

export function calculateAttendanceSummary(records: AttendanceRecord[]): AttendanceSummary {
  let present = 0;
  let excused = 0;
  let unexcused = 0;
  let late = 0;

  for (const rec of records) {
    if (rec.status === 'present') present += 1;
    else if (rec.status === 'excused') excused += 1;
    else if (rec.status === 'unexcused') unexcused += 1;
    else if (rec.status === 'late') late += 1;
  }

  const total = records.length;
  const attendanceRate = total === 0 ? 100 : Number((((present + late) / total) * 100).toFixed(1));
  return { present, excused, unexcused, late, total, attendanceRate };
}

export function calculateTimeSeriesProgress(grades: Grade[]): TimeSeriesPoint[] {
  return [...grades]
    .sort((a, b) => a.examDate.localeCompare(b.examDate))
    .map((g) => ({
      date: g.examDate,
      label: formatShortTurkishDate(g.examDate),
      score: Number(normalizeScore(g.score, g.maxScore).toFixed(1)),
      subject: g.subjectName,
      examTitle: g.examTitle,
    }));
}

export function formatShortTurkishDate(isoDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;
  const [, month, day] = isoDate.split('-');
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const idx = Number(month) - 1;
  return `${Number(day)} ${months[idx] ?? month}`;
}

export function formatTurkishDate(isoDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
}

/**
 * Strips all personal identifiers (fullName, studentNumber, guardianNote, teacherId)
 * before sending academic metrics to Gemini API.
 */
export function anonymizeStudentForAI(
  student: Student,
  grades: Grade[],
  attendance: AttendanceRecord[]
): AnonymizedStudentPayload {
  const shortHash = student.id.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || '0001';
  return {
    anonymousCode: `OGR-${student.gradeLevel}-${shortHash}`,
    gradeLevel: student.gradeLevel,
    subjectAverages: calculateSubjectAverages(grades),
    recentGrades: [...grades]
      .sort((a, b) => a.examDate.localeCompare(b.examDate))
      .slice(-12)
      .map((g) => ({
        date: g.examDate,
        subject: g.subjectName,
        examType: g.examType,
        score: g.score,
        maxScore: g.maxScore,
      })),
    attendanceSummary: calculateAttendanceSummary(attendance),
  };
}

function escapeCsvCell(value: string | number | null | undefined): string {
  const str = value == null ? '' : String(value);
  if (str.includes(';') || str.includes('"') || str.includes('\n') || str.includes(',')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports rows as UTF-8 BOM CSV with semicolon delimiter (ideal for Turkish Excel).
 */
export function exportToCsv(filename: string, headers: string[], rows: (string | number | null | undefined)[][]): void {
  const bom = '\uFEFF';
  const lines = [
    headers.map(escapeCsvCell).join(';'),
    ...rows.map((row) => row.map(escapeCsvCell).join(';')),
  ];
  const blob = new Blob([bom + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function triggerPrintReport(): void {
  window.print();
}

export function getAttendanceStatusLabel(status: AttendanceRecord['status']): string {
  switch (status) {
    case 'present':
      return 'Katıldı';
    case 'excused':
      return 'Mazeretli Devamsızlık';
    case 'unexcused':
      return 'Mazeretsiz Devamsızlık';
    case 'late':
      return 'Geç Kaldı';
  }
}

/* ---------------- ORTAOKUL / LGS DENEME & NET ROBOTU ---------------- */

export interface LgsSubjectConfig {
  key: MiddleSchoolTrialSubjectKey;
  label: string;
  shortLabel: string;
  maxQuestions: number;
  weight: number;
}

export const LGS_SUBJECT_CONFIG: LgsSubjectConfig[] = [
  { key: 'turkce', label: 'Türkçe', shortLabel: 'Türkçe', maxQuestions: 20, weight: 4 },
  { key: 'matematik', label: 'Matematik', shortLabel: 'Mat', maxQuestions: 20, weight: 4 },
  { key: 'fen', label: 'Fen Bilimleri', shortLabel: 'Fen', maxQuestions: 20, weight: 4 },
  { key: 'inkilap', label: 'İnkılap Tarihi / Sosyal', shortLabel: 'İnkılap', maxQuestions: 10, weight: 1 },
  { key: 'din', label: 'Din Kültürü', shortLabel: 'Din K.', maxQuestions: 10, weight: 1 },
  { key: 'ingilizce', label: 'İngilizce', shortLabel: 'İng', maxQuestions: 10, weight: 1 },
];

export interface RawTrialScores {
  wrongPenalty: 3 | 4;
  turkceD: number;
  turkceY: number;
  matematikD: number;
  matematikY: number;
  fenD: number;
  fenY: number;
  inkilapD: number;
  inkilapY: number;
  dinD: number;
  dinY: number;
  ingilizceD: number;
  ingilizceY: number;
}

export function calculateNet(correct: number, wrong: number, penalty: 3 | 4 = 3): number {
  const raw = correct - wrong / penalty;
  return Number(raw.toFixed(2));
}

export function computePracticeExamTotals(scores: RawTrialScores): {
  totalCorrect: number;
  totalWrong: number;
  totalBlank: number;
  totalNet: number;
  estimatedLgsScore: number;
  perSubject: Record<
    MiddleSchoolTrialSubjectKey,
    { correct: number; wrong: number; blank: number; net: number; maxQuestions: number }
  >;
} {
  const penalty = scores.wrongPenalty === 4 ? 4 : 3;

  const turkceNet = calculateNet(scores.turkceD, scores.turkceY, penalty);
  const matematikNet = calculateNet(scores.matematikD, scores.matematikY, penalty);
  const fenNet = calculateNet(scores.fenD, scores.fenY, penalty);
  const inkilapNet = calculateNet(scores.inkilapD, scores.inkilapY, penalty);
  const dinNet = calculateNet(scores.dinD, scores.dinY, penalty);
  const ingilizceNet = calculateNet(scores.ingilizceD, scores.ingilizceY, penalty);

  const totalCorrect =
    scores.turkceD +
    scores.matematikD +
    scores.fenD +
    scores.inkilapD +
    scores.dinD +
    scores.ingilizceD;
  const totalWrong =
    scores.turkceY +
    scores.matematikY +
    scores.fenY +
    scores.inkilapY +
    scores.dinY +
    scores.ingilizceY;
  const totalBlank = Math.max(0, 90 - totalCorrect - totalWrong);
  const totalNet = Number(
    (turkceNet + matematikNet + fenNet + inkilapNet + dinNet + ingilizceNet).toFixed(2)
  );

  // Weighted LGS approximation (max weighted net = 20*4 + 20*4 + 20*4 + 10*1 + 10*1 + 10*1 = 270 -> 100..500)
  const weightedNet =
    Math.max(0, turkceNet) * 4 +
    Math.max(0, matematikNet) * 4 +
    Math.max(0, fenNet) * 4 +
    Math.max(0, inkilapNet) * 1 +
    Math.max(0, dinNet) * 1 +
    Math.max(0, ingilizceNet) * 1;
  const estimatedLgsScore = Number(
    Math.min(500, Math.max(100, 195 + (weightedNet / 270) * 305)).toFixed(2)
  );

  return {
    totalCorrect,
    totalWrong,
    totalBlank,
    totalNet,
    estimatedLgsScore,
    perSubject: {
      turkce: {
        correct: scores.turkceD,
        wrong: scores.turkceY,
        blank: Math.max(0, 20 - scores.turkceD - scores.turkceY),
        net: turkceNet,
        maxQuestions: 20,
      },
      matematik: {
        correct: scores.matematikD,
        wrong: scores.matematikY,
        blank: Math.max(0, 20 - scores.matematikD - scores.matematikY),
        net: matematikNet,
        maxQuestions: 20,
      },
      fen: {
        correct: scores.fenD,
        wrong: scores.fenY,
        blank: Math.max(0, 20 - scores.fenD - scores.fenY),
        net: fenNet,
        maxQuestions: 20,
      },
      inkilap: {
        correct: scores.inkilapD,
        wrong: scores.inkilapY,
        blank: Math.max(0, 10 - scores.inkilapD - scores.inkilapY),
        net: inkilapNet,
        maxQuestions: 10,
      },
      din: {
        correct: scores.dinD,
        wrong: scores.dinY,
        blank: Math.max(0, 10 - scores.dinD - scores.dinY),
        net: dinNet,
        maxQuestions: 10,
      },
      ingilizce: {
        correct: scores.ingilizceD,
        wrong: scores.ingilizceY,
        blank: Math.max(0, 10 - scores.ingilizceD - scores.ingilizceY),
        net: ingilizceNet,
        maxQuestions: 10,
      },
    },
  };
}

export interface TrialRobotSubjectAverage {
  key: MiddleSchoolTrialSubjectKey;
  label: string;
  shortLabel: string;
  maxQuestions: number;
  avgCorrect: number;
  avgWrong: number;
  avgNet: number;
}

export interface TrialRobotSummary {
  examCount: number;
  avgTotalCorrect: number;
  avgTotalWrong: number;
  avgTotalNet: number;
  bestNet: number;
  avgLgsScore: number;
  subjectAverages: TrialRobotSubjectAverage[];
}

export function calculateTrialRobotSummary(exams: PracticeExamRecord[]): TrialRobotSummary {
  if (exams.length === 0) {
    return {
      examCount: 0,
      avgTotalCorrect: 0,
      avgTotalWrong: 0,
      avgTotalNet: 0,
      bestNet: 0,
      avgLgsScore: 0,
      subjectAverages: LGS_SUBJECT_CONFIG.map((cfg) => ({
        key: cfg.key,
        label: cfg.label,
        shortLabel: cfg.shortLabel,
        maxQuestions: cfg.maxQuestions,
        avgCorrect: 0,
        avgWrong: 0,
        avgNet: 0,
      })),
    };
  }

  const n = exams.length;
  const avgTotalCorrect = Number(
    (exams.reduce((s, e) => s + e.totalCorrect, 0) / n).toFixed(2)
  );
  const avgTotalWrong = Number((exams.reduce((s, e) => s + e.totalWrong, 0) / n).toFixed(2));
  const avgTotalNet = Number((exams.reduce((s, e) => s + e.totalNet, 0) / n).toFixed(2));
  const bestNet = Number(Math.max(...exams.map((e) => e.totalNet)).toFixed(2));
  const avgLgsScore = Number(
    (exams.reduce((s, e) => s + e.estimatedLgsScore, 0) / n).toFixed(2)
  );

  const subjectAverages: TrialRobotSubjectAverage[] = LGS_SUBJECT_CONFIG.map((cfg) => {
    let sumD = 0;
    let sumY = 0;
    let sumNet = 0;
    for (const exam of exams) {
      const d = exam[`${cfg.key}D` as const];
      const y = exam[`${cfg.key}Y` as const];
      sumD += d;
      sumY += y;
      sumNet += calculateNet(d, y, exam.wrongPenalty);
    }
    return {
      key: cfg.key,
      label: cfg.label,
      shortLabel: cfg.shortLabel,
      maxQuestions: cfg.maxQuestions,
      avgCorrect: Number((sumD / n).toFixed(2)),
      avgWrong: Number((sumY / n).toFixed(2)),
      avgNet: Number((sumNet / n).toFixed(2)),
    };
  });

  return {
    examCount: n,
    avgTotalCorrect,
    avgTotalWrong,
    avgTotalNet,
    bestNet,
    avgLgsScore,
    subjectAverages,
  };
}
