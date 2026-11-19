import type {
  AttendanceRecord,
  Grade,
  MathAttemptSummary,
  PoemSummary,
  PracticeExamRecord,
  QuizAttemptSummary,
  SchoolClass,
  Student,
  Subject,
} from '../types/academy';
import { computePracticeExamTotals } from '../utils/exportUtils';

export const DEMO_TEACHER_ID = 'demo_teacher_01';

export const DEFAULT_SUBJECT_NAMES = [
  'Matematik',
  'Türkçe',
  'Fen Bilimleri',
  'T.C. İnkılap Tarihi ve Atatürkçülük',
  'Sosyal Bilgiler',
  'Din Kültürü ve Ahlak Bilgisi',
  'İngilizce',
];

export const DEMO_SUBJECTS: Subject[] = [
  { id: 'subj_mat', teacherId: DEMO_TEACHER_ID, name: 'Matematik', code: 'MAT', isDemo: true },
  { id: 'subj_tur', teacherId: DEMO_TEACHER_ID, name: 'Türkçe', code: 'TRK', isDemo: true },
  { id: 'subj_fen', teacherId: DEMO_TEACHER_ID, name: 'Fen Bilimleri', code: 'FEN', isDemo: true },
  { id: 'subj_ink', teacherId: DEMO_TEACHER_ID, name: 'T.C. İnkılap Tarihi ve Atatürkçülük', code: 'İNK', isDemo: true },
  { id: 'subj_sos', teacherId: DEMO_TEACHER_ID, name: 'Sosyal Bilgiler', code: 'SOS', isDemo: true },
  { id: 'subj_din', teacherId: DEMO_TEACHER_ID, name: 'Din Kültürü ve Ahlak Bilgisi', code: 'DİN', isDemo: true },
  { id: 'subj_ing', teacherId: DEMO_TEACHER_ID, name: 'İngilizce', code: 'İNG', isDemo: true },
];

export const DEMO_CLASSES: SchoolClass[] = [
  {
    id: 'cls_8a',
    teacherId: DEMO_TEACHER_ID,
    name: '8-A LGS Hazırlık',
    gradeLevel: 8,
    section: 'A',
    academicYear: '2026-2027',
    subjectFocus: 'Ortaokul 8. Sınıf · LGS Yoğun Program',
    isDemo: true,
  },
  {
    id: 'cls_7b',
    teacherId: DEMO_TEACHER_ID,
    name: '7-B Ortaokul',
    gradeLevel: 7,
    section: 'B',
    academicYear: '2026-2027',
    subjectFocus: 'Ortaokul 7. Sınıf · Temel Kazanımlar',
    isDemo: true,
  },
  {
    id: 'cls_6a',
    teacherId: DEMO_TEACHER_ID,
    name: '6-A Ortaokul',
    gradeLevel: 6,
    section: 'A',
    academicYear: '2026-2027',
    subjectFocus: 'Ortaokul 6. Sınıf · Mantık ve Okuma',
    isDemo: true,
  },
];

