import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { PracticeExamRecord, SchoolClass, Student } from '../../../types/academy';
import { calculateNet, formatTurkishDate, LGS_SUBJECT_CONFIG } from '../../../utils/exportUtils';
import { CLASS_KINDS, classKind } from '../../../utils/classKinds';
import { normalizeSearchText } from '../../../utils/searchText';
import { hasPublishedTrialScore } from '../../../utils/bulkStudentRecords';

const netText = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 });
const metrics = [
  { key: 'correct', label: 'Doğru', color: '#0f766e' },
  { key: 'wrong', label: 'Yanlış', color: '#be123c' },
  { key: 'blank', label: 'Boş', color: '#64748b' },
] as const;
const totalQuestions = LGS_SUBJECT_CONFIG.reduce((total, subject) => total + subject.maxQuestions, 0);

export function groupClassTrials(exams: PracticeExamRecord[]) {
  const groups = new Map<string, { key: string; title: string; date: string; rows: PracticeExamRecord[] }>();
  for (const exam of exams) {
    const key = JSON.stringify([exam.examDate, normalizeSearchText(exam.examTitle)]);
    const group = groups.get(key) ?? { key, title: exam.examTitle, date: exam.examDate, rows: [] };
    group.rows.push(exam);
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, 'tr'));
}

export function summarizeClassTrialDistribution(exams: PracticeExamRecord[]) {
  if (!exams.length) return [];
  return LGS_SUBJECT_CONFIG.map(({ key, label, shortLabel, maxQuestions }) => {
    let correct = 0;
    let wrong = 0;
    let net = 0;
    for (const exam of exams) {
      const d = exam[`${key}D`];
      const y = exam[`${key}Y`];
      correct += d;
      wrong += y;
      net += calculateNet(d, y, exam.wrongPenalty);
    }
    return {
      label, shortLabel, correct: correct / exams.length, wrong: wrong / exams.length,
      blank: maxQuestions - (correct + wrong) / exams.length, net: net / exams.length, maxQuestions,
    };
  });
}

function ResultCell({ d, y, questions, net }: { d: number; y: number; questions: number; net: number }) {
  return <td className="px-3 py-2.5 tabular-nums">
    <span className="block text-xs text-slate-600 dark:text-slate-300">{d} D · {y} Y · {questions - d - y} B</span>
    <strong>{netText.format(net)} net</strong>
  </td>;
}

