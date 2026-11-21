import {
  collection,
  doc,
  getDocFromServer,
  getDocsFromServer,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  ExamArchiveState,
  ExamMeta,
  SUBJECT_LIST,
  SubjectKey,
  StudentExamRecord,
  StudentProfile,
} from '../types/exam';

// Blueprint maxLength & volumetric constants (synchronized with firebase-blueprint.json & firestore.rules)
const MAX_ID_LEN = 128;
const MAX_DISPLAY_NAME_LEN = 120;
const MAX_EXAM_NAME_LEN = 200;
const MAX_FILE_NAME_LEN = 260;
const MAX_SCHOOL_NAME_LEN = 200;
const MAX_LOCATION_LEN = 200;
const MAX_EXAM_DATE_LEN = 40;
const MAX_UPLOADED_AT_LEN = 64;
const MAX_NUMARA_LEN = 40;
const MAX_STUDENT_NAME_LEN = 160;
const MAX_SINIF_LEN = 40;
const MAX_EXAMS_PER_STUDENT = 100;
const VALID_ID_REGEX = /^[a-zA-Z0-9_-]+$/;
const MAX_BATCH_OPS = 400;

export interface CloudSyncManifest {
  uid: string;
  hasRootDoc: boolean;
  examHashes: Map<string, string>;
  studentHashes: Map<string, string>;
}

export function createEmptyManifest(uid: string): CloudSyncManifest {
  return {
    uid,
    hasRootDoc: false,
    examHashes: new Map(),
    studentHashes: new Map(),
  };
}

function clampString(val: unknown, maxLen: number, fallback = ''): string {
  const s = typeof val === 'string' ? val.trim() : fallback;
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function finiteNumber(val: unknown, min: number, max: number, fallback = 0): number {
  const n = typeof val === 'number' && Number.isFinite(val) ? val : fallback;
  return Math.max(min, Math.min(max, n));
}

function simpleHash(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

/**
 * Guarantees every Firestore document ID strictly matches ^[a-zA-Z0-9_\-]+$ and <= 128 chars.
 */
export function sanitizeFirestoreId(rawId: string, prefix = 'rec'): string {
  const cleaned = (rawId || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (cleaned.length >= 1 && cleaned.length <= MAX_ID_LEN && VALID_ID_REGEX.test(cleaned)) {
    return cleaned;
  }

  const suffix = simpleHash(rawId || `${prefix}_${Date.now()}`);
  const base = cleaned.slice(0, MAX_ID_LEN - prefix.length - suffix.length - 2);
  const candidate = base ? `${prefix}_${base}_${suffix}` : `${prefix}_${suffix}`;
  return candidate.slice(0, MAX_ID_LEN);
}

/**
 * Recursively removes `undefined` properties and non-finite numbers so Firestore never rejects writes.
 */
function stripUndefinedDeep<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (typeof value === 'number') {
    return (Number.isFinite(value) ? value : 0) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => stripUndefinedDeep(item)) as unknown as T;
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) {
        out[k] = stripUndefinedDeep(v);
      }
    }
    return out as T;
  }
  return value;
}

function sanitizeSubjectNetMap(
  raw?: Partial<Record<SubjectKey, number>>
): Partial<Record<SubjectKey, number>> | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const out: Partial<Record<SubjectKey, number>> = {};
  let hasAny = false;
  for (const s of SUBJECT_LIST) {
    const val = raw[s.key];
    if (typeof val === 'number' && Number.isFinite(val)) {
      out[s.key] = Math.round(val * 100) / 100;
      hasAny = true;
    }
  }
  return hasAny ? out : undefined;
}