export const DEMO_STUDENTS: Student[] = [
  {
    id: 'stu_01',
    teacherId: DEMO_TEACHER_ID,
    classId: 'cls_8a',
    fullName: 'Defne Yılmaz',
    studentNumber: '804',
    gradeLevel: 8,
    guardianNote: 'Yeni nesil LGS matematik sorularında hız kazanıyor, paragraf denemelerinde istikrarlı.',
    status: 'active',
    isDemo: true,
  },
  {
    id: 'stu_02',
    teacherId: DEMO_TEACHER_ID,
    classId: 'cls_8a',
    fullName: 'Kerem Kaya',
    studentNumber: '811',
    gradeLevel: 8,
    guardianNote: 'Fen Bilimleri ve İnkılap Tarihi netleri yüksek; matematikte kareköklü ifadeler pekiştiriliyor.',
    status: 'active',
    isDemo: true,
  },
  {
    id: 'stu_03',
    teacherId: DEMO_TEACHER_ID,
    classId: 'cls_8a',
    fullName: 'Zeynep Arslan',
    studentNumber: '819',
    gradeLevel: 8,
    guardianNote: 'Tüm derslerde dengeli yükseliş gösteriyor; LGS hedefi Fen Lisesi.',
    status: 'active',
    isDemo: true,
  },
  {
    id: 'stu_04',
    teacherId: DEMO_TEACHER_ID,
    classId: 'cls_8a',
    fullName: 'Emir Demir',
    studentNumber: '825',
    gradeLevel: 8,
    guardianNote: 'Deneme sınavlarında yanlış sayısını azaltmak için dikkat ve süre yönetimi çalışılıyor.',
    status: 'active',
    isDemo: true,
  },
  {
    id: 'stu_05',
    teacherId: DEMO_TEACHER_ID,
    classId: 'cls_7b',
    fullName: 'Elif Çelik',
    studentNumber: '714',
    gradeLevel: 7,
    guardianNote: 'Şiir ve Türkçe metin analizlerinde çok başarılı; rasyonel sayılarda tam puan.',
    status: 'active',
    isDemo: true,
  },
  {
    id: 'stu_06',
    teacherId: DEMO_TEACHER_ID,
    classId: 'cls_7b',
    fullName: 'Mert Şahin',
    studentNumber: '722',
    gradeLevel: 7,
    guardianNote: 'Sosyal Bilgiler ve Osmanlı tarihine büyük ilgi duyuyor.',
    status: 'active',
    isDemo: true,
  },
  {
    id: 'stu_07',
    teacherId: DEMO_TEACHER_ID,
    classId: 'cls_6a',
    fullName: 'İpek Öztürk',
    studentNumber: '609',
    gradeLevel: 6,
    guardianNote: 'Zekâ ve mantık oyunlarında öne çıkıyor; kesirler ve oran konusunda çok hızlı.',
    status: 'active',
    isDemo: true,
  },
  {
    id: 'stu_08',
    teacherId: DEMO_TEACHER_ID,
    classId: 'cls_6a',
    fullName: 'Yusuf Aydın',
    studentNumber: '618',
    gradeLevel: 6,
    guardianNote: 'Düzenli deneme takibiyle son bir ayda net ortalamasını 8 net artırdı.',
    status: 'active',
    isDemo: true,
  },
];

