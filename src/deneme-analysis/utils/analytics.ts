import {
  AggregatedKazanimGap,
  ExamArchiveState,
  SUBJECT_LIST,
  SUBJECT_MAP,
  SubjectDiagnostic,
  SubjectKey,
  StudentExamRecord,
  StudentProfile,
} from '../types/exam';

export function formatTrNumber(value: number | undefined, decimals = 2): string {
  if (value === undefined || value === null || !Number.isFinite(value)) return '—';
  return value.toLocaleString('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatTrDelta(value: number | undefined, decimals = 2): string {
  if (value === undefined || value === null || !Number.isFinite(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatTrNumber(value, decimals)}`;
}

export function getSortedExams(student: StudentProfile): StudentExamRecord[] {
  return [...student.exams].sort((a, b) => {
    if (a.examOrder !== b.examOrder) return a.examOrder - b.examOrder;
    return a.examDate.localeCompare(b.examDate);
  });
}

export interface StudentProgressSummary {
  latest: StudentExamRecord;
  previous?: StudentExamRecord;
  first: StudentExamRecord;
  examCount: number;
  lgsDeltaPrev?: number;
  netDeltaPrev?: number;
  lgsDeltaFirst?: number;
  netDeltaFirst?: number;
  bestLgs: number;
  avgLgs: number;
  avgNet: number;
  subjectNetDeltas: Partial<Record<SubjectKey, number>>;
  weakestSubject: SubjectKey;
  strongestSubject: SubjectKey;
}

export function getStudentSummaryForExam(
  student: StudentProfile,
  examId?: string
): StudentProgressSummary | null {
  const sorted = getSortedExams(student);
  if (sorted.length === 0) return null;

  let targetIdx = sorted.length - 1;
  if (examId && examId !== 'ALL') {
    targetIdx = sorted.findIndex((e) => e.examId === examId);
    if (targetIdx === -1) return null;
  }

  const latest = sorted[targetIdx];
  const previous = targetIdx >= 1 ? sorted[targetIdx - 1] : undefined;
  const first = sorted[0];

  const subjectNetDeltas: Partial<Record<SubjectKey, number>> = {};
  if (previous) {
    for (const s of SUBJECT_LIST) {
      subjectNetDeltas[s.key] =
        Math.round((latest.subjects[s.key].net - previous.subjects[s.key].net) * 100) / 100;
    }
  }

  let weakestSubject: SubjectKey = 'matematik';
  let weakestPct = Infinity;
  let strongestSubject: SubjectKey = 'turkce';
  let strongestPct = -Infinity;

  for (const s of SUBJECT_LIST) {
    const pct = latest.subjects[s.key].basariYuzdesi;
    if (pct < weakestPct) {
      weakestPct = pct;
      weakestSubject = s.key;
    }
    if (pct > strongestPct) {
      strongestPct = pct;
      strongestSubject = s.key;
    }
  }

  const bestLgs = Math.max(...sorted.map((e) => e.lgsPuan));
  const avgLgs =
    Math.round((sorted.reduce((a, e) => a + e.lgsPuan, 0) / sorted.length) * 100) / 100;
  const avgNet =
    Math.round((sorted.reduce((a, e) => a + e.toplam.net, 0) / sorted.length) * 100) / 100;

  return {
    latest,
    previous,
    first,
    examCount: sorted.length,
    lgsDeltaPrev: previous
      ? Math.round((latest.lgsPuan - previous.lgsPuan) * 1000) / 1000
      : undefined,
    netDeltaPrev: previous
      ? Math.round((latest.toplam.net - previous.toplam.net) * 100) / 100
      : undefined,
    lgsDeltaFirst:
      targetIdx >= 1 ? Math.round((latest.lgsPuan - first.lgsPuan) * 1000) / 1000 : undefined,
    netDeltaFirst:
      targetIdx >= 1 ? Math.round((latest.toplam.net - first.toplam.net) * 100) / 100 : undefined,
    bestLgs,
    avgLgs,
    avgNet,
    subjectNetDeltas,
    weakestSubject,
    strongestSubject,
  };
}

export function getStudentProgressSummary(student: StudentProfile): StudentProgressSummary | null {
  return getStudentSummaryForExam(student, 'ALL');
}

export function buildStudentSubjectDiagnostics(student: StudentProfile): SubjectDiagnostic[] {
  const summary = getStudentProgressSummary(student);
  if (!summary) return [];
  const { latest, previous, subjectNetDeltas } = summary;

  const diagnostics: SubjectDiagnostic[] = [];

  for (const meta of SUBJECT_LIST) {
    const score = latest.subjects[meta.key];
    const delta = subjectNetDeltas[meta.key];
    const wrongRatio = score.soru > 0 ? score.yanlis / score.soru : 0;
    const blankRatio = score.soru > 0 ? score.bos / score.soru : 0;
    const vsSchoolDiff =
      score.kurumOrt !== undefined
        ? Math.round((score.net - score.kurumOrt) * 100) / 100
        : undefined;

    const isNegativeOrVeryLow = score.net <= 0 || score.basariYuzdesi < 35;
    const isHighWrongPenalty = score.yanlis >= 4 && score.yanlis >= score.dogru;
    const isHighBlank = blankRatio >= 0.4;
    const isSharpDrop = delta !== undefined && delta <= -1.5;
    const isBelowSchool = vsSchoolDiff !== undefined && vsSchoolDiff < -1.5;

    if (isNegativeOrVeryLow || isSharpDrop) {
      let detail = `${score.dogru} doğru, ${score.yanlis} yanlış, ${score.bos} boş (${formatTrNumber(score.net)} net · %${score.basariYuzdesi} başarı).`;
      let action = `${meta.label} temel konu tekrarlarına öncelik verilmeli ve eksik kazanımlar üzerinden kademeli soru çözümü planlanmalıdır.`;

      if (isSharpDrop && previous) {
        detail += ` Önceki denemeye göre ${formatTrDelta(delta)} net düşüş var.`;
        action = `Son denemedeki düşüşün nedeni (konu eksiği veya dikkat hatası) kazanım bazında incelenip hedefli telafi testi uygulanmalıdır.`;
      } else if (isHighWrongPenalty) {
        detail += ` Yanlış sayısı doğru sayısına eşit veya fazla — emin olunmayan sorularda tahmin nedeniyle net kaybı oluşuyor.`;
        action = `Emin olunmayan soruları boş bırakma stratejisi uygulanmalı ve yanlış yapılan soruların çözüm analizi yapılmalıdır.`;
      } else if (isHighBlank) {
        detail += ` Soruların %${Math.round(blankRatio * 100)}'i boş bırakılmış (konu eksiği veya süre yönetimi sorunu).`;
        action = `Temel kavram eksiği olan kazanımlar tamamlanmalı ve süreli branş denemeleriyle çözüm hızı artırılmalıdır.`;
      }

      diagnostics.push({
        subject: meta.key,
        severity: 'critical',
        title: `${meta.label} — Öncelikli Geliştirme Alanı`,
        detail,
        action,
        latestNet: score.net,
        netDelta: delta,
        basariYuzdesi: score.basariYuzdesi,
        wrongRatio,
        blankRatio,
        vsSchoolDiff,
      });
    } else if (score.basariYuzdesi < 65 || isHighWrongPenalty || isHighBlank || isBelowSchool) {
      let detail = `${score.dogru} doğru, ${score.yanlis} yanlış, ${score.bos} boş (${formatTrNumber(score.net)} net · %${score.basariYuzdesi} başarı).`;
      let action = `Orta ve yeni nesil soru pratikleri artırılarak net ortalaması yukarı çekilmelidir.`;

      if (isHighWrongPenalty) {
        detail += ` Yüksek yanlış oranı (${score.yanlis} Y) netleri aşağı çekiyor.`;
        action = `Soru kökünü dikkatli okuma ve yanlış analizi defteri tutma alışkanlığı kazandırılmalıdır.`;
      } else if (isHighBlank) {
        detail += ` ${score.bos} boş soru ile süre veya konu pekiştirme eksiği görülüyor.`;
        action = `Boş bırakılan kazanımlarda çözümlü örneklerle pratik yapılmalıdır.`;
      } else if (isBelowSchool && vsSchoolDiff !== undefined) {
        detail += ` Okul ortalamasının ${formatTrNumber(Math.abs(vsSchoolDiff))} net altında.`;
      }

      diagnostics.push({
        subject: meta.key,
        severity: 'warning',
        title: `${meta.label} — Geliştirilmeli`,
        detail,
        action,
        latestNet: score.net,
        netDelta: delta,
        basariYuzdesi: score.basariYuzdesi,
        wrongRatio,
        blankRatio,
        vsSchoolDiff,
      });
    } else {
      let detail = `${score.dogru} doğru, ${score.yanlis} yanlış, ${score.bos} boş (${formatTrNumber(score.net)} net · %${score.basariYuzdesi} başarı).`;
      if (delta !== undefined && delta > 0) {
        detail += ` Önceki denemeye göre ${formatTrDelta(delta)} net artış sağlandı.`;
      }
      diagnostics.push({
        subject: meta.key,
        severity: 'strength',
        title: `${meta.label} — Güçlü Performans`,
        detail,
        action: `Mevcut başarıyı korumak için düzenli yeni nesil soru ve haftalık branş tekrarları sürdürülmelidir.`,
        latestNet: score.net,
        netDelta: delta,
        basariYuzdesi: score.basariYuzdesi,
        wrongRatio,
        blankRatio,
        vsSchoolDiff,
      });
    }
  }

  const severityOrder = { critical: 0, warning: 1, strength: 2 };
  diagnostics.sort((a, b) => {
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    const weightDiff = SUBJECT_MAP[b.subject].weight - SUBJECT_MAP[a.subject].weight;
    if (a.severity === 'critical' && weightDiff !== 0) return weightDiff;
    return a.basariYuzdesi - b.basariYuzdesi;
  });

  return diagnostics;
}

