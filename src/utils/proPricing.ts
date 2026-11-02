// Pro Plan web pricing (Razorpay). Keep in sync with createOrder in functions/src/index.ts.
export const PRO_REGULAR_MONTHLY_PRICE = 999;
export const PRO_PROMO_MONTHLY_PRICE = 499;

/**
 * Multi-month discount: ₹50 off for every full 3 months
 * (3 months → ₹50, 6 → ₹100, 9 → ₹150, 12 → ₹200).
 */
export function getProDurationDiscount(months: number): number {
  return Math.floor(months / 3) * 50;
}

export function getProPricing(months: number) {
  const durationDiscount = getProDurationDiscount(months);
  const originalTotal = PRO_REGULAR_MONTHLY_PRICE * months;
  const finalTotal = PRO_PROMO_MONTHLY_PRICE * months - durationDiscount;
  return {
    originalTotal,
    finalTotal,
    durationDiscount,
    totalSavings: originalTotal - finalTotal,
    perMonth: Math.round(finalTotal / months),
  };
}
