import type { ClassInput } from '../context/AcademyContext';
import type { PracticeExamRecord, SchoolClass, Student } from '../types/academy';
import { hasPublishedTrialScore, publishedTrialKey, type BulkInput } from './bulkStudentRecords';
import { LGS_SUBJECT_CONFIG } from './exportUtils';
import { normalizeSearchText } from './searchText';

export type TrialArchiveBackup = {
  format: 'bilge-trial-archive-v1';
  title: string;
  date: string;
  classes: {
    classInfo: ClassInput;
    students: { number: string; name: string }[];
    results: { number: string; scores: number[]; penalty: 3 | 4; published?: { totalNet: number; score: number } }[];
  }[];
};

export function createTrialArchiveBackup(selected: { title: string; date: string }, classes: SchoolClass[], students: Student[], exams: PracticeExamRecord[]): TrialArchiveBackup {
  const records = exams.filter(({ examDate, examTitle }) => examDate === selected.date && normalizeSearchText(examTitle) === normalizeSearchText(selected.title));
  const groups = new Map<string, PracticeExamRecord[]>();
  for (const record of records) {
    const group = groups.get(record.classId) ?? [];
    group.push(record);
    groups.set(record.classId, group);
  }

  const bundledClasses = [...groups].map(([id, entries]) => {
    const schoolClass = classes.find((item) => item.id === id);
    if (!schoolClass) throw new Error('Denemeye bağlı sınıflardan biri bulunamadı.');
    const enrolled = students.filter(({ classId }) => classId === id);
    const roster = new Map(enrolled.map((student) => [student.id, student]));
    const { name, section, academicYear, gradeLevel, subjectFocus } = schoolClass;
    return {
      classInfo: { name, section, academicYear, gradeLevel, subjectFocus },
      students: enrolled.map(({ studentNumber, fullName }) => ({ number: studentNumber, name: fullName })),
      results: entries.map((exam) => {
        const student = roster.get(exam.studentId);
        if (!student) throw new Error('Denemeye bağlı öğrenci kayıtlardan biri sınıfında bulunamadı.');
        return {
          number: student.studentNumber,
          scores: LGS_SUBJECT_CONFIG.flatMap(({ key }) => [exam[`${key}D`], exam[`${key}Y`]]),
          penalty: exam.wrongPenalty,
          ...(hasPublishedTrialScore(exam.id) && { published: { totalNet: exam.totalNet, score: exam.estimatedLgsScore } }),
        };
      }),
    };
  });

  return { format: 'bilge-trial-archive-v1', title: selected.title, date: selected.date, classes: bundledClasses };
}

const safeCell = (value: unknown) => typeof value === 'string' && value.trim().length > 0 && !/[\t\r\n]/.test(value);

export function trialArchiveRestoreInputs(backup: TrialArchiveBackup): BulkInput[] {
  if (backup?.format !== 'bilge-trial-archive-v1' || !safeCell(backup.title) || !/^\d{4}-\d{2}-\d{2}$/.test(backup.date)
    || !Array.isArray(backup.classes) || !backup.classes.length) {
    throw new Error('Geçerli bir Bilge Akademi deneme yedeği seçin.');
  }
  return backup.classes.flatMap(({ classInfo, students, results }) => {
    if (!classInfo || !safeCell(classInfo.name) || !safeCell(classInfo.section) || !safeCell(classInfo.academicYear)
      || !Array.isArray(students) || !students.length || !Array.isArray(results) || !results.length) {
      throw new Error('Yedekte sınıf veya öğrenci bilgisi eksik.');
    }
    if (students.some((student) => !safeCell(student?.number) || !safeCell(student?.name))
      || results.some((item) => !safeCell(item?.number) || ![3, 4].includes(item.penalty) || !Array.isArray(item.scores) || item.scores.length !== 12
        || item.scores.some((score) => !Number.isInteger(score) || score < 0))) {
      throw new Error('Yedekte geçersiz öğrenci veya deneme satırı var.');
    }
    const roster = { newClass: classInfo, text: students.map(({ number, name }) => number + '\t' + name).join('\n') };
    return ([3, 4] as const).flatMap((penalty): BulkInput[] => {
      const entries = results.filter((item) => item.penalty === penalty);
      return entries.length ? [{
        mode: 'trials',
        classId: '',
        source: 'file',
        assessment: { examTitle: backup.title, examDate: backup.date, wrongPenalty: penalty },
        roster,
        text: entries.map(({ number, scores }) => [number, ...scores].join('\t')).join('\n'),
        publishedResults: new Map(entries.flatMap(({ number, published }) => published ? [[publishedTrialKey('', number), published] as const] : [])),
      }] : [];
    });
  });
}