function buildSanitizedExamFields(exam: ExamMeta, safeId: string): Record<string, unknown> {
  const fields: Record<string, unknown> = {
    name: clampString(exam.name, MAX_EXAM_NAME_LEN, 'Deneme Sınavı') || 'Deneme Sınavı',
    fileName: clampString(exam.fileName, MAX_FILE_NAME_LEN, 'deneme.pdf') || 'deneme.pdf',
    schoolName: clampString(exam.schoolName, MAX_SCHOOL_NAME_LEN, ''),
    location: clampString(exam.location, MAX_LOCATION_LEN, ''),
    examDate: clampString(exam.examDate, MAX_EXAM_DATE_LEN, ''),
    uploadedAt: clampString(exam.uploadedAt, MAX_UPLOADED_AT_LEN, new Date().toISOString()),
    examOrder: finiteNumber(exam.examOrder, 0, 10000, 1),
    studentCount: Math.round(finiteNumber(exam.studentCount, 0, 5000, 0)),
  };

  if (typeof exam.isSample === 'boolean') {
    fields.isSample = exam.isSample;
  }
  if (typeof exam.schoolAvgLgs === 'number' && Number.isFinite(exam.schoolAvgLgs)) {
    fields.schoolAvgLgs = finiteNumber(exam.schoolAvgLgs, 0, 600);
  }
  if (typeof exam.generalAvgLgs === 'number' && Number.isFinite(exam.generalAvgLgs)) {
    fields.generalAvgLgs = finiteNumber(exam.generalAvgLgs, 0, 600);
  }
  if (typeof exam.schoolAvgToplamNet === 'number' && Number.isFinite(exam.schoolAvgToplamNet)) {
    fields.schoolAvgToplamNet = finiteNumber(exam.schoolAvgToplamNet, -30, 90);
  }
  if (typeof exam.generalAvgToplamNet === 'number' && Number.isFinite(exam.generalAvgToplamNet)) {
    fields.generalAvgToplamNet = finiteNumber(exam.generalAvgToplamNet, -30, 90);
  }

  const schoolNets = sanitizeSubjectNetMap(exam.schoolSubjectNets);
  if (schoolNets) fields.schoolSubjectNets = schoolNets;

  const generalNets = sanitizeSubjectNetMap(exam.generalSubjectNets);
  if (generalNets) fields.generalSubjectNets = generalNets;

  // Keep reference to safeId only when needed by caller
  void safeId;
  return fields;
}

function sanitizeStudentExamRecord(
  rec: StudentExamRecord,
  examIdMap: Map<string, string>
): StudentExamRecord {
  const mappedExamId = examIdMap.get(rec.examId) ?? sanitizeFirestoreId(rec.examId, 'exam');
  return stripUndefinedDeep({
    ...rec,
    examId: mappedExamId,
    examName: clampString(rec.examName, MAX_EXAM_NAME_LEN, 'Deneme Sınavı') || 'Deneme Sınavı',
    examDate: clampString(rec.examDate, MAX_EXAM_DATE_LEN, ''),
    uploadedAt: clampString(rec.uploadedAt, MAX_UPLOADED_AT_LEN, ''),
    examOrder: finiteNumber(rec.examOrder, 0, 10000, 1),
    lgsPuan: finiteNumber(rec.lgsPuan, 0, 600, 0),
    kazanimlar: Array.isArray(rec.kazanimlar) ? rec.kazanimlar.slice(0, 120) : [],
  });
}

function buildSanitizedStudentFields(
  student: StudentProfile,
  examIdMap: Map<string, string>
): Record<string, unknown> {
  const safeExams = (student.exams || [])
    .slice(0, MAX_EXAMS_PER_STUDENT)
    .map((ex) => sanitizeStudentExamRecord(ex, examIdMap));

  return {
    numara: clampString(student.numara, MAX_NUMARA_LEN, '0'),
    name: clampString(student.name, MAX_STUDENT_NAME_LEN, 'Öğrenci') || 'Öğrenci',
    sinif: clampString(student.sinif, MAX_SINIF_LEN, '8-A') || '8-A',
    exams: safeExams,
  };
}

export interface CloudLoadResult {
  exists: boolean;
  archive: ExamArchiveState;
  lastBackupAt: Date | null;
  manifest: CloudSyncManifest;
}

