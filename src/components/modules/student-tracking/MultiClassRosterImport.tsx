import { useState } from 'react';
import { useAcademy } from '../../../context/AcademyContext';
import { buildBulkPlan, type BulkInput } from '../../../utils/bulkStudentRecords';
import { readImportWorkbook } from '../../../utils/bulkRecordFiles';
import { combinedRosterInputs } from '../../../utils/combinedRoster';

type Pending = { label: string; input: BulkInput; add: number; skip: number };

export function MultiClassRosterImport() {
  const { classes, students, grades, practiceExams, saveBulkRecords, user, dataLoading, workspaceView } = useAcademy();
  const [year, setYear] = useState('2026-2027');
  const [entries, setEntries] = useState<string[][]>([]);
  const [plans, setPlans] = useState<Pending[]>([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function load(file: File) {
    setError(''); setStatus(''); setPlans([]); setEntries([]);
    try {
      if (file.size > 1024 * 1024) throw new Error('Liste 1 MB sınırını aşıyor.');
      if (!/\.csv$/i.test(file.name)) throw new Error('Bir CSV dosyası seçin.');
      const [sheet] = await readImportWorkbook(file);
      const rows = sheet.rows.filter((row) => row.some(Boolean));
      if (/^\d/u.test(rows[0]?.[0] ?? '')) rows.unshift(['Sınıf', 'Okul No', 'Ad Soyad']);
      const count = rows.length - 1;
      if (count < 1 || count > 500) throw new Error('Dosyada 1–500 öğrenci olmalı.');
      setEntries(rows);
      setStatus(`${count} öğrenci okundu. Önizleme oluşturup ardından kaydedin.`);
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'Dosya okunamadı.'); }
  }

  async function prepare() {
    setError(''); setStatus(''); setPlans([]); setBusy(true);
    try {
      if (!user || workspaceView !== 'teacher') throw new Error('Buluta kaydetmek için öğretmen hesabınızla giriş yapın.');
      if (dataLoading) throw new Error('Öğrenci verilerinin yüklenmesini bekleyin.');
      const snapshot = { classes, students, grades, practiceExams };
      const inputs = combinedRosterInputs(entries, year, classes.filter((item) => item.teacherId === user.uid));
      const next = await Promise.all(inputs.map(async (input) => {
        const plan = await buildBulkPlan(input, snapshot, user.uid);
        const skip = plan.rows.filter((row) => row.skip).length;
        return { label: plan.className, input, add: plan.rows.length - skip, skip };
      }));
      setPlans(next);
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'Önizleme oluşturulamadı.'); }
    finally { setBusy(false); }
  }

  async function saveAll() {
    if (!user || workspaceView !== 'teacher' || dataLoading || !plans.length) return;
    if (!window.confirm(`${plans.reduce((sum, plan) => sum + plan.add, 0)} yeni öğrenci, ${plans.length} sınıf için hesabınıza kaydedilsin mi?`)) return;
    setBusy(true); setError('');
    let saved = 0; let skipped = 0;
    try {
      for (const plan of plans) {
        const result = await saveBulkRecords(plan.input);
        saved += result.studentsSaved ?? result.saved;
        skipped += result.skipped;
        if (result.error) throw new Error(`${plan.label}: ${result.error}`);
        setStatus(`Kaydediliyor: ${plan.label} · ${saved} yeni öğrenci`);
      }
      setPlans([]);
      setStatus(`Tamamlandı: ${saved} öğrenci kaydedildi, ${skipped} mevcut kayıt atlandı. Sınıflar ve Öğrenciler bölümünden kontrol edin.`);
    } catch (issue) {
      setError(`Kısmi kayıt olabilir (${saved} öğrenci). ${issue instanceof Error ? issue.message : 'İşlem durdu.'} Aynı dosyayı tekrar yüklemek mevcut numaraları atlar.`);
    } finally { setBusy(false); }
  }

  return <section className="space-y-3 rounded-xl border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-900 dark:bg-teal-950/20">
    <h3 className="text-base font-semibold">Tek dosyayla tüm sınıfları ekle</h3>
    <p className="text-sm text-slate-600 dark:text-slate-300">Sınıf,Okul No,Ad Soyad sütunlu CSV dosyasını seçin. Öğrenciler yalnızca giriş yaptığınız öğretmen hesabına kaydedilir; aynı sınıftaki mevcut okul numaraları tekrar eklenmez.</p>
    <label className="block space-y-1 text-sm">Öğretim yılı
      <input className="w-full rounded-lg border border-slate-300 bg-white p-2 dark:bg-slate-950" value={year} onChange={(event) => { setYear(event.target.value); setPlans([]); }} maxLength={9} />
    </label>
    <label className="block cursor-pointer rounded-lg border border-slate-300 bg-white p-3 text-center font-semibold dark:bg-slate-900">
      Birleşik öğrenci CSV dosyasını seç
      <input type="file" accept=".csv,text/csv" className="sr-only" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void load(file); }} />
    </label>
    {!user && <p role="alert" className="text-sm text-amber-700">Önizleme için Google hesabınızla giriş yapmanız gerekiyor.</p>}
    {entries.length > 0 && <button type="button" disabled={busy || dataLoading || !user} onClick={() => void prepare()} className="min-h-11 rounded-lg bg-navy-900 px-4 py-2 font-semibold text-white disabled:opacity-50">Önizlemeyi Hazırla</button>}
    {plans.length > 0 && <div className="space-y-2">
      <p className="text-sm font-semibold">{plans.map((plan) => `${plan.label}: ${plan.add} yeni, ${plan.skip} kayıtlı`).join(' · ')}</p>
      <button type="button" disabled={busy || dataLoading} onClick={() => void saveAll()} className="min-h-11 rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white disabled:opacity-50">Tüm Sınıfları Kaydet</button>
    </div>}
    {status && <p role="status" className="text-sm">{status}</p>}
    {error && <p role="alert" className="whitespace-pre-line rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
  </section>;
}
