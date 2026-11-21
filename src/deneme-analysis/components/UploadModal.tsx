import React, { useEffect, useRef, useState } from 'react';
import {
  FileUp,
  FileText,
  FileSpreadsheet,
  X,
  AlertCircle,
  Loader2,
  RefreshCw,
  Download,
} from 'lucide-react';
import { ParsedExamBundle } from '../types/exam';
import { parseExamPdf } from '../utils/pdfParser';
import { downloadExcelTemplate, parseExamExcel } from '../utils/excelHandler';
import { Modal } from '../../components/ui/Modal';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBundlesParsed: (bundles: ParsedExamBundle[]) => void;
  nextExamOrder: number;
  onLoadSample: () => void;
}

function isExcelFile(file: File): boolean {
  const lower = file.name.toLowerCase();
  return (
    lower.endsWith('.xlsx') ||
    lower.endsWith('.xls') ||
    lower.endsWith('.csv') ||
    file.type.includes('spreadsheet') ||
    file.type.includes('excel') ||
    file.type === 'text/csv'
  );
}

function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onBundlesParsed,
  nextExamOrder,
  onLoadSample,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUpload = useRef<AbortController | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [customExamName, setCustomExamName] = useState('');
  const [examDate, setExamDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [progressPct, setProgressPct] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  useEffect(() => () => currentUpload.current?.abort(), []);

  const handleFilesAdded = (files: FileList | null) => {
    if (!files || currentUpload.current) return;
    const supported = Array.from(files).filter((f) => isPdfFile(f) || isExcelFile(f));
    if (supported.length === 0) {
      setErrorMsg('Lütfen PDF (.pdf) veya Excel (.xlsx, .xls, .csv) formatında deneme sonuç dosyası seçin.');
      return;
    }
    setErrorMsg(null);
    setSelectedFiles((prev) => {
      const existingNames = new Set(prev.map((p) => `${p.name}_${p.size}`));
      const uniqueNew = supported.filter((f) => !existingNames.has(`${f.name}_${f.size}`));
      return [...prev, ...uniqueNew];
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleParseAll = async () => {
    if (selectedFiles.length === 0 || currentUpload.current) return;
    const controller = new AbortController();
    currentUpload.current = controller;
    const { signal } = controller;
    setIsParsing(true);
    setErrorMsg(null);
    setProgressPct(0);
    setProgressText('Dosya hazırlanıyor…');

    try {
      const bundles: ParsedExamBundle[] = [];
      for (const [index, file] of selectedFiles.entries()) {
        signal.throwIfAborted();
        const customName = selectedFiles.length === 1 ? customExamName.trim() || undefined : undefined;
        const options = { customExamName: customName, examDate, examOrder: nextExamOrder + index };
        setProgressText(`${index + 1}/${selectedFiles.length} · ${file.name}`);
        const buffer = await file.arrayBuffer();
        signal.throwIfAborted();

        if (isExcelFile(file)) {
          bundles.push(await parseExamExcel(buffer, file.name, options));
        } else {
          bundles.push(await parseExamPdf(buffer, file.name, {
            ...options,
            signal,
            onProgress: (current, total) => {
              if (signal.aborted) return;
              setProgressPct(Math.round((index + current / total) * 100 / selectedFiles.length));
              setProgressText(`${index + 1}/${selectedFiles.length} · Sayfa ${current} / ${total}`);
            },
          }));
        }
        setProgressPct(Math.round((index + 1) * 100 / selectedFiles.length));
      }

      signal.throwIfAborted();
      onBundlesParsed(bundles);
      onClose();
    } catch (error) {
      if (!signal.aborted) setErrorMsg(error instanceof Error ? error.message : 'Dosya okunamadı.');
    } finally {
      if (currentUpload.current === controller) {
        currentUpload.current = null;
        setIsParsing(false);
      }
    }
  };

  const cancelUpload = () => {
    currentUpload.current?.abort();
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={cancelUpload}
      title="Deneme Dosyası Yükle"
      subtitle="PDF, Excel veya CSV dosyası seçin."
      maxWidthClass="max-w-xl"
      footer={
        <div className="space-y-2">
          {isParsing && (
            <div role="status" className="space-y-1 text-sm text-slate-700 dark:text-slate-200">
              <p className="truncate">{progressText}</p>
              <progress className="block h-2 w-full accent-teal-700" max={100} value={progressPct} aria-label="Dosya okuma ilerlemesi" />
            </div>
          )}
          {errorMsg && (
            <p role="alert" className="flex max-h-[18dvh] gap-2 overflow-y-auto text-sm text-red-700 dark:text-rose-300">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {errorMsg}
            </p>
          )}
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-2">
            <button type="button" onClick={cancelUpload} className="appearance-option">
              {isParsing ? 'Durdur' : 'Kapat'}
            </button>
            <button type="button" onClick={() => void handleParseAll()} disabled={!selectedFiles.length || isParsing}
              className="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-lg bg-teal-700 px-2 py-2 text-center text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50">
              {isParsing && <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />}
              {isParsing ? 'Okunuyor…' : 'Analiz Et ve Arşive Ekle'}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFilesAdded(e.dataTransfer.files);
            }}
            className={`cursor-pointer rounded-lg border-2 border-dashed px-3 py-4 text-center sm:px-6 sm:py-6 transition-colors ${
              isDragging
                ? 'border-blue-600 bg-blue-50/70'
                : 'border-slate-300 bg-slate-50/60 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf,.xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              multiple
              className="hidden"
              disabled={isParsing}
              onChange={(event) => {
                handleFilesAdded(event.target.files);
                event.target.value = '';
              }}
            />
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-700">
              <FileUp className="h-5 w-5" />
            </div>
            <button type="button" disabled={isParsing} onClick={() => fileInputRef.current?.click()}
              className="appearance-option mx-auto">
              Dosya Seç
            </button>
            <p className="mt-1 text-xs text-slate-500">
              Sürükleyip bırakabilirsiniz. <strong>PDF</strong> (Toplu Sonuç Belgesi / Okul Net Listesi) ve{' '}
              <strong>Excel (.xlsx, .xls, .csv)</strong> (tek veya çift satır başlıklı D/Y/B/Net tabloları).
            </p>
          </div>

          {/* Excel Template Helper Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs">
            <span className="flex items-center gap-2 text-slate-600">
              <FileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-700" />
              Kendi Excel dosyanızı hazırlamak için hazır şablonu kullanabilirsiniz.
            </span>
            <button
              type="button"
              onClick={downloadExcelTemplate}
              className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
            >
              <Download className="h-3.5 w-3.5" />
              Örnek Şablon (.xlsx)
            </button>
          </div>

          {/* Selected files list */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span>Seçilen Dosyalar ({selectedFiles.length})</span>
                <button
                  type="button"
                  onClick={() => setSelectedFiles([])}
                  disabled={isParsing}
                  className="text-slate-500 hover:text-slate-800"
                >
                  Temizle
                </button>
              </div>
              <div className="max-h-36 divide-y divide-slate-200 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                {selectedFiles.map((file, idx) => {
                  const excel = isExcelFile(file);
                  return (
                    <div
                      key={`${file.name}_${idx}`}
                      className="flex items-center justify-between px-3 py-2 text-sm"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        {excel ? (
                          <FileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-700" />
                        ) : (
                          <FileText className="h-4 w-4 shrink-0 text-blue-700" />
                        )}
                        <span className="truncate font-medium text-slate-800">{file.name}</span>
                        <span className="shrink-0 font-mono text-xs text-slate-400 tabular-nums">
                          {file.size >= 1024 * 1024
                            ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                            : `${Math.max(1, Math.round(file.size / 1024))} KB`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        disabled={isParsing}
                        className="ml-2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Dosyayı kaldır"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Optional metadata */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="exam-name-input"
                className="block text-xs font-medium text-slate-700"
              >
                Deneme Adı (İsteğe Bağlı)
              </label>
              <input
                id="exam-name-input"
                type="text"
                value={customExamName}
                onChange={(e) => setCustomExamName(e.target.value)}
                disabled={isParsing || selectedFiles.length > 1}
                placeholder="Boş bırakılırsa dosyadan otomatik alınır"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none disabled:bg-slate-50"
              />
            </div>
            <div>
              <label
                htmlFor="exam-date-input"
                className="block text-xs font-medium text-slate-700"
              >
                Sınav Tarihi
              </label>
              <input
                id="exam-date-input"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                disabled={isParsing}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 tabular-nums focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

        <button
          type="button"
          onClick={() => { onLoadSample(); onClose(); }}
          disabled={isParsing}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 underline hover:text-teal-700 disabled:opacity-50"
        >
          <RefreshCw className="size-4" aria-hidden="true" /> Örnek Verileri Ekle
        </button>
      </div>
    </Modal>
  );
};
