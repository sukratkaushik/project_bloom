import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlanner } from '../store';
import { fmtShort } from '../utils';
import { Sidebar } from './Sidebar';
import { DEV_TASKS, MED_TASKS, PREP_TASKS, FIN_TASKS, DEADLINE_TASKS, VACC_TASKS, POSTPARTUM_TASKS } from '../data';
import { Task } from '../types';
import { FloatingChatbot } from './FloatingChatbot';
import { Header } from './Header';
import { Footer } from './Footer';
import { DashboardSkeleton } from './DashboardSkeleton';
import { navigate } from '../utils/navigation';
import { isNativeApp } from '../utils/nativeBridge';

// Dynamically code-split section components (P1 Performance Optimization)
const PregnancyTracker = React.lazy(() => import('./sections/PregnancyTracker').then(m => ({ default: m.PregnancyTracker })));
const Development = React.lazy(() => import('./sections/Development').then(m => ({ default: m.Development })));
const Medical = React.lazy(() => import('./sections/Medical').then(m => ({ default: m.Medical })));
const MedicalReports = React.lazy(() => import('./sections/MedicalReports').then(m => ({ default: m.MedicalReports })));
const Preparation = React.lazy(() => import('./sections/Preparation').then(m => ({ default: m.Preparation })));
const Financial = React.lazy(() => import('./sections/Financial').then(m => ({ default: m.Financial })));
const Deadlines = React.lazy(() => import('./sections/Deadlines').then(m => ({ default: m.Deadlines })));
const Postpartum = React.lazy(() => import('./sections/Postpartum').then(m => ({ default: m.Postpartum })));
const SymptomLogger = React.lazy(() => import('./sections/SymptomLogger').then(m => ({ default: m.SymptomLogger })));
const FoodScanner = React.lazy(() => import('./sections/FoodScanner').then(m => ({ default: m.FoodScanner })));
const AskOurPregnancy = React.lazy(() => import('./sections/AskOurPregnancy').then(m => ({ default: m.AskOurPregnancy })));
const KickCounter = React.lazy(() => import('./sections/KickCounter').then(m => ({ default: m.KickCounter })));
const ContractionTimer = React.lazy(() => import('./sections/ContractionTimer').then(m => ({ default: m.ContractionTimer })));
const VitalsTracker = React.lazy(() => import('./sections/VitalsTracker').then(m => ({ default: m.VitalsTracker })));
const MoodTracker = React.lazy(() => import('./sections/MoodTracker').then(m => ({ default: m.MoodTracker })));
const HydrationTracker = React.lazy(() => import('./sections/HydrationTracker').then(m => ({ default: m.HydrationTracker })));
const NutritionTracker = React.lazy(() => import('./sections/NutritionTracker').then(m => ({ default: m.NutritionTracker })));
const HospitalBag = React.lazy(() => import('./sections/HospitalBag').then(m => ({ default: m.HospitalBag })));
const BirthPlanBuilder = React.lazy(() => import('./sections/BirthPlanBuilder').then(m => ({ default: m.BirthPlanBuilder })));
const GovernmentSchemes = React.lazy(() => import('./sections/GovernmentSchemes').then(m => ({ default: m.GovernmentSchemes })));
const BabyNames = React.lazy(() => import('./sections/BabyNames').then(m => ({ default: m.BabyNames })));
const SafeTravel = React.lazy(() => import('./sections/SafeTravel').then(m => ({ default: m.SafeTravel })));
const PartnerSync = React.lazy(() => import('./sections/PartnerSync').then(m => ({ default: m.PartnerSync })));
const Feedback = React.lazy(() => import('./sections/Feedback').then(m => ({ default: m.Feedback })));
const AdminFeedbacks = React.lazy(() => import('./sections/AdminFeedbacks').then(m => ({ default: m.AdminFeedbacks })));
const AdminPanel = React.lazy(() => import('./sections/AdminPanel').then(m => ({ default: m.AdminPanel })));
const Notes = React.lazy(() => import('./sections/Notes').then(m => ({ default: m.Notes })));
const Profile = React.lazy(() => import('./sections/Profile').then(m => ({ default: m.Profile })));
const GuidedBreathingAudio = React.lazy(() => import('./sections/GuidedBreathingAudio').then(m => ({ default: m.GuidedBreathingAudio })));
const UserFlowGuide = React.lazy(() => import('./UserFlowGuide').then(m => ({ default: m.UserFlowGuide })));
const LaborReadiness = React.lazy(() => import('./sections/LaborReadiness').then(m => ({ default: m.LaborReadiness })));
const VisitsVaccinesSchedule = React.lazy(() => import('./sections/VisitsVaccinesSchedule').then(m => ({ default: m.VisitsVaccinesSchedule })));
const HospitalBagBabyPrep = React.lazy(() => import('./sections/HospitalBagBabyPrep').then(m => ({ default: m.HospitalBagBabyPrep })));
const DeliveryCostSchemes = React.lazy(() => import('./sections/DeliveryCostSchemes').then(m => ({ default: m.DeliveryCostSchemes })));
const MobileShell = React.lazy(() => import('./mobile/MobileShell').then(m => ({ default: m.MobileShell })));

