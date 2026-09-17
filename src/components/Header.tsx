import React from 'react';
import { usePlanner } from '../store';
import { fmtShort } from '../utils';
import { LanguageSelector } from './LanguageSelector';
import { navigate } from '../utils/navigation';

interface HeaderProps {
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
  progressPct?: number;
  hideMenuIcon?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  isMobileMenuOpen = false, 
  setIsMobileMenuOpen, 
  progressPct,
  hideMenuIcon = false 
}) => {
  const { state, updateState, toggleDarkMode } = usePlanner();

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm no-print w-full">
      <div className="w-full mx-auto flex items-center justify-between min-h-[70px] px-4 md:px-10 lg:px-12">

        <div className="flex items-center shrink-0">
          {!hideMenuIcon && setIsMobileMenuOpen && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden mr-3 p-1.5 text-sage hover:bg-sage-pale rounded-md transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          )}
          <button
            onClick={() => updateState({ isSetup: false })}
            className="flex items-center gap-3 md:pr-6 md:border-r border-border md:mr-5 cursor-pointer bg-transparent border-none hover:opacity-80 transition-opacity text-sage logo-interact"
          >
            <img src="/logo.png" alt="Our Pregnancy Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain shrink-0" />
            <span className="font-serif text-[22px] md:text-[26px] font-semibold tracking-wide whitespace-nowrap notranslate">Our Pregnancy</span>
          </button>
        </div>

        <div className="hidden md:flex items-center justify-center gap-6 flex-1 px-4 min-w-max">
          <div className="text-center">
            <div className="text-[9px] font-semibold tracking-[1.2px] uppercase text-light">LMP (est.)</div>
            <div className="font-serif text-[16px] font-medium text-charcoal">{fmtShort(state.lmp)}</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] font-semibold tracking-[1.2px] uppercase text-light">T1 ends</div>
            <div className="font-serif text-[16px] font-medium text-charcoal">{fmtShort(state.t1End)}</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] font-semibold tracking-[1.2px] uppercase text-light">T2 ends</div>
            <div className="font-serif text-[16px] font-medium text-charcoal">{fmtShort(state.t2End)}</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] font-semibold tracking-[1.2px] uppercase text-light">Due date</div>
            <div className="font-serif text-[16px] font-medium text-charcoal">{fmtShort(state.dueDate)}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Company Dropdown */}
          <div className="relative group hidden md:block">
            <button className="text-[14px] font-semibold text-charcoal hover:text-sage transition-colors flex items-center gap-1 cursor-pointer py-2">
              Company <span className="text-[9px] opacity-70 transition-transform group-hover:rotate-180">▼</span>
            </button>
            <div className="absolute top-[100%] right-0 mt-1 w-44 bg-white border border-border/80 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col py-2 z-50">
              <a href="/team" onClick={(e) => { e.preventDefault(); navigate('/team'); }} className="px-4 py-2.5 text-[13px] font-semibold text-charcoal/80 hover:text-sage hover:bg-sage-pale/40 transition-colors text-left">Our Team</a>
              <a href="/blogs" onClick={(e) => { e.preventDefault(); navigate('/blogs'); }} className="px-4 py-2.5 text-[13px] font-semibold text-charcoal/80 hover:text-sage hover:bg-sage-pale/40 transition-colors text-left">Blogs</a>
              <a href="/careers" onClick={(e) => { e.preventDefault(); navigate('/careers'); }} className="px-4 py-2.5 text-[13px] font-semibold text-charcoal/80 hover:text-sage hover:bg-sage-pale/40 transition-colors text-left">Careers</a>
            </div>
          </div>
          <LanguageSelector />
          
          {/* Mobile Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`md:hidden p-2 rounded-full border-[1.5px] transition-all text-[15px] cursor-pointer flex items-center justify-center w-9 h-9
              ${state.isDarkModeActive ? 'border-sage text-sage-dark dark:text-sage bg-sage-pale dark:bg-sage/10' : 'border-border text-charcoal/70 dark:text-slate-300 bg-transparent hover:border-charcoal'}`}
            title="Toggle Dark Mode"
          >
            {state.isDarkModeActive ? '🌙' : '☀️'}
          </button>

          <div className="hidden md:flex items-center gap-4 pl-4 border-l border-border">
            {progressPct !== undefined && (
              <div className="flex items-center gap-2.5">
                <div className="w-[100px] h-[5px] bg-border rounded-[3px] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sage to-sage-light rounded-[3px] transition-all duration-400"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="text-[12px] font-semibold text-sage whitespace-nowrap">{progressPct}% done</div>
              </div>
            )}
            <button
              onClick={toggleDarkMode}
              className={`px-3 py-1.5 border-[1.5px] rounded-[20px] font-sans text-[12px] font-medium transition-all whitespace-nowrap
                ${state.isDarkModeActive ? 'border-sage text-sage-dark dark:text-sage bg-sage-pale dark:bg-sage/10 font-semibold' : 'border-border text-medium bg-transparent hover:border-charcoal'}`}
              title="Toggle Dark Mode"
            >
              {state.isDarkModeActive ? '🌙 Dark Mode' : '☀️ Dark Mode'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
