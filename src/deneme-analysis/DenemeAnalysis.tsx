import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FileUp,
  GraduationCap,
  Users,
  BarChart3,
  FolderArchive,
  Trophy,
  AlertCircle,
  X,
} from 'lucide-react';
import { ExamArchiveState, ParsedExamBundle, StudentExamRecord } from './types/exam';
import {
  addManualExamToStudent,
  deleteExamFromState,
  EMPTY_ARCHIVE_STATE,
  loadArchiveState,
  mergeExamBundle,
  renameExamInState,
  saveArchiveState,
} from './utils/storage';
import { LeaderboardView } from './components/LeaderboardView';
import { StudentCardsView } from './components/StudentCardsView';
import { StudentDetailView } from './components/StudentDetailView';
import { OverviewView } from './components/OverviewView';
import { ExamArchiveView } from './components/ExamArchiveView';
import { SchoolWeaknessView } from './components/SchoolWeaknessView';
import { UploadModal } from './components/UploadModal';
import { useAcademy } from '../context/AcademyContext';
import { useCloudBackup } from './hooks/useCloudBackup';
import { mergeArchives } from './utils/cloudBackup';
import { sampleBundles } from './utils/sampleArchive';
import './styles.css';

type NavTab = 'students' | 'leaderboard' | 'overview' | 'archive' | 'weaknesses';

