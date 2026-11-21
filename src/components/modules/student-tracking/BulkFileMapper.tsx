import { useState } from 'react';
import { importSheetWidth, type ImportSheet } from '../../../utils/bulkRecordFiles';

const PAGE_ROWS = 20;

export function BulkFileMapper({ sheet, fields, onApply, onChange }: {
  sheet: ImportSheet;
  fields: string[];
  onApply: (firstRow: number, lastRow: number, columns: number[], excluded: Set<number>) => void;
  onChange: () => void;
}) {
  const [first, setFirst] = useState<number>();
  const [last, setLast] = useState<number>();
  const [excluded, setExcluded] = useState<Set<number>>(new Set());
  const [columns, setColumns] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const width = importSheetWidth(sheet.rows);
  const start = first === undefined ? undefined : Math.min(first, last ?? first);
  const end = first === undefined ? undefined : Math.max(first, last ?? first);
  const pageStart = page * PAGE_ROWS;
  const visibleRows = sheet.rows.slice(pageStart, pageStart + PAGE_ROWS);
  const columnLabels = Array.from({ length: width }, (_, index) => {
    const letter = String.fromCharCode(65 + index % 26);
    return index < 26 ? letter : String.fromCharCode(64 + Math.floor(index / 26)) + letter;
  });

  function selectRow(row: number) {
    onChange();
    if (first === undefined) {
      setFirst(row);
    } else if (last === undefined) {
      setLast(row);
    } else if (start !== undefined && end !== undefined && row >= start && row <= end) {
      setExcluded((current) => {
        const next = new Set(current);
        if (!next.delete(row)) next.add(row);
        return next;
      });
    } else {
      setFirst(row);
      setLast(undefined);
      setExcluded(new Set());
    }
  }

  function selectColumn(column: number) {
    if (!columns.includes(column) && columns.length === fields.length) return;
    onChange();
    setColumns(columns.includes(column) ? columns.filter((value) => value !== column) : [...columns, column]);
  }

  return (
    <div className="min-w-0 space-y-3">
      <p className="text-sm text-slate-700 dark:text-slate-200">
        {last !== undefined
          ? 'Bir satırı dışarıda bırakmak için numarasına yeniden dokunun.'
          : 'İlk ve son satır numarasına dokunun. Tek satır için aynı numaraya iki kez dokunun.'}
      </p>
      <p className="text-sm font-medium">
        Sütun başlıklarından sırayla şu alanları seçin: {fields.join(', ')}.
      </p>
      <div className="max-h-[26rem] max-w-full overflow-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
        role="region" aria-label="Satır ve sütun seçimi" tabIndex={0}>
        <table className="w-full whitespace-nowrap text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800"><tr>
            <th scope="col" className="sticky left-0 bg-slate-100 px-2 dark:bg-slate-800">Satır</th>
            {columnLabels.map((label, column) => {
              const index = columns.indexOf(column);
              return <th key={label} scope="col">
                <button type="button" className="min-h-11 w-full min-w-12 px-2 aria-pressed:bg-teal-700 aria-pressed:text-white"
                  aria-label={label + ' sütunu' + (index >= 0 ? ' · ' + fields[index] : '')}
                  aria-pressed={index >= 0} onClick={() => selectColumn(column)}>
                  {label}{index >= 0 && ' · ' + fields[index]}
                </button>
              </th>;
            })}
          </tr></thead>
          <tbody>{visibleRows.map((row, index) => {
            const number = pageStart + index;
            const selected = start !== undefined && end !== undefined && number >= start && number <= end && !excluded.has(number);
            return <tr key={number} className="border-t border-slate-200 dark:border-slate-800">
              <th scope="row" className="sticky left-0 bg-white dark:bg-slate-950">
                <button type="button" onClick={() => selectRow(number)} aria-label={(number + 1) + '. satır'}
                  aria-pressed={selected} className="min-h-11 w-full min-w-12 px-2 aria-pressed:bg-teal-700 aria-pressed:text-white">{number + 1}</button>
              </th>
              {columnLabels.map((label, column) => (
                <td key={label} className={'px-2 ' + (selected && columns.includes(column) ? 'bg-teal-100 dark:bg-teal-950' : '')}>{row[column] || '—'}</td>
              ))}
            </tr>;
          })}</tbody>
        </table>
      </div>
      {sheet.rows.length > PAGE_ROWS && <div className="flex flex-wrap items-center gap-4 text-sm">
        <button type="button" className="underline disabled:opacity-40" disabled={page === 0} onClick={() => setPage(page - 1)}>Önceki satırlar</button>
        <span>{pageStart + 1}–{pageStart + visibleRows.length} / {sheet.rows.length}</span>
        <button type="button" className="underline disabled:opacity-40" disabled={pageStart + PAGE_ROWS >= sheet.rows.length} onClick={() => setPage(page + 1)}>Sonraki satırlar</button>
      </div>}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={last === undefined || columns.length !== fields.length || (start !== undefined && end !== undefined && excluded.size === end - start + 1)}
          className="rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-45 dark:bg-teal-700"
          onClick={() => { if (start !== undefined && end !== undefined) onApply(start, end, columns, excluded); }}>Seçimi Önizle</button>
        {first !== undefined && <button type="button" className="text-sm underline" onClick={() => {
          onChange();
          setFirst(undefined);
          setLast(undefined);
          setExcluded(new Set());
        }}>Satır Seçimini Temizle</button>}
        <p role="status" className="text-sm text-slate-600 dark:text-slate-300">
          {first === undefined ? 'İlk satırı seçin' : last === undefined ? 'Son satırı seçin' : `Satır ${start! + 1}–${end! + 1}`} · {columns.length}/{fields.length} sütun
        </p>
      </div>
    </div>
  );
}
