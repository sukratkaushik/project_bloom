import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db';
import { usePlanner } from '../../../store';
import { Footprints, Droplets, Activity, Sparkles, ChevronRight, Plus, Calendar, ShieldCheck, Wind, Music } from 'lucide-react';
import { triggerHaptic } from '../../../utils/nativeBridge';

interface TodayTabProps {
  onOpenTool: (toolId: string) => void;
  onOpenAddRituals: () => void;
}

export const TodayTab: React.FC<TodayTabProps> = ({ onOpenTool, onOpenAddRituals }) => {
  const { state } = usePlanner();

  // Gestational calculations
  const due = state.dueDate ? new Date(state.dueDate) : new Date(Date.now() + 112 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffDays = Math.max(0, Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const completedDays = Math.max(1, 280 - diffDays);
  const currentWeek = Math.min(40, Math.max(1, Math.floor(completedDays / 7) + 1));
  const progressPercent = Math.min(100, Math.max(1, Math.round((completedDays / 280) * 100)));

  // Trimester calculation
  let trimester = 1;
  let trimesterName = 'Trimester 1';
  if (currentWeek > 27) {
    trimester = 3;
    trimesterName = 'Trimester 3 • The Final Stretch';
  } else if (currentWeek > 13) {
    trimester = 2;
    trimesterName = 'Trimester 2 • Golden Period';
  }

  // Fruit/veggie baby sizes for weeks
  const babySizes: Record<number, { name: string; icon: string; length: string; weight: string }> = {
    8: { name: 'Raspberry', icon: '🫐', length: '1.6 cm', weight: '1 g' },
    12: { name: 'Lime', icon: '🍋', length: '5.4 cm', weight: '14 g' },
    16: { name: 'Avocado', icon: '🥑', length: '11.6 cm', weight: '100 g' },
    20: { name: 'Banana', icon: '🍌', length: '25.6 cm', weight: '300 g' },
    24: { name: 'Ear of Corn', icon: '🌽', length: '30.0 cm', weight: '600 g' },
    28: { name: 'Eggplant', icon: '🍆', length: '37.6 cm', weight: '1.0 kg' },
    32: { name: 'Coconut', icon: '🥥', length: '42.4 cm', weight: '1.7 kg' },
    36: { name: 'Papaya', icon: '🍈', length: '47.4 cm', weight: '2.6 kg' },
    40: { name: 'Watermelon', icon: '🍉', length: '51.2 cm', weight: '3.4 kg' },
  };

  const closestWeekKey = Object.keys(babySizes)
    .map(Number)
    .reduce((prev, curr) => (Math.abs(curr - currentWeek) < Math.abs(prev - currentWeek) ? curr : prev), 24);
  const babySize = babySizes[closestWeekKey];

  // Dexie live queries for today's logs
  const todayStr = new Date().toISOString().split('T')[0];
  const activeJourneyId = state.activeJourneyId || 'default-journey';

  const todayWaterLogs = useLiveQuery(
    () => db.hydrationLogs.where({ journeyId: activeJourneyId, date: todayStr }).toArray(),
    [activeJourneyId, todayStr]
  );
  const totalWaterMl = (todayWaterLogs || []).reduce((acc, log) => acc + log.amountMl, 0);

  const todayKickSessions = useLiveQuery(
    () => db.kickSessions.where('journeyId').equals(activeJourneyId).reverse().limit(1).toArray(),
    [activeJourneyId]
  );
  const latestKicks = todayKickSessions?.[0]?.kickCount || 0;

  const todayVitals = useLiveQuery(
    () => db.vitalsLogs.where('journeyId').equals(activeJourneyId).reverse().limit(1).toArray(),
    [activeJourneyId]
  );
  const latestBp = todayVitals?.[0]
    ? `${todayVitals[0].systolic}/${todayVitals[0].diastolic}`
    : '118/76';

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* 1. Gestational Hero Card */}
      <div className="bg-gradient-to-br from-white via-cream to-sage-pale/40 border border-border/80 rounded-3xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-block bg-sage/15 text-sage-dark text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1.5 border border-sage/20">
              {trimesterName}
            </span>
            <h1 className="font-serif text-[26px] font-bold text-charcoal tracking-tight leading-tight">
              Week {currentWeek}
            </h1>
            <p className="text-[13px] text-medium font-medium mt-0.5">
              {diffDays} Days Remaining until Due Date
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-white/90 border border-border/70 shadow-xs flex flex-col items-center justify-center shrink-0">
            <span className="text-3xl leading-none">{babySize.icon}</span>
            <span className="text-[9.5px] font-bold text-medium mt-1 uppercase tracking-wide">
              {babySize.name.split(' ')[0]}
            </span>
          </div>
        </div>

        {/* Baby Metrology Row */}
        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[12px]">
          <div>
            <span className="text-medium text-[11px]">Size of baby:</span>
            <p className="font-bold text-charcoal">{babySize.name}</p>
          </div>
          <div className="text-center">
            <span className="text-medium text-[11px]">Est. Length:</span>
            <p className="font-bold text-charcoal">{babySize.length}</p>
          </div>
          <div className="text-right">
            <span className="text-medium text-[11px]">Est. Weight:</span>
            <p className="font-bold text-charcoal">{babySize.weight}</p>
          </div>
        </div>

        {/* Gestational Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center text-[11px] font-semibold mb-1">
            <span className="text-medium">Journey Progress</span>
            <span className="text-sage-dark">{progressPercent}% Complete</span>
          </div>
          <div className="w-full bg-border/60 rounded-full h-2 overflow-hidden">
            <div
              className="bg-sage-dark h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Your Daily Rituals (Customizable 4-Grid) */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-1.5">
            <Calendar size={16} className="text-sage-dark" />
            <h2 className="font-serif text-[16px] font-bold text-charcoal">
              Daily Health Rituals
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenAddRituals();
            }}
            className="text-[11.5px] text-sage-dark font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>Edit</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Ritual Card 1: Kicks */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenTool('kickcounter');
            }}
            className="bg-white border border-border/80 rounded-2xl p-3.5 text-left shadow-2xs hover:border-sage transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-sage-pale text-sage-dark flex items-center justify-center">
                <Footprints size={17} />
              </div>
              <span className="text-[10px] font-bold text-sage-dark bg-sage-pale px-1.5 py-0.5 rounded-full">
                ACTIVE
              </span>
            </div>
            <p className="font-bold text-charcoal text-[14px]">Kick Counter</p>
            <p className="text-[12px] text-medium mt-0.5">
              {latestKicks > 0 ? `${latestKicks} kicks logged` : 'Count 10 kicks'}
            </p>
          </button>

          {/* Ritual Card 2: Hydration */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenTool('hydration');
            }}
            className="bg-white border border-border/80 rounded-2xl p-3.5 text-left shadow-2xs hover:border-sage transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Droplets size={17} />
              </div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                {totalWaterMl >= 2500 ? 'GOAL MET' : 'HYDRATE'}
              </span>
            </div>
            <p className="font-bold text-charcoal text-[14px]">Water Tracker</p>
            <p className="text-[12px] text-medium mt-0.5">
              {(totalWaterMl / 1000).toFixed(2)}L of 2.5L
            </p>
          </button>

          {/* Ritual Card 3: Vitals */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenTool('vitals');
            }}
            className="bg-white border border-border/80 rounded-2xl p-3.5 text-left shadow-2xs hover:border-sage transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <Activity size={17} />
              </div>
              <span className="text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">
                NORMAL
              </span>
            </div>
            <p className="font-bold text-charcoal text-[14px]">Blood Pressure</p>
            <p className="text-[12px] text-medium mt-0.5">
              {latestBp} mmHg
            </p>
          </button>

          {/* Ritual Card 4: Ask Bloom AI */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenTool('askourpregnancy');
            }}
            className="bg-white border border-border/80 rounded-2xl p-3.5 text-left shadow-2xs hover:border-sage transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sparkles size={17} />
              </div>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full">
                AI OB-GYN
              </span>
            </div>
            <p className="font-bold text-charcoal text-[14px]">Ask Bloom AI</p>
            <p className="text-[12px] text-medium mt-0.5">
              Questions & guidance
            </p>
          </button>
        </div>
      </div>

      {/* 3. Mindful Breathing & Garbh Sanskar Card */}
      <div 
        onClick={() => {
          triggerHaptic('light');
          onOpenTool('breathing');
        }}
        className="bg-gradient-to-r from-sage-pale/60 via-cream to-rose-50/50 border border-sage-soft/40 rounded-2xl p-4 shadow-2xs hover:border-sage transition-all active:scale-[0.99] cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sage-dark text-white flex items-center justify-center shrink-0">
              <Wind size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-sage-dark uppercase tracking-wider">
                  Maternal Peace & Bonding
                </span>
                <span className="text-[10px] font-medium bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full">
                  100% Offline
                </span>
              </div>
              <h3 className="font-serif font-bold text-charcoal text-[14px] mt-0.5">
                Pranayama & Garbh Sanskar Audio
              </h3>
              <p className="text-[12px] text-medium mt-0.5">
                4-7-8 relaxing breath, Anulom Vilom, and calming Vedic soundscapes
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-sage-dark shrink-0 ml-2" />
        </div>
      </div>

      {/* 4. Stage-Adaptive Milestone Action Card */}
      <div className="bg-gradient-to-r from-soft-saffron/10 via-white to-gold/10 border border-soft-saffron/30 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-soft-saffron/20 text-soft-saffron-dark flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-soft-saffron-dark uppercase tracking-wider">
                Government Maternity Aid • MoHFW
              </span>
              <span className="text-[11px] font-bold text-charcoal">₹5,000 Direct Benefit</span>
            </div>
            <h3 className="font-serif font-bold text-charcoal text-[14px] mt-0.5">
              PMMVY Form 1A Registration
            </h3>
            <p className="text-[12px] text-medium mt-1 leading-relaxed">
              Submit your MCP card copy to your nearest Anganwadi / ASHA worker to claim your 1st pregnancy installment.
            </p>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onOpenTool('schemes');
              }}
              className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-bold text-sage-dark hover:underline cursor-pointer"
            >
              <span>Check Eligibility & Download Form</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
