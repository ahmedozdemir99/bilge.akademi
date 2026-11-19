import React, { useEffect, useState } from 'react';
import { DEFAULT_SUBJECT_NAMES } from '../../../data/demoData';
import type {
  AttendanceStatus,
  ExamType,
  Grade,
  SchoolClass,
  Student,
  StudentStatus,
} from '../../../types/academy';
import type {
  AttendanceInput,
  ClassInput,
  GradeInput,
  StudentInput,
} from '../../../context/AcademyContext';
import { Modal } from '../../ui/Modal';

const EXAM_TYPES: ExamType[] = ['Yazılı', 'Deneme', 'Sözlü', 'Proje', 'Performans'];

const inputClass =
  'w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-teal-600 dark:focus:border-teal-400 focus:outline-none';
const labelClass = 'block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5';

/* ---------------- Class Form Modal ---------------- */
interface ClassFormModalProps {
  open: boolean;
  onClose: () => void;
  editingClass: SchoolClass | null;
  onSubmit: (data: ClassInput) => Promise<void>;
}

export function ClassFormModal({
  open,
  onClose,
  editingClass,
  onSubmit,
}: ClassFormModalProps) {
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState(8);
  const [section, setSection] = useState('A');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [subjectFocus, setSubjectFocus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingClass) {
        setName(editingClass.name);
        setGradeLevel(editingClass.gradeLevel);
        setSection(editingClass.section);
        setAcademicYear(editingClass.academicYear);
        setSubjectFocus(editingClass.subjectFocus ?? '');
      } else {
        setName('');
        setGradeLevel(8);
        setSection('A');
        setAcademicYear('2026-2027');
        setSubjectFocus('Ortaokul Müfredatı');
      }
      setError('');
    }
  }, [editingClass, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedSection = section.trim();
    const trimmedYear = academicYear.trim();

    if (trimmedName.length < 2 || trimmedName.length > 60) {
      setError('Sınıf adı 2 ile 60 karakter arasında olmalıdır.');
      return;
    }
    if (gradeLevel < 1 || gradeLevel > 12) {
      setError('Sınıf seviyesi 1 ile 12 arasında olmalıdır.');
      return;
    }
    if (trimmedSection.length < 1 || trimmedSection.length > 10) {
      setError('Şube bilgisi zorunludur (ör. A, B, C).');
      return;
    }
    if (trimmedYear.length < 4 || trimmedYear.length > 20) {
      setError('Eğitim-öğretim yılı geçerli formatta olmalıdır (ör. 2026-2027).');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onSubmit({
        name: trimmedName,
        gradeLevel,
        section: trimmedSection.toUpperCase(),
        academicYear: trimmedYear,
        subjectFocus: subjectFocus.trim().slice(0, 80),
      });
      onClose();
    } catch {
      setError('Sınıf kaydedilirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingClass ? 'Sınıfı Düzenle' : 'Yeni Ortaokul Sınıfı ve Şube Oluştur'}
      subtitle="Öğrencileri organize etmek için ortaokul sınıf ve şube bilgilerini tanımlayın."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg px-3.5 py-2.5">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="cls-name" className={labelClass}>
            Sınıf Adı *
          </label>
          <input
            id="cls-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn. 8-A LGS Hazırlık"
            maxLength={60}
            required
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="cls-grade" className={labelClass}>
              Sınıf Düzeyi (Ortaokul) *
            </label>
            <select
              id="cls-grade"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(Number(e.target.value))}
              className={inputClass}
            >
              {[5, 6, 7, 8].map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}. Sınıf (Ortaokul)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cls-section" className={labelClass}>
              Şube *
            </label>
            <input
              id="cls-section"
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="A"
              maxLength={10}
              required
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cls-year" className={labelClass}>
              Eğitim Yılı *
            </label>
            <input
              id="cls-year"
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2026-2027"
              maxLength={20}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="cls-focus" className={labelClass}>
              Alan / Odak (İsteğe Bağlı)
            </label>
            <input
              id="cls-focus"
              type="text"
              value={subjectFocus}
              onChange={(e) => setSubjectFocus(e.target.value)}
              placeholder="Sayısal, Eşit Ağırlık vb."
              maxLength={80}
              className={inputClass}
            />
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 disabled:opacity-60 cursor-pointer"
          >
            {saving ? 'Kaydediliyor...' : editingClass ? 'Değişiklikleri Kaydet' : 'Sınıfı Oluştur'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Student Form Modal ---------------- */
interface StudentFormModalProps {
  open: boolean;
  onClose: () => void;
  editingStudent: Student | null;
  classes: SchoolClass[];
  defaultClassId?: string;
  onSubmit: (data: StudentInput) => Promise<void>;
}

export function StudentFormModal({
  open,
  onClose,
  editingStudent,
  classes,
  defaultClassId,
  onSubmit,
}: StudentFormModalProps) {
  const [fullName, setFullName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [classId, setClassId] = useState('');
  const [status, setStatus] = useState<StudentStatus>('active');
  const [guardianNote, setGuardianNote] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingStudent) {
        setFullName(editingStudent.fullName);
        setStudentNumber(editingStudent.studentNumber);
        setClassId(editingStudent.classId);
        setStatus(editingStudent.status);
        setGuardianNote(editingStudent.guardianNote ?? '');
      } else {
        setFullName('');
        setStudentNumber('');
        setClassId(defaultClassId || classes[0]?.id || '');
        setStatus('active');
        setGuardianNote('');
      }
      setError('');
    }
  }, [classes, defaultClassId, editingStudent, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = fullName.trim();
    const trimmedNum = studentNumber.trim();
    const selectedClass = classes.find((c) => c.id === classId);

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setError('Öğrenci adı soyadı 2 ile 100 karakter arasında olmalıdır.');
      return;
    }
    if (trimmedNum.length < 1 || trimmedNum.length > 24) {
      setError('Okul numarası zorunludur.');
      return;
    }
    if (!selectedClass) {
      setError('Lütfen geçerli bir sınıf seçin. Henüz sınıf yoksa önce sınıf oluşturun.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onSubmit({
        classId: selectedClass.id,
        fullName: trimmedName,
        studentNumber: trimmedNum,
        gradeLevel: selectedClass.gradeLevel,
        status,
        guardianNote: guardianNote.trim().slice(0, 400),
      });
      onClose();
    } catch {
      setError('Öğrenci kaydedilirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingStudent ? 'Öğrenci Bilgilerini Düzenle' : 'Yeni Öğrenci Ekle'}
      subtitle="Öğrenci bilgileri yalnızca yetkili öğretmen hesabından görüntülenebilir."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg px-3.5 py-2.5">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="stu-name" className={labelClass}>
            Ad Soyad *
          </label>
          <input
            id="stu-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Örn. Deniz Aksoy"
            maxLength={100}
            required
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="stu-num" className={labelClass}>
              Okul Numarası *
            </label>
            <input
              id="stu-num"
              type="text"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              placeholder="Örn. 1074"
              maxLength={24}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="stu-class" className={labelClass}>
              Sınıf / Şube *
            </label>
            <select
              id="stu-class"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              required
              className={inputClass}
            >
              {classes.length === 0 && <option value="">Önce sınıf oluşturun</option>}
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.gradeLevel}. Sınıf)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="stu-status" className={labelClass}>
            Kayıt Durumu
          </label>
          <select
            id="stu-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as StudentStatus)}
            className={inputClass}
          >
            <option value="active">Aktif Öğrenci</option>
            <option value="inactive">Pasif / Nakil</option>
          </select>
        </div>

        <div>
          <label htmlFor="stu-note" className={labelClass}>
            Pedagojik Gözlem / Rehberlik Notu (İsteğe Bağlı)
          </label>
          <textarea
            id="stu-note"
            rows={3}
            value={guardianNote}
            onChange={(e) => setGuardianNote(e.target.value)}
            placeholder="Çalışma alışkanlığı, ilgi alanları veya desteklenmesi gereken konular..."
            maxLength={400}
            className={inputClass}
          />
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Not: Bu alan yapay zekâ analizine kesinlikle gönderilmez.
          </p>
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={saving || classes.length === 0}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 disabled:opacity-60 cursor-pointer"
          >
            {saving ? 'Kaydediliyor...' : editingStudent ? 'Güncelle' : 'Öğrenciyi Kaydet'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Grade Form Modal ---------------- */
interface GradeFormModalProps {
  open: boolean;
  onClose: () => void;
  editingGrade: Grade | null;
  students: Student[];
  lockedStudentId?: string;
  onSubmit: (data: GradeInput) => Promise<void>;
}

export function GradeFormModal({
  open,
  onClose,
  editingGrade,
  students,
  lockedStudentId,
  onSubmit,
}: GradeFormModalProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [studentId, setStudentId] = useState('');
  const [subjectName, setSubjectName] = useState(DEFAULT_SUBJECT_NAMES[0]);
  const [examTitle, setExamTitle] = useState('');
  const [examType, setExamType] = useState<ExamType>('Yazılı');
  const [examDate, setExamDate] = useState(today);
  const [score, setScore] = useState('80');
  const [maxScore, setMaxScore] = useState('100');
  const [teacherNote, setTeacherNote] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingGrade) {
        setStudentId(editingGrade.studentId);
        setSubjectName(editingGrade.subjectName);
        setExamTitle(editingGrade.examTitle);
        setExamType(editingGrade.examType);
        setExamDate(editingGrade.examDate);
        setScore(String(editingGrade.score));
        setMaxScore(String(editingGrade.maxScore));
        setTeacherNote(editingGrade.teacherNote ?? '');
      } else {
        setStudentId(lockedStudentId || students[0]?.id || '');
        setSubjectName(DEFAULT_SUBJECT_NAMES[0]);
        setExamTitle('');
        setExamType('Yazılı');
        setExamDate(today);
        setScore('80');
        setMaxScore('100');
        setTeacherNote('');
      }
      setError('');
    }
  }, [editingGrade, lockedStudentId, open, students, today]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const stu = students.find((s) => s.id === studentId);
    const numScore = Number(score);
    const numMax = Number(maxScore);

    if (!stu) {
      setError('Lütfen bir öğrenci seçin.');
      return;
    }
    if (subjectName.trim().length < 2) {
      setError('Ders adı en az 2 karakter olmalıdır.');
      return;
    }
    if (examTitle.trim().length < 2) {
      setError('Sınav başlığı en az 2 karakter olmalıdır.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(examDate)) {
      setError('Geçerli bir sınav tarihi seçin.');
      return;
    }
    if (!Number.isFinite(numMax) || numMax < 1 || numMax > 100) {
      setError('Azami puan 1 ile 100 arasında olmalıdır.');
      return;
    }
    if (!Number.isFinite(numScore) || numScore < 0 || numScore > numMax) {
      setError(`Not 0 ile ${numMax} arasında olmalıdır.`);
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onSubmit({
        studentId: stu.id,
        classId: stu.classId,
        subjectName: subjectName.trim().slice(0, 80),
        examTitle: examTitle.trim().slice(0, 120),
        examType,
        examDate,
        score: numScore,
        maxScore: numMax,
        teacherNote: teacherNote.trim().slice(0, 300),
      });
      onClose();
    } catch {
      setError('Sınav notu kaydedilirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingGrade ? 'Sınav Notunu Düzenle' : 'Yeni Sınav Notu Kaydet'}
      subtitle="Yazılı, deneme, sözlü veya proje değerlendirmesi girin."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg px-3.5 py-2.5">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="grd-student" className={labelClass}>
            Öğrenci *
          </label>
          <select
            id="grd-student"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            disabled={Boolean(lockedStudentId || editingGrade)}
            className={inputClass}
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName} (No: {s.studentNumber})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="grd-subject" className={labelClass}>
              Ders *
            </label>
            <select
              id="grd-subject"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className={inputClass}
            >
              {DEFAULT_SUBJECT_NAMES.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="grd-type" className={labelClass}>
              Sınav Türü *
            </label>
            <select
              id="grd-type"
              value={examType}
              onChange={(e) => setExamType(e.target.value as ExamType)}
              className={inputClass}
            >
              {EXAM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="grd-title" className={labelClass}>
            Sınav / Değerlendirme Adı *
          </label>
          <input
            id="grd-title"
            type="text"
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
            placeholder="Örn. 1. Dönem 2. Yazılı"
            maxLength={120}
            required
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="grd-date" className={labelClass}>
              Tarih *
            </label>
            <input
              id="grd-date"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="grd-score" className={labelClass}>
              Alınan Puan *
            </label>
            <input
              id="grd-score"
              type="number"
              min={0}
              max={100}
              step="0.5"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              required
              className={`${inputClass} font-mono tabular-nums`}
            />
          </div>
          <div>
            <label htmlFor="grd-max" className={labelClass}>
              Tam Puan *
            </label>
            <input
              id="grd-max"
              type="number"
              min={1}
              max={100}
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              required
              className={`${inputClass} font-mono tabular-nums`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="grd-note" className={labelClass}>
            Öğretmen Değerlendirme Notu (İsteğe Bağlı)
          </label>
          <input
            id="grd-note"
            type="text"
            value={teacherNote}
            onChange={(e) => setTeacherNote(e.target.value)}
            placeholder="Örn. Problem kurma aşamasında belirgin ilerleme var."
            maxLength={300}
            className={inputClass}
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={saving || students.length === 0}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 disabled:opacity-60 cursor-pointer"
          >
            {saving ? 'Kaydediliyor...' : editingGrade ? 'Notu Güncelle' : 'Notu Kaydet'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Attendance Form Modal ---------------- */
interface AttendanceFormModalProps {
  open: boolean;
  onClose: () => void;
  students: Student[];
  lockedStudentId?: string;
  onSubmit: (data: AttendanceInput) => Promise<void>;
}

export function AttendanceFormModal({
  open,
  onClose,
  students,
  lockedStudentId,
  onSubmit,
}: AttendanceFormModalProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState(today);
  const [status, setStatus] = useState<AttendanceStatus>('unexcused');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setStudentId(lockedStudentId || students[0]?.id || '');
      setDate(today);
      setStatus('present');
      setReason('');
      setError('');
    }
  }, [lockedStudentId, open, students, today]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const stu = students.find((s) => s.id === studentId);
    if (!stu) {
      setError('Lütfen bir öğrenci seçin.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError('Geçerli bir tarih seçin.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onSubmit({
        studentId: stu.id,
        classId: stu.classId,
        date,
        status,
        reason: reason.trim().slice(0, 240),
      });
      onClose();
    } catch {
      setError('Yoklama kaydı eklenirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Günlük Devam / Devamsızlık Kaydı"
      subtitle="Katılım, mazeretli veya mazeretsiz devamsızlık bilgisini işleyin."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg px-3.5 py-2.5">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="att-student" className={labelClass}>
            Öğrenci *
          </label>
          <select
            id="att-student"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            disabled={Boolean(lockedStudentId)}
            className={inputClass}
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName} (No: {s.studentNumber})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="att-date" className={labelClass}>
              Tarih *
            </label>
            <input
              id="att-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="att-status" className={labelClass}>
              Devam Durumu *
            </label>
            <select
              id="att-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
              className={inputClass}
            >
              <option value="present">Katıldı</option>
              <option value="excused">Mazeretli Devamsızlık</option>
              <option value="unexcused">Mazeretsiz Devamsızlık</option>
              <option value="late">Geç Kaldı</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="att-reason" className={labelClass}>
            Açıklama / Mazeret (İsteğe Bağlı)
          </label>
          <input
            id="att-reason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Örn. Sağlık raporu, veli dilekçesi, olimpiyat görevi..."
            maxLength={240}
            className={inputClass}
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={saving || students.length === 0}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 disabled:opacity-60 cursor-pointer"
          >
            {saving ? 'Kaydediliyor...' : 'Yoklamayı Kaydet'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