export const DEMO_GRADES: Grade[] = [
  { id: 'grd_01', teacherId: DEMO_TEACHER_ID, studentId: 'stu_01', classId: 'cls_8a', subjectName: 'Matematik', examTitle: '1. Dönem 1. Yazılı (Çarpanlar ve Üslü İfadeler)', examType: 'Yazılı', examDate: '2026-10-12', score: 92, maxScore: 100, teacherNote: 'EBOB-EKOK problemleri eksiksiz.', isDemo: true },
  { id: 'grd_02', teacherId: DEMO_TEACHER_ID, studentId: 'stu_01', classId: 'cls_8a', subjectName: 'Türkçe', examTitle: '1. Dönem 1. Yazılı (Fiilimsiler ve Paragraf)', examType: 'Yazılı', examDate: '2026-10-19', score: 88, maxScore: 100, isDemo: true },
  { id: 'grd_03', teacherId: DEMO_TEACHER_ID, studentId: 'stu_01', classId: 'cls_8a', subjectName: 'Fen Bilimleri', examTitle: 'Mevsimler ve DNA Yazılısı', examType: 'Yazılı', examDate: '2026-10-28', score: 95, maxScore: 100, isDemo: true },
  { id: 'grd_04', teacherId: DEMO_TEACHER_ID, studentId: 'stu_01', classId: 'cls_8a', subjectName: 'T.C. İnkılap Tarihi ve Atatürkçülük', examTitle: 'Bir Kahraman Doğuyor Yazılısı', examType: 'Yazılı', examDate: '2026-11-05', score: 94, maxScore: 100, isDemo: true },

  { id: 'grd_05', teacherId: DEMO_TEACHER_ID, studentId: 'stu_02', classId: 'cls_8a', subjectName: 'Matematik', examTitle: '1. Dönem 1. Yazılı (Çarpanlar ve Üslü İfadeler)', examType: 'Yazılı', examDate: '2026-10-12', score: 74, maxScore: 100, teacherNote: 'Üslü sayılarda işaret hatasına dikkat.', isDemo: true },
  { id: 'grd_06', teacherId: DEMO_TEACHER_ID, studentId: 'stu_02', classId: 'cls_8a', subjectName: 'Fen Bilimleri', examTitle: 'Mevsimler ve DNA Yazılısı', examType: 'Yazılı', examDate: '2026-10-28', score: 90, maxScore: 100, isDemo: true },
  { id: 'grd_07', teacherId: DEMO_TEACHER_ID, studentId: 'stu_02', classId: 'cls_8a', subjectName: 'T.C. İnkılap Tarihi ve Atatürkçülük', examTitle: 'Bir Kahraman Doğuyor Yazılısı', examType: 'Yazılı', examDate: '2026-11-05', score: 96, maxScore: 100, isDemo: true },

  { id: 'grd_08', teacherId: DEMO_TEACHER_ID, studentId: 'stu_03', classId: 'cls_8a', subjectName: 'Matematik', examTitle: '1. Dönem 1. Yazılı (Çarpanlar ve Üslü İfadeler)', examType: 'Yazılı', examDate: '2026-10-12', score: 86, maxScore: 100, isDemo: true },
  { id: 'grd_09', teacherId: DEMO_TEACHER_ID, studentId: 'stu_03', classId: 'cls_8a', subjectName: 'Türkçe', examTitle: '1. Dönem 1. Yazılı (Fiilimsiler ve Paragraf)', examType: 'Yazılı', examDate: '2026-10-19', score: 94, maxScore: 100, isDemo: true },
  { id: 'grd_10', teacherId: DEMO_TEACHER_ID, studentId: 'stu_04', classId: 'cls_8a', subjectName: 'Matematik', examTitle: '1. Dönem 1. Yazılı (Çarpanlar ve Üslü İfadeler)', examType: 'Yazılı', examDate: '2026-10-12', score: 62, maxScore: 100, teacherNote: 'Temel işlem pratiği planlandı.', isDemo: true },

  { id: 'grd_11', teacherId: DEMO_TEACHER_ID, studentId: 'stu_05', classId: 'cls_7b', subjectName: 'Türkçe', examTitle: '7. Sınıf Fiiller Yazılısı', examType: 'Yazılı', examDate: '2026-10-20', score: 96, maxScore: 100, isDemo: true },
  { id: 'grd_12', teacherId: DEMO_TEACHER_ID, studentId: 'stu_05', classId: 'cls_7b', subjectName: 'Matematik', examTitle: 'Tam Sayılar ve Rasyonel Sayılar', examType: 'Yazılı', examDate: '2026-11-02', score: 91, maxScore: 100, isDemo: true },
  { id: 'grd_13', teacherId: DEMO_TEACHER_ID, studentId: 'stu_06', classId: 'cls_7b', subjectName: 'Sosyal Bilgiler', examTitle: 'Osmanlı Kuruluş ve Yükselme', examType: 'Yazılı', examDate: '2026-11-04', score: 95, maxScore: 100, isDemo: true },
  { id: 'grd_14', teacherId: DEMO_TEACHER_ID, studentId: 'stu_07', classId: 'cls_6a', subjectName: 'Matematik', examTitle: 'Çarpanlar, Katlar ve Kesirler', examType: 'Yazılı', examDate: '2026-11-06', score: 94, maxScore: 100, isDemo: true },
  { id: 'grd_15', teacherId: DEMO_TEACHER_ID, studentId: 'stu_08', classId: 'cls_6a', subjectName: 'Fen Bilimleri', examTitle: 'Güneş Sistemi ve Vücudumuz', examType: 'Yazılı', examDate: '2026-11-08', score: 85, maxScore: 100, isDemo: true },
];

