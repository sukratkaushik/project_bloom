import React from 'react';
import { usePlanner } from '../store';

export const ContextBanner: React.FC = () => {
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

  if (parts.length === 0) {
    return (
      <div className="bg-gradient-to-r from-sage-pale to-blush-pale rounded-[14px] p-[14px_18px] text-[13px] text-medium mb-6 border border-border leading-[1.6]">
        <strong>Plan generated.</strong> Select any considerations on the setup screen to personalise further.
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-sage-pale to-blush-pale rounded-[14px] p-[14px_18px] text-[13px] text-medium mb-6 border border-border leading-[1.6]">
      <strong className="text-charcoal">Personalised for:</strong> {parts.join(' · ')}. Tasks marked with your circumstances have been added or adjusted.
    </div>
  );
};
