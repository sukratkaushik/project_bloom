import React, { useState } from 'react';
import { usePlanner } from '../store';
import { DEV_TASKS, MED_TASKS, PREP_TASKS, FIN_TASKS, DEADLINE_TASKS, VACC_TASKS } from '../data';
import { Task } from '../types';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { ChevronDown, ChevronRight, Star } from 'lucide-react';

type SidebarProps = {
  activePage: string;
  setActivePage: (page: string) => void;
  filterTasks: (tasks: Task[]) => Task[];
};

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, filterTasks }) => {
  const { state, toggleCalmMode, toggleDarkMode, resetPlan, toggleFavoritePage } = usePlanner();
  const [toast, setToast] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    daily: true,
    smart: true,
    tasks: false,
    health: false,
    labor: false,
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const SectionHeader = ({ id, label }: { id: string, label: string }) => {
    const isExpanded = expandedSections[id];
    return (
      <div 
        className="flex items-center justify-between cursor-pointer py-1 mt-4 mb-2 pl-3 select-none group"
        onClick={() => toggleSection(id)}
      >
        <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-light group-hover:text-charcoal transition-colors">{label}</div>
        <div className="text-light group-hover:text-charcoal flex items-center justify-center w-5 h-5 rounded hover:bg-gray-100 transition-colors mr-1">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </div>
    );
  };

  const getProgress = (tasks: Task[]) => {
    const filtered = filterTasks(tasks);
    const total = filtered.length;
    const done = filtered.filter(t => state.checked[t.id]).length;
    return { done, total };
  };

  const devTasks = [...DEV_TASKS.t1, ...DEV_TASKS.t2, ...DEV_TASKS.t3];
  const medTasks = [...MED_TASKS.t1, ...MED_TASKS.t2, ...MED_TASKS.t3, ...VACC_TASKS];
  const prepTasks = [...PREP_TASKS.t1, ...PREP_TASKS.t2, ...PREP_TASKS.t3];

  const handleSave = () => {
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const handleLogout = async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
      resetPlan();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const NavItem = ({ id, icon, label, progress, hideFavorite }: { id: string, icon: string, label: string, progress?: {done: number, total: number}, hideFavorite?: boolean }) => {
    const isActive = activePage === id;
    const isFav = state.favoritePages?.includes(id);

    return (
      <div className="group relative flex items-center mb-0.5">
        <button
          onClick={() => setActivePage(id)}
          className={`flex items-center gap-2.5 p-[10px_12px] rounded-[10px] text-[13px] font-medium cursor-pointer transition-all border-none w-full text-left
            ${isActive ? 'bg-sage-pale text-sage font-semibold' : 'bg-transparent text-medium hover:bg-sage-pale hover:text-sage'}
            ${!hideFavorite ? 'pr-8' : ''}`}
        >
          <span className="text-[16px] w-5 text-center">{icon}</span>
          {label}
          {progress && !state.isCalmModeActive && progress.total > 0 && (
            <div className="ml-auto w-12 flex flex-col gap-1 items-end">
              <span className={`text-[10px] font-semibold leading-none
                ${isActive ? 'text-sage-dark' : 'text-medium'}`}>
                {progress.done}/{progress.total}
              </span>
              <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${isActive ? 'bg-sage-dark' : 'bg-sage'} transition-all duration-300`} 
                  style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }} 
                />
              </div>
            </div>
          )}
        </button>
        {!hideFavorite && (
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavoritePage(id); }}
            className={`absolute right-2 p-1.5 rounded-md transition-opacity
              ${isFav ? 'opacity-100 text-gold' : 'opacity-0 group-hover:opacity-100 text-medium hover:text-gold hover:bg-gold/10'}`}
            title={isFav ? "Remove from Favorites" : "Add to Favorites"}
          >
            <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-gold' : ''}`} />
          </button>
        )}
      </div>
    );
  };

  const ALL_NAV_ITEMS = [
    { id: 'kickcounter', icon: '👣', label: 'Kick Counter' },
    { id: 'contractions', icon: '⏱', label: 'Contraction Timer' },
    { id: 'vitals', icon: '💙', label: 'Vitals (BP/Weight)' },
    { id: 'mood', icon: '😊', label: 'Mood Tracker' },
    { id: 'hydration', icon: '💧', label: 'Hydration' },
    { id: 'nutrition', icon: '🥗', label: 'Nutrition & Supplements' },
    { id: 'symptoms', icon: '📈', label: 'Symptom Log' },
    { id: 'askourpregnancy', icon: '✨', label: 'AskOur Pregnancy AI' },
    { id: 'foodscanner', icon: '🤖', label: 'AI Food Guide' },
    { id: 'babynames', icon: '🌟', label: 'Name Generator' },
    { id: 'dev', icon: '🌱', label: 'Development', progress: getProgress(devTasks) },
    { id: 'prep', icon: '📋', label: 'Preparation', progress: getProgress(prepTasks) },
    { id: 'finance', icon: '💰', label: 'Financial', progress: getProgress(FIN_TASKS) },
    { id: 'deadlines', icon: '📅', label: 'Deadlines', progress: getProgress(DEADLINE_TASKS) },
    { id: 'medical', icon: '🏥', label: 'Medical', progress: getProgress(medTasks) },
    { id: 'schemes', icon: '🏛', label: 'Government Schemes' },
    { id: 'readiness', icon: '🔮', label: 'Labor Readiness' },
    { id: 'hospitalbag', icon: '👜', label: 'Hospital Bag' },
    { id: 'birthplan', icon: '📜', label: 'Birth Plan Builder' },
    { id: 'decisions', icon: '✦', label: 'Decisions' },
    { id: 'postpartum', icon: '🍃', label: 'Early Parenthood' },
    { id: 'partnersync', icon: '🤝', label: 'Partner Sync' },
    { id: 'notes', icon: '📝', label: 'Notes & Journal' },
  ];

  return (
    <div className="sticky top-[80px] pt-8 no-print">
      <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-light mb-2 pl-3">Overview</div>
      <NavItem id="tracker" icon="📅" label="Pregnancy Tracker" hideFavorite />
      
      {state.favoritePages && state.favoritePages.length > 0 && (
        <div className="mt-4 mb-2">
          <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-gold mb-2 pl-3 flex items-center gap-1.5">
            <Star className="w-3 h-3 fill-gold" /> Favourites
          </div>
          <div className="space-y-0.5">
            {state.favoritePages.map(pageId => {
              const item = ALL_NAV_ITEMS.find(i => i.id === pageId);
              if (!item) return null;
              return <NavItem key={`fav-${item.id}`} id={item.id} icon={item.icon} label={item.label} progress={item.progress} hideFavorite />;
            })}
          </div>
        </div>
      )}
      
      <SectionHeader id="daily" label="Daily Health & Tracking" />
      {expandedSections['daily'] && (
        <div className="space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <NavItem id="kickcounter" icon="👣" label="Kick Counter" />
          <NavItem id="contractions" icon="⏱" label="Contraction Timer" />
          <NavItem id="vitals" icon="💙" label="Vitals (BP/Weight)" />
          <NavItem id="mood" icon="😊" label="Mood Tracker" />
          <NavItem id="hydration" icon="💧" label="Hydration" />
          <NavItem id="nutrition" icon="🥗" label="Nutrition & Supplements" />
          <NavItem id="symptoms" icon="📈" label="Symptom Log" />
        </div>
      )}

      <SectionHeader id="smart" label="Smart Tools" />
      {expandedSections['smart'] && (
        <div className="space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <NavItem id="askourpregnancy" icon="✨" label="AskOur Pregnancy AI" />
          <NavItem id="foodscanner" icon="🤖" label="AI Food Guide" />
          <NavItem id="babynames" icon="🌟" label="Name Generator" />
        </div>
      )}

      <SectionHeader id="tasks" label="Planning & Tasks" />
      {expandedSections['tasks'] && (
        <div className="space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <NavItem id="dev" icon="🌱" label="Development" progress={getProgress(devTasks)} />
          <NavItem id="prep" icon="📋" label="Preparation" progress={getProgress(prepTasks)} />
          <NavItem id="finance" icon="💰" label="Financial" progress={getProgress(FIN_TASKS)} />
          <NavItem id="deadlines" icon="📅" label="Deadlines" progress={getProgress(DEADLINE_TASKS)} />
        </div>
      )}

      <SectionHeader id="health" label="Medical & Govt" />
      {expandedSections['health'] && (
        <div className="space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <NavItem id="medical" icon="🏥" label="Medical" progress={getProgress(medTasks)} />
          <NavItem id="schemes" icon="🏛" label="Government Schemes" />
        </div>
      )}

      <SectionHeader id="labor" label="Labor & Postpartum" />
      {expandedSections['labor'] && (
        <div className="space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <NavItem id="readiness" icon="🔮" label="Labor Readiness" />
          <NavItem id="hospitalbag" icon="👜" label="Hospital Bag" />
          <NavItem id="birthplan" icon="📜" label="Birth Plan Builder" />
          <NavItem id="decisions" icon="✦" label="Decisions" />
          <NavItem id="postpartum" icon="🍃" label="Early Parenthood" />
        </div>
      )}

      <div className="h-px bg-border my-4" />
      <NavItem id="partnersync" icon="🤝" label="Partner Sync" />
      <NavItem id="notes" icon="📝" label="Notes & Journal" />
      <NavItem id="profile" icon="⚙️" label="Settings & Profile" hideFavorite />

      <button 
        onClick={() => setActivePage('feedback')}
        className={`w-full mt-2 p-2.5 bg-white border border-border rounded-[10px] font-sans text-[13px] font-medium text-charcoal cursor-pointer transition-all hover:border-sage hover:bg-sage-pale hover:text-sage flex items-center justify-between
          ${activePage === 'feedback' ? 'bg-sage-pale border-sage text-sage' : ''}`}
      >
        <span className="flex items-center gap-2">
          <span className="text-[16px]">💬</span> Feedback & Support
        </span>
      </button>

      {auth.currentUser?.email === 'sukrat.kaushik@gmail.com' && (
        <button 
          onClick={() => setActivePage('admin-feedbacks')}
          className={`w-full mt-2 p-2.5 bg-white border border-border rounded-[10px] font-sans text-[13px] font-medium text-charcoal cursor-pointer transition-all hover:border-purple-400 hover:bg-purple-50 hover:text-purple-600 flex items-center justify-between
            ${activePage === 'admin-feedbacks' ? 'bg-purple-50 border-purple-400 text-purple-600' : ''}`}
        >
          <span className="flex items-center gap-2">
            <span className="text-[16px]">👑</span> Admin: Feedbacks
          </span>
        </button>
      )}

      <div className="h-px bg-border my-4" />

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
        onClick={() => { window.location.hash = '#setup'; }}
        className="w-full mt-2 p-2.5 bg-charcoal/5 border-[1.5px] border-charcoal/20 rounded-[10px] font-sans text-[13px] font-medium text-charcoal cursor-pointer transition-all hover:bg-charcoal hover:text-white"
      >
        ⚙️ Adjust Setup
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

      <button 
        onClick={handleLogout}
        className="w-full mt-2 p-2.5 bg-white border-[1.5px] border-border rounded-[10px] font-sans text-[13px] font-medium text-critical cursor-pointer transition-all hover:border-critical/30 hover:bg-critical-bg"
      >
        🚪 Log Out
      </button>

      {/* Toast */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-charcoal text-white px-5 py-3 rounded-full text-[13px] font-medium transition-all duration-300 z-[999] shadow-lg
        ${toast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        Progress saved ✓
      </div>
    </div>
  );
};
