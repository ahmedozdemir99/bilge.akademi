import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import type { ActivityId } from './workshop/activityTitles';
import { allActivityIds, subjectGroups, type Activity } from './workshop/catalog';
import { ArrangeLab } from './workshop/ArrangeLab';
import { DecisionLab } from './workshop/DecisionLab';
import { ModelLab } from './workshop/ModelLab';
import { InvestigationLab, investigations } from './workshop/InvestigationLab';
import { ReviewPractice } from './workshop/ReviewPractice';
import { lessonPlans } from './workshop/lessonPlans';
import type { LabCallbacks } from './workshop/workshopControls';

const progressKey = 'bilge-workshop-progress-v1';

function readCompleted(): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(progressKey) ?? '[]');
    if (Array.isArray(saved)) return [...new Set(saved.filter((id): id is string => typeof id === 'string' && allActivityIds.has(id)))];
  } catch {
    // An unavailable store should not prevent activities from opening.
  }
  return [];
}

function ActivityContent({ activity, ...callbacks }: { activity: Activity } & LabCallbacks) {
  switch (activity.kind) {
    case 'custom':
      return <activity.Lab {...callbacks} />;
    case 'model':
      return <ModelLab exercise={activity.exercise} {...callbacks} />;
    case 'arrange':
      return <ArrangeLab exercise={activity.exercise} {...callbacks} />;
    case 'decision':
      return <DecisionLab rounds={activity.rounds} {...callbacks} />;
  }
}

function WorkshopExercise({ activity, onComplete }: { activity: Activity; onComplete: () => void }) {
  const [mistakes, setMistakes] = useState(0);
  const investigation = investigations[activity.id];

  const onMistake = () => setMistakes((count) => Math.min(2, count + 1));

  return (
    <>
      {investigation ? (
        <InvestigationLab investigation={investigation} onComplete={onComplete}>
          {(onModelComplete) => <ActivityContent activity={activity} onComplete={onModelComplete} onMistake={onMistake} />}
        </InvestigationLab>
      ) : (
        <>
          <h3 className="text-lg font-semibold">Etkinlik materyali</h3>
          <ActivityContent activity={activity} onComplete={onComplete} onMistake={onMistake} />
        </>
      )}
      {mistakes >= 2 && <ReviewPractice activityId={activity.id} />}
    </>
  );
}

function ClassroomGuide({ activityId }: { activityId: ActivityId }) {
  const plan = lessonPlans[activityId];

  return (
    <details className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
      <summary className="cursor-pointer font-semibold">Sınıf materyali ve ders planı <span className="ml-1 text-sm font-normal text-slate-600 dark:text-slate-300">{plan.grade} · {plan.minutes} dk</span></summary>
      <dl className="mt-4 grid gap-3 text-sm leading-relaxed sm:grid-cols-2">
        <div className="sm:col-span-2"><dt className="font-semibold">Hedef beceri</dt><dd className="mt-1">{plan.skill}</dd></div>
        <div className="rounded-lg bg-white p-3 dark:bg-slate-900"><dt className="font-semibold">Başlangıç sorusu</dt><dd className="mt-1">{plan.opening}</dd></div>
        <div className="rounded-lg bg-white p-3 dark:bg-slate-900"><dt className="font-semibold">Ders sonu tartışması</dt><dd className="mt-1">{plan.discussion}</dd></div>
      </dl>
    </details>
  );
}

