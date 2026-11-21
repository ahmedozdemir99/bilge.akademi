import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { ExamArchiveState, SUBJECT_LIST, SUBJECT_MAP, SubjectKey } from '../types/exam';
import {
  buildSchoolKazanimWeaknesses,
  formatTrNumber,
  getStudentSummaryForExam,
} from '../utils/analytics';

interface SchoolWeaknessViewProps {
  state: ExamArchiveState;
  onSelectStudent: (studentId: string) => void;
}

export const SchoolWeaknessView: React.FC<SchoolWeaknessViewProps> = ({
  state,
  onSelectStudent,
}) => {
  const sortedExams = useMemo(
    () => [...state.exams].sort((a, b) => a.examOrder - b.examOrder),
    [state.exams]
  );

  const [selectedExamId, setSelectedExamId] = useState<string>(() => {
    const ordered = [...state.exams].sort((a, b) => a.examOrder - b.examOrder);
    return ordered.length > 0 ? ordered[ordered.length - 1].id : 'ALL';
  });
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey | 'ALL'>('ALL');

  useEffect(() => {
    if (sortedExams.length === 0) {
      setSelectedExamId('ALL');
    } else if (selectedExamId !== 'ALL' && !sortedExams.some((e) => e.id === selectedExamId)) {
      setSelectedExamId(sortedExams[sortedExams.length - 1].id);
    }
  }, [sortedExams, selectedExamId]);

  const classes = useMemo(() => {
    const set = new Set(state.students.map((s) => s.sinif));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [state.students]);

  const kazanimWeaknesses = useMemo(() => {
    const all = buildSchoolKazanimWeaknesses(state, selectedClass, selectedExamId);
    return selectedSubject === 'ALL'
      ? all
      : all.filter((k) => k.subject === selectedSubject);
  }, [state, selectedClass, selectedSubject, selectedExamId]);

  const subjectUrgentStudents = useMemo(() => {
    const focusSubject: SubjectKey = selectedSubject === 'ALL' ? 'matematik' : selectedSubject;
    return state.students
      .filter((s) => selectedClass === 'ALL' || s.sinif === selectedClass)
      .map((student) => {
        const summary = getStudentSummaryForExam(student, selectedExamId);
        if (!summary) return null;
        const sc = summary.latest.subjects[focusSubject];
        return { student, score: sc, lgs: summary.latest.lgsPuan };
      })
      .filter(
        (x): x is NonNullable<typeof x> =>
          Boolean(x && (x.score.basariYuzdesi < 35 || x.score.net <= 0))
      )
      .sort((a, b) => a.score.net - b.score.net)
      .slice(0, 15);
  }, [state.students, selectedClass, selectedSubject, selectedExamId]);

  const activeFocusSubject: SubjectKey = selectedSubject === 'ALL' ? 'matematik' : selectedSubject;

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Okul Geneli Eksik ve Kazanım Analizi</h1>
          <p className="text-xs text-slate-500">
            Deneme, şube veya ders bazında en düşük başarıya sahip kazanımları ve öncelikli destek gerektiren öğrencileri tespit edin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {sortedExams.length > 0 && (
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="max-w-[220px] rounded-lg border border-blue-300 bg-blue-50/50 px-3 py-1.5 text-xs font-semibold text-blue-900 focus:border-blue-600 focus:outline-none"
            >
              {sortedExams.map((ex, idx) => (
                <option key={ex.id} value={ex.id}>
                  #{idx + 1} {ex.name}
                </option>
              ))}
              {sortedExams.length > 1 && <option value="ALL">Tüm Denemeler (Son Sonuç)</option>}
            </select>
          )}

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
          >
            <option value="ALL">Tüm Şubeler</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                Şube {cls}
              </option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value as SubjectKey | 'ALL')}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
          >
            <option value="ALL">Tüm Dersler</option>
            {SUBJECT_LIST.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main 2-column Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Weakest Kazanımlar Table */}
        <section className="rounded-xl border border-slate-200 bg-white lg:col-span-2">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-900">
              En Düşük Başarılı Kazanımlar ({kazanimWeaknesses.length} Kazanım)
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Son deneme verilerine göre en düşük ortalamadan en yükseğe sıralanmıştır.
            </p>
          </div>

          {kazanimWeaknesses.length === 0 ? (
            <div className="px-5 py-12 text-center text-xs text-slate-500">
              Kazanım verisi bulunamadı. Toplu Sonuç Belgesi içeren PDF yüklendiğinde tüm kazanımlar otomatik analiz edilir.
            </div>
          ) : (
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                  <tr>
                    <th className="px-4 py-2.5">Ders</th>
                    <th className="px-4 py-2.5">Kazanım</th>
                    <th className="px-3 py-2.5 text-right">Eksik Öğrenci</th>
                    <th className="px-4 py-2.5 text-right">Ort. Başarı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {kazanimWeaknesses.map((k, idx) => (
                    <tr key={`${k.subject}_${idx}`} className="hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-4 py-2.5 font-semibold text-slate-700">
                        {SUBJECT_MAP[k.subject].shortLabel}
                      </td>
                      <td className="px-4 py-2.5 text-slate-800">{k.text}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-slate-600 tabular-nums">
                        {k.strugglingStudentCount} / {k.studentCount}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right font-mono font-bold tabular-nums">
                        <span
                          className={
                            k.avgSuccessPct < 35
                              ? 'text-red-700'
                              : k.avgSuccessPct < 60
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                          }
                        >
                          %{k.avgSuccessPct}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Urgent Support Students Sidebar */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Destek Gerektiren Öğrenciler
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {SUBJECT_MAP[activeFocusSubject].label} dersinde %35 altı veya 0/negatif net yapanlar
            </p>
          </div>

          {subjectUrgentStudents.length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-slate-500">
              Bu filtrede kritik eşik altında öğrenci bulunmuyor.
            </div>
          ) : (
            <div className="max-h-[600px] divide-y divide-slate-100 overflow-y-auto">
              {subjectUrgentStudents.map(({ student, score }) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => onSelectStudent(student.id)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-slate-900">{student.name}</div>
                    <div className="mt-0.5 font-mono text-[11px] text-slate-500 tabular-nums">
                      {student.sinif} · {score.dogru}D · {score.yanlis}Y · {score.bos}B
                    </div>
                  </div>
                  <div className="ml-2 flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-red-700 tabular-nums">
                      {formatTrNumber(score.net, 2)} Net
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
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
