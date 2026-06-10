import React, { useState } from 'react';
import { usePlanner } from '../store';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { Bot, Sparkles, ShieldCheck, Loader2, Lock, Gift } from 'lucide-react';

interface PaywallProps {
  children: React.ReactNode;
  featureName: 'AskOurPregnancy' | 'FoodScanner' | 'MaternalCare' | 'GovernmentSchemes' | 'Postpartum' | 'PartnerSync' | 'EhrExports';
}

const checkAccess = (tier: 'free' | 'standard' | 'premium' | undefined, feature: string) => {
  const premiumFeatures = ['AskOurPregnancy', 'FoodScanner', 'EhrExports'];
  const standardFeatures = ['MaternalCare', 'GovernmentSchemes', 'Postpartum', 'PartnerSync'];

  if (tier === 'premium') return true;
  if (tier === 'standard' && standardFeatures.includes(feature)) return true;
  return false;
};

export const Paywall: React.FC<PaywallProps> = ({ children, featureName }) => {
  const { state, updateState } = usePlanner();
  const [isProcessing, setIsProcessing] = useState(false);
  const [months, setMonths] = useState(3); // default to 3 months for best value

  const planTier = state.planTier || (state.isPremium ? 'premium' : 'free');
  const hasAccess = checkAccess(planTier, featureName);

  if (hasAccess) {
    return <>{children}</>;
  }

  const isPremiumFeature = ['AskOurPregnancy', 'FoodScanner', 'EhrExports'].includes(featureName);
  const basePrice = isPremiumFeature ? 499 : 199;
  const discount = Math.floor(months / 3) * 50;
  const totalPrice = basePrice * months - discount;

  const handlePayment = () => {
    window.location.hash = `#checkout?plan=${isPremiumFeature ? 'premium' : 'standard'}&months=${months}`;
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8">
        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-normal mb-1.5 flex items-center gap-3">
          <Lock className={isPremiumFeature ? "text-gold" : "text-sage"} size={32} />
          {isPremiumFeature ? 'AI Ultimate Pack' : 'Maternal Care Pack'}
        </h2>
        <p className="text-[14px] text-medium max-w-[560px] leading-[1.7]">
          {isPremiumFeature
            ? 'Unlock advanced AI-powered pregnancy scanners, chatbots, and EHR reports.'
            : 'Unlock essential clinical checklists, government maternity schemes, and postpartum care.'}
        </p>
      </div>

      <div className={`bg-white dark:bg-[#1E293B] border-[2px] ${isPremiumFeature ? 'border-gold' : 'border-sage'} rounded-[24px] overflow-hidden shadow-xl max-w-[700px] mx-auto`}>
        <div className={`px-8 py-5 flex items-center justify-between ${isPremiumFeature ? 'bg-gold text-charcoal' : 'bg-sage text-white'}`}>
          <div className="font-bold text-[18px] flex items-center gap-2">
            {isPremiumFeature ? 'Our Pregnancy Premium' : 'Our Pregnancy Standard'} <Sparkles className="w-5 h-5 flex-shrink-0" />
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm">
            Locked Feature
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <h3 className="font-serif text-[26px] text-charcoal dark:text-white mb-4">
            {isPremiumFeature
              ? 'Unlock Intelligent Features ✨'
              : 'Unlock Healthcare & Support Guides 🩺'}
          </h3>

          <p className="text-[15px] text-charcoal/80 dark:text-white/80 mb-8 leading-relaxed">
            {isPremiumFeature
              ? 'Get 24/7 personal access to Bloom AI (chat support), AI Food Safety Scanners (identifies hidden pregnancy hazards in local snacks/dishes), and formatted FHIR R4 clinical exports.'
              : 'Get full access to Government Schemes (JSY, PMMVY maternity benefits), Postpartum/Early Parenthood recovery logs, and encrypted Partner Sync functionality.'}
          </p>

          <div className="bg-cream dark:bg-[#0F172A] border border-border dark:border-white/5 rounded-2xl p-5 mb-8">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[12px] font-bold text-charcoal dark:text-white uppercase tracking-wider">Select Duration</label>
              <span className={`text-[13px] font-semibold px-2.5 py-0.5 rounded-full ${isPremiumFeature ? 'bg-gold-pale text-gold border border-gold/20' : 'bg-sage-pale text-sage border border-sage/20'}`}>
                {months} {months === 1 ? 'Month' : 'Months'}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              aria-label="Select upgrade duration"
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white dark:bg-[#1E293B] border border-border dark:border-white/10"
              style={{
                accentColor: isPremiumFeature ? "var(--color-gold)" : "var(--color-sage)"
              }}
            />
            <div className="flex justify-between mt-1 text-[10px] text-medium font-bold">
              <span>1m</span>
              <span>3m</span>
              <span>6m</span>
              <span>9m</span>
              <span>12m</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 border-t border-border dark:border-white/10 pt-8">
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-[36px] font-serif font-bold text-charcoal dark:text-white">₹{totalPrice}</span>
              <span className="text-[14px] text-medium">/ {months} {months === 1 ? 'month' : 'months'}</span>
            </div>

            {months >= 3 && (
              <div className="text-[12px] font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5 bg-green-50 dark:bg-green-950/20 px-3 py-1 rounded-md mb-2">
                <Gift size={14} /> Includes ₹{Math.floor(months / 3) * 50} discount!
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={`w-full sm:w-auto min-w-[280px] py-4 px-8 rounded-full font-bold text-[16px] transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed
                ${isPremiumFeature
                  ? 'bg-gold text-charcoal hover:bg-yellow-400 shadow-gold/20'
                  : 'bg-sage text-white hover:bg-sage-dark shadow-sage/20'}`}
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              Upgrade Plan
            </button>

            <p className="text-[11px] text-light mt-2 italic text-center">
              Demonstration Mode: Integrate your active Razorpay Key ID in the options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
