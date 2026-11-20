import { Check } from 'lucide-react';
import { useAcademy } from '../../context/AcademyContext';

const roles = [
  { id: 'teacher', label: 'Öğretmen' },
  { id: 'student', label: 'Öğrenci' },
] as const;

export function WorkspaceRoleControl() {
  const { authLoading, isDemoMode, workspaceView, setWorkspaceView } = useAcademy();

  return (
    <div
      role="group"
      aria-label={isDemoMode ? 'Demo görünümü seçimi' : 'Hesap görünümü'}
      aria-busy={authLoading}
      className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5 dark:bg-slate-950"
    >
      {roles.map(({ id, label }) => {
        const selected = !authLoading && workspaceView === id;
        const content = (
          <>
            {selected && <Check aria-hidden="true" className="size-4 shrink-0" />}
            <span>{label}</span>
          </>
        );

        return isDemoMode && !authLoading ? (
          <button
            key={id}
            type="button"
            aria-pressed={selected}
            onClick={() => setWorkspaceView(id)}
            className="appearance-option cursor-pointer"
          >
            {content}
          </button>
        ) : (
          <div key={id} data-selected={selected} className="appearance-option">
            {content}
            {selected && <span className="sr-only"> (etkin görünüm)</span>}
          </div>
        );
      })}
    </div>
  );
}
