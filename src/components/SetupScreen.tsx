import React, { useState, useEffect, useRef } from 'react';
import { usePlanner } from '../store';
import { auth, db, doc, setDoc, serverTimestamp } from '../firebase';
import { signOut } from 'firebase/auth';
import { CustomSelect } from './CustomSelect';
import { navigate } from '../utils/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';

export const CURRENT_POLICY_VERSION = '2026-04';


// Custom Apple-style Wheel Picker Component
const WheelPicker = ({ options, value, onChange, label }: { options: string[], value: string, onChange: (v: string) => void, label: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    const index = options.indexOf(value);
    if (index >= 0) {
      // Small delay to ensure rendering is complete before scrolling
      setTimeout(() => {
        if (containerRef.current) containerRef.current.scrollTop = index * 40;
      }, 10);
    }
  }, [options, value]); // React to value change from outside

  const handleScroll = () => {
    if (!containerRef.current) return;
    const index = Math.round(containerRef.current.scrollTop / 40);
    if (options[index] && options[index] !== value) {
      onChange(options[index]);
    }
  };

  return (
    <div className="flex flex-col items-center w-full flex-1">
      <div className="relative h-[120px] w-full bg-cream border-[1.5px] border-border rounded-[12px] overflow-hidden group">
        {/* Selection Highlight */}
        <div className="absolute top-1/2 left-0 w-full h-[40px] -translate-y-1/2 bg-sage/10 border-y-[1.5px] border-sage/30 pointer-events-none z-10" />
        
        <div 
          ref={containerRef}
          className="h-full w-full overflow-y-auto snap-y snap-mandatory relative z-20"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={(e) => {
             const target = e.target as any;
             clearTimeout(target._timeout);
             target._timeout = setTimeout(() => handleScroll(), 150);
          }}
        >
          {/* Hide webkit scrollbar via inline style inject */}
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>
          
          <div className="h-[40px]" /> 
          {options.map((opt, i) => (
            <div 
              key={i} 
              className={`h-[40px] flex items-center justify-center text-[18px] snap-center cursor-pointer transition-all duration-200 select-none ${value === opt ? 'text-charcoal font-bold scale-110' : 'text-medium/50 scale-90 hover:text-medium'}`}
              onClick={() => {
                onChange(opt);
                containerRef.current?.scrollTo({ top: i * 40, behavior: 'smooth' });
              }}
            >
              {opt}
            </div>
          ))}
          <div className="h-[40px]" />
        </div>
      </div>
      <span className="text-[9px] text-medium mt-1.5 uppercase tracking-widest font-bold">{label}</span>
    </div>
  );
};

const DateWheelPicker = ({ value, onChange }: { value: string, onChange: (d: string) => void }) => {
  const dateObj = value ? new Date(value) : new Date();
  // Ensure we don't start with invalid dates if possible
  if (isNaN(dateObj.getTime())) {
    dateObj.setTime(Date.now() + 280 * 24 * 60 * 60 * 1000); // default 40 weeks from now
  }
  
  const [day, setDay] = useState(dateObj.getDate().toString());
  const [month, setMonth] = useState((dateObj.getMonth() + 1).toString());
  const [year, setYear] = useState(dateObj.getFullYear().toString());

  useEffect(() => {
    const maxDays = new Date(parseInt(year), parseInt(month), 0).getDate();
    const validDay = parseInt(day) > maxDays ? maxDays.toString() : day;
    if (validDay !== day) setDay(validDay);
    
    const d = validDay.padStart(2, '0');
    const m = month.padStart(2, '0');
    onChange(`${year}-${m}-${d}`);
  }, [day, month, year]);

  const days = Array.from({length: 31}, (_, i) => (i + 1).toString());
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const currentYear = new Date().getFullYear();
  const years = [currentYear.toString(), (currentYear + 1).toString()];

  const monthStr = months[parseInt(month) - 1] || 'Jan';

  const handleMonthChange = (mStr: string) => {
    setMonth((months.indexOf(mStr) + 1).toString());
  }

  return (
    <div className="flex gap-2 w-full">
      <WheelPicker options={days} value={day} onChange={setDay} label="Day" />
      <WheelPicker options={months} value={monthStr} onChange={handleMonthChange} label="Month" />
      <WheelPicker options={years} value={year} onChange={setYear} label="Year" />
    </div>
  );
};

const CONSIDERATIONS = [
  { id: 'highRisk', label: '🏥 High-risk pregnancy' },
  { id: 'multiples', label: '👶👶 Twins / multiples' },
  { id: 'ivf', label: '🔬 IVF / assisted' },
  { id: 'mentalHealth', label: '💙 Mental health support' },
  { id: 'cultural', label: '🌿 Cultural preferences' },
];

