import { useRef, useState } from 'react';
import { useAcademy } from '../../../context/AcademyContext';
import { DEMO_TEACHER_ID } from '../../../data/demoData';
import { readImportWorkbook } from '../../../utils/bulkRecordFiles';
import { buildBulkPlan, type BulkInput } from '../../../utils/bulkStudentRecords';
import { combinedRosterInputs } from '../../../utils/combinedRoster';

export function CombinedRosterImport({ initialYear }: { initialYear: string }) {
  const { classes, students, grades, practiceExams, dataLoading, saveBulkRecords, user } = useAcademy();
  const [year, setYear] = useState(initialYear);
  const [preview, setPreview] = useState<{ name: string; inputs: BulkInput[]; added: number; skipped: number }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const active = useRef(false);

  async function run(action: () => Promise<void>) {
    if (active.current || dataLoading) return;
    active.current = true;
    setBusy(true);
    setError('');
    setProgress('');
    try {
      await action();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'Aktarım tamamlanamadı.');
    } finally {
      active.current = false;
      setBusy(false);
    }
  }

  function open(file: File) {
    setPreview(undefined);
    return run(async () => {
      if (!/\.csv$/i.test(file.name)) throw new Error('Bir CSV dosyası seçin.');
      const [sheet] = await readImportWorkbook(file);
      const inputs = combinedRosterInputs(sheet.rows, year, classes);
      const owner = user?.uid ?? DEMO_TEACHER_ID;
      const plans = await Promise.all(inputs.map((input) =>
        buildBulkPlan(input, { classes, students, grades, practiceExams }, owner)));
      const rows = plans.flatMap((plan) => plan.rows);
      const skipped = rows.filter((row) => row.skip).length;
      setPreview({ name: file.name, inputs, added: rows.length - skipped, skipped });
    });
  }

  function save() {
    if (!preview) return;
    return run(async () => {
      let saved = 0;
      let skipped = 0;
      for (const input of preview.inputs) {
        const result = await saveBulkRecords(input);
        saved += result.saved;
        skipped += result.skipped;
        setProgress(`${saved} öğrenci eklendi · ${skipped} mevcut kayıt atlandı.`);
        if (result.error) throw new Error(result.error);
      }
      setPreview(undefined);
    });
  }

  return (
    <section className="space-y-3 rounded-xl border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-800 dark:bg-teal-950/25" aria-labelledby="combined-roster-heading">
      <h3 id="combined-roster-heading" className="text-base font-semibold">Tek dosyayla tüm sınıfları ekle</h3>
      <p className="text-sm text-slate-700 dark:text-slate-300">
        CSV dosyanıza Sınıf, Okul No ve Ad Soyad başlıklarını ekleyin. Sınıfları 8/A gibi yazın. Aynı sınıfta bulunan kayıtlar atlanır.
      </p>
      <fieldset disabled={busy || dataLoading} className="grid min-w-0 gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-medium">
          Öğretim yılı
          <input className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base dark:border-slate-700 dark:bg-slate-950"
            value={year} onChange={(event) => {
              setYear(event.target.value);
              setPreview(undefined);
              setError('');
              setProgress('');
            }} />
        </label>
        <label className="min-w-0 space-y-1 text-sm font-medium">
          Birleşik öğrenci CSV dosyası
          <input type="file" accept=".csv,text/csv" className="block w-full min-w-0 rounded-lg border border-slate-300 bg-white p-2 text-sm file:mr-2 file:cursor-pointer file:font-semibold dark:border-slate-700 dark:bg-slate-950"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = '';
              if (file) void open(file);
            }} />
        </label>
      </fieldset>
      {preview && (
        <div className="space-y-2 text-sm">
          <p className="break-words"><strong>{preview.name}</strong> · {preview.inputs.length} sınıf · {preview.added} yeni öğrenci · {preview.skipped} mevcut kayıt</p>
          <button type="button" disabled={busy || dataLoading || preview.added === 0} onClick={() => void save()}
            className="min-h-11 rounded-lg bg-navy-900 px-4 py-2 font-semibold text-white disabled:opacity-50 dark:bg-teal-700">
            Sınıfları ve öğrencileri kaydet
          </button>
        </div>
      )}
      {busy && !progress && <p role="status" className="text-sm">CSV işleniyor…</p>}
      {progress && <p role="status" className="text-sm">{progress}</p>}
      {error && <p role="alert" className="text-sm text-red-800 dark:text-red-200">{error}</p>}
    </section>
  );
}
