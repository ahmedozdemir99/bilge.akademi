import { useMemo, useState } from 'react';
import type { Student } from '../../../types/academy';
import {
  extractMappedRows,
  importSheetWidth,
  inferImportColumns,
  suggestImportRange,
  type ImportRange,
  type ImportSheet,
} from '../../../utils/bulkRecordFiles';

const control = 'w-full min-w-0 rounded-md border border-slate-300 bg-white px-2 py-2 text-base dark:border-slate-700 dark:bg-slate-950';
const RANGE_FIELDS = [
  { key: 'firstRow', label: 'İlk satır' },
  { key: 'lastRow', label: 'Son satır' },
  { key: 'firstColumn', label: 'İlk sütun' },
  { key: 'lastColumn', label: 'Son sütun' },
] as const;
const DISPLAY_ROWS = 8;

export function BulkFileMapper({ sheets, filename, fields, students, hasRoster, onApply, onClose }: {
  sheets: ImportSheet[];
  filename: string;
  fields: string[];
  students?: Student[];
  hasRoster: boolean;
  onApply: (text: string) => void;
  onClose: () => void;
}) {
  const [sheetIndex, setSheetIndex] = useState(0);
  const sheet = sheets[sheetIndex];
  const width = importSheetWidth(sheet.rows);
  const [range, setRange] = useState<ImportRange>(() => suggestImportRange(sheet.rows));
  const [pageStart, setPageStart] = useState(Math.max(0, range.firstRow - 2));
  const [manualColumns, setManualColumns] = useState<Record<number, number>>({});
  const [advanced, setAdvanced] = useState(false);
  const [error, setError] = useState('');
  const guesses = useMemo(() => {
    try {
      return inferImportColumns(sheet.rows, fields, range, students ?? []);
    } catch {
      return fields.map(() => -1);
    }
  }, [fields, range, sheet.rows, students]);
  const columns = guesses.map((guess, index) => manualColumns[index] ?? guess);
  const selectedCount = new Set(columns.filter((column) => column >= range.firstColumn - 1 && column < range.lastColumn)).size;
  const examples = sheet.rows.slice(pageStart, pageStart + DISPLAY_ROWS);
  const studentLabel = students ? 'Okul no veya ad soyad' : fields[0];

  function updateRange(key: keyof ImportRange, value: number) {
    setRange((current) => ({ ...current, [key]: value }));
    setManualColumns({});
    setError('');
    if (key === 'firstRow' && value > 0) {
      setPageStart(Math.max(0, Math.min(sheet.rows.length - DISPLAY_ROWS, value - 2)));
    }
  }

  function switchSheet(index: number) {
    const next = suggestImportRange(sheets[index].rows);
    setSheetIndex(index);
    setRange(next);
    setPageStart(Math.max(0, next.firstRow - 2));
    setManualColumns({});
    setAdvanced(false);
    setError('');
  }

  function previewRange() {
    try {
      onApply(extractMappedRows(sheet.rows, columns, range, students));
      setError('');
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'Satırlar alınamadı.');
    }
  }

  return (
    <section className="space-y-3 rounded-lg border border-teal-200 bg-teal-50/40 p-3 dark:border-teal-900 dark:bg-teal-950/20">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold">Tablo aralığı</h3>
        <button type="button" className="text-sm font-medium underline" onClick={onClose}>Kapat</button>
      </div>
      <p className="break-all text-xs text-slate-600 dark:text-slate-300">{filename} · {sheet.rows.length} satır</p>
      <p className="text-sm text-slate-700 dark:text-slate-200">
        Önerilen aralığı kullanın ya da ilk ve son satır ile sütunu değiştirin.
      </p>
      {fields.length > 2 && <p className="text-xs text-slate-600 dark:text-slate-300">
        Deneme başlıkları yoksa 12 doğru/yanlış sütunu LGS şablonundaki sırayla okunur.
      </p>}
      {sheets.length > 1 && <label className="block space-y-1 text-sm"><span>Çalışma sayfası</span>
        <select value={sheetIndex} onChange={(event) => switchSheet(Number(event.target.value))} className={control}>
          {sheets.map(({ name }, index) => <option key={index} value={index}>{name}</option>)}
        </select>
      </label>}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {RANGE_FIELDS.map(({ key, label }) => (
          <label className="space-y-1 text-sm font-medium" key={key}>
            <span>{label}</span>
            <input className={control} type="number" min="1" max={key.endsWith('Row') ? sheet.rows.length : width}
              value={range[key] || ''} onChange={(event) => updateRange(key, Number(event.target.value))} />
          </label>
        ))}
      </div>

      <div role="region" aria-label="Dosyadan okunan örnek satırlar" tabIndex={0} className="max-w-full overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <table className="w-full whitespace-nowrap text-left text-xs">
          <thead><tr><th className="sticky left-0 bg-white px-2 py-1.5 dark:bg-slate-950" scope="col">Satır</th>
            {Array.from({ length: width }, (_, column) => (
              <th key={column} className="px-2 py-1.5" scope="col">{column + 1}</th>
            ))}
          </tr></thead>
          <tbody>{examples.map((row, index) => {
            const number = pageStart + index + 1;
            const selectedRow = number >= range.firstRow && number <= range.lastRow;
            return <tr className="border-t border-slate-200 dark:border-slate-800" key={number}>
              <th className="sticky left-0 bg-white px-2 py-1.5 dark:bg-slate-950" scope="row">{number}</th>
              {Array.from({ length: width }, (_, column) => (
                <td key={column} className={`max-w-52 truncate px-2 py-1.5 ${selectedRow && column >= range.firstColumn - 1 && column < range.lastColumn ? 'bg-teal-100/70 dark:bg-teal-950' : ''}`}
                  title={row[column]}>{row[column] || '—'}</td>
              ))}
            </tr>;
          })}</tbody>
        </table>
      </div>
      {sheet.rows.length > DISPLAY_ROWS && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <button type="button" className="underline disabled:opacity-40" disabled={pageStart === 0}
            onClick={() => setPageStart(Math.max(0, pageStart - DISPLAY_ROWS))}>Önceki satırlar</button>
          <button type="button" className="underline disabled:opacity-40" disabled={pageStart + DISPLAY_ROWS >= sheet.rows.length}
            onClick={() => setPageStart(Math.min(sheet.rows.length - DISPLAY_ROWS, pageStart + DISPLAY_ROWS))}>Sonraki satırlar</button>
        </div>
      )}
      {hasRoster && (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            onClick={previewRange}>Aralığı Önizle</button>
          <p className="text-xs text-slate-600 dark:text-slate-300">{selectedCount}/{fields.length} alan eşleşti</p>
        </div>
      )}
      {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
      <details open={advanced} onToggle={(event) => setAdvanced(event.currentTarget.open)}>
        <summary className="cursor-pointer text-sm font-medium underline">Sütun seçimini düzelt</summary>
        {advanced && <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field, index) => (
            <label className="min-w-0 space-y-1 text-sm" key={field}>
              <span>{index === 0 ? studentLabel : field}</span>
              <select value={columns[index]} className={control} onChange={(event) => {
                const value = Number(event.target.value);
                setManualColumns((current) => ({ ...current, [index]: value }));
                setError('');
              }}>
                <option value={-1}>Sütun seçin</option>
                {Array.from({ length: width }, (_, column) => {
                  if (column < range.firstColumn - 1 || column >= range.lastColumn) return null;
                  const hint = examples.find((row) => row[column])?.[column];
                  return <option key={column} value={column}>{column + 1}. sütun{hint ? ' · ' + hint.slice(0, 45) : ''}</option>;
                })}
              </select>
            </label>
          ))}
        </div>}
      </details>
    </section>
  );
}
