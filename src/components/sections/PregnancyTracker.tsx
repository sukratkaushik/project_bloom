import React, { useState, useEffect } from 'react';
import { usePlanner } from '../../store';
import { WEEKLY_DATA } from '../../weeklyData';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

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
        
        <div className="w-full h-2 bg-cream rounded-full overflow-hidden">
          <div 
            className="h-full bg-sage transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[11px] font-semibold tracking-[1px] uppercase text-medium">
          <span>Week 1</span>
          <span>Week 40</span>
        </div>
      </div>

      {/* Baby Size Visuals */}
      <div className="bg-gradient-to-br from-sage-pale to-cream border-[1.5px] border-sage-light rounded-[16px] p-8 shadow-sm mb-6 flex flex-col items-center text-center relative overflow-hidden">
        <div className="text-[12px] font-semibold tracking-[1.5px] uppercase text-sage mb-4">Baby Size</div>
        <div className="text-[80px] leading-none mb-4 animate-in zoom-in duration-500 delay-100">
          {weekData.fruitEmoji}
        </div>
        <h3 className="font-serif text-[28px] font-medium text-charcoal mb-2">
          Size of a {weekData.fruitName}
        </h3>
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
