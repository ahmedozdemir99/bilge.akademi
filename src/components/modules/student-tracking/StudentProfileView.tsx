import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  Download,
  Edit3,
  Loader2,
  Plus,
  Printer,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  AttendanceRecord,
  Grade,
  PracticeExamRecord,
  SchoolClass,
  Student,
  StudentAIAnalysis,
} from '../../../types/academy';
import {
  anonymizeStudentForAI,
  calculateAverageScore,
  calculateNet,
  calculateSubjectAverages,
  calculateTrialRobotSummary,
  exportToCsv,
  formatShortTurkishDate,
  formatTurkishDate,
  triggerPrintReport,
} from '../../../utils/exportUtils';
import { summarizePracticeForAnalysis } from '../../../utils/practiceAnalysis';
import { getSubjectColor, trialSubjectColors } from '../../../utils/subjectColors';

interface StudentProfileViewProps {
  student: Student;
  schoolClass?: SchoolClass;
  grades: Grade[];
  practiceExams: PracticeExamRecord[];
  attendance: AttendanceRecord[];
  readOnly?: boolean;
  onBack?: () => void;
  onEditStudent?: () => void;
  onAddGrade?: () => void;
  onEditGrade?: (grade: Grade) => void;
  onDeleteGrade?: (grade: Grade) => void;
  onDeletePracticeExam?: (exam: PracticeExamRecord) => void;
}

