import React, { useState } from 'react';
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-[28px] shadow-2xl border border-border overflow-hidden my-6">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white px-6 pt-7 pb-6 relative text-center">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold tracking-wide uppercase mb-3 border border-amber-400/30">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Launch Special • {mobileConfig.discountPercentage}% Off</span>
          </div>

          <h2 className="text-2xl font-serif font-bold text-white mb-1.5">
            Our Pregnancy Pro
          </h2>
          <p className="text-white/80 text-[13px] max-w-md mx-auto leading-relaxed">
            {featureTitle ? `Unlock ${featureTitle} and all AI-powered maternal care tools.` : 'Comprehensive AI vision, obstetric intelligence, and real-time partner sync.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Notifications */}
          {errorNotice && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl text-center">
              {errorNotice}
            </div>
          )}
          {successNotice && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-[13px] rounded-xl text-center font-medium">
              {successNotice}
            </div>
          )}

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border-2 border-amber-400/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded">
                Monthly Pro Pass
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-charcoal font-sans">${mobileConfig.introPriceUsd.toFixed(2)}</span>
                <span className="text-[13px] text-light line-through font-medium">${mobileConfig.regularPriceUsd.toFixed(2)}</span>
                <span className="text-[12px] text-medium font-medium">/ month</span>
              </div>
              <p className="text-[11px] text-medium mt-0.5">
                {isAndroid ? 'Renews monthly • Cancel anytime in Google Play Subscriptions' : 'Renews monthly • Cancel anytime'}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-neutral-900 text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                Save {mobileConfig.discountPercentage}%
              </span>
            </div>
          </div>

          {/* Feature List */}
          <div className="space-y-2.5 text-[13px]">
            <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-800 mt-0.5">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-charcoal">Unlimited AI Food & Calorie Vision</p>
                <p className="text-medium text-[12px]">Scan any meal or drink for ICMR-NIN nutrients, pregnancy safety, and heat hazards.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 text-blue-800 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-charcoal">Instant Ultrasound & Lab Report OCR</p>
                <p className="text-medium text-[12px]">Explain complex medical parameters and prescriptions in friendly plain language.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0 text-purple-800 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-charcoal">24/7 Maternal AI Obstetric Companion</p>
                <p className="text-medium text-[12px]">Continuous guidance on trimester symptoms, baby milestones, and maternal wellness.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center shrink-0 text-rose-800 mt-0.5">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-charcoal">Real-Time Partner Sync & Vault</p>
                <p className="text-medium text-[12px]">Direct multi-device live sync for kick counts, vitals, appointments, and checklists.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              onClick={handlePurchase}
              disabled={isPurchasing || isRestoring}
              className="w-full py-3.5 px-6 rounded-2xl bg-black hover:bg-neutral-800 active:scale-[0.99] text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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
              onClick={handleRestore}
              disabled={isPurchasing || isRestoring}
              className="w-full py-2 text-center text-[12px] font-semibold text-medium hover:text-charcoal transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isRestoring ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
              <span>Restore Existing Purchases</span>
            </button>
          </div>

          {/* Platform Store Compliance Disclosures */}
          <div className="border-t border-border pt-4 text-[11px] text-light space-y-2 text-center leading-relaxed">
            {isAndroid ? (
              <p>
                Payment will be charged to your Google Play account at confirmation of purchase. Subscription automatically renews for ${mobileConfig.introPriceUsd.toFixed(2)}/month for the first 3 months (then ${mobileConfig.regularPriceUsd.toFixed(2)}/month) unless canceled before the end of the current billing period. Cancel anytime in Google Play Subscriptions.
              </p>
            ) : (
              <p>
                Payment will be charged to your Apple ID account at confirmation of purchase. Subscription automatically renews for ${mobileConfig.introPriceUsd.toFixed(2)}/month unless auto-renew is turned off at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period. You can manage or cancel your subscription at any time in your Apple ID account settings.
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-3 text-medium pt-1">
              {isAndroid && (
                <>
                  <a
                    href="https://play.google.com/store/account/subscriptions"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-charcoal inline-flex items-center gap-1"
                  >
                    <span>Google Play Subscriptions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span>•</span>
                </>
              )}
              <a 
                href="https://ourpregnancy.in/terms" 
                target="_blank" 
                rel="noreferrer" 
                className="underline hover:text-charcoal"
              >
                Terms of Use (EULA)
              </a>
              <span>•</span>
              <a 
                href="https://ourpregnancy.in/privacy" 
                target="_blank" 
                rel="noreferrer" 
                className="underline hover:text-charcoal"
              >
                Privacy Policy
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
