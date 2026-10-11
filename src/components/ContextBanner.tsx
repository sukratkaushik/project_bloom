import React from 'react';
import { usePlanner } from '../store';

interface ContextBannerProps {
  description?: React.ReactNode;
}

export const ContextBanner: React.FC<ContextBannerProps> = ({ description }) => {
  const { state } = usePlanner();
  const parts = [];
  
  if (state.pregnancyNum === 'subsequent') parts.push('subsequent pregnancy');
  if (state.workSit === 'selfemployed') parts.push('self-employed');
  if (state.workSit === 'demanding') parts.push('shift / demanding work');
  if (state.workSit === 'notworking') parts.push('not currently working');
  if (state.partnerSit === 'solo') parts.push('solo parent');
  if (state.flags.highRisk) parts.push('high-risk pregnancy');
  if (state.flags.multiples) parts.push('multiples');
  if (state.flags.ivf) parts.push('IVF / assisted conception');
  if (state.flags.mentalHealth) parts.push('mental health support');
  if (state.flags.cultural) parts.push('cultural preferences');

  return (
    <div className="bg-gradient-to-r from-sage-pale/90 to-blush-pale/90 rounded-xl p-3.5 text-[12.5px] xs:text-[13px] text-medium mb-4 border border-border/70 leading-relaxed shadow-3xs space-y-2">
      {description && (
        <div className="text-charcoal/90 text-[12.5px] xs:text-[13px] leading-relaxed font-normal">
          {description}
        </div>
      )}
      {parts.length > 0 ? (
        <div className={description ? "text-[11.5px] xs:text-[12px] text-medium pt-2 border-t border-border/50" : "text-[12.5px] xs:text-[13px] text-medium"}>
          <strong className="text-charcoal font-semibold">Personalised for:</strong> {parts.join(' · ')}. Tasks marked with your circumstances have been added or adjusted.
        </div>
      ) : (
        <div className={description ? "text-[11.5px] xs:text-[12px] text-medium pt-2 border-t border-border/50" : "text-[12.5px] xs:text-[13px] text-medium"}>
          <strong className="text-charcoal font-semibold">Plan generated.</strong> Select any considerations on the setup screen to personalise further.
        </div>
      )}
    </div>
  );
};