export function StudentProfileView({
  student,
  schoolClass,
  grades,
  practiceExams,
  attendance,
  readOnly = false,
  onBack,
  onEditStudent,
  onAddGrade,
  onEditGrade,
  onDeleteGrade,
  onDeletePracticeExam,
}: StudentProfileViewProps) {
  const [aiAnalysis, setAiAnalysis] = useState<StudentAIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const avgScore = useMemo(() => calculateAverageScore(grades), [grades]);
  const subjectAverages = useMemo(() => calculateSubjectAverages(grades), [grades]);
  const trialSummary = useMemo(
    () => calculateTrialRobotSummary(practiceExams),
    [practiceExams]
  );
  const trialTrend = useMemo(
    () =>
      [...practiceExams]
        .sort((a, b) => a.examDate.localeCompare(b.examDate))
        .map((ex) => ({
          label: formatShortTurkishDate(ex.examDate),
          examTitle: ex.examTitle,
          totalNet: ex.totalNet,
          lgsScore: ex.estimatedLgsScore,
        })),
    [practiceExams]
  );
  const anonymizedPreview = useMemo(
    () => ({ ...anonymizeStudentForAI(student, grades, attendance), practiceExamSummary: summarizePracticeForAnalysis(practiceExams) }),
    [attendance, grades, practiceExams, student]
  );

  const handleRunAIAnalysis = async () => {
    setAiLoading(true);
    setAiError('');
    setAiAnalysis(null);
    try {
      const response = await fetch('/api/ai/student-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(anonymizedPreview),
      });
      const data = await response.json();
      if (!response.ok) {
        setAiError(data.error || 'Yapay zekâ analizi alınamadı.');
        return;
      }
      setAiAnalysis(data.analysis as StudentAIAnalysis);
    } catch {
      setAiError('Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edip tekrar deneyin.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleExportStudentCsv = () => {
    exportToCsv(
      `ogrenci_deneme_ve_not_raporu_${student.studentNumber}`,
      ['Tarih', 'Tür', 'Ders / Deneme', 'Sonuç / Net', 'Detay'],
      [
        ...practiceExams.map((ex) => [
          formatTurkishDate(ex.examDate),
          'LGS Deneme',
          ex.examTitle,
          `${ex.totalNet.toFixed(2)} Net (${ex.totalCorrect}D/${ex.totalWrong}Y)`,
          `Tahmini LGS: ${ex.estimatedLgsScore.toFixed(1)}`,
        ]),
        ...grades.map((g) => [
          formatTurkishDate(g.examDate),
          g.examType,
          `${g.subjectName} — ${g.examTitle}`,
          `${g.score}/${g.maxScore}`,
          g.teacherNote ?? '',
        ]),
      ]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Öğrenci Listesine Dön</span>
            </button>
          )}
        </div>

        <div className="control-grid gap-2 sm:max-w-lg">
          {!readOnly && onEditStudent && (
            <button
              type="button"
              onClick={onEditStudent}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Profili Düzenle</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleExportStudentCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel / CSV</span>
          </button>
          <button
            type="button"
            onClick={triggerPrintReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF / Yazdır</span>
          </button>
        </div>
      </div>

      {/* Student Identity & KPI Summary */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
              Ortaokul Öğrenci Dosyası · Okul No: {student.studentNumber} ·{' '}
              {student.status === 'active' ? 'Aktif Kayıt' : 'Pasif Kayıt'}
            </p>
            <h2 className="mt-1.5 text-2xl font-semibold text-navy-900 dark:text-white">
              {student.fullName}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {schoolClass
                ? `${schoolClass.name} · ${schoolClass.academicYear}`
                : `${student.gradeLevel}. Sınıf`}
            </p>
            {student.guardianNote && (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                {student.guardianNote}
              </p>
            )}
          </div>

          {!readOnly && onAddGrade && (
            <button
              type="button"
              onClick={onAddGrade}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 transition-colors cursor-pointer whitespace-nowrap shrink-0 no-print"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Not Ekle</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Deneme Ortalama Net</p>
            <p className="mt-1 text-2xl font-semibold font-mono tabular-nums text-teal-700 dark:text-teal-400">
              {trialSummary.examCount > 0 ? trialSummary.avgTotalNet.toFixed(2) : '—'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {trialSummary.examCount} deneme · Ort. {trialSummary.avgTotalCorrect.toFixed(1)} doğru
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ortalama Tahmini LGS</p>
            <p className="mt-1 text-2xl font-semibold font-mono tabular-nums text-gold-600 dark:text-gold-400">
              {trialSummary.examCount > 0 ? trialSummary.avgLgsScore.toFixed(1) : '—'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              En yüksek: {trialSummary.bestNet.toFixed(2)} net
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Not Ortalaması</p>
            <p className="mt-1 text-2xl font-semibold font-mono tabular-nums text-navy-900 dark:text-white">
              {grades.length > 0 ? avgScore.toFixed(1) : '—'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {grades.length} değerlendirme
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">En Güçlü Ders</p>
            <p className="mt-1 text-base font-semibold text-navy-900 dark:text-white truncate">
              {subjectAverages[0]?.subject ?? 'Veri yok'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {subjectAverages[0]
                ? `Ortalama: ${subjectAverages[0].average.toFixed(1)}`
                : 'Not girilmedi'}
            </p>
          </div>
        </div>
      </section>

      {/* Charts Row: Subject Averages & Trial Net Progress */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <h3 className="text-base font-semibold text-navy-900 dark:text-white">
            Denemelerde Ders Bazlı Ortalama Netler
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-5">
            Türkçe, Matematik, Fen, İnkılap, Din Kültürü ve İngilizce ortalama netleri
          </p>
          {trialSummary.examCount === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-10 text-center">
              Grafik için Deneme & Net Robotundan deneme sonucu ekleyin.
            </p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={trialSummary.subjectAverages}
                  margin={{ top: 8, right: 12, left: -16, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} />
                  <XAxis dataKey="shortLabel" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip formatter={(val) => [`${val ?? 0} net`, 'Ortalama Net']} />
                  <Bar dataKey="avgNet" radius={[6, 6, 0, 0]} maxBarSize={42}>
                    {trialSummary.subjectAverages.map(({ key }) => (
                      <Cell key={key} fill={trialSubjectColors[key].color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <h3 className="text-base font-semibold text-navy-900 dark:text-white">
            Deneme Sınavı Toplam Net Gelişimi
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-5">
            Deneme tarihlerine göre 90 soru üzerinden toplam net eğilimi
          </p>
          {trialTrend.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-10 text-center">
              Net gelişim grafiği için deneme kaydı ekleyin.
            </p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trialTrend} margin={{ top: 8, right: 12, left: -16, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 90]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val) => [`${val ?? 0} net`, 'Toplam Net']}
                    labelFormatter={(label, payload) => {
                      const item = payload?.[0]?.payload as { examTitle?: string } | undefined;
                      return item ? `${label} · ${item.examTitle}` : String(label);
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalNet"
                    stroke="#C89B3C"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#0B1F3A', strokeWidth: 2, stroke: '#C89B3C' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      {/* AI Pedagogical Analysis Panel */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h3 className="text-base font-semibold text-navy-900 dark:text-white">
                Yapay Zekâ Kişiselleştirilmiş Ortaokul Başarı Analizi
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>
                Gizlilik Koruması: Ad-soyad ve kişisel notlar gönderilmez; yalnızca anonim kod (
                {anonymizedPreview.anonymousCode}), notlar ve deneme özetleri iletilir.
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleRunAIAnalysis()}
            disabled={aiLoading || (grades.length === 0 && practiceExams.length === 0)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap shrink-0 no-print"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
            <span>{aiLoading ? 'Analiz Hazırlanıyor...' : 'Yapay Zekâ Analizi Oluştur'}</span>
          </button>
        </div>

        {aiError && (
          <div className="mt-4 flex items-start gap-2.5 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{aiError}</span>
          </div>
        )}

        {aiAnalysis && (
          <div className="mt-5 space-y-5">
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {aiAnalysis.summary}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-2.5">
                  Güçlü Olduğu Alanlar
                </h4>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc pl-4">
                  {aiAnalysis.strengths.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2.5">
                  Gelişime Açık Alanlar
                </h4>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc pl-4">
                  {aiAnalysis.growthAreas.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-semibold text-navy-900 dark:text-gold-400 mb-2.5">
                  Kişiselleştirilmiş Çalışma Önerileri
                </h4>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc pl-4">
                  {aiAnalysis.studyRecommendations.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
              <strong>Pedagojik Uyarı:</strong> {aiAnalysis.pedagogicalDisclaimer}
            </p>
          </div>
        )}
      </section>

      {/* Practice Exams & Grades Tables */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-semibold text-navy-900 dark:text-white">
              Deneme Sınavları (D/Y/Net) ({practiceExams.length})
            </h3>
          </div>
          {practiceExams.length === 0 ? (
            <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
              Bu öğrenci için kayıtlı deneme sınavı bulunmuyor.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {practiceExams.map((ex) => (
                <div
                  key={ex.id}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-navy-900 dark:text-white">
                        {ex.examTitle}
                      </p>
                      <p className="text-xs font-mono text-slate-500 tabular-nums">
                        {formatTurkishDate(ex.examDate)} · {ex.totalCorrect} Doğru · {ex.totalWrong}{' '}
                        Yanlış ·{' '}
                        <strong className="text-teal-700 dark:text-teal-400">
                          {ex.totalNet.toFixed(2)} Net
                        </strong>{' '}
                        · LGS ~{ex.estimatedLgsScore.toFixed(1)}
                      </p>
                    </div>
                    {!readOnly && onDeletePracticeExam && (
                      <button
                        type="button"
                        onClick={() => onDeletePracticeExam(ex)}
                        aria-label="Denemeyi sil"
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-600 cursor-pointer no-print"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-[11px] font-mono tabular-nums text-slate-600 dark:text-slate-300">
                    <span>Trk: {calculateNet(ex.turkceD, ex.turkceY, ex.wrongPenalty)}</span>
                    <span>Mat: {calculateNet(ex.matematikD, ex.matematikY, ex.wrongPenalty)}</span>
                    <span>Fen: {calculateNet(ex.fenD, ex.fenY, ex.wrongPenalty)}</span>
                    <span>İnk: {calculateNet(ex.inkilapD, ex.inkilapY, ex.wrongPenalty)}</span>
                    <span>Din: {calculateNet(ex.dinD, ex.dinY, ex.wrongPenalty)}</span>
                    <span>İng: {calculateNet(ex.ingilizceD, ex.ingilizceY, ex.wrongPenalty)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="xl:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-semibold text-navy-900 dark:text-white">
              Notlar ({grades.length})
            </h3>
          </div>
          {grades.length === 0 ? (
            <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
              Henüz not kaydedilmemiş.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {grades.map((g) => (
                <div
                  key={g.id}
                  className="px-4 py-3 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-medium text-navy-900 dark:text-white">
                      <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: getSubjectColor(g.subjectName) }} />
                      <span className="truncate">{g.subjectName}</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {g.examTitle} · {formatTurkishDate(g.examDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-sm font-semibold tabular-nums text-navy-900 dark:text-white">
                      {g.score}/{g.maxScore}
                    </span>
                    {!readOnly && onEditGrade && (
                      <button
                        type="button"
                        onClick={() => onEditGrade(g)}
                        aria-label="Notu düzenle"
                        className="p-1 text-slate-400 hover:text-navy-900 dark:hover:text-white cursor-pointer no-print"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {!readOnly && onDeleteGrade && (
                      <button
                        type="button"
                        onClick={() => onDeleteGrade(g)}
                        aria-label="Notu sil"
                        className="p-1 text-slate-400 hover:text-red-600 cursor-pointer no-print"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
