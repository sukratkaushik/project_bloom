import React from 'react';

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-cream overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-sage-light/20 rounded-full mix-blend-multiply filter blur-[80px] animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blush-light/20 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000"></div>
      
      {/* Logo Container */}
      <div className="relative flex flex-col items-center justify-center z-10 animate-in fade-in zoom-in duration-1000">
        <div className="relative w-32 h-32 flex items-center justify-center mb-6">
          {/* Animated Rings (Womb/Our Pregnancy symbolism) */}
          <div className="absolute inset-0 border-[3px] border-sage/40 rounded-full animate-[spin_4s_linear_infinite]" style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}></div>
          <div className="absolute inset-0 border-[4px] border-blush/50 rounded-full animate-[spin_3s_linear_infinite_reverse]" style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', transform: 'scale(0.85)' }}></div>
          <div className="absolute inset-0 border-[2px] border-gold/40 rounded-full animate-[spin_5s_linear_infinite]" style={{ borderRadius: '50% 50% 30% 70% / 70% 30% 70% 30%', transform: 'scale(0.7)' }}></div>
          
          {/* Pulsing Core Logo */}
          <div className="animate-[pulse_1.5s_ease-in-out_infinite] z-20">
            <img src="/logo.png" alt="Our Pregnancy Logo" className="w-36 h-36 md:w-48 md:h-48 object-contain drop-shadow-md" />
          </div>
        </div>
        
        {/* Full Name fading in */}
          <h1 className="font-serif text-[46px] md:text-[64px] font-semibold text-sage tracking-wide mb-3 drop-shadow-sm">
            Our Pregnancy
          </h1>
        
        {/* Subtitle fading in */}
        <div className="mt-4 text-[13px] uppercase tracking-[4px] text-sage font-bold animate-in fade-in duration-1000 delay-700">
          Your Pregnancy Companion
        </div>
      </div>
    </div>
  );
};
