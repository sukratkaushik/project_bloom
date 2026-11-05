import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  // Lock background body scrolling when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

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

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-charcoal/70 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="bg-white rounded-[26px] max-w-[480px] w-full p-5 sm:p-6 shadow-2xl relative border border-sage/20 text-charcoal my-auto animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col overflow-y-auto custom-scrollbar"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-medium hover:text-charcoal transition-colors rounded-full hover:bg-cream cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* -------------------- STATE: CELEBRATION / ACTIVATED -------------------- */}
        {isActivated ? (
          <div className="text-center py-2 space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-md">
              <CheckCircle2 size={38} className="animate-bounce" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 mb-2">
                🎉 Synced in Real Time
              </span>
              <h3 className="font-serif text-[24px] sm:text-[27px] font-bold text-charcoal">
                Welcome to Our Pregnancy Pro!
              </h3>
              <p className="text-[13px] text-medium mt-1.5 max-w-sm mx-auto leading-relaxed">
                Your subscription has been verified. All 24/7 AI obstetrician features, food safety scanning, and EHR exports are now unlocked on this screen.
              </p>
            </div>

            <div className="p-3.5 bg-cream/70 rounded-2xl border border-sage/20 text-left space-y-2 text-[12.5px]">
              <div className="flex items-center gap-2 text-charcoal font-semibold">
                <Check size={15} className="text-sage-dark shrink-0" />
                <span>Active on Web, Android, and iOS</span>
              </div>
              <div className="flex items-center gap-2 text-charcoal font-semibold">
                <Check size={15} className="text-sage-dark shrink-0" />
                <span>Unlimited 24/7 Ask OPIN AI Obstetrician</span>
              </div>
              <div className="flex items-center gap-2 text-charcoal font-semibold">
                <Check size={15} className="text-sage-dark shrink-0" />
                <span>Encrypted Partner Sync &amp; Doctor EHR Vault</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-xl bg-sage text-white font-bold text-[14.5px] hover:bg-sage-dark shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>✦ Enter Pro Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          /* -------------------- STATE: SCAN & UPGRADE -------------------- */
          <div className="space-y-4">
            {/* Header */}
            <div className="text-center space-y-1.5 pt-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-sage-pale text-sage-dark border border-sage/25">
                <Sparkles size={12} className="text-sage" />
                <span>Unified Mobile Subscription</span>
              </div>
              <h2 id="upgrade-modal-title" className="font-serif text-[22px] sm:text-[25px] font-bold text-charcoal leading-snug">
                Unlock Our Pregnancy Pro
              </h2>
              <p className="text-[12.5px] sm:text-[13px] text-medium max-w-md mx-auto leading-relaxed">
                Subscribe with 1 tap via the Apple App Store or Google Play Store. Your Pro benefits automatically sync across all your devices, including this web browser.
              </p>
            </div>

            {/* Platform Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-cream/60 p-1 rounded-2xl border border-border/80">
              <button
                type="button"
                onClick={() => setActivePlatform('apple')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold text-[12.5px] sm:text-[13px] transition-all cursor-pointer ${
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
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold text-[12.5px] sm:text-[13px] transition-all cursor-pointer ${
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
              <div className="py-1 space-y-3.5 text-center">
                <div className="p-3.5 bg-cream/50 rounded-2xl border border-sage/20 text-left space-y-2">
                  <div className="flex items-center gap-2 text-[12.5px] font-semibold text-charcoal">
                    <Smartphone size={15} className="text-sage" />
                    <span>Mobile Device Detected</span>
                  </div>
                  <p className="text-[12px] text-medium leading-relaxed">
                    Tap below to open the official app directly on your phone and subscribe with 1-tap using {activePlatform === 'apple' ? 'Face ID / Apple Pay' : 'Google Play / UPI'}.
                  </p>
                </div>

                <a
                  href={currentStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3.5 px-5 rounded-xl font-bold text-[14.5px] shadow-md transition-all flex items-center justify-center gap-2.5 text-white ${
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
                  <ExternalLink size={15} />
                </a>
              </div>
            ) : (
              /* Desktop Screen: High-Res SVG QR Code */
              <div className="flex flex-col items-center justify-center py-1 space-y-3">
                <div className="p-3.5 bg-white rounded-[20px] border-2 border-sage/30 shadow-sm flex items-center justify-center relative group">
                  <QRCodeSVG
                    value={currentStoreUrl}
                    size={155}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: "/logo.png",
                      x: undefined,
                      y: undefined,
                      height: 34,
                      width: 34,
                      excavate: true,
                    }}
                  />
                </div>

                {/* Step Instructions */}
                <div className="w-full grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-cream/50 rounded-xl border border-border/60">
                    <span className="w-4 h-4 rounded-full bg-sage text-white text-[10px] font-bold flex items-center justify-center mx-auto mb-1">1</span>
                    <p className="text-[10.5px] text-charcoal font-medium leading-tight">Scan with Phone Camera</p>
                  </div>
                  <div className="p-2 bg-cream/50 rounded-xl border border-border/60">
                    <span className="w-4 h-4 rounded-full bg-sage text-white text-[10px] font-bold flex items-center justify-center mx-auto mb-1">2</span>
                    <p className="text-[10.5px] text-charcoal font-medium leading-tight">1-Tap Subscribe on Store</p>
                  </div>
                  <div className="p-2 bg-cream/50 rounded-xl border border-border/60">
                    <span className="w-4 h-4 rounded-full bg-sage text-white text-[10px] font-bold flex items-center justify-center mx-auto mb-1">3</span>
                    <p className="text-[10.5px] text-charcoal font-medium leading-tight">Auto-Unlocks on Desktop</p>
                  </div>
                </div>
              </div>
            )}

            {/* Live Firestore Polling / Listener Badge */}
            <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl flex items-center justify-between gap-2 text-[11.5px] text-emerald-900 font-medium">
              <div className="flex items-center gap-2 min-w-0">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="truncate">Listening for mobile subscription in real-time...</span>
              </div>

              <button
                type="button"
                onClick={handleManualSyncCheck}
                disabled={isCheckingStatus}
                className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isCheckingStatus ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <RefreshCw size={11} />
                )}
                <span>Check Status</span>
              </button>
            </div>

            {/* Footer Actions: Copy Link & Security */}
            <div className="pt-2 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11.5px] text-medium">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 hover:text-charcoal transition-colors cursor-pointer"
              >
                {copiedLink ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copiedLink ? 'Store link copied!' : 'Copy direct store link'}</span>
              </button>

              <div className="flex items-center gap-1 text-[10.5px] text-light">
                <ShieldCheck size={12} className="text-sage" />
                <span>Verified by Apple &amp; Google</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
