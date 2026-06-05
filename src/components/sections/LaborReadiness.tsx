import React, { useState, useEffect } from 'react';
import { usePlanner } from '../../store';
import { db } from '../../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Activity, HeartPulse, Thermometer, AlertTriangle, Info, Sparkles, Watch } from 'lucide-react';
import { calculateLaborReadiness, DailyBiometrics, ReadinessResult } from '../../utils/laborPrediction';

interface LaborReadinessProps {
  setActivePage?: (page: string) => void;
}

export const LaborReadiness: React.FC<LaborReadinessProps> = ({ setActivePage }) => {
  const { state } = usePlanner();

  // Query synced wearable biometrics
  const syncedWearableLogs = useLiveQuery(
    () => {
      if (!state.activeJourneyId) return [];
      return db.vitalsLogs
        .where('journeyId')
        .equals(state.activeJourneyId)
        .filter(l => l.type === 'WEARABLE')
        .reverse()
        .sortBy('timestamp');
    },
    [state.activeJourneyId]
  ) || [];

  const hasSyncedData = syncedWearableLogs.length >= 3;

  // Mock fallback data for baseline and recent
  const mockBaseline: DailyBiometrics[] = [
    { date: '2026-02-20', restingHeartRate: 68, hrv: 55, basalBodyTemp: 36.8, braxtonHicksCount: 0 },
    { date: '2026-02-21', restingHeartRate: 67, hrv: 56, basalBodyTemp: 36.7, braxtonHicksCount: 1 },
    { date: '2026-02-22', restingHeartRate: 69, hrv: 54, basalBodyTemp: 36.8, braxtonHicksCount: 0 },
  ];

  const mockRecent: DailyBiometrics[] = [
    { date: '2026-03-18', restingHeartRate: 74, hrv: 42, basalBodyTemp: 36.4, braxtonHicksCount: 4 },
    { date: '2026-03-19', restingHeartRate: 75, hrv: 40, basalBodyTemp: 36.3, braxtonHicksCount: 6 },
    { date: '2026-03-20', restingHeartRate: 76, hrv: 38, basalBodyTemp: 36.3, braxtonHicksCount: 5 },
  ];

  const [historicalBaseline, setHistoricalBaseline] = useState<DailyBiometrics[]>(mockBaseline);
  const [recentData, setRecentData] = useState<DailyBiometrics[]>(mockRecent);
  const [result, setResult] = useState<ReadinessResult | null>(null);

  useEffect(() => {
    if (hasSyncedData) {
      // Split synced wearable logs: ascending by timestamp for algorithms
      const sortedLogs = [...syncedWearableLogs].sort((a, b) => a.timestamp - b.timestamp);
      // Last 3 entries are recent, everything older is baseline
      const recentLogs = sortedLogs.slice(-3);
      const baselineLogs = sortedLogs.slice(0, -3);

      const mappedRecent = recentLogs.map(log => ({
        date: new Date(log.timestamp).toISOString().split('T')[0],
        restingHeartRate: log.restingHeartRate || null,
        hrv: log.hrv || null,
        basalBodyTemp: log.basalBodyTemp || null,
        braxtonHicksCount: 4 // mock Braxton Hicks count
      }));

      const mappedBaseline = baselineLogs.map(log => ({
        date: new Date(log.timestamp).toISOString().split('T')[0],
        restingHeartRate: log.restingHeartRate || null,
        hrv: log.hrv || null,
        basalBodyTemp: log.basalBodyTemp || null,
        braxtonHicksCount: 1
      }));

      setRecentData(mappedRecent);
      setHistoricalBaseline(mappedBaseline.length > 0 ? mappedBaseline : mockBaseline);
    } else {
      setHistoricalBaseline(mockBaseline);
      setRecentData(mockRecent);
    }
  }, [syncedWearableLogs, hasSyncedData]);

  useEffect(() => {
    const res = calculateLaborReadiness(historicalBaseline, recentData);
    setResult(res);
  }, [historicalBaseline, recentData]);

  // Helper to calculate averages for display
  const getAvg = (data: DailyBiometrics[], key: keyof DailyBiometrics) => {
    const valid = data.map(d => d[key] as number).filter(v => v !== null && !isNaN(v));
    return valid.length ? Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10 : 0;
  };

  const baseRHR = getAvg(historicalBaseline, 'restingHeartRate');
  const baseHRV = getAvg(historicalBaseline, 'hrv');
  const baseBBT = getAvg(historicalBaseline, 'basalBodyTemp');
  const baseBH = getAvg(historicalBaseline, 'braxtonHicksCount');

  const recentRHR = getAvg(recentData, 'restingHeartRate');
  const recentHRV = getAvg(recentData, 'hrv');
  const recentBBT = getAvg(recentData, 'basalBodyTemp');
  const recentBH = getAvg(recentData, 'braxtonHicksCount');

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-7">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gold-pale text-gold font-semibold text-[11px] uppercase tracking-[1px] rounded-full mb-3">
          <Sparkles size={12} /> Premium Feature
        </div>
        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-normal mb-1.5 flex items-center gap-3">
          <Activity className="text-sage" size={32} /> Labor Readiness
        </h2>
        {!state.isCalmModeActive && (
          <p className="text-[14px] text-medium max-w-[560px] leading-[1.7]">
            This conceptual algorithm analyzes your wearable biometric data to detect physiological shifts that often occur 7-10 days before spontaneous labor.
          </p>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-cream border-[1.5px] border-border rounded-[12px] p-4 mb-6 flex items-start gap-3">
        <Info className="text-medium shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="font-semibold text-[13px] text-charcoal mb-1">Conceptual Demonstration</h4>
          <p className="text-[12px] text-light leading-[1.5]">
            This is a simulated feature demonstrating how wearable data (Apple Health, Oura) could be integrated. There is currently no ACOG/WHO guideline validating the use of consumer wearables to predict labor onset. Do not use this for medical decisions.
          </p>
        </div>
      </div>

      {hasSyncedData ? (
        <div className="bg-sage-pale border border-sage/30 rounded-[12px] p-4 mb-8 flex items-start gap-3 animate-in fade-in duration-300">
          <Watch className="text-sage shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold text-[13px] text-sage-dark mb-1">Live Wearable Data Synced</h4>
            <p className="text-[12px] text-medium leading-[1.5]">
              Your score is now dynamically computed using physiological baseline and recent metrics synced from your wearable device.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gold-pale border border-gold/30 rounded-[12px] p-4 mb-8 flex items-start justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <Watch className="text-gold shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-[13px] text-charcoal mb-1">Simulated Baseline Active</h4>
              <p className="text-[12px] text-medium leading-[1.5]">
                To see a personalized Labor Readiness score based on your actual heart rate variability and temperature, connect a wearable device.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-gold-dark dark:text-gold bg-gold/10 border border-gold/20 px-3 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap shrink-0 self-center">
            Coming Soon
          </span>
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-white border-[1.5px] border-border rounded-[16px] p-6 shadow-sm flex flex-col sm:flex-row items-center gap-8">
              <div className="relative w-[140px] h-[140px] shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#E4E3E0" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="45" fill="none" stroke="#6B9278" strokeWidth="8"
                    strokeDasharray={`${(result.score / 100) * 283} 283`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[36px] font-serif font-medium text-charcoal leading-none">{result.score}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-[1px] text-light mt-1">Score</span>
                </div>
              </div>

              <div className="text-center sm:text-left">
                <h3 className="text-[20px] font-serif font-medium text-charcoal mb-2">
                  {result.score >= 80 ? 'High Readiness' : result.score >= 50 ? 'Elevated Readiness' : 'Baseline'}
                </h3>
                <p className="text-[14px] text-medium leading-[1.6] mb-4">
                  {result.advisory}
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream rounded-full text-[12px] font-medium text-charcoal">
                  <span className={`w-2 h-2 rounded-full ${result.confidence >= 80 ? 'bg-sage' : 'bg-gold'}`} />
                  {result.confidence}% Data Confidence
                </div>
              </div>
            </div>

            {/* Reasoning */}
            {result.reasoning.length > 0 && (
              <div className="bg-white border-[1.5px] border-border rounded-[16px] p-6 shadow-sm">
                <h4 className="text-[11px] font-semibold tracking-[1.2px] uppercase text-medium mb-4">Clinical Reasoning</h4>
                <ul className="space-y-3">
                  {result.reasoning.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[14px] text-charcoal">
                      <span className="text-sage mt-0.5">✦</span>
                      <span className="leading-[1.5]">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Biometric Trends */}
          <div className="bg-white border-[1.5px] border-border rounded-[16px] p-6 shadow-sm h-fit">
            <h4 className="text-[11px] font-semibold tracking-[1.2px] uppercase text-medium mb-5">7-Day Trends vs Baseline</h4>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-1.5 text-[13px] font-medium text-charcoal">
                    <HeartPulse size={14} className="text-sage" /> HRV (ms)
                  </div>
                  <span className="text-[13px] font-semibold text-charcoal">{recentHRV}</span>
                </div>
                <div className="flex justify-between text-[11px] text-light">
                  <span>Baseline: {baseHRV}</span>
                  <span className={baseHRV - recentHRV > 5 ? 'text-sage font-medium' : ''}>
                    {baseHRV - recentHRV > 0 ? '↓' : '↑'} {Math.abs(baseHRV - recentHRV)}
                  </span>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-1.5 text-[13px] font-medium text-charcoal">
                    <Activity size={14} className="text-sage" /> RHR (bpm)
                  </div>
                  <span className="text-[13px] font-semibold text-charcoal">{recentRHR}</span>
                </div>
                <div className="flex justify-between text-[11px] text-light">
                  <span>Baseline: {baseRHR}</span>
                  <span className={recentRHR - baseRHR > 2 ? 'text-sage font-medium' : ''}>
                    {recentRHR - baseRHR > 0 ? '↑' : '↓'} {Math.abs(recentRHR - baseRHR)}
                  </span>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-1.5 text-[13px] font-medium text-charcoal">
                    <Thermometer size={14} className="text-sage" /> BBT (°C)
                  </div>
                  <span className="text-[13px] font-semibold text-charcoal">{recentBBT}</span>
                </div>
                <div className="flex justify-between text-[11px] text-light">
                  <span>Baseline: {baseBBT}</span>
                  <span className={baseBBT - recentBBT > 0.2 ? 'text-sage font-medium' : ''}>
                    {baseBBT - recentBBT > 0 ? '↓' : '↑'} {Math.abs(Math.round((baseBBT - recentBBT) * 10) / 10)}
                  </span>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-1.5 text-[13px] font-medium text-charcoal">
                    <AlertTriangle size={14} className="text-sage" /> Braxton Hicks
                  </div>
                  <span className="text-[13px] font-semibold text-charcoal">{recentBH}/day</span>
                </div>
                <div className="flex justify-between text-[11px] text-light">
                  <span>Baseline: {baseBH || 0}/day</span>
                  <span className={recentBH > 2 ? 'text-sage font-medium' : ''}>
                    ↑ {recentBH}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
