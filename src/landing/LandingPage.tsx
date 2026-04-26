import React, { useState } from 'react';
import { usePlanner } from '../store';
import { auth, signInWithGoogle } from '../firebase';
import { 
  ShieldCheck, 
  WifiOff, 
  MapPin, 
  Stethoscope, 
  IndianRupee,
  Activity,
  Timer,
  Heart,
  Bot,
  Camera,
  Landmark,
  ArrowRight,
  CheckCircle2,
  Lock,
  Loader2,
  Cloud,
  Calendar,
  Sparkles,
  Mail,
  X
} from 'lucide-react';
import { FloatingChatbot } from '../components/FloatingChatbot';

export const LandingPage: React.FC = () => {
  const { state, updateState, toggleDarkMode } = usePlanner();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const isSetupComplete = state.isSetup;

  const handleStart = async () => {
    try {
      if (isSetupComplete) {
        window.location.hash = '#dashboard';
        return;
      }

      setIsLoggingIn(true);
      const user = await signInWithGoogle();
      if (user) {
        setShowEmailModal(false);
        if (!state.isSetup) {
          updateState({ hasStartedOnboarding: true, isSetup: false });
          window.location.hash = '#setup';
        } else {
          window.location.hash = '#dashboard';
        }
      }
    } catch (error: any) {
      if (error?.code !== 'auth/popup-closed-by-user') {
        console.error("Login failed", error);
        
        if (error?.code === 'auth/network-request-failed') {
          alert("Network request failed. This often happens if third-party cookies are blocked, or an ad blocker is preventing the login popup. Please disable your ad blocker or allow third-party cookies for this site, then try again.");
        } else {
          alert(`Failed to log in with Google: ${error?.message || "Please try again."}`);
        }
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [ageInput, setAgeInput] = useState('');
  const [genderInput, setGenderInput] = useState('');
  const [partnerCodeInput, setPartnerCodeInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');

  const handleEmailLoginClick = () => {
    if (isSetupComplete) {
      window.location.hash = '#dashboard';
      return;
    }
    setShowEmailModal(true);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.includes('@')) {
      setOtpError('Please enter a valid email address.');
      return;
    }
    
    setOtpError('');
    setOtpSent(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate OTP verification (accepting 123456 as standard mockup)
    if (otpInput === '123456') {
      setShowEmailModal(false);
      updateState({ hasStartedOnboarding: true, isSetup: false });
      window.location.hash = '#setup';
    } else {
      setOtpError('Invalid code. For this demo, please use 123456.');
    }
  };

  return (
    <div className="min-h-screen bg-cream font-sans overflow-x-hidden selection:bg-sage-pale selection:text-sage-dark text-charcoal relative">
      {/* Email OTP Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-[400px] shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setShowEmailModal(false); setOtpSent(false); setOtpError(''); setOtpInput(''); setNameInput(''); setAgeInput(''); setGenderInput(''); setPartnerCodeInput(''); setIsRegistering(false); }}
              className="absolute top-4 right-4 p-2 text-medium hover:text-charcoal transition-colors rounded-full hover:bg-cream"
            >
              <X size={20} />
            </button>
            
            <div className="w-10 h-10 bg-sage-pale text-sage rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Mail size={20} />
            </div>
            
            <h2 className="font-serif text-[22px] font-bold text-charcoal mb-1">
              {otpSent ? 'Check your email' : (isRegistering ? 'Create your account' : 'Welcome back')}
            </h2>
            <p className="text-[13px] text-medium mb-5 leading-relaxed">
              {otpSent ? `We've sent a 6-digit security code to ${emailInput}.` : (isRegistering ? 'Enter your details to receive a secure one-time password (OTP).' : 'Enter your email address to log in securely with an OTP.')}
            </p>
            
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
                {isRegistering && (
                  <>
                    <div>
                      <label className="text-[11px] font-bold tracking-[1px] uppercase text-charcoal mb-1.5 block">Full Name</label>
                      <input 
                        type="text" 
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full border-[1.5px] border-border rounded-[10px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-shadow"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-[11px] font-bold tracking-[1px] uppercase text-charcoal mb-1.5 block">Age</label>
                        <input 
                          type="number" 
                          value={ageInput}
                          onChange={(e) => setAgeInput(e.target.value)}
                          placeholder="28"
                          className="w-full border-[1.5px] border-border rounded-[10px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-shadow"
                          required={isRegistering}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[11px] font-bold tracking-[1px] uppercase text-charcoal mb-1.5 block">Gender</label>
                        <select 
                          value={genderInput}
                          onChange={(e) => setGenderInput(e.target.value)}
                          className="w-full border-[1.5px] border-border rounded-[10px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-shadow bg-white"
                          required={isRegistering}
                        >
                          <option value="" disabled>Select</option>
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold tracking-[1px] uppercase text-charcoal mb-1.5 flex justify-between items-end block">
                        <span>Partner Code</span>
                        <span className="text-[10px] text-medium normal-case font-normal">(Optional, find in Partner Sync)</span>
                      </label>
                      <input 
                        type="text" 
                        value={partnerCodeInput}
                        onChange={(e) => setPartnerCodeInput(e.target.value)}
                        placeholder="e.g. A1B2C3"
                        className="w-full border-[1.5px] border-border rounded-[10px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-shadow uppercase"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="text-[11px] font-bold tracking-[1px] uppercase text-charcoal mb-1.5 block">Email Address</label>
                  <input 
                    type="email" 
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border-[1.5px] border-border rounded-[10px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-shadow"
                    required
                  />
                </div>
                {otpError && <div className="text-[13px] text-critical font-medium">{otpError}</div>}
                <button type="submit" className="w-full bg-charcoal text-white rounded-[10px] font-bold py-2.5 hover:bg-gray-800 transition-colors mt-1 shadow-sm text-[14px]">
                  Send OTP Code
                </button>
                <div className="text-center mt-1.5 mb-1.5">
                  <button 
                    type="button" 
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-[12px] text-medium font-semibold hover:text-charcoal transition-colors"
                  >
                    {isRegistering ? "Already have an account? Log in" : "Don't have an account? Sign up"}
                  </button>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="shrink-0 px-3 text-light text-[10px] font-bold uppercase tracking-[1px]">or</span>
                  <div className="flex-grow border-t border-border"></div>
                </div>
                
                <button 
                  type="button"
                  onClick={handleStart} 
                  disabled={isLoggingIn} 
                  className="w-full mt-1.5 bg-white border-[1.5px] border-border text-charcoal rounded-[10px] font-bold py-2.5 hover:bg-cream transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 text-[14px]"
                >
                  {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />}
                  Continue with Google
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <div>
                  <label className="text-[12px] font-bold tracking-[1px] uppercase text-charcoal mb-2 block">6-Digit Code</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className="w-full border-[1.5px] border-border rounded-[12px] px-4 py-3 text-[20px] tracking-[8px] text-center font-bold focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-shadow"
                    required
                  />
                </div>
                {otpError && <div className="text-[13px] text-critical font-medium text-center">{otpError}</div>}
                <button type="submit" className="w-full bg-sage text-white rounded-[12px] font-bold py-3.5 hover:bg-sage-dark transition-colors mt-2 shadow-sm">
                  Verify & Continue
                </button>
                <button 
                  type="button" 
                  onClick={() => { setOtpSent(false); setOtpError(''); setOtpInput(''); }}
                  className="text-[13px] text-medium font-semibold hover:text-charcoal mt-2 transition-colors"
                >
                  Wrong email? Change address
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Navigation */}
      <nav className="w-full max-w-[1200px] mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="font-serif text-[20px] md:text-[24px] font-medium text-sage italic tracking-wider flex items-center gap-2 md:gap-3 shrink-0 mr-4">
          <img src="/logo.png" alt="Bloom Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
          bloom
        </div>
        <div className="flex flex-wrap md:flex-nowrap justify-end items-center gap-2 md:gap-4">
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-charcoal flex items-center justify-center mr-1 sm:mr-2"
            title="Toggle Dark Mode"
            aria-label="Toggle Dark Mode"
          >
            <span className="text-[18px] leading-none">{state.isDarkModeActive ? '🌙' : '☀️'}</span>
          </button>
          {!isSetupComplete ? (
            <>
              <button onClick={() => { setIsRegistering(false); handleEmailLoginClick(); }} className="bg-transparent text-charcoal rounded-[10px] text-[13px] md:text-[14px] font-semibold px-3 md:px-5 py-2 hover:bg-cream transition-colors whitespace-nowrap shrink-0">
                Log In
              </button>
              <button onClick={() => { setIsRegistering(true); handleEmailLoginClick(); }} className="bg-charcoal text-white rounded-[10px] text-[13px] md:text-[14px] font-semibold px-4 md:px-5 py-2 hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap shrink-0">
                Sign Up
              </button>
            </>
          ) : (
            <button onClick={handleStart} disabled={isLoggingIn} className="bg-charcoal text-white rounded-[10px] text-[13px] md:text-[14px] font-semibold px-4 md:px-5 py-2 hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap shrink-0">
              {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : null}
              Open Dashboard
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 md:pt-32 md:pb-40 max-w-[1200px] mx-auto z-10 flex flex-col md:flex-row items-center justify-between gap-12 overflow-visible">
        
        {/* Animated Background Blobs */}
        <div className="absolute top-0 -left-12 md:-left-24 w-72 h-72 bg-sage-light/20 rounded-full mix-blend-multiply filter blur-2xl animate-blob -z-10"></div>
        <div className="absolute top-0 right-32 w-72 h-72 bg-blush-light/20 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-2000 -z-10"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-gold-pale/40 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-4000 -z-10"></div>

        {/* Left Side: Text Content */}
        <div className="flex-1 text-left flex flex-col items-start w-full max-w-[600px] z-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-sage-light text-[12px] font-semibold text-sage mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sage"></span>
            </span>
            New: Cloud Sync Available
          </div>
          
          <h1 className="font-serif text-[clamp(40px,6vw,72px)] leading-[1.1] text-charcoal mb-6 mt-2">
            Your pregnancy companion — <span className="italic text-sage">secure & synced.</span>
          </h1>
          
          <p className="text-[17px] md:text-[20px] text-medium mb-10 leading-relaxed">
            Track kicks, time contractions, monitor blood pressure, and get AI-powered answers.
            <strong className="text-charcoal font-semibold"> Securely backed up to the cloud.</strong>
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto flex-wrap">
            <button 
              onClick={handleStart}
              disabled={isLoggingIn}
              className="group relative inline-flex items-center justify-center gap-2 bg-sage text-white rounded-full font-semibold px-8 py-4 text-[17px] transition-all hover:bg-sage-dark hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-6px_rgba(122,158,135,0.4)] w-full sm:w-auto disabled:opacity-70"
            >
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {isSetupComplete ? "Go to Dashboard" : "Continue with Google"}
              {!isLoggingIn && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
            {!isSetupComplete && (
              <button
                onClick={() => { setIsRegistering(true); handleEmailLoginClick(); }}
                className="inline-flex items-center justify-center gap-2 bg-white border-[1.5px] border-sage text-sage rounded-full font-semibold px-8 py-4 text-[17px] hover:bg-sage-pale transition-colors w-full sm:w-auto"
              >
                Sign Up with Email
              </button>
            )}
            <a href="#how-it-works" className="font-medium text-medium px-4 py-4 hover:text-charcoal transition-colors whitespace-nowrap">
              See how it works ↓
            </a>
          </div>
        </div>

        {/* Right Side: Visual/Animation (The Bloom/Womb Concept) */}
        <div className="flex-1 relative w-full max-w-[500px] aspect-square flex items-center justify-center -z-10 mt-10 md:mt-0">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-sage-pale/80 rounded-full filter blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
          
          {/* Outer Protective Rings (The Womb/Growth) */}
          <div className="absolute w-[320px] h-[320px] md:w-[450px] md:h-[450px] border-[2px] border-sage/30 rounded-full animate-[spin_25s_linear_infinite]" style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }} />
          
          {/* Middle Ring (Mama's embrace) */}
          <div className="absolute w-[300px] h-[300px] md:w-[420px] md:h-[420px] border-[3px] border-blush/40 rounded-full animate-[spin_20s_linear_infinite_reverse]" style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }} />
          
          {/* Inner Orbit (Baby growing) */}
          <div className="absolute w-[280px] h-[280px] md:w-[380px] md:h-[380px] border-[4px] border-gold/30 rounded-full animate-[spin_15s_linear_infinite]" style={{ borderRadius: '50% 50% 30% 70% / 70% 30% 70% 30%' }}>
            {/* Small glowing orb representing the baby moving within */}
            <div className="absolute top-[-2px] left-1/2 w-4 h-4 md:w-6 md:h-6 bg-gradient-to-r from-blush to-blush-light rounded-full -translate-x-1/2 shadow-[0_0_20px_rgba(242,166,166,0.9)] animate-pulse border-2 border-white/50 z-20" style={{ animationDuration: '2s' }}></div>
          </div>
          
          {/* Inner Core (The Mama/Baby Connection) */}
          <div className="relative w-36 h-36 md:w-56 md:h-56 bg-white/60 backdrop-blur-sm rounded-full shadow-[0_0_50px_rgba(242,166,166,0.2)] flex items-center justify-center animate-[pulse_3s_ease-in-out_infinite] border border-white/60">
            <img src="/logo.png" alt="Bloom Logo" className="w-28 h-28 md:w-44 md:h-44 object-contain animate-[pulse_2s_ease-in-out_infinite] drop-shadow-md" style={{ animationDuration: '1.5s' }} />
          </div>

          {/* Floating Accents */}
          <div className="absolute top-[20%] right-[10%] text-gold animate-bounce" style={{ animationDuration: '3s' }}>
             <Bot size={28} className="opacity-70" />
          </div>
          <div className="absolute bottom-[20%] left-[10%] text-blush animate-bounce" style={{ animationDuration: '4s' }}>
             <Activity size={32} className="opacity-70" />
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-border bg-white px-6 py-6">
        <div className="max-w-[1200px] mx-auto flex flex-wrap justify-center gap-x-8 gap-y-4">
          {[
            { icon: <ShieldCheck className="w-5 h-5 text-sage" />, text: "Data is Encrypted" },
            { icon: <WifiOff className="w-5 h-5 text-sage" />, text: "Works Offline" },
            { icon: <MapPin className="w-5 h-5 text-sage" />, text: "Made for India" },
            { icon: <Stethoscope className="w-5 h-5 text-sage" />, text: "Clinically Informed" },
            { icon: <IndianRupee className="w-5 h-5 text-sage" />, text: "₹0 Always Free" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-[14px] font-semibold text-charcoal">
              {item.icon}
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Flowchart Section */}
      <section className="bg-sage-pale/20 py-24 px-6 overflow-hidden">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-charcoal mb-4">How Bloom Works</h2>
            <p className="text-medium text-[16px] max-w-2xl mx-auto">A seamless, private journey from your first trimester to delivery day.</p>
          </div>

          <div className="relative mt-8">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[48px] left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-sage-pale via-sage-light to-sage-pale" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
              {[
                { step: "1", title: "Quick Setup", desc: "Enter your due date. No account required to start tracking.", icon: <Calendar className="w-6 h-6 text-sage" /> },
                { step: "2", title: "Track Daily", desc: "Log vitals, kick counts, and contractions right on your phone.", icon: <Activity className="w-6 h-6 text-sage" /> },
                { step: "3", title: "Ask AI", desc: "Get WHO-verified answers to your pregnancy questions instantly.", icon: <Bot className="w-6 h-6 text-sage" /> },
                { step: "4", title: "Sync & Share", desc: "Securely sync to the cloud or share progress with your partner.", icon: <Cloud className="w-6 h-6 text-sage" /> }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center relative group">
                  {/* Connecting Line (Mobile) */}
                  {i !== 3 && <div className="md:hidden absolute top-[100px] bottom-[-48px] left-1/2 w-[2px] -translate-x-1/2 bg-sage-pale z-[-1]" />}
                  
                  <div className="w-24 h-24 rounded-full bg-white border-[4px] border-cream shadow-[0_8px_30px_rgba(107,146,120,0.12)] flex flex-col items-center justify-center mb-6 relative group-hover:-translate-y-2 group-hover:shadow-[0_15px_40px_rgba(107,146,120,0.2)] transition-all duration-400">
                    <span className="text-[10px] font-bold text-sage/70 uppercase tracking-widest absolute top-3">Step {item.step}</span>
                    <div className="mt-4 group-hover:scale-110 transition-transform duration-400">{item.icon}</div>
                  </div>
                  <h3 className="font-bold text-[18px] text-charcoal mb-2">{item.title}</h3>
                  <p className="text-[14px] text-medium leading-relaxed max-w-[200px]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl text-charcoal mb-4">Everything you need, nothing you don't.</h2>
          <p className="text-medium text-[16px] max-w-2xl mx-auto">Thoughtfully designed tools that put your peace of mind first.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: <Activity className="w-6 h-6 text-sage" />, title: "Kick Counter", desc: "Count fetal movements daily from 28 weeks. Auto-alerts if count is low." },
            { icon: <Timer className="w-6 h-6 text-sage" />, title: "Contraction Timer", desc: "Time contractions and get the 5-1-1 hospital rule calculated automatically." },
            { icon: <Heart className="w-6 h-6 text-sage" />, title: "BP Tracker", desc: "Log blood pressure with preeclampsia threshold alerts. Free at PHCs." },
            { icon: <Bot className="w-6 h-6 text-gold" />, title: "AskBloom AI", desc: "Ask anything about your pregnancy at 2am. Grounded in WHO guidelines.", premium: true },
            { icon: <Sparkles className="w-6 h-6 text-gold" />, title: "Name Boutique", desc: "AI-powered baby name generator based on style, origin, and cultural meanings.", premium: true },
            { icon: <Landmark className="w-6 h-6 text-sage" />, title: "Govt Schemes", desc: "JSY, PMMVY, PMSMA, JSSK — know your entitlements." }
          ].map((feature, i) => (
            <div key={i} className="bg-white border-[1.5px] border-border rounded-[16px] p-6 sm:p-8 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-[12px] bg-cream flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="font-bold text-[18px] text-charcoal mb-2 flex items-center gap-2">
                {feature.title}
                {feature.premium && <span className="bg-gold-pale text-gold text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm">Premium</span>}
              </h3>
              <p className="text-[14px] text-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* India Section */}
      <section className="relative bg-sage text-white px-6 py-24 md:py-32 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-white/10 blur-[120px]"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-charcoal/10 blur-[120px]"></div>
        </div>

        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="text-center mb-16 md:mb-20">
            <span className="bg-white/20 text-white border border-white/30 px-4 py-1.5 rounded-full text-[13px] font-bold tracking-[2px] uppercase mb-6 inline-block shadow-sm backdrop-blur-md">
              Localized Care
            </span>
            <h2 className="font-serif text-4xl md:text-5xl mb-6">Made for Indian mothers 🇮🇳</h2>
            <p className="text-white/90 text-[16px] md:text-[18px] max-w-2xl mx-auto font-medium">
              Because a pregnancy in India means navigating local foods, government schemes, and unique cultural contexts. We've got you covered.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Card 1 */}
            <div className="bg-white p-8 md:p-10 rounded-[24px] shadow-xl hover:-translate-y-2 transition-all duration-300 group text-charcoal border border-white/50">
              <div className="w-16 h-16 bg-sage-pale text-sage rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-300 shadow-sm rotate-3 group-hover:rotate-0">
                🥗
              </div>
              <h3 className="font-bold text-[20px] mb-3">Indian Foods Database</h3>
              <p className="text-medium text-[15px] leading-relaxed">
                Know exactly what's safe. Comprehensive coverage for dal, ragi, paneer, amla, and accurate risk flags for items like raw papaya or street food.
              </p>
            </div>
            {/* Card 2 */}
            <div className="bg-white p-8 md:p-10 rounded-[24px] shadow-xl hover:-translate-y-2 transition-all duration-300 group text-charcoal border border-white/50">
              <div className="w-16 h-16 bg-blush-pale text-blush rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-300 shadow-sm -rotate-3 group-hover:rotate-0">
                🏥
              </div>
              <h3 className="font-bold text-[20px] mb-3">Govt Scheme Guide</h3>
              <p className="text-medium text-[15px] leading-relaxed">
                Don't miss out on free benefits. Clear, actionable guides for JSY, PMMVY (₹5,000 cash assistance), and JSSK (free hospital delivery).
              </p>
            </div>
            {/* Card 3 */}
            <div className="bg-white p-8 md:p-10 rounded-[24px] shadow-xl hover:-translate-y-2 transition-all duration-300 group text-charcoal border border-white/50">
              <div className="w-16 h-16 bg-gold-pale text-gold rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-300 shadow-sm rotate-3 group-hover:rotate-0">
                📞
              </div>
              <h3 className="font-bold text-[20px] mb-3">Emergency Ready</h3>
              <p className="text-medium text-[15px] leading-relaxed">
                Critical helplines at your fingertips. 108 Ambulance, 112 National Emergency, and iCall psychosocial support — always one tap away.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl text-charcoal mb-4">Simple, transparent pricing.</h2>
          <p className="text-medium text-[16px] max-w-2xl mx-auto">Core health features are always free. Upgrade for AI-powered peace of mind.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1100px] mx-auto items-stretch">
          {/* Free Tier */}
          <div className="bg-white border-[1.5px] border-border rounded-[24px] p-8 flex flex-col hover:shadow-md transition-shadow">
            <h3 className="font-bold text-[22px] text-charcoal mb-2">Free Forever</h3>
            <div className="font-serif text-[36px] text-charcoal mb-6">₹0 <span className="text-[14px] text-medium font-sans font-normal">/ month</span></div>
            <p className="text-[13px] text-medium mb-8 min-h-[40px]">Everything you need for a healthy pregnancy journey.</p>
            
            <ul className="space-y-4 mb-8 flex-1">
              {['Kick Counter & BP Tracker', 'Contraction Timer', 'Birth Plan Builder', 'Mood & Hydration Trackers', 'Hospital Bag & Govt Schemes'].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px] text-charcoal font-medium">
                  <CheckCircle2 className="w-5 h-5 text-sage shrink-0 mt-0.5" /> <span>{item}</span>
                </li>
              ))}
            </ul>
            
            <button onClick={handleStart} className="w-full py-3.5 rounded-full border-[1.5px] border-sage text-sage font-bold text-[15px] hover:bg-sage-pale transition-colors mt-auto">
              Get Started Free
            </button>
          </div>

          {/* Plus Tier */}
          <div className="bg-white border-[2px] border-sage rounded-[24px] p-8 flex flex-col relative shadow-lg">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-sage text-white text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-sm">
              Recommended
            </div>
            <h3 className="font-bold text-[22px] text-charcoal mb-2">Bloom Plus</h3>
            <div className="font-serif text-[36px] text-charcoal mb-6">₹99 <span className="text-[14px] text-medium font-sans font-normal">/ month</span></div>
            <p className="text-[13px] text-medium mb-8 min-h-[40px]">Enhanced tools to coordinate with your partner and doctor.</p>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-[14px] text-charcoal font-medium">
                <CheckCircle2 className="w-5 h-5 text-sage shrink-0 mt-0.5" /> <span>Everything in Free, plus:</span>
              </li>
              <li className="flex items-start gap-3 text-[14px] text-charcoal font-medium">
                <CheckCircle2 className="w-5 h-5 text-sage shrink-0 mt-0.5" /> <span><strong className="text-sage-dark">Partner Sync:</strong> Share your journey in real-time.</span>
              </li>
              <li className="flex items-start gap-3 text-[14px] text-charcoal font-medium">
                <CheckCircle2 className="w-5 h-5 text-sage shrink-0 mt-0.5" /> <span><strong className="text-sage-dark">PDF Export:</strong> Generate detailed health reports.</span>
              </li>
              <li className="flex items-start gap-3 text-[14px] text-charcoal font-medium">
                <CheckCircle2 className="w-5 h-5 text-sage shrink-0 mt-0.5" /> <span>Unlimited Custom Notes</span>
              </li>
            </ul>
            
            <button onClick={handleStart} className="w-full py-3.5 rounded-full bg-sage text-white font-bold text-[15px] hover:bg-sage-dark transition-colors shadow-sm mt-auto">
              Choose Plus
            </button>
          </div>

          {/* Premium Tier */}
          <div className="bg-charcoal border-[2px] border-gold rounded-[24px] p-8 flex flex-col relative transform lg:-translate-y-4 shadow-xl">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-gold text-white text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-lg">
              Full AI Access
            </div>
            
            <h3 className="font-bold text-[22px] text-white mb-2 flex items-center gap-2">Bloom Premium <Bot className="w-5 h-5 text-gold" /></h3>
            <div className="font-serif text-[36px] text-white mb-6">₹299 <span className="text-[14px] text-light font-sans font-normal">/ month</span></div>
            <p className="text-[13px] text-light mb-8 min-h-[40px]">24/7 AI-powered support tailored for Indian clinics.</p>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-[14px] text-white font-medium">
                <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" /> <span>Everything in Plus, plus:</span>
              </li>
              <li className="flex items-start gap-3 text-[14px] text-white font-medium">
                <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" /> 
                <span><strong className="text-gold">AskBloom AI:</strong> Instant answers to pregnancy questions.</span>
              </li>
              <li className="flex items-start gap-3 text-[14px] text-white font-medium">
                <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" /> 
                <span><strong className="text-gold">AI Food Scanner:</strong> Instant safety rating.</span>
              </li>
              <li className="flex items-start gap-3 text-[14px] text-white font-medium">
                <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" /> 
                <span><strong className="text-gold">AI Name Generator:</strong> Cultural name suggestions.</span>
              </li>
            </ul>
            
            <button onClick={handleStart} className="w-full py-3.5 rounded-full bg-gold text-charcoal font-bold text-[15px] hover:bg-yellow-400 transition-colors shadow-lg shadow-gold/20 flex items-center justify-center gap-2 mt-auto">
              Start 7-Day Trial <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-[11px] text-light mt-3 opacity-70">Cancel anytime. Billed annually.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-border bg-white px-6 py-24">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl text-charcoal mb-2">Trusted by Indian mothers</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { review: "The app's AI has been an incredible companion. It feels like having an expert right in my pocket during this amazing journey.", author: "Priya M.", loc: "Mumbai" },
              { review: "The kick counter works perfectly. Simple, fast, exactly what I needed when my doctor asked me to track.", author: "Kavitha R.", loc: "Bangalore" },
              { review: "AskBloom answered my 2am panic questions much better than Googling. Highly recommend the premium plan.", author: "Anjali S.", loc: "Delhi" }
            ].map((t, i) => (
              <div key={i} className="bg-cream p-8 rounded-[20px] relative">
                <div className="absolute top-6 right-6 text-sage/20 font-serif text-6xl leading-none">"</div>
                <p className="text-[15px] text-charcoal leading-relaxed mb-6 italic relative z-10">"{t.review}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sage-light text-white flex items-center justify-center font-bold text-[14px]">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-[14px] text-charcoal">{t.author}</div>
                    <div className="text-[12px] text-medium">{t.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-white px-6 py-12 text-center md:text-left">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-light/20 pb-8 mb-8">
          <div>
            <div className="font-serif text-[24px] font-medium text-sage italic tracking-wider mb-2">
              bloom
            </div>
            <p className="text-[14px] text-light">Made with ❤️ for Indian mothers</p>
          </div>
          
          <div className="flex flex-col md:flex-row md:justify-end gap-4 md:gap-8 text-[14px] text-light">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="mailto:hello@bloompregnancy.in" className="hover:text-white transition-colors">hello@bloompregnancy.in</a>
          </div>
        </div>
        
        <div className="flex justify-center items-center gap-2 text-[13px] text-light/70">
          <Lock className="w-4 h-4" />
          Your data is used to train our LLM model, and is encrypted.
        </div>
      </footer>

      <FloatingChatbot />
    </div>
  );
};
