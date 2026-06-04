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
    <div className="glass-panel rounded-[24px] p-6 shadow-sm mb-6 relative overflow-hidden animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-sage font-semibold tracking-[1.2px] uppercase text-[11px]">
          <Sparkles size={14} className="animate-pulse" />
          <span>Daily Knowledge Drop</span>
        </div>

        {(state.dailyKnowledgeStreak || 0) > 0 && (
          <div className="flex items-center gap-1.5 bg-white/90 dark:bg-white/15 px-3 py-1 rounded-full border border-border/85 dark:border-white/15 shadow-xs text-[11px] font-bold text-orange-500 hover:scale-105 transition-transform duration-300">
            <Flame size={12} className="fill-orange-500 text-orange-500 animate-bounce" />
            <span>{state.dailyKnowledgeStreak} Day Streak</span>
          </div>
        )}
      </div>

      <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-[18px] p-6 border-[1.5px] border-white/20 dark:border-white/10 relative min-h-[140px] flex flex-col justify-center items-center text-center transition-all duration-500 shadow-xs hover:border-sage/40 hover:shadow-md">
        {!isRevealed ? (
          <div className="flex flex-col items-center cursor-pointer group w-full" onClick={handleReveal}>
            <div className="w-12 h-12 rounded-full bg-sage-pale/60 dark:bg-sage/10 flex items-center justify-center text-sage mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <Sparkles size={24} />
            </div>
            <h3 className="font-serif text-[19px] font-medium text-charcoal mb-1">Unlock Today's Fact</h3>
            <p className="text-[12.5px] text-medium">Tap to reveal and build your streak!</p>
          </div>
        ) : (
          <div className="w-full animate-in zoom-in-95 duration-500 text-left">
            <div className="mb-4">
              <span className="text-[10px] font-bold tracking-[1.5px] uppercase text-red-500 bg-red-50 dark:bg-red-950/20 px-2.5 py-1 rounded-[6px] border border-red-200/30">Myth</span>
              <p className="font-serif text-[17px] font-semibold text-charcoal mt-2.5 mb-4 leading-snug italic">"{knowledge.myth}"</p>
            </div>
            <div className="border-t border-border/70 dark:border-border/10 pt-4">
              <span className="text-[10px] font-bold tracking-[1.5px] uppercase text-sage bg-sage-pale dark:bg-sage/10 px-2.5 py-1 rounded-[6px] border border-sage-light/30">Fact</span>
              <p className="text-[13.5px] text-medium dark:text-charcoal/90 mt-2.5 leading-[1.65] font-sans">{knowledge.fact}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