export default function DenemeAnalysis({ owner, demo = false }: { owner: string; demo?: boolean }) {
  const section = useRef<HTMLElement>(null);
  const { user, setSignInOpen, signOutUser } = useAcademy();
  const [archive, setArchive] = useState<ExamArchiveState>(() => {
    return loadArchiveState(owner) ?? (demo
      ? sampleBundles.reduce((current, bundle) => mergeExamBundle(current, bundle).nextState, EMPTY_ARCHIVE_STATE)
      : EMPTY_ARCHIVE_STATE);
  });
  const [activeTab, setActiveTab] = useState<NavTab>('students');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [bannerMessage, setBannerMessage] = useState<{
    type: 'info' | 'error';
    text: string;
  } | null>(null);

  const persistAndSet = useCallback((next: ExamArchiveState) => {
    setArchive(next);
    const saved = saveArchiveState(owner, next);
    if (!saved.ok && saved.error) {
      setBannerMessage({ type: 'error', text: saved.error });
    }
  }, [owner]);

  const cloud = useCloudBackup(user, archive, persistAndSet);
  const { markDirty } = cloud;

  const changeArchive = useCallback((next: ExamArchiveState) => {
    markDirty();
    persistAndSet(next);
  }, [markDirty, persistAndSet]);

  const loadSample = useCallback(() => {
    const missing = sampleBundles.filter(({ examMeta }) => !archive.exams.some(({ id }) => id === examMeta.id));
    if (!missing.length) {
      setBannerMessage({ type: 'info', text: 'Örnek denemeler zaten açık.' });
      return;
    }
    const next = missing.reduce((current, bundle) => mergeExamBundle(current, bundle).nextState, archive);
    persistAndSet(next);
  }, [archive, persistAndSet]);

  const nextExamOrder = useMemo(() => {
    if (archive.exams.length === 0) return 1;
    return Math.max(...archive.exams.map((e) => e.examOrder)) + 1;
  }, [archive.exams]);

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return archive.students.find((s) => s.id === selectedStudentId) ?? null;
  }, [archive.students, selectedStudentId]);

  const handleBundlesParsed = useCallback(
    (bundles: ParsedExamBundle[]) => {
      let current = archive;
      let totalRecords = 0;
      let totalMatched = 0;
      let totalNew = 0;

      for (const b of bundles) {
        const res = mergeExamBundle(current, b);
        current = res.nextState;
        totalRecords += b.records.length;
        totalMatched += res.matchedCount;
        totalNew += res.newStudentsCount;
      }

      changeArchive(current);
      setSelectedStudentId(null);
      setActiveTab('students');
      setBannerMessage({
        type: 'info',
        text: `${bundles.length} deneme arşive eklendi. ${totalRecords} sonuç işlendi, ${totalMatched} öğrenci eşleşti ve ${totalNew} yeni kart açıldı.`,
      });
      section.current?.scrollIntoView({ block: 'start' });
    },
    [archive, changeArchive]
  );

  const handleDeleteExam = useCallback(
    (examId: string) => {
      const next = deleteExamFromState(archive, examId);
      changeArchive(next);
      if (selectedStudentId && !next.students.some((s) => s.id === selectedStudentId)) {
        setSelectedStudentId(null);
      }
    },
    [archive, changeArchive, selectedStudentId]
  );

  const handleRenameExam = useCallback(
    (examId: string, newName: string) => {
      const next = renameExamInState(archive, examId, newName);
      changeArchive(next);
    },
    [archive, changeArchive]
  );

  const handleAddManualExam = useCallback(
    (studentId: string, record: StudentExamRecord) => {
      const next = addManualExamToStudent(archive, studentId, record);
      changeArchive(next);
      setBannerMessage({
        type: 'info',
        text: `"${record.examName}" denemesi öğrenci arşivine eklendi ve karşılaştırmalar güncellendi.`,
      });
    },
    [archive, changeArchive]
  );

  const handleImportJson = useCallback(
    (imported: ExamArchiveState) => {
      changeArchive(mergeArchives(archive, imported));
      setSelectedStudentId(null);
      setBannerMessage({
        type: 'info',
        text: `Yedek mevcut arşivle birleştirildi (${imported.exams.length} deneme, ${imported.students.length} öğrenci).`,
      });
    },
    [archive, changeArchive]
  );

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveTab('students');
    section.current?.scrollIntoView({ block: 'start' });
  };

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'students', label: 'Öğrenci Kartları', icon: <Users className="h-4 w-4" /> },
    { id: 'leaderboard', label: 'Sıralama', icon: <Trophy className="h-4 w-4" /> },
    { id: 'overview', label: 'Genel Bakış', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'archive', label: 'Deneme Arşivi', icon: <FolderArchive className="h-4 w-4" /> },
    { id: 'weaknesses', label: 'Eksik Analizi', icon: <AlertCircle className="h-4 w-4" /> },
  ];

  return (
    <section ref={section} aria-labelledby="embedded-deneme-title" className="deneme-analysis flex w-full min-w-0 scroll-mt-24 flex-col gap-5">
      <div className="no-print space-y-3 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-teal-700 p-2 text-white"><GraduationCap className="size-5" aria-hidden="true" /></span>
            <h2 id="embedded-deneme-title" className="text-xl font-semibold text-navy-900 dark:text-slate-100">LGS Deneme Analiz</h2>
          </div>
          <button type="button" onClick={() => setIsUploadOpen(true)}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 sm:w-auto">
            <FileUp className="size-4" aria-hidden="true" /> PDF / Excel Yükle
          </button>
        </div>
        <nav className="control-grid gap-2" aria-label="Deneme Analiz menüsü">
          {navItems.map(({ id, label, icon }) => (
            <button key={id} type="button" aria-pressed={activeTab === id} className="appearance-option"
              onClick={() => { setActiveTab(id); setSelectedStudentId(null); }}>
              {icon}{label}
            </button>
          ))}
        </nav>
        <p className="text-sm text-slate-600">Deneme kayıtları bu tarayıcıda saklanır. Firebase ve JSON yedeklerine Deneme Arşivi’nden ulaşabilirsiniz.</p>
      </div>

      <div className="w-full min-w-0 flex-1">
        {/* Optional Feedback Banner */}
        {bannerMessage && (
          <div
            role={bannerMessage.type === 'error' ? 'alert' : 'status'}
            className={`no-print mb-5 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs font-medium ${
              bannerMessage.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-blue-200 bg-blue-50 text-blue-900'
            }`}
          >
            <span>{bannerMessage.text}</span>
            <button
              type="button"
              onClick={() => setBannerMessage(null)}
              className="rounded p-1 hover:bg-black/5"
              aria-label="Bildirimi kapat"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {activeTab === 'students' && selectedStudent ? (
          <StudentDetailView
            student={selectedStudent}
            nextExamOrder={nextExamOrder}
            onBack={() => setSelectedStudentId(null)}
            onAddManualExam={handleAddManualExam}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        ) : activeTab === 'students' ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h3 className="font-display text-xl font-semibold text-slate-900">Öğrenci Kartları</h3>
                <p className="text-sm text-slate-600 tabular-nums">
                  {archive.students.length} öğrenci · {archive.exams.length} deneme arşivi · Kartlara tıklayarak satır satır deneme tablosu, grafikler ve eksik kazanımları inceleyin.
                </p>
              </div>
            </div>
            <StudentCardsView
              exams={archive.exams}
              students={archive.students}
              onSelectStudent={handleSelectStudent}
              onOpenUpload={() => setIsUploadOpen(true)}
            />
          </div>
        ) : activeTab === 'leaderboard' ? (
          <LeaderboardView
            state={archive}
            onSelectStudent={handleSelectStudent}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        ) : activeTab === 'overview' ? (
          <OverviewView
            state={archive}
            onSelectStudent={handleSelectStudent}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        ) : activeTab === 'archive' ? (
          <div className="space-y-4">
            <section aria-label="Deneme Analiz Firebase yedeği" className="no-print space-y-3 rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="font-display text-lg font-semibold text-slate-900">Firebase Yedeği</h3>
              {user ? (
                <div className="control-grid gap-2">
                  <button type="button" className="appearance-option" disabled={cloud.busy} onClick={() => void cloud.save()}>Firebase’e Yedekle</button>
                  <button type="button" className="appearance-option" disabled={cloud.busy} onClick={() => void cloud.restore()}>Firebase Yedeğini Aç</button>
                  <button type="button" className="appearance-option" disabled={cloud.busy} onClick={() => void cloud.save().then((saved) => { if (saved) void signOutUser(); })}>Yedekle ve Çıkış Yap</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button type="button" className="appearance-option" onClick={() => setSignInOpen(true)}>Yedekleme İçin Giriş Yap</button>
                  <p className="text-sm text-slate-600">Google girişinde sorun yaşarsanız Bilge Akademi hesabınıza e-postayla giriş yapabilirsiniz.</p>
                </div>
              )}
              {cloud.status && <p role="status" className="text-sm text-teal-700 dark:text-teal-300">{cloud.status}</p>}
              {(cloud.busy || cloud.progress !== null) && <div role="status" aria-live="polite" className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-700">{cloud.phase || 'Firebase işlemi hazırlanıyor…'}</span>
                  <strong className="tabular-nums text-teal-800">{cloud.progress === null ? 'Kontrol ediliyor' : `%${cloud.progress}`}</strong>
                </div>
                {cloud.progress === null
                  ? <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200"><div className="h-full w-1/3 animate-pulse rounded-full bg-teal-500" /></div>
                  : <div role="progressbar" aria-label="Firebase yedekleme ilerlemesi" aria-valuemin={0} aria-valuemax={100} aria-valuenow={cloud.progress} className="h-3 w-full overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-teal-600 transition-all duration-300" style={{width: `${cloud.progress}%`}} /></div>}
                <p className="text-xs text-slate-500">Yüzde, Firebase tarafından onaylanan kayıt işlemlerini gösterir. Bulut verileri okunurken kesin yüzde hesaplanamaz.</p>
              </div>}
              {cloud.slow && <p role="alert" className="text-sm text-amber-800">Firebase işlemi 20 saniyeden uzun sürdü. Bağlantı veya sunucu yanıtı gecikiyor olabilir. İşlem sürerken yeniden başlatmayın; tamamlanmazsa önce JSON Yedek ile yerel arşivinizi koruyun.</p>}
              {cloud.error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{cloud.error}</p>}
            </section>
            <ExamArchiveView
              state={archive}
              onOpenUpload={() => setIsUploadOpen(true)}
              onDeleteExam={handleDeleteExam}
              onRenameExam={handleRenameExam}
              onImportJson={handleImportJson}
              onLoadSample={loadSample}
            />
          </div>
        ) : (
          <SchoolWeaknessView state={archive} onSelectStudent={handleSelectStudent} />
        )}
      </div>

      <footer className="mt-auto border-t border-slate-200 py-4 text-center text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
        by_ahmedozdemir
      </footer>

      {isUploadOpen && (
        <UploadModal
          isOpen
          onClose={() => setIsUploadOpen(false)}
          onBundlesParsed={handleBundlesParsed}
          nextExamOrder={nextExamOrder}
          onLoadSample={loadSample}
        />
      )}
    </section>
  );
}
