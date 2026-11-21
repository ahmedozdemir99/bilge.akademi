import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronRight,
  LayoutGrid,
  Table as TableIcon,
  FileUp,
  Layers,
} from 'lucide-react';
import { ExamMeta, SUBJECT_LIST, SUBJECT_MAP, StudentProfile } from '../types/exam';
import {
  formatTrDelta,
  formatTrNumber,
  getStudentSummaryForExam,
  StudentProgressSummary,
} from '../utils/analytics';

interface StudentCardsViewProps {
  exams: ExamMeta[];
  students: StudentProfile[];
  onSelectStudent: (studentId: string) => void;
  onOpenUpload: () => void;
}

type SortKey = 'lgs_desc' | 'net_desc' | 'delta_desc' | 'name_asc' | 'rank_asc';

export const StudentCardsView: React.FC<StudentCardsViewProps> = ({
  exams,
  students,
  onSelectStudent,
  onOpenUpload,
}) => {
  const sortedExams = useMemo(
    () => [...exams].sort((a, b) => a.examOrder - b.examOrder),
    [exams]
  );

  const [selectedExamId, setSelectedExamId] = useState<string>(() => {
    const ordered = [...exams].sort((a, b) => a.examOrder - b.examOrder);
    return ordered.length > 0 ? ordered[ordered.length - 1].id : 'ALL';
  });
  const prevExamCountRef = useRef<number>(sortedExams.length);

  // Auto-select newly added exam or fall back if selected exam was deleted
  useEffect(() => {
    if (sortedExams.length === 0) {
      setSelectedExamId('ALL');
      prevExamCountRef.current = 0;
      return;
    }
    const latestId = sortedExams[sortedExams.length - 1].id;
    const grew = sortedExams.length > prevExamCountRef.current;
    prevExamCountRef.current = sortedExams.length;

    if (grew) {
      setSelectedExamId(latestId);
      return;
    }
    if (selectedExamId !== 'ALL' && !sortedExams.some((e) => e.id === selectedExamId)) {
      setSelectedExamId(latestId);
    }
  }, [sortedExams, selectedExamId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [sortBy, setSortBy] = useState<SortKey>('lgs_desc');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const activeExamMeta = useMemo(
    () => (selectedExamId === 'ALL' ? null : sortedExams.find((e) => e.id === selectedExamId) ?? null),
    [sortedExams, selectedExamId]
  );

  const examParticipantCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of students) {
      for (const ex of s.exams) {
        counts.set(ex.examId, (counts.get(ex.examId) ?? 0) + 1);
      }
    }
    return counts;
  }, [students]);

  const enriched = useMemo(() => {
    const list: Array<{ student: StudentProfile; summary: StudentProgressSummary }> = [];
    for (const student of students) {
      const summary = getStudentSummaryForExam(student, selectedExamId);
      if (summary) list.push({ student, summary });
    }
    return list;
  }, [students, selectedExamId]);

  const classes = useMemo(() => {
    const set = new Set(enriched.map((item) => item.student.sinif));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [enriched]);

  // Reset class filter if selected class has no participants in the newly selected exam
  useEffect(() => {
    if (selectedClass !== 'ALL' && !classes.includes(selectedClass)) {
      setSelectedClass('ALL');
    }
  }, [classes, selectedClass]);

  const examStats = useMemo(() => {
    if (enriched.length === 0) return null;
    const avgLgs =
      Math.round(
        (enriched.reduce((sum, e) => sum + e.summary.latest.lgsPuan, 0) / enriched.length) * 100
      ) / 100;
    const avgNet =
      Math.round(
        (enriched.reduce((sum, e) => sum + e.summary.latest.toplam.net, 0) / enriched.length) * 100
      ) / 100;
    return { avgLgs, avgNet, count: enriched.length };
  }, [enriched]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase('tr');
    const items = enriched.filter(({ student }) => {
      if (selectedClass !== 'ALL' && student.sinif !== selectedClass) return false;
      if (!q) return true;
      return (
        student.name.toLocaleLowerCase('tr').includes(q) ||
        student.numara.includes(q) ||
        student.sinif.toLocaleLowerCase('tr').includes(q)
      );
    });

    items.sort((a, b) => {
      switch (sortBy) {
        case 'lgs_desc':
          return b.summary.latest.lgsPuan - a.summary.latest.lgsPuan;
        case 'net_desc':
          return b.summary.latest.toplam.net - a.summary.latest.toplam.net;
        case 'delta_desc':
          return (b.summary.netDeltaPrev ?? -999) - (a.summary.netDeltaPrev ?? -999);
        case 'rank_asc':
          return (a.summary.latest.dereceler.okul ?? 9999) - (b.summary.latest.dereceler.okul ?? 9999);
        case 'name_asc':
          return a.student.name.localeCompare(b.student.name, 'tr');
        default:
          return 0;
      }
    });

    return items;
  }, [enriched, searchQuery, selectedClass, sortBy]);

  if (students.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-8 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-blue-700">
          <FileUp className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Henüz deneme PDF&apos;i yüklenmedi</h2>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-500">
          Toplu deneme sonuç PDF veya Excel dosyanızı yüklediğinizde tüm öğrenciler için otomatik kartlar, satır satır deneme arşivi ve kazanım eksikleri analizi oluşturulur.
        </p>
        <button
          type="button"
          onClick={onOpenUpload}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
        >
          <FileUp className="h-4 w-4" />
          İlk Deneme Dosyasını Yükle
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Exam Selector Bar — strictly separates each exam's cards and results */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-700" />
            <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
              Deneme Seçimi
            </span>
          </div>
          {examStats && (
            <div className="font-mono text-xs text-slate-500 tabular-nums">
              {activeExamMeta ? (
                <>
                  {activeExamMeta.examDate ? `${activeExamMeta.examDate} · ` : ''}
                  {examStats.count} öğrenci · Ort. LGS{' '}
                  <strong className="font-semibold text-slate-900">
                    {formatTrNumber(examStats.avgLgs, 2)}
                  </strong>{' '}
                  · Ort. Net{' '}
                  <strong className="font-semibold text-blue-700">
                    {formatTrNumber(examStats.avgNet, 2)}
                  </strong>
                </>
              ) : (
                <>
                  Tüm Arşiv (Son Sonuç) · {examStats.count} öğrenci · {sortedExams.length} deneme
                </>
              )}
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {sortedExams.map((exam, idx) => {
            const isSelected = selectedExamId === exam.id;
            const participantCount = examParticipantCounts.get(exam.id) ?? exam.studentCount;
            return (
              <button
                key={exam.id}
                type="button"
                onClick={() => setSelectedExamId(exam.id)}
                className={`inline-flex max-w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'border-blue-700 bg-blue-700 text-white shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-800'
                }`}
              >
                <span
                  className={`font-mono text-[11px] font-bold tabular-nums ${
                    isSelected ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  #{idx + 1}
                </span>
                <span className="max-w-[210px] truncate sm:max-w-[260px]">{exam.name}</span>
                <span
                  className={`shrink-0 font-mono text-[11px] tabular-nums ${
                    isSelected ? 'text-blue-100' : 'text-slate-500'
                  }`}
                >
                  ({participantCount})
                </span>
              </button>
            );
          })}

          {sortedExams.length > 1 && (
            <button
              type="button"
              onClick={() => setSelectedExamId('ALL')}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                selectedExamId === 'ALL'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>Tümü (Son Sonuç)</span>
              <span
                className={`font-mono text-[11px] tabular-nums ${
                  selectedExamId === 'ALL' ? 'text-slate-300' : 'text-slate-400'
                }`}
              >
                ({students.length})
              </span>
            </button>
          )}
        </div>
      </section>

      {/* Filter & Controls Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative flex-1 lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Öğrenci adı veya okul numarası ara..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sort */}
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span>Sırala:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
              >
                <option value="lgs_desc">LGS Puanı (Yüksek → Düşük)</option>
                <option value="net_desc">Toplam Net (Yüksek → Düşük)</option>
                <option value="rank_asc">Okul Sırası (1 → Son)</option>
                <option value="delta_desc">Önceki Denemeye Göre Gelişim (Δ Net)</option>
                <option value="name_asc">İsim (A → Z)</option>
              </select>
            </label>

            {/* View mode toggle */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Kartlar
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="h-3.5 w-3.5" />
                Toplu Liste
              </button>
            </div>
          </div>
        </div>

        {/* Class filter segmented buttons (counts reflect ONLY selected exam's participants) */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div className="grid w-full grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-7">
            <button
              type="button"
              onClick={() => setSelectedClass('ALL')}
              className={`flex min-h-10 w-full items-center justify-center rounded-md px-1.5 py-2 text-center text-xs font-medium transition-colors tabular-nums ${
                selectedClass === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tümü ({enriched.length})
            </button>
            {classes.map((cls) => {
              const count = enriched.filter((item) => item.student.sinif === cls).length;
              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedClass(cls)}
                  className={`flex min-h-10 w-full items-center justify-center rounded-md px-1.5 py-2 text-center text-xs font-medium transition-colors tabular-nums ${
                    selectedClass === cls
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cls} ({count})
                </button>
              );
            })}
          </div>
          <span className="text-xs text-slate-500 tabular-nums">
            {filtered.length} öğrenci gösteriliyor
          </span>
        </div>
      </div>

      {/* Empty Search Result */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Seçili denemede arama kriterlerine uygun öğrenci bulunamadı.
        </div>
      ) : viewMode === 'cards' ? (
        /* Student Cards Grid */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(({ student, summary }) => {
            const { latest, netDeltaPrev, lgsDeltaPrev, weakestSubject, examCount } = summary;
            const weakMeta = SUBJECT_MAP[weakestSubject];
            const weakScore = latest.subjects[weakestSubject];
            const diffSchoolLgs =
              latest.okulOrtPuan !== undefined
                ? Math.round((latest.lgsPuan - latest.okulOrtPuan) * 10) / 10
                : undefined;

            return (
              <button
                key={student.id}
                type="button"
                onClick={() => onSelectStudent(student.id)}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-blue-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              >
                <div>
                  {/* Card Header — unboxed clean metadata */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-blue-700">
                        {student.name}
                      </h3>
                      <p className="mt-0.5 text-xs font-medium text-slate-500 tabular-nums">
                        {student.sinif} · No: {student.numara} · {examCount} Deneme
                        {latest.dereceler.okul ? ` · Okul #${latest.dereceler.okul}` : ''}
                      </p>
                    </div>
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />
                  </div>

                  {/* Primary KPI Row */}
                  <div className="mt-4 grid grid-cols-2 gap-4 border-y border-slate-100 py-3">
                    <div>
                      <span className="block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        LGS Puanı
                      </span>
                      <div className="mt-0.5 flex items-baseline gap-2">
                        <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                          {formatTrNumber(latest.lgsPuan, 2)}
                        </span>
                        {lgsDeltaPrev !== undefined ? (
                          <span
                            className={`inline-flex items-center font-mono text-xs font-semibold tabular-nums ${
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
                            {formatTrDelta(lgsDeltaPrev, 1)}
                          </span>
                        ) : diffSchoolLgs !== undefined ? (
                          <span
                            className={`font-mono text-[11px] font-medium tabular-nums ${
                              diffSchoolLgs >= 0 ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            Okul {formatTrDelta(diffSchoolLgs, 1)}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <span className="block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        Toplam Net
                      </span>
                      <div className="mt-0.5 flex items-baseline gap-2">
                        <span className="font-mono text-xl font-bold text-blue-700 tabular-nums">
                          {formatTrNumber(latest.toplam.net, 2)}
                        </span>
                        {netDeltaPrev !== undefined && (
                          <span
                            className={`inline-flex items-center font-mono text-xs font-semibold tabular-nums ${
                              netDeltaPrev > 0
                                ? 'text-emerald-700'
                                : netDeltaPrev < 0
                                ? 'text-red-700'
                                : 'text-slate-500'
                            }`}
                          >
                            {formatTrDelta(netDeltaPrev, 2)}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 font-mono text-[11px] text-slate-500 tabular-nums">
                        {latest.toplam.dogru}D · {latest.toplam.yanlis}Y · {latest.toplam.bos}B
                      </p>
                    </div>
                  </div>

                  {/* 6-Subject Mini Net Breakdown */}
                  <div className="mt-3.5 grid grid-cols-3 gap-x-3 gap-y-2.5">
                    {SUBJECT_LIST.map((s) => {
                      const sc = latest.subjects[s.key];
                      const fillPct = Math.max(0, Math.min(100, (sc.net / s.questionCount) * 100));
                      return (
                        <div key={s.key}>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-medium text-slate-600">{s.shortLabel}</span>
                            <span
                              className={`font-mono font-semibold tabular-nums ${
                                sc.net < 0 ? 'text-red-700' : 'text-slate-900'
                              }`}
                            >
                              {formatTrNumber(sc.net, 2)}
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${fillPct}%`,
                                backgroundColor:
                                  sc.basariYuzdesi < 35
                                    ? '#DC2626'
                                    : sc.basariYuzdesi < 65
                                    ? '#D97706'
                                    : '#16A34A',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card Footer: Priority Weakness */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <span className="truncate text-slate-600">
                    {weakScore.basariYuzdesi < 65 ? (
                      <>
                        Öncelik:{' '}
                        <strong className="font-semibold text-red-700">
                          {weakMeta.label} ({formatTrNumber(weakScore.net, 2)} Net)
                        </strong>
                      </>
                    ) : (
                      <span className="font-medium text-emerald-700">
                        Tüm derslerde dengeli başarı
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 font-semibold text-blue-700 group-hover:underline">
                    Detay
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* Compact High-Density Bulk Table */
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Öğrenci</th>
                <th className="px-3 py-3">Şube</th>
                <th className="px-3 py-3 text-right">Deneme</th>
                {SUBJECT_LIST.map((s) => (
                  <th key={s.key} className="px-2.5 py-3 text-right">
                    {s.shortLabel} Net
                  </th>
                ))}
                <th className="px-3 py-3 text-right">Top. D/Y/B</th>
                <th className="px-3 py-3 text-right">Top. Net</th>
                <th className="px-3 py-3 text-right">LGS Puanı</th>
                <th className="px-3 py-3 text-right">Okul Sıra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map(({ student, summary }) => {
                const { latest, examCount, netDeltaPrev } = summary;
                return (
                  <tr
                    key={student.id}
                    onClick={() => onSelectStudent(student.id)}
                    className="cursor-pointer transition-colors hover:bg-blue-50/40"
                  >
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-slate-900">{student.name}</div>
                      <div className="font-mono text-xs text-slate-400 tabular-nums">
                        No: {student.numara}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-medium text-slate-700">{student.sinif}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs text-slate-500 tabular-nums">
                      {examCount}
                    </td>
                    {SUBJECT_LIST.map((s) => {
                      const sc = latest.subjects[s.key];
                      return (
                        <td
                          key={s.key}
                          className={`px-2.5 py-2.5 text-right font-mono text-xs tabular-nums ${
                            sc.net < 0 ? 'font-semibold text-red-700' : 'text-slate-700'
                          }`}
                        >
                          {formatTrNumber(sc.net, 2)}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2.5 text-right font-mono text-xs text-slate-500 tabular-nums">
                      {latest.toplam.dogru}/{latest.toplam.yanlis}/{latest.toplam.bos}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-blue-700 tabular-nums">
                      {formatTrNumber(latest.toplam.net, 2)}
                      {netDeltaPrev !== undefined && (
                        <span
                          className={`ml-1 text-[11px] font-medium ${
                            netDeltaPrev >= 0 ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          ({formatTrDelta(netDeltaPrev, 2)})
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatTrNumber(latest.lgsPuan, 2)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs text-slate-600 tabular-nums">
                      {latest.dereceler.okul ? `#${latest.dereceler.okul}` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
