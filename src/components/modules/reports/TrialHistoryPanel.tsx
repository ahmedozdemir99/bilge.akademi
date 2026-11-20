import { useId, useMemo, useState, type CSSProperties } from 'react';
import {
  AreaChart as AreaIcon, ArrowDown, ArrowUp, BarChart3, BookOpen, Calculator,
  ChartNoAxesCombined, FlaskConical, Landmark, Languages, Minus, MoonStar,
} from 'lucide-react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart,
  ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import type { PracticeExamRecord, Student } from '../../../types/academy';
import { calculateTrialHistory, type TrialHistoryPoint, type TrialSubjectHistory } from '../../../utils/trialHistory';

export const trialSubjectColors = {
  turkce: { color: '#db2777', light: '#f472b6', icon: BookOpen },
  matematik: { color: '#7c3aed', light: '#a78bfa', icon: Calculator },
  fen: { color: '#047857', light: '#34d399', icon: FlaskConical },
  inkilap: { color: '#c2410c', light: '#fb923c', icon: Landmark },
  din: { color: '#0369a1', light: '#38bdf8', icon: MoonStar },
  ingilizce: { color: '#4f46e5', light: '#818cf8', icon: Languages },
};

const chartTypes = [
  { id: 'line', label: 'Çizgi', icon: ChartNoAxesCombined },
  { id: 'bar', label: 'Sütun', icon: BarChart3 },
  { id: 'area', label: 'Alan', icon: AreaIcon },
] as const;

type ChartType = (typeof chartTypes)[number]['id'];
const netFormat = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const changeFormat = new Intl.NumberFormat('tr-TR', { signDisplay: 'exceptZero', maximumFractionDigits: 2 });
const dateFormat = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const controlStyle = 'min-h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

function displayDate(date: string) {
  const value = new Date(date);
  return Number.isNaN(value.getTime()) ? date : dateFormat.format(value);
}

function HistoryTooltip({ point }: { point?: TrialHistoryPoint }) {
  if (!point) return null;
  return (
    <div className="max-w-56 whitespace-normal rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 shadow-lg dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
      <p className="break-words font-semibold">{point.title}</p>
      <p className="mt-1 text-slate-500 dark:text-slate-400">{displayDate(point.date)} · {point.count} öğrenci</p>
      <p className="mt-2 font-semibold">{netFormat.format(point.net)} net
        {point.change !== null && <span className="ml-2 font-normal">Fark {changeFormat.format(point.change)}</span>}
      </p>
    </div>
  );
}

