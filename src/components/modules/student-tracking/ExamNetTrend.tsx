import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { MiddleSchoolTrialSubjectKey, PracticeExamRecord } from '../../../types/academy';
import { calculateNet, formatShortTurkishDate, LGS_SUBJECT_CONFIG } from '../../../utils/exportUtils';
import { normalizeSearchText } from '../../../utils/searchText';
import { trialSubjectColors } from '../../../utils/subjectColors';

const format = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 });
const signed = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2, signDisplay: 'exceptZero' });
type Metric = 'total' | MiddleSchoolTrialSubjectKey;

export function examNetTrend(exams: PracticeExamRecord[], metric: Metric) {
  const groups = new Map<string, { title: string; date: string; count: number; sum: number }>();
  for (const exam of exams) {
    const key = JSON.stringify([exam.examDate, normalizeSearchText(exam.examTitle)]);
    const group = groups.get(key) ?? { title: exam.examTitle, date: exam.examDate, count: 0, sum: 0 };
    group.count += 1;
    group.sum += metric === 'total' ? exam.totalNet : calculateNet(exam[`${metric}D`], exam[`${metric}Y`], exam.wrongPenalty);
    groups.set(key, group);
  }
  return [...groups.values()]
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title, 'tr'))
    .map(({ date, title, count, sum }) => ({
      date, title, count, net: Number((sum / count).toFixed(2)), label: formatShortTurkishDate(date),
    }));
}

export function ExamNetTrend({ exams, group = false }: { exams: PracticeExamRecord[]; group?: boolean }) {
  const [metric, setMetric] = useState<Metric>('total');
  const points = useMemo(() => examNetTrend(exams, metric), [exams, metric]);
  const latest = points.at(-1);
  const previous = points.at(-2);
  const subject = LGS_SUBJECT_CONFIG.find(({ key }) => key === metric);
  const color = metric === 'total' ? '#0f9488' : trialSubjectColors[metric].color;

  return (
    <section className="min-w-0 space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <h3 className="text-base font-semibold text-navy-900 dark:text-white">Deneme Net Gelişimi</h3>
        {latest && <label className="space-y-1 text-sm font-medium">Grafik
          <select className="block rounded-lg border border-slate-300 bg-white px-3 py-2 text-base dark:border-slate-700 dark:bg-slate-950"
            value={metric} onChange={(event) => setMetric(event.target.value as Metric)}>
            <option value="total">Toplam net</option>
            {LGS_SUBJECT_CONFIG.map(({ key, label }) => <option value={key} key={key}>{label}</option>)}
          </select>
        </label>}
      </header>
      {!latest ? <p className="text-sm text-slate-600 dark:text-slate-300">Grafik için deneme kaydı ekleyin.</p> : <>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-950">
            <dt className="text-sm">{group ? 'Son deneme ortalaması' : 'Son deneme'}</dt>
            <dd className="font-bold">{format.format(latest.net)} net</dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-950">
            <dt className="text-sm">Önceki denemeye göre</dt>
            <dd className="font-bold">{previous ? signed.format(latest.net - previous.net) + ' net' : '—'}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-950">
            <dt className="text-sm">En yüksek net</dt>
            <dd className="font-bold">{format.format(Math.max(...points.map(({ net }) => net)))}</dd>
          </div>
        </dl>
        <div className="h-56 w-full sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 10, left: -14, right: 12, bottom: 2 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={['auto', subject?.maxQuestions ?? 90]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip formatter={(value) => [format.format(Number(value)) + ' net', group ? 'Ortalama' : 'Sonuç']}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.title ? `${label} · ${payload[0].payload.title}` : label} />
              <Line dataKey="net" stroke={color} strokeWidth={2.5} dot={{ r: 4 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <details className="space-y-2 text-sm">
          <summary className="cursor-pointer font-medium underline">Deneme değerlerini göster</summary>
          <div className="max-w-full overflow-auto" role="region" aria-label="Deneme değerleri" tabIndex={0}>
            <table className="w-full text-left">
              <thead><tr><th className="p-2" scope="col">Deneme</th><th className="p-2" scope="col">Tarih</th>
                {group && <th className="p-2" scope="col">Katılım</th>}
                <th className="p-2" scope="col">Net</th><th className="p-2" scope="col">Değişim</th>
              </tr></thead>
              <tbody>{points.map((point, index) => <tr key={point.date + point.title} className="border-t border-slate-200 dark:border-slate-800">
                <th className="p-2 font-medium" scope="row">{point.title}</th>
                <td className="whitespace-nowrap p-2">{point.label}</td>
                {group && <td className="p-2">{point.count}</td>}
                <td className="p-2">{format.format(point.net)}</td>
                <td className="p-2">{index ? signed.format(point.net - points[index - 1].net) : '—'}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </details>
      </>}
    </section>
  );
}
