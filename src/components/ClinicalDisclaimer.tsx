import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface ClinicalDisclaimerProps {
  className?: string;
  compact?: boolean;
}

/**
 * Standardized Clinical Disclaimer Banner
 * Regulatory compliance requirement (OPIN Clinical Safety & CDSCO/FDA Guidance):
 * "Educational guidance only. Always consult your obstetrician or midwife for medical evaluation."
 */
export const ClinicalDisclaimer: React.FC<ClinicalDisclaimerProps> = ({
  className = '',
  compact = false,
}) => {
  return (
    <div
      role="note"
      aria-label="Clinical Educational Guidance Disclaimer"
      className={`bg-sage-pale/45 dark:bg-sage-dark/15 border border-sage/30 dark:border-sage/40 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-sage-dark dark:text-sage-light shadow-3xs transition-all ${
        compact ? 'text-[11.5px] py-2 px-3' : 'text-[12px] sm:text-[12.5px]'
      } ${className}`}
    >
      <div className="w-6 h-6 rounded-lg bg-sage/15 dark:bg-sage/25 flex items-center justify-center shrink-0 text-sage-dark dark:text-sage">
        <ShieldAlert className="w-3.5 h-3.5 stroke-[2.2]" aria-hidden="true" />
      </div>
      <p className="leading-relaxed font-medium tracking-tight">
        <strong className="font-semibold text-charcoal dark:text-white mr-1">
          Educational guidance only.
        </strong>
        Always consult your obstetrician or midwife for medical evaluation.
      </p>
    </div>
  );
};

export default ClinicalDisclaimer;
