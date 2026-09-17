import React, { useState, useEffect } from 'react';
import { usePlanner } from '../store';
import { navigate } from '../utils/navigation';
import { LanguageSelector } from './LanguageSelector';
import { auth } from '../firebase';
import { Loader2 } from 'lucide-react';

interface PublicHeaderProps {
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
  isLoggingIn?: boolean;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({ 
  onLoginClick, 
  onSignUpClick,
  isLoggingIn = false
}) => {
  const { state, toggleDarkMode } = usePlanner();
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const isVerified = Boolean(
    user && (
      user.emailVerified ||
      user.email === 'sukrat.kaushik@gmail.com' ||
      user.providerData.some((p) => p.providerId === 'google.com')
    )
  );
  const isSetupComplete = state.isSetup && isVerified;

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLoginClick) {
      onLoginClick();
    } else {
      navigate('/?login=true');
    }
  };

  const handleSignUp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSignUpClick) {
      onSignUpClick();
    } else {
      navigate('/?login=true#signup');
    }
  };

  const handleDashboard = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md transition-all duration-300 border-b border-border/80 ${isScrolled ? 'shadow-[0_12px_32px_rgba(0,0,0,0.08)]' : 'shadow-[0_4px_20px_rgba(0,0,0,0.04)]'}`}>
      {/* w-full to push logo to the far left edge instead of max-w constraints */}
      <div className={`transition-all duration-300 w-full px-4 sm:px-6 md:px-8 ${isScrolled ? 'py-1.5 sm:py-2' : 'py-2 sm:py-3.5'}`}>
        <nav className="w-full flex items-center justify-between">
          
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="flex items-center gap-1.5 sm:gap-3 shrink-0 mr-2 sm:mr-4">
            <img src="/logo.png" alt="Our Pregnancy Logo" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain" />
            <span className="font-serif text-[18px] sm:text-[22px] md:text-[28px] font-semibold text-sage tracking-wide notranslate hidden min-[400px]:inline-block">Our Pregnancy</span>
          </a>

          {/* Navigation Links - Centered, Desktop Only */}
          <div className="hidden md:flex items-center gap-8">
            <a href="/#features" onClick={(e) => { if(window.location.pathname !== '/') { e.preventDefault(); navigate('/#features'); } }} className="text-[14px] font-semibold text-charcoal/80 hover:text-sage transition-all relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-sage after:transition-all hover:after:w-full">Features</a>
            <a href="/#how-it-works" onClick={(e) => { if(window.location.pathname !== '/') { e.preventDefault(); navigate('/#how-it-works'); } }} className="text-[14px] font-semibold text-charcoal/80 hover:text-sage transition-all relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-sage after:transition-all hover:after:w-full">How it Works</a>
            <a href="/#localized-care" onClick={(e) => { if(window.location.pathname !== '/') { e.preventDefault(); navigate('/#localized-care'); } }} className="text-[14px] font-semibold text-charcoal/80 hover:text-sage transition-all relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-sage after:transition-all hover:after:w-full">About</a>
            <a href="/#pricing" onClick={(e) => { if(window.location.pathname !== '/') { e.preventDefault(); navigate('/#pricing'); } }} className="text-[14px] font-semibold text-charcoal/80 hover:text-sage transition-all relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-sage after:transition-all hover:after:w-full">Pricing</a>
            
            {/* Company Dropdown */}
            <div className="relative group">
              <button className="text-[14px] font-semibold text-charcoal/80 hover:text-sage transition-all relative py-1 flex items-center gap-1 cursor-pointer">
                Company <span className="text-[9px] opacity-70 transition-transform group-hover:rotate-180">▼</span>
              </button>
              <div className="absolute top-[100%] left-1/2 -translate-x-1/2 mt-1 w-44 bg-white border border-border/80 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col py-2 z-50">
                <a href="/team" onClick={(e) => { e.preventDefault(); navigate('/team'); }} className="px-4 py-2.5 text-[13px] font-semibold text-charcoal/80 hover:text-sage hover:bg-sage-pale/40 transition-colors text-left">Our Team</a>
                <a href="/blogs" onClick={(e) => { e.preventDefault(); navigate('/blogs'); }} className="px-4 py-2.5 text-[13px] font-semibold text-charcoal/80 hover:text-sage hover:bg-sage-pale/40 transition-colors text-left">Blogs</a>
                <a href="/careers" onClick={(e) => { e.preventDefault(); navigate('/careers'); }} className="px-4 py-2.5 text-[13px] font-semibold text-charcoal/80 hover:text-sage hover:bg-sage-pale/40 transition-colors text-left">Careers</a>
              </div>
            </div>
          </div>

          <div className="flex flex-nowrap justify-end items-center gap-1 sm:gap-2 md:gap-4">
            <LanguageSelector />
            <button
              onClick={toggleDarkMode}
              className="p-1.5 sm:p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-charcoal flex items-center justify-center"
              title="Toggle Dark Mode"
              aria-label="Toggle Dark Mode"
            >
              <span className="text-[16px] sm:text-[18px] leading-none">{state.isDarkModeActive ? '🌙' : '☀️'}</span>
            </button>
            
            {!isSetupComplete ? (
              <>
                <button type="button" onClick={handleLogin} className="bg-transparent text-charcoal rounded-[10px] text-[12px] sm:text-[13px] md:text-[14px] font-semibold px-2 py-1.5 sm:px-4 sm:py-2 hover:bg-cream transition-colors whitespace-nowrap shrink-0">
                  Log In
                </button>
                <button type="button" onClick={handleSignUp} className="bg-charcoal text-cream rounded-[10px] text-[12px] sm:text-[13px] md:text-[14px] font-semibold px-2.5 py-1.5 sm:px-4 sm:py-2 hover:opacity-90 transition-all shadow-sm whitespace-nowrap shrink-0">
                  Sign Up
                </button>
              </>
            ) : (
              <button type="button" onClick={handleDashboard} disabled={isLoggingIn} className="bg-charcoal text-cream rounded-[10px] text-[12px] sm:text-[13px] md:text-[14px] font-semibold px-2.5 py-1.5 sm:px-4 sm:py-2 hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 whitespace-nowrap shrink-0">
                {isLoggingIn ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin shrink-0" /> : null}
                <span className="sm:hidden">Dashboard</span>
                <span className="hidden sm:inline">Open Dashboard</span>
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
