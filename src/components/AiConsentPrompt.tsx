import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { navigate } from '../utils/navigation';

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
  message?: string;
}

export const AiConsentPrompt: React.FC<AiConsentPromptProps> = ({
  compact = false,
  className = '',
  message = 'Turn on AI features in your Profile to use this',
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-3 p-4 bg-amber-50/80 border border-amber-200/90 rounded-[14px] text-amber-900 shadow-sm ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-600">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="text-[13px] sm:text-[14px] font-medium leading-snug">
          {message}
        </div>
      </div>
      <button
        type="button"
        onClick={() => navigate('/dashboard/profile')}
        className={`inline-flex items-center gap-1.5 font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-[10px] transition-all shrink-0 cursor-pointer shadow-sm hover:shadow active:scale-[0.98] ${
          compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-xs sm:text-sm'
        }`}
      >
        <span>Open Profile</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
