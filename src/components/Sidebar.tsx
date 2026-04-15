import React, { useState } from 'react';
import { usePlanner } from '../store';
import { DEV_TASKS, MED_TASKS, PREP_TASKS, FIN_TASKS, DEADLINE_TASKS, VACC_TASKS } from '../data';
import { Task } from '../types';

type SidebarProps = {
  activePage: string;
  setActivePage: (page: string) => void;
  filterTasks: (tasks: Task[]) => Task[];
};

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, filterTasks }) => {
  const { state, toggleCalmMode, toggleDarkMode } = usePlanner();
  const [toast, setToast] = useState(false);

  const getCount = (tasks: Task[]) => {
    const filtered = filterTasks(tasks);
    const done = filtered.filter(t => state.checked[t.id]).length;
    return `${done}/${filtered.length}`;
  };

  const devTasks = [...DEV_TASKS.t1, ...DEV_TASKS.t2, ...DEV_TASKS.t3];
  const medTasks = [...MED_TASKS.t1, ...MED_TASKS.t2, ...MED_TASKS.t3, ...VACC_TASKS];
  const prepTasks = [...PREP_TASKS.t1, ...PREP_TASKS.t2, ...PREP_TASKS.t3];

  const handleSave = () => {
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const NavItem = ({ id, icon, label, count }: { id: string, icon: string, label: string, count?: string }) => {
    const isActive = activePage === id;
    return (
      <button
        onClick={() => setActivePage(id)}
        className={`flex items-center gap-2.5 p-[10px_12px] rounded-[10px] text-[13px] font-medium cursor-pointer transition-all border-none w-full text-left mb-0.5
          ${isActive ? 'bg-sage-pale text-sage font-semibold' : 'bg-transparent text-medium hover:bg-sage-pale hover:text-sage'}`}
      >
        <span className="text-[16px] w-5 text-center">{icon}</span>
        {label}
        {count && !state.isCalmModeActive && (
          <span className={`ml-auto text-[11px] rounded-[10px] px-[7px] py-[1px] font-semibold
            ${isActive ? 'bg-white text-sage' : 'bg-sage-pale text-sage'}`}>
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="sticky top-[80px] pt-8 no-print">
      <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-light mb-2 pl-3">Planning sections</div>
      
      <NavItem id="tracker" icon="📅" label="Pregnancy Tracker" />
      <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-light mb-2 mt-4 pl-3">Daily Utilities</div>
      <NavItem id="kickcounter" icon="👣" label="Kick Counter" />
      <NavItem id="contractions" icon="⏱" label="Contraction Timer" />
      <NavItem id="vitals" icon="💙" label="Vitals (BP/Weight)" />
      <NavItem id="mood" icon="😊" label="Mood Tracker" />
      <NavItem id="hydration" icon="💧" label="Hydration" />
      <NavItem id="nutrition" icon="🥗" label="Nutrition & Supplements" />
      
      <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-light mb-2 mt-4 pl-3">Planning sections</div>
      <NavItem id="dev" icon="🌱" label="Development" count={getCount(devTasks)} />
      <NavItem id="medical" icon="🏥" label="Medical" count={getCount(medTasks)} />
      <NavItem id="schemes" icon="🏛" label="Government Schemes" />
      <NavItem id="prep" icon="📋" label="Preparation" count={getCount(prepTasks)} />
      <NavItem id="hospitalbag" icon="👜" label="Hospital Bag" />
      <NavItem id="finance" icon="💰" label="Financial" count={getCount(FIN_TASKS)} />
      <NavItem id="decisions" icon="✦" label="Decisions" />
      <NavItem id="birthplan" icon="📜" label="Birth Plan Builder" />
      <NavItem id="deadlines" icon="📅" label="Deadlines" count={getCount(DEADLINE_TASKS)} />
      <NavItem id="postpartum" icon="🍃" label="Early Parenthood" />
      <NavItem id="symptoms" icon="📈" label="Symptom Log" />
      <NavItem id="readiness" icon="🔮" label="Labor Readiness" />
      <NavItem id="foodscanner" icon="🍎" label="Food Scanner" />
      <NavItem id="askbloom" icon="✨" label="AskBloom AI" />
      
      <div className="h-px bg-border my-2.5" />
      
      <NavItem id="notes" icon="📝" label="Notes & Journal" />
      
      <div className="h-px bg-border my-2.5" />
      
      <button 
        onClick={toggleCalmMode}
        className={`w-full mt-3 p-2.5 border-[1.5px] rounded-[10px] font-sans text-[13px] font-medium cursor-pointer transition-all flex items-center justify-between
          ${state.isCalmModeActive ? 'bg-sage-pale border-sage text-sage' : 'bg-white border-border text-charcoal hover:border-sage-light'}`}
      >
        <span className="flex items-center gap-2">
          <span className="text-[16px]">🌿</span> Calm Mode
        </span>
        <div className={`w-8 h-4 rounded-full relative transition-colors ${state.isCalmModeActive ? 'bg-sage' : 'bg-border'}`}>
          <div className={`absolute top-[2px] w-3 h-3 rounded-full bg-white transition-all shadow-sm ${state.isCalmModeActive ? 'left-[18px]' : 'left-[2px]'}`} />
        </div>
      </button>

      <button 
        onClick={toggleDarkMode}
        className={`w-full mt-2 p-2.5 border-[1.5px] rounded-[10px] font-sans text-[13px] font-medium cursor-pointer transition-all flex items-center justify-between
          ${state.isDarkModeActive ? 'bg-charcoal border-charcoal text-white' : 'bg-white border-border text-charcoal hover:border-charcoal'}`}
      >
        <span className="flex items-center gap-2">
          <span className="text-[16px]">{state.isDarkModeActive ? '🌙' : '☀️'}</span> Dark Mode
        </span>
        <div className={`w-8 h-4 rounded-full relative transition-colors ${state.isDarkModeActive ? 'bg-sage' : 'bg-border'}`}>
          <div className={`absolute top-[2px] w-3 h-3 rounded-full bg-white transition-all shadow-sm ${state.isDarkModeActive ? 'left-[18px]' : 'left-[2px]'}`} />
        </div>
      </button>

      <button 
        onClick={handleSave}
        className="w-full mt-2 p-2.5 bg-gold-pale border-[1.5px] border-gold rounded-[10px] font-sans text-[13px] font-semibold text-gold cursor-pointer transition-all hover:bg-gold hover:text-white"
      >
        💾 Save Progress
      </button>
      
      <button 
        onClick={handlePrint}
        className="w-full mt-2 p-2.5 bg-white border-[1.5px] border-border rounded-[10px] font-sans text-[13px] font-medium text-medium cursor-pointer transition-all hover:border-charcoal hover:text-charcoal"
      >
        🖨 Print Screen
      </button>

      <button 
        onClick={() => {
          import('../utils/pdfExport').then(module => {
            module.exportToPDF(state);
          });
        }}
        className="w-full mt-2 p-2.5 bg-sage-pale border-[1.5px] border-sage rounded-[10px] font-sans text-[13px] font-medium text-sage cursor-pointer transition-all hover:bg-sage hover:text-white"
      >
        📄 Export Care Plan PDF
      </button>

      {/* Toast */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-charcoal text-white px-5 py-3 rounded-full text-[13px] font-medium transition-all duration-300 z-[999] shadow-lg
        ${toast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        Progress saved ✓
      </div>
    </div>
  );
};
