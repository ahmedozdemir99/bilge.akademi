export type SubjectKey =
  | 'turkce'
  | 'tarih'
  | 'din'
  | 'ingilizce'
  | 'matematik'
  | 'fen';

export interface SubjectMeta {
  key: SubjectKey;
  label: string;
  shortLabel: string;
  questionCount: number;
  weight: number; // LGS approximate weight for diagnostic prioritization
  color: string;
}

export const SUBJECT_LIST: SubjectMeta[] = [
  { key: 'turkce', label: 'Türkçe', shortLabel: 'TÜR', questionCount: 20, weight: 4, color: '#2563EB' },
  { key: 'tarih', label: 'İnkılap Tarihi', shortLabel: 'TAR', questionCount: 10, weight: 1, color: '#8B5CF6' },
  { key: 'din', label: 'Din Kültürü', shortLabel: 'DİN', questionCount: 10, weight: 1, color: '#06B6D4' },
  { key: 'ingilizce', label: 'İngilizce', shortLabel: 'İNG', questionCount: 10, weight: 1, color: '#F59E0B' },
  { key: 'matematik', label: 'Matematik', shortLabel: 'MAT', questionCount: 20, weight: 4, color: '#F43F5E' },
  { key: 'fen', label: 'Fen Bilimleri', shortLabel: 'FEN', questionCount: 20, weight: 4, color: '#10B981' },
];

export const SUBJECT_MAP: Record<SubjectKey, SubjectMeta> = SUBJECT_LIST.reduce(
  (acc, item) => {
    acc[item.key] = item;
    return acc;
  },
  {} as Record<SubjectKey, SubjectMeta>
);

export const TOTAL_LGS_QUESTIONS = 90;

export interface SubjectScore {
  soru: number;
  dogru: number;
  yanlis: number;
  bos: number;
  net: number;
  basariYuzdesi: number;
  sinifOrt?: number;
  kurumOrt?: number;
  genelOrt?: number;
}

export interface KazanimResult {
  subject: SubjectKey;
  text: string;
  soru: number;
  dogru: number;
  yanlis: number;
  bos: number;
  basariYuzdesi: number;
}

export interface ExamRanks {
  sinif?: number;
  okul?: number;
  ilce?: number;
  il?: number;
  genel?: number;
  yuzdelik?: number;
}

export interface ExamParticipants {
  sinif?: number;
  okul?: number;
  ilce?: number;
  il?: number;
  genel?: number;
}

export interface StudentExamRecord {
  examId: string;
  examName: string;
  examOrder: number;
  examDate: string; // ISO date string YYYY-MM-DD
  uploadedAt: string;
  lgsPuan: number;
  genelOrtPuan?: number;
  okulOrtPuan?: number;
  dereceler: ExamRanks;
  katilimlar?: ExamParticipants;
  subjects: Record<SubjectKey, SubjectScore>;
  toplam: SubjectScore;
  kazanimlar: KazanimResult[];
}

export interface StudentProfile {
  id: string;
  numara: string;
  name: string;
  sinif: string;
  exams: StudentExamRecord[];
}

export interface ExamMeta {
  id: string;
  name: string;
  fileName: string;
  schoolName: string;
  location: string;
  examDate: string;
  uploadedAt: string;
  examOrder: number;
  studentCount: number;
  isSample?: boolean;
  schoolAvgLgs?: number;
  generalAvgLgs?: number;
  schoolAvgToplamNet?: number;
  generalAvgToplamNet?: number;
  schoolSubjectNets?: Partial<Record<SubjectKey, number>>;
  generalSubjectNets?: Partial<Record<SubjectKey, number>>;
}

export interface ExamArchiveState {
  exams: ExamMeta[];
  students: StudentProfile[];
}

export interface ParsedExamBundle {
  examMeta: ExamMeta;
  records: Array<{
    studentKey: string;
    numara: string;
    name: string;
    sinif: string;
    record: StudentExamRecord;
  }>;
}

export type DiagnosticSeverity = 'critical' | 'warning' | 'strength';

export interface SubjectDiagnostic {
  subject: SubjectKey;
  severity: DiagnosticSeverity;
  title: string;
  detail: string;
  action: string;
  latestNet: number;
  netDelta?: number;
  basariYuzdesi: number;
  wrongRatio: number;
  blankRatio: number;
  vsSchoolDiff?: number;
}

export interface AggregatedKazanimGap {
  subject: SubjectKey;
  text: string;
  examCount: number;
  totalSoru: number;
  totalDogru: number;
  totalYanlis: number;
  totalBos: number;
  basariYuzdesi: number;
  latestExamName: string;
  status: 'eksik' | 'gelistirilmeli' | 'basarili';
}