function buildDemoTrial(
  id: string,
  studentId: string,
  classId: string,
  examTitle: string,
  examDate: string,
  scores: {
    turkceD: number; turkceY: number;
    matematikD: number; matematikY: number;
    fenD: number; fenY: number;
    inkilapD: number; inkilapY: number;
    dinD: number; dinY: number;
    ingilizceD: number; ingilizceY: number;
  }
): PracticeExamRecord {
  const totals = computePracticeExamTotals({ wrongPenalty: 3, ...scores });
  return {
    id,
    teacherId: DEMO_TEACHER_ID,
    studentId,
    classId,
    examTitle,
    examDate,
    wrongPenalty: 3,
    ...scores,
    totalCorrect: totals.totalCorrect,
    totalWrong: totals.totalWrong,
    totalNet: totals.totalNet,
    estimatedLgsScore: totals.estimatedLgsScore,
    isDemo: true,
  };
}

export const DEMO_PRACTICE_EXAMS: PracticeExamRecord[] = [
  // Defne Yılmaz (stu_01) - 3 progressive LGS trials
  buildDemoTrial('pex_01', 'stu_01', 'cls_8a', 'LGS Kurumsal Deneme 1', '2026-10-03', {
    turkceD: 17, turkceY: 2, matematikD: 15, matematikY: 3, fenD: 18, fenY: 1, inkilapD: 9, inkilapY: 1, dinD: 10, dinY: 0, ingilizceD: 9, ingilizceY: 1,
  }),
  buildDemoTrial('pex_02', 'stu_01', 'cls_8a', 'LGS Kurumsal Deneme 2', '2026-10-24', {
    turkceD: 18, turkceY: 1, matematikD: 17, matematikY: 2, fenD: 18, fenY: 2, inkilapD: 10, inkilapY: 0, dinD: 9, dinY: 1, ingilizceD: 10, ingilizceY: 0,
  }),
  buildDemoTrial('pex_03', 'stu_01', 'cls_8a', 'LGS Türkiye Geneli Deneme 3', '2026-11-14', {
    turkceD: 19, turkceY: 1, matematikD: 18, matematikY: 1, fenD: 19, fenY: 1, inkilapD: 10, inkilapY: 0, dinD: 10, dinY: 0, ingilizceD: 9, ingilizceY: 0,
  }),

  // Kerem Kaya (stu_02)
  buildDemoTrial('pex_04', 'stu_02', 'cls_8a', 'LGS Kurumsal Deneme 1', '2026-10-03', {
    turkceD: 16, turkceY: 3, matematikD: 11, matematikY: 4, fenD: 17, fenY: 2, inkilapD: 10, inkilapY: 0, dinD: 9, dinY: 1, ingilizceD: 8, ingilizceY: 2,
  }),
  buildDemoTrial('pex_05', 'stu_02', 'cls_8a', 'LGS Kurumsal Deneme 2', '2026-10-24', {
    turkceD: 17, turkceY: 2, matematikD: 14, matematikY: 3, fenD: 18, fenY: 1, inkilapD: 9, inkilapY: 1, dinD: 10, dinY: 0, ingilizceD: 9, ingilizceY: 1,
  }),

  // Zeynep Arslan (stu_03)
  buildDemoTrial('pex_06', 'stu_03', 'cls_8a', 'LGS Kurumsal Deneme 1', '2026-10-03', {
    turkceD: 18, turkceY: 2, matematikD: 16, matematikY: 2, fenD: 17, fenY: 2, inkilapD: 9, inkilapY: 1, dinD: 9, dinY: 0, ingilizceD: 10, ingilizceY: 0,
  }),
  buildDemoTrial('pex_07', 'stu_03', 'cls_8a', 'LGS Türkiye Geneli Deneme 3', '2026-11-14', {
    turkceD: 19, turkceY: 0, matematikD: 17, matematikY: 2, fenD: 19, fenY: 1, inkilapD: 10, inkilapY: 0, dinD: 10, dinY: 0, ingilizceD: 9, ingilizceY: 1,
  }),

  // Emir Demir (stu_04)
  buildDemoTrial('pex_08', 'stu_04', 'cls_8a', 'LGS Kurumsal Deneme 1', '2026-10-03', {
    turkceD: 14, turkceY: 5, matematikD: 8, matematikY: 6, fenD: 13, fenY: 4, inkilapD: 8, inkilapY: 2, dinD: 8, dinY: 1, ingilizceD: 7, ingilizceY: 2,
  }),
  buildDemoTrial('pex_09', 'stu_04', 'cls_8a', 'LGS Kurumsal Deneme 2', '2026-10-24', {
    turkceD: 15, turkceY: 3, matematikD: 11, matematikY: 4, fenD: 15, fenY: 3, inkilapD: 9, inkilapY: 1, dinD: 9, dinY: 1, ingilizceD: 8, ingilizceY: 1,
  }),

  // Elif Çelik (stu_05 - 7. Sınıf)
  buildDemoTrial('pex_10', 'stu_05', 'cls_7b', '7. Sınıf Kazanım Deneme 1', '2026-10-28', {
    turkceD: 19, turkceY: 1, matematikD: 17, matematikY: 2, fenD: 18, fenY: 1, inkilapD: 9, inkilapY: 1, dinD: 10, dinY: 0, ingilizceD: 9, ingilizceY: 1,
  }),
  // İpek Öztürk (stu_07 - 6. Sınıf)
  buildDemoTrial('pex_11', 'stu_07', 'cls_6a', '6. Sınıf Bilge Deneme 1', '2026-11-05', {
    turkceD: 18, turkceY: 1, matematikD: 18, matematikY: 1, fenD: 17, fenY: 2, inkilapD: 9, inkilapY: 1, dinD: 10, dinY: 0, ingilizceD: 9, ingilizceY: 0,
  }),
];

