import React, { useState } from 'react';
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
  Smartphone,
  CheckCircle2,
  Moon,
  Activity,
  Thermometer,
  Flame,
  Check,
  Shield,
  ExternalLink,
  Zap,
  Info,
  Clock
} from 'lucide-react';
import { WEARABLE_DEVICES, syncWearableData, generateMockBiometrics } from '../../utils/wearableService';
import {
  getHealthConnectStatus,
  requestHealthConnectPermissions,
  disconnectHealthConnect,
  syncHealthConnectVitals,
  openHealthConnectApp,
  isHealthConnectSupported,
  HealthConnectStatus
} from '../../utils/healthConnectBridge';

const Sparkline = ({ data, color, width = 300, height = 60 }: { data: number[], color: string, width?: number, height?: number }) => {
  if (data.length < 2) return <div className="h-[60px] w-full flex items-center justify-center text-light text-[12px]">Not enough data</div>;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 10) - 5;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * (height - 10) - 5;
        return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
      })}
    </svg>
  );
};

export const VitalsTracker: React.FC = () => {
  const { state, updateState } = usePlanner();
  const [activeTab, setActiveTab] = useState<'BP' | 'WEIGHT' | 'WEARABLES'>('BP');
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectingDevice, setConnectingDevice] = useState<string | null>(null);
  const [showOAuthModal, setShowOAuthModal] = useState<string | null>(null);
  const [oauthPermissions, setOauthPermissions] = useState({ activity: true, vitals: true, sleep: true });

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

    if (sys >= 160 || dia >= 110) return { label: 'Hypertensive Crisis — Go to hospital immediately', color: 'bg-red-600 text-white shadow-md animate-pulse', urgent: true };
    if (sys >= 140 || dia >= 90) return { label: 'High Stage 2 — Contact your doctor', color: 'bg-red-100 text-red-800 border-[1.5px] border-red-300', urgent: true };
    if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) return { label: 'High Stage 1', color: 'bg-orange-100 text-orange-800 border-[1.5px] border-orange-300', urgent: false };
    if (sys >= 120 && sys <= 129 && dia < 80) return { label: 'Elevated', color: 'bg-amber-100 text-amber-800 border-[1.5px] border-amber-300', urgent: false };
    return { label: 'Normal', color: 'bg-green-100 text-green-800 border-[1.5px] border-green-300', urgent: false };
  };

  const bpLogs = logs.filter(l => l.type === 'BP');
  const weightLogs = logs.filter(l => l.type === 'WEIGHT');

  const bpClass = getBPClassification();

  // Simple sparkline data
  const sysData = bpLogs.slice(0, 10).reverse().map(l => l.systolic || 0).filter(v => v > 0);
  const diaData = bpLogs.slice(0, 10).reverse().map(l => l.diastolic || 0).filter(v => v > 0);
  const wData = weightLogs.slice(0, 10).reverse().map(l => l.weight || 0).filter(v => v > 0);

  // Calendar Logic
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday ...

  const isSundayStart = state.calendarStartDay === 'sunday';
  // If Sunday start: just use firstDay (0-6).
  // If Monday start: shift so Monday is 0, Sunday is 6.
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
      <div className="p-6 bg-white border border-border rounded-2xl shadow-sm text-center">
        <Heart className="w-12 h-12 text-medium mx-auto mb-4" />
        <h2 className="font-serif text-2xl text-charcoal mb-2">Health Metrics Tracker</h2>
        <p className="text-medium text-[15px]">Please complete setup first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Heart className="w-8 h-8 text-sage" />
        <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-normal text-charcoal">Health Metrics</h1>
      </div>

      <div className="bg-white border-[1.5px] border-border rounded-[16px] shadow-sm overflow-hidden">
        <div className="flex border-b border-border">
          <button
            className={`flex-1 py-4 text-[15px] font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'BP' ? 'text-sage border-b-[3px] border-sage bg-sage-pale/20' : 'text-medium hover:bg-gray-50'}`}
            onClick={() => setActiveTab('BP')}
          >
            <Heart className="w-4 h-4" /> Blood Pressure
          </button>
          <button
            className={`flex-1 py-4 text-[15px] font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'WEIGHT' ? 'text-sage border-b-[3px] border-sage bg-sage-pale/20' : 'text-medium hover:bg-gray-50'}`}
            onClick={() => setActiveTab('WEIGHT')}
          >
            <Scale className="w-4 h-4" /> Weight
          </button>
          <button
            className={`flex-1 py-4 text-[15px] font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'WEARABLES' ? 'text-sage border-b-[3px] border-sage bg-sage-pale/20' : 'text-medium hover:bg-gray-50'}`}
            onClick={() => setActiveTab('WEARABLES')}
          >
            <Watch className="w-4 h-4" /> Wearables
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {activeTab !== 'WEARABLES' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div className="flex flex-col">
                  <label className="text-[12px] font-semibold uppercase tracking-wider text-light mb-1.5 ml-1">Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="p-[11px_14px] border-[1.5px] border-border rounded-[10px] focus:border-sage focus:ring-[3px] focus:ring-sage/10 text-[15px]" />
                </div>
                <div className="flex flex-col">
                  <label className="text-[12px] font-semibold uppercase tracking-wider text-light mb-1.5 ml-1">Time</label>
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} className="p-[11px_14px] border-[1.5px] border-border rounded-[10px] focus:border-sage focus:ring-[3px] focus:ring-sage/10 text-[15px]" />
                </div>
              </div>

              {activeTab === 'BP' ? (
                <div className="space-y-5 animate-in slide-in-from-left-2">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col">
                      <label className="text-[12px] font-semibold uppercase tracking-wider text-light mb-1.5 ml-1 text-center">Systolic</label>
                      <input type="number" placeholder="120" value={systolic} onChange={e => setSystolic(e.target.value)} className="p-[14px] text-center font-serif text-[24px] border-[1.5px] border-border rounded-[10px] focus:border-sage focus:ring-[3px] focus:ring-sage/10 text-charcoal outline-none placeholder:text-medium/40" />
                    </div>
                    <div className="flex items-center justify-center font-serif text-[32px] text-border pt-6">/</div>
                    <div className="flex flex-col">
                      <label className="text-[12px] font-semibold uppercase tracking-wider text-light mb-1.5 ml-1 text-center">Diastolic</label>
                      <input type="number" placeholder="80" value={diastolic} onChange={e => setDiastolic(e.target.value)} className="p-[14px] text-center font-serif text-[24px] border-[1.5px] border-border rounded-[10px] focus:border-sage focus:ring-[3px] focus:ring-sage/10 text-charcoal outline-none placeholder:text-medium/40" />
                    </div>
                  </div>

                  {bpClass && (
                    <div className={`p-4 rounded-[12px] font-medium text-[14px] flex items-center justify-center gap-2 ${bpClass.color}`}>
                      {bpClass.urgent && <AlertTriangle className="w-5 h-5" />}
                      {bpClass.label}
                    </div>
                  )}

                  <div className="flex flex-col">
                    <label className="text-[12px] font-semibold uppercase tracking-wider text-light mb-1.5 ml-1">Pulse (optional)</label>
                    <input type="number" placeholder="bpm" value={pulse} onChange={e => setPulse(e.target.value)} className="p-[11px_14px] border-[1.5px] border-border rounded-[10px] focus:border-sage focus:ring-[3px] focus:ring-sage/10 text-[15px]" />
                  </div>
                </div>
              ) : (
                <div className="space-y-5 animate-in slide-in-from-right-2">
                  <div className="flex flex-col">
                    <label className="text-[12px] font-semibold uppercase tracking-wider text-light mb-1.5 ml-1">Weight</label>
                    <div className="relative">
                      <input type="number" step="0.1" placeholder={`e.g. 60`} value={weight} onChange={e => setWeight(e.target.value)} className="w-full p-[14px] font-serif text-[24px] border-[1.5px] border-border rounded-[10px] focus:border-sage focus:ring-[3px] focus:ring-sage/10 text-charcoal outline-none placeholder:text-medium/40 pr-[80px] text-center" />
                      <button onClick={toggleUnit} className="absolute right-3 top-[15px] bottom-[15px] px-3 bg-white border border-border rounded-lg text-medium font-semibold text-[13px] hover:bg-gray-50 flex items-center">
                        {unit}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col mt-5">
                <label className="text-[12px] font-semibold uppercase tracking-wider text-light mb-1.5 ml-1">Notes (optional)</label>
                <input type="text" placeholder="How are you feeling?" value={notes} onChange={e => setNotes(e.target.value)} className="p-[11px_14px] border-[1.5px] border-border rounded-[10px] focus:border-sage focus:ring-[3px] focus:ring-sage/10 text-[15px]" />
              </div>

              <button
                onClick={handleLogVitals}
                className="w-full mt-6 py-4 rounded-[12px] font-semibold text-[16px] text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shadow-md bg-sage hover:bg-sage-dark"
              >
                <Plus className="w-5 h-5" /> Log {activeTab === 'BP' ? 'Blood Pressure' : 'Weight'}
              </button>
            </>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Feedback toast / banner if any */}
              {hcFeedback && (
                <div
                  className={`p-4 rounded-xl text-[13px] flex items-center justify-between gap-3 ${
                    hcFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : hcFeedback.type === 'error'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : 'bg-blue-50 text-blue-800 border border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {hcFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
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

              {/* Primary Google Health Connect Card */}
              <div className="bg-white border-[1.5px] border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="flex flex-col gap-3.5 pb-5 border-b border-border/70 text-left">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-[19px] font-bold text-charcoal">
                        Google Health Connect
                      </h3>
                      {!hcStatus.isNative && (
                        <span className="text-[10px] font-semibold text-medium bg-cream px-2 py-0.5 rounded-md border border-border">
                          Web Preview
                        </span>
                      )}
                    </div>

                    {hcStatus.isConnected ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-medium border border-border shrink-0">
                        Not Connected
                      </span>
                    )}
                  </div>

                  <p className="text-[12.5px] text-medium leading-relaxed">
                    Import Blood Pressure, Weight, Heart Rate, Steps, Sleep, and SpO2 securely.
                  </p>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    {hcStatus.isConnected ? (
                      <button
                        type="button"
                        onClick={handleDisconnectHC}
                        className="text-[12px] font-semibold text-medium hover:text-rose-600 transition-colors py-2 cursor-pointer"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <span className="text-[11.5px] text-light font-medium">Android Health Connect</span>
                    )}

                    <button
                      type="button"
                      onClick={handleConnectOrSyncHC}
                      disabled={isSyncingHC}
                      className="inline-flex items-center justify-center px-5 py-2.5 bg-sage hover:bg-sage-dark text-white rounded-xl text-[13px] font-bold shadow-xs hover:shadow-sm active:scale-98 transition-all cursor-pointer disabled:opacity-70 whitespace-nowrap"
                    >
                      {isSyncingHC && (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 shrink-0" />
                      )}
                      <span className="whitespace-nowrap">
                        {isSyncingHC ? 'Syncing Health Data...' : hcStatus.isConnected ? 'Sync Health Data' : 'Connect & Import'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Metrics synced summary & Quick tags */}
                <div className="py-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11.5px]">
                  <div className="bg-cream/60 rounded-xl p-2.5 border border-border/50">
                    <span className="text-[10px] uppercase tracking-wider text-light block font-semibold">Blood Pressure</span>
                    <span className="font-bold text-charcoal">Pre-eclampsia screening</span>
                  </div>
                  <div className="bg-cream/60 rounded-xl p-2.5 border border-border/50">
                    <span className="text-[10px] uppercase tracking-wider text-light block font-semibold">Maternal Weight</span>
                    <span className="font-bold text-charcoal">Gestational curve</span>
                  </div>
                  <div className="bg-cream/60 rounded-xl p-2.5 border border-border/50">
                    <span className="text-[10px] uppercase tracking-wider text-light block font-semibold">Heart Rate & SpO2</span>
                    <span className="font-bold text-charcoal">Cardiovascular load</span>
                  </div>
                  <div className="bg-cream/60 rounded-xl p-2.5 border border-border/50">
                    <span className="text-[10px] uppercase tracking-wider text-light block font-semibold">Steps & Sleep</span>
                    <span className="font-bold text-charcoal">Maternal recovery</span>
                  </div>
                </div>

                {/* Footer status / App links */}
                <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-[11.5px] text-medium gap-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sage" />
                    <span>
                      {hcStatus.lastSyncTime
                        ? `Last synced: ${new Date(hcStatus.lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : 'No sync completed yet'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenHCApp}
                    className="inline-flex items-center gap-1 text-sage font-bold hover:underline cursor-pointer"
                  >
                    <span>Health Connect Settings</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Zero-Cloud Privacy Guarantee */}
              <div className="bg-cream/80 border border-border rounded-xl p-3.5 flex items-center gap-3">
                <Shield className="w-5 h-5 text-sage shrink-0" />
                <p className="text-[12px] text-medium leading-relaxed">
                  <strong className="text-charcoal">Zero-Cloud Local Privacy:</strong> All imported Health Connect metrics are stored strictly inside your phone’s local encrypted Dexie database. We do not upload your biometric data to any remote servers.
                </p>
              </div>

              {/* Other Wearable Ecosystems */}
              <div className="space-y-3 pt-2">
                <div className="text-[11px] font-bold tracking-wider uppercase text-light">
                  OTHER CONNECTED PLATFORMS
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {WEARABLE_DEVICES.filter(d => !d.isNativeHealth).map(device => (
                    <div
                      key={device.id}
                      className="bg-white border border-border rounded-xl p-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[20px]">{device.icon}</span>
                        <div>
                          <h4 className="text-[13px] font-bold text-charcoal">{device.name}</h4>
                          <p className="text-[11px] text-medium line-clamp-1">{device.description}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSyncOtherWearable(device)}
                        disabled={isSyncing}
                        className="px-2.5 py-1 bg-cream hover:bg-sage/10 text-charcoal text-[11px] font-bold rounded-lg border border-border cursor-pointer transition-colors shrink-0"
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

      {activeTab !== 'WEARABLES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border-[1.5px] border-border rounded-[16px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-sage" />
              <h3 className="font-semibold text-charcoal text-[16px]">BP Trend (Last 10)</h3>
            </div>
            <div className="relative pt-2">
              {sysData.length > 0 ? (
                <>
                  <div className="absolute top-0 right-0 flex gap-2 text-[11px] font-medium text-medium">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-sage"></div>Sys</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#E8A598]"></div>Dia</span>
                  </div>
                  <div className="mt-4">
                    <Sparkline data={sysData} color="#7A9E87" />
                  </div>
                  <div className="mt-[-40px]">
                    <Sparkline data={diaData} color="#E8A598" height={40} />
                  </div>
                </>
              ) : <div className="h-[60px] flex items-center justify-center text-medium text-[13px]">No data logged</div>}
            </div>
          </div>

          <div className="bg-white border-[1.5px] border-border rounded-[16px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-sage" />
              <h3 className="font-semibold text-charcoal text-[16px]">Weight Trend (Last 10)</h3>
            </div>
            <div className="pt-2">
              {wData.length > 0 ? (
                <div className="mt-4">
                  <Sparkline data={wData} color="#7A9E87" />
                </div>
              ) : <div className="h-[60px] flex items-center justify-center text-medium text-[13px]">No data logged</div>}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-[1.5px] border-border rounded-[16px] shadow-sm overflow-hidden">
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
              if (d === null) return <div key={`empty-${i}`} className="w-8 h-8 sm:w-10 sm:h-10 mx-auto" />;

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

      <div className="bg-white border-[1.5px] border-border rounded-[16px] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-charcoal text-[17px]">History</h3>
          {selectedDateFilter && (
            <button onClick={() => setSelectedDateFilter(null)} className="text-[12px] font-semibold text-sage hover:text-sage-dark">
              Clear Filter
            </button>
          )}
        </div>
        <div className="divide-y divide-border">
          {filteredLogs.map((log) => {
            const dateStr = new Date(log.timestamp).toLocaleString('en-IN', {
              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
            });
            const isBP = log.type === 'BP';
            const isWearable = log.type === 'WEARABLE';
            const isWeight = log.type === 'WEIGHT';

            let tagColor = 'text-medium bg-gray-100';
            let sys = log.systolic || 0;
            let dia = log.diastolic || 0;
            if (isBP) {
              if (sys >= 160 || dia >= 110) tagColor = 'text-white bg-red-600';
              else if (sys >= 140 || dia >= 90) tagColor = 'text-red-800 bg-red-100';
              else if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) tagColor = 'text-orange-800 bg-orange-100';
              else if (sys >= 120 && sys <= 129 && dia < 80) tagColor = 'text-amber-800 bg-amber-100';
              else tagColor = 'text-green-800 bg-green-100';
            }

            return (
              <div key={log.id} className="flex items-center justify-between p-4 sm:px-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col gap-1 w-full mr-4">
                  <p className="text-[13px] text-medium">{dateStr}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    {isBP ? (
                      <span className="font-serif text-[20px] text-charcoal">{log.systolic}/{log.diastolic}</span>
                    ) : isWearable ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-serif text-[17px] text-charcoal flex items-center gap-1.5">
                          <span>{WEARABLE_DEVICES.find(d => d.id === log.source)?.icon || '💚'}</span>
                          <span>{WEARABLE_DEVICES.find(d => d.id === log.source)?.name || log.source}</span>
                        </span>
                        {log.systolic && log.diastolic && (
                          <span className="text-[12px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                            {log.systolic}/{log.diastolic} mmHg
                          </span>
                        )}
                        {log.weight && (
                          <span className="text-[12px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            {log.weight} kg
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="font-serif text-[20px] text-charcoal">{log.weight} {log.unit}</span>
                    )}
                    {isBP && <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${tagColor}`}>BP</span>}
                    {isWearable && (
                      <span className="bg-sage/10 text-sage border border-sage/20 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                        {log.source === 'Google Health Connect' ? 'Health Connect' : (WEARABLE_DEVICES.find(d => d.id === log.source)?.name || log.source)}
                      </span>
                    )}
                    {isWeight && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-medium bg-gray-100">Weight</span>}
                    {log.pulse && !isWearable && <span className="text-[12px] text-medium">♥ {log.pulse} bpm</span>}
                  </div>

                  {isWearable && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 max-w-lg w-full">
                      <div className="text-[12px] bg-cream border border-border p-1.5 rounded-lg flex items-center gap-1.5 text-charcoal">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span className="font-bold">{log.steps?.toLocaleString()}</span> steps
                      </div>
                      <div className="text-[12px] bg-cream border border-border p-1.5 rounded-lg flex items-center gap-1.5 text-charcoal">
                        <Moon className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-bold">{log.sleepHours}</span> hrs sleep
                      </div>
                      <div className="text-[12px] bg-cream border border-border p-1.5 rounded-lg flex items-center gap-1.5 text-charcoal">
                        <Activity className="w-3.5 h-3.5 text-rose-500" />
                        <span className="font-bold">{log.restingHeartRate || log.pulse}</span> bpm RHR
                      </div>
                      <div className="text-[12px] bg-cream border border-border p-1.5 rounded-lg flex items-center gap-1.5 text-charcoal">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-bold">{log.hrv || 42}</span> ms HRV
                      </div>
                      <div className="text-[12px] bg-cream border border-border p-1.5 rounded-lg flex items-center gap-1.5 text-charcoal">
                        <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-bold">{log.basalBodyTemp}</span> °C BBT
                      </div>
                      <div className="text-[12px] bg-cream border border-border p-1.5 rounded-lg flex items-center gap-1.5 text-charcoal">
                        <Heart className="w-3.5 h-3.5 text-teal-500 fill-teal-500" />
                        <span className="font-bold">{log.spo2}%</span> SpO2
                      </div>
                    </div>
                  )}
                  {log.notes && <p className="text-[13px] text-medium mt-1 italic">"{log.notes}"</p>}
                </div>
                <button
                  onClick={() => handleDelete(log.id)}
                  className="p-2 text-medium hover:text-critical hover:bg-critical-bg rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            );
          })}
          {logs.length === 0 && (
            <div className="p-8 text-center text-medium">No vitals logged yet.</div>
          )}
        </div>
      </div>

        <div className="bg-cream border-[1.5px] border-border rounded-[16px] p-5 shadow-inner">
          <div className="flex gap-4">
            <AlertTriangle className="w-5 h-5 text-sage shrink-0" />
            <div>
              <p className="text-[14px] text-charcoal font-medium leading-relaxed mb-1.5">
                BP ≥160/110? Call 108 immediately or go to your nearest government hospital.
              </p>
              <p className="text-[13px] text-medium">
                Free BP checks are available at your nearest PHC or on the 9th of every month under PMSMA.
              </p>
            </div>
          </div>
        </div>
    </div>
  );
};
