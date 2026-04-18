import React, { useState, useEffect } from 'react';
import { usePlanner } from '../../store';
import { db } from '../../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { 
  Timer, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Phone,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Trash2
} from 'lucide-react';

export const ContractionTimer: React.FC = () => {
  const { state } = usePlanner();
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // State for current active contraction
  const [activeStartedAt, setActiveStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Initialize or load current session
  useEffect(() => {
    let currentSession = localStorage.getItem('bloom_active_contraction_session');
    if (!currentSession) {
      currentSession = uuidv4();
      localStorage.setItem('bloom_active_contraction_session', currentSession);
    }
    setSessionId(currentSession);
    
    // Check if there was an active contraction we navigated away from
    const activeStart = localStorage.getItem('bloom_active_contraction_start');
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

  const days = [];
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
    await db.contractionSessions.delete(id);
    // Note: We don't delete underlying records to keep it simple, or we could.
    // Assuming deleting the session is enough for the user view.
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
    const now = Date.now();
    setActiveStartedAt(now);
    localStorage.setItem('bloom_active_contraction_start', now.toString());
  };

  const handleEnd = async () => {
    if (!activeStartedAt || !sessionId || !state.activeJourneyId) return;
    
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
    localStorage.removeItem('bloom_active_contraction_start');
  };

  const handleClearSession = async () => {
    if (!sessionId || !state.activeJourneyId) return;

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
    localStorage.setItem('bloom_active_contraction_session', newSession);
    setActiveStartedAt(null);
    setElapsedSeconds(0);
    localStorage.removeItem('bloom_active_contraction_start');
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
    // gaps count is n-1
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
    return `${m}m ${remS}s`;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!state.activeJourneyId) {
    return (
      <div className="p-6 bg-white border border-border rounded-2xl shadow-sm text-center">
        <Activity className="w-12 h-12 text-medium mx-auto mb-4" />
        <h2 className="font-serif text-2xl text-charcoal mb-2">Contraction Timer</h2>
        <p className="text-medium text-[15px]">Please complete setup first.</p>
      </div>
    );
  }

  const analysis = evaluate511();
  const statusText = activeStartedAt 
    ? "Contraction in progress..." 
    : (records.length > 0 ? "Resting between contractions..." : "Waiting for contraction...");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-sage" />
          <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-normal text-charcoal">Contraction Timer</h1>
        </div>
        
        {records.length > 0 && (
          <button 
            onClick={handleClearSession}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-full text-[13px] font-medium text-medium hover:text-charcoal hover:border-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Clear & Save Session
          </button>
        )}
      </div>

      <div className="bg-white border-[1.5px] border-border rounded-[16px] shadow-sm p-6 flex flex-col items-center">
        <div className="text-[14px] font-medium text-medium uppercase tracking-wider mb-6">
          {statusText}
        </div>
        
        <div className="font-serif text-[64px] sm:text-[80px] text-charcoal leading-none mb-8">
          {activeStartedAt ? formatTime(elapsedSeconds) : '00:00'}
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <button
            onClick={handleStart}
            disabled={!!activeStartedAt}
            className={`py-4 px-2 rounded-[12px] font-semibold text-[16px] transition-all flex items-center justify-center gap-2
              ${!activeStartedAt 
                ? 'bg-sage text-white shadow-md hover:bg-sage-dark active:scale-95' 
                : 'bg-sage-pale/50 text-sage/50 cursor-not-allowed border-[1.5px] border-transparent'}`}
          >
            Contraction Started
          </button>
          
          <button
            onClick={handleEnd}
            disabled={!activeStartedAt}
            className={`py-4 px-2 rounded-[12px] font-semibold text-[16px] transition-all flex items-center justify-center gap-2
              ${activeStartedAt 
                ? 'bg-red-200 text-red-800 shadow-md hover:bg-red-300 active:scale-95' 
                : 'bg-red-50 text-red-300 cursor-not-allowed border-[1.5px] border-transparent'}`}
          >
            Contraction Ended
          </button>
        </div>
      </div>

      {analysis && records.length >= 3 && (
        <div className={`p-6 rounded-[16px] border-[1.5px] shadow-sm transition-colors duration-500
          ${analysis.allMet ? 'bg-red-50 border-red-300' : 'bg-white border-border'}`}>
          <h3 className="font-semibold text-charcoal text-[17px] mb-4 flex items-center gap-2">
            5-1-1 Rule Analysis
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div className="flex flex-col gap-1">
              <span className="text-[12px] text-medium uppercase font-semibold">Frequency (≤ 5 min)</span>
              <div className="flex items-center gap-2 text-charcoal font-medium">
                {analysis.freqMet ? <CheckCircle className="w-4 h-4 text-sage" /> : <XCircle className="w-4 h-4 text-amber-500" />}
                {analysis.freqMet ? 'Met' : 'Not yet'}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] text-medium uppercase font-semibold">Duration (≥ 60 sec)</span>
              <div className="flex items-center gap-2 text-charcoal font-medium">
                {analysis.durationMet ? <CheckCircle className="w-4 h-4 text-sage" /> : <XCircle className="w-4 h-4 text-amber-500" />}
                {analysis.durationMet ? 'Met' : 'Not yet'}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] text-medium uppercase font-semibold">Pattern (≥ 1 hour)</span>
              <div className="flex items-center gap-2 text-charcoal font-medium">
                {analysis.timeMet ? <CheckCircle className="w-4 h-4 text-sage" /> : <XCircle className="w-4 h-4 text-amber-500" />}
                {analysis.timeMet ? 'Met' : 'Not yet'}
              </div>
            </div>
          </div>

          {analysis.allMet ? (
            <div className="bg-white border border-red-200 rounded-xl p-4 flex gap-3 text-red-800">
              <Phone className="w-6 h-6 shrink-0 mt-0.5" />
              <p className="text-[14px] font-semibold leading-snug">
                Based on the 5-1-1 rule, it may be time to go to the hospital. Call your doctor or dial 108 now.
              </p>
            </div>
          ) : (
            <div className="text-[14px] text-medium italic">
              Keep timing — your body is preparing. Log at least 3 contractions for full analysis.
            </div>
          )}
        </div>
      )}

      {records.length > 0 && (
        <div className="bg-white border-[1.5px] border-border rounded-[16px] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-gray-50/50">
            <h3 className="font-semibold text-charcoal text-[17px]">Contraction Log</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="bg-white border-b border-border text-medium text-[12px] uppercase">
                  <th className="px-6 py-3 font-semibold">#</th>
                  <th className="px-6 py-3 font-semibold">Duration</th>
                  <th className="px-6 py-3 font-semibold">Gap</th>
                  <th className="px-6 py-3 font-semibold">Started at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((record, i) => (
                  <tr key={record.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 font-medium text-charcoal">{i + 1}</td>
                    <td className="px-6 py-3">{formatDuration(record.durationMs)}</td>
                    <td className="px-6 py-3 text-medium">{record.gapMs > 0 ? formatDuration(record.gapMs) : '-'}</td>
                    <td className="px-6 py-3 text-medium">
                      {new Date(record.startedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Calendar View */}
      <div className="bg-white border-[1.5px] border-border rounded-[16px] shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border bg-gray-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-sage" />
            <h3 className="font-semibold text-charcoal text-[17px]">Calendar View</h3>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-charcoal" /></button>
            <span className="font-semibold text-[14px] text-charcoal min-w-[120px] text-center">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-charcoal" /></button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {(isSundayStart ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']).map(d => (
              <div key={d} className="text-center text-[11px] font-semibold text-medium uppercase tracking-wider">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              if (d === null) return <div key={`empty-${i}`} className="aspect-square" />;
              
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const hasLog = logDates.has(dateStr);
              const isSelected = selectedDateFilter === dateStr;
              
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDateFilter(isSelected ? null : dateStr)}
                  className={`aspect-square rounded-full flex items-center justify-center text-[14px] transition-all relative mx-auto w-8 h-8 sm:w-10 sm:h-10
                    ${isSelected ? 'bg-sage text-white font-bold shadow-md' : 'hover:bg-gray-100 text-charcoal'}
                    ${hasLog && !isSelected ? 'font-bold' : ''}
                  `}
                >
                  {d}
                  {hasLog && !isSelected && (
                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-sage"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* History Sessions */}
      <div className="bg-white border-[1.5px] border-border rounded-[16px] shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border bg-gray-50/50 flex justify-between items-center">
          <div className="flex flex-col">
            <h3 className="font-semibold text-charcoal text-[17px]">Past Sessions</h3>
          </div>
          {selectedDateFilter && (
            <button onClick={() => setSelectedDateFilter(null)} className="text-[12px] font-semibold text-sage hover:text-sage-dark">
              Clear Filter
            </button>
          )}
        </div>
        
        {historySessions.length > 0 ? (
          <div className="divide-y divide-border">
            {historySessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 sm:px-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-sage-pale/20 flex items-center justify-center shrink-0">
                    <Timer className="w-5 h-5 text-sage" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[15px] text-charcoal">
                      {new Date(session.startedAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </h4>
                    <p className="text-[13px] text-medium mt-0.5">
                      Duration: {Math.round((session.endedAt - session.startedAt) / 60000)} mins
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteSession(session.id)}
                  className="p-2 text-medium hover:text-critical hover:bg-critical-bg rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-medium">
            <p className="text-[15px] mb-1">No past sessions found.</p>
            <p className="text-[14px]">Historical sessions will appear here once saved.</p>
          </div>
        )}
      </div>

      {!state.isCalmModeActive && (
        <div className="bg-cream border-[1.5px] border-border rounded-[16px] p-5 shadow-inner">
          <div className="flex gap-4">
            <AlertCircle className="w-5 h-5 text-sage shrink-0" />
            <div>
              <p className="text-[14px] text-charcoal font-medium leading-relaxed mb-1.5">
                This timer is a guide only. Always follow your doctor's specific instructions about when to go to hospital.
              </p>
              <p className="text-[13px] text-medium">
                Government hospitals provide free delivery under JSSK scheme.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
