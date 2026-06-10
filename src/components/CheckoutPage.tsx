import React, { useState, useEffect } from 'react';
import { usePlanner } from '../store';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { ArrowLeft, ShieldCheck, CreditCard, Sparkles, Check, Loader2, Landmark, Tag, Heart } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { state, updateState, toggleDarkMode } = usePlanner();

  // Get initial params from URL hash (e.g. #checkout?plan=premium&months=3)
  const getParams = () => {
    const hash = window.location.hash;
    const searchPart = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(searchPart);
    return {
      plan: (params.get('plan') || 'premium') as 'standard' | 'premium',
      months: parseInt(params.get('months') || '3', 10),
    };
  };

  const initialParams = getParams();
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'premium'>(initialParams.plan);
  const [months, setMonths] = useState<number>(initialParams.months);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('upi');
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

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

  // Compute pricing
  const basePrice = selectedPlan === 'premium' ? 499 : 99;
  const durationDiscount = Math.floor(months / 3) * 50;
  const rawSubtotal = basePrice * months - durationDiscount;
  const finalPrice = Math.max(0, rawSubtotal - appliedDiscount);

  const applyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    const cleanedCode = couponCode.trim().toUpperCase();

    if (cleanedCode === 'BLOOM50') {
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
      setCouponError('Invalid coupon code. Try BLOOM50.');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple mock validations
    if (paymentMethod === 'upi' && !upiId.includes('@')) {
      alert('Please enter a valid UPI ID (e.g. user@okhdfcbank)');
      return;
    }
    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        alert('Please enter a valid 16-digit Card Number');
        return;
      }
      if (cardExpiry.length < 5) {
        alert('Please enter expiration date (MM/YY)');
        return;
      }
      if (cardCvv.length < 3) {
        alert('Please enter a valid CVV');
        return;
      }
    }
    if (paymentMethod === 'netbanking' && !selectedBank) {
      alert('Please select a bank');
      return;
    }

    // Start payment processing
    setCheckoutStep('processing');

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
      alert("Could not connect to payment gateway. Please try again.");
      setCheckoutStep('checkout');
    }
  };

  return (
    <div className="min-h-screen bg-cream font-sans overflow-x-hidden selection:bg-sage-pale selection:text-sage-dark text-charcoal relative py-12 px-4 sm:px-6 md:px-12 lg:px-16">
      {/* Background decoration */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-sage-light/10 rounded-full mix-blend-multiply filter blur-3xl -z-10" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-gold-pale/20 rounded-full mix-blend-multiply filter blur-3xl -z-10" />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/80">
          <button
            onClick={() => {
              // Redirect back to dashboard if set up, else landing
              window.location.hash = state.isSetup ? '#dashboard' : '#';
            }}
            className="flex items-center gap-2 text-[14px] font-bold text-medium hover:text-sage transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Bloom Logo" className="w-8 h-8 object-contain" />
            <span className="font-serif text-[18px] font-semibold text-sage">Our Pregnancy Secure Checkout</span>
          </div>
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
                      placeholder="e.g. BLOOM50"
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
                  💡 Hint: Enter <span className="font-bold text-sage">BLOOM50</span> to claim a 50% discount on standard or premium tiers!
                </div>
              </div>
            </div>

            {/* Right Column: Checkout Payment Form */}
            <div className="lg:col-span-7 bg-white dark:bg-[#1E293B] border border-border dark:border-white/10 rounded-[28px] p-6 sm:p-8 shadow-sm">
              <h2 className="font-serif text-[24px] font-semibold text-charcoal dark:text-white mb-2">Secure Payment</h2>
              <p className="text-[13px] text-medium mb-6">Select a payment option below to finalize your upgrade instantly.</p>

              {/* Payment Methods tabs */}
              <div className="grid grid-cols-3 gap-2 bg-cream dark:bg-[#0F172A] p-1 border border-border dark:border-white/5 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`py-3 rounded-lg text-[13px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                    paymentMethod === 'upi'
                      ? 'bg-white dark:bg-[#1E293B] border border-border dark:border-white/10 text-sage font-extrabold shadow-sm'
                      : 'text-medium hover:text-sage'
                  }`}
                >
                  ⚡ <span className="text-[11px] sm:text-[12px]">UPI ID</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-3 rounded-lg text-[13px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                    paymentMethod === 'card'
                      ? 'bg-white dark:bg-[#1E293B] border border-border dark:border-white/10 text-sage font-extrabold shadow-sm'
                      : 'text-medium hover:text-sage'
                  }`}
                >
                  <CreditCard size={16} /> <span className="text-[11px] sm:text-[12px]">Credit/Debit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`py-3 rounded-lg text-[13px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                    paymentMethod === 'netbanking'
                      ? 'bg-white dark:bg-[#1E293B] border border-border dark:border-white/10 text-sage font-extrabold shadow-sm'
                      : 'text-medium hover:text-sage'
                  }`}
                >
                  <Landmark size={16} /> <span className="text-[11px] sm:text-[12px]">Net Banking</span>
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handlePaymentSubmit} className="space-y-5">
                {paymentMethod === 'upi' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-[11px] font-bold text-charcoal dark:text-white uppercase tracking-wider mb-2">Enter UPI ID</label>
                      <input
                        type="text"
                        placeholder="e.g. mobileNumber@upi, name@okhdfcbank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-border dark:border-white/10 rounded-xl bg-cream dark:bg-[#0F172A] text-[13.5px] font-medium text-charcoal dark:text-white focus:outline-none focus:border-sage"
                      />
                      <p className="text-[11px] text-light mt-1.5 leading-relaxed">
                        Verify your address. A payment notification request will be pushed to your Google Pay, PhonePe, or Paytm app.
                      </p>
                    </div>

                    {/* Common UPI shortcuts */}
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-light uppercase tracking-wider block mb-2">Popular UPI Options</span>
                      <div className="flex flex-wrap gap-2">
                        {['@okaxis', '@okhdfcbank', '@okicici', '@okbizaxis', '@paytm', '@ybl'].map((sfx) => (
                          <button
                            key={sfx}
                            type="button"
                            onClick={() => {
                              const base = upiId.includes('@') ? upiId.split('@')[0] : (state.userName ? state.userName.toLowerCase().replace(/\s+/g, '') : 'mom');
                              setUpiId(base + sfx);
                            }}
                            className="px-3 py-1.5 border border-border dark:border-white/5 rounded-lg text-[11px] font-bold text-medium hover:border-sage hover:text-sage bg-cream dark:bg-[#0F172A]"
                          >
                            {sfx}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-[11px] font-bold text-charcoal dark:text-white uppercase tracking-wider mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="Name printed on card"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-border dark:border-white/10 rounded-xl bg-cream dark:bg-[#0F172A] text-[13.5px] font-medium text-charcoal dark:text-white focus:outline-none focus:border-sage"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-charcoal dark:text-white uppercase tracking-wider mb-2">Card Number</label>
                      <input
                        type="text"
                        maxLength={19}
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                          setCardNumber(v);
                        }}
                        required
                        className="w-full px-4 py-3 border border-border dark:border-white/10 rounded-xl bg-cream dark:bg-[#0F172A] text-[13.5px] font-medium text-charcoal dark:text-white focus:outline-none focus:border-sage"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-charcoal dark:text-white uppercase tracking-wider mb-2">Expiry Date</label>
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => {
                            let v = e.target.value.replace(/\D/g, '');
                            if (v.length > 2) {
                              v = v.substring(0, 2) + '/' + v.substring(2);
                            }
                            setCardExpiry(v);
                          }}
                          required
                          className="w-full px-4 py-3 border border-border dark:border-white/10 rounded-xl bg-cream dark:bg-[#0F172A] text-[13.5px] font-medium text-charcoal dark:text-white focus:outline-none focus:border-sage text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-charcoal dark:text-white uppercase tracking-wider mb-2">CVV</label>
                        <input
                          type="password"
                          maxLength={3}
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          required
                          className="w-full px-4 py-3 border border-border dark:border-white/10 rounded-xl bg-cream dark:bg-[#0F172A] text-[13.5px] font-medium text-charcoal dark:text-white focus:outline-none focus:border-sage text-center"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-[11px] font-bold text-charcoal dark:text-white uppercase tracking-wider mb-2">Select Your Bank</label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-border dark:border-white/10 rounded-xl bg-cream dark:bg-[#0F172A] text-[13.5px] font-medium text-charcoal dark:text-white focus:outline-none focus:border-sage"
                      >
                        <option value="">-- Choose Bank --</option>
                        <option value="sbi">State Bank</option>
                        <option value="hdfc">HDFC Bank</option>
                        <option value="icici">ICICI Bank</option>
                        <option value="axis">Axis Bank</option>
                        <option value="kotak">Kotak Mahindra Bank</option>
                        <option value="pnb">Punjab National Bank</option>
                      </select>
                      <p className="text-[11px] text-light mt-1.5">
                        You will be redirected securely to your bank portal to sign in and complete the payment.
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-border dark:border-white/10 mt-6">
                  <button
                    type="submit"
                    className={`w-full py-4 rounded-xl font-bold text-[15px] text-white transition-all shadow-md flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0
                      ${selectedPlan === 'premium' ? 'bg-gold hover:bg-yellow-500 text-charcoal shadow-gold/20' : 'bg-sage hover:bg-sage-dark shadow-sage/20'}`}
                  >
                    <ShieldCheck size={18} /> Pay ₹{finalPrice} Securely
                  </button>

                  <div className="flex items-center justify-center gap-1 text-[11px] text-light mt-4 text-center">
                    <span>🔒 Secured by SSL encryption | PCI-DSS compliant checkout</span>
                  </div>
                </div>
              </form>
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
              <h2 className="font-serif text-[24px] font-semibold text-charcoal dark:text-white">Connecting Payment Gateway</h2>
              <p className="text-[14px] text-medium max-w-sm mx-auto leading-relaxed">
                Please do not close this window or hit back. We are encrypting your transaction data and updating your account subscriptions.
              </p>
            </div>

            <div className="text-[11px] text-light border border-border/60 dark:border-white/5 rounded-xl p-3 bg-cream dark:bg-[#0F172A] italic">
              Sending secure token to verification service...
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
                Payment Successful! <Sparkles size={24} className="text-gold fill-gold" />
              </h2>
              <p className="text-[14.5px] text-medium leading-relaxed">
                Thank you for upgrading! Your subscription is active, and your pregnancy workspace has been updated.
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
                <span className="text-light font-medium">Transaction ID:</span>
                <span className="font-mono text-medium font-semibold select-all">{txnId}</span>
              </div>
              <div className="h-px bg-border dark:border-white/10 my-1" />
              <div className="flex justify-between">
                <span className="text-light font-medium">Email Billing:</span>
                <span className="font-semibold text-charcoal dark:text-white">{userEmail}</span>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <button
                onClick={() => {
                  window.location.hash = '#dashboard';
                }}
                className="w-full py-4 bg-charcoal text-[#ffffff] dark:bg-[#ffffff] dark:text-[#0F172A] hover:bg-gray-800 dark:hover:bg-white/90 font-bold text-[15px] rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
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
    </div>
  );
};
