import React, { useState } from 'react';
import { usePlanner } from '../store';
import { 
  Calendar, 
  Stethoscope, 
  FileText, 
  Heart, 
  Share2, 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Phone, 
  Building2, 
  Camera, 
  Activity, 
  Download, 
  Bot, 
  Lock,
  ChevronRight,
  UserCheck,
  Clock,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { triggerHaptic } from '../utils/nativeBridge';
import { DoctorModal } from './mobile/DoctorModal';
import { DoctorInfo } from '../types';

interface UserFlowGuideProps {
  onNavigate?: (page: string) => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const UserFlowGuide: React.FC<UserFlowGuideProps> = ({ 
  onNavigate, 
  isModal = false,
  onClose 
}) => {
  const { state, updateState } = usePlanner();
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveDoctor = (doctorData: DoctorInfo) => {
    updateState({ doctor: doctorData });
    showToast('Obstetrician profile saved to your local Care Plan!');
  };

  const handleRemoveDoctor = () => {
    updateState({ doctor: undefined });
    showToast('Doctor profile removed');
  };

  const handleExportPdf = async () => {
    triggerHaptic('medium');
    try {
      const { exportCarePlanPdf } = await import('../utils/pdfExport');
      exportCarePlanPdf(state);
      showToast('Care Plan PDF downloaded for your OB-GYN visit!');
    } catch (err) {
      console.error('Failed to export Care Plan PDF:', err);
      showToast('Could not generate PDF. Please try again.');
    }
  };

  // Check setup completions
  const isTimelineSet = Boolean(state.dueDate);
  const isDoctorSet = Boolean(state.doctor?.name);
  const isPartnerSet = Boolean(state.partnerSit && state.partnerSit !== 'solo');

  const steps = [
    {
      id: 1,
      shortTitle: '1. Setup Journey',
      title: 'Calibrate Your 42-Week Gestational Timeline',
      category: 'Day 0 Setup',
      badge: isTimelineSet ? 'Completed ✅' : 'Action Needed',
      badgeColor: isTimelineSet ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
      icon: Calendar,
      description: 'Your due date and last menstrual period (LMP) anchor your entire pregnancy progression, developmental milestones, and screening schedules.',
      keyActions: [
        'Select your Estimated Due Date (or LMP) via the calibrated date picker',
        'Declare specific maternal context (First vs. subsequent baby, working situation, dietary preference)',
        'Toggle clinical flags (IVF conception, twin pregnancy, high-risk or gestational hypertension) to adapt AI safety bounds',
        'Review and grant DPDP local-first consent'
      ],
      tip: 'The app automatically calculates your trimester transition dates and weekly fetal size analogies (e.g. Week 12: plum, Week 24: mango).',
      ctaText: 'Adjust Pregnancy Setup',
      ctaAction: () => {
        triggerHaptic('light');
        if (onNavigate) onNavigate('profile');
      }
    },
    {
      id: 2,
      shortTitle: '2. Care Team & Doctor',
      title: 'Configure Your Obstetrician & Emergency Safety Net',
      category: 'Critical Safety Step',
      badge: isDoctorSet ? 'Doctor Linked 🩺' : 'Recommended',
      badgeColor: isDoctorSet ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800',
      icon: Stethoscope,
      description: 'Link your primary obstetrician or maternity hospital so your dashboard can trigger direct emergency speed dials during high-risk vitals or active labor.',
      keyActions: [
        'Add Doctor Name & Maternity Hospital (e.g. Dr. Priya Sharma, Cloudnine)',
        'Save OPD clinic phone and emergency labor ward direct hotline',
        'Record hospital email and doctor-specific instructions (e.g. Rh-negative blood, aspirin regimen)',
        'Test automated 1-tap emergency dialer (108 / 112 / Hospital Hotline)'
      ],
      tip: 'When your contraction timer registers the 5-1-1 rule or blood pressure exceeds 140/90 mmHg, OPIN surfaces a 1-tap call button directly to your doctor.',
      ctaText: isDoctorSet ? 'Edit Doctor Profile' : '+ Configure Doctor Now',
      ctaAction: () => {
        triggerHaptic('medium');
        setIsDoctorModalOpen(true);
      }
    },
    {
      id: 3,
      shortTitle: '3. Medical Vault',
      title: 'Upload Ultrasound Scans & Lab Biomarkers',
      category: 'Zero-Leak Health Vault',
      badge: 'Local-First',
      badgeColor: 'bg-blue-100 text-blue-800',
      icon: FileText,
      description: 'Digitize paper prescriptions, ultrasound scan reports, and blood tests on-device. No sensitive patient health information leaves your browser.',
      keyActions: [
        'Upload Ultrasound reports (NT Scan, Anomaly Scan, Growth USG)',
        'Client-side OCR extracts clinical biometric markers (CRL, BPD, AFI, Placenta Grade)',
        'Secure bloodwork panels (CBC, HbA1c, OGTT, Thyroid TSH)',
        'AI translates medical abbreviations into plain, reassuring explanations'
      ],
      tip: 'Never scramble through plastic folders at the clinic. Your entire pregnancy diagnostic archive is accessible offline.',
      ctaText: 'Open Medical Reports Vault',
      ctaAction: () => {
        triggerHaptic('light');
        if (onNavigate) onNavigate('medical-reports');
      }
    },
    {
      id: 4,
      shortTitle: '4. Daily Routine',
      title: 'Your 60-Second Daily Maternal Health Routine',
      category: 'Active Tracking',
      badge: 'Daily Wellness',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: Activity,
      description: 'A quiet, non-judgmental tracking loop designed to catch red flags early without creating unnecessary anxiety.',
      keyActions: [
        'Morning: Review your Daily Knowledge Drop and log mood or hydration',
        'Meals: Snap food photos or scan barcodes via Open Food Facts for pregnancy safety checks (Folate, Iron, Calcium, Listeria & Papain alerts)',
        'Evening: Record blood pressure and resting vitals (especially if tracking pre-eclampsia)',
        'Trimester 3: Kick Counter (fetal movement) and Contraction Timer (5-1-1 labor rule)',
        'Midnight: 24/7 Bloom AI clinical triage for unusual symptoms or nighttime cramps'
      ],
      tip: 'Tracking is 100% local-first in IndexedDB (BloomDB v3). Your logs stay on your device with optional P2P partner sync.',
      ctaText: 'Try AI Food Scanner',
      ctaAction: () => {
        triggerHaptic('light');
        if (onNavigate) onNavigate('foodscanner');
      }
    },
    {
      id: 5,
      shortTitle: '5. Doctor Consult',
      title: '90-Second Clinical Handoff & Care Plan Export',
      category: 'Clinic Checkup',
      badge: 'OB-GYN Ready',
      badgeColor: 'bg-purple-100 text-purple-800',
      icon: Download,
      description: 'Doctors have only 90 seconds to review a patient file. OPIN compresses weeks of tracking into an obstetrician-optimized PDF and FHIR R4 medical bundle.',
      keyActions: [
        'Generate 1-Click Care Plan PDF formatted specifically for OB-GYNs',
        'Clinical charts: Blood pressure curves, maternal weight gain curve, kick count duration trends',
        'Export HL7 FHIR R4 Observation records for hospital EHR compatibility',
        'Present pre-compiled question lists so you never forget what to ask your doctor'
      ],
      tip: 'Handing your OB-GYN a clean, chronological vitals sheet dramatically improves clinical dialogue and peace of mind.',
      ctaText: 'Export Care Plan PDF Now',
      ctaAction: handleExportPdf
    }
  ];

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-charcoal text-cream px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-[13.5px] font-semibold animate-in slide-in-from-bottom-4">
          <CheckCircle size={18} className="text-sage" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-cream via-sage-pale/40 to-white p-6 sm:p-8 rounded-[24px] border border-border/80 shadow-xs mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sage/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-pale text-sage-dark text-[11.5px] font-bold tracking-wider uppercase mb-2.5">
              <span>🌸</span>
              <span>Our Pregnancy • Journey Architecture</span>
            </div>
            <h2 className="font-serif text-[clamp(24px,3.5vw,34px)] font-bold text-charcoal leading-tight">
              How Our Pregnancy Works
            </h2>
            <p className="text-[14px] text-medium max-w-[620px] leading-relaxed mt-1.5">
              From your first due date calculation to your labor ward handoff: here is how OPIN protects your health, configures your clinical safety net, and keeps your data 100% private.
            </p>
          </div>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="self-start sm:self-auto px-4 py-2 bg-white hover:bg-cream border border-border text-charcoal font-bold text-[13px] rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Close Guide
            </button>
          )}
        </div>

        {/* Status Pills Summary Bar */}
        <div className="mt-6 pt-5 border-t border-border/70 flex flex-wrap items-center gap-3 text-[12.5px]">
          <span className="font-bold text-charcoal/80">Your Setup Status:</span>
          
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-border">
            <span className={isTimelineSet ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
              {isTimelineSet ? '● Due Date Set' : '○ Due Date Missing'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-border">
            <span className={isDoctorSet ? "text-emerald-600 font-bold" : "text-purple-600 font-bold"}>
              {isDoctorSet ? `● Dr. ${state.doctor?.name}` : '○ No Doctor Assigned'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-border">
            <span className="text-sage font-bold">
              🔒 Local-First (IndexedDB Active)
            </span>
          </div>
        </div>
      </div>

      {/* VISUAL FLOW DIAGRAM (Interactive 5-Step Pipeline) */}
      <div className="bg-white p-5 sm:p-6 rounded-[22px] border border-border/80 shadow-xs mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-[17px] font-bold text-charcoal flex items-center gap-2">
            <Sparkles size={16} className="text-sage" /> The 5-Step Maternal User Flow
          </h3>
          <span className="text-[12px] text-medium hidden sm:inline">Tap any step to inspect details</span>
        </div>

        {/* Step Progression Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
          {steps.map((s) => {
            const Icon = s.icon;
            const isSelected = activeStep === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setActiveStep(s.id);
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between min-h-[90px] ${
                  isSelected
                    ? 'bg-sage-pale/60 border-sage shadow-xs scale-[1.02]'
                    : 'bg-cream/40 border-border/70 hover:bg-cream hover:border-border'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold ${
                    isSelected ? 'bg-sage text-white' : 'bg-white text-charcoal border border-border'
                  }`}>
                    {s.id}
                  </div>
                  <Icon size={16} className={isSelected ? 'text-sage' : 'text-medium'} />
                </div>
                <div>
                  <h4 className={`text-[12.5px] font-bold leading-snug line-clamp-1 ${
                    isSelected ? 'text-sage-dark' : 'text-charcoal'
                  }`}>
                    {s.shortTitle.split('. ')[1]}
                  </h4>
                  <span className="text-[10px] text-light block mt-0.5">{s.category}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* DETAILED ACTIVE STEP CARD */}
      {(() => {
        const current = steps.find(s => s.id === activeStep) || steps[0];
        const StepIcon = current.icon;

        return (
          <div className="bg-white p-6 sm:p-8 rounded-[24px] border-[1.5px] border-border/80 shadow-sm space-y-6 animate-in fade-in duration-200">
            
            {/* Step Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
              <div className="flex items-start gap-4">
                <div className="w-13 h-13 rounded-2xl bg-sage-pale flex items-center justify-center text-sage shrink-0 shadow-2xs">
                  <StepIcon size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-sage bg-sage-pale/60 px-2 py-0.5 rounded">
                      Step {current.id} of 5 • {current.category}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${current.badgeColor}`}>
                      {current.badge}
                    </span>
                  </div>
                  <h3 className="font-serif text-[20px] sm:text-[24px] font-bold text-charcoal">
                    {current.title}
                  </h3>
                  <p className="text-[13.5px] text-medium mt-1 leading-relaxed max-w-2xl">
                    {current.description}
                  </p>
                </div>
              </div>

              {/* Step Navigation Pills */}
              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <button
                  disabled={activeStep <= 1}
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveStep(prev => Math.max(1, prev - 1));
                  }}
                  className="px-3 py-1.5 rounded-xl border border-border text-[12px] font-bold text-charcoal hover:bg-cream disabled:opacity-40 cursor-pointer"
                >
                  ← Prev
                </button>
                <button
                  disabled={activeStep >= 5}
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveStep(prev => Math.min(5, prev + 1));
                  }}
                  className="px-3 py-1.5 rounded-xl border border-border text-[12px] font-bold text-charcoal hover:bg-cream disabled:opacity-40 cursor-pointer"
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Checklist of What to do in this Step */}
            <div>
              <h4 className="text-[12px] font-extrabold uppercase tracking-wider text-charcoal/80 mb-3 flex items-center gap-2">
                <CheckCircle size={15} className="text-sage" /> Recommended Actions in this Phase:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {current.keyActions.map((action, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-cream/50 border border-border/80 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-white border border-border flex items-center justify-center text-[11px] font-bold text-charcoal shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-[13px] text-charcoal font-medium leading-relaxed">
                      {action}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical & Privacy Tip Callout */}
            <div className="p-4 rounded-2xl bg-sage-pale/40 border border-sage/30 flex items-start gap-3.5">
              <ShieldCheck size={20} className="text-sage shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-[13.5px] text-sage-dark mb-0.5">Clinical & Architectural Note</h5>
                <p className="text-[13px] text-sage-dark/90 leading-relaxed">
                  {current.tip}
                </p>
              </div>
            </div>

            {/* Step Action CTA Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={current.ctaAction}
                className="w-full sm:w-auto px-6 py-3.5 bg-sage hover:bg-sage-dark text-white font-bold text-[14px] rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>{current.ctaText}</span>
                <ArrowRight size={16} />
              </button>

              <div className="text-[12px] text-light flex items-center gap-2">
                <Lock size={13} className="text-sage" />
                <span>Zero third-party trackers • DPDP Act 2023 Compliant</span>
              </div>
            </div>

          </div>
        );
      })()}

      {/* Doctor Modal Trigger Integration */}
      <DoctorModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        onSave={handleSaveDoctor}
        onRemove={handleRemoveDoctor}
        initialDoctor={state.doctor || null}
        onShowToast={showToast}
      />

    </div>
  );
};
