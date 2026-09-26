import React from 'react';
import { ShieldAlert, Sparkles } from 'lucide-react';
import { usePlanner } from '../../store';
import { triggerHaptic, isNativeApp } from '../../utils/nativeBridge';
import { auth } from '../../firebase';

interface MobileTopBarProps {
  onOpenProfile: () => void;
  onOpenLanguage: () => void;
  onOpenSos: () => void;
  onOpenPricing: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  onOpenProfile,
  onOpenLanguage,
  onOpenSos,
  onOpenPricing,
}) => {
  const { state } = usePlanner();
  const isNative = isNativeApp();

  // Calculate gestational details dynamically
  const due = state.dueDate ? new Date(state.dueDate) : new Date(Date.now() + 112 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffDays = Math.max(0, Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const completedDays = Math.max(1, 280 - diffDays);
  const currentWeek = Math.min(40, Math.max(1, Math.floor(completedDays / 7) + 1));
  const dueFormatted = due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const displayName = state.userName || auth.currentUser?.displayName || 'Mother';
  const userInitial = displayName.trim().charAt(0).toUpperCase() || 'A';

  return (
    <header className={`bg-[#FDFBF7] border-b border-border/80 px-3.5 pb-2.5 w-full select-none ${
      isNative ? 'pt-[max(2.75rem,env(safe-area-inset-top))]' : 'pt-[max(0.65rem,env(safe-area-inset-top))]'
    }`}>
      {/* Upper Brand & Action Row */}
      <div className="flex items-center justify-between gap-2 w-full">
        {/* Brand Identity */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <img
            src="/logo.png"
            alt="Our Pregnancy Logo"
            className="w-7 h-7 object-contain rounded-full bg-white shadow-2xs border border-border/70 shrink-0"
          />
          <span className="font-serif font-bold text-charcoal text-[16px] tracking-tight leading-none whitespace-nowrap">
            Our Pregnancy
          </span>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenPricing();
            }}
            className="bg-amber-50 hover:bg-amber-100/80 text-amber-800 text-[9.5px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 flex items-center gap-0.5 border border-amber-300/80 transition-colors cursor-pointer shadow-3xs active:scale-95"
            aria-label="Upgrade to Pro"
          >
            <Sparkles size={9} className="text-amber-600" />
            <span>PRO</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Language Selector Trigger */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenLanguage();
            }}
            className="h-7 px-2 flex items-center gap-1 bg-white border border-border/90 rounded-full text-[11px] font-semibold text-charcoal hover:bg-sage-pale/40 transition-all shadow-2xs shrink-0 active:scale-95"
            aria-label="Select Language"
          >
            <span className="text-[12px] leading-none">🇮🇳</span>
            <span className="text-[10.5px] font-medium text-charcoal/80">EN</span>
          </button>

          {/* 108 SOS Emergency Button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('warning');
              onOpenSos();
            }}
            className="h-7 px-2 flex items-center gap-1 bg-rose-50 border border-rose-200/90 rounded-full text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition-all shadow-2xs shrink-0 active:scale-95"
            aria-label="Emergency SOS"
          >
            <ShieldAlert size={12} className="text-rose-600 shrink-0" />
            <span className="leading-none">108</span>
          </button>

          {/* Profile Avatar Trigger */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenProfile();
            }}
            className="w-7 h-7 rounded-full bg-sage text-white font-bold text-[12px] flex items-center justify-center shadow-2xs hover:opacity-90 active:scale-95 transition-transform shrink-0 ring-1 ring-border/50"
            aria-label="Open Profile Settings"
          >
            {userInitial}
          </button>
        </div>
      </div>

      {/* Gestational Timeline Pill Row */}
      <div className="mt-2 flex items-center justify-between bg-white border border-border/70 rounded-full px-3 py-1 text-[11.5px] text-medium shadow-2xs font-medium">
        <span className="font-semibold text-charcoal">Week {currentWeek} of 40</span>
        <span className="text-border">•</span>
        <span>Day {completedDays}</span>
        <span className="text-border">•</span>
        <span>Due: <strong className="text-charcoal font-semibold">{dueFormatted}</strong></span>
      </div>
    </header>
  );
};