function SubjectChart({ type, points, maximum, title }: {
  type: ChartType;
  points: TrialHistoryPoint[];
  maximum: number;
  title: string;
}) {
  const gradient = useId();
  const minimum = Math.min(0, ...points.map(({ net }) => Math.floor(net)));
  const upper = Math.max(maximum, ...points.map(({ net }) => Math.ceil(net)));
  const chrome = <>
    <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.18} strokeDasharray="3 4" />
    <XAxis dataKey="number" tickFormatter={(n) => `#${n}`} tick={{ fill: 'currentColor', fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={18} />
    <YAxis domain={[minimum, upper]} width={34} tick={{ fill: 'currentColor', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
    {minimum < 0 && <ReferenceLine y={0} stroke="currentColor" strokeOpacity={0.65} />}
    <Tooltip cursor={{ stroke: 'currentColor', strokeOpacity: 0.4, fill: 'var(--subject-color)', fillOpacity: 0.08 }}
      content={({ payload }) => <HistoryTooltip point={payload?.[0]?.payload} />} />
  </>;
  const dot = { r: 3, fill: 'var(--subject-color)', stroke: 'var(--subject-color)' };
  const margin = { top: 12, right: 12, bottom: 2, left: 0 };

  return (
    <div role="group" aria-label={`${title} net geçmişi grafiği`} className="h-48 min-w-0 text-slate-600 dark:text-slate-300 sm:h-52">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 192 }}>
        {type === 'bar' ? (
          <BarChart data={points} margin={margin}>
            {chrome}
            <Bar dataKey="net" fill="var(--subject-color)" radius={4} maxBarSize={38} isAnimationActive={false} />
          </BarChart>
        ) : type === 'area' ? (
          <AreaChart data={points} margin={margin}>
            <defs>
              <linearGradient id={gradient} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--subject-color)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--subject-color)" stopOpacity={0.06} />
              </linearGradient>
            </defs>
            {chrome}
            <Area dataKey="net" stroke="var(--subject-color)" strokeWidth={2.5} fill={`url(#${gradient})`}
              baseValue={0} dot={dot} isAnimationActive={false} />
          </AreaChart>
        ) : (
          <LineChart data={points} margin={margin}>
            {chrome}
            <Line dataKey="net" stroke="var(--subject-color)" strokeWidth={2.5} dot={dot} isAnimationActive={false} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function SubjectHistoryCard({ subject, chartType, limit }: {
  subject: TrialSubjectHistory;
  chartType: ChartType;
  limit: number;
}) {
  const { color, light, icon: Icon } = trialSubjectColors[subject.key];
  const points = limit ? subject.points.slice(-limit) : subject.points;
  const latest = subject.points.at(-1);
  const previous = subject.points.at(-2);
  const change = latest?.change ?? null;
  const Direction = change === null || change === 0 ? Minus : change > 0 ? ArrowUp : ArrowDown;
  const changeStyle = change === null || change === 0
    ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
    : change > 0
      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
      : 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300';

  return (
    <article style={{ '--subject-light': color, '--subject-dark': light } as CSSProperties}
      className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 border-t-4 border-t-[var(--subject-color)] bg-white [--subject-color:var(--subject-light)] dark:border-slate-800 dark:border-t-[var(--subject-color)] dark:bg-slate-900 dark:[--subject-color:var(--subject-dark)]">
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--subject-color)_14%,transparent)] text-[var(--subject-color)]">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base font-bold text-navy-900 dark:text-white">{subject.label}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">{subject.points.length} deneme · {subject.maxQuestions} soru</p>
          </div>
        </div>
        {latest && (
          <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold tabular-nums ${changeStyle}`}>
            <Direction aria-hidden="true" className="size-3.5" />
            {change === null ? 'İlk deneme' : change === 0 ? 'Değişim yok' : `${changeFormat.format(change)} net`}
          </span>
        )}
      </header>
      {latest ? (
        <>
          <dl className="mx-4 my-4 grid grid-cols-2 divide-x divide-slate-200 rounded-xl bg-slate-50 py-3 dark:divide-slate-700 dark:bg-slate-950/55 sm:mx-5">
            {[{ label: 'Son deneme', point: latest }, { label: 'Önceki deneme', point: previous }].map(({ label, point }) => (
              <div key={label} className="min-w-0 px-3">
                <dt className="text-xs text-slate-600 dark:text-slate-400">{label}</dt>
                <dd className="font-mono text-xl font-semibold tabular-nums text-navy-900 dark:text-white">{point ? netFormat.format(point.net) : '—'}</dd>
                <dd className="truncate text-xs text-slate-600 dark:text-slate-400" title={point?.title}>{point ? `#${point.number} ${point.title}` : 'Henüz yok'}</dd>
                {point && <dd className="text-xs text-slate-600 dark:text-slate-400">{displayDate(point.date)}</dd>}
              </div>
            ))}
          </dl>
          <div className="px-2"><SubjectChart type={chartType} points={points} maximum={subject.maxQuestions} title={subject.label} /></div>
          <details className="border-t border-slate-100 dark:border-slate-800">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 sm:px-5">Deneme değerlerini göster</summary>
            <div className="overflow-x-auto">
              <table aria-label={`${subject.label} deneme değerleri`} className="w-full text-left text-xs">
                <thead><tr className="bg-slate-50 dark:bg-slate-950/50">
                  <th scope="col" className="px-4 py-2">Deneme</th>
                  <th scope="col" className="px-2 py-2 text-right">Öğrenci</th>
                  <th scope="col" className="px-2 py-2 text-right">Net</th>
                  <th scope="col" className="px-4 py-2 text-right">Fark</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[...points].reverse().map((point) => (
                    <tr key={point.id}>
                      <th scope="row" className="break-words px-4 py-2 font-medium">#{point.number} {point.title}
                        <span className="block font-normal text-slate-600 dark:text-slate-400">{displayDate(point.date)}</span>
                      </th>
                      <td className="px-2 py-2 text-right tabular-nums">{point.count}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{netFormat.format(point.net)}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{point.change === null ? '—' : changeFormat.format(point.change)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      ) : (
        <p className="p-5 text-sm text-slate-600 dark:text-slate-400">Bu seçim için dersin deneme kaydı yok.</p>
      )}
    </article>
  );
}

