import React, { useState, useEffect } from 'react';
import { usePlanner } from '../../store';
import { Activity, HeartPulse, Thermometer, AlertTriangle, Sparkles } from 'lucide-react';
import { calculateLaborReadiness, DailyBiometrics, ReadinessResult } from '../../utils/laborPrediction';
import { ClinicalDisclaimer } from '../ClinicalDisclaimer';
import { ContextBanner } from '../ContextBanner';

export const LaborReadiness: React.FC = () => {
  const { state } = usePlanner();
  
  // Baseline data for physiological trend monitoring
  const [historicalBaseline] = useState<DailyBiometrics[]>([
    { date: '2026-02-20', restingHeartRate: 68, hrv: 55, basalBodyTemp: 36.8, braxtonHicksCount: 0 },
    { date: '2026-02-21', restingHeartRate: 67, hrv: 56, basalBodyTemp: 36.7, braxtonHicksCount: 1 },
    { date: '2026-02-22', restingHeartRate: 69, hrv: 54, basalBodyTemp: 36.8, braxtonHicksCount: 0 },
  ]);

  const [recentData] = useState<DailyBiometrics[]>([
    { date: '2026-03-18', restingHeartRate: 74, hrv: 42, basalBodyTemp: 36.4, braxtonHicksCount: 4 },
    { date: '2026-03-19', restingHeartRate: 75, hrv: 40, basalBodyTemp: 36.3, braxtonHicksCount: 6 },
    { date: '2026-03-20', restingHeartRate: 76, hrv: 38, basalBodyTemp: 36.3, braxtonHicksCount: 5 },
  ]);

  const [result, setResult] = useState<ReadinessResult | null>(null);

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
    <div className="space-y-4 animate-in fade-in duration-300 max-w-4xl mx-auto pb-10">
      {/* Context Banner */}
      <ContextBanner 
        description="Wearable biometric physiological heuristic trends monitoring maternal transition towards spontaneous labor." 
      />

      {/* Standardized Clinical Disclaimer Banner */}
      <ClinicalDisclaimer />

      <div className="bg-white border border-border/80 rounded-2xl shadow-xs p-6 sm:p-7 relative overflow-hidden">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gold-pale text-gold-dark font-semibold text-[11px] uppercase tracking-[1px] rounded-full mb-3">
            <Sparkles size={12} /> Pro Feature
          </div>
          <h2 className="font-serif text-[clamp(24px,3.5vw,34px)] font-bold text-charcoal mb-1.5 flex items-center gap-3">
            <Activity className="text-sage" size={28} /> Labor Readiness Heuristic
          </h2>
          <p className="text-[13.5px] text-medium max-w-[620px] leading-relaxed">
            This advisory algorithm analyzes connected wearable biometric trends to observe autonomic shifts that commonly precede spontaneous labor onset.
          </p>
        </div>

        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            <div className="space-y-6">
              {/* Score Card */}
              <div className="bg-cream/40 border border-border/80 rounded-2xl p-6 shadow-3xs flex flex-col sm:flex-row items-center gap-7">
                <div className="relative w-[130px] h-[130px] shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#E4E3E0" strokeWidth="8" />
                    <circle 
                      cx="50" cy="50" r="45" fill="none" stroke="#6B9278" strokeWidth="8" 
                      strokeDasharray={`${(result.score / 100) * 283} 283`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[34px] font-serif font-bold text-charcoal leading-none">{result.score}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[1px] text-medium mt-1">Score</span>
                  </div>
                </div>
                
                <div className="text-center sm:text-left">
                  <h3 className="text-[19px] font-serif font-bold text-charcoal mb-1.5">
                    {result.score >= 80 ? 'High Readiness' : result.score >= 50 ? 'Elevated Readiness' : 'Baseline Physiology'}
                  </h3>
                  <p className="text-[13.5px] text-medium leading-relaxed mb-3.5">
                    {result.advisory}
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-border/80 rounded-full text-[12px] font-medium text-charcoal shadow-3xs">
                    <span className={`w-2 h-2 rounded-full ${result.confidence >= 80 ? 'bg-sage' : 'bg-gold'}`} />
                    {result.confidence}% Data Confidence
                  </div>
                </div>
              </div>

              {/* Reasoning */}
              {result.reasoning.length > 0 && (
                <div className="bg-white border border-border/80 rounded-2xl p-5 shadow-3xs">
                  <h4 className="text-[11px] font-bold tracking-[1.2px] uppercase text-medium mb-3">Physiological Observations</h4>
                  <ul className="space-y-2.5">
                    {result.reasoning.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-[13.5px] text-charcoal">
                        <span className="text-sage font-bold mt-0.5">✦</span>
                        <span className="leading-relaxed">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Biometric Trends */}
            <div className="bg-white border border-border/80 rounded-2xl p-5 shadow-3xs h-fit space-y-4">
              <h4 className="text-[11px] font-bold tracking-[1.2px] uppercase text-medium">7-Day Trends vs Baseline</h4>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-charcoal">
                      <HeartPulse size={14} className="text-sage" /> HRV (ms)
                    </div>
                    <span className="text-[13px] font-semibold text-charcoal">{recentHRV}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-medium">
                    <span>Baseline: {baseHRV}</span>
                    <span className={baseHRV - recentHRV > 5 ? 'text-sage font-semibold' : ''}>
                      {baseHRV - recentHRV > 0 ? '↓' : '↑'} {Math.abs(baseHRV - recentHRV)}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-border/60" />

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-charcoal">
                      <Activity size={14} className="text-sage" /> RHR (bpm)
                    </div>
                    <span className="text-[13px] font-semibold text-charcoal">{recentRHR}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-medium">
                    <span>Baseline: {baseRHR}</span>
                    <span className={recentRHR - baseRHR > 2 ? 'text-sage font-semibold' : ''}>
                      {recentRHR - baseRHR > 0 ? '↑' : '↓'} {Math.abs(recentRHR - baseRHR)}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-border/60" />

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-charcoal">
                      <Thermometer size={14} className="text-sage" /> BBT (°C)
                    </div>
                    <span className="text-[13px] font-semibold text-charcoal">{recentBBT}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-medium">
                    <span>Baseline: {baseBBT}</span>
                    <span className={baseBBT - recentBBT > 0.2 ? 'text-sage font-semibold' : ''}>
                      {baseBBT - recentBBT > 0 ? '↓' : '↑'} {Math.abs(Math.round((baseBBT - recentBBT) * 10) / 10)}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-border/60" />

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-charcoal">
                      <AlertTriangle size={14} className="text-sage" /> Braxton Hicks
                    </div>
                    <span className="text-[13px] font-semibold text-charcoal">{recentBH}/day</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-medium">
                    <span>Baseline: {baseBH || 0}/day</span>
                    <span className={recentBH > 2 ? 'text-sage font-semibold' : ''}>
                      ↑ {recentBH}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaborReadiness;
