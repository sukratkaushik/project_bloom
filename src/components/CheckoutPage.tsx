import React, { useState, useEffect } from 'react';
import { usePlanner } from '../store';
import { httpsCallable } from 'firebase/functions';
import { functions, auth, db, updateUserSubscription } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Loader2, 
  Tag, 
  Heart, 
  CheckCircle2, 
  Smartphone, 
  Copy, 
  RefreshCw,
  ExternalLink 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Header } from './Header';
import { Footer } from './Footer';
import { navigate } from '../utils/navigation';
import { isNativeApp, isApplePlatform } from '../utils/nativeBridge';
import { AppleIcon } from './common/AppleIcon';
import { APP_STORE_URL, PLAY_STORE_URL } from './CrossPlatformUpgradeModal';

export const CheckoutPage: React.FC = () => {
  const { state, updateState, toggleDarkMode } = usePlanner();
  const isApple = isApplePlatform();

  useEffect(() => {
    if (isNativeApp()) {
      navigate('/dashboard');
    }
  }, []);

  if (isNativeApp()) {
    return null;
  }

  const getInitialCoupon = () => {
    try {
      const search = window.location.search || (window.location.hash.includes('?') ? '?' + window.location.hash.split('?')[1] : '');
      const params = new URLSearchParams(search);
      return params.get('coupon') || '';
    } catch {
      return '';
    }
  };

  const [activePlatform, setActivePlatform] = useState<'apple' | 'google'>(isApple ? 'apple' : 'google');
  const [couponCode, setCouponCode] = useState(getInitialCoupon());
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplyingFreePass, setIsApplyingFreePass] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  // Responsive device check for mobile web
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Real-time Firestore Listener for Instant Desktop Activation Handshake
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    if (state.isPremium || state.planTier === 'premium' || (state.planTier as string) === 'pro') {
      setIsActivated(true);
      return;
    }

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
        console.warn('[CheckoutPage] Snapshot listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [state.isPremium, state.planTier, updateState]);

  const currentStoreUrl = activePlatform === 'apple' ? APP_STORE_URL : PLAY_STORE_URL;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentStoreUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleApplyFreePromoPass = async () => {
    setCouponError('');
    setCouponSuccess('');
    const cleanedCode = couponCode.trim().toUpperCase();

    if (!cleanedCode) {
      setCouponError('Please enter a VIP promo code.');
      return;
    }

    if (cleanedCode === 'OPIN30' || cleanedCode === 'VIPCARE90' || cleanedCode === 'BLOOM30') {
      if (!auth.currentUser) {
        setCouponError('Please sign in or create an account first to claim your promo access.');
        return;
      }

      setIsApplyingFreePass(true);
      try {
        const freeMonths = (cleanedCode === 'VIPCARE90') ? 3 : 1;
        const expiryTimestamp = Date.now() + freeMonths * 30 * 24 * 60 * 60 * 1000;
        const expiryIso = new Date(expiryTimestamp).toISOString();

        await updateUserSubscription(auth.currentUser.uid, 'premium', freeMonths);

        updateState({
          planTier: 'premium',
          isPremium: true,
          premiumPlan: freeMonths >= 12 ? 'annual' : 'monthly',
          planExpiry: expiryTimestamp,
          premiumExpiry: expiryIso,
        });

        setIsActivated(true);
        setCouponSuccess(`Promo code ${cleanedCode} applied! Free Pro membership activated.`);

        // Dispatch promo confirmation email to user's inbox
        try {
          const sendPromoEmail = httpsCallable(functions, 'sendPromoActivationEmail');
          sendPromoEmail({ promoCode: cleanedCode, planTier: 'premium', durationMonths: freeMonths })
            .catch((e) => console.warn('[PROMO EMAIL WARNING]:', e));
        } catch (emailErr) {
          console.warn('[PROMO EMAIL TRIGGER FAILED]:', emailErr);
        }
      } catch (err: any) {
        console.error("Free pass activation failed:", err);
        setCouponError(`Could not activate promo pass: ${err.message || 'Please try again.'}`);
      } finally {
        setIsApplyingFreePass(false);
      }
      return;
    }

    setCouponError('Invalid promo code. For subscriptions, please scan with your phone below.');
  };

  const handleManualSyncCheck = () => {
    setIsCheckingStatus(true);
    setTimeout(() => {
      if (state.isPremium || state.planTier === 'premium' || (state.planTier as string) === 'pro') {
        setIsActivated(true);
      }
      setIsCheckingStatus(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-cream font-sans flex flex-col justify-between selection:bg-sage-pale selection:text-sage-dark text-charcoal">
      <Header toggleDarkMode={toggleDarkMode} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        {/* Back Link */}
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-medium hover:text-charcoal font-semibold text-[13.5px] mb-6 transition-colors cursor-pointer group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Pregnancy Dashboard</span>
        </button>

        {/* -------------------- STATE: CELEBRATION / ACTIVATED -------------------- */}
        {isActivated ? (
          <div className="bg-white border border-sage/25 rounded-[32px] p-8 sm:p-12 shadow-xl text-center max-w-xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-md">
              <CheckCircle2 size={44} className="animate-bounce" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 mb-2">
                🎉 Synced in Real Time
              </span>
              <h2 className="font-serif text-[28px] sm:text-[34px] font-bold text-charcoal">
                Welcome to Our Pregnancy Pro!
              </h2>
              <p className="text-[14px] sm:text-[15px] text-medium mt-2 leading-relaxed">
                Your maternal membership is active. All AI wellness features, meal guides, and printable pregnancy summaries are unlocked on this browser and synced across all your devices.
              </p>
            </div>

            <div className="p-5 bg-cream/70 rounded-2xl border border-sage/20 text-left space-y-2.5 text-[13.5px]">
              <div className="flex items-center gap-2.5 text-charcoal font-semibold">
                <Check size={16} className="text-sage-dark shrink-0" />
                <span>Active on Web, Android, and iOS</span>
              </div>
              <div className="flex items-center gap-2.5 text-charcoal font-semibold">
                <Check size={16} className="text-sage-dark shrink-0" />
                <span>Unlimited 24/7 Ask OPIN AI Maternal Companion</span>
              </div>
              <div className="flex items-center gap-2.5 text-charcoal font-semibold">
                <Check size={16} className="text-sage-dark shrink-0" />
                <span>AI Food &amp; Meal Guide &amp; Real-Time Partner Sync</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 rounded-xl bg-sage text-white font-bold text-[15px] hover:bg-sage-dark shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>✦ Open Pro Dashboard</span>
              <ArrowRight size={17} />
            </button>
          </div>
        ) : (
          /* -------------------- STATE: CHECKOUT & QR SCAN -------------------- */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Plan Benefits & Summary */}
            <div className="lg:col-span-5 bg-white border border-border/80 rounded-[28px] p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-sage-dark font-bold text-[11.5px] uppercase tracking-wider bg-sage-pale px-3 py-1 rounded-full w-max border border-sage/20">
                <Sparkles size={13} className="text-sage" />
                <span>Maternal Membership</span>
              </div>

              <div>
                <h1 className="font-serif text-[24px] sm:text-[27px] font-bold text-charcoal leading-snug">
                  Our Pregnancy Pro
                </h1>
                <p className="text-[13px] text-medium mt-1 leading-relaxed">
                  Full pregnancy milestone companion with AI wellness guidance, printable summaries, and real-time partner synchronization.
                </p>
              </div>

              <div className="h-px bg-border" />

              <div className="space-y-3">
                <span className="text-[11px] uppercase tracking-wider font-bold text-medium block">
                  Included in Your Membership
                </span>
                {[
                  "24/7 Ask OPIN AI Maternal Wellness Companion",
                  "AI Food & Meal Nutrition Guide",
                  "Personal Pregnancy Folder & Printable PDF Summary",
                  "Encrypted Real-Time Cross-Device Partner Sync",
                  "AI Baby Names Generator & Garbh Sanskar Audio",
                  "Priority updates & continuous support"
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-[13px] text-charcoal">
                    <CheckCircle2 size={16} className="text-sage mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* VIP Coupon Box */}
              <div className="p-4 bg-cream/60 rounded-2xl border border-sage/20 space-y-2.5">
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-charcoal">
                  <Tag size={13} className="text-sage" />
                  <span>Have a VIP Promo Pass?</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. OPIN30"
                    className="flex-1 bg-white border border-border rounded-xl px-3 py-2 text-[13px] uppercase font-mono tracking-wider focus:outline-none focus:border-sage"
                  />
                  <button
                    type="button"
                    onClick={handleApplyFreePromoPass}
                    disabled={isApplyingFreePass}
                    className="bg-charcoal text-white px-4 py-2 rounded-xl text-[12.5px] font-bold hover:bg-black transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isApplyingFreePass ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-[11.5px] text-critical">{couponError}</p>}
                {couponSuccess && <p className="text-[11.5px] text-emerald-700 font-semibold">{couponSuccess}</p>}
              </div>
            </div>

            {/* Right Column: Scan to Subscribe (Mobile Store Integration) */}
            <div className="lg:col-span-7 bg-white border border-sage/30 rounded-[28px] p-6 sm:p-8 shadow-md space-y-6">
              <div className="text-center space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  <span>Apple StoreKit &amp; Google Play Billing</span>
                </span>
                <h2 className="font-serif text-[22px] sm:text-[25px] font-bold text-charcoal">
                  Subscribe via Mobile &amp; Sync Instantly
                </h2>
                <p className="text-[13px] text-medium max-w-md mx-auto leading-relaxed">
                  We use Apple Pay and Google Play for 1-tap hardware security and global currency support. Your subscription unlocks on this browser automatically.
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
                  <span>Apple App Store</span>
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

              {/* Dynamic View: Mobile Web 1-Tap CTA vs Desktop High-Res QR Code */}
              {isMobileScreen ? (
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
                <div className="flex flex-col items-center justify-center py-2 space-y-4">
                  <div className="p-4 bg-white rounded-[24px] border-2 border-sage/30 shadow-md flex items-center justify-center">
                    <QRCodeSVG
                      value={currentStoreUrl}
                      size={200}
                      level="H"
                      includeMargin={false}
                      imageSettings={{
                        src: "/logo.png",
                        x: undefined,
                        y: undefined,
                        height: 42,
                        width: 42,
                        excavate: true,
                      }}
                    />
                  </div>

                  {/* 3 Step Visual Guide */}
                  <div className="w-full grid grid-cols-3 gap-2.5 text-center pt-2">
                    <div className="p-3 bg-cream/50 rounded-xl border border-border/60">
                      <span className="w-5 h-5 rounded-full bg-sage text-white text-[11px] font-bold flex items-center justify-center mx-auto mb-1.5">1</span>
                      <p className="text-[11.5px] text-charcoal font-semibold leading-tight">Scan with Camera</p>
                      <p className="text-[10px] text-medium mt-0.5">Point phone at QR code</p>
                    </div>
                    <div className="p-3 bg-cream/50 rounded-xl border border-border/60">
                      <span className="w-5 h-5 rounded-full bg-sage text-white text-[11px] font-bold flex items-center justify-center mx-auto mb-1.5">2</span>
                      <p className="text-[11.5px] text-charcoal font-semibold leading-tight">1-Tap Subscribe</p>
                      <p className="text-[10px] text-medium mt-0.5">Apple Pay or Google Play</p>
                    </div>
                    <div className="p-3 bg-cream/50 rounded-xl border border-border/60">
                      <span className="w-5 h-5 rounded-full bg-sage text-white text-[11px] font-bold flex items-center justify-center mx-auto mb-1.5">3</span>
                      <p className="text-[11.5px] text-charcoal font-semibold leading-tight">Auto-Unlocks</p>
                      <p className="text-[10px] text-medium mt-0.5">Real-time cloud sync</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Real-Time Live Sync Status Pill */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl flex items-center justify-between gap-2 text-[12.5px] text-emerald-950 font-medium">
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

              {/* Footer: Copy Link */}
              <div className="pt-2 border-t border-border flex items-center justify-between text-[12px] text-medium">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 hover:text-charcoal transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copiedLink ? 'Store link copied to clipboard!' : 'Copy direct store link'}</span>
                </button>

                <div className="flex items-center gap-1 text-[11.5px] text-light">
                  <Heart size={12} className="text-blush" />
                  <span>Private, encrypted &amp; cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
