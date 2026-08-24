import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'ur', label: 'Urdu', native: 'اردو' },
  { code: 'de', label: 'German', native: 'Deutsch' }
];

export const LanguageSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLang, setActiveLang] = useState('en');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Read the current language from the googtrans cookie or html lang attribute
    const getActiveLanguage = (): string => {
      // 1. Check HTML lang attribute (set by Google Translate during page translation)
      const htmlLang = document.documentElement.lang;
      if (htmlLang && htmlLang !== 'en' && htmlLang.length <= 5) {
        const cleanLang = htmlLang.split('-')[0].toLowerCase();
        if (LANGUAGES.some(l => l.code === cleanLang)) {
          return cleanLang;
        }
      }

      // 2. Check googtrans cookie (URI decoding is necessary to parse values like %2Fen%2Fpa)
      const match = document.cookie.match(/googtrans=([^;]+)/);
      if (match) {
        try {
          const decoded = decodeURIComponent(match[1]);
          const parts = decoded.split('/');
          const code = parts[parts.length - 1];
          if (code) {
            const cleanCode = code.toLowerCase();
            if (LANGUAGES.some(l => l.code === cleanCode)) {
              return cleanCode;
            }
          }
        } catch (e) {
          console.error("Error parsing googtrans cookie:", e);
        }
      }
      return 'en';
    };

    setActiveLang(getActiveLanguage());
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
    const cookieValue = langCode === 'en' ? '/en/en' : `/en/${langCode}`;

    // Set cookie for path=/ across hostname variations
    document.cookie = `googtrans=${cookieValue}; path=/;`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname};`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=.${window.location.hostname.replace(/^www\./, '')};`;

    setActiveLang(langCode);
    setIsOpen(false);
    window.location.reload();
  };

  const currentLangObj = LANGUAGES.find(l => l.code === activeLang) || LANGUAGES[0];

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
            {LANGUAGES.map((lang) => (
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
