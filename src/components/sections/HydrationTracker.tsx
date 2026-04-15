import React, { useState, useEffect } from 'react';
import { usePlanner } from '../../store';
import { db } from '../../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { 
  Droplets, 
  Plus, 
  Minus, 
  Check, 
  TrendingUp, 
  Flame,
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

  // UI Colors
  let ringColor = 'stroke-red-300';
  if (percentage >= 50) ringColor = 'stroke-sage';
  else if (percentage >= 25) ringColor = 'stroke-amber-400';

  // Calculate Streak
  const calculateStreak = () => {
    let streak = 0;
    const now = new Date();
    // Trace back
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLogs = logs.filter(l => l.date === dateStr);
        const dayTotal = dayLogs.reduce((acc, log) => acc + log.amountMl, 0);
        if (dayTotal >= goal * 0.8) streak++;
        else if (i !== 0) break; // if today is incomplete we still count yesterday's streak
    }
    return streak;
  };
  const streak = calculateStreak();

  // 7-day history circles (Mon-Sun)
  // For simplicity, we just show last 7 days ending today
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const hour = new Date().getHours();
  const showDehydrationWarning = hour >= 15 && percentage < 50;

  if (!state.activeJourneyId) {
    return (
      <div className="p-6 bg-white border border-border rounded-2xl shadow-sm text-center">
        <Droplets className="w-12 h-12 text-medium mx-auto mb-4" />
        <h2 className="font-serif text-2xl text-charcoal mb-2">Hydration Tracker</h2>
        <p className="text-medium text-[15px]">Please complete setup first.</p>
      </div>
    );
  }

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Droplets className="w-8 h-8 text-sage" />
        <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-normal text-charcoal">Hydration</h1>
      </div>

      {showDehydrationWarning && !state.isCalmModeActive && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-[12px] flex items-start gap-4 shadow-sm">
          <Flame className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[14px]">Stay hydrated!</p>
            <p className="text-[13px] mt-1">Dehydration can increase Braxton Hicks contractions. Coconut water and buttermilk count toward your intake. 🥥</p>
          </div>
        </div>
      )}

      {streak >= 3 && !state.isCalmModeActive && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-[12px] flex items-center justify-center gap-2 shadow-sm font-semibold text-[14px]">
          🔥 {streak} Day Streak! Keep it up!
        </div>
      )}

      <div className="bg-white border-[1.5px] border-border rounded-[16px] shadow-sm p-6 sm:p-8">
        
        {/* Progress Ring */}
        <div className="flex flex-col items-center justify-center mb-8 relative">
          <div className="relative w-[220px] h-[220px]">
             {/* Background circle */}
             <svg className="w-full h-full transform -rotate-90">
               <circle cx="110" cy="110" r={radius} className="stroke-gray-100" strokeWidth="16" fill="none" />
               <circle 
                 cx="110" cy="110" r={radius} 
                 className={`transition-all duration-1000 ease-out ${ringColor}`}
                 strokeWidth="16" fill="none"
                 strokeDasharray={circumference}
                 strokeDashoffset={dashoffset}
                 strokeLinecap="round"
               />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="font-serif text-[40px] text-charcoal leading-none mb-1">{consumed}</span>
               <span className="text-[13px] text-medium font-semibold uppercase tracking-wider">/ {goal} ml</span>
               
               {editingGoal ? (
                 <div className="flex items-center gap-1 mt-2">
                   <input type="number" value={tempGoal} onChange={e=>setTempGoal(e.target.value)} className="w-[60px] p-1 border border-border rounded text-center text-[12px]" autoFocus />
                   <button onClick={saveGoal} className="bg-sage text-white p-1 rounded"><Check className="w-3 h-3" /></button>
                 </div>
               ) : (
                 <button onClick={() => setEditingGoal(true)} className="text-[11px] text-sage font-medium mt-2 hover:underline">Edit Goal</button>
               )}
             </div>
          </div>
        </div>

        {/* Quick Add row */}
        <div className="text-[12px] font-semibold uppercase text-light mb-3 tracking-wider text-center">Quick Add</div>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { label: 'Small', ml: 150 },
            { label: 'Glass', ml: 250 },
            { label: 'Large', ml: 350 },
            { label: 'Bottle', ml: 500 },
          ].map(btn => (
            <button
              key={btn.ml}
              onClick={() => handleAdd(btn.ml)}
              className="px-4 py-3 bg-cream border border-border rounded-[12px] flex flex-col items-center gap-1 hover:border-sage hover:bg-sage-pale/20 transition-all hover:-translate-y-1 active:scale-95"
            >
              <Droplets className="w-5 h-5 text-sage" />
              <div className="text-[14px] font-semibold text-charcoal">{btn.ml}ml</div>
              <div className="text-[11px] text-medium">{btn.label}</div>
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="mt-6 flex justify-center">
          <div className="flex items-center border border-border rounded-lg bg-gray-50 overflow-hidden shadow-sm">
            <button onClick={() => setCustomAmount(Math.max(50, parseInt(customAmount)-50).toString())} className="px-4 py-2 text-medium hover:bg-gray-200"><Minus className="w-4 h-4" /></button>
            <input 
              type="number" 
              value={customAmount} 
              onChange={e => setCustomAmount(e.target.value)}
              className="w-[80px] text-center bg-transparent border-none outline-none font-semibold text-charcoal"
            />
            <span className="text-medium text-[13px] mr-2 pr-2 border-r border-border">ml</span>
            <button onClick={() => handleAdd(parseInt(customAmount))} className="px-4 py-2 bg-sage hover:bg-sage-dark text-white font-medium text-[13px] flex items-center gap-1">
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* History 7 day */}
        <div className="bg-white border-[1.5px] border-border rounded-[16px] shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-sage" />
            <h3 className="font-semibold text-charcoal text-[16px]">Last 7 Days</h3>
          </div>
          
          <div className="flex justify-between items-end h-[60px]">
            {last7Days.map((d, i) => {
              const dStr = d.toISOString().split('T')[0];
              const dayLogs = logs.filter(l => l.date === dStr);
              const total = dayLogs.reduce((acc, log) => acc + log.amountMl, 0);
              const pct = Math.min((total / goal) * 100, 100);
              
              let bg = 'bg-gray-100';
              if (total > 0) {
                if (pct >= 80) bg = 'bg-sage';
                else if (pct >= 50) bg = 'bg-amber-400';
                else bg = 'bg-red-300';
              }

              return (
                <div key={i} className="flex flex-col items-center gap-2 relative group">
                  <div className={`w-8 h-8 rounded-full ${bg} transition-colors flex items-center justify-center border border-black/5`}>
                    {pct >= 80 && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className="text-[11px] font-medium text-medium uppercase">
                    {d.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-[calc(100%+8px)] bg-charcoal text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {total}ml / {goal}ml
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Log */}
        <div className="bg-white border-[1.5px] border-border rounded-[16px] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-gray-50/50">
            <h3 className="font-semibold text-charcoal text-[17px]">Today's Log</h3>
          </div>
          <div className="h-[200px] overflow-y-auto">
            {todayLogs.length > 0 ? (
              <div className="divide-y divide-border">
                {todayLogs.reverse().map(log => (
                  <div key={log.id} className="flex justify-between items-center p-4 hover:bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <Droplets className="w-4 h-4 text-sage opacity-50" />
                      <span className="text-[15px] font-semibold text-charcoal">{log.amountMl} ml</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] text-medium">
                        {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <button onClick={() => handleDelete(log.id)} className="text-medium hover:text-critical p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-medium text-[14px]">
                No water logged yet today.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
