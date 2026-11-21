import { useState } from 'react';
import { useAcademy } from '../../../context/AcademyContext';
import { buildBulkPlan, type BulkInput } from '../../../utils/bulkStudentRecords';
import { normalizeSearchText } from '../../../utils/searchText';
import { encodeClassFocus } from '../../../utils/classKinds';

type Entry = { section: string; number: string; name: string };
type Pending = { label: string; input: BulkInput; add: number; skip: number };

export function MultiClassRosterImport() {
  const { classes, students, grades, practiceExams, saveBulkRecords, user, dataLoading, rosterLoadError, workspaceView } = useAcademy();
  const [year, setYear] = useState('2026-2027');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [plans, setPlans] = useState<Pending[]>([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function load(file: File) {
    setError(''); setStatus(''); setPlans([]); setEntries([]);
    try {
      if (file.size > 1024 * 1024) throw new Error('Liste 1 MB sınırını aşıyor.');
      const text = (await file.text()).replace(/^\uFEFF/, '').trim();
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2 || lines.length > 501) throw new Error('Dosyada 1–500 öğrenci olmalı.');
      const rows: Entry[] = [];
      const seen = new Set<string>();
      for (const [index, line] of lines.entries()) {
        const cells = line.split(',').map((part) => part.trim().replace(/^"|"$/g, ''));
        if (index === 0 && normalizeSearchText(cells[0]) === 'sinif') continue;
        if (cells.length !== 3) throw new Error(`Satır ${index + 1}: Sınıf,Okul No,Ad Soyad biçimini kullanın.`);
        const match = /^([1-9]|1[0-2])-([A-ZÇĞİÖŞÜ])$/u.exec(cells[0].toLocaleUpperCase('tr-TR'));
        if (!match) throw new Error(`Satır ${index + 1}: sınıf 8-A gibi olmalı.`);
        const section = match[2];
        const number = cells[1];
        const name = cells[2];
        if (!/^\d{1,12}$/.test(number) || number === '0' || name.length < 2) throw new Error(`Satır ${index + 1}: okul numarası ve adı kontrol edin.`);
        const key = `${match[1]}-${section}:${number}`;
        if (seen.has(key)) throw new Error(`Tekrarlanan öğrenci numarası: ${key}`);
        seen.add(key);
        rows.push({ section: `${match[1]}-${section}`, number, name });
      }
      setEntries(rows);
      setStatus(`${rows.length} öğrenci okundu. Önizleme oluşturup ardından kaydedin.`);
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'Dosya okunamadı.'); }
  }

  async function prepare() {
    setError(''); setStatus(''); setPlans([]); setBusy(true);
    try {
      if (!user || workspaceView !== 'teacher') throw new Error('Buluta kaydetmek için öğretmen hesabınızla giriş yapın.');
      if (rosterLoadError) throw new Error(rosterLoadError);
      if (dataLoading) throw new Error('Öğrenci verilerinin yüklenmesini bekleyin.');
      if (!/^\d{4}-\d{4}$/.test(year)) throw new Error('Öğretim yılını kontrol edin.');
      const snapshot = { classes, students, grades, practiceExams };
      const next: Pending[] = [];
      for (const section of [...new Set(entries.map((entry) => entry.section))].sort()) {
        const [level, letter] = section.split('-');
        const existing = classes.filter((item) => item.teacherId === user.uid && item.gradeLevel === Number(level) && normalizeSearchText(item.section) === normalizeSearchText(letter) && item.academicYear.replace('–', '-') === year);
        if (existing.length > 1) throw new Error(`${section} için birden fazla sınıf bulundu; önce sınıfları kontrol edin.`);
        const input: BulkInput = {
          mode: 'roster', classId: existing[0]?.id ?? '',
          newClass: existing.length ? undefined : { name: section, gradeLevel: Number(level), section: letter, academicYear: year, subjectFocus: encodeClassFocus('school') },
          text: entries.filter((entry) => entry.section === section).map((entry) => `${entry.number};${entry.name}`).join('\n'),
        };
        const plan = await buildBulkPlan(input, snapshot, user.uid);
        next.push({ label: section, input, add: plan.rows.filter((row) => !row.skip).length, skip: plan.rows.filter((row) => row.skip).length });
      }
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
    {entries.length > 0 && <p className="text-sm">{entries.length} öğrenci · {[...new Set(entries.map((item) => item.section))].sort().join(', ')}</p>}
    {rosterLoadError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{rosterLoadError}</p>}
    {dataLoading && <p role="status" className="text-sm text-amber-700">Sınıf ve öğrenci kayıtları Firebase'den bekleniyor. Bağlantı sürerse sayfayı yenileyin.</p>}
    {!user && <p role="alert" className="text-sm text-amber-700">Önizleme için Google hesabınızla giriş yapmanız gerekiyor.</p>}
    {entries.length > 0 && <button type="button" disabled={busy || dataLoading || !user || !!rosterLoadError} onClick={() => void prepare()} className="min-h-11 rounded-lg bg-navy-900 px-4 py-2 font-semibold text-white disabled:opacity-50">Önizlemeyi Hazırla</button>}
    {plans.length > 0 && <div className="space-y-2">
      <p className="text-sm font-semibold">{plans.map((plan) => `${plan.label}: ${plan.add} yeni, ${plan.skip} kayıtlı`).join(' · ')}</p>
      <button type="button" disabled={busy || dataLoading || !!rosterLoadError} onClick={() => void saveAll()} className="min-h-11 rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white disabled:opacity-50">Tüm Sınıfları Kaydet</button>
    </div>}
    {status && <p role="status" className="text-sm">{status}</p>}
    {error && <p role="alert" className="whitespace-pre-line rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
  </section>;
}
