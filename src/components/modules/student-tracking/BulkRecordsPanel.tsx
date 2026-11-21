import { useRef, useState } from 'react';
import { FileUp } from 'lucide-react';
import { useAcademy } from '../../../context/AcademyContext';
import { DEFAULT_SUBJECT_NAMES, DEMO_TEACHER_ID } from '../../../data/demoData';
import type { ExamType } from '../../../types/academy';
import { buildBulkPlan, BULK_EXAM_TYPES, type BulkInput, type BulkPlan } from '../../../utils/bulkStudentRecords';
import { extractMappedRows, importSheetWidth, readImportWorkbook, readPdfImport, readPdfPageCount, type ImportSheet } from '../../../utils/bulkRecordFiles';
import { encodeClassFocus, type ClassKind } from '../../../utils/classKinds';
import { CombinedRosterImport } from './CombinedRosterImport';
import { BulkFileMapper } from './BulkFileMapper';

const field = 'w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base dark:border-slate-700 dark:bg-slate-950';
const primary = 'inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-teal-700';
const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Istanbul' }).format(new Date());

export function BulkRecordsPanel({ onTrialImport }: { onTrialImport: () => void }) {
  const { classes, students, grades, practiceExams, dataLoading, saveBulkRecords, user } = useAcademy();
  const [mode, setMode] = useState<'roster' | 'grades'>('roster');
  const [choice, setChoice] = useState<string>();
  const classId = choice ?? classes[0]?.id ?? '';
  const classStudents = students.filter((student) => student.classId === classId);
  const [kind, setKind] = useState<ClassKind>('school');
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('8');
  const [section, setSection] = useState('');
  const [academicYear, setAcademicYear] = useState(() => {
    const date = today();
    const year = Number(date.slice(0, 4)) - (Number(date.slice(5, 7)) < 9 ? 1 : 0);
    return `${year}-${year + 1}`;
  });
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today);
  const [subjectName, setSubjectName] = useState(DEFAULT_SUBJECT_NAMES[0]);
  const [examType, setExamType] = useState<ExamType>('Yazılı');
  const [maxScore, setMaxScore] = useState('100');
  const [sheets, setSheets] = useState<ImportSheet[]>([]);
  const [sheetIndex, setSheetIndex] = useState(0);
  const [fileVersion, setFileVersion] = useState(0);
  const [pdf, setPdf] = useState<{ file: File; pageCount: number }>();
  const [pages, setPages] = useState('1');
  const [filename, setFilename] = useState('');
  const [progress, setProgress] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState<{ input: BulkInput; plan: BulkPlan }>();
  const locked = useRef(false);

  function clearPreview() {
    setPreview(undefined);
    setError('');
    setStatus('');
  }

  async function run(action: () => Promise<void>) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'İşlem tamamlanamadı.');
    } finally {
      locked.current = false;
      setBusy(false);
      setProgress('');
    }
  }

  function showSheets(next: ImportSheet[]) {
    setSheets(next);
    setSheetIndex(0);
    setFileVersion((value) => value + 1);
  }

  async function openFile(file: File) {
    clearPreview();
    setPdf(undefined);
    setSheets([]);
    setFilename(file.name);
    await run(async () => {
      setProgress('Dosya açılıyor…');
      if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
        const pageCount = await readPdfPageCount(file);
        setPdf({ file, pageCount });
        setPages('1');
        if (pageCount === 1) showSheets(await readPdfImport(file, '1', false, setProgress));
      } else {
        showSheets(await readImportWorkbook(file, setProgress));
      }
    });
  }

  async function preparePreview(first: number, last: number, columns: number[], excluded: Set<number>) {
    const sheet = sheets[sheetIndex];
    if (!sheet || dataLoading) return;
    clearPreview();
    await run(async () => {
      const selected = excluded.size ? sheet.rows.map((row, index) => excluded.has(index) ? [] : row) : sheet.rows;
      const text = extractMappedRows(selected, columns, {
        firstRow: first + 1, lastRow: last + 1, firstColumn: 1, lastColumn: importSheetWidth(sheet.rows),
      }, mode === 'grades' ? classStudents : undefined, false);
      const input: BulkInput = mode === 'roster'
        ? { mode, classId, text, newClass: classId ? undefined : { name, gradeLevel: Number(gradeLevel), section, academicYear, subjectFocus: encodeClassFocus(kind) } }
        : { mode, classId, text, assessment: { examTitle: title, examDate: date, examType, subjectName, maxScore: Number(maxScore) } };
      const plan = await buildBulkPlan(input, { classes, students, grades, practiceExams }, user?.uid ?? DEMO_TEACHER_ID);
      setPreview({ input, plan });
    });
  }

  async function save() {
    if (!preview) return;
    await run(async () => {
      const result = await saveBulkRecords(preview.input);
      setStatus(`${result.saved} kayıt kaydedildi.`);
      if (result.error) throw new Error(result.error);
      setPreview(undefined);
      setChoice(result.classId);
    });
  }

  const sheet = sheets[sheetIndex];
  return (
    <section className="min-w-0 space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">PDF veya Excel’den Toplu Giriş</h2>
        <button type="button" onClick={onTrialImport} className="text-sm font-semibold text-teal-700 underline dark:text-teal-300">Deneme Sonuçlarını Yükle</button>
      </header>
      {mode === 'roster' && <CombinedRosterImport initialYear={academicYear} />}
      <fieldset className="min-w-0 space-y-4" disabled={busy || dataLoading} onChange={clearPreview}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium">Kayıt türü
            <select className={field} value={mode} onChange={(event) => setMode(event.target.value === 'grades' ? 'grades' : 'roster')}>
              <option value="roster">Sınıf ve öğrenciler</option><option value="grades">Notlar</option>
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium">Sınıf
            <select className={field} value={classId} onChange={(event) => setChoice(event.target.value)}>
              <option value="">{mode === 'roster' ? 'Yeni sınıf oluştur' : 'Sınıf seçin'}</option>
              {classes.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.academicYear}</option>)}
            </select>
          </label>
        </div>
        {mode === 'roster' && !classId && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className="space-y-1 text-sm font-medium">Sınıf adı<input className={field} value={name} onChange={(event) => setName(event.target.value)} maxLength={60} /></label>
          <label className="space-y-1 text-sm font-medium">Düzey<input className={field} type="number" min="1" max="12" value={gradeLevel} onChange={(event) => setGradeLevel(event.target.value)} /></label>
          <label className="space-y-1 text-sm font-medium">Şube<input className={field} value={section} onChange={(event) => setSection(event.target.value)} maxLength={10} /></label>
          <label className="space-y-1 text-sm font-medium">Sınıf türü
            <select className={field} value={kind} onChange={(event) => setKind(event.target.value === 'course' ? 'course' : 'school')}>
              <option value="school">Okul</option><option value="course">Kurs</option>
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium">Öğretim yılı<input className={field} value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} maxLength={9} /></label>
        </div>}
        {mode === 'grades' && !classStudents.length && <p className="text-sm text-amber-800 dark:text-amber-200">Not girmek için öğrencileri olan bir sınıf seçin.</p>}
        <div className="space-y-2">
          <label className={primary + ' cursor-pointer focus-within:outline-2'}>
            <FileUp className="size-4" /> PDF veya Excel Aç
            <input type="file" className="sr-only" accept=".pdf,.xlsx,.csv,.tsv"
              onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void openFile(file); }} />
          </label>
          {filename && <p className="break-all text-sm text-slate-600 dark:text-slate-300">{filename}</p>}
        </div>
        {pdf && pdf.pageCount > 1 && <div className="flex flex-wrap items-end gap-2">
          <label className="space-y-1 text-sm font-medium">PDF sayfası veya aralığı (1–{pdf.pageCount})
            <input className={field} value={pages} onChange={(event) => setPages(event.target.value)} placeholder="Ör. 2 veya 2-4" />
          </label>
          <button type="button" className={primary} onClick={() => {
            setSheets([]);
            clearPreview();
            void run(async () => showSheets(await readPdfImport(pdf.file, pages, false, setProgress)));
          }}>Sayfayı Aç</button>
        </div>}
        {sheets.length > 1 && <label className="block space-y-1 text-sm font-medium">Excel sayfası
          <select className={field} value={sheetIndex} onChange={(event) => setSheetIndex(Number(event.target.value))}>
            {sheets.map((item, index) => <option key={index} value={index}>{item.name}</option>)}
          </select>
        </label>}
        {sheet && <>
          {mode === 'grades' && <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1 text-sm font-medium">Değerlendirme adı<input className={field} value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} /></label>
            <label className="space-y-1 text-sm font-medium">Ders<input className={field} list="bulk-subjects" value={subjectName} onChange={(event) => setSubjectName(event.target.value)} maxLength={80} />
              <datalist id="bulk-subjects">{DEFAULT_SUBJECT_NAMES.map((subject) => <option key={subject} value={subject} />)}</datalist>
            </label>
            <label className="space-y-1 text-sm font-medium">Tarih<input className={field} type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
            <label className="space-y-1 text-sm font-medium">Not türü
              <select className={field} value={examType} onChange={(event) => setExamType(event.target.value as ExamType)}>
                {BULK_EXAM_TYPES.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-sm font-medium">Tam puan<input className={field} type="number" min="1" max="100" value={maxScore} onChange={(event) => setMaxScore(event.target.value)} /></label>
          </div>}
          <BulkFileMapper key={fileVersion + '-' + sheetIndex + '-' + mode} sheet={sheet}
            fields={mode === 'roster' ? ['Okul No', 'Ad Soyad'] : ['Okul no veya ad soyad', 'Puan']}
            onChange={clearPreview} onApply={(first, last, columns, excluded) => void preparePreview(first, last, columns, excluded)} />
        </>}
      </fieldset>
      {progress && <p role="status" className="text-sm">{progress}</p>}
      {error && <p role="alert" className="whitespace-pre-line rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">{error}</p>}
      {preview && <section aria-label="Kayıt önizlemesi" className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <h3 className="font-semibold">{preview.plan.className} · {preview.plan.rows.filter((row) => !row.skip).length} yeni kayıt</h3>
        <ul className="max-h-64 divide-y divide-slate-200 overflow-auto text-sm dark:divide-slate-800">
          {preview.plan.rows.map((row) => <li key={row.key} className="flex justify-between gap-3 py-2"><span>{row.student}</span><span>{row.detail}{row.skip && ' · Kayıtlı'}</span></li>)}
        </ul>
        <button type="button" className={primary} disabled={busy || preview.plan.rows.every((row) => row.skip)} onClick={() => void save()}>Toplu Kaydet</button>
      </section>}
      {status && <p role="status" className="text-sm font-medium text-teal-700 dark:text-teal-300">{status}</p>}
    </section>
  );
}
