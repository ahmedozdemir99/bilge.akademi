import { useRef, useState } from 'react';
import { ClipboardPaste, FileUp } from 'lucide-react';
import { useAcademy } from '../../../context/AcademyContext';
import { DEFAULT_SUBJECT_NAMES, DEMO_TEACHER_ID } from '../../../data/demoData';
import type { ExamType } from '../../../types/academy';
import { buildBulkPlan, BULK_EXAM_TYPES, type BulkInput, type BulkPlan } from '../../../utils/bulkStudentRecords';
import { extractMappedRows, importSheetWidth, readImportWorkbook, readPdfImport, readPdfPageCount, readRosterPaste, type ImportSheet } from '../../../utils/bulkRecordFiles';
import { encodeClassFocus, type ClassKind } from '../../../utils/classKinds';
import { BulkFileMapper } from './BulkFileMapper';

const field = 'w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base dark:border-slate-700 dark:bg-slate-950';
const primary = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-teal-700';
const sourceButton = 'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 aria-pressed:border-teal-300 aria-pressed:bg-teal-50 aria-pressed:text-teal-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:aria-pressed:border-teal-700 dark:aria-pressed:bg-teal-950 dark:aria-pressed:text-teal-100';
const rosterFields = ['Okul No', 'Ad Soyad'];
const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Istanbul' }).format(new Date());