export async function loadArchiveFromCloud(uid: string): Promise<CloudLoadResult> {
  const safeUid = sanitizeFirestoreId(uid, 'u');

  const manifest = createEmptyManifest(safeUid);
  let lastBackupAt: Date | null = null;

  const rootSnap = await getDocFromServer(doc(db, 'users', safeUid));
  if (!rootSnap.exists()) {
    return {
      exists: false,
      archive: { exams: [], students: [] },
      lastBackupAt: null,
      manifest,
    };
  }

  manifest.hasRootDoc = true;
  const rootData = rootSnap.data();
  if (rootData?.lastBackupAt instanceof Timestamp) {
    lastBackupAt = rootData.lastBackupAt.toDate();
  }

  const exams: ExamMeta[] = [];
  const students: StudentProfile[] = [];

  const examsQuery = query(
    collection(db, 'users', safeUid, 'exams'),
    where('ownerId', '==', safeUid)
  );
  const examsSnap = await getDocsFromServer(examsQuery);
  for (const d of examsSnap.docs) {
    const data = d.data();
    const exam: ExamMeta = {
      id: String(data.id || d.id),
      name: String(data.name || 'Deneme Sınavı'),
      fileName: String(data.fileName || 'deneme.pdf'),
      schoolName: String(data.schoolName || ''),
      location: String(data.location || ''),
      examDate: String(data.examDate || ''),
      uploadedAt: String(data.uploadedAt || ''),
      examOrder: Number(data.examOrder || 1),
      studentCount: Number(data.studentCount || 0),
      ...(typeof data.isSample === 'boolean' ? { isSample: data.isSample } : {}),
      ...(typeof data.schoolAvgLgs === 'number' ? { schoolAvgLgs: data.schoolAvgLgs } : {}),
      ...(typeof data.generalAvgLgs === 'number' ? { generalAvgLgs: data.generalAvgLgs } : {}),
      ...(typeof data.schoolAvgToplamNet === 'number'
        ? { schoolAvgToplamNet: data.schoolAvgToplamNet }
        : {}),
      ...(typeof data.generalAvgToplamNet === 'number'
        ? { generalAvgToplamNet: data.generalAvgToplamNet }
        : {}),
      ...(data.schoolSubjectNets ? { schoolSubjectNets: data.schoolSubjectNets } : {}),
      ...(data.generalSubjectNets ? { generalSubjectNets: data.generalSubjectNets } : {}),
    };
    exams.push(exam);
    const fields = buildSanitizedExamFields(exam, exam.id);
    manifest.examHashes.set(exam.id, simpleHash(JSON.stringify(fields)));
  }

  const studentsQuery = query(
    collection(db, 'users', safeUid, 'students'),
    where('ownerId', '==', safeUid)
  );
  const studentsSnap = await getDocsFromServer(studentsQuery);
  const examIdMap = new Map<string, string>(exams.map((e) => [e.id, e.id]));

  for (const d of studentsSnap.docs) {
    const data = d.data();
    const student: StudentProfile = {
      id: String(data.id || d.id),
      numara: String(data.numara || '0'),
      name: String(data.name || 'Öğrenci'),
      sinif: String(data.sinif || '8-A'),
      exams: Array.isArray(data.exams) ? (data.exams as StudentExamRecord[]) : [],
    };
    students.push(student);
    const fields = buildSanitizedStudentFields(student, examIdMap);
    manifest.studentHashes.set(student.id, simpleHash(JSON.stringify(fields)));
  }

  exams.sort((a, b) => a.examOrder - b.examOrder);

  return {
    exists: true,
    archive: { exams, students },
    lastBackupAt,
    manifest,
  };
}

export interface CloudSyncResult {
  writtenDocs: number;
  syncedAt: Date;
  manifest: CloudSyncManifest;
}

/**
 * Syncs the full ExamArchiveState to Firestore using minimal diff batched writes.
 * Strictly obeys firestore.rules:
 *  - Creates parent /users/{uid} first so Master Gate parentArchiveOwnedBy(uid) always passes.
 *  - Uses `set` (with createdAt + updatedAt) for new documents and `update` (preserving createdAt) for existing documents.
 *  - Retains remote records missing from the local snapshot.
 */
