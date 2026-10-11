import React, { useState, useEffect } from 'react';
import { usePlanner } from '../../store';
import { db } from '../../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { 
  Timer, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw, 
  Phone,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Trash2,
  Play,
  Square
} from 'lucide-react';
import { triggerHaptic } from '../../utils/nativeBridge';

export const ContractionTimer: React.FC = () => {
  const { state } = usePlanner();
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // State for current active contraction
  const [activeStartedAt, setActiveStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Initialize or load current session
  useEffect(() => {
    let currentSession = localStorage.getItem('ourpregnancy_active_contraction_session');
    if (!currentSession) {
      currentSession = uuidv4();
      localStorage.setItem('ourpregnancy_active_contraction_session', currentSession);
    }
    setSessionId(currentSession);
    
    // Check if there was an active contraction we navigated away from
    const activeStart = localStorage.getItem('ourpregnancy_active_contraction_start');
    if (activeStart) {
      setActiveStartedAt(parseInt(activeStart, 10));
    }
  }, []);

  const records = useLiveQuery(
    () => {
      if (!sessionId) return [];
      return db.contractionRecords
        .where('sessionId')
        .equals(sessionId)
        .sortBy('startedAt');
    },
    [sessionId]
  ) || [];

  const rawHistorySessions = useLiveQuery(
    () => {
      if (!state.activeJourneyId) return [];
      return db.contractionSessions
        .where('journeyId')
        .equals(state.activeJourneyId)
        .reverse()
        .sortBy('startedAt');
    },
    [state.activeJourneyId]
  ) || [];

  // Calendar Logic
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday ...
  
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

  const logDates = new Set(rawHistorySessions.map(session => {
    const d = new Date(session.startedAt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }));

  const historySessions = selectedDateFilter 
    ? rawHistorySessions.filter(session => {
        const d = new Date(session.startedAt);
        const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return dStr === selectedDateFilter;
      })
    : rawHistorySessions;

  const handleDeleteSession = async (id: string) => {
    triggerHaptic('light');
    await db.contractionSessions.delete(id);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeStartedAt) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - activeStartedAt) / 1000));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeStartedAt]);

  const handleStart = () => {
    if (activeStartedAt) return; // Prevent double start
    triggerHaptic('medium');
    const now = Date.now();
    setActiveStartedAt(now);
    localStorage.setItem('ourpregnancy_active_contraction_start', now.toString());
  };

  const handleEnd = async () => {
    if (!activeStartedAt || !sessionId || !state.activeJourneyId) return;
    triggerHaptic('success');
    
    const endedAt = Date.now();
    const durationMs = endedAt - activeStartedAt;
    
    // Calculate gap from previous contraction's end
    let gapMs = 0;
    if (records.length > 0) {
      const lastRecord = records[records.length - 1];
      gapMs = activeStartedAt - lastRecord.endedAt;
    }

    await db.contractionRecords.put({
      id: uuidv4(),
      sessionId,
      journeyId: state.activeJourneyId,
      startedAt: activeStartedAt,
      endedAt,
      durationMs,
      gapMs,
    });

    setActiveStartedAt(null);
    setElapsedSeconds(0);
    localStorage.removeItem('ourpregnancy_active_contraction_start');
  };

  const handleClearSession = async () => {
    if (!sessionId || !state.activeJourneyId) return;
    triggerHaptic('light');

    if (records.length > 0) {
      // Save session summary
      await db.contractionSessions.put({
        id: sessionId,
        journeyId: state.activeJourneyId,
        startedAt: records[0].startedAt,
        endedAt: Date.now(),
        createdAt: Date.now()
      });
    }

    // Start fresh
    const newSession = uuidv4();
    setSessionId(newSession);
    localStorage.setItem('ourpregnancy_active_contraction_session', newSession);
    setActiveStartedAt(null);
    setElapsedSeconds(0);
    localStorage.removeItem('ourpregnancy_active_contraction_start');
  };

  // 5-1-1 Rule calculations
  const evaluate511 = () => {
    if (records.length < 3) return null;
    
    const recentRecords = [...records].slice(-3); // at least 3
    const totalDuration = recentRecords.reduce((acc, r) => acc + r.durationMs, 0);
    const avgDurationSec = (totalDuration / recentRecords.length) / 1000;
    
    // Avg frequency (start to start)
    const firstOfRecent = recentRecords[0];
    const lastOfRecent = recentRecords[recentRecords.length - 1];
    const timeSpanMin = (lastOfRecent.startedAt - firstOfRecent.startedAt) / (1000 * 60);
    const avgFrequencyMin = timeSpanMin / (recentRecords.length - 1);
    
    // Oldest contraction in full session
    const oldest = records[0];
    const sessionDurationMin = (Date.now() - oldest.startedAt) / (1000 * 60);

    const freqMet = avgFrequencyMin <= 5 && avgFrequencyMin > 0;
    const durationMet = avgDurationSec >= 60;
    const timeMet = sessionDurationMin >= 60;

    return {
      freqMet,
      durationMet,
      timeMet,
      allMet: freqMet && durationMet && timeMet
    };
  };

  const formatDuration = (ms: number) => {
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const remS = s % 60;
    return remS > 0 ? `${m}m ${remS}s` : `${m}m`;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!state.activeJourneyId) {
    return (
      <div className="p-8 bg-white border border-border/80 rounded-3xl shadow-xs text-center">
        <Activity className="w-10 h-10 text-sage mx-auto mb-3" />
        <h2 className="font-serif text-2xl font-bold text-charcoal mb-1.5">Contraction Timer</h2>
        <p className="text-medium text-[14px]">Please complete setup first to begin tracking contractions.</p>
      </div>
    );
  }

  const analysis = evaluate511();

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* Header bar with session actions */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-[22px] sm:text-[26px] font-bold text-charcoal leading-tight">
            Contraction Timer
          </h2>
          <p className="text-[12.5px] text-medium mt-0.5">
            5-1-1 clinical labor rule tracking & surge interval log
          </p>
        </div>
        
        {records.length > 0 && (
          <button 
            type="button"
            onClick={handleClearSession}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-border/80 rounded-xl text-[12px] font-bold text-charcoal hover:bg-cream hover:border-sage transition-all shadow-2xs shrink-0 cursor-pointer"
          >
            <RotateCcw size={13} className="text-sage" />
            <span>Save & New</span>
          </button>
        )}
      </div>

      {/* 1. Main Timer Hero Card */}
      <div className="bg-white border border-border/80 rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col items-center relative overflow-hidden">
        {/* Soft Ambient Background Aura */}
        <div className={`absolute -top-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          activeStartedAt ? 'bg-terracotta/15' : (records.length > 0 ? 'bg-sage/15' : 'bg-cream-dark/40')
        }`} />

        {/* Live Status Badge */}
        <div className="relative z-10 mb-3">
          {activeStartedAt ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-terracotta-pale border border-terracotta/30 text-terracotta-dark text-[12px] font-bold shadow-2xs animate-pulse">
              <span className="w-2 h-2 rounded-full bg-terracotta animate-ping" />
              <span>Timing active contraction...</span>
            </div>
          ) : records.length > 0 ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sage-pale border border-sage/30 text-sage-dark text-[12px] font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-sage" />
              <span>Resting between contractions</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cream border border-border/70 text-medium text-[12px] font-bold">
              <span>Ready for next contraction</span>
            </div>
          )}
        </div>

        {/* Big Playfair Digits */}
        <div className="relative z-10 font-serif text-[68px] sm:text-[84px] font-bold text-charcoal tracking-tight leading-none my-2 select-none">
          {activeStartedAt ? formatTime(elapsedSeconds) : '00:00'}
        </div>

        <p className="relative z-10 text-[12px] text-medium text-center max-w-xs mb-5">
          {activeStartedAt 
            ? 'Breathe slowly through the surge. Tap "End Contraction" when it subsides.' 
            : 'Tap "Start Contraction" the moment you feel a tightening surge begin.'}
        </p>

        {/* Action Buttons */}
        <div className="relative z-10 grid grid-cols-2 gap-3.5 w-full max-w-md">
          <button
            type="button"
            onClick={handleStart}
            disabled={!!activeStartedAt}
            className={`h-12.5 sm:h-13 rounded-2xl font-bold text-[14.5px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-[0.98] ${
              !activeStartedAt 
                ? 'bg-sage hover:bg-sage-dark text-white shadow-xs' 
                : 'bg-cream text-light border border-border/60 cursor-not-allowed opacity-50'
            }`}
          >
            <Play size={16} fill="currentColor" />
            <span>Start</span>
          </button>
          
          <button
            type="button"
            onClick={handleEnd}
            disabled={!activeStartedAt}
            className={`h-12.5 sm:h-13 rounded-2xl font-bold text-[14.5px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-[0.98] ${
              activeStartedAt 
                ? 'bg-terracotta hover:bg-terracotta-dark text-white shadow-xs' 
                : 'bg-cream text-light border border-border/60 cursor-not-allowed opacity-50'
            }`}
          >
            <Square size={14} fill="currentColor" />
            <span>End</span>
          </button>
        </div>

        {/* Live Session Quick Summary Row */}
        {records.length > 0 && (
          <div className="relative z-10 mt-5 pt-3.5 border-t border-border/60 w-full flex items-center justify-around text-center">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-medium block">Logged</span>
              <span className="font-serif font-bold text-[15px] text-charcoal">{records.length} {records.length === 1 ? 'surge' : 'surges'}</span>
            </div>
            <div className="w-px h-7 bg-border/60" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-medium block">Last Length</span>
              <span className="font-serif font-bold text-[15px] text-charcoal">{formatDuration(records[records.length - 1].durationMs)}</span>
            </div>
            <div className="w-px h-7 bg-border/60" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-medium block">Last Gap</span>
              <span className="font-serif font-bold text-[15px] text-charcoal">
                {records[records.length - 1].gapMs > 0 ? formatDuration(records[records.length - 1].gapMs) : 'First'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. 5-1-1 Clinical Rule Analysis */}
      {analysis && records.length >= 3 && (
        <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
          analysis.allMet 
            ? 'bg-gradient-to-br from-terracotta-pale via-white to-cream border-terracotta/40 shadow-xs' 
            : 'bg-white border-border/80 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                analysis.allMet ? 'bg-terracotta text-white' : 'bg-sage-pale text-sage-dark'
              }`}>
                <Activity size={15} />
              </div>
              <h3 className="font-serif font-bold text-charcoal text-[15px] sm:text-[16px]">
                5-1-1 Labor Rule Progress
              </h3>
            </div>
            <span className="text-[10.5px] font-bold text-medium">
              ACOG Standard
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3.5">
            <div className={`p-2.5 rounded-2xl border text-center ${
              analysis.freqMet ? 'bg-sage-pale/60 border-sage/40' : 'bg-cream/60 border-border/70'
            }`}>
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-medium block mb-0.5">
                Freq (≤5m)
              </span>
              <div className="flex items-center justify-center gap-1 font-bold text-[12px] text-charcoal">
                {analysis.freqMet ? (
                  <CheckCircle2 size={13} className="text-sage-dark" />
                ) : (
                  <span className="text-light text-[11px]">•</span>
                )}
                <span>{analysis.freqMet ? 'Met' : 'Pending'}</span>
              </div>
            </div>

            <div className={`p-2.5 rounded-2xl border text-center ${
              analysis.durationMet ? 'bg-sage-pale/60 border-sage/40' : 'bg-cream/60 border-border/70'
            }`}>
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-medium block mb-0.5">
                Duration (≥60s)
              </span>
              <div className="flex items-center justify-center gap-1 font-bold text-[12px] text-charcoal">
                {analysis.durationMet ? (
                  <CheckCircle2 size={13} className="text-sage-dark" />
                ) : (
                  <span className="text-light text-[11px]">•</span>
                )}
                <span>{analysis.durationMet ? 'Met' : 'Pending'}</span>
              </div>
            </div>

            <div className={`p-2.5 rounded-2xl border text-center ${
              analysis.timeMet ? 'bg-sage-pale/60 border-sage/40' : 'bg-cream/60 border-border/70'
            }`}>
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-medium block mb-0.5">
                Pattern (1 hr+)
              </span>
              <div className="flex items-center justify-center gap-1 font-bold text-[12px] text-charcoal">
                {analysis.timeMet ? (
                  <CheckCircle2 size={13} className="text-sage-dark" />
                ) : (
                  <span className="text-light text-[11px]">•</span>
                )}
                <span>{analysis.timeMet ? 'Met' : 'Pending'}</span>
              </div>
            </div>
          </div>

          {analysis.allMet ? (
            <div className="bg-terracotta-pale border border-terracotta/30 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-terracotta-dark">
              <div className="flex items-start gap-2">
                <Phone size={16} className="text-terracotta shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[13px]">5-1-1 Rule Active: Prepare for Hospital</h4>
                  <p className="text-[11.5px] text-terracotta-dark/90 mt-0.5">
                    Your contractions are 5 mins apart, 60s long, sustained for 1 hour. Contact your doctor or triage.
                  </p>
                </div>
              </div>
              <a
                href="tel:108"
                className="w-full sm:w-auto px-4 py-2 bg-terracotta text-white font-bold text-[12px] rounded-xl flex items-center justify-center gap-1.5 shadow-2xs hover:bg-terracotta-dark transition-colors shrink-0 whitespace-nowrap"
              >
                <Phone size={13} />
                <span>Call 108</span>
              </a>
            </div>
          ) : (
            <p className="text-[11.5px] text-medium italic text-center">
              Keep timing calmly — your body is preparing. Log at least 3 contractions for continuous analysis.
            </p>
          )}
        </div>
      )}

      {/* 3. Current Session Logs */}
      {records.length > 0 && (
        <div className="bg-white border border-border/80 rounded-3xl overflow-hidden shadow-2xs">
          <div className="px-5 py-3.5 border-b border-border/60 bg-cream/30 flex items-center justify-between">
            <h3 className="font-serif font-bold text-charcoal text-[15px] sm:text-[16px]">
              Current Session Logs
            </h3>
            <span className="text-[11px] font-bold text-sage-dark bg-sage-pale px-2.5 py-0.5 rounded-full">
              {records.length} {records.length === 1 ? 'surge' : 'surges'}
            </span>
          </div>
          
          <div className="divide-y divide-border/60 max-h-64 overflow-y-auto">
            {records.map((record, i) => (
              <div key={record.id} className="p-3 sm:px-5 flex items-center justify-between gap-3 hover:bg-cream/30 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-cream border border-border/80 flex items-center justify-center text-charcoal font-bold text-[11px] shrink-0">
                    #{i + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[13.5px] text-charcoal">
                        {formatDuration(record.durationMs)}
                      </span>
                      {record.gapMs > 0 && (
                        <span className="text-[10.5px] font-medium text-medium bg-cream-dark/60 px-1.5 py-0.2 rounded">
                          Gap: {formatDuration(record.gapMs)}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-light block mt-0.5">
                      Started {new Date(record.startedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Monthly Calendar Overview (Single Row Header, No Wrap) */}
      <div className="bg-white border border-border/80 rounded-3xl overflow-hidden shadow-2xs">
        <div className="px-4 py-3.5 border-b border-border/60 bg-cream/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-sage-pale flex items-center justify-center text-sage-dark shrink-0">
              <CalendarIcon size={15} />
            </div>
            <h3 className="font-serif font-bold text-charcoal text-[15px] sm:text-[16px] whitespace-nowrap">
              Calendar Overview
            </h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button 
              type="button"
              onClick={prevMonth} 
              className="p-1.5 hover:bg-cream-dark/60 rounded-lg text-charcoal transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-bold text-[12px] text-charcoal min-w-[76px] text-center">
              {currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}
            </span>
            <button 
              type="button"
              onClick={nextMonth} 
              className="p-1.5 hover:bg-cream-dark/60 rounded-lg text-charcoal transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {(isSundayStart ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']).map(d => (
              <div key={d} className="text-center text-[10.5px] font-bold text-medium/70 uppercase tracking-wider">
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
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedDateFilter(isSelected ? null : dateStr);
                  }}
                  className={`aspect-square rounded-full flex flex-col items-center justify-center text-[13px] transition-all relative mx-auto w-8 h-8 sm:w-9 sm:h-9 cursor-pointer
                    ${isSelected ? 'bg-sage text-white font-bold shadow-2xs' : 'hover:bg-cream text-charcoal'}
                    ${hasLog && !isSelected ? 'font-bold text-sage-dark' : ''}
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

      {/* 5. Past Sessions History */}
      <div className="bg-white border border-border/80 rounded-3xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-border/60 bg-cream/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-sage" />
            <h3 className="font-serif font-bold text-charcoal text-[15px] sm:text-[16px]">
              Past Sessions
            </h3>
          </div>
          {selectedDateFilter && (
            <button 
              type="button"
              onClick={() => setSelectedDateFilter(null)} 
              className="text-[12px] font-bold text-sage hover:text-sage-dark cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </div>
        
        {historySessions.length > 0 ? (
          <div className="divide-y divide-border/60">
            {historySessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3.5 sm:px-5 hover:bg-cream/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sage-pale/60 text-sage-dark flex items-center justify-center shrink-0 border border-sage/20">
                    <Timer size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[13.5px] text-charcoal">
                      {new Date(session.startedAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })} • {new Date(session.startedAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit', minute: '2-digit', hour12: true
                      })}
                    </h4>
                    <p className="text-[11.5px] text-medium mt-0.5">
                      Session Duration: {Math.max(1, Math.round((session.endedAt - session.startedAt) / 60000))} mins
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteSession(session.id)}
                  className="p-2 text-light hover:text-critical hover:bg-critical-bg rounded-lg transition-colors cursor-pointer shrink-0"
                  aria-label="Delete session"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-7 text-center text-medium">
            <Timer size={24} className="mx-auto text-light/50 mb-2" />
            <p className="text-[13.5px] font-bold text-charcoal">No past sessions found</p>
            <p className="text-[11.5px] text-light mt-0.5">Historical timed sessions will appear here once saved.</p>
          </div>
        )}
      </div>

      {/* 6. Medical Reassurance & Free Delivery Scheme (JSSK) */}
      <div className="bg-cream/70 border border-sage/30 rounded-2xl p-4 text-[12px] text-charcoal flex items-start gap-3 shadow-2xs">
        <AlertCircle size={18} className="text-sage-dark shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-charcoal leading-snug">
            This timer is an educational companion. Always follow your obstetrician&apos;s personalized guidance on when to head to the hospital.
          </p>
          <p className="text-[11px] text-medium leading-relaxed">
            Government hospitals provide cashless delivery, neonatal care, and free medicines under the <strong>Janani Shishu Suraksha Karyakram (JSSK)</strong> scheme. Dial <strong>108</strong> for emergency maternal ambulance assistance.
          </p>
        </div>
      </div>
    </div>
  );
};
