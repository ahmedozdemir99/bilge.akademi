export type FirestoreIssue = 'quota' | 'offline' | 'permission' | 'unavailable';

export function firestoreIssue(error: unknown): FirestoreIssue {
  const code = (error as { code?: string } | null)?.code?.replace(/^firestore\//, '');
  if (code === 'resource-exhausted' || (error instanceof Error && /quota (?:limit )?exceeded|free daily read units/i.test(error.message))) return 'quota';
  if (code === 'permission-denied' || code === 'unauthenticated') return 'permission';
  if (typeof navigator !== 'undefined' && !navigator.onLine) return 'offline';
  return 'unavailable';
}

export const firestoreIssueMessage: Record<FirestoreIssue, string> = {
  quota: 'Firestore kullanım kotası doldu. Günlük kota yenilendikten sonra tekrar deneyin.',
  offline: 'Bulut kayıtlarına şu anda çevrimdışı olduğunuz için ulaşılamıyor. Bağlantı kurulduğunda tekrar deneyin.',
  permission: 'Bu bulut kayıtlarına erişim izni doğrulanamadı. Google hesabınızı ve erişim yetkinizi kontrol edin.',
  unavailable: 'Bulut kayıtlarına şu anda ulaşılamıyor. Bir süre sonra tekrar deneyin.',
};
