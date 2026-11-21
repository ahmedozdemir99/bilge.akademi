import {
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from 'firebase/firestore/lite';
import { db, legacyDb } from '../firebase';
import { auth } from '../../lib/firebase';
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
const MAX_BATCH_OPS = 8;

function requireOwner(uid: string) {
  if (auth.currentUser?.uid !== uid || !auth.currentUser.emailVerified) {
    throw new Error('Firebase yedeği için doğrulanmış hesabınızla giriş yapın.');
  }
}

export interface CloudSyncManifest {
  uid: string;
  examHashes: Map<string, string>;
  studentHashes: Map<string, string>;
}

export function createEmptyManifest(uid: string): CloudSyncManifest {
  return {
    uid,
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

function recordFingerprint(value: unknown): string {
  return JSON.stringify(value, (_key, item: unknown) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return item;
    return Object.fromEntries(Object.entries(item).sort(([left], [right]) => left < right ? -1 : Number(left !== right)));
  });
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
    kazanimlar: Array.isArray(rec.kazanimlar) ? rec.kazanimlar : [],
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
  requireOwner(uid);
  const main = await readArchive(uid, db, 'denemeArchives');
  const legacy = await Promise.all([
    readArchive(uid, legacyDb, 'denemeArchives'),
    readArchive(uid, legacyDb, 'users'),
  ].map(async (request) => {
    try {
      return (await request).archive;
    } catch (error) {
      const code = (error as { code?: string } | null)?.code;
      if (code === 'permission-denied' || code === 'not-found') return { exams: [], students: [] };
      throw error;
    }
  }));
  requireOwner(uid);
  const archive = mergeArchives(main.archive, mergeArchives(legacy[0], legacy[1]));
  return { ...main, exists: main.exists || archive.exams.length > 0, archive };
}

async function readArchive(safeUid: string, database: typeof db, root: 'denemeArchives' | 'users'): Promise<CloudLoadResult> {
  const manifest = createEmptyManifest(safeUid);
  let lastBackupAt: Date | null = null;
  const [rootSnap, examsSnap, studentsSnap] = await Promise.all([
    root === 'denemeArchives' ? getDoc(doc(database, root, safeUid)) : Promise.resolve(null),
    getDocs(query(collection(database, root, safeUid, 'exams'), where('ownerId', '==', safeUid))),
    getDocs(query(collection(database, root, safeUid, 'students'), where('ownerId', '==', safeUid))),
  ]);
  const rootData = rootSnap?.data();
  if (rootData?.lastBackupAt instanceof Timestamp) {
    lastBackupAt = rootData.lastBackupAt.toDate();
  }
  const exams: ExamMeta[] = [];
  const students: StudentProfile[] = [];
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
    manifest.examHashes.set(exam.id, recordFingerprint(fields));
  }

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
    manifest.studentHashes.set(student.id, recordFingerprint(fields));
  }

  exams.sort((a, b) => a.examOrder - b.examOrder);

  return {
    exists: Boolean(rootSnap?.exists()) || exams.length > 0 || students.length > 0,
    archive: { exams, students },
    lastBackupAt,
    manifest,
  };
}

export interface CloudSyncResult {
  writtenDocs: number;
  syncedAt: Date;
}

/**
 * Syncs the full ExamArchiveState to Firestore using bounded transactions.
 * Strictly obeys firestore.rules:
 *  - Uses dedicated /denemeArchives/{uid} documents, separate from user profiles.
 *  - Uses `set` (with createdAt + updatedAt) for new documents and `update` (preserving createdAt) for existing documents.
 *  - Retains remote records missing from the local snapshot.
 */
