import { collection, doc, documentId, getDocs, getFirestore, query, serverTimestamp, setDoc, where } from 'firebase/firestore/lite';
import { app, auth } from './firebase';
import config from '../../firebase-applet-config.json';

const db = getFirestore(app, config.firestoreDatabaseId);
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

function ownerField(name: CollectionName) {
  return ['classes', 'students', 'grades', 'attendance', 'practiceExams'].includes(name) ? 'teacherId' : 'ownerId';
}

function requireAccount(uid: string, writing = false) {
  const user = auth.currentUser;
  if (!user || user.uid !== uid) throw new Error('Firebase aktarımı için hesabınızla giriş yapın.');
  if (writing && !user.emailVerified) throw new Error('Firebase’e yüklemek için e-posta adresinizi doğrulayın.');
}

async function readCloud(uid: string): Promise<Archive> {
  requireAccount(uid);
  const entries = await Promise.all(COLLECTIONS.map(async (name) => {
    const snapshot = await getDocs(query(collection(db, name), where(ownerField(name), '==', uid)));
    return [name, snapshot.docs.map(d => ({ ...d.data(), id: d.id }))] as const;
  }));
  requireAccount(uid);
  return Object.fromEntries(entries) as Archive;
}

/** Firestore rules preserve createdAt on updates, so each server-timestamped write can only create a record. */
export async function uploadLocalToCloud(uid: string): Promise<number> {
  requireAccount(uid, true);
  const local = readLocal();
  const cloud = await readCloud(uid);
  const available = Object.fromEntries(COLLECTIONS.map(name => [name, new Set(cloud[name].map(r => r.id))])) as Record<CollectionName, Set<string>>;
  let count = 0;
  for (const name of COLLECTIONS) {
    const starterIds = new Set((seeds[name] || []).map(x => x.id));
    const field = ownerField(name);
    for (const record of local[name]) {
      if (starterIds.has(record.id) || available[name].has(record.id)) continue;
      if (('classId' in record && (typeof record.classId !== 'string' || !available.classes.has(record.classId))) ||
          ('studentId' in record && (typeof record.studentId !== 'string' || !available.students.has(record.studentId)))) continue;
      const { id, isDemo, createdAt, updatedAt, teacherId, ownerId, ...fields } = record;
      requireAccount(uid, true);
      try {
        await setDoc(doc(db, name, id), {
          ...fields, [field]: uid,
          createdAt: serverTimestamp(),
          ...(name === 'quizAttempts' || name === 'mathAttempts' ? {} : { updatedAt: serverTimestamp() }),
        });
        count++;
      } catch (error) {
        if ((error as { code?: string } | null)?.code !== 'permission-denied') throw error;
        // Another transfer may have created this ID since the initial listing.
        const existing = await getDocs(query(collection(db, name), where(field, '==', uid), where(documentId(), '==', id)));
        if (existing.empty) throw error;
      }
      available[name].add(id);
    }
  }
  return count;
}

/** Add cloud records to the local demo archive without changing any existing local IDs. */
export async function downloadCloudToLocal(uid: string): Promise<number> {
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
