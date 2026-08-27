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
    <footer className={`bg-white border md:border-border/90 z-40 shadow-xs no-print md:rounded-[16px] md:mb-5 w-full shrink-0 ${className}`}>
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 lg:px-12 py-5 md:py-6">
        {/* Top Tier: Brand & Main Navigation */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-border/60">
          {/* Brand & Tagline */}
          <div className="flex items-center gap-3.5">
            <img src="/logo.png" alt="Our Pregnancy Logo" className="w-8 h-8 md:w-9 md:h-9 object-contain shrink-0" />
            <div>
              <span className="font-serif text-[20px] md:text-[22px] font-semibold text-sage tracking-wide notranslate leading-none block">
                Our Pregnancy
              </span>
              <p className="text-[12px] text-medium mt-1">
                Made with <span className="text-red-500">❤️</span> for expectant mothers
              </p>
            </div>
          </div>

          {/* Quick Feature Links (Clean text, no icons) */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-2 text-[13.5px] font-medium text-charcoal/80">
            <a
              href="/setup"
              onClick={(e) => {
                e.preventDefault();
                navigate('/setup');
              }}
              className="hover:text-sage-dark transition-colors cursor-pointer"
            >
              Adjust Setup
            </a>

            <a
              href="/dashboard/profile"
              onClick={(e) => {
                e.preventDefault();
                navigate('/dashboard/profile');
              }}
              className="hover:text-sage-dark transition-colors cursor-pointer"
            >
              Settings & Profile
            </a>

            <a
              href="/dashboard/feedback"
              onClick={(e) => {
                e.preventDefault();
                navigate('/dashboard/feedback');
              }}
              className="hover:text-sage-dark transition-colors cursor-pointer"
            >
              Feedback & Support
            </a>

            {isAdmin && (
              <a
                href="/dashboard/admin-panel"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/dashboard/admin-panel');
                }}
                className="text-amber-800 dark:text-amber-400 hover:text-amber-700 font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                Admin Suite
              </a>
            )}
          </div>
        </div>

        {/* Bottom Tier: Copyright, Legal & Support */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3.5 text-[12px] text-light">
          <p>© {new Date().getFullYear()} Our Pregnancy. Designed for safe & mindful motherhood.</p>

          <div className="flex items-center gap-4 sm:gap-5">
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                navigate('/privacy');
              }}
              className="hover:text-sage-dark transition-colors cursor-pointer"
            >
              Privacy Policy
            </a>
            <span className="text-border">•</span>
            <a
              href="/terms"
              onClick={(e) => {
                e.preventDefault();
                navigate('/terms');
              }}
              className="hover:text-sage-dark transition-colors cursor-pointer"
            >
              Terms of Service
            </a>
            <span className="text-border">•</span>
            <a
              href="mailto:hello@ourpregnancy.in"
              onClick={(e) => handleEmailClick("hello@ourpregnancy.in", e)}
              className="hover:text-sage-dark transition-colors cursor-pointer"
              title="Email Support"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
