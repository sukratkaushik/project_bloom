import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  Sparkles, 
  Check, 
  Smartphone, 
  ArrowRight, 
  Copy, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { usePlanner } from '../store';
import { AppleIcon } from './common/AppleIcon';
import { isApplePlatform, isNativeApp } from '../utils/nativeBridge';

interface CrossPlatformUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStore?: 'apple' | 'google';
}

export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=in.ourpregnancy.bloom";
export const APP_STORE_URL = "https://apps.apple.com/app/id6741498877";

export const CrossPlatformUpgradeModal: React.FC<CrossPlatformUpgradeModalProps> = ({
  isOpen,
  onClose,
  defaultStore
}) => {
  const { state, updateState } = usePlanner();
  const isApple = isApplePlatform();
  const isNative = isNativeApp();

  const [activePlatform, setActivePlatform] = useState<'apple' | 'google'>(
    defaultStore || (isApple ? 'apple' : 'google')
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  // Responsive device check for mobile web browsers
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set default platform based on device if not specified
  useEffect(() => {
    if (!defaultStore) {
      setActivePlatform(isApple ? 'apple' : 'google');
    }
  }, [isApple, defaultStore]);

  // Real-time Firestore Listener for Instant Desktop Activation Handshake
  useEffect(() => {
    if (!isOpen) return;

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Check if user is already pro
    if (state.isPremium || state.planTier === 'premium' || (state.planTier as string) === 'pro') {
      setIsActivated(true);
      return;
    }

    // Attach real-time snapshot listener
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const isPro = Boolean(
            data?.isPremium || 
            data?.planTier === 'premium' || 
            data?.planTier === 'pro'
          );

          if (isPro) {
            setIsActivated(true);
            updateState({
              isPremium: true,
              planTier: 'premium',
              planExpiry: data?.planExpiry || null
            });
          }
        }
      },
      (error) => {
        console.warn('[CrossPlatformUpgradeModal] Snapshot listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [isOpen, state.isPremium, state.planTier, updateState]);

  if (!isOpen) return null;

  const currentStoreUrl = activePlatform === 'apple' ? APP_STORE_URL : PLAY_STORE_URL;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentStoreUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleManualSyncCheck = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setIsCheckingStatus(true);
    try {
      // Re-trigger auth & local checks
      if (state.isPremium || state.planTier === 'premium' || (state.planTier as string) === 'pro') {
        setIsActivated(true);
      }
    } finally {
      setTimeout(() => setIsCheckingStatus(false), 800);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center bg-charcoal/70 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="bg-white rounded-[28px] max-w-[520px] w-full p-6 sm:p-8 shadow-2xl relative border border-sage/20 text-charcoal my-auto animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-medium hover:text-charcoal transition-colors rounded-full hover:bg-cream cursor-pointer"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* -------------------- STATE: CELEBRATION / ACTIVATED -------------------- */}
        {isActivated ? (
          <div className="text-center py-4 space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-md">
              <CheckCircle2 size={44} className="animate-bounce" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 mb-2">
                🎉 Synced in Real Time
              </span>
              <h3 className="font-serif text-[26px] sm:text-[30px] font-bold text-charcoal">
                Welcome to Our Pregnancy Pro!
              </h3>
              <p className="text-[14px] text-medium mt-2 max-w-sm mx-auto leading-relaxed">
                Your subscription has been verified. All 24/7 AI obstetrician features, food safety scanning, and EHR exports are now unlocked on this screen.
              </p>
            </div>

            <div className="p-4 bg-cream/70 rounded-2xl border border-sage/20 text-left space-y-2 text-[13px]">
              <div className="flex items-center gap-2 text-charcoal font-semibold">
                <Check size={16} className="text-sage-dark shrink-0" />
                <span>Active on Web, Android, and iOS</span>
              </div>
              <div className="flex items-center gap-2 text-charcoal font-semibold">
                <Check size={16} className="text-sage-dark shrink-0" />
                <span>Unlimited 24/7 Ask OPIN AI Obstetrician</span>
              </div>
              <div className="flex items-center gap-2 text-charcoal font-semibold">
                <Check size={16} className="text-sage-dark shrink-0" />
                <span>Encrypted Partner Sync &amp; Doctor EHR Vault</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-4 rounded-xl bg-sage text-white font-bold text-[15px] hover:bg-sage-dark shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>✦ Enter Pro Dashboard</span>
              <ArrowRight size={17} />
            </button>
          </div>
        ) : (
          /* -------------------- STATE: SCAN & UPGRADE -------------------- */
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sage-pale text-sage-dark border border-sage/25">
                <Sparkles size={13} className="text-sage" />
                <span>Unified Mobile Subscription</span>
              </div>
              <h2 id="upgrade-modal-title" className="font-serif text-[24px] sm:text-[27px] font-bold text-charcoal leading-snug">
                Unlock Our Pregnancy Pro
              </h2>
              <p className="text-[13px] sm:text-[14px] text-medium max-w-md mx-auto leading-relaxed">
                Subscribe with 1 tap via the Apple App Store or Google Play Store. Your Pro benefits automatically sync across all your devices, including this web browser.
              </p>
            </div>

            {/* Platform Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-cream/60 p-1.5 rounded-2xl border border-border/80">
              <button
                type="button"
                onClick={() => setActivePlatform('apple')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-[13px] sm:text-[13.5px] transition-all cursor-pointer ${
                  activePlatform === 'apple'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-medium hover:text-charcoal hover:bg-white/60'
                }`}
              >
                <AppleIcon className={`w-4 h-4 ${activePlatform === 'apple' ? 'text-white' : 'text-charcoal'}`} />
                <span>Apple iOS</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePlatform('google')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-[13px] sm:text-[13.5px] transition-all cursor-pointer ${
                  activePlatform === 'google'
                    ? 'bg-sage text-white shadow-sm'
                    : 'text-medium hover:text-charcoal hover:bg-white/60'
                }`}
              >
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google Play" 
                  className="w-4 h-4 bg-white rounded-full p-0.5" 
                />
                <span>Google Play</span>
              </button>
            </div>

            {/* Content: Desktop QR Code View vs Mobile Web 1-Tap CTA */}
            {isMobileScreen ? (
              /* Mobile Screen 1-Tap Direct Deep Link */
              <div className="py-2 space-y-4 text-center">
                <div className="p-4 bg-cream/50 rounded-2xl border border-sage/20 text-left space-y-2.5">
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-charcoal">
                    <Smartphone size={16} className="text-sage" />
                    <span>Mobile Device Detected</span>
                  </div>
                  <p className="text-[12.5px] text-medium leading-relaxed">
                    Tap below to open the official app directly on your phone and subscribe with 1-tap using {activePlatform === 'apple' ? 'Face ID / Apple Pay' : 'Google Play / UPI'}.
                  </p>
                </div>

                <a
                  href={currentStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-4 px-6 rounded-xl font-bold text-[15px] shadow-md transition-all flex items-center justify-center gap-2.5 text-white ${
                    activePlatform === 'apple' ? 'bg-black hover:bg-neutral-800' : 'bg-sage hover:bg-sage-dark'
                  }`}
                >
                  {activePlatform === 'apple' ? (
                    <>
                      <AppleIcon className="w-5 h-5 text-white" />
                      <span>Open on Apple App Store</span>
                    </>
                  ) : (
                    <>
                      <img 
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                        alt="Google" 
                        className="w-5 h-5 bg-white rounded-full p-0.5" 
                      />
                      <span>Open on Google Play Store</span>
                    </>
                  )}
                  <ExternalLink size={16} />
                </a>
              </div>
            ) : (
              /* Desktop Screen: High-Res SVG QR Code */
              <div className="flex flex-col items-center justify-center py-2 space-y-4">
                <div className="p-4 bg-white rounded-[22px] border-2 border-sage/30 shadow-md flex items-center justify-center relative group">
                  <QRCodeSVG
                    value={currentStoreUrl}
                    size={180}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: "/logo.png",
                      x: undefined,
                      y: undefined,
                      height: 38,
                      width: 38,
                      excavate: true,
                    }}
                  />
                </div>

                {/* Step Instructions */}
                <div className="w-full grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2.5 bg-cream/50 rounded-xl border border-border/60">
                    <span className="w-5 h-5 rounded-full bg-sage text-white text-[10.5px] font-bold flex items-center justify-center mx-auto mb-1">1</span>
                    <p className="text-[11px] text-charcoal font-medium leading-tight">Scan with Phone Camera</p>
                  </div>
                  <div className="p-2.5 bg-cream/50 rounded-xl border border-border/60">
                    <span className="w-5 h-5 rounded-full bg-sage text-white text-[10.5px] font-bold flex items-center justify-center mx-auto mb-1">2</span>
                    <p className="text-[11px] text-charcoal font-medium leading-tight">1-Tap Subscribe on Store</p>
                  </div>
                  <div className="p-2.5 bg-cream/50 rounded-xl border border-border/60">
                    <span className="w-5 h-5 rounded-full bg-sage text-white text-[10.5px] font-bold flex items-center justify-center mx-auto mb-1">3</span>
                    <p className="text-[11px] text-charcoal font-medium leading-tight">Auto-Unlocks on Desktop</p>
                  </div>
                </div>
              </div>
            )}

            {/* Live Firestore Polling / Listener Badge */}
            <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl flex items-center justify-between gap-2 text-[12px] text-emerald-900 font-medium">
              <div className="flex items-center gap-2 min-w-0">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="truncate">Listening for mobile subscription in real-time...</span>
              </div>

              <button
                type="button"
                onClick={handleManualSyncCheck}
                disabled={isCheckingStatus}
                className="text-[11.5px] font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isCheckingStatus ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <RefreshCw size={12} />
                )}
                <span>Check Status</span>
              </button>
            </div>

            {/* Footer Actions: Copy Link & Security */}
            <div className="pt-2 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-medium">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 hover:text-charcoal transition-colors cursor-pointer"
              >
                {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copiedLink ? 'Store link copied!' : 'Copy direct store link'}</span>
              </button>

              <div className="flex items-center gap-1 text-[11px] text-light">
                <ShieldCheck size={13} className="text-sage" />
                <span>Verified by Apple &amp; Google</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
