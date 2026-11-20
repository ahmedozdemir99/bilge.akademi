import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Bot,
  Calculator,
  Database,
  Download,
  Edit3,
  FolderPlus,
  Loader2,
  Plus,
  Printer,
  Search,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAcademy } from '../../context/AcademyContext';
import type {
  ClassAIAnalysis,
  ExamType,
  Grade,
  SchoolClass,
  Student,
} from '../../types/academy';
import {
  calculateAttendanceSummary,
  calculateAverageScore,
  calculateSubjectAverages,
  calculateTrialRobotSummary,
  exportToCsv,
  formatTurkishDate,
  triggerPrintReport,
} from '../../utils/exportUtils';
import { ConfirmDialog } from '../ui/Modal';
import { PracticeExamRobotPanel } from './student-tracking/PracticeExamRobotPanel';
import {
  ClassFormModal,
  GradeFormModal,
  StudentFormModal,
} from './student-tracking/StudentForms';
import { normalizeSearchText } from '../../utils/searchText';
import { classChartColors, getSubjectColor } from '../../utils/subjectColors';
import { summarizePracticeForAnalysis } from '../../utils/practiceAnalysis';
import { BulkRecordsPanel } from './student-tracking/BulkRecordsPanel';
import { StudentProfileView } from './student-tracking/StudentProfileView';

type TrackingTab = 'students' | 'grades' | 'trials' | 'analytics' | 'bulk';

