import React, { useState } from 'react';
import { usePlanner } from '../store';
import { auth, signInWithGoogle, handleRedirectResult, signUpWithEmail, signInWithEmail, resetPassword } from '../firebase';
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
  X,
  Moon
} from 'lucide-react';
import { FloatingChatbot } from '../components/FloatingChatbot';

export const LandingPage: React.FC = () => {
  const { state, updateState, restoreJourney, toggleDarkMode } = usePlanner();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // Handle redirect result from Google sign-in (when popup was blocked)
  React.useEffect(() => {
    handleRedirectResult().then(async (redirectUser) => {
      if (redirectUser) {
        const restored = await restoreJourney(redirectUser.uid);
        if (restored) {
          window.location.hash = '#dashboard';
        } else {
          updateState({ hasStartedOnboarding: true, isSetup: false });
          window.location.hash = '#setup';
        }
      }
    });
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
        
        // Check if there is an active journey locally
        if (state.isSetup && state.activeJourneyId) {
          window.location.hash = '#dashboard';
          return;
        }

        // Try to restore from cloud
        const restored = await restoreJourney(user.uid);
        
        if (restored) {
          window.location.hash = '#dashboard';
        } else {
          updateState({ hasStartedOnboarding: true, isSetup: false });
          window.location.hash = '#setup';
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
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLoginClick = () => {
    if (isSetupComplete) {
      window.location.hash = '#dashboard';
      return;
    }
    setShowEmailModal(true);
  };

  const clearModal = () => {
    setShowEmailModal(false);
    setIsRegistering(false);
    setNameInput('');
    setEmailInput('');
    setPasswordInput('');
    setConfirmPasswordInput('');
    setAuthError('');
    setIsSubmitting(false);
    setShowForgotPassword(false);
    setResetSent(false);
    setShowPassword(false);
  };

  const getFirebaseErrorMessage = (code: string) => {
    switch (code) {
      case 'auth/email-already-in-use': return 'This email is already registered. Try logging in instead.';
      case 'auth/invalid-email': return 'Please enter a valid email address.';
      case 'auth/weak-password': return 'Password must be at least 6 characters.';
      case 'auth/user-not-found': return 'No account found with this email. Sign up first.';
      case 'auth/wrong-password': return 'Incorrect password. Try again or reset it.';
      case 'auth/invalid-credential': return 'Incorrect email or password. Please try again.';
      case 'auth/too-many-requests': return 'Too many attempts. Please wait a moment and try again.';
      case 'auth/network-request-failed': return 'Network error. Please check your connection.';
      case 'auth/operation-not-allowed': return 'Email/Password sign-in is not enabled in your Firebase Console. Please enable it in Authentication > Sign-in method.';
      default: return `Something went wrong (${code || 'Unknown Error'}). Please try again.`;
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);

    try {
      if (isRegistering) {
        if (passwordInput !== confirmPasswordInput) {
          setAuthError('Passwords do not match.');
          setIsSubmitting(false);
          return;
        }
        if (passwordInput.length < 6) {
          setAuthError('Password must be at least 6 characters.');
          setIsSubmitting(false);
          return;
        }
        const newUser = await signUpWithEmail(emailInput, passwordInput, nameInput);
        clearModal();
        // New user — go to setup
        updateState({ hasStartedOnboarding: true, isSetup: false });
        window.location.hash = '#setup';
      } else {
        const existingUser = await signInWithEmail(emailInput, passwordInput);
        clearModal();
        // Try to restore existing journey
        const restored = await restoreJourney(existingUser.uid);
        if (restored) {
          window.location.hash = '#dashboard';
        } else {
          updateState({ hasStartedOnboarding: true, isSetup: false });
          window.location.hash = '#setup';
        }
      }
    } catch (error: any) {
      setAuthError(getFirebaseErrorMessage(error?.code || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!emailInput.includes('@')) {
      setAuthError('Please enter your email address first.');
      return;
    }
    try {
      await resetPassword(emailInput);
      setResetSent(true);
    } catch (error: any) {
      setAuthError(getFirebaseErrorMessage(error?.code || ''));
    }
  };

  return (
    <div className="min-h-screen bg-cream font-sans overflow-x-hidden selection:bg-sage-pale selection:text-sage-dark text-charcoal relative">
      {/* Auth Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-[400px] shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={clearModal}
              className="absolute top-4 right-4 p-2 text-medium hover:text-charcoal transition-colors rounded-full hover:bg-cream"
            >
              <X size={20} />
            </button>
            
            <div className="w-10 h-10 bg-sage-pale text-sage rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Mail size={20} />
            </div>
            
            {showForgotPassword ? (
              /* Forgot Password View */
              <>
                <h2 className="font-serif text-[22px] font-bold text-charcoal mb-1">Reset password</h2>
                <p className="text-[13px] text-medium mb-5 leading-relaxed">
                  {resetSent 
                    ? `We've sent a password reset link to ${emailInput}. Check your inbox.` 
                    : "Enter your email and we'll send you a link to reset your password."}
                </p>
                {!resetSent ? (
                  <form onSubmit={handleForgotPassword} className="flex flex-col gap-3">
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
                    {authError && <div className="text-[13px] text-critical font-medium">{authError}</div>}
                    <button type="submit" className="w-full bg-charcoal text-white rounded-[10px] font-bold py-2.5 hover:bg-gray-800 transition-colors mt-1 shadow-sm text-[14px]">
                      Send Reset Link
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-sage-pale rounded-[10px] text-sage text-[13px] font-medium">
                    <CheckCircle2 size={16} /> Check your inbox for the reset link.
                  </div>
                )}
                <button 
                  type="button" 
                  onClick={() => { setShowForgotPassword(false); setResetSent(false); setAuthError(''); }}
                  className="text-[12px] text-medium font-semibold hover:text-charcoal transition-colors mt-4 block text-center w-full"
                >
                  ← Back to Log In
                </button>
              </>
            ) : (
              /* Login / Sign Up View */
              <>
                <h2 className="font-serif text-[22px] font-bold text-charcoal mb-1">
                  {isRegistering ? 'Create your account' : 'Welcome back'}
                </h2>
                <p className="text-[13px] text-medium mb-5 leading-relaxed">
                  {isRegistering ? 'Sign up with your email to get started.' : 'Log in to access your pregnancy dashboard.'}
                </p>
                
                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
                  {isRegistering && (
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
                  <div>
                    <label className="text-[11px] font-bold tracking-[1px] uppercase text-charcoal mb-1.5 flex justify-between items-end">
                      <span>Password</span>
                      {!isRegistering && (
                        <button 
                          type="button" 
                          onClick={() => setShowForgotPassword(true)} 
                          className="text-[10px] text-sage normal-case font-semibold hover:text-sage-dark transition-colors"
                        >
                          Forgot password?
                        </button>
                      )}
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full border-[1.5px] border-border rounded-[10px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-shadow pr-12"
                        required
                        minLength={6}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-medium hover:text-charcoal transition-colors"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                  {isRegistering && (
                    <div>
                      <label className="text-[11px] font-bold tracking-[1px] uppercase text-charcoal mb-1.5 block">Confirm Password</label>
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full border-[1.5px] border-border rounded-[10px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-shadow"
                        required
                        minLength={6}
                      />
                    </div>
                  )}
                  {authError && <div className="text-[13px] text-critical font-medium">{authError}</div>}
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-charcoal text-white rounded-[10px] font-bold py-2.5 hover:bg-gray-800 transition-colors mt-1 shadow-sm text-[14px] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isRegistering ? 'Create Account' : 'Log In'}
                  </button>
                  <div className="text-center mt-1.5 mb-1.5">
                    <button 
                      type="button" 
                      onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); setPasswordInput(''); setConfirmPasswordInput(''); }}
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
              </>
            )}
          </div>
        </div>
      )}
      {/* Navigation */}
      <nav className="w-full max-w-[1200px] mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 shrink-0 mr-4">
          <img src="/logo.png" alt="Our Pregnancy Logo" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
          <span className="font-serif text-[24px] md:text-[28px] font-semibold text-sage tracking-wide">Our Pregnancy</span>
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
              <button type="button" onClick={() => { setIsRegistering(false); handleEmailLoginClick(); }} className="bg-transparent text-charcoal rounded-[10px] text-[13px] md:text-[14px] font-semibold px-3 md:px-5 py-2 hover:bg-cream transition-colors whitespace-nowrap shrink-0">
                Log In
              </button>
              <button type="button" onClick={() => { setIsRegistering(true); handleEmailLoginClick(); }} className="bg-charcoal text-white rounded-[10px] text-[13px] md:text-[14px] font-semibold px-4 md:px-5 py-2 hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap shrink-0">
                Sign Up
              </button>
            </>
          ) : (
            <button type="button" onClick={handleStart} disabled={isLoggingIn} className="bg-charcoal text-white rounded-[10px] text-[13px] md:text-[14px] font-semibold px-4 md:px-5 py-2 hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap shrink-0">
              {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : null}
              Open Dashboard
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-8 pb-16 md:pt-16 md:pb-24 max-w-[1200px] mx-auto z-10 flex flex-col md:flex-row items-center justify-between gap-12 overflow-visible">
        
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
            Track symptoms, count kicks, pack your hospital bag, and monitor blood pressure.
            <strong className="text-charcoal font-semibold"> Core features free. AI tools coming soon.</strong>
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto flex-wrap">
            <button 
              type="button"
              onClick={handleStart}
              disabled={isLoggingIn}
              className="group relative inline-flex items-center justify-center gap-2 bg-sage text-white rounded-full font-semibold px-8 py-4 text-[17px] transition-all hover:bg-sage-dark hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-6px_rgba(122,158,135,0.4)] w-full sm:w-auto disabled:opacity-70"
            >
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {isSetupComplete ? "Go to Dashboard" : "Start Tracking"}
              {!isLoggingIn && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
            {!isSetupComplete && (
              <button
                type="button"
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

        {/* Right Side: Visual/Animation (The Our Pregnancy/Womb Concept) */}
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
          <div className="relative w-44 h-44 md:w-64 md:h-64 bg-white/60 backdrop-blur-sm rounded-full shadow-[0_0_50px_rgba(242,166,166,0.2)] flex items-center justify-center animate-[pulse_3s_ease-in-out_infinite] border border-white/60">
            <img src="/logo.png" alt="Our Pregnancy Logo" className="w-36 h-36 md:w-52 md:h-52 object-contain animate-[pulse_2s_ease-in-out_infinite] drop-shadow-md" style={{ animationDuration: '1.5s' }} />
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
            { icon: <MapPin className="w-5 h-5 text-sage" />, text: "Made for Indian mothers 🇮🇳" },
            { icon: <ShieldCheck className="w-5 h-5 text-sage" />, text: "Your data is private & secure" },
            { icon: <IndianRupee className="w-5 h-5 text-sage" />, text: "Core features are free" },
            { icon: <WifiOff className="w-5 h-5 text-sage" />, text: "Works offline via PWA" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-[14px] font-semibold text-charcoal">
              {item.icon}
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Flowchart Section */}
      <section className="bg-sage-pale/20 py-16 md:py-24 px-6 overflow-hidden">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-charcoal mb-4">How Our Pregnancy Works</h2>
            <p className="text-medium text-[16px] max-w-2xl mx-auto">A seamless, private journey from your first trimester to delivery day.</p>
          </div>

          <div className="relative mt-8">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[48px] left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-sage-pale via-sage-light to-sage-pale" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
              {[
                { step: "1", title: "Quick Setup", desc: "Enter your due date. No account required to start tracking.", icon: <Calendar className="w-6 h-6 text-sage" /> },
                { step: "2", title: "Track Daily", desc: "Log vitals, kick counts, and contractions right on your phone.", icon: <Activity className="w-6 h-6 text-sage" /> },
                { step: "3", title: "Prepare", desc: "Build your hospital bag checklist and track symptoms.", icon: <Heart className="w-6 h-6 text-sage" /> },
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

      {/* Features Bento Grid */}
      <section id="features" className="max-w-[1200px] mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-pale text-[12px] font-bold text-sage uppercase tracking-wider mb-4 border border-sage/20">
            <Sparkles size={14} /> Comprehensive Toolkit
          </div>
          <h2 className="font-serif text-[clamp(32px,5vw,48px)] text-charcoal mb-4 leading-tight">Everything you need,<br />beautifully organized.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Feature 1: AI Food Scanner (Large) */}
          <div className="md:col-span-2 bg-gradient-to-br from-cream to-white border border-border rounded-[32px] overflow-hidden flex flex-col md:flex-row group hover:shadow-xl transition-all duration-500">
            <div className="p-8 md:p-10 flex-1 flex flex-col justify-center">
              <div className="w-12 h-12 rounded-[14px] bg-sage-pale flex items-center justify-center mb-6 text-sage">
                <Camera size={24} />
              </div>
              <h3 className="font-serif text-[28px] font-bold text-charcoal mb-3">AI Food Safety Scanner</h3>
              <p className="text-[16px] text-medium leading-relaxed mb-6">
                Not sure if that street food or local fruit is safe during pregnancy? Snap a picture and let our Gemini-powered AI verify it against Indian food safety guidelines instantly.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-[14px] font-medium text-charcoal"><CheckCircle2 size={16} className="text-sage" /> Detects harmful ingredients</li>
                <li className="flex items-center gap-2 text-[14px] font-medium text-charcoal"><CheckCircle2 size={16} className="text-sage" /> Tailored for Indian cuisine</li>
              </ul>
            </div>
            <div className="flex-1 min-h-[300px] relative overflow-hidden bg-sage-pale/30">
              <img src="/food_scanner_updated_1779026987896.png" alt="Food Scanner UI" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
          </div>

          {/* Feature 2: Partner Sync (Tall) */}
          <div className="bg-white border border-border rounded-[32px] p-8 md:p-10 flex flex-col relative overflow-hidden group hover:shadow-xl transition-all duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sage/10 rounded-full filter blur-[60px] -z-0"></div>
            <div className="w-12 h-12 rounded-[14px] bg-sage-pale flex items-center justify-center mb-6 text-sage relative z-10">
              <Cloud size={24} />
            </div>
            <h3 className="font-serif text-[24px] font-bold text-charcoal mb-3 relative z-10">Real-Time Partner Sync</h3>
            <p className="text-[15px] text-medium leading-relaxed mb-8 relative z-10">
              Enjoy secure storage in the cloud. Securely link devices via WebRTC to share the journey with your partner while maintaining granular privacy controls.
            </p>
            <div className="mt-auto relative z-10 space-y-3">
              <div className="bg-cream rounded-xl p-4 border border-border flex items-center justify-between">
                <span className="text-[13px] font-bold text-charcoal">Sync Mode</span>
                <span className="text-[12px] bg-sage text-white px-2 py-1 rounded font-bold">Encrypted</span>
              </div>
              <div className="bg-cream rounded-xl p-4 border border-border flex items-center justify-between">
                <span className="text-[13px] font-bold text-charcoal">Cloud Storage</span>
                <span className="text-[12px] bg-charcoal text-white px-2 py-1 rounded font-bold">Secure</span>
              </div>
            </div>
          </div>

          {/* Feature 3: Biometrics (Small) */}
          <div className="bg-white border border-border rounded-[32px] p-8 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-blush-pale text-blush flex items-center justify-center mb-4"><Activity size={20} /></div>
            <h4 className="font-bold text-[18px] text-charcoal mb-2">Labor Readiness Score</h4>
            <p className="text-[14px] text-medium">Predictive biometrics analyzing your HRV, RHR, and Braxton Hicks frequency.</p>
          </div>

          {/* Feature 4: EHR Export (Small) */}
          <div className="bg-white border border-border rounded-[32px] p-8 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-gold-pale text-gold flex items-center justify-center mb-4"><Stethoscope size={20} /></div>
            <h4 className="font-bold text-[18px] text-charcoal mb-2">FHIR R4 EHR Export</h4>
            <p className="text-[14px] text-medium">Instantly export your entire care plan and vitals to major hospital systems like Epic.</p>
          </div>

          {/* Feature 5: AI Chatbot (Small) */}
          <div className="bg-white border border-border rounded-[32px] p-8 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-sage-pale text-sage flex items-center justify-center mb-4"><Bot size={20} /></div>
            <h4 className="font-bold text-[18px] text-charcoal mb-2">Ask Bloom 24/7</h4>
            <p className="text-[14px] text-medium">Get immediate answers to your pregnancy questions with our fine-tuned AI companion.</p>
          </div>

          {/* Feature 6: Vitals Tracker (Small) */}
          <div className="bg-white border border-border rounded-[32px] p-8 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-sage-pale text-sage flex items-center justify-center mb-4"><Heart size={20} /></div>
            <h4 className="font-bold text-[18px] text-charcoal mb-2">Vitals Tracker</h4>
            <p className="text-[14px] text-medium">Log blood pressure with preeclampsia threshold alerts.</p>
          </div>

          {/* Feature 7: Kick Counter (Small) */}
          <div className="bg-white border border-border rounded-[32px] p-8 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-blush-pale text-blush flex items-center justify-center mb-4"><Activity size={20} /></div>
            <h4 className="font-bold text-[18px] text-charcoal mb-2">Kick Counter</h4>
            <p className="text-[14px] text-medium">Count fetal movements daily from 28 weeks with auto-alerts if count is low.</p>
          </div>

          {/* Feature 8: Checklists (Small) */}
          <div className="bg-white border border-border rounded-[32px] p-8 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-gold-pale text-gold flex items-center justify-center mb-4"><CheckCircle2 size={20} /></div>
            <h4 className="font-bold text-[18px] text-charcoal mb-2">Multiple Checklists</h4>
            <p className="text-[14px] text-medium">Prepare essentials for delivery day with our curated hospital bag lists.</p>
          </div>

          {/* Feature 9: Contraction Timer (Small) */}
          <div className="bg-white border border-border rounded-[32px] p-8 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-sage-pale text-sage flex items-center justify-center mb-4"><Timer size={20} /></div>
            <h4 className="font-bold text-[18px] text-charcoal mb-2">Contraction Timer</h4>
            <p className="text-[14px] text-medium">Time contractions and get the 5-1-1 hospital rule calculated automatically.</p>
          </div>

          {/* Feature 10: Pregnancy Timeline (Small) */}
          <div className="bg-white border border-border rounded-[32px] p-8 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-blush-pale text-blush flex items-center justify-center mb-4"><Calendar size={20} /></div>
            <h4 className="font-bold text-[18px] text-charcoal mb-2">Pregnancy Timeline</h4>
            <p className="text-[14px] text-medium">Track weekly changes, milestones, and what to expect along your journey.</p>
          </div>

          {/* Feature 11: Dark Mode (Small) */}
          <div className="bg-white border border-border rounded-[32px] p-8 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-charcoal text-white flex items-center justify-center mb-4"><Moon size={20} /></div>
            <h4 className="font-bold text-[18px] text-charcoal mb-2">Calm/Dark Mode</h4>
            <p className="text-[14px] text-medium">Soothing dark mode for tracking during those 3 AM wake-ups.</p>
          </div>

        </div>
      </section>

      {/* India Section */}
      <section className="relative bg-sage text-white px-6 py-16 md:py-24 overflow-hidden">
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

      {/* Free Section */}
      <section className="max-w-[800px] mx-auto px-6 py-16 md:py-24 text-center">
        <h2 className="font-serif text-4xl text-charcoal mb-4">Core features, always free.</h2>
        <p className="text-medium text-[16px] mb-10">We believe every mother deserves access to tools that make pregnancy safer and less stressful. Tracking, vitals, tasks, and more — free, always.</p>
        <button type="button" onClick={handleStart} className="py-4 px-10 rounded-full bg-sage text-white font-bold text-[16px] hover:bg-sage-dark transition-colors shadow-lg">
          Start Tracking Now
        </button>
      </section>

      {/* Testimonials */}
      <section className="border-t border-border bg-white px-6 py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl text-charcoal mb-2">Trusted by Indian mothers</h2>
          </div>
          
          <div className="columns-1 md:columns-3 gap-6 space-y-6">
            {[
              { review: "I love how personal it feels — everything is tailored to my pregnancy week and my situation.", author: "Priya M.", loc: "Mumbai" },
              { review: "The kick counter works perfectly. Simple, fast, exactly what I needed when my doctor asked me to track.", author: "Kavitha R.", loc: "Bangalore" },
              { review: "The core features are free and work even when I'm travelling. Such a blessing!", author: "Anjali S.", loc: "Delhi" },
              { review: "The AI food scanner saved me so much anxiety during my babymoon in Goa. Highly recommend!", author: "Sneha P.", loc: "Goa" },
              { review: "Finally an app that understands Indian contexts and government schemes.", author: "Divya K.", loc: "Chennai" }
            ].map((t, i) => (
              <div key={i} className="bg-cream p-8 rounded-[20px] relative break-inside-avoid shadow-sm hover:shadow-md transition-shadow">
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
            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
              <img src="/logo.png" alt="Our Pregnancy Logo" className="w-8 h-8 object-contain" />
              <span className="font-serif text-[24px] font-semibold text-sage tracking-wide">Our Pregnancy</span>
            </div>
            <p className="text-[14px] text-light">Made with ❤️ for Indian mothers</p>
          </div>
          
          <div className="flex flex-col md:flex-row md:justify-end gap-4 md:gap-8 text-[14px] text-light">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="mailto:hello@ourpregnancy.in" className="hover:text-white transition-colors">hello@ourpregnancy.in</a>
          </div>
        </div>
        
        <div className="flex justify-center items-center gap-2 text-[13px] text-light/70">
          <Lock className="w-4 h-4" />
          Your data is encrypted and only accessible by you.
        </div>
      </footer>

    </div>
  );
};
