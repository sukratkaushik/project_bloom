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
    <footer className={`bg-white border-t md:border border-border z-40 shadow-sm no-print md:rounded-[14px] md:mb-[14px] w-full shrink-0 ${className}`}>
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between min-h-[70px] px-4 md:px-10 lg:px-12 py-3.5 md:py-0 gap-3 md:gap-4">
        {/* Left: Logo + Title + Tagline */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 shrink-0">
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

        {/* Right: Legal & Support Links */}
        <div className="flex items-center gap-4 md:gap-6 text-[13px] md:text-[14px] font-medium text-charcoal">
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

          <div className="pl-4 border-l border-border flex items-center">
            <a
              href="mailto:hello@ourpregnancy.in"
              onClick={(e) => handleEmailClick("hello@ourpregnancy.in", e)}
              className="px-3.5 py-1.5 border-[1.5px] border-border hover:border-sage rounded-[20px] font-sans text-[12px] font-medium text-medium hover:text-sage transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer hover:bg-sage-pale/40"
              title="Contact Support (hello@ourpregnancy.in)"
            >
              <span>💬</span> Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
