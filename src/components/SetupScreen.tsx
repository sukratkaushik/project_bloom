import React, { useState } from 'react';
import { usePlanner } from '../store';

const CONSIDERATIONS = [
  { id: 'highRisk', label: '🏥 High-risk pregnancy' },
  { id: 'multiples', label: '👶👶 Twins / multiples' },
  { id: 'ivf', label: '🔬 IVF / assisted' },
  { id: 'mentalHealth', label: '💙 Mental health support' },
  { id: 'cultural', label: '🌿 Cultural preferences' },
];

export const SetupScreen: React.FC = () => {
  const { generatePlan } = usePlanner();
  const [dueDate, setDueDate] = useState('');
  const [pregnancyNum, setPregnancyNum] = useState('first');
  const [workSit, setWorkSit] = useState('employed');
  const [partnerSit, setPartnerSit] = useState('partner');
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
      flags,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-pale via-sage-pale to-blush-pale flex flex-col items-center justify-center p-5 pb-16 relative overflow-hidden">
      <div className="absolute -top-[100px] -right-[100px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,var(--color-blush)_0%,transparent_65%)] opacity-20 pointer-events-none" />
      <div className="absolute -bottom-[80px] -left-[80px] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,var(--color-sage)_0%,transparent_65%)] opacity-20 pointer-events-none" />
      
      <div className="font-serif text-[12px] font-medium tracking-[6px] uppercase text-sage mb-4 z-10">Bloom</div>
      <h1 className="font-serif text-[clamp(38px,7vw,68px)] font-light leading-[1.08] text-center text-charcoal mb-3.5 z-10">
        Your <em className="italic text-blush">Pregnancy</em><br />Planning Companion
      </h1>
      <p className="text-[15px] text-medium max-w-[520px] text-center mx-auto mb-10 font-light leading-[1.7] z-10">
        Tell us a little about your situation and we'll generate a fully personalised plan — every date, task, and decision tailored to you.
      </p>

      <div className="bg-white rounded-[22px] p-10 w-full max-w-[700px] shadow-lg z-10 relative">
        <h2 className="font-serif text-[26px] font-medium mb-7 text-charcoal text-center">Let's get started</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold tracking-[1.2px] uppercase text-medium">Expected Due Date *</span>
            <input 
              type="date" 
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="p-[11px_14px] border-[1.5px] border-border rounded-[10px] font-sans text-[14px] text-charcoal bg-cream transition-all focus:outline-none focus:border-sage focus:ring-[3px] focus:ring-sage/10 w-full"
            />
            <span className="text-[11px] text-light mt-[3px]">Your OB or midwife will confirm this</span>
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
      </div>
    </div>
  );
};
