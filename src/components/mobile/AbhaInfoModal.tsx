import React from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldCheck,
  X,
  CheckCircle2,
  Lock,
  FileText,
  BadgeIndianRupee,
  Share2,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { triggerHaptic } from '../../utils/nativeBridge';

interface AbhaInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AbhaInfoModal: React.FC<AbhaInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleClose = () => {
    triggerHaptic('light');
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal/50 backdrop-blur-sm animate-in fade-in duration-200 select-none"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 pb-[max(2.5rem,calc(env(safe-area-inset-bottom,0px)+1.5rem))] sm:pb-6 shadow-2xl border border-border/80 dark:border-stone-800 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border/60 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-sage-pale text-sage-dark dark:bg-sage-dark/30 dark:text-sage-light flex items-center justify-center font-bold shrink-0 border border-sage/20">
              <ShieldCheck size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="font-serif font-bold text-charcoal dark:text-cream text-[17px] leading-tight truncate">
                  Understanding ABHA
                </h2>
                <span className="text-[9.5px] font-bold text-sage-dark dark:text-sage-light bg-sage-pale dark:bg-sage-dark/30 px-2 py-0.2 rounded-full uppercase border border-sage/20 shrink-0">
                  Govt. of India
                </span>
              </div>
              <p className="text-[11.5px] text-medium dark:text-stone-400 truncate mt-0.5">
                Ayushman Bharat Digital Mission (ABDM)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-medium hover:text-charcoal hover:bg-cream dark:hover:bg-stone-800 rounded-full transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto pt-4 space-y-4 pr-0.5 custom-scrollbar text-charcoal dark:text-stone-200 text-[12.5px] leading-relaxed">
          {/* 1. Clarification & Peace of Mind: NOT Mandatory */}
          <div className="p-3.5 rounded-2xl bg-sage-pale/60 dark:bg-sage-dark/20 border border-sage/30 dark:border-sage/40 flex items-start gap-2.5">
            <CheckCircle2 size={18} className="text-sage-dark dark:text-sage-light shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sage-dark dark:text-sage-light block">
                100% Voluntary & Optional
              </span>
              <p className="text-[12px] text-charcoal/90 dark:text-stone-200 mt-0.5 leading-snug">
                You do <strong>not</strong> need an ABHA ID to receive pregnancy care, visit your doctor, or deliver at any hospital in India. Having one is entirely your choice.
              </p>
            </div>
          </div>

          {/* 2. What is ABHA? */}
          <div>
            <h3 className="font-serif font-bold text-[14px] text-charcoal dark:text-cream mb-1 flex items-center gap-1.5">
              <span>What is an ABHA ID?</span>
            </h3>
            <p className="text-medium dark:text-stone-300">
              <strong>ABHA</strong> (Ayushman Bharat Health Account) is a unique <strong>14-digit health identification number</strong> created by the National Health Authority (NHA). Think of it as a secure digital identity for your medical records — similar to how UPI works for bank accounts — allowing Indian hospitals and diagnostic centers to share lab reports and ultrasound scans without physical paper.
            </p>
          </div>

          {/* 3. Core Benefits for Expectant Mothers */}
          <div className="space-y-2.5 pt-1">
            <h3 className="font-serif font-bold text-[14px] text-charcoal dark:text-cream">
              Key Benefits for Mothers:
            </h3>

            {/* Benefit A: Paperless Scans & Labs */}
            <div className="p-3 rounded-xl bg-cream/70 dark:bg-stone-800/80 border border-border/70 dark:border-stone-700 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-stone-700 text-sage-dark dark:text-sage-light flex items-center justify-center shrink-0 border border-border/50 shadow-3xs">
                <FileText size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-[13px] text-charcoal dark:text-cream leading-tight">
                  Paperless Medical History
                </h4>
                <p className="text-[11.5px] text-medium dark:text-stone-300 mt-0.5 leading-relaxed">
                  Major maternity chains (Cloudnine, Apollo, Fortis, Manipal) can digitally link your blood tests and ultrasound reports without you having to carry thick paper folders.
                </p>
              </div>
            </div>

            {/* Benefit B: Government Maternity Aid (DBT) */}
            <div className="p-3 rounded-xl bg-cream/70 dark:bg-stone-800/80 border border-border/70 dark:border-stone-700 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-stone-700 text-gold-dark dark:text-gold flex items-center justify-center shrink-0 border border-border/50 shadow-3xs">
                <BadgeIndianRupee size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-[13px] text-charcoal dark:text-cream leading-tight">
                  Direct Maternity Benefit Transfers (DBT)
                </h4>
                <p className="text-[11.5px] text-medium dark:text-stone-300 mt-0.5 leading-relaxed">
                  Seamlessly qualifies and connects checkups to welfare schemes like <strong>PMMVY</strong> (₹5,000 cash aid), <strong>JSY</strong>, and <strong>PMSMA</strong> for direct bank deposits.
                </p>
              </div>
            </div>

            {/* Benefit C: Full Privacy & Consent */}
            <div className="p-3 rounded-xl bg-cream/70 dark:bg-stone-800/80 border border-border/70 dark:border-stone-700 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-stone-700 text-sage-dark dark:text-sage-light flex items-center justify-center shrink-0 border border-border/50 shadow-3xs">
                <Lock size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-[13px] text-charcoal dark:text-cream leading-tight">
                  100% Consent-Driven Privacy
                </h4>
                <p className="text-[11.5px] text-medium dark:text-stone-300 mt-0.5 leading-relaxed">
                  No hospital or doctor can view your medical history without your active OTP or consent. In Our Pregnancy, all files are stored with AES-256 encryption on your device.
                </p>
              </div>
            </div>
          </div>

          {/* 4. How Our Pregnancy Handles It */}
          <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-border/80 dark:border-stone-700 text-[11.5px] text-medium dark:text-stone-300 space-y-1">
            <span className="font-bold text-charcoal dark:text-cream block">
              🌸 Using Our Pregnancy without an ABHA ID:
            </span>
            <p>
              If you don't have an ABHA ID, you can still use every feature in Our Pregnancy — uploading scan photos/PDFs, viewing AI ultrasound summaries, tracking vitals, and printing the Doctor Care Plan PDF.
            </p>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-3.5 mt-2 border-t border-border/60 dark:border-stone-800 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2.5 bg-sage hover:bg-sage-dark text-white text-[13px] font-bold rounded-xl shadow-xs transition-all active:scale-[0.99] cursor-pointer"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
