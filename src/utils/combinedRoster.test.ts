import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { SchoolClass, Student } from '../types/academy';
import { readImportWorkbook } from './bulkRecordFiles';
import { buildBulkPlan } from './bulkStudentRecords';
import { combinedRosterInputs } from './combinedRoster';
import { firestoreIssue, firestoreIssueMessage } from './firestoreStatus';

const teacherId = 'teacher';
const schoolClass: SchoolClass = {
  id: 'class_8a',
  teacherId,
  name: 'Mevcut sınıf',
  gradeLevel: 8,
  section: 'A',
  academicYear: '2026–2027',
};
const student: Student = {
  id: 'student_1',
  teacherId,
  classId: schoolClass.id,
  fullName: 'Örnek Öğrenci',
  studentNumber: '001',
  gradeLevel: 8,
  status: 'active',
};

test('combined CSV matches existing classes and keeps numbers scoped by class', async () => {
  const file = new File([
    '\uFEFFSınıf,Okul No,Ad Soyad\r\n8-A,001,Örnek Öğrenci\r\n8/b,001,"Diğer, Öğrenci"\r\n',
  ], 'siniflar.csv');
  const [sheet] = await readImportWorkbook(file);
  const classes = [schoolClass];
  const inputs = combinedRosterInputs(sheet.rows, '2026–2027', classes);
  const [existing, added] = await Promise.all(inputs.map((input) =>
    buildBulkPlan(input, { classes, students: [student], grades: [], practiceExams: [] }, teacherId)));

  assert.equal(existing.classId, schoolClass.id);
  assert.equal(existing.rows[0].skip, true);
  assert.equal(added.newClass?.section, 'B');
  assert.equal(added.rows[0].skip, false);
  assert.equal(added.rows[0].student, 'Diğer, Öğrenci');
  assert.equal(added.rows[0].detail, '001');
});

test('combined CSV rejects malformed rows and ambiguous classes before saving', () => {
  const header = ['Sınıf', 'Okul No', 'Ad Soyad'];
  assert.throws(() => combinedRosterInputs([header, ['8', '002', 'Bir Öğrenci']], '2026-2027', []), /CSV satır 2/);
  const rows = [header, ['8A', '002', 'Bir Öğrenci']];
  assert.throws(() => combinedRosterInputs(rows, '2026-2028', []), /Öğretim yılı/);
  assert.throws(() => combinedRosterInputs(rows, '2026-2027', [schoolClass, { ...schoolClass, id: 'duplicate' }]), /birden fazla sınıf/);
});

test('Firestore quota and permissions produce separate user-facing messages', () => {
  assert.equal(firestoreIssue({ code: 'resource-exhausted' }), 'quota');
  assert.equal(firestoreIssue(new Error('Quota limit exceeded. Project details.')), 'quota');
  assert.equal(firestoreIssue({ code: 'firestore/permission-denied' }), 'permission');
  assert.match(firestoreIssueMessage.quota, /kota/);
  assert.doesNotMatch(firestoreIssueMessage.quota, /Project details/);
});