const VALID_PAGES = [
  'tracker', 'dev', 'medical', 'medical-reports', 'prep', 'finance', 
  'deadlines', 'postpartum', 'symptoms', 'foodscanner', 
  'askourpregnancy', 'kickcounter', 'contractions', 'vitals', 'mood', 
  'hydration', 'nutrition', 'hospitalbag', 'birthplan', 'schemes', 
  'babynames', 'travel', 'partnersync', 'feedback', 'admin-feedbacks', 
  'admin-panel', 'notes', 'profile', 'breathing', 'garbhsanskar', 'guide', 'readiness',
  'medical-schedule', 'baby-prep-bag', 'cost-schemes'
];

const getPageFromPath = (): string => {
  const path = window.location.pathname;
  if (!path.startsWith('/dashboard')) return 'tracker';
  const sub = path.replace(/^\/dashboard\/?/, '').split('?')[0].trim();
  if (sub && VALID_PAGES.includes(sub)) {
    return sub;
  }
  return 'tracker';
};

export const Dashboard: React.FC = () => {
  const { state, updateState, toggleDarkMode } = usePlanner();
  const [activePage, setActivePageState] = useState<string>(getPageFromPath);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
    if (isNativeApp()) return true;
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    if (isNativeApp()) return;
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync state -> URL when user clicks any tab or feature
  const setActivePage = (page: string) => {
    setActivePageState(page);
    const targetPath = page === 'tracker' ? '/dashboard' : `/dashboard/${page}`;
    if (window.location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  // Sync URL -> state when user uses browser Back / Forward buttons or deep links
  useEffect(() => {
    const handleLocationChange = () => {
      const page = getPageFromPath();
      setActivePageState(page);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleEmailClick = (email: string, e: React.MouseEvent) => {
    e.preventDefault();
    // Attempt standard mailto redirect
    window.location.href = `mailto:${email}`;

    // Copy to clipboard fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(() => {
        setToastMessage("Email copied to clipboard!");
        setTimeout(() => setToastMessage(null), 3000);
      }).catch((err) => {
        console.error("Could not copy email: ", err);
      });
    } else {
      try {
        const tempInput = document.createElement("input");
        tempInput.value = email;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        setToastMessage("Email copied to clipboard!");
        setTimeout(() => setToastMessage(null), 3000);
      } catch (err) {
        console.error("Fallback copy failed: ", err);
      }
    }
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activePage]);

  // Calculate progress
  const allTasks: Task[] = [
    ...DEV_TASKS.t1, ...DEV_TASKS.t2, ...DEV_TASKS.t3,
    ...MED_TASKS.t1, ...MED_TASKS.t2, ...MED_TASKS.t3, ...VACC_TASKS,
    ...PREP_TASKS.t1, ...PREP_TASKS.t2, ...PREP_TASKS.t3,
    ...FIN_TASKS,
    ...DEADLINE_TASKS,
    ...POSTPARTUM_TASKS
  ];

  // Filter tasks based on state to get accurate count
  const filterTasks = (tasks: Task[]) => {
    return tasks.filter(t => {
      if (state.deletedTasks?.[t.id]) return false;
      if (t.flags && t.flags.length && !t.flags.some(f => state.flags[f])) return false;
      if (t.onlyPreg && !t.onlyPreg.includes(state.pregnancyNum)) return false;
      if (t.onlyWork && !t.onlyWork.includes(state.workSit)) return false;
      if (t.excludeWork && t.excludeWork.includes(state.workSit)) return false;
      return true;
    });
  };

  const filteredTasks = filterTasks(allTasks);
  const doneCount = filteredTasks.filter(t => state.checked[t.id]).length;
  const progressPct = filteredTasks.length ? Math.round((doneCount / filteredTasks.length) * 100) : 0;

  if (isMobileViewport) {
    return (
      <React.Suspense fallback={<DashboardSkeleton />}>
        <MobileShell />
      </React.Suspense>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        progressPct={progressPct}
      />

      {/* Body */}
      <div className="max-w-[1000px] mx-auto px-4 md:px-10 lg:px-12 w-full flex-1 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 md:gap-8 items-start relative pb-6">
        {/* Desktop Sidebar (Sticky while scrolling page) */}
        <div className="hidden md:flex md:flex-col sticky top-[100px] max-h-[calc(100vh-120px)] overflow-y-auto overscroll-contain pr-2 pb-6 custom-scrollbar">
          <Sidebar activePage={activePage} setActivePage={setActivePage} filterTasks={filterTasks} />
        </div>

        {/* Mobile Navigation Drawer Overlay (Slides out from left, blurred backdrop) */}
        <div className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`}>
          {/* Backdrop Blur Overlay */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className={`absolute inset-0 bg-charcoal/50 backdrop-blur-xs transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          />
          {/* Drawer Panel */}
          <div
            className={`absolute top-0 bottom-0 left-0 w-[290px] bg-cream dark:bg-[#1B2936] shadow-2xl p-6 overflow-y-auto transition-transform duration-300 ease-out transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
              <span className="font-serif text-[18px] text-sage-dark dark:text-sage font-bold">Navigation</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-charcoal/20 rounded-md text-charcoal cursor-pointer text-[14px]"
              >
                ✕ Close
              </button>
            </div>
            {/* Render Sidebar inside Drawer */}
            <Sidebar activePage={activePage} setActivePage={setActivePage} filterTasks={filterTasks} isMobile />
          </div>
        </div>

        {/* Right Main Content Panel */}
        <main className="pt-6 md:pt-8 print:pt-0 w-full min-w-0 flex flex-col outline-none focus:outline-none">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, scale: 0.995 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.995 }}
                transition={{
                  duration: 0.25,
                  ease: "easeInOut"
                }}
                className="fill-mode-both"
              >
                <React.Suspense fallback={<DashboardSkeleton />}>
                  {activePage === 'tracker' && <PregnancyTracker />}
                  {activePage === 'dev' && <Development filterTasks={filterTasks} />}
                  {activePage === 'medical' && <Medical filterTasks={filterTasks} />}
                  {activePage === 'medical-reports' && <MedicalReports />}
                  {activePage === 'prep' && <Preparation filterTasks={filterTasks} />}
                  {activePage === 'finance' && <Financial filterTasks={filterTasks} />}
                  {activePage === 'deadlines' && <Deadlines filterTasks={filterTasks} />}
                  {activePage === 'postpartum' && <Postpartum filterTasks={filterTasks} />}
                  {activePage === 'symptoms' && <SymptomLogger />}
                  {activePage === 'foodscanner' && <FoodScanner />}
                  {activePage === 'askourpregnancy' && <AskOurPregnancy />}
                  {activePage === 'kickcounter' && <KickCounter />}
                  {activePage === 'contractions' && <ContractionTimer />}
                  {activePage === 'vitals' && <VitalsTracker />}
                  {activePage === 'mood' && <MoodTracker />}
                  {activePage === 'hydration' && <HydrationTracker />}
                  {activePage === 'nutrition' && <NutritionTracker />}
                  {activePage === 'hospitalbag' && <HospitalBag />}
                  {activePage === 'birthplan' && <BirthPlanBuilder />}
                  {activePage === 'schemes' && <GovernmentSchemes />}
                  {activePage === 'babynames' && <BabyNames />}
                  {activePage === 'travel' && <SafeTravel />}
                  {activePage === 'partnersync' && <PartnerSync />}
                  {activePage === 'feedback' && <Feedback />}
                  {activePage === 'admin-feedbacks' && <AdminPanel />}
                  {activePage === 'admin-panel' && <AdminPanel />}
                  {activePage === 'notes' && <Notes />}
                  {activePage === 'profile' && <Profile />}
                  {activePage === 'guide' && <UserFlowGuide onNavigate={setActivePage} />}
                  {(activePage === 'breathing' || activePage === 'garbhsanskar') && <GuidedBreathingAudio />}
                  {activePage === 'readiness' && <LaborReadiness />}
                  {activePage === 'medical-schedule' && <VisitsVaccinesSchedule filterTasks={filterTasks} />}
                  {activePage === 'baby-prep-bag' && <HospitalBagBabyPrep filterTasks={filterTasks} />}
                  {activePage === 'cost-schemes' && <DeliveryCostSchemes filterTasks={filterTasks} />}
                </React.Suspense>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Full-width Footer matching Header dimensions */}
      <Footer onToast={setToastMessage} />

      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-[100] bg-charcoal text-white px-5 py-3 rounded-[12px] shadow-lg flex items-center gap-2 text-sm font-semibold animate-in slide-in-from-bottom-5 duration-300 border border-light/20">
          <span>📋</span> {toastMessage}
        </div>
      )}

      <FloatingChatbot activePage={activePage} />
    </div>
  );
};
