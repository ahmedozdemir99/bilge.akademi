import type { PracticeExamRecord } from '../types/academy';
import { calculateTrialRobotSummary } from './exportUtils';

export function summarizePracticeForAnalysis(exams: PracticeExamRecord[]) {
  const summary = calculateTrialRobotSummary(exams);
  const byDate = new Map<string, { count: number; totalNet: number }>();
  for (const exam of exams) {
    const stats = byDate.get(exam.examDate) ?? { count: 0, totalNet: 0 };
    stats.count += 1;
    stats.totalNet += exam.totalNet;
    byDate.set(exam.examDate, stats);
  }
  const recent = [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-10)
    .map(([date, { count, totalNet }]) => ({ date, count, avgNet: Number((totalNet / count).toFixed(2)) }));
  return {
    examCount: summary.examCount,
    avgTotalNet: summary.avgTotalNet,
    avgTotalCorrect: summary.avgTotalCorrect,
    avgLgsScore: summary.avgLgsScore,
    subjects: summary.subjectAverages.map(({ label, avgNet, maxQuestions }) => ({ label, avgNet, maxQuestions })),
    recent,
  };
}

export function formatPracticeForAnalysis(input: unknown): string {
  if (!input || typeof input !== 'object') return 'Deneme verisi paylaşılmadı.';
  const data = input as Record<string, unknown>;
  const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : 0;
  const count = number(data.examCount);
  if (count <= 0) return 'Henüz deneme kaydı yok.';
  const subjects = Array.isArray(data.subjects) ? data.subjects.slice(0, 6) : [];
  const recent = Array.isArray(data.recent) ? data.recent.slice(-10) : [];
  return [
    `Sonuç sayısı ${count}, ortalama ${number(data.avgTotalNet)} net, ortalama ${number(data.avgTotalCorrect)} doğru, tahmini LGS ortalaması ${number(data.avgLgsScore)}.`,
    ...subjects.filter((value) => value && typeof value === 'object').map(({ label, avgNet, maxQuestions }) =>
      `- ${String(label ?? '').slice(0, 60)}: ${number(avgNet)} net / ${number(maxQuestions)} soru`),
    ...recent.filter((value) => value && typeof value === 'object').map(({ date, count, avgNet }) =>
      `- ${String(date ?? '').slice(0, 10)}: ${number(avgNet)} net (${number(count)} sonuç)`),
  ].join('\n');
}
