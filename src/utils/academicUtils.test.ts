import assert from 'node:assert/strict';
import {
  anonymizeStudentForAI,
  calculateAttendanceSummary,
  calculateAverageScore,
  calculateNet,
  calculateSubjectAverages,
  calculateTimeSeriesProgress,
  calculateTrialRobotSummary,
  computePracticeExamTotals,
  normalizeScore,
} from './exportUtils';
import type { AttendanceRecord, Grade, PracticeExamRecord, Student } from '../types/academy';

const sampleStudent: Student = {
  id: 'stu_test_9912',
  teacherId: 'teacher_1',
  classId: 'cls_8a',
  fullName: 'Gizli Öğrenci Adı',
  studentNumber: '998877',
  gradeLevel: 8,
  guardianNote: 'Veli telefonu: 0555 000 00 00',
  status: 'active',
};

const sampleGrades: Grade[] = [
  {
    id: 'g1',
    teacherId: 'teacher_1',
    studentId: 'stu_test_9912',
    classId: 'cls_8a',
    subjectName: 'Matematik',
    examTitle: '1. Yazılı',
    examType: 'Yazılı',
    examDate: '2026-10-01',
    score: 40,
    maxScore: 50,
  },
  {
    id: 'g2',
    teacherId: 'teacher_1',
    studentId: 'stu_test_9912',
    classId: 'cls_8a',
    subjectName: 'Matematik',
    examTitle: '2. Yazılı',
    examType: 'Yazılı',
    examDate: '2026-11-01',
    score: 90,
    maxScore: 100,
  },
  {
    id: 'g3',
    teacherId: 'teacher_1',
    studentId: 'stu_test_9912',
    classId: 'cls_8a',
    subjectName: 'Tarih',
    examTitle: 'Deneme',
    examType: 'Deneme',
    examDate: '2026-10-15',
    score: 70,
    maxScore: 100,
  },
];

const sampleAttendance: AttendanceRecord[] = [
  { id: 'a1', teacherId: 'teacher_1', studentId: 'stu_test_9912', classId: 'cls_8a', date: '2026-10-01', status: 'present' },
  { id: 'a2', teacherId: 'teacher_1', studentId: 'stu_test_9912', classId: 'cls_8a', date: '2026-10-02', status: 'excused', reason: 'Rapor' },
  { id: 'a3', teacherId: 'teacher_1', studentId: 'stu_test_9912', classId: 'cls_8a', date: '2026-10-03', status: 'unexcused' },
  { id: 'a4', teacherId: 'teacher_1', studentId: 'stu_test_9912', classId: 'cls_8a', date: '2026-10-04', status: 'late' },
];

// 1. Score normalization
assert.equal(normalizeScore(40, 50), 80);
assert.equal(normalizeScore(120, 100), 100);
assert.equal(normalizeScore(-10, 100), 0);

// 2. Average calculation (80 + 90 + 70) / 3 = 80
assert.equal(calculateAverageScore(sampleGrades), 80);
assert.equal(calculateAverageScore([]), 0);

// 3. Subject averages sorted descending
const subjects = calculateSubjectAverages(sampleGrades);
assert.equal(subjects[0].subject, 'Matematik');
assert.equal(subjects[0].average, 85);
assert.equal(subjects[1].subject, 'Tarih');
assert.equal(subjects[1].average, 70);

// 4. Time series sorted chronologically
const ts = calculateTimeSeriesProgress(sampleGrades);
assert.deepEqual(
  ts.map((p) => p.date),
  ['2026-10-01', '2026-10-15', '2026-11-01']
);

// 5. Attendance summary (legacy compatibility)
const att = calculateAttendanceSummary(sampleAttendance);
assert.equal(att.present, 1);
assert.equal(att.excused, 1);
assert.equal(att.unexcused, 1);
assert.equal(att.late, 1);
assert.equal(att.attendanceRate, 50);

