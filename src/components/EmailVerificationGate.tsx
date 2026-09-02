import React, { useState } from 'react';
import { User, signOut } from 'firebase/auth';
import { auth, verifyOtpCallable, sendVerificationOtpCallable } from '../firebase';
import { ShieldCheck, CheckCircle2, RefreshCw, AlertCircle, LogOut, Send, Loader2 } from 'lucide-react';
import { navigate } from '../utils/navigation';

interface Props {
  user: User;
  onVerified?: () => void;
}

export const EmailVerificationGate: React.FC<Props> = ({ user, onVerified }) => {
  const [otpInput, setOtpInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = otpInput.trim();
    if (cleanCode.length !== 6) {
      setErrorMsg("Please enter all 6 digits.");
      return;
    }
    setVerifying(true);
    setErrorMsg(null);
    try {
      if (!user.email) {
        throw new Error("No user email found.");
      }
      await verifyOtpCallable(user.email, cleanCode);
      await user.reload();
      if (onVerified) {
        onVerified();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Invalid or expired verification code. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending || !user.email) return;
    setResending(true);
    setErrorMsg(null);
    setResendSuccess(false);
    try {
      await sendVerificationOtpCallable(user.email, user.displayName || undefined, user.uid);
      setResendSuccess(true);
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
      setTimeout(() => setResendSuccess(false), 8000);
    } catch (err: any) {
      setErrorMsg(err?.message || "Could not resend verification code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 selection:bg-sage-pale selection:text-sage-dark">
      <div className="bg-white rounded-[28px] p-8 md:p-10 w-full max-w-[480px] shadow-2xl border border-border text-center animate-in zoom-in-95 duration-200">
        {/* Brand Icon */}
        <div className="w-16 h-16 bg-sage-pale text-sage rounded-full flex items-center justify-center mb-5 shadow-sm mx-auto">
          <ShieldCheck size={32} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-2">
          Verification Required
        </div>

        <h1 className="font-serif text-[24px] md:text-[26px] font-bold text-charcoal mb-2">
          Verify your email
        </h1>

        <p className="text-[13.5px] text-medium mb-5 leading-relaxed">
          Please enter the 6-digit verification code sent to<br />
          <strong className="text-charcoal font-semibold break-all">{user.email || 'your registered email'}</strong>
        </p>

        <form onSubmit={handleVerifyOtp} className="space-y-4 mb-6">
          <div>
            <label className="text-[11px] font-bold tracking-[1px] uppercase text-charcoal mb-1.5 block text-center">
              6-Digit Security Code
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
                setErrorMsg(null);
              }}
              placeholder="••••••"
              className="w-full text-center font-mono text-[28px] font-bold tracking-[12px] py-2.5 px-4 bg-cream/60 border-[2px] border-border focus:border-sage rounded-xl focus:outline-none focus:ring-1 focus:ring-sage transition-all placeholder:tracking-[8px]"
              autoFocus
              required
            />
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 p-3 bg-red-50/90 border border-red-200 rounded-xl text-critical text-[12.5px] font-medium text-left">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {resendSuccess && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-[12.5px] font-medium text-left">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-green-600" />
              <span>New 6-digit code sent! Check your inbox and spam folder.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={verifying || otpInput.length !== 6}
            className="w-full bg-charcoal hover:bg-black text-cream dark:hover:bg-slate-200 dark:hover:text-slate-900 rounded-[12px] font-bold py-3 text-[14px] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {verifying ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Verifying...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} /> Verify & Activate Account
              </>
            )}
          </button>
        </form>

        <div className="space-y-3 pt-1 border-t border-border/60">
          {/* Resend OTP Button */}
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending || resendCooldown > 0}
            className="w-full border-[1.5px] border-border text-charcoal hover:bg-cream rounded-[12px] font-semibold py-2.5 text-[13px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {resending ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> Sending...
              </>
            ) : resendCooldown > 0 ? (
              `Resend code in ${resendCooldown}s`
            ) : (
              <>
                <Send size={14} /> Resend 6-Digit Code
              </>
            )}
          </button>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full text-light hover:text-charcoal py-2 text-[12.5px] font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut size={13} /> Sign Out / Use Another Account
          </button>
        </div>

        <p className="text-[11px] text-light mt-6 italic">
          💡 The verification code is valid for 10 minutes. If you don't receive it, please check your spam folder.
        </p>
      </div>
    </div>
  );
};
