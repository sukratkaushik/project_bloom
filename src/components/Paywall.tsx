import React, { useState } from 'react';
import { usePlanner } from '../store';
import { Bot, Sparkles, ShieldCheck, Camera, Loader2 } from 'lucide-react';

interface PaywallProps {
  children: React.ReactNode;
  featureName: 'AskOurPregnancy' | 'FoodScanner';
}

export const Paywall: React.FC<PaywallProps> = ({ children, featureName }) => {
  const { state, updateState } = usePlanner();
  const [isProcessing, setIsProcessing] = useState(false);

  // If premium is active, render the wrapped component normally
  if (state.isPremium) {
    return <>{children}</>;
  }

  // Mock payment integration for Razorpay
  const handleSimulatePayment = (plan: 'monthly' | 'annual') => {
    setIsProcessing(true);
    
    // Simulate network delay and Razorpay checkout popup
    setTimeout(() => {
      alert(`Simulation: Razorpay checkout successful for ${plan} plan.`);
      
      updateState({
        isPremium: true,
        premiumPlan: plan,
        razorpayPaymentId: `pay_mock_${Date.now()}`,
        premiumExpiry: new Date(Date.now() + (plan === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString()
      });
      
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8">
        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-normal mb-1.5 flex items-center gap-3">
          <Sparkles className="text-gold" size={32} /> {featureName === 'AskOurPregnancy' ? 'AskOur Pregnancy AI' : 'AI Food Guide'}
        </h2>
        <p className="text-[14px] text-medium max-w-[560px] leading-[1.7]">
          Unlock our advanced AI tools specifically designed for Indian pregnancies.
        </p>
      </div>

      <div className="bg-white border-[2px] border-gold rounded-[24px] overflow-hidden shadow-xl max-w-[800px] mx-auto">
        <div className="bg-gold text-charcoal px-8 py-5 flex items-center justify-between">
          <div className="font-bold text-[18px] flex items-center gap-2">
            Our Pregnancy Premium <Bot className="w-5 h-5 flex-shrink-0" />
          </div>
          <div className="text-[12px] font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm">
            Unlock Access
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <h3 className="font-serif text-[28px] text-charcoal mb-4">
            {featureName === 'AskOurPregnancy' 
              ? 'Your 24/7 Pregnancy Companion ✨' 
              : 'Instant Pregnancy Safety & Indian Food Guide ✨'}
          </h3>
          
          <p className="text-[16px] text-charcoal/80 mb-8 leading-relaxed">
            {featureName === 'AskOurPregnancy' 
              ? 'Ask anything about your pregnancy — symptoms, food safety, what to expect, when to worry — and get instant, personalised answers grounded in ACOG and WHO medical guidelines.'
              : 'Upload a picture of any meal, Indian snack, or ingredient label. Our AI vision instantly breaks down the nutrition profile and checks for hidden pregnancy hazards like raw papaya, unpasteurized dairy, or excess caffeine.'}
          </p>

          {featureName === 'AskOurPregnancy' && (
            <div className="space-y-4 mb-10">
              <div className="bg-gray-50 border border-border p-3 rounded-[12px] rounded-bl-none text-[14px] text-charcoal inline-block shadow-sm">
                "Is spotting normal at 6 weeks?"
              </div>
              <div className="bg-gray-50 border border-border p-3 rounded-[12px] rounded-br-none text-[14px] text-charcoal ml-auto block shadow-sm text-right w-fit">
                "Can I eat paneer pizza during pregnancy?"
              </div>
              <div className="bg-gray-50 border border-border p-3 rounded-[12px] rounded-bl-none text-[14px] text-charcoal inline-block shadow-sm">
                "I haven't felt the baby move in 3 hours — what should I do?"
              </div>
            </div>
          )}
          
          {featureName === 'FoodScanner' && (
            <div className="flex gap-4 mb-10 justify-center">
              <div className="w-24 h-24 bg-sage-pale/40 rounded-[12px] flex items-center justify-center border border-border mt-4 shrink-0 transition-transform hover:scale-105">
                <span className="text-[40px]">🥭</span>
              </div>
              <div className="w-24 h-24 bg-sage-pale/40 rounded-[12px] flex items-center justify-center border border-border shrink-0 transition-transform hover:scale-105">
                <span className="text-[40px]">🍕</span>
              </div>
              <div className="w-24 h-24 bg-sage-pale/40 rounded-[12px] flex items-center justify-center border border-border mt-8 shrink-0 transition-transform hover:scale-105">
                <span className="text-[40px]">🥗</span>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-4 border-t border-border pt-8 mt-4">
            <button
              onClick={() => handleSimulatePayment('monthly')}
              disabled={isProcessing}
              className="w-full sm:w-auto min-w-[280px] py-4 px-8 rounded-full bg-gold text-charcoal font-bold text-[16px] hover:bg-yellow-400 transition-colors shadow-lg shadow-gold/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              Unlock Premium — ₹299/month
            </button>
            <button
              onClick={() => handleSimulatePayment('annual')}
              disabled={isProcessing}
              className="text-[14px] text-medium hover:text-charcoal transition-colors underline font-medium"
            >
              or ₹1,999/year (save 44%)
            </button>
            <p className="text-[11px] text-light mt-2 italic text-center">
              This is a demonstration. No real payment will be processed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
