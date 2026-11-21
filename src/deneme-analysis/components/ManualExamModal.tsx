import React, { useState } from 'react';
import { X } from 'lucide-react';
import {
  SUBJECT_LIST,
  SubjectKey,
  SubjectScore,
  StudentExamRecord,
  StudentProfile,
  TOTAL_LGS_QUESTIONS,
} from '../types/exam';
import { formatTrNumber } from '../utils/analytics';

interface ManualExamModalProps {
  student: StudentProfile;
  nextExamOrder: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: StudentExamRecord) => void;
}

type InputMap = Record<SubjectKey, { dogru: string; yanlis: string }>;

function makeInitialInputs(student: StudentProfile): InputMap {
  const latest = student.exams[student.exams.length - 1];
  const map = {} as InputMap;
  for (const s of SUBJECT_LIST) {
    const prev = latest?.subjects[s.key];
    map[s.key] = {
      dogru: prev ? String(prev.dogru) : '0',
      yanlis: prev ? String(prev.yanlis) : '0',
    };
  }
  return map;
}

export const ManualExamModal: React.FC<ManualExamModalProps> = ({
  student,
  nextExamOrder,
  isOpen,
  onClose,
  onSave,
}) => {
  const [examName, setExamName] = useState(`8.SINIF GELİŞİM İZLEME ${nextExamOrder}`);
  const [examDate, setExamDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [lgsPuan, setLgsPuan] = useState(() => {
    const latest = student.exams[student.exams.length - 1];
    return latest ? String(latest.lgsPuan) : '320';
  });
  const [inputs, setInputs] = useState<InputMap>(() => makeInitialInputs(student));
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const computeSubject = (key: SubjectKey, soru: number): SubjectScore => {
    const d = Math.max(0, Math.min(soru, parseInt(inputs[key].dogru, 10) || 0));
    const y = Math.max(0, Math.min(soru - d, parseInt(inputs[key].yanlis, 10) || 0));
    const bos = Math.max(0, soru - d - y);
    const net = Math.round((d - y / 3) * 100) / 100;
    const basariYuzdesi = Math.round((net / soru) * 100);
    return { soru, dogru: d, yanlis: y, bos, net, basariYuzdesi };
  };

  const subjects = {} as Record<SubjectKey, SubjectScore>;
  for (const s of SUBJECT_LIST) {
    subjects[s.key] = computeSubject(s.key, s.questionCount);
  }

  const totalD = SUBJECT_LIST.reduce((acc, s) => acc + subjects[s.key].dogru, 0);
  const totalY = SUBJECT_LIST.reduce((acc, s) => acc + subjects[s.key].yanlis, 0);
  const totalB = Math.max(0, TOTAL_LGS_QUESTIONS - totalD - totalY);
  const totalNet = Math.round(SUBJECT_LIST.reduce((acc, s) => acc + subjects[s.key].net, 0) * 100) / 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim()) {
      setError('Lütfen bir deneme adı girin.');
      return;
    }
    const parsedLgs = Number(lgsPuan.replace(',', '.'));
    if (!Number.isFinite(parsedLgs) || parsedLgs < 0 || parsedLgs > 500) {
      setError('LGS puanı 0 ile 500 arasında olmalıdır.');
      return;
    }

    const latest = student.exams[student.exams.length - 1];
    for (const s of SUBJECT_LIST) {
      subjects[s.key].kurumOrt = latest?.subjects[s.key].kurumOrt;
      subjects[s.key].genelOrt = latest?.subjects[s.key].genelOrt;
    }

    const now = new Date().toISOString();
    const record: StudentExamRecord = {
      examId: `manual_${Date.now()}`,
      examName: examName.trim(),
      examOrder: nextExamOrder,
      examDate,
      uploadedAt: now,
      lgsPuan: Math.round(parsedLgs * 1000) / 1000,
      genelOrtPuan: latest?.genelOrtPuan,
      okulOrtPuan: latest?.okulOrtPuan,
      dereceler: {},
      subjects,
      toplam: {
        soru: TOTAL_LGS_QUESTIONS,
        dogru: totalD,
        yanlis: totalY,
        bos: totalB,
        net: totalNet,
        basariYuzdesi: Math.round((totalNet / TOTAL_LGS_QUESTIONS) * 100),
        kurumOrt: latest?.toplam.kurumOrt,
        genelOrt: latest?.toplam.genelOrt,
      },
      kazanimlar: [],
    };

    onSave(record);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Manuel Deneme Sonucu Ekle</h2>
            <p className="text-sm text-slate-500">
              {student.name} · {student.sinif} · No: {student.numara}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-slate-700">Deneme Adı</label>
              <input
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">Tarih</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm tabular-nums focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">LGS Puanı</label>
              <input
                type="text"
                value={lgsPuan}
                onChange={(e) => setLgsPuan(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm tabular-nums focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-3 py-2.5">Ders</th>
                  <th className="px-3 py-2.5 text-right">Soru</th>
                  <th className="px-3 py-2.5 text-right">Doğru</th>
                  <th className="px-3 py-2.5 text-right">Yanlış</th>
                  <th className="px-3 py-2.5 text-right">Boş</th>
                  <th className="px-3 py-2.5 text-right">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {SUBJECT_LIST.map((s) => {
                  const sc = subjects[s.key];
                  return (
                    <tr key={s.key}>
                      <td className="px-3 py-2 font-medium text-slate-900">{s.label}</td>
                      <td className="px-3 py-2 text-right font-mono text-slate-500 tabular-nums">
                        {s.questionCount}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          min={0}
                          max={s.questionCount}
                          value={inputs[s.key].dogru}
                          onChange={(e) =>
                            setInputs((prev) => ({
                              ...prev,
                              [s.key]: { ...prev[s.key], dogru: e.target.value },
                            }))
                          }
                          className="w-16 rounded border border-slate-300 px-2 py-1 text-right font-mono text-sm tabular-nums focus:border-blue-600 focus:outline-none"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          min={0}
                          max={s.questionCount}
                          value={inputs[s.key].yanlis}
                          onChange={(e) =>
                            setInputs((prev) => ({
                              ...prev,
                              [s.key]: { ...prev[s.key], yanlis: e.target.value },
                            }))
                          }
                          className="w-16 rounded border border-slate-300 px-2 py-1 text-right font-mono text-sm tabular-nums focus:border-blue-600 focus:outline-none"
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-slate-500 tabular-nums">
                        {sc.bos}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-semibold text-slate-900 tabular-nums">
                        {formatTrNumber(sc.net)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-900">
                <tr>
                  <td className="px-3 py-2.5">Toplam</td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                    {TOTAL_LGS_QUESTIONS}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-emerald-700 tabular-nums">
                    {totalD}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-red-700 tabular-nums">
                    {totalY}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-slate-600 tabular-nums">
                    {totalB}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-blue-700 tabular-nums">
                    {formatTrNumber(totalNet)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50/60 px-6 py-3.5 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            İptal
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Denemeyi Öğrenci Arşivine Ekle
          </button>
        </div>
      </form>
    </div>
  );
};
