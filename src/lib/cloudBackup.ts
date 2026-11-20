import { collection, doc, getDocs, query, serverTimestamp, runTransaction, where } from 'firebase/firestore';
import { db } from './firebase';
import {
  DEMO_ATTENDANCE, DEMO_CLASSES, DEMO_GRADES, DEMO_MATH_ATTEMPTS,
  DEMO_POEMS, DEMO_PRACTICE_EXAMS, DEMO_QUIZ_ATTEMPTS, DEMO_STUDENTS,
} from '../data/demoData';

const STORAGE_KEY = 'bilge_akademi_demo_v2';
const COLLECTIONS = ['classes', 'students', 'grades', 'attendance', 'practiceExams', 'poems', 'quizAttempts', 'mathAttempts', 'aiConversations'] as const;
type CollectionName = typeof COLLECTIONS[number];
type RecordData = { id: string; [key: string]: unknown };
type Archive = Record<CollectionName, RecordData[]>;
const seeds: Partial<Record<CollectionName, { id: string }[]>> = {
  classes: DEMO_CLASSES, students: DEMO_STUDENTS, grades: DEMO_GRADES,
  attendance: DEMO_ATTENDANCE, practiceExams: DEMO_PRACTICE_EXAMS,
  poems: DEMO_POEMS, quizAttempts: DEMO_QUIZ_ATTEMPTS, mathAttempts: DEMO_MATH_ATTEMPTS,
};

function readLocal(): Archive {
  const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Yerel kayıt biçimi geçersiz.');
  const source = parsed as Record<string, unknown>;
  return Object.fromEntries(COLLECTIONS.map(name => [
    name,
    Array.isArray(source[name]) ? source[name].filter((item): item is RecordData =>
      item !== null && typeof item === 'object' && typeof item.id === 'string' && /^[a-zA-Z0-9_-]+$/.test(item.id)
    ) : [],
  ])) as Archive;
}

async function readCloud(uid: string): Promise<Archive> {
  const result = {} as Archive;
  for (const name of COLLECTIONS) {
    const field = ['classes', 'students', 'grades', 'attendance', 'practiceExams'].includes(name) ? 'teacherId' : 'ownerId';
    const snapshot = await getDocs(query(collection(db, name), where(field, '==', uid)));
    result[name] = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
  }
  return result;
}

/** Never overwrite existing Firestore documents. Demo starter records are not uploaded. */
export async function uploadLocalToCloud(uid: string): Promise<number> {
  if (!uid) throw new Error('Google hesabıyla giriş yapın.');
  const local = readLocal();
  const cloud = await readCloud(uid);
  const existing = Object.fromEntries(COLLECTIONS.map(name => [name, new Set(cloud[name].map(r => r.id))])) as Record<CollectionName, Set<string>>;
  const uploaded = Object.fromEntries(COLLECTIONS.map(name => [name, new Set(existing[name])])) as Record<CollectionName, Set<string>>;
  const pending = {} as Archive;
  for (const name of COLLECTIONS) {
    const starterIds = new Set((seeds[name] || []).map(x => x.id));
    pending[name] = local[name].filter(r => !starterIds.has(r.id) && !existing[name].has(r.id));
    for (const r of pending[name]) uploaded[name].add(r.id);
  }
  // A record must never be uploaded without its parent. Existing cloud data remains authoritative.
  for (const name of COLLECTIONS) {
    pending[name] = pending[name].filter(r =>
      (!('classId' in r) || (typeof r.classId === 'string' && uploaded.classes.has(r.classId))) &&
      (!('studentId' in r) || (typeof r.studentId === 'string' && uploaded.students.has(r.studentId)))
    );
  }
  let count = 0;
  for (const name of COLLECTIONS) {
    const ownerField = ['classes', 'students', 'grades', 'attendance', 'practiceExams'].includes(name) ? 'teacherId' : 'ownerId';
    for (const record of pending[name]) {
      const { id, isDemo, createdAt, updatedAt, teacherId, ownerId, ...fields } = record;
      const ref = doc(db, name, id);
      const created = await runTransaction(db, async transaction => {
        if ((await transaction.get(ref)).exists()) return false;
        transaction.set(ref, {
          ...fields, [ownerField]: uid,
          createdAt: serverTimestamp(),
          ...(name === 'quizAttempts' || name === 'mathAttempts' ? {} : { updatedAt: serverTimestamp() }),
        });
        return true;
      });
      if (created) count++;
    }
  }
  return count;
}

/** Add cloud records to the local demo archive without changing any existing local IDs. */
export async function downloadCloudToLocal(uid: string): Promise<number> {
  if (!uid) throw new Error('Google hesabıyla giriş yapın.');
  const cloud = await readCloud(uid);
  const local = readLocal();
  let added = 0;
  for (const name of COLLECTIONS) {
    const ids = new Set(local[name].map(r => r.id));
    for (const record of cloud[name]) {
      if (ids.has(record.id)) continue;
      const { createdAt, updatedAt, ...fields } = record;
      local[name].push({ ...fields, isDemo: true });
      ids.add(record.id);
      added++;
    }
  }
  // Persist only after every cloud query succeeded; never erase local-only records.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
  return added;
}
