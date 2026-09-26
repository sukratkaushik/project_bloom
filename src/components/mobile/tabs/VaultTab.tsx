import React, { useState } from 'react';
import {
  Building, ShieldCheck, FileText, ChevronRight, Calculator,
  Lock, FileUp, CheckCircle2, ExternalLink
} from 'lucide-react';
import { triggerHaptic } from '../../../utils/nativeBridge';

interface VaultTabProps {
  onOpenTool: (toolId: string) => void;
  onShowToast: (message: string) => void;
}

interface SchemeItem {
  id: string;
  name: string;
  badge: string;
  amount: string;
  eligibility: string;
  howToApply: string;
  stateScope: string;
  link: string;
}

export const VaultTab: React.FC<VaultTabProps> = ({ onOpenTool, onShowToast }) => {
  const [selectedState, setSelectedState] = useState('national');
  const [activeCategory, setActiveCategory] = useState<'all' | 'cash' | 'delivery' | 'nutrition' | 'pmjay'>('all');
  const [childOrder, setChildOrder] = useState<'first' | 'second_girl'>('first');

  const states = [
    { code: 'national', name: 'National (All India)' },
    { code: 'karnataka', name: 'Karnataka' },
    { code: 'tamilnadu', name: 'Tamil Nadu' },
    { code: 'telangana', name: 'Telangana' },
    { code: 'andhra', name: 'Andhra Pradesh' },
    { code: 'maharashtra', name: 'Maharashtra' },
    { code: 'delhi', name: 'Delhi NCR' },
    { code: 'up', name: 'Uttar Pradesh' },
    { code: 'rajasthan', name: 'Rajasthan' },
    { code: 'bihar', name: 'Bihar' },
    { code: 'wb', name: 'West Bengal' },
    { code: 'odisha', name: 'Odisha' },
  ];

  const schemes: SchemeItem[] = [
    {
      id: 'pmmvy',
      name: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
      badge: 'Direct Cash Transfer',
      amount: '₹5,000 DBT',
      eligibility: 'Pregnant women aged 19+ for 1st live birth (and 2nd child if girl).',
      howToApply: 'Register with MCP card at nearest Anganwadi center or online on pmmvy.wcd.gov.in.',
      stateScope: 'national',
      link: 'https://pmmvy.wcd.gov.in',
    },
    {
      id: 'jsy',
      name: 'Janani Suraksha Yojana (JSY)',
      badge: 'Institutional Delivery',
      amount: '₹1,400 Cash Aid',
      eligibility: 'All pregnant mothers delivering in government or accredited private hospitals.',
      howToApply: 'Coordinated by ASHA / ANM upon hospital admission.',
      stateScope: 'national',
      link: 'https://nhm.gov.in',
    },
    {
      id: 'pmsma',
      name: 'PMSMA Free Antenatal Checkups',
      badge: 'Free Specialist OPD',
      amount: '100% Free Scans',
      eligibility: 'All 2nd and 3rd trimester pregnancies across India.',
      howToApply: 'Visit any government dispensary or district hospital on the 9th of every month.',
      stateScope: 'national',
      link: 'https://pmsma.nhp.gov.in',
    },
    {
      id: 'kcr-kit',
      name: 'KCR Nutrition & Baby Kit',
      badge: 'State Flagship (Telangana)',
      amount: '₹12,000–₹13,000 Aid + 16 Items Kit',
      eligibility: 'Telangana residents delivering in government hospitals.',
      howToApply: 'Register at PHC via KCR Kit portal.',
      stateScope: 'telangana',
      link: 'https://kcrkit.telangana.gov.in',
    },
    {
      id: 'muthulakshmi',
      name: 'Dr. Muthulakshmi Reddy Scheme',
      badge: 'State Flagship (Tamil Nadu)',
      amount: '₹18,000 Total Assistance',
      eligibility: 'Pregnant mothers delivering in Tamil Nadu government institutions.',
      howToApply: 'PICME registration via Village Health Nurse.',
      stateScope: 'tamilnadu',
      link: 'https://picme.tn.gov.in',
    },
    {
      id: 'mathru-poorna',
      name: 'Mathru Poorna Hot Cooked Meal',
      badge: 'Nutrition Support (Karnataka)',
      amount: 'Daily Nutritious Meal + Eggs',
      eligibility: 'Pregnant mothers attending Anganwadi centers in Karnataka.',
      howToApply: 'Enroll at your ward/village Anganwadi.',
      stateScope: 'karnataka',
      link: 'https://dwcd.karnataka.gov.in',
    },
  ];

  const filteredSchemes = schemes.filter((s) => {
    const matchesState = selectedState === 'national' ? s.stateScope === 'national' : s.stateScope === 'national' || s.stateScope === selectedState;
    return matchesState;
  });

  const handleSimulatedUpload = () => {
    triggerHaptic('success');
    onShowToast('🔒 Ultrasound report encrypted via AES-256 and saved in local ABHA vault');
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="bg-white border border-border/80 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Building size={20} />
            </div>
            <div>
              <h2 className="font-serif font-bold text-charcoal text-[16px] leading-tight">
                Maternity & Health Schemes
              </h2>
              <span className="text-[11px] text-medium">MoHFW & State Government Verified</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
            UPDATED 2026
          </span>
        </div>

        {/* State Selector Dropdown */}
        <div className="mt-3.5 pt-3 border-t border-border/60">
          <label className="text-[11px] font-bold text-medium uppercase tracking-wider block mb-1">
            Select Your State / UT
          </label>
          <select
            value={selectedState}
            onChange={(e) => {
              triggerHaptic('light');
              setSelectedState(e.target.value);
            }}
            className="w-full bg-cream/70 border border-border/80 rounded-xl px-3 py-2 text-[13px] font-bold text-charcoal focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
          >
            {states.map((st) => (
              <option key={st.code} value={st.code}>
                {st.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Direct Benefit Aid Calculator Card */}
      <div className="bg-gradient-to-br from-amber-500/10 via-white to-orange-500/10 border border-amber-200 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <Calculator size={18} className="text-soft-saffron-dark" />
          <h3 className="font-serif font-bold text-charcoal text-[14px]">
            Maternal Cash Aid Calculator
          </h3>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setChildOrder('first');
            }}
            className={`flex-1 py-1.5 px-2 rounded-xl text-[12px] font-bold transition-all ${
              childOrder === 'first'
                ? 'bg-charcoal text-white shadow-xs'
                : 'bg-cream text-medium border border-border/70'
            }`}
          >
            1st Child (Boy/Girl)
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setChildOrder('second_girl');
            }}
            className={`flex-1 py-1.5 px-2 rounded-xl text-[12px] font-bold transition-all ${
              childOrder === 'second_girl'
                ? 'bg-charcoal text-white shadow-xs'
                : 'bg-cream text-medium border border-border/70'
            }`}
          >
            2nd Child (Girl)
          </button>
        </div>

        <div className="mt-3 p-3 bg-white rounded-xl border border-border/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-medium">Total DBT Entitlement:</span>
            <p className="font-serif text-[18px] font-bold text-charcoal">
              {childOrder === 'first' ? '₹6,400' : '₹7,400'}
            </p>
          </div>
          <span className="text-[11px] font-semibold text-soft-saffron-dark text-right">
            PMMVY (₹{childOrder === 'first' ? '5,000' : '6,000'})<br />+ JSY (₹1,400)
          </span>
        </div>
      </div>

      {/* 3. Scheme Cards List */}
      <div className="space-y-2.5">
        <h3 className="font-serif text-[14.5px] font-bold text-charcoal px-1">
          Applicable Schemes ({filteredSchemes.length})
        </h3>

        {filteredSchemes.map((scheme) => (
          <div key={scheme.id} className="bg-white border border-border/80 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-sage-dark bg-sage-pale px-2 py-0.5 rounded-full uppercase">
                  {scheme.badge}
                </span>
                <h4 className="font-bold text-charcoal text-[14px] mt-1.5 leading-snug">
                  {scheme.name}
                </h4>
              </div>
              <span className="font-bold text-charcoal text-[13px] text-right shrink-0">
                {scheme.amount}
              </span>
            </div>

            <p className="text-[12px] text-medium mt-2 leading-relaxed">
              <strong>Eligibility:</strong> {scheme.eligibility}
            </p>
            <p className="text-[12px] text-medium mt-1 leading-relaxed">
              <strong>How to Apply:</strong> {scheme.howToApply}
            </p>

            <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between">
              <a
                href={scheme.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11.5px] font-bold text-sage-dark hover:underline"
              >
                <span>Official Portal</span>
                <ExternalLink size={12} />
              </a>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onOpenTool('schemes');
                }}
                className="inline-flex items-center gap-0.5 text-[11.5px] font-bold text-charcoal hover:text-sage-dark cursor-pointer"
              >
                <span>Details</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 4. ABHA Encrypted Medical Records Locker */}
      <div className="bg-white border border-border/80 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Lock size={16} />
            </div>
            <div>
              <h4 className="font-bold text-charcoal text-[13.5px]">
                ABHA Encrypted Records Locker
              </h4>
              <span className="text-[10.5px] text-medium">AES-256 Stored 100% on Device</span>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-sage-dark">
            ABHA: 91-8421-9920
          </span>
        </div>

        <button
          type="button"
          onClick={handleSimulatedUpload}
          className="w-full py-2.5 bg-cream hover:bg-sage-pale/60 border border-dashed border-sage/60 rounded-xl text-sage-dark font-bold text-[12.5px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <FileUp size={16} />
          <span>+ Upload Ultrasound Scan or Lab Report</span>
        </button>

        <div className="mt-3 space-y-2 text-[12px]">
          <div className="p-2.5 rounded-xl bg-cream/60 border border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-soft-saffron-dark" />
              <div>
                <p className="font-bold text-charcoal">Ultrasound_Anomaly_Week20.pdf</p>
                <span className="text-[10.5px] text-light">2.4 MB • Encrypted</span>
              </div>
            </div>
            <CheckCircle2 size={16} className="text-sage" />
          </div>
        </div>
      </div>
    </div>
  );
};
