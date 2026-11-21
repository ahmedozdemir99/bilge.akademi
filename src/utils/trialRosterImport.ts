import type { ClassInput } from '../context/AcademyContext';
import type { SchoolClass, Student } from '../types/academy';
import type { ImportSheet } from './bulkRecordFiles';
import type { PublishedTrialResult } from './isleyenZekaReport';
import { normalizeSearchText } from './searchText';

export interface TrialRosterDraft {
  classId: string;
  label: string;
  newClass?: ClassInput;
  rows: PublishedTrialResult[];
}

const sectionKey = (grade: number, section: string) => grade + '-' + normalizeSearchText(section).replace(/[^a-z0-9]/g, '');

export function trialRosterDrafts(sheets: ImportSheet[], classes: SchoolClass[], students: Student[], selectedClass: string, academicYear: string) {
  const groups = new Map<string, TrialRosterDraft>();
  const issues: string[] = [];
  const ambiguous = new Set<string>();
  const seen = new Map<string, PublishedTrialResult>();
  const selected = classes.find(({ id }) => id === selectedClass);
  const selectedSection = selected ? sectionKey(selected.gradeLevel, selected.section) : '';
  for (const sheet of sheets) {
    for (const row of sheet.published?.results ?? []) {
      const section = /^(\d{1,2})\s*[-–]\s*([\p{L}]{1,3})$/u.exec(row.section.trim());
      if (!section) continue;
      const gradeLevel = Number(section[1]);
      const key = sectionKey(gradeLevel, section[2]);
      if (selectedClass && selectedSection !== key) continue;
      const recordKey = JSON.stringify([key, row.number]);
      const previous = seen.get(recordKey);
      if (previous) {
        if (previous.scores.join() !== row.scores.join() || previous.totalNet !== row.totalNet || previous.score !== row.score ||
          normalizeSearchText(previous.name) !== normalizeSearchText(row.name)) {
          throw new Error(row.section + ' sınıfında aynı okul numarası için farklı PDF kayıtları bulundu. Sayfa aralığını kontrol edin.');
        }
        continue;
      }
      seen.set(recordKey, row);
      const matches = classes.filter((item) => (selectedClass ? item.id === selectedClass : true) && sectionKey(item.gradeLevel, item.section) === key);
      if (matches.length > 1) {
        if (!ambiguous.has(key)) issues.push(row.section + ' için birden fazla sınıf var. Listeden doğru sınıfı seçin.');
        ambiguous.add(key);
        continue;
      }
      const existing = matches[0];
      if (existing && students.some((student) => student.classId === existing.id && student.studentNumber.trim() === row.number)) continue;
      if (row.name.trim().length < 2 || !/\p{L}/u.test(row.name)) {
        issues.push(row.section + ' · ' + row.number + ' numaralı öğrenci için ad soyad okunamadı.');
        continue;
      }
      if (students.some((student) => student.classId !== existing?.id && student.studentNumber.trim() === row.number &&
        normalizeSearchText(student.fullName) === normalizeSearchText(row.name))) {
        issues.push(row.section + ' · ' + row.number + ' numaralı öğrenci başka bir sınıfta kayıtlı.');
        continue;
      }
      const label = existing?.name ?? gradeLevel + '-' + section[2].toLocaleUpperCase('tr');
      const group = groups.get(key) ?? {
        classId: existing?.id ?? '',
        label,
        newClass: existing ? undefined : { name: label, gradeLevel, section: section[2].toLocaleUpperCase('tr'), academicYear },
        rows: [],
      };
      group.rows.push(row);
      groups.set(key, group);
    }
  }
  return { drafts: [...groups.values()], issues };
}
