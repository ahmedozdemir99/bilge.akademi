import React, { useMemo, useState } from 'react';
import { Calculator, Download, FileUp, Plus, Printer, Trash2 } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PracticeExamInput } from '../../../context/AcademyContext';
import type {
  MiddleSchoolTrialSubjectKey,
  PracticeExamRecord,
  SchoolClass,
  Student,
} from '../../../types/academy';
import {
  calculateNet,
  calculateTrialRobotSummary,
  computePracticeExamTotals,
  exportToCsv,
  formatShortTurkishDate,
  formatTurkishDate,
  LGS_SUBJECT_CONFIG,
  triggerPrintReport,
} from '../../../utils/exportUtils';
import { orderStudentsByNet, STUDENT_NET_ORDERS, summarizeStudentNets, type StudentNetOrder } from '../../../utils/studentNetOrder';
import { hasPublishedTrialScore } from '../../../utils/bulkStudentRecords';
import { CLASS_KINDS, classKind } from '../../../utils/classKinds';
import { trialSubjectColors } from '../../../utils/subjectColors';

interface PracticeExamRobotPanelProps {
  students: Student[];
  classes: SchoolClass[];
  practiceExams: PracticeExamRecord[];
  onAddPracticeExam: (input: PracticeExamInput) => Promise<void>;
  onDeletePracticeExam: (exam: PracticeExamRecord) => void;
  lockedStudentId?: string;
  initialClassId?: string;
  onTrialImport?: () => void;
}

type SubjectInputs = Record<MiddleSchoolTrialSubjectKey, { d: number | ''; y: number | '' }>;

const EMPTY_SUBJECT_INPUTS: SubjectInputs = {
  turkce: { d: '', y: '' },
  matematik: { d: '', y: '' },
  fen: { d: '', y: '' },
  inkilap: { d: '', y: '' },
  din: { d: '', y: '' },
  ingilizce: { d: '', y: '' },
};

