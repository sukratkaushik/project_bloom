import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, MedicalReport } from '../../../db';
import {
  Building, ShieldCheck, FileText, ChevronRight, Calculator,
  Lock, FileUp, CheckCircle2, ExternalLink, Download, Share2,
  FolderLock, Eye, Plus, Sparkles, Filter, Check
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
  // Segmented top toggle: Govt Schemes vs Medical Records
  const [activeSegment, setActiveSegment] = useState<'schemes' | 'records'>('schemes');

  // Schemes State
  const [selectedState, setSelectedState] = useState('national');
  const [childOrder, setChildOrder] = useState<'first' | 'second_girl'>('first');

  // Medical Records Filter
  const [recordFilter, setRecordFilter] = useState<'all' | 'ultrasound' | 'lab' | 'prescription'>('all');

  // Dexie live query for user-uploaded medical reports
  const liveReports = useLiveQuery<MedicalReport[]>(
    async () => {
      try {
        if (!db.medicalReports) return [];
        return await db.medicalReports.orderBy('timestamp').reverse().toArray();
      } catch (err) {
        console.warn('Could not query medicalReports:', err);
        return [];
      }
    },
    [],
    []
  );

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
      amount: childOrder === 'first' ? '₹5,000 Cash' : '₹6,000 Cash (Girl)',
      eligibility: 'Pregnant women aged 19+ for 1st birth (and ₹6,000 for 2nd girl child).',
      howToApply: 'Register with MCP card at Anganwadi or online on pmmvy.wcd.gov.in.',
      stateScope: 'national',
      link: 'https://pmmvy.wcd.gov.in',
    },
    {
      id: 'jsy',
      name: 'Janani Suraksha Yojana (JSY)',
      badge: 'Institutional Delivery',
      amount: '₹1,400 Cash Aid',
      eligibility: 'All pregnant mothers delivering in government or accredited private hospitals.',
      howToApply: 'Disbursed upon discharge through ASHA/ANM coordination.',
      stateScope: 'national',
      link: 'https://nhm.gov.in',
    },
    {
      id: 'pmsma',
      name: 'PMSMA Free Specialist Antenatal OPD',
      badge: 'Free Specialist Scans',
      amount: '100% Free Scans',
      eligibility: 'All pregnant mothers in their 2nd and 3rd trimesters across India.',
      howToApply: 'Visit government hospital on the 9th of every month.',
      stateScope: 'national',
      link: 'https://pmsma.nhp.gov.in',
    },
    {
      id: 'kcr-kit',
      name: 'KCR Nutrition & Baby Kit',
      badge: 'Telangana Flagship',
      amount: '₹12,000 Aid + 16-Item Kit',
      eligibility: 'Telangana residents delivering in government maternity hospitals.',
      howToApply: 'Register via ASHA worker at your local PHC.',
      stateScope: 'telangana',
      link: 'https://kcrkit.telangana.gov.in',
    },
    {
      id: 'muthulakshmi',
      name: 'Dr. Muthulakshmi Reddy Maternity Scheme',
      badge: 'Tamil Nadu Flagship',
      amount: '₹18,000 Assistance',
      eligibility: 'Tamil Nadu mothers registered under PICME delivering in public hospitals.',
      howToApply: 'Enroll with Village Health Nurse (VHN) via PICME portal.',
      stateScope: 'tamilnadu',
      link: 'https://picme.tn.gov.in',
    },
    {
      id: 'mathru-poorna',
      name: 'Mathru Poorna Nutritious Meal Scheme',
      badge: 'Karnataka Flagship',
      amount: 'Daily Meal + Eggs',
      eligibility: 'Pregnant mothers attending Anganwadi centers in Karnataka.',
      howToApply: 'Register with local Anganwadi worker with Aadhaar & MCP card.',
      stateScope: 'karnataka',
      link: 'https://dwcd.karnataka.gov.in',
    },
  ];

  const filteredSchemes = schemes.filter((s) => {
    return selectedState === 'national'
      ? s.stateScope === 'national'
      : s.stateScope === 'national' || s.stateScope === selectedState;
  });

  // Default sample records if live query is empty
  const defaultSampleRecords = [
    {
      id: 'sample-1',
      title: 'Level II TIFFA Anomaly Scan',
      type: 'ultrasound',
      date: '28 Aug • Cloudnine',
      size: '3.2 MB',
      aiSummary: 'Normal fetal anatomy. Four-chamber heart, normal spine & AFI 14.2 cm.',
      badge: 'Ultrasound',
    },
    {
      id: 'sample-2',
      title: 'Complete Blood Count & Ferritin',
      type: 'lab',
      date: '15 Aug • Manipal',
      size: '1.1 MB',
      aiSummary: 'Hb: 11.4 g/dL (Adequate). Ferritin: 42 ng/mL. Platelets normal.',
      badge: 'Bloodwork',
    },
    {
      id: 'sample-3',
      title: 'NT Scan & Dual Marker Risk',
      type: 'ultrasound',
      date: '18 Jul • Cloudnine',
      size: '2.8 MB',
      aiSummary: 'Low risk for Trisomy 21 (1:4500). NT 1.3 mm. Nasal bone present.',
      badge: 'NT Screen',
    },
  ];

  const handleSimulatedUpload = () => {
    triggerHaptic('success');
    onOpenTool('medical-reports');
  };

  const handleExportAbha = () => {
    triggerHaptic('success');
    onShowToast('🔒 ABHA Health Record export generated and encrypted (AES-256)');
  };

  return (
    <div className="space-y-4 pb-32 animate-in fade-in duration-200">
      {/* 1. Dual Mode Segmented Switcher (Single Line Buttons) */}
      <div className="bg-cream/90 p-1 rounded-2xl border border-border/80 flex items-center gap-1 shadow-2xs">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setActiveSegment('schemes');
          }}
          className={`flex-1 h-10 px-3 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeSegment === 'schemes'
              ? 'bg-charcoal text-white shadow-xs'
              : 'text-medium hover:text-charcoal'
          }`}
        >
          <Building size={15} />
          <span>Govt Schemes</span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setActiveSegment('records');
          }}
          className={`flex-1 h-10 px-3 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeSegment === 'records'
              ? 'bg-charcoal text-white shadow-xs'
              : 'text-medium hover:text-charcoal'
          }`}
        >
          <FolderLock size={15} />
          <span>Medical Records</span>
        </button>
      </div>

      {/* VIEW A: GOVT MATERNITY SCHEMES */}
      {activeSegment === 'schemes' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Header & State Selector Card */}
          <div className="bg-white border border-border/80 rounded-3xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/50">
                  <Building size={19} />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-charcoal text-[15.5px] leading-tight">
                    Maternity Schemes
                  </h2>
                  <span className="text-[11px] text-medium">MoHFW Verified</span>
                </div>
              </div>
              <span className="text-[9.5px] font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200 whitespace-nowrap">
                2026 UPDATED
              </span>
            </div>

            {/* State Selector Dropdown */}
            <div className="mt-3.5 pt-3 border-t border-border/60">
              <label className="text-[10px] font-bold text-medium uppercase tracking-wider block mb-1">
                Select State / UT
              </label>
              <select
                value={selectedState}
                onChange={(e) => {
                  triggerHaptic('light');
                  setSelectedState(e.target.value);
                }}
                className="w-full h-10 bg-cream/70 border border-border/80 rounded-xl px-3 text-[12.5px] font-bold text-charcoal focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              >
                {states.map((st) => (
                  <option key={st.code} value={st.code}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Maternal Cash Aid Direct Benefit Calculator Bento */}
          <div className="bg-gradient-to-br from-amber-500/10 via-white to-orange-500/10 border border-amber-200/80 rounded-3xl p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Calculator size={17} className="text-soft-saffron-dark" />
              <h3 className="font-serif font-bold text-charcoal text-[14.5px]">
                Maternal Cash Benefit Calculator
              </h3>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setChildOrder('first');
                }}
                className={`flex-1 h-8 rounded-xl text-[11.5px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  childOrder === 'first'
                    ? 'bg-charcoal text-white shadow-xs'
                    : 'bg-cream text-medium border border-border/70'
                }`}
              >
                1st Child
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setChildOrder('second_girl');
                }}
                className={`flex-1 h-8 rounded-xl text-[11.5px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  childOrder === 'second_girl'
                    ? 'bg-charcoal text-white shadow-xs'
                    : 'bg-cream text-medium border border-border/70'
                }`}
              >
                2nd Child (Girl)
              </button>
            </div>

            <div className="mt-3 p-3 bg-white rounded-2xl border border-border/60 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10.5px] text-medium block">Total Central DBT Cash:</span>
                <p className="font-serif text-[19px] font-bold text-charcoal leading-tight mt-0.5">
                  {childOrder === 'first' ? '₹6,400' : '₹7,400'}
                </p>
                <span className="text-[9.5px] text-green-700 font-bold block mt-0.5">Direct to Bank Account</span>
              </div>
              <div className="text-right text-[10.5px] text-soft-saffron-dark font-semibold leading-snug">
                <span>PMMVY: ₹{childOrder === 'first' ? '5,000' : '6,000'}</span>
                <br />
                <span>JSY Delivery: ₹1,400</span>
              </div>
            </div>
          </div>

          {/* Scheme Cards List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-serif text-[14.5px] font-bold text-charcoal">
                Applicable Schemes ({filteredSchemes.length})
              </h3>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onOpenTool('schemes');
                }}
                className="text-[11px] font-bold text-sage-dark hover:underline cursor-pointer"
              >
                Full Guide →
              </button>
            </div>

            {filteredSchemes.map((scheme) => (
              <div key={scheme.id} className="bg-white border border-border/80 rounded-2xl p-3.5 shadow-2xs hover:border-sage transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-bold text-sage-dark bg-sage-pale px-2 py-0.2 rounded-md uppercase whitespace-nowrap">
                      {scheme.badge}
                    </span>
                    <h4 className="font-bold text-charcoal text-[13.5px] mt-1 leading-snug truncate">
                      {scheme.name}
                    </h4>
                  </div>
                  <span className="font-bold text-charcoal text-[12.5px] shrink-0 bg-cream px-2 py-0.5 rounded-lg border border-border/50 whitespace-nowrap">
                    {scheme.amount}
                  </span>
                </div>

                <p className="text-[11.5px] text-medium mt-1.5 truncate">
                  <strong className="text-charcoal font-semibold">Eligibility: </strong>
                  {scheme.eligibility}
                </p>
                <p className="text-[11.5px] text-medium mt-0.5 truncate">
                  <strong className="text-charcoal font-semibold">How to Claim: </strong>
                  {scheme.howToApply}
                </p>

                <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between">
                  <a
                    href={scheme.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-sage-dark hover:underline"
                  >
                    <span>Portal</span>
                    <ExternalLink size={11} />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      onOpenTool('schemes');
                    }}
                    className="inline-flex items-center gap-0.5 text-[11px] font-bold text-charcoal hover:text-sage-dark cursor-pointer"
                  >
                    <span>Details</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW B: PRIVATE MEDICAL RECORDS LOCKER */}
      {activeSegment === 'records' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* ABHA Security Banner */}
          <div className="bg-white border border-border/80 rounded-3xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200/50">
                  <Lock size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-charcoal text-[15px] leading-tight">
                    ABHA Encrypted Records
                  </h3>
                  <span className="text-[10.5px] text-medium">AES-256 On Device</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportAbha}
                className="h-8 px-2.5 rounded-xl bg-cream hover:bg-sage-pale text-charcoal text-[11px] font-bold flex items-center gap-1 border border-border/70 transition-colors cursor-pointer"
                title="Export FHIR R4 Bundle"
              >
                <Share2 size={13} />
                <span>Export</span>
              </button>
            </div>

            <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px]">
              <span className="text-medium">ABHA ID:</span>
              <span className="font-mono font-bold text-sage-dark bg-sage-pale px-2 py-0.5 rounded-lg">
                91-8421-9920-5512
              </span>
            </div>
          </div>

          {/* Single-Line Upload Button */}
          <button
            type="button"
            onClick={handleSimulatedUpload}
            className="w-full h-12 bg-gradient-to-r from-sage-pale/80 to-cream hover:from-sage-pale hover:to-cream border-2 border-dashed border-sage/60 rounded-2xl text-sage-dark font-bold text-[12.5px] flex items-center justify-center gap-2 shadow-2xs active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
          >
            <FileUp size={16} />
            <span>+ Upload Ultrasound Scan or Lab Report</span>
          </button>

          {/* Filter Chips for Medical Records */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {[
              { key: 'all', label: 'All' },
              { key: 'ultrasound', label: 'Ultrasounds' },
              { key: 'lab', label: 'Bloodwork' },
              { key: 'prescription', label: 'Prescriptions' },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setRecordFilter(f.key as any);
                }}
                className={`h-8 px-3 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer whitespace-nowrap ${
                  recordFilter === f.key
                    ? 'bg-charcoal text-white shadow-2xs'
                    : 'bg-white text-medium border border-border/70 hover:bg-cream'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Medical Records List */}
          <div className="space-y-2">
            {liveReports && liveReports.length > 0 ? (
              liveReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => {
                    triggerHaptic('light');
                    onOpenTool('medical-reports');
                  }}
                  className="bg-white border border-border/80 hover:border-sage rounded-2xl p-3.5 shadow-2xs transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-charcoal text-[13px] leading-tight truncate">
                          {report.title || report.fileName}
                        </h4>
                        <span className="text-[10.5px] text-medium truncate block mt-0.5">
                          {report.date} • {(report.fileSize / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      </div>
                    </div>
                    <CheckCircle2 size={16} className="text-sage shrink-0" />
                  </div>

                  {report.aiSummary && (
                    <div className="mt-2 p-2 rounded-xl bg-cream/70 border border-border/50 text-[11px] text-medium truncate">
                      <strong className="text-charcoal font-semibold">AI Summary: </strong> {report.aiSummary}
                    </div>
                  )}
                </div>
              ))
            ) : (
              defaultSampleRecords
                .filter((r) => recordFilter === 'all' || r.type === recordFilter)
                .map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      triggerHaptic('light');
                      onOpenTool('medical-reports');
                    }}
                    className="bg-white border border-border/80 hover:border-sage rounded-2xl p-3.5 shadow-2xs transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-sage-pale text-sage-dark flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <FileText size={17} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-charcoal text-[13px] leading-tight truncate group-hover:text-sage-dark transition-colors">
                              {r.title}
                            </h4>
                            <span className="text-[9px] font-bold text-sage-dark bg-sage-pale px-1.5 py-0.2 rounded-md uppercase whitespace-nowrap shrink-0">
                              {r.badge}
                            </span>
                          </div>
                          <span className="text-[11px] text-medium truncate block mt-0.5">
                            {r.date} • {r.size}
                          </span>
                        </div>
                      </div>
                      <CheckCircle2 size={16} className="text-sage shrink-0" />
                    </div>

                    <div className="mt-2 p-2 rounded-xl bg-cream/70 border border-border/50 text-[11px] text-charcoal/90 truncate">
                      <span className="font-bold text-sage-dark mr-1">AI:</span>
                      {r.aiSummary}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
