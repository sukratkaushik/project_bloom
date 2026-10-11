import React, { useState, useEffect } from 'react';
import { usePlanner } from '../../store';
import { db } from '../../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Activity, HeartPulse, Thermometer, AlertTriangle, Info, Sparkles, Watch } from 'lucide-react';
import { calculateLaborReadiness, DailyBiometrics, ReadinessResult } from '../../utils/laborPrediction';
import { triggerHaptic } from '../../utils/nativeBridge';

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
    <div className="space-y-5 animate-in fade-in duration-200">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gold-pale text-gold-dark font-bold text-[11px] uppercase tracking-wider rounded-full mb-2 border border-gold/25">
          <Sparkles size={12} />
          <span>Biometric Intelligence</span>
        </div>
        <h2 className="font-serif text-[22px] sm:text-[26px] font-bold text-charcoal leading-tight">
          Labor Readiness Score
        </h2>
        <p className="text-[12.5px] text-medium mt-0.5">
          Analyzes physiological baseline shifts that naturally occur before labor onset
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-cream/70 border border-border/80 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
        <Info className="text-sage-dark shrink-0 mt-0.5" size={18} />
        <div>
          <h4 className="font-bold text-[13px] text-charcoal mb-0.5">Clinical Note</h4>
          <p className="text-[11.5px] text-medium leading-relaxed">
            This tool visualizes physiological trends (HRV, resting heart rate, basal temperature). Consumer wearables cannot definitively diagnose labor onset — always consult your obstetrician for clinical assessments.
          </p>
        </div>
      </div>

      {hasSyncedData ? (
        <div className="bg-sage-pale border border-sage/30 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
          <Watch className="text-sage-dark shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="font-bold text-[13px] text-sage-dark">Live Wearable Data Synced</h4>
            <p className="text-[11.5px] text-medium mt-0.5">
              Score is computed from your personal physiological baseline and recent metrics.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gold-pale/50 border border-gold/30 rounded-2xl p-4 flex items-start justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <Watch className="text-gold-dark shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="font-bold text-[13px] text-charcoal">Calibrated Baseline Active</h4>
              <p className="text-[11.5px] text-medium mt-0.5">
                Displaying standardized late-third-trimester biometric baselines. Connect Apple Health or wearable logs for personalized tracking.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-gold-dark bg-gold/10 border border-gold/20 px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap shrink-0 self-center">
            Standard Model
          </span>
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 sm:gap-5">
          <div className="space-y-4">
            {/* Score Card */}
            <div className="bg-white border border-border/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#F0ECE1" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none" stroke="#8ab6a3" strokeWidth="8"
                    strokeDasharray={`${(result.score / 100) * 264} 264`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[34px] font-serif font-bold text-charcoal leading-none">{result.score}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-light mt-1">Score</span>
                </div>
              </div>

              <div className="text-center sm:text-left flex-1">
                <h3 className="text-[19px] font-serif font-bold text-charcoal mb-1.5">
                  {result.score >= 80 ? 'High Readiness' : result.score >= 50 ? 'Elevated Readiness' : 'Baseline State'}
                </h3>
                <p className="text-[13px] text-medium leading-relaxed mb-3">
                  {result.advisory}
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cream rounded-full text-[11.5px] font-bold text-charcoal border border-border/60">
                  <span className={`w-2 h-2 rounded-full ${result.confidence >= 80 ? 'bg-sage' : 'bg-gold'}`} />
                  <span>{result.confidence}% Data Confidence</span>
                </div>
              </div>
            </div>

            {/* Reasoning */}
            {result.reasoning.length > 0 && (
              <div className="bg-white border border-border/80 rounded-3xl p-5 shadow-xs">
                <h4 className="text-[11px] font-bold tracking-wider uppercase text-medium mb-3">
                  Clinical Biometric Factors
                </h4>
                <ul className="space-y-2.5">
                  {result.reasoning.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-[13px] text-charcoal leading-relaxed">
                      <span className="text-sage font-bold mt-0.5">✦</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Biometric Trends */}
          <div className="bg-white border border-border/80 rounded-3xl p-5 shadow-xs h-fit">
            <h4 className="text-[11px] font-bold tracking-wider uppercase text-medium mb-4">
              7-Day Shift vs Baseline
            </h4>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5 text-[13px] font-bold text-charcoal">
                    <HeartPulse size={14} className="text-sage" />
                    <span>HRV (ms)</span>
                  </div>
                  <span className="text-[13px] font-bold text-charcoal">{recentHRV}</span>
                </div>
                <div className="flex justify-between text-[11px] text-light">
                  <span>Baseline: {baseHRV}</span>
                  <span className={baseHRV - recentHRV > 5 ? 'text-sage-dark font-bold' : ''}>
                    {baseHRV - recentHRV > 0 ? '↓' : '↑'} {Math.abs(baseHRV - recentHRV)}
                  </span>
                </div>
              </div>

              <div className="h-px bg-border/60" />

              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5 text-[13px] font-bold text-charcoal">
                    <Activity size={14} className="text-sage" />
                    <span>RHR (bpm)</span>
                  </div>
                  <span className="text-[13px] font-bold text-charcoal">{recentRHR}</span>
                </div>
                <div className="flex justify-between text-[11px] text-light">
                  <span>Baseline: {baseRHR}</span>
                  <span className={recentRHR - baseRHR > 2 ? 'text-sage-dark font-bold' : ''}>
                    {recentRHR - baseRHR > 0 ? '↑' : '↓'} {Math.abs(recentRHR - baseRHR)}
                  </span>
                </div>
              </div>

              <div className="h-px bg-border/60" />

              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5 text-[13px] font-bold text-charcoal">
                    <Thermometer size={14} className="text-sage" />
                    <span>BBT (°C)</span>
                  </div>
                  <span className="text-[13px] font-bold text-charcoal">{recentBBT}</span>
                </div>
                <div className="flex justify-between text-[11px] text-light">
                  <span>Baseline: {baseBBT}</span>
                  <span className={baseBBT - recentBBT > 0.2 ? 'text-sage-dark font-bold' : ''}>
                    {baseBBT - recentBBT > 0 ? '↓' : '↑'} {Math.abs(Math.round((baseBBT - recentBBT) * 10) / 10)}
                  </span>
                </div>
              </div>

              <div className="h-px bg-border/60" />

              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5 text-[13px] font-bold text-charcoal">
                    <AlertTriangle size={14} className="text-sage" />
                    <span>Braxton Hicks</span>
                  </div>
                  <span className="text-[13px] font-bold text-charcoal">{recentBH}/day</span>
                </div>
                <div className="flex justify-between text-[11px] text-light">
                  <span>Baseline: {baseBH || 0}/day</span>
                  <span className={recentBH > 2 ? 'text-sage-dark font-bold' : ''}>
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
