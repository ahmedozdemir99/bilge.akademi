import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  DEMO_ATTENDANCE,
  DEMO_CLASSES,
  DEMO_GRADES,
  DEMO_MATH_ATTEMPTS,
  DEMO_POEMS,
  DEMO_PRACTICE_EXAMS,
  DEMO_QUIZ_ATTEMPTS,
  DEMO_STUDENTS,
  DEMO_TEACHER_ID,
} from '../data/demoData';
import type {
  AIConversation,
  AttendanceRecord,
  AttendanceStatus,
  ExamType,
  Grade,
  MathAttemptSummary,
  ModuleId,
  PoemSummary,
  PracticeExamRecord,
  QuizAttemptSummary,
  SchoolClass,
  Student,
  StudentStatus,
  ThemeMode,
  ToastItem,
  UserProfile,
  WorkspaceView,
} from '../types/academy';
import { computePracticeExamTotals } from '../utils/exportUtils';

const DEMO_STORAGE_KEY = 'bilge_akademi_demo_v2';
const THEME_STORAGE_KEY = 'bilge_akademi_theme_v1';

interface DemoStoreState {
  classes: SchoolClass[];
  students: Student[];
  grades: Grade[];
  attendance: AttendanceRecord[];
  practiceExams: PracticeExamRecord[];
  poems: PoemSummary[];
  quizAttempts: QuizAttemptSummary[];
  mathAttempts: MathAttemptSummary[];
  aiConversations: AIConversation[];
}

function loadDemoStore(): DemoStoreState {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DemoStoreState>;
      if (Array.isArray(parsed.classes) && Array.isArray(parsed.students)) {
        return {
          classes: parsed.classes,
          students: parsed.students,
          grades: Array.isArray(parsed.grades) ? parsed.grades : DEMO_GRADES,
          attendance: Array.isArray(parsed.attendance) ? parsed.attendance : DEMO_ATTENDANCE,
          practiceExams: Array.isArray(parsed.practiceExams)
            ? parsed.practiceExams
            : DEMO_PRACTICE_EXAMS,
          poems: Array.isArray(parsed.poems) ? parsed.poems : DEMO_POEMS,
          quizAttempts: Array.isArray(parsed.quizAttempts) ? parsed.quizAttempts : DEMO_QUIZ_ATTEMPTS,
          mathAttempts: Array.isArray(parsed.mathAttempts) ? parsed.mathAttempts : DEMO_MATH_ATTEMPTS,
          aiConversations: Array.isArray(parsed.aiConversations) ? parsed.aiConversations : [],
        };
      }
    }
  } catch {
    // Fallback to initial demo seed
  }
  return {
    classes: DEMO_CLASSES,
    students: DEMO_STUDENTS,
    grades: DEMO_GRADES,
    attendance: DEMO_ATTENDANCE,
    practiceExams: DEMO_PRACTICE_EXAMS,
    poems: DEMO_POEMS,
    quizAttempts: DEMO_QUIZ_ATTEMPTS,
    mathAttempts: DEMO_MATH_ATTEMPTS,
    aiConversations: [],
  };
}

