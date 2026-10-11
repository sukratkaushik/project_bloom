import React, { useState, useMemo } from 'react';
import { usePlanner } from '../../store';
import { db } from '../../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import {
  Heart,
  Scale,
  AlertTriangle,
  TrendingUp,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Watch,
  CheckCircle2,
  Moon,
  Activity,
  Thermometer,
  Flame,
  Check,
  Shield,
  ExternalLink,
  Info,
  Clock,
  Sparkles,
  FileText,
  Smartphone
} from 'lucide-react';
import { WEARABLE_DEVICES, syncWearableData } from '../../utils/wearableService';
import {
  getHealthConnectStatus,
  requestHealthConnectPermissions,
  disconnectHealthConnect,
  syncHealthConnectVitals,
  openHealthConnectApp,
  HealthConnectStatus
} from '../../utils/healthConnectBridge';
import { triggerHaptic } from '../../utils/nativeBridge';

/* =========================================================================
   Investor-grade SVG Trend Charts (No raw, broken overlapping lines)
   ========================================================================= */

interface BPReading {
  systolic: number;
  diastolic: number;
  timestamp: number;
}

const BPTrendChart: React.FC<{ data: BPReading[] }> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-32 flex flex-col items-center justify-center text-medium text-[13px] bg-cream/40 rounded-xl border border-dashed border-border/80">
        <Heart className="w-5 h-5 text-medium/50 mb-1" />
        <span>No blood pressure readings logged yet</span>
      </div>
    );
  }

  const latest = data[data.length - 1];
  const width = 320;
  const height = 120;
  const paddingX = 24;
  const paddingY = 20;

  const allVals = data.flatMap(d => [d.systolic, d.diastolic]);
  const minVal = Math.max(50, Math.min(...allVals) - 10);
  const maxVal = Math.min(180, Math.max(...allVals) + 10);
  const range = maxVal - minVal || 1;

  const getX = (idx: number) => {
    if (data.length === 1) return width / 2;
    return paddingX + (idx / (data.length - 1)) * (width - 2 * paddingX);
  };

  const getY = (val: number) => {
    return height - paddingY - ((val - minVal) / range) * (height - 2 * paddingY);
  };

  const sysPoints = data.map((d, i) => `${getX(i)},${getY(d.systolic)}`).join(' ');
  const diaPoints = data.map((d, i) => `${getX(i)},${getY(d.diastolic)}`).join(' ');

  // Normal BP threshold lines (120 & 80)
  const y120 = getY(120);
  const y80 = getY(80);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[12px]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-charcoal">
            <span className="w-2.5 h-2.5 rounded-full bg-sage" />
            <span>Systolic</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium text-charcoal">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E8A598]" />
            <span>Diastolic</span>
          </span>
        </div>
        <div className="font-semibold text-charcoal">
          Latest: <span className="font-serif text-[14px] text-sage-dark">{latest.systolic}/{latest.diastolic}</span> <span className="text-[11px] text-medium font-normal">mmHg</span>
        </div>
      </div>

      <div className="relative bg-cream/40 rounded-xl p-2 border border-border/70 overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28 overflow-visible">
          <defs>
            <linearGradient id="sysGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8AB6A3" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#8AB6A3" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="diaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E8A598" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#E8A598" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Reference Dashed Lines for Standard 120/80 */}
          {y120 >= 0 && y120 <= height && (
            <g>
              <line x1={paddingX} y1={y120} x2={width - paddingX} y2={y120} stroke="#8AB6A3" strokeDasharray="3 3" strokeOpacity="0.3" strokeWidth="1" />
              <text x={paddingX - 4} y={y120 + 3} textAnchor="end" fontSize="9" fill="#8AB6A3" opacity="0.7">120</text>
            </g>
          )}
          {y80 >= 0 && y80 <= height && (
            <g>
              <line x1={paddingX} y1={y80} x2={width - paddingX} y2={y80} stroke="#E8A598" strokeDasharray="3 3" strokeOpacity="0.3" strokeWidth="1" />
              <text x={paddingX - 4} y={y80 + 3} textAnchor="end" fontSize="9" fill="#E8A598" opacity="0.7">80</text>
            </g>
          )}

          {data.length > 1 ? (
            <>
              {/* Systolic Area & Line */}
              <polygon points={`${getX(0)},${height - paddingY} ${sysPoints} ${getX(data.length - 1)},${height - paddingY}`} fill="url(#sysGradient)" />
              <polyline points={sysPoints} fill="none" stroke="#8AB6A3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Diastolic Area & Line */}
              <polygon points={`${getX(0)},${height - paddingY} ${diaPoints} ${getX(data.length - 1)},${height - paddingY}`} fill="url(#diaGradient)" />
              <polyline points={diaPoints} fill="none" stroke="#E8A598" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </>
          ) : null}

          {/* Data Points */}
          {data.map((d, i) => (
            <g key={i}>
              <circle cx={getX(i)} cy={getY(d.systolic)} r="4" fill="#8AB6A3" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx={getX(i)} cy={getY(d.diastolic)} r="3.5" fill="#E8A598" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

const WeightTrendChart: React.FC<{ data: { weight: number; timestamp: number }[]; unit: string }> = ({ data, unit }) => {
  if (data.length === 0) {
    return (
      <div className="h-32 flex flex-col items-center justify-center text-medium text-[13px] bg-cream/40 rounded-xl border border-dashed border-border/80">
        <Scale className="w-5 h-5 text-medium/50 mb-1" />
        <span>No weight entries logged yet</span>
      </div>
    );
  }

  const latest = data[data.length - 1];
  const width = 320;
  const height = 120;
  const paddingX = 24;
  const paddingY = 20;

  const weights = data.map(d => d.weight);
  const minVal = Math.min(...weights) - 1;
  const maxVal = Math.max(...weights) + 1;
  const range = maxVal - minVal || 1;

  const getX = (idx: number) => {
    if (data.length === 1) return width / 2;
    return paddingX + (idx / (data.length - 1)) * (width - 2 * paddingX);
  };

  const getY = (val: number) => {
    return height - paddingY - ((val - minVal) / range) * (height - 2 * paddingY);
  };

  const points = data.map((d, i) => `${getX(i)},${getY(d.weight)}`).join(' ');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[12px]">
        <div className="flex items-center gap-1.5 font-medium text-charcoal">
          <span className="w-2.5 h-2.5 rounded-full bg-sage" />
          <span>Gestational Weight</span>
        </div>
        <div className="font-semibold text-charcoal">
          Latest: <span className="font-serif text-[14px] text-sage-dark">{latest.weight}</span> <span className="text-[11px] text-medium font-normal">{unit}</span>
        </div>
      </div>

      <div className="relative bg-cream/40 rounded-xl p-2 border border-border/70 overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28 overflow-visible">
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8AB6A3" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#8AB6A3" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {data.length > 1 ? (
            <>
              <polygon points={`${getX(0)},${height - paddingY} ${points} ${getX(data.length - 1)},${height - paddingY}`} fill="url(#weightGradient)" />
              <polyline points={points} fill="none" stroke="#8AB6A3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </>
          ) : null}

          {data.map((d, i) => (
            <circle key={i} cx={getX(i)} cy={getY(d.weight)} r="4" fill="#8AB6A3" stroke="#ffffff" strokeWidth="1.5" />
          ))}
        </svg>
      </div>
    </div>
  );
};

/* =========================================================================
   Main Component
   ========================================================================= */

export const VitalsTracker: React.FC = () => {
  const { state, updateState } = usePlanner();
  const [activeTab, setActiveTab] = useState<'BP' | 'WEIGHT' | 'WEARABLES'>('BP');
  const [isSyncing, setIsSyncing] = useState(false);

  // Health Connect specific state
  const [hcStatus, setHcStatus] = useState<HealthConnectStatus>(() => getHealthConnectStatus());
  const [isSyncingHC, setIsSyncingHC] = useState(false);
  const [hcFeedback, setHcFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Input states
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  });

  const getLogTimestamp = () => {
    const d = new Date(date);
    const [h, m] = time.split(':');
    d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
    return d.getTime();
  };

  const journeyId = state.activeJourneyId || (state.isSetup ? 'journey-local-default' : undefined);

  const logs = useLiveQuery(
    () => {
      if (!journeyId) return [];
      return db.vitalsLogs
        .where('journeyId')
        .equals(journeyId)
        .reverse()
        .sortBy('timestamp');
    },
    [journeyId]
  ) || [];

  const handleLogVitals = async () => {
    if (!journeyId) return;

    if (activeTab === 'BP' && (!systolic || !diastolic)) return;
    if (activeTab === 'WEIGHT' && !weight) return;

    triggerHaptic('light');

    const entry = {
      id: uuidv4(),
      journeyId: journeyId,
      timestamp: getLogTimestamp(),
      type: activeTab,
      notes: notes.trim(),
    };

    if (activeTab === 'BP') {
      await db.vitalsLogs.put({
        ...entry,
        type: 'BP',
        systolic: parseInt(systolic, 10),
        diastolic: parseInt(diastolic, 10),
        pulse: pulse ? parseInt(pulse, 10) : undefined,
      });
      setSystolic('');
      setDiastolic('');
      setPulse('');
    } else if (activeTab === 'WEIGHT') {
      await db.vitalsLogs.put({
        ...entry,
        type: 'WEIGHT',
        weight: parseFloat(weight),
        unit: state.weightUnit || 'kg',
      });
      setWeight('');
    }

    setNotes('');
  };

  const handleDelete = async (id: string) => {
    triggerHaptic('light');
    await db.vitalsLogs.delete(id);
  };

  const handleConnectOrSyncHC = async () => {
    if (!journeyId) return;
    setIsSyncingHC(true);
    setHcFeedback(null);
    try {
      if (!hcStatus.isConnected) {
        const permRes = await requestHealthConnectPermissions();
        if (!permRes.success) {
          setHcFeedback({ message: permRes.error || 'Health permissions request was cancelled.', type: 'error' });
          setIsSyncingHC(false);
          return;
        }
      }
      const syncRes = await syncHealthConnectVitals(journeyId, 7);
      const updatedStatus = getHealthConnectStatus();
      setHcStatus(updatedStatus);
      if (syncRes.success) {
        setHcFeedback({ message: syncRes.message, type: 'success' });
      } else {
        setHcFeedback({ message: syncRes.error || syncRes.message, type: 'error' });
      }
    } catch (err: any) {
      setHcFeedback({ message: err?.message || 'Synchronization error occurred.', type: 'error' });
    } finally {
      setIsSyncingHC(false);
    }
  };

  const handleDisconnectHC = async () => {
    await disconnectHealthConnect();
    setHcStatus(getHealthConnectStatus());
    setHcFeedback({ message: 'Disconnected Google Health Connect.', type: 'info' });
  };

  const handleOpenHCApp = async () => {
    await openHealthConnectApp();
  };

  const handleSyncOtherWearable = async (device: (typeof WEARABLE_DEVICES)[0]) => {
    if (!journeyId) return;
    setIsSyncing(true);
    try {
      await syncWearableData(journeyId, device.id);
      setHcFeedback({ message: `Synced last 7 days of biometrics from ${device.name}`, type: 'success' });
    } catch (err: any) {
      setHcFeedback({ message: err?.message || 'Sync failed', type: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  const unit = state.weightUnit || 'kg';

  const toggleUnit = () => {
    updateState({ weightUnit: unit === 'kg' ? 'lbs' : 'kg' });
  };

  const getBPClassification = () => {
    const sys = parseInt(systolic, 10);
    const dia = parseInt(diastolic, 10);

    if (isNaN(sys) || isNaN(dia)) return null;

    if (sys >= 160 || dia >= 110) {
      return { 
        label: 'Critical Alert — Go to hospital immediately or call 108', 
        color: 'bg-red-50 border border-critical/50 text-critical font-bold shadow-2xs', 
        urgent: true 
      };
    }
    if (sys >= 140 || dia >= 90) {
      return { 
        label: 'High BP (Stage 2) — Inform your OB-GYN', 
        color: 'bg-amber-50 border border-amber-300 text-amber-800 font-semibold', 
        urgent: true 
      };
    }
    if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) {
      return { 
        label: 'Elevated (Stage 1) — Rest and recheck later', 
        color: 'bg-amber-50/70 border border-amber-200 text-amber-800 font-medium', 
        urgent: false 
      };
    }
    if (sys >= 120 && sys <= 129 && dia < 80) {
      return { 
        label: 'Slightly Elevated — Stay well hydrated', 
        color: 'bg-amber-50/50 border border-amber-200/60 text-amber-800 font-medium', 
        urgent: false 
      };
    }
    return { 
      label: 'Normal Blood Pressure — Healthy & reassuring', 
      color: 'bg-tulsi-light/70 border border-sage/40 text-sage-dark font-medium shadow-2xs', 
      urgent: false 
    };
  };

  const bpLogs = useMemo(() => logs.filter(l => l.type === 'BP'), [logs]);
  const weightLogs = useMemo(() => logs.filter(l => l.type === 'WEIGHT'), [logs]);

  const bpClass = getBPClassification();

  // Clean data arrays for Trend Charts
  const bpChartData: BPReading[] = useMemo(() => {
    return bpLogs
      .slice(0, 10)
      .reverse()
      .filter(l => (l.systolic || 0) > 0 && (l.diastolic || 0) > 0)
      .map(l => ({
        systolic: l.systolic!,
        diastolic: l.diastolic!,
        timestamp: l.timestamp
      }));
  }, [bpLogs]);

  const weightChartData = useMemo(() => {
    return weightLogs
      .slice(0, 10)
      .reverse()
      .filter(l => (l.weight || 0) > 0)
      .map(l => ({
        weight: l.weight!,
        timestamp: l.timestamp
      }));
  }, [weightLogs]);

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

  const logDates = new Set(logs.map(l => {
    const d = new Date(l.timestamp);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }));

  const filteredLogs = selectedDateFilter
    ? logs.filter(l => {
        const d = new Date(l.timestamp);
        const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return dStr === selectedDateFilter;
      })
    : logs;

  if (!journeyId) {
    return (
      <div className="p-6 bg-white border border-border/80 rounded-2xl shadow-xs text-center">
        <Heart className="w-12 h-12 text-medium mx-auto mb-4" />
        <h2 className="font-serif text-2xl text-charcoal mb-2">Health Metrics</h2>
        <p className="text-medium text-[15px]">Please complete setup first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-sage/10 flex items-center justify-center text-sage">
          <Heart className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-serif text-[clamp(24px,3.5vw,36px)] font-normal text-charcoal leading-tight">Health Metrics</h1>
          <p className="text-[12.5px] text-medium font-normal">Blood pressure monitoring, gestational weight & wearable sync</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-border/80 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Modern Segmented Navigation Tabs */}
        <div className="p-2 sm:p-2.5 border-b border-border/60 bg-cream/40">
          <div className="flex gap-1.5 p-1 bg-cream-dark/40 rounded-xl">
            <button
              type="button"
              className={`flex-1 py-2.5 px-3 rounded-lg text-[13px] sm:text-[14px] font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'BP' 
                  ? 'bg-sage text-white shadow-2xs' 
                  : 'text-medium hover:text-charcoal hover:bg-cream/60'
              }`}
              onClick={() => setActiveTab('BP')}
            >
              <Heart className="w-4 h-4 shrink-0" />
              <span>Blood Pressure</span>
            </button>
            <button
              type="button"
              className={`flex-1 py-2.5 px-3 rounded-lg text-[13px] sm:text-[14px] font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'WEIGHT' 
                  ? 'bg-sage text-white shadow-2xs' 
                  : 'text-medium hover:text-charcoal hover:bg-cream/60'
              }`}
              onClick={() => setActiveTab('WEIGHT')}
            >
              <Scale className="w-4 h-4 shrink-0" />
              <span>Weight</span>
            </button>
            <button
              type="button"
              className={`flex-1 py-2.5 px-3 rounded-lg text-[13px] sm:text-[14px] font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'WEARABLES' 
                  ? 'bg-sage text-white shadow-2xs' 
                  : 'text-medium hover:text-charcoal hover:bg-cream/60'
              }`}
              onClick={() => setActiveTab('WEARABLES')}
            >
              <Watch className="w-4 h-4 shrink-0" />
              <span>Wearables</span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6">
          {activeTab !== 'WEARABLES' ? (
            <div className="space-y-4">
              
              {/* Date & Time Picker Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-medium/80 block">Date</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={date} 
                      onChange={e => setDate(e.target.value)} 
                      className="w-full px-3 py-2 bg-cream/50 border border-border/80 rounded-xl focus:border-sage focus:bg-white text-[13px] font-medium text-charcoal outline-none transition-all" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-medium/80 block">Time</label>
                  <div className="relative">
                    <input 
                      type="time" 
                      value={time} 
                      onChange={e => setTime(e.target.value)} 
                      className="w-full px-3 py-2 bg-cream/50 border border-border/80 rounded-xl focus:border-sage focus:bg-white text-[13px] font-medium text-charcoal outline-none transition-all" 
                    />
                  </div>
                </div>
              </div>

              {/* Blood Pressure Input Section */}
              {activeTab === 'BP' ? (
                <div className="space-y-4 pt-1 animate-in slide-in-from-left-2">
                  <div className="p-4 bg-gradient-to-br from-cream via-cream/50 to-white rounded-2xl border border-border/80">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-center text-medium/80 mb-3">
                      Blood Pressure Reading (mmHg)
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                      {/* Systolic Card */}
                      <div className="bg-white p-3.5 rounded-xl border border-border/80 text-center shadow-2xs focus-within:border-sage focus-within:ring-2 focus-within:ring-sage/10 transition-all">
                        <span className="text-[10.5px] font-bold text-medium uppercase tracking-wider block mb-1">
                          Systolic
                        </span>
                        <input 
                          type="number" 
                          placeholder="120" 
                          value={systolic} 
                          onChange={e => setSystolic(e.target.value)} 
                          className="w-full text-center font-serif text-[32px] sm:text-[36px] text-charcoal outline-none placeholder:text-medium/30 leading-none py-1 bg-transparent" 
                        />
                        <span className="text-[10px] text-light block mt-1 font-medium">Upper #</span>
                      </div>

                      {/* Diastolic Card */}
                      <div className="bg-white p-3.5 rounded-xl border border-border/80 text-center shadow-2xs focus-within:border-sage focus-within:ring-2 focus-within:ring-sage/10 transition-all">
                        <span className="text-[10.5px] font-bold text-medium uppercase tracking-wider block mb-1">
                          Diastolic
                        </span>
                        <input 
                          type="number" 
                          placeholder="80" 
                          value={diastolic} 
                          onChange={e => setDiastolic(e.target.value)} 
                          className="w-full text-center font-serif text-[32px] sm:text-[36px] text-charcoal outline-none placeholder:text-medium/30 leading-none py-1 bg-transparent" 
                        />
                        <span className="text-[10px] text-light block mt-1 font-medium">Lower #</span>
                      </div>
                    </div>

                    {/* Dynamic Classification Banner */}
                    {bpClass && (
                      <div className={`mt-3.5 p-3 rounded-xl text-[12.5px] text-center transition-all ${bpClass.color}`}>
                        {bpClass.label}
                      </div>
                    )}
                  </div>

                  {/* Pulse Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-medium/80 block">
                      Pulse Rate (Optional)
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        placeholder="Pulse in bpm (e.g. 72)" 
                        value={pulse} 
                        onChange={e => setPulse(e.target.value)} 
                        className="w-full px-3.5 py-2.5 bg-cream/50 border border-border/80 rounded-xl focus:border-sage focus:bg-white text-[13.5px] text-charcoal outline-none transition-all placeholder:text-medium/50" 
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] text-medium font-medium">bpm</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Weight Input Section */
                <div className="space-y-4 pt-1 animate-in slide-in-from-right-2">
                  <div className="p-4 bg-gradient-to-br from-cream via-cream/50 to-white rounded-2xl border border-border/80">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-center text-medium/80 block mb-3">
                      Current Gestational Weight
                    </span>
                    <div className="max-w-xs mx-auto relative bg-white p-3.5 rounded-xl border border-border/80 text-center shadow-2xs focus-within:border-sage focus-within:ring-2 focus-within:ring-sage/10 transition-all">
                      <input 
                        type="number" 
                        step="0.1" 
                        placeholder="60.5" 
                        value={weight} 
                        onChange={e => setWeight(e.target.value)} 
                        className="w-full text-center font-serif text-[36px] text-charcoal outline-none placeholder:text-medium/30 leading-none py-1 bg-transparent" 
                      />
                      <button 
                        type="button"
                        onClick={toggleUnit} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-cream hover:bg-cream-dark text-charcoal border border-border/80 rounded-lg text-[12px] font-bold transition-colors cursor-pointer"
                        title="Click to toggle between kg and lbs"
                      >
                        {unit}
                      </button>
                    </div>
                    <p className="text-[11.5px] text-medium text-center mt-2.5">
                      Log once a week at the same time (preferably morning) for best accuracy.
                    </p>
                  </div>
                </div>
              )}

              {/* Notes Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-medium/80 block">Notes (Optional)</label>
                <input 
                  type="text" 
                  placeholder="How are you feeling? (e.g. relaxed, after walking, slight headache)" 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  className="w-full px-3.5 py-2.5 bg-cream/50 border border-border/80 rounded-xl focus:border-sage focus:bg-white text-[13.5px] text-charcoal outline-none transition-all placeholder:text-medium/50" 
                />
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                onClick={handleLogVitals}
                className="w-full mt-2 py-3.5 bg-sage hover:bg-sage-dark text-white rounded-xl font-medium text-[14.5px] flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Log {activeTab === 'BP' ? 'Blood Pressure' : 'Weight'}</span>
              </button>
            </div>
          ) : (
            /* Wearables Tab */
            <div className="space-y-5 animate-in fade-in duration-300">
              {hcFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-[12.5px] flex items-center justify-between gap-3 ${
                    hcFeedback.type === 'success'
                      ? 'bg-tulsi-light text-sage-dark border border-sage/30'
                      : hcFeedback.type === 'error'
                      ? 'bg-red-50 text-critical border border-red-200'
                      : 'bg-cream text-charcoal border border-border'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sage shrink-0" />
                    <span>{hcFeedback.message}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHcFeedback(null)}
                    className="text-medium hover:text-charcoal text-[11px] font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Google Health Connect Card */}
              <div className="bg-gradient-to-br from-cream via-cream/50 to-white border border-border/80 rounded-2xl p-5 shadow-2xs">
                <div className="flex items-center justify-between gap-3 flex-wrap pb-3.5 border-b border-border/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-sage/15 flex items-center justify-center text-sage">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-[17px] text-charcoal font-normal">Google Health Connect</h3>
                      <p className="text-[11.5px] text-medium">Automatic background sync from Android</p>
                    </div>
                  </div>

                  {hcStatus.isConnected ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-tulsi-light text-sage-dark border border-sage/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
                      Connected
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-cream text-medium border border-border">
                      Not Connected
                    </span>
                  )}
                </div>

                <p className="text-[12.5px] text-medium leading-relaxed my-3.5">
                  Import Blood Pressure, Weight, Heart Rate, Steps, and Sleep securely without leaving your device.
                </p>

                <div className="flex items-center justify-between gap-3 pt-1">
                  {hcStatus.isConnected ? (
                    <button
                      type="button"
                      onClick={handleDisconnectHC}
                      className="text-[12px] font-medium text-medium hover:text-critical transition-colors cursor-pointer"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <span className="text-[11px] text-light">Encrypted on device</span>
                  )}

                  <button
                    type="button"
                    onClick={handleConnectOrSyncHC}
                    disabled={isSyncingHC}
                    className="px-4 py-2 bg-sage hover:bg-sage-dark text-white rounded-xl text-[12.5px] font-medium shadow-2xs active:scale-95 transition-all cursor-pointer disabled:opacity-70"
                  >
                    {isSyncingHC ? 'Syncing...' : hcStatus.isConnected ? 'Sync Now' : 'Connect Device'}
                  </button>
                </div>
              </div>

              {/* Zero-Cloud Privacy Guarantee */}
              <div className="bg-tulsi-light/30 border border-sage/20 rounded-xl p-3.5 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-sage shrink-0 mt-0.5" />
                <p className="text-[12px] text-charcoal/80 leading-relaxed">
                  <strong className="text-charcoal font-semibold">Local Privacy Guarantee:</strong> Wearable metrics are stored solely on your device in your private local database. Your medical data never leaves your phone.
                </p>
              </div>

              {/* Other Platforms */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold tracking-wider uppercase text-medium/70">
                  Other Connected Platforms
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {WEARABLE_DEVICES.filter(d => !d.isNativeHealth).map(device => (
                    <div
                      key={device.id}
                      className="bg-white border border-border/80 rounded-xl p-3 flex items-center justify-between hover:border-sage/40 transition-colors shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-[18px]">{device.icon}</span>
                        <div>
                          <h4 className="text-[12.5px] font-bold text-charcoal">{device.name}</h4>
                          <p className="text-[11px] text-medium line-clamp-1">{device.description}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSyncOtherWearable(device)}
                        disabled={isSyncing}
                        className="px-2.5 py-1 bg-cream hover:bg-sage/10 text-charcoal text-[11px] font-medium rounded-lg border border-border/80 cursor-pointer transition-colors"
                      >
                        Sync
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sleek Trend Charts (Side-by-side or stacked) */}
      {activeTab !== 'WEARABLES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* BP Trend */}
          <div className="bg-white border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-sage" />
              <h3 className="font-serif text-[16px] text-charcoal font-normal">Blood Pressure Trend</h3>
            </div>
            <BPTrendChart data={bpChartData} />
          </div>

          {/* Weight Trend */}
          <div className="bg-white border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-sage" />
              <h3 className="font-serif text-[16px] text-charcoal font-normal">Weight Trend</h3>
            </div>
            <WeightTrendChart data={weightChartData} unit={unit} />
          </div>
        </div>
      )}

      {/* Monthly Activity Calendar View */}
      <div className="bg-white border border-border/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-4 py-3.5 border-b border-border/60 bg-cream/40 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <CalendarIcon className="w-4 h-4 text-sage shrink-0" />
            <h3 className="font-serif text-[15px] sm:text-[17px] text-charcoal font-bold whitespace-nowrap">
              Monthly Log
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

      {/* History Log List */}
      <div className="bg-white border border-border/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-border/60 bg-cream/40 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sage" />
            <h3 className="font-serif text-[17px] sm:text-[18px] text-charcoal font-normal">Recent Logs</h3>
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
        
        <div className="divide-y divide-border/60">
          {filteredLogs.map((log) => {
            const dateStr = new Date(log.timestamp).toLocaleString('en-IN', {
              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
            });
            const isBP = log.type === 'BP';
            const isWearable = log.type === 'WEARABLE';
            const isWeight = log.type === 'WEIGHT';

            let tagColor = 'bg-cream text-charcoal border-border/80';
            const sys = log.systolic || 0;
            const dia = log.diastolic || 0;
            if (isBP) {
              if (sys >= 160 || dia >= 110) tagColor = 'bg-red-50 text-critical border-red-200 font-bold';
              else if (sys >= 140 || dia >= 90) tagColor = 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
              else if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) tagColor = 'bg-amber-50/60 text-amber-800 border-amber-200';
              else if (sys >= 120 && sys <= 129 && dia < 80) tagColor = 'bg-amber-50/40 text-amber-700 border-amber-200/60';
              else tagColor = 'bg-tulsi-light/70 text-sage-dark border-sage/30 font-medium';
            }

            return (
              <div key={log.id} className="flex items-center justify-between p-3.5 sm:px-5 hover:bg-cream/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-sage/10 text-sage flex items-center justify-center shrink-0">
                    {isBP ? <Heart className="w-4 h-4" /> : isWeight ? <Scale className="w-4 h-4" /> : <Watch className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isBP ? (
                        <span className="font-serif text-[16px] text-charcoal font-normal">
                          {log.systolic && log.diastolic ? `${log.systolic}/${log.diastolic}` : '—'} <span className="text-[12px] text-medium font-sans font-normal">mmHg</span>
                        </span>
                      ) : isWeight ? (
                        <span className="font-serif text-[16px] text-charcoal font-normal">
                          {log.weight} <span className="text-[12px] text-medium font-sans font-normal">{log.unit}</span>
                        </span>
                      ) : (
                        <span className="font-medium text-[14px] text-charcoal">
                          {log.source === 'Google Health Connect' ? 'Health Connect' : (WEARABLE_DEVICES.find(d => d.id === log.source)?.name || log.source)}
                        </span>
                      )}

                      {isBP && (
                        <span className={`text-[10.5px] px-2 py-0.5 rounded-md border ${tagColor}`}>
                          BP
                        </span>
                      )}
                      {isWeight && (
                        <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-sage/10 text-sage-dark border border-sage/20 font-medium">
                          Weight
                        </span>
                      )}
                      {log.pulse && !isWearable && (
                        <span className="text-[11.5px] text-medium">♥ {log.pulse} bpm</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[12px] text-medium mt-0.5">
                      <span>{dateStr}</span>
                      {log.notes && <span>• "{log.notes}"</span>}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(log.id)}
                  className="p-2 text-light hover:text-red-500 hover:bg-red-50/80 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
                  aria-label="Delete entry"
                  title="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
          {filteredLogs.length === 0 && (
            <div className="p-8 text-center text-medium space-y-1">
              <Heart className="w-8 h-8 mx-auto text-medium/40 mb-2" />
              <p className="text-[13.5px] font-medium text-charcoal">No vitals recorded yet</p>
              <p className="text-[12px] text-medium">Log blood pressure or weight above to view history.</p>
            </div>
          )}
        </div>
      </div>

      {/* Maternal Clinical Advisory Banner */}
      <div className="bg-gradient-to-br from-tulsi-light/50 via-cream to-white border border-sage/30 rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-sage/15 flex items-center justify-center text-sage-dark shrink-0 mt-0.5">
            <Heart className="w-5 h-5 text-sage" />
          </div>
          <div className="space-y-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-sage-dark bg-sage/15 px-2 py-0.5 rounded-full">
              Maternal Health Care Protocol
            </span>
            <p className="text-[13px] text-charcoal leading-relaxed font-normal">
              A blood pressure reading of <strong className="text-charcoal font-semibold">≥140/90 mmHg</strong> warrants clinical evaluation for gestational hypertension or pre-eclampsia. Free checks are available at all primary health centers (PHCs) and on the 9th of every month under PMSMA. If you experience headache, visual changes, or BP ≥160/110, call 108 immediately.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
