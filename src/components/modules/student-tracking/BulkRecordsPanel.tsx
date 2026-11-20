import { useRef, useState, type FormEvent } from 'react';
import { Download, Upload } from 'lucide-react';
import { useAcademy } from '../../../context/AcademyContext';
import { DEFAULT_SUBJECT_NAMES, DEMO_TEACHER_ID } from '../../../data/demoData';
import type { ExamType } from '../../../types/academy';
import { buildBulkPlan, bulkHeaders, BULK_EXAM_TYPES, type BulkInput, type BulkMode, type BulkPlan } from '../../../utils/bulkStudentRecords';
import { isScreenshot, readImportWorkbook, readPdfImport, readPdfPageCount, type ImportSheet } from '../../../utils/bulkRecordFiles';
import { BulkFileMapper } from './BulkFileMapper';
import { exportToCsv } from '../../../utils/exportUtils';

const controls = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100';
const secondary = 'inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800';
const primary = 'rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-50 dark:bg-teal-700';

const modes: { id: BulkMode; label: string }[] = [
  { id: 'roster', label: 'Sınıf ve öğrenciler' },
  { id: 'grades', label: 'Notlar' },
  { id: 'trials', label: 'Deneme sonuçları' },
];

export function BulkRecordsPanel({ initialMode, onClassAnalysis, onStudents }: {
  initialMode: BulkMode;
  onClassAnalysis: (id: string) => void;
  onStudents: (id: string) => void;
}) {
  const { classes, students, grades, practiceExams, dataLoading, saveBulkRecords, user } = useAcademy();
  const [mode, setMode] = useState<BulkMode>(initialMode);
  const [choice, setChoice] = useState(classes[0]?.id ?? '');
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('8');
  const [section, setSection] = useState('');
  const [academicYear, setAcademicYear] = useState(() => {
    const today = new Date();
    const year = today.getFullYear() - (today.getMonth() < 8 ? 1 : 0);
    return `${year}-${year + 1}`;
  });
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Istanbul' }).format(new Date()));
  const [subjectName, setSubjectName] = useState(DEFAULT_SUBJECT_NAMES[0]);
  const [examType, setExamType] = useState<ExamType>('Yazılı');
  const [maxScore, setMaxScore] = useState('100');
  const [wrongPenalty, setWrongPenalty] = useState<3 | 4>(3);
  const [text, setText] = useState('');
  const [workbook, setWorkbook] = useState<{ filename: string; sheets: ImportSheet[] } | null>(null);
  const [mappingOpen, setMappingOpen] = useState(false);
  const [pdfSource, setPdfSource] = useState<{ file: File; pageCount: number } | null>(null);
  const [pdfPages, setPdfPages] = useState('1');
  const [forceOcr, setForceOcr] = useState(false);
  const [fileProgress, setFileProgress] = useState('');
  const [preview, setPreview] = useState<{ input: BulkInput; plan: BulkPlan } | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof saveBulkRecords>> | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);

  const classId = choice || (mode !== 'roster' ? classes[0]?.id ?? '' : '');
  const classStudents = students.filter((student) => student.classId === classId)
    .sort((a, b) => a.studentNumber.localeCompare(b.studentNumber, 'tr', { numeric: true }));
  const headers = bulkHeaders(mode);
  const sample = mode === 'roster' ? '101\tAyşe Yılmaz' : mode === 'grades'
    ? '101\t85,5' : '101\t15\t3\t14\t4\t17\t1\t9\t1\t8\t2\t8\t1';

  function invalidate() {
    setPreview(null);
    setResult(null);
    setError('');
  }

  function changeMode(next: BulkMode) {
    setMode(next);
    setText('');
    setTitle('');
    if (!choice && next !== 'roster') setChoice(classes[0]?.id ?? '');
    invalidate();
  }

  async function previewRows(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current || dataLoading) return;
    invalidate();
    const common = { classId, text };
    const assessment = { examTitle: title, examDate: date };
    const input: BulkInput = mode === 'roster' ? {
      ...common, mode, newClass: classId ? undefined : { name, gradeLevel: Number(gradeLevel), section, academicYear },
    } : mode === 'grades' ? {
      ...common, mode, assessment: { ...assessment, examType, subjectName, maxScore: Number(maxScore) },
    } : { ...common, mode, assessment: { ...assessment, wrongPenalty } };

    locked.current = true;
    setBusy(true);
    try {
      const plan = await buildBulkPlan(input, { classes, students, grades, practiceExams }, user?.uid ?? DEMO_TEACHER_ID);
      setPreview({ input, plan });
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'Liste okunamadı.');
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  async function save() {
    if (!preview || locked.current) return;
    locked.current = true;
    setBusy(true);
    setError('');
    try {
      const outcome = await saveBulkRecords(preview.input);
      setResult(outcome);
      if (outcome.error) setError(outcome.error);
      else {
        setPreview(null);
        setChoice(outcome.classId);
      }
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'Kayıt işlemi tamamlanamadı.');
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  async function openFile(file: File) {
    if (locked.current) return;
    invalidate();
    setWorkbook(null);
    setMappingOpen(false);
    setPdfSource(null);
    locked.current = true;
    setBusy(true);
    setFileProgress(isScreenshot(file) ? 'Görüntü okuma hazırlanıyor…' : 'Dosya açılıyor…');
    try {
      if (/\.(csv|tsv|txt)$/i.test(file.name)) {
        if (file.size > 400000) throw new Error('CSV çok büyük. Bir sınıf ve bir değerlendirme içeren daha küçük bir dosya seçin.');
        setText(await file.text());
      } else if (/\.pdf$/i.test(file.name) || file.type === 'application/pdf') {
        const pageCount = await readPdfPageCount(file);
        setPdfSource({ file, pageCount });
        setPdfPages('1');
        setForceOcr(false);
      } else {
        setWorkbook({ filename: file.name, sheets: await readImportWorkbook(file, setFileProgress) });
        setMappingOpen(true);
      }
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'Dosya okunamadı.');
    } finally {
      locked.current = false;
      setBusy(false);
      setFileProgress('');
    }
  }

  async function readSelectedPdf() {
    if (!pdfSource || locked.current) return;
    invalidate();
    setWorkbook(null);
    setMappingOpen(false);
    locked.current = true;
    setBusy(true);
    setFileProgress('PDF açılıyor…');
    try {
      const sheets = await readPdfImport(pdfSource.file, pdfPages, forceOcr, setFileProgress);
      setWorkbook({ filename: pdfSource.file.name + ' · ' + sheets[0].name, sheets });
      setMappingOpen(true);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'PDF sayfaları okunamadı.');
    } finally {
      locked.current = false;
      setBusy(false);
      setFileProgress('');
    }
  }

  return (
    <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-navy-900 dark:text-white">Sınıf Bazında Toplu Giriş</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Sınıf listenizi, bir değerlendirmenin notlarını veya bir denemenin sonuçlarını birlikte kaydedin.</p>
      </div>

      <div role="group" aria-label="Toplu giriş türü" className="flex flex-wrap gap-2">
        {modes.map(({ id, label }) => (
          <button key={id} type="button" onClick={() => changeMode(id)} disabled={busy} aria-pressed={mode === id}
            className={mode === id ? primary : secondary}>{label}</button>
        ))}
      </div>

      <form className="space-y-4" onSubmit={previewRows} onChange={invalidate}>
        <fieldset disabled={busy} className="min-w-0 space-y-4">
          <label className="block space-y-1 text-sm font-medium">
            <span>Sınıf</span>
            <select className={controls} value={classId} onChange={(event) => setChoice(event.target.value)} required={mode !== 'roster'}>
              <option value="">{mode === 'roster' ? 'Yeni sınıf oluştur' : 'Sınıf seçin'}</option>
              {classes.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.academicYear}</option>)}
            </select>
          </label>
          {mode === 'roster' && !classId && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <label className="space-y-1 text-sm font-medium"><span>Sınıf adı</span>
                <input className={controls} value={name} onChange={(event) => setName(event.target.value)} required maxLength={60} placeholder="8-A Ortaokul" />
              </label>
              <label className="space-y-1 text-sm font-medium"><span>Sınıf düzeyi</span>
                <input className={controls} type="number" min="1" max="12" value={gradeLevel} onChange={(event) => setGradeLevel(event.target.value)} required />
              </label>
              <label className="space-y-1 text-sm font-medium"><span>Şube</span>
                <input className={controls} value={section} onChange={(event) => setSection(event.target.value)} required maxLength={10} placeholder="A" />
              </label>
              <label className="space-y-1 text-sm font-medium"><span>Öğretim yılı</span>
                <input className={controls} value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} required maxLength={9} />
              </label>
            </div>
          )}
          {mode !== 'roster' && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="space-y-1 text-sm font-medium"><span>{mode === 'grades' ? 'Değerlendirme adı' : 'Deneme adı'}</span>
                <input className={controls} value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={120} />
              </label>
              <label className="space-y-1 text-sm font-medium"><span>Tarih</span>
                <input className={controls} type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
              </label>
              {mode === 'grades' ? <>
                <label className="space-y-1 text-sm font-medium"><span>Ders</span>
                  <input className={controls} list="bulk-subjects" value={subjectName} onChange={(event) => setSubjectName(event.target.value)} required maxLength={80} />
                  <datalist id="bulk-subjects">{DEFAULT_SUBJECT_NAMES.map((subject) => <option key={subject} value={subject} />)}</datalist>
                </label>
                <label className="space-y-1 text-sm font-medium"><span>Not türü</span>
                  <select className={controls} value={examType} onChange={(event) => setExamType(event.target.value as ExamType)}>
                    {BULK_EXAM_TYPES.map((type) => <option key={type}>{type}</option>)}
                  </select>
                </label>
                <label className="space-y-1 text-sm font-medium"><span>Tam puan</span>
                  <input className={controls} type="number" min="1" max="100" value={maxScore} onChange={(event) => setMaxScore(event.target.value)} required />
                </label>
              </> : (
                <label className="space-y-1 text-sm font-medium"><span>Net kuralı</span>
                  <select className={controls} value={wrongPenalty} onChange={(event) => setWrongPenalty(event.target.value === '4' ? 4 : 3)}>
                    <option value="3">3 yanlış 1 doğruyu götürür</option>
                    <option value="4">4 yanlış 1 doğruyu götürür</option>
                  </select>
                </label>
              )}
            </div>
          )}

          {mode !== 'roster' && classStudents.length === 0 && (
            <p className="text-sm text-amber-700 dark:text-amber-300">Bu sınıfa önce öğrenci ekleyin.</p>
          )}
          <div className="space-y-2">
            <label className="block text-sm font-medium" htmlFor="bulk-rows">Kayıt listesi</label>
            <p id="bulk-columns" className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Excel’den sütunları kopyalayın ya da Excel (.xlsx), PDF, CSV veya ekran görüntüsü açın.
              <span className="block font-medium">{headers.join(' · ')}</span>
              {mode !== 'roster' && 'Katılmayan öğrencinin puan veya sonuç hücrelerini boş bırakın. Sıfır sonuç için 0 yazın.'}
            </p>
            <textarea id="bulk-rows" className={controls + ' min-h-32 font-mono'} aria-describedby="bulk-columns"
              rows={6} value={text} onChange={(event) => setText(event.target.value)} placeholder={sample}
              maxLength={100000} required spellCheck={false} />
            <div className="flex flex-wrap gap-2">
              <button type="button" className={secondary} onClick={() => exportToCsv('bilge_akademi_toplu_' + mode, headers,
                mode === 'roster' ? [['', '']] : classStudents.map((item) => [item.studentNumber, ...Array(headers.length - 1).fill('')]))}>
                <Download className="size-4" /> Şablonu İndir
              </button>
              <label className={secondary + ' cursor-pointer focus-within:outline-2'}>
                <Upload className="size-4" /> Dosya veya Ekran Görüntüsü Aç
                <input className="sr-only" type="file" accept=".xlsx,.pdf,.csv,.tsv,.txt,.png,.jpg,.jpeg,.webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void openFile(file);
                    event.target.value = '';
                  }} />
              </label>
              {workbook && !mappingOpen && (
                <button type="button" className={secondary} onClick={() => setMappingOpen(true)}>Aynı Dosyayı Kullan</button>
              )}
            </div>
          </div>
          {pdfSource && (
            <div className="space-y-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <p className="break-all text-sm">{pdfSource.file.name} · {pdfSource.pageCount} sayfa</p>
              <label className="block space-y-1 text-sm font-medium">
                <span>PDF sayfası veya aralığı</span>
                <input className={controls + ' max-w-48'} type="text" value={pdfPages} placeholder="Örn. 3 veya 3-5"
                  onChange={(event) => setPdfPages(event.target.value)} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={forceOcr} onChange={(event) => setForceOcr(event.target.checked)} />
                Görüntü olarak tara (OCR)
              </label>
              <button type="button" className={secondary} onClick={() => void readSelectedPdf()}>Seçilen Sayfaları Oku</button>
            </div>
          )}
          {fileProgress && <p role="status" className="text-sm text-teal-700 dark:text-teal-300">{fileProgress}</p>}
          {workbook && mappingOpen && <BulkFileMapper key={mode + workbook.filename} filename={workbook.filename} sheets={workbook.sheets}
            fields={headers} onClose={() => setMappingOpen(false)} onApply={(rows) => {
              invalidate();
              setText(rows);
              setMappingOpen(false);
            }} />}
          <button type="submit" className={primary} disabled={dataLoading || (mode !== 'roster' && classStudents.length === 0)}>Önizle</button>
        </fieldset>
      </form>

      {error && <p role="alert" className="whitespace-pre-line rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
      {preview && (
        <section className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800 sm:p-4">
          <h3 className="font-semibold">{preview.plan.className} · {preview.plan.rows.filter((row) => !row.skip).length} yeni kayıt</h3>
          {preview.plan.newClass && <p className="text-sm text-slate-600 dark:text-slate-300">Yeni sınıf oluşturulacak.</p>}
          <ul aria-label="Kayıt önizlemesi" className="max-h-56 divide-y divide-slate-200 overflow-y-auto text-sm dark:divide-slate-800">
            {preview.plan.rows.map((row) => (
              <li key={row.key} className="flex flex-wrap items-center justify-between gap-x-3 py-2">
                <span>{row.student}</span><span className="tabular-nums text-slate-600 dark:text-slate-300">{row.detail}{row.skip && ' · Zaten kayıtlı'}</span>
              </li>
            ))}
          </ul>
          <button type="button" className={primary} onClick={() => void save()} disabled={busy || preview.plan.rows.every((row) => row.skip)}>
            {busy ? 'İşleniyor…' : result?.error ? 'Kaydı Yeniden Dene' : 'Toplu Kaydet'}
          </button>
        </section>
      )}
      {result && (
        <div role="status" className="space-y-3 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm dark:border-teal-900 dark:bg-teal-950/30">
          <p>{result.saved} kayıt kaydedildi. {result.skipped > 0 && `${result.skipped} kayıt zaten vardı.`}</p>
          {!result.error && <div className="flex flex-wrap gap-2">
            <button type="button" className={secondary} onClick={() => onClassAnalysis(result.classId)}>Sınıf Analizini Aç</button>
            <button type="button" className={secondary} onClick={() => onStudents(result.classId)}>Öğrencileri Aç</button>
          </div>}
        </div>
      )}
    </section>
  );
}