export async function syncArchiveToCloud(
  uid: string,
  displayName: string,
  archive: ExamArchiveState,
  currentManifest: CloudSyncManifest | null,
  options?: { forceFull?: boolean; onProgress?: (completed: number, total: number) => void }
): Promise<CloudSyncResult> {
  if (archive.exams.length > 500 || archive.students.length > 5000 ||
    archive.students.some((student) => student.exams.length > MAX_EXAMS_PER_STUDENT)) {
    throw new Error('Arşiv Firebase yedek sınırını aşıyor. Tam arşivi JSON olarak indirebilirsiniz.');
  }
  requireOwner(uid);
  const safeUid = uid;
  const safeDisplayName = clampString(displayName, MAX_DISPLAY_NAME_LEN, 'Kullanıcı');
  const rootRef = doc(db, 'denemeArchives', safeUid);

  const manifest = currentManifest?.uid === uid
    ? currentManifest
    : (await loadArchiveFromCloud(uid)).manifest;

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
    const hash = recordFingerprint(fields);
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
    const hash = recordFingerprint(fields);
    sanitizedStudents.push({ id: safeId, fields, hash });
  }

  const examChanges = sanitizedExams.filter(({ id, hash }) => options?.forceFull || manifest.examHashes.get(id) !== hash);
  const studentChanges = sanitizedStudents.filter(({ id, hash }) => options?.forceFull || manifest.studentHashes.get(id) !== hash);
  const ops = [
    ...examChanges.map(({ id, fields }) => ({ group: 'exams', id, fields })),
    ...studentChanges.map(({ id, fields }) => ({ group: 'students', id, fields })),
  ];

  options?.onProgress?.(0, ops.length + 1);
  for (let offset = 0; offset < ops.length; offset += MAX_BATCH_OPS) {
    const chunk = ops.slice(offset, offset + MAX_BATCH_OPS);
    await runTransaction(db, async (transaction) => {
      requireOwner(uid);
      const refs = chunk.map(({ group, id }) => doc(db, 'denemeArchives', uid, group, id));
      const snapshots = await Promise.all(refs.map((ref) => transaction.get(ref)));
      requireOwner(uid);
      chunk.forEach(({ group, id, fields }, index) => {
        const snapshot = snapshots[index];
        const data = { ...fields };
        if (group === 'students' && snapshot.exists()) {
          const previous = snapshot.data().exams as StudentExamRecord[] | undefined;
          const records = new Map(previous?.map((record) => [record.examId, record]));
          for (const record of fields.exams as StudentExamRecord[]) records.set(record.examId, record);
          if (records.size > MAX_EXAMS_PER_STUDENT) {
            throw new Error('Bir öğrencinin deneme sayısı Firebase yedek sınırını aşıyor. Arşivi JSON olarak indirebilirsiniz.');
          }
          data.exams = [...records.values()];
        }
        if (snapshot.exists()) {
          transaction.update(refs[index], { ...data, updatedAt: serverTimestamp() });
        } else {
          transaction.set(refs[index], { ...data, id, ownerId: uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        }
      });
    });
    options?.onProgress?.(offset + chunk.length, ops.length + 1);
  }

  await runTransaction(db, async (transaction) => {
    requireOwner(uid);
    const root = await transaction.get(rootRef);
    requireOwner(uid);
    const data = {
      displayName: safeDisplayName,
      examCount: sanitizedExams.length,
      studentCount: sanitizedStudents.length,
      lastBackupAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (root.exists()) transaction.update(rootRef, data);
    else transaction.set(rootRef, { ...data, ownerId: uid, createdAt: serverTimestamp() });
  });
  options?.onProgress?.(ops.length + 1, ops.length + 1);

  return {
    writtenDocs: ops.length,
    syncedAt: new Date(),
  };
}

function legacyIds<T extends { id: string }>(preferred: T[], fallback: T[], prefix: string) {
  const exact = new Set(preferred.map(({ id }) => id));
  const saved = new Set(fallback.map(({ id }) => id));
  const aliases = new Map<string, string>();
  const counts = new Map<string, number>();
  for (const { id } of preferred) {
    const alias = sanitizeFirestoreId(id, prefix);
    aliases.set(id, alias);
    counts.set(alias, (counts.get(alias) ?? 0) + 1);
  }
  return new Map([...aliases].map(([id, alias]) => [
    id,
    !exact.has(alias) && saved.has(alias) && counts.get(alias) === 1 ? alias : id,
  ]));
}

/** Keep every backed-up record and prefer the chosen source when a record exists in both. */
export function mergeArchives(preferred: ExamArchiveState, fallback: ExamArchiveState): ExamArchiveState {
  const examIds = legacyIds(preferred.exams, fallback.exams, 'exam');
  const exams = new Map(fallback.exams.map((exam) => [exam.id, exam]));
  preferred.exams.forEach((exam) => {
    const id = examIds.get(exam.id) ?? exam.id;
    exams.set(id, { ...exam, id });
  });

  const studentIds = legacyIds(preferred.students, fallback.students, 'stu');
  const students = new Map(fallback.students.map((student) => [student.id, student]));
  for (const student of preferred.students) {
    const id = studentIds.get(student.id) ?? student.id;
    const previous = students.get(id);
    const records = new Map(previous?.exams.map((record) => [record.examId, record]) ?? []);
    student.exams.forEach((record) => {
      const examId = examIds.get(record.examId) ?? record.examId;
      records.set(examId, { ...record, examId });
    });
    students.set(id, { ...student, id, exams: [...records.values()] });
  }

  return {
    exams: [...exams.values()].sort((a, b) => a.examOrder - b.examOrder || a.examDate.localeCompare(b.examDate)),
    students: [...students.values()],
  };
}
