import React, { useState, useEffect } from 'react';
import { usePlanner } from '../store';
import { httpsCallable } from 'firebase/functions';
import { functions, auth, updateUserSubscription } from '../firebase';
import { ArrowLeft, ShieldCheck, CreditCard, Sparkles, Check, Loader2, Landmark, Tag, Heart } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { navigate } from '../utils/navigation';

export const CheckoutPage: React.FC = () => {
  const { state, updateState, toggleDarkMode } = usePlanner();

  // Get initial params from URL search or hash (e.g. /checkout?plan=premium&months=3)
  const getParams = () => {
    const search = window.location.search || (window.location.hash.includes('?') ? '?' + window.location.hash.split('?')[1] : '');
    const params = new URLSearchParams(search);
    return {
      plan: (params.get('plan') || 'premium') as 'standard' | 'premium',
      months: parseInt(params.get('months') || '3', 10),
      coupon: params.get('coupon') || '',
    };
  };

  const initialParams = getParams();
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'premium'>(initialParams.plan);
  const [months, setMonths] = useState<number>(initialParams.months);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Flow states
  const [checkoutStep, setCheckoutStep] = useState<'checkout' | 'processing' | 'success'>('checkout');
  const [txnId, setTxnId] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // Auto-fill user email/name if available
  const userEmail = state.userName ? `${state.userName.toLowerCase().replace(/\s+/g, '')}@example.com` : "hello@ourpregnancy.in";

  // Re-run param parser on hash change
  useEffect(() => {
    const handleHashChange = () => {
      const params = getParams();
      setSelectedPlan(params.plan);
      setMonths(params.months);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Trigger auto-apply coupon if present in URL
  useEffect(() => {
    const params = getParams();
    if (params.coupon) {
      const promo = params.coupon.trim().toUpperCase();
      setCouponCode(promo);
      
      const initialBase = params.plan === 'premium' ? 499 : 99;
      const initialDurationDiscount = Math.floor(params.months / 3) * 50;
      const initialRawSubtotal = initialBase * params.months - initialDurationDiscount;
      
      if (promo === 'OPIN30') {
        if (params.plan === 'premium') {
          const discount = params.months <= 1 ? initialRawSubtotal : initialBase;
          setAppliedDiscount(discount);
          setCouponSuccess('Promo code OPIN30 applied! 30 Days (1 Month) of Premium for FREE.');
        } else {
          setCouponError('Promo code OPIN30 is only valid for Premium plans.');
        }
      } else if (promo === 'VIPCARE90') {
        if (params.plan === 'premium') {
          const discount = params.months <= 3 ? initialRawSubtotal : (initialBase * 3 - 50);
          setAppliedDiscount(discount);
          setCouponSuccess('Promo code VIPCARE90 applied! 90 Days (3 Months) of VIP Premium for FREE.');
        } else {
          setCouponError('Promo code VIPCARE90 is only valid for Premium plans.');
        }
      } else if (promo === 'BLOOM30') {
        if (params.plan === 'premium') {
          const discount = params.months <= 3 ? initialRawSubtotal : (initialBase * 3 - 50);
          setAppliedDiscount(discount);
          setCouponSuccess('Promo code BLOOM30 applied! 3 months of Premium for free.');
        } else {
          setCouponError('Promo code BLOOM30 is only valid for Premium plans.');
        }
      } else if (promo === 'BLOOM50') {
        setAppliedDiscount(Math.round(initialRawSubtotal * 0.5));
        setCouponSuccess('Promo code BLOOM50 applied! You got 50% off.');
      } else if (promo === 'WELCOME10') {
        setAppliedDiscount(Math.round(initialRawSubtotal * 0.1));
        setCouponSuccess('Promo code WELCOME10 applied! You got 10% off.');
      }
    }
  }, [selectedPlan, months]);

  // Compute pricing
  const basePrice = selectedPlan === 'premium' ? 499 : 99;
  const durationDiscount = Math.floor(months / 3) * 50;
  const rawSubtotal = basePrice * months - durationDiscount;
  const finalPrice = Math.max(0, rawSubtotal - appliedDiscount);

  const applyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    const cleanedCode = couponCode.trim().toUpperCase();

    if (cleanedCode === 'OPIN30') {
      if (selectedPlan !== 'premium') {
        setCouponError('Promo code OPIN30 is only valid for Premium plans.');
      } else {
        const discount = months <= 1 ? rawSubtotal : basePrice;
        setAppliedDiscount(discount);
        setCouponSuccess('Promo code OPIN30 applied! 30 Days (1 Month) of Premium for FREE.');
      }
    } else if (cleanedCode === 'VIPCARE90') {
      if (selectedPlan !== 'premium') {
        setCouponError('Promo code VIPCARE90 is only valid for Premium plans.');
      } else {
        const discount = months <= 3 ? rawSubtotal : (basePrice * 3 - 50);
        setAppliedDiscount(discount);
        setCouponSuccess('Promo code VIPCARE90 applied! 90 Days (3 Months) of VIP Premium for FREE.');
      }
    } else if (cleanedCode === 'BLOOM30') {
      if (selectedPlan !== 'premium') {
        setCouponError('Promo code BLOOM30 is only valid for Premium plans.');
      } else {
        const discount = months <= 3 ? rawSubtotal : (basePrice * 3 - 50);
        setAppliedDiscount(discount);
        setCouponSuccess('Promo code BLOOM30 applied! 3 months of Premium for free.');
      }
    } else if (cleanedCode === 'BLOOM50') {
      const discount = Math.round(rawSubtotal * 0.5);
      setAppliedDiscount(discount);
      setCouponSuccess('Promo code BLOOM50 applied! You got 50% off.');
    } else if (cleanedCode === 'WELCOME10') {
      const discount = Math.round(rawSubtotal * 0.1);
      setAppliedDiscount(discount);
      setCouponSuccess('Promo code WELCOME10 applied! You got 10% off.');
    } else if (cleanedCode === '') {
      setCouponError('Please enter a coupon code.');
    } else {
      setCouponError('Invalid coupon code. Try OPIN30 or VIPCARE90.');
    }
  };

  const handlePaymentSubmit = async () => {
    // Start payment processing
    setCheckoutStep('processing');

    if (!auth.currentUser) {
      alert('You must be signed in to complete this order or claim your free access. Please sign in or create an account first.');
      setCheckoutStep('checkout');
      return;
    }

    const cleanedCode = couponCode.trim().toUpperCase();

    // 100% Free Promo Pass Activation (Zero Gateway)
    if (finalPrice === 0) {
      try {
        const freeMonths = (cleanedCode === 'VIPCARE90' || cleanedCode === 'BLOOM30') ? Math.min(months, 3) : Math.min(months, 1);
        const actualMonths = Math.max(1, freeMonths);

        // Expiry in ms
        const expiryTimestamp = Date.now() + actualMonths * 30 * 24 * 60 * 60 * 1000;
        const expiryIso = new Date(expiryTimestamp).toISOString();

        // Update Firestore user document
        await updateUserSubscription(auth.currentUser.uid, selectedPlan, actualMonths);

        // Update local planner state & Dexie
        updateState({
          planTier: selectedPlan,
          isPremium: selectedPlan === 'premium',
          premiumPlan: actualMonths >= 12 ? 'annual' : 'monthly',
          planExpiry: expiryTimestamp,
          premiumExpiry: expiryIso,
        });

        const freeTxn = `FREE_${cleanedCode || 'PROMO'}_${Date.now().toString(36).toUpperCase()}`;
        setTxnId(freeTxn);
        const computedExpiry = new Date(expiryTimestamp);
        setExpiryDate(computedExpiry.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }));
        setCheckoutStep('success');
        return;
      } catch (err: any) {
        console.error("Free pass activation failed:", err);
        alert(`Could not activate promo pass: ${err.message || 'Please try again.'}`);
        setCheckoutStep('checkout');
        return;
      }
    }

    try {
      const createOrderParams = { planTier: selectedPlan, months };
      const createOrder = httpsCallable(functions, 'createPaymentOrder');
      const orderRes = await createOrder(createOrderParams) as { data: { orderId: string, amount: number } };
      
      const { orderId, amount } = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_HERE', 
        amount: amount, 
        currency: "INR",
        name: "Our Pregnancy",
        description: selectedPlan === 'premium' ? "Premium AI Pack" : "Standard Plan",
        image: "https://ourpregnancy.in/logo.png",
        order_id: orderId, 
        handler: async function (response: any) {
          try {
            setCheckoutStep('processing');
            const verifySig = httpsCallable(functions, 'verifyPaymentSignature');
            const verifyRes = await verifySig({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              planTier: selectedPlan,
              months
            }) as { data: { success: boolean, expiry: string } };

            if (verifyRes.data.success) {
              setTxnId(response.razorpay_payment_id);
              const computedExpiry = new Date(verifyRes.data.expiry);
              setExpiryDate(computedExpiry.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }));
              
              updateState({
                planTier: selectedPlan,
                isPremium: selectedPlan === 'premium',
                premiumPlan: months >= 12 ? 'annual' : 'monthly',
                planExpiry: computedExpiry.getTime(),
                premiumExpiry: verifyRes.data.expiry,
                razorpayPaymentId: response.razorpay_payment_id,
              });

              setCheckoutStep('success');
            }
          } catch (err: any) {
            console.error("Verification failed:", err);
            alert("Payment verification failed. If money was deducted, it will be refunded automatically.");
            setCheckoutStep('checkout');
          }
        },
        prefill: {
          name: state.userName || "",
          email: userEmail,
        },
        theme: {
          color: "#8ab6a3"
        },
        modal: {
          ondismiss: function() {
            setCheckoutStep('checkout');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        alert("Payment Failed: " + response.error.description);
        setCheckoutStep('checkout');
      });
      rzp.open();
      
    } catch (err: any) {
      console.error("Payment initiation failed:", err);
      alert(`Payment Error: ${err.message || 'Could not connect to payment gateway. Please try again.'}`);
      setCheckoutStep('checkout');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream font-sans overflow-x-hidden selection:bg-sage-pale selection:text-sage-dark text-charcoal relative">
      <Header hideMenuIcon />

      {/* Background decoration */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-sage-light/10 rounded-full mix-blend-multiply filter blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-gold-pale/20 rounded-full mix-blend-multiply filter blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full py-8 md:py-12 px-4 sm:px-6 md:px-12 lg:px-16 flex-1">
        
        <div className="mb-6">
          <button
            onClick={() => {
              // Redirect back to dashboard if set up, else landing
              navigate(state.isSetup ? '/dashboard' : '/');
            }}
            className="flex items-center gap-2 text-[14px] font-bold text-medium hover:text-sage transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {checkoutStep === 'checkout' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Plan Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-[#1E293B] border border-border dark:border-white/10 rounded-[24px] p-6 shadow-sm">
                <h2 className="font-serif text-[22px] font-semibold mb-4 text-charcoal dark:text-white">Order Summary</h2>

                {/* Plan Toggle */}
                <div className="flex bg-cream dark:bg-[#0F172A] rounded-xl p-1 border border-border dark:border-white/5 mb-6">
                  <button
                    onClick={() => { setSelectedPlan('standard'); setAppliedDiscount(0); setCouponSuccess(''); }}
                    className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
                      selectedPlan === 'standard'
                        ? 'bg-sage text-white shadow-sm'
                        : 'text-medium hover:text-sage'
                    }`}
                  >
                    Standard Plan
                  </button>
                  <button
                    onClick={() => { setSelectedPlan('premium'); setAppliedDiscount(0); setCouponSuccess(''); }}
                    className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                      selectedPlan === 'premium'
                        ? 'bg-gold text-charcoal shadow-sm'
                        : 'text-medium hover:text-gold'
                    }`}
                  >
                    <Sparkles size={14} className={selectedPlan === 'premium' ? 'text-charcoal' : 'text-gold'} />
                    Premium Plan
                  </button>
                </div>

                {/* Plan detail card */}
                <div className={`p-4 rounded-xl border mb-6 ${
                  selectedPlan === 'premium'
                    ? 'bg-gold-pale/25 border-gold/20 text-gold-dark'
                    : 'bg-sage-pale/35 border-sage/20 text-sage-dark'
                }`}>
                  <div className="flex items-center justify-between font-bold text-[15px] mb-1">
                    <span>{selectedPlan === 'premium' ? 'Premium AI Pack' : 'Standard Maternal Care'}</span>
                    <span className="font-serif">₹{basePrice}/mo</span>
                  </div>
                  <p className="text-[12px] opacity-90 leading-relaxed">
                    {selectedPlan === 'premium'
                      ? 'Includes Bloom AI chatbot, AI Food Hazard scanner, and clinical EHR data exports.'
                      : 'Includes Medical vaccine logs, Govt maternity scheme guides, and encrypted Partner Sync.'}
                  </p>
                </div>

                {/* Duration selector */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[12px] font-bold text-charcoal dark:text-white uppercase tracking-wider">Select Duration</label>
                    <span className={`text-[13px] font-semibold px-2.5 py-0.5 rounded-full ${
                      selectedPlan === 'premium' ? 'bg-gold-pale text-gold border border-gold/20' : 'bg-sage-pale text-sage border border-sage/20'
                    }`}>
                      {months} {months === 1 ? 'Month' : 'Months'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={months}
                    onChange={(e) => { setMonths(Number(e.target.value)); setAppliedDiscount(0); setCouponSuccess(''); }}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-cream dark:bg-[#0F172A] border border-border dark:border-white/10"
                    style={{
                      accentColor: selectedPlan === 'premium' ? "var(--color-gold, #F4A261)" : "var(--color-sage, #8ab6a3)"
                    }}
                  />
                  <div className="flex justify-between mt-1 text-[10px] text-medium font-bold px-1">
                    <span>1m</span>
                    <span>3m</span>
                    <span>6m</span>
                    <span>9m</span>
                    <span>12m</span>
                  </div>
                </div>

                {/* Pricing breakdown */}
                <div className="space-y-2 text-[13.5px] border-t border-border dark:border-white/10 pt-4 mb-4">
                  <div className="flex justify-between text-medium">
                    <span>Subtotal ({months} months)</span>
                    <span>₹{basePrice * months}</span>
                  </div>
                  {durationDiscount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                      <span>Duration Discount</span>
                      <span>-₹{durationDiscount}</span>
                    </div>
                  )}
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400 font-medium animate-in fade-in">
                      <span>Promo Coupon Discount</span>
                      <span>-₹{appliedDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-medium">
                    <span>Platform Fee & Tax</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">FREE</span>
                  </div>
                  <div className="h-px bg-border dark:border-white/10 my-2" />
                  <div className="flex justify-between font-serif text-[18px] font-bold text-charcoal dark:text-white">
                    <span>Total Amount</span>
                    <span>₹{finalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Coupon box */}
              <div className="bg-white dark:bg-[#1E293B] border border-border dark:border-white/10 rounded-[24px] p-5 shadow-sm">
                <label className="block text-[11px] font-bold text-charcoal dark:text-white uppercase tracking-wider mb-2">Have a coupon?</label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-light" />
                    <input
                      type="text"
                      placeholder="e.g. OPIN30 or VIPCARE90"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-border dark:border-white/10 rounded-xl bg-cream dark:bg-[#0F172A] text-[13px] font-semibold text-charcoal dark:text-white focus:outline-none focus:border-sage uppercase"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="px-4 py-2 bg-charcoal dark:bg-white dark:text-charcoal hover:bg-gray-800 dark:hover:bg-white/95 text-white font-bold text-[12px] rounded-xl transition-all"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[11.5px] text-red-500 font-semibold mt-2">{couponError}</p>}
                {couponSuccess && <p className="text-[11.5px] text-green-600 dark:text-green-400 font-semibold mt-2">{couponSuccess}</p>}
                <div className="text-[10px] text-light mt-2 italic">
                  💡 Hint: Enter <span className="font-bold text-sage">OPIN30</span> to claim 30 days of Premium for free!
                </div>
              </div>
            </div>

            {/* Right Column: Checkout Action */}
            <div className="lg:col-span-7 bg-white dark:bg-[#1E293B] border border-border dark:border-white/10 rounded-[28px] p-6 sm:p-8 shadow-sm flex flex-col justify-center items-center text-center">
              <h2 className="font-serif text-[28px] font-semibold text-charcoal dark:text-white mb-4">
                {finalPrice === 0 ? 'Activate Free Premium' : 'Complete Your Upgrade'}
              </h2>
              <p className="text-[14px] text-medium mb-8 max-w-[340px]">
                {finalPrice === 0
                  ? 'Your promo pass covers 100% of this period! Click below to unlock your premium features immediately without a credit card.'
                  : 'You will be redirected to our secure payment gateway to complete your purchase using UPI, Card, Netbanking, or Wallet.'}
              </p>

              <button
                onClick={handlePaymentSubmit}
                className={`w-full max-w-[320px] py-4 rounded-xl font-bold text-[15px] text-white transition-all shadow-md flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer
                  ${finalPrice === 0
                    ? 'bg-sage-dark hover:bg-sage text-white shadow-sage/20'
                    : selectedPlan === 'premium' ? 'bg-gold hover:bg-yellow-500 text-charcoal shadow-gold/20' : 'bg-sage hover:bg-sage-dark shadow-sage/20'}`}
              >
                {finalPrice === 0 ? <Sparkles size={18} /> : <ShieldCheck size={18} />}
                {finalPrice === 0 ? 'Claim Free Premium Access' : 'Proceed to Secure Checkout'}
              </button>

              <div className="flex items-center justify-center gap-1 text-[11px] text-light mt-6">
                {finalPrice === 0 ? (
                  <span>⚡ Instant 100% Free Activation • No Credit Card Required</span>
                ) : (
                  <span>🔒 Secured by Razorpay | SSL encryption | PCI-DSS compliant</span>
                )}
              </div>
            </div>
          </div>
        )}

        {checkoutStep === 'processing' && (
          <div className="bg-white dark:bg-[#1E293B] border border-border dark:border-white/10 rounded-[32px] p-12 shadow-md max-w-lg mx-auto text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <Loader2 className="w-16 h-16 animate-spin text-sage" />
              <ShieldCheck className="w-8 h-8 text-sage absolute" />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-serif text-[24px] font-semibold text-charcoal dark:text-white">Processing Subscription</h2>
              <p className="text-[14px] text-medium max-w-sm mx-auto leading-relaxed">
                Please do not close this window. We are verifying your promotional pass and activating your features.
              </p>
            </div>

            <div className="text-[11px] text-light border border-border/60 dark:border-white/5 rounded-xl p-3 bg-cream dark:bg-[#0F172A] italic">
              Updating your pregnancy workspace...
            </div>
          </div>
        )}

        {checkoutStep === 'success' && (
          <div className="bg-white dark:bg-[#1E293B] border border-border dark:border-white/10 rounded-[32px] p-8 sm:p-12 shadow-xl max-w-xl mx-auto text-center space-y-6 animate-in zoom-in duration-300">
            {/* Celebration Badge */}
            <div className="w-20 h-20 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400 shadow-md">
              <Check size={40} className="stroke-[3]" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-[28px] font-semibold text-charcoal dark:text-white flex items-center justify-center gap-2">
                {txnId.startsWith('FREE_') ? 'Free Trial Activated!' : 'Payment Successful!'} <Sparkles size={24} className="text-gold fill-gold" />
              </h2>
              <p className="text-[14.5px] text-medium leading-relaxed">
                {txnId.startsWith('FREE_')
                  ? 'Thank you! Your complimentary VIP access has been activated, and your pregnancy workspace is upgraded.'
                  : 'Thank you for upgrading! Your subscription is active, and your pregnancy workspace has been updated.'}
              </p>
            </div>

            {/* Receipt Details */}
            <div className="bg-cream dark:bg-[#0F172A] border border-border dark:border-white/5 rounded-2xl p-5 text-left text-[13px] space-y-2.5">
              <div className="flex justify-between">
                <span className="text-light font-medium">Plan Activated:</span>
                <span className="font-bold text-charcoal dark:text-white uppercase">
                  {selectedPlan === 'premium' ? '👑 Premium AI Pack' : '🩺 Standard Plan'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-light font-medium">Validity Period:</span>
                <span className="font-semibold text-charcoal dark:text-white">{months} Months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-light font-medium">Expires On:</span>
                <span className="font-semibold text-charcoal dark:text-white">{expiryDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-light font-medium">{txnId.startsWith('FREE_') ? 'Activation Pass:' : 'Transaction ID:'}</span>
                <span className="font-mono text-medium font-semibold select-all">{txnId}</span>
              </div>
              <div className="h-px bg-border dark:border-white/10 my-1" />
              <div className="flex justify-between">
                <span className="text-light font-medium">Account:</span>
                <span className="font-semibold text-charcoal dark:text-white">{auth.currentUser?.email || userEmail}</span>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <button
                onClick={() => {
                  navigate('/dashboard');
                }}
                className="w-full py-4 bg-charcoal text-[#ffffff] dark:bg-[#ffffff] dark:text-[#0F172A] hover:bg-gray-800 dark:hover:bg-white/90 font-bold text-[15px] rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                Go to Dashboard
              </button>
              
              <p className="text-[11px] text-light italic flex items-center justify-center gap-1.5">
                <Heart size={12} className="text-blush fill-blush" /> We hope Bloom helps make your pregnancy journey safer and happier!
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-[1000px] mx-auto px-4 md:px-10 lg:px-12 w-full pb-8">
        <Footer />
      </div>
    </div>
  );
};
