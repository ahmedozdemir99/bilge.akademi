import { AcademyProvider, useAcademy } from './context/AcademyContext';
import { AppShell } from './components/layout/AppShell';
import { AIAssistantModule } from './components/modules/AIAssistantModule';
import { EnglishModule } from './components/modules/EnglishModule';
import { HistoryAtlasModule } from './components/modules/HistoryAtlasModule';
import { HomeDashboard } from './components/modules/HomeDashboard';
import { LiteratureModule } from './components/modules/LiteratureModule';
import { MathTutorModule } from './components/modules/MathTutorModule';
import { PhilosophyModule } from './components/modules/PhilosophyModule';
import { ReligionModule } from './components/modules/ReligionModule';
import { ReportsModule } from './components/modules/ReportsModule';
import { ScienceLabModule } from './components/modules/ScienceLabModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { StudentTrackingModule } from './components/modules/StudentTrackingModule';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ToastContainer } from './components/ui/ToastContainer';

function BilgeAkademiRouter() {
  const { activeModule } = useAcademy();

  switch (activeModule) {
    case 'home':
      return <HomeDashboard />;
    case 'student-tracking':
      return <StudentTrackingModule />;
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
          <BilgeAkademiRouter />
        </AppShell>
        <ToastContainer />
      </AcademyProvider>
    </ErrorBoundary>
  );
}