export function BulkRecordsPanel({ initialClassId }: { initialClassId?: string }) {
  const { classes, students, grades, practiceExams, dataLoading, saveBulkRecords, user } = useAcademy();
  const [mode, setMode] = useState<'roster' | 'grades'>('roster');
  const [choice, setChoice] = useState(initialClassId);
  const classId = choice ?? (mode === 'grades' ? classes[0]?.id ?? '' : '');
  const [source, setSource] = useState<'file' | 'paste'>('file');
  const [paste, setPaste] = useState('');
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteRef = useRef<HTMLTextAreaElement>(null);

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

  function changeSource(next: 'file' | 'paste') {
    if (next === source) return;
    setSource(next);
    if (next === 'paste') window.setTimeout(() => pasteRef.current?.focus(), 0);
    setPdf(undefined);
    setFilename('');
    setSheets([]);
    clearPreview();
  }

  function openPastedList() {
    clearPreview();
    setSheets([]);
    void run(async () => showSheets([readRosterPaste(paste)]));
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
        setPages(pageCount > 1 && pageCount <= 60 ? `1-${pageCount}` : '1');
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
      }, mode === 'grades' ? classStudents : undefined, mode === 'roster');
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
      const count = preview.input.mode === 'roster' ? 'öğrenci' : 'not';
      const skipped = result.skipped ? ` ${result.skipped} kayıt zaten vardı.` : '';
      setStatus(`${preview.plan.className} · ${result.saved} ${count} kaydedildi.${skipped}`);
      if (result.error) throw new Error(result.error);
      setPreview(undefined);
      setChoice(result.classId);
    });
  }

  const sheet = sheets[sheetIndex];
  return (
    <section className="min-w-0 space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <h2 id="bulk-records-heading" className="text-lg font-semibold">Toplu Giriş</h2>
      <fieldset className="min-w-0 space-y-4" disabled={busy || dataLoading} onChange={clearPreview}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium">Kayıt türü
            <select className={field} value={mode} onChange={(event) => {
              const next = event.target.value === 'grades' ? 'grades' : 'roster';
              if (next === 'grades') changeSource('file');
              setMode(next);
            }}>
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
        {mode === 'roster' && <div role="group" aria-label="Listenin kaynağı" className="grid gap-2 sm:grid-cols-2">
          <button type="button" className={sourceButton} aria-pressed={source === 'file'} onClick={() => { if (source === 'file') fileInputRef.current?.click(); else changeSource('file'); }}>
            <FileUp className="size-4 shrink-0" aria-hidden="true" /> Excel veya PDF
          </button>
          <button type="button" className={sourceButton} aria-pressed={source === 'paste'} onClick={() => changeSource('paste')}>
            <ClipboardPaste className="size-4 shrink-0" aria-hidden="true" /> Kopyala ve Yapıştır
          </button>
        </div>}
        {source === 'paste' ? <div className="space-y-2">
          <label htmlFor="bulk-roster-paste" className="block text-sm font-medium">Öğrenci listesi</label>
          <p id="bulk-roster-paste-help" className="text-sm text-slate-600 dark:text-slate-300">
            Excel’den Okul No ve Ad Soyad sütunlarını kopyalayın veya her satıra bir öğrenci yazın.
          </p>
          <textarea ref={pasteRef} id="bulk-roster-paste" aria-describedby="bulk-roster-paste-help" className={field + ' resize-y'}
            value={paste} rows={5} spellCheck={false} placeholder={'101 Ayşe Yılmaz\n102 Mehmet Demir'}
            onChange={(event) => {
              setPaste(event.target.value);
              setSheets([]);
            }} />
          <button type="button" className={primary + ' w-full'} disabled={!paste.trim()} onClick={openPastedList}>Listeyi Aç</button>
        </div> : <div className="space-y-2">
          <label className={primary + ' relative w-full cursor-pointer overflow-hidden focus-within:outline-2'}>
            <FileUp className="size-4" aria-hidden="true" /> Dosya Seç
            <input ref={fileInputRef} type="file" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label="PDF veya Excel dosyası seç" accept=".pdf,.xlsx,.csv,.tsv,application/pdf"
              aria-describedby="bulk-file-formats"
              onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void openFile(file); }} />
          </label>
          <p id="bulk-file-formats" className="text-sm text-slate-600 dark:text-slate-300">Excel (.xlsx), PDF, CSV veya TSV · En fazla 10 MB</p>
          {filename && <p className="break-all text-sm font-medium text-slate-700 dark:text-slate-200">{filename}</p>}
        </div>}
        {pdf && pdf.pageCount > 1 && <div className="flex flex-wrap items-end gap-2">
          <label className="space-y-1 text-sm font-medium">PDF sayfası veya aralığı (1–{pdf.pageCount})
            <input className={field} value={pages} onChange={(event) => setPages(event.target.value)} placeholder="Ör. 2 veya 2-4" />
          </label>
          <button type="button" className={primary} onClick={() => {
            setSheets([]);
            clearPreview();
            void run(async () => showSheets(await readPdfImport(pdf.file, pages, false, setProgress)));
          }}>Sayfaları Aç</button>
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
            fields={mode === 'roster' ? rosterFields : ['Okul no veya ad soyad', 'Puan']} suggestRoster={mode === 'roster'}
            onChange={clearPreview} onApply={(first, last, columns, excluded) => void preparePreview(first, last, columns, excluded)} />
        </>}
      </fieldset>
      {progress && <p role="status" className="text-sm">{progress}</p>}
      {error && <p role="alert" className="whitespace-pre-line rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">{error}</p>}
      {preview && <section aria-label="Kayıt önizlemesi" className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <h3 className="font-semibold">{preview.plan.className} · {preview.plan.rows.filter((row) => !row.skip).length} yeni kayıt</h3>
        {preview.plan.newClass && <p className="text-sm text-slate-600 dark:text-slate-300">Kaydettiğinizde yeni sınıf da oluşturulacak.</p>}
        <ul className="max-h-64 divide-y divide-slate-200 overflow-auto text-sm dark:divide-slate-800">
          {preview.plan.rows.map((row) => <li key={row.key} className="flex justify-between gap-3 py-2"><span>{row.student}</span><span>{row.detail}{row.skip && ' · Kayıtlı'}</span></li>)}
        </ul>
        <button type="button" className={primary} disabled={busy || dataLoading || preview.plan.rows.every((row) => row.skip)} onClick={() => void save()}>Toplu Kaydet</button>
      </section>}
      {status && <p role="status" className="text-sm font-medium text-teal-700 dark:text-teal-300">{status}</p>}
    </section>
  );
}