function generateValidId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36);
  return `${prefix}_${ts}_${rand}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

export interface ClassInput {
  name: string;
  gradeLevel: number;
  section: string;
  academicYear: string;
  subjectFocus?: string;
}

export interface StudentInput {
  classId: string;
  fullName: string;
  studentNumber: string;
  gradeLevel: number;
  guardianNote?: string;
  status: StudentStatus;
}

export interface GradeInput {
  studentId: string;
  classId: string;
  subjectName: string;
  examTitle: string;
  examType: ExamType;
  examDate: string;
  score: number;
  maxScore: number;
  teacherNote?: string;
}

export interface AttendanceInput {
  studentId: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  reason?: string;
}

export interface PoemInput {
  title: string;
  genre: string;
  content: string;
  isDraft: boolean;
}

export interface QuizAttemptInput {
  moduleName: 'edebiyat' | 'tarih' | 'matematik' | 'felsefe' | 'fen' | 'ingilizce' | 'din';
  topic: string;
  score: number;
  totalQuestions: number;
}

export interface PracticeExamInput {
  studentId: string;
  classId: string;
  examTitle: string;
  examDate: string;
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

export interface MathAttemptInput {
  topic: string;
  difficulty: 'kolay' | 'orta' | 'zor';
  isCorrect: boolean;
  hintsUsed: number;
}

interface AcademyContextValue {
  // Navigation
  activeModule: ModuleId;
  setActiveModule: (module: ModuleId) => void;
  assistantInitialContext: string;
  openAssistantForModule: (moduleLabel: string) => void;

  // Auth & Profile
  user: User | null;
  profile: UserProfile | null;
  authLoading: boolean;
  isDemoMode: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  updateProfileInfo: (schoolName: string, branch: string, displayName: string) => Promise<void>;

  // Preferences
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  workspaceView: WorkspaceView;
  setWorkspaceView: (view: WorkspaceView) => void;
  compactMode: boolean;
  setCompactMode: (compact: boolean) => void;

  // Data collections
  classes: SchoolClass[];
  students: Student[];
  grades: Grade[];
  attendance: AttendanceRecord[];
  practiceExams: PracticeExamRecord[];
  poems: PoemSummary[];
  quizAttempts: QuizAttemptSummary[];
  mathAttempts: MathAttemptSummary[];
  aiConversations: AIConversation[];
  dataLoading: boolean;

  // CRUD Actions
  addClass: (input: ClassInput) => Promise<void>;
  updateClass: (id: string, input: ClassInput) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;

  addStudent: (input: StudentInput) => Promise<void>;
  updateStudent: (id: string, input: StudentInput) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  addGrade: (input: GradeInput) => Promise<void>;
  updateGrade: (id: string, input: Omit<GradeInput, 'studentId'>) => Promise<void>;
  deleteGrade: (id: string) => Promise<void>;

  addAttendance: (input: AttendanceInput) => Promise<void>;
  deleteAttendance: (id: string) => Promise<void>;

  addPracticeExam: (input: PracticeExamInput) => Promise<void>;
  deletePracticeExam: (id: string) => Promise<void>;

  addPoem: (input: PoemInput) => Promise<string>;
  updatePoem: (id: string, input: PoemInput) => Promise<void>;
  deletePoem: (id: string) => Promise<void>;

  recordQuizAttempt: (input: QuizAttemptInput) => Promise<void>;
  recordMathAttempt: (input: MathAttemptInput) => Promise<void>;

  saveAIConversationSummary: (moduleContext: string, title: string, lastPrompt: string, lastResponse: string) => Promise<void>;

  // Demo Helpers
  seedDemoToFirestore: () => Promise<void>;
  resetDemoData: () => void;

  // Notifications
  toasts: ToastItem[];
  notify: (type: ToastItem['type'], title: string, description?: string) => void;
  dismissToast: (id: string) => void;
}

const AcademyContext = createContext<AcademyContextValue | null>(null);

export function AcademyProvider({ children }: { children: React.ReactNode }) {
  const [activeModule, setActiveModule] = useState<ModuleId>('home');
  const [assistantInitialContext, setAssistantInitialContext] = useState<string>('Genel Platform');

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // Ignore storage errors
    }
    return 'light';
  });
  const [workspaceView, setWorkspaceViewState] = useState<WorkspaceView>('teacher');
  const [compactMode, setCompactModeState] = useState<boolean>(false);

  // Demo state (used when signed out)
  const [demoStore, setDemoStore] = useState<DemoStoreState>(loadDemoStore);

  // Cloud state (used when signed in)
  const [cloudClasses, setCloudClasses] = useState<SchoolClass[]>([]);
  const [cloudStudents, setCloudStudents] = useState<Student[]>([]);
  const [cloudGrades, setCloudGrades] = useState<Grade[]>([]);
  const [cloudAttendance, setCloudAttendance] = useState<AttendanceRecord[]>([]);
  const [cloudPracticeExams, setCloudPracticeExams] = useState<PracticeExamRecord[]>([]);
  const [cloudPoems, setCloudPoems] = useState<PoemSummary[]>([]);
  const [cloudQuizAttempts, setCloudQuizAttempts] = useState<QuizAttemptSummary[]>([]);
  const [cloudMathAttempts, setCloudMathAttempts] = useState<MathAttemptSummary[]>([]);
  const [cloudAIConversations, setCloudAIConversations] = useState<AIConversation[]>([]);

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const isDemoMode = !user;

  const notify = useCallback((type: ToastItem['type'], title: string, description?: string) => {
    const id = generateValidId('toast');
    setToasts((prev) => [...prev, { id, type, title, description }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync dark class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore
    }
  }, [theme]);

  // Persist demo store locally
  useEffect(() => {
    try {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoStore));
    } catch {
      // Ignore
    }
  }, [demoStore]);

  const persistUserSettings = useCallback(
    async (nextTheme: ThemeMode, nextView: WorkspaceView, nextCompact: boolean) => {
      if (!user) return;
      const settingsPath = `userSettings/${user.uid}`;
      try {
        await setDoc(
          doc(db, 'userSettings', user.uid),
          {
            ownerId: user.uid,
            theme: nextTheme,
            workspaceView: nextView,
            compactMode: nextCompact,
            updatedAt: serverTimestamp(),
          },
          { merge: false }
        );
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, settingsPath);
      }
    },
    [user]
  );

  const setTheme = useCallback(
    (next: ThemeMode) => {
      setThemeState(next);
      void persistUserSettings(next, workspaceView, compactMode);
    },
    [compactMode, persistUserSettings, workspaceView]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [setTheme, theme]);

  const setWorkspaceView = useCallback(
    (next: WorkspaceView) => {
      setWorkspaceViewState(next);
      void persistUserSettings(theme, next, compactMode);
      notify(
        'info',
        next === 'teacher' ? 'Öğretmen Görünümü Aktif' : 'Öğrenci Görünümü Aktif',
        next === 'teacher'
          ? 'Sınıf, öğrenci, not ve devamsızlık yönetim araçları açıldı.'
          : 'Öğrenci odaklı çalışma, takip ve yapay zekâ rehberlik görünümüne geçildi.'
      );
    },
    [compactMode, notify, persistUserSettings, theme]
  );

  const setCompactMode = useCallback(
    (next: boolean) => {
      setCompactModeState(next);
      void persistUserSettings(theme, workspaceView, next);
    },
    [persistUserSettings, theme, workspaceView]
  );

  // Firebase Auth listener + profile bootstrap
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setAuthLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(userRef);
        const safeName = (firebaseUser.displayName || 'Bilge Kullanıcı').trim().slice(0, 100);
        const isBootstrappedAdmin = firebaseUser.email === 'ahmedkadiri99@gmail.com';

        if (!snap.exists()) {
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            displayName: safeName.length >= 2 ? safeName : 'Bilge Kullanıcı',
            role: isBootstrappedAdmin ? 'admin' : 'student',
            schoolName: 'Bilge Akademi',
            branch: 'Genel Eğitim',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          if (firebaseUser.email) {
            await setDoc(doc(db, 'users', firebaseUser.uid, 'private', 'contact'), {
              ownerId: firebaseUser.uid,
              email: firebaseUser.email.slice(0, 160),
              updatedAt: serverTimestamp(),
            });
          }
          setProfile({
            uid: firebaseUser.uid,
            displayName: safeName,
            role: isBootstrappedAdmin ? 'admin' : 'student',
            schoolName: 'Bilge Akademi',
            branch: 'Genel Eğitim',
            email: firebaseUser.email ?? undefined,
          });
        } else {
          const data = snap.data();
          setProfile({
            uid: firebaseUser.uid,
            displayName: String(data.displayName || safeName),
            role: (data.role as UserProfile['role']) || 'student',
            schoolName: typeof data.schoolName === 'string' ? data.schoolName : undefined,
            branch: typeof data.branch === 'string' ? data.branch : undefined,
            email: firebaseUser.email ?? undefined,
          });
        }

        // Load saved user settings if present
        const settingsSnap = await getDoc(doc(db, 'userSettings', firebaseUser.uid));
        if (settingsSnap.exists()) {
          const sData = settingsSnap.data();
          if (sData.theme === 'dark' || sData.theme === 'light') {
            setThemeState(sData.theme);
          }
          if (sData.workspaceView === 'teacher' || sData.workspaceView === 'student') {
            setWorkspaceViewState(sData.workspaceView);
          }
          if (typeof sData.compactMode === 'boolean') {
            setCompactModeState(sData.compactMode);
          }
        }
      } catch (error) {
        console.error('Profil yüklenirken hata:', error);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Firestore real-time subscriptions (only when signed in)
  useEffect(() => {
    if (!user) {
      setCloudClasses([]);
      setCloudStudents([]);
      setCloudGrades([]);
      setCloudAttendance([]);
      setCloudPracticeExams([]);
      setCloudPoems([]);
      setCloudQuizAttempts([]);
      setCloudMathAttempts([]);
      setCloudAIConversations([]);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    const uid = user.uid;

    // Listener errors must not throw from asynchronous Firebase callbacks.
    // Preserve the signed-in session and show a diagnostic instead.
    const reportSubscriptionError = (error: Error, collectionName: string) => {
      console.error(`Firestore listener error (${collectionName}):`, error);
      setDataLoading(false);
      const code = (error as Error & { code?: string }).code ?? 'unknown';
      notify('error', 'Firebase veri bağlantısı', `${collectionName}: ${code}. Oturum korunuyor; bağlantınızı ve Firestore izinlerini kontrol edin.`);
    };

    const unsubClasses = onSnapshot(
      query(collection(db, 'classes'), where('teacherId', '==', uid)),
      (snap) => {
        const list: SchoolClass[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<SchoolClass, 'id'>),
        }));
        list.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        setCloudClasses(list);
        setDataLoading(false);
      },
      (err) => reportSubscriptionError(err, 'classes')
    );

    const unsubStudents = onSnapshot(
      query(collection(db, 'students'), where('teacherId', '==', uid)),
      (snap) => {
        const list: Student[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Student, 'id'>),
        }));
        list.sort((a, b) => a.fullName.localeCompare(b.fullName, 'tr'));
        setCloudStudents(list);
      },
      (err) => reportSubscriptionError(err, 'students')
    );

    const unsubGrades = onSnapshot(
      query(collection(db, 'grades'), where('teacherId', '==', uid)),
      (snap) => {
        const list: Grade[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Grade, 'id'>),
        }));
        list.sort((a, b) => b.examDate.localeCompare(a.examDate));
        setCloudGrades(list);
      },
      (err) => reportSubscriptionError(err, 'grades')
    );

    const unsubAttendance = onSnapshot(
      query(collection(db, 'attendance'), where('teacherId', '==', uid)),
      (snap) => {
        const list: AttendanceRecord[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<AttendanceRecord, 'id'>),
        }));
        list.sort((a, b) => b.date.localeCompare(a.date));
        setCloudAttendance(list);
      },
      (err) => reportSubscriptionError(err, 'attendance')
    );

    const unsubPracticeExams = onSnapshot(
      query(collection(db, 'practiceExams'), where('teacherId', '==', uid)),
      (snap) => {
        const list: PracticeExamRecord[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<PracticeExamRecord, 'id'>),
        }));
        list.sort((a, b) => b.examDate.localeCompare(a.examDate));
        setCloudPracticeExams(list);
      },
      (err) => reportSubscriptionError(err, 'practiceExams')
    );

    const unsubPoems = onSnapshot(
      query(collection(db, 'poems'), where('ownerId', '==', uid)),
      (snap) => {
        setCloudPoems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PoemSummary, 'id'>) })));
      },
      (err) => reportSubscriptionError(err, 'poems')
    );

    const unsubQuizzes = onSnapshot(
      query(collection(db, 'quizAttempts'), where('ownerId', '==', uid)),
      (snap) => {
        setCloudQuizAttempts(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<QuizAttemptSummary, 'id'>) }))
        );
      },
      (err) => reportSubscriptionError(err, 'quizAttempts')
    );

    const unsubMath = onSnapshot(
      query(collection(db, 'mathAttempts'), where('ownerId', '==', uid)),
      (snap) => {
        setCloudMathAttempts(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MathAttemptSummary, 'id'>) }))
        );
      },
      (err) => reportSubscriptionError(err, 'mathAttempts')
    );

    const unsubAI = onSnapshot(
      query(collection(db, 'aiConversations'), where('ownerId', '==', uid)),
      (snap) => {
        setCloudAIConversations(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AIConversation, 'id'>) }))
        );
      },
      (err) => reportSubscriptionError(err, 'aiConversations')
    );

    return () => {
      unsubClasses();
      unsubStudents();
      unsubGrades();
      unsubAttendance();
      unsubPracticeExams();
      unsubPoems();
      unsubQuizzes();
      unsubMath();
      unsubAI();
    };
  }, [user, notify]);

  const signInWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      notify('success', 'Oturum açıldı', 'Verileriniz artık Firebase Firestore üzerinde güvenle saklanır.');
    } catch (error) {
      const errObj = error as { code?: string; message?: string };
      const code = errObj?.code ?? '';
      const msg = errObj?.message ?? '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request' || msg.includes('popup-closed-by-user')) {
        return;
      }
      if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        notify(
          'error',
          'Alan adı Firebase’de yetkilendirilmemiş',
          `Google girişi için "${host}" alan adını Firebase Console > Authentication > Settings > Authorized domains listesine ekleyin. Tüm dersleri Demo Modunda giriş yapmadan kullanabilirsiniz.`
        );
        return;
      }
      if (code === 'auth/popup-blocked' || msg.includes('popup-blocked')) {
        notify(
          'error',
          'Açılır pencere engellendi',
          'Tarayıcı ayarlarından bu site için açılır pencerelere (pop-up) izin verip tekrar deneyin.'
        );
        return;
      }
      if (code.includes('api-key') || msg.includes('API key')) {
        notify(
          'error',
          'Firebase API anahtarı kısıtlı',
          'Google Cloud Console > Credentials bölümünde bu alan adının Firebase API anahtarına izinli olduğunu kontrol edin.'
        );
        return;
      }
      notify(
        'error',
        'Giriş başarısız',
        `Google ile oturum açılırken bir hata oluştu${code ? ` (${code})` : ''}. Demo Moduyla tüm özellikler kullanılabilir.`
      );
    }
  }, [notify]);

  const signOutUser = useCallback(async () => {
    try {
      await signOut(auth);
      notify('info', 'Oturum kapatıldı', 'Örnek verilerle çalışan Demo Moduna geçildi.');
    } catch {
      notify('error', 'Çıkış yapılamadı', 'Oturum kapatılırken bir hata oluştu.');
    }
  }, [notify]);

  const updateProfileInfo = useCallback(
    async (schoolName: string, branch: string, displayName: string) => {
      if (!user) {
        notify('info', 'Demo Modu', 'Profil bilgilerini kalıcı kaydetmek için Google hesabınızla giriş yapın.');
        return;
      }
      const safeDisplay = displayName.trim().slice(0, 100);
      if (safeDisplay.length < 2) {
        notify('error', 'Geçersiz ad', 'Ad soyad en az 2 karakter olmalıdır.');
        return;
      }
      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          displayName: safeDisplay,
          schoolName: schoolName.trim().slice(0, 120),
          branch: branch.trim().slice(0, 80),
          updatedAt: serverTimestamp(),
        });
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                displayName: safeDisplay,
                schoolName: schoolName.trim().slice(0, 120),
                branch: branch.trim().slice(0, 80),
              }
            : prev
        );
        notify('success', 'Profil güncellendi', 'Kurum ve branş bilgileriniz kaydedildi.');
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [notify, user]
  );

  // --- CRUD: Classes ---
  const addClass = useCallback(
    async (input: ClassInput) => {
      const id = generateValidId('cls');
      const cleanName = input.name.trim().slice(0, 60);
      const cleanSection = input.section.trim().slice(0, 10);
      const cleanYear = input.academicYear.trim().slice(0, 20);
      const cleanFocus = (input.subjectFocus ?? '').trim().slice(0, 80);
      const gradeLevel = Math.max(1, Math.min(12, Math.round(input.gradeLevel)));

      if (!user) {
        const nextClass: SchoolClass = {
          id,
          teacherId: DEMO_TEACHER_ID,
          name: cleanName,
          gradeLevel,
          section: cleanSection,
          academicYear: cleanYear,
          subjectFocus: cleanFocus || undefined,
          isDemo: true,
        };
        setDemoStore((prev) => ({ ...prev, classes: [...prev.classes, nextClass] }));
        notify('success', 'Sınıf oluşturuldu', `${cleanName} demo çalışma alanına eklendi.`);
        return;
      }

      const path = `classes/${id}`;
      try {
        await setDoc(doc(db, 'classes', id), {
          teacherId: user.uid,
          name: cleanName,
          gradeLevel,
          section: cleanSection,
          academicYear: cleanYear,
          subjectFocus: cleanFocus,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        notify('success', 'Sınıf kaydedildi', `${cleanName} başarıyla oluşturuldu.`);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    },
    [notify, user]
  );

  const updateClass = useCallback(
    async (id: string, input: ClassInput) => {
      const cleanName = input.name.trim().slice(0, 60);
      const cleanSection = input.section.trim().slice(0, 10);
      const cleanYear = input.academicYear.trim().slice(0, 20);
      const cleanFocus = (input.subjectFocus ?? '').trim().slice(0, 80);
      const gradeLevel = Math.max(1, Math.min(12, Math.round(input.gradeLevel)));

      if (!user) {
        setDemoStore((prev) => ({
          ...prev,
          classes: prev.classes.map((c) =>
            c.id === id
              ? { ...c, name: cleanName, gradeLevel, section: cleanSection, academicYear: cleanYear, subjectFocus: cleanFocus }
              : c
          ),
        }));
        notify('success', 'Sınıf güncellendi', `${cleanName} bilgileri kaydedildi.`);
        return;
      }

      const path = `classes/${id}`;
      try {
        await updateDoc(doc(db, 'classes', id), {
          name: cleanName,
          gradeLevel,
          section: cleanSection,
          academicYear: cleanYear,
          subjectFocus: cleanFocus,
          updatedAt: serverTimestamp(),
        });
        notify('success', 'Sınıf güncellendi', `${cleanName} bilgileri Firestore'da güncellendi.`);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [notify, user]
  );

  const deleteClass = useCallback(
    async (id: string) => {
      if (!user) {
        setDemoStore((prev) => ({
          ...prev,
          classes: prev.classes.filter((c) => c.id !== id),
          students: prev.students.filter((s) => s.classId !== id),
          grades: prev.grades.filter((g) => g.classId !== id),
          attendance: prev.attendance.filter((a) => a.classId !== id),
        }));
        notify('info', 'Sınıf silindi', 'Sınıf ve bağlı örnek kayıtlar kaldırıldı.');
        return;
      }

      const path = `classes/${id}`;
      try {
        await deleteDoc(doc(db, 'classes', id));
        notify('info', 'Sınıf silindi', 'Sınıf kaydı kaldırıldı.');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [notify, user]
  );

  // --- CRUD: Students ---
  const addStudent = useCallback(
    async (input: StudentInput) => {
      const id = generateValidId('stu');
      const fullName = input.fullName.trim().slice(0, 100);
      const studentNumber = input.studentNumber.trim().slice(0, 24);
      const guardianNote = (input.guardianNote ?? '').trim().slice(0, 400);
      const gradeLevel = Math.max(1, Math.min(12, Math.round(input.gradeLevel)));

      if (!user) {
        const nextStudent: Student = {
          id,
          teacherId: DEMO_TEACHER_ID,
          classId: input.classId,
          fullName,
          studentNumber,
          gradeLevel,
          guardianNote: guardianNote || undefined,
          status: input.status,
          isDemo: true,
        };
        setDemoStore((prev) => ({ ...prev, students: [...prev.students, nextStudent] }));
        notify('success', 'Öğrenci eklendi', `${fullName} başarıyla kaydedildi.`);
        return;
      }

      const path = `students/${id}`;
      try {
        await setDoc(doc(db, 'students', id), {
          teacherId: user.uid,
          classId: input.classId,
          fullName,
          studentNumber,
          gradeLevel,
          guardianNote,
          status: input.status,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        notify('success', 'Öğrenci kaydedildi', `${fullName} sınıf listesine eklendi.`);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    },
    [notify, user]
  );

  const updateStudent = useCallback(
    async (id: string, input: StudentInput) => {
      const fullName = input.fullName.trim().slice(0, 100);
      const studentNumber = input.studentNumber.trim().slice(0, 24);
      const guardianNote = (input.guardianNote ?? '').trim().slice(0, 400);
      const gradeLevel = Math.max(1, Math.min(12, Math.round(input.gradeLevel)));

      if (!user) {
        setDemoStore((prev) => ({
          ...prev,
          students: prev.students.map((s) =>
            s.id === id
              ? {
                  ...s,
                  classId: input.classId,
                  fullName,
                  studentNumber,
                  gradeLevel,
                  guardianNote,
                  status: input.status,
                }
              : s
          ),
        }));
        notify('success', 'Öğrenci güncellendi', `${fullName} bilgileri kaydedildi.`);
        return;
      }

      const path = `students/${id}`;
      try {
        await updateDoc(doc(db, 'students', id), {
          classId: input.classId,
          fullName,
          studentNumber,
          gradeLevel,
          guardianNote,
          status: input.status,
          updatedAt: serverTimestamp(),
        });
        notify('success', 'Öğrenci güncellendi', `${fullName} profili kaydedildi.`);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [notify, user]
  );

  const deleteStudent = useCallback(
    async (id: string) => {
      if (!user) {
        setDemoStore((prev) => ({
          ...prev,
          students: prev.students.filter((s) => s.id !== id),
          grades: prev.grades.filter((g) => g.studentId !== id),
          attendance: prev.attendance.filter((a) => a.studentId !== id),
        }));
        notify('info', 'Öğrenci silindi', 'Öğrenci ve ilgili kayıtlar kaldırıldı.');
        return;
      }

      const path = `students/${id}`;
      try {
        await deleteDoc(doc(db, 'students', id));
        notify('info', 'Öğrenci silindi', 'Öğrenci kaydı Firestore üzerinden kaldırıldı.');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [notify, user]
  );

  // --- CRUD: Grades ---
  const addGrade = useCallback(
    async (input: GradeInput) => {
      const id = generateValidId('grd');
      const maxScore = Math.max(1, Math.min(100, Number(input.maxScore) || 100));
      const score = Math.max(0, Math.min(maxScore, Number(input.score) || 0));
      const subjectName = input.subjectName.trim().slice(0, 80);
      const examTitle = input.examTitle.trim().slice(0, 120);
      const teacherNote = (input.teacherNote ?? '').trim().slice(0, 300);

      if (!user) {
        const nextGrade: Grade = {
          id,
          teacherId: DEMO_TEACHER_ID,
          studentId: input.studentId,
          classId: input.classId,
          subjectName,
          examTitle,
          examType: input.examType,
          examDate: input.examDate,
          score,
          maxScore,
          teacherNote: teacherNote || undefined,
          isDemo: true,
        };
        setDemoStore((prev) => ({ ...prev, grades: [nextGrade, ...prev.grades] }));
        notify('success', 'Sınav notu eklendi', `${subjectName} — ${score}/${maxScore}`);
        return;
      }

      const path = `grades/${id}`;
      try {
        await setDoc(doc(db, 'grades', id), {
          teacherId: user.uid,
          studentId: input.studentId,
          classId: input.classId,
          subjectName,
          examTitle,
          examType: input.examType,
          examDate: input.examDate,
          score,
          maxScore,
          teacherNote,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        notify('success', 'Not kaydedildi', `${subjectName} (${score}/${maxScore}) eklendi.`);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    },
    [notify, user]
  );

  const updateGrade = useCallback(
    async (id: string, input: Omit<GradeInput, 'studentId'>) => {
      const maxScore = Math.max(1, Math.min(100, Number(input.maxScore) || 100));
      const score = Math.max(0, Math.min(maxScore, Number(input.score) || 0));
      const subjectName = input.subjectName.trim().slice(0, 80);
      const examTitle = input.examTitle.trim().slice(0, 120);
      const teacherNote = (input.teacherNote ?? '').trim().slice(0, 300);

      if (!user) {
        setDemoStore((prev) => ({
          ...prev,
          grades: prev.grades.map((g) =>
            g.id === id
              ? {
                  ...g,
                  classId: input.classId,
                  subjectName,
                  examTitle,
                  examType: input.examType,
                  examDate: input.examDate,
                  score,
                  maxScore,
                  teacherNote,
                }
              : g
          ),
        }));
        notify('success', 'Not güncellendi', `${subjectName} sınav kaydı düzenlendi.`);
        return;
      }

      const path = `grades/${id}`;
      try {
        await updateDoc(doc(db, 'grades', id), {
          classId: input.classId,
          subjectName,
          examTitle,
          examType: input.examType,
          examDate: input.examDate,
          score,
          maxScore,
          teacherNote,
          updatedAt: serverTimestamp(),
        });
        notify('success', 'Not güncellendi', 'Değişiklikler Firestore üzerinde kaydedildi.');
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [notify, user]
  );

  const deleteGrade = useCallback(
    async (id: string) => {
      if (!user) {
        setDemoStore((prev) => ({ ...prev, grades: prev.grades.filter((g) => g.id !== id) }));
        notify('info', 'Not silindi', 'Sınav kaydı listeden kaldırıldı.');
        return;
      }

      const path = `grades/${id}`;
      try {
        await deleteDoc(doc(db, 'grades', id));
        notify('info', 'Not silindi', 'Sınav kaydı kaldırıldı.');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [notify, user]
  );

  // --- CRUD: Attendance ---
  const addAttendance = useCallback(
    async (input: AttendanceInput) => {
      const id = generateValidId('att');
      const reason = (input.reason ?? '').trim().slice(0, 240);

      if (!user) {
        const nextRec: AttendanceRecord = {
          id,
          teacherId: DEMO_TEACHER_ID,
          studentId: input.studentId,
          classId: input.classId,
          date: input.date,
          status: input.status,
          reason: reason || undefined,
          isDemo: true,
        };
        setDemoStore((prev) => ({ ...prev, attendance: [nextRec, ...prev.attendance] }));
        notify('success', 'Devam kaydı eklendi', `${input.date} tarihli yoklama kaydedildi.`);
        return;
      }

      const path = `attendance/${id}`;
      try {
        await setDoc(doc(db, 'attendance', id), {
          teacherId: user.uid,
          studentId: input.studentId,
          classId: input.classId,
          date: input.date,
          status: input.status,
          reason,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        notify('success', 'Devam kaydı eklendi', `${input.date} yoklama bilgisi kaydedildi.`);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    },
    [notify, user]
  );

  const deleteAttendance = useCallback(
    async (id: string) => {
      if (!user) {
        setDemoStore((prev) => ({
          ...prev,
          attendance: prev.attendance.filter((a) => a.id !== id),
        }));
        notify('info', 'Kayıt silindi', 'Kayıt kaldırıldı.');
        return;
      }

      const path = `attendance/${id}`;
      try {
        await deleteDoc(doc(db, 'attendance', id));
        notify('info', 'Kayıt silindi', 'Kayıt kaldırıldı.');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [notify, user]
  );

  // --- CRUD: Practice Exams (Ortaokul / LGS Deneme & Net Robotu) ---
  const addPracticeExam = useCallback(
    async (input: PracticeExamInput) => {
      const id = generateValidId('pex');
      const examTitle = input.examTitle.trim().slice(0, 120);
      const clampPair = (dRaw: number, yRaw: number, maxQ: number) => {
        const d = Math.max(0, Math.min(maxQ, Math.round(dRaw)));
        const y = Math.max(0, Math.min(maxQ - d, Math.round(yRaw)));
        return { d, y };
      };
      const turkce = clampPair(input.turkceD, input.turkceY, 20);
      const matematik = clampPair(input.matematikD, input.matematikY, 20);
      const fen = clampPair(input.fenD, input.fenY, 20);
      const inkilap = clampPair(input.inkilapD, input.inkilapY, 10);
      const din = clampPair(input.dinD, input.dinY, 10);
      const ingilizce = clampPair(input.ingilizceD, input.ingilizceY, 10);
      const wrongPenalty: 3 | 4 = input.wrongPenalty === 4 ? 4 : 3;

      const totals = computePracticeExamTotals({
        wrongPenalty,
        turkceD: turkce.d,
        turkceY: turkce.y,
        matematikD: matematik.d,
        matematikY: matematik.y,
        fenD: fen.d,
        fenY: fen.y,
        inkilapD: inkilap.d,
        inkilapY: inkilap.y,
        dinD: din.d,
        dinY: din.y,
        ingilizceD: ingilizce.d,
        ingilizceY: ingilizce.y,
      });

      const payload = {
        studentId: input.studentId,
        classId: input.classId,
        examTitle,
        examDate: input.examDate,
        wrongPenalty,
        turkceD: turkce.d,
        turkceY: turkce.y,
        matematikD: matematik.d,
        matematikY: matematik.y,
        fenD: fen.d,
        fenY: fen.y,
        inkilapD: inkilap.d,
        inkilapY: inkilap.y,
        dinD: din.d,
        dinY: din.y,
        ingilizceD: ingilizce.d,
        ingilizceY: ingilizce.y,
        totalCorrect: totals.totalCorrect,
        totalWrong: totals.totalWrong,
        totalNet: totals.totalNet,
        estimatedLgsScore: totals.estimatedLgsScore,
      };

      if (!user) {
        const entry: PracticeExamRecord = {
          id,
          teacherId: DEMO_TEACHER_ID,
          ...payload,
          isDemo: true,
        };
        setDemoStore((prev) => ({
          ...prev,
          practiceExams: [entry, ...prev.practiceExams],
        }));
        notify(
          'success',
          'Deneme sonucu kaydedildi',
          `${examTitle} · Toplam ${totals.totalNet.toFixed(2)} net (${totals.totalCorrect} doğru)`
        );
        return;
      }

      const path = `practiceExams/${id}`;
      try {
        await setDoc(doc(db, 'practiceExams', id), {
          teacherId: user.uid,
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        notify(
          'success',
          'Deneme sonucu Firestore’a kaydedildi',
          `${examTitle} · Toplam ${totals.totalNet.toFixed(2)} net`
        );
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    },
    [notify, user]
  );

  const deletePracticeExam = useCallback(
    async (id: string) => {
      if (!user) {
        setDemoStore((prev) => ({
          ...prev,
          practiceExams: prev.practiceExams.filter((p) => p.id !== id),
        }));
        notify('info', 'Deneme kaydı silindi', 'Kayıt listeden kaldırıldı.');
        return;
      }

      const path = `practiceExams/${id}`;
      try {
        await deleteDoc(doc(db, 'practiceExams', id));
        notify('info', 'Deneme kaydı silindi', 'Kayıt Firestore üzerinden kaldırıldı.');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [notify, user]
  );

  // --- CRUD: Poems ---
  const addPoem = useCallback(
    async (input: PoemInput): Promise<string> => {
      const id = generateValidId('poem');
      const title = input.title.trim().slice(0, 120) || 'Başlıksız Şiir';
      const genre = input.genre.trim().slice(0, 50) || 'Lirik';
      const content = input.content.trim().slice(0, 5000);

      if (!user) {
        const entry: PoemSummary = {
          id,
          ownerId: DEMO_TEACHER_ID,
          title,
          genre,
          content,
          isDraft: input.isDraft,
          isDemo: true,
        };
        setDemoStore((prev) => ({ ...prev, poems: [entry, ...prev.poems] }));
        notify('success', input.isDraft ? 'Şiir taslağı kaydedildi' : 'Şiir kaydedildi', title);
        return id;
      }

      const path = `poems/${id}`;
      try {
        await setDoc(doc(db, 'poems', id), {
          ownerId: user.uid,
          title,
          genre,
          content,
          isDraft: Boolean(input.isDraft),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        notify('success', input.isDraft ? 'Şiir taslağı kaydedildi' : 'Şiir kaydedildi', title);
        return id;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    },
    [notify, user]
  );

  const updatePoem = useCallback(
    async (id: string, input: PoemInput) => {
      const title = input.title.trim().slice(0, 120) || 'Başlıksız Şiir';
      const genre = input.genre.trim().slice(0, 50) || 'Lirik';
      const content = input.content.trim().slice(0, 5000);

      if (!user) {
        setDemoStore((prev) => ({
          ...prev,
          poems: prev.poems.map((p) =>
            p.id === id ? { ...p, title, genre, content, isDraft: input.isDraft } : p
          ),
        }));
        notify('success', 'Şiir güncellendi', title);
        return;
      }

      const path = `poems/${id}`;
      try {
        await updateDoc(doc(db, 'poems', id), {
          title,
          genre,
          content,
          isDraft: Boolean(input.isDraft),
          updatedAt: serverTimestamp(),
        });
        notify('success', 'Şiir güncellendi', title);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [notify, user]
  );

  const deletePoem = useCallback(
    async (id: string) => {
      if (!user) {
        setDemoStore((prev) => ({ ...prev, poems: prev.poems.filter((p) => p.id !== id) }));
        notify('info', 'Şiir silindi', 'Kayıt kaldırıldı.');
        return;
      }

      const path = `poems/${id}`;
      try {
        await deleteDoc(doc(db, 'poems', id));
        notify('info', 'Şiir silindi', 'Kayıt Firestore üzerinden kaldırıldı.');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [notify, user]
  );

  // --- Record Quiz & Math Attempts ---
  const recordQuizAttempt = useCallback(
    async (input: QuizAttemptInput) => {
      const id = generateValidId('quiz');
      const topic = input.topic.trim().slice(0, 100) || 'Genel Yarışma';
      const totalQuestions = Math.max(1, Math.min(100, Math.round(input.totalQuestions)));
      const score = Math.max(0, Math.min(totalQuestions, Math.round(input.score)));

      if (!user) {
        const entry: QuizAttemptSummary = {
          id,
          ownerId: DEMO_TEACHER_ID,
          moduleName: input.moduleName,
          topic,
          score,
          totalQuestions,
          isDemo: true,
        };
        setDemoStore((prev) => ({ ...prev, quizAttempts: [entry, ...prev.quizAttempts] }));
        return;
      }

      const path = `quizAttempts/${id}`;
      try {
        await setDoc(doc(db, 'quizAttempts', id), {
          ownerId: user.uid,
          moduleName: input.moduleName,
          topic,
          score,
          totalQuestions,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    },
    [user]
  );

  const recordMathAttempt = useCallback(
    async (input: MathAttemptInput) => {
      const id = generateValidId('math');
      const topic = input.topic.trim().slice(0, 100) || 'Matematik Alıştırması';
      const hintsUsed = Math.max(0, Math.min(5, Math.round(input.hintsUsed)));

      if (!user) {
        const entry: MathAttemptSummary = {
          id,
          ownerId: DEMO_TEACHER_ID,
          topic,
          difficulty: input.difficulty,
          isCorrect: input.isCorrect,
          hintsUsed,
          isDemo: true,
        };
        setDemoStore((prev) => ({ ...prev, mathAttempts: [entry, ...prev.mathAttempts] }));
        return;
      }

      const path = `mathAttempts/${id}`;
      try {
        await setDoc(doc(db, 'mathAttempts', id), {
          ownerId: user.uid,
          topic,
          difficulty: input.difficulty,
          isCorrect: Boolean(input.isCorrect),
          hintsUsed,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    },
    [user]
  );

  const saveAIConversationSummary = useCallback(
    async (moduleContext: string, title: string, lastPrompt: string, lastResponse: string) => {
      const id = generateValidId('ai');
      const safeTitle = title.trim().slice(0, 120) || 'Asistan Sohbeti';
      const safeContext = moduleContext.trim().slice(0, 60) || 'Genel';

      if (!user) {
        const entry: AIConversation = {
          id,
          ownerId: DEMO_TEACHER_ID,
          moduleContext: safeContext,
          title: safeTitle,
          lastPrompt: lastPrompt.slice(0, 1000),
          lastResponse: lastResponse.slice(0, 4000),
          createdAt: new Date().toISOString(),
        };
        setDemoStore((prev) => ({
          ...prev,
          aiConversations: [entry, ...prev.aiConversations].slice(0, 20),
        }));
        return;
      }

      const path = `aiConversations/${id}`;
      try {
        await setDoc(doc(db, 'aiConversations', id), {
          ownerId: user.uid,
          moduleContext: safeContext,
          title: safeTitle,
          lastPrompt: lastPrompt.slice(0, 1000),
          lastResponse: lastResponse.slice(0, 4000),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    },
    [user]
  );

  const seedDemoToFirestore = useCallback(async () => {
    if (!user) {
      notify('info', 'Giriş Gerekli', 'Örnek verileri bulut hesabınıza aktarmak için Google ile giriş yapın.');
      return;
    }
    const uid = user.uid;
    try {
      const classIdMap = new Map<string, string>();
      const studentIdMap = new Map<string, string>();

      for (const cls of DEMO_CLASSES) {
        const newId = generateValidId('cls');
        classIdMap.set(cls.id, newId);
        await setDoc(doc(db, 'classes', newId), {
          teacherId: uid,
          name: cls.name,
          gradeLevel: cls.gradeLevel,
          section: cls.section,
          academicYear: cls.academicYear,
          subjectFocus: cls.subjectFocus ?? '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      for (const stu of DEMO_STUDENTS) {
        const mappedClassId = classIdMap.get(stu.classId);
        if (!mappedClassId) continue;
        const newId = generateValidId('stu');
        studentIdMap.set(stu.id, newId);
        await setDoc(doc(db, 'students', newId), {
          teacherId: uid,
          classId: mappedClassId,
          fullName: stu.fullName,
          studentNumber: stu.studentNumber,
          gradeLevel: stu.gradeLevel,
          guardianNote: stu.guardianNote ?? '',
          status: stu.status,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      for (const grd of DEMO_GRADES.slice(0, 18)) {
        const mappedClassId = classIdMap.get(grd.classId);
        const mappedStudentId = studentIdMap.get(grd.studentId);
        if (!mappedClassId || !mappedStudentId) continue;
        const newId = generateValidId('grd');
        await setDoc(doc(db, 'grades', newId), {
          teacherId: uid,
          studentId: mappedStudentId,
          classId: mappedClassId,
          subjectName: grd.subjectName,
          examTitle: grd.examTitle,
          examType: grd.examType,
          examDate: grd.examDate,
          score: grd.score,
          maxScore: grd.maxScore,
          teacherNote: grd.teacherNote ?? '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      for (const pex of DEMO_PRACTICE_EXAMS) {
        const mappedClassId = classIdMap.get(pex.classId);
        const mappedStudentId = studentIdMap.get(pex.studentId);
        if (!mappedClassId || !mappedStudentId) continue;
        const newId = generateValidId('pex');
        await setDoc(doc(db, 'practiceExams', newId), {
          teacherId: uid,
          studentId: mappedStudentId,
          classId: mappedClassId,
          examTitle: pex.examTitle,
          examDate: pex.examDate,
          wrongPenalty: pex.wrongPenalty,
          turkceD: pex.turkceD,
          turkceY: pex.turkceY,
          matematikD: pex.matematikD,
          matematikY: pex.matematikY,
          fenD: pex.fenD,
          fenY: pex.fenY,
          inkilapD: pex.inkilapD,
          inkilapY: pex.inkilapY,
          dinD: pex.dinD,
          dinY: pex.dinY,
          ingilizceD: pex.ingilizceD,
          ingilizceY: pex.ingilizceY,
          totalCorrect: pex.totalCorrect,
          totalWrong: pex.totalWrong,
          totalNet: pex.totalNet,
          estimatedLgsScore: pex.estimatedLgsScore,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      notify(
        'success',
        'Ortaokul örnek sınıfları hesabınıza yüklendi',
        'Sınıflar, öğrenciler, yazılı notları ve LGS deneme kayıtları Firestore veritabanına eklendi.'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'seedDemoToFirestore');
    }
  }, [notify, user]);

  const resetDemoData = useCallback(() => {
    setDemoStore({
      classes: DEMO_CLASSES,
      students: DEMO_STUDENTS,
      grades: DEMO_GRADES,
      attendance: DEMO_ATTENDANCE,
      practiceExams: DEMO_PRACTICE_EXAMS,
      poems: DEMO_POEMS,
      quizAttempts: DEMO_QUIZ_ATTEMPTS,
      mathAttempts: DEMO_MATH_ATTEMPTS,
      aiConversations: [],
    });
    notify('info', 'Demo verileri sıfırlandı', 'Ortaokul başlangıç örnek kayıtları geri yüklendi.');
  }, [notify]);

  const openAssistantForModule = useCallback((moduleLabel: string) => {
    setAssistantInitialContext(moduleLabel);
    setActiveModule('ai-assistant');
  }, []);

  const value = useMemo<AcademyContextValue>(
    () => ({
      activeModule,
      setActiveModule,
      assistantInitialContext,
      openAssistantForModule,
      user,
      profile,
      authLoading,
      isDemoMode,
      signInWithGoogle,
      signOutUser,
      updateProfileInfo,
      theme,
      setTheme,
      toggleTheme,
      workspaceView,
      setWorkspaceView,
      compactMode,
      setCompactMode,
      classes: isDemoMode ? demoStore.classes : cloudClasses,
      students: isDemoMode ? demoStore.students : cloudStudents,
      grades: isDemoMode ? demoStore.grades : cloudGrades,
      attendance: isDemoMode ? demoStore.attendance : cloudAttendance,
      practiceExams: isDemoMode ? demoStore.practiceExams : cloudPracticeExams,
      poems: isDemoMode ? demoStore.poems : cloudPoems,
      quizAttempts: isDemoMode ? demoStore.quizAttempts : cloudQuizAttempts,
      mathAttempts: isDemoMode ? demoStore.mathAttempts : cloudMathAttempts,
      aiConversations: isDemoMode ? demoStore.aiConversations : cloudAIConversations,
      dataLoading,
      addClass,
      updateClass,
      deleteClass,
      addStudent,
      updateStudent,
      deleteStudent,
      addGrade,
      updateGrade,
      deleteGrade,
      addAttendance,
      deleteAttendance,
      addPracticeExam,
      deletePracticeExam,
      addPoem,
      updatePoem,
      deletePoem,
      recordQuizAttempt,
      recordMathAttempt,
      saveAIConversationSummary,
      seedDemoToFirestore,
      resetDemoData,
      toasts,
      notify,
      dismissToast,
    }),
    [
      activeModule,
      addAttendance,
      addClass,
      addGrade,
      addPoem,
      addPracticeExam,
      addStudent,
      assistantInitialContext,
      authLoading,
      cloudAIConversations,
      cloudAttendance,
      cloudClasses,
      cloudGrades,
      cloudMathAttempts,
      cloudPoems,
      cloudPracticeExams,
      cloudQuizAttempts,
      cloudStudents,
      compactMode,
      dataLoading,
      deleteAttendance,
      deleteClass,
      deleteGrade,
      deletePoem,
      deletePracticeExam,
      deleteStudent,
      demoStore,
      dismissToast,
      isDemoMode,
      notify,
      openAssistantForModule,
      profile,
      recordMathAttempt,
      recordQuizAttempt,
      resetDemoData,
      saveAIConversationSummary,
      seedDemoToFirestore,
      setCompactMode,
      setTheme,
      setWorkspaceView,
      signInWithGoogle,
      signOutUser,
      theme,
      toasts,
      toggleTheme,
      updateClass,
      updateGrade,
      updatePoem,
      updateProfileInfo,
      updateStudent,
      user,
      workspaceView,
    ]
  );

  return <AcademyContext.Provider value={value}>{children}</AcademyContext.Provider>;
}

export function useAcademy(): AcademyContextValue {
  const ctx = useContext(AcademyContext);
  if (!ctx) {
    throw new Error('useAcademy yalnızca AcademyProvider içinde kullanılabilir.');
  }
  return ctx;
}
