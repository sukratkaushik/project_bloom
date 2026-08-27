import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { usePlanner } from '../../store';
import { WEEKLY_DATA } from '../../weeklyData';
import { ChevronLeft, ChevronRight, Calendar, Sparkles } from 'lucide-react';
import { DailyKnowledgeDrop } from './DailyKnowledgeDrop';

const MOTIVATIONAL_QUOTES = [
  "A beautiful journey begins with a single step. You've got this!", // 1
  "Your body is preparing for a miracle. Trust the process.", // 2
  "A tiny spark of life is taking root. Sending you love and light.", // 3
  "The magic is happening! You are growing a tiny human.", // 4
  "Your baby's heart is beating, and your heart is expanding.", // 5
  "Every flutter and change is a step closer to meeting your little one.", // 6
  "You are doing an incredible job nurturing this new life.", // 7
  "Little fingers and toes are forming. You are a creator of miracles.", // 8
  "Your baby is growing stronger every day, and so are you.", // 9
  "You are a safe haven for your growing baby. Keep shining.", // 10
  "Every day brings you closer to the moment you meet your baby.", // 11
  "Your body is a wonderland, performing miracles every second.", // 12
  "Welcome to the second trimester! You are glowing and growing.", // 13
  "Your baby is practicing for the world. You are their perfect home.", // 14
  "You are strong, capable, and exactly what your baby needs.", // 15
  "Feel those little flutters? That's your baby saying hello!", // 16
  "Your baby is growing beautifully. Take a moment to celebrate you.", // 17
  "You are creating life. Never forget how amazing you are.", // 18
  "Halfway there! Look how far you've come on this beautiful journey.", // 19
  "A milestone reached! You and your baby are a wonderful team.", // 20
  "Your baby can taste what you eat. Share some sweetness today!", // 21
  "You are blooming! Every change is a sign of your baby's growth.", // 22
  "Take a deep breath. You are doing a spectacular job.", // 23
  "Your baby is listening to your heartbeat. It's their favorite song.", // 24
  "Your body is providing everything your baby needs to thrive.", // 25
  "Those little kicks are reminders of the life you're nurturing.", // 26
  "Welcome to the third trimester! The home stretch is here.", // 27
  "You are so strong, and your baby is getting ready for the world.", // 28
  "Every stretch and ache is a sign of the incredible work you're doing.", // 29
  "Your baby is surrounded by your love. You are an amazing mother.", // 30
  "Take time to rest. You are doing the most important work.", // 31
  "Your baby is growing plump and perfect. You've got this!", // 32
  "You are a powerhouse. Your baby is so lucky to have you.", // 33
  "Almost there! Your body knows exactly what to do.", // 34
  "You are beautiful, strong, and ready for whatever comes next.", // 35
  "Your baby is getting ready to meet you. The excitement is building!", // 36
  "You are on the brink of something magical. Trust your strength.", // 37
  "Every day is a day closer to holding your baby in your arms.", // 38
  "You are full term! Your body is incredible. Get ready for the magic.", // 39
  "The wait is almost over. You are about to meet the love of your life!" // 40
];

const calculateCurrentWeek = (dueDate?: string): number => {
  if (!dueDate) return 1;
  const due = new Date(dueDate);
  if (isNaN(due.getTime())) return 1;
  const lmp = new Date(due.getTime() - 280 * 24 * 60 * 60 * 1000);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lmp.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  let currentWeek = Math.floor(diffDays / 7) + 1;

  if (currentWeek < 1) currentWeek = 1;
  if (currentWeek > 40) currentWeek = 40;
  return currentWeek;
};