export function StudentTrackingModule() {
  const {
    classes,
    students,
    grades,
    practiceExams,
    attendance,
    isDemoMode,
    workspaceView,
    compactMode,
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
    addPracticeExam,
    deletePracticeExam,
    seedDemoToFirestore,
  } = useAcademy();

  const [activeTab, setActiveTab] = useState<TrackingTab>('students');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [examTypeFilter, setExamTypeFilter] = useState<'all' | ExamType>('all');
  const [analyticsClassId, setAnalyticsClassId] = useState<string>('all');

  // Modals
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  } | null>(null);

  // Class AI analysis state
  const [classAI, setClassAI] = useState<ClassAIAnalysis | null>(null);
  const [classAILoading, setClassAILoading] = useState(false);
  const [classAIError, setClassAIError] = useState('');
  const [seeding, setSeeding] = useState(false);

  const classMap = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);
  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);

  const selectedStudent = selectedStudentId ? studentMap.get(selectedStudentId) ?? null : null;

  // Derived lists
  const filteredStudents = useMemo(() => {
    const q = normalizeSearchText(searchQuery);
    return students.filter((s) => {
      if (classFilter !== 'all' && s.classId !== classFilter) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (q) {
        const clsName = normalizeSearchText(classMap.get(s.classId)?.name ?? '');
        const match =
          normalizeSearchText(s.fullName).includes(q) ||
          normalizeSearchText(s.studentNumber).includes(q) ||
          clsName.includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [classFilter, classMap, searchQuery, statusFilter, students]);

  const uniqueSubjects = useMemo(() => {
    const set = new Set(grades.map((g) => g.subjectName));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [grades]);

  const filteredGrades = useMemo(() => {
    return grades.filter((g) => {
      if (classFilter !== 'all' && g.classId !== classFilter) return false;
      if (subjectFilter !== 'all' && g.subjectName !== subjectFilter) return false;
      if (examTypeFilter !== 'all' && g.examType !== examTypeFilter) return false;
      return true;
    });
  }, [classFilter, examTypeFilter, grades, subjectFilter]);

  // Analytics calculations
  const analyticsGrades = useMemo(
    () => (analyticsClassId === 'all' ? grades : grades.filter((g) => g.classId === analyticsClassId)),
    [analyticsClassId, grades]
  );
  const analyticsPracticeExams = useMemo(
    () =>
      analyticsClassId === 'all'
        ? practiceExams
        : practiceExams.filter((p) => p.classId === analyticsClassId),
    [analyticsClassId, practiceExams]
  );
  const analyticsStudents = useMemo(
    () =>
      analyticsClassId === 'all'
        ? students
        : students.filter((s) => s.classId === analyticsClassId),
    [analyticsClassId, students]
  );

  const classPracticeAnalysis = useMemo(() => summarizePracticeForAnalysis(analyticsPracticeExams), [analyticsPracticeExams]);
  const analyticsSubjectBreakdown = useMemo(
    () => calculateSubjectAverages(analyticsGrades),
    [analyticsGrades]
  );
  const classComparisonData = useMemo(() => {
    return classes.map((cls, index) => {
      const clsGrades = grades.filter((g) => g.classId === cls.id);
      const clsStudents = students.filter((s) => s.classId === cls.id);
      return {
        id: cls.id,
        name: cls.name,
        color: classChartColors[index % classChartColors.length],
        average: calculateAverageScore(clsGrades),
        studentCount: clsStudents.length,
        examCount: clsGrades.length,
      };
    });
  }, [classes, grades, students]);

  // Student Role View: privacy-safe personal view
  if (workspaceView === 'student') {
    const personalStudent = students[0];
    if (!personalStudent) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
          <Users className="w-8 h-8 text-teal-600 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-navy-900 dark:text-white">
            Kişisel Akademik Dosya Bulunamadı
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Öğrenci görünümünde yalnızca kendi akademik gelişiminiz görüntülenir. Öğretmen
            görünümüne geçerek sınıf ve öğrenci kayıtları oluşturabilirsiniz.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3.5 text-xs text-slate-600 dark:text-slate-300">
          <strong>Öğrenci Görünümü:</strong> Diğer öğrencilerin kayıtları gizlidir. Yalnızca
          kendi notlarınız, LGS deneme netleriniz ve yapay zekâ çalışma önerileriniz gösterilir.
        </div>
        <StudentProfileView
          student={personalStudent}
          schoolClass={classMap.get(personalStudent.classId)}
          grades={grades.filter((g) => g.studentId === personalStudent.id)}
          practiceExams={practiceExams.filter((p) => p.studentId === personalStudent.id)}
          attendance={attendance.filter((item) => item.studentId === personalStudent.id)}
          readOnly
        />
      </div>
    );
  }

  // Individual Student Profile View (Teacher Mode)
  if (selectedStudent) {
    return (
      <>
        <StudentProfileView
          key={selectedStudent.id}
          student={selectedStudent}
          schoolClass={classMap.get(selectedStudent.classId)}
          grades={grades.filter((g) => g.studentId === selectedStudent.id)}
          practiceExams={practiceExams.filter((p) => p.studentId === selectedStudent.id)}
          attendance={attendance.filter((item) => item.studentId === selectedStudent.id)}
          onBack={() => setSelectedStudentId(null)}
          onEditStudent={() => {
            setEditingStudent(selectedStudent);
            setStudentModalOpen(true);
          }}
          onAddGrade={() => {
            setEditingGrade(null);
            setGradeModalOpen(true);
          }}
          onEditGrade={(g) => {
            setEditingGrade(g);
            setGradeModalOpen(true);
          }}
          onDeleteGrade={(g) =>
            setConfirmState({
              open: true,
              title: 'Notu Sil',
              message: `${g.subjectName} — ${g.examTitle} (${g.score}/${g.maxScore}) not kaydını silmek istediğinize emin misiniz?`,
              action: async () => {
                await deleteGrade(g.id);
              },
            })
          }
          onDeletePracticeExam={(exam) =>
            setConfirmState({
              open: true,
              title: 'Deneme Kaydını Sil',
              message: `${exam.examTitle} (${exam.totalNet.toFixed(2)} net) kaydını silmek istediğinize emin misiniz?`,
              action: async () => {
                await deletePracticeExam(exam.id);
              },
            })
          }
        />

        <StudentFormModal
          open={studentModalOpen}
          onClose={() => setStudentModalOpen(false)}
          editingStudent={editingStudent}
          classes={classes}
          onSubmit={async (data) => {
            if (editingStudent) await updateStudent(editingStudent.id, data);
          }}
        />
        <GradeFormModal
          open={gradeModalOpen}
          onClose={() => setGradeModalOpen(false)}
          editingGrade={editingGrade}
          students={students}
          lockedStudentId={selectedStudent.id}
          onSubmit={async (data) => {
            if (editingGrade) {
              const { studentId: _ignored, ...rest } = data;
              await updateGrade(editingGrade.id, rest);
            } else {
              await addGrade(data);
            }
          }}
        />
        {confirmState && (
          <ConfirmDialog
            open={confirmState.open}
            onClose={() => setConfirmState(null)}
            onConfirm={async () => {
              await confirmState.action();
              setConfirmState(null);
            }}
            title={confirmState.title}
            message={confirmState.message}
          />
        )}
      </>
    );
  }

  const handleRunClassAI = async () => {
    setClassAILoading(true);
    setClassAIError('');
    setClassAI(null);
    const targetClass = analyticsClassId === 'all' ? null : classMap.get(analyticsClassId);
    try {
      const response = await fetch('/api/ai/class-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: targetClass ? 'Seçilen şube' : 'Tüm Ortaokul Sınıfları Geneli',
          gradeLevel: targetClass ? targetClass.gradeLevel : 8,
          studentCount: analyticsStudents.length,
          overallAverage: calculateAverageScore(analyticsGrades),
          subjectBreakdown: analyticsSubjectBreakdown.map((s) => ({
            subject: s.subject,
            average: s.average,
            examCount: s.count,
          })),
          gradeCount: analyticsGrades.length,
          practiceExamSummary: classPracticeAnalysis,
          attendanceTotals: calculateAttendanceSummary(analyticsClassId === 'all'
            ? attendance
            : attendance.filter((item) => item.classId === analyticsClassId)),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setClassAIError(data.error || 'Sınıf analizi oluşturulamadı.');
        return;
      }
      setClassAI(data.analysis as ClassAIAnalysis);
    } catch {
      setClassAIError('Yapay zekâ servisine ulaşılamadı. Lütfen tekrar deneyin.');
    } finally {
      setClassAILoading(false);
    }
  };

  const handleExportStudentsCsv = () => {
    exportToCsv(
      'bilge_akademi_ogrenciler',
      ['Okul No', 'Ad Soyad', 'Sınıf', 'Seviye', 'Not Ort.', 'Deneme Sayısı', 'Deneme Ort. Net', 'Durum'],
      filteredStudents.map((stu) => {
        const sGrades = grades.filter((g) => g.studentId === stu.id);
        const sTrials = calculateTrialRobotSummary(
          practiceExams.filter((p) => p.studentId === stu.id)
        );
        return [
          stu.studentNumber,
          stu.fullName,
          classMap.get(stu.classId)?.name ?? '-',
          `${stu.gradeLevel}. Sınıf`,
          sGrades.length > 0 ? calculateAverageScore(sGrades) : '-',
          sTrials.examCount,
          sTrials.examCount > 0 ? sTrials.avgTotalNet : '-',
          stu.status === 'active' ? 'Aktif' : 'Pasif',
        ];
      })
    );
  };

  const handleExportGradesCsv = () => {
    exportToCsv(
      'bilge_akademi_sinav_notlari',
      ['Tarih', 'Öğrenci', 'Okul No', 'Sınıf', 'Ders', 'Değerlendirme', 'Tür', 'Puan', 'Tam Puan'],
      filteredGrades.map((g) => {
        const stu = studentMap.get(g.studentId);
        return [
          formatTurkishDate(g.examDate),
          stu?.fullName ?? '-',
          stu?.studentNumber ?? '-',
          classMap.get(g.classId)?.name ?? '-',
          g.subjectName,
          g.examTitle,
          g.examType,
          g.score,
          g.maxScore,
        ];
      })
    );
  };

  const rowPad = compactMode ? 'py-2.5' : 'py-3.5';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
            Modül 01 · {isDemoMode ? 'Demo Modu (Örnek Veri)' : 'Firebase Bulut Kayıtları'}
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-navy-900 dark:text-white tracking-tight">
            Öğrenci Takip ve Analiz Sistemi
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Ortaokul (5–8. Sınıf &amp; LGS) sınıflarını, öğrenci notlarını, ders ders deneme doğru-yanlış-net
            hesaplama robotunu ve yapay zekâ analizlerini yönetin.
          </p>
        </div>

        <div role="group" aria-label="Öğrenci takip işlemleri" className="control-grid gap-2 no-print">
          <button
            type="button"
            onClick={() => {
              setEditingClass(null);
              setClassModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            <FolderPlus className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Sınıf Ekle</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingStudent(null);
              setStudentModalOpen(true);
            }}
            disabled={classes.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Öğrenci Ekle</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingGrade(null);
              setGradeModalOpen(true);
            }}
            disabled={students.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
            <span>Not Gir</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trials')}
            disabled={students.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-gold-500 text-navy-950 hover:bg-gold-400 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Deneme Net Robotu</span>
          </button>
        </div>
      </div>

      {/* Empty Cloud Account Prompt */}
      {!isDemoMode && !dataLoading && classes.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-navy-900 dark:text-white">
              Bulut Hesabınız Hazır — İlk Sınıfınızı Oluşturun
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              İsterseniz sıfırdan kendi sınıflarınızı oluşturabilir veya sistemi hızlıca test etmek
              için örnek sınıfları Firestore hesabınıza yükleyebilirsiniz.
            </p>
          </div>
          <button
            type="button"
            disabled={seeding}
            onClick={async () => {
              setSeeding(true);
              try {
                await seedDemoToFirestore();
              } finally {
                setSeeding(false);
              }
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg bg-gold-500 text-navy-950 hover:bg-gold-400 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            <span>{seeding ? 'Yükleniyor...' : 'Örnek Verileri Hesabıma Yükle'}</span>
          </button>
        </div>
      )}

      {/* Segmented Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div
          className="control-grid gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          role="tablist"
          aria-label="Öğrenci Takip Sekmeleri"
        >
          {(
            [
              { id: 'students', label: `Öğrenciler ve Sınıflar (${students.length})` },
              { id: 'trials', label: `Deneme & Net Robotu (${practiceExams.length})` },
              { id: 'grades', label: `Notlar (${grades.length})` },
              { id: 'analytics', label: 'Sınıf Analizi ve Raporlar' },
              { id: 'bulk', label: 'Toplu Giriş' },
            ] as { id: TrackingTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-navy-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: STUDENTS & CLASSES */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Classes Strip */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-navy-900 dark:text-white">
                Sınıflar ve Şubeler ({classes.length})
              </h2>
            </div>

            {classes.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-sm text-slate-500 dark:text-slate-400">
                Henüz sınıf oluşturulmadı. Başlamak için yukarıdaki “Sınıf Ekle” butonunu kullanın.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {classes.map((cls) => {
                  const clsStudents = students.filter((s) => s.classId === cls.id);
                  const clsGrades = grades.filter((g) => g.classId === cls.id);
                  const clsAvg = calculateAverageScore(clsGrades);
                  const isFiltered = classFilter === cls.id;

                  return (
                    <div
                      key={cls.id}
                      className={`bg-white dark:bg-slate-900 border rounded-xl p-5 transition-colors ${
                        isFiltered
                          ? 'border-teal-600 dark:border-teal-400'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setClassFilter(isFiltered ? 'all' : cls.id)}
                          className="text-left min-w-0 cursor-pointer"
                        >
                          <h3 className="text-base font-semibold text-navy-900 dark:text-white truncate">
                            {cls.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {cls.gradeLevel}. Sınıf · Şube {cls.section} · {cls.academicYear}
                          </p>
                        </button>
                        <div className="flex items-center gap-1 shrink-0 no-print">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingClass(cls);
                              setClassModalOpen(true);
                            }}
                            aria-label={`${cls.name} sınıfını düzenle`}
                            className="p-1.5 rounded-md text-slate-400 hover:text-navy-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmState({
                                open: true,
                                title: 'Sınıfı Sil',
                                message: `${cls.name} sınıfını silmek istediğinize emin misiniz?`,
                                action: async () => {
                                  await deleteClass(cls.id);
                                  if (classFilter === cls.id) setClassFilter('all');
                                },
                              })
                            }
                            aria-label={`${cls.name} sınıfını sil`}
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 tabular-nums">
                        <span>{clsStudents.length} öğrenci</span>
                        <span>
                          Ortalama:{' '}
                          <strong className="font-mono text-navy-900 dark:text-white">
                            {clsGrades.length > 0 ? clsAvg.toFixed(1) : '—'}
                          </strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Student Filter Toolbar + Data Table */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
              <div className="flex flex-1 flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px] max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Öğrenci adı, numara veya sınıf ara..."
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-teal-600 focus:outline-none"
                  />
                </div>

                <select
                  aria-label="Sınıfa göre filtrele"
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200"
                >
                  <option value="all">Tüm Sınıflar</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Duruma göre filtrele"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                </select>
              </div>

              <div className="control-grid gap-2 sm:max-w-80">
                <button
                  type="button"
                  onClick={handleExportStudentsCsv}
                  disabled={filteredStudents.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel / CSV</span>
                </button>
                <button
                  type="button"
                  onClick={triggerPrintReport}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Yazdır</span>
                </button>
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Arama veya filtre kriterlerine uyan öğrenci bulunamadı.
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Filtreleri temizleyebilir veya yeni öğrenci kaydı oluşturabilirsiniz.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                      <th className="py-3 px-4 font-medium">No</th>
                      <th className="py-3 px-4 font-medium">Öğrenci</th>
                      <th className="py-3 px-4 font-medium">Sınıf</th>
                      <th className="py-3 px-4 font-medium text-right">Not Ort.</th>
                      <th className="py-3 px-4 font-medium text-right">Deneme Ort. Net</th>
                      <th className="py-3 px-4 font-medium">Durum</th>
                      <th className="py-3 px-4 font-medium text-right no-print">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                    {filteredStudents.map((stu) => {
                      const sGrades = grades.filter((g) => g.studentId === stu.id);
                      const sAvg = calculateAverageScore(sGrades);
                      const sTrial = calculateTrialRobotSummary(
                        practiceExams.filter((p) => p.studentId === stu.id)
                      );
                      const cls = classMap.get(stu.classId);

                      return (
                        <tr
                          key={stu.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className={`${rowPad} px-4 font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums`}>
                            {stu.studentNumber}
                          </td>
                          <td className={`${rowPad} px-4`}>
                            <button
                              type="button"
                              onClick={() => setSelectedStudentId(stu.id)}
                              className="text-left font-medium text-navy-900 dark:text-white hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
                            >
                              {stu.fullName}
                            </button>
                          </td>
                          <td className={`${rowPad} px-4 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap`}>
                            {cls?.name ?? `${stu.gradeLevel}. Sınıf`}
                          </td>
                          <td className={`${rowPad} px-4 text-right font-mono font-semibold tabular-nums text-navy-900 dark:text-white`}>
                            {sGrades.length > 0 ? sAvg.toFixed(1) : '—'}
                          </td>
                          <td className={`${rowPad} px-4 text-right font-mono text-xs tabular-nums text-teal-700 dark:text-teal-400 font-semibold`}>
                            {sTrial.examCount > 0 ? `${sTrial.avgTotalNet.toFixed(2)} net` : '—'}
                          </td>
                          <td className={`${rowPad} px-4 text-xs whitespace-nowrap`}>
                            <span
                              className={
                                stu.status === 'active'
                                  ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                                  : 'text-slate-500 dark:text-slate-400'
                              }
                            >
                              {stu.status === 'active' ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td className={`${rowPad} px-4 text-right whitespace-nowrap no-print`}>
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedStudentId(stu.id)}
                                className="px-2.5 py-1.5 text-xs font-medium rounded-md text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors cursor-pointer"
                              >
                                Profili Aç
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingStudent(stu);
                                  setStudentModalOpen(true);
                                }}
                                aria-label={`${stu.fullName} düzenle`}
                                className="p-1.5 rounded-md text-slate-400 hover:text-navy-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmState({
                                    open: true,
                                    title: 'Öğrenciyi Sil',
                                    message: `${stu.fullName} (No: ${stu.studentNumber}) kaydını silmek istediğinize emin misiniz?`,
                                    action: async () => {
                                      await deleteStudent(stu.id);
                                    },
                                  })
                                }
                                aria-label={`${stu.fullName} sil`}
                                className="p-1.5 rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 2: GRADES & EXAMS */}
      {activeTab === 'grades' && (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                aria-label="Sınıf filtresi"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200"
              >
                <option value="all">Tüm Sınıflar</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                aria-label="Ders filtresi"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200"
              >
                <option value="all">Tüm Dersler</option>
                {uniqueSubjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                aria-label="Not türü filtresi"
                value={examTypeFilter}
                onChange={(e) => setExamTypeFilter(e.target.value as 'all' | ExamType)}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200"
              >
                <option value="all">Tüm Not Türleri</option>
                <option value="Yazılı">Yazılı</option>
                <option value="Deneme">Deneme</option>
                <option value="Sözlü">Sözlü</option>
                <option value="Proje">Proje</option>
                <option value="Performans">Performans</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                Seçili Ortalama: {calculateAverageScore(filteredGrades).toFixed(1)}
              </span>
              <button
                type="button"
                onClick={handleExportGradesCsv}
                disabled={filteredGrades.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV İndir</span>
              </button>
            </div>
          </div>

          {filteredGrades.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
              Seçili ölçütlere uygun not bulunmuyor.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4 font-medium">Tarih</th>
                    <th className="py-3 px-4 font-medium">Öğrenci</th>
                    <th className="py-3 px-4 font-medium">Sınıf</th>
                    <th className="py-3 px-4 font-medium">Ders / Değerlendirme</th>
                    <th className="py-3 px-4 font-medium">Tür</th>
                    <th className="py-3 px-4 font-medium text-right">Puan</th>
                    <th className="py-3 px-4 font-medium text-right no-print">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {filteredGrades.map((g) => {
                    const stu = studentMap.get(g.studentId);
                    const cls = classMap.get(g.classId);
                    return (
                      <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className={`${rowPad} px-4 font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap`}>
                          {formatTurkishDate(g.examDate)}
                        </td>
                        <td className={`${rowPad} px-4`}>
                          <button
                            type="button"
                            onClick={() => stu && setSelectedStudentId(stu.id)}
                            className="font-medium text-navy-900 dark:text-white hover:text-teal-700 dark:hover:text-teal-400 cursor-pointer"
                          >
                            {stu?.fullName ?? 'Bilinmeyen Öğrenci'}
                          </button>
                        </td>
                        <td className={`${rowPad} px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap`}>
                          {cls?.name ?? '—'}
                        </td>
                        <td className={`${rowPad} px-4`}>
                          <p className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
                            <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: getSubjectColor(g.subjectName) }} />
                            {g.subjectName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{g.examTitle}</p>
                        </td>
                        <td className={`${rowPad} px-4 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap`}>
                          {g.examType}
                        </td>
                        <td className={`${rowPad} px-4 text-right font-mono font-semibold tabular-nums text-navy-900 dark:text-white`}>
                          {g.score}/{g.maxScore}
                        </td>
                        <td className={`${rowPad} px-4 text-right whitespace-nowrap no-print`}>
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingGrade(g);
                                setGradeModalOpen(true);
                              }}
                              aria-label="Notu düzenle"
                              className="p-1.5 rounded-md text-slate-400 hover:text-navy-900 dark:hover:text-white cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmState({
                                  open: true,
                                  title: 'Notu Sil',
                                  message: `${stu?.fullName ?? ''} — ${g.subjectName} (${g.score}/${g.maxScore}) kaydını silmek istiyor musunuz?`,
                                  action: async () => {
                                    await deleteGrade(g.id);
                                  },
                                })
                              }
                              aria-label="Notu sil"
                              className="p-1.5 rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* TAB 3: PRACTICE EXAMS & NET ROBOT */}
      {activeTab === 'trials' && (
        <PracticeExamRobotPanel
          students={students}
          classes={classes}
          practiceExams={practiceExams}
          onAddPracticeExam={addPracticeExam}
          onDeletePracticeExam={(exam) =>
            setConfirmState({
              open: true,
              title: 'Deneme Kaydını Sil',
              message: `${studentMap.get(exam.studentId)?.fullName ?? ''} — ${exam.examTitle} (${exam.totalNet.toFixed(2)} net) kaydını silmek istiyor musunuz?`,
              action: async () => {
                await deletePracticeExam(exam.id);
              },
            })
          }
        />
      )}

      {activeTab === 'bulk' && (
        <BulkRecordsPanel
          initialMode="roster"
          onClassAnalysis={(id) => {
            setAnalyticsClassId(id);
            setClassAI(null);
            setClassAIError('');
            setActiveTab('analytics');
          }}
          onStudents={(id) => {
            setClassFilter(id);
            setSearchQuery('');
            setStatusFilter('all');
            setActiveTab('students');
          }}
        />
      )}

      {/* TAB 4: CLASS ANALYTICS & AI RECOMMENDATIONS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 no-print">
            <div className="flex items-center gap-3">
              <label htmlFor="analytics-cls" className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Analiz Kapsamı:
              </label>
              <select
                id="analytics-cls"
                value={analyticsClassId}
                onChange={(e) => {
                  setAnalyticsClassId(e.target.value);
                  setClassAI(null);
                  setClassAIError('');
                }}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
              >
                <option value="all">Tüm Sınıflar Geneli</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="control-grid gap-2 sm:max-w-sm">
              <button
                type="button"
                onClick={() => void handleRunClassAI()}
                disabled={classAILoading || (analyticsGrades.length === 0 && analyticsPracticeExams.length === 0)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 disabled:opacity-60 cursor-pointer whitespace-nowrap"
              >
                {classAILoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                <span>{classAILoading ? 'Analiz Ediliyor...' : 'Yapay Zekâ Sınıf Önerisi Al'}</span>
              </button>
              <button
                type="button"
                onClick={triggerPrintReport}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PDF / Yazdır</span>
              </button>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
              <h3 className="text-base font-semibold text-navy-900 dark:text-white">
                Ders Bazında Başarı Ortalaması
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-5">
                Seçili sınıf veya kurum geneli ders puanları
              </p>
              <div className="h-64 w-full">
                {analyticsSubjectBreakdown.length === 0 ? (
                  <p className="text-sm text-slate-500 py-10 text-center">Grafik için kayıtlı not bulunmuyor.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsSubjectBreakdown} margin={{ top: 8, right: 12, left: -16, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} />
                      <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip formatter={(val) => [`${val ?? 0} puan`, 'Ortalama']} />
                      <Bar dataKey="average" radius={[6, 6, 0, 0]} maxBarSize={44}>
                        {analyticsSubjectBreakdown.map(({ subject }) => (
                          <Cell key={subject} fill={getSubjectColor(subject)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
              <h3 className="text-base font-semibold text-navy-900 dark:text-white">
                Sınıflar Arası Ortalama Karşılaştırması
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-5">
                Şube bazında genel başarı puanları
              </p>
              <div className="h-64 w-full">
                {classComparisonData.length === 0 ? (
                  <p className="text-sm text-slate-500 py-10 text-center">Sınıf verisi bulunmuyor.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classComparisonData} margin={{ top: 8, right: 12, left: -16, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip formatter={(val) => [`${val ?? 0} puan`, 'Sınıf Ortalaması']} />
                      <Bar dataKey="average" radius={[6, 6, 0, 0]} maxBarSize={48}>
                        {classComparisonData.map(({ id, color }) => <Cell key={id} fill={color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {classPracticeAnalysis.examCount > 0 && (
            <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold text-navy-900 dark:text-white">Sınıfın Deneme Özeti</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {classPracticeAnalysis.examCount} sonuç · Ortalama {classPracticeAnalysis.avgTotalNet.toLocaleString('tr-TR')} net
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
                {classPracticeAnalysis.subjects.map(({ label, avgNet, maxQuestions }) => (
                  <div key={label} className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-800"
                    style={{ borderTop: '3px solid ' + getSubjectColor(label) }}>
                    <dt className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</dt>
                    <dd className="text-sm font-semibold tabular-nums">{avgNet.toLocaleString('tr-TR')} net / {maxQuestions} soru</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Class AI Result */}
          {classAIError && (
            <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{classAIError}</span>
            </div>
          )}

          {classAI && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
              <div>
                <h3 className="text-base font-semibold text-navy-900 dark:text-white">
                  Yapay Zekâ Sınıf Gelişim Raporu
                </h3>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {classAI.overview}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-2">
                    Güçlü Ders Alanları
                  </h4>
                  <ul className="list-disc pl-4 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                    {classAI.strongSubjects.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">
                    Desteklenmesi Gereken Dersler
                  </h4>
                  <ul className="list-disc pl-4 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                    {classAI.focusSubjects.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-semibold text-navy-900 dark:text-gold-400 mb-2">
                    Öğretmen İçin Sınıf İçi Stratejiler
                  </h4>
                  <ul className="list-disc pl-4 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                    {classAI.teachingStrategies.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                <strong>Not:</strong> {classAI.disclaimer}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ClassFormModal
        open={classModalOpen}
        onClose={() => setClassModalOpen(false)}
        editingClass={editingClass}
        onSubmit={async (data) => {
          if (editingClass) await updateClass(editingClass.id, data);
          else await addClass(data);
        }}
      />

      <StudentFormModal
        open={studentModalOpen}
        onClose={() => setStudentModalOpen(false)}
        editingStudent={editingStudent}
        classes={classes}
        defaultClassId={classFilter !== 'all' ? classFilter : undefined}
        onSubmit={async (data) => {
          if (editingStudent) await updateStudent(editingStudent.id, data);
          else await addStudent(data);
        }}
      />

      <GradeFormModal
        open={gradeModalOpen}
        onClose={() => setGradeModalOpen(false)}
        editingGrade={editingGrade}
        students={students}
        onSubmit={async (data) => {
          if (editingGrade) {
            const { studentId: _ignored, ...rest } = data;
            await updateGrade(editingGrade.id, rest);
          } else {
            await addGrade(data);
          }
        }}
      />

      {confirmState && (
        <ConfirmDialog
          open={confirmState.open}
          onClose={() => setConfirmState(null)}
          onConfirm={async () => {
            await confirmState.action();
            setConfirmState(null);
          }}
          title={confirmState.title}
          message={confirmState.message}
        />
      )}
    </div>
  );
}
