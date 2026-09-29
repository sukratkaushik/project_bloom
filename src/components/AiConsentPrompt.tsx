import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Loader2 } from 'lucide-react';
import { navigate } from '../utils/navigation';
import { usePlanner } from '../store';
import { auth, db, doc, setDoc, serverTimestamp } from '../firebase';
import { triggerHaptic } from '../utils/nativeBridge';

/**
 * Grandfathering check:
 * - consent === undefined (existing user before this feature): returns false (NOT blocked)
 * - consent === true: returns false (NOT blocked)
 * - consent === false (explicit decline or revoked in Profile): returns true (BLOCKED)
 */
export const isAiConsentBlocked = (consent?: boolean): boolean => consent === false;

interface AiConsentPromptProps {
  compact?: boolean;
  className?: string;
  title?: string;
  message?: string;
  onEnabled?: () => void;
}

export const AiConsentPrompt: React.FC<AiConsentPromptProps> = ({
  compact = false,
  className = '',
  title = 'AI Guidance is Currently Paused',
  message = 'Turn on AI features for meal analysis, scan reviews, and 24/7 maternal companion guidance.',
  onEnabled,
}) => {
  const { updateState } = usePlanner();
  const [isEnabling, setIsEnabling] = useState(false);

  const handleEnableAi = async () => {
    try {
      setIsEnabling(true);
      triggerHaptic('medium');
      updateState({ aiProcessingConsent: true });

      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(
          userRef,
          {
            aiProcessingConsent: true,
            aiProcessingConsentedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
      onEnabled?.();
    } catch (err) {
      console.error('Failed to enable AI consent:', err);
    } finally {
      setIsEnabling(false);
    }
  };

  if (compact) {
    return (
      <div
        className={`flex items-center justify-between gap-3 p-3 bg-[#F4F7F5] dark:bg-stone-800/90 border border-sage/25 dark:border-stone-700/80 rounded-xl text-charcoal dark:text-cream shadow-3xs ${className}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-sage/15 dark:bg-sage-dark/30 flex items-center justify-center shrink-0 text-sage-dark dark:text-sage-light">
            <Sparkles size={13} />
          </div>
          <span className="text-[12px] font-medium truncate text-charcoal/90 dark:text-stone-200">
            {message}
          </span>
        </div>
        <button
          type="button"
          onClick={handleEnableAi}
          disabled={isEnabling}
          className="px-3 py-1.5 bg-sage-dark hover:bg-sage text-white rounded-lg text-[11.5px] font-bold transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95 disabled:opacity-60 flex items-center gap-1"
        >
          {isEnabling ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          <span>Turn On</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`p-4 xs:p-4.5 bg-[#F4F7F5] dark:bg-stone-800/90 border border-sage/25 dark:border-stone-700/80 rounded-2xl text-charcoal dark:text-cream shadow-3xs ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-sage/15 dark:bg-sage-dark/30 flex items-center justify-center shrink-0 text-sage-dark dark:text-sage-light mt-0.5">
            <Sparkles size={18} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[13.5px] sm:text-[14px] font-bold text-charcoal dark:text-cream leading-tight">
              {title}
            </h4>
            <p className="text-[12px] sm:text-[12.5px] text-charcoal/70 dark:text-stone-300 leading-snug mt-0.5">
              {message}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-sage-dark dark:text-sage-light font-medium">
              <ShieldCheck size={13} className="shrink-0 text-sage" />
              <span>FOGSI & HIPAA Aligned • Zero Data Retention • Confidential</span>
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-sage/15 shrink-0">
          <button
            type="button"
            onClick={handleEnableAi}
            disabled={isEnabling}
            className="px-4 py-2 bg-sage-dark hover:bg-sage text-white font-bold text-[12.5px] rounded-xl shadow-2xs hover:shadow-xs active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-60"
          >
            {isEnabling ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            <span>Turn On AI</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/profile')}
            className="text-[11px] text-medium hover:text-charcoal dark:hover:text-cream transition-colors underline underline-offset-2 cursor-pointer"
          >
            Manage in Profile
          </button>
        </div>
      </div>
    </div>
  );
};
