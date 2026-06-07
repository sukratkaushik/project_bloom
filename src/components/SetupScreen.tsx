import React, { useState, useEffect, useRef } from 'react';
import { usePlanner } from '../store';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { CustomSelect } from './CustomSelect';

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

export const SetupScreen: React.FC = () => {
  const { generatePlan, resetPlan, state, toggleDarkMode } = usePlanner();
  const [dueDate, setDueDate] = useState(state.dueDate ? state.dueDate.split('T')[0] : '');
  const [pregnancyNum, setPregnancyNum] = useState(state.pregnancyNum || 'first');
  const [workSit, setWorkSit] = useState(state.workSit || 'employed');
  const [partnerSit, setPartnerSit] = useState(state.partnerSit || 'partner');
  const [dietPref, setDietPref] = useState(state.dietPref || 'vegetarian');
  const [flags, setFlags] = useState<Record<string, boolean>>(state.flags || {});
  const [hasConsented, setHasConsented] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  const toggleFlag = (id: string) => {
    setFlags((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerate = () => {
    if (!dueDate) {
      alert('Please enter your due date.');
      return;
    }
    generatePlan({
      dueDate,
      pregnancyNum,
      workSit,
      partnerSit,
      dietPref,
      flags,
    });
    window.location.hash = '#dashboard';
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-pale via-sage-pale to-blush-pale flex flex-col items-center justify-center p-5 md:p-10 lg:p-12 pb-16 relative overflow-hidden">
      <div className="absolute -top-[100px] -right-[100px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,var(--color-blush)_0%,transparent_65%)] opacity-20 pointer-events-none" />
      <div className="absolute -bottom-[80px] -left-[80px] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,var(--color-sage)_0%,transparent_65%)] opacity-20 pointer-events-none" />

      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-charcoal flex items-center justify-center"
          title="Toggle Dark Mode"
          aria-label="Toggle Dark Mode"
        >
          <span className="text-[18px] leading-none">{state.isDarkModeActive ? '🌙' : '☀️'}</span>
        </button>
      </div>

      <div className="font-serif text-[12px] font-medium tracking-[6px] uppercase text-sage mb-4 z-10 notranslate">Our Pregnancy</div>
      <h1 className="font-serif text-[clamp(38px,7vw,68px)] font-light leading-[1.08] text-center text-charcoal mb-3.5 z-10">
        Your <em className="italic text-blush">Pregnancy</em><br />Planning Companion
      </h1>
      <p className="text-[15px] text-medium max-w-[520px] text-center mx-auto mb-10 font-light leading-[1.7] z-10">
        Tell us a little about your situation and we'll generate a fully personalised plan — every date, task, and decision tailored to you.
      </p>

      <div className="bg-white rounded-[22px] p-10 w-full max-w-[700px] shadow-lg z-10 relative">
        <h2 className="font-serif text-[26px] font-medium mb-7 text-charcoal text-center">Setup</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px] items-start">
          <div className="flex flex-col gap-1.5 sm:col-span-2 mb-2">
            <span className="text-[11px] font-semibold tracking-[1.2px] uppercase text-medium text-center mb-2">Expected Due Date *</span>
            <DateWheelPicker value={dueDate} onChange={setDueDate} />
            <span className="text-[11px] text-light mt-[3px] text-center">Swipe to set the exact date. Your OB or midwife will confirm this.</span>
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
              I agree to the <a href="#/privacy" target="_blank" className="text-sage hover:underline hover:text-sage-dark font-medium" rel="noreferrer">Privacy Policy</a> and <a href="#/terms" target="_blank" className="text-sage hover:underline hover:text-sage-dark font-medium" rel="noreferrer">Terms of Service</a>. I understand that my data will be securely processed to personalise my plan.
            </span>
          </label>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={!hasConsented}
          className={`w-full mt-6 p-[17px] border-none rounded-[12px] font-sans text-[15px] font-semibold tracking-[0.4px] transition-all ${hasConsented ? 'bg-gradient-to-br from-sage to-sage-light text-white cursor-pointer hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(107,146,120,0.4)]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          ✦ Generate My Personalised Plan
        </button>

        <button 
          onClick={handleLogout}
          className="w-full mt-4 p-[15px] bg-transparent text-medium border border-border rounded-[12px] font-sans text-[14px] font-medium cursor-pointer transition-all hover:border-critical/30 hover:bg-critical-bg hover:text-critical"
        >
          Not right now (Logout)
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
