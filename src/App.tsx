import { lazy, Suspense, useEffect } from 'react';
import { AcademyProvider, useAcademy } from './context/AcademyContext';
import { AppShell } from './components/layout/AppShell';
import { AIAssistantModule } from './components/modules/AIAssistantModule';
import { HomeDashboard } from './components/modules/HomeDashboard';
import { SignInDialog } from './components/ui/SignInDialog';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { GoogleSignInDialog } from './components/ui/GoogleSignInDialog';
import { ToastContainer } from './components/ui/ToastContainer';

const ActivityWorkshop = lazy(() => import('./components/modules/ActivityWorkshop').then(({ ActivityWorkshop }) => ({ default: ActivityWorkshop })));
const EnglishModule = lazy(() => import('./components/modules/EnglishModule').then(({ EnglishModule }) => ({ default: EnglishModule })));
const HistoryAtlasModule = lazy(() => import('./components/modules/HistoryAtlasModule').then(({ HistoryAtlasModule }) => ({ default: HistoryAtlasModule })));
const LiteratureModule = lazy(() => import('./components/modules/LiteratureModule').then(({ LiteratureModule }) => ({ default: LiteratureModule })));
const MathTutorModule = lazy(() => import('./components/modules/MathTutorModule').then(({ MathTutorModule }) => ({ default: MathTutorModule })));
const PhilosophyModule = lazy(() => import('./components/modules/PhilosophyModule').then(({ PhilosophyModule }) => ({ default: PhilosophyModule })));
const ReligionModule = lazy(() => import('./components/modules/ReligionModule').then(({ ReligionModule }) => ({ default: ReligionModule })));
const ReportsModule = lazy(() => import('./components/modules/ReportsModule').then(({ ReportsModule }) => ({ default: ReportsModule })));
const ScienceLabModule = lazy(() => import('./components/modules/ScienceLabModule').then(({ ScienceLabModule }) => ({ default: ScienceLabModule })));
const SettingsModule = lazy(() => import('./components/modules/SettingsModule').then(({ SettingsModule }) => ({ default: SettingsModule })));
const StudentTrackingModule = lazy(() => import('./components/modules/StudentTrackingModule').then(({ StudentTrackingModule }) => ({ default: StudentTrackingModule })));

function BilgeAkademiRouter() {
  const { activeModule, workshopActivityId, workspaceView, setActiveModule } = useAcademy();
  const params = new URLSearchParams(window.location.search);
  const initialImport = params.get('denemeYukle') === '1';
  const initialAnalysis = params.get('denemeAnalizi') === '1';
  const initialArchive = params.get('denemeArsivi') === '1';
  const initialClass = params.get('sinif') ?? '';
  useEffect(() => {
    if ((initialAnalysis || initialArchive || initialImport) && workspaceView === 'teacher') setActiveModule('student-tracking');
  }, [initialAnalysis, initialArchive, initialImport, setActiveModule, workspaceView]);

  switch (activeModule) {
    case 'home':
      return <HomeDashboard />;
    case 'activity-workshop':
      return <ActivityWorkshop key={workshopActivityId ?? 'workshop'} initialActivityId={workshopActivityId} />;
    case 'student-tracking':
      return <StudentTrackingModule initialImport={initialImport} initialAnalysis={initialAnalysis} initialArchive={initialArchive} initialClass={initialClass} />;
    case 'literature':
      return <LiteratureModule />;
    case 'history':
      return <HistoryAtlasModule />;
    case 'mathematics':
      return <MathTutorModule />;
    case 'science':
      return <ScienceLabModule />;
    case 'english':
      return <EnglishModule />;
    case 'religion':
      return <ReligionModule />;
    case 'philosophy':
      return <PhilosophyModule />;
    case 'ai-assistant':
      return <AIAssistantModule />;
    case 'reports':
      return <ReportsModule />;
    case 'settings':
      return <SettingsModule />;
    default:
      return <HomeDashboard />;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AcademyProvider>
        <AppShell>
          <Suspense
            fallback={<p role="status" className="text-sm text-slate-600 dark:text-slate-300">Bölüm yükleniyor…</p>}
          >
            <BilgeAkademiRouter />
          </Suspense>
        </AppShell>
        <SignInDialog />
        <GoogleSignInDialog />
        <ToastContainer />
      </AcademyProvider>
    </ErrorBoundary>
  );
}
