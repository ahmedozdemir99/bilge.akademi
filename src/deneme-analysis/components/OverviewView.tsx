import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  ArrowUpRight,
  ArrowDownRight,
  FileUp,
  ChevronDown,
  ChevronRight,
  Users,
  Search,
  GitCompareArrows,
  FileSpreadsheet,
} from 'lucide-react';
import { ExamArchiveState, SUBJECT_LIST } from '../types/exam';
import {
  buildClassComparison,
  formatTrDelta,
  formatTrNumber,
  getStudentProgressSummary,
} from '../utils/analytics';
import { ChartKind, ChartTypeSelector, VIVID_PALETTE } from './ChartTypeSelector';
import { exportSchoolArchiveToExcel } from '../utils/excelHandler';

interface OverviewViewProps {
  state: ExamArchiveState;
  onSelectStudent: (studentId: string) => void;
  onOpenUpload: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  state,
  onSelectStudent,
  onOpenUpload,
}) => {
  const sortedExams = useMemo(
    () => [...state.exams].sort((a, b) => a.examOrder - b.examOrder),
    [state.exams]
  );

  // Pair selection for exam-to-exam comparison (Önceki vs Sonraki)
  const [targetExamId, setTargetExamId] = useState<string>('LATEST');
  const [compareExamId, setCompareExamId] = useState<string>('AUTO_PREV');

  // Chart type & metric states
  const [classChartType, setClassChartType] = useState<ChartKind>('bar');
  const [classChartMetric, setClassChartMetric] = useState<'avgLgs' | 'avgToplamNet'>('avgLgs');
  const [subjectChartType, setSubjectChartType] = useState<ChartKind>('bar');
  const [trendChartType, setTrendChartType] = useState<ChartKind>('area');
  const [trendMode, setTrendMode] = useState<'overall' | 'subjects'>('overall');

  // Class table student-names visibility & search
  const [showStudentRows, setShowStudentRows] = useState<boolean>(true);
  const [collapsedClasses, setCollapsedClasses] = useState<Record<string, boolean>>({});
  const [tableSearch, setTableSearch] = useState('');

  const activeExam = useMemo(() => {
    if (sortedExams.length === 0) return undefined;
    if (targetExamId === 'LATEST') return sortedExams[sortedExams.length - 1];
    return sortedExams.find((e) => e.id === targetExamId) ?? sortedExams[sortedExams.length - 1];
  }, [sortedExams, targetExamId]);

  const compareExam = useMemo(() => {
    if (!activeExam || sortedExams.length < 2) return undefined;
    if (compareExamId === 'NONE') return undefined;
    if (compareExamId === 'AUTO_PREV') {
      const idx = sortedExams.findIndex((e) => e.id === activeExam.id);
      return idx > 0 ? sortedExams[idx - 1] : undefined;
    }
    const found = sortedExams.find((e) => e.id === compareExamId);
    return found && found.id !== activeExam.id ? found : undefined;
  }, [sortedExams, activeExam, compareExamId]);

  const classRows = useMemo(
    () => buildClassComparison(state, activeExam?.id, compareExam?.id),
    [state, activeExam, compareExam]
  );

  const filteredClassRows = useMemo(() => {
    const q = tableSearch.trim().toLocaleLowerCase('tr');
    if (!q) return classRows;
    return classRows
      .map((cls) => {
        const classMatch = cls.sinif.toLocaleLowerCase('tr').includes(q);
        const matchingStudents = cls.students.filter(
          (st) =>
            classMatch ||
            st.name.toLocaleLowerCase('tr').includes(q) ||
            st.numara.includes(q)
        );
        return { ...cls, students: matchingStudents };
      })
      .filter((cls) => cls.students.length > 0 || cls.sinif.toLocaleLowerCase('tr').includes(q));
  }, [classRows, tableSearch]);

  const subjectChartData = useMemo(() => {
    if (!activeExam) return [];
    return SUBJECT_LIST.map((s) => ({
      ders: s.shortLabel,
      dersAd: s.label,
      color: s.color,
      sonrakiOrt: activeExam.schoolSubjectNets?.[s.key] ?? 0,
      oncekiOrt: compareExam ? (compareExam.schoolSubjectNets?.[s.key] ?? 0) : null,
      genelOrt: activeExam.generalSubjectNets?.[s.key] ?? null,
    }));
  }, [activeExam, compareExam]);

  const examTrendData = useMemo(() => {
    return sortedExams.map((ex, idx) => ({
      name: ex.name.length > 16 ? `D${idx + 1}: ${ex.name.slice(0, 12)}…` : ex.name,
      fullName: ex.name,
      okulLgs: ex.schoolAvgLgs ?? 0,
      genelLgs: ex.generalAvgLgs ?? null,
      okulNet: ex.schoolAvgToplamNet ?? 0,
      genelNet: ex.generalAvgToplamNet ?? null,
      turkce: ex.schoolSubjectNets?.turkce ?? 0,
      tarih: ex.schoolSubjectNets?.tarih ?? 0,
      din: ex.schoolSubjectNets?.din ?? 0,
      ingilizce: ex.schoolSubjectNets?.ingilizce ?? 0,
      matematik: ex.schoolSubjectNets?.matematik ?? 0,
      fen: ex.schoolSubjectNets?.fen ?? 0,
    }));
  }, [sortedExams]);

  const topPerformers = useMemo(() => {
    return state.students
      .map((s) => ({ student: s, summary: getStudentProgressSummary(s) }))
      .filter((x): x is { student: typeof x.student; summary: NonNullable<typeof x.summary> } =>
        Boolean(x.summary)
      )
      .sort((a, b) => b.summary.latest.lgsPuan - a.summary.latest.lgsPuan)
      .slice(0, 8);
  }, [state.students]);

  const topRisers = useMemo(() => {
    if (!activeExam || !compareExam) return [];
    return state.students
      .map((student) => {
        const cur = student.exams.find((e) => e.examId === activeExam.id);
        const prev = student.exams.find((e) => e.examId === compareExam.id);
        if (!cur || !prev) return null;
        const deltaNet = Math.round((cur.toplam.net - prev.toplam.net) * 100) / 100;
        const deltaLgs = Math.round((cur.lgsPuan - prev.lgsPuan) * 100) / 100;
        return { student, deltaNet, deltaLgs, curNet: cur.toplam.net };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x))
      .sort((a, b) => b.deltaNet - a.deltaNet)
      .slice(0, 8);
  }, [state.students, activeExam, compareExam]);

  const toggleClassExpand = (sinif: string) => {
    setCollapsedClasses((prev) => ({ ...prev, [sinif]: !prev[sinif] }));
  };

  const toggleAllClasses = () => {
    if (showStudentRows) {
      setShowStudentRows(false);
    } else {
      setShowStudentRows(true);
      setCollapsedClasses({});
    }
  };

  if (state.exams.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-8 py-16 text-center">
        <h2 className="text-lg font-bold text-slate-900">Okul Geneli Analiz İçin Deneme Yükleyin</h2>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-500">
          İlk deneme sonuç PDF&apos;ini yüklediğinizde şube karşılaştırmaları, öğrenci net tabloları ve renkli grafikler burada oluşur.
        </p>
        <button
          type="button"
          onClick={onOpenUpload}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
        >
          <FileUp className="h-4 w-4" />
          PDF Yükle
        </button>
      </div>
    );
  }

  const lgsDiffGeneral =
    activeExam?.schoolAvgLgs !== undefined && activeExam?.generalAvgLgs !== undefined
      ? Math.round((activeExam.schoolAvgLgs - activeExam.generalAvgLgs) * 100) / 100
      : undefined;

  const netDiffGeneral =
    activeExam?.schoolAvgToplamNet !== undefined && activeExam?.generalAvgToplamNet !== undefined
      ? Math.round((activeExam.schoolAvgToplamNet - activeExam.generalAvgToplamNet) * 100) / 100
      : undefined;

  const schoolLgsDelta =
    activeExam?.schoolAvgLgs !== undefined && compareExam?.schoolAvgLgs !== undefined
      ? Math.round((activeExam.schoolAvgLgs - compareExam.schoolAvgLgs) * 100) / 100
      : undefined;

  const schoolNetDelta =
    activeExam?.schoolAvgToplamNet !== undefined && compareExam?.schoolAvgToplamNet !== undefined
      ? Math.round((activeExam.schoolAvgToplamNet - compareExam.schoolAvgToplamNet) * 100) / 100
      : undefined;

  return (
    <div className="space-y-6">
      {/* Header & Exam Pair Comparison Controls */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Okul ve Şube Genel Bakış</h1>
          <p className="text-xs text-slate-500">
            {activeExam?.schoolName} {activeExam?.location ? `· ${activeExam.location}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {sortedExams.length >= 2 ? (
            <>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <span>Önceki:</span>
                <select
                  value={compareExamId}
                  onChange={(e) => setCompareExamId(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
                >
                  <option value="AUTO_PREV">Bir Önceki Deneme</option>
                  {sortedExams
                    .filter((ex) => ex.id !== activeExam?.id)
                    .map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name}
                      </option>
                    ))}
                  <option value="NONE">Karşılaştırma Yok</option>
                </select>
              </label>

              <GitCompareArrows className="hidden h-4 w-4 text-slate-400 sm:block" />

              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <span>Sonraki:</span>
                <select
                  value={targetExamId}
                  onChange={(e) => setTargetExamId(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
                >
                  <option value="LATEST">Son Deneme ({sortedExams[sortedExams.length - 1].name})</option>
                  {sortedExams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            <button
              type="button"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
            >
              <FileUp className="h-3.5 w-3.5" />
              2. Deneme PDF Yükleyerek Karşılaştır
            </button>
          )}
        </div>
      </div>

      {/* 4-Column KPI Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Kayıtlı Öğrenci
          </span>
          <div className="mt-1.5 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {state.students.length}
          </div>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            {classRows.length} şube · Aktif sınavda {activeExam?.studentCount ?? 0} katılımcı
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Arşivlenen Deneme
          </span>
          <div className="mt-1.5 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {state.exams.length}
          </div>
          <p className="mt-1 truncate text-xs text-slate-500">
            Aktif: {activeExam?.name}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Okul LGS Ortalaması
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {formatTrNumber(activeExam?.schoolAvgLgs, 2)}
            </span>
            {schoolLgsDelta !== undefined ? (
              <span
                className={`font-mono text-xs font-bold tabular-nums ${
                  schoolLgsDelta >= 0 ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {schoolLgsDelta >= 0 ? '▲ ' : '▼ '}
                {formatTrDelta(schoolLgsDelta, 2)}
              </span>
            ) : lgsDiffGeneral !== undefined ? (
              <span
                className={`font-mono text-xs font-semibold tabular-nums ${
                  lgsDiffGeneral >= 0 ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {formatTrDelta(lgsDiffGeneral, 1)} (Genel)
              </span>
            ) : null}
          </div>
          <p className="mt-1 font-mono text-xs text-slate-500 tabular-nums">
            Genel Ort: {formatTrNumber(activeExam?.generalAvgLgs, 2)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Okul Toplam Net Ort.
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-blue-700 tabular-nums">
              {formatTrNumber(activeExam?.schoolAvgToplamNet, 2)}
            </span>
            {schoolNetDelta !== undefined ? (
              <span
                className={`font-mono text-xs font-bold tabular-nums ${
                  schoolNetDelta >= 0 ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {schoolNetDelta >= 0 ? '▲ ' : '▼ '}
                {formatTrDelta(schoolNetDelta, 2)} Net
              </span>
            ) : netDiffGeneral !== undefined ? (
              <span
                className={`font-mono text-xs font-semibold tabular-nums ${
                  netDiffGeneral >= 0 ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {formatTrDelta(netDiffGeneral, 2)}
              </span>
            ) : null}
          </div>
          <p className="mt-1 font-mono text-xs text-slate-500 tabular-nums">
            Genel Ort: {formatTrNumber(activeExam?.generalAvgToplamNet, 2)} / 90 soru
          </p>
        </div>
      </div>

      {/* School-wide Önceki vs Sonraki Subject & Total Net Comparison Strip */}
      {compareExam && activeExam && (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Önceki ↔ Sonraki Deneme Karşılaştırması (Ders Ders & Toplam Net)
              </h2>
              <p className="text-xs text-slate-500">
                {compareExam.name} → {activeExam.name}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {SUBJECT_LIST.map((s) => {
              const prevNet = compareExam.schoolSubjectNets?.[s.key] ?? 0;
              const curNet = activeExam.schoolSubjectNets?.[s.key] ?? 0;
              const diff = Math.round((curNet - prevNet) * 100) / 100;
              return (
                <div
                  key={s.key}
                  className="rounded-lg border border-slate-200 bg-slate-50/60 p-3"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.shortLabel}
                  </div>
                  <div className="mt-1 font-mono text-base font-bold text-slate-900 tabular-nums">
                    {formatTrNumber(curNet, 2)}
                  </div>
                  <div className="mt-0.5 flex items-center justify-between font-mono text-[11px] tabular-nums">
                    <span className="text-slate-400">Önc: {formatTrNumber(prevNet, 2)}</span>
                    <span
                      className={`font-bold ${
                        diff > 0 ? 'text-emerald-700' : diff < 0 ? 'text-red-700' : 'text-slate-500'
                      }`}
                    >
                      {formatTrDelta(diff, 2)}
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3">
              <div className="text-xs font-bold text-blue-900">TOPLAM NET</div>
              <div className="mt-1 font-mono text-base font-bold text-blue-800 tabular-nums">
                {formatTrNumber(activeExam.schoolAvgToplamNet, 2)}
              </div>
              <div className="mt-0.5 flex items-center justify-between font-mono text-[11px] tabular-nums">
                <span className="text-blue-600/80">
                  Önc: {formatTrNumber(compareExam.schoolAvgToplamNet, 2)}
                </span>
                <span
                  className={`font-bold ${
                    (schoolNetDelta ?? 0) >= 0 ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  {formatTrDelta(schoolNetDelta, 2)}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Charts Row (Colorful + Selectable Chart Types) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Chart 1: Class Comparison */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Şube Bazlı {classChartMetric === 'avgLgs' ? 'LGS Puanı' : 'Toplam Net'} Ortalamaları
              </h2>
              <p className="text-xs text-slate-500">Her şube ayrı renk ile gösterilir.</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setClassChartMetric('avgLgs')}
                  className={`rounded-md px-2 py-1 font-semibold ${
                    classChartMetric === 'avgLgs'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  LGS
                </button>
                <button
                  type="button"
                  onClick={() => setClassChartMetric('avgToplamNet')}
                  className={`rounded-md px-2 py-1 font-semibold ${
                    classChartMetric === 'avgToplamNet'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Net
                </button>
              </div>
              <ChartTypeSelector
                value={classChartType}
                options={['bar', 'hbar', 'line', 'area', 'pie']}
                onChange={setClassChartType}
              />
            </div>
          </div>

          <div className="h-68 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {classChartType === 'bar' ? (
                <BarChart data={classRows} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="sinif" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip
                    formatter={(val: unknown) =>
                      typeof val === 'number' ? formatTrNumber(val, 2) : String(val ?? '')
                    }
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Bar
                    dataKey={classChartMetric}
                    name={classChartMetric === 'avgLgs' ? 'LGS Ort.' : 'Toplam Net Ort.'}
                    radius={[6, 6, 0, 0]}
                  >
                    {classRows.map((entry, idx) => (
                      <Cell key={entry.sinif} fill={VIVID_PALETTE[idx % VIVID_PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              ) : classChartType === 'hbar' ? (
                <BarChart
                  data={classRows}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis type="category" dataKey="sinif" width={42} tick={{ fontSize: 11, fill: '#334155' }} />
                  <Tooltip
                    formatter={(val: unknown) =>
                      typeof val === 'number' ? formatTrNumber(val, 2) : String(val ?? '')
                    }
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Bar
                    dataKey={classChartMetric}
                    name={classChartMetric === 'avgLgs' ? 'LGS Ort.' : 'Toplam Net Ort.'}
                    radius={[0, 6, 6, 0]}
                  >
                    {classRows.map((entry, idx) => (
                      <Cell key={entry.sinif} fill={VIVID_PALETTE[idx % VIVID_PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              ) : classChartType === 'line' ? (
                <LineChart data={classRows} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="sinif" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip
                    formatter={(val: unknown) =>
                      typeof val === 'number' ? formatTrNumber(val, 2) : String(val ?? '')
                    }
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey={classChartMetric}
                    name={classChartMetric === 'avgLgs' ? 'LGS Ort.' : 'Toplam Net Ort.'}
                    stroke="#7C3AED"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#EC4899', strokeWidth: 2, stroke: '#fff' }}
                  />
                </LineChart>
              ) : classChartType === 'area' ? (
                <AreaChart data={classRows} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                  <defs>
                    <linearGradient id="classAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="sinif" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip
                    formatter={(val: unknown) =>
                      typeof val === 'number' ? formatTrNumber(val, 2) : String(val ?? '')
                    }
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey={classChartMetric}
                    name={classChartMetric === 'avgLgs' ? 'LGS Ort.' : 'Toplam Net Ort.'}
                    stroke="#6366F1"
                    strokeWidth={2.5}
                    fill="url(#classAreaGrad)"
                  />
                </AreaChart>
              ) : (
                <PieChart>
                  <Tooltip
                    formatter={(val: unknown) =>
                      typeof val === 'number' ? formatTrNumber(val, 2) : String(val ?? '')
                    }
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Pie
                    data={classRows}
                    dataKey={classChartMetric}
                    nameKey="sinif"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={88}
                    paddingAngle={2}
                  >
                    {classRows.map((entry, idx) => (
                      <Cell key={entry.sinif} fill={VIVID_PALETTE[idx % VIVID_PALETTE.length]} />
                    ))}
                  </Pie>
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </section>

        {/* Chart 2: Subject Comparison (Colorful + Selectable Chart Types) */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Ders Bazlı Net Ortalamaları Karşılaştırması
              </h2>
              <p className="text-xs text-slate-500">
                {compareExam
                  ? `${compareExam.name} vs ${activeExam?.name} ve Genel Ortalama`
                  : 'Okul ders ortalamaları vs. Genel Ortalama'}
              </p>
            </div>
            <ChartTypeSelector
              value={subjectChartType}
              options={['bar', 'radar', 'line', 'area', 'pie']}
              onChange={setSubjectChartType}
            />
          </div>

          <div className="h-68 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {subjectChartType === 'bar' ? (
                <BarChart data={subjectChartData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="ders" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip
                    formatter={(val: unknown) =>
                      typeof val === 'number' ? formatTrNumber(val, 2) : String(val ?? '')
                    }
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.dersAd ?? ''}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar
                    dataKey="sonrakiOrt"
                    name={compareExam ? 'Sonraki Deneme' : 'Okul Ort. Net'}
                    fill="#2563EB"
                    radius={[5, 5, 0, 0]}
                  >
                    {!compareExam &&
                      subjectChartData.map((entry) => (
                        <Cell key={entry.ders} fill={entry.color} />
                      ))}
                  </Bar>
                  {compareExam && (
                    <Bar
                      dataKey="oncekiOrt"
                      name="Önceki Deneme"
                      fill="#F97316"
                      radius={[5, 5, 0, 0]}
                    />
                  )}
                  <Bar
                    dataKey="genelOrt"
                    name="Genel Ort. Net"
                    fill="#A855F7"
                    fillOpacity={0.45}
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              ) : subjectChartType === 'radar' ? (
                <RadarChart data={subjectChartData} cx="50%" cy="50%" outerRadius="72%">
                  <PolarGrid stroke="#CBD5E1" />
                  <PolarAngleAxis dataKey="ders" tick={{ fontSize: 11, fill: '#334155' }} />
                  <PolarRadiusAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip
                    formatter={(val: unknown) =>
                      typeof val === 'number' ? formatTrNumber(val, 2) : String(val ?? '')
                    }
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Radar
                    name={compareExam ? 'Sonraki Deneme' : 'Okul Ort.'}
                    dataKey="sonrakiOrt"
                    stroke="#2563EB"
                    fill="#3B82F6"
                    fillOpacity={0.35}
                  />
                  {compareExam && (
                    <Radar
                      name="Önceki Deneme"
                      dataKey="oncekiOrt"
                      stroke="#EA580C"
                      fill="#FB923C"
                      fillOpacity={0.28}
                    />
                  )}
                  <Radar
                    name="Genel Ort."
                    dataKey="genelOrt"
                    stroke="#10B981"
                    fill="#34D399"
                    fillOpacity={0.2}
                  />
                </RadarChart>
              ) : subjectChartType === 'line' ? (
                <LineChart data={subjectChartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="ders" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip
                    formatter={(val: unknown) =>
                      typeof val === 'number' ? formatTrNumber(val, 2) : String(val ?? '')
                    }
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.dersAd ?? ''}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="sonrakiOrt"
                    name={compareExam ? 'Sonraki Deneme' : 'Okul Ort.'}
                    stroke="#2563EB"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                  {compareExam && (
                    <Line
                      type="monotone"
                      dataKey="oncekiOrt"
                      name="Önceki Deneme"
                      stroke="#F97316"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="genelOrt"
                    name="Genel Ort."
                    stroke="#10B981"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              ) : subjectChartType === 'area' ? (
                <AreaChart data={subjectChartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="ders" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip
                    formatter={(val: unknown) =>
                      typeof val === 'number' ? formatTrNumber(val, 2) : String(val ?? '')
                    }
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.dersAd ?? ''}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area
                    type="monotone"
                    dataKey="sonrakiOrt"
                    name={compareExam ? 'Sonraki Deneme' : 'Okul Ort.'}
                    stroke="#2563EB"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                    strokeWidth={2.5}
                  />
                  {compareExam && (
                    <Area
                      type="monotone"
                      dataKey="oncekiOrt"
                      name="Önceki Deneme"
                      stroke="#F97316"
                      fill="#FB923C"
                      fillOpacity={0.22}
                      strokeWidth={2}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="genelOrt"
                    name="Genel Ort."
                    stroke="#10B981"
                    fill="#34D399"
                    fillOpacity={0.18}
                    strokeWidth={2}
                  />
                </AreaChart>
              ) : (
                <PieChart>
                  <Tooltip
                    formatter={(val: unknown) =>
                      typeof val === 'number' ? `${formatTrNumber(val, 2)} Net` : String(val ?? '')
                    }
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Pie
                    data={subjectChartData.filter((d) => d.sonrakiOrt > 0)}
                    dataKey="sonrakiOrt"
                    nameKey="dersAd"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={88}
                    paddingAngle={3}
                  >
                    {subjectChartData
                      .filter((d) => d.sonrakiOrt > 0)
                      .map((entry) => (
                        <Cell key={entry.ders} fill={entry.color} />
                      ))}
                  </Pie>
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Multi-Exam School Progression Chart (shown whenever 2+ exams exist) */}
      {sortedExams.length >= 2 && (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Denemeler Arası Okul Gelişim Grafiği (Önceki → Sonraki)
              </h2>
              <p className="text-xs text-slate-500">
                Tüm denemeler boyunca toplam net veya 6 dersin ayrı ayrı ilerleyişini takip edin.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setTrendMode('overall')}
                  className={`rounded-md px-2.5 py-1 font-semibold ${
                    trendMode === 'overall' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Toplam Net
                </button>
                <button
                  type="button"
                  onClick={() => setTrendMode('subjects')}
                  className={`rounded-md px-2.5 py-1 font-semibold ${
                    trendMode === 'subjects' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Ders Ders (6 Renk)
                </button>
              </div>
              <ChartTypeSelector
                value={trendChartType}
                options={['area', 'line', 'bar']}
                onChange={setTrendChartType}
              />
            </div>
          </div>

          <div className="h-68 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {trendChartType === 'bar' ? (
                <BarChart data={examTrendData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip
                    formatter={(val: unknown) =>
                      typeof val === 'number' ? formatTrNumber(val, 2) : String(val ?? '')
                    }
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  {trendMode === 'overall' ? (
                    <>
                      <Bar dataKey="okulNet" name="Okul Toplam Net" fill="#2563EB" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="genelNet" name="Genel Toplam Net" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </>
                  ) : (
                    SUBJECT_LIST.map((s) => (
                      <Bar
                        key={s.key}
                        dataKey={s.key}
                        name={s.label}
                        fill={s.color}
                        radius={[3, 3, 0, 0]}
                      />
                    ))
                  )}
                </BarChart>
              ) : trendChartType === 'line' ? (
                <LineChart data={examTrendData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip
                    formatter={(val: unknown) =>
                      typeof val === 'number' ? formatTrNumber(val, 2) : String(val ?? '')
                    }
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  {trendMode === 'overall' ? (
                    <>
                      <Line
                        type="monotone"
                        dataKey="okulNet"
                        name="Okul Toplam Net"
                        stroke="#2563EB"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="genelNet"
                        name="Genel Toplam Net"
                        stroke="#10B981"
                        strokeWidth={2.5}
                        strokeDasharray="4 4"
                        dot={{ r: 4 }}
                      />
                    </>
                  ) : (
                    SUBJECT_LIST.map((s) => (
                      <Line
                        key={s.key}
                        type="monotone"
                        dataKey={s.key}
                        name={s.label}
                        stroke={s.color}
                        strokeWidth={2.5}
                        dot={{ r: 4 }}
                      />
                    ))
                  )}
                </LineChart>
              ) : (
                <AreaChart data={examTrendData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip
                    formatter={(val: unknown) =>
                      typeof val === 'number' ? formatTrNumber(val, 2) : String(val ?? '')
                    }
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  {trendMode === 'overall' ? (
                    <>
                      <Area
                        type="monotone"
                        dataKey="okulNet"
                        name="Okul Toplam Net"
                        stroke="#2563EB"
                        fill="#3B82F6"
                        fillOpacity={0.28}
                        strokeWidth={2.5}
                      />
                      <Area
                        type="monotone"
                        dataKey="genelNet"
                        name="Genel Toplam Net"
                        stroke="#10B981"
                        fill="#34D399"
                        fillOpacity={0.18}
                        strokeWidth={2}
                      />
                    </>
                  ) : (
                    SUBJECT_LIST.map((s) => (
                      <Area
                        key={s.key}
                        type="monotone"
                        dataKey={s.key}
                        name={s.label}
                        stroke={s.color}
                        fill={s.color}
                        fillOpacity={0.14}
                        strokeWidth={2}
                      />
                    ))
                  )}
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Detailed Class & Student Comparison Table (User-requested student names!) */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Şube Karşılaştırma Tablosu (Ders Netleri ve Öğrenci İsimleri)
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Şube ortalamalarının hemen altında tüm öğrencilerin isimleri ve ders netleri listelenir; öğrenciye tıklayarak detay kartını açabilirsiniz.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Öğrenci veya şube ara..."
                className="w-48 rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={toggleAllClasses}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                showStudentRows
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              {showStudentRows ? 'Öğrencileri Gizle' : 'Öğrenci İsimlerini Göster'}
            </button>

            <button
              type="button"
              onClick={() => exportSchoolArchiveToExcel(state, activeExam?.id, compareExam?.id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Excel (.xlsx)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="sticky left-0 z-10 border-r border-slate-200 bg-slate-50 px-4 py-3">
                  Şube / Öğrenci Adı
                </th>
                <th className="px-3 py-3 text-right">Kişi / No</th>
                {SUBJECT_LIST.map((s) => (
                  <th key={s.key} className="px-2.5 py-3 text-right">
                    <span className="inline-flex items-center gap-1">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      {s.shortLabel} Net
                    </span>
                  </th>
                ))}
                <th className="bg-blue-50/60 px-3 py-3 text-right text-blue-900">Toplam Net</th>
                <th className="px-4 py-3 text-right">LGS Puanı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
              {filteredClassRows.map((row, classIdx) => {
                const isExpanded = showStudentRows && !collapsedClasses[row.sinif];
                const classColor = VIVID_PALETTE[classIdx % VIVID_PALETTE.length];
                return (
                  <React.Fragment key={row.sinif}>
                    {/* Class Summary Header Row */}
                    <tr
                      onClick={() => {
                        if (!showStudentRows) {
                          setShowStudentRows(true);
                          setCollapsedClasses((prev) => {
                            const next: Record<string, boolean> = {};
                            for (const r of classRows) next[r.sinif] = r.sinif !== row.sinif;
                            return next;
                          });
                        } else {
                          toggleClassExpand(row.sinif);
                        }
                      }}
                      className="cursor-pointer bg-slate-50/90 font-semibold transition-colors hover:bg-slate-100/80"
                    >
                      <td className="sticky left-0 z-10 border-r border-slate-200 bg-slate-50/95 px-4 py-2.5 font-sans">
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
                          )}
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: classColor }}
                          />
                          <span className="font-bold text-slate-900">{row.sinif}</span>
                          <span className="text-[11px] font-medium text-slate-500">
                            (Şube Ortalaması)
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-600">
                        {row.studentCount} öğr.
                      </td>
                      {SUBJECT_LIST.map((s) => {
                        const diff = row.subjectNetDeltas[s.key];
                        return (
                          <td key={s.key} className="px-2.5 py-2.5 text-right text-slate-800">
                            <div>{formatTrNumber(row.subjectNets[s.key], 2)}</div>
                            {diff !== undefined && (
                              <div
                                className={`text-[10px] ${
                                  diff >= 0 ? 'text-emerald-700' : 'text-red-700'
                                }`}
                              >
                                {formatTrDelta(diff, 2)}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="bg-blue-50/40 px-3 py-2.5 text-right font-bold text-blue-800">
                        <div>{formatTrNumber(row.avgToplamNet, 2)}</div>
                        {row.avgNetDelta !== undefined && (
                          <div
                            className={`text-[10px] ${
                              row.avgNetDelta >= 0 ? 'text-emerald-700' : 'text-red-700'
                            }`}
                          >
                            {formatTrDelta(row.avgNetDelta, 2)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                        <div>{formatTrNumber(row.avgLgs, 2)}</div>
                        {row.avgLgsDelta !== undefined && (
                          <div
                            className={`text-[10px] ${
                              row.avgLgsDelta >= 0 ? 'text-emerald-700' : 'text-red-700'
                            }`}
                          >
                            {formatTrDelta(row.avgLgsDelta, 1)} p
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Per-Student Rows Inside Each Class */}
                    {isExpanded &&
                      row.students.map((st) => (
                        <tr
                          key={st.studentId}
                          onClick={() => onSelectStudent(st.studentId)}
                          className="cursor-pointer bg-white transition-colors hover:bg-blue-50/50"
                        >
                          <td className="sticky left-0 z-10 border-r border-slate-200 bg-white py-2 pl-10 pr-4 font-sans">
                            <span className="font-medium text-slate-900 hover:text-blue-700">
                              {st.name}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right text-[11px] text-slate-400">
                            #{st.numara}
                          </td>
                          {SUBJECT_LIST.map((s) => {
                            const net = st.subjectNets[s.key];
                            const diff = st.subjectNetDeltas[s.key];
                            return (
                              <td
                                key={s.key}
                                className={`px-2.5 py-2 text-right ${
                                  net < 0 ? 'font-semibold text-red-700' : 'text-slate-700'
                                }`}
                              >
                                <span>{formatTrNumber(net, 2)}</span>
                                {diff !== undefined && (
                                  <span
                                    className={`ml-1 text-[10px] ${
                                      diff >= 0 ? 'text-emerald-700' : 'text-red-700'
                                    }`}
                                  >
                                    ({formatTrDelta(diff, 1)})
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          <td className="bg-blue-50/20 px-3 py-2 text-right font-semibold text-blue-700">
                            <span>{formatTrNumber(st.toplamNet, 2)}</span>
                            {st.toplamNetDelta !== undefined && (
                              <span
                                className={`ml-1 text-[10px] ${
                                  st.toplamNetDelta >= 0 ? 'text-emerald-700' : 'text-red-700'
                                }`}
                              >
                                ({formatTrDelta(st.toplamNetDelta, 2)})
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right font-semibold text-slate-900">
                            {formatTrNumber(st.lgsPuan, 2)}
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Top Performers & Risers */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-3.5">
            <h2 className="text-sm font-bold text-slate-900">Okul Liderlik Tablosu (İlk 8)</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {topPerformers.map(({ student, summary }, idx) => (
              <button
                key={student.id}
                type="button"
                onClick={() => onSelectStudent(student.id)}
                className="flex w-full items-center justify-between px-5 py-2.5 text-left transition-colors hover:bg-slate-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="w-5 font-mono text-xs font-bold tabular-nums"
                    style={{ color: VIVID_PALETTE[idx % VIVID_PALETTE.length] }}
                  >
                    {idx + 1}.
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">
                      {student.name}
                    </div>
                    <div className="text-xs text-slate-500 tabular-nums">
                      {student.sinif} · No: {student.numara}
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <div className="text-sm font-bold text-slate-900">
                    {formatTrNumber(summary.latest.lgsPuan, 2)}
                  </div>
                  <div className="text-xs text-blue-700">
                    {formatTrNumber(summary.latest.toplam.net, 2)} Net
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-3.5">
            <h2 className="text-sm font-bold text-slate-900">
              En Çok Gelişim Gösterenler
              {compareExam && activeExam ? ` (${compareExam.name} → ${activeExam.name})` : ''}
            </h2>
          </div>
          {topRisers.length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-slate-500">
              Öğrenci gelişim sıralaması en az 2 deneme yüklendiğinde otomatik hesaplanır.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {topRisers.map(({ student, deltaNet, curNet }) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => onSelectStudent(student.id)}
                  className="flex w-full items-center justify-between px-5 py-2.5 text-left transition-colors hover:bg-slate-50"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{student.name}</div>
                    <div className="text-xs text-slate-500 tabular-nums">
                      {student.sinif} · Güncel: {formatTrNumber(curNet, 2)} Net
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-sm font-bold tabular-nums">
                    {deltaNet >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    )}
                    <span className={deltaNet >= 0 ? 'text-emerald-700' : 'text-red-700'}>
                      {formatTrDelta(deltaNet, 2)} Net
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