export interface SetupScreenProps {
  isMobileSubview?: boolean;
  onComplete?: () => void;
  onCancel?: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  isMobileSubview = false,
  onComplete,
  onCancel,
}) => {
  const { generatePlan, resetPlan, state, toggleDarkMode } = usePlanner();
  const defaultDueDate = () => {
    if (state.dueDate) return state.dueDate.split('T')[0];
    const d = new Date(Date.now() + 196 * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  };
  const [dueDate, setDueDate] = useState<string>(defaultDueDate);
  const [pregnancyNum, setPregnancyNum] = useState(state.pregnancyNum || 'first');
  const [workSit, setWorkSit] = useState(state.workSit || 'employed');
  const [partnerSit, setPartnerSit] = useState(state.partnerSit || 'partner');
  const [dietPref, setDietPref] = useState(state.dietPref || 'vegetarian');
  const [flags, setFlags] = useState<Record<string, boolean>>(state.flags || {});
  const [hasConsented, setHasConsented] = useState(() => {
    try {
      return Boolean(
        state.isSetup ||
        localStorage.getItem('bloom_dpdp_consent_v1') ||
        localStorage.getItem('bloom_consent')
      );
    } catch {
      return Boolean(state.isSetup);
    }
  });
  const [hasAiConsented, setHasAiConsented] = useState(() => Boolean(state.aiProcessingConsent));
  const [showDisclaimer, setShowDisclaimer] = useState(() => !state.isSetup);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedDate = dueDate ? new Date(dueDate) : null;
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  if (selectedDate) {
    selectedDate.setHours(0, 0, 0, 0);
  }
  const diffWeeks = selectedDate ? (selectedDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24 * 7) : 0;
  const isYetToBegin = diffWeeks > 40;

  const toggleFlag = (id: string) => {
    setFlags((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerate = async () => {
    if (isSubmitting) return;

    if (!dueDate) {
      alert('Please enter your due date.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Immediately store consent locally for zero latency
      try {
        localStorage.setItem('bloom_consent', JSON.stringify({
          policyVersion: CURRENT_POLICY_VERSION,
          aiConsent: hasAiConsented,
          consentedAt: Date.now(),
        }));
      } catch (e) {}

      // 2. Sync consent to Firestore in background without blocking the user
      if (auth.currentUser && hasConsented) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        setDoc(userRef, {
          uid: auth.currentUser.uid,
          consentGiven: true,
          consentedAt: serverTimestamp(),
          policyVersion: CURRENT_POLICY_VERSION,
          aiProcessingConsent: hasAiConsented,
          aiProcessingConsentedAt: hasAiConsented ? serverTimestamp() : null,
        }, { merge: true }).catch((err) => {
          console.warn('Background consent sync error:', err);
        });
      }

      // 3. Generate plan locally & synchronize state
      await generatePlan({
        dueDate,
        pregnancyNum,
        workSit,
        partnerSit,
        dietPref,
        flags,
        aiProcessingConsent: hasAiConsented,
      });

      // 4. Smooth transition to Dashboard
      try {
        if (onComplete) {
          onComplete();
        } else {
          navigate('/dashboard');
        }
      } catch (navErr) {
        console.warn('Navigation transition warning:', navErr);
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Failed to generate plan:', err);
      alert(`Could not complete setup: ${err?.message || String(err)}`);
      setIsSubmitting(false);
    }
  };

  const handleBackOrCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (state.isSetup) {
      navigate('/dashboard');
    } else {
      handleLogout();
    }
  };

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

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gold-pale via-sage-pale to-blush-pale flex flex-col items-center justify-center p-3.5 xs:p-5 sm:p-8 md:p-10 pb-16 relative overflow-x-hidden ${isMobileSubview ? 'pt-2 pb-6 min-h-0 bg-none' : ''}`}>
      {!isMobileSubview && (
        <>
          <div className="absolute -top-[100px] -right-[100px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,var(--color-blush)_0%,transparent_65%)] opacity-20 pointer-events-none" />
          <div className="absolute -bottom-[80px] -left-[80px] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,var(--color-sage)_0%,transparent_65%)] opacity-20 pointer-events-none" />

          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-charcoal flex items-center justify-center"
              title="Toggle Dark Mode"
              aria-label="Toggle Dark Mode"
            >
              <span className="text-[18px] leading-none">{state.isDarkModeActive ? '🌙' : '☀️'}</span>
            </button>
          </div>
        </>
      )}

      {/* Back to Dashboard bar when user is already set up */}
      {state.isSetup && (
        <div className="w-full max-w-[700px] flex items-center justify-between mb-4 z-10 pt-[max(0.5rem,calc(env(safe-area-inset-top,0px)+0.25rem))] sm:pt-2">
          <button
            type="button"
            onClick={handleBackOrCancel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-charcoal font-semibold text-[13px] rounded-xl border border-border/80 shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <ArrowLeft size={15} />
            <span>Back to Dashboard</span>
          </button>
          <span className="text-[12px] font-bold text-sage-dark bg-sage-pale px-2.5 py-0.5 rounded-full border border-sage/30">
            Adjusting Setup
          </span>
        </div>
      )}

      {!isMobileSubview && (
        <>
          <div className="font-serif text-[12px] font-medium tracking-[6px] uppercase text-sage mb-2.5 sm:mb-4 z-10 notranslate">Our Pregnancy</div>
          <h1 className="font-serif text-[clamp(28px,6vw,56px)] font-light leading-[1.12] text-center text-charcoal mb-2.5 sm:mb-3.5 z-10 px-2">
            {state.isSetup ? (
              <>Adjust Your <em className="italic text-blush">Pregnancy</em><br />Setup</>
            ) : (
              <>Your <em className="italic text-blush">Pregnancy</em><br />Planning Companion</>
            )}
          </h1>
          <p className="text-[13.5px] sm:text-[15px] text-medium max-w-[520px] text-center mx-auto mb-6 sm:mb-9 font-light leading-[1.6] z-10 px-3">
            {state.isSetup
              ? "Update your expected due date, diet preferences, and health considerations to recalibrate your personalized schedule."
              : "Tell us a little about your situation and we'll generate a fully personalised plan — every date, task, and decision tailored to you."}
          </p>
        </>
      )}

      <div className={`bg-white rounded-[22px] p-5 xs:p-7 sm:p-9 md:p-10 w-full max-w-[700px] shadow-lg z-10 relative border border-border/70 ${isMobileSubview ? 'shadow-none border-0 p-3 xs:p-4' : ''}`}>
        <h2 className="font-serif text-[22px] sm:text-[26px] font-medium mb-5 sm:mb-7 text-charcoal text-center">
          {state.isSetup ? "Adjust Pregnancy Parameters" : "Setup"}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px] items-start">
          <div className="flex flex-col gap-1.5 sm:col-span-2 mb-2">
            <span className="text-[11px] font-semibold tracking-[1.2px] uppercase text-medium text-center mb-2">Expected Due Date *</span>
            <DateWheelPicker value={dueDate} onChange={setDueDate} />
            <span className="text-[11px] text-light mt-[3px] text-center">Swipe to set the exact date. Your OB or midwife will confirm this.</span>
            {isYetToBegin && (
              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-300 rounded-[12px] text-[13px] text-center font-medium animate-in fade-in slide-in-from-top-1">
                ⚠️ You are yet to begin your journey.
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold tracking-[1.2px] uppercase text-medium">Which pregnancy is this?</span>
            <CustomSelect
              value={pregnancyNum}
              onChange={(value) => setPregnancyNum(value)}
              options={[
                { label: 'First pregnancy', value: 'first' },
                { label: 'Second or more', value: 'subsequent' }
              ]}
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold tracking-[1.2px] uppercase text-medium">Work situation</span>
            <CustomSelect
              value={workSit}
              onChange={(value) => setWorkSit(value)}
              options={[
                { label: 'Employed (office / hybrid)', value: 'employed' },
                { label: 'Fully remote', value: 'remote' },
                { label: 'Demanding / shift work', value: 'demanding' },
                { label: 'Self-employed / freelance', value: 'selfemployed' },
                { label: 'Not currently working', value: 'notworking' }
              ]}
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold tracking-[1.2px] uppercase text-medium">Support situation</span>
            <CustomSelect
              value={partnerSit}
              onChange={(value) => setPartnerSit(value)}
              options={[
                { label: 'Partner present', value: 'partner' },
                { label: 'Going solo', value: 'solo' },
                { label: 'Family support network', value: 'family' }
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold tracking-[1.2px] uppercase text-medium">Dietary preference</span>
            <CustomSelect
              value={dietPref}
              onChange={(value) => setDietPref(value)}
              options={[
                { label: 'No Preference', value: 'nopreference' },
                { label: 'Vegetarian', value: 'vegetarian' },
                { label: 'Non-Vegetarian', value: 'nonveg' },
                { label: 'Vegan', value: 'vegan' },
                { label: 'Eggetarian', value: 'eggetarian' }
              ]}
            />
          </div>
        </div>

        <div className="mt-8 text-center">
          <span className="block text-[11px] font-semibold tracking-[1.2px] uppercase text-medium mb-3">Additional considerations</span>
          <div className="flex flex-wrap justify-center gap-2.5">
            {CONSIDERATIONS.map((c) => (
              <button
                key={c.id}
                onClick={() => toggleFlag(c.id)}
                className={`inline-flex items-center gap-[5px] p-[7px_14px] border-[1.5px] rounded-[30px] text-[13px] transition-all select-none cursor-pointer
                  ${flags[c.id] ? 'border-sage bg-sage-pale text-sage font-medium' : 'border-border bg-white text-medium hover:border-sage-light'}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <label className="flex items-start gap-3 cursor-pointer p-3 border-[1.5px] border-border rounded-[12px] hover:border-sage-light transition-colors bg-white">
            <div className="pt-0.5">
              <input 
                type="checkbox" 
                checked={hasConsented}
                onChange={(e) => setHasConsented(e.target.checked)}
                className="w-4 h-4 text-sage rounded border-border focus:ring-sage focus:ring-2"
              />
            </div>
            <span className="text-[13px] text-charcoal leading-snug">
              I agree to the <a href="/privacy" target="_blank" className="text-sage hover:underline hover:text-sage-dark font-medium" rel="noreferrer">Privacy Policy</a> and <a href="/terms" target="_blank" className="text-sage hover:underline hover:text-sage-dark font-medium" rel="noreferrer">Terms of Service</a>. I understand that my data will be securely processed to personalise my plan.
            </span>
          </label>
        </div>

        {/* Optional AI Features Processing Consent */}
        <div className="mt-3 p-4 rounded-[12px] bg-white border border-border/80 hover:border-sage/40 transition-colors">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <div className="pt-0.5">
              <input 
                type="checkbox" 
                checked={hasAiConsented}
                onChange={(e) => setHasAiConsented(e.target.checked)}
                className="w-4 h-4 text-sage rounded border-border focus:ring-sage focus:ring-2 cursor-pointer"
              />
            </div>
            <span className="text-[13px] text-charcoal/90 leading-snug">
              <span className="inline-block px-1.5 py-0.5 mr-1.5 text-[10px] font-semibold tracking-wide uppercase bg-sage-pale text-sage rounded">Optional</span>
              I'd also like to use AI-powered features (AI clinical chat, food safety scanner, medical report analysis). I understand photos and health details I submit to these features are processed by a third-party AI provider.
            </span>
          </label>
        </div>

        <button 
          type="button"
          onClick={handleGenerate}
          disabled={!hasConsented || isYetToBegin || isSubmitting}
          className={`w-full mt-6 p-[15px] sm:p-[17px] border-none rounded-[12px] font-sans text-[14px] sm:text-[15px] font-semibold tracking-[0.4px] transition-all flex items-center justify-center gap-2 select-none ${
            hasConsented && !isYetToBegin && !isSubmitting
              ? 'bg-gradient-to-br from-sage to-sage-light text-white cursor-pointer hover:-translate-y-[2px] active:scale-[0.99] hover:shadow-[0_8px_24px_rgba(107,146,120,0.4)]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Personalising Your Care Plan...</span>
            </>
          ) : state.isSetup ? (
            '✦ Save & Recalibrate Care Plan'
          ) : (
            '✦ Generate My Personalised Plan'
          )}
        </button>

        <button 
          onClick={handleBackOrCancel}
          className="w-full mt-3 p-[13px] sm:p-[14px] bg-transparent text-medium border border-border rounded-[12px] font-sans text-[13.5px] sm:text-[14px] font-medium cursor-pointer transition-all hover:bg-cream hover:text-charcoal"
        >
          {state.isSetup ? '← Cancel & Return to Dashboard' : 'Not right now (Logout)'}
        </button>
      </div>

      {showDisclaimer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-8 max-w-[480px] w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-12 h-12 bg-sage-pale rounded-full flex items-center justify-center mb-5 mx-auto">
              <span className="text-sage text-2xl">⚕️</span>
            </div>
            <h3 className="font-serif text-[24px] text-charcoal font-medium text-center mb-3">Important Disclaimer</h3>
            <p className="text-[15px] text-medium leading-relaxed text-center mb-6">
              <span className="notranslate">Our Pregnancy</span> is an informational tool only. <strong className="font-semibold text-charcoal">It is not a substitute for professional medical advice, diagnosis, or treatment.</strong> Always consult your doctor or midwife for any health concerns or before making medical decisions.
            </p>
            <button
              onClick={() => setShowDisclaimer(false)}
              className="w-full p-4 bg-sage text-white rounded-[12px] font-semibold hover:bg-sage-dark transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
