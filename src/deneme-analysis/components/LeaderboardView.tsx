import React, { useMemo, useState } from 'react';
import {
  Trophy,
  Search,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  FileUp,
  Table2,
  LayoutList,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  BarChart2,
  BookOpen,
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
import {
  ExamArchiveState,
  ExamMeta,
  SUBJECT_LIST,
  SUBJECT_MAP,
  SubjectKey,
  StudentExamRecord,
  StudentProfile,
} from '../types/exam';
import { formatTrDelta, formatTrNumber } from '../utils/analytics';
import { exportLeaderboardToExcel } from '../utils/excelHandler';
import { VIVID_PALETTE } from './ChartTypeSelector';

interface LeaderboardViewProps {
  state: ExamArchiveState;
  onSelectStudent: (studentId: string) => void;
  onOpenUpload: () => void;
}

type GeneralRankMetric =
  | 'avg_lgs'
  | 'avg_net'
  | 'latest_lgs'
  | 'latest_net'
  | 'best_lgs'
  | 'delta_net';

type MatrixViewMode = 'summary' | 'full_matrix';
type SortDirection = 'desc' | 'asc';

export interface LeaderboardStudentRow {
  student: StudentProfile;
  schoolRank: number;
  examMap: Map<string, StudentExamRecord>;
  attendedCount: number;
  avgLgs: number;
  avgToplamNet: number;
  avgSubjectNets: Record<SubjectKey, number>;
  subjectDeltaPrev: Partial<Record<SubjectKey, number>>;
  bestLgs: number;
  latestExam: StudentExamRecord;
  lgsDeltaPrev?: number;
  netDeltaPrev?: number;
}

const GENERAL_METRICS: Array<{ id: GeneralRankMetric; label: string; shortLabel: string }> = [
  { id: 'avg_lgs', label: 'Ortalama LGS Puanı', shortLabel: 'Ort. Puan' },
  { id: 'avg_net', label: 'Ortalama Toplam Net', shortLabel: 'Ort. Net' },
  { id: 'latest_lgs', label: 'Son Deneme Puanı', shortLabel: 'Son Puan' },
  { id: 'latest_net', label: 'Son Deneme Net', shortLabel: 'Son Net' },
  { id: 'best_lgs', label: 'En Yüksek Puan (Rekor)', shortLabel: 'Rekor Puan' },
  { id: 'delta_net', label: 'Gelişim (Δ Net)', shortLabel: 'Gelişim Δ' },
];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function getRankBadgeStyle(rank: number): string {
  if (rank === 1) return 'bg-amber-100 text-amber-900 border-amber-300';
  if (rank === 2) return 'bg-slate-200 text-slate-800 border-slate-300';
  if (rank === 3) return 'bg-orange-100 text-orange-900 border-orange-300';
  return 'bg-slate-50 text-slate-600 border-slate-200';
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  state,
  onSelectStudent,
  onOpenUpload,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey | 'ALL'>('ALL');
  const [generalMetric, setGeneralMetric] = useState<GeneralRankMetric>('avg_lgs');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<MatrixViewMode>('summary');
  const [showChart, setShowChart] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Chronologically ordered exams (1. Deneme, 2. Deneme, 3. Deneme, ...) — updates automatically
  const sortedExams: ExamMeta[] = useMemo(
    () => [...state.exams].sort((a, b) => a.examOrder - b.examOrder),
    [state.exams]
  );

  // Active metric metadata for titles, KPIs, and chart
  const activeCriterionLabel = useMemo(() => {
    if (selectedSubject !== 'ALL') {
      return `${SUBJECT_MAP[selectedSubject].label} Ortalama Neti`;
    }
    return GENERAL_METRICS.find((m) => m.id === generalMetric)?.label ?? 'Ortalama LGS Puanı';
  }, [selectedSubject, generalMetric]);

  const getPrimarySortValue = (row: Omit<LeaderboardStudentRow, 'schoolRank'>): number => {
    if (selectedSubject !== 'ALL') {
      return row.avgSubjectNets[selectedSubject];
    }
    switch (generalMetric) {
      case 'avg_net':
        return row.avgToplamNet;
      case 'latest_lgs':
        return row.latestExam.lgsPuan;
      case 'latest_net':
        return row.latestExam.toplam.net;
      case 'best_lgs':
        return row.bestLgs;
      case 'delta_net':
        return row.netDeltaPrev ?? -9999;
      case 'avg_lgs':
      default:
        return row.avgLgs;
    }
  };

  // Build dynamic student rows with per-exam records and multi-exam averages
  const allRows: LeaderboardStudentRow[] = useMemo(() => {
    const raw: Omit<LeaderboardStudentRow, 'schoolRank'>[] = [];

    for (const student of state.students) {
      if (!student.exams || student.exams.length === 0) continue;

      const sortedStudentExams = [...student.exams].sort((a, b) => {
        if (a.examOrder !== b.examOrder) return a.examOrder - b.examOrder;
        return a.examDate.localeCompare(b.examDate);
      });

      const examMap = new Map<string, StudentExamRecord>();
      for (const ex of sortedStudentExams) {
        examMap.set(ex.examId, ex);
      }

      const count = sortedStudentExams.length;
      const avgLgs = round2(
        sortedStudentExams.reduce((acc, ex) => acc + ex.lgsPuan, 0) / count
      );
      const avgToplamNet = round2(
        sortedStudentExams.reduce((acc, ex) => acc + ex.toplam.net, 0) / count
      );

      const avgSubjectNets = {} as Record<SubjectKey, number>;
      const subjectDeltaPrev: Partial<Record<SubjectKey, number>> = {};
      const latestExam = sortedStudentExams[count - 1];
      const prevExam = count >= 2 ? sortedStudentExams[count - 2] : undefined;

      for (const s of SUBJECT_LIST) {
        avgSubjectNets[s.key] = round2(
          sortedStudentExams.reduce((acc, ex) => acc + ex.subjects[s.key].net, 0) / count
        );
        if (prevExam) {
          subjectDeltaPrev[s.key] = round2(
            latestExam.subjects[s.key].net - prevExam.subjects[s.key].net
          );
        }
      }

      const bestLgs = Math.max(...sortedStudentExams.map((ex) => ex.lgsPuan));

      raw.push({
        student,
        examMap,
        attendedCount: count,
        avgLgs,
        avgToplamNet,
        avgSubjectNets,
        subjectDeltaPrev,
        bestLgs,
        latestExam,
        lgsDeltaPrev: prevExam ? round2(latestExam.lgsPuan - prevExam.lgsPuan) : undefined,
        netDeltaPrev: prevExam ? round2(latestExam.toplam.net - prevExam.toplam.net) : undefined,
      });
    }

    const dir = sortDirection === 'desc' ? 1 : -1;

    raw.sort((a, b) => {
      const aVal = getPrimarySortValue(a);
      const bVal = getPrimarySortValue(b);
      if (Math.abs(bVal - aVal) > 0.0001) {
        return (bVal - aVal) * dir;
      }
      // Tie-breakers: avgToplamNet then avgLgs
      if (Math.abs(b.avgToplamNet - a.avgToplamNet) > 0.0001) {
        return (b.avgToplamNet - a.avgToplamNet) * dir;
      }
      return (b.avgLgs - a.avgLgs) * dir;
    });

    return raw.map((item, idx) => ({
      ...item,
      schoolRank: idx + 1,
    }));
  }, [state.students, selectedSubject, generalMetric, sortDirection]);

  const classes = useMemo(() => {
    const set = new Set(allRows.map((r) => r.student.sinif));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [allRows]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase('tr');
    return allRows.filter((row) => {
      if (selectedClass !== 'ALL' && row.student.sinif !== selectedClass) return false;
      if (!q) return true;
      return (
        row.student.name.toLocaleLowerCase('tr').includes(q) ||
        row.student.numara.includes(q) ||
        row.student.sinif.toLocaleLowerCase('tr').includes(q)
      );
    });
  }, [allRows, searchQuery, selectedClass]);

  // Footer aggregate averages for the currently visible (filtered) students
  const footerAverages = useMemo(() => {
    if (filteredRows.length === 0) return null;
    const count = filteredRows.length;
    const avgLgs = round2(filteredRows.reduce((acc, r) => acc + r.avgLgs, 0) / count);
    const avgToplamNet = round2(
      filteredRows.reduce((acc, r) => acc + r.avgToplamNet, 0) / count
    );

    const avgSubjectNets = {} as Record<SubjectKey, number>;
    for (const s of SUBJECT_LIST) {
      avgSubjectNets[s.key] = round2(
        filteredRows.reduce((acc, r) => acc + r.avgSubjectNets[s.key], 0) / count
      );
    }

    const perExam = new Map<
      string,
      {
        count: number;
        avgNet: number;
        avgLgs: number;
        subjectNets: Record<SubjectKey, number>;
      }
    >();

    for (const ex of sortedExams) {
      const participants = filteredRows
        .map((r) => r.examMap.get(ex.id))
        .filter((rec): rec is StudentExamRecord => Boolean(rec));

      if (participants.length > 0) {
        const subjectNets = {} as Record<SubjectKey, number>;
        for (const s of SUBJECT_LIST) {
          subjectNets[s.key] = round2(
            participants.reduce((acc, rec) => acc + rec.subjects[s.key].net, 0) /
              participants.length
          );
        }
        perExam.set(ex.id, {
          count: participants.length,
          avgNet: round2(
            participants.reduce((acc, rec) => acc + rec.toplam.net, 0) / participants.length
          ),
          avgLgs: round2(
            participants.reduce((acc, rec) => acc + rec.lgsPuan, 0) / participants.length
          ),
          subjectNets,
        });
      }
    }

    return { avgLgs, avgToplamNet, avgSubjectNets, perExam };
  }, [filteredRows, sortedExams]);

  // Top-15 chart dataset reflecting the active subject or general metric
  const chartData = useMemo(() => {
    return filteredRows.slice(0, 15).map((row, idx) => {
      const rawVal = getPrimarySortValue(row);
      const val = rawVal === -9999 ? 0 : rawVal;
      const shortName =
        row.student.name.length > 18 ? `${row.student.name.slice(0, 17)}…` : row.student.name;
      return {
        rank: idx + 1,
        name: `${idx + 1}. ${shortName}`,
        fullName: row.student.name,
        sinif: row.student.sinif,
        value: val,
      };
    });
  }, [filteredRows, selectedSubject, generalMetric]);

  const toggleExpand = (studentId: string) => {
    setExpandedIds((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const handleHeaderSortSubject = (subjectKey: SubjectKey) => {
    if (selectedSubject === subjectKey) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSelectedSubject(subjectKey);
      setSortDirection('desc');
    }
  };

  const handleHeaderSortGeneral = (metric: GeneralRankMetric) => {
    if (selectedSubject === 'ALL' && generalMetric === metric) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSelectedSubject('ALL');
      setGeneralMetric(metric);
      setSortDirection('desc');
    }
  };

  if (state.students.length === 0 || sortedExams.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-8 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-blue-700">
          <Trophy className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Sıralama için deneme verisi bekleniyor</h2>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-500">
          Deneme PDF veya Excel dosyalarınızı yüklediğinizde tüm öğrenciler yüksek net ve puandan aza doğru otomatik sıralanır ve 1., 2., 3. deneme ortalamaları hesaplanır.
        </p>
        <button
          type="button"
          onClick={onOpenUpload}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
        >
          <FileUp className="h-4 w-4" />
          Deneme PDF / Excel Yükle
        </button>
      </div>
    );
  }

  const topStudent = filteredRows[0];
  const activeSubjectMeta = selectedSubject !== 'ALL' ? SUBJECT_MAP[selectedSubject] : null;

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Çok İşlevli Başarı Sıralaması ve Deneme Ortalamaları
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
            Ders seçerek o dersin ortalama netine göre veya genel ortalama puan/nete göre sıralayın · Her yeni deneme eklendiğinde otomatik güncellenir.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowChart((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
              showChart
                ? 'border-blue-700 bg-blue-700 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            İlk 15 Grafiği
          </button>

          <button
            type="button"
            onClick={() => exportLeaderboardToExcel(sortedExams, filteredRows)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Excel İndir (.xlsx)
          </button>
        </div>
      </div>

      {/* 3 Compact Top KPI Cards — adapt dynamically to active subject or general metric */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <span>
              {sortDirection === 'desc' ? '1. Sıra' : 'Son Sıra'} ·{' '}
              {activeSubjectMeta ? activeSubjectMeta.label : selectedClass === 'ALL' ? 'Okul' : selectedClass}
            </span>
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          {topStudent ? (
            <>
              <div className="mt-1.5 truncate text-base font-extrabold text-slate-900">
                {topStudent.student.name}
              </div>
              <div className="mt-1 font-mono text-xs text-slate-600 tabular-nums">
                {topStudent.student.sinif} ·{' '}
                {activeSubjectMeta ? (
                  <>
                    {activeSubjectMeta.shortLabel} Ort.{' '}
                    <strong style={{ color: activeSubjectMeta.color }}>
                      {formatTrNumber(topStudent.avgSubjectNets[activeSubjectMeta.key], 2)}
                    </strong>{' '}
                    Net · Ort. {formatTrNumber(topStudent.avgLgs, 2)} p
                  </>
                ) : (
                  <>
                    Ort.{' '}
                    <strong className="text-slate-900">
                      {formatTrNumber(topStudent.avgLgs, 2)}
                    </strong>{' '}
                    LGS ·{' '}
                    <strong className="text-blue-700">
                      {formatTrNumber(topStudent.avgToplamNet, 2)}
                    </strong>{' '}
                    Net
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="mt-2 text-xs text-slate-400">Veri yok</div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {activeSubjectMeta
              ? `${activeSubjectMeta.label} Genel Ortalaması`
              : selectedClass === 'ALL'
              ? 'Genel Deneme Ortalaması'
              : `${selectedClass} Ortalaması`}
          </div>
          {footerAverages ? (
            <>
              <div className="mt-1.5 flex items-baseline gap-3">
                {activeSubjectMeta ? (
                  <>
                    <span
                      className="font-mono text-xl font-extrabold tabular-nums"
                      style={{ color: activeSubjectMeta.color }}
                    >
                      {formatTrNumber(footerAverages.avgSubjectNets[activeSubjectMeta.key], 2)} Net
                    </span>
                    <span className="font-mono text-xs font-medium text-slate-500 tabular-nums">
                      / {activeSubjectMeta.questionCount} soru
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-mono text-xl font-extrabold text-slate-900 tabular-nums">
                      {formatTrNumber(footerAverages.avgLgs, 2)}
                    </span>
                    <span className="font-mono text-sm font-bold text-blue-700 tabular-nums">
                      {formatTrNumber(footerAverages.avgToplamNet, 2)} Net
                    </span>
                  </>
                )}
              </div>
              <div className="mt-1 font-mono text-[11px] text-slate-500 tabular-nums">
                {SUBJECT_LIST.map(
                  (s) => `${s.shortLabel} ${formatTrNumber(footerAverages.avgSubjectNets[s.key], 1)}`
                ).join(' · ')}
              </div>
            </>
          ) : (
            <div className="mt-2 text-xs text-slate-400">Veri yok</div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Aktif Sıralama &amp; Kapsam
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-mono text-xl font-extrabold text-slate-900 tabular-nums">
              {filteredRows.length}
            </span>
            <span className="text-xs font-medium text-slate-500">öğrenci</span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-xl font-extrabold text-blue-700 tabular-nums">
              {sortedExams.length}
            </span>
            <span className="text-xs font-medium text-slate-500">deneme</span>
          </div>
          <div className="mt-1 truncate text-[11px] font-medium text-slate-600">
            Ölçüt: <strong className="text-slate-900">{activeCriterionLabel}</strong> (
            {sortDirection === 'desc' ? 'Çok → Az' : 'Az → Çok'})
          </div>
        </div>
      </div>

      {/* Multifunctional Ranking Controls Card */}
      <section className="space-y-3.5 rounded-xl border border-slate-200 bg-white p-4">
        {/* Row 1: General Ranking Metric Pills + Direction Toggle */}
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Genel Sıralama:
            </span>
            {GENERAL_METRICS.map((m) => {
              const active = selectedSubject === 'ALL' && generalMetric === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedSubject('ALL');
                    setGeneralMetric(m.id);
                  }}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'border-blue-700 bg-blue-700 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-800'
                  }`}
                >
                  {m.shortLabel}
                </button>
              );
            })}
          </div>

          {/* Sort Direction + View Mode */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              title="Sıralama yönünü değiştir"
            >
              {sortDirection === 'desc' ? (
                <>
                  <ArrowDownWideNarrow className="h-3.5 w-3.5 text-blue-700" />
                  Çok → Az
                </>
              ) : (
                <>
                  <ArrowUpNarrowWide className="h-3.5 w-3.5 text-amber-600" />
                  Az → Çok
                </>
              )}
            </button>

            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('summary')}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  viewMode === 'summary'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutList className="h-3.5 w-3.5" />
                Özet + Denemeler
              </button>
              <button
                type="button"
                onClick={() => setViewMode('full_matrix')}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  viewMode === 'full_matrix'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Table2 className="h-3.5 w-3.5" />
                Tüm Dersler Matrisi
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Subject-Specific Average Net Ranking Bar */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
          <span className="mr-1 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
            Derse Göre Sırala:
          </span>
          <button
            type="button"
            onClick={() => setSelectedSubject('ALL')}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              selectedSubject === 'ALL'
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tüm Dersler
          </button>
          {SUBJECT_LIST.map((s) => {
            const isSelected = selectedSubject === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setSelectedSubject(s.key)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'border-transparent text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
                style={isSelected ? { backgroundColor: s.color } : undefined}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: isSelected ? '#FFFFFF' : s.color }}
                />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Row 3: Search + Class Filter */}
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Öğrenci adı veya okul numarası ara..."
              className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedClass('ALL')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors tabular-nums ${
                selectedClass === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tümü ({allRows.length})
            </button>
            {classes.map((cls) => {
              const cnt = allRows.filter((r) => r.student.sinif === cls).length;
              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedClass(cls)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors tabular-nums ${
                    selectedClass === cls
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cls} ({cnt})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Optional Top-15 Colorful Visual Chart */}
      {showChart && chartData.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {sortDirection === 'desc' ? 'İlk' : 'Son'} {chartData.length} Öğrenci —{' '}
                {activeCriterionLabel}
              </h2>
              <p className="text-xs text-slate-500">
                Seçili ders/ölçüt ve şube filtresine göre otomatik güncellenen sıralama grafiği
              </p>
            </div>
          </div>
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 10, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={150}
                  tick={{ fontSize: 11, fill: '#0F172A', fontWeight: 600 }}
                />
                <Tooltip
                  formatter={(value) => [
                    formatTrNumber(Number(value), 2),
                    activeCriterionLabel,
                  ]}
                  labelFormatter={(_, payload) => {
                    const item = payload?.[0]?.payload as
                      | { fullName: string; sinif: string }
                      | undefined;
                    return item ? `${item.fullName} (${item.sinif})` : '';
                  }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
                  {chartData.map((_, idx) => (
                    <Cell
                      key={`cell_${idx}`}
                      fill={
                        activeSubjectMeta
                          ? activeSubjectMeta.color
                          : VIVID_PALETTE[idx % VIVID_PALETTE.length]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Main Ranking Table */}
      {filteredRows.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Arama kriterlerine uygun öğrenci bulunamadı.
        </div>
      ) : viewMode === 'summary' ? (
        /* SUMMARY + EXPANDABLE PER-EXAM SUBJECT BREAKDOWN TABLE */
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[920px] border-collapse text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="sticky left-0 z-20 w-14 border-r border-slate-200 bg-slate-50 px-3 py-3 text-center">
                  Sıra
                </th>
                <th className="sticky left-14 z-20 min-w-[190px] border-r border-slate-200 bg-slate-50 px-3 py-3">
                  Öğrenci
                </th>

                {/* When a specific subject is selected, show that subject's Average prominently first! */}
                {activeSubjectMeta && (
                  <th
                    className="border-r border-slate-200 px-3 py-3 text-right text-white"
                    style={{ backgroundColor: activeSubjectMeta.color }}
                  >
                    Ort. {activeSubjectMeta.shortLabel}
                  </th>
                )}

                <th
                  onClick={() => handleHeaderSortGeneral('avg_lgs')}
                  className={`cursor-pointer px-3 py-3 text-right transition-colors hover:bg-blue-100/70 ${
                    selectedSubject === 'ALL' && generalMetric === 'avg_lgs'
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-blue-50/60 text-blue-900'
                  }`}
                  title="Ortalama LGS puanına göre sırala"
                >
                  Ort. LGS
                </th>
                <th
                  onClick={() => handleHeaderSortGeneral('avg_net')}
                  className={`cursor-pointer border-r border-slate-200 px-3 py-3 text-right transition-colors hover:bg-blue-100/70 ${
                    selectedSubject === 'ALL' && generalMetric === 'avg_net'
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-blue-50/60 text-blue-900'
                  }`}
                  title="Ortalama toplam nete göre sırala"
                >
                  Ort. Net
                </th>
                {SUBJECT_LIST.map((s) => {
                  const isActiveSubj = selectedSubject === s.key;
                  return (
                    <th
                      key={s.key}
                      onClick={() => handleHeaderSortSubject(s.key)}
                      className={`cursor-pointer px-2.5 py-3 text-right transition-colors hover:bg-slate-200/70 ${
                        isActiveSubj ? 'bg-slate-200 font-extrabold text-slate-900' : ''
                      }`}
                      title={`${s.label} ortalama netine göre sırala`}
                    >
                      <span className="inline-flex items-center gap-1">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        {s.shortLabel}
                      </span>
                    </th>
                  );
                })}
                {sortedExams.map((ex, idx) => (
                  <th
                    key={ex.id}
                    className="min-w-[108px] border-l border-slate-200 bg-slate-100/70 px-3 py-2.5 text-right"
                    title={`${idx + 1}. Deneme: ${ex.name} (${ex.examDate})`}
                  >
                    <div className="font-bold text-slate-800">
                      {idx + 1}. Deneme
                      {activeSubjectMeta ? ` (${activeSubjectMeta.shortLabel})` : ''}
                    </div>
                    <div className="max-w-[100px] truncate text-[10px] font-normal text-slate-500">
                      {ex.name}
                    </div>
                  </th>
                ))}
                <th className="border-l border-slate-200 px-3 py-3 text-center">Kart</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredRows.map((row, index) => {
                const displayRank = index + 1;
                const isExpanded = Boolean(expandedIds[row.student.id]);
                const totalCols =
                  4 +
                  (activeSubjectMeta ? 1 : 0) +
                  SUBJECT_LIST.length +
                  sortedExams.length +
                  1;

                return (
                  <React.Fragment key={row.student.id}>
                    <tr
                      onClick={() => toggleExpand(row.student.id)}
                      className={`cursor-pointer transition-colors hover:bg-blue-50/40 ${
                        isExpanded ? 'bg-blue-50/30' : 'bg-white'
                      }`}
                    >
                      {/* Sticky Rank */}
                      <td className="sticky left-0 z-10 border-r border-slate-100 bg-inherit px-2 py-2.5 text-center">
                        <span
                          className={`inline-flex h-6 min-w-7 items-center justify-center rounded-md border px-1.5 font-mono text-[11px] font-bold tabular-nums ${getRankBadgeStyle(
                            displayRank
                          )}`}
                        >
                          {displayRank}
                        </span>
                      </td>

                      {/* Sticky Student Name */}
                      <td className="sticky left-14 z-10 border-r border-slate-200 bg-inherit px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          )}
                          <div className="min-w-0">
                            <div className="truncate font-bold text-slate-900">
                              {row.student.name}
                            </div>
                            <div className="font-mono text-[10px] text-slate-500 tabular-nums">
                              {row.student.sinif} · No: {row.student.numara} · {row.attendedCount}/
                              {sortedExams.length} deneme
                              {selectedClass !== 'ALL' ? ` · Okul #${row.schoolRank}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Active Subject Highlight Column */}
                      {activeSubjectMeta && (
                        <td className="border-r border-slate-200 bg-slate-50/90 px-3 py-2.5 text-right font-mono tabular-nums">
                          <div
                            className="text-sm font-extrabold"
                            style={{ color: activeSubjectMeta.color }}
                          >
                            {formatTrNumber(row.avgSubjectNets[activeSubjectMeta.key], 2)}
                          </div>
                          {row.subjectDeltaPrev[activeSubjectMeta.key] !== undefined && (
                            <div
                              className={`text-[10px] font-semibold ${
                                (row.subjectDeltaPrev[activeSubjectMeta.key] ?? 0) > 0
                                  ? 'text-emerald-700'
                                  : (row.subjectDeltaPrev[activeSubjectMeta.key] ?? 0) < 0
                                  ? 'text-red-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {formatTrDelta(row.subjectDeltaPrev[activeSubjectMeta.key], 2)}
                            </div>
                          )}
                        </td>
                      )}

                      {/* Average LGS */}
                      <td className="bg-blue-50/30 px-3 py-2.5 text-right font-mono font-extrabold text-slate-900 tabular-nums">
                        <div>{formatTrNumber(row.avgLgs, 2)}</div>
                        {row.lgsDeltaPrev !== undefined && (
                          <div
                            className={`inline-flex items-center text-[10px] font-semibold ${
                              row.lgsDeltaPrev > 0
                                ? 'text-emerald-700'
                                : row.lgsDeltaPrev < 0
                                ? 'text-red-700'
                                : 'text-slate-400'
                            }`}
                          >
                            {row.lgsDeltaPrev > 0 ? (
                              <ArrowUpRight className="h-2.5 w-2.5" />
                            ) : row.lgsDeltaPrev < 0 ? (
                              <ArrowDownRight className="h-2.5 w-2.5" />
                            ) : null}
                            {formatTrDelta(row.lgsDeltaPrev, 1)}
                          </div>
                        )}
                      </td>

                      {/* Average Toplam Net */}
                      <td className="border-r border-slate-200 bg-blue-50/30 px-3 py-2.5 text-right font-mono font-extrabold text-blue-700 tabular-nums">
                        <div>{formatTrNumber(row.avgToplamNet, 2)}</div>
                        {row.netDeltaPrev !== undefined && (
                          <div
                            className={`text-[10px] font-semibold ${
                              row.netDeltaPrev > 0
                                ? 'text-emerald-700'
                                : row.netDeltaPrev < 0
                                ? 'text-red-700'
                                : 'text-slate-400'
                            }`}
                          >
                            {formatTrDelta(row.netDeltaPrev, 2)}
                          </div>
                        )}
                      </td>

                      {/* 6 Subject Average Nets */}
                      {SUBJECT_LIST.map((s) => {
                        const val = row.avgSubjectNets[s.key];
                        const isActiveSubj = selectedSubject === s.key;
                        return (
                          <td
                            key={s.key}
                            className={`px-2.5 py-2.5 text-right font-mono tabular-nums ${
                              isActiveSubj
                                ? 'bg-slate-100 font-extrabold text-slate-900'
                                : val < 0
                                ? 'font-semibold text-red-700'
                                : 'text-slate-700'
                            }`}
                          >
                            {formatTrNumber(val, 2)}
                          </td>
                        );
                      })}

                      {/* Per-Exam Columns (1. Deneme, 2. Deneme, 3. Deneme, ...) */}
                      {sortedExams.map((ex) => {
                        const rec = row.examMap.get(ex.id);
                        return (
                          <td
                            key={ex.id}
                            className="border-l border-slate-100 px-3 py-2.5 text-right font-mono tabular-nums"
                          >
                            {rec ? (
                              activeSubjectMeta ? (
                                <div>
                                  <div
                                    className="font-bold"
                                    style={{
                                      color:
                                        rec.subjects[activeSubjectMeta.key].net < 0
                                          ? '#B91C1C'
                                          : '#0F172A',
                                    }}
                                  >
                                    {formatTrNumber(rec.subjects[activeSubjectMeta.key].net, 2)}{' '}
                                    <span className="text-[10px] font-normal text-slate-400">
                                      net
                                    </span>
                                  </div>
                                  <div className="text-[10px] font-medium text-slate-500">
                                    {rec.subjects[activeSubjectMeta.key].dogru}D ·{' '}
                                    {rec.subjects[activeSubjectMeta.key].yanlis}Y
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="font-bold text-slate-900">
                                    {formatTrNumber(rec.toplam.net, 2)}{' '}
                                    <span className="text-[10px] font-normal text-slate-400">
                                      net
                                    </span>
                                  </div>
                                  <div className="text-[10px] font-medium text-slate-500">
                                    {formatTrNumber(rec.lgsPuan, 2)} p
                                  </div>
                                </div>
                              )
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Open Student Card */}
                      <td
                        className="border-l border-slate-100 px-2.5 py-2.5 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectStudent(row.student.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-50"
                          title="Öğrenci kartını aç"
                        >
                          Aç
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Inline 1., 2., 3. Exam Full Subject Breakdown */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90">
                        <td colSpan={totalCols} className="px-4 py-3">
                          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                            <table className="w-full min-w-[680px] text-left text-xs">
                              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">
                                <tr>
                                  <th className="px-3 py-2">Deneme</th>
                                  <th className="px-2.5 py-2">Tarih</th>
                                  {SUBJECT_LIST.map((s) => (
                                    <th
                                      key={s.key}
                                      className={`px-2.5 py-2 text-right ${
                                        selectedSubject === s.key
                                          ? 'bg-slate-200/80 font-bold text-slate-900'
                                          : ''
                                      }`}
                                    >
                                      {s.label} Net
                                    </th>
                                  ))}
                                  <th className="px-2.5 py-2 text-right">Toplam Net</th>
                                  <th className="px-3 py-2 text-right">LGS Puanı</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {sortedExams.map((ex, eIdx) => {
                                  const rec = row.examMap.get(ex.id);
                                  return (
                                    <tr key={ex.id} className="hover:bg-slate-50/60">
                                      <td className="px-3 py-2 font-semibold text-slate-800">
                                        {eIdx + 1}. Deneme — {ex.name}
                                      </td>
                                      <td className="px-2.5 py-2 font-mono text-[11px] text-slate-500 tabular-nums">
                                        {rec?.examDate || ex.examDate || '—'}
                                      </td>
                                      {SUBJECT_LIST.map((s) => (
                                        <td
                                          key={s.key}
                                          className={`px-2.5 py-2 text-right font-mono tabular-nums ${
                                            selectedSubject === s.key
                                              ? 'bg-slate-100 font-bold text-slate-900'
                                              : rec && rec.subjects[s.key].net < 0
                                              ? 'font-semibold text-red-700'
                                              : 'text-slate-700'
                                          }`}
                                        >
                                          {rec ? formatTrNumber(rec.subjects[s.key].net, 2) : '—'}
                                        </td>
                                      ))}
                                      <td className="px-2.5 py-2 text-right font-mono font-bold text-blue-700 tabular-nums">
                                        {rec ? formatTrNumber(rec.toplam.net, 2) : '—'}
                                      </td>
                                      <td className="px-3 py-2 text-right font-mono font-bold text-slate-900 tabular-nums">
                                        {rec ? formatTrNumber(rec.lgsPuan, 2) : '—'}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                              <tfoot className="border-t-2 border-slate-200 bg-blue-50/60 font-bold">
                                <tr>
                                  <td className="px-3 py-2 text-blue-900" colSpan={2}>
                                    DENEME ORTALAMASI ({row.attendedCount} deneme)
                                  </td>
                                  {SUBJECT_LIST.map((s) => (
                                    <td
                                      key={s.key}
                                      className="px-2.5 py-2 text-right font-mono text-blue-900 tabular-nums"
                                    >
                                      {formatTrNumber(row.avgSubjectNets[s.key], 2)}
                                    </td>
                                  ))}
                                  <td className="px-2.5 py-2 text-right font-mono text-blue-800 tabular-nums">
                                    {formatTrNumber(row.avgToplamNet, 2)}
                                  </td>
                                  <td className="px-3 py-2 text-right font-mono text-slate-900 tabular-nums">
                                    {formatTrNumber(row.avgLgs, 2)}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>

            {/* Footer School / Filtered Average Row */}
            {footerAverages && (
              <tfoot className="border-t-2 border-slate-300 bg-slate-100 font-bold text-slate-900">
                <tr>
                  <td className="sticky left-0 z-10 border-r border-slate-200 bg-slate-100 px-2 py-3 text-center text-[11px] text-slate-500">
                    ORT
                  </td>
                  <td className="sticky left-14 z-10 border-r border-slate-300 bg-slate-100 px-3 py-3 text-xs">
                    {selectedClass === 'ALL' ? 'Genel Ortalama' : `${selectedClass} Ortalaması`} (
                    {filteredRows.length} öğr.)
                  </td>
                  {activeSubjectMeta && (
                    <td
                      className="border-r border-slate-300 bg-slate-200/80 px-3 py-3 text-right font-mono tabular-nums"
                      style={{ color: activeSubjectMeta.color }}
                    >
                      {formatTrNumber(footerAverages.avgSubjectNets[activeSubjectMeta.key], 2)}
                    </td>
                  )}
                  <td className="bg-blue-100/70 px-3 py-3 text-right font-mono text-slate-900 tabular-nums">
                    {formatTrNumber(footerAverages.avgLgs, 2)}
                  </td>
                  <td className="border-r border-slate-300 bg-blue-100/70 px-3 py-3 text-right font-mono text-blue-800 tabular-nums">
                    {formatTrNumber(footerAverages.avgToplamNet, 2)}
                  </td>
                  {SUBJECT_LIST.map((s) => (
                    <td
                      key={s.key}
                      className="px-2.5 py-3 text-right font-mono text-slate-800 tabular-nums"
                    >
                      {formatTrNumber(footerAverages.avgSubjectNets[s.key], 2)}
                    </td>
                  ))}
                  {sortedExams.map((ex) => {
                    const exAvg = footerAverages.perExam.get(ex.id);
                    return (
                      <td
                        key={ex.id}
                        className="border-l border-slate-200 px-3 py-3 text-right font-mono tabular-nums"
                      >
                        {exAvg ? (
                          activeSubjectMeta ? (
                            <div className="text-slate-900">
                              {formatTrNumber(exAvg.subjectNets[activeSubjectMeta.key], 2)} net
                            </div>
                          ) : (
                            <div>
                              <div className="text-slate-900">
                                {formatTrNumber(exAvg.avgNet, 2)} net
                              </div>
                              <div className="text-[10px] font-medium text-slate-500">
                                {formatTrNumber(exAvg.avgLgs, 2)} p
                              </div>
                            </div>
                          )
                        ) : (
                          '—'
                        )}
                      </td>
                    );
                  })}
                  <td className="border-l border-slate-200 px-2 py-3" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      ) : (
        /* FULL MULTI-EXAM SUBJECT MATRIX TABLE (ORTALAMA | 1. Deneme | 2. Deneme | 3. Deneme ...) */
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-[11px] font-bold text-slate-700">
                <th
                  rowSpan={2}
                  className="sticky left-0 z-20 w-12 border-r border-slate-200 bg-slate-100 px-2 py-2 text-center"
                >
                  Sıra
                </th>
                <th
                  rowSpan={2}
                  className="sticky left-12 z-20 min-w-[170px] border-r border-slate-300 bg-slate-100 px-3 py-2"
                >
                  Öğrenci
                </th>
                <th
                  colSpan={SUBJECT_LIST.length + 2}
                  className="border-r border-slate-300 bg-blue-100/80 px-3 py-2 text-center text-blue-900"
                >
                  GENEL ORTALAMA ({sortedExams.length} Deneme)
                </th>
                {sortedExams.map((ex, idx) => (
                  <th
                    key={ex.id}
                    colSpan={SUBJECT_LIST.length + 2}
                    className={`border-r border-slate-300 px-3 py-2 text-center ${
                      idx % 2 === 0 ? 'bg-slate-50 text-slate-800' : 'bg-indigo-50/50 text-indigo-900'
                    }`}
                  >
                    {idx + 1}. DENEME — {ex.name}
                  </th>
                ))}
              </tr>

              <tr className="border-b border-slate-300 bg-slate-50 text-[10px] font-semibold text-slate-600">
                {SUBJECT_LIST.map((s) => (
                  <th
                    key={`avg_${s.key}`}
                    onClick={() => handleHeaderSortSubject(s.key)}
                    className={`cursor-pointer px-2 py-2 text-right transition-colors hover:bg-blue-100 ${
                      selectedSubject === s.key
                        ? 'bg-blue-200/80 font-extrabold text-slate-900'
                        : 'bg-blue-50/60'
                    }`}
                  >
                    {s.shortLabel}
                  </th>
                ))}
                <th
                  onClick={() => handleHeaderSortGeneral('avg_net')}
                  className="cursor-pointer bg-blue-50/80 px-2 py-2 text-right font-bold text-blue-800 hover:bg-blue-100"
                >
                  Net
                </th>
                <th
                  onClick={() => handleHeaderSortGeneral('avg_lgs')}
                  className="cursor-pointer border-r border-slate-300 bg-blue-50/80 px-2.5 py-2 text-right font-bold text-slate-900 hover:bg-blue-100"
                >
                  LGS
                </th>

                {sortedExams.map((ex) => (
                  <React.Fragment key={`sub_${ex.id}`}>
                    {SUBJECT_LIST.map((s) => (
                      <th
                        key={`${ex.id}_${s.key}`}
                        className={`px-2 py-2 text-right ${
                          selectedSubject === s.key ? 'bg-slate-200/70 font-bold text-slate-900' : ''
                        }`}
                      >
                        {s.shortLabel}
                      </th>
                    ))}
                    <th className="bg-slate-100/70 px-2 py-2 text-right font-bold text-blue-700">
                      Net
                    </th>
                    <th className="border-r border-slate-300 bg-slate-100/70 px-2.5 py-2 text-right font-bold text-slate-900">
                      LGS
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredRows.map((row, index) => {
                const displayRank = index + 1;
                return (
                  <tr
                    key={row.student.id}
                    onClick={() => onSelectStudent(row.student.id)}
                    className="cursor-pointer bg-white transition-colors hover:bg-blue-50/40"
                  >
                    <td className="sticky left-0 z-10 border-r border-slate-100 bg-inherit px-2 py-2 text-center">
                      <span
                        className={`inline-flex h-5 min-w-6 items-center justify-center rounded border px-1 font-mono text-[10px] font-bold tabular-nums ${getRankBadgeStyle(
                          displayRank
                        )}`}
                      >
                        {displayRank}
                      </span>
                    </td>
                    <td className="sticky left-12 z-10 border-r border-slate-300 bg-inherit px-3 py-2">
                      <div className="max-w-[160px] truncate font-bold text-slate-900">
                        {row.student.name}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 tabular-nums">
                        {row.student.sinif} · {row.attendedCount}/{sortedExams.length}D
                      </div>
                    </td>

                    {SUBJECT_LIST.map((s) => (
                      <td
                        key={`avgv_${s.key}`}
                        className={`px-2 py-2 text-right font-mono text-[11px] tabular-nums ${
                          selectedSubject === s.key
                            ? 'bg-blue-100/80 font-extrabold text-slate-900'
                            : 'bg-blue-50/20 text-slate-700'
                        }`}
                      >
                        {formatTrNumber(row.avgSubjectNets[s.key], 2)}
                      </td>
                    ))}
                    <td className="bg-blue-50/40 px-2 py-2 text-right font-mono text-[11px] font-bold text-blue-700 tabular-nums">
                      {formatTrNumber(row.avgToplamNet, 2)}
                    </td>
                    <td className="border-r border-slate-300 bg-blue-50/40 px-2.5 py-2 text-right font-mono text-[11px] font-extrabold text-slate-900 tabular-nums">
                      {formatTrNumber(row.avgLgs, 2)}
                    </td>

                    {sortedExams.map((ex) => {
                      const rec = row.examMap.get(ex.id);
                      return (
                        <React.Fragment key={`val_${ex.id}`}>
                          {SUBJECT_LIST.map((s) => {
                            const sc = rec?.subjects[s.key];
                            return (
                              <td
                                key={`${ex.id}_v_${s.key}`}
                                className={`px-2 py-2 text-right font-mono text-[11px] tabular-nums ${
                                  selectedSubject === s.key
                                    ? 'bg-slate-100/90 font-bold text-slate-900'
                                    : sc && sc.net < 0
                                    ? 'font-semibold text-red-700'
                                    : 'text-slate-600'
                                }`}
                              >
                                {sc ? formatTrNumber(sc.net, 2) : '—'}
                              </td>
                            );
                          })}
                          <td className="bg-slate-50/70 px-2 py-2 text-right font-mono text-[11px] font-bold text-blue-700 tabular-nums">
                            {rec ? formatTrNumber(rec.toplam.net, 2) : '—'}
                          </td>
                          <td className="border-r border-slate-300 bg-slate-50/70 px-2.5 py-2 text-right font-mono text-[11px] font-bold text-slate-900 tabular-nums">
                            {rec ? formatTrNumber(rec.lgsPuan, 2) : '—'}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>

            {footerAverages && (
              <tfoot className="border-t-2 border-slate-300 bg-slate-100 font-bold text-slate-900">
                <tr>
                  <td className="sticky left-0 z-10 border-r border-slate-200 bg-slate-100 px-2 py-2.5 text-center text-[10px] text-slate-500">
                    ORT
                  </td>
                  <td className="sticky left-12 z-10 border-r border-slate-300 bg-slate-100 px-3 py-2.5 text-xs">
                    Genel Ortalama ({filteredRows.length})
                  </td>
                  {SUBJECT_LIST.map((s) => (
                    <td
                      key={`favg_${s.key}`}
                      className="bg-blue-100/60 px-2 py-2.5 text-right font-mono text-[11px] tabular-nums"
                    >
                      {formatTrNumber(footerAverages.avgSubjectNets[s.key], 2)}
                    </td>
                  ))}
                  <td className="bg-blue-100 px-2 py-2.5 text-right font-mono text-[11px] text-blue-900 tabular-nums">
                    {formatTrNumber(footerAverages.avgToplamNet, 2)}
                  </td>
                  <td className="border-r border-slate-300 bg-blue-100 px-2.5 py-2.5 text-right font-mono text-[11px] text-slate-900 tabular-nums">
                    {formatTrNumber(footerAverages.avgLgs, 2)}
                  </td>

                  {sortedExams.map((ex) => {
                    const exAvg = footerAverages.perExam.get(ex.id);
                    return (
                      <React.Fragment key={`fex_${ex.id}`}>
                        {SUBJECT_LIST.map((s) => (
                          <td
                            key={`fex_${ex.id}_${s.key}`}
                            className="px-2 py-2.5 text-right font-mono text-[11px] text-slate-700 tabular-nums"
                          >
                            {exAvg ? formatTrNumber(exAvg.subjectNets[s.key], 2) : '—'}
                          </td>
                        ))}
                        <td className="bg-slate-200/70 px-2 py-2.5 text-right font-mono text-[11px] text-blue-800 tabular-nums">
                          {exAvg ? formatTrNumber(exAvg.avgNet, 2) : '—'}
                        </td>
                        <td className="border-r border-slate-300 bg-slate-200/70 px-2.5 py-2.5 text-right font-mono text-[11px] text-slate-900 tabular-nums">
                          {exAvg ? formatTrNumber(exAvg.avgLgs, 2) : '—'}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
};
