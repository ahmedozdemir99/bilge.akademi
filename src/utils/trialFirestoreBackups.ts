import { collection, doc, getDoc, getDocs, getFirestore, orderBy, query, runTransaction, serverTimestamp } from 'firebase/firestore/lite';
import { app, auth } from '../lib/firebase';
import config from '../../firebase-applet-config.json';
import { parseTrialArchiveBackup, type TrialArchiveBackup } from './trialArchiveBackup';

const db = getFirestore(app, config.firestoreDatabaseId);
const backupLimit = 8 * 1024 * 1024;
const chunkLimit = 56;

export type TrialFirestoreBackup = {
  id: string;
  title: string;
  examDate: string;
  classCount: number;
  studentCount: number;
  chunkCount: number;
};

function backupCollection(owner: string) {
  if (auth.currentUser?.uid !== owner || !auth.currentUser.emailVerified) {
    throw new Error('Firebase yedeği için doğrulanmış hesabınızla giriş yapın.');
  }
  return collection(db, 'users', owner, 'trialBackups');
}

async function checksum(bytes: Uint8Array<ArrayBuffer>) {
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function saveTrialFirestoreBackup(owner: string, backup: TrialArchiveBackup) {
  const archive = backupCollection(owner);
  const payload = JSON.stringify(backup);
  parseTrialArchiveBackup(payload);
  const bytes = new TextEncoder().encode(payload);
  if (bytes.length > backupLimit) throw new Error('Firebase yedeği en fazla 8 MB olabilir. Bu arşivi dosya olarak indirebilirsiniz.');
  // Even four-byte Unicode characters fit the Firestore rules and document limits.
  const chunks = payload.match(/[\s\S]{1,150000}/gu) ?? [];
  if (chunks.length > chunkLimit) throw new Error('Arşiv Firebase yedek sınırını aşıyor. Yedeği dosya olarak indirebilirsiniz.');
  const id = await checksum(bytes);
  const manifest = doc(archive, id);

  return runTransaction(db, async (transaction) => {
    backupCollection(owner);
    if ((await transaction.get(manifest)).exists()) return false;
    backupCollection(owner);
    transaction.set(manifest, {
      title: backup.title,
      examDate: backup.date,
      classCount: backup.classes.length,
      studentCount: backup.classes.reduce((count, item) => count + item.students.length, 0),
      chunkCount: chunks.length,
      createdAt: serverTimestamp(),
    });
    chunks.forEach((content, index) => {
      transaction.set(doc(manifest, 'chunks', String(index)), { content });
    });
    return true;
  });
}

export async function listTrialFirestoreBackups(owner: string) {
  const snapshot = await getDocs(query(backupCollection(owner), orderBy('createdAt', 'desc')));
  backupCollection(owner);
  return snapshot.docs.map((item) => ({ ...item.data(), id: item.id } as TrialFirestoreBackup));
}

export async function readTrialFirestoreBackup(owner: string, backup: TrialFirestoreBackup) {
  if (!/^[a-f0-9]{64}$/.test(backup.id) || !Number.isInteger(backup.chunkCount) ||
    backup.chunkCount < 1 || backup.chunkCount > chunkLimit) {
    throw new Error('Bu Firebase yedeğinin bilgileri eksik veya geçersiz.');
  }
  const manifest = doc(backupCollection(owner), backup.id);
  const parts = await Promise.all(Array.from({ length: backup.chunkCount }, async (_, index) => {
    const snapshot = await getDoc(doc(manifest, 'chunks', String(index)));
    const content = snapshot.data()?.content;
    if (typeof content !== 'string') throw new Error('Bu Firebase yedeğinin bir bölümü eksik.');
    return content;
  }));
  backupCollection(owner);
  const payload = parts.join('');
  if (await checksum(new TextEncoder().encode(payload)) !== backup.id) {
    throw new Error('Firebase yedeğinin bütünlüğü doğrulanamadı.');
  }
  return parseTrialArchiveBackup(payload);
}
