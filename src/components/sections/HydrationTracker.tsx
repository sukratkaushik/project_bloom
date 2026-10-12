import React, { useState, useEffect } from 'react';
import { usePlanner } from '../../store';
import { db } from '../../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { ContextBanner } from '../ContextBanner';
import { 
  Droplets, 
  Plus, 
  Minus, 
  Check, 
  TrendingUp, 
  Trash2
} from 'lucide-react';

export const HydrationTracker: React.FC = () => {
  const { state } = usePlanner();
  const [goal, setGoal] = useState(() => {
    const saved = localStorage.getItem('bloom-hydration-goal');
    return saved ? parseInt(saved, 10) : 2500;
  });
  const [customAmount, setCustomAmount] = useState<string>('200');
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(goal.toString());

  const today = new Date().toISOString().split('T')[0];

  const logs = useLiveQuery(
    () => {
      if (!state.activeJourneyId) return [];
      return db.hydrationLogs
        .where('journeyId')
        .equals(state.activeJourneyId)
        .sortBy('timestamp');
    },
    [state.activeJourneyId]
  ) || [];

  const todayLogs = logs.filter(l => l.date === today);
  const consumed = todayLogs.reduce((acc, log) => acc + log.amountMl, 0);
  const percentage = Math.min(Math.round((consumed / goal) * 100), 100);

  const saveGoal = () => {
    const val = parseInt(tempGoal, 10);
    if (!isNaN(val) && val > 0) {
      setGoal(val);
      localStorage.setItem('bloom-hydration-goal', val.toString());
    }
    setEditingGoal(false);
  };

  const handleAdd = async (amount: number) => {
    if (!state.activeJourneyId) return;
    await db.hydrationLogs.put({
      id: uuidv4(),
      journeyId: state.activeJourneyId,
      date: today,
      timestamp: Date.now(),
      amountMl: amount,
    });
  };

  const handleDelete = async (id: string) => {
    await db.hydrationLogs.delete(id);
  };

  // UI Colors - Branded Sage palette (calm, maternal green, never alarming or yellow)
  let ringColor = 'stroke-sage';
  if (percentage >= 100) ringColor = 'stroke-sage-dark';
  else if (percentage >= 80) ringColor = 'stroke-sage';
  else ringColor = 'stroke-sage';

  // Calculate Streak
  const calculateStreak = () => {
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLogs = logs.filter(l => l.date === dateStr);
        const dayTotal = dayLogs.reduce((acc, log) => acc + log.amountMl, 0);
        if (dayTotal >= goal * 0.8) streak++;
        else if (i !== 0) break;
    }
    return streak;
  };
  const streak = calculateStreak();

  // Current week (Mon-Sun)
  const currentWeekDays = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff + i);
    return d;
  });

  if (!state.activeJourneyId) {
    return (
      <div className="p-6 bg-white border border-border/80 rounded-2xl shadow-xs text-center">
        <Droplets className="w-12 h-12 text-medium mx-auto mb-4" />
        <h2 className="font-serif text-2xl text-charcoal mb-2">Hydration Tracker</h2>
        <p className="text-medium text-[15px]">Please complete setup first.</p>
      </div>
    );
  }

  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <ContextBanner 
        description={
          <>
            <strong className="font-semibold text-charcoal">Gentle reminder:</strong> Staying well hydrated helps prevent Braxton Hicks contractions. Coconut water and chaas count too! 🥥
          </>
        }
      />

      {streak >= 3 && (
        <div className="bg-tulsi-light/70 border border-sage/30 text-sage-dark p-2.5 rounded-xl flex items-center justify-center gap-2 shadow-2xs font-semibold text-[13px]">
          🌱 {streak} Day Streak! Excellent consistency!
        </div>
      )}

      {/* Main Hydration Card */}
      <div className="bg-white border border-border/80 rounded-2xl shadow-xs p-4 sm:p-5">
        
        {/* Progress Ring - Compact & Proportional */}
        <div className="flex flex-col items-center justify-center mb-4 relative">
          <div className="relative w-[170px] h-[170px]">
             {/* Background circle track & very light shaded inner circle */}
             <svg className="w-full h-full transform -rotate-90">
               <circle 
                 cx="85" 
                 cy="85" 
                 r={radius} 
                 className="stroke-sage/20" 
                 strokeWidth="12" 
                 fill="rgba(138, 182, 163, 0.04)" 
               />
               <circle 
                 cx="85" cy="85" r={radius} 
                 className={`transition-all duration-1000 ease-out ${ringColor}`}
                 strokeWidth="12" fill="none"
                 strokeDasharray={circumference}
                 strokeDashoffset={dashoffset}
                 strokeLinecap="round"
               />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="font-serif text-[34px] sm:text-[38px] text-charcoal leading-none mb-0.5">{consumed}</span>
               <span className="text-[11.5px] text-medium font-semibold uppercase tracking-wider">/ {goal} ml</span>
               
               {editingGoal ? (
                 <div className="flex items-center gap-1.5 mt-1.5 bg-white px-2 py-1 rounded-lg border border-border shadow-2xs">
                   <input 
                     type="number" 
                     value={tempGoal} 
                     onChange={e => setTempGoal(e.target.value)} 
                     className="w-[56px] py-0.5 border border-border/80 rounded text-center text-[12px] font-bold text-charcoal outline-none focus:border-sage" 
                     autoFocus 
                   />
                   <button onClick={saveGoal} className="bg-sage hover:bg-sage-dark text-white p-1 rounded-md active:scale-95 transition-all"><Check className="w-3 h-3" /></button>
                 </div>
               ) : (
                 <button onClick={() => setEditingGoal(true)} className="text-[11px] text-sage font-medium mt-1 hover:underline active:scale-95">Edit Goal</button>
               )}
             </div>
          </div>
        </div>

        {/* Quick Add Row: Exactly 4 options in ONE responsive row */}
        <div className="text-[11px] font-bold uppercase text-medium/80 mb-2.5 tracking-wider text-center">Quick Add</div>
        <div className="grid grid-cols-4 gap-2 sm:gap-2.5 w-full">
          {[
            { label: 'Small', ml: 150 },
            { label: 'Glass', ml: 250 },
            { label: 'Large', ml: 350 },
            { label: 'Bottle', ml: 500 },
          ].map(btn => (
            <button
              key={btn.ml}
              type="button"
              onClick={() => handleAdd(btn.ml)}
              className="py-2.5 px-1 sm:px-2 bg-cream/70 hover:bg-sage-pale/40 border border-border/80 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 group shadow-2xs hover:border-sage cursor-pointer"
            >
              <Droplets className="w-4 h-4 text-sage group-hover:scale-110 transition-transform" />
              <div className="text-[13px] sm:text-[14px] font-bold text-charcoal leading-none">{btn.ml}ml</div>
              <div className="text-[10px] sm:text-[11px] text-medium font-medium leading-none">{btn.label}</div>
            </button>
          ))}
        </div>

        {/* Custom Input Row */}
        <div className="mt-4 flex justify-center">
          <div className="flex items-center border border-border/80 rounded-xl bg-cream/50 overflow-hidden shadow-2xs">
            <button 
              type="button"
              onClick={() => setCustomAmount(Math.max(50, (parseInt(customAmount, 10) || 0) - 50).toString())} 
              className="px-3 py-2 text-medium hover:bg-cream hover:text-charcoal active:scale-95 transition-all"
              aria-label="Decrease custom amount"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input 
              type="number" 
              value={customAmount} 
              onChange={e => setCustomAmount(e.target.value)}
              className="w-[64px] text-center bg-transparent border-none outline-none font-semibold text-charcoal text-[14px]"
              min="50"
              step="50"
            />
            <span className="text-medium text-[12px] font-medium mr-2 pr-2 border-r border-border/80">ml</span>
            <button 
              type="button"
              onClick={() => handleAdd(parseInt(customAmount, 10) || 0)} 
              className="px-3.5 py-2 bg-sage hover:bg-sage-dark active:scale-95 text-white font-medium text-[12.5px] transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Week History & Today's Log Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* History 7 day */}
        <div className="bg-white border border-border/80 rounded-2xl shadow-xs p-4">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-sage" />
              <h3 className="font-semibold text-charcoal text-[14.5px]">This Week</h3>
            </div>
            <span className="text-[11px] text-medium font-medium">
              Goal: {goal} ml/day
            </span>
          </div>
          
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {currentWeekDays.map((d, i) => {
              const dStr = d.toISOString().split('T')[0];
              const isToday = dStr === today;
              const dayLogs = logs.filter(l => l.date === dStr);
              const total = dayLogs.reduce((acc, log) => acc + log.amountMl, 0);
              const pct = Math.min((total / goal) * 100, 100);
              
              let bg = 'bg-cream/50 border-border/60 text-light';
              if (total > 0) {
                if (pct >= 80) bg = 'bg-sage border-sage text-white shadow-2xs';
                else if (pct >= 50) bg = 'bg-tulsi-light border-sage/40 text-sage-dark';
                else bg = 'bg-tulsi-light/70 border-sage/30 text-sage-dark';
              }

              return (
                <div key={i} className="flex flex-col items-center gap-1.5 relative group">
                  <div className={`w-8 h-8 rounded-full border transition-all flex items-center justify-center ${bg} ${isToday ? 'ring-2 ring-sage/50 ring-offset-1' : ''}`}>
                    {pct >= 80 ? (
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : total > 0 ? (
                      <span className="text-[10px] font-bold">{Math.round(pct)}%</span>
                    ) : (
                      <span className="text-[10px] opacity-40">•</span>
                    )}
                  </div>
                  <span className={`text-[10.5px] font-medium uppercase ${isToday ? 'text-sage font-bold' : 'text-medium'}`}>
                    {d.toLocaleDateString('en-US', { weekday: 'narrow' })}
                  </span>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-[calc(100%+6px)] bg-charcoal text-white text-[11px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-sm">
                    {d.toLocaleDateString('en-US', { weekday: 'short' })}: {total}ml / {goal}ml
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Log */}
        <div className="bg-white border border-border/80 rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 border-b border-border/70 bg-cream/30 flex items-center justify-between">
            <h3 className="font-semibold text-charcoal text-[14.5px]">Today's Log</h3>
            <span className="text-[11px] text-medium font-medium">
              {todayLogs.length} {todayLogs.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
          <div className="min-h-[110px] max-h-[180px] overflow-y-auto custom-scrollbar flex-1">
            {todayLogs.length > 0 ? (
              <div className="divide-y divide-border/60">
                {todayLogs.slice().reverse().map(log => (
                  <div key={log.id} className="flex justify-between items-center px-4 py-2 hover:bg-cream/20 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-sage-pale/40 flex items-center justify-center text-sage">
                        <Droplets className="w-3 h-3" />
                      </div>
                      <span className="text-[13.5px] font-semibold text-charcoal">{log.amountMl} ml</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11.5px] text-medium">
                        {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <button 
                        type="button"
                        onClick={() => handleDelete(log.id)} 
                        className="text-medium/60 hover:text-critical p-1 rounded-md hover:bg-critical-bg/40 transition-colors cursor-pointer"
                        aria-label="Delete water entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full min-h-[110px] flex flex-col items-center justify-center text-center p-4">
                <Droplets className="w-5 h-5 text-sage/40 mb-1" />
                <p className="text-charcoal/80 font-medium text-[12.5px]">No water logged yet today</p>
                <p className="text-medium text-[11px] mt-0.5">Tap any quick option above to record intake.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