export function ClassTrialArchive({ classes, students, exams, classId, onClassChange, onReports, onStudent }: {
  classes: SchoolClass[];
  students: Student[];
  exams: PracticeExamRecord[];
  classId: string;
  onClassChange: (id: string) => void;
  onReports: (id: string) => void;
  onStudent: (id: string) => void;
}) {
  const current = classes.find((item) => item.id === classId) ?? classes.find((item) => exams.some((exam) => exam.classId === item.id)) ?? classes[0];
  const groups = useMemo(() => groupClassTrials(exams.filter((item) => item.classId === current?.id)), [exams, current?.id]);
  const roster = useMemo(() => new Map(students.map((item) => [item.id, item])), [students]);

  return <section className="min-w-0 space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Sınıf Deneme Arşivi</h2>
        <label className="block space-y-1 text-sm font-medium">
          <span>Sınıf</span>
          <select value={current?.id ?? ''} onChange={(event) => onClassChange(event.target.value)}
            className="block max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base dark:border-slate-700 dark:bg-slate-950">
            {classes.length === 0 && <option value="">Sınıf bulunamadı</option>}
            {CLASS_KINDS.map(({ value, label }) => <optgroup key={value} label={label}>
              {classes.filter((item) => classKind(item) === value).map((item) => <option key={item.id} value={item.id}>{item.name} · {item.academicYear}</option>)}
            </optgroup>)}
          </select>
        </label>
      </div>
      {current && <button type="button" onClick={() => onReports(current.id)}
        className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white">Sınıf Raporlarını Aç</button>}
    </div>
    {!groups.length && <p className="text-sm text-slate-600 dark:text-slate-300">Bu sınıfta kayıtlı deneme sonucu yok.</p>}
    {groups.map((group, index) => (
      <details key={(current?.id ?? '') + group.key} open={index === 0 ? true : undefined}
        className="min-w-0 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <summary className="cursor-pointer font-semibold">
          {group.title} <span className="text-sm font-normal text-slate-600 dark:text-slate-300">· {formatTurkishDate(group.date)} · {group.rows.length} öğrenci</span>
        </summary>
        <p className="my-2 text-xs text-slate-600 dark:text-slate-300">D Doğru · Y Yanlış · B Boş</p>
        <div role="region" aria-label={group.title + ' sınıf sonuçları'} tabIndex={0}
          className="max-h-[32rem] max-w-full overflow-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800"><tr>
              <th scope="col" className="sticky left-0 bg-inherit px-3 py-2">Öğrenci</th>
              {LGS_SUBJECT_CONFIG.map(({ key, shortLabel }) => <th key={key} scope="col" className="px-3 py-2">{shortLabel}</th>)}
              <th scope="col" className="px-3 py-2">Toplam</th>
              <th scope="col" className="px-3 py-2">LGS puanı</th>
            </tr></thead>
            <tbody>{[...group.rows].sort((a, b) => (roster.get(a.studentId)?.fullName ?? '').localeCompare(roster.get(b.studentId)?.fullName ?? '', 'tr'))
              .map((exam) => {
                const student = roster.get(exam.studentId);
                const published = hasPublishedTrialScore(exam.id);
                return <tr key={exam.id} className="border-t border-slate-200 dark:border-slate-800">
                  <th scope="row" className="sticky left-0 bg-white px-3 py-2 dark:bg-slate-900">
                    {student ? <button type="button" onClick={() => onStudent(student.id)}
                      className="block max-w-40 truncate text-left font-semibold text-teal-700 underline dark:text-teal-300" title={student.fullName}>{student.fullName}</button> : 'Öğrenci'}
                    {student && <span className="text-xs font-normal text-slate-600 dark:text-slate-300">{student.studentNumber}</span>}
                  </th>
                  {LGS_SUBJECT_CONFIG.map(({ key, maxQuestions }) => {
                    const d = exam[`${key}D`];
                    const y = exam[`${key}Y`];
                    return <ResultCell key={key} d={d} y={y} questions={maxQuestions} net={calculateNet(d, y, exam.wrongPenalty)} />;
                  })}
                  <ResultCell d={exam.totalCorrect} y={exam.totalWrong} questions={totalQuestions} net={exam.totalNet} />
                  <td className="px-3 py-2.5 tabular-nums">{exam.estimatedLgsScore.toLocaleString('tr-TR', { minimumFractionDigits: published ? 3 : 1 })}
                    {!published && <span className="block text-xs text-slate-600 dark:text-slate-300">Tahmini</span>}
                  </td>
                </tr>;
              })}</tbody>
          </table>
        </div>
      </details>
    ))}
  </section>;
}

export function ClassTrialDistribution({ exams }: { exams: PracticeExamRecord[] }) {
  const rows = useMemo(() => summarizeClassTrialDistribution(exams), [exams]);
  if (!rows.length) return null;
  const ordered = [...rows].sort((a, b) => b.net / b.maxQuestions - a.net / a.maxQuestions);
  const strongest = ordered[0];
  const lowest = ordered.at(-1)!;
  const avgTotal = (field: 'totalCorrect' | 'totalWrong' | 'totalNet') => exams.reduce((total, exam) => total + exam[field], 0) / exams.length;
  return <section className="min-w-0 space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
    <h3 className="font-semibold">Denemelerde Doğru, Yanlış ve Boş Dağılımı</h3>
    <p className="text-sm text-slate-600 dark:text-slate-300">{groupClassTrials(exams).length} deneme · {exams.length} öğrenci sonucu</p>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, left: -18, right: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="shortLabel" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 20]} allowDecimals={false} />
          <Tooltip formatter={(value) => netText.format(Number(value))} />
          <Legend />
          {metrics.map(({ key, label, color }) => <Bar key={key} stackId="distribution" dataKey={key} name={label} fill={color} isAnimationActive={false} />)}
        </BarChart>
      </ResponsiveContainer>
    </div>
    <p className="text-sm"><strong>Ortalama toplam</strong> · {netText.format(avgTotal('totalCorrect'))} doğru · {netText.format(avgTotal('totalWrong'))} yanlış · {netText.format(totalQuestions - avgTotal('totalCorrect') - avgTotal('totalWrong'))} boş · {netText.format(avgTotal('totalNet'))} net</p>
    <p className="text-sm"><strong>En yüksek net oranı</strong> · {strongest.label} ({netText.format(strongest.net)} / {strongest.maxQuestions})</p>
    <p className="text-sm"><strong>En düşük net oranı</strong> · {lowest.label} ({netText.format(lowest.net)} / {lowest.maxQuestions})</p>
  </section>;
}
