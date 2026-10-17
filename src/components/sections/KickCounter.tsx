import React, { useState, useEffect } from 'react';
import { usePlanner } from '../../store';
import { db } from '../../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { ContextBanner } from '../ContextBanner';
import { ClinicalDisclaimer } from '../ClinicalDisclaimer';
import { 
  Baby, 
  Timer, 
  CheckCircle2, 
  Trash2, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Heart,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { triggerHaptic } from '../../utils/nativeBridge';

export const KickCounter: React.FC = () => {
  const { state } = usePlanner();
  const [isActive, setIsActive] = useState(false);
  const [kickCount, setKickCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  const rawHistory = useLiveQuery(
    () => {
      if (!state.activeJourneyId) return [];
      return db.kickSessions
        .where('journeyId')
        .equals(state.activeJourneyId)
        .reverse()
        .sortBy('startTime');
    },
    [state.activeJourneyId]
  ) || [];

  // Calendar Logic
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  
  const isSundayStart = state.calendarStartDay === 'sunday';
  const startDay = isSundayStart ? firstDay : (firstDay === 0 ? 6 : firstDay - 1);

  const days: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const logDates = new Set(rawHistory.map(session => {
    const d = new Date(session.startTime);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }));

  const history = selectedDateFilter 
    ? rawHistory.filter(session => {
        const d = new Date(session.startTime);
        const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return dStr === selectedDateFilter;
      })
    : rawHistory;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && startTime) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, startTime]);

  const handleStartSession = () => {
    triggerHaptic('light');
    setIsActive(true);
    setKickCount(0);
    const now = Date.now();
    setStartTime(now);
    setElapsedSeconds(0);
  };

  const handleKick = () => {
    if (!isActive || kickCount >= 10) return;
    const newCount = kickCount + 1;
    setKickCount(newCount);
    
    if (newCount >= 10) {
      triggerHaptic('success');
      setIsActive(false);
    } else {
      triggerHaptic('light');
    }
  };

  const handleSaveSession = async () => {
    if (!state.activeJourneyId || !startTime) return;
    triggerHaptic('selection');
    const endTime = Date.now();
    await db.kickSessions.put({
      id: uuidv4(),
      journeyId: state.activeJourneyId,
      startTime,
      endTime,
      kickCount,
      completed: kickCount >= 10,
      createdAt: endTime,
      updatedAt: endTime,
    });
    
    // Reset state
    setIsActive(false);
    setKickCount(0);
    setStartTime(null);
    setElapsedSeconds(0);
  };

  const handleDelete = async (id: string) => {
    triggerHaptic('light');
    await db.kickSessions.delete(id);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDuration = (start: number, end: number) => {
    const mins = Math.max(1, Math.round((end - start) / 60000));
    return `${mins} min${mins === 1 ? '' : 's'}`;
  };

  if (!state.activeJourneyId) {
    return (
      <div className="p-6 bg-white border border-border/80 rounded-2xl shadow-xs text-center">
        <Baby className="w-12 h-12 text-medium mx-auto mb-4" />
        <h2 className="font-serif text-2xl text-charcoal mb-2">Kick Counter</h2>
        <p className="text-medium text-[15px]">Please complete the app setup first to start tracking.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* Context Banner */}
      <ContextBanner 
        description="Cardiff Count-to-10 standard • Track baby's movements and daily vitality patterns." 
      />

      {/* Clinical Safety Disclaimer */}
      <ClinicalDisclaimer />

      {/* Main Interactive Session Card */}
      <div className="bg-white border border-border/80 rounded-2xl shadow-xs p-5 sm:p-7 relative overflow-hidden flex flex-col items-center justify-center">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sage-pale/25 rounded-full blur-3xl -z-10 pointer-events-none" />

        {kickCount >= 10 ? (
          /* Completed Session State */
          <div className="text-center py-4 animate-in zoom-in-95 duration-400 max-w-sm mx-auto">
            <div className="w-16 h-16 mx-auto bg-tulsi-light border border-sage/30 text-sage-dark rounded-full flex items-center justify-center mb-4 shadow-2xs">
              <CheckCircle2 className="w-8 h-8 text-sage" />
            </div>
            <h2 className="font-serif text-[24px] text-charcoal mb-1.5 font-normal">Reassuring! 10 Kicks Counted</h2>
            <p className="text-medium text-[13.5px] mb-6">
              It took <span className="font-semibold text-charcoal">{formatTime(elapsedSeconds)}</span> to complete today's session.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button 
                type="button"
                onClick={handleSaveSession}
                className="bg-sage hover:bg-sage-dark text-white rounded-xl font-medium px-6 py-3 text-[14px] transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                Save Session
              </button>
              <button
                type="button"
                onClick={() => {
                  setKickCount(0);
                  setIsActive(true);
                  setStartTime(Date.now());
                  setElapsedSeconds(0);
                }}
                className="bg-cream hover:bg-cream-dark text-charcoal border border-border/80 rounded-xl font-medium px-4 py-3 text-[14px] transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active or Idle State */
          <div className="flex flex-col items-center w-full">
            {/* Top Status Strip */}
            <div className="flex justify-between items-center w-full mb-5">
              <div className="bg-cream border border-border/70 text-charcoal px-3 py-1.5 rounded-full font-medium text-[12.5px] flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-sage" />
                <span>{isActive ? formatTime(elapsedSeconds) : '00:00'}</span>
                <span className="text-light text-[11px]">• Goal: 10 kicks</span>
              </div>
              {isActive && (
                <button 
                  type="button"
                  onClick={handleSaveSession}
                  className="text-medium hover:text-charcoal bg-cream/70 border border-border/70 text-[12px] font-medium px-3 py-1.5 rounded-full transition-colors active:scale-95 cursor-pointer"
                >
                  End Early
                </button>
              )}
            </div>

            {!isActive ? (
              /* Idle State - Welcoming & Serene CTA */
              <div className="flex flex-col items-center text-center py-4 space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sage-pale via-cream to-tulsi-light border border-sage/20 flex items-center justify-center text-sage shadow-2xs">
                  <Baby className="w-9 h-9" />
                </div>
                <div className="max-w-xs space-y-1">
                  <h3 className="font-serif text-[18px] text-charcoal font-normal">Ready to Count Baby's Kicks?</h3>
                  <p className="text-[12.5px] text-medium leading-relaxed">
                    Rest comfortably on your side and tap the button every time you feel a movement.
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={handleStartSession}
                  className="flex items-center gap-2.5 bg-sage hover:bg-sage-dark text-white rounded-xl font-medium px-7 py-3.5 text-[15px] transition-all shadow-xs active:scale-95 cursor-pointer mt-1"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Session</span>
                </button>
              </div>
            ) : (
              /* Active State - Interactive Kick Disc & 10-Dot Progress Tracker */
              <div className="flex flex-col items-center py-2 space-y-4">
                {/* 10-Dot Progress Indicator */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div 
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        i < kickCount 
                          ? 'bg-sage scale-110 shadow-2xs' 
                          : 'bg-cream-dark/80 border border-border/80'
                      }`}
                    />
                  ))}
                </div>

                {/* Big Interactive Tap Disc */}
                <button
                  type="button"
                  onClick={handleKick}
                  className="w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-sage via-[#7ba895] to-sage-dark text-white flex flex-col items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer relative group select-none"
                  aria-label="Tap to record fetal kick"
                >
                  <div className="absolute inset-0 rounded-full border-4 border-white/25 scale-[1.03] group-hover:scale-105 transition-transform" />
                  <span className="font-serif text-[68px] sm:text-[76px] leading-none mb-1 drop-shadow-2xs font-normal">
                    {kickCount}
                  </span>
                  <span className="font-semibold text-white/95 text-[13px] uppercase tracking-wider">
                    Tap for Kick
                  </span>
                  <span className="text-[11px] text-white/80 font-normal mt-0.5">
                    {10 - kickCount} more to 10
                  </span>
                </button>

                <p className="text-[12px] text-medium text-center">
                  Count kicks, rolls, flutters, or gentle jabs
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reassuring Clinical Guidance Card */}
      <div className="bg-gradient-to-br from-tulsi-light/50 via-cream to-white border border-sage/30 rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-sage/15 flex items-center justify-center text-sage-dark shrink-0 mt-0.5">
            <Heart className="w-5 h-5 text-sage" />
          </div>
          <div className="space-y-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-sage-dark bg-sage/15 px-2 py-0.5 rounded-full">
              Cardiff Count-to-10 Standard
            </span>
            <p className="text-[13px] text-charcoal leading-relaxed font-normal">
              ACOG recommends tracking movements daily from 28 weeks. 10 movements within 2 hours is reassuring. Babies typically become most active after snacks or cold water. If movements decrease noticeably over consecutive days, check in with your doctor.
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Activity Calendar */}
      <div className="bg-white border border-border/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-4 py-3.5 border-b border-border/60 bg-cream/40 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <CalendarIcon className="w-4 h-4 text-sage shrink-0" />
            <h3 className="font-serif text-[15px] sm:text-[17px] text-charcoal font-bold whitespace-nowrap">
              Monthly Activity
            </h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button 
              type="button"
              onClick={prevMonth} 
              className="p-1.5 hover:bg-cream-dark/60 text-charcoal rounded-lg transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-[12px] text-charcoal min-w-[76px] text-center">
              {currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}
            </span>
            <button 
              type="button"
              onClick={nextMonth} 
              className="p-1.5 hover:bg-cream-dark/60 text-charcoal rounded-lg transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {(isSundayStart ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']).map(d => (
              <div key={d} className="text-center text-[10.5px] font-semibold text-medium/70 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              if (d === null) return <div key={`empty-${i}`} className="w-8 h-8 sm:w-9 sm:h-9 mx-auto" />;
              
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const hasLog = logDates.has(dateStr);
              const isSelected = selectedDateFilter === dateStr;
              
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedDateFilter(isSelected ? null : dateStr)}
                  className={`aspect-square rounded-full flex flex-col items-center justify-center text-[13px] transition-all relative mx-auto w-8 h-8 sm:w-9 sm:h-9 cursor-pointer
                    ${isSelected ? 'bg-sage text-white font-bold shadow-2xs' : 'hover:bg-cream text-charcoal'}
                    ${hasLog && !isSelected ? 'font-semibold text-sage-dark bg-tulsi-light/40' : ''}
                  `}
                >
                  <span>{d}</span>
                  {hasLog && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-sage" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Sessions List */}
      <div className="bg-white border border-border/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-border/60 bg-cream/40 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sage" />
            <h3 className="font-serif text-[17px] sm:text-[18px] text-charcoal font-normal">Recent Sessions</h3>
          </div>
          {selectedDateFilter && (
            <button 
              type="button"
              onClick={() => setSelectedDateFilter(null)} 
              className="text-[12px] font-semibold text-sage hover:text-sage-dark cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </div>
        
        {history.length > 0 ? (
          <div className="divide-y divide-border/60">
            {history.map((session) => {
              const isFullGoal = session.completed || session.kickCount >= 10;
              const kickPlural = session.kickCount === 1 ? 'kick' : 'kicks';

              return (
                <div 
                  key={session.id} 
                  className="flex items-center justify-between p-3.5 sm:px-5 hover:bg-cream/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isFullGoal 
                        ? 'bg-tulsi-light/60 border-sage/30 text-sage-dark' 
                        : 'bg-cream border-border/80 text-medium'
                    }`}>
                      {isFullGoal ? (
                        <CheckCircle2 className="w-5 h-5 text-sage" />
                      ) : (
                        <Timer className="w-4 h-4 text-medium" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-serif text-[14.5px] text-charcoal font-medium">
                          {new Date(session.startTime).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          isFullGoal 
                            ? 'bg-sage/10 text-sage-dark' 
                            : 'bg-cream-dark/70 text-medium'
                        }`}>
                          {session.kickCount} {kickPlural}
                        </span>
                      </div>
                      <p className="text-[12px] text-medium mt-0.5">
                        {formatDuration(session.startTime, session.endTime)} duration • {
                          isFullGoal ? 'Completed 10 movements' : 'Session ended'
                        }
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(session.id)}
                    className="p-2 text-light hover:text-red-500 hover:bg-red-50/80 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
                    aria-label="Delete session"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-medium space-y-1.5">
            <Baby className="w-8 h-8 mx-auto text-medium/50 mb-2" />
            <p className="text-[13.5px] font-medium text-charcoal">No kick sessions logged yet</p>
            <p className="text-[12px] text-medium">Start your first count above to record baby's movement.</p>
          </div>
        )}
      </div>

    </div>
  );
};