// 6. PII Anonymization check for Gemini API
const payload = anonymizeStudentForAI(sampleStudent, sampleGrades, sampleAttendance);
const serialized = JSON.stringify(payload);
assert.equal(serialized.includes('Gizli Öğrenci Adı'), false, 'Ad-soyad anonim pakette bulunmamalıdır');
assert.equal(serialized.includes('998877'), false, 'Okul numarası anonim pakette bulunmamalıdır');
assert.equal(serialized.includes('0555'), false, 'Veli notu anonim pakette bulunmamalıdır');
assert.ok(payload.anonymousCode.startsWith('OGR-8-'));

// 7. Practice Exam Net Robot calculations (LGS 3-wrong & 4-wrong penalties)
assert.equal(calculateNet(18, 3, 3), 17);
assert.equal(calculateNet(15, 4, 4), 14);
assert.equal(calculateNet(0, 3, 3), -1);

const exam1Raw = {
  wrongPenalty: 3 as const,
  turkceD: 18,
  turkceY: 2,
  matematikD: 15,
  matematikY: 3,
  fenD: 17,
  fenY: 3,
  inkilapD: 9,
  inkilapY: 1,
  dinD: 10,
  dinY: 0,
  ingilizceD: 9,
  ingilizceY: 0,
};
const totals1 = computePracticeExamTotals(exam1Raw);
assert.equal(totals1.totalCorrect, 78);
assert.equal(totals1.totalWrong, 9);
assert.equal(totals1.totalBlank, 3);
assert.equal(totals1.totalNet, 75);
assert.ok(totals1.estimatedLgsScore >= 195 && totals1.estimatedLgsScore <= 500);

const exam2Raw = {
  wrongPenalty: 3 as const,
  turkceD: 15,
  turkceY: 3,
  matematikD: 12,
  matematikY: 3,
  fenD: 14,
  fenY: 3,
  inkilapD: 8,
  inkilapY: 0,
  dinD: 9,
  dinY: 0,
  ingilizceD: 8,
  ingilizceY: 0,
};
const totals2 = computePracticeExamTotals(exam2Raw);
assert.equal(totals2.totalCorrect, 66);
assert.equal(totals2.totalWrong, 9);
assert.equal(totals2.totalNet, 63);

const robotRecords: PracticeExamRecord[] = [
  {
    id: 'ex1',
    teacherId: 'teacher_1',
    studentId: 'stu_test_9912',
    classId: 'cls_8a',
    examTitle: 'LGS Deneme 1',
    examDate: '2026-10-01',
    ...exam1Raw,
    totalCorrect: totals1.totalCorrect,
    totalWrong: totals1.totalWrong,
    totalNet: totals1.totalNet,
    estimatedLgsScore: totals1.estimatedLgsScore,
  },
  {
    id: 'ex2',
    teacherId: 'teacher_1',
    studentId: 'stu_test_9912',
    classId: 'cls_8a',
    examTitle: 'LGS Deneme 2',
    examDate: '2026-11-01',
    ...exam2Raw,
    totalCorrect: totals2.totalCorrect,
    totalWrong: totals2.totalWrong,
    totalNet: totals2.totalNet,
    estimatedLgsScore: totals2.estimatedLgsScore,
  },
];

const robotSummary = calculateTrialRobotSummary(robotRecords);
assert.equal(robotSummary.examCount, 2);
assert.equal(robotSummary.avgTotalCorrect, 72);
assert.equal(robotSummary.avgTotalWrong, 9);
assert.equal(robotSummary.avgTotalNet, 69);
assert.equal(robotSummary.bestNet, 75);
assert.equal(robotSummary.subjectAverages.length, 6);
assert.equal(robotSummary.subjectAverages[1].key, 'matematik');
assert.equal(robotSummary.subjectAverages[1].avgNet, 12.5);

console.log('BİLGE AKADEMİ birim testleri başarıyla geçti (7/7).');
