import { Zap } from 'lucide-react';
import { useAcademy } from '../../../context/AcademyContext';

import { activityTitles, type ActivityId } from './activityTitles';

export function WorkshopLinks({ activities }: { activities: readonly ActivityId[] }) {
  const { openWorkshopActivity } = useAcademy();

  return (
    <aside aria-label="Bu ders için Keşif Atölyesi etkinlikleri"
      className="space-y-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 dark:border-teal-900 dark:bg-teal-950/35">
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-teal-950 dark:text-teal-100">
        <Zap className="size-4" aria-hidden="true" /> Keşif Atölyesi
      </span>
      <div className="control-grid gap-2 [--control-min-width:9rem]">
        {activities.map((id) => (
          <button key={id} type="button" onClick={() => openWorkshopActivity(id)}
            className="min-h-10 rounded-md border border-teal-200 bg-white px-3 py-1.5 text-sm font-medium text-teal-950 hover:border-teal-700 dark:border-teal-800 dark:bg-slate-900 dark:text-teal-100 dark:hover:border-teal-400">
            {activityTitles[id]}
          </button>
        ))}
      </div>
    </aside>
  );
}
