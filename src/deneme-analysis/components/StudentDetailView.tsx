import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Download,
  Printer,
  Plus,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  BookOpen,
  GitCompareArrows,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
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
  SUBJECT_LIST,
  SUBJECT_MAP,
  SubjectKey,
  StudentExamRecord,
  StudentProfile,
} from '../types/exam';
import {
  aggregateStudentKazanimlar,
  buildStudentSubjectDiagnostics,
  exportStudentArchiveCsv,
  formatTrDelta,
  formatTrNumber,
  getSortedExams,
  getStudentProgressSummary,
} from '../utils/analytics';
import { ManualExamModal } from './ManualExamModal';
import { ChartKind, ChartTypeSelector, VIVID_PALETTE } from './ChartTypeSelector';
import { exportStudentToExcel } from '../utils/excelHandler';

interface StudentDetailViewProps {
  student: StudentProfile;
  nextExamOrder: number;
  onBack: () => void;
  onAddManualExam: (studentId: string, record: StudentExamRecord) => void;
  onOpenUpload: () => void;
}

export const StudentDetailView: React.FC<StudentDetailViewProps> = ({
  student,
  nextExamOrder,
  onBack,
  onAddManualExam,
  onOpenUpload,
}) => {
  const sortedExams = useMemo(() => getSortedExams(student), [student]);
  const summary = useMemo(() => getStudentProgressSummary(student), [student]);
  const diagnostics = useMemo(() => buildStudentSubjectDiagnostics(student), [student]);
  const kazanimlar = useMemo(() => aggregateStudentKazanimlar(student), [student]);

  const [tableMode, setTableMode] = useState<'full' | 'compact'>('full');
  const [trendMetric, setTrendMetric] = useState<'net' | 'lgs' | 'all_subjects'>('net');
  const [trendChartType, setTrendChartType] = useState<ChartKind>('area');
  const [subjectChartType, setSubjectChartType] = useState<ChartKind>('bar');
  const [dybChartType, setDybChartType] = useState<ChartKind>('bar');
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey>('matematik');

  // Pair selection for Önceki ↔ Sonraki exam comparison
  const [baseExamId, setBaseExamId] = useState<string>('AUTO_PREV');
  const [targetExamId, setTargetExamId] = useState<string>('AUTO_LATEST');

  const [kazanimSubjectFilter, setKazanimSubjectFilter] = useState<SubjectKey | 'ALL'>('ALL');
  const [kazanimStatusFilter, setKazanimStatusFilter] = useState<
    'ALL' | 'eksik' | 'gelistirilmeli' | 'basarili'
  >('eksik');
  const [isManualOpen, setIsManualOpen] = useState(false);

  const filteredKazanimlar = useMemo(() => {
    return kazanimlar.filter((k) => {
      if (kazanimSubjectFilter !== 'ALL' && k.subject !== kazanimSubjectFilter) return false;
      if (kazanimStatusFilter !== 'ALL' && k.status !== kazanimStatusFilter) return false;
      return true;
    });
  }, [kazanimlar, kazanimSubjectFilter, kazanimStatusFilter]);

  const kazanimCounts = useMemo(() => {
    const eksik = kazanimlar.filter((k) => k.status === 'eksik').length;
    const gelistirilmeli = kazanimlar.filter((k) => k.status === 'gelistirilmeli').length;
    const basarili = kazanimlar.filter((k) => k.status === 'basarili').length;
    return { eksik, gelistirilmeli, basarili, total: kazanimlar.length };
  }, [kazanimlar]);

  const compareTarget = useMemo(() => {
    if (sortedExams.length === 0) return undefined;
    if (targetExamId === 'AUTO_LATEST') return sortedExams[sortedExams.length - 1];
    return sortedExams.find((e) => e.examId === targetExamId) ?? sortedExams[sortedExams.length - 1];
  }, [sortedExams, targetExamId]);

  const compareBase = useMemo(() => {
    if (sortedExams.length < 2 || !compareTarget) return undefined;
    if (baseExamId === 'AUTO_PREV') {
      const idx = sortedExams.findIndex((e) => e.examId === compareTarget.examId);
      return idx > 0 ? sortedExams[idx - 1] : sortedExams[0];
    }
    const found = sortedExams.find((e) => e.examId === baseExamId);
    return found ?? sortedExams[0];
  }, [sortedExams, compareTarget, baseExamId]);

  if (!summary || !compareTarget) return null;

  const { latest, previous, lgsDeltaPrev, netDeltaPrev, examCount } = summary;

  // Chart 1 data: Multi-exam progression (Net, LGS, and all 6 subjects)
  const progressionData = sortedExams.map((ex, idx) => ({
    name: ex.examName.length > 18 ? `D${idx + 1}: ${ex.examName.slice(0, 14)}…` : ex.examName,
    fullName: ex.examName,
    ogrenciNet: ex.toplam.net,
    okulNet: ex.toplam.kurumOrt ?? null,
    genelNet: ex.toplam.genelOrt ?? null,
    ogrenciLgs: ex.lgsPuan,
    okulLgs: ex.okulOrtPuan ?? null,
    genelLgs: ex.genelOrtPuan ?? null,
    turkce: ex.subjects.turkce.net,
    tarih: ex.subjects.tarih.net,
    din: ex.subjects.din.net,
    ingilizce: ex.subjects.ingilizce.net,
    matematik: ex.subjects.matematik.net,
    fen: ex.subjects.fen.net,
  }));

  const singleBenchmarkData =
    trendMetric === 'all_subjects'
      ? SUBJECT_LIST.map((s) => ({
          label: s.shortLabel,
          deger: latest.subjects[s.key].net,
          color: s.color,
        }))
      : trendMetric === 'net'
      ? [
          { label: 'Öğrenci', deger: latest.toplam.net, color: '#2563EB' },
          ...(latest.toplam.sinifOrt !== undefined
            ? [{ label: `${student.sinif} Ort.`, deger: latest.toplam.sinifOrt, color: '#8B5CF6' }]
            : []),
          ...(latest.toplam.kurumOrt !== undefined
            ? [{ label: 'Okul Ort.', deger: latest.toplam.kurumOrt, color: '#10B981' }]
            : []),
          ...(latest.toplam.genelOrt !== undefined
            ? [{ label: 'Genel Ort.', deger: latest.toplam.genelOrt, color: '#F59E0B' }]
            : []),
        ]
      : [
          { label: 'Öğrenci', deger: latest.lgsPuan, color: '#2563EB' },
          ...(latest.okulOrtPuan !== undefined
            ? [{ label: 'Okul Ort.', deger: latest.okulOrtPuan, color: '#10B981' }]
            : []),
          ...(latest.genelOrtPuan !== undefined
            ? [{ label: 'Genel Ort.', deger: latest.genelOrtPuan, color: '#F59E0B' }]
            : []),
        ];

  // Chart 2 data: Subject-by-subject comparison (uses selected compareBase vs compareTarget!)
  const subjectCompareData = SUBJECT_LIST.map((s) => ({
    ders: s.shortLabel,
    dersAd: s.label,
    color: s.color,
    sonrakiDeneme: compareTarget.subjects[s.key].net,
    oncekiDeneme: compareBase ? compareBase.subjects[s.key].net : null,
    okulOrt: compareTarget.subjects[s.key].kurumOrt ?? null,
    genelOrt: compareTarget.subjects[s.key].genelOrt ?? null,
  }));

  // Chart 3 data: Selected subject D/Y/B across exams
  const subjectBreakdownData = sortedExams.map((ex, idx) => {
    const sc = ex.subjects[selectedSubject];
    return {
      name: `D${idx + 1}`,
      fullName: ex.examName,
      Doğru: sc.dogru,
      Yanlış: sc.yanlis,
      Boş: sc.bos,
      Net: sc.net,
    };
  });

  const latestSelectedSubject = compareTarget.subjects[selectedSubject];
  const dybPieData = [
    { name: 'Doğru', value: latestSelectedSubject.dogru, color: '#10B981' },
    { name: 'Yanlış', value: latestSelectedSubject.yanlis, color: '#F43F5E' },
    { name: 'Boş', value: latestSelectedSubject.bos, color: '#94A3B8' },
  ].filter((item) => item.value > 0);

  const handleExportCsv = () => {
    const csv = exportStudentArchiveCsv(student);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student.name.replace(/\s+/g, '_')}_deneme_arsivi.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Breadcrumb Row */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Öğrenci Kartlarına Dön
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsManualOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Manuel Deneme Ekle
          </button>
          <button
            type="button"
            onClick={() => exportStudentToExcel(student)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Excel İndir (.xlsx)
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Printer className="h-3.5 w-3.5" />
            Yazdır
          </button>
        </div>
      </div>

      {/* Student Identity & Summary KPI Strip */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {student.name}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500 tabular-nums">
              Şube: {student.sinif} · Okul No: {student.numara} · Toplam {examCount} Deneme Kaydı ·
              Son Sınav: {latest.examName}
            </p>
            {(latest.dereceler.sinif || latest.dereceler.okul || latest.dereceler.genel) && (
              <p className="mt-2 font-mono text-xs text-slate-600 tabular-nums">
                Dereceler —{' '}
                {latest.dereceler.sinif
                  ? `Sınıf: ${latest.dereceler.sinif}/${latest.katilimlar?.sinif ?? '?'}`
                  : ''}
                {latest.dereceler.okul
                  ? ` · Okul: ${latest.dereceler.okul}/${latest.katilimlar?.okul ?? '?'}`
                  : ''}
                {latest.dereceler.ilce
                  ? ` · İlçe: ${latest.dereceler.ilce}/${latest.katilimlar?.ilce ?? '?'}`
                  : ''}
                {latest.dereceler.il
                  ? ` · İl: ${latest.dereceler.il}/${latest.katilimlar?.il ?? '?'}`
                  : ''}
                {latest.dereceler.genel
                  ? ` · Genel: ${latest.dereceler.genel}/${latest.katilimlar?.genel ?? '?'}`
                  : ''}
                {latest.dereceler.yuzdelik !== undefined
                  ? ` (Yüzdelik: %${formatTrNumber(latest.dereceler.yuzdelik, 2)})`
                  : ''}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6 border-t border-slate-100 pt-4 sm:grid-cols-4 lg:border-t-0 lg:pt-0">
            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Son LGS Puanı
              </span>
              <span className="mt-1 block font-mono text-2xl font-bold text-slate-900 tabular-nums">
                {formatTrNumber(latest.lgsPuan, 2)}
              </span>
              {lgsDeltaPrev !== undefined ? (
                <span
                  className={`mt-0.5 inline-flex items-center font-mono text-xs font-semibold tabular-nums ${
                    lgsDeltaPrev > 0
                      ? 'text-emerald-700'
                      : lgsDeltaPrev < 0
                      ? 'text-red-700'
                      : 'text-slate-500'
                  }`}
                >
                  {lgsDeltaPrev > 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : lgsDeltaPrev < 0 ? (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  ) : (
                    <Minus className="h-3 w-3" />
                  )}
                  {formatTrDelta(lgsDeltaPrev, 2)} (Önceki)
                </span>
              ) : (
                <span className="mt-0.5 block font-mono text-xs text-slate-500 tabular-nums">
                  Okul Ort: {formatTrNumber(latest.okulOrtPuan, 1)}
                </span>
              )}
            </div>

            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Son Toplam Net
              </span>
              <span className="mt-1 block font-mono text-2xl font-bold text-blue-700 tabular-nums">
                {formatTrNumber(latest.toplam.net, 2)}
              </span>
              {netDeltaPrev !== undefined ? (
                <span
                  className={`mt-0.5 inline-flex items-center font-mono text-xs font-semibold tabular-nums ${
                    netDeltaPrev > 0
                      ? 'text-emerald-700'
                      : netDeltaPrev < 0
                      ? 'text-red-700'
                      : 'text-slate-500'
                  }`}
                >
                  {netDeltaPrev > 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : netDeltaPrev < 0 ? (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  ) : (
                    <Minus className="h-3 w-3" />
                  )}
                  {formatTrDelta(netDeltaPrev, 2)} Net
                </span>
              ) : (
                <span className="mt-0.5 block font-mono text-xs text-slate-500 tabular-nums">
                  Okul Ort: {formatTrNumber(latest.toplam.kurumOrt, 2)}
                </span>
              )}
            </div>

            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Doğru / Yanlış / Boş
              </span>
              <span className="mt-1 block font-mono text-lg font-bold text-slate-900 tabular-nums">
                <span className="text-emerald-700">{latest.toplam.dogru}D</span> /{' '}
                <span className="text-red-700">{latest.toplam.yanlis}Y</span> /{' '}
                <span className="text-slate-500">{latest.toplam.bos}B</span>
              </span>
              <span className="mt-0.5 block font-mono text-xs text-slate-500 tabular-nums">
                Başarı: %{latest.toplam.basariYuzdesi} ({latest.toplam.soru} Soru)
              </span>
            </div>

            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                En Yüksek LGS
              </span>
              <span className="mt-1 block font-mono text-2xl font-bold text-slate-900 tabular-nums">
                {formatTrNumber(summary.bestLgs, 2)}
              </span>
              <span className="mt-0.5 block font-mono text-xs text-slate-500 tabular-nums">
                Ort. Net: {formatTrNumber(summary.avgNet, 2)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Önceki ↔ Sonraki Deneme Karşılaştırma Paneli (Ders Ders & Toplam Net) */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <GitCompareArrows className="h-4 w-4 text-blue-700" />
              Önceki ve Sonraki Deneme Karşılaştırması (Ders Ders & Toplam Net)
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {compareBase
                ? 'Seçtiğiniz iki deneme arasındaki tüm derslerin D/Y/B/Net ve toplam net değişimini inceleyin.'
                : '2. deneme eklendiğinde önceki ve sonraki denemeyi ders ders ve toplam net bazında karşılaştırabilirsiniz.'}
            </p>
          </div>

          {sortedExams.length >= 2 ? (
            <div className="no-print flex flex-wrap items-center gap-2 text-xs">
              <label className="flex items-center gap-1.5 font-medium text-slate-600">
                <span>Önceki:</span>
                <select
                  value={baseExamId}
                  onChange={(e) => setBaseExamId(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
                >
                  <option value="AUTO_PREV">Bir Önceki Deneme</option>
                  {sortedExams.map((ex) => (
                    <option key={ex.examId} value={ex.examId}>
                      {ex.examName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-1.5 font-medium text-slate-600">
                <span>Sonraki:</span>
                <select
                  value={targetExamId}
                  onChange={(e) => setTargetExamId(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
                >
                  <option value="AUTO_LATEST">Son Deneme ({latest.examName})</option>
                  {sortedExams.map((ex) => (
                    <option key={ex.examId} value={ex.examId}>
                      {ex.examName}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <div className="no-print flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsManualOpen(true)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                + Manuel Deneme Ekle
              </button>
              <button
                type="button"
                onClick={onOpenUpload}
                className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
              >
                2. Deneme PDF Yükle
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[740px] border-collapse text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-2.5">Ders</th>
                {compareBase ? (
                  <>
                    <th className="px-3 py-2.5 text-right">
                      Önceki ({compareBase.examName.slice(0, 18)})
                    </th>
                    <th className="px-3 py-2.5 text-right">
                      Sonraki ({compareTarget.examName.slice(0, 18)})
                    </th>
                    <th className="px-3 py-2.5 text-right">Net Değişimi (Δ)</th>
                    <th className="px-3 py-2.5 text-right">D / Y / B Farkı</th>
                    <th className="px-4 py-2.5 text-right">Başarı % Farkı</th>
                  </>
                ) : (
                  <>
                    <th className="px-3 py-2.5 text-right">Öğrenci (D · Y · B)</th>
                    <th className="px-3 py-2.5 text-right">Öğrenci Net</th>
                    <th className="px-3 py-2.5 text-right">Sınıf Ort.</th>
                    <th className="px-3 py-2.5 text-right">Okul Ort.</th>
                    <th className="px-3 py-2.5 text-right">Genel Ort.</th>
                    <th className="px-4 py-2.5 text-right">Okula Göre Fark</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
              {SUBJECT_LIST.map((s) => {
                const cur = compareTarget.subjects[s.key];
                const prev = compareBase?.subjects[s.key];
                if (prev) {
                  const netDiff = Math.round((cur.net - prev.net) * 100) / 100;
                  const dDiff = cur.dogru - prev.dogru;
                  const yDiff = cur.yanlis - prev.yanlis;
                  const bDiff = cur.bos - prev.bos;
                  const pctDiff = cur.basariYuzdesi - prev.basariYuzdesi;
                  return (
                    <tr key={s.key} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2.5 font-sans font-semibold text-slate-900">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: s.color }}
                          />
                          {s.label} ({s.questionCount})
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-600">
                        <span className="font-semibold text-slate-800">
                          {formatTrNumber(prev.net, 2)}
                        </span>{' '}
                        <span className="text-[10px] text-slate-400">
                          ({prev.dogru}D {prev.yanlis}Y {prev.bos}B)
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-700">
                        <span className="font-bold text-slate-900">
                          {formatTrNumber(cur.net, 2)}
                        </span>{' '}
                        <span className="text-[10px] text-slate-400">
                          ({cur.dogru}D {cur.yanlis}Y {cur.bos}B)
                        </span>
                      </td>
                      <td
                        className={`px-3 py-2.5 text-right font-bold ${
                          netDiff > 0
                            ? 'text-emerald-700'
                            : netDiff < 0
                            ? 'text-red-700'
                            : 'text-slate-500'
                        }`}
                      >
                        {netDiff > 0 ? '▲ ' : netDiff < 0 ? '▼ ' : ''}
                        {formatTrDelta(netDiff, 2)} Net
                      </td>
                      <td className="px-3 py-2.5 text-right text-[11px] text-slate-600">
                        {dDiff >= 0 ? `+${dDiff}` : dDiff}D / {yDiff >= 0 ? `+${yDiff}` : yDiff}Y /{' '}
                        {bDiff >= 0 ? `+${bDiff}` : bDiff}B
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right font-semibold ${
                          pctDiff > 0
                            ? 'text-emerald-700'
                            : pctDiff < 0
                            ? 'text-red-700'
                            : 'text-slate-500'
                        }`}
                      >
                        {pctDiff > 0 ? `+${pctDiff}` : pctDiff}%
                      </td>
                    </tr>
                  );
                }

                const vsSchool =
                  cur.kurumOrt !== undefined
                    ? Math.round((cur.net - cur.kurumOrt) * 100) / 100
                    : undefined;
                return (
                  <tr key={s.key} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2.5 font-sans font-semibold text-slate-900">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        {s.label} ({s.questionCount})
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-600">
                      <span className="text-emerald-700">{cur.dogru}D</span> ·{' '}
                      <span className="text-red-700">{cur.yanlis}Y</span> ·{' '}
                      <span className="text-slate-400">{cur.bos}B</span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-slate-900">
                      {formatTrNumber(cur.net, 2)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-600">
                      {formatTrNumber(cur.sinifOrt, 2)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-600">
                      {formatTrNumber(cur.kurumOrt, 2)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-600">
                      {formatTrNumber(cur.genelOrt, 2)}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right font-semibold ${
                        vsSchool === undefined
                          ? 'text-slate-400'
                          : vsSchool >= 0
                          ? 'text-emerald-700'
                          : 'text-red-700'
                      }`}
                    >
                      {vsSchool !== undefined ? `${formatTrDelta(vsSchool, 2)} Net` : '—'}
                    </td>
                  </tr>
                );
              })}

              {/* TOPLAM NET Comparison Row */}
              {compareBase ? (
                <tr className="border-t-2 border-slate-300 bg-blue-50/50 font-bold">
                  <td className="px-4 py-3 font-sans text-blue-950">TOPLAM NET (90 Soru)</td>
                  <td className="px-3 py-3 text-right text-slate-800">
                    {formatTrNumber(compareBase.toplam.net, 2)}{' '}
                    <span className="text-[10px] font-normal text-slate-500">
                      ({compareBase.toplam.dogru}D {compareBase.toplam.yanlis}Y{' '}
                      {compareBase.toplam.bos}B)
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right text-blue-900">
                    {formatTrNumber(compareTarget.toplam.net, 2)}{' '}
                    <span className="text-[10px] font-normal text-slate-600">
                      ({compareTarget.toplam.dogru}D {compareTarget.toplam.yanlis}Y{' '}
                      {compareTarget.toplam.bos}B)
                    </span>
                  </td>
                  {(() => {
                    const tDiff =
                      Math.round((compareTarget.toplam.net - compareBase.toplam.net) * 100) / 100;
                    const dDiff = compareTarget.toplam.dogru - compareBase.toplam.dogru;
                    const yDiff = compareTarget.toplam.yanlis - compareBase.toplam.yanlis;
                    const bDiff = compareTarget.toplam.bos - compareBase.toplam.bos;
                    const lgsDiff =
                      Math.round((compareTarget.lgsPuan - compareBase.lgsPuan) * 100) / 100;
                    return (
                      <>
                        <td
                          className={`px-3 py-3 text-right ${
                            tDiff > 0
                              ? 'text-emerald-700'
                              : tDiff < 0
                              ? 'text-red-700'
                              : 'text-slate-600'
                          }`}
                        >
                          {tDiff > 0 ? '▲ ' : tDiff < 0 ? '▼ ' : ''}
                          {formatTrDelta(tDiff, 2)} Net
                        </td>
                        <td className="px-3 py-3 text-right text-[11px] text-slate-700">
                          {dDiff >= 0 ? `+${dDiff}` : dDiff}D / {yDiff >= 0 ? `+${yDiff}` : yDiff}Y
                          / {bDiff >= 0 ? `+${bDiff}` : bDiff}B
                        </td>
                        <td
                          className={`px-4 py-3 text-right ${
                            lgsDiff >= 0 ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          LGS {formatTrDelta(lgsDiff, 2)} p
                        </td>
                      </>
                    );
                  })()}
                </tr>
              ) : (
                <tr className="border-t-2 border-slate-300 bg-blue-50/50 font-bold">
                  <td className="px-4 py-3 font-sans text-blue-950">TOPLAM NET (90 Soru)</td>
                  <td className="px-3 py-3 text-right">
                    <span className="text-emerald-700">{compareTarget.toplam.dogru}D</span> ·{' '}
                    <span className="text-red-700">{compareTarget.toplam.yanlis}Y</span> ·{' '}
                    <span className="text-slate-500">{compareTarget.toplam.bos}B</span>
                  </td>
                  <td className="px-3 py-3 text-right text-blue-800">
                    {formatTrNumber(compareTarget.toplam.net, 2)}
                  </td>
                  <td className="px-3 py-3 text-right text-slate-700">
                    {formatTrNumber(compareTarget.toplam.sinifOrt, 2)}
                  </td>
                  <td className="px-3 py-3 text-right text-slate-700">
                    {formatTrNumber(compareTarget.toplam.kurumOrt, 2)}
                  </td>
                  <td className="px-3 py-3 text-right text-slate-700">
                    {formatTrNumber(compareTarget.toplam.genelOrt, 2)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right ${
                      compareTarget.toplam.kurumOrt !== undefined &&
                      compareTarget.toplam.net >= compareTarget.toplam.kurumOrt
                        ? 'text-emerald-700'
                        : 'text-red-700'
                    }`}
                  >
                    {compareTarget.toplam.kurumOrt !== undefined
                      ? `${formatTrDelta(
                          compareTarget.toplam.net - compareTarget.toplam.kurumOrt,
                          2
                        )} Net`
                      : '—'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Row-by-Row Deneme Arşivi Table */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Satır Satır Deneme Arşivi (Tüm Dersler · Doğru / Yanlış / Boş / Net)
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Her yeni deneme PDF&apos;i yüklendiğinde bu öğrencinin sonuçları otomatik olarak yeni satır olarak eklenir.
            </p>
          </div>
          <div className="no-print inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => setTableMode('full')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                tableMode === 'full'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tam D·Y·B·Net Sütunları
            </button>
            <button
              type="button"
              onClick={() => setTableMode('compact')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                tableMode === 'compact'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kompakt Görünüm
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {tableMode === 'full' ? (
            <table className="w-full min-w-[1440px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">
                  <th
                    rowSpan={2}
                    className="sticky left-0 z-10 border-r border-slate-200 bg-slate-50 px-4 py-2.5 align-bottom"
                  >
                    Deneme Adı / Tarih
                  </th>
                  {SUBJECT_LIST.map((s) => (
                    <th
                      key={s.key}
                      colSpan={4}
                      className="border-r border-slate-200 px-2 py-2 text-center font-bold text-slate-800"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        {s.label} ({s.questionCount})
                      </span>
                    </th>
                  ))}
                  <th
                    colSpan={4}
                    className="border-r border-slate-200 bg-blue-50/70 px-2 py-2 text-center font-bold text-blue-900"
                  >
                    TOPLAM (90)
                  </th>
                  <th rowSpan={2} className="px-3 py-2.5 text-right align-bottom">
                    LGS Puanı
                  </th>
                  <th rowSpan={2} className="px-3 py-2.5 text-right align-bottom">
                    Δ Önceki Net
                  </th>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50/80 font-mono text-[10px] font-semibold text-slate-500">
                  {SUBJECT_LIST.map((s) => (
                    <React.Fragment key={`${s.key}_sub`}>
                      <th className="px-1.5 py-1.5 text-right text-emerald-700">D</th>
                      <th className="px-1.5 py-1.5 text-right text-red-700">Y</th>
                      <th className="px-1.5 py-1.5 text-right text-slate-500">B</th>
                      <th className="border-r border-slate-200 px-2 py-1.5 text-right text-slate-800">
                        Net
                      </th>
                    </React.Fragment>
                  ))}
                  <th className="bg-blue-50/50 px-1.5 py-1.5 text-right text-emerald-700">D</th>
                  <th className="bg-blue-50/50 px-1.5 py-1.5 text-right text-red-700">Y</th>
                  <th className="bg-blue-50/50 px-1.5 py-1.5 text-right text-slate-600">B</th>
                  <th className="border-r border-slate-200 bg-blue-50/50 px-2 py-1.5 text-right text-blue-900">
                    Net
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
                {sortedExams.map((ex, idx) => {
                  const prevEx = idx > 0 ? sortedExams[idx - 1] : undefined;
                  const deltaNet = prevEx
                    ? Math.round((ex.toplam.net - prevEx.toplam.net) * 100) / 100
                    : undefined;
                  const deltaLgs = prevEx
                    ? Math.round((ex.lgsPuan - prevEx.lgsPuan) * 100) / 100
                    : undefined;
                  return (
                    <tr key={ex.examId} className="hover:bg-slate-50/80">
                      <td className="sticky left-0 z-10 border-r border-slate-200 bg-white px-4 py-2.5 font-sans">
                        <div className="font-semibold text-slate-900">{ex.examName}</div>
                        <div className="font-mono text-[11px] text-slate-400">
                          {ex.examDate}
                          {ex.dereceler.okul ? ` · Okul #${ex.dereceler.okul}` : ''}
                        </div>
                      </td>
                      {SUBJECT_LIST.map((s) => {
                        const sc = ex.subjects[s.key];
                        return (
                          <React.Fragment key={`${ex.examId}_${s.key}`}>
                            <td className="px-1.5 py-2.5 text-right text-emerald-700">
                              {sc.dogru}
                            </td>
                            <td className="px-1.5 py-2.5 text-right text-red-700">{sc.yanlis}</td>
                            <td className="px-1.5 py-2.5 text-right text-slate-400">{sc.bos}</td>
                            <td
                              className={`border-r border-slate-200 px-2 py-2.5 text-right font-semibold ${
                                sc.net < 0 ? 'text-red-700' : 'text-slate-900'
                              }`}
                            >
                              {formatTrNumber(sc.net, 2)}
                            </td>
                          </React.Fragment>
                        );
                      })}
                      <td className="bg-blue-50/30 px-1.5 py-2.5 text-right font-semibold text-emerald-700">
                        {ex.toplam.dogru}
                      </td>
                      <td className="bg-blue-50/30 px-1.5 py-2.5 text-right font-semibold text-red-700">
                        {ex.toplam.yanlis}
                      </td>
                      <td className="bg-blue-50/30 px-1.5 py-2.5 text-right text-slate-500">
                        {ex.toplam.bos}
                      </td>
                      <td className="border-r border-slate-200 bg-blue-50/30 px-2 py-2.5 text-right font-bold text-blue-800">
                        {formatTrNumber(ex.toplam.net, 2)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-slate-900">
                        <div>{formatTrNumber(ex.lgsPuan, 2)}</div>
                        {deltaLgs !== undefined && (
                          <div
                            className={`text-[10px] font-medium ${
                              deltaLgs >= 0 ? 'text-emerald-700' : 'text-red-700'
                            }`}
                          >
                            {formatTrDelta(deltaLgs, 1)} p
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold">
                        {deltaNet === undefined ? (
                          <span className="text-slate-400">İlk Deneme</span>
                        ) : (
                          <span
                            className={
                              deltaNet > 0
                                ? 'text-emerald-700'
                                : deltaNet < 0
                                ? 'text-red-700'
                                : 'text-slate-500'
                            }
                          >
                            {deltaNet > 0 ? '▲ ' : deltaNet < 0 ? '▼ ' : ''}
                            {formatTrDelta(deltaNet, 2)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {previous && (
                <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-mono text-xs font-semibold tabular-nums">
                  <tr>
                    <td className="sticky left-0 z-10 border-r border-slate-200 bg-slate-50 px-4 py-2.5 font-sans text-slate-900">
                      Son İki Deneme Farkı (Δ)
                    </td>
                    {SUBJECT_LIST.map((s) => {
                      const dDiff = latest.subjects[s.key].dogru - previous.subjects[s.key].dogru;
                      const yDiff = latest.subjects[s.key].yanlis - previous.subjects[s.key].yanlis;
                      const bDiff = latest.subjects[s.key].bos - previous.subjects[s.key].bos;
                      const nDiff =
                        Math.round(
                          (latest.subjects[s.key].net - previous.subjects[s.key].net) * 100
                        ) / 100;
                      return (
                        <React.Fragment key={`diff_${s.key}`}>
                          <td className="px-1.5 py-2.5 text-right text-slate-600">
                            {dDiff > 0 ? `+${dDiff}` : dDiff}
                          </td>
                          <td className="px-1.5 py-2.5 text-right text-slate-600">
                            {yDiff > 0 ? `+${yDiff}` : yDiff}
                          </td>
                          <td className="px-1.5 py-2.5 text-right text-slate-500">
                            {bDiff > 0 ? `+${bDiff}` : bDiff}
                          </td>
                          <td
                            className={`border-r border-slate-200 px-2 py-2.5 text-right ${
                              nDiff > 0
                                ? 'text-emerald-700'
                                : nDiff < 0
                                ? 'text-red-700'
                                : 'text-slate-500'
                            }`}
                          >
                            {formatTrDelta(nDiff, 2)}
                          </td>
                        </React.Fragment>
                      );
                    })}
                    <td className="bg-blue-50/40 px-1.5 py-2.5 text-right text-slate-700">
                      {latest.toplam.dogru - previous.toplam.dogru >= 0
                        ? `+${latest.toplam.dogru - previous.toplam.dogru}`
                        : latest.toplam.dogru - previous.toplam.dogru}
                    </td>
                    <td className="bg-blue-50/40 px-1.5 py-2.5 text-right text-slate-700">
                      {latest.toplam.yanlis - previous.toplam.yanlis >= 0
                        ? `+${latest.toplam.yanlis - previous.toplam.yanlis}`
                        : latest.toplam.yanlis - previous.toplam.yanlis}
                    </td>
                    <td className="bg-blue-50/40 px-1.5 py-2.5 text-right text-slate-500">
                      {latest.toplam.bos - previous.toplam.bos >= 0
                        ? `+${latest.toplam.bos - previous.toplam.bos}`
                        : latest.toplam.bos - previous.toplam.bos}
                    </td>
                    <td
                      className={`border-r border-slate-200 bg-blue-50/40 px-2 py-2.5 text-right ${
                        (netDeltaPrev ?? 0) >= 0 ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {formatTrDelta(netDeltaPrev, 2)}
                    </td>
                    <td
                      className={`px-3 py-2.5 text-right ${
                        (lgsDeltaPrev ?? 0) >= 0 ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {formatTrDelta(lgsDeltaPrev, 2)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-500">—</td>
                  </tr>
                </tfoot>
              )}
            </table>
          ) : (
            <table className="w-full min-w-[920px] border-collapse text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-2.5">Deneme</th>
                  {SUBJECT_LIST.map((s) => (
                    <th key={s.key} className="px-2.5 py-2.5 text-right">
                      {s.shortLabel} (D·Y·B / Net)
                    </th>
                  ))}
                  <th className="bg-blue-50/60 px-3 py-2.5 text-right text-blue-900">
                    Toplam (D·Y·B / Net)
                  </th>
                  <th className="px-3 py-2.5 text-right">LGS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
                {sortedExams.map((ex, idx) => {
                  const prevEx = idx > 0 ? sortedExams[idx - 1] : undefined;
                  return (
                    <tr key={ex.examId} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2.5 font-sans">
                        <div className="font-semibold text-slate-900">{ex.examName}</div>
                        <div className="font-mono text-[11px] text-slate-400">{ex.examDate}</div>
                      </td>
                      {SUBJECT_LIST.map((s) => {
                        const sc = ex.subjects[s.key];
                        const diff = prevEx
                          ? Math.round((sc.net - prevEx.subjects[s.key].net) * 100) / 100
                          : undefined;
                        return (
                          <td key={s.key} className="px-2.5 py-2.5 text-right">
                            <div
                              className={`font-bold ${
                                sc.net < 0 ? 'text-red-700' : 'text-slate-900'
                              }`}
                            >
                              {formatTrNumber(sc.net, 2)}
                              {diff !== undefined && (
                                <span
                                  className={`ml-1 text-[10px] ${
                                    diff >= 0 ? 'text-emerald-700' : 'text-red-700'
                                  }`}
                                >
                                  ({formatTrDelta(diff, 1)})
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {sc.dogru}D · {sc.yanlis}Y · {sc.bos}B
                            </div>
                          </td>
                        );
                      })}
                      <td className="bg-blue-50/30 px-3 py-2.5 text-right">
                        <div className="font-bold text-blue-800">
                          {formatTrNumber(ex.toplam.net, 2)}
                        </div>
                        <div className="text-[10px] text-slate-600">
                          {ex.toplam.dogru}D · {ex.toplam.yanlis}Y · {ex.toplam.bos}B
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-slate-900">
                        {formatTrNumber(ex.lgsPuan, 2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Colorful Comparison Charts Grid with Selectable Chart Types */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Chart 1: Progression / Benchmark */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {examCount >= 2
                    ? 'Denemeler Arası Gelişim Grafiği'
                    : 'Ortalama & Ders Performans Grafiği'}
                </h2>
                <p className="text-xs text-slate-500">
                  Toplam net, LGS puanı veya 6 dersi birlikte inceleyin.
                </p>
              </div>
              <ChartTypeSelector
                value={trendChartType}
                options={examCount >= 2 ? ['area', 'line', 'bar'] : ['bar', 'hbar', 'pie']}
                onChange={setTrendChartType}
              />
            </div>

            <div className="no-print inline-flex w-fit rounded-lg border border-slate-200 bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => setTrendMetric('net')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                  trendMetric === 'net' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Toplam Net
              </button>
              <button
                type="button"
                onClick={() => setTrendMetric('lgs')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                  trendMetric === 'lgs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                LGS Puanı
              </button>
              <button
                type="button"
                onClick={() => setTrendMetric('all_subjects')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                  trendMetric === 'all_subjects'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                Tüm Dersler (6 Renk)
              </button>
            </div>
          </div>

          <div className="h-68 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {examCount >= 2 ? (
                trendChartType === 'bar' ? (
                  <BarChart data={progressionData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
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
                    {trendMetric === 'all_subjects' ? (
                      SUBJECT_LIST.map((s) => (
                        <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} />
                      ))
                    ) : (
                      <>
                        <Bar
                          dataKey={trendMetric === 'net' ? 'ogrenciNet' : 'ogrenciLgs'}
                          name={student.name}
                          fill="#2563EB"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey={trendMetric === 'net' ? 'okulNet' : 'okulLgs'}
                          name="Okul Ort."
                          fill="#10B981"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey={trendMetric === 'net' ? 'genelNet' : 'genelLgs'}
                          name="Genel Ort."
                          fill="#F59E0B"
                          radius={[4, 4, 0, 0]}
                        />
                      </>
                    )}
                  </BarChart>
                ) : trendChartType === 'line' ? (
                  <LineChart data={progressionData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
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
                    {trendMetric === 'all_subjects' ? (
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
                    ) : (
                      <>
                        <Line
                          type="monotone"
                          dataKey={trendMetric === 'net' ? 'ogrenciNet' : 'ogrenciLgs'}
                          name={student.name}
                          stroke="#2563EB"
                          strokeWidth={3}
                          dot={{ r: 5, fill: '#2563EB' }}
                        />
                        <Line
                          type="monotone"
                          dataKey={trendMetric === 'net' ? 'okulNet' : 'okulLgs'}
                          name="Okul Ort."
                          stroke="#10B981"
                          strokeWidth={2.25}
                          strokeDasharray="4 4"
                          dot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey={trendMetric === 'net' ? 'genelNet' : 'genelLgs'}
                          name="Genel Ort."
                          stroke="#F59E0B"
                          strokeWidth={2}
                          strokeDasharray="3 3"
                          dot={{ r: 3 }}
                        />
                      </>
                    )}
                  </LineChart>
                ) : (
                  <AreaChart data={progressionData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
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
                    {trendMetric === 'all_subjects' ? (
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
                    ) : (
                      <>
                        <Area
                          type="monotone"
                          dataKey={trendMetric === 'net' ? 'ogrenciNet' : 'ogrenciLgs'}
                          name={student.name}
                          stroke="#2563EB"
                          fill="#3B82F6"
                          fillOpacity={0.28}
                          strokeWidth={2.5}
                        />
                        <Area
                          type="monotone"
                          dataKey={trendMetric === 'net' ? 'okulNet' : 'okulLgs'}
                          name="Okul Ort."
                          stroke="#10B981"
                          fill="#34D399"
                          fillOpacity={0.18}
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey={trendMetric === 'net' ? 'genelNet' : 'genelLgs'}
                          name="Genel Ort."
                          stroke="#F59E0B"
                          fill="#FBBF24"
                          fillOpacity={0.14}
                          strokeWidth={2}
                        />
                      </>
                    )}
                  </AreaChart>
                )
              ) : trendChartType === 'pie' ? (
                <PieChart>
                  <Tooltip
                    formatter={(val: unknown) =>
                      typeof val === 'number' ? formatTrNumber(val, 2) : String(val ?? '')
                    }
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Pie
                    data={singleBenchmarkData.filter((d) => d.deger > 0)}
                    dataKey="deger"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={88}
                    paddingAngle={3}
                  >
                    {singleBenchmarkData
                      .filter((d) => d.deger > 0)
                      .map((entry, idx) => (
                        <Cell key={entry.label} fill={entry.color || VIVID_PALETTE[idx % VIVID_PALETTE.length]} />
                      ))}
                  </Pie>
                </PieChart>
              ) : trendChartType === 'hbar' ? (
                <BarChart
                  data={singleBenchmarkData}
                  layout="vertical"
                  margin={{ top: 8, right: 16, left: 16, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis type="category" dataKey="label" width={70} tick={{ fontSize: 11, fill: '#334155' }} />
                  <Tooltip
                    formatter={(val: unknown) =>
                      typeof val === 'number' ? formatTrNumber(val, 2) : String(val ?? '')
                    }
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Bar dataKey="deger" name="Değer" radius={[0, 6, 6, 0]} maxBarSize={36}>
                    {singleBenchmarkData.map((entry, idx) => (
                      <Cell key={entry.label} fill={entry.color || VIVID_PALETTE[idx % VIVID_PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <BarChart
                  data={singleBenchmarkData}
                  margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip
                    formatter={(val: unknown) =>
                      typeof val === 'number' ? formatTrNumber(val, 2) : String(val ?? '')
                    }
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Bar
                    dataKey="deger"
                    name={
                      trendMetric === 'lgs'
                        ? 'LGS Puanı'
                        : trendMetric === 'all_subjects'
                        ? 'Ders Neti'
                        : 'Toplam Net'
                    }
                    radius={[6, 6, 0, 0]}
                    maxBarSize={54}
                  >
                    {singleBenchmarkData.map((entry, idx) => (
                      <Cell key={entry.label} fill={entry.color || VIVID_PALETTE[idx % VIVID_PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </section>

        {/* Chart 2: Subject-by-Subject Comparison (Selectable Types & Colorful) */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Ders Bazlı Net Karşılaştırması
              </h2>
              <p className="text-xs text-slate-500">
                {compareBase
                  ? `${compareBase.examName} ↔ ${compareTarget.examName} + Okul/Genel Ort.`
                  : 'Ders netleri, okul ve genel ortalamalarla karşılaştırılır.'}
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
                <BarChart data={subjectCompareData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
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
                    dataKey="sonrakiDeneme"
                    name={compareBase ? 'Sonraki Deneme' : 'Öğrenci Net'}
                    fill="#2563EB"
                    radius={[4, 4, 0, 0]}
                  >
                    {!compareBase &&
                      subjectCompareData.map((entry) => (
                        <Cell key={entry.ders} fill={entry.color} />
                      ))}
                  </Bar>
                  {compareBase && (
                    <Bar
                      dataKey="oncekiDeneme"
                      name="Önceki Deneme"
                      fill="#F97316"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                  <Bar dataKey="okulOrt" name="Okul Ort." fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="genelOrt" name="Genel Ort." fill="#A855F7" fillOpacity={0.5} radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : subjectChartType === 'radar' ? (
                <RadarChart data={subjectCompareData} cx="50%" cy="50%" outerRadius="72%">
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
                    name={compareBase ? 'Sonraki Deneme' : 'Öğrenci'}
                    dataKey="sonrakiDeneme"
                    stroke="#2563EB"
                    fill="#3B82F6"
                    fillOpacity={0.35}
                  />
                  {compareBase && (
                    <Radar
                      name="Önceki Deneme"
                      dataKey="oncekiDeneme"
                      stroke="#F97316"
                      fill="#FB923C"
                      fillOpacity={0.28}
                    />
                  )}
                  <Radar
                    name="Okul Ort."
                    dataKey="okulOrt"
                    stroke="#10B981"
                    fill="#34D399"
                    fillOpacity={0.2}
                  />
                </RadarChart>
              ) : subjectChartType === 'line' ? (
                <LineChart data={subjectCompareData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
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
                    dataKey="sonrakiDeneme"
                    name={compareBase ? 'Sonraki Deneme' : 'Öğrenci'}
                    stroke="#2563EB"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                  {compareBase && (
                    <Line
                      type="monotone"
                      dataKey="oncekiDeneme"
                      name="Önceki Deneme"
                      stroke="#F97316"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="okulOrt"
                    name="Okul Ort."
                    stroke="#10B981"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="genelOrt"
                    name="Genel Ort."
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </LineChart>
              ) : subjectChartType === 'area' ? (
                <AreaChart data={subjectCompareData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
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
                    dataKey="sonrakiDeneme"
                    name={compareBase ? 'Sonraki Deneme' : 'Öğrenci'}
                    stroke="#2563EB"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                    strokeWidth={2.5}
                  />
                  {compareBase && (
                    <Area
                      type="monotone"
                      dataKey="oncekiDeneme"
                      name="Önceki Deneme"
                      stroke="#F97316"
                      fill="#FB923C"
                      fillOpacity={0.22}
                      strokeWidth={2}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="okulOrt"
                    name="Okul Ort."
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
                    data={subjectCompareData.filter((d) => d.sonrakiDeneme > 0)}
                    dataKey="sonrakiDeneme"
                    nameKey="dersAd"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={88}
                    paddingAngle={3}
                  >
                    {subjectCompareData
                      .filter((d) => d.sonrakiDeneme > 0)
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

      {/* Chart 3: Per-Subject D / Y / B Inspector (Selectable Types) */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Ders İçi Doğru / Yanlış / Boş Dağılımı ({SUBJECT_MAP[selectedSubject].label})
              </h2>
              <p className="text-xs text-slate-500">
                Net kaybının yanlış işaretlemeden mi yoksa boş sorulardan mı kaynaklandığını ders bazında inceleyin.
              </p>
            </div>
            <ChartTypeSelector
              value={dybChartType}
              options={['bar', 'stacked', 'area', 'pie']}
              onChange={setDybChartType}
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {SUBJECT_LIST.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSelectedSubject(s.key)}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  selectedSubject === s.key
                    ? 'text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                style={selectedSubject === s.key ? { backgroundColor: s.color } : undefined}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: selectedSubject === s.key ? '#ffffff' : s.color,
                  }}
                />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {dybChartType === 'pie' ? (
              <PieChart>
                <Tooltip
                  formatter={(val: unknown) => `${val} Soru`}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Pie
                  data={dybPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={84}
                  paddingAngle={3}
                >
                  {dybPieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            ) : dybChartType === 'area' ? (
              <AreaChart data={subjectBreakdownData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="Doğru" stroke="#10B981" fill="#10B981" fillOpacity={0.28} strokeWidth={2.5} />
                <Area type="monotone" dataKey="Yanlış" stroke="#F43F5E" fill="#F43F5E" fillOpacity={0.22} strokeWidth={2.5} />
                <Area type="monotone" dataKey="Boş" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.18} strokeWidth={2} />
              </AreaChart>
            ) : (
              <BarChart data={subjectBreakdownData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  dataKey="Doğru"
                  stackId={dybChartType === 'stacked' ? 'a' : undefined}
                  fill="#10B981"
                  radius={dybChartType === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                  maxBarSize={44}
                />
                <Bar
                  dataKey="Yanlış"
                  stackId={dybChartType === 'stacked' ? 'a' : undefined}
                  fill="#F43F5E"
                  radius={dybChartType === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                  maxBarSize={44}
                />
                <Bar
                  dataKey="Boş"
                  stackId={dybChartType === 'stacked' ? 'a' : undefined}
                  fill="#94A3B8"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={44}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </section>

      {/* Diagnostics: Eksikler ve Geliştirme Gereken Yerler */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">
            Eksikler ve Geliştirme Gereken Yerler — Ders Bazlı Teşhis
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Başarı yüzdesi, yanlış işaretleme oranı, boş bırakma eğilimi ve önceki denemeye göre değişimler değerlendirilerek önceliklendirilmiştir.
          </p>
        </div>

        <div className="divide-y divide-slate-200">
          {diagnostics.map((d) => {
            const isCritical = d.severity === 'critical';
            const isWarning = d.severity === 'warning';
            return (
              <div
                key={d.subject}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {isCritical ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : isWarning ? (
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{d.title}</h3>
                      <span
                        className={`font-mono text-xs font-semibold tabular-nums ${
                          isCritical
                            ? 'text-red-700'
                            : isWarning
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {formatTrNumber(d.latestNet, 2)} Net · %{d.basariYuzdesi}
                      </span>
                      {d.netDelta !== undefined && (
                        <span
                          className={`font-mono text-xs font-medium tabular-nums ${
                            d.netDelta >= 0 ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          (Önceki: {formatTrDelta(d.netDelta, 2)})
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-slate-600">{d.detail}</p>
                    <p className="text-xs leading-relaxed text-slate-800">
                      <span className="font-semibold text-slate-900">Öneri: </span>
                      {d.action}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Kazanım Bazlı Eksik Analizi */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <BookOpen className="h-4 w-4 text-blue-700" />
              Kazanım Bazlı Eksik Analizi
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
              Toplam {kazanimCounts.total} kazanım · {kazanimCounts.eksik} eksik (&lt;%50) ·{' '}
              {kazanimCounts.gelistirilmeli} geliştirilmeli (%50–74) · {kazanimCounts.basarili}{' '}
              başarılı (≥%75)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={kazanimSubjectFilter}
              onChange={(e) => setKazanimSubjectFilter(e.target.value as SubjectKey | 'ALL')}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              <option value="ALL">Tüm Dersler</option>
              {SUBJECT_LIST.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>

            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
              {(
                [
                  { id: 'eksik', label: `Eksik (${kazanimCounts.eksik})` },
                  { id: 'gelistirilmeli', label: `Orta (${kazanimCounts.gelistirilmeli})` },
                  { id: 'basarili', label: `Başarılı (${kazanimCounts.basarili})` },
                  { id: 'ALL', label: 'Tümü' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setKazanimStatusFilter(tab.id)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium tabular-nums ${
                    kazanimStatusFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {kazanimlar.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            Bu öğrenci için yüklenen PDF&apos;lerde ayrıntılı kazanım tablosu bulunamadı (yalnızca özet net listesi veya manuel giriş yapılmış olabilir).
          </div>
        ) : filteredKazanimlar.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            Seçili filtreye uyan kazanım bulunmuyor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-2.5">Ders</th>
                  <th className="px-4 py-2.5">Kazanım</th>
                  <th className="px-3 py-2.5 text-right">Soru</th>
                  <th className="px-3 py-2.5 text-right">D / Y / B</th>
                  <th className="px-4 py-2.5 text-right">Başarı %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredKazanimlar.map((k, idx) => (
                  <tr key={`${k.subject}_${idx}`} className="hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-4 py-2.5 font-semibold text-slate-700">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: SUBJECT_MAP[k.subject].color }}
                        />
                        {SUBJECT_MAP[k.subject].label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-800">
                      <span>{k.text}</span>
                      {k.examCount > 1 && (
                        <span className="ml-2 font-mono text-[11px] text-slate-400">
                          ({k.examCount} deneme)
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-600 tabular-nums">
                      {k.totalSoru}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono tabular-nums">
                      <span className="text-emerald-700">{k.totalDogru}</span> /{' '}
                      <span className="text-red-700">{k.totalYanlis}</span> /{' '}
                      <span className="text-slate-400">{k.totalBos}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right font-mono font-bold tabular-nums">
                      <span
                        className={
                          k.basariYuzdesi < 50
                            ? 'text-red-700'
                            : k.basariYuzdesi < 75
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }
                      >
                        %{k.basariYuzdesi}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ManualExamModal
        student={student}
        nextExamOrder={nextExamOrder}
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        onSave={(rec) => onAddManualExam(student.id, rec)}
      />
    </div>
  );
};
