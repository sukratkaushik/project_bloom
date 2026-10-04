import React, { useState, useEffect, useRef } from 'react';
import { MobileTopBar } from './MobileTopBar';
import { MobileBottomNav, MobileTabId } from './MobileBottomNav';
import { QuickLogSheet } from './QuickLogSheet';
import { TodayTab } from './tabs/TodayTab';
import { ExploreTab } from './tabs/ExploreTab';
import { CareTab } from './tabs/CareTab';
import { SmartAiTab } from './tabs/SmartAiTab';
import { VaultTab } from './tabs/VaultTab';

import { ArrowLeft, Star, X, ShieldAlert, Phone, Sparkles, Check } from 'lucide-react';
import { triggerHaptic, initNotificationChannels, registerNotificationActionListener, isNativeApp } from '../../utils/nativeBridge';
import { usePlanner } from '../../store';
import { Task } from '../../types';
import { NotificationSettingsModal } from './NotificationSettingsModal';
import { ALL_PREGNANCY_TOOLS } from './toolsData';


// Import existing Section tools
import { KickCounter } from '../sections/KickCounter';
import { ContractionTimer } from '../sections/ContractionTimer';
import { VitalsTracker } from '../sections/VitalsTracker';
import { SymptomLogger } from '../sections/SymptomLogger';
import { MoodTracker } from '../sections/MoodTracker';
import { HydrationTracker } from '../sections/HydrationTracker';
import { NutritionTracker } from '../sections/NutritionTracker';
import { Notes } from '../sections/Notes';
import { PartnerSync } from '../sections/PartnerSync';
import { AskOurPregnancy } from '../sections/AskOurPregnancy';
import { FoodScanner } from '../sections/FoodScanner';
import { BabyNames } from '../sections/BabyNames';
import { SafeTravel } from '../sections/SafeTravel';
import { Development } from '../sections/Development';
import { Preparation } from '../sections/Preparation';
import { Financial } from '../sections/Financial';
import { Deadlines } from '../sections/Deadlines';
import { Medical } from '../sections/Medical';
import { MedicalReports } from '../sections/MedicalReports';
import { GovernmentSchemes } from '../sections/GovernmentSchemes';
import { Postpartum } from '../sections/Postpartum';
import { HospitalBag } from '../sections/HospitalBag';
import { BirthPlanBuilder } from '../sections/BirthPlanBuilder';
import { LaborReadiness } from '../sections/LaborReadiness';
import { Feedback } from '../sections/Feedback';
import { Profile } from '../sections/Profile';
import { GuidedBreathingAudio } from '../sections/GuidedBreathingAudio';
import { UserFlowGuide } from '../UserFlowGuide';

