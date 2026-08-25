import React, { useState, useEffect } from 'react';
import { usePlanner } from '../store';
import { DEV_TASKS, MED_TASKS, PREP_TASKS, FIN_TASKS, DEADLINE_TASKS, VACC_TASKS } from '../data';
import { Task } from '../types';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { ChevronDown, ChevronRight, Star, Search, X } from 'lucide-react';

type SidebarProps = {
  activePage: string;
  setActivePage: (page: string) => void;
  filterTasks: (tasks: Task[]) => Task[];
  isMobile?: boolean;
};

const CATEGORIES: Record<string, { label: string, items: string[] }> = {
  daily: {
    label: "Tracking",
    items: ['kickcounter', 'contractions', 'vitals', 'mood', 'hydration', 'nutrition', 'symptoms']
  },
  smart: {
    label: "Smart Tools",
    items: ['askourpregnancy', 'foodscanner', 'babynames', 'travel']
  },
  tasks: {
    label: "Planning & Tasks",
    items: ['dev', 'prep', 'finance', 'deadlines']
  },
  health: {
    label: "Medical & Govt",
    items: ['medical', 'medical-reports', 'schemes']
  },
  labor: {
    label: "Labor & Postpartum",
    items: ['readiness', 'hospitalbag', 'birthplan', 'decisions', 'postpartum']
  }
};

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, filterTasks, isMobile = false }) => {
  const { state, toggleCalmMode, toggleDarkMode, resetPlan, toggleFavoritePage } = usePlanner();
  const planTier = state.planTier || (state.isPremium ? 'premium' : 'free');

  const [searchQuery, setSearchQuery] = useState('');

  // Accordion state (for desktop accordion view)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    daily: true,
    smart: true,
    tasks: false,
    health: false,
    labor: false,
  });

  // Drill-down state (for mobile category view)
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Auto-set category based on activePage (only on mobile views)
  useEffect(() => {
    if (!isMobile) return;
    const foundCategory = Object.keys(CATEGORIES).find(catId =>
      CATEGORIES[catId].items.includes(activePage)
    );
    if (foundCategory) {
      setActiveCategory(foundCategory);
    } else if (activePage === 'tracker') {
      setActiveCategory(null);
    }
  }, [activePage, isMobile]);

  const getProgress = (tasks: Task[]) => {
    const filtered = filterTasks(tasks);
    const total = filtered.length;
    const done = filtered.filter(t => state.checked[t.id]).length;
    return { done, total };
  };

  const devTasks = [...DEV_TASKS.t1, ...DEV_TASKS.t2, ...DEV_TASKS.t3];
  const medTasks = [...MED_TASKS.t1, ...MED_TASKS.t2, ...MED_TASKS.t3, ...VACC_TASKS];
  const prepTasks = [...PREP_TASKS.t1, ...PREP_TASKS.t2, ...PREP_TASKS.t3];

  const handleLogout = async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
      resetPlan();
      window.location.hash = '#';
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const NavItem = ({ id, icon, label, progress, hideFavorite }: { id: string, icon: string, label: string, progress?: { done: number, total: number }, hideFavorite?: boolean }) => {
    const isActive = activePage === id;
    const isFav = state.favoritePages?.includes(id);

    return (
      <div className="group relative flex items-center mb-0.5">
        <button
          onClick={() => {
            setActivePage(id);
            setSearchQuery('');
          }}
          className={`flex items-center gap-2.5 p-[9px_11px] rounded-[10px] text-[14px] font-semibold md:font-medium cursor-pointer transition-all w-full text-left
            ${isActive
              ? 'bg-sage-pale/60 dark:bg-sage/10 text-sage-dark dark:text-sage font-bold border border-sage/20 shadow-xs'
              : 'bg-transparent border border-transparent text-charcoal/80 hover:bg-sage-pale/40 hover:text-sage-dark dark:hover:text-sage dark:hover:bg-sage-pale/5'}
            ${!hideFavorite ? 'pr-8' : ''}`}
        >
          <span className="text-[16px] w-5 text-center shrink-0" translate="no" aria-hidden="true">{icon}</span>
          <span className="flex-1 leading-normal whitespace-normal break-words py-0.5">{label}</span>
          {progress && !state.isCalmModeActive && progress.total > 0 && (
            <div className="ml-auto w-12 flex flex-col gap-1 items-end">
              <span className={`text-[11px] font-bold leading-none
                ${isActive ? 'text-sage-dark dark:text-sage' : 'text-charcoal/65'}`}>
                {progress.done}/{progress.total}
              </span>
              <div className="w-full h-1.5 bg-charcoal/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full ${isActive ? 'bg-sage-dark dark:bg-sage' : 'bg-sage-dark/60 dark:bg-sage/60'} transition-all duration-300`}
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
              ${isFav ? 'opacity-100 text-gold' : 'opacity-0 group-hover:opacity-100 text-charcoal/60 hover:text-gold hover:bg-gold/10'}`}
            title={isFav ? "Remove from Favorites" : "Add to Favorites"}
          >
            <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-gold' : ''}`} />
          </button>
        )}
      </div>
    );
  };

  const ALL_NAV_ITEMS = [
    { id: 'tracker', icon: '📅', label: 'Pregnancy Tracker', hideFavorite: true },
    { id: 'kickcounter', icon: '👣', label: 'Kick Counter' },
    { id: 'contractions', icon: '⏱', label: 'Contraction Timer' },
    { id: 'vitals', icon: '💙', label: 'Health Metrics' },
    { id: 'mood', icon: '😊', label: 'Mood Tracker' },
    { id: 'hydration', icon: '💧', label: 'Hydration' },
    { id: 'nutrition', icon: '🥗', label: 'Nutrition' },
    { id: 'symptoms', icon: '📈', label: 'Symptom Log' },
    { id: 'askourpregnancy', icon: '✨', label: 'Bloom AI' },
    { id: 'foodscanner', icon: '🤖', label: 'AI Food Guide' },
    { id: 'babynames', icon: '🌟', label: 'Name Generator' },
    { id: 'travel', icon: '✈️', label: 'Safe Travel Guide' },
    { id: 'dev', icon: '🌱', label: 'Development', progress: getProgress(devTasks) },
    { id: 'prep', icon: '📋', label: 'Preparation', progress: getProgress(prepTasks) },
    { id: 'finance', icon: '💰', label: 'Financial', progress: getProgress(FIN_TASKS) },
    { id: 'deadlines', icon: '📅', label: 'Deadlines', progress: getProgress(DEADLINE_TASKS) },
    { id: 'medical', icon: '🏥', label: 'Medical', progress: getProgress(medTasks) },
    { id: 'medical-reports', icon: '📂', label: 'Medical Reports' },
    { id: 'schemes', icon: '🏛', label: 'Government Schemes' },
    { id: 'readiness', icon: '🔮', label: 'Labor Readiness' },
    { id: 'hospitalbag', icon: '👜', label: 'Hospital Bag' },
    { id: 'birthplan', icon: '📜', label: 'Birth Plan Builder' },
    { id: 'decisions', icon: '✦', label: 'Decisions' },
    { id: 'postpartum', icon: '🍃', label: 'Early Parenthood' },
    { id: 'partnersync', icon: '🤝', label: 'Partner Sync' },
    { id: 'notes', icon: '📝', label: 'Notes & Journal' },
    { id: 'profile', icon: '⚙️', label: 'Settings & Profile', hideFavorite: true },
    { id: 'feedback', icon: '💬', label: 'Feedback & Support', hideFavorite: true },
    ...(auth.currentUser?.email === 'sukrat.kaushik@gmail.com' ? [{ id: 'admin-feedbacks', icon: '👑', label: 'Admin: Feedbacks', hideFavorite: true }] : []),
  ];

  const isSearching = searchQuery.trim().length > 0;
  const filteredNavItems = isSearching
    ? ALL_NAV_ITEMS.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  const renderSearchInput = () => (
    <div className="relative mb-5 px-3">
      <div className="relative flex items-center group">
        <Search className="absolute left-3 w-4 h-4 text-charcoal/55 pointer-events-none transition-colors group-focus-within:text-sage-dark dark:group-focus-within:text-sage" />
        <input
          type="text"
          placeholder="Search features..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-8 py-2.5 text-[14px] font-sans font-medium rounded-[10px] border border-border/80 dark:border-border/20 bg-white dark:bg-charcoal/15 text-charcoal placeholder:text-charcoal/45 focus:outline-none focus:border-sage-dark dark:focus:border-sage focus:ring-2 focus:ring-sage/15 transition-all shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 p-1 rounded-md text-charcoal/55 hover:text-charcoal dark:hover:text-charcoal transition-all"
            title="Clear Search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );

  const renderSearchResults = () => (
    <div className="space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="text-[13px] font-bold tracking-[1px] uppercase text-sage-dark dark:text-sage mb-2 pl-3 flex items-center justify-between">
        <span>Search Results ({filteredNavItems.length})</span>
        <button onClick={() => setSearchQuery('')} className="text-charcoal/55 hover:text-sage-dark dark:hover:text-sage normal-case font-normal text-[11px] cursor-pointer">
          Clear
        </button>
      </div>
      {filteredNavItems.length > 0 ? (
        filteredNavItems.map(item => (
          <NavItem
            key={item.id}
            id={item.id}
            icon={item.icon}
            label={item.label}
            progress={item.progress}
            hideFavorite={item.hideFavorite}
          />
        ))
      ) : (
        <div className="text-[13px] text-charcoal/60 py-4 px-3 text-center italic">
          No features found matching "{searchQuery}"
        </div>
      )}
    </div>
  );

  const CategoryButton = ({ id, label }: { id: string, label: string }) => {
    return (
      <button
        onClick={() => setActiveCategory(id)}
        className="w-full flex items-center justify-between py-3.5 border-b border-border/50 dark:border-border/10 text-charcoal/85 hover:text-sage-dark dark:hover:text-sage transition-all cursor-pointer text-left group"
      >
        <span className="text-[13.5px] font-bold tracking-[1px] uppercase group-hover:translate-x-1 transition-transform duration-300 leading-normal whitespace-normal text-left flex-1">{label}</span>
        <ChevronRight className="w-4 h-4 text-charcoal/55 group-hover:text-sage-dark dark:group-hover:text-sage group-hover:translate-x-0.5 transition-all duration-300" />
      </button>
    );
  };

  // Mobile Drill-Down Layout (active sub-group view)
  if (isMobile && activeCategory && !isSearching) {
    const categoryInfo = CATEGORIES[activeCategory];
    return (
      <div className="sticky top-[80px] pt-4 md:pt-8 no-print">
        {renderSearchInput()}
        <button
          onClick={() => setActiveCategory(null)}
          className="flex items-center gap-1.5 text-[12.5px] font-bold tracking-[1px] uppercase text-sage-dark dark:text-sage hover:text-sage dark:hover:text-sage-light mb-4 cursor-pointer px-3"
        >
          ← Back to Categories
        </button>
        <div className="text-[13px] font-bold tracking-[1px] uppercase text-charcoal/60 mb-3 pl-3">
          {categoryInfo.label}
        </div>
        <div className="space-y-0.5 animate-in fade-in slide-in-from-left-2 duration-300">
          {categoryInfo.items.map(itemId => {
            const item = ALL_NAV_ITEMS.find(i => i.id === itemId);
            if (!item) return null;
            return <NavItem key={item.id} id={item.id} icon={item.icon} label={item.label} progress={item.progress} />;
          })}
        </div>
      </div>
    );
  }

  // Mobile Drill-Down Layout (main category list view)
  if (isMobile) {
    return (
      <div className="sticky top-[80px] pt-4 md:pt-8 no-print">
        {renderSearchInput()}

        {isSearching ? (
          renderSearchResults()
        ) : (
          <>
            <div className="text-[13px] font-bold tracking-[1px] uppercase text-charcoal/60 mb-2 pl-3 leading-normal whitespace-normal">Overview</div>
            <NavItem id="tracker" icon="📅" label="Pregnancy Tracker" hideFavorite />

            {state.favoritePages && state.favoritePages.length > 0 && (
              <div className="mt-4 mb-2">
                <div className="text-[13px] font-bold tracking-[1px] uppercase text-gold mb-2 pl-3 flex items-center gap-1.5">
                  ★ Favourites
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

            <div className="mt-4 mb-2">
              <div className="text-[13px] font-bold tracking-[1px] uppercase text-charcoal/60 mb-1.5 pl-3 leading-normal whitespace-normal">Features</div>
              <div className="flex flex-col">
                {Object.keys(CATEGORIES).map(catId => (
                  <CategoryButton key={catId} id={catId} label={CATEGORIES[catId].label} />
                ))}
              </div>
            </div>

            <div className="h-px bg-border/50 dark:bg-border/10 my-4" />
            <NavItem id="partnersync" icon="🤝" label="Partner Sync" />
            <NavItem id="notes" icon="📝" label="Notes & Journal" />
            <NavItem id="profile" icon="⚙️" label="Settings & Profile" hideFavorite />

            <button
              onClick={() => setActivePage('feedback')}
              className={`w-full mt-2 p-2.5 bg-white dark:bg-charcoal/10 border border-border/60 dark:border-border/10 rounded-[10px] font-sans text-[13.5px] font-medium text-charcoal/85 cursor-pointer transition-all hover:border-sage hover:bg-sage-pale/40 hover:text-sage-dark dark:hover:text-sage flex items-center justify-between
                ${activePage === 'feedback' ? 'bg-sage-pale border-sage text-sage-dark dark:text-sage font-bold' : ''}`}
            >
              <span className="flex items-center gap-2">
                <span className="text-[16px]">💬</span> Feedback & Support
              </span>
            </button>

            {auth.currentUser?.email === 'sukrat.kaushik@gmail.com' && (
              <button
                onClick={() => setActivePage('admin-feedbacks')}
                className={`w-full mt-2 p-2.5 bg-white dark:bg-charcoal/10 border border-border/60 dark:border-border/10 rounded-[10px] font-sans text-[13.5px] font-medium text-charcoal/85 cursor-pointer transition-all hover:border-purple-400 hover:bg-purple-50 hover:text-purple-600 flex items-center justify-between
                  ${activePage === 'admin-feedbacks' ? 'bg-purple-50 border-purple-400 text-purple-600 font-bold' : ''}`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-[16px]">👑</span> Admin: Feedbacks
                </span>
              </button>
            )}
          </>
        )}

        <div className="h-px bg-border/50 dark:bg-border/10 my-4" />

        <button
          onClick={toggleCalmMode}
          className={`w-full mt-3 p-2.5 border-[1.5px] rounded-[10px] font-sans text-[13.5px] font-medium cursor-pointer transition-all flex items-center justify-between
            ${state.isCalmModeActive ? 'bg-sage-pale border-sage text-sage-dark dark:text-sage font-bold' : 'bg-white dark:bg-charcoal/10 border-border dark:border-border/10 text-charcoal/85 hover:border-sage-light'}`}
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
          className={`w-full mt-2 p-2.5 border-[1.5px] rounded-[10px] font-sans text-[13.5px] font-medium cursor-pointer transition-all flex items-center justify-between
            ${state.isDarkModeActive ? 'bg-sage-pale border-sage text-sage-dark dark:text-sage font-bold' : 'bg-white dark:bg-charcoal/10 border-border dark:border-border/10 text-charcoal/85 hover:border-charcoal'}`}
        >
          <span className="flex items-center gap-2">
            <span className="text-[16px]">{state.isDarkModeActive ? '🌙' : '☀️'}</span> Dark Mode
          </span>
          <div className={`w-8 h-4 rounded-full relative transition-colors ${state.isDarkModeActive ? 'bg-sage' : 'bg-border'}`}>
            <div className={`absolute top-[2px] w-3 h-3 rounded-full bg-white transition-all shadow-sm ${state.isDarkModeActive ? 'left-[18px]' : 'left-[2px]'}`} />
          </div>
        </button>

        <button
          onClick={() => { window.location.hash = '#setup'; }}
          className="w-full mt-2 p-2.5 bg-charcoal/5 border-[1.5px] border-charcoal/20 rounded-[10px] font-sans text-[13.5px] font-medium text-charcoal/85 cursor-pointer transition-all hover:bg-charcoal hover:text-cream"
        >
          ⚙️ Adjust Setup
        </button>

        {planTier === 'free' ? (
          <button
            onClick={() => { window.location.hash = '#checkout?plan=premium'; }}
            className="w-full mt-2 p-2.5 bg-yellow-500/10 dark:bg-yellow-500/20 border border-gold/40 rounded-[10px] font-sans text-[13.5px] font-bold text-yellow-700 dark:text-gold cursor-pointer transition-all hover:bg-gold hover:text-charcoal flex items-center justify-between shadow-xs animate-pulse"
          >
            <span className="flex items-center gap-1.5">
              <span>✨</span> Upgrade to Premium
            </span>
            <span>➜</span>
          </button>
        ) : planTier === 'standard' ? (
          <div className="w-full mt-2 p-2.5 bg-sage-pale/40 dark:bg-sage/10 border border-sage/20 rounded-[10px] font-sans text-[12.5px] font-semibold text-sage flex items-center gap-2">
            <span>🩺</span> Standard Plan Active
          </div>
        ) : (
          <div className="w-full mt-2 p-2.5 bg-yellow-500/10 dark:bg-yellow-500/20 border border-gold/20 rounded-[10px] font-sans text-[12.5px] font-bold text-yellow-700 dark:text-gold flex items-center gap-2">
            <span>👑</span> AI Premium Active
          </div>
        )}

        <button
          onClick={() => {
            import('../utils/pdfExport').then(module => {
              module.exportToPDF(state);
            });
          }}
          className="w-full mt-2 p-2.5 bg-sage-pale border-[1.5px] border-sage rounded-[10px] font-sans text-[13.5px] font-medium text-sage-dark dark:text-sage cursor-pointer transition-all hover:bg-sage-dark hover:text-white dark:hover:bg-sage dark:hover:text-charcoal"
        >
          📄 Export Care Plan PDF
        </button>

        <button
          onClick={handleLogout}
          className="w-full mt-2 p-2.5 bg-white dark:bg-charcoal/10 border-[1.5px] border-border dark:border-border/10 rounded-[10px] font-sans text-[13.5px] font-medium text-critical cursor-pointer transition-all hover:border-critical/30 hover:bg-critical-bg"
        >
          🚪 Log Out
        </button>
      </div>
    );
  }

  // Desktop Accordion Layout
  const SectionHeader = ({ id, label }: { id: string, label: string }) => {
    const isExpanded = expandedSections[id];
    return (
      <div
        className="flex items-center justify-between cursor-pointer py-1 mt-4 mb-2 pl-3 select-none group"
        onClick={() => setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }))}
      >
        <div className="text-[13px] font-bold tracking-[1px] uppercase text-charcoal/60 group-hover:text-sage-dark dark:group-hover:text-sage transition-colors leading-normal whitespace-normal text-left flex-1">{label}</div>
        <div className="text-charcoal/55 group-hover:text-sage-dark dark:group-hover:text-sage flex items-center justify-center w-5 h-5 rounded hover:bg-gray-100 dark:hover:bg-charcoal/20 transition-colors mr-1">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </div>
    );
  };

  return (
    <div className="pt-8 no-print">
      {renderSearchInput()}

      {isSearching ? (
        renderSearchResults()
      ) : (
        <>
          <div className="text-[13px] font-bold tracking-[1px] uppercase text-charcoal/60 mb-2 pl-3 leading-normal whitespace-normal">Overview</div>
          <NavItem id="tracker" icon="📅" label="Pregnancy Tracker" hideFavorite />

          {state.favoritePages && state.favoritePages.length > 0 && (
            <div className="mt-4 mb-2">
              <div className="text-[13px] font-bold tracking-[1px] uppercase text-gold mb-2 pl-3 flex items-center gap-1.5">
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

          <SectionHeader id="daily" label="Tracking" />
          {expandedSections['daily'] && (
            <div className="space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
              {CATEGORIES.daily.items.map(itemId => {
                const item = ALL_NAV_ITEMS.find(i => i.id === itemId);
                if (!item) return null;
                return <NavItem key={item.id} id={item.id} icon={item.icon} label={item.label} progress={item.progress} />;
              })}
            </div>
          )}

          <SectionHeader id="smart" label="Smart Tools" />
          {expandedSections['smart'] && (
            <div className="space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
              {CATEGORIES.smart.items.map(itemId => {
                const item = ALL_NAV_ITEMS.find(i => i.id === itemId);
                if (!item) return null;
                return <NavItem key={item.id} id={item.id} icon={item.icon} label={item.label} progress={item.progress} />;
              })}
            </div>
          )}

          <SectionHeader id="tasks" label="Planning & Tasks" />
          {expandedSections['tasks'] && (
            <div className="space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
              {CATEGORIES.tasks.items.map(itemId => {
                const item = ALL_NAV_ITEMS.find(i => i.id === itemId);
                if (!item) return null;
                return <NavItem key={item.id} id={item.id} icon={item.icon} label={item.label} progress={item.progress} />;
              })}
            </div>
          )}

          <SectionHeader id="health" label="Medical & Govt" />
          {expandedSections['health'] && (
            <div className="space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
              {CATEGORIES.health.items.map(itemId => {
                const item = ALL_NAV_ITEMS.find(i => i.id === itemId);
                if (!item) return null;
                return <NavItem key={item.id} id={item.id} icon={item.icon} label={item.label} progress={item.progress} />;
              })}
            </div>
          )}

          <SectionHeader id="labor" label="Labor & Postpartum" />
          {expandedSections['labor'] && (
            <div className="space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
              {CATEGORIES.labor.items.map(itemId => {
                const item = ALL_NAV_ITEMS.find(i => i.id === itemId);
                if (!item) return null;
                return <NavItem key={item.id} id={item.id} icon={item.icon} label={item.label} progress={item.progress} />;
              })}
            </div>
          )}

          <div className="h-px bg-border my-4" />
          <NavItem id="partnersync" icon="🤝" label="Partner Sync" />
          <NavItem id="notes" icon="📝" label="Notes & Journal" />
          <NavItem id="profile" icon="⚙️" label="Settings & Profile" hideFavorite />

          <button
            onClick={() => setActivePage('feedback')}
            className={`w-full mt-2 p-2.5 bg-white border border-border rounded-[10px] font-sans text-[13.5px] font-medium text-charcoal cursor-pointer transition-all hover:border-sage hover:bg-sage-pale/40 hover:text-sage-dark flex items-center justify-between
              ${activePage === 'feedback' ? 'bg-sage-pale border-sage text-sage-dark font-bold' : ''}`}
          >
            <span className="flex items-center gap-2">
              <span className="text-[16px]">💬</span> Feedback & Support
            </span>
          </button>

          {auth.currentUser?.email === 'sukrat.kaushik@gmail.com' && (
            <button
              onClick={() => setActivePage('admin-feedbacks')}
              className={`w-full mt-2 p-2.5 bg-white border border-border rounded-[10px] font-sans text-[13.5px] font-medium text-charcoal cursor-pointer transition-all hover:border-purple-400 hover:bg-purple-50 hover:text-purple-600 flex items-center justify-between
                ${activePage === 'admin-feedbacks' ? 'bg-purple-50 border-purple-400 text-purple-600 font-bold' : ''}`}
            >
              <span className="flex items-center gap-2">
                <span className="text-[16px]">👑</span> Admin: Feedbacks
              </span>
            </button>
          )}
        </>
      )}

      <div className="h-px bg-border my-4" />

      <button
        onClick={toggleCalmMode}
        className={`w-full mt-3 p-2.5 border-[1.5px] rounded-[10px] font-sans text-[13.5px] font-medium cursor-pointer transition-all flex items-center justify-between
          ${state.isCalmModeActive ? 'bg-sage-pale border-sage text-sage-dark font-bold' : 'bg-white border-border text-charcoal hover:border-sage-light'}`}
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
        className={`w-full mt-2 p-2.5 border-[1.5px] rounded-[10px] font-sans text-[13.5px] font-medium cursor-pointer transition-all flex items-center justify-between
          ${state.isDarkModeActive ? 'bg-sage-pale border-sage text-sage-dark font-bold' : 'bg-white border-border text-charcoal hover:border-charcoal'}`}
      >
        <span className="flex items-center gap-2">
          <span className="text-[16px]">{state.isDarkModeActive ? '🌙' : '☀️'}</span> Dark Mode
        </span>
        <div className={`w-8 h-4 rounded-full relative transition-colors ${state.isDarkModeActive ? 'bg-sage' : 'bg-border'}`}>
          <div className={`absolute top-[2px] w-3 h-3 rounded-full bg-white transition-all shadow-sm ${state.isDarkModeActive ? 'left-[18px]' : 'left-[2px]'}`} />
        </div>
      </button>

      <button
        onClick={() => { window.location.hash = '#setup'; }}
        className="w-full mt-2 p-2.5 bg-charcoal/5 border-[1.5px] border-charcoal/20 rounded-[10px] font-sans text-[13.5px] font-medium text-charcoal cursor-pointer transition-all hover:bg-charcoal hover:text-cream"
      >
        ⚙️ Adjust Setup
      </button>

      {planTier === 'free' ? (
        <button
          onClick={() => { window.location.hash = '#checkout?plan=premium'; }}
          className="w-full mt-2 p-2.5 bg-yellow-500/10 dark:bg-yellow-500/20 border border-gold/40 rounded-[10px] font-sans text-[13.5px] font-bold text-yellow-700 dark:text-gold cursor-pointer transition-all hover:bg-gold hover:text-charcoal flex items-center justify-between shadow-xs animate-pulse"
        >
          <span className="flex items-center gap-1.5">
            <span>✨</span> Upgrade to Premium
          </span>
          <span>➜</span>
        </button>
      ) : planTier === 'standard' ? (
        <div className="w-full mt-2 p-2.5 bg-sage-pale/40 dark:bg-sage/10 border border-sage/20 rounded-[10px] font-sans text-[12.5px] font-semibold text-sage flex items-center gap-2">
          <span>🩺</span> Standard Plan Active
        </div>
      ) : (
        <div className="w-full mt-2 p-2.5 bg-yellow-500/10 dark:bg-yellow-500/20 border border-gold/20 rounded-[10px] font-sans text-[12.5px] font-bold text-yellow-700 dark:text-gold flex items-center gap-2">
          <span>👑</span> AI Premium Active
        </div>
      )}

      <button
        onClick={() => {
          import('../utils/pdfExport').then(module => {
            module.exportToPDF(state);
          });
        }}
        className="w-full mt-2 p-2.5 bg-sage-pale border-[1.5px] border-sage rounded-[10px] font-sans text-[13.5px] font-medium text-sage-dark cursor-pointer transition-all hover:bg-sage-dark hover:text-white"
      >
        📄 Export Care Plan PDF
      </button>

      <button
        onClick={handleLogout}
        className="w-full mt-2 p-2.5 bg-white border-[1.5px] border-border rounded-[10px] font-sans text-[13.5px] font-medium text-critical cursor-pointer transition-all hover:border-critical/30 hover:bg-critical-bg"
      >
        🚪 Log Out
      </button>

    </div>
  );
};