export function ActivityWorkshop({ initialActivityId = null }: { initialActivityId?: string | null }) {
  const [subjectId, setSubjectId] = useState(() => subjectGroups.find(({ activities }) =>
    activities.some(({ id }) => id === initialActivityId))?.id ?? subjectGroups[0].id);
  const [activityId, setActivityId] = useState(initialActivityId ?? subjectGroups[0].activities[0].id);
  const [completed, setCompleted] = useState(readCompleted);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subject = subjectGroups.find(({ id }) => id === subjectId) ?? subjectGroups[0];
  const activity = subject.activities.find(({ id }) => id === activityId) ?? subject.activities[0];

  useEffect(() => {
    function syncProgress(event: StorageEvent) {
      if (event.key !== progressKey) return;
      setCompleted((previous) => [...new Set([...previous, ...readCompleted()])]);
    }
    window.addEventListener('storage', syncProgress);
    return () => window.removeEventListener('storage', syncProgress);
  }, []);

  useEffect(() => {
    if (!initialActivityId || !allActivityIds.has(initialActivityId)) return;
    const frame = requestAnimationFrame(() => focusActivity(headingRef.current));
    return () => cancelAnimationFrame(frame);
  }, [initialActivityId]);

  function completeActivity() {
    if (completed.includes(activity.id)) return;
    const next = [...new Set([...completed, ...readCompleted(), activity.id])];
    setCompleted(next);
    try {
      localStorage.setItem(progressKey, JSON.stringify(next));
    } catch {
      // Progress remains available while the workshop is open.
    }
  }

  return (
    <div className="space-y-5">
      <header className="rounded-xl bg-navy-900 p-6 text-white sm:p-8">
        <h1 className="text-3xl font-semibold sm:text-4xl">Keşif Atölyesi</h1>
        <p className="mt-2 text-base text-slate-200">Dersini seç, bir modeli dene veya ipuçlarından kendi çözümünü kur.</p>
        <p role="status" className="mt-4 text-sm font-medium text-teal-200">{completed.length}/{allActivityIds.size} etkinlik tamamlandı</p>
        <progress aria-label="Atölye ilerlemesi" value={completed.length} max={allActivityIds.size}
          className="mt-2 block h-2 w-full max-w-60 overflow-hidden rounded-full [&::-moz-progress-bar]:bg-teal-300 [&::-webkit-progress-bar]:bg-navy-700 [&::-webkit-progress-value]:bg-teal-300" />
      </header>

      <div role="group" aria-label="Ders seç" className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
        {subjectGroups.map(({ id, name, icon: Icon, color, activities }) => {
          const count = activities.filter((item) => completed.includes(item.id)).length;
          return (
            <button key={id} type="button" aria-pressed={subject.id === id} onClick={() => {
              if (subject.id === id) return;
              setSubjectId(id);
              setActivityId(activities[0].id);
            }}
              className={`flex min-h-14 items-center gap-2 rounded-xl border p-2 text-left transition-colors sm:p-3 ${subject.id === id
                ? 'border-teal-600 bg-teal-50 dark:border-teal-400 dark:bg-teal-950/50'
                : 'border-slate-200 bg-white hover:border-teal-500 dark:border-slate-800 dark:bg-slate-900'}`}>
              <span className={`grid size-7 shrink-0 place-items-center rounded-md sm:size-8 ${color}`}><Icon aria-hidden="true" className="size-4" /></span>
              <span className="flex-1 text-xs font-semibold sm:text-sm">{name}</span>
              <span className="hidden shrink-0 text-xs text-slate-600 dark:text-slate-300 sm:inline" aria-label={`${count} / ${activities.length} tamamlandı`}>{count}/{activities.length}</span>
            </button>
          );
        })}
      </div>

      <div role="group" aria-label={`${subject.name} etkinlikleri`} className="grid gap-2 md:grid-cols-3">
        {subject.activities.map(({ id, title, typeLabel }) => (
          <button key={id} type="button" aria-pressed={activity.id === id} onClick={() => {
            setActivityId(id);
            requestAnimationFrame(() => focusActivity(headingRef.current));
          }}
            className={`flex min-h-12 items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${activity.id === id
              ? 'border-slate-300 bg-navy-900 text-white dark:border-slate-700 dark:bg-teal-800'
              : 'border-slate-200 bg-white hover:border-teal-500 dark:border-slate-800 dark:bg-slate-900'}`}>
            <span className="flex-1">
              <span className="block text-xs opacity-80">{typeLabel}</span>
              <span className="block text-sm font-semibold">{title}</span>
            </span>
            {completed.includes(id) && <span><Check className="size-4" aria-hidden="true" /><span className="sr-only">Tamamlandı</span></span>}
          </button>
        ))}
      </div>

      <section aria-labelledby="activity-name" className="space-y-5 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <div>
          <h2 ref={headingRef} id="activity-name" tabIndex={-1} className="scroll-mt-20 text-2xl font-semibold">{activity.title}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{activity.instruction}</p>
        </div>
        <WorkshopExercise key={activity.id} activity={activity} onComplete={completeActivity} />
        <ClassroomGuide key={`guide-${activity.id}`} activityId={activity.id} />
      </section>
    </div>
  );
}

function focusActivity(heading: HTMLHeadingElement | null) {
  heading?.focus({ preventScroll: true });
  heading?.scrollIntoView({ block: 'start', behavior: 'instant' });
}
