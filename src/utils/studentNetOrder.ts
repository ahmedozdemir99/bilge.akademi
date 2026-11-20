import type { PracticeExamRecord, Student } from '../types/academy';

export type StudentNetOrder = 'default' | 'descending' | 'ascending';

export const STUDENT_NET_ORDERS: { value: StudentNetOrder; label: string }[] = [
  { value: 'default', label: 'Varsayılan sıra' },
  { value: 'descending', label: 'Neti yüksekten düşüğe' },
  { value: 'ascending', label: 'Neti düşükten yükseğe' },
];

export function summarizeStudentNets(exams: PracticeExamRecord[]) {
  const totals = new Map<string, { count: number; net: number }>();
  for (const exam of exams) {
    const current = totals.get(exam.studentId) ?? { count: 0, net: 0 };
    current.count += 1;
    current.net += exam.totalNet;
    totals.set(exam.studentId, current);
  }
  return new Map([...totals].map(([id, { count, net }]) => [id, { count, average: Number((net / count).toFixed(2)) }]));
}

export function orderStudentsByNet(
  students: Student[],
  nets: ReturnType<typeof summarizeStudentNets>,
  order: StudentNetOrder
) {
  if (order === 'default') return students;
  const direction = order === 'descending' ? -1 : 1;
  return [...students].sort((a, b) => {
    const first = nets.get(a.id);
    const second = nets.get(b.id);
    if (!first || !second) return Number(!first) - Number(!second);
    return (first.average - second.average) * direction;
  });
}
