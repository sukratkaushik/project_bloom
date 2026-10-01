import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getActiveLanguage, changeLanguage } from '../utils/translation';

export const LanguageSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLang, setActiveLang] = useState('en');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveLang(getActiveLanguage());

    const handleLangChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.langCode) {
        setActiveLang(detail.langCode);
      }
    };
    window.addEventListener('app_language_changed', handleLangChange);
    return () => window.removeEventListener('app_language_changed', handleLangChange);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleLanguageChange = (langCode: string) => {
    setActiveLang(langCode);
    setIsOpen(false);
    changeLanguage(langCode);
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === activeLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative inline-block text-left font-sans notranslate" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 border-[1.5px] border-border rounded-[12px] bg-white text-charcoal hover:border-sage-light hover:bg-cream transition-all focus:outline-none text-[12px] sm:text-[13px] md:text-[14px] font-semibold shadow-sm notranslate"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe size={14} className="text-sage sm:w-[15px] sm:h-[15px]" />
        <span className="truncate max-w-[80px] md:max-w-none notranslate hidden sm:inline">{currentLangObj.native}</span>
        <ChevronDown size={12} className={`text-medium transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} hidden sm:block`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[180px] max-h-[300px] overflow-y-auto bg-white border-[1.5px] border-border rounded-[14px] shadow-[0_12px_32px_rgba(44,62,80,0.15)] z-[100] overscroll-contain animate-in fade-in slide-in-from-top-2 notranslate">
          <div className="py-1 notranslate">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full text-left px-4 py-2.5 text-[13px] md:text-[14px] transition-colors flex items-center justify-between focus:outline-none notranslate
                  ${lang.code === activeLang
                    ? 'bg-sage-pale/60 text-sage font-semibold'
                    : 'text-charcoal hover:bg-cream focus:bg-cream'
                  }
                `}
              >
                <span className="notranslate">{lang.label}</span>
                <span className="text-[11px] opacity-60 font-normal notranslate">{lang.native}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