export const DEMO_ATTENDANCE: AttendanceRecord[] = [];

export const DEMO_POEMS: PoemSummary[] = [
  {
    id: 'poem_01',
    ownerId: DEMO_TEACHER_ID,
    title: 'Boğazda Sabah Işığı',
    genre: 'Lirik',
    content: 'Sulara düşerken gümüşten bir iz,\nUyanır kıyıda sessiz bir deniz.',
    isDraft: false,
    isDemo: true,
  },
  {
    id: 'poem_02',
    ownerId: DEMO_TEACHER_ID,
    title: 'Anadolu Bozkırında',
    genre: 'Pastoral',
    content: 'Rüzgârın sesinde eski bir türkü,\nTaşır zamanların derin öyküsünü.',
    isDraft: true,
    isDemo: true,
  },
];

export const DEMO_QUIZ_ATTEMPTS: QuizAttemptSummary[] = [
  { id: 'qa_01', ownerId: DEMO_TEACHER_ID, moduleName: 'edebiyat', topic: 'Ortaokul Söz Sanatları ve Şiir', score: 85, totalQuestions: 8, isDemo: true },
  { id: 'qa_02', ownerId: DEMO_TEACHER_ID, moduleName: 'tarih', topic: 'Osmanlı Kuruluş ve Yükselme', score: 90, totalQuestions: 10, isDemo: true },
  { id: 'qa_03', ownerId: DEMO_TEACHER_ID, moduleName: 'felsefe', topic: 'Düşünme ve Akıl Yürütme', score: 88, totalQuestions: 8, isDemo: true },
];

export const DEMO_MATH_ATTEMPTS: MathAttemptSummary[] = [
  { id: 'ma_01', ownerId: DEMO_TEACHER_ID, topic: 'Üslü ve Kareköklü İfadeler', difficulty: 'orta', isCorrect: true, hintsUsed: 0, isDemo: true },
  { id: 'ma_02', ownerId: DEMO_TEACHER_ID, topic: 'Birinci Dereceden Denklemler', difficulty: 'kolay', isCorrect: true, hintsUsed: 1, isDemo: true },
  { id: 'ma_03', ownerId: DEMO_TEACHER_ID, topic: 'Üçgenler ve Pisagor', difficulty: 'zor', isCorrect: true, hintsUsed: 1, isDemo: true },
  { id: 'ma_04', ownerId: DEMO_TEACHER_ID, topic: 'Oran-Orantı ve Yüzdeler', difficulty: 'orta', isCorrect: true, hintsUsed: 0, isDemo: true },
];
