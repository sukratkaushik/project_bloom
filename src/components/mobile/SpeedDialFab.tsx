import React, { useState } from 'react';
import { Plus, X, Droplets, Footprints, Activity } from 'lucide-react';
import { triggerHaptic } from '../../utils/nativeBridge';
import { db } from '../../db';
import { usePlanner } from '../../store';
import { v4 as uuidv4 } from 'uuid';

interface SpeedDialFabProps {
  onOpenTool: (toolId: string) => void;
  onShowToast: (message: string) => void;
}

export const SpeedDialFab: React.FC<SpeedDialFabProps> = ({ onOpenTool, onShowToast }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { state } = usePlanner();

  const toggleOpen = () => {
    triggerHaptic('light');
    setIsOpen((prev) => !prev);
  };

  const handleLogWater = async () => {
    triggerHaptic('medium');
    setIsOpen(false);

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
    } catch (err) {
      console.error('Error logging water from SpeedDial:', err);
      onShowToast('Logged water locally');
    }
  };

  const handleCountKicks = () => {
    triggerHaptic('light');
    setIsOpen(false);
    onOpenTool('kickcounter');
  };

  const handleLogVitals = () => {
    triggerHaptic('light');
    setIsOpen(false);
    onOpenTool('vitals');
  };

  return (
    <>
      {/* Backdrop when open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-charcoal/30 backdrop-blur-xs z-40 animate-in fade-in duration-150"
        />
      )}

      {/* Floating Speed Dial Container */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2.5">
        {isOpen && (
          <div className="flex flex-col items-end gap-2.5 mb-1 animate-in slide-in-from-bottom-3 duration-200">
            {/* Quick Action 1: Add 250ml Water */}
            <div className="flex items-center gap-2">
              <span className="bg-white/95 text-charcoal border border-border shadow-md px-2.5 py-1 rounded-full text-xs font-semibold">
                +250ml Water
              </span>
              <button
                type="button"
                onClick={handleLogWater}
                className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                aria-label="Log Water"
              >
                <Droplets size={20} />
              </button>
            </div>

            {/* Quick Action 2: Kick Counter */}
            <div className="flex items-center gap-2">
              <span className="bg-white/95 text-charcoal border border-border shadow-md px-2.5 py-1 rounded-full text-xs font-semibold">
                Kick Counter
              </span>
              <button
                type="button"
                onClick={handleCountKicks}
                className="w-12 h-12 rounded-full bg-sage-dark text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                aria-label="Count Kicks"
              >
                <Footprints size={20} />
              </button>
            </div>

            {/* Quick Action 3: Blood Pressure & Vitals */}
            <div className="flex items-center gap-2">
              <span className="bg-white/95 text-charcoal border border-border shadow-md px-2.5 py-1 rounded-full text-xs font-semibold">
                Log Blood Pressure
              </span>
              <button
                type="button"
                onClick={handleLogVitals}
                className="w-12 h-12 rounded-full bg-critical text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                aria-label="Log Blood Pressure"
              >
                <Activity size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Main Floating '+' Button */}
        <button
          type="button"
          onClick={toggleOpen}
          className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 active:scale-95 cursor-pointer ${
            isOpen
              ? 'bg-charcoal rotate-45 shadow-charcoal/20'
              : 'bg-sage-dark hover:bg-sage shadow-sage-dark/30 hover:-translate-y-0.5'
          }`}
          aria-label={isOpen ? 'Close Quick Log Menu' : 'Open Quick Log Menu'}
        >
          {isOpen ? <X size={24} /> : <Plus size={24} strokeWidth={2.5} />}
        </button>
      </div>
    </>
  );
};
