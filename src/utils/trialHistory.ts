import type { PracticeExamRecord } from '../types/academy';
import { calculateNet, LGS_SUBJECT_CONFIG } from './exportUtils';

function timestampMillis(value: unknown) {
  if (typeof value === 'string') return Date.parse(value) || 0;
  if (value && typeof value === 'object' && 'toMillis' in value && typeof value.toMillis === 'function') {
    return Number(value.toMillis()) || 0;
  }
  return 0;
}

export function calculateTrialHistory(exams: readonly PracticeExamRecord[]) {
  const sessions = new Map<string, {
    title: string;
    date: string;
    results: Map<string, PracticeExamRecord>;
  }>();

  for (const exam of exams) {
    const title = exam.examTitle.trim().replace(/\s+/g, ' ') || 'Adsız deneme';
    const key = JSON.stringify([exam.examDate, title.toLocaleLowerCase('tr')]);
    let session = sessions.get(key);
    if (!session) {
      session = { title, date: exam.examDate, results: new Map() };
      sessions.set(key, session);
    }
    const studentKey = exam.studentId || exam.id;
    const previous = session.results.get(studentKey);
    const revision = timestampMillis(exam.updatedAt ?? exam.createdAt);
    const previousRevision = timestampMillis(previous?.updatedAt ?? previous?.createdAt);
    if (!previous || revision > previousRevision || (revision === previousRevision && exam.id > previous.id)) {
      session.results.set(studentKey, exam);
    }
  }

  const ordered = [...sessions.entries()].sort(([, a], [, b]) =>
    a.date.localeCompare(b.date) || a.title.localeCompare(b.title, 'tr', { numeric: true }));

  return LGS_SUBJECT_CONFIG.map((subject) => {
    const points = ordered.flatMap(([id, session], index) => {
      let sum = 0;
      let count = 0;

      for (const record of session.results.values()) {
        const correct = record[`${subject.key}D`];
        const wrong = record[`${subject.key}Y`];
        if (!Number.isFinite(correct) || !Number.isFinite(wrong)) continue;
        sum += calculateNet(correct, wrong, record.wrongPenalty === 4 ? 4 : 3);
        count += 1;
      }

      return count ? [{
        id,
        number: index + 1,
        title: session.title,
        date: session.date,
        net: Number((sum / count).toFixed(2)),
        count,
      }] : [];
    });

    return {
      ...subject,
      points: points.map((point, index) => ({
        ...point,
        change: index > 0 ? Number((point.net - points[index - 1].net).toFixed(2)) : null,
      })),
    };
  });
}

export type TrialSubjectHistory = ReturnType<typeof calculateTrialHistory>[number];
export type TrialHistoryPoint = TrialSubjectHistory['points'][number];
