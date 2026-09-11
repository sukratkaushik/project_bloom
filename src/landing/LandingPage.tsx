import React, { useState } from 'react';
import { usePlanner } from '../store';
import { navigate } from '../utils/navigation';
import { auth, signInWithGoogle, handleRedirectResult, signUpWithEmail, signInWithEmail, resetPassword, resendVerificationEmail, verifyOtpCallable, sendVerificationOtpCallable, triggerWelcomeEmailIfNewCallable } from '../firebase';
import {
  ShieldCheck,
  WifiOff,
  MapPin,
  Stethoscope,
  Coins,
  Activity,
  Timer,
  Heart,
  Bot,
  Camera,
  Landmark,
  Scale,
  ArrowRight,
  CheckCircle2,
  Lock,
  Loader2,
  Cloud,
  Calendar,
  Sparkles,
  Mail,
  MailCheck,
  X,
  Moon,
  Linkedin,
  Baby,
  ClipboardList,
  FileText
} from 'lucide-react';
import { FloatingChatbot } from '../components/FloatingChatbot';
import { LanguageSelector } from '../components/LanguageSelector';
import { PromoBanner } from '../components/PromoBanner';


export const LandingPage: React.FC = () => {
  const { state, updateState, restoreJourney, toggleDarkMode } = usePlanner();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [isScrolled, setIsScrolled] = useState(false);
  const [freeMonths, setFreeMonths] = useState(1);
  const [standardMonths, setStandardMonths] = useState(1);
  const [premiumMonths, setPremiumMonths] = useState(1);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          navigate('/dashboard');
        } else {
          updateState({ hasStartedOnboarding: true, isSetup: false });
          navigate('/setup');
        }
      }
    });
  }, []);

  const isVerified = Boolean(
    user && (
      user.emailVerified ||
      user.email === 'sukrat.kaushik@gmail.com' ||
      user.providerData.some((p) => p.providerId === 'google.com')
    )
  );
  const isSetupComplete = state.isSetup && isVerified;

  const handleStart = async () => {
    try {
      if (isSetupComplete) {
        navigate('/dashboard');
        return;
      }

      setIsLoggingIn(true);
      const user = await signInWithGoogle();
      if (user) {
        triggerWelcomeEmailIfNewCallable();
        setShowEmailModal(false);

        // Check if there is an active journey locally
        if (state.isSetup && state.activeJourneyId) {
          navigate('/dashboard');
          return;
        }

        // Try to restore from cloud
        const restored = await restoreJourney(user.uid);

        if (restored) {
          navigate('/dashboard');
        } else {
          updateState({ hasStartedOnboarding: true, isSetup: false });
          navigate('/setup');
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
  const [showVerifyNotice, setShowVerifyNotice] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [cachedPassword, setCachedPassword] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-open login modal if arriving with #login or ?login
  React.useEffect(() => {
    if (window.location.hash.includes('login') || window.location.search.includes('login')) {
      setShowEmailModal(true);
      setIsRegistering(false);
    }
  }, []);

  const handleEmailClick = (email: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email);
      setToastMessage("Email copied to clipboard!");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleEmailLoginClick = () => {
    if (isSetupComplete) {
      navigate('/dashboard');
      return;
    }
    setShowEmailModal(true);
  };

  const clearModal = () => {
    setShowEmailModal(false);
    setIsRegistering(false);
    setShowVerifyNotice(false);
    setResendStatus('idle');
    setResendMessage('');
    setCachedPassword('');
    setOtpInput('');
    setOtpError('');
    setIsVerifyingOtp(false);
    setResendCooldown(0);
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
      case 'auth/email-not-verified': return 'Your email address is not verified yet. Please enter the 6-digit verification code sent to your inbox.';
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

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = otpInput.trim();
    if (cleanCode.length !== 6) {
      setOtpError('Please enter all 6 digits.');
      return;
    }
    setOtpError('');
    setIsVerifyingOtp(true);

    try {
      await verifyOtpCallable(registeredEmail, cleanCode);
      // Successful verification!
      if (cachedPassword) {
        const user = await signInWithEmail(registeredEmail, cachedPassword);
        clearModal();
        const restored = await restoreJourney(user.uid);
        if (restored) {
          navigate('/dashboard');
        } else {
          updateState({ hasStartedOnboarding: true, isSetup: false });
          navigate('/setup');
        }
      } else {
        setShowVerifyNotice(false);
        setIsRegistering(false);
        setEmailInput(registeredEmail);
        setAuthError('');
        alert('Email verified successfully! Please enter your password to log in.');
      }
    } catch (err: any) {
      setOtpError(err?.message || 'Invalid or expired verification code. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setResendMessage('');
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
        setCachedPassword(passwordInput);
        await signUpWithEmail(emailInput, passwordInput, nameInput);
        setRegisteredEmail(emailInput);
        setShowVerifyNotice(true);
        setIsRegistering(false);
        setPasswordInput('');
        setConfirmPasswordInput('');
        setAuthError('');
        setOtpInput('');
        setOtpError('');
        setResendStatus('idle');
        setResendMessage('');
      } else {
        const existingUser = await signInWithEmail(emailInput, passwordInput);
        clearModal();
        // Try to restore existing journey
        const restored = await restoreJourney(existingUser.uid);
        if (restored) {
          navigate('/dashboard');
        } else {
          updateState({ hasStartedOnboarding: true, isSetup: false });
          navigate('/setup');
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
              aria-label="Close authentication modal"
            >
              <X size={20} />
            </button>

            <div className="w-10 h-10 bg-sage-pale text-sage rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Mail size={20} />
            </div>

            {showVerifyNotice ? (
              /* 6-Digit OTP Verification Screen */
              <div className="text-center animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 bg-sage-pale text-sage rounded-full flex items-center justify-center mb-3 shadow-sm mx-auto">
                  <ShieldCheck size={28} />
                </div>
                <h2 className="font-serif text-[22px] font-bold text-charcoal mb-1.5">Enter 6-Digit Code</h2>
                <p className="text-[13px] text-medium mb-5 leading-relaxed">
                  We've sent a 6-digit verification code to<br />
                  <strong className="text-charcoal font-semibold break-all">{registeredEmail}</strong>
                </p>

                <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="text-[11px] font-bold tracking-[1px] uppercase text-charcoal mb-1.5 block text-center">
                      Security Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtpInput(val);
                        setOtpError('');
                      }}
                      placeholder="••••••"
                      className="w-full text-center font-mono text-[28px] font-bold tracking-[12px] py-2.5 px-4 bg-cream/60 border-[2px] border-border focus:border-sage rounded-xl focus:outline-none focus:ring-1 focus:ring-sage transition-all placeholder:tracking-[8px]"
                      autoFocus
                      required
                    />
                  </div>

                  {otpError && (
                    <div className="text-[12.5px] text-critical font-medium bg-red-50 border border-red-200 p-2.5 rounded-lg text-center leading-snug">
                      {otpError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifyingOtp || otpInput.length !== 6}
                    className="w-full bg-charcoal text-cream rounded-[10px] font-bold py-2.5 hover:opacity-90 transition-all shadow-sm text-[14px] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifyingOtp && <Loader2 className="w-4 h-4 animate-spin" />}
                    Verify & Activate Account
                  </button>

                  <div className="flex items-center justify-between text-[12px] pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        if (resendCooldown > 0 || resendStatus === 'sending') return;
                        setResendStatus('sending');
                        setOtpError('');
                        setResendMessage('');
                        try {
                          await sendVerificationOtpCallable(registeredEmail);
                          setResendStatus('sent');
                          setResendMessage('New 6-digit code sent! Check inbox.');
                          setResendCooldown(45);
                          const timer = setInterval(() => {
                            setResendCooldown((prev) => {
                              if (prev <= 1) {
                                clearInterval(timer);
                                return 0;
                              }
                              return prev - 1;
                            });
                          }, 1000);
                        } catch (err: any) {
                          setResendStatus('error');
                          setResendMessage(err?.message || 'Could not resend code. Please try again.');
                        }
                      }}
                      disabled={resendCooldown > 0 || resendStatus === 'sending'}
                      className="text-sage font-bold hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowVerifyNotice(false);
                        setIsRegistering(false);
                        setEmailInput(registeredEmail);
                        setAuthError('');
                      }}
                      className="text-medium hover:text-charcoal font-semibold transition-colors cursor-pointer"
                    >
                      Back to Log In
                    </button>
                  </div>

                  {resendMessage && (
                    <p className={`text-[12px] font-medium text-center ${resendStatus === 'sent' ? 'text-green-600' : 'text-critical'}`}>
                      {resendMessage}
                    </p>
                  )}
                </form>

                <p className="text-[11px] text-light mt-5 italic">
                  💡 Tip: The 6-digit code expires in 10 minutes. Please check your junk/spam folder if you don't see it.
                </p>
              </div>
            ) : showForgotPassword ? (
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
                    <button type="submit" className="w-full bg-charcoal text-cream rounded-[10px] font-bold py-2.5 hover:opacity-90 transition-all mt-1 shadow-sm text-[14px]">
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

                  {authError && (
                    <div className="space-y-1.5 p-3 bg-red-50/80 border border-red-200/60 rounded-[10px]">
                      <div className="text-[12.5px] text-critical font-medium leading-snug">{authError}</div>
                      {authError.includes('not verified') && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={async () => {
                              if (!emailInput) {
                                setResendMessage('Please enter your email above.');
                                return;
                              }
                              setRegisteredEmail(emailInput);
                              setCachedPassword(passwordInput);
                              setShowVerifyNotice(true);
                              setOtpInput('');
                              setOtpError('');
                              setResendMessage('');
                              try {
                                await sendVerificationOtpCallable(emailInput);
                              } catch (err) {
                                console.warn("Auto-resend OTP error:", err);
                              }
                            }}
                            className="text-[12.5px] text-sage font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            Enter 6-digit verification code →
                          </button>
                        </div>
                      )}
                      {resendMessage && (
                        <p className={`text-[11.5px] font-medium ${resendStatus === 'sent' ? 'text-green-600' : 'text-critical'}`}>
                          {resendMessage}
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-charcoal text-cream rounded-[10px] font-bold py-2.5 hover:opacity-90 transition-all mt-1 shadow-sm text-[14px] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isRegistering ? 'Create Account' : 'Log In'}
                  </button>
                  <div className="text-center mt-1.5 mb-1.5">
                    <button
                      type="button"
                      onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); setResendMessage(''); setPasswordInput(''); setConfirmPasswordInput(''); }}
                      className="text-[12px] text-medium font-semibold hover:text-charcoal transition-colors cursor-pointer"
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
      <header className={`fixed left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] md:w-[calc(100%-4.5rem)] max-w-[1200px] z-50 rounded-[20px] border border-border/80 bg-white/90 backdrop-blur-md transition-all duration-300 ${isScrolled
        ? 'top-2 md:top-[22px] shadow-[0_12px_32px_rgba(0,0,0,0.08)] border-sage-light/20'
        : 'top-4 md:top-[30px] shadow-[0_4px_20px_rgba(0,0,0,0.04)]'
        }`}>
        <PromoBanner />
        <div className={`transition-all duration-300 ${isScrolled ? 'py-1.5 sm:py-2 px-3 sm:px-4 md:px-8' : 'py-2 sm:py-3.5 px-3 sm:px-4 md:px-8'}`}>
          <nav className="w-full flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 mr-2 sm:mr-4">
              <img src="/logo.png" alt="Our Pregnancy Logo" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain" />
              <span className="font-serif text-[18px] sm:text-[22px] md:text-[28px] font-semibold text-sage tracking-wide notranslate hidden min-[400px]:inline-block">Our Pregnancy</span>
            </div>

            {/* Navigation Links - Centered, Desktop Only */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[14px] font-semibold text-charcoal/80 hover:text-sage transition-all relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-sage after:transition-all hover:after:w-full">Features</a>
              <a href="#how-it-works" className="text-[14px] font-semibold text-charcoal/80 hover:text-sage transition-all relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-sage after:transition-all hover:after:w-full">How it Works</a>
              <a href="#localized-care" className="text-[14px] font-semibold text-charcoal/80 hover:text-sage transition-all relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-sage after:transition-all hover:after:w-full">About</a>
              <a href="#pricing" className="text-[14px] font-semibold text-charcoal/80 hover:text-sage transition-all relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-sage after:transition-all hover:after:w-full">Pricing</a>
              <a href="/team" onClick={(e) => { e.preventDefault(); navigate('/team'); }} className="text-[14px] font-semibold text-charcoal/80 hover:text-sage transition-all relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-sage after:transition-all hover:after:w-full">Team</a>
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
                  <button type="button" onClick={() => { setIsRegistering(false); handleEmailLoginClick(); }} className="bg-transparent text-charcoal rounded-[10px] text-[12px] sm:text-[13px] md:text-[14px] font-semibold px-2 py-1.5 sm:px-4 sm:py-2 hover:bg-cream transition-colors whitespace-nowrap shrink-0">
                    Log In
                  </button>
                  <button type="button" onClick={() => { setIsRegistering(true); handleEmailLoginClick(); }} className="bg-charcoal text-cream rounded-[10px] text-[12px] sm:text-[13px] md:text-[14px] font-semibold px-2.5 py-1.5 sm:px-4 sm:py-2 hover:opacity-90 transition-all shadow-sm whitespace-nowrap shrink-0">
                    Sign Up
                  </button>
                </>
              ) : (
                <button type="button" onClick={handleStart} disabled={isLoggingIn} className="bg-charcoal text-cream rounded-[10px] text-[12px] sm:text-[13px] md:text-[14px] font-semibold px-2.5 py-1.5 sm:px-4 sm:py-2 hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 whitespace-nowrap shrink-0">
                  {isLoggingIn ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin shrink-0" /> : null}
                  <span className="sm:hidden">Dashboard</span>
                  <span className="hidden sm:inline">Open Dashboard</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>


      {/* Hero Section */}
      <section className="relative px-6 pt-28 pb-16 md:pt-36 md:pb-24 max-w-[1200px] mx-auto z-10 flex flex-col md:flex-row items-center justify-between gap-12 overflow-visible">

        {/* Animated Background Blobs */}
        <div className="absolute top-0 -left-12 md:-left-24 w-72 h-72 bg-sage-light/20 rounded-full mix-blend-multiply filter blur-2xl animate-blob -z-10"></div>
        <div className="absolute top-0 right-32 w-72 h-72 bg-blush-light/20 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-2000 -z-10"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-gold-pale/40 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-4000 -z-10"></div>

        {/* Left Side: Text Content */}
        <div className="flex-1 text-left flex flex-col items-start w-full max-w-[600px] z-20">
          <div className="h-4"></div>

          <h1 className="font-serif text-[clamp(40px,6vw,72px)] leading-[1.1] text-charcoal mb-6 mt-2">
            Your pregnancy companion — <span className="italic text-sage">secure & synced.</span>
          </h1>

          <p className="text-[17px] md:text-[20px] text-medium mb-10 leading-relaxed">
            Track symptoms, count kicks, pack your hospital bag, and monitor blood pressure.
            <strong className="text-charcoal font-semibold"> Core features free. AI-powered tools included.</strong>
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
            { icon: <MapPin className="w-5 h-5 text-sage" />, text: "Made for expectant mothers" },
            { icon: <ShieldCheck className="w-5 h-5 text-sage" />, text: "Your data is private & secure" },
            { icon: <Coins className="w-5 h-5 text-sage" />, text: "Core features are free" },
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
      <section id="how-it-works" className="bg-sage-pale/20 pt-14 md:pt-16 pb-12 md:pb-14 px-6 overflow-hidden">
        <div className="max-w-[1140px] mx-auto">
          <div className="text-center mb-12 md:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-pale text-[12px] font-bold text-sage uppercase tracking-wider mb-4 border border-sage/20">
              <Sparkles size={14} /> Step-by-Step Experience
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-4">How <span className="notranslate">Our Pregnancy</span> Works</h2>
            <p className="text-medium text-[16px] max-w-2xl mx-auto">From zero-setup privacy and government financial entitlements to 24/7 AI prenatal care — here is how your journey unfolds.</p>
          </div>

          <div className="relative mt-8">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[48px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-sage-pale via-sage-light to-gold/40" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
              {[
                {
                  step: "1",
                  tag: "Free Forever",
                  tagClass: "bg-sage-pale text-sage border-sage/20",
                  title: "Private Onboarding",
                  desc: "Enter your due date or LMP to calculate your personalized weekly timeline immediately. No account required, 100% offline-first.",
                  icon: <Calendar className="w-6 h-6 text-sage" />
                },
                {
                  step: "2",
                  tag: "Free Forever",
                  tagClass: "bg-sage-pale text-sage border-sage/20",
                  title: "Track Vitals & Safety",
                  desc: "Log fetal kick counts, timed contractions, and blood pressure with preeclampsia warning alerts stored securely on your phone.",
                  icon: <Activity className="w-6 h-6 text-sage" />
                },
                {
                  step: "3",
                  tag: "Govt. & Legal Aid",
                  tagClass: "bg-sage-pale text-sage border-sage/20",
                  title: "Schemes & Rights",
                  desc: "Unlock ₹5,000–₹11,000+ through PMMVY, JSY & state maternity kits. Understand statutory 26-week paid leave & job protections under the Maternity Benefit Act.",
                  icon: <Landmark className="w-6 h-6 text-sage" />
                },
                {
                  step: "4",
                  tag: "⭐ Premium AI",
                  tagClass: "bg-gold/15 text-gold border-gold/30 font-extrabold",
                  title: "AI Prenatal Care",
                  desc: "Put a 24/7 Bloom AI clinical companion in your pocket. Scan Indian food safety, decipher medical reports, and export FHIR R4 EHRs for your OB-GYN.",
                  icon: <Sparkles className="w-6 h-6 text-gold" />
                }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center relative group">
                  {/* Connecting Line (Mobile) */}
                  {i !== 3 && <div className="md:hidden absolute top-[100px] bottom-[-48px] left-1/2 w-[2px] -translate-x-1/2 bg-sage-pale z-[-1]" />}

                  <div className="w-24 h-24 rounded-full bg-white border-[4px] border-cream shadow-[0_8px_30px_rgba(107,146,120,0.12)] flex flex-col items-center justify-center mb-5 relative group-hover:-translate-y-2 group-hover:shadow-[0_15px_40px_rgba(107,146,120,0.2)] transition-all duration-400">
                    <span className="text-[10px] font-bold text-sage/70 uppercase tracking-widest absolute top-3">Step {item.step}</span>
                    <div className="mt-4 group-hover:scale-110 transition-transform duration-400">{item.icon}</div>
                  </div>
                  <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border mb-2 ${item.tagClass}`}>
                    {item.tag}
                  </span>
                  <h3 className="font-bold text-[17px] text-charcoal mb-2">{item.title}</h3>
                  <p className="text-[13.5px] text-medium leading-relaxed max-w-[240px]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Value Callout / Conversion Card */}
          <div className="mt-12 md:mt-14 bg-white border border-sage/30 rounded-[24px] p-6 md:p-8 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-sage-pale/30 via-gold/5 to-transparent rounded-full filter blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-gold/15 text-gold text-[11px] font-bold uppercase tracking-wider mb-2.5 border border-gold/25">
                  <Sparkles size={13} className="text-gold" /> Why Upgrade to Premium?
                </div>
                <h3 className="font-serif text-2xl md:text-[26px] font-bold text-charcoal mb-2.5 leading-snug">
                  Essential care is free. Clinical AI intelligence is your superpower.
                </h3>
                <p className="text-medium text-[14px] leading-relaxed mb-4">
                  While daily kick tracking and government scheme navigators are free forever, Premium gives you an on-demand medical-grade support system whenever concerns arise — day or night.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[12.5px] font-semibold text-charcoal">
                  <div className="flex items-center gap-2 bg-cream/70 p-2.5 rounded-xl border border-border">
                    <CheckCircle2 size={15} className="text-sage shrink-0" />
                    <span>24/7 Bloom AI Chat</span>
                  </div>
                  <div className="flex items-center gap-2 bg-cream/70 p-2.5 rounded-xl border border-border">
                    <CheckCircle2 size={15} className="text-sage shrink-0" />
                    <span>AI Food & Report Scanner</span>
                  </div>
                  <div className="flex items-center gap-2 bg-cream/70 p-2.5 rounded-xl border border-border">
                    <CheckCircle2 size={15} className="text-sage shrink-0" />
                    <span>FHIR R4 Doctor EHR Export</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-sage text-white font-bold text-[14px] hover:bg-sage-dark shadow-sm hover:shadow-md transition-all active:scale-98 text-center"
                >
                  <span>Explore Premium Plans</span>
                  <ArrowRight size={15} />
                </a>
                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-sage-pale/60 text-sage-dark text-[11.5px] font-bold border border-sage/25 text-center">
                  <span>Use code <span className="font-extrabold text-charcoal bg-white/70 px-1.5 py-0.5 rounded">OPIN30</span> for 30 days free</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-center py-4">
        <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-border to-transparent" />
        <span className="mx-4 text-sage/40 text-[10px] tracking-[4px] uppercase font-bold">Toolkit</span>
        <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Features Bento Grid */}
      <section id="features" className="max-w-[1140px] mx-auto px-6 pt-6 md:pt-8 pb-12 md:pb-16">
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-pale text-[11px] font-bold text-sage uppercase tracking-wider mb-3 border border-sage/20">
            <Sparkles size={13} /> Comprehensive Toolkit
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-3 leading-tight">Everything you need,<br />beautifully organized.</h2>
          <p className="text-medium text-[15px] max-w-xl mx-auto">
            From essential free daily trackers to medical-grade AI intelligence — explore our complete suite of clinical pregnancy tools.
          </p>
        </div>

        <div className="space-y-4">
          {/* Row 1: Two Flagship AI Cards (2-col + 1-col) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Feature 1: AI Food Scanner (2-col) */}
            <div className="md:col-span-2 bg-gradient-to-br from-cream to-white border border-border rounded-2xl p-6 md:p-7 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-all duration-300">
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-sage-pale flex items-center justify-center text-sage shrink-0">
                      <Camera size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/15 px-2 py-0.5 rounded-full border border-gold/30">
                        Premium AI
                      </span>
                      <h3 className="font-serif text-[20px] md:text-[22px] font-bold text-charcoal leading-tight mt-0.5">
                        AI Food Safety Scanner
                      </h3>
                    </div>
                  </div>
                  <p className="text-[13.5px] text-medium leading-relaxed mb-4">
                    Snap any street food, unfamiliar herb, or curry for immediate clinical verification against pregnancy food safety guidelines.
                  </p>
                  <ul className="space-y-1.5 text-[13px] text-charcoal font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-sage shrink-0" />
                      <span>Detects harmful bacteria, raw dairy & unsafe spices</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-sage shrink-0" />
                      <span>Tailored for Indian street foods & regional cuisines</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-sage shrink-0" />
                      <span>Trimester-specific safety flags & healthy swaps</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="w-full md:w-[210px] lg:w-[240px] min-h-[170px] md:min-h-full rounded-xl overflow-hidden relative bg-sage-pale/30 shrink-0">
                <img src="/food_scanner_updated_1779026987896.png" alt="Food Scanner UI" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Feature 2: AI Medical Report & Ultrasound Analyzer (1-col) */}
            <div className="bg-gradient-to-br from-white to-gold-pale/20 border border-gold/30 rounded-2xl p-6 md:p-7 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gold-pale flex items-center justify-center text-gold">
                    <FileText size={20} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/15 px-2 py-0.5 rounded-full border border-gold/30">
                    Premium AI
                  </span>
                </div>
                <h3 className="font-serif text-[19px] md:text-[20px] font-bold text-charcoal mb-2">
                  AI Medical Report Analyzer
                </h3>
                <p className="text-[13px] text-medium leading-relaxed mb-4">
                  Upload CBC blood panels, anomaly scans, or glucose tests for immediate, reassuring explanations in plain language.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center text-[10.5px] font-semibold text-charcoal pt-2 border-t border-gold/20">
                <span className="bg-white/80 p-1.5 rounded-lg border border-border">Ultrasound</span>
                <span className="bg-white/80 p-1.5 rounded-lg border border-border">Lab Ranges</span>
                <span className="bg-white/80 p-1.5 rounded-lg border border-border">OB Questions</span>
              </div>
            </div>
          </div>

          {/* Row 2: Three High-Value Supporting Tools (3 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Ask Bloom 24/7 AI */}
            <div className="bg-white border border-border rounded-2xl p-5 md:p-6 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-sage-pale flex items-center justify-center text-sage">
                    <Bot size={18} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/15 px-2 py-0.5 rounded-full border border-gold/30">
                    Premium AI
                  </span>
                </div>
                <h4 className="font-bold text-[16px] text-charcoal mb-1.5">Ask Bloom 24/7 AI</h4>
                <p className="text-[13px] text-medium leading-relaxed">
                  Empathetic, instant guidance for 3 AM symptoms. Grounded in ACOG and WHO clinical obstetric guidelines.
                </p>
              </div>
            </div>

            {/* Card 2: Doctor Clinical PDF & EHR */}
            <div className="bg-white border border-border rounded-2xl p-5 md:p-6 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gold-pale flex items-center justify-center text-gold">
                    <Stethoscope size={18} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/15 px-2 py-0.5 rounded-full border border-gold/30">
                    Premium AI
                  </span>
                </div>
                <h4 className="font-bold text-[16px] text-charcoal mb-1.5">Doctor Clinical PDF & EHR</h4>
                <p className="text-[13px] text-medium leading-relaxed">
                  Export months of vitals, kick logs, and symptoms into a structured medical PDF or FHIR R4 report for your OB-GYN.
                </p>
              </div>
            </div>

            {/* Card 3: Real-Time Partner Sync */}
            <div className="bg-white border border-border rounded-2xl p-5 md:p-6 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-sage-pale flex items-center justify-center text-sage">
                    <Cloud size={18} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sage bg-sage-pale px-2 py-0.5 rounded-full border border-sage/30">
                    Standard Plan
                  </span>
                </div>
                <h4 className="font-bold text-[16px] text-charcoal mb-1.5">Real-Time Partner Sync</h4>
                <p className="text-[13px] text-medium leading-relaxed">
                  Share kicks, milestones, and emergency contraction alerts with your partner in real time via private WebRTC sync.
                </p>
              </div>
            </div>
          </div>

          {/* Row 3: Essential Free Daily Trackers (4 compact columns) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {/* Small 1: Contraction Timer */}
            <div className="bg-white border border-border rounded-xl p-4 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-sage-pale flex items-center justify-center text-sage">
                  <Timer size={15} />
                </div>
                <span className="text-[9.5px] font-semibold text-medium bg-cream px-1.5 py-0.5 rounded border border-border">
                  Free
                </span>
              </div>
              <h5 className="font-bold text-[14px] text-charcoal mb-1">Contraction Timer</h5>
              <p className="text-[12px] text-medium leading-snug">
                Clinical 5-1-1 hospital departure rule calculated automatically.
              </p>
            </div>

            {/* Small 2: Kick & BP Vitals */}
            <div className="bg-white border border-border rounded-xl p-4 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-blush-pale flex items-center justify-center text-blush">
                  <Heart size={15} />
                </div>
                <span className="text-[9.5px] font-semibold text-medium bg-cream px-1.5 py-0.5 rounded border border-border">
                  Free
                </span>
              </div>
              <h5 className="font-bold text-[14px] text-charcoal mb-1">Kick & BP Vitals</h5>
              <p className="text-[12px] text-medium leading-snug">
                Daily movement alerts with preeclampsia blood pressure thresholds.
              </p>
            </div>

            {/* Small 3: Birth Plan & Checklists */}
            <div className="bg-white border border-border rounded-xl p-4 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-sage-pale flex items-center justify-center text-sage">
                  <ClipboardList size={15} />
                </div>
                <span className="text-[9.5px] font-semibold text-medium bg-cream px-1.5 py-0.5 rounded border border-border">
                  Free
                </span>
              </div>
              <h5 className="font-bold text-[14px] text-charcoal mb-1">Birth Plan & Bag List</h5>
              <p className="text-[12px] text-medium leading-snug">
                Labor preferences builder and printable hospital bag checklists.
              </p>
            </div>

            {/* Small 4: Postpartum & Early Parenthood */}
            <div className="bg-white border border-border rounded-xl p-4 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-blush-pale flex items-center justify-center text-blush">
                  <Baby size={15} />
                </div>
                <span className="text-[9.5px] font-bold text-sage bg-sage-pale px-1.5 py-0.5 rounded border border-sage/30">
                  Standard
                </span>
              </div>
              <h5 className="font-bold text-[14px] text-charcoal mb-1">Postpartum Care</h5>
              <p className="text-[12px] text-medium leading-snug">
                Pelvic recovery, lochia tracking, and newborn feeding guides.
              </p>
            </div>
          </div>
        </div>

        {/* Compact Section Conversion Strip */}
        <div className="mt-8 bg-gradient-to-r from-cream via-white to-cream border border-sage/30 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-9 h-9 rounded-full bg-sage-pale flex items-center justify-center text-sage shrink-0 hidden sm:flex">
              <Sparkles size={16} />
            </div>
            <div>
              <h4 className="font-bold text-[15px] md:text-[16px] text-charcoal">
                Start free today. Upgrade anytime for clinical AI intelligence.
              </h4>
              <p className="text-[13px] text-medium">
                Core trackers are free forever. Paid packages start at just ₹199/month.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-center">
            <a
              href="#pricing"
              className="px-5 py-2.5 rounded-xl bg-sage text-white font-bold text-[13px] hover:bg-sage-dark transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Compare Plans</span>
              <ArrowRight size={14} />
            </a>
            <button
              type="button"
              onClick={handleStart}
              className="px-5 py-2.5 rounded-xl border border-border bg-white text-charcoal font-bold text-[13px] hover:bg-cream transition-all shadow-sm"
            >
              Start Free
            </button>
          </div>
        </div>
      </section>

      {/* Localized Section */}
      <section id="localized-care" className="relative bg-sage text-white px-6 py-12 md:py-16 overflow-hidden border-y border-white/20">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-white/10 blur-[120px]"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-charcoal/10 blur-[120px]"></div>
        </div>

        <div className="max-w-[1140px] mx-auto relative z-10">
          <div className="text-center mb-10 md:mb-12">
            <span className="bg-white/20 text-white border border-white/30 px-3.5 py-1 rounded-full text-[12px] font-bold tracking-[2px] uppercase mb-4 inline-block shadow-sm backdrop-blur-md">
              Localized For India
            </span>
            <h2 className="font-serif text-2xl md:text-4xl mb-3">
              Engineered for Indian Pregnancies,<br className="hidden md:inline" /> Not Western Algorithms
            </h2>
            <p className="text-white/90 text-[14.5px] md:text-[16px] max-w-2xl mx-auto font-medium leading-relaxed">
              Western apps don't know what ghee or raw papaya do, or how to claim ₹18,000+ from Indian schemes. We bridge obstetric science with Indian cultural realities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            {/* Card 1: Govt Schemes & Legal Rights */}
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:-translate-y-1 transition-all duration-300 text-charcoal border border-white/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-11 h-11 bg-blush-pale text-blush rounded-xl flex items-center justify-center text-xl shadow-sm">
                    🏛️
                  </div>
                  <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sage-pale text-sage border border-sage/30 uppercase tracking-wider">
                    Standard Plan
                  </span>
                </div>
                <h3 className="font-bold text-[17px] mb-2 text-charcoal">₹5,000–₹18,000+ Schemes & Rights</h3>
                <p className="text-medium text-[13px] leading-relaxed">
                  Central & 36 State/UT cash transfers (PMMVY, JSY, KCR Kit). Generates legal leave notices to protect your 26 weeks of paid salary under the Maternity Benefit Act.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/60 text-[11.5px] font-semibold text-blush flex items-center gap-1.5">
                <CheckCircle2 size={14} className="shrink-0 text-blush" />
                <span>Full 26-week salary legal protection</span>
              </div>
            </div>

            {/* Card 2: 11 Regional Languages & Cultural Care */}
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:-translate-y-1 transition-all duration-300 text-charcoal border border-white/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl shadow-sm">
                    🌐
                  </div>
                  <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cream text-charcoal/70 border border-border uppercase tracking-wider">
                    Free & Standard
                  </span>
                </div>
                <h3 className="font-bold text-[17px] mb-2 text-charcoal">11 Regional Indian Languages</h3>
                <p className="text-medium text-[13px] leading-relaxed">
                  Milestones and medical guides in your mother tongue (Hindi, Tamil, Telugu, Marathi, Bengali & more). Includes safe travel guidance for maternal home (mayka) trips and fasting.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/60 text-[11.5px] font-semibold text-amber-700 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="shrink-0 text-amber-600" />
                <span>Hindi, Tamil, Telugu, Bengali & more</span>
              </div>
            </div>

            {/* Card 3: Clinical SOS & Partner Emergency */}
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:-translate-y-1 transition-all duration-300 text-charcoal border border-white/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-11 h-11 bg-gold-pale text-gold rounded-xl flex items-center justify-center text-xl shadow-sm">
                    🚨
                  </div>
                  <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sage-pale text-sage border border-sage/30 uppercase tracking-wider">
                    Standard Plan
                  </span>
                </div>
                <h3 className="font-bold text-[17px] mb-2 text-charcoal">1-Tap SOS & Partner Alert</h3>
                <p className="text-medium text-[13px] leading-relaxed">
                  Instant 108/112 dispatch while alerting your partner with real-time GPS location and contraction frequency. Includes iCall 24/7 maternal mental health support.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/60 text-[11.5px] font-semibold text-gold-dark flex items-center gap-1.5">
                <CheckCircle2 size={14} className="shrink-0 text-gold" />
                <span>Real-time partner GPS & SOS alert</span>
              </div>
            </div>
          </div>

          {/* Pre-Pricing Transition Bridge */}
          <div className="mt-10 max-w-2xl mx-auto bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-5 md:p-6 text-center text-white shadow-md">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <h4 className="font-serif text-[18px] md:text-[20px] font-bold mb-1">
                  Care built for your world
                </h4>
                <p className="text-white/85 text-[13px]">
                  Explore plans starting at just ₹199/month below.
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <a
                  href="#pricing"
                  className="px-6 py-2.5 rounded-xl bg-white text-charcoal font-bold text-[13px] hover:bg-cream shadow-md transition-all active:scale-98 flex items-center gap-1.5"
                >
                  <span>View Plans Below</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Packages Section */}
      <section id="pricing" className="bg-cream border-t border-border px-6 py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-pale text-[12px] font-bold text-sage uppercase tracking-wider mb-4 border border-sage/20">
              <Sparkles size={14} /> Packages
            </div>
            <h2 className="font-serif text-[clamp(32px,5vw,48px)] text-charcoal mb-4 leading-tight">Simple, Transparent Pricing</h2>
            <p className="text-medium text-[16px] max-w-2xl mx-auto">
              Choose the package that fits your pregnancy journey. No hidden fees or contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Starter Plan */}
            <div className="bg-white border border-border rounded-[28px] p-8 flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative group">
              <div>
                <span className="text-[12px] font-bold tracking-[1px] uppercase text-medium">Starter</span>
                <h3 className="font-serif text-[28px] font-bold text-charcoal mt-2">Free Plan</h3>

                {/* Free Plan Price Display */}
                <div className="flex flex-col mt-4 mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[40px] font-serif font-bold text-charcoal">₹0</span>
                    <span className="text-[14px] text-medium">/ {freeMonths} {freeMonths === 1 ? 'month' : 'months'}</span>
                  </div>
                  <div className="text-[12px] text-medium italic mt-1">Always free for moms</div>
                </div>

                {/* Free Plan Slider */}
                <div className="my-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[12px] font-bold text-charcoal uppercase tracking-wider">Duration</label>
                    <span className="text-[13px] font-semibold bg-gray-100 dark:bg-white/10 text-medium px-2.5 py-0.5 rounded-full">
                      {freeMonths} {freeMonths === 1 ? 'Month' : 'Months'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={freeMonths}
                    onChange={(e) => setFreeMonths(Number(e.target.value))}
                    aria-label="Select free plan duration"
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-cream accent-medium [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-medium [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab"
                    style={{ background: `linear-gradient(to right, rgb(107,122,135) 0%, rgb(107,122,135) ${((freeMonths - 1) / 11) * 100}%, var(--color-cream, #fdfbf7) ${((freeMonths - 1) / 11) * 100}%, var(--color-cream, #fdfbf7) 100%)` }}
                  />
                  <div className="flex justify-between mt-1 text-[10px] text-medium font-bold">
                    <span>1m</span>
                    <span>3m</span>
                    <span>6m</span>
                    <span>9m</span>
                    <span>12m</span>
                  </div>
                </div>

                <p className="text-[14px] text-medium mb-6 leading-relaxed">Essential tracking tools for everyday updates, completely free.</p>
                <div className="h-px bg-border mb-6" />
                <ul className="space-y-3.5">
                  {[
                    "Basic pregnancy weekly tracker",
                    "Daily symptom logs & timeline",
                    "Kick counter & contraction timer",
                    "Hospital bag checklist",
                    "Offline-first sync capabilities"
                  ].map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-charcoal">
                      <CheckCircle2 size={16} className="text-sage mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="w-full mt-8 py-3.5 rounded-xl border-[1.5px] border-sage text-sage font-bold text-[14px] hover:bg-sage-pale transition-all active:scale-98"
              >
                Start Tracking Free
              </button>
            </div>

            {/* Standard Plan (Highlight) */}
            <div className="bg-white border-2 border-sage rounded-[28px] p-8 flex flex-col justify-between shadow-md hover:shadow-xl transition-all duration-300 relative group scale-102">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-sage text-white text-[11px] font-bold tracking-[1.5px] uppercase py-1 px-4 rounded-full shadow-sm">
                Most Popular
              </div>
              <div>
                <span className="text-[12px] font-bold tracking-[1px] uppercase text-sage">Maternal Care Pack</span>
                <h3 className="font-serif text-[28px] font-bold text-charcoal mt-2">Standard Plan</h3>

                {/* Standard Plan Price Display */}
                <div className="flex flex-col mt-4 mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[40px] font-serif font-bold text-charcoal">₹{199 * standardMonths - Math.floor(standardMonths / 3) * 50}</span>
                    <span className="text-[14px] text-medium">/ {standardMonths} {standardMonths === 1 ? 'month' : 'months'}</span>
                  </div>
                  {standardMonths >= 3 && (
                    <div className="text-[12px] font-bold text-green-600 dark:text-green-400 mt-1 flex items-center gap-1 animate-pulse">
                      <span>🏷️ Save ₹{Math.floor(standardMonths / 3) * 50}</span>
                    </div>
                  )}
                  {standardMonths > 1 && (
                    <div className="text-[12.5px] text-medium mt-0.5">
                      Equivalent to ₹{Math.round((199 * standardMonths - Math.floor(standardMonths / 3) * 50) / standardMonths)}/mo
                    </div>
                  )}
                </div>

                {/* Standard Plan Slider */}
                <div className="my-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[12px] font-bold text-sage uppercase tracking-wider">Duration</label>
                    <span className="text-[13px] font-semibold bg-sage-pale text-sage px-2.5 py-0.5 rounded-full border border-sage/20">
                      {standardMonths} {standardMonths === 1 ? 'Month' : 'Months'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={standardMonths}
                    onChange={(e) => setStandardMonths(Number(e.target.value))}
                    aria-label="Select standard plan duration"
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-cream accent-sage [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sage [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab"
                    style={{ background: `linear-gradient(to right, rgb(138,182,163) 0%, rgb(138,182,163) ${((standardMonths - 1) / 11) * 100}%, var(--color-cream, #fdfbf7) ${((standardMonths - 1) / 11) * 100}%, var(--color-cream, #fdfbf7) 100%)` }}
                  />
                  <div className="flex justify-between mt-1 text-[10px] text-medium font-bold">
                    <span>1m</span>
                    <span>3m</span>
                    <span>6m</span>
                    <span>9m</span>
                    <span>12m</span>
                  </div>
                </div>

                <p className="text-[14px] text-medium mb-6 leading-relaxed">Comprehensive tracking with complete medical guides & postpartum care.</p>
                <div className="h-px bg-border mb-6" />
                <ul className="space-y-3.5">
                  {[
                    "Everything in Free starter plan",
                    "Complete Medical tasks & vaccines tracker",
                    "Detailed Government Schemes guide",
                    "Postpartum & Early Parenthood support",
                    "Encrypted real-time Partner Sync"
                  ].map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-charcoal">
                      <CheckCircle2 size={16} className="text-sage mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="w-full mt-8 py-3.5 rounded-xl bg-sage text-white font-bold text-[14px] hover:bg-sage-dark transition-all shadow-md active:scale-98"
              >
                Upgrade to Standard
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-white border border-border rounded-[28px] p-8 flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative group">
              <div>
                <span className="text-[12px] font-bold tracking-[1px] uppercase text-gold">AI Ultimate</span>
                <h3 className="font-serif text-[28px] font-bold text-charcoal mt-2">Premium Plan</h3>

                {/* Premium Plan Price Display */}
                <div className="flex flex-col mt-4 mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[40px] font-serif font-bold text-charcoal">₹{499 * premiumMonths - Math.floor(premiumMonths / 3) * 50}</span>
                    <span className="text-[14px] text-medium">/ {premiumMonths} {premiumMonths === 1 ? 'month' : 'months'}</span>
                  </div>
                  {premiumMonths >= 3 && (
                    <div className="text-[12px] font-bold text-green-600 dark:text-green-400 mt-1 flex items-center gap-1 animate-pulse">
                      <span>🏷️ Save ₹{Math.floor(premiumMonths / 3) * 50}</span>
                    </div>
                  )}
                  {premiumMonths > 1 && (
                    <div className="text-[12.5px] text-medium mt-0.5">
                      Equivalent to ₹{Math.round((499 * premiumMonths - Math.floor(premiumMonths / 3) * 50) / premiumMonths)}/mo
                    </div>
                  )}
                </div>

                {/* Premium Plan Slider */}
                <div className="my-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[12px] font-bold text-gold uppercase tracking-wider">Duration</label>
                    <span className="text-[13px] font-semibold bg-gold-pale text-gold px-2.5 py-0.5 rounded-full border border-gold/20">
                      {premiumMonths} {premiumMonths === 1 ? 'Month' : 'Months'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={premiumMonths}
                    onChange={(e) => setPremiumMonths(Number(e.target.value))}
                    aria-label="Select premium plan duration"
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-cream accent-gold [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab"
                    style={{ background: `linear-gradient(to right, rgb(244,162,97) 0%, rgb(244,162,97) ${((premiumMonths - 1) / 11) * 100}%, var(--color-cream, #fdfbf7) ${((premiumMonths - 1) / 11) * 100}%, var(--color-cream, #fdfbf7) 100%)` }}
                  />
                  <div className="flex justify-between mt-1 text-[10px] text-medium font-bold">
                    <span>1m</span>
                    <span>3m</span>
                    <span>6m</span>
                    <span>9m</span>
                    <span>12m</span>
                  </div>
                </div>

                <p className="text-[14px] text-medium mb-6 leading-relaxed">Full access to advanced AI support tools & clinical report exports.</p>
                <div className="h-px bg-border mb-6" />
                <ul className="space-y-3.5">
                  {[
                    "Everything in Standard plan",
                    "Bloom AI prenatal chatbot support 24/7",
                    "AI-powered Food Safety Scanner",
                    "FHIR R4 EHR Doctor Report Exports",
                    "Priority feature request channel"
                  ].map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-charcoal">
                      <CheckCircle2 size={16} className="text-gold mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="w-full mt-8 py-3.5 rounded-xl bg-charcoal text-cream font-bold text-[14px] hover:opacity-90 transition-all shadow-md active:scale-98"
              >
                Go Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-center py-6">
        <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-border to-transparent" />
        <span className="mx-4 text-sage/40 text-[10px] tracking-[4px] uppercase font-bold">Privacy</span>
        <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Privacy Section */}
      <section className="max-w-[800px] mx-auto px-6 py-16 md:py-24 text-center">
        <h2 className="font-serif text-4xl text-charcoal mb-4">Core features, always free.</h2>
        <p className="text-medium text-[16px] mb-10">We believe every mother deserves access to tools that make pregnancy safer and less stressful. Tracking, vitals, tasks, and more — free, always.</p>
        <button type="button" onClick={handleStart} className="py-4 px-10 rounded-full bg-sage text-white font-bold text-[16px] hover:bg-sage-dark transition-colors shadow-lg">
          Start Tracking Now
        </button>
      </section>

      {/* Section Divider */}
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-center py-6">
        <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-border to-transparent" />
        <span className="mx-4 text-sage/40 text-[10px] tracking-[4px] uppercase font-bold">Reviews</span>
        <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Testimonials */}
      <section className="bg-white px-6 py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl text-charcoal mb-2">Trusted by expectant mothers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {[
              { review: "I love how personal it feels — everything is tailored to my pregnancy week and my situation.", author: "Priya M.", loc: "Mumbai" },
              { review: "The kick counter works perfectly. Simple, fast, exactly what I needed when my doctor asked me to track.", author: "Kavitha R.", loc: "Bangalore" },
              { review: "The core features are free and work even when I'm travelling. Such a blessing!", author: "Anjali S.", loc: "Delhi" },
              { review: "The AI food scanner saved me so much anxiety during my babymoon in Goa. Highly recommend!", author: "Sneha P.", loc: "Goa" },
              { review: "Finally an app that understands local contexts and government schemes.", author: "Divya K.", loc: "Chennai" },
              { review: "The vaccination reminders and daily tips kept me so reassured. A must-have for every expectant mom!", author: "Meera J.", loc: "Pune" }
            ].map((t, i) => (
              <div key={i} className="bg-cream p-8 rounded-[20px] relative shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
                <div>
                  <div className="absolute top-6 right-6 text-sage/20 font-serif text-6xl leading-none">"</div>
                  <p className="text-[15px] text-charcoal leading-relaxed mb-6 italic relative z-10">"{t.review}"</p>
                </div>
                <div className="flex items-center gap-3 mt-auto">
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
              <span className="font-serif text-[24px] font-semibold text-sage tracking-wide notranslate">Our Pregnancy</span>
            </div>
            <p className="text-[14px] text-light">Made with ❤️ for expectant mothers</p>
          </div>

          <div className="flex flex-col md:flex-row md:justify-end gap-4 md:gap-8 text-[14px] text-light">
            <a href="/team" onClick={(e) => { e.preventDefault(); navigate('/team'); }} className="hover:text-white transition-colors">Meet the Team</a>
            <a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }} className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }} className="hover:text-white transition-colors">Terms of Service</a>
            <a href="mailto:support@ourpregnancy.in" onClick={(e) => handleEmailClick("support@ourpregnancy.in", e)} className="hover:text-white transition-colors">support@ourpregnancy.in</a>
          </div>
        </div>

        <div className="flex justify-center items-center gap-2 text-[13px] text-light/70">
          <Lock className="w-4 h-4" />
          Your data is encrypted and only accessible by you.
        </div>
      </footer>

      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-[100] bg-charcoal text-white px-5 py-3 rounded-[12px] shadow-lg flex items-center gap-2 text-sm font-semibold animate-in slide-in-from-bottom-5 duration-300 border border-light/20">
          <span>📋</span> {toastMessage}
        </div>
      )}

    </div>
  );
};
