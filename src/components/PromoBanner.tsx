import React from 'react';
import { navigate } from '../utils/navigation';

export const PromoBanner: React.FC = () => {
  const promoText = "🎁 Special Offer: Get 3 Months of Premium Subscription for FREE! Use code BLOOM30 at checkout. Click to claim! ⚡";
  const repeatedText = Array(8).fill(promoText).join("   •   ");

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/checkout?plan=premium&months=3&coupon=BLOOM30');
  };

  return (
    <div 
      onClick={handleClick}
      className="w-full bg-gradient-to-r from-sage-dark via-sage to-gold text-white py-1.5 overflow-hidden select-none border-b border-border/20 cursor-pointer no-print relative z-[60] flex items-center rounded-t-[inherit]"
      title="Click to claim offer"
    >
      <div className="flex w-max animate-marquee whitespace-nowrap text-[10px] md:text-[11px] font-bold tracking-wider uppercase">
        <span className="px-4">{repeatedText}</span>
        <span className="px-4">{repeatedText}</span>
      </div>
    </div>
  );
};
