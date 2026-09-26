import React, { useState, useEffect, useRef } from 'react';
import { MobileTopBar } from './MobileTopBar';
import { MobileBottomNav, MobileTabId } from './MobileBottomNav';
import { SpeedDialFab } from './SpeedDialFab';
import { TodayTab } from './tabs/TodayTab';
import { ExploreTab } from './tabs/ExploreTab';
import { CareTab } from './tabs/CareTab';
import { SmartAiTab } from './tabs/SmartAiTab';
import { VaultTab } from './tabs/VaultTab';

import { ArrowLeft, Star, X, ShieldAlert, Phone, Sparkles } from 'lucide-react';
import { triggerHaptic, initNotificationChannels, registerNotificationActionListener } from '../../utils/nativeBridge';
import { usePlanner } from '../../store';
import { Task } from '../../types';
import { NotificationSettingsModal } from './NotificationSettingsModal';

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
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showAddRitualsModal, setShowAddRitualsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

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
      const saved = localStorage.getItem('bloom_pinned_rituals');
      return saved ? JSON.parse(saved) : ['kickcounter', 'hydration', 'vitals', 'askourpregnancy'];
    } catch {
      return ['kickcounter', 'hydration', 'vitals', 'askourpregnancy'];
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
        localStorage.setItem('bloom_pinned_rituals', JSON.stringify(updated));
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
      default: return <KickCounter />;
    }
  };

  return (
    <div className="fixed inset-0 h-screen h-[100dvh] max-h-[100dvh] w-full bg-cream text-charcoal flex flex-col overflow-hidden select-none antialiased selection:bg-sage/20 selection:text-sage-dark">
      {/* 1. Mobile Top Bar (Strictly Fixed at Top, never moves during scroll) */}
      <div className="shrink-0 z-40 w-full bg-[#FDFBF7]">
        <MobileTopBar
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenLanguage={() => setShowLanguageModal(true)}
          onOpenSos={() => setShowSosModal(true)}
          onOpenPricing={() => setShowPricingModal(true)}
        />
      </div>

      {/* 2. Main Scrollable Container (ONLY this inner body scrolls) */}
      <main
        ref={mainScrollRef}
        className="flex-1 overflow-y-auto overscroll-contain px-4 pt-3 max-w-lg mx-auto w-full custom-scrollbar"
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

      {/* 3. Speed Dial FAB (only visible when not inside a tool view) */}
      {!activeToolId && (
        <SpeedDialFab onOpenTool={handleOpenTool} onShowToast={showToast} />
      )}

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
        <div className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative border border-critical/20">
            <button
              onClick={() => setShowSosModal(false)}
              className="absolute top-4 right-4 p-1.5 text-medium hover:text-charcoal rounded-full"
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

      {/* Language Selector Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl relative">
            <button
              onClick={() => setShowLanguageModal(false)}
              className="absolute top-4 right-4 p-1.5 text-medium hover:text-charcoal rounded-full"
            >
              <X size={20} />
            </button>
            <h3 className="font-serif font-bold text-charcoal text-[18px] mb-3">
              Choose Language
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[13px] font-semibold">
              {[
                { name: 'English', code: 'en' },
                { name: 'हिन्दी (Hindi)', code: 'hi' },
                { name: 'मराठी (Marathi)', code: 'mr' },
                { name: 'தமிழ் (Tamil)', code: 'ta' },
                { name: 'తెలుగు (Telugu)', code: 'te' },
                { name: 'বাংলা (Bengali)', code: 'bn' },
                { name: 'ગુજરાતી (Gujarati)', code: 'gu' },
                { name: 'ಕನ್ನಡ (Kannada)', code: 'kn' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setShowLanguageModal(false);
                    showToast(`Language set to ${lang.name}`);
                  }}
                  className="p-3 bg-cream/70 hover:bg-sage-pale border border-border/80 rounded-xl text-left hover:border-sage transition-all cursor-pointer"
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile & Settings Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 p-1.5 text-medium hover:text-charcoal rounded-full"
            >
              <X size={20} />
            </button>
            <h3 className="font-serif font-bold text-charcoal text-[18px] mb-3">
              Settings & Pregnancy Profile
            </h3>
            <Profile />
          </div>
        </div>
      )}

      {/* Pricing / Pro Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
            <button
              onClick={() => setShowPricingModal(false)}
              className="absolute top-4 right-4 p-1.5 text-medium hover:text-charcoal rounded-full"
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
              Unlimited Qwen2.5 clinical AI consults, multi-subject food safety vision, and instant FHIR R4 exports.
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
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl relative">
            <button
              onClick={() => setShowScheduleModal(false)}
              className="absolute top-4 right-4 p-1.5 text-medium hover:text-charcoal rounded-full"
            >
              <X size={20} />
            </button>
            <h3 className="font-serif font-bold text-charcoal text-[17px] mb-2">
              Schedule Prenatal Visit
            </h3>
            <p className="text-[12px] text-medium mb-3">
              Coordinate your next scan milestone with Dr. Priya Sharma at Cloudnine Hospital.
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
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50 flex items-end justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl p-5 w-full max-w-lg shadow-2xl relative max-h-[70vh] overflow-y-auto">
            <div className="w-12 h-1 bg-border rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif font-bold text-charcoal text-[16px]">
                Customize Daily Rituals
              </h3>
              <button
                onClick={() => setShowAddRitualsModal(false)}
                className="p-1.5 text-medium hover:text-charcoal rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-[12px] text-medium mb-3">
              Select which health tools appear on your Today screen for quick 1-tap logging.
            </p>
            <div className="space-y-2">
              {[
                { id: 'kickcounter', name: 'Kick Counter' },
                { id: 'hydration', name: 'Hydration Tracker' },
                { id: 'vitals', name: 'Blood Pressure & Vitals' },
                { id: 'askourpregnancy', name: 'Ask Bloom AI' },
                { id: 'symptoms', name: 'Symptom Logger' },
                { id: 'mood', name: 'Mood & Energy' },
                { id: 'nutrition', name: 'Supplements Tracker' },
                { id: 'contractions', name: 'Contraction Timer' },
              ].map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => handleTogglePin(tool.id)}
                  className="flex items-center justify-between p-3 bg-cream/60 border border-border/80 rounded-xl hover:border-sage transition-all cursor-pointer"
                >
                  <span className="font-semibold text-charcoal text-[13px]">{tool.name}</span>
                  <Star
                    size={18}
                    className={pinnedIds.includes(tool.id) ? 'text-amber-500 fill-amber-500' : 'text-light'}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowAddRitualsModal(false)}
              className="mt-4 w-full py-2.5 bg-sage-dark text-white font-bold text-[13px] rounded-xl shadow-xs hover:bg-sage transition-colors cursor-pointer"
            >
              Done
            </button>
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
