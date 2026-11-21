import React, { useRef, useState } from 'react';
import {
  FileUp,
  FileText,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Download,
} from 'lucide-react';
import { ParsedExamBundle } from '../types/exam';
import { parseExamPdf } from '../utils/pdfParser';
import { downloadExcelTemplate, parseExamExcel } from '../utils/excelHandler';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBundlesParsed: (bundles: ParsedExamBundle[]) => {
    totalRecords: number;
    matchedCount: number;
    newStudentsCount: number;
    examCount: number;
  };
  nextExamOrder: number;
  onLoadSample: () => void;
}

interface UploadResultSummary {
  examCount: number;
  totalRecords: number;
  matchedCount: number;
  newStudentsCount: number;
  fileNames: string[];
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [customExamName, setCustomExamName] = useState('');
  const [examDate, setExamDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [progressPct, setProgressPct] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultSummary, setResultSummary] = useState<UploadResultSummary | null>(null);

  if (!isOpen) return null;

  const handleFilesAdded = (files: FileList | null) => {
    if (!files) return;
    const supported = Array.from(files).filter((f) => isPdfFile(f) || isExcelFile(f));
    if (supported.length === 0) {
      setErrorMsg('Lütfen PDF (.pdf) veya Excel (.xlsx, .xls, .csv) formatında deneme sonuç dosyası seçin.');
      return;
    }
    setErrorMsg(null);
    setResultSummary(null);
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
    if (selectedFiles.length === 0) return;
    setIsParsing(true);
    setErrorMsg(null);
    setResultSummary(null);

    try {
      const bundles: ParsedExamBundle[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const buffer = await file.arrayBuffer();
        const customName =
          selectedFiles.length === 1 && customExamName.trim() ? customExamName.trim() : undefined;

        if (isExcelFile(file)) {
          setProgressText(`"${file.name}" Excel tablosu okunuyor...`);
          setProgressPct(Math.round(((i + 0.5) / selectedFiles.length) * 100));
          const bundle = await parseExamExcel(buffer, file.name, {
            customExamName: customName,
            examDate,
            examOrder: nextExamOrder + i,
          });
          bundles.push(bundle);
          setProgressPct(Math.round(((i + 1) / selectedFiles.length) * 100));
        } else {
          setProgressText(`"${file.name}" okunuyor...`);
          const bundle = await parseExamPdf(buffer, file.name, {
            customExamName: customName,
            examDate,
            examOrder: nextExamOrder + i,
            onProgress: (cur, total) => {
              const fileBase = (i / selectedFiles.length) * 100;
              const fileSpan = (1 / selectedFiles.length) * 100;
              setProgressPct(Math.round(fileBase + (cur / Math.max(1, total)) * fileSpan));
              setProgressText(`${file.name} · Sayfa ${cur} / ${total}`);
            },
          });
          bundles.push(bundle);
        }
      }

      const stats = onBundlesParsed(bundles);
      setResultSummary({
        ...stats,
        fileNames: selectedFiles.map((f) => f.name),
      });
      setSelectedFiles([]);
      setCustomExamName('');
      setProgressPct(100);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Dosya ayrıştırılırken beklenmeyen bir hata oluştu.'
      );
    } finally {
      setIsParsing(false);
    }
  };

  const handleClose = () => {
    if (isParsing) return;
    setErrorMsg(null);
    setResultSummary(null);
    setSelectedFiles([]);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 id="upload-modal-title" className="text-lg font-bold text-slate-900">
              Toplu Deneme Sonuç Dosyası Yükle (PDF / Excel)
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              PDF veya Excel (.xlsx, .xls, .csv) dosyalarını yükleyin; öğrenciler otomatik eşleştirilir.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isParsing}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
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
            onClick={() => !isParsing && fileInputRef.current?.click()}
            className={`cursor-pointer rounded-lg border-2 border-dashed px-6 py-7 text-center transition-colors ${
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
              onChange={(e) => handleFilesAdded(e.target.files)}
            />
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-700">
              <FileUp className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-slate-900">
              PDF veya Excel dosyasını sürükleyip bırakın veya seçin
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Desteklenen formatlar: <strong>PDF</strong> (Toplu Sonuç Belgesi / Okul Net Listesi) ve{' '}
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

          {/* Progress */}
          {isParsing && (
            <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3.5">
              <div className="flex items-center justify-between text-xs font-medium text-blue-900">
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-700" />
                  {progressText || 'Dosya ayrıştırılıyor...'}
                </span>
                <span className="font-mono tabular-nums">%{progressPct}</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-blue-200/70">
                <div
                  className="h-full bg-blue-700 transition-all duration-150"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success */}
          {resultSummary && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3.5 text-sm text-emerald-900">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                {resultSummary.examCount} deneme başarıyla arşive eklendi
              </div>
              <p className="mt-1 text-xs text-emerald-800 tabular-nums">
                Toplam {resultSummary.totalRecords} öğrenci kaydı işlendi ·{' '}
                {resultSummary.matchedCount} mevcut öğrenci eşleştirildi ·{' '}
                {resultSummary.newStudentsCount} yeni öğrenci kartı oluşturuldu.
              </p>
              <p className="mt-1 text-[11px] text-emerald-700">
                Önceki ve sonraki deneme karşılaştırmaları tüm öğrenci kartlarında ve Genel Bakış ekranında güncellendi.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/60 px-6 py-3.5 rounded-b-xl">
          <button
            type="button"
            onClick={() => {
              onLoadSample();
              onClose();
            }}
            disabled={isParsing}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-blue-700 disabled:opacity-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Örnek Verileri Ekle
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isParsing}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40"
            >
              {resultSummary ? 'Tamam' : 'İptal'}
            </button>
            <button
              type="button"
              onClick={handleParseAll}
              disabled={selectedFiles.length === 0 || isParsing}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isParsing ? 'Okunuyor...' : 'Analiz Et ve Arşive Ekle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