export const PregnancyTracker: React.FC = () => {
  const { state, updateState } = usePlanner();
  const [selectedWeek, setSelectedWeek] = useState<number>(() => calculateCurrentWeek(state.dueDate));
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState(state.dueDate || '');

  const tempSelectedDate = tempDate ? new Date(tempDate) : null;
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  if (tempSelectedDate) {
    tempSelectedDate.setHours(0, 0, 0, 0);
  }
  const isYetToBegin = tempSelectedDate ? (tempSelectedDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24 * 7) > 40 : false;

  // Calculate current week based on due date
  useEffect(() => {
    if (state.dueDate) {
      setSelectedWeek(calculateCurrentWeek(state.dueDate));
    }
  }, [state.dueDate]);

  const handleSaveDate = () => {
    if (tempDate) {
      updateState({ dueDate: tempDate });
      setIsEditingDate(false);
    }
  };

  const handlePrevWeek = () => {
    if (selectedWeek > 1) setSelectedWeek(selectedWeek - 1);
  };

  const handleNextWeek = () => {
    if (selectedWeek < 40) setSelectedWeek(selectedWeek + 1);
  };

  const weekData = WEEKLY_DATA.find(d => d.week === selectedWeek) || WEEKLY_DATA[0];
  const progressPercent = (selectedWeek / 40) * 100;

  return (
    <div className="space-y-6">
      <DailyKnowledgeDrop />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-normal mb-1.5">Pregnancy Tracker</h2>
          <p className="text-[14px] text-medium max-w-[560px] leading-[1.7]">Follow your baby's journey week by week.</p>
        </div>

        <div className="bg-white border-[1.5px] border-border rounded-[12px] p-3 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sage-pale flex items-center justify-center text-sage shrink-0">
            <Calendar size={16} />
          </div>
          {isEditingDate ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="text-[13px] font-sans border-[1.5px] border-border rounded-[6px] px-2 py-1 focus:outline-none focus:border-sage"
                />
                <button
                  onClick={handleSaveDate}
                  disabled={isYetToBegin}
                  className={`text-[11px] font-semibold tracking-[0.5px] uppercase text-white px-3 py-1.5 rounded-[6px] transition-opacity ${isYetToBegin ? 'bg-gray-300 cursor-not-allowed opacity-60' : 'bg-sage hover:opacity-90'}`}
                >
                  Save
                </button>
              </div>
              {isYetToBegin && (
                <div className="text-[11px] font-medium text-amber-700 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 px-2.5 py-1.5 rounded-[6px] animate-in fade-in slide-in-from-top-1">
                  ⚠️ You are yet to begin your journey.
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold tracking-[1px] uppercase text-medium">Estimated Due Date</span>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium text-charcoal">
                  {state.dueDate ? new Date(state.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
                </span>
                <button
                  onClick={() => setIsEditingDate(true)}
                  className="text-[11px] text-sage hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Week Navigation & Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="premium-card p-5"
      >
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevWeek}
            disabled={selectedWeek === 1}
            className="w-10 h-10 rounded-full border-[1.5px] border-border flex items-center justify-center text-charcoal hover:border-sage hover:text-sage disabled:opacity-30 disabled:hover:border-border disabled:hover:text-charcoal transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="text-center" key={`week-header-${selectedWeek}`}>
            <h3 className="font-serif text-[24px] font-medium text-charcoal">Week {selectedWeek}</h3>
            <span className="text-[12px] font-semibold tracking-[1px] uppercase text-medium">
              Trimester {selectedWeek <= 13 ? '1' : selectedWeek <= 27 ? '2' : '3'}
            </span>
          </div>

          <button
            onClick={handleNextWeek}
            disabled={selectedWeek === 40}
            className="w-10 h-10 rounded-full border-[1.5px] border-border flex items-center justify-center text-charcoal hover:border-sage hover:text-sage disabled:opacity-30 disabled:hover:border-border disabled:hover:text-charcoal transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <input
          type="range"
          min={1}
          max={40}
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(Number(e.target.value))}
          aria-label="Select pregnancy week"
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-cream accent-sage [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sage [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-sage [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-grab"
          style={{ background: `linear-gradient(to right, rgb(122,158,135) 0%, rgb(122,158,135) ${progressPercent}%, var(--color-cream, #faf6ef) ${progressPercent}%, var(--color-cream, #faf6ef) 100%)` }}
        />
        <div className="flex justify-between mt-2 text-[11px] font-semibold tracking-[1px] uppercase text-medium">
          <span>Week 1</span>
          <span>Week 40</span>
        </div>
      </motion.div>

      {/* Baby Size Visuals - Live */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mesh-glow-container glass-panel rounded-[24px] p-6 md:p-8 shadow-sm flex flex-col items-center text-center relative overflow-hidden"
      >
        <div className="mesh-glow-blob-1" />
        <div className="mesh-glow-blob-2" />
        
        <div className="text-[11px] font-semibold tracking-[1.5px] uppercase text-sage mb-2 relative z-10">Baby Size Comparison</div>
        
        <div className="relative w-24 h-24 bg-sage/10 rounded-full flex items-center justify-center shadow-inner mb-4 mt-2 relative z-10">
          <div className="absolute inset-0 bg-sage/20 rounded-full animate-pulse opacity-40" />
          <motion.div
            key={selectedWeek}
            initial={{ scale: 0.6, rotate: -15, opacity: 0 }}
            animate={{ scale: 1.0, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-[52px] relative z-10 select-none cursor-default filter drop-shadow-md"
          >
            {weekData.babyEmoji}
          </motion.div>
        </div>

        <h3 key={`size-title-${selectedWeek}`} className="font-serif text-[26px] font-medium text-charcoal mb-1 relative z-10 flex items-center gap-2 justify-center">
          Size of a <span className="text-sage font-semibold">{weekData.babySizeAnalogy}</span>
        </h3>

        <div key={`measurements-${selectedWeek}`} className="flex items-center gap-3 mt-3 mb-6 relative z-10">
          <div className="px-4 py-1.5 rounded-full bg-sage-pale/40 text-sage-dark text-[13px] font-bold border border-sage/20 shadow-xs flex items-center gap-1.5">
            <span>📏 Length:</span> <span className="font-sans font-medium text-charcoal">{weekData.length}</span>
          </div>
          <div className="px-4 py-1.5 rounded-full bg-sage-pale/40 text-sage-dark text-[13px] font-bold border border-sage/20 shadow-xs flex items-center gap-1.5">
            <span>⚖️ Weight:</span> <span className="font-sans font-medium text-charcoal">{weekData.weight}</span>
          </div>
        </div>

        <p key={`baby-dev-desc-${selectedWeek}`} className="text-[14px] text-medium leading-relaxed max-w-[480px] mb-6 relative z-10">
          {weekData.babyDev}
        </p>

        {/* Disclaimer */}
        <p className="text-[11px] text-medium/60 leading-normal max-w-[500px] border-t border-charcoal/5 pt-4 mt-2 font-sans font-normal relative z-10">
          *Disclaimer: These size comparisons are approximate references and indications based on clinical studies. For exact measurements and personalized growth assessments, it is best to consult with your obstetrician/gynecologist.*
        </p>
      </motion.div>

      {/* Development & Body Changes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          key={`baby-dev-block-${selectedWeek}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="premium-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blush-pale flex items-center justify-center text-blush">
              👶
            </div>
            <h3 className="font-serif text-[20px] font-medium text-charcoal">Baby's Development</h3>
          </div>
          <p className="text-[14px] text-medium leading-[1.7]">
            {weekData.babyDev}
          </p>
        </motion.div>

        <motion.div
          key={`body-changes-block-${selectedWeek}`}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="premium-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gold-pale flex items-center justify-center text-gold">
              🤰
            </div>
            <h3 className="font-serif text-[20px] font-medium text-charcoal">Your Body</h3>
          </div>
          <p className="text-[14px] text-medium leading-[1.7]">
            {weekData.bodyChanges}
          </p>
        </motion.div>
      </div>
    </div>
  );
};
