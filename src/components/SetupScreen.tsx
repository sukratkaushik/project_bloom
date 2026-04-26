import React, { useState, useEffect, useRef } from 'react';
import { usePlanner } from '../store';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

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
  const [dueDate, setDueDate] = useState('');
  const [pregnancyNum, setPregnancyNum] = useState('first');
  const [workSit, setWorkSit] = useState('employed');
  const [partnerSit, setPartnerSit] = useState('partner');
  const [dietPref, setDietPref] = useState('vegetarian');
  const [flags, setFlags] = useState<Record<string, boolean>>({});

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
    <div className="min-h-screen bg-gradient-to-br from-gold-pale via-sage-pale to-blush-pale flex flex-col items-center justify-center p-5 pb-16 relative overflow-hidden">
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

      <div className="flex flex-col items-center gap-2 mb-4 z-10">
        <img src="/logo.png" alt="Bloom Logo" className="w-14 h-14 object-contain drop-shadow-sm" />
        <div className="font-serif text-[12px] font-medium tracking-[6px] uppercase text-sage">Bloom</div>
      </div>
      <h1 className="font-serif text-[clamp(38px,7vw,68px)] font-light leading-[1.08] text-center text-charcoal mb-3.5 z-10">
        Your <em className="italic text-blush">Pregnancy</em><br />Planning Companion
      </h1>
      <p className="text-[15px] text-medium max-w-[520px] text-center mx-auto mb-10 font-light leading-[1.7] z-10">
        Tell us a little about your situation and we'll generate a fully personalised plan — every date, task, and decision tailored to you.
      </p>

      <div className="bg-white rounded-[22px] p-10 w-full max-w-[700px] shadow-lg z-10 relative">
        <h2 className="font-serif text-[26px] font-medium mb-7 text-charcoal text-center">Let's get started</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px] items-start">
          <div className="flex flex-col gap-1.5 sm:col-span-2 mb-2">
            <span className="text-[11px] font-semibold tracking-[1.2px] uppercase text-medium text-center mb-2">Expected Due Date *</span>
            <DateWheelPicker value={dueDate} onChange={setDueDate} />
            <span className="text-[11px] text-light mt-[3px] text-center">Swipe to set the exact date. Your OB or midwife will confirm this.</span>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold tracking-[1.2px] uppercase text-medium">Which pregnancy is this?</span>
            <select 
              value={pregnancyNum}
              onChange={(e) => setPregnancyNum(e.target.value)}
              className="p-[11px_14px] border-[1.5px] border-border rounded-[10px] font-sans text-[14px] text-charcoal bg-cream transition-all focus:outline-none focus:border-sage focus:ring-[3px] focus:ring-sage/10 w-full"
            >
              <option value="first">First pregnancy</option>
              <option value="subsequent">Second or more</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold tracking-[1.2px] uppercase text-medium">Work situation</span>
            <select 
              value={workSit}
              onChange={(e) => setWorkSit(e.target.value)}
              className="p-[11px_14px] border-[1.5px] border-border rounded-[10px] font-sans text-[14px] text-charcoal bg-cream transition-all focus:outline-none focus:border-sage focus:ring-[3px] focus:ring-sage/10 w-full"
            >
              <option value="employed">Employed (office / hybrid)</option>
              <option value="remote">Fully remote</option>
              <option value="demanding">Demanding / shift work</option>
              <option value="selfemployed">Self-employed / freelance</option>
              <option value="notworking">Not currently working</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold tracking-[1.2px] uppercase text-medium">Support situation</span>
            <select 
              value={partnerSit}
              onChange={(e) => setPartnerSit(e.target.value)}
              className="p-[11px_14px] border-[1.5px] border-border rounded-[10px] font-sans text-[14px] text-charcoal bg-cream transition-all focus:outline-none focus:border-sage focus:ring-[3px] focus:ring-sage/10 w-full"
            >
              <option value="partner">Partner present</option>
              <option value="solo">Going solo</option>
              <option value="family">Family support network</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold tracking-[1.2px] uppercase text-medium">Dietary preference</span>
            <select
              value={dietPref}
              onChange={(e) => setDietPref(e.target.value)}
              className="p-[11px_14px] border-[1.5px] border-border rounded-[10px] font-sans text-[14px] text-charcoal bg-cream transition-all focus:outline-none focus:border-sage focus:ring-[3px] focus:ring-sage/10 w-full"
            >
              <option value="nopreference">No Preference</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="nonveg">Non-Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="eggetarian">Eggetarian</option>
            </select>
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

        <button 
          onClick={handleGenerate}
          className="w-full mt-8 p-[17px] bg-gradient-to-br from-sage to-sage-light text-white border-none rounded-[12px] font-sans text-[15px] font-semibold tracking-[0.4px] cursor-pointer transition-all hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(107,146,120,0.4)]"
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
    </div>
  );
};
