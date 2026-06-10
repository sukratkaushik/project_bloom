import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlanner } from '../store';
import { fmtShort } from '../utils';
import { Sidebar } from './Sidebar';
import { Development } from './sections/Development';
import { Medical } from './sections/Medical';
import { Preparation } from './sections/Preparation';
import { Financial } from './sections/Financial';
import { Decisions } from './sections/Decisions';
import { Deadlines } from './sections/Deadlines';
import { Postpartum } from './sections/Postpartum';
import { Notes } from './sections/Notes';
import { SymptomLogger } from './sections/SymptomLogger';
import { LaborReadiness } from './sections/LaborReadiness';
import { FoodScanner } from './sections/FoodScanner';
import { AskOurPregnancy } from './sections/AskOurPregnancy';
import { KickCounter } from './sections/KickCounter';
import { ContractionTimer } from './sections/ContractionTimer';
import { VitalsTracker } from './sections/VitalsTracker';
import { MoodTracker } from './sections/MoodTracker';
import { HydrationTracker } from './sections/HydrationTracker';
import { NutritionTracker } from './sections/NutritionTracker';
import { HospitalBag } from './sections/HospitalBag';
import { BirthPlanBuilder } from './sections/BirthPlanBuilder';
import { GovernmentSchemes } from './sections/GovernmentSchemes';
import { BabyNames } from './sections/BabyNames';
import { DEV_TASKS, MED_TASKS, PREP_TASKS, FIN_TASKS, DEADLINE_TASKS, VACC_TASKS, POSTPARTUM_TASKS } from '../data';
import { Task } from '../types';

import { PregnancyTracker } from './sections/PregnancyTracker';
import { PartnerSync } from './sections/PartnerSync';
import { Feedback } from './sections/Feedback';
import { AdminFeedbacks } from './sections/AdminFeedbacks';

import { Profile } from './sections/Profile';
import { FloatingChatbot } from './FloatingChatbot';
import { LanguageSelector } from './LanguageSelector';
import { Header } from './Header';
import { MedicalReports } from './sections/MedicalReports';

export const Dashboard: React.FC = () => {
  const { state, updateState, toggleCalmMode, toggleDarkMode } = usePlanner();
  const [activePage, setActivePage] = useState('tracker');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <Header 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
        progressPct={progressPct} 
      />

      {/* Body */}
      <div className="max-w-[1000px] mx-auto px-4 md:px-10 lg:px-12 pb-[100px] grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 md:gap-8 items-start w-full relative">
        {/* Desktop Sidebar (Rendered inline) */}
        <div className="hidden md:block w-full md:w-auto">
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
              <span className="font-serif text-[18px] text-sage font-bold">Navigation</span>
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

        <main className="pt-6 md:pt-8 print:pt-0 w-full min-w-0">
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
              {activePage === 'tracker' && <PregnancyTracker />}
              {activePage === 'dev' && <Development filterTasks={filterTasks} />}
              {activePage === 'medical' && <Medical filterTasks={filterTasks} />}
              {activePage === 'medical-reports' && <MedicalReports />}
              {activePage === 'prep' && <Preparation filterTasks={filterTasks} />}
              {activePage === 'finance' && <Financial filterTasks={filterTasks} />}
              {activePage === 'decisions' && <Decisions />}
              {activePage === 'deadlines' && <Deadlines filterTasks={filterTasks} />}
              {activePage === 'postpartum' && <Postpartum filterTasks={filterTasks} />}
              {activePage === 'symptoms' && <SymptomLogger />}
              {activePage === 'readiness' && <LaborReadiness setActivePage={setActivePage} />}
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
              {activePage === 'partnersync' && <PartnerSync />}
              {activePage === 'feedback' && <Feedback />}
              {activePage === 'admin-feedbacks' && <AdminFeedbacks />}
              {activePage === 'notes' && <Notes />}
              {activePage === 'profile' && <Profile />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Floating/Glassmorphic) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-[#2C3E50]/80 backdrop-blur-md border-t border-border py-2 px-4 flex justify-around items-center md:hidden no-print shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <button
          onClick={() => setActivePage('tracker')}
          className={`flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${activePage === 'tracker' ? 'text-sage font-semibold' : 'text-medium'}`}
        >
          <span className="text-[18px]">📅</span>
          <span>Tracker</span>
        </button>
        <button
          onClick={() => setActivePage('vitals')}
          className={`flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${activePage === 'vitals' ? 'text-sage font-semibold' : 'text-medium'}`}
        >
          <span className="text-[18px]">💙</span>
          <span>Vitals</span>
        </button>
        <button
          onClick={() => setActivePage('readiness')}
          className={`flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${activePage === 'readiness' ? 'text-sage font-semibold' : 'text-medium'}`}
        >
          <span className="text-[18px]">🔮</span>
          <span>Readiness</span>
        </button>
        <button
          onClick={() => setActivePage('askourpregnancy')}
          className={`flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${activePage === 'askourpregnancy' ? 'text-sage font-semibold' : 'text-medium'}`}
        >
          <span className="text-[18px]">✨</span>
          <span>AI Guide</span>
        </button>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={`flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${isMobileMenuOpen ? 'text-sage font-semibold' : 'text-medium'}`}
        >
          <span className="text-[18px]">☰</span>
          <span>Menu</span>
        </button>
      </div>

      {/* Dashboard Footer */}
      <footer className="mt-auto border-t border-border bg-cream py-8 px-6 no-print w-full z-10 relative">
        <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-medium">
          <div className="flex items-center gap-2">
            <span className="font-serif text-[18px] text-sage font-semibold tracking-wide notranslate">Our Pregnancy</span>
            <span className="opacity-60 hidden sm:inline">|</span>
            <span className="opacity-80">Made with ❤️ for expectant mothers</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-sage transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-sage transition-colors">Terms of Service</a>
            <a href="mailto:hello@ourpregnancy.in" onClick={(e) => handleEmailClick("hello@ourpregnancy.in", e)} className="hover:text-sage transition-colors">Support</a>
          </div>
        </div>
      </footer>

      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-[100] bg-charcoal text-white px-5 py-3 rounded-[12px] shadow-lg flex items-center gap-2 text-sm font-semibold animate-in slide-in-from-bottom-5 duration-300 border border-light/20">
          <span>📋</span> {toastMessage}
        </div>
      )}

      <FloatingChatbot activePage={activePage} />
    </div>
  );
};
