import React, { useState, useEffect } from 'react';
import { Fingerprint, ScanFace, Lock, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { authenticateWithBiometrics, checkBiometricSupport, BiometricStatus } from '../utils/biometricService';

interface BiometricSecurityOverlayProps {
  isLocked: boolean;
  onUnlocked: () => void;
}

export const BiometricSecurityOverlay: React.FC<BiometricSecurityOverlayProps> = ({
  isLocked,
  onUnlocked,
}) => {
  const [bioStatus, setBioStatus] = useState<BiometricStatus | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    checkBiometricSupport().then(setBioStatus);
  }, []);

  const triggerAuth = async () => {
    setIsAuthenticating(true);
    setErrorMessage(null);
    try {
      const res = await authenticateWithBiometrics('Confirm identity to unlock maternal health records');
      if (res.success) {
        onUnlocked();
      } else {
        setErrorMessage(res.error || 'Authentication was not completed.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Biometric authentication failed.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Automatically trigger on mount if locked
  useEffect(() => {
    if (isLocked) {
      triggerAuth();
    }
  }, [isLocked]);

  if (!isLocked) return null;

  const mode = bioStatus?.preferredMode || 'auto';

  return (
    <div className="fixed inset-0 z-[99999] bg-[#FAF8F5] flex flex-col items-center justify-between p-8 text-center animate-in fade-in duration-300">
      {/* Top branding */}
      <div className="pt-12 flex flex-col items-center">
        <div className="w-16 h-16 rounded-3xl bg-sage-pale flex items-center justify-center mb-3 shadow-inner">
          <ShieldCheck className="w-8 h-8 text-sage" />
        </div>
        <h1 className="font-serif text-2xl text-charcoal font-bold tracking-tight">Our Pregnancy</h1>
        <p className="text-[13px] text-charcoal/60 font-medium tracking-wide uppercase mt-1">Maternal Privacy Shield</p>
      </div>

      {/* Center Biometric Orb */}
      <div className="flex flex-col items-center max-w-xs">
        <div 
          onClick={triggerAuth}
          className="relative w-28 h-28 rounded-full bg-white shadow-xl border border-sage/20 flex items-center justify-center cursor-pointer active:scale-95 transition-transform hover:shadow-2xl"
          title="Tap to authenticate"
        >
          <div className="absolute inset-0 bg-sage-light/20 rounded-full animate-ping opacity-30" style={{ animationDuration: '3s' }} />
          {mode === 'face' ? (
            <ScanFace className="w-14 h-14 text-sage stroke-[1.5]" />
          ) : mode === 'fingerprint' ? (
            <Fingerprint className="w-14 h-14 text-sage stroke-[1.5]" />
          ) : (
            <ShieldCheck className="w-14 h-14 text-sage stroke-[1.5]" />
          )}
        </div>

        <h2 className="font-serif text-xl text-charcoal font-bold mt-6">
          App Locked
        </h2>
        <p className="text-[14px] text-charcoal/70 mt-2 leading-relaxed">
          {mode === 'face'
            ? 'Your pregnancy vitals and health records are protected by Face ID / Face Unlock.'
            : mode === 'fingerprint'
            ? 'Your pregnancy vitals and health records are protected by Fingerprint biometric lock.'
            : 'Your pregnancy vitals and health records are protected by hardware-backed biometrics & device credentials.'}
        </p>

        {errorMessage && (
          <p className="mt-4 text-xs text-red-600 bg-red-50 py-1.5 px-3 rounded-lg border border-red-100">
            {errorMessage}
          </p>
        )}
      </div>

      {/* Bottom Action */}
      <div className="w-full max-w-sm pb-8 space-y-3">
        <button
          type="button"
          onClick={triggerAuth}
          disabled={isAuthenticating}
          className="w-full py-4 bg-sage text-white font-semibold rounded-2xl shadow-md hover:bg-sage-dark transition-all flex items-center justify-center gap-2 text-[15px] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
        >
          {isAuthenticating ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {mode === 'face' ? (
                <ScanFace className="w-5 h-5" />
              ) : mode === 'fingerprint' ? (
                <Fingerprint className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
              <span>Unlock with {bioStatus?.label || 'Biometrics / PIN'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-[11px] text-charcoal/50">
          Supports Face Unlock, Fingerprint & Device PIN fallback
        </p>
      </div>
    </div>
  );
};
