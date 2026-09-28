import React, { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db';
import { usePlanner } from '../../../store';
import { WEEKLY_DATA } from '../../../weeklyData';
import { v4 as uuidv4 } from 'uuid';
import {
  Footprints,
  Droplets,
  Activity,
  Sparkles,
  ChevronRight,
  Plus,
  Calendar,
  ShieldCheck,
  Wind,
  Clock,
  Check,
  Stethoscope,
  Phone,
  Heart,
  Pill,
  CheckCircle2,
  RotateCcw,
  Star,
} from 'lucide-react';
import { triggerHaptic } from '../../../utils/nativeBridge';
import { ALL_PREGNANCY_TOOLS, getToolById, ToolDefinition } from '../toolsData';

interface TodayTabProps {
  onOpenTool: (toolId: string) => void;
  onOpenAddRituals: () => void;
  onOpenSchedule?: () => void;
  onSelectTab?: (tab: string) => void;
  onShowToast?: (message: string) => void;
  pinnedIds?: string[];
  onTogglePin?: (toolId: string) => void;
}

export const TodayTab: React.FC<TodayTabProps> = ({
  onOpenTool,
  onOpenAddRituals,
  onOpenSchedule,
  onSelectTab,
  onShowToast,
  pinnedIds = ['hydration', 'nutrition', 'askourpregnancy'],
  onTogglePin,
}) => {
  const { state } = usePlanner();

  // Gestational calculations
  const due = state.dueDate ? new Date(state.dueDate) : new Date(Date.now() + 112 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffDays = Math.max(0, Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const completedDays = Math.max(1, 280 - diffDays);
  const currentWeek = Math.min(40, Math.max(1, Math.floor(completedDays / 7) + 1));
  const progressPercent = Math.min(100, Math.max(1, Math.round((completedDays / 280) * 100)));

  // Interactive selected week for timeline preview
  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeek);

  // Sync selected week when currentWeek changes
  useEffect(() => {
    setSelectedWeek(currentWeek);
  }, [currentWeek]);

  // Scroller ref for week timeline
  const weekTimelineRef = useRef<HTMLDivElement>(null);
  const currentWeekPillRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll timeline to current week on mount
  useEffect(() => {
    if (currentWeekPillRef.current && weekTimelineRef.current) {
      currentWeekPillRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [currentWeek]);

  // Selected week developmental data from weeklyData.ts
  const weekInfo = WEEKLY_DATA[selectedWeek - 1] || WEEKLY_DATA[0];

  // Trimester calculation based on selected week
  let trimesterName = 'Trimester 1 • Early Formation';
  if (selectedWeek > 27) {
    trimesterName = 'Trimester 3 • The Final Stretch';
  } else if (selectedWeek > 13) {
    trimesterName = 'Trimester 2 • Golden Period';
  }

  // Clinical milestone guidance derived from gestational week
  const getClinicalCheckup = (week: number) => {
    if (week <= 13) {
      return {
        title: 'NT Scan & Dual Marker Blood Screen',
        desc: 'Nuchal translucency ultrasound & genetic risk assessment.',
        badge: 'Recommended Week 11-13',
        daysAway: 'In 4 Days',
      };
    } else if (week <= 22) {
      return {
        title: 'Level II TIFFA Anomaly Ultrasound',
        desc: 'Detailed anatomical scan assessing fetal organs & spine.',
        badge: 'Recommended Week 18-20',
        daysAway: 'In 5 Days',
      };
    } else if (week <= 28) {
      return {
        title: 'OGTT Glucose Screen & Growth Check',
        desc: 'Gestational diabetes evaluation & maternal hemoglobin test.',
        badge: 'Recommended Week 24-28',
        daysAway: 'In 6 Days',
      };
    } else if (week <= 34) {
      return {
        title: 'Growth Scan & Placental Doppler',
        desc: 'Amniotic fluid index (AFI) check & fetal presentation check.',
        badge: 'Recommended Week 32-34',
        daysAway: 'In 3 Days',
      };
    } else {
      return {
        title: 'Non-Stress Test (NST) & Group B Strep',
        desc: 'Bi-weekly cardiotocography check & labor readiness review.',
        badge: 'Recommended Week 36-40',
        daysAway: 'In 2 Days',
      };
    }
  };

  const checkup = getClinicalCheckup(currentWeek);

  // Dexie live queries for today's logs
  const todayStr = new Date().toISOString().split('T')[0];
  const activeJourneyId = state.activeJourneyId || 'default-journey';

  const todayWaterLogs = useLiveQuery(
    () => db.hydrationLogs.where({ journeyId: activeJourneyId, date: todayStr }).toArray(),
    [activeJourneyId, todayStr]
  );
  const totalWaterMl = (todayWaterLogs || []).reduce((acc, log) => acc + log.amountMl, 0);
  const waterGoalMl = 2500;
  const waterPercent = Math.min(100, Math.round((totalWaterMl / waterGoalMl) * 100));

  const todayKickSessions = useLiveQuery(
    () => db.kickSessions.where('journeyId').equals(activeJourneyId).reverse().limit(1).toArray(),
    [activeJourneyId]
  );
  const latestKicks = todayKickSessions?.[0]?.kickCount || 0;

  const todayVitals = useLiveQuery(
    () => db.vitalsLogs.where('journeyId').equals(activeJourneyId).reverse().limit(1).toArray(),
    [activeJourneyId]
  );
  const latestBp = todayVitals?.[0]
    ? `${todayVitals[0].systolic}/${todayVitals[0].diastolic}`
    : '118/76';
  const latestPulse = todayVitals?.[0]?.pulse || 74;

  const todaySupplements = useLiveQuery(
    () => db.supplementLogs.where('[journeyId+date]').equals([activeJourneyId, todayStr]).toArray(),
    [activeJourneyId, todayStr]
  );
  const todaySuppLog = todaySupplements?.[0];
  const takenSupps = todaySuppLog?.supplementsTaken || [];
  const essentialSupps = ['folic', 'iron', 'calcium'];
  const allSuppsTaken = essentialSupps.every((s) => takenSupps.includes(s));

  // 1-Tap Quick Actions
  const handleQuickWater = async (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('medium');
    await db.hydrationLogs.put({
      id: uuidv4(),
      journeyId: activeJourneyId,
      date: todayStr,
      timestamp: Date.now(),
      amountMl: 250,
    });
    if (onShowToast) {
      onShowToast('💧 Added 250ml water (1 glass)');
    }
  };

  const handleQuickKick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('medium');
    const existing = todayKickSessions?.[0];
    const nowTs = Date.now();

    if (existing && !existing.completed && (nowTs - existing.updatedAt < 3600000)) {
      const updatedCount = (existing.kickCount || 0) + 1;
      await db.kickSessions.update(existing.id, {
        kickCount: updatedCount,
        completed: updatedCount >= 10,
        endTime: nowTs,
        updatedAt: nowTs,
      });
      if (onShowToast) {
        onShowToast(`👣 Kick recorded! (${updatedCount}/10)`);
      }
    } else {
      const newCount = (existing?.kickCount && existing.kickCount < 10) ? existing.kickCount + 1 : 1;
      await db.kickSessions.put({
        id: uuidv4(),
        journeyId: activeJourneyId,
        startTime: nowTs,
        endTime: nowTs,
        kickCount: newCount,
        completed: newCount >= 10,
        createdAt: nowTs,
        updatedAt: nowTs,
      });
      if (onShowToast) {
        onShowToast(`👣 Kick recorded! (${newCount}/10)`);
      }
    }
  };

  const handleQuickSupplements = async (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('medium');
    const newSupps = allSuppsTaken
      ? takenSupps.filter((s) => !essentialSupps.includes(s))
      : Array.from(new Set([...takenSupps, ...essentialSupps]));

    if (todaySuppLog) {
      await db.supplementLogs.update(todaySuppLog.id, { supplementsTaken: newSupps });
    } else {
      await db.supplementLogs.put({
        id: uuidv4(),
        journeyId: activeJourneyId,
        date: todayStr,
        supplementsTaken: newSupps,
      });
    }
    if (onShowToast) {
      onShowToast(allSuppsTaken ? '💊 Daily vitamins unmarked' : '💊 Daily prenatal vitamins logged!');
    }
  };

  // Pinned rituals resolved from toolsData
  const defaultPinned = ['hydration', 'nutrition', 'askourpregnancy'];
  const activePinnedIds = pinnedIds && pinnedIds.length > 0 ? pinnedIds : defaultPinned;
  const pinnedTools = activePinnedIds
    .map((id) => getToolById(id))
    .filter((t): t is ToolDefinition => !!t);

  const renderRitualCard = (tool: ToolDefinition) => {
    const IconComp = tool.icon;
    const isInteractiveWater = tool.id === 'hydration';
    const isInteractiveSupps = tool.id === 'nutrition';
    const isInteractiveKicks = tool.id === 'kickcounter';
    const isInteractiveVitals = tool.id === 'vitals';

    return (
      <div
        key={tool.id}
        onClick={() => {
          triggerHaptic('light');
          onOpenTool(tool.id);
        }}
        className="bg-white border border-border/80 rounded-2xl p-3 xs:p-3.5 shadow-2xs hover:border-sage transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between min-h-[156px] h-full"
      >
        <div>
          {/* Card Top: Icon + Badge + Unpin Star */}
          <div className="flex items-center justify-between mb-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${tool.color}`}>
              <IconComp size={17} />
            </div>

            <div className="flex items-center gap-1">
              {isInteractiveWater ? (
                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-200/60 px-1.5 py-0.2 rounded-full whitespace-nowrap">
                  {totalWaterMl >= waterGoalMl ? 'GOAL MET' : `${waterPercent}%`}
                </span>
              ) : isInteractiveSupps ? (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border whitespace-nowrap ${
                    allSuppsTaken
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-amber-700 bg-amber-50 border-amber-200'
                  }`}
                >
                  {allSuppsTaken ? 'TAKEN ✓' : `${takenSupps.length}/3`}
                </span>
              ) : isInteractiveKicks ? (
                <span className="text-[9px] font-bold text-sage-dark bg-sage-pale border border-sage/20 px-1.5 py-0.2 rounded-full whitespace-nowrap">
                  {latestKicks >= 10 ? 'GOAL MET' : 'ACTIVE'}
                </span>
              ) : isInteractiveVitals ? (
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded-full whitespace-nowrap">
                  NORMAL
                </span>
              ) : tool.badge ? (
                <span className="text-[9px] font-bold text-sage-dark bg-sage-pale border border-sage/20 px-1.5 py-0.2 rounded-full whitespace-nowrap">
                  {tool.badge}
                </span>
              ) : null}

              {onTogglePin && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('light');
                    onTogglePin(tool.id);
                  }}
                  className="p-1 text-amber-500 hover:text-amber-600 rounded-full hover:bg-amber-50/80 transition-colors cursor-pointer"
                  title="Unpin from Daily Rituals"
                  aria-label={`Unpin ${tool.title}`}
                >
                  <Star size={13} className="fill-amber-400 text-amber-500" />
                </button>
              )}
            </div>
          </div>

          {/* Card Middle: Title & Metrics / Subtitle */}
          <div className="my-auto py-0.5">
            <p className="text-[11.5px] font-semibold text-medium truncate">{tool.title}</p>

            {isInteractiveWater ? (
              <>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-serif font-bold text-charcoal text-[18px] leading-tight">
                    {(totalWaterMl / 1000).toFixed(2)}L
                  </span>
                  <span className="text-[10px] text-light font-medium">/ 2.5L</span>
                </div>
                <div className="w-full bg-border/60 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${waterPercent}%` }}
                  />
                </div>
              </>
            ) : isInteractiveSupps ? (
              <>
                <p className="text-[11.5px] text-charcoal font-bold mt-0.5 truncate">
                  Folic, Iron, Calcium
                </p>
                <p className="text-[10px] text-light mt-0.5 truncate">
                  {allSuppsTaken ? 'All daily essentials logged' : 'Tap to mark as taken'}
                </p>
              </>
            ) : isInteractiveKicks ? (
              <>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-serif font-bold text-charcoal text-[18px] leading-tight">
                    {latestKicks}
                  </span>
                  <span className="text-[10.5px] text-medium font-medium">/ 10 kicks</span>
                </div>
                <p className="text-[10px] text-light mt-0.5 truncate">
                  {latestKicks >= 10 ? 'Goal met today! ✨' : 'Target: 10 kicks'}
                </p>
              </>
            ) : isInteractiveVitals ? (
              <>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-serif font-bold text-charcoal text-[18px] leading-tight">
                    {latestBp}
                  </span>
                  <span className="text-[9.5px] text-light font-bold">mmHg</span>
                </div>
                <p className="text-[10px] text-light mt-0.5 truncate">
                  Pulse: {latestPulse} bpm
                </p>
              </>
            ) : (
              <>
                <p className="text-[12px] font-bold text-charcoal mt-0.5 truncate">
                  {tool.ritualSubtitle || tool.title}
                </p>
                <p className="text-[10.5px] text-medium mt-0.5 truncate">
                  {tool.desc}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Card Bottom: Standardized 1-Tap Action Button */}
        {isInteractiveWater ? (
          <button
            type="button"
            onClick={handleQuickWater}
            className="mt-2 w-full h-8 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 text-[11px] font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Plus size={12} strokeWidth={2.5} />
            <span>+250ml Glass</span>
          </button>
        ) : isInteractiveSupps ? (
          <button
            type="button"
            onClick={handleQuickSupplements}
            className={`mt-2 w-full h-8 py-1 text-[11px] font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 whitespace-nowrap ${
              allSuppsTaken
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-sage text-white hover:bg-sage-dark shadow-2xs'
            }`}
          >
            {allSuppsTaken ? (
              <>
                <CheckCircle2 size={12} className="text-emerald-600" />
                <span>Taken Today ✓</span>
              </>
            ) : (
              <>
                <Plus size={12} strokeWidth={2.5} />
                <span>Mark Taken</span>
              </>
            )}
          </button>
        ) : isInteractiveKicks ? (
          <button
            type="button"
            onClick={handleQuickKick}
            className="mt-2 w-full h-8 py-1 bg-sage text-white text-[11px] font-bold rounded-xl shadow-2xs hover:bg-sage-dark active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Plus size={12} strokeWidth={2.5} />
            <span>+1 Kick</span>
          </button>
        ) : isInteractiveVitals ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('light');
              onOpenTool('vitals');
            }}
            className="mt-2 w-full h-8 py-1 bg-rose-50 text-rose-700 border border-rose-200/80 text-[11px] font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Activity size={12} />
            <span>+ Log Vitals</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('light');
              onOpenTool(tool.id);
            }}
            className="mt-2 w-full h-8 py-1 bg-cream hover:bg-sage-pale/60 text-charcoal border border-border/80 text-[11px] font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <span>{tool.actionLabel || 'Open Tool →'}</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-32 animate-in fade-in duration-200">
      {/* 1. Interactive Horizontal Week Timeline Scroller (Week 1–40) */}
      <div className="bg-white/90 backdrop-blur-xs border border-border/80 rounded-2xl p-2.5 shadow-2xs">
        <div className="flex items-center justify-between px-1.5 mb-1.5 text-[11px] font-semibold text-medium">
          <span className="uppercase tracking-wider">Gestational Timeline</span>
          {selectedWeek !== currentWeek ? (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setSelectedWeek(currentWeek);
                if (currentWeekPillRef.current) {
                  currentWeekPillRef.current.scrollIntoView({
                    behavior: 'smooth',
                    inline: 'center',
                    block: 'nearest',
                  });
                }
              }}
              className="text-sage-dark hover:underline flex items-center gap-1 font-bold cursor-pointer"
            >
              <RotateCcw size={11} />
              <span>Back to Week {currentWeek}</span>
            </button>
          ) : (
            <span className="text-sage-dark font-bold">Week {currentWeek} (Today)</span>
          )}
        </div>

        <div
          ref={weekTimelineRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {Array.from({ length: 40 }, (_, i) => i + 1).map((w) => {
            const isCurrent = w === currentWeek;
            const isSelected = w === selectedWeek;
            const wEmoji = WEEKLY_DATA[w - 1]?.babyEmoji || '🌱';

            return (
              <button
                key={w}
                ref={isCurrent ? currentWeekPillRef : null}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedWeek(w);
                }}
                className={`flex flex-col items-center justify-center min-w-[54px] py-1.5 px-1 rounded-xl transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-sage-dark text-white font-bold shadow-xs scale-102'
                    : isCurrent
                    ? 'bg-sage-pale text-sage-dark font-bold border border-sage/40'
                    : 'bg-cream/70 hover:bg-cream text-charcoal/80 border border-border/70'
                }`}
              >
                <span className="text-[10.5px] tracking-tight">Wk {w}</span>
                <span className="text-[16px] my-0.5 leading-none">{wEmoji}</span>
                {isCurrent ? (
                  <span
                    className={`text-[8.5px] uppercase font-bold tracking-tight px-1 rounded-full ${
                      isSelected ? 'bg-white text-sage-dark' : 'bg-sage-dark text-white'
                    }`}
                  >
                    Now
                  </span>
                ) : (
                  <span className="text-[8.5px] text-light">
                    {w <= 13 ? 'T1' : w <= 27 ? 'T2' : 'T3'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Gestational Hero Card (Live or Preview) */}
      <div className="bg-gradient-to-br from-white via-cream to-sage-pale/40 border border-border/80 rounded-3xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              <span className="inline-block bg-sage/15 text-sage-dark text-[10px] xs:text-[11px] font-bold px-2 xs:px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-sage/20 whitespace-nowrap">
                {trimesterName}
              </span>
              {selectedWeek !== currentWeek && (
                <span className="inline-block bg-amber-100 text-amber-800 text-[9.5px] xs:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-200 whitespace-nowrap">
                  Preview
                </span>
              )}
            </div>
            <h1 className="font-serif text-[26px] xs:text-[28px] font-bold text-charcoal tracking-tight leading-tight">
              Week {selectedWeek}
            </h1>
            <p className="text-[12px] xs:text-[13px] text-medium font-medium mt-0.5">
              {selectedWeek === currentWeek
                ? `${diffDays} Days Remaining until Due Date`
                : `Developmental preview for gestational week ${selectedWeek}`}
            </p>
          </div>

          <div className="w-16 h-16 xs:w-18 xs:h-18 rounded-2xl bg-white/95 border border-border/80 shadow-xs flex flex-col items-center justify-center shrink-0 p-1">
            <span className="text-2xl xs:text-3xl leading-none">{weekInfo.babyEmoji}</span>
            <span className="text-[9.5px] xs:text-[10px] font-bold text-charcoal mt-1 text-center truncate max-w-[62px]">
              {weekInfo.babySizeAnalogy.split(' ')[0]}
            </span>
          </div>
        </div>

        {/* Baby Metrology Row */}
        <div className="mt-3.5 pt-3 border-t border-border/60 grid grid-cols-3 gap-1.5 xs:gap-2 text-center">
          <div className="bg-white/80 rounded-xl py-2 px-1 xs:px-1.5 border border-border/50 flex flex-col justify-center">
            <span className="text-medium text-[9px] xs:text-[9.5px] sm:text-[10px] uppercase font-bold tracking-wider block">Size</span>
            <p className="font-bold text-charcoal text-[11px] xs:text-[12px] sm:text-[13px] truncate mt-0.5" title={weekInfo.babySizeAnalogy}>
              {weekInfo.babySizeAnalogy}
            </p>
          </div>
          <div className="bg-white/80 rounded-xl py-2 px-1 xs:px-1.5 border border-border/50 flex flex-col justify-center">
            <span className="text-medium text-[9px] xs:text-[9.5px] sm:text-[10px] uppercase font-bold tracking-wider block">Length</span>
            <p className="font-bold text-charcoal text-[11px] xs:text-[12px] sm:text-[13px] mt-0.5 truncate">{weekInfo.length}</p>
          </div>
          <div className="bg-white/80 rounded-xl py-2 px-1 xs:px-1.5 border border-border/50 flex flex-col justify-center">
            <span className="text-medium text-[9px] xs:text-[9.5px] sm:text-[10px] uppercase font-bold tracking-wider block">Weight</span>
            <p className="font-bold text-charcoal text-[11px] xs:text-[12px] sm:text-[13px] mt-0.5 truncate">{weekInfo.weight}</p>
          </div>
        </div>

        {/* Weekly Fetal Highlight Snippet */}
        <div className="mt-3 p-3 bg-white/75 rounded-2xl border border-sage/20 text-[12.5px] leading-relaxed text-charcoal/90">
          <p className="line-clamp-2">
            <span className="font-bold text-sage-dark">Baby's Growth: </span>
            {weekInfo.babyDev}
          </p>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenTool('dev');
            }}
            className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] font-bold text-sage-dark hover:underline cursor-pointer"
          >
            <span>Full 40-week organogenesis timeline</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Gestational Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center text-[11px] font-semibold mb-1">
            <span className="text-medium">Journey Progress</span>
            <span className="text-sage-dark">{progressPercent}% Complete</span>
          </div>
          <div className="w-full bg-border/60 rounded-full h-2 overflow-hidden">
            <div
              className="bg-sage-dark h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Hero Upcoming Checkup Card */}
      <div className="bg-gradient-to-br from-sage-pale/60 via-white to-cream border border-sage/35 rounded-3xl p-4.5 shadow-xs">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sage-dark text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Stethoscope size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-sage-dark uppercase tracking-wider">
                  Upcoming Checkup
                </span>
                <span className="text-[9.5px] font-bold bg-sage/15 text-sage-dark px-2 py-0.2 rounded-full">
                  {checkup.daysAway}
                </span>
              </div>
              <h3 className="font-serif font-bold text-charcoal text-[16px] leading-tight mt-0.5">
                {checkup.title}
              </h3>
            </div>
          </div>

          <a
            href="tel:+919876543210"
            onClick={() => triggerHaptic('light')}
            className="w-8 h-8 rounded-full bg-sage-pale text-sage-dark hover:bg-sage hover:text-white flex items-center justify-center border border-sage/30 transition-colors shrink-0"
            title="Call Clinic"
            aria-label="Call Clinic"
          >
            <Phone size={15} />
          </a>
        </div>

        <p className="text-[12px] text-medium mt-2 leading-relaxed">
          {checkup.desc}
        </p>

        <div className="mt-3 pt-2.5 border-t border-border/70 flex flex-col xs:flex-row xs:items-center justify-between gap-2 text-[11.5px]">
          <div className="flex items-center gap-1.5 text-medium min-w-0">
            <Clock size={13} className="text-sage-dark shrink-0" />
            <span className="font-medium truncate">Dr. Priya Sharma • Cloudnine</span>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end xs:self-auto">
            {onOpenSchedule && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onOpenSchedule();
                }}
                className="text-[11px] font-bold text-medium hover:text-charcoal px-2 py-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer whitespace-nowrap"
              >
                Reschedule
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                if (onSelectTab) {
                  onSelectTab('care');
                } else {
                  onOpenTool('medical');
                }
              }}
              className="h-8 px-3 bg-sage-dark text-white text-[11px] font-bold rounded-xl shadow-2xs hover:bg-sage transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Scan Checklist</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Side-by-Side Bento Vitals Grid (Blood Pressure & Kicks) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left Bento: Blood Pressure & Heart Rate */}
        <div
          onClick={() => {
            triggerHaptic('light');
            onOpenTool('vitals');
          }}
          className="bg-white border border-border/80 rounded-2xl p-3 xs:p-3.5 shadow-2xs hover:border-sage transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between min-h-[148px]"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Heart size={17} />
              </div>
              <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                NORMAL
              </span>
            </div>
            <p className="text-[11.5px] font-semibold text-medium">Blood Pressure</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-serif font-bold text-charcoal text-[20px] leading-tight">
                {latestBp}
              </span>
              <span className="text-[10px] text-light font-bold">mmHg</span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-medium h-8">
            <span>Pulse</span>
            <span className="font-bold text-charcoal">{latestPulse} bpm</span>
          </div>
        </div>

        {/* Right Bento: Fetal Kick Counter with 1-Tap Micro Action */}
        <div
          onClick={() => {
            triggerHaptic('light');
            onOpenTool('kickcounter');
          }}
          className="bg-white border border-border/80 rounded-2xl p-3 xs:p-3.5 shadow-2xs hover:border-sage transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between min-h-[148px]"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-sage-pale text-sage-dark flex items-center justify-center">
                <Footprints size={17} />
              </div>
              <span className="text-[9.5px] font-bold text-sage-dark bg-sage-pale border border-sage/20 px-2 py-0.5 rounded-full">
                {latestKicks >= 10 ? 'GOAL MET' : 'ACTIVE'}
              </span>
            </div>
            <p className="text-[11.5px] font-semibold text-medium">Fetal Kicks</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-serif font-bold text-charcoal text-[20px] leading-tight">
                {latestKicks}
              </span>
              <span className="text-[11px] text-medium font-medium">/ 10 today</span>
            </div>
          </div>

          {/* Micro 1-Tap Quick Log Button */}
          <button
            type="button"
            onClick={handleQuickKick}
            className="mt-2.5 w-full h-8 bg-sage text-white text-[11px] font-bold rounded-xl shadow-2xs hover:bg-sage-dark active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>+1 Kick</span>
          </button>
        </div>
      </div>

      {/* 5. Dynamic Daily Health Rituals from Explore & Customization */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-1.5">
            <Calendar size={15} className="text-sage-dark" />
            <h2 className="font-serif text-[16px] font-bold text-charcoal">
              Daily Health Rituals
            </h2>
            <span className="text-[10px] font-sans font-bold text-sage-dark bg-sage-pale px-2 py-0.2 rounded-full">
              {pinnedTools.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenAddRituals();
            }}
            className="text-[11.5px] text-sage-dark font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>Customize</span>
          </button>
        </div>

        {pinnedTools.length === 0 ? (
          <div className="bg-white border border-dashed border-border/80 rounded-2xl p-6 text-center shadow-2xs">
            <Calendar size={28} className="mx-auto text-light mb-1.5" />
            <p className="text-[13px] font-bold text-charcoal">No daily rituals pinned yet</p>
            <p className="text-[11.5px] text-medium mt-0.5 max-w-xs mx-auto">
              Star (⭐) any feature from the Explore tab to quickly log and access it here.
            </p>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                if (onSelectTab) onSelectTab('explore');
              }}
              className="mt-3 px-4 py-1.5 bg-sage text-white text-[12px] font-bold rounded-xl shadow-2xs hover:bg-sage-dark transition-colors cursor-pointer"
            >
              Explore Features
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {pinnedTools.map((tool) => renderRitualCard(tool))}

            {/* If odd count of items, render a subtle dashed "+ Add Ritual" slot so the 2-column grid is always balanced */}
            {pinnedTools.length % 2 === 1 && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onOpenAddRituals();
                }}
                className="border-2 border-dashed border-border/80 hover:border-sage/60 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center transition-all cursor-pointer group min-h-[148px]"
              >
                <div className="w-8 h-8 rounded-full bg-cream group-hover:bg-sage-pale text-medium group-hover:text-sage-dark flex items-center justify-center mb-1.5 transition-colors">
                  <Plus size={16} />
                </div>
                <span className="text-[12px] font-bold text-charcoal group-hover:text-sage-dark">Add Ritual</span>
                <span className="text-[10px] text-light mt-0.5">Explore 26 tools</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 6. Mindful Breathing & Garbh Sanskar Card */}
      <div
        onClick={() => {
          triggerHaptic('light');
          onOpenTool('breathing');
        }}
        className="bg-gradient-to-r from-sage-pale/60 via-cream to-rose-50/50 border border-sage-soft/40 rounded-2xl p-4 shadow-2xs hover:border-sage transition-all active:scale-[0.99] cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sage-dark text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Wind size={19} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10.5px] font-bold text-sage-dark uppercase tracking-wider">
                  Maternal Peace & Bonding
                </span>
                <span className="text-[9px] font-medium bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full whitespace-nowrap">
                  100% Offline
                </span>
              </div>
              <h3 className="font-serif font-bold text-charcoal text-[14px] mt-0.5">
                Pranayama & Garbh Sanskar Audio
              </h3>
              <p className="text-[12px] text-medium mt-0.5">
                4-7-8 relaxing breath, Anulom Vilom, and calming Vedic soundscapes
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-sage-dark shrink-0 ml-2" />
        </div>
      </div>

      {/* 7. Government Maternity Aid Milestone Card */}
      <div className="bg-gradient-to-r from-soft-saffron/10 via-white to-gold/10 border border-soft-saffron/30 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-soft-saffron/20 text-soft-saffron-dark flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold text-soft-saffron-dark uppercase tracking-wider">
                Government Maternity Aid • MoHFW
              </span>
              <span className="text-[10px] font-bold text-charcoal bg-white/80 px-2 py-0.5 rounded-md border border-soft-saffron/20 shrink-0 whitespace-nowrap">
                ₹5,000 Direct Benefit
              </span>
            </div>
            <h3 className="font-serif font-bold text-charcoal text-[14px] mt-0.5">
              PMMVY Form 1A Registration
            </h3>
            <p className="text-[12px] text-medium mt-1 leading-relaxed">
              Submit your MCP card copy to your nearest Anganwadi / ASHA worker to claim your 1st pregnancy installment.
            </p>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onOpenTool('schemes');
              }}
              className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-bold text-sage-dark hover:underline cursor-pointer"
            >
              <span>Check Eligibility & Download Form</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
