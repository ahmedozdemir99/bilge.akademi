import React, { useRef, useState } from 'react';
import {
  FileUp,
  Trash2,
  Pencil,
  Check,
  X,
  Download,
  Upload,
  RefreshCw,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { ExamArchiveState } from '../types/exam';
import { formatTrNumber } from '../utils/analytics';
import { downloadExcelTemplate, exportSchoolArchiveToExcel } from '../utils/excelHandler';

interface ExamArchiveViewProps {
  state: ExamArchiveState;
  onOpenUpload: () => void;
  onDeleteExam: (examId: string) => void;
  onRenameExam: (examId: string, newName: string) => void;
  onImportJson: (state: ExamArchiveState) => void;
  onLoadSample: () => void;
}

export const ExamArchiveView: React.FC<ExamArchiveViewProps> = ({
  state,
  onOpenUpload,
  onDeleteExam,
  onRenameExam,
  onImportJson,
  onLoadSample,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const sortedExams = [...state.exams].sort((a, b) => a.examOrder - b.examOrder);

  const handleExportBackup = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lgs_deneme_arsivi_yedek_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as ExamArchiveState;
      if (!parsed || !Array.isArray(parsed.exams) || !Array.isArray(parsed.students)) {
        throw new Error('Geçersiz arşiv yedek dosyası.');
      }
      setImportError(null);
      onImportJson(parsed);
    } catch {
      setImportError('JSON yedek dosyası okunamadı. Lütfen geçerli bir arşiv yedeği seçin.');
    } finally {
      if (jsonInputRef.current) jsonInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Yüklenen Deneme Arşivi</h1>
          <p className="text-xs text-slate-500">
            Yeni deneme PDF&apos;leri ekleyin, mevcut sınavları düzenleyin veya arşiv yedeğinizi dışa aktarın.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => exportSchoolArchiveToExcel(state)}
            disabled={state.exams.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-40"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Tüm Arşivi Excel İndir (.xlsx)
          </button>
          <button
            type="button"
            onClick={downloadExcelTemplate}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            Excel Şablonu
          </button>
          <button
            type="button"
            onClick={handleExportBackup}
            disabled={state.exams.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            JSON Yedek
          </button>
          <button
            type="button"
            onClick={() => jsonInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Upload className="h-3.5 w-3.5" />
            JSON Yükle
          </button>
          <input
            ref={jsonInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImportFile}
          />
          <button
            type="button"
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800"
          >
            <FileUp className="h-3.5 w-3.5" />
            PDF / Excel Yükle
          </button>
        </div>
      </div>

      {importError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {importError}
        </div>
      )}

      {/* Exams Table */}
      <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {sortedExams.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-slate-700">Arşivde henüz kayıtlı deneme yok.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={onOpenUpload}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
              >
                <FileUp className="h-3.5 w-3.5" />
                PDF Yükle
              </button>
              <button
                type="button"
                onClick={onLoadSample}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Örnek Verileri Ekle
              </button>
            </div>
          </div>
        ) : (
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Sıra</th>
                <th className="px-4 py-3">Deneme Adı & Dosya</th>
                <th className="px-3 py-3">Tarih</th>
                <th className="px-3 py-3 text-right">Öğrenci</th>
                <th className="px-3 py-3 text-right">Okul LGS Ort.</th>
                <th className="px-3 py-3 text-right">Genel LGS Ort.</th>
                <th className="px-3 py-3 text-right">Okul Net Ort.</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedExams.map((ex, idx) => {
                const isEditing = editingId === ex.id;
                const isConfirming = confirmDeleteId === ex.id;
                return (
                  <tr key={ex.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-400 tabular-nums">
                      #{idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-64 rounded border border-blue-500 px-2 py-1 text-xs font-semibold text-slate-900 focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => {
                              onRenameExam(ex.id, editValue);
                              setEditingId(null);
                            }}
                            className="rounded p-1 text-emerald-700 hover:bg-emerald-50"
                            aria-label="Kaydet"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100"
                            aria-label="İptal"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="font-semibold text-slate-900">{ex.name}</div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                            <FileText className="h-3 w-3 shrink-0 text-slate-400" />
                            <span className="max-w-xs truncate">{ex.fileName}</span>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-600 tabular-nums">
                      {ex.examDate}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-xs font-semibold text-slate-800 tabular-nums">
                      {ex.studentCount}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-xs font-bold text-slate-900 tabular-nums">
                      {formatTrNumber(ex.schoolAvgLgs, 2)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-xs text-slate-500 tabular-nums">
                      {formatTrNumber(ex.generalAvgLgs, 2)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-xs font-bold text-blue-700 tabular-nums">
                      {formatTrNumber(ex.schoolAvgToplamNet, 2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isConfirming ? (
                        <div className="inline-flex items-center gap-1.5 text-xs">
                          <span className="text-red-700">Silinsin mi?</span>
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteExam(ex.id);
                              setConfirmDeleteId(null);
                            }}
                            className="rounded bg-red-600 px-2 py-1 font-semibold text-white hover:bg-red-700"
                          >
                            Evet
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded border border-slate-300 bg-white px-2 py-1 font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Vazgeç
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(ex.id);
                              setEditValue(ex.name);
                            }}
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            title="Deneme adını düzenle"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(ex.id)}
                            className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-700"
                            title="Denemeyi arşivden kaldır"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};
