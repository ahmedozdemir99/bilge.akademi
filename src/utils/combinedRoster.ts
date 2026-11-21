import { classKind } from './classKinds';
import { normalizeSearchText } from './searchText';
import type { SchoolClass } from '../types/academy';
import type { BulkInput } from './bulkStudentRecords';

function normalizeYear(value: string) {
  return value.replace(/[–—]/g, '-').replace(/\s/g, '');
}

export function combinedRosterInputs(rows: string[][], year: string, classes: SchoolClass[]): BulkInput[] {
  const academicYear = normalizeYear(year);
  const firstYear = Number(academicYear.slice(0, 4));
  if (!/^\d{4}-\d{4}$/.test(academicYear) || Number(academicYear.slice(5)) !== firstYear + 1) {
    throw new Error('Öğretim yılını 2026-2027 biçiminde girin.');
  }

  const headerIndex = rows.findIndex((row) => row.some(Boolean));
  const header = rows[headerIndex]?.map(normalizeSearchText) ?? [];
  const classColumn = header.indexOf('sinif');
  const numberColumn = header.findIndex((cell) => ['okul no', 'okul numarasi', 'ogrenci no'].includes(cell));
  const nameColumn = header.indexOf('ad soyad');
  if ([classColumn, numberColumn, nameColumn].includes(-1)) {
    throw new Error('CSV dosyasının ilk satırında Sınıf, Okul No ve Ad Soyad sütunları olmalıdır.');
  }

  const groups = new Map<string, { gradeLevel: number; section: string; lines: string[] }>();
  const quote = (value: string) => '"' + value.replace(/"/g, '""') + '"';
  for (let index = headerIndex + 1; index < rows.length; index += 1) {
    const row = rows[index];
    if (!row.some(Boolean)) continue;
    const match = /^(1[0-2]|[1-9])\s*[-/–]?\s*(\p{L}{1,4})$/u.exec(row[classColumn] ?? '');
    const number = row[numberColumn];
    const name = row[nameColumn];
    if (!match || !/^\d{1,12}$/.test(number ?? '') || number === '0' || !name || name.length < 2) {
      throw new Error(`CSV satır ${index + 1}. Sınıfı (ör. 8/A), okul numarasını ve ad soyadı kontrol edin.`);
    }

    const gradeLevel = Number(match[1]);
    const section = match[2].toLocaleUpperCase('tr');
    const key = `${gradeLevel}/${section}`;
    const group = groups.get(key) ?? { gradeLevel, section, lines: [] };
    group.lines.push(`${quote(number)};${quote(name)}`);
    groups.set(key, group);
  }

  if (!groups.size) throw new Error('CSV dosyasında öğrenci satırı bulunamadı.');

  return Array.from(groups, ([name, { gradeLevel, section, lines }]) => {
    const matches = classes.filter((record) =>
      classKind(record) === 'school' && normalizeYear(record.academicYear) === academicYear &&
      record.gradeLevel === gradeLevel && normalizeSearchText(record.section) === normalizeSearchText(section));
    if (matches.length > 1) {
      throw new Error(`${name} için birden fazla sınıf bulundu. Öğrencileri eklemek için okul sınıfını tekli aktarımda seçin.`);
    }
    return {
      mode: 'roster',
      classId: matches[0]?.id ?? '',
      newClass: matches.length ? undefined : { name, gradeLevel, section, academicYear },
      text: lines.join('\n'),
    };
  });
}