export const MobileShell: React.FC = () => {
  const { state, updateState } = usePlanner();
  const [activeTab, setActiveTab] = useState<MobileTabId>('today');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  // Filter tasks based on state
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

  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showAddRitualsModal, setShowAddRitualsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showQuickLogSheet, setShowQuickLogSheet] = useState(false);

  useEffect(() => {
    initNotificationChannels();
    const unregister = registerNotificationActionListener((route) => {
      if (route === 'care') {
        setActiveTab('care');
        setActiveToolId(null);
      } else if (route) {
        handleOpenTool(route);
      }
    });
    return () => unregister();
  }, []);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pinned Rituals
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bloom_pinned_rituals_v3');
      if (saved) return JSON.parse(saved);
      // Clean default: core essentials without forcing kick counter or vitals
      const defaultRituals = ['hydration', 'nutrition', 'askourpregnancy'];
      localStorage.setItem('bloom_pinned_rituals_v3', JSON.stringify(defaultRituals));
      return defaultRituals;
    } catch {
      return ['hydration', 'nutrition', 'askourpregnancy'];
    }
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTogglePin = (toolId: string) => {
    setPinnedIds((prev) => {
      const exists = prev.includes(toolId);
      const updated = exists ? prev.filter((id) => id !== toolId) : [...prev, toolId];
      try {
        localStorage.setItem('bloom_pinned_rituals_v3', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save pinned rituals', e);
      }
      showToast(exists ? '⭐ Unpinned from Daily Rituals' : '⭐ Pinned to Daily Rituals');
      return updated;
    });
  };

  const mainScrollRef = useRef<HTMLElement>(null);

  const scrollToTop = () => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenTool = (toolId: string) => {
    triggerHaptic('light');
    setActiveToolId(toolId);
    scrollToTop();
  };

  const handleBackFromTool = () => {
    triggerHaptic('light');
    setActiveToolId(null);
  };

  // Render the selected tool component inline
  const renderActiveToolContent = (id: string) => {
    switch (id) {
      case 'kickcounter': return <KickCounter />;
      case 'contractions': return <ContractionTimer />;
      case 'vitals': return <VitalsTracker />;
      case 'symptoms': return <SymptomLogger />;
      case 'mood': return <MoodTracker />;
      case 'hydration': return <HydrationTracker />;
      case 'nutrition': return <NutritionTracker />;
      case 'notes': return <Notes />;
      case 'partnersync': return <PartnerSync />;
      case 'askourpregnancy': return <AskOurPregnancy />;
      case 'foodscanner': return <FoodScanner />;
      case 'babynames': return <BabyNames />;
      case 'travel': return <SafeTravel />;
      case 'dev': return <Development filterTasks={filterTasks} />;
      case 'prep': return <Preparation filterTasks={filterTasks} />;
      case 'finance': return <Financial filterTasks={filterTasks} />;
      case 'deadlines': return <Deadlines filterTasks={filterTasks} />;
      case 'medical': return <Medical filterTasks={filterTasks} />;
      case 'medical-reports': return <MedicalReports />;
      case 'schemes': return <GovernmentSchemes />;
      case 'postpartum': return <Postpartum filterTasks={filterTasks} />;
      case 'hospitalbag': return <HospitalBag />;
      case 'birthplan': return <BirthPlanBuilder />;
      case 'readiness': return <LaborReadiness />;
      case 'breathing':
      case 'garbhsanskar': return <GuidedBreathingAudio />;
      case 'feedback': return <Feedback />;
      case 'profile': return <Profile />;
      case 'guide': return <UserFlowGuide onNavigate={handleOpenTool} />;
      default: return <KickCounter />;
    }
  };

  return (
    <div className="fixed inset-0 h-screen h-[100dvh] max-h-[100dvh] w-full bg-cream text-charcoal flex flex-col overflow-hidden select-none antialiased selection:bg-sage/20 selection:text-sage-dark">
      {/* 1. Mobile Top Bar (Strictly Fixed at Top, never moves during scroll) */}
      <div className="shrink-0 z-40 w-full bg-[#FDFBF7]">
        <MobileTopBar
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenSos={() => setShowSosModal(true)}
          onOpenPricing={() => setShowPricingModal(true)}
          onOpenQuickLog={() => setShowQuickLogSheet(true)}
        />
      </div>

      {/* 2. Main Scrollable Container (ONLY this inner body scrolls) */}
      <main
        ref={mainScrollRef}
        className="flex-1 overflow-y-auto overscroll-contain px-3 xs:px-3.5 sm:px-4 pt-2.5 max-w-lg mx-auto w-full custom-scrollbar"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {activeToolId ? (
          /* Tool Detail View */
          <div className="space-y-4 pb-24 animate-in fade-in duration-150">
            {/* Tool Detail Header Bar (Sticky within scrollable container) */}
            <div className="flex items-center justify-between bg-cream/95 backdrop-blur-md border border-border/80 rounded-2xl p-3 shadow-2xs sticky top-0 z-20">
              <button
                type="button"
                onClick={handleBackFromTool}
                className="flex items-center gap-1.5 text-[13px] font-bold text-sage-dark hover:underline cursor-pointer"
              >
                <ArrowLeft size={17} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => handleTogglePin(activeToolId)}
                className={`p-1.5 rounded-full transition-colors ${
                  pinnedIds.includes(activeToolId)
                    ? 'text-amber-500 bg-amber-50'
                    : 'text-light hover:text-medium'
                }`}
                aria-label="Pin/Unpin tool"
              >
                <Star size={18} fill={pinnedIds.includes(activeToolId) ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Tool Body */}
            <div className="bg-white border border-border/80 rounded-3xl p-4 shadow-xs">
              {renderActiveToolContent(activeToolId)}
            </div>
          </div>
        ) : (
          /* Active Bottom Tab Screen */
          <>
            {activeTab === 'today' && (
              <TodayTab
                onOpenTool={handleOpenTool}
                pinnedIds={pinnedIds}
                onTogglePin={handleTogglePin}
                onOpenAddRituals={() => setShowAddRitualsModal(true)}
                onOpenSchedule={() => setShowScheduleModal(true)}
                onSelectTab={(tab) => {
                  setActiveToolId(null);
                  setActiveTab(tab as 'today' | 'explore' | 'care' | 'smart' | 'vault');
                  scrollToTop();
                }}
                onShowToast={showToast}
              />
            )}
            {activeTab === 'explore' && (
              <ExploreTab
                onOpenTool={handleOpenTool}
                pinnedIds={pinnedIds}
                onTogglePin={handleTogglePin}
              />
            )}
            {activeTab === 'care' && (
              <CareTab
                onOpenTool={handleOpenTool}
                onOpenSchedule={() => setShowScheduleModal(true)}
                onOpenNotifications={() => setShowNotificationsModal(true)}
                onShowToast={showToast}
              />
            )}
            {activeTab === 'smart' && (
              <SmartAiTab onOpenTool={handleOpenTool} />
            )}
            {activeTab === 'vault' && (
              <VaultTab
                onOpenTool={handleOpenTool}
                onShowToast={showToast}
              />
            )}
          </>
        )}
      </main>

      {/* 3. Quick Log Bottom Sheet (clean, zero bottom nav occlusion) */}
      <QuickLogSheet
        isOpen={showQuickLogSheet}
        onClose={() => setShowQuickLogSheet(false)}
        onOpenTool={handleOpenTool}
        onShowToast={showToast}
      />

      {/* 4. Mobile Bottom Navigation (Strictly Fixed at Bottom, never moves during scroll) */}
      <div className="shrink-0 z-40 w-full">
        <MobileBottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveToolId(null);
            setActiveTab(tab);
            scrollToTop();
          }}
        />
      </div>

      {/* 5. Modals & Sheets */}
      {/* 108 Emergency SOS Modal */}
      {showSosModal && (
        <div 
          className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowSosModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative border border-critical/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowSosModal(false)}
              className="absolute top-4 right-4 p-2 text-medium hover:text-charcoal rounded-full cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-critical/10 text-critical flex items-center justify-center mb-3">
              <ShieldAlert size={26} />
            </div>
            <h3 className="font-serif font-bold text-critical text-[20px]">
              Emergency SOS (108)
            </h3>
            <p className="text-[13px] text-medium mt-1 leading-relaxed">
              If you have sudden severe pain, heavy bleeding, vision blackouts, or breathing distress, call emergency services immediately.
            </p>
            <div className="mt-5 space-y-2.5">
              <a
                href="tel:108"
                onClick={() => triggerHaptic('warning')}
                className="w-full py-3 bg-critical text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 shadow-md hover:opacity-95"
              >
                <Phone size={18} />
                <span>Call 108 Ambulance</span>
              </a>
              <a
                href="tel:+919876543210"
                onClick={() => triggerHaptic('light')}
                className="w-full py-2.5 bg-cream border border-border text-charcoal rounded-xl font-semibold text-[13px] flex items-center justify-center hover:bg-border/30"
              >
                Call Hospital Triage (+91 98765 43210)
              </a>
            </div>
          </div>
        </div>
      )}



      {/* Profile & Settings Screen (Full-Screen Native View) */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-[#FDFBF7] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250">
          {/* Native Top App Bar */}
          <div className={`shrink-0 bg-[#FDFBF7] border-b border-border/80 px-4 py-3 flex items-center justify-between ${
            isNativeApp() ? 'pt-[max(2.75rem,env(safe-area-inset-top))]' : 'pt-[max(0.75rem,env(safe-area-inset-top))]'
          }`}>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowProfileModal(false);
              }}
              className="flex items-center gap-1.5 text-[13.5px] font-bold text-charcoal hover:text-sage-dark active:scale-95 transition-all p-1 -ml-1 cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            <h2 className="font-serif font-bold text-charcoal text-[16px] tracking-tight text-center">
              Settings & Profile
            </h2>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowProfileModal(false);
              }}
              className="text-[13px] font-bold text-sage-dark hover:underline active:scale-95 transition-transform p-1 cursor-pointer"
            >
              Done
            </button>
          </div>

          {/* Full-width Scrollable Content Container */}
          <div 
            className="flex-1 overflow-y-auto overscroll-contain px-3 xs:px-4 sm:px-6 py-4 pb-28 max-w-lg mx-auto w-full custom-scrollbar"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <Profile isMobileModal={true} onClose={() => setShowProfileModal(false)} />
          </div>
        </div>
      )}

      {/* Pricing / Pro Modal */}
      {showPricingModal && (
        <div 
          className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowPricingModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowPricingModal(false)}
              className="absolute top-4 right-4 p-2 text-medium hover:text-charcoal rounded-full cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-gold/15 text-gold-dark flex items-center justify-center mb-2">
              <Sparkles size={20} />
            </div>
            <h3 className="font-serif font-bold text-charcoal text-[19px]">
              Our Pregnancy PRO
            </h3>
            <p className="text-[12.5px] text-medium mt-1 leading-relaxed">
              Unlimited maternal AI consults, multi-subject food safety vision, and instant FHIR R4 medical exports.
            </p>
            <div className="mt-4 p-3 bg-sage-pale/60 border border-sage/30 rounded-2xl">
              <span className="text-[11px] font-bold text-sage-dark uppercase block">
                SPECIAL PROMO CODE: OPIN30
              </span>
              <p className="text-[13px] font-bold text-charcoal mt-0.5">
                30 Days 100% Free VIP Trial
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('success');
                updateState({ isPremium: true, planTier: 'premium' });
                setShowPricingModal(false);
                showToast('🎉 VIP 30-Day Pass activated!');
              }}
              className="mt-4 w-full py-3 bg-sage-dark text-white font-bold text-[13.5px] rounded-xl shadow-md hover:bg-sage transition-colors cursor-pointer"
            >
              Activate 30 Days Free
            </button>
          </div>
        </div>
      )}

      {/* Schedule Visit Modal */}
      {showScheduleModal && (
        <div 
          className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowScheduleModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowScheduleModal(false)}
              className="absolute top-4 right-4 p-2 text-medium hover:text-charcoal rounded-full cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <h3 className="font-serif font-bold text-charcoal text-[17px] mb-2">
              Schedule Prenatal Visit
            </h3>
            <p className="text-[12px] text-medium mb-3">
              {state.doctor?.name
                ? `Coordinate your next scan milestone with ${state.doctor.name}${state.doctor.hospital ? ` at ${state.doctor.hospital}` : ''}.`
                : 'Coordinate your next scan milestone with your obstetrician and hospital OPD.'}
            </p>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('success');
                setShowScheduleModal(false);
                showToast('📅 Prenatal appointment synced to calendar');
              }}
              className="w-full py-2.5 bg-sage text-white font-bold text-[13px] rounded-xl shadow-xs hover:bg-sage-dark transition-colors cursor-pointer"
            >
              Confirm Appointment
            </button>
          </div>
        </div>
      )}

      {/* Add Rituals Sheet */}
      {showAddRitualsModal && (
        <div 
          className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50 flex items-end justify-center animate-in fade-in duration-200"
          onClick={() => setShowAddRitualsModal(false)}
        >
          <div 
            className="bg-white rounded-t-3xl p-5 pb-[max(2.5rem,calc(env(safe-area-inset-bottom,0px)+1.5rem))] w-full max-w-lg shadow-2xl relative max-h-[82vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-border rounded-full mx-auto mb-3 shrink-0" />
            <div className="flex items-center justify-between mb-2 shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-charcoal text-[17px]">
                  Customize Daily Rituals
                </h3>
                <span className="text-[10px] font-bold text-sage-dark bg-sage-pale px-2 py-0.5 rounded-full">
                  {pinnedIds.length} Pinned
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddRitualsModal(false)}
                className="p-1.5 text-medium hover:text-charcoal rounded-full cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-[12px] text-medium mb-3 shrink-0">
              Star (⭐) any tool from below to make it available on your Today tab under Daily Health Rituals.
            </p>

            <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              {ALL_PREGNANCY_TOOLS.map((tool) => {
                const isPinned = pinnedIds.includes(tool.id);
                const IconComp = tool.icon;
                return (
                  <div
                    key={tool.id}
                    onClick={() => {
                      triggerHaptic('light');
                      handleTogglePin(tool.id);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                      isPinned
                        ? 'bg-amber-50/50 border-amber-200'
                        : 'bg-cream/40 border-border/70 hover:border-sage/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${tool.color}`}>
                        <IconComp size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-charcoal text-[13px] truncate">
                            {tool.title}
                          </span>
                          {tool.badge && (
                            <span className="text-[9px] font-normal px-1.5 py-0.2 rounded-md bg-white border border-border text-medium shrink-0">
                              {tool.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10.5px] text-medium truncate">
                          {tool.desc}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic('light');
                        handleTogglePin(tool.id);
                      }}
                      className={`p-1.5 rounded-full shrink-0 ml-2 transition-colors cursor-pointer ${
                        isPinned
                          ? 'text-amber-500 bg-amber-100/70 hover:bg-amber-200'
                          : 'text-light hover:text-medium hover:bg-cream'
                      }`}
                      aria-label={isPinned ? 'Unpin' : 'Pin'}
                    >
                      <Star size={16} fill={isPinned ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setShowAddRitualsModal(false);
                }}
                className="w-full py-3 bg-sage-dark text-white font-bold text-[14px] rounded-xl shadow-xs hover:bg-sage active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check size={16} />
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prenatal Reminders & Notifications Modal */}
      <NotificationSettingsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        onShowToast={showToast}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-charcoal text-white text-[12px] font-semibold px-4 py-2 rounded-full shadow-lg border border-white/20 animate-in fade-in slide-in-from-top-2 duration-150">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
