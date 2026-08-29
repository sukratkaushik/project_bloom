import React from 'react';
import { navigate } from '../utils/navigation';

export const PromoBanner: React.FC = () => {
  const promoText = "🎁 Special Offers: Get 30 Days Free with code OPIN30, or 90 Days Free with code VIPCARE90! Click to claim! ⚡";
  const repeatedText = Array(6).fill(promoText).join("   •   ");

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/checkout?plan=premium&months=3&coupon=VIPCARE90');
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
