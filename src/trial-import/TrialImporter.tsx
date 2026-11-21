import { CLASS_KINDS, classKind, encodeClassFocus, type ClassKind } from '../utils/classKinds';
import { useMemo, useRef, useState } from 'react';
import { BarChart3, CloudDownload, CloudUpload, FileUp } from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { DEMO_TEACHER_ID } from '../data/demoData';
import { buildBulkPlan, bulkHeaders, publishedTrialKey, type BulkInput, type BulkPlan } from '../utils/bulkStudentRecords';
import { importSheetWidth, inspectTrialPdf, readImportWorkbook, readPdfImport, readTrialPdfResults, type ImportSheet } from '../utils/bulkRecordFiles';
import { trialRosterDrafts } from '../utils/trialRosterImport';
import { calculateNet, computePracticeExamTotals, LGS_SUBJECT_CONFIG } from '../utils/exportUtils';

import { connectTrialDrive, downloadTrialCloudFile, listTrialCloudFiles, readTrialBackupSettings, TrialDriveError, uploadTrialCloudFile, type TrialCloudFile } from '../utils/trialCloudFiles';

const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white';
const primary = 'inline-flex min-h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800 disabled:opacity-50';
const numberFormat = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 });
const trialFields = bulkHeaders('trials');
type TrialInput = Extract<BulkInput, { mode: 'trials' }>;

