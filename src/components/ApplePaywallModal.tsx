import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Users, 
  UtensilsCrossed, 
  Check, 
  Loader2, 
  X, 
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { purchaseProSubscription, restorePurchases } from '../utils/revenueCatService';
import { auth, updateUserSubscription } from '../firebase';
import { usePlanner } from '../store';
import { triggerHaptic, getPlatform } from '../utils/nativeBridge';
import { getLocalMonetizationConfig } from '../utils/monetizationConfig';

interface ApplePaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
}

export const ApplePaywallModal: React.FC<ApplePaywallModalProps> = ({ isOpen, onClose, featureTitle }) => {
  const { updateState } = usePlanner();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Lock background scroll when paywall modal is displayed
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const platform = getPlatform();
  const isAndroid = platform === 'android';
  const mobileConfig = getLocalMonetizationConfig();

  const handlePurchase = async () => {
    setIsPurchasing(true);
    setErrorNotice(null);
    setSuccessNotice(null);
    triggerHaptic('medium');

    try {
      const res = await purchaseProSubscription();
      if (res.success) {
        updateState({ isPremium: true, planTier: 'premium' });
        if (auth.currentUser?.uid) {
          updateUserSubscription(auth.currentUser.uid, 'premium', 1).catch(err => {
            console.warn('Could not sync subscription to Firestore:', err);
          });
        }
        setSuccessNotice('Welcome to Our Pregnancy Pro! All premium maternal AI tools are now unlocked.');
        triggerHaptic('heavy');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else if (res.error && !res.error.toLowerCase().includes('cancel')) {
        setErrorNotice(res.error);
      }
    } catch (err: any) {
      setErrorNotice(err?.message || 'Transaction could not be completed.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    setErrorNotice(null);
    setSuccessNotice(null);
    triggerHaptic('light');

    try {
      const res = await restorePurchases();
      if (res.isActive) {
        updateState({ isPremium: true, planTier: 'premium' });
        if (auth.currentUser?.uid) {
          updateUserSubscription(auth.currentUser.uid, 'premium', 1).catch(err => {
            console.warn('Could not sync restored subscription to Firestore:', err);
          });
        }
        setSuccessNotice('Your Pro subscription was successfully restored!');
        triggerHaptic('heavy');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorNotice(
          isAndroid
            ? 'No active Pro subscription found for this Google Play account.'
            : 'No active Pro subscription found for this Apple ID.'
        );
      }
    } catch (err: any) {
      setErrorNotice(err?.message || 'Could not restore purchases.');
    } finally {
      setIsRestoring(false);
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 xs:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Our Pregnancy Pro Subscription"
        className="relative w-full max-w-[420px] max-h-[92dvh] sm:max-h-[88vh] bg-white dark:bg-[#1E293B] rounded-[24px] sm:rounded-[28px] shadow-2xl border border-border/80 flex flex-col overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Ribbon - Compact, fixed at top */}
        <div className="shrink-0 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white px-5 pt-4 pb-3.5 relative text-center border-b border-white/10">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('light');
              onClose();
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/15 hover:bg-white/25 active:scale-90 text-white transition-all cursor-pointer z-10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10.5px] font-bold tracking-wide uppercase mb-1.5 border border-amber-400/30">
            <Crown className="w-3 h-3 text-amber-300" />
            <span>Launch Special • {mobileConfig.discountPercentage}% Off</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-0.5 tracking-tight">
            Our Pregnancy Pro
          </h2>
          <p className="text-white/80 text-[11.5px] sm:text-[12px] max-w-xs mx-auto leading-snug truncate">
            {featureTitle ? `Unlock ${featureTitle} and all AI tools` : 'Unlock all AI-powered maternal care tools'}
          </p>
        </div>

        {/* Content Body - Scrollable inside the dialog */}
        <div 
          className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5 py-3.5 space-y-3 custom-scrollbar"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Notifications */}
          {errorNotice && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-[12px] rounded-xl text-center font-medium">
              {errorNotice}
            </div>
          )}
          {successNotice && (
            <div className="p-2.5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-[12px] rounded-xl text-center font-medium">
              {successNotice}
            </div>
          )}

          {/* Pricing Box - Immediately visible at the top */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border-2 border-amber-400/70 flex items-center justify-between shadow-2xs">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300 bg-amber-200/70 dark:bg-amber-900/50 px-2 py-0.5 rounded">
                Monthly Pro Pass
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-charcoal dark:text-white font-sans">${mobileConfig.introPriceUsd.toFixed(2)}</span>
                <span className="text-[12.5px] text-light line-through font-medium">${mobileConfig.regularPriceUsd.toFixed(2)}</span>
                <span className="text-[11.5px] text-medium font-semibold">/ month</span>
              </div>
              <p className="text-[10.5px] text-medium mt-0.5 leading-tight">
                {isAndroid ? 'Renews monthly • Cancel anytime in Google Play' : 'Renews monthly • Cancel anytime in App Store'}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span className="inline-block bg-neutral-900 text-amber-300 text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                Save {mobileConfig.discountPercentage}%
              </span>
            </div>
          </div>

          {/* Feature List - Compact & responsive */}
          <div className="space-y-2 text-[12.5px]">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-50/70 dark:bg-white/5 border border-border/50">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center shrink-0 text-emerald-800 dark:text-emerald-300">
                <UtensilsCrossed className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-charcoal dark:text-white leading-tight">Unlimited AI Food & Calorie Vision</p>
                <p className="text-medium text-[11px] leading-tight truncate">ICMR-NIN nutrients, pregnancy safety & heat alerts</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-50/70 dark:bg-white/5 border border-border/50">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center shrink-0 text-blue-800 dark:text-blue-300">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-charcoal dark:text-white leading-tight">Instant Ultrasound & Lab Report OCR</p>
                <p className="text-medium text-[11px] leading-tight truncate">Plain-language medical analysis and prescription guidance</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-50/70 dark:bg-white/5 border border-border/50">
              <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center shrink-0 text-purple-800 dark:text-purple-300">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-charcoal dark:text-white leading-tight">24/7 Maternal AI Obstetric Companion</p>
                <p className="text-medium text-[11px] leading-tight truncate">Continuous symptom analysis, milestones & care insights</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-50/70 dark:bg-white/5 border border-border/50">
              <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center shrink-0 text-rose-800 dark:text-rose-300">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-charcoal dark:text-white leading-tight">Real-Time Partner Sync & Vault</p>
                <p className="text-medium text-[11px] leading-tight truncate">Live device sync for kick logs, appointments & checklists</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handlePurchase}
              disabled={isPurchasing || isRestoring}
              className="w-full py-3 sm:py-3.5 px-5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 active:scale-[0.99] text-white font-bold text-[14.5px] sm:text-[15px] flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>{isAndroid ? 'Connecting with Google Play...' : 'Connecting with Apple...'}</span>
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 text-amber-300" />
                  <span>Subscribe for ${mobileConfig.introPriceUsd.toFixed(2)} / month</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleRestore}
              disabled={isPurchasing || isRestoring}
              className="w-full py-1.5 text-center text-[11.5px] font-semibold text-medium hover:text-charcoal dark:hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isRestoring ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
              <span>Restore Existing Purchases</span>
            </button>
          </div>

          {/* Platform Store Compliance Disclosures */}
          <div className="border-t border-border/70 pt-2.5 pb-2 text-[10.5px] text-light space-y-1.5 text-center leading-relaxed">
            {isAndroid ? (
              <p>
                Payment charged to Google Play account at confirmation. Auto-renews at ${mobileConfig.introPriceUsd.toFixed(2)}/mo for 3 months, then ${mobileConfig.regularPriceUsd.toFixed(2)}/mo. Cancel anytime in Google Play.
              </p>
            ) : (
              <p>
                Payment charged to Apple ID account at confirmation. Auto-renews at ${mobileConfig.introPriceUsd.toFixed(2)}/mo unless canceled 24 hours prior. Manage or cancel anytime in Apple ID settings.
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-2 text-medium pt-0.5">
              {isAndroid && (
                <>
                  <a
                    href="https://play.google.com/store/account/subscriptions"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-charcoal dark:hover:text-white inline-flex items-center gap-0.5"
                  >
                    <span>Google Play Subscriptions</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <span>•</span>
                </>
              )}
              <a 
                href="https://ourpregnancy.in/terms" 
                target="_blank" 
                rel="noreferrer" 
                className="underline hover:text-charcoal dark:hover:text-white"
              >
                Terms of Use (EULA)
              </a>
              <span>•</span>
              <a 
                href="https://ourpregnancy.in/privacy" 
                target="_blank" 
                rel="noreferrer" 
                className="underline hover:text-charcoal dark:hover:text-white"
              >
                Privacy Policy
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
