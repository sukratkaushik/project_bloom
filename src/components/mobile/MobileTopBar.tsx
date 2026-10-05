import React from 'react';
import { ShieldAlert, Sparkles } from 'lucide-react';
import { usePlanner } from '../../store';
import { triggerHaptic, isNativeApp } from '../../utils/nativeBridge';
import { auth } from '../../firebase';

interface MobileTopBarProps {
  onOpenProfile: () => void;
  onOpenSos: () => void;
  onOpenPricing: () => void;
  onOpenQuickLog?: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  onOpenProfile,
  onOpenSos,
  onOpenPricing,
  onOpenQuickLog,
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
    <header className={`bg-[#FDFBF7] border-b border-border/80 px-2.5 xs:px-3.5 pb-2.5 w-full select-none ${
      isNative ? 'pt-[max(2.75rem,env(safe-area-inset-top))]' : 'pt-[max(0.65rem,env(safe-area-inset-top))]'
    }`}>
      {/* Upper Brand & Action Row */}
      <div className="flex items-center justify-between gap-1.5 xs:gap-2 w-full">
        {/* Brand Identity */}
        <div className="flex items-center gap-1.5 xs:gap-2 shrink-0">
          <img
            src="/logo.png"
            alt="Our Pregnancy Logo"
            className="w-6.5 h-6.5 xs:w-7 xs:h-7 object-contain rounded-full bg-white shadow-2xs border border-border/70 shrink-0"
          />
          <span className="font-serif font-bold text-charcoal text-[14px] xs:text-[15px] sm:text-[16px] tracking-tight leading-none whitespace-nowrap notranslate">
            Our Pregnancy
          </span>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenPricing();
            }}
            className="bg-amber-50 hover:bg-amber-100/80 text-amber-800 text-[8.5px] xs:text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 flex items-center gap-0.5 border border-amber-300/80 transition-colors cursor-pointer shadow-3xs active:scale-95 notranslate"
            aria-label="Upgrade to Pro"
          >
            <Sparkles size={8.5} className="text-amber-600 shrink-0" />
            <span className="hidden sm:inline">PRO</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 xs:gap-1.5 shrink-0">

          {/* 108 SOS Emergency Button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('warning');
              onOpenSos();
            }}
            className="h-7 px-1.5 sm:px-2 flex items-center gap-0.5 bg-rose-50 border border-rose-200/90 rounded-full text-[10px] sm:text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition-all shadow-2xs shrink-0 active:scale-95 notranslate"
            aria-label="Emergency SOS"
          >
            <ShieldAlert size={11} className="text-rose-600 shrink-0" />
            <span className="leading-none text-[9.5px] sm:text-[11px]">108</span>
          </button>

          {/* Profile Avatar Trigger */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenProfile();
            }}
            className="w-7 h-7 rounded-full bg-sage text-white font-bold text-[11.5px] flex items-center justify-center shadow-2xs hover:opacity-90 active:scale-95 transition-transform shrink-0 ring-1 ring-border/50 notranslate"
            aria-label="Open Profile Settings"
          >
            {userInitial}
          </button>
        </div>
      </div>

      {/* Gestational Timeline Pill Row */}
      <div className="mt-2 flex items-center justify-between bg-white border border-border/70 rounded-full px-2.5 xs:px-3 py-1 text-[10px] xs:text-[11px] sm:text-[11.5px] text-medium shadow-2xs font-medium gap-1 overflow-hidden">
        <span className="font-semibold text-charcoal shrink-0 whitespace-nowrap">Wk {currentWeek} of 40</span>
        <span className="text-border text-[9px] shrink-0">•</span>
        <span className="shrink-0 whitespace-nowrap">Day {completedDays}</span>
        <span className="text-border text-[9px] shrink-0">•</span>
        <span className="truncate">Due: <strong className="text-charcoal font-semibold whitespace-nowrap">{dueFormatted}</strong></span>
      </div>
    </header>
  );
};
