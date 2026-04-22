import React, { useState, useEffect } from 'react';
import { usePlanner } from '../../store';
import { WEEKLY_DATA } from '../../weeklyData';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
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

export const PregnancyTracker: React.FC = () => {
  const { state, updateState } = usePlanner();
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState(state.dueDate || '');

  // Calculate current week based on due date
  useEffect(() => {
    if (state.dueDate) {
      const due = new Date(state.dueDate);
      const today = new Date();
      // Due date is 40 weeks (280 days) from LMP
      const lmp = new Date(due.getTime() - 280 * 24 * 60 * 60 * 1000);
      const diffTime = Math.abs(today.getTime() - lmp.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      let currentWeek = Math.floor(diffDays / 7) + 1;

      // Clamp between 1 and 40
      if (currentWeek < 1) currentWeek = 1;
      if (currentWeek > 40) currentWeek = 40;

      setSelectedWeek(currentWeek);
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
    <div className="animate-in fade-in duration-300">
      <DailyKnowledgeDrop />
      <div className="mb-7 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-normal mb-1.5">Pregnancy Tracker</h2>
          {!state.isCalmModeActive && (
            <p className="text-[14px] text-medium max-w-[560px] leading-[1.7]">Follow your baby's journey week by week.</p>
          )}
        </div>

        <div className="bg-white border-[1.5px] border-border rounded-[12px] p-3 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sage-pale flex items-center justify-center text-sage shrink-0">
            <Calendar size={16} />
          </div>
          {isEditingDate ? (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={tempDate}
                onChange={(e) => setTempDate(e.target.value)}
                className="text-[13px] font-sans border-[1.5px] border-border rounded-[6px] px-2 py-1 focus:outline-none focus:border-sage"
              />
              <button
                onClick={handleSaveDate}
                className="text-[11px] font-semibold tracking-[0.5px] uppercase bg-sage text-white px-3 py-1.5 rounded-[6px] hover:opacity-90 transition-opacity"
              >
                Save
              </button>
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
      </div>

      {/* Week Navigation & Progress */}
      <div className="bg-white border-[1.5px] border-border rounded-[16px] p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevWeek}
            disabled={selectedWeek === 1}
            className="w-10 h-10 rounded-full border-[1.5px] border-border flex items-center justify-center text-charcoal hover:border-sage hover:text-sage disabled:opacity-30 disabled:hover:border-border disabled:hover:text-charcoal transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="text-center">
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
      </div>

      {/* Baby Size Visuals */}
      <div className="bg-gradient-to-br from-sage-pale to-cream border-[1.5px] border-sage-light rounded-[16px] p-8 shadow-sm mb-6 flex flex-col items-center text-center relative overflow-hidden">
        <div className="text-[12px] font-semibold tracking-[1.5px] uppercase text-sage mb-4">Baby Size</div>
        <div className="text-[80px] leading-none mb-4 animate-in zoom-in duration-500 delay-100">
          {weekData.babyEmoji}
        </div>
        <h3 className="font-serif text-[32px] font-medium text-charcoal mb-1">
          {weekData.length}
        </h3>
        <p className="text-[14px] text-medium mb-4 italic text-sage-dark">{MOTIVATIONAL_QUOTES[selectedWeek - 1]}</p>
        <div className="flex items-center gap-6 mt-2">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold tracking-[1px] uppercase text-medium mb-1">Length</span>
            <span className="text-[16px] font-medium text-charcoal bg-white px-4 py-1.5 rounded-full border border-border shadow-sm">{weekData.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold tracking-[1px] uppercase text-medium mb-1">Weight</span>
            <span className="text-[16px] font-medium text-charcoal bg-white px-4 py-1.5 rounded-full border border-border shadow-sm">{weekData.weight}</span>
          </div>
        </div>
      </div>

      {/* Development & Body Changes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-[1.5px] border-border rounded-[16px] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blush-pale flex items-center justify-center text-blush">
              👶
            </div>
            <h3 className="font-serif text-[20px] font-medium text-charcoal">Baby's Development</h3>
          </div>
          <p className="text-[14px] text-medium leading-[1.7]">
            {weekData.babyDev}
          </p>
        </div>

        <div className="bg-white border-[1.5px] border-border rounded-[16px] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gold-pale flex items-center justify-center text-gold">
              🤰
            </div>
            <h3 className="font-serif text-[20px] font-medium text-charcoal">Your Body</h3>
          </div>
          <p className="text-[14px] text-medium leading-[1.7]">
            {weekData.bodyChanges}
          </p>
        </div>
      </div>
    </div>
  );
};