export async function syncArchiveToCloud(
  uid: string,
  displayName: string,
  archive: ExamArchiveState,
  currentManifest: CloudSyncManifest | null,
  options?: { forceFull?: boolean }
): Promise<CloudSyncResult> {
  if (archive.exams.length > 500 || archive.students.length > 5000 ||
    archive.students.some((student) => student.exams.length > MAX_EXAMS_PER_STUDENT)) {
    throw new Error('Arşiv Firebase yedek sınırını aşıyor. Tam arşivi JSON olarak indirebilirsiniz.');
  }
  const safeUid = sanitizeFirestoreId(uid, 'u');
  const safeDisplayName = clampString(displayName, MAX_DISPLAY_NAME_LEN, 'Kullanıcı');
  const rootRef = doc(db, 'users', safeUid);

  let manifest: CloudSyncManifest;
  if (currentManifest && currentManifest.uid === safeUid) {
    manifest = {
      uid: safeUid,
      hasRootDoc: currentManifest.hasRootDoc,
      examHashes: new Map(currentManifest.examHashes),
      studentHashes: new Map(currentManifest.studentHashes),
    };
  } else {
    // Hydrate remote IDs once so we never call setDoc on an already existing doc (which would violate createdAt immutability)
    const remote = await loadArchiveFromCloud(safeUid);
    manifest = remote.manifest;
  }

  // Step 1: Ensure parent root document exists before writing any subcollection documents (Master Gate)
  if (!manifest.hasRootDoc) {
    await setDoc(rootRef, {
      ownerId: safeUid,
      displayName: safeDisplayName,
      examCount: Math.min(500, archive.exams.length),
      studentCount: Math.min(5000, archive.students.length),
      lastBackupAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    manifest.hasRootDoc = true;
  }

  // Build deterministic sanitized IDs for exams
  const examIdMap = new Map<string, string>();
  const usedExamIds = new Set<string>();
  const sanitizedExams: Array<{ id: string; fields: Record<string, unknown>; hash: string }> = [];

  for (const ex of archive.exams.slice(0, 500)) {
    let safeId = sanitizeFirestoreId(ex.id, 'exam');
    while (usedExamIds.has(safeId)) {
      safeId = sanitizeFirestoreId(`${safeId}_${usedExamIds.size}`, 'exam');
    }
    usedExamIds.add(safeId);
    examIdMap.set(ex.id, safeId);

    const fields = buildSanitizedExamFields(ex, safeId);
    const hash = simpleHash(JSON.stringify(fields));
    sanitizedExams.push({ id: safeId, fields, hash });
  }

  // Build deterministic sanitized IDs for students
  const usedStudentIds = new Set<string>();
  const sanitizedStudents: Array<{ id: string; fields: Record<string, unknown>; hash: string }> = [];

  for (const st of archive.students.slice(0, 5000)) {
    let safeId = sanitizeFirestoreId(st.id, 'stu');
    while (usedStudentIds.has(safeId)) {
      safeId = sanitizeFirestoreId(`${safeId}_${usedStudentIds.size}`, 'stu');
    }
    usedStudentIds.add(safeId);

    const fields = buildSanitizedStudentFields(st, examIdMap);
    const hash = simpleHash(JSON.stringify(fields));
    sanitizedStudents.push({ id: safeId, fields, hash });
  }

  type BatchOp =
    | { kind: 'set'; ref: ReturnType<typeof doc>; data: Record<string, unknown> }
    | { kind: 'update'; ref: ReturnType<typeof doc>; data: Record<string, unknown> };

  const ops: BatchOp[] = [];
  const nextExamHashes = new Map<string, string>();
  const nextStudentHashes = new Map<string, string>();
  let writtenDocs = 0;

  // Diff exams
  for (const ex of sanitizedExams) {
    nextExamHashes.set(ex.id, ex.hash);
    const prevHash = manifest.examHashes.get(ex.id);
    const ref = doc(db, 'users', safeUid, 'exams', ex.id);

    if (prevHash === undefined) {
      ops.push({
        kind: 'set',
        ref,
        data: {
          id: ex.id,
          ownerId: safeUid,
          ...ex.fields,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
      });
      writtenDocs += 1;
    } else if (options?.forceFull || prevHash !== ex.hash) {
      ops.push({
        kind: 'update',
        ref,
        data: {
          ...ex.fields,
          updatedAt: serverTimestamp(),
        },
      });
      writtenDocs += 1;
    }
  }

  // Diff students
  for (const st of sanitizedStudents) {
    nextStudentHashes.set(st.id, st.hash);
    const prevHash = manifest.studentHashes.get(st.id);
    const ref = doc(db, 'users', safeUid, 'students', st.id);

    if (prevHash === undefined) {
      ops.push({
        kind: 'set',
        ref,
        data: {
          id: st.id,
          ownerId: safeUid,
          ...st.fields,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
      });
      writtenDocs += 1;
    } else if (options?.forceFull || prevHash !== st.hash) {
      ops.push({
        kind: 'update',
        ref,
        data: {
          ...st.fields,
          updatedAt: serverTimestamp(),
        },
      });
      writtenDocs += 1;
    }
  }

  // Commit in chunks of MAX_BATCH_OPS
  for (let i = 0; i < ops.length; i += MAX_BATCH_OPS) {
    const chunk = ops.slice(i, i + MAX_BATCH_OPS);
    const batch = writeBatch(db);
    for (const op of chunk) {
      if (op.kind === 'set') {
        batch.set(op.ref, op.data);
      } else {
        batch.update(op.ref, op.data);
      }
    }
    await batch.commit();
  }

  // Always refresh root archive timestamp & counts on backup completion
  await updateDoc(rootRef, {
    displayName: safeDisplayName,
    examCount: Math.min(500, sanitizedExams.length),
    studentCount: Math.min(5000, sanitizedStudents.length),
    lastBackupAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  manifest.examHashes = nextExamHashes;
  manifest.studentHashes = nextStudentHashes;

  return {
    writtenDocs,
    syncedAt: new Date(),
    manifest,
  };
}

/** Keep every backed-up record and prefer the chosen source when a record exists in both. */
export function mergeArchives(preferred: ExamArchiveState, fallback: ExamArchiveState): ExamArchiveState {
  const exams = new Map(fallback.exams.map((exam) => [exam.id, exam]));
  preferred.exams.forEach((exam) => exams.set(exam.id, exam));

  const students = new Map(fallback.students.map((student) => [student.id, student]));
  for (const student of preferred.students) {
    const previous = students.get(student.id);
    const records = new Map(previous?.exams.map((record) => [record.examId, record]) ?? []);
    student.exams.forEach((record) => records.set(record.examId, record));
    students.set(student.id, { ...student, exams: [...records.values()] });
  }

  return {
    exams: [...exams.values()].sort((a, b) => a.examOrder - b.examOrder || a.examDate.localeCompare(b.examDate)),
    students: [...students.values()],
  };
}
