export type ModuleId =
  | 'home'
  | 'activity-workshop'
  | 'student-tracking'
  | 'literature'
  | 'history'
  | 'mathematics'
  | 'science'
  | 'english'
  | 'religion'
  | 'philosophy'
  | 'ai-assistant'
  | 'reports'
  | 'settings';

export type UserRole = 'teacher' | 'student' | 'admin';
export type WorkspaceView = 'teacher' | 'student';
export type ThemeMode = 'light' | 'dark';

export type ExamType = 'Yazılı' | 'Deneme' | 'Sözlü' | 'Proje' | 'Performans';
export type AttendanceStatus = 'present' | 'excused' | 'unexcused' | 'late';
export type StudentStatus = 'active' | 'inactive';

export interface UserProfile {
  uid: string;
  displayName: string;
  role: UserRole;
  schoolName?: string;
  branch?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSettings {
  ownerId: string;
  theme: ThemeMode;
  workspaceView: WorkspaceView;
  compactMode: boolean;
  updatedAt?: string;
}

export interface SchoolClass {
  id: string;
  teacherId: string;
  name: string;
  gradeLevel: number;
  section: string;
  academicYear: string;
  subjectFocus?: string;
  isDemo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  teacherId: string;
  classId: string;
  fullName: string;
  studentNumber: string;
  gradeLevel: number;
  guardianNote?: string;
  status: StudentStatus;
  isDemo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subject {
  id: string;
  teacherId: string;
  name: string;
  code: string;
  isDemo?: boolean;
}

export interface Exam {
  id: string;
  teacherId: string;
  classId: string;
  subjectName: string;
  title: string;
  examType: ExamType;
  examDate: string; // YYYY-MM-DD
  maxScore: number;
  isDemo?: boolean;
}

export interface Grade {
  id: string;
  teacherId: string;
  studentId: string;
  classId: string;
  subjectName: string;
  examTitle: string;
  examType: ExamType;
  examDate: string; // YYYY-MM-DD
  score: number;
  maxScore: number;
  teacherNote?: string;
  isDemo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  teacherId: string;
  studentId: string;
  classId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  reason?: string;
  isDemo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type MiddleSchoolTrialSubjectKey =
  | 'turkce'
  | 'matematik'
  | 'fen'
  | 'inkilap'
  | 'din'
  | 'ingilizce';

export interface PracticeExamRecord {
  id: string;
  teacherId: string;
  studentId: string;
  classId: string;
  examTitle: string;
  examDate: string; // YYYY-MM-DD
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
  totalCorrect: number;
  totalWrong: number;
  totalNet: number;
  estimatedLgsScore: number;
  isDemo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentAIAnalysis {
  summary: string;
  strengths: string[];
  growthAreas: string[];
  studyRecommendations: string[];
  attendanceNote: string;
  pedagogicalDisclaimer: string;
}

export interface ClassAIAnalysis {
  overview: string;
  strongSubjects: string[];
  focusSubjects: string[];
  teachingStrategies: string[];
  disclaimer: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface AIConversation {
  id: string;
  ownerId: string;
  moduleContext: string;
  title: string;
  lastPrompt?: string;
  lastResponse?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PoemSummary {
  id: string;
  ownerId: string;
  title: string;
  genre: string;
  content: string;
  isDraft: boolean;
  isDemo?: boolean;
}

export interface QuizAttemptSummary {
  id: string;
  ownerId: string;
  moduleName: 'edebiyat' | 'tarih' | 'matematik' | 'felsefe' | 'fen' | 'ingilizce' | 'din';
  topic: string;
  score: number;
  totalQuestions: number;
  isDemo?: boolean;
}

export interface MathAttemptSummary {
  id: string;
  ownerId: string;
  topic: string;
  difficulty: 'kolay' | 'orta' | 'zor';
  isCorrect: boolean;
  hintsUsed: number;
  isDemo?: boolean;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}