export function TrialImporter({ initialClass = '', onArchive }: { initialClass?: string; onArchive: (id: string) => void }) {
  const requestedPage = new URLSearchParams(window.location.search).get('sayfa') ?? '';
  const { user, authLoading, dataLoading, workspaceView, classes, students, practiceExams, grades, signInWithGoogle, saveBulkRecords } = useAcademy();
  const [pdf, setPdf] = useState<{ file: File; count: number; schoolPages: string }>();
  const [selection, setSelection] = useState('');
  const [readSelection, setReadSelection] = useState('');
  const [sheets, setSheets] = useState<ImportSheet[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [wrongPenalty, setWrongPenalty] = useState<3 | 4>(3);
  const [classId, setClassId] = useState(initialClass);
  const [kind, setKind] = useState<ClassKind>(() => classKind(classes.find(({ id }) => id === initialClass) ?? {}));
  const [sourceFile, setSourceFile] = useState<File>();
  const [cloudFiles, setCloudFiles] = useState<{ owner: string; files: TrialCloudFile[] }>();
  const [cloudMessage, setCloudMessage] = useState('');
  const driveSession = useRef<{ owner: string; token: string } | undefined>(undefined);

  const kindClasses = useMemo(() => classes.filter((item) => classKind(item) === kind), [classes, kind]);
  const [progress, setProgress] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [savedCount, setSavedCount] = useState<{ trials: number; students: number; classes: string[] }>();
  const [addMissing, setAddMissing] = useState(false);
  const locked = useRef(false);
  const authorized = Boolean(workspaceView === 'teacher' && !authLoading && !dataLoading);
  const publishedReport = sheets.some((sheet) => Boolean(sheet.published));
  const penalty = publishedReport ? 3 : wrongPenalty;
  const detection = useMemo(() => {
    if (!sheets.length || authLoading || dataLoading) return null;
    try {
      const dateForYear = date || new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Istanbul' }).format(new Date());
      const schoolYear = Number(dateForYear.slice(0, 4)) - (Number(dateForYear.slice(5, 7)) < 9 ? 1 : 0);
      const academicYear = schoolYear + '-' + (schoolYear + 1);
      const academicSections = kindClasses.filter((item) => item.academicYear.replace(/[^0-9]/g, '') === String(schoolYear) + (schoolYear + 1));
      const sections = classId ? kindClasses.filter((item) => item.id === classId) : publishedReport ? academicSections : kindClasses;
      const ids = new Set(sections.map(({ id }) => id));
      const existing = readTrialPdfResults(sheets, students.filter((student) => ids.has(student.classId)), trialFields, sections);
      const sameYearIds = new Set([...academicSections, ...sections].map(({ id }) => id));
      const proposed = trialRosterDrafts(sheets, sections, students.filter((student) => sameYearIds.has(student.classId)), classId, academicYear);
      return { ...existing, drafts: proposed.drafts, draftIssues: proposed.issues };
    } catch (issue) {
      return { groups: new Map<string, string[][]>(), issues: [], drafts: [], draftIssues: [], publishedResults: new Map<string, { totalNet: number; score: number }>(), error: issue instanceof Error ? issue.message : 'Sonuçlar okunamadı.' };
    }
  }, [sheets, students, kindClasses, classId, authLoading, dataLoading, date, publishedReport]);

  const matchedCount = [...(detection?.groups.values() ?? [])].reduce((count, group) => count + group.length, 0);
  const missingCount = detection?.drafts.reduce((count, group) => count + group.rows.length, 0) ?? 0;
  const totalToReview = matchedCount + (addMissing ? missingCount : 0);
  const names = useMemo(() => {
    const map = new Map<string, string>();
    for (const student of students) map.set(JSON.stringify([student.classId, student.studentNumber]), student.fullName);
    return map;
  }, [students]);

  async function run(action: () => Promise<void>) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (issue) {
      if (issue instanceof TrialDriveError && issue.status === 401) driveSession.current = undefined;
      setError(issue instanceof Error ? issue.message : 'İşlem tamamlanamadı.');
    } finally {
      setProgress('');
      setBusy(false);
      locked.current = false;
    }
  }

  async function readPages(file: File, pages: string) {
    setSheets([]);
    setReadSelection('');
    setSavedCount(undefined);
    setAddMissing(false);
    setSheets(await readPdfImport(file, pages, false, setProgress, true));
    setReadSelection(pages);
  }

  async function open(file: File, backup?: TrialCloudFile) {
    setPdf(undefined);
    setSheets([]);
    setReadSelection('');
    setSavedCount(undefined);
    setSourceFile(file);
    setCloudMessage(backup ? 'Buluttaki dosya açıldı. Eşleşen sonuçları önizlemeden kontrol edin.' : '');
    setProgress('Dosya açılıyor…');
    const settings = backup ? readTrialBackupSettings(backup) : {};
    setTitle(settings.title || file.name.replace(/\.(pdf|xlsx|csv|tsv)$/i, '').replace(/[_-]+/g, ' ').trim().slice(0, 120));
    setDate(settings.examDate || /\b\d{4}-\d{2}-\d{2}\b/.exec(file.name)?.[0] || '');
    if (backup) {
      const restoredClass = classes.find(({ id }) => id === settings.classId);
      setKind(restoredClass ? classKind(restoredClass) : settings.kind ?? 'school');
      setClassId(restoredClass?.id ?? '');
      setWrongPenalty(settings.wrongPenalty ?? 3);
    }
    if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
      setAddMissing(false);
      setProgress('Tablo okunuyor…');
      setSheets(await readImportWorkbook(file, setProgress));
      return;
    }
    const { count, schoolPages } = await inspectTrialPdf(file);
    const preset = /^\d+$/.test(requestedPage) && Number(requestedPage) >= 1 && Number(requestedPage) <= count;
    const backupPages = settings.pages;
    const pages = backupPages || (preset ? String(Number(requestedPage)) : schoolPages || (count === 1 ? '1' : '1-' + Math.min(count, 60)));
    setPdf({ file, count, schoolPages });
    setSelection(pages);
    if (backupPages || preset || schoolPages || count <= 60) await readPages(file, pages);
  }

  async function cloudAction(task: (token: string, owner: string) => Promise<void>) {
    if (!user || !authorized) return;
    await run(async () => {
      setCloudMessage('');
      setProgress('Google Drive’a bağlanılıyor…');
      const owner = user.uid;
      const token = driveSession.current?.owner === owner ? driveSession.current.token : await connectTrialDrive(user);
      driveSession.current = { owner, token };
      await task(token, owner);
    });
  }

  async function save() {
    if (!detection || !authorized || !title.trim() || !date) return;
    await run(async () => {
      const teacherId = user?.uid ?? DEMO_TEACHER_ID;
      setProgress('Sonuçlar doğrulanıyor…');
      const batches: { input: TrialInput; plan: BulkPlan }[] = [];
      for (const [groupId, rows] of detection.groups) {
        for (let start = 0; start < rows.length; start += 250) {
          const input: TrialInput = {
            mode: 'trials', source: 'file', classId: groupId, assessment: { examTitle: title, examDate: date, wrongPenalty: penalty }, publishedResults: detection.publishedResults,
            text: rows.slice(start, start + 250).map((row) => row.join('\t')).join('\n'),
          };
          batches.push({ input, plan: await buildBulkPlan(input, { classes, students, grades, practiceExams }, teacherId) });
        }
      }
      if (addMissing) {
        for (const draft of detection.drafts) {
          for (let start = 0; start < draft.rows.length; start += 250) {
            const rows = draft.rows.slice(start, start + 250);
            const input: TrialInput = {
              mode: 'trials', source: 'file', classId: draft.classId, assessment: { examTitle: title, examDate: date, wrongPenalty: penalty },
              text: rows.map(({ number, scores }) => [number, ...scores].join('\t')).join('\n'),
              roster: {
                newClass: draft.newClass && { ...draft.newClass, subjectFocus: encodeClassFocus(kind) },
                text: rows.map(({ number, name }) => number + '\t' + name.replace(/[\t\r\n]+/g, ' ')).join('\n'),
              },
              publishedResults: new Map(rows.map((row) => [publishedTrialKey(draft.classId, row.number), row])),
            };
            batches.push({ input, plan: await buildBulkPlan(input, { classes, students, grades, practiceExams }, teacherId) });
          }
        }
      }
      let trials = 0;
      let studentsAdded = 0;
      const savedClasses = new Set<string>();
      setProgress(user ? 'Firebase’e kaydediliyor…' : 'Demo kayıtları ekleniyor…');
      for (const { input, plan } of batches) {
        savedClasses.add(plan.classId);
        if (plan.rows.every((row) => row.skip)) continue;
        const result = await saveBulkRecords(input);
        trials += result.trialsSaved ?? 0;
        studentsAdded += result.studentsSaved ?? 0;
        if (result.error) {
          throw new Error(`${studentsAdded} öğrenci ve ${trials} sonuç kaydedildi. ${result.error}`);
        }
      }
      setSavedCount({ trials, students: studentsAdded, classes: [...savedClasses] });
    });
  }

  return (
    <div className="min-w-0 space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Deneme Sonuçlarını Yükle</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">PDF veya Excel’i açın, eşleşen öğrencileri kontrol edin ve sonuçları deneme arşivine kaydedin.</p>
        {!user && <p className="text-sm">Demo oturumu. Buluta kaydetmek için <button type="button" className="underline" onClick={() => void signInWithGoogle()}>Google ile giriş yapın</button>.</p>}
      </div>

      <fieldset disabled={busy || authLoading || dataLoading} className="min-w-0 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        onChange={() => { setSavedCount(undefined); setError(''); }}>
        <legend className="sr-only">Deneme dosyası</legend>
        <div className="flex flex-wrap items-center gap-3">
          <label className={primary + ' cursor-pointer focus-within:outline-2'}>
            <FileUp size={18} /> PDF / Excel Yükle
            <input className="sr-only" type="file" accept=".pdf,.xlsx,.csv,.tsv,application/pdf"
              onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void run(() => open(file)); }} />
          </label>
          {sourceFile && <p className="min-w-0 break-all text-sm text-slate-600 dark:text-slate-300">{sourceFile.name}{pdf && ' · ' + pdf.count + ' sayfa'}{pdf && sheets.length > 0 && ' · Okunan sayfa ' + readSelection}</p>}
        </div>
        {user && <div className="space-y-3 border-t border-slate-200 pt-3 dark:border-slate-800">
          <div className="flex flex-wrap gap-2">
            <button type="button" className={primary} disabled={!sourceFile} onClick={() => {
              if (!sourceFile) return;
              void cloudAction(async (token, owner) => {
                setProgress('Dosya Google Drive’a yükleniyor…');
                const item = await uploadTrialCloudFile(token, sourceFile, { title, examDate: date, pages: pdf ? readSelection : '', kind, classId, wrongPenalty: penalty });
                setCloudFiles((current) => ({ owner, files: [item, ...(current?.owner === owner ? current.files.filter(({ id }) => id !== item.id) : [])] }));
                setCloudMessage('Dosya Google Drive’a kaydedildi.');
              });
            }}><CloudUpload size={17} aria-hidden="true" /> Buluta Yükle</button>
            <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700"
              onClick={() => void cloudAction(async (token, owner) => {
                setProgress('Bulut dosyaları okunuyor…');
                setCloudFiles({ owner, files: await listTrialCloudFiles(token) });
              })}><CloudDownload size={17} aria-hidden="true" /> Buluttan Geri Yükle</button>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">PDF ve Excel dosyaları özel Google Drive alanınızda, kaydedilen deneme sonuçları Firebase’de tutulur.</p>
          {cloudFiles?.owner === user.uid && (cloudFiles.files.length ? (
            <ul className="max-h-64 space-y-2 overflow-auto rounded-lg border border-slate-200 p-2 dark:border-slate-800">
              {cloudFiles.files.map((item) => <li key={item.id}>
                <button type="button" className="w-full break-all rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => void cloudAction(async (token) => {
                    setProgress('Buluttaki dosya indiriliyor…');
                    await open(await downloadTrialCloudFile(token, item), item);
                  })}>{item.name} <span className="text-slate-500">· {new Date(item.createdTime).toLocaleDateString('tr-TR')}</span></button>
              </li>)}
            </ul>
          ) : <p className="text-sm">Bulutta deneme dosyası yok.</p>)}
          {cloudMessage && <p role="status" className="text-sm font-medium text-teal-800 dark:text-teal-200">{cloudMessage}</p>}
        </div>}
        {pdf && pdf.count > 1 && <details className="space-y-2" open={pdf.count > 60 && !pdf.schoolPages && sheets.length === 0 ? true : undefined}>
          <summary className="cursor-pointer text-sm font-medium underline">PDF sayfalarını seç</summary>
          <div className="flex flex-wrap items-end gap-2">
            <label className="space-y-1 text-sm">Sayfa veya aralık
              <input className={inputClass} value={selection} onChange={(event) => setSelection(event.target.value)} placeholder="Ör. 2 veya 2-5" />
            </label>
            <button type="button" className={primary} onClick={() => void run(() => readPages(pdf.file, selection))}>Seçilen Sayfaları Oku</button>
          </div>
        </details>}
        {sheets.length > 0 && <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium">Deneme adı<input className={inputClass} value={title} maxLength={120} onChange={(event) => setTitle(event.target.value)} /></label>
          <label className="space-y-1 text-sm font-medium">Deneme tarihi<input className={inputClass} type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
          <label className="space-y-1 text-sm font-medium">Sınıf türü
            <select className={inputClass} value={kind} onChange={(event) => {
              setKind(event.target.value === 'course' ? 'course' : 'school');
              setClassId('');
              setAddMissing(false);
            }}>
              {CLASS_KINDS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium">Sınıf
            <select className={inputClass} value={classId} onChange={(event) => { setClassId(event.target.value); setAddMissing(false); }}>
              <option value="">Tüm sınıflar</option>
              {kindClasses.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.academicYear}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium">Net kuralı
            <select className={inputClass} value={penalty} disabled={publishedReport} onChange={(event) => setWrongPenalty(event.target.value === '4' ? 4 : 3)}>
              <option value="3">3 yanlış 1 doğruyu götürür</option><option value="4">4 yanlış 1 doğruyu götürür</option>
            </select>
          </label>
        </div>}
      </fieldset>
      {progress && <p role="status">{progress}</p>}
      {error && <p role="alert" className="whitespace-pre-line rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">{error}</p>}
      {detection && <section className="min-w-0 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h2 className="text-lg font-bold">Kayıt önizlemesi · {totalToReview} sonuç</h2>
        {'error' in detection && <p role="alert">{detection.error}</p>}
        {missingCount > 0 && savedCount === undefined && <div className="space-y-3 rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-900 dark:bg-teal-950">
          <label className="flex items-start gap-3 font-semibold">
            <input type="checkbox" className="mt-1 size-5 shrink-0" checked={addMissing} disabled={busy}
              onChange={(event) => { setAddMissing(event.target.checked); setError(''); }} />
            Eksik sınıf ve öğrencileri PDF’den ekle
          </label>
          <ul className="space-y-2 text-sm">
            {detection.drafts.map((draft) => <li key={draft.label}>
              <strong>{draft.label}</strong> · {draft.rows.length} yeni öğrenci{draft.newClass && ' · Yeni sınıf · ' + draft.newClass.academicYear}
              {addMissing && <ul className="mt-1 max-h-36 space-y-1 overflow-auto pl-3">
                {draft.rows.map((row) => <li key={row.number}>{row.number} · {row.name}</li>)}
              </ul>}
            </li>)}
          </ul>
        </div>}
        {detection.draftIssues.length > 0 && <ul className="space-y-1 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
          {detection.draftIssues.map((issue) => <li key={issue}>{issue}</li>)}
        </ul>}
        {detection.issues.length > 0 && <details className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100" open={matchedCount === 0 && missingCount === 0}>
          <summary className="cursor-pointer font-semibold">{detection.issues.length} uyarı · İnceleyin</summary>
          <ul className="mt-2 max-h-56 space-y-1 overflow-auto">{detection.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
        </details>}
        {[...detection.groups].map(([groupId, rows]) => <div key={groupId} className="space-y-2">
          <h3 className="font-semibold">{classes.find((item) => item.id === groupId)?.name} · {rows.length} öğrenci</h3>
          <div tabIndex={0} role="region" aria-label="Ders sonuçları" className="max-h-96 max-w-full overflow-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800"><tr>
                <th scope="col" className="p-2">Öğrenci</th>{LGS_SUBJECT_CONFIG.map((subject) => <th scope="col" key={subject.key} className="p-2">{subject.shortLabel}</th>)}
                <th scope="col" className="p-2">Toplam net</th><th scope="col" className="p-2">Puan</th>
              </tr></thead>
              <tbody>{rows.map(([id, ...values]) => {
                const [turkceD, turkceY, matematikD, matematikY, fenD, fenY, inkilapD, inkilapY, dinD, dinY, ingilizceD, ingilizceY] = values.map(Number);
                const pdfScore = detection.publishedResults.get(publishedTrialKey(groupId, id));
                const { totalNet, estimatedLgsScore } = computePracticeExamTotals({ wrongPenalty: penalty, turkceD, turkceY, matematikD, matematikY, fenD, fenY, inkilapD, inkilapY, dinD, dinY, ingilizceD, ingilizceY });
                const subjects = LGS_SUBJECT_CONFIG.map(({ maxQuestions }, index) => {
                  const d = Number(values[index * 2]);
                  const y = Number(values[index * 2 + 1]);
                  return { d, y, blank: maxQuestions - d - y, net: calculateNet(d, y, penalty) };
                });
                return <tr key={id} className="border-t border-slate-200 dark:border-slate-800">
                  <th scope="row" className="p-2">{names.get(JSON.stringify([groupId, id]))}</th>
                  {subjects.map(({ d, y, blank, net }, index) => <td key={LGS_SUBJECT_CONFIG[index].key} className="p-2">
                    <span className="block font-semibold">{numberFormat.format(net)} net</span><span>{d} D · {y} Y · {blank} B</span>
                  </td>)}
                  <td className="p-2 font-bold">{numberFormat.format(pdfScore?.totalNet ?? totalNet)}</td>
                  <td className="p-2">{pdfScore ? pdfScore.score.toLocaleString('tr-TR', { minimumFractionDigits: 3 }) : numberFormat.format(estimatedLgsScore) + ' (tahmini)'}</td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        </div>)}
        {totalToReview > 0 && savedCount === undefined && <>
          <button type="button" className={primary} disabled={!authorized || !date || !title.trim() || busy}
            onClick={() => void save()}>{addMissing && missingCount ? 'Sınıfı, Öğrencileri ve Sonuçları Kaydet' : `${matchedCount} Sonucu Kaydet`}</button>
          {authorized && !date && <p className="text-sm">Kayıt için deneme tarihini girin.</p>}
        </>}
        {!matchedCount && !missingCount && !detection.issues.length && <p className="text-sm">Seçilen sayfalarda eşleşen sonuç bulunamadı.</p>}
        {savedCount !== undefined && <div role="status" className="space-y-2">
          <p>{savedCount.trials || savedCount.students ? `${savedCount.students} öğrenci ve ${savedCount.trials} sonuç ${user ? 'Firebase’e' : 'demo arşivine'} kaydedildi.` : 'Bu sonuçlar zaten kayıtlı.'}</p>
          <button type="button" onClick={() => onArchive(savedCount.classes.length === 1 ? savedCount.classes[0] : '')} className={primary}><BarChart3 size={18} /> Deneme Arşivini Aç</button>
        </div>}
      </section>}
      {sheets.length > 0 && <details className="min-w-0 space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <summary className="cursor-pointer font-medium">Dosyadan okunan tablo</summary>
        {sheets.map((sheet) => <RawTable key={sheet.name} sheet={sheet} />)}
      </details>}
    </div>
  );
}

function RawTable({ sheet }: { sheet: ImportSheet }) {
  const [open, setOpen] = useState(false);
  const columns = Array.from({ length: importSheetWidth(sheet.rows) }, (_, i) => i);
  return <details onToggle={(event) => setOpen(event.currentTarget.open)} className="space-y-2">
    <summary className="cursor-pointer text-sm">{sheet.name} · {sheet.rows.length} satır</summary>
    {open && <div role="region" aria-label={sheet.name + ' tablosu'} tabIndex={0} className="max-h-80 max-w-full overflow-auto">
      <table className="w-full whitespace-nowrap text-left text-sm">
        <tbody>{sheet.rows.map((row, index) => <tr key={index} className="border-b border-slate-200 dark:border-slate-800">
          <th scope="row" className="p-2">{index + 1}</th>
          {columns.map((column) => <td key={column} className="p-2">{row[column] || '—'}</td>)}
        </tr>)}</tbody>
      </table>
    </div>}
  </details>;
}
