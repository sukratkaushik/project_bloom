import React from 'react';
import { usePlanner } from '../store';
import { auth } from '../firebase';
import { navigate } from '../utils/navigation';

interface FooterProps {
  onToast?: (msg: string) => void;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ onToast, className = '' }) => {
  const { state } = usePlanner();

  const handleEmailClick = (email: string, e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = `mailto:${email}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(() => {
        if (onToast) onToast("Email copied to clipboard!");
      }).catch(() => {});
    } else {
      try {
        const tempInput = document.createElement("input");
        tempInput.value = email;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        if (onToast) onToast("Email copied to clipboard!");
      } catch {}
    }
  };

  const isAdmin = state.isAdmin || auth.currentUser?.email === 'sukrat.kaushik@gmail.com';

  return (
    <footer className={`bg-white border-t md:border border-border z-40 shadow-sm no-print md:rounded-[14px] md:mb-[14px] w-full shrink-0 ${className}`}>
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between min-h-[70px] px-4 md:px-10 lg:px-12 py-4 lg:py-0 gap-4">
        {/* Left: Logo + Title + Tagline */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 shrink-0">
          <div className="flex items-center gap-3 md:pr-6 md:border-r border-border md:mr-2">
            <img src="/logo.png" alt="Our Pregnancy Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain shrink-0" />
            <span className="font-serif text-[22px] md:text-[26px] font-semibold text-sage tracking-wide whitespace-nowrap notranslate">
              Our Pregnancy
            </span>
          </div>

          <span className="text-[13px] md:text-[14px] text-medium text-center">
            Made with <span className="text-red-500 inline-block animate-pulse">❤️</span> for expectant mothers
          </span>
        </div>

        {/* Right: Moved Items (Settings, Feedback, Admin, Adjust Setup) + Legal & Support Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 text-[13px] md:text-[13.5px] font-medium text-charcoal">
          <a
            href="/setup"
            onClick={(e) => {
              e.preventDefault();
              navigate('/setup');
            }}
            className="hover:text-sage transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>⚙️</span> Adjust Setup
          </a>

          <a
            href="/dashboard/profile"
            onClick={(e) => {
              e.preventDefault();
              navigate('/dashboard/profile');
            }}
            className="hover:text-sage transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>👤</span> Settings & Profile
          </a>

          <a
            href="/dashboard/feedback"
            onClick={(e) => {
              e.preventDefault();
              navigate('/dashboard/feedback');
            }}
            className="hover:text-sage transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>💬</span> Feedback & Support
          </a>

          {isAdmin && (
            <a
              href="/dashboard/admin-panel"
              onClick={(e) => {
                e.preventDefault();
                navigate('/dashboard/admin-panel');
              }}
              className="text-amber-700 dark:text-amber-400 hover:text-amber-600 font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>👑</span> Admin Suite
            </a>
          )}

          <span className="text-border hidden lg:inline font-light text-[18px]">|</span>

          <a
            href="/privacy"
            onClick={(e) => {
              e.preventDefault();
              navigate('/privacy');
            }}
            className="hover:text-sage transition-colors cursor-pointer"
          >
            Privacy Policy
          </a>

          <a
            href="/terms"
            onClick={(e) => {
              e.preventDefault();
              navigate('/terms');
            }}
            className="hover:text-sage transition-colors cursor-pointer"
          >
            Terms of Service
          </a>

          <a
            href="mailto:hello@ourpregnancy.in"
            onClick={(e) => handleEmailClick("hello@ourpregnancy.in", e)}
            className="hover:text-sage transition-colors cursor-pointer text-light"
            title="Email Support (hello@ourpregnancy.in)"
          >
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};