export function aggregateStudentKazanimlar(student: StudentProfile): AggregatedKazanimGap[] {
  const sorted = getSortedExams(student);
  const map = new Map<string, AggregatedKazanimGap>();

  for (const exam of sorted) {
    for (const k of exam.kazanimlar) {
      const key = `${k.subject}__${k.text.toLowerCase().trim()}`;
      const existing = map.get(key);
      if (existing) {
        existing.examCount += 1;
        existing.totalSoru += k.soru;
        existing.totalDogru += k.dogru;
        existing.totalYanlis += k.yanlis;
        existing.totalBos += k.bos;
        existing.latestExamName = exam.examName;
      } else {
        map.set(key, {
          subject: k.subject,
          text: k.text,
          examCount: 1,
          totalSoru: k.soru,
          totalDogru: k.dogru,
          totalYanlis: k.yanlis,
          totalBos: k.bos,
          basariYuzdesi: k.basariYuzdesi,
          latestExamName: exam.examName,
          status: 'eksik',
        });
      }
    }
  }

  const list = Array.from(map.values()).map((item) => {
    const pct = item.totalSoru > 0 ? Math.round((item.totalDogru / item.totalSoru) * 100) : 0;
    const status: AggregatedKazanimGap['status'] =
      pct < 50 ? 'eksik' : pct < 75 ? 'gelistirilmeli' : 'basarili';
    return { ...item, basariYuzdesi: pct, status };
  });

  list.sort((a, b) => {
    if (a.basariYuzdesi !== b.basariYuzdesi) return a.basariYuzdesi - b.basariYuzdesi;
    const aMissed = a.totalSoru - a.totalDogru;
    const bMissed = b.totalSoru - b.totalDogru;
    return bMissed - aMissed;
  });

  return list;
}

