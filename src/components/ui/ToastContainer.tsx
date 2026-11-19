import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useAcademy } from '../../context/AcademyContext';

export function ToastContainer() {
  const { toasts, dismissToast } = useAcademy();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100%-2.5rem)] no-print"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? XCircle : Info;
        const iconColor =
          toast.type === 'success'
            ? 'text-emerald-600 dark:text-emerald-400'
            : toast.type === 'error'
              ? 'text-red-600 dark:text-red-400'
              : 'text-teal-600 dark:text-teal-400';

        return (
          <div
            key={toast.id}
            className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg"
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {toast.title}
              </p>
              {toast.description && (
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Bildirimi kapat"
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
