import { firestoreIssueMessage, type FirestoreIssue } from '../../utils/firestoreStatus';

export function CloudDataNotice({ status, onRetry, label = 'Bulut kayıtları' }: {
  status: 'loading' | 'ready' | FirestoreIssue;
  onRetry: () => void;
  label?: string;
}) {
  if (status === 'ready') return null;

  return (
    <section aria-label={label} className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
      {status === 'loading' ? (
        <p role="status">{label} yükleniyor…</p>
      ) : (
        <>
          <p role="alert">{firestoreIssueMessage[status]}</p>
          <button type="button" onClick={onRetry}
            className="mt-2 min-h-11 rounded-lg border border-current px-3 py-1.5 font-semibold hover:bg-amber-100 dark:hover:bg-amber-900">
            Tekrar dene
          </button>
        </>
      )}
    </section>
  );
}
