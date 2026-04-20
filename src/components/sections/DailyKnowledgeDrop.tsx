import React, { useState } from 'react';
import { usePlanner } from '../../store';
import { Sparkles, Flame } from 'lucide-react';

const DAILY_KNOWLEDGE = [
  { myth: "You need to eat for two during pregnancy.", fact: "You only need about 300 extra calories a day in the second and third trimesters." },
  { myth: "You shouldn't exercise while pregnant.", fact: "Moderate exercise like walking or swimming is actually highly recommended and beneficial." },
  { myth: "Heartburn means your baby will have lots of hair.", fact: "This one is actually partially true! Hormones that cause heartburn also promote fetal hair growth." },
  { myth: "You shouldn't drink coffee while pregnant.", fact: "You can safely consume up to 200mg of caffeine (about one 12oz cup of coffee) per day." },
  { myth: "Carrying high means it's a girl, carrying low means a boy.", fact: "How you carry depends entirely on your body type, muscle tone, and the baby's position." },
  { myth: "Spicy food can trigger labor.", fact: "There is no scientific evidence that spicy food induces labor." },
  { myth: "You must sleep on your left side.", fact: "While left side is optimal for blood flow, sleeping on your right side is also perfectly safe." },
];

export const DailyKnowledgeDrop: React.FC = () => {
  const { state, claimDailyKnowledge } = usePlanner();
  // If they already claimed today, reveal it by default
  const today = new Date().toISOString().split('T')[0];
  const hasClaimedToday = state.lastKnowledgeDropDate === today;
  const [isRevealed, setIsRevealed] = useState(hasClaimedToday);

  // Use day of the year to pick a consistent daily fact
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const knowledge = DAILY_KNOWLEDGE[dayOfYear % DAILY_KNOWLEDGE.length];

  const handleReveal = () => {
    setIsRevealed(true);
    if (!hasClaimedToday) {
      claimDailyKnowledge();
    }
  };

  return (
    <div className="bg-gradient-to-br from-sage-pale to-cream border-[1.5px] border-sage-light rounded-[16px] p-6 shadow-sm mb-6 relative overflow-hidden animate-in fade-in duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 text-sage font-semibold tracking-[1px] uppercase text-[12px]">
          <Sparkles size={16} />
          <span>Daily Knowledge Drop</span>
        </div>
        
        {(state.dailyKnowledgeStreak || 0) > 0 && (
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-border shadow-sm text-[12px] font-semibold text-orange-500">
            <Flame size={14} className="fill-orange-500 text-orange-500" />
            <span>{state.dailyKnowledgeStreak} Day Streak</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[12px] p-6 border-[1.5px] border-border relative min-h-[140px] flex flex-col justify-center items-center text-center transition-all duration-500">
        {!isRevealed ? (
          <div className="flex flex-col items-center cursor-pointer group" onClick={handleReveal}>
            <div className="w-12 h-12 rounded-full bg-sage-pale flex items-center justify-center text-sage mb-3 group-hover:scale-110 transition-transform">
              <Sparkles size={24} />
            </div>
            <h3 className="font-serif text-[20px] font-medium text-charcoal mb-1">Unlock Today's Fact</h3>
            <p className="text-[13px] text-medium">Tap to reveal and build your streak!</p>
          </div>
        ) : (
          <div className="w-full animate-in zoom-in-95 duration-500">
            <div className="mb-4">
              <span className="text-[11px] font-bold tracking-[1.5px] uppercase text-blush bg-blush-pale px-2 py-1 rounded-[4px]">Myth</span>
              <p className="font-serif text-[18px] text-charcoal mt-2 mb-4 leading-snug">"{knowledge.myth}"</p>
            </div>
            <div className="border-t border-border pt-4">
              <span className="text-[11px] font-bold tracking-[1.5px] uppercase text-sage bg-sage-pale px-2 py-1 rounded-[4px]">Fact</span>
              <p className="text-[14px] text-medium mt-2 leading-[1.6]">{knowledge.fact}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
