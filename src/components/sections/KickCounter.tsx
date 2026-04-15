import React, { useState, useEffect, useCallback } from 'react';
import { usePlanner } from '../../store';
import { db } from '../../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { 
  Baby, 
  Timer, 
  CheckCircle, 
  AlertTriangle, 
  Trash2, 
  Play, 
  Square 
} from 'lucide-react';

export const KickCounter: React.FC = () => {
  const { state } = usePlanner();
  const [isActive, setIsActive] = useState(false);
  const [kickCount, setKickCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Load last 7 days history
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  
  const history = useLiveQuery(
    () => {
      if (!state.activeJourneyId) return [];
      return db.kickSessions
        .where('[journeyId+startTime]')
        .between(
          [state.activeJourneyId, sevenDaysAgo],
          [state.activeJourneyId, Date.now()],
          true,
          true
        )
        .reverse()
        .sortBy('startTime');
    },
    [state.activeJourneyId]
  ) || [];

  // Warning logic
  const lastSession = history.length > 0 ? history[0] : null;
  const showRedWarning = lastSession && 
    !lastSession.completed && 
    (lastSession.endTime - lastSession.startTime) > 2 * 60 * 60 * 1000;

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
      setIsActive(false);
    }
  };

  const handleSaveSession = async () => {
    if (!state.activeJourneyId || !startTime) return;
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
    await db.kickSessions.delete(id);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDuration = (start: number, end: number) => {
    const mins = Math.floor((end - start) / 60000);
    return `${mins} min`;
  };

  if (!state.activeJourneyId) {
    return (
      <div className="p-6 bg-white border border-border rounded-2xl shadow-sm text-center">
        <Baby className="w-12 h-12 text-medium mx-auto mb-4" />
        <h2 className="font-serif text-2xl text-charcoal mb-2">Kick Counter</h2>
        <p className="text-medium text-[15px]">Please complete the app setup first to start tracking.</p>
      </div>
    );
  }

  const isWarningTime = isActive && elapsedSeconds > 120 * 60; // 120 mins

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Baby className="w-8 h-8 text-sage" />
        <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-normal text-charcoal">Kick Counter</h1>
      </div>

      {showRedWarning && (
        <div className="bg-critical-bg text-critical p-4 rounded-[16px] border border-red-200 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
          <p className="text-[14px] font-medium leading-snug">
            Your last session took unusually long. Please ensure baby is moving normally. Contact your doctor or call 108 if you are concerned.
          </p>
        </div>
      )}

      <div className="bg-white border-[1.5px] border-border rounded-[16px] shadow-sm p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sage-pale/30 rounded-full blur-3xl -z-10" />

        {kickCount >= 10 ? (
          <div className="text-center animate-in zoom-in-95 duration-500">
            <div className="w-[120px] h-[120px] mx-auto bg-green-50 text-sage rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-16 h-16" />
            </div>
            <h2 className="text-2xl font-semibold text-charcoal mb-2">Amazing! 10 kicks counted 🎉</h2>
            <p className="text-medium text-[15px] mb-8">It took {formatTime(elapsedSeconds)} to reach 10 kicks.</p>
            <button 
              onClick={handleSaveSession}
              className="bg-sage text-white rounded-[10px] font-semibold px-8 py-3.5 hover:bg-[#688a75] transition-colors shadow-sm"
            >
              Save Session
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            <div className="flex justify-between w-full mb-8">
              <div className="bg-sage-pale text-sage px-4 py-2 rounded-full font-medium text-[15px] flex items-center gap-2">
                <Timer className="w-4 h-4" />
                {isActive ? formatTime(elapsedSeconds) : '00:00'}
              </div>
              {isActive && (
                <button 
                  onClick={handleSaveSession}
                  className="text-critical font-medium bg-red-50 px-4 py-2 rounded-full hover:bg-red-100 transition-colors"
                >
                  End Early
                </button>
              )}
            </div>

            {!isActive ? (
              <button 
                onClick={handleStartSession}
                className="flex items-center gap-3 bg-sage text-white rounded-[10px] font-semibold px-8 py-4 text-lg hover:bg-[#688a75] transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <Play className="w-5 h-5 fill-current" />
                Start Session
              </button>
            ) : (
              <button
                onClick={handleKick}
                className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] bg-sage text-white rounded-full flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer relative group"
              >
                <div className="absolute inset-0 rounded-full border-4 border-white/20 scale-[1.03] group-hover:scale-105 transition-transform" />
                <span className="font-serif text-[72px] sm:text-[96px] leading-none mb-2 drop-shadow-sm">
                  {kickCount}
                </span>
                <span className="font-medium text-white/90 text-lg uppercase tracking-wider">
                  Tap for Kick
                </span>
              </button>
            )}

            {isWarningTime && (
              <div className="mt-8 bg-amber-50 text-amber-800 p-4 rounded-[12px] border border-amber-200 flex items-start gap-3 w-full animate-in slide-in-from-bottom-4">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-[14px]">
                  This session is taking longer than usual. Contact your doctor or call 108 if you are concerned.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {!state.isCalmModeActive && (
        <div className="bg-cream border-[1.5px] border-border rounded-[16px] p-5 shadow-inner">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
              <Baby className="w-5 h-5 text-sage" />
            </div>
            <div>
              <p className="text-[14px] text-charcoal font-medium leading-relaxed mb-1.5">
                ACOG recommends counting fetal movements daily from 28 weeks. 10 movements within 2 hours is reassuring.
              </p>
              <p className="text-[13px] text-medium">
                Your doctor or ASHA worker can advise you on kick counting.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      <div className="bg-white border-[1.5px] border-border rounded-[16px] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-gray-50/50">
          <h3 className="font-semibold text-charcoal text-[17px]">Recent Sessions</h3>
          <p className="text-[13px] text-medium mt-1">Last 7 days</p>
        </div>
        
        {history.length > 0 ? (
          <div className="divide-y divide-border">
            {history.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 sm:px-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  {session.completed ? (
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-5 h-5 text-sage" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-charcoal">
                      {new Date(session.startTime).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </p>
                    <div className="flex gap-3 text-[13px] text-medium mt-1">
                      <span>{session.kickCount} kicks</span>
                      <span>•</span>
                      <span>{formatDuration(session.startTime, session.endTime)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(session.id)}
                  className="p-2 text-medium hover:text-critical hover:bg-critical-bg rounded-lg transition-colors"
                  aria-label="Delete session"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-medium">
            <Baby className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No kick sessions recorded in the last 7 days.</p>
          </div>
        )}
      </div>
    </div>
  );
};
