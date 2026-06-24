import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KPISection from './components/KPISection';
import TodaySchedule from './components/TodaySchedule';
import WorkflowOverview from './components/WorkflowOverview';
import EncounterStatus from './components/EncounterStatus';
import QuickActions from './components/QuickActions';
import KeyInsights from './components/KeyInsights';
import StaffTransfer from './components/StaffTransfer';
import MyTasks from './components/MyTasks';

export default function App() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="min-w-0 flex-1 pl-0 lg:pl-[212px]">
          <Header />
          <main className="space-y-4 px-4 py-4 2xl:px-5">
            <KPISection />
            <QuickActions />

            <div className="grid grid-cols-12 gap-4 items-start"> 
              <section className="col-span-12 xl:col-span-5">
                <TodaySchedule />
              </section>

              <section className="col-span-12 space-y-4 xl:col-span-4 items-start">
                <WorkflowOverview />
                <EncounterStatus />
              </section>

              <aside className="col-span-12 space-y-4 xl:col-span-3">
                <KeyInsights />
              </aside>

              <section className="col-span-12  xl:col-span-9 space-y-4 items-start">
                <MyTasks />
              </section>

              <aside className="col-span-12 xl:col-span-3">
                <StaffTransfer />
              </aside>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