export function PracticeExamRobotPanel({
  students,
  classes,
  practiceExams,
  onAddPracticeExam,
  onDeletePracticeExam,
  lockedStudentId,
  initialClassId = 'all',
  onTrialImport,
}: PracticeExamRobotPanelProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [entryClassId, setEntryClassId] = useState(initialClassId);
  const [entryNetOrder, setEntryNetOrder] = useState<StudentNetOrder>('default');
  const [filterStudentId, setFilterStudentId] = useState<string>(lockedStudentId || 'all');
  const [filterClassId, setFilterClassId] = useState<string>('all');

  const [examTitle, setExamTitle] = useState('LGS Kurumsal Deneme Sınavı');
  const [examDate, setExamDate] = useState(today);
  const [resultChoice, setResultChoice] = useState<{ studentId: string; id: string }>();
  const [targetLgsScore, setTargetLgsScore] = useState(440);
  const [draft, setDraft] = useState<{ studentId: string; subjects: SubjectInputs }>();
  const [entryError, setEntryError] = useState('');
  const [saving, setSaving] = useState(false);

  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);
  const classMap = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);

  const studentNets = useMemo(() => summarizeStudentNets(practiceExams), [practiceExams]);
  const entryClass = classes.some(({ id }) => id === entryClassId) ? entryClassId : 'all';
  const entryStudents = useMemo(() => orderStudentsByNet(
    students.filter((student) => entryClass === 'all' || student.classId === entryClass),
    studentNets,
    entryNetOrder
  ), [students, entryClass, studentNets, entryNetOrder]);
  const targetStudent = lockedStudentId
    ? studentMap.get(lockedStudentId)
    : entryStudents.find(({ id }) => id === selectedStudentId) ?? entryStudents[0];

  const studentResults = useMemo(() => practiceExams.filter((exam) => exam.studentId === targetStudent?.id)
    .sort((a, b) => b.examDate.localeCompare(a.examDate)), [practiceExams, targetStudent?.id]);
  const latestResult = studentResults[0];
  const savedResult = resultChoice && resultChoice.studentId === targetStudent?.id
    ? studentResults.find(({ id }) => id === resultChoice.id)
    : studentResults.find(({ id }) => hasPublishedTrialScore(id) || id.startsWith('bulk_file_'));
  const wrongPenalty = savedResult?.wrongPenalty ?? 3;
  const subjects = savedResult
    ? Object.fromEntries(LGS_SUBJECT_CONFIG.map(({ key }) => [key, { d: savedResult[`${key}D`], y: savedResult[`${key}Y`] }])) as SubjectInputs
    : draft && draft.studentId === targetStudent?.id ? draft.subjects : EMPTY_SUBJECT_INPUTS;
  const hasEntry = Object.values(subjects).some(({ d, y }) => d !== '' || y !== '');

  function selectStudent(id: string) {
    if (id !== targetStudent?.id) {
      setDraft(undefined);
      setResultChoice(undefined);
      setEntryError('');
    }
    setSelectedStudentId(id);
  }

  const liveTotals = useMemo(
    () =>
      computePracticeExamTotals({
        wrongPenalty,
        turkceD: Number(subjects.turkce.d),
        turkceY: Number(subjects.turkce.y),
        matematikD: Number(subjects.matematik.d),
        matematikY: Number(subjects.matematik.y),
        fenD: Number(subjects.fen.d),
        fenY: Number(subjects.fen.y),
        inkilapD: Number(subjects.inkilap.d),
        inkilapY: Number(subjects.inkilap.y),
        dinD: Number(subjects.din.d),
        dinY: Number(subjects.din.y),
        ingilizceD: Number(subjects.ingilizce.d),
        ingilizceY: Number(subjects.ingilizce.y),
      }),
    [subjects, wrongPenalty]
  );

  const filteredExams = useMemo(() => {
    return practiceExams
      .filter((ex) => {
        if (lockedStudentId && ex.studentId !== lockedStudentId) return false;
        if (!lockedStudentId && filterStudentId !== 'all' && ex.studentId !== filterStudentId) {
          return false;
        }
        if (!lockedStudentId && filterClassId !== 'all' && ex.classId !== filterClassId) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.examDate.localeCompare(a.examDate));
  }, [filterClassId, filterStudentId, lockedStudentId, practiceExams]);

  const robotSummary = useMemo(
    () => calculateTrialRobotSummary(filteredExams),
    [filteredExams]
  );

  const netTrendData = useMemo(() => {
    return [...filteredExams]
      .sort((a, b) => a.examDate.localeCompare(b.examDate))
      .map((ex) => ({
        label: formatShortTurkishDate(ex.examDate),
        examTitle: ex.examTitle,
        totalNet: ex.totalNet,
        totalCorrect: ex.totalCorrect,
        lgsScore: ex.estimatedLgsScore,
      }));
  }, [filteredExams]);

  const subjectInsights = useMemo(() => {
    if (robotSummary.examCount === 0) return null;
    const ranked = robotSummary.subjectAverages.map((sub) => ({
      ...sub,
      ratio: sub.maxQuestions > 0 ? (sub.avgNet / sub.maxQuestions) * 100 : 0,
      potentialGain: Number(Math.max(0, sub.maxQuestions - sub.avgNet).toFixed(2)),
    }));
    const strongest = [...ranked].sort((a, b) => b.ratio - a.ratio)[0];
    const priority = [...ranked].sort((a, b) => a.ratio - b.ratio)[0];
    const scoreGap = Number((targetLgsScore - robotSummary.avgLgsScore).toFixed(1));
    return { strongest, priority, scoreGap };
  }, [robotSummary, targetLgsScore]);

  const updateSubjectValue = (
    key: MiddleSchoolTrialSubjectKey,
    field: 'd' | 'y',
    rawValue: string,
    maxQ: number
  ) => {
    if (!targetStudent) return;
    const value = rawValue === '' ? '' : Math.max(0, Math.min(maxQ, Math.floor(Number(rawValue))));
    const other = field === 'd' ? 'y' : 'd';
    setEntryError('');
    setDraft((previous) => {
      const current = previous?.studentId === targetStudent.id ? previous.subjects : EMPTY_SUBJECT_INPUTS;
      const pair = current[key];
      const otherValue = pair[other] === '' ? '' : Math.min(pair[other], maxQ - Number(value));
      const nextPair = field === 'd' ? { d: value, y: otherValue } : { d: otherValue, y: value };
      return { studentId: targetStudent.id, subjects: { ...current, [key]: nextPair } };
    });
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const stu = targetStudent;
    if (!stu || savedResult || !hasEntry || saving || examTitle.trim().length < 2) return;
    setEntryError('');

    setSaving(true);
    try {
      await onAddPracticeExam({
        studentId: stu.id,
        classId: stu.classId,
        examTitle: examTitle.trim(),
        examDate,
        wrongPenalty,
        turkceD: Number(subjects.turkce.d),
        turkceY: Number(subjects.turkce.y),
        matematikD: Number(subjects.matematik.d),
        matematikY: Number(subjects.matematik.y),
        fenD: Number(subjects.fen.d),
        fenY: Number(subjects.fen.y),
        inkilapD: Number(subjects.inkilap.d),
        inkilapY: Number(subjects.inkilap.y),
        dinD: Number(subjects.din.d),
        dinY: Number(subjects.din.y),
        ingilizceD: Number(subjects.ingilizce.d),
        ingilizceY: Number(subjects.ingilizce.y),
      });
      setDraft((current) => current === draft ? undefined : current);
    } catch {
      setEntryError('Deneme sonucu kaydedilemedi. Bağlantınızı kontrol edip yeniden deneyin.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportCsv = () => {
    exportToCsv(
      'bilge_akademi_deneme_net_robotu',
      [
        'Tarih',
        'Öğrenci',
        'Sınıf',
        'Deneme Adı',
        'Türkçe D/Y/Net',
        'Matematik D/Y/Net',
        'Fen D/Y/Net',
        'İnkılap D/Y/Net',
        'Din K. D/Y/Net',
        'İngilizce D/Y/Net',
        'Toplam Doğru',
        'Toplam Yanlış',
        'Toplam Net',
        'LGS Puanı',
      ],
      filteredExams.map((ex) => {
        const stu = studentMap.get(ex.studentId);
        const cls = classMap.get(ex.classId);
        const fmt = (d: number, y: number) => `${d}D/${y}Y/${calculateNet(d, y, ex.wrongPenalty)}`;
        return [
          formatTurkishDate(ex.examDate),
          stu?.fullName ?? '-',
          cls?.name ?? '-',
          ex.examTitle,
          fmt(ex.turkceD, ex.turkceY),
          fmt(ex.matematikD, ex.matematikY),
          fmt(ex.fenD, ex.fenY),
          fmt(ex.inkilapD, ex.inkilapY),
          fmt(ex.dinD, ex.dinY),
          fmt(ex.ingilizceD, ex.ingilizceY),
          ex.totalCorrect,
          ex.totalWrong,
          ex.totalNet,
          ex.estimatedLgsScore,
        ];
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Interactive Net Calculator & Entry Robot */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-navy-900 text-gold-400 dark:bg-teal-600/20 dark:text-teal-300 flex items-center justify-center shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-navy-900 dark:text-white">
                Ortaokul / LGS Deneme Sınavı ve Net Hesaplama Robotu
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ders ders doğru ve yanlış sayılarını girin; boş, net, toplam doğru ve tahmini LGS
                puanı anlık hesaplansın ve kaydedilsin.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300 self-start md:self-center">
            <span className="font-semibold text-teal-700 dark:text-teal-400">LGS Standardı</span>
            <span className="mx-1.5 text-slate-400" aria-hidden="true">·</span>
            <span>{wrongPenalty} Yanlış 1 Doğruyu Götürür</span>
          </div>
        </div>

        <form onSubmit={(e) => void handleSaveExam(e)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {!lockedStudentId && <>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Sınıf
                <select value={entryClass} onChange={(event) => {
                  const nextClass = event.target.value;
                  const nextStudents = orderStudentsByNet(students.filter((student) => nextClass === 'all' || student.classId === nextClass), studentNets, entryNetOrder);
                  setEntryClassId(nextClass);
                  selectStudent(nextStudents.find(({ id }) => id === targetStudent?.id)?.id ?? nextStudents[0]?.id ?? '');
                }} className="mt-1 block min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
                  <option value="all">Tüm Sınıflar</option>
                  {CLASS_KINDS.map(({ value, label }) => <optgroup key={value} label={label}>
                    {classes.filter((item) => classKind(item) === value).map((item) => <option value={item.id} key={item.id}>{item.name} · {item.academicYear}</option>)}
                  </optgroup>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Net sırası
                <select value={entryNetOrder} onChange={(event) => {
                  setSelectedStudentId(targetStudent?.id ?? '');
                  setEntryNetOrder(event.target.value as StudentNetOrder);
                }} className="mt-1 block min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
                  {STUDENT_NET_ORDERS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Öğrenci
                <select
                  value={targetStudent?.id ?? ''}
                  onChange={(event) => selectStudent(event.target.value)}
                  disabled={!entryStudents.length}
                  className="mt-1 block min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                >
                  {!entryStudents.length && <option value="">Bu sınıfta öğrenci yok</option>}
                  {entryStudents.map((student) => {
                    const net = studentNets.get(student.id);
                    const schoolClass = classMap.get(student.classId);
                    return <option key={student.id} value={student.id}>
                      {student.fullName}{entryClass === 'all' ? ' (' + (schoolClass?.name ?? student.gradeLevel + '. Sınıf') + ')' : ''}
                      {net ? ' · ' + net.average.toFixed(2) + ' net' : ''}
                    </option>;
                  })}
                </select>
              </label>
            </>}

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-3">
              Gösterilecek deneme
              <select value={savedResult?.id ?? ''} disabled={!targetStudent || saving} onChange={(event) => {
                if (!targetStudent) return;
                setResultChoice({ studentId: targetStudent.id, id: event.target.value });
                setEntryError('');
              }} className="mt-1 block min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
                <option value="">Yeni deneme girişi</option>
                {studentResults.map((exam) => <option key={exam.id} value={exam.id}>{formatTurkishDate(exam.examDate)} · {exam.examTitle}</option>)}
              </select>
            </label>

            <div className={lockedStudentId ? 'md:col-span-2' : ''}>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Deneme Sınavı Adı
              </label>
              <input
                type="text"
                value={savedResult?.examTitle ?? examTitle}
                readOnly={Boolean(savedResult)}
                onChange={(e) => setExamTitle(e.target.value)}
                maxLength={120}
                required
                placeholder="Örn. LGS Türkiye Geneli Deneme 4"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Sınav Tarihi
              </label>
              <input
                type="date"
                value={savedResult?.examDate ?? examDate}
                readOnly={Boolean(savedResult)}
                onChange={(e) => setExamDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {targetStudent && !savedResult && (
            <section aria-label="Seçili öğrencinin kayıtlı denemesi" className="space-y-2 rounded-xl border border-teal-200 bg-teal-50/60 p-4 dark:border-teal-900 dark:bg-teal-950/30">
              <h3 className="text-sm font-semibold">{targetStudent.fullName} · Son kayıtlı deneme</h3>
              {latestResult ? (
                <details key={latestResult.id} className="space-y-2 text-sm">
                  <summary className="cursor-pointer">
                    {latestResult.examTitle} · {formatTurkishDate(latestResult.examDate)} · <strong>{latestResult.totalNet.toFixed(2)} net</strong>
                  </summary>
                  <p>
                    {latestResult.totalCorrect} doğru · {latestResult.totalWrong} yanlış · {90 - latestResult.totalCorrect - latestResult.totalWrong} boş ·{' '}
                    {hasPublishedTrialScore(latestResult.id) ? 'PDF’deki LGS puanı' : 'Tahmini LGS puanı'} {latestResult.estimatedLgsScore.toLocaleString('tr-TR', { maximumFractionDigits: 3 })}
                  </p>
                  <dl className="grid gap-2 sm:grid-cols-3">
                    {LGS_SUBJECT_CONFIG.map(({ key, label }) => {
                      const d = latestResult[`${key}D`];
                      const y = latestResult[`${key}Y`];
                      return <div key={key}>
                        <dt className="font-medium">{label}</dt>
                        <dd>{d} D · {y} Y · {calculateNet(d, y, latestResult.wrongPenalty).toFixed(2)} net</dd>
                      </div>;
                    })}
                  </dl>
                </details>
              ) : <p className="text-sm">Bu öğrencinin kayıtlı denemesi yok.</p>}
            </section>
          )}

          <div className="space-y-1">
            <h3 className="text-sm font-semibold">{savedResult ? targetStudent?.fullName + ' · Kayıtlı deneme' : 'Yeni deneme girişi'}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {savedResult ? 'Değerler seçilen deneme kaydından dolduruldu.' : targetStudent ? 'Aşağıdaki alanlara bu öğrencinin yeni sonucunu girin. Boş bırakılan doğru ve yanlış alanları 0 sayılır.' : 'Yeni sonuç girmek için bir öğrenci seçin.'}
            </p>
          </div>
          {onTrialImport && <button type="button" onClick={onTrialImport}
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 underline dark:text-teal-300">
            <FileUp className="size-4" aria-hidden="true" /> Deneme Sonuçlarını Yükle
          </button>}
          {/* 6 Subjects Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {LGS_SUBJECT_CONFIG.map((cfg) => {
              const pair = subjects[cfg.key];
              const stat = liveTotals.perSubject[cfg.key];
              return (
                <div
                  key={cfg.key}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-navy-900 dark:text-white">
                      {cfg.label}
                    </span>
                    <span className="text-xs font-mono text-slate-500 tabular-nums">
                      {cfg.maxQuestions} soru
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-emerald-700 dark:text-emerald-400 mb-1">
                        Doğru
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={cfg.maxQuestions}
                        aria-label={cfg.label + ' doğru'}
                        readOnly={Boolean(savedResult)}
                        disabled={!targetStudent || saving}
                        value={pair.d}
                        onChange={(e) =>
                          updateSubjectValue(cfg.key, 'd', e.target.value, cfg.maxQuestions)
                        }
                        className="w-full px-2.5 py-1.5 text-sm font-mono tabular-nums rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-red-600 dark:text-red-400 mb-1">
                        Yanlış
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={cfg.maxQuestions - Number(pair.d)}
                        aria-label={cfg.label + ' yanlış'}
                        readOnly={Boolean(savedResult)}
                        disabled={!targetStudent || saving}
                        value={pair.y}
                        onChange={(e) =>
                          updateSubjectValue(cfg.key, 'y', e.target.value, cfg.maxQuestions)
                        }
                        className="w-full px-2.5 py-1.5 text-sm font-mono tabular-nums rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/80 dark:border-slate-800 tabular-nums">
                    <span className="text-slate-500 dark:text-slate-400">Boş: {hasEntry ? stat.blank : '—'}</span>
                    <span className="font-mono font-semibold text-teal-700 dark:text-teal-400">
                      Net: {hasEntry ? stat.net.toFixed(2) : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {entryError && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{entryError}</p>}
          {targetStudent && !savedResult && <p className="text-sm font-semibold" aria-live="polite">Yeni sonuç · {targetStudent.fullName} · No {targetStudent.studentNumber}</p>}

          {/* Live Calculated Robot Strip + Save CTA */}
          <div className="p-4 rounded-xl bg-navy-900 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
              <div>
                <p className="text-[11px] text-slate-300">Toplam Doğru</p>
                <p className="text-xl font-semibold font-mono tabular-nums text-emerald-300">
                  {hasEntry ? `${liveTotals.totalCorrect} / 90` : '—'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-300">Toplam Yanlış / Boş</p>
                <p className="text-xl font-semibold font-mono tabular-nums text-white">
                  {hasEntry ? `${liveTotals.totalWrong}Y · ${liveTotals.totalBlank}B` : '—'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-300">Toplam Net</p>
                <p className="text-xl font-semibold font-mono tabular-nums text-gold-400">
                  {hasEntry ? (savedResult?.totalNet ?? liveTotals.totalNet).toFixed(2) : '—'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-300">{savedResult && hasPublishedTrialScore(savedResult.id) ? 'PDF’deki LGS Puanı' : 'Tahmini LGS Puanı'}</p>
                <p className="text-xl font-semibold font-mono tabular-nums text-teal-300">
                  {savedResult ? savedResult.estimatedLgsScore.toLocaleString('tr-TR', { maximumFractionDigits: 3 }) : hasEntry ? liveTotals.estimatedLgsScore.toFixed(1) : '—'}
                </p>
              </div>
            </div>

            {!savedResult && <button
              type="submit"
              disabled={saving || !targetStudent || !hasEntry}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-gold-400 text-navy-950 hover:bg-gold-500 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{saving ? 'Kaydediliyor...' : 'Deneme Sonucunu Kaydet'}</span>
            </button>}
          </div>
        </form>
      </section>

      {/* Averages & Charts Section */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex flex-wrap items-center gap-2.5">
            {!lockedStudentId && (
              <>
                <select
                  aria-label="Sınıf filtresi"
                  value={filterClassId}
                  onChange={(e) => setFilterClassId(e.target.value)}
                  className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                >
                  <option value="all">Tüm Sınıflar</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Öğrenci filtresi"
                  value={filterStudentId}
                  onChange={(e) => setFilterStudentId(e.target.value)}
                  className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                >
                  <option value="all">Tüm Öğrenciler</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          <div className="control-grid gap-2 sm:max-w-80">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredExams.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Denemeleri Excel / CSV İndir</span>
            </button>
            <button
              type="button"
              onClick={triggerPrintReport}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır</span>
            </button>
          </div>
        </div>

        {/* Robot Average KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Ortalama Toplam Net</p>
            <p className="mt-1 text-2xl font-semibold font-mono tabular-nums text-teal-700 dark:text-teal-400">
              {robotSummary.examCount > 0 ? robotSummary.avgTotalNet.toFixed(2) : '—'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              {robotSummary.examCount} deneme ortalaması
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Ortalama Toplam Doğru</p>
            <p className="mt-1 text-2xl font-semibold font-mono tabular-nums text-navy-900 dark:text-white">
              {robotSummary.examCount > 0 ? robotSummary.avgTotalCorrect.toFixed(1) : '—'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              Ort. {robotSummary.avgTotalWrong.toFixed(1)} yanlış
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">En Yüksek Toplam Net</p>
            <p className="mt-1 text-2xl font-semibold font-mono tabular-nums text-gold-600 dark:text-gold-400">
              {robotSummary.examCount > 0 ? robotSummary.bestNet.toFixed(2) : '—'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">90 soru üzerinden</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Ortalama LGS Puanı</p>
            <p className="mt-1 text-2xl font-semibold font-mono tabular-nums text-navy-900 dark:text-white">
              {robotSummary.examCount > 0 ? robotSummary.avgLgsScore.toFixed(1) : '—'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">500 tam puan üzerinden</p>
          </div>
        </div>

        {/* Target LGS Score & Priority Subject Analysis */}
        {subjectInsights && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-navy-900 dark:text-white">
                  LGS Hedef Puan ve Öncelikli Ders Analizi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Kayıtlı deneme ortalamalarına göre en güçlü ders ve en hızlı net artırılabilecek
                  öncelik alanı
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <label
                  htmlFor="target-lgs-range"
                  className="text-slate-600 dark:text-slate-300 whitespace-nowrap"
                >
                  Hedef Puan:
                </label>
                <input
                  id="target-lgs-range"
                  type="range"
                  min={320}
                  max={495}
                  step={5}
                  value={targetLgsScore}
                  onChange={(e) => setTargetLgsScore(Number(e.target.value))}
                  className="w-28 accent-teal-600"
                />
                <span className="font-mono font-semibold text-navy-900 dark:text-gold-400 tabular-nums w-10 text-right">
                  {targetLgsScore}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <p className="text-slate-500 dark:text-slate-400">Hedefe Kalan Fark</p>
                <p
                  className={`text-base font-semibold font-mono tabular-nums ${
                    subjectInsights.scoreGap <= 0
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-navy-900 dark:text-white'
                  }`}
                >
                  {subjectInsights.scoreGap <= 0
                    ? `Hedef aşıldı (+${Math.abs(subjectInsights.scoreGap).toFixed(1)} puan)`
                    : `${subjectInsights.scoreGap.toFixed(1)} puan kaldı`}
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  Mevcut ortalama: {robotSummary.avgLgsScore.toFixed(1)} / 500
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <p className="text-slate-500 dark:text-slate-400">En Güçlü Ders</p>
                <p className="text-base font-semibold text-teal-700 dark:text-teal-400">
                  {subjectInsights.strongest.label}
                </p>
                <p className="text-slate-600 dark:text-slate-300 tabular-nums">
                  Ort. {subjectInsights.strongest.avgNet} / {subjectInsights.strongest.maxQuestions}{' '}
                  net (%{subjectInsights.strongest.ratio.toFixed(0)} başarı)
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <p className="text-slate-500 dark:text-slate-400">Öncelikli Gelişim Dersi</p>
                <p className="text-base font-semibold text-gold-700 dark:text-gold-400">
                  {subjectInsights.priority.label}
                </p>
                <p className="text-slate-600 dark:text-slate-300 tabular-nums">
                  Ort. {subjectInsights.priority.avgNet} / {subjectInsights.priority.maxQuestions}{' '}
                  net · +{subjectInsights.priority.potentialGain} net kazanım potansiyeli
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Charts: Subject Avg Net + Chronological Net Progress */}
        {robotSummary.examCount > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-navy-900 dark:text-white">
                Ders Ders Ortalama Doğru ve Net Dağılımı
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4">
                Seçili denemelerdeki her dersin ortalama neti
              </p>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={robotSummary.subjectAverages}
                    margin={{ top: 8, right: 12, left: -16, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} />
                    <XAxis dataKey="shortLabel" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip formatter={(val) => [`${val ?? 0}`, 'Ortalama Net']} />
                    <Bar dataKey="avgNet" radius={[6, 6, 0, 0]} maxBarSize={38}>
                      {robotSummary.subjectAverages.map(({ key }) => (
                        <Cell key={key} fill={trialSubjectColors[key].color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs tabular-nums">
                {robotSummary.subjectAverages.map((sub) => (
                  <div
                    key={sub.key}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800"
                  >
                    <p className="flex items-center gap-2 font-medium text-navy-900 dark:text-white">
                      <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: trialSubjectColors[sub.key].color }} />
                      {sub.shortLabel}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Ort. {sub.avgCorrect}D ·{' '}
                      <strong className="text-teal-700 dark:text-teal-400">{sub.avgNet} Net</strong>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-navy-900 dark:text-white">
                Denemelere Göre Toplam Net Değişimi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4">
                Tarih sırasına göre toplam net yükseliş grafiği
              </p>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={netTrendData}
                    margin={{ top: 8, right: 12, left: -16, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis domain={[0, 90]} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      formatter={(val) => [`${val ?? 0} net`, 'Toplam Net']}
                      labelFormatter={(label, payload) => {
                        const row = payload?.[0]?.payload as { examTitle?: string } | undefined;
                        return row ? `${label} · ${row.examTitle}` : String(label);
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalNet"
                      stroke="#C89B3C"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#0B1F3A', stroke: '#C89B3C', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Listed Practice Exams Table */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-navy-900 dark:text-white">
              Kayıtlı Deneme Sınavları Listesi ({filteredExams.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Her dersin Doğru / Yanlış / Net ayrıntısı, Toplam Doğru, Toplam Net ve LGS puanı
            </p>
          </div>
        </div>

        {filteredExams.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Henüz kayıtlı deneme sınavı bulunmuyor. Yukarıdaki robotu kullanarak ilk deneme
            sonucunu ekleyebilirsiniz.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-950/40">
                  <th className="py-3 px-3 font-medium">Tarih / Deneme</th>
                  {!lockedStudentId && <th className="py-3 px-3 font-medium">Öğrenci</th>}
                  <th className="py-3 px-2.5 font-medium text-right">Türkçe</th>
                  <th className="py-3 px-2.5 font-medium text-right">Mat</th>
                  <th className="py-3 px-2.5 font-medium text-right">Fen</th>
                  <th className="py-3 px-2.5 font-medium text-right">İnkılap</th>
                  <th className="py-3 px-2.5 font-medium text-right">Din K.</th>
                  <th className="py-3 px-2.5 font-medium text-right">İng</th>
                  <th className="py-3 px-3 font-medium text-right">Top. D/Y</th>
                  <th className="py-3 px-3 font-medium text-right">Top. Net</th>
                  <th className="py-3 px-3 font-medium text-right">LGS Puan</th>
                  <th className="py-3 px-3 font-medium text-right no-print">Sil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredExams.map((ex) => {
                  const stu = studentMap.get(ex.studentId);
                  const cell = (d: number, y: number) => (
                    <span className="font-mono tabular-nums whitespace-nowrap">
                      <span className="text-slate-500">{d}D/{y}Y</span>{' '}
                      <strong className="text-navy-900 dark:text-white">
                        {calculateNet(d, y, ex.wrongPenalty).toFixed(1)}
                      </strong>
                    </span>
                  );
                  return (
                    <tr key={ex.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3">
                        <p className="font-medium text-navy-900 dark:text-white">{ex.examTitle}</p>
                        <p className="text-[11px] font-mono text-slate-500 tabular-nums">
                          {formatTurkishDate(ex.examDate)}
                        </p>
                      </td>
                      {!lockedStudentId && (
                        <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          {stu?.fullName ?? 'Öğrenci'}
                        </td>
                      )}
                      <td className="py-3 px-2.5 text-right">{cell(ex.turkceD, ex.turkceY)}</td>
                      <td className="py-3 px-2.5 text-right">{cell(ex.matematikD, ex.matematikY)}</td>
                      <td className="py-3 px-2.5 text-right">{cell(ex.fenD, ex.fenY)}</td>
                      <td className="py-3 px-2.5 text-right">{cell(ex.inkilapD, ex.inkilapY)}</td>
                      <td className="py-3 px-2.5 text-right">{cell(ex.dinD, ex.dinY)}</td>
                      <td className="py-3 px-2.5 text-right">{cell(ex.ingilizceD, ex.ingilizceY)}</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                        {ex.totalCorrect}D / {ex.totalWrong}Y
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-teal-700 dark:text-teal-400">
                        {ex.totalNet.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-gold-600 dark:text-gold-400">
                        {ex.estimatedLgsScore.toFixed(1)}
                      </td>
                      <td className="py-3 px-3 text-right no-print">
                        <button
                          type="button"
                          onClick={() => onDeletePracticeExam(ex)}
                          aria-label="Deneme kaydını sil"
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {/* Average Footer Row */}
                <tr className="bg-slate-100/80 dark:bg-slate-800/70 font-semibold text-navy-900 dark:text-white">
                  <td colSpan={lockedStudentId ? 1 : 2} className="py-3 px-3">
                    GENEL ORTALAMA ({robotSummary.examCount} Deneme)
                  </td>
                  {robotSummary.subjectAverages.map((sub) => (
                    <td key={sub.key} className="py-3 px-2.5 text-right font-mono tabular-nums">
                      {sub.avgNet.toFixed(2)}
                    </td>
                  ))}
                  <td className="py-3 px-3 text-right font-mono tabular-nums">
                    {robotSummary.avgTotalCorrect.toFixed(1)}D
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-teal-700 dark:text-teal-300">
                    {robotSummary.avgTotalNet.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-gold-600 dark:text-gold-400">
                    {robotSummary.avgLgsScore.toFixed(1)}
                  </td>
                  <td className="no-print" />
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