export function TrialHistoryPanel({ exams, students, studentId, onStudentChange }: {
  exams: readonly PracticeExamRecord[];
  students: readonly Student[];
  studentId: string;
  onStudentChange: (id: string) => void;
}) {
  const [chartType, setChartType] = useState<ChartType>('line');
  const [limit, setLimit] = useState(6);
  const availableStudent = students.find((student) => student.id === studentId);
  const history = useMemo(() => calculateTrialHistory(
    availableStudent ? exams.filter((exam) => exam.studentId === availableStudent.id) : exams,
  ), [exams, availableStudent]);
  const hasHistory = history.some(({ points }) => points.length > 0);
  const settingsId = useId();

  return (
    <section aria-labelledby="trial-history-title" className="space-y-4">
      <div className="rounded-2xl bg-navy-900 p-5 text-white sm:p-7">
        <h2 id="trial-history-title" className="text-2xl font-semibold sm:text-3xl">Ders ders deneme karşılaştırması</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-200">
          Altı LGS dersinde son neti, bir önceki denemeye göre farkı ve geçmiş sonuçları inceleyin.
          Aynı ad ve tarihteki denemeler, seçili öğrencilerin net ortalamasıyla gösterilir.
        </p>
      </div>
      <div className="no-print grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="grid gap-2 sm:grid-cols-2">
          <label htmlFor={`${settingsId}-student`} className="grid min-w-0 gap-1 text-xs font-semibold">
            Öğrenci
            <select id={`${settingsId}-student`} className={controlStyle} value={availableStudent?.id ?? ''} onChange={(event) => onStudentChange(event.target.value)}>
              <option value="">Tüm öğrenciler</option>
              {students.map((student) => <option key={student.id} value={student.id}>{student.fullName}</option>)}
            </select>
          </label>
          <label htmlFor={`${settingsId}-limit`} className="grid min-w-0 gap-1 text-xs font-semibold">
            Deneme aralığı
            <select id={`${settingsId}-limit`} className={controlStyle} value={limit} onChange={(event) => setLimit(Number(event.target.value))}>
              <option value={6}>Son 6 deneme</option>
              <option value={12}>Son 12 deneme</option>
              <option value={0}>Tüm denemeler</option>
            </select>
          </label>
        </div>
        <fieldset className="min-w-0">
          <legend className="mb-1 text-xs font-semibold">Grafik türü</legend>
          <div className="control-grid gap-1.5 [--control-min-width:5rem]">
            {chartTypes.map(({ id, label, icon: ChartIcon }) => (
              <button key={id} type="button" aria-pressed={chartType === id} onClick={() => setChartType(id)}
                className="gap-1.5 rounded-lg border border-slate-200 px-2 text-sm font-semibold text-slate-700 aria-pressed:border-navy-900 aria-pressed:bg-navy-900 aria-pressed:text-white dark:border-slate-700 dark:text-slate-200 dark:aria-pressed:border-teal-700 dark:aria-pressed:bg-teal-800">
                <ChartIcon aria-hidden="true" className="size-4" /> {label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      {!hasHistory && <p role="status" className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">Bu seçim için karşılaştırılacak deneme sonucu yok.</p>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {history.map((subject) => <SubjectHistoryCard key={subject.key} subject={subject} chartType={chartType} limit={limit} />)}
      </div>
    </section>
  );
}