export interface ClassStudentRow {
  studentId: string;
  name: string;
  numara: string;
  sinif: string;
  lgsPuan: number;
  toplamNet: number;
  subjectNets: Record<SubjectKey, number>;
  lgsDelta?: number;
  toplamNetDelta?: number;
  subjectNetDeltas: Partial<Record<SubjectKey, number>>;
}

export interface ClassSummaryRow {
  sinif: string;
  studentCount: number;
  avgLgs: number;
  avgToplamNet: number;
  subjectNets: Record<SubjectKey, number>;
  avgLgsDelta?: number;
  avgNetDelta?: number;
  subjectNetDeltas: Partial<Record<SubjectKey, number>>;
  students: ClassStudentRow[];
}

export function buildClassComparison(
  state: ExamArchiveState,
  targetExamId?: string,
  compareExamId?: string
): ClassSummaryRow[] {
  const byClass = new Map<
    string,
    Array<{ student: StudentProfile; target: StudentExamRecord; compare?: StudentExamRecord }>
  >();

  for (const student of state.students) {
    const sorted = getSortedExams(student);
    if (sorted.length === 0) continue;

    const target = targetExamId
      ? sorted.find((e) => e.examId === targetExamId)
      : sorted[sorted.length - 1];
    if (!target) continue;

    let compare: StudentExamRecord | undefined;
    if (compareExamId) {
      compare = sorted.find((e) => e.examId === compareExamId);
    } else {
      const targetIdx = sorted.findIndex((e) => e.examId === target.examId);
      if (targetIdx > 0) compare = sorted[targetIdx - 1];
    }

    const arr = byClass.get(student.sinif) ?? [];
    arr.push({ student, target, compare });
    byClass.set(student.sinif, arr);
  }

  const rows: ClassSummaryRow[] = [];
  for (const [sinif, entries] of byClass.entries()) {
    const count = entries.length;
    const avgLgs =
      Math.round((entries.reduce((s, e) => s + e.target.lgsPuan, 0) / count) * 100) / 100;
    const avgToplamNet =
      Math.round((entries.reduce((s, e) => s + e.target.toplam.net, 0) / count) * 100) / 100;

    const subjectNets = {} as Record<SubjectKey, number>;
    const subjectNetDeltas: Partial<Record<SubjectKey, number>> = {};

    const comparedEntries = entries.filter((e) => e.compare !== undefined);

    for (const s of SUBJECT_LIST) {
      subjectNets[s.key] =
        Math.round((entries.reduce((acc, e) => acc + e.target.subjects[s.key].net, 0) / count) * 100) /
        100;

      if (comparedEntries.length > 0) {
        const avgDiff =
          comparedEntries.reduce(
            (acc, e) => acc + (e.target.subjects[s.key].net - e.compare!.subjects[s.key].net),
            0
          ) / comparedEntries.length;
        subjectNetDeltas[s.key] = Math.round(avgDiff * 100) / 100;
      }
    }

    let avgNetDelta: number | undefined;
    let avgLgsDelta: number | undefined;
    if (comparedEntries.length > 0) {
      avgNetDelta =
        Math.round(
          (comparedEntries.reduce(
            (acc, e) => acc + (e.target.toplam.net - e.compare!.toplam.net),
            0
          ) /
            comparedEntries.length) *
            100
        ) / 100;
      avgLgsDelta =
        Math.round(
          (comparedEntries.reduce(
            (acc, e) => acc + (e.target.lgsPuan - e.compare!.lgsPuan),
            0
          ) /
            comparedEntries.length) *
            100
        ) / 100;
    }

    const students: ClassStudentRow[] = entries
      .map(({ student, target, compare }) => {
        const sNets = {} as Record<SubjectKey, number>;
        const sDeltas: Partial<Record<SubjectKey, number>> = {};
        for (const s of SUBJECT_LIST) {
          sNets[s.key] = target.subjects[s.key].net;
          if (compare) {
            sDeltas[s.key] =
              Math.round((target.subjects[s.key].net - compare.subjects[s.key].net) * 100) / 100;
          }
        }
        return {
          studentId: student.id,
          name: student.name,
          numara: student.numara,
          sinif: student.sinif,
          lgsPuan: target.lgsPuan,
          toplamNet: target.toplam.net,
          subjectNets: sNets,
          lgsDelta: compare
            ? Math.round((target.lgsPuan - compare.lgsPuan) * 100) / 100
            : undefined,
          toplamNetDelta: compare
            ? Math.round((target.toplam.net - compare.toplam.net) * 100) / 100
            : undefined,
          subjectNetDeltas: sDeltas,
        };
      })
      .sort((a, b) => b.lgsPuan - a.lgsPuan);

    rows.push({
      sinif,
      studentCount: count,
      avgLgs,
      avgToplamNet,
      subjectNets,
      avgLgsDelta,
      avgNetDelta,
      subjectNetDeltas,
      students,
    });
  }

  return rows.sort((a, b) => a.sinif.localeCompare(b.sinif, 'tr'));
}

