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
  RefreshCw,
  CheckCircle2,
  Moon,
  Activity,
  Thermometer,
  Flame,
  Check
} from 'lucide-react';
import { WEARABLE_DEVICES, syncWearableData, generateMockBiometrics } from '../../utils/wearableService';

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

  const logs = useLiveQuery(
    () => {
      if (!state.activeJourneyId) return [];
      return db.vitalsLogs
        .where('journeyId')
        .equals(state.activeJourneyId)
        .reverse()
        .sortBy('timestamp');
    },
    [state.activeJourneyId]
  ) || [];

  const handleLogVitals = async () => {
    if (!state.activeJourneyId) return;

    if (activeTab === 'BP' && (!systolic || !diastolic)) return;
    if (activeTab === 'WEIGHT' && !weight) return;

    const entry = {
      id: uuidv4(),
      journeyId: state.activeJourneyId,
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

  if (!state.activeJourneyId) {
    return (
      <div className="p-6 bg-white border border-border rounded-2xl shadow-sm text-center">
        <Heart className="w-12 h-12 text-medium mx-auto mb-4" />
        <h2 className="font-serif text-2xl text-charcoal mb-2">Vitals Tracker</h2>
        <p className="text-medium text-[15px]">Please complete setup first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Heart className="w-8 h-8 text-sage" />
        <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-normal text-charcoal">Vitals</h1>
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
              {/* Sync Dashboard Banner */}
              <div className="bg-gradient-to-r from-sage/10 to-sage-light/5 border border-sage/20 rounded-[16px] p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center md:text-left">
                  <h3 className="font-serif text-[18px] font-medium text-charcoal flex items-center justify-center md:justify-start gap-2">
                    <Watch className="w-5 h-5 text-sage" /> Wearable Integration Centre
                  </h3>
                  <p className="text-[13px] text-medium max-w-[500px]">
                    Link your favorite fitness app or smartwatch to automatically sync resting heart rate, HRV, body temperature, steps, and sleep tracking into your daily charts and Labor Readiness score.
                  </p>
                </div>
                {state.connectedWearables && state.connectedWearables.length > 0 && (
                  <button
                    onClick={async () => {
                      if (!state.activeJourneyId) return;
                      setIsSyncing(true);
                      // Simulate API fetch
                      await new Promise(r => setTimeout(r, 1500));
                      for (const devId of state.connectedWearables || []) {
                        await syncWearableData(state.activeJourneyId, devId);
                      }
                      updateState({ lastWearableSyncTime: Date.now() });
                      setIsSyncing(false);
                    }}
                    disabled={isSyncing}
                    className="px-5 py-3 rounded-[12px] bg-sage text-white font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-sage-dark transition-all shadow-md disabled:opacity-50 shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync Wearable Data'}
                  </button>
                )}
              </div>

              {/* Connected Wearables Status Grid */}
              {state.connectedWearables && state.connectedWearables.length > 0 ? (
                <div className="bg-white border border-border rounded-[16px] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold tracking-wider uppercase text-light">LATEST IMPORTED METRICS</span>
                    <span className="text-[11px] text-medium">
                      Last synced:{' '}
                      {state.lastWearableSyncTime
                        ? new Date(state.lastWearableSyncTime).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })
                        : 'Never'}
                    </span>
                  </div>

                  {(() => {
                    const latestLog = logs.find((l) => l.type === 'WEARABLE');
                    const steps = latestLog?.steps || 6420;
                    const sleep = latestLog?.sleepHours || 7.2;
                    const rhr = latestLog?.restingHeartRate || 74;
                    const hrv = latestLog?.hrv || 42;
                    const temp = latestLog?.basalBodyTemp || 36.6;
                    const spo2 = latestLog?.spo2 || 98;

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="p-4 bg-cream border border-border rounded-[12px] space-y-2 flex flex-col justify-between">
                          <div className="flex items-center justify-between text-medium">
                            <span className="text-[12px] font-semibold">Daily Steps</span>
                            <Flame className="w-4 h-4 text-orange-500" />
                          </div>
                          <div>
                            <div className="text-[20px] font-serif font-bold text-charcoal">{steps.toLocaleString()}</div>
                            <div className="text-[10px] text-light mt-0.5">Target: 6,000 steps</div>
                          </div>
                        </div>

                        <div className="p-4 bg-cream border border-border rounded-[12px] space-y-2 flex flex-col justify-between">
                          <div className="flex items-center justify-between text-medium">
                            <span className="text-[12px] font-semibold">Sleep Duration</span>
                            <Moon className="w-4 h-4 text-indigo-500" />
                          </div>
                          <div>
                            <div className="text-[20px] font-serif font-bold text-charcoal">{sleep} hrs</div>
                            <div className="text-[10px] text-light mt-0.5">Target: 8.0 hrs</div>
                          </div>
                        </div>

                        <div className="p-4 bg-cream border border-border rounded-[12px] space-y-2 flex flex-col justify-between">
                          <div className="flex items-center justify-between text-medium">
                            <span className="text-[12px] font-semibold">Resting HR (RHR)</span>
                            <Activity className="w-4 h-4 text-rose-500" />
                          </div>
                          <div>
                            <div className="text-[20px] font-serif font-bold text-charcoal">{rhr} bpm</div>
                            <div className="text-[10px] text-light mt-0.5">Pregnancy Normal: 70-85</div>
                          </div>
                        </div>

                        <div className="p-4 bg-cream border border-border rounded-[12px] space-y-2 flex flex-col justify-between">
                          <div className="flex items-center justify-between text-medium">
                            <span className="text-[12px] font-semibold">Heart Rate Var (HRV)</span>
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div>
                            <div className="text-[20px] font-serif font-bold text-charcoal">{hrv} ms</div>
                            <div className="text-[10px] text-light mt-0.5">RMSSD baseline</div>
                          </div>
                        </div>

                        <div className="p-4 bg-cream border border-border rounded-[12px] space-y-2 flex flex-col justify-between">
                          <div className="flex items-center justify-between text-medium">
                            <span className="text-[12px] font-semibold">Basal Body Temp</span>
                            <Thermometer className="w-4 h-4 text-amber-500" />
                          </div>
                          <div>
                            <div className="text-[20px] font-serif font-bold text-charcoal">{temp} °C</div>
                            <div className="text-[10px] text-light mt-0.5">Pregnancy Normal: 36.5-37.1</div>
                          </div>
                        </div>

                        <div className="p-4 bg-cream border border-border rounded-[12px] space-y-2 flex flex-col justify-between">
                          <div className="flex items-center justify-between text-medium">
                            <span className="text-[12px] font-semibold">Blood Oxygen (SpO2)</span>
                            <Heart className="w-4 h-4 text-teal-500 fill-teal-500" />
                          </div>
                          <div>
                            <div className="text-[20px] font-serif font-bold text-charcoal">{spo2}%</div>
                            <div className="text-[10px] text-light mt-0.5">Pregnancy Normal: &gt;95%</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-center p-8 bg-cream border border-dashed border-border rounded-[16px] max-w-xl mx-auto space-y-3">
                  <Watch className="w-12 h-12 text-medium mx-auto opacity-60" />
                  <h4 className="font-serif text-[18px] text-charcoal">No Wearables Linked Yet</h4>
                  <p className="text-[13px] text-medium max-w-sm mx-auto leading-relaxed">
                    Select a service below to securely link your device. Bloom never shares your medical data and encrypts your biometrics locally.
                  </p>
                </div>
              )}

              {/* Devices Grid */}
              <div className="space-y-4">
                <h4 className="text-[12px] font-bold tracking-wider uppercase text-light ml-1">AVAILABLE INTEGRATIONS</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {WEARABLE_DEVICES.map((device) => {
                    const isConnected = state.connectedWearables?.includes(device.id);
                    const isConnecting = connectingDevice === device.id;

                    return (
                      <div
                        key={device.id}
                        className="bg-white border-[1.5px] border-border rounded-[16px] p-5 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow relative overflow-hidden group"
                        style={{ borderLeft: `4px solid ${device.color}` }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <h5 className="font-bold text-[15px] text-charcoal flex items-center gap-1.5">
                              <span className="text-[18px]">{device.icon}</span> {device.name}
                            </h5>
                            <p className="text-[12px] text-light leading-relaxed">{device.description}</p>
                          </div>
                          {isConnected && (
                            <span className="bg-sage/10 text-sage border border-sage/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                              Connected
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-light">
                            {isConnected ? '✓ Biometrics syncing active' : 'Disconnected'}
                          </span>

                          {isConnected ? (
                            <button
                              onClick={() => {
                                const list = state.connectedWearables || [];
                                updateState({
                                  connectedWearables: list.filter((id) => id !== device.id)
                                });
                              }}
                              className="px-3.5 py-1.5 border-[1.5px] border-critical text-critical text-[12px] font-semibold rounded-lg hover:bg-critical-bg transition-colors cursor-pointer"
                            >
                              Disconnect
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setShowOAuthModal(device.id);
                              }}
                              disabled={isConnecting}
                              className="px-3.5 py-1.5 bg-sage text-white text-[12px] font-semibold rounded-lg hover:bg-sage-dark transition-colors disabled:opacity-50 flex items-center gap-1 shadow-sm cursor-pointer"
                            >
                              {isConnecting ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Connecting...
                                </>
                              ) : (
                                'Link Device'
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Simulated OAuth Modal Overlay */}
              {showOAuthModal && (() => {
                const device = WEARABLE_DEVICES.find((d) => d.id === showOAuthModal);
                if (!device) return null;

                return (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white border-[1.5px] border-border rounded-[20px] max-w-md w-full p-6 shadow-xl relative animate-in zoom-in duration-200">
                      <button
                        onClick={() => setShowOAuthModal(null)}
                        className="absolute right-4 top-4 text-light hover:text-charcoal p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        ✕
                      </button>

                      <div className="text-center space-y-2 mb-6">
                        <span className="text-[40px] block">{device.icon}</span>
                        <h4 className="font-serif text-[22px] font-medium text-charcoal">Link {device.name}</h4>
                        <p className="text-[13px] text-medium leading-relaxed">
                          Bloom will download physiological and fitness logs securely from your {device.name} account to calculate reports.
                        </p>
                      </div>

                      <div className="bg-cream border border-border rounded-[12px] p-4 space-y-3 mb-6">
                        <span className="text-[11px] font-bold tracking-wider uppercase text-light block mb-1">
                          SELECT PERMISSIONS TO ALLOW
                        </span>

                        <label className="flex items-center gap-3 text-[13px] text-charcoal font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={oauthPermissions.activity}
                            onChange={(e) => setOauthPermissions({ ...oauthPermissions, activity: e.target.checked })}
                            className="w-4 h-4 rounded text-sage focus:ring-sage border-border cursor-pointer"
                          />
                          <span>Read Active Fitness & Steps</span>
                        </label>

                        <label className="flex items-center gap-3 text-[13px] text-charcoal font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={oauthPermissions.vitals}
                            onChange={(e) => setOauthPermissions({ ...oauthPermissions, vitals: e.target.checked })}
                            className="w-4 h-4 rounded text-sage focus:ring-sage border-border cursor-pointer"
                          />
                          <span>Read Heart Rate Biometrics (RHR, HRV)</span>
                        </label>

                        <label className="flex items-center gap-3 text-[13px] text-charcoal font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={oauthPermissions.sleep}
                            onChange={(e) => setOauthPermissions({ ...oauthPermissions, sleep: e.target.checked })}
                            className="w-4 h-4 rounded text-sage focus:ring-sage border-border cursor-pointer"
                          />
                          <span>Read Sleep & Basal Body Temperature</span>
                        </label>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowOAuthModal(null)}
                          className="flex-1 py-3 border border-border text-medium text-[14px] font-semibold rounded-[10px] hover:bg-gray-50 transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={async () => {
                            const devId = showOAuthModal;
                            setShowOAuthModal(null);
                            setConnectingDevice(devId);
                            // Simulate link loading
                            await new Promise((r) => setTimeout(r, 1200));

                            const current = state.connectedWearables || [];
                            if (!current.includes(devId)) {
                              const updatedList = [...current, devId];
                              updateState({ connectedWearables: updatedList });
                              // Auto sync fresh data immediately
                              if (state.activeJourneyId) {
                                await syncWearableData(state.activeJourneyId, devId);
                                updateState({ lastWearableSyncTime: Date.now() });
                              }
                            }
                            setConnectingDevice(null);
                          }}
                          className="flex-1 py-3 bg-sage text-white text-[14px] font-semibold rounded-[10px] hover:bg-sage-dark transition-all shadow-md cursor-pointer"
                        >
                          Agree & Sync
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

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
                      <span className="font-serif text-[18px] text-charcoal flex items-center gap-2">
                        <span>{WEARABLE_DEVICES.find(d => d.id === log.source)?.icon || '⌚'}</span>
                        <span>Synced Health Metrics</span>
                      </span>
                    ) : (
                      <span className="font-serif text-[20px] text-charcoal">{log.weight} {log.unit}</span>
                    )}
                    {isBP && <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${tagColor}`}>BP</span>}
                    {isWearable && (
                      <span className="bg-sage/10 text-sage border border-sage/20 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                        {WEARABLE_DEVICES.find(d => d.id === log.source)?.name || log.source}
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
                        <span className="font-bold">{log.restingHeartRate}</span> bpm RHR
                      </div>
                      <div className="text-[12px] bg-cream border border-border p-1.5 rounded-lg flex items-center gap-1.5 text-charcoal">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-bold">{log.hrv}</span> ms HRV
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

      {!state.isCalmModeActive && (
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
      )}
    </div>
  );
};
