import { useState } from 'react';
import { extractMappedRows, suggestFileColumns, type ImportSheet } from '../../../utils/bulkRecordFiles';

const control = 'w-full min-w-0 rounded-md border border-slate-300 bg-white px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-950';

export function BulkFileMapper({ sheets, filename, fields, onApply, onClose }: {
  sheets: ImportSheet[];
  filename: string;
  fields: string[];
  onApply: (text: string) => void;
  onClose: () => void;
}) {
  const [sheetIndex, setSheetIndex] = useState(0);
  const sheet = sheets[sheetIndex];
  const suggested = suggestFileColumns(sheet.rows, fields);
  const [columns, setColumns] = useState(suggested.columns);
  const [first, setFirst] = useState(String(suggested.firstRow));
  const [last, setLast] = useState(String(sheet.rows.length));
  const [error, setError] = useState('');
  const width = sheet.rows.reduce((maximum, row) => Math.max(maximum, row.length), 0);
  const start = Math.max(0, Math.min(sheet.rows.length - 1, (Number(first) || 1) - 1));
  const examples = sheet.rows.slice(start, start + 4);

  function switchSheet(index: number) {
    const nextSheet = sheets[index];
    const next = suggestFileColumns(nextSheet.rows, fields);
    setSheetIndex(index);
    setColumns(next.columns);
    setFirst(String(next.firstRow));
    setLast(String(nextSheet.rows.length));
    setError('');
  }

  return (
    <section className="space-y-3 rounded-lg border border-teal-200 bg-teal-50/40 p-3 dark:border-teal-900 dark:bg-teal-950/20">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold">Dosyadaki sütunları eşleştir</h3>
        <button type="button" className="text-sm font-medium underline" onClick={onClose}>Kapat</button>
      </div>
      <p className="break-all text-xs text-slate-600 dark:text-slate-300">{filename} · {sheet.rows.length} satır</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {sheets.length > 1 && <label className="space-y-1 text-sm"><span>Çalışma sayfası</span>
          <select value={sheetIndex} onChange={(event) => switchSheet(Number(event.target.value))} className={control}>
            {sheets.map(({ name }, index) => <option key={index} value={index}>{name}</option>)}
          </select>
        </label>}
        <label className="space-y-1 text-sm"><span>İlk veri satırı</span>
          <input type="number" min="1" max={sheet.rows.length} value={first} onChange={(event) => setFirst(event.target.value)} className={control} />
        </label>
        <label className="space-y-1 text-sm"><span>Son veri satırı</span>
          <input type="number" min="1" max={sheet.rows.length} value={last} onChange={(event) => setLast(event.target.value)} className={control} />
        </label>
      </div>
      <div role="region" aria-label="Dosyadan okunan örnek satırlar" tabIndex={0} className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <table className="w-full whitespace-nowrap text-left text-xs">
          <thead><tr><th className="px-2 py-1.5">Satır</th>
            {Array.from({ length: width }, (_, column) => <th key={column} className="px-2 py-1.5">{column + 1}{suggested.header[column] ? ' · ' + suggested.header[column] : ''}</th>)}
          </tr></thead>
          <tbody>{examples.map((row, index) => <tr className="border-t border-slate-200 dark:border-slate-800" key={index}>
            <th className="px-2 py-1.5">{start + index + 1}</th>
            {Array.from({ length: width }, (_, column) => <td key={column} className="max-w-52 truncate px-2 py-1.5" title={row[column]}>{row[column] || '—'}</td>)}
          </tr>)}</tbody>
        </table>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((field, fieldIndex) => (
          <label className="min-w-0 space-y-1 text-sm" key={field}>
            <span>{field}</span>
            <select value={columns[fieldIndex]} className={control} onChange={(event) => {
              const column = Number(event.target.value);
              setColumns((current) => current.map((value, index) => index === fieldIndex ? column : value));
              setError('');
            }}>
              <option value={-1}>Sütun seçin</option>
              {Array.from({ length: width }, (_, column) => {
                const hint = suggested.header[column] || examples.find((row) => row[column])?.[column];
                return <option key={column} value={column}>{column + 1}. sütun{hint ? ' · ' + hint.slice(0, 45) : ''}</option>;
              })}
            </select>
          </label>
        ))}
      </div>
      {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
      <button type="button" className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800"
        onClick={() => {
          try {
            onApply(extractMappedRows(sheet.rows, columns, Number(first), Number(last)));
            setError('');
          } catch (issue) {
            setError(issue instanceof Error ? issue.message : 'Satırlar alınamadı.');
          }
        }}>Satırları Listeye Al</button>
    </section>
  );
}
