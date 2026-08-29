import React, { useState } from 'react';
import { User, signOut, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase';
import { MailCheck, CheckCircle2, RefreshCw, AlertCircle, LogOut, Send, ShieldCheck } from 'lucide-react';
import { navigate } from '../utils/navigation';

interface Props {
  user: User;
  onVerified?: () => void;
}

export const EmailVerificationGate: React.FC<Props> = ({ user, onVerified }) => {
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCheckStatus = async () => {
    setChecking(true);
    setErrorMsg(null);
    try {
      // Force reload auth token to fetch latest emailVerified flag from Firebase servers
      await user.reload();
      if (auth.currentUser?.emailVerified) {
        if (onVerified) {
          onVerified();
        } else {
          window.location.reload();
        }
      } else {
        setErrorMsg("Email not verified yet. Please click the link in your email, then check again.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to check status. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleResendLink = async () => {
    setResending(true);
    setErrorMsg(null);
    setResendSuccess(false);
    try {
      const actionCodeSettings = {
        url: window.location.origin + '/#login',
        handleCodeInApp: false,
      };
      await sendEmailVerification(user, actionCodeSettings);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 8000);
    } catch (err: any) {
      if (err?.code === 'auth/too-many-requests') {
        setErrorMsg("Too many requests. Please wait a few moments before requesting another link.");
      } else {
        setErrorMsg(err?.message || "Could not resend email. Please try again.");
      }
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
        <div className="w-16 h-16 bg-sage-pale text-sage rounded-full flex items-center justify-center mb-6 shadow-sm mx-auto">
          <MailCheck size={32} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-3">
          <ShieldCheck size={13} />
          Verification Required
        </div>

        <h1 className="font-serif text-[24px] md:text-[26px] font-bold text-charcoal mb-2">
          Verify your email address
        </h1>

        <p className="text-[13.5px] text-medium mb-6 leading-relaxed">
          To protect your pregnancy journey and sensitive health records, email verification is required before opening your dashboard.
        </p>

        <div className="bg-cream/70 border border-border rounded-xl p-3.5 mb-6 text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-light block mb-0.5">
            Verification link sent to:
          </span>
          <span className="font-semibold text-[14px] text-charcoal break-all">
            {user.email || 'your registered email'}
          </span>
        </div>

        {errorMsg && (
          <div className="flex items-start gap-2 p-3 bg-red-50/90 border border-red-200 rounded-xl text-critical text-[12.5px] font-medium text-left mb-4">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {resendSuccess && (
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-[12.5px] font-medium text-left mb-4">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-green-600" />
            <span>A fresh verification link has been sent to your email. Check your inbox and spam folder.</span>
          </div>
        )}

        <div className="space-y-3">
          {/* Check Verification Status Button */}
          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full bg-charcoal hover:bg-black text-cream rounded-[12px] font-bold py-3 text-[14px] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {checking ? (
              <>
                <RefreshCw size={16} className="animate-spin" /> Checking Status...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} /> I've Clicked the Link (Check Again)
              </>
            )}
          </button>

          {/* Resend Link Button */}
          <button
            type="button"
            onClick={handleResendLink}
            disabled={resending}
            className="w-full border-[1.5px] border-border text-charcoal hover:bg-cream rounded-[12px] font-semibold py-2.5 text-[13.5px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {resending ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> Sending...
              </>
            ) : (
              <>
                <Send size={14} /> Resend Verification Link
              </>
            )}
          </button>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full text-light hover:text-charcoal py-2 text-[12.5px] font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <LogOut size={13} /> Sign Out / Use Another Account
          </button>
        </div>

        <p className="text-[11px] text-light mt-6 italic">
          💡 Can't find the email? Check your junk or spam folder. Verification links usually arrive in under 60 seconds.
        </p>
      </div>
    </div>
  );
};
