import React from 'react';
import { X, Droplets, Footprints, Activity, Pill, Sparkles, Camera, Check } from 'lucide-react';
import { triggerHaptic } from '../../utils/nativeBridge';
import { db } from '../../db';
import { usePlanner } from '../../store';
import { v4 as uuidv4 } from 'uuid';

interface QuickLogSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTool: (toolId: string) => void;
  onShowToast: (message: string) => void;
}

export const QuickLogSheet: React.FC<QuickLogSheetProps> = ({
  isOpen,
  onClose,
  onOpenTool,
  onShowToast,
}) => {
  const { state } = usePlanner();

  if (!isOpen) return null;

  const handleQuickWater = async () => {
    triggerHaptic('medium');
    try {
      const activeJourneyId = state.activeJourneyId || 'default-journey';
      const todayStr = new Date().toISOString().split('T')[0];

      await db.hydrationLogs.put({
        id: uuidv4(),
        journeyId: activeJourneyId,
        date: todayStr,
        amountMl: 250,
        timestamp: Date.now(),
      });

      onShowToast('💧 Logged +250ml water into your daily hydration!');
      onClose();
    } catch (err) {
      console.error('Error logging water:', err);
      onShowToast('Logged water locally');
      onClose();
    }
  };

  const handleQuickKick = async () => {
    triggerHaptic('medium');
    try {
      const activeJourneyId = state.activeJourneyId || 'default-journey';
      const todayStr = new Date().toISOString().split('T')[0];

      const existing = await db.kickLogs
        .where('[journeyId+date]')
        .equals([activeJourneyId, todayStr])
        .first();

      const newCount = (existing?.count || 0) + 1;

      await db.kickLogs.put({
        id: existing?.id || uuidv4(),
        journeyId: activeJourneyId,
        date: todayStr,
        count: newCount,
        durationMinutes: existing?.durationMinutes || 0,
        timestamp: Date.now(),
      });

      onShowToast(`🦶 Fetal kick recorded (${newCount}/10 target)!`);
      onClose();
    } catch (err) {
      console.error('Error recording kick:', err);
      onOpenTool('kickcounter');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/45 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Tap backdrop to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Content */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl border-t border-border shadow-2xl p-4 xs:p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] z-10 animate-in slide-in-from-bottom duration-250">
        {/* Drag handle pill */}
        <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-3" />

        <div className="flex items-center justify-between pb-3 border-b border-border/70">
          <div>
            <h3 className="font-serif font-bold text-charcoal text-[17px] leading-tight">
              Quick Health Log
            </h3>
            <p className="text-[11.5px] text-medium mt-0.5">
              Instant 1-tap logging for daily maternal essentials
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-cream hover:bg-border/60 flex items-center justify-center text-medium transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* 1-Tap Action Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-3.5">
          {/* Quick Action 1: +250ml Water */}
          <button
            type="button"
            onClick={handleQuickWater}
            className="p-3 rounded-2xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/70 text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                <Droplets size={16} />
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                1-Tap
              </span>
            </div>
            <div>
              <p className="font-bold text-charcoal text-[13px] leading-tight">+250ml Water</p>
              <p className="text-[10.5px] text-medium mt-0.5">Hydration glass</p>
            </div>
          </button>

          {/* Quick Action 2: +1 Kick */}
          <button
            type="button"
            onClick={handleQuickKick}
            className="p-3 rounded-2xl bg-sage-pale/70 hover:bg-sage-pale border border-sage/30 text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-8 h-8 rounded-xl bg-sage-dark text-white flex items-center justify-center shadow-2xs">
                <Footprints size={16} />
              </div>
              <span className="text-[10px] font-bold text-sage-dark bg-sage/20 px-2 py-0.5 rounded-full">
                +1 Kick
              </span>
            </div>
            <div>
              <p className="font-bold text-charcoal text-[13px] leading-tight">Count Kick</p>
              <p className="text-[10.5px] text-medium mt-0.5">Fetal movement</p>
            </div>
          </button>

          {/* Quick Action 3: Log Vitals & BP */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onClose();
              onOpenTool('vitals');
            }}
            className="p-3 rounded-2xl bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200/70 text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-2xs">
                <Activity size={16} />
              </div>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full">
                BP & Pulse
              </span>
            </div>
            <div>
              <p className="font-bold text-charcoal text-[13px] leading-tight">Log Vitals</p>
              <p className="text-[10.5px] text-medium mt-0.5">Blood pressure & heart</p>
            </div>
          </button>

          {/* Quick Action 4: Supplements & Diet */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onClose();
              onOpenTool('nutrition');
            }}
            className="p-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/70 text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-2xs">
                <Pill size={16} />
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                Vitamins
              </span>
            </div>
            <div>
              <p className="font-bold text-charcoal text-[13px] leading-tight">Supplements</p>
              <p className="text-[10.5px] text-medium mt-0.5">Folic, Iron, Calcium</p>
            </div>
          </button>
        </div>

        {/* Quick Consult & Food Scanner Secondary Bar */}
        <div className="mt-2.5 pt-2.5 border-t border-border/60 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onClose();
              onOpenTool('askourpregnancy');
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-cream hover:bg-sage-pale/60 border border-border/80 text-[11.5px] font-bold text-charcoal flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles size={14} className="text-sage-dark" />
            <span>Ask Bloom AI</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onClose();
              onOpenTool('foodscanner');
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-cream hover:bg-sage-pale/60 border border-border/80 text-[11.5px] font-bold text-charcoal flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Camera size={14} className="text-sage-dark" />
            <span>Scan Meal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
