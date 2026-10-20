import React, { useState, useEffect } from 'react';
import { usePlanner } from '../store';
import { DEV_TASKS, MED_TASKS, PREP_TASKS, FIN_TASKS, DEADLINE_TASKS, VACC_TASKS } from '../data';
import { Task } from '../types';
import { auth, signInWithGoogle } from '../firebase';
import { signOut } from 'firebase/auth';
import { saveJourney } from '../cloudSync';
import { ChevronDown, ChevronRight, Star, Search, X } from 'lucide-react';
import { navigate } from '../utils/navigation';

type SidebarProps = {
  activePage: string;
  setActivePage: (page: string) => void;
  filterTasks: (tasks: Task[]) => Task[];
  isMobile?: boolean;
};

const CATEGORIES: Record<string, { label: string, items: string[] }> = {
  daily: {
    label: "Daily Logs",
    items: ['kickcounter', 'contractions', 'vitals', 'mood', 'hydration', 'nutrition', 'symptoms', 'partnersync', 'notes']
  },
  smart: {
    label: "Smart Tools",
    items: ['askourpregnancy', 'foodscanner', 'babynames', 'travel', 'breathing']
  },
  tasks: {
    label: "Planning & Tasks",
    items: ['dev', 'baby-prep-bag', 'cost-schemes']
  },
  health: {
    label: "Medical & Clinical",
    items: ['medical-schedule', 'medical-reports']
  },
  labor: {
    label: "Labor & Postpartum",
    items: ['birthplan', 'postpartum']
  }
};

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, filterTasks, isMobile = false }) => {
  const { state, toggleDarkMode, resetPlan, toggleFavoritePage, restoreJourney } = usePlanner();
  const planTier = state.planTier || (state.isPremium ? 'premium' : 'free');

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'pro'>('all');

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

  // Auto-set category based on activePage (for mobile drawer AND desktop accordion auto-expand)
  useEffect(() => {
    const foundCategory = Object.keys(CATEGORIES).find(catId =>
      CATEGORIES[catId].items.includes(activePage)
    );
    if (foundCategory) {
      if (isMobile) {
        setActiveCategory(foundCategory);
      } else {
        setExpandedSections(prev => ({ ...prev, [foundCategory]: true }));
      }
    } else if (activePage === 'tracker' && isMobile) {
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
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const ALL_NAV_ITEMS: Array<{
    id: string;
    icon: string;
    label: string;
    tier: 'free' | 'pro';
    progress?: { done: number; total: number };
    hideFavorite?: boolean;
  }> = [
    { id: 'tracker', icon: '🌸', label: 'My Journey', tier: 'free', hideFavorite: true },
    { id: 'kickcounter', icon: '👣', label: 'Kick Counter', tier: 'free' },
    { id: 'contractions', icon: '⏱', label: 'Contraction Timer', tier: 'free' },
    { id: 'vitals', icon: '💙', label: 'Health Metrics', tier: 'free' },
    { id: 'mood', icon: '😊', label: 'Mood Tracker', tier: 'free' },
    { id: 'hydration', icon: '💧', label: 'Hydration', tier: 'free' },
    { id: 'nutrition', icon: '🥗', label: 'Nutrition', tier: 'free' },
    { id: 'symptoms', icon: '📈', label: 'Symptom Log', tier: 'free' },
    { id: 'partnersync', icon: '🤝', label: 'Partner Sync', tier: 'pro' },
    { id: 'notes', icon: '📝', label: 'Notes & Journal', tier: 'free' },
    { id: 'askourpregnancy', icon: '✨', label: 'OPIN AI', tier: 'pro' },
    { id: 'foodscanner', icon: '🤖', label: 'AI Food Guide', tier: 'pro' },
    { id: 'babynames', icon: '🌟', label: 'Name Generator', tier: 'free' },
    { id: 'travel', icon: '✈️', label: 'Safe Travel Guide', tier: 'free' },
    { id: 'breathing', icon: '🌬️', label: 'Breathing & Garbh Sanskar', tier: 'free' },
    { id: 'dev', icon: '🌱', label: 'Development', tier: 'free', progress: getProgress(devTasks) },
    { id: 'medical-schedule', icon: '🏥', label: 'Visits & Vaccines', tier: 'free', progress: getProgress(DEADLINE_TASKS) },
    { id: 'baby-prep-bag', icon: '👜', label: 'Hospital Bag & Prep', tier: 'free', progress: getProgress(prepTasks) },
    { id: 'cost-schemes', icon: '💰', label: 'Costs & Govt Schemes', tier: 'free', progress: getProgress(FIN_TASKS) },
    { id: 'prep', icon: '📋', label: 'Preparation', tier: 'free', progress: getProgress(prepTasks) },
    { id: 'finance', icon: '💰', label: 'Financial', tier: 'free', progress: getProgress(FIN_TASKS) },
    { id: 'deadlines', icon: '📅', label: 'Deadlines', tier: 'free', progress: getProgress(DEADLINE_TASKS) },
    { id: 'medical', icon: '🏥', label: 'Medical', tier: 'free', progress: getProgress(medTasks) },
    { id: 'medical-reports', icon: '📂', label: 'Medical Reports', tier: 'pro' },
    { id: 'schemes', icon: '🏛', label: 'Government Schemes', tier: 'free' },
    { id: 'hospitalbag', icon: '👜', label: 'Hospital Bag', tier: 'free' },
    { id: 'birthplan', icon: '📜', label: 'Birth Plan Builder', tier: 'free' },
    { id: 'postpartum', icon: '🍃', label: 'Early Parenthood', tier: 'free' },
    { id: 'profile', icon: '⚙️', label: 'Settings & Profile', tier: 'free', hideFavorite: true },
    { id: 'feedback', icon: '💬', label: 'Feedback & Support', tier: 'free', hideFavorite: true },
    ...(state.isAdmin || auth.currentUser?.email === 'sukrat.kaushik@gmail.com' || auth.currentUser?.email === 'sukrat.kaushik@ourpregnancy.in' ? [{ id: 'admin-panel', icon: '👑', label: 'Admin Suite', tier: 'pro' as const, hideFavorite: true }] : []),
  ];

  const NavItem = ({
    id,
    icon,
    label,
    tier,
    progress,
    hideFavorite
  }: {
    id: string;
    icon: string;
    label: string;
    tier?: 'free' | 'pro';
    progress?: { done: number; total: number };
    hideFavorite?: boolean;
  }) => {
    const isActive = activePage === id;
    const isFav = state.favoritePages?.includes(id);
    const effectiveTier = tier || ALL_NAV_ITEMS.find(i => i.id === id)?.tier || 'free';

    return (
      <div className="group relative flex items-center mb-0.5">
        <button
          onClick={() => {
            setActivePage(id);
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 p-[8.5px_10px] rounded-[10px] text-[13.5px] font-semibold md:font-medium cursor-pointer transition-all w-full text-left
            ${isActive
              ? 'bg-sage-pale/60 dark:bg-sage/10 text-sage-dark dark:text-sage font-bold border border-sage/20 shadow-xs'
              : 'bg-transparent border border-transparent text-charcoal/80 hover:bg-sage-pale/40 hover:text-sage-dark dark:hover:text-sage dark:hover:bg-sage-pale/5'}
            ${!hideFavorite ? 'pr-8' : ''}`}
        >
          <span className="text-[15px] w-5 text-center shrink-0" translate="no" aria-hidden="true">{icon}</span>
          <span className="flex-1 leading-snug whitespace-normal break-words py-0.5">{label}</span>

          {/* Progress (for checklist tasks) */}
          {progress && progress.total > 0 ? (
            <div className="ml-auto min-w-[52px] flex flex-col gap-0.5 items-end shrink-0">
              <span className={`text-[10px] font-bold leading-none flex items-center gap-1
                ${isActive ? 'text-sage-dark dark:text-sage' : 'text-charcoal/65'}`}>
                <span className="text-[8.5px] uppercase font-semibold text-sage-dark/80 dark:text-sage">Free</span>
                <span className="opacity-40">•</span>
                <span>{progress.done}/{progress.total}</span>
              </span>
              <div className="w-full h-1 bg-charcoal/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full ${isActive ? 'bg-sage-dark dark:bg-sage' : 'bg-sage-dark/60 dark:bg-sage/60'} transition-all duration-300`}
                  style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            /* Tier Badge (Pro vs Free) */
            <span
              className={`ml-auto shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded leading-none transition-transform
                ${effectiveTier === 'pro'
                  ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 shadow-3xs font-extrabold'
                  : 'bg-sage/10 text-sage-dark dark:text-sage border border-sage/20 font-semibold'}`}
            >
              {effectiveTier === 'pro' ? 'PRO' : 'FREE'}
            </span>
          )}
        </button>
        {!hideFavorite && (
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavoritePage(id); }}
            className={`absolute right-1.5 p-1 rounded-md transition-opacity
              ${isFav ? 'opacity-100 text-gold' : 'opacity-0 group-hover:opacity-100 text-charcoal/60 hover:text-gold hover:bg-gold/10'}`}
            title={isFav ? "Remove from Favorites" : "Add to Favorites"}
          >
            <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-gold' : ''}`} />
          </button>
        )}
      </div>
    );
  };

  const isSearching = searchQuery.trim().length > 0;
  const filteredNavItems = ALL_NAV_ITEMS.filter(item => {
    const matchesSearch = !isSearching || item.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'all' || item.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const getCategoryVisibleItems = (catId: string) => {
    return CATEGORIES[catId].items
      .map(itemId => ALL_NAV_ITEMS.find(i => i.id === itemId))
      .filter((item): item is NonNullable<typeof item> => {
        if (!item) return false;
        if (tierFilter !== 'all' && item.tier !== tierFilter) return false;
        return true;
      });
  };

  const renderTierFilter = () => (
    <div className="flex items-center gap-1.5 mb-3 px-3">
      {(['all', 'free', 'pro'] as const).map(tier => {
        const isSelected = tierFilter === tier;
        return (
          <button
            key={tier}
            type="button"
            onClick={() => setTierFilter(tier)}
            className={`flex-1 py-1.5 px-1.5 text-[11px] font-bold rounded-lg transition-all capitalize cursor-pointer border text-center leading-none
              ${isSelected
                ? tier === 'pro'
                  ? 'bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-500/40 shadow-xs'
                  : tier === 'free'
                    ? 'bg-sage-pale text-sage-dark dark:bg-sage/20 dark:text-sage border-sage/40 shadow-xs'
                    : 'bg-charcoal/10 dark:bg-white/10 text-charcoal dark:text-cream border-charcoal/20 shadow-xs'
                : 'bg-white/60 dark:bg-charcoal/10 text-charcoal/60 dark:text-stone-300 hover:text-charcoal border-border/60 hover:bg-white'}`}
          >
            {tier === 'all' ? 'All' : tier === 'free' ? 'Free' : 'Pro'}
          </button>
        );
      })}
    </div>
  );

  const renderSearchInput = () => (
    <div className="relative mb-2 px-3">
      <div className="relative flex items-center group">
        <Search className="absolute left-3 w-4 h-4 text-charcoal/55 pointer-events-none transition-colors group-focus-within:text-sage-dark dark:group-focus-within:text-sage" />
        <input
          type="text"
          placeholder="Search features..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-8 py-2 text-[13.5px] font-sans font-medium rounded-[10px] border border-border/80 dark:border-border/20 bg-white dark:bg-charcoal/15 text-charcoal placeholder:text-charcoal/45 focus:outline-none focus:border-sage-dark dark:focus:border-sage focus:ring-2 focus:ring-sage/15 transition-all shadow-xs"
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
        {renderTierFilter()}
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
            if (tierFilter !== 'all' && item.tier !== tierFilter) return null;
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
        {renderTierFilter()}

        {isSearching ? (
          renderSearchResults()
        ) : (
          <>
            {(tierFilter === 'all' || tierFilter === 'free') && (
              <NavItem id="tracker" icon="🌸" label="My Journey" hideFavorite />
            )}

            {state.favoritePages && state.favoritePages.length > 0 && (
              <div className="mt-4 mb-2">
                <div className="text-[13px] font-bold tracking-[1px] uppercase text-gold mb-2 pl-3 flex items-center gap-1.5">
                  ★ Favourites
                </div>
                <div className="space-y-0.5">
                  {state.favoritePages
                    .filter(pageId => {
                      if (tierFilter === 'all') return true;
                      const item = ALL_NAV_ITEMS.find(i => i.id === pageId);
                      return item?.tier === tierFilter;
                    })
                    .map(pageId => {
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
                {Object.keys(CATEGORIES).map(catId => {
                  if (getCategoryVisibleItems(catId).length === 0) return null;
                  return <CategoryButton key={catId} id={catId} label={CATEGORIES[catId].label} />;
                })}
              </div>
            </div>

            <div className="h-px bg-border/50 dark:bg-border/10 my-4" />
            {(tierFilter === 'all' || tierFilter === 'pro') && (
              <NavItem id="partnersync" icon="🤝" label="Partner Sync" />
            )}
            {(tierFilter === 'all' || tierFilter === 'free') && (
              <NavItem id="notes" icon="📝" label="Notes & Journal" />
            )}
          </>
        )}

        <div className="h-px bg-border/50 dark:bg-border/10 my-4" />

        <div className="space-y-2">
          <button
            onClick={toggleDarkMode}
            className={`w-full py-2.5 px-3.5 border border-border/80 dark:border-border/20 rounded-[10px] font-sans text-[13px] font-medium cursor-pointer transition-all flex items-center justify-between shadow-xs
              ${state.isDarkModeActive ? 'bg-sage-pale/60 border-sage/40 text-sage-dark dark:text-sage font-bold' : 'bg-white dark:bg-charcoal/15 text-charcoal/85 hover:border-charcoal'}`}
          >
            <span className="flex items-center gap-2">
              <span className="text-[15px]">{state.isDarkModeActive ? '🌙' : '☀️'}</span> Dark Mode
            </span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${state.isDarkModeActive ? 'bg-sage' : 'bg-border'}`}>
              <div className={`absolute top-[2px] w-3 h-3 rounded-full bg-white transition-all shadow-sm ${state.isDarkModeActive ? 'left-[18px]' : 'left-[2px]'}`} />
            </div>
          </button>

          {planTier === 'premium' || state.isPremium || state.isAdmin ? (
            <div className="w-full py-2.5 px-3.5 bg-yellow-500/10 dark:bg-yellow-500/20 border border-gold/20 rounded-[10px] font-sans text-[12.5px] font-bold text-yellow-700 dark:text-gold flex items-center gap-2 shadow-xs">
              <span>👑</span> Pro Plan Active
            </div>
          ) : (
            <button
              onClick={() => { navigate('/checkout?plan=premium'); }}
              className="w-full py-2.5 px-3.5 bg-yellow-500/10 dark:bg-yellow-500/20 border border-gold/40 rounded-[10px] font-sans text-[13px] font-bold text-yellow-700 dark:text-gold cursor-pointer transition-all hover:bg-gold hover:text-charcoal flex items-center justify-between shadow-xs"
            >
              <span className="flex items-center gap-2">
                <span>✨</span> Upgrade to Pro Plan
              </span>
              <span>➜</span>
            </button>
          )}

          <button
            onClick={() => {
              import('../utils/pdfExport').then(module => {
                module.exportToPDF(state);
              });
            }}
            className="w-full py-2.5 px-3.5 bg-white dark:bg-charcoal/15 border border-border/80 dark:border-border/20 rounded-[10px] font-sans text-[13px] font-medium text-charcoal/85 hover:text-sage-dark hover:bg-sage-pale/40 hover:border-sage/30 transition-all flex items-center gap-2.5 cursor-pointer text-left shadow-xs"
          >
            <span>📄</span>
            <span>Export Care Plan PDF</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-3.5 bg-white dark:bg-charcoal/15 border border-border/80 dark:border-border/20 rounded-[10px] font-sans text-[13px] font-medium text-critical/85 hover:text-critical hover:bg-critical-bg hover:border-critical/30 transition-all flex items-center gap-2.5 cursor-pointer text-left shadow-xs"
          >
            <span>🚪</span>
            <span>Log Out</span>
          </button>
        </div>
      </div>
    );
  }

  // Desktop Accordion Layout
  const SectionHeader = ({ id, label }: { id: string, label: string }) => {
    const isExpanded = expandedSections[id];
    const visibleCount = getCategoryVisibleItems(id).length;
    if (visibleCount === 0) return null;

    return (
      <div
        className="flex items-center justify-between cursor-pointer py-1 mt-4 mb-2 pl-3 select-none group"
        onClick={() => setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }))}
      >
        <div className="text-[13px] font-bold tracking-[1px] uppercase text-charcoal/60 group-hover:text-sage-dark dark:group-hover:text-sage transition-colors leading-normal whitespace-normal text-left flex-1">
          {label}
        </div>
        <div className="text-charcoal/55 group-hover:text-sage-dark dark:group-hover:text-sage flex items-center justify-center w-5 h-5 rounded hover:bg-gray-100 dark:hover:bg-charcoal/20 transition-colors mr-1">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </div>
    );
  };

  return (
    <div className="pt-8 no-print">
      {renderSearchInput()}
      {renderTierFilter()}

      {isSearching ? (
        renderSearchResults()
      ) : (
        <>
          {(tierFilter === 'all' || tierFilter === 'free') && (
            <NavItem id="tracker" icon="🌸" label="My Journey" hideFavorite />
          )}

          {state.favoritePages && state.favoritePages.length > 0 && (
            <div className="mt-4 mb-2">
              <div className="text-[13px] font-bold tracking-[1px] uppercase text-gold mb-2 pl-3 flex items-center gap-1.5">
                <Star className="w-3 h-3 fill-gold" /> Favourites
              </div>
              <div className="space-y-0.5">
                {state.favoritePages
                  .filter(pageId => {
                    if (tierFilter === 'all') return true;
                    const item = ALL_NAV_ITEMS.find(i => i.id === pageId);
                    return item?.tier === tierFilter;
                  })
                  .map(pageId => {
                    const item = ALL_NAV_ITEMS.find(i => i.id === pageId);
                    if (!item) return null;
                    return <NavItem key={`fav-${item.id}`} id={item.id} icon={item.icon} label={item.label} progress={item.progress} hideFavorite />;
                  })}
              </div>
            </div>
          )}

          {getCategoryVisibleItems('daily').length > 0 && (
            <>
              <SectionHeader id="daily" label="Daily Logs" />
              {expandedSections['daily'] && (
                <div className="space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  {CATEGORIES.daily.items.map(itemId => {
                    const item = ALL_NAV_ITEMS.find(i => i.id === itemId);
                    if (!item) return null;
                    if (tierFilter !== 'all' && item.tier !== tierFilter) return null;
                    return <NavItem key={item.id} id={item.id} icon={item.icon} label={item.label} progress={item.progress} />;
                  })}
                </div>
              )}
            </>
          )}

          {getCategoryVisibleItems('smart').length > 0 && (
            <>
              <SectionHeader id="smart" label="Smart Tools" />
              {expandedSections['smart'] && (
                <div className="space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  {CATEGORIES.smart.items.map(itemId => {
                    const item = ALL_NAV_ITEMS.find(i => i.id === itemId);
                    if (!item) return null;
                    if (tierFilter !== 'all' && item.tier !== tierFilter) return null;
                    return <NavItem key={item.id} id={item.id} icon={item.icon} label={item.label} progress={item.progress} />;
                  })}
                </div>
              )}
            </>
          )}

          {getCategoryVisibleItems('tasks').length > 0 && (
            <>
              <SectionHeader id="tasks" label="Planning & Tasks" />
              {expandedSections['tasks'] && (
                <div className="space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  {CATEGORIES.tasks.items.map(itemId => {
                    const item = ALL_NAV_ITEMS.find(i => i.id === itemId);
                    if (!item) return null;
                    if (tierFilter !== 'all' && item.tier !== tierFilter) return null;
                    return <NavItem key={item.id} id={item.id} icon={item.icon} label={item.label} progress={item.progress} />;
                  })}
                </div>
              )}
            </>
          )}

          {getCategoryVisibleItems('health').length > 0 && (
            <>
              <SectionHeader id="health" label="Medical & Govt" />
              {expandedSections['health'] && (
                <div className="space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  {CATEGORIES.health.items.map(itemId => {
                    const item = ALL_NAV_ITEMS.find(i => i.id === itemId);
                    if (!item) return null;
                    if (tierFilter !== 'all' && item.tier !== tierFilter) return null;
                    return <NavItem key={item.id} id={item.id} icon={item.icon} label={item.label} progress={item.progress} />;
                  })}
                </div>
              )}
            </>
          )}

          {getCategoryVisibleItems('labor').length > 0 && (
            <>
              <SectionHeader id="labor" label="Labor & Postpartum" />
              {expandedSections['labor'] && (
                <div className="space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  {CATEGORIES.labor.items.map(itemId => {
                    const item = ALL_NAV_ITEMS.find(i => i.id === itemId);
                    if (!item) return null;
                    if (tierFilter !== 'all' && item.tier !== tierFilter) return null;
                    return <NavItem key={item.id} id={item.id} icon={item.icon} label={item.label} progress={item.progress} />;
                  })}
                </div>
              )}
            </>
          )}

        </>
      )}

      {/* Utilities Group (Export PDF & Logout) */}
      <div className="h-px bg-border my-4" />
      <div className="space-y-2">
        {planTier === 'free' && (
          <button
            onClick={() => { navigate('/checkout?plan=premium'); }}
            className="w-full py-2.5 px-3.5 bg-yellow-500/10 dark:bg-yellow-500/20 border border-gold/40 rounded-[10px] font-sans text-[13px] font-bold text-yellow-800 dark:text-gold cursor-pointer transition-all hover:bg-gold hover:text-charcoal flex items-center justify-between shadow-xs"
          >
            <span className="flex items-center gap-2">
              <span>✨</span> Upgrade to Pro Plan
            </span>
            <span>➜</span>
          </button>
        )}

        <button
          onClick={() => {
            import('../utils/pdfExport').then(module => {
              module.exportToPDF(state);
            });
          }}
          className="w-full py-2.5 px-3.5 bg-white dark:bg-charcoal/15 border border-border/80 dark:border-border/20 rounded-[10px] font-sans text-[13px] font-medium text-charcoal/85 hover:text-sage-dark hover:bg-sage-pale/40 hover:border-sage/30 transition-all flex items-center gap-2.5 cursor-pointer text-left shadow-xs"
        >
          <span>📄</span>
          <span>Export Care Plan PDF</span>
        </button>

        {!auth.currentUser ? (
          <button
            type="button"
            onClick={async () => {
              try {
                const user = await signInWithGoogle();
                if (user) {
                  const restored = await restoreJourney(user.uid);
                  if (!restored && state.isSetup) {
                    await saveJourney(user.uid, state);
                  }
                }
              } catch (e) {
                console.error("Sign-in failed", e);
              }
            }}
            className="w-full py-2.5 px-3.5 bg-sage text-white rounded-[10px] font-sans text-[13px] font-bold hover:bg-sage-dark transition-all flex items-center gap-2.5 cursor-pointer text-left shadow-xs"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4 bg-white rounded-full p-0.5 shrink-0" />
            <span>Sign in with Google</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 px-3.5 bg-white dark:bg-charcoal/15 border border-border/80 dark:border-border/20 rounded-[10px] font-sans text-[13px] font-medium text-critical/85 hover:text-critical hover:bg-critical-bg hover:border-critical/30 transition-all flex items-center gap-2.5 cursor-pointer text-left shadow-xs"
          >
            <span>🚪</span>
            <span>Log Out</span>
          </button>
        )}
      </div>

    </div>
  );
};
