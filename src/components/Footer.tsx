import React from 'react';
import { navigate } from '../utils/navigation';

interface FooterProps {
  onToast?: (msg: string) => void;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ onToast, className = '' }) => {
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

  return (
    <footer className={`bg-white border border-border rounded-[14px] shadow-sm no-print transition-all duration-200 mt-12 mb-6 ${className}`}>
      <div className="flex flex-col md:flex-row items-center justify-between min-h-[64px] md:min-h-[70px] px-4 md:px-8 lg:px-10 py-3 md:py-0 gap-4">
        {/* Brand & Made with Love */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Our Pregnancy Logo" className="w-7 h-7 md:w-8 md:h-8 object-contain shrink-0" />
            <span className="font-serif text-[18px] md:text-[20px] font-semibold text-sage tracking-wide whitespace-nowrap notranslate">
              Our Pregnancy
            </span>
          </div>

          <span className="text-border hidden sm:inline font-light text-[18px] mx-1">|</span>

          <span className="text-[13px] md:text-[13.5px] text-medium text-center">
            Made with <span className="text-red-500 inline-block animate-pulse">❤️</span> for expectant mothers
          </span>
        </div>

        {/* Legal & Support Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[13px] md:text-[13.5px] font-medium text-charcoal/80">
          <a
            href="/privacy"
            onClick={(e) => {
              e.preventDefault();
              navigate('/privacy');
            }}
            className="hover:text-sage transition-colors cursor-pointer py-1"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            onClick={(e) => {
              e.preventDefault();
              navigate('/terms');
            }}
            className="hover:text-sage transition-colors cursor-pointer py-1"
          >
            Terms of Service
          </a>
          <a
            href="mailto:hello@ourpregnancy.in"
            onClick={(e) => handleEmailClick("hello@ourpregnancy.in", e)}
            className="px-3 py-1 bg-sage-pale/60 hover:bg-sage-pale border border-sage/30 rounded-full text-sage-dark transition-all cursor-pointer flex items-center gap-1.5"
            title="Contact Support (hello@ourpregnancy.in)"
          >
            <span>💬</span> Support
          </a>
        </div>
      </div>
    </footer>
  );
};
