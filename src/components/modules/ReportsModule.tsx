import { useMemo, useState } from 'react';
import { Download, Printer } from 'lucide-react';
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
import {
  calculateAverageScore,
  calculateSubjectAverages,
  calculateTrialRobotSummary,
  exportToCsv,
  triggerPrintReport,
} from '../../utils/exportUtils';
import { TrialHistoryPanel, trialSubjectColors } from './reports/TrialHistoryPanel';

const metricColors = [
  'border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/45',
  'border-violet-200 bg-violet-50 dark:border-violet-900 dark:bg-violet-950/45',
  'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/45',
  'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/45',
  'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/45',
  'border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/45',
];

const subjectPalette = Object.values(trialSubjectColors);

export function ReportsModule() {
  const {
    classes,
    students,
    grades,
    practiceExams,
    poems,
    mathAttempts,
    quizAttempts,
    isDemoMode,
  } = useAcademy();

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const selectedClass = classes.find((schoolClass) => schoolClass.id === selectedClassId);
  const reportClassCount = selectedClass ? 1 : classes.length;
  const reportStudents = selectedClass ? students.filter((student) => student.classId === selectedClass.id) : students;
  const reportGrades = useMemo(
    () => selectedClass ? grades.filter((grade) => grade.classId === selectedClass.id) : grades,
    [grades, selectedClass],
  );
  const reportTrials = useMemo(
    () => selectedClass ? practiceExams.filter((exam) => exam.classId === selectedClass.id) : practiceExams,
    [practiceExams, selectedClass],
  );
  const overallAverage = useMemo(() => calculateAverageScore(reportGrades), [reportGrades]);
  const subjectAverages = useMemo(() => calculateSubjectAverages(reportGrades), [reportGrades]);
  const trialSummary = useMemo(() => calculateTrialRobotSummary(reportTrials), [reportTrials]);
  const netAverages = trialSummary.subjectAverages.filter(({ avgNet }) => Number.isFinite(avgNet));
  const minimumNet = Math.min(0, ...netAverages.map(({ avgNet }) => Math.floor(avgNet)));

  const classSummaryRows = useMemo(() => {
    return (selectedClass ? [selectedClass] : classes).map((cls) => {
      const clsStudents = students.filter((s) => s.classId === cls.id);
      const clsGrades = grades.filter((g) => g.classId === cls.id);
      const clsTrials = calculateTrialRobotSummary(
        practiceExams.filter((p) => p.classId === cls.id)
      );
      return {
        id: cls.id,
        name: cls.name,
        gradeLevel: cls.gradeLevel,
        studentCount: clsStudents.length,
        examCount: clsGrades.length,
        average: calculateAverageScore(clsGrades),
        trialCount: clsTrials.examCount,
        avgNet: clsTrials.avgTotalNet,
        avgLgs: clsTrials.avgLgsScore,
      };
    });
  }, [classes, grades, practiceExams, selectedClass, students]);

  const handleExportSummaryCsv = () => {
    exportToCsv(
      selectedClass ? `bilge_akademi_${selectedClass.name}_raporu` : 'bilge_akademi_genel_rapor',
      [
        'Sınıf',
        'Seviye',
        'Öğrenci Sayısı',
        'Not Kaydı',
        'Sınav Ort.',
        'Deneme Sayısı',
        'Deneme Ort. Net',
        'Tahmini LGS Puanı',
      ],
      classSummaryRows.map((r) => [
        r.name,
        `${r.gradeLevel}. Sınıf`,
        r.studentCount,
        r.examCount,
        r.examCount > 0 ? r.average : '-',
        r.trialCount,
        r.trialCount > 0 ? r.avgNet : '-',
        r.trialCount > 0 ? r.avgLgs : '-',
      ])
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
            Raporlama Merkezi · {isDemoMode ? 'Örnek Veri (Demo Modu)' : 'Gerçek Firestore Kayıtları'}
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-navy-900 dark:text-white tracking-tight">
            Raporlar ve İstatistikler
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Sınav notlarını, deneme netlerini ve atölye sonuçlarını inceleyin.
          </p>
        </div>

        <div className="control-grid gap-2 no-print sm:max-w-80 sm:shrink-0">
          <button
            type="button"
            onClick={handleExportSummaryCsv}
            disabled={classSummaryRows.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel / CSV Dışa Aktar</span>
          </button>
          <button
            type="button"
            onClick={triggerPrintReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF / Yazdır</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <label htmlFor="report-class" className="text-sm font-semibold text-navy-900 dark:text-white">
          Sınıf raporu
        </label>
        <select
          id="report-class"
          value={selectedClass?.id ?? ''}
          onChange={(event) => {
            setSelectedClassId(event.target.value);
            setSelectedStudentId('');
          }}
          className="no-print min-h-11 max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base dark:border-slate-700 dark:bg-slate-950"
        >
          <option value="">Tüm sınıflar</option>
          {classes.map((schoolClass) => (
            <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>
          ))}
        </select>
        <p role="status" className="text-sm text-slate-600 dark:text-slate-400">
          {selectedClass?.name ?? 'Tüm sınıflar'} · {reportStudents.length} öğrenci
        </p>
      </div>

      {/* KPI Metrics Grid */}
      <section className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${selectedClass ? '' : 'xl:grid-cols-6'}`}>
        {[
          { label: 'Toplam Öğrenci', value: reportStudents.length, sub: `${reportClassCount} sınıf` },
          {
            label: 'Sınav Ortalaması',
            value: reportGrades.length > 0 ? overallAverage.toFixed(1) : '—',
            sub: `${reportGrades.length} not kaydı`,
          },
          {
            label: 'Deneme Ort. Net',
            value: trialSummary.examCount > 0 ? trialSummary.avgTotalNet.toFixed(2) : '—',
            sub: `${trialSummary.examCount} deneme`,
          },
          ...(!selectedClass ? [
            {
              label: 'Matematik Alıştırma',
              value: mathAttempts.length,
              sub: isDemoMode ? 'Örnek kayıt' : 'Kayıtlı deneme',
            },
            {
              label: 'Bilgi Yarışması',
              value: quizAttempts.length,
              sub: isDemoMode ? 'Örnek kayıt' : 'Çözülen test',
            },
            {
              label: 'Kaydedilen Şiir',
              value: poems.length,
              sub: isDemoMode ? 'Örnek eser' : 'Atölye eseri',
            },
          ] : []),
        ].map((metric, index) => (
          <div
            key={metric.label}
            className={`rounded-xl border p-4 ${metricColors[index]}`}
          >
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{metric.label}</p>
            <p className="mt-1.5 text-2xl font-semibold font-mono tabular-nums text-navy-900 dark:text-white">
              {metric.value}
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{metric.sub}</p>
          </div>
        ))}
      </section>

      <TrialHistoryPanel exams={reportTrials} students={reportStudents}
        studentId={selectedStudentId} onStudentChange={setSelectedStudentId} />

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <h2 className="text-base font-semibold text-navy-900 dark:text-white">
            Ders Bazında Genel Başarı Ortalamaları
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-5">
            Kayıtlı yazılı, deneme ve performans notlarının ders bazlı özeti
          </p>
          <div className="h-64 w-full">
            {subjectAverages.length === 0 ? (
              <p className="text-sm text-slate-500 py-12 text-center">
                Henüz sınav notu kaydedilmemiş.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectAverages} margin={{ top: 8, right: 12, left: -16, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} />
                  <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip formatter={(val) => [`${val ?? 0} puan`, 'Ortalama']} />
                  <Bar dataKey="average" radius={[6, 6, 0, 0]} maxBarSize={44}>
                    {subjectAverages.map(({ subject }, index) => (
                      <Cell key={subject} fill={subjectPalette[index % subjectPalette.length].color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <h2 className="text-base font-semibold text-navy-900 dark:text-white">
            LGS / Ortaokul Deneme Ders Bazlı Net Ortalamaları
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4">
            Kayıtlı {trialSummary.examCount} denemenin ders bazlı ortalama netleri
          </p>
          {trialSummary.examCount === 0 ? (
            <p className="text-sm text-slate-500 py-12 text-center">
              Henüz deneme kaydı bulunmuyor.
            </p>
          ) : (
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={netAverages}
                  margin={{ top: 8, right: 8, left: -20, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} />
                  <XAxis dataKey="shortLabel" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[minimumNet, 20]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip formatter={(val) => [`${val ?? 0} net`, 'Ortalama Net']} />
                  <Bar dataKey="avgNet" radius={4} maxBarSize={36}>
                    {netAverages.map(({ key }) => <Cell key={key} fill={trialSubjectColors[key].color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {trialSummary.examCount > 0 && <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 tabular-nums">
            <span>Ort. Doğru: {trialSummary.avgTotalCorrect.toFixed(1)}</span>
            <span>Ort. Net: {trialSummary.avgTotalNet.toFixed(2)}</span>
            <span>En Yüksek Net: {trialSummary.bestNet.toFixed(2)}</span>
            <span>Tahmini LGS ort.: {trialSummary.avgLgsScore.toFixed(1)}</span>
          </div>}
        </div>
      </section>

      {/* Class Summary Table */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-semibold text-navy-900 dark:text-white">
            Sınıf Bazlı Akademik Özet Tablosu
          </h2>
        </div>
        {classSummaryRows.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
            Raporlanacak sınıf kaydı bulunmuyor.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 font-medium">Sınıf</th>
                  <th className="py-3 px-4 font-medium text-right">Öğrenci</th>
                  <th className="py-3 px-4 font-medium text-right">Sınav Ort.</th>
                  <th className="py-3 px-4 font-medium text-right">Deneme Sayısı</th>
                  <th className="py-3 px-4 font-medium text-right">Deneme Ort. Net</th>
                  <th className="py-3 px-4 font-medium text-right">Tahmini LGS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {classSummaryRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-medium text-navy-900 dark:text-white">
                      {row.name}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">{row.studentCount}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {row.examCount > 0 ? row.average.toFixed(1) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">{row.trialCount}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-teal-700 dark:text-teal-400">
                      {row.trialCount > 0 ? row.avgNet.toFixed(2) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-gold-600 dark:text-gold-400">
                      {row.trialCount > 0 ? row.avgLgs.toFixed(1) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Account-wide learning activity */}
      {!selectedClass && <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-navy-900 dark:text-white">
                Modüller Arası Test ve Bilgi Yarışması Kayıtları
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Edebiyat, Tarih, Matematik, Fen Bilimleri, İngilizce, Din Kültürü ve Felsefe test sonuçları
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {quizAttempts.length} kayıt
            </span>
          </div>
          {quizAttempts.length === 0 ? (
            <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
              Henüz tamamlanmış bir bilgi yarışması veya test kaydı bulunmuyor.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 px-4 font-medium">Modül</th>
                    <th className="py-2.5 px-4 font-medium">Konu</th>
                    <th className="py-2.5 px-4 font-medium text-right">Soru</th>
                    <th className="py-2.5 px-4 font-medium text-right">Başarı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {quizAttempts.slice(0, 10).map((attempt) => {
                    const moduleLabels: Record<string, string> = {
                      edebiyat: 'Edebiyat',
                      tarih: 'Tarih',
                      matematik: 'Matematik',
                      fen: 'Fen Bilimleri',
                      ingilizce: 'İngilizce',
                      din: 'Din Kültürü',
                      felsefe: 'Felsefe',
                    };
                    const scoreDisplay =
                      attempt.totalQuestions > 0 && attempt.score <= attempt.totalQuestions
                        ? `${attempt.score}/${attempt.totalQuestions} (%${Math.round(
                            (attempt.score / attempt.totalQuestions) * 100
                          )})`
                        : `%${attempt.score}`;
                    return (
                      <tr key={attempt.id}>
                        <td className="py-2.5 px-4 font-medium text-navy-900 dark:text-white whitespace-nowrap">
                          {moduleLabels[attempt.moduleName] ?? attempt.moduleName}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                          {attempt.topic}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                          {attempt.totalQuestions} soru
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold tabular-nums text-teal-700 dark:text-teal-400 whitespace-nowrap">
                          {scoreDisplay}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-navy-900 dark:text-white">
              Matematik ve Edebiyat Atölye Özeti
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Alıştırma doğruluk oranı, ipucu kullanımı ve kaydedilen şiirler
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Matematik Doğruluk</p>
              <p className="mt-1 text-xl font-semibold font-mono tabular-nums text-teal-700 dark:text-teal-400">
                {mathAttempts.length > 0
                  ? `%${Math.round(
                      (mathAttempts.filter((m) => m.isCorrect).length / mathAttempts.length) * 100
                    )}`
                  : '—'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                {mathAttempts.filter((m) => m.isCorrect).length} / {mathAttempts.length} doğru
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Ortalama İpucu</p>
              <p className="mt-1 text-xl font-semibold font-mono tabular-nums text-navy-900 dark:text-white">
                {mathAttempts.length > 0
                  ? (
                      mathAttempts.reduce((acc, m) => acc + m.hintsUsed, 0) / mathAttempts.length
                    ).toFixed(1)
                  : '—'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                soru başına kademeli ipucu
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              Son Kaydedilen Şiirler ({poems.length})
            </p>
            {poems.length === 0 ? (
              <p className="text-xs text-slate-500">Henüz şiir kaydedilmemiş.</p>
            ) : (
              <ul className="space-y-2 text-xs">
                {poems.slice(0, 4).map((poem) => (
                  <li
                    key={poem.id}
                    className="flex items-center justify-between gap-2 text-slate-700 dark:text-slate-300"
                  >
                    <span className="font-medium truncate">{poem.title}</span>
                    <span className="text-slate-500 shrink-0">
                      {poem.genre} · {poem.isDraft ? 'Taslak' : 'Tamamlandı'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>}
    </div>
  );
}