export interface SchoolKazanimWeakness {
  subject: SubjectKey;
  text: string;
  studentCount: number;
  avgSuccessPct: number;
  strugglingStudentCount: number;
}

export function buildSchoolKazanimWeaknesses(
  state: ExamArchiveState,
  classFilter = 'ALL',
  examId?: string
): SchoolKazanimWeakness[] {
  const map = new Map<
    string,
    { subject: SubjectKey; text: string; pctSum: number; count: number; struggling: number }
  >();

  for (const student of state.students) {
    if (classFilter !== 'ALL' && student.sinif !== classFilter) continue;
    const sorted = getSortedExams(student);
    const target =
      examId && examId !== 'ALL'
        ? sorted.find((e) => e.examId === examId)
        : sorted[sorted.length - 1];
    if (!target) continue;

    for (const k of target.kazanimlar) {
      const key = `${k.subject}__${k.text.toLowerCase().trim()}`;
      const entry = map.get(key) ?? {
        subject: k.subject,
        text: k.text,
        pctSum: 0,
        count: 0,
        struggling: 0,
      };
      entry.pctSum += k.basariYuzdesi;
      entry.count += 1;
      if (k.basariYuzdesi < 50) entry.struggling += 1;
      map.set(key, entry);
    }
  }

  return Array.from(map.values())
    .map((e) => ({
      subject: e.subject,
      text: e.text,
      studentCount: e.count,
      avgSuccessPct: Math.round(e.pctSum / Math.max(1, e.count)),
      strugglingStudentCount: e.struggling,
    }))
    .sort((a, b) => a.avgSuccessPct - b.avgSuccessPct);
}

export function exportStudentArchiveCsv(student: StudentProfile): string {
  const sorted = getSortedExams(student);
  const headers = [
    'Deneme Adı',
    'Tarih',
    'LGS Puanı',
    'Okul Sıra',
    'Genel Sıra',
    ...SUBJECT_LIST.flatMap((s) => [
      `${s.shortLabel} D`,
      `${s.shortLabel} Y`,
      `${s.shortLabel} B`,
      `${s.shortLabel} Net`,
    ]),
    'Toplam D',
    'Toplam Y',
    'Toplam B',
    'Toplam Net',
  ];

  const rows = sorted.map((ex) => [
    `"${ex.examName.replace(/"/g, '""')}"`,
    ex.examDate,
    formatTrNumber(ex.lgsPuan, 3),
    ex.dereceler.okul ?? '',
    ex.dereceler.genel ?? '',
    ...SUBJECT_LIST.flatMap((s) => {
      const sc = ex.subjects[s.key];
      return [sc.dogru, sc.yanlis, sc.bos, formatTrNumber(sc.net, 2)];
    }),
    ex.toplam.dogru,
    ex.toplam.yanlis,
    ex.toplam.bos,
    formatTrNumber(ex.toplam.net, 2),
  ]);

  return '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
}
