import { ExamArchiveState } from '../types/exam';
import { normalizeClassName, normalizeTurkish } from './pdfParser';

export interface ScoreRepairResult {
  next: ExamArchiveState;
  repaired: number;
  alreadyScored: number;
  skipped: number;
  matched: number;
}

/**
 * Repair only missing LGS scores. Never publish student data in the app bundle,
 * invent scores, create duplicate exams, or overwrite existing valid scores.
 * The CSV has columns: deneme,ogrenci_no,ad_soyad,sinif,lgs_puani,toplam_net
 */
export function repairMissingLgsScores(state: ExamArchiveState, csv: string): ScoreRepairResult {
  const exams = [...state.exams].sort((a, b) => a.examOrder - b.examOrder);
  if (exams.length !== 2) {
    throw new Error('Güvenli eşleştirme için arşivde tam iki deneme olmalı. Mevcut denemeler değiştirilmedi.');
  }
  const lines = csv.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2 || lines[0].trim().toLowerCase() !== 'deneme,ogrenci_no,ad_soyad,sinif,lgs_puani,toplam_net') {
    throw new Error('Beklenen PDF puan CSV biçimi bulunamadı.');
  }
  const entries = lines.slice(1).map((line) => {
    const parts = line.split(',');
    return {
      exam: Number(parts[0]),
      number: (parts[1] ?? '').trim().replace(/^0+/, ''),
      name: normalizeTurkish(parts[2] ?? ''),
      classroom: normalizeClassName(parts[3] ?? ''),
      score: Number(parts[4]),
    };
  });
  const duplicateCounts = new Map<string, number>();
  for (const entry of entries) {
    if (!entry.number || ![1, 2].includes(entry.exam)) continue;
    const key = entry.exam + ':' + entry.number;
    duplicateCounts.set(key, (duplicateCounts.get(key) ?? 0) + 1);
  }
  let repaired = 0, alreadyScored = 0, skipped = 0, matched = 0;
  const students = state.students.map((student) => {
    const number = student.numara.trim().replace(/^0+/, '');
    const sameNumber = state.students.filter((s) => s.numara.trim().replace(/^0+/, '') === number);
    if (!number || sameNumber.length !== 1) return student;
    const examsForStudent = student.exams.map((record) => {
      const index = exams.findIndex((exam) => exam.id === record.examId);
      if (index < 0) return record;
      const candidates = entries.filter((e) => e.exam === index + 1 && e.number === number);
      if (candidates.length !== 1 || duplicateCounts.get((index + 1) + ':' + number) !== 1) {
        if (candidates.length) skipped++;
        return record;
      }
      const entry = candidates[0];
      const studentName = normalizeTurkish(student.name);
      const lastName = (name: string) => name.split(' ').filter(Boolean).at(-1) ?? '';
      // A number is never sufficient on its own: check surname and class.
      if (entry.classroom !== normalizeClassName(student.sinif) ||
          lastName(entry.name) !== lastName(studentName) ||
          !Number.isFinite(entry.score) || entry.score < 100 || entry.score > 500) {
        skipped++;
        return record;
      }
      matched++;
      if (Number.isFinite(record.lgsPuan) && record.lgsPuan >= 100 && record.lgsPuan <= 500) {
        alreadyScored++;
        return record;
      }
      repaired++;
      return { ...record, lgsPuan: entry.score };
    });
    return { ...student, exams: examsForStudent };
  });
  return { next: { ...state, students }, repaired, alreadyScored, skipped, matched };
}
