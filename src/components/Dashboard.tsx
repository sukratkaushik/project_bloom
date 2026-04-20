import React, { useState } from 'react';
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
import { AskBloom } from './sections/AskBloom';
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

export const Dashboard: React.FC = () => {
  const { state, updateState } = usePlanner();
  const [activePage, setActivePage] = useState('tracker');

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
      {/* Header */}
      <header className="bg-white border-b border-border px-6 sticky top-0 z-50 shadow-sm no-print">
        <div className="max-w-[1000px] mx-auto flex items-stretch min-h-[60px]">
          <button 
            onClick={() => updateState({ isSetup: false })}
            className="font-serif text-[20px] font-medium text-sage flex items-center pr-6 border-r border-border mr-5 tracking-[2px] italic cursor-pointer bg-transparent border-none hover:opacity-80 transition-opacity"
          >
            bloom
          </button>
          
          {state.isCalmModeActive ? (
            <div className="flex-1 flex items-center text-[14px] text-medium italic">
              Taking it one day at a time.
            </div>
          ) : (
            <div className="flex items-center gap-5 flex-wrap flex-1">
              <div className="text-center">
                <div className="text-[9px] font-semibold tracking-[1.2px] uppercase text-light">LMP (est.)</div>
                <div className="font-serif text-[16px] font-medium text-charcoal">{fmtShort(state.lmp)}</div>
              </div>
              <div className="text-center">
                <div className="text-[9px] font-semibold tracking-[1.2px] uppercase text-light">T1 ends</div>
                <div className="font-serif text-[16px] font-medium text-charcoal">{fmtShort(state.t1End)}</div>
              </div>
              <div className="text-center">
                <div className="text-[9px] font-semibold tracking-[1.2px] uppercase text-light">T2 ends</div>
                <div className="font-serif text-[16px] font-medium text-charcoal">{fmtShort(state.t2End)}</div>
              </div>
              <div className="text-center">
                <div className="text-[9px] font-semibold tracking-[1.2px] uppercase text-light">Due date</div>
                <div className="font-serif text-[16px] font-medium text-charcoal">{fmtShort(state.dueDate)}</div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 pl-5 border-l border-border">
            {!state.isCalmModeActive && (
              <div className="flex items-center gap-2.5">
                <div className="w-[100px] h-[5px] bg-border rounded-[3px] overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-sage to-sage-light rounded-[3px] transition-all duration-400"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="text-[12px] font-semibold text-sage whitespace-nowrap">{progressPct}% done</div>
              </div>
            )}
            <button 
              onClick={() => updateState({ critFilter: !state.critFilter })}
              className={`px-3 py-1.5 border-[1.5px] rounded-[20px] font-sans text-[12px] font-medium transition-all whitespace-nowrap
                ${state.critFilter ? 'border-critical text-critical bg-critical-bg' : 'border-border text-medium bg-transparent hover:border-sage-light'}`}
            >
              {state.critFilter ? '✓ Critical only' : 'Critical only'}
            </button>
            <button 
              onClick={() => updateState({ isCalmModeActive: !state.isCalmModeActive })}
              className={`px-3 py-1.5 border-[1.5px] rounded-[20px] font-sans text-[12px] font-medium transition-all whitespace-nowrap
                ${state.isCalmModeActive ? 'border-sage text-sage bg-sage-pale' : 'border-border text-medium bg-transparent hover:border-sage-light'}`}
              title="Toggle Calm Mode (reduces visual clutter and hides timers)"
            >
              {state.isCalmModeActive ? '🌿 Calm Mode On' : '🌿 Calm Mode'}
            </button>
            <button 
              onClick={() => updateState({ isDarkModeActive: !state.isDarkModeActive })}
              className={`px-3 py-1.5 border-[1.5px] rounded-[20px] font-sans text-[12px] font-medium transition-all whitespace-nowrap
                ${state.isDarkModeActive ? 'border-charcoal text-white bg-charcoal' : 'border-border text-medium bg-transparent hover:border-charcoal'}`}
              title="Toggle Dark Mode"
            >
              {state.isDarkModeActive ? '🌙 Dark Mode On' : '☀️ Dark Mode'}
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-[1000px] mx-auto px-6 pb-[100px] grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 items-start w-full">
        <Sidebar activePage={activePage} setActivePage={setActivePage} filterTasks={filterTasks} />
        
        <main className="pt-8 print:pt-0">
          {activePage === 'tracker' && <PregnancyTracker />}
          {activePage === 'dev' && <Development filterTasks={filterTasks} />}
          {activePage === 'medical' && <Medical filterTasks={filterTasks} />}
          {activePage === 'prep' && <Preparation filterTasks={filterTasks} />}
          {activePage === 'finance' && <Financial filterTasks={filterTasks} />}
          {activePage === 'decisions' && <Decisions />}
          {activePage === 'deadlines' && <Deadlines filterTasks={filterTasks} />}
          {activePage === 'postpartum' && <Postpartum filterTasks={filterTasks} />}
          {activePage === 'symptoms' && <SymptomLogger />}
          {activePage === 'readiness' && <LaborReadiness />}
          {activePage === 'foodscanner' && <FoodScanner />}
          {activePage === 'askbloom' && <AskBloom />}
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
        </main>
      </div>

      {/* Dashboard Footer */}
      <footer className="mt-auto border-t border-border bg-cream py-8 px-6 no-print w-full z-10 relative">
        <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-medium">
          <div className="flex items-center gap-2">
            <span className="font-serif text-[18px] text-sage italic tracking-wider">bloom</span>
            <span className="opacity-60 hidden sm:inline">|</span>
            <span className="opacity-80">Made with ❤️ for Indian mothers</span>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-sage transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-sage transition-colors">Terms of Service</a>
            <a href="mailto:hello@bloompregnancy.in" className="hover:text-sage transition-colors">Support</a>
          </div>
        </div>
      </footer>

      <FloatingChatbot />
    </div>
  );
};
