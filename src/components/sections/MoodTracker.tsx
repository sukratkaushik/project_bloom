import React, { useState, useEffect, useMemo } from 'react';
import { usePlanner } from '../../store';
import { db } from '../../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { 
  Heart, 
  Sun, 
  Moon, 
  Cloud, 
  TrendingUp, 
  BookOpen, 
  Smile,
  AlertTriangle,
  Phone,
  Check,
  RefreshCw,
  Shield,
  Sparkles,
  ChevronRight,
  HeartHandshake,
  Calendar,
  Zap,
  BatteryCharging,
  Compass
} from 'lucide-react';
import { triggerHaptic } from '../../utils/nativeBridge';

const JOURNAL_PROMPTS = [
  "What would you tell your pre-pregnancy self?",
  "What are you most looking forward to this week?",
  "What feels heavy right now? It's okay to name it.",
  "What does your body need today?",
  "One thing you're deeply grateful for today?",
  "What would make today feel softer and easier?",
  "How are you really feeling about becoming a mother?",
  "What small moment brought you peace today?",
  "How is your baby communicating with you right now?",
  "A promise of kindness to yourself today."
];

const EPDS_QUESTIONS = [
  { q: "I have been able to laugh and see the funny side of things", opts: ["As much as I always could", "Not quite so much now", "Definitely not so much now", "Not at all"], scores: [0, 1, 2, 3] },
  { q: "I have looked forward with enjoyment to things", opts: ["As much as ever", "Rather less than I used to", "Definitely less than I used to", "Hardly at all"], scores: [0, 1, 2, 3] },
  { q: "I have blamed myself unnecessarily when things went wrong", opts: ["Yes most of the time", "Yes some of the time", "Not very often", "No never"], scores: [3, 2, 1, 0] },
  { q: "I have been anxious or worried for no good reason", opts: ["No not at all", "Hardly ever", "Yes sometimes", "Yes very often"], scores: [0, 1, 2, 3] },
  { q: "I have felt scared or panicky for no very good reason", opts: ["Yes quite a lot", "Yes sometimes", "No not much", "No not at all"], scores: [3, 2, 1, 0] },
  { q: "Things have been getting on top of me", opts: ["Yes most of the time", "Yes sometimes", "No mostly coping", "No coping as well as ever"], scores: [3, 2, 1, 0] },
  { q: "I have been so unhappy that I have had difficulty sleeping", opts: ["Yes most of the time", "Yes sometimes", "Not very often", "No not at all"], scores: [3, 2, 1, 0] },
  { q: "I have felt sad or miserable", opts: ["Yes most of the time", "Yes quite often", "Not very often", "No not at all"], scores: [3, 2, 1, 0] },
  { q: "I have been so unhappy that I have been crying", opts: ["Yes most of the time", "Yes quite often", "Only occasionally", "No never"], scores: [3, 2, 1, 0] },
  { q: "The thought of harming myself has occurred to me", opts: ["Yes quite often", "Sometimes", "Hardly ever", "Never"], scores: [3, 2, 1, 0] }
];

interface ScaleOption {
  score: number;
  emoji: string;
  label: string;
  detail: string;
}

const MOOD_OPTIONS: ScaleOption[] = [
  { score: 1, emoji: '😔', label: 'Tender', detail: 'Feeling low or heavy' },
  { score: 2, emoji: '😟', label: 'Uneasy', detail: 'A bit down today' },
  { score: 3, emoji: '😐', label: 'Steady', detail: 'Neutral & holding space' },
  { score: 4, emoji: '🙂', label: 'Content', detail: 'Good, calm & peaceful' },
  { score: 5, emoji: '😄', label: 'Joyful', detail: 'Radiant & bright' }
];

const ENERGY_OPTIONS: ScaleOption[] = [
  { score: 1, emoji: '🪫', label: 'Drained', detail: 'Need deep restorative rest' },
  { score: 2, emoji: '😴', label: 'Tired', detail: 'Low physical stamina' },
  { score: 3, emoji: '😐', label: 'Steady', detail: 'Normal daily pacing' },
  { score: 4, emoji: '⚡', label: 'Active', detail: 'Good vitality & focus' },
  { score: 5, emoji: '🌟', label: 'Vibrant', detail: 'Energized & refreshed' }
];

const CALM_OPTIONS: ScaleOption[] = [
  { score: 1, emoji: '😰', label: 'Anxious', detail: 'High stress or tension' },
  { score: 2, emoji: '😟', label: 'Worried', detail: 'Restless mind' },
  { score: 3, emoji: '😐', label: 'Moderate', detail: 'Manageable worries' },
  { score: 4, emoji: '😌', label: 'Calm', detail: 'Gentle & comfortable' },
  { score: 5, emoji: '🧘', label: 'At Peace', detail: 'Centered & grounded' }
];

const SUPPORT_RESOURCES = [
  {
    name: 'iCall Psychosocial Helpline',
    desc: 'TISS counselling • Mon–Sat, 8 AM–10 PM',
    phone: '9152987821',
    displayPhone: '9152-987-821'
  },
  {
    name: 'Vandrevala Foundation',
    desc: '24/7 Free mental health counselling',
    phone: '9999666555',
    displayPhone: '9999-666-555'
  },
  {
    name: 'NIMHANS Helpline',
    desc: 'National mental health institute • 24/7',
    phone: '08046110007',
    displayPhone: '080-46110007'
  },
  {
    name: 'Govt Emergency Ambulance',
    desc: 'Immediate medical assistance • 24/7',
    phone: '108',
    displayPhone: '108'
  }
];

export const MoodTracker: React.FC = () => {
  const { state } = usePlanner();
  const [greeting, setGreeting] = useState('');
  
  // Daily check-in
  const [moodScore, setMoodScore] = useState<number>(0);
  const [energyScore, setEnergyScore] = useState<number>(0);
  const [anxietyScore, setAnxietyScore] = useState<number>(0);
  const [journalResponse, setJournalResponse] = useState('');
  const [promptIndex, setPromptIndex] = useState(() => new Date().getDay());
  const [isEditing, setIsEditing] = useState(false);
  
  // EPDS
  const [epdsAnswers, setEpdsAnswers] = useState<Record<number, number>>({});
  const [showEpdsResult, setShowEpdsResult] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const journalPrompt = JOURNAL_PROMPTS[promptIndex % JOURNAL_PROMPTS.length];

  const logs = useLiveQuery(
    () => {
      if (!state.activeJourneyId) return [];
      return db.moodLogs
        .where('journeyId')
        .equals(state.activeJourneyId)
        .sortBy('date');
    },
    [state.activeJourneyId]
  ) || [];

  const todayLog = logs.find(l => l.date === today);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Good morning 🌅');
    else if (hour >= 12 && hour < 17) setGreeting('Good afternoon ☀️');
    else if (hour >= 17 && hour < 21) setGreeting('Good evening 🌙');
    else setGreeting("Rest well tonight 🌸");
  }, []);

  const handleShufflePrompt = () => {
    triggerHaptic('light');
    setPromptIndex(prev => (prev + 1) % JOURNAL_PROMPTS.length);
  };

  const handleSelectScore = (type: 'mood' | 'energy' | 'anxiety', val: number) => {
    triggerHaptic('light');
    if (type === 'mood') setMoodScore(val);
    else if (type === 'energy') setEnergyScore(val);
    else if (type === 'anxiety') setAnxietyScore(val);
  };

  const handleStartEdit = () => {
    if (todayLog) {
      setMoodScore(todayLog.moodScore);
      setEnergyScore(todayLog.energyScore);
      setAnxietyScore(todayLog.anxietyScore);
      setJournalResponse(todayLog.journalResponse || '');
      setIsEditing(true);
      triggerHaptic('light');
    }
  };

  const handleSaveCheckIn = async () => {
    if (!state.activeJourneyId || moodScore === 0 || energyScore === 0 || anxietyScore === 0) return;
    triggerHaptic('medium');

    const entryId = todayLog ? todayLog.id : uuidv4();

    await db.moodLogs.put({
      id: entryId,
      journeyId: state.activeJourneyId,
      date: today,
      timestamp: Date.now(),
      moodScore,
      energyScore,
      anxietyScore,
      journalPrompt,
      journalResponse: journalResponse.trim(),
      createdAt: todayLog ? todayLog.createdAt : Date.now()
    });

    setIsEditing(false);
  };

  const isPostpartum = state.dueDate && new Date(state.dueDate).getTime() < Date.now();

  const handleEpdsSubmit = () => {
    if (Object.keys(epdsAnswers).length === 10) {
      triggerHaptic('medium');
      setShowEpdsResult(true);
    }
  };

  const getEpdsScore = () => {
    let total = 0;
    Object.values(epdsAnswers).forEach(s => total += s);
    return total;
  };

  const epdsScore = getEpdsScore();
  const isQ10Flagged = (epdsAnswers[9] || 0) >= 1;

  // 14-Day Timeline calculation
  const last14Days = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d.toISOString().split('T')[0];
    });
  }, []);

  const chartData = useMemo(() => {
    return last14Days.map(dateStr => {
      const log = logs.find(l => l.date === dateStr);
      return {
        dateStr,
        dayNum: dateStr.slice(8, 10),
        monthStr: new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' }),
        log: log || null
      };
    });
  }, [last14Days, logs]);

  const loggedCount = chartData.filter(d => d.log !== null).length;
  const avgMood = useMemo(() => {
    const validLogs = chartData.filter(d => d.log !== null).map(d => d.log!.moodScore);
    if (!validLogs.length) return null;
    const sum = validLogs.reduce((acc, curr) => acc + curr, 0);
    return (sum / validLogs.length).toFixed(1);
  }, [chartData]);

  const activeMoodOption = MOOD_OPTIONS.find(o => o.score === moodScore);
  const activeEnergyOption = ENERGY_OPTIONS.find(o => o.score === energyScore);
  const activeCalmOption = CALM_OPTIONS.find(o => o.score === anxietyScore);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-sage/15 flex items-center justify-center text-sage">
          <Smile className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-serif text-[26px] font-normal text-charcoal leading-tight">Mood & Energy</h1>
          <p className="text-[12px] text-medium">Emotional wellbeing, daily reflections & maternal support</p>
        </div>
      </div>

      {/* Main Check-In Card */}
      <div className="bg-white border border-border/80 rounded-2xl shadow-2xs p-5 sm:p-6 space-y-6">
        {/* Warm Greeting Banner */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-border/60">
          <div className="min-w-0">
            <h2 className="font-serif text-[20px] text-charcoal font-medium leading-snug">{greeting}</h2>
            <p className="text-[12px] text-medium mt-0.5 leading-normal">Take a quiet moment to listen to your mind and body.</p>
          </div>
          <span className="shrink-0 px-3 py-1 rounded-full text-[12px] font-medium bg-cream text-charcoal border border-border/80 shadow-2xs whitespace-nowrap">
            {new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date())}
          </span>
        </div>

        {todayLog && !isEditing ? (
          /* Already Checked In Celebration Card */
          <div className="bg-gradient-to-br from-tulsi-light/40 via-cream/30 to-white p-5 rounded-2xl border border-sage/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sage animate-pulse" />
                <span className="text-[13px] font-semibold text-charcoal">Today's Reflection Complete</span>
              </div>
              <button
                type="button"
                onClick={handleStartEdit}
                className="text-[12px] font-medium text-sage-dark hover:underline cursor-pointer"
              >
                Update Check-in
              </button>
            </div>

            {/* Logged Summary Chips */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="bg-white/90 p-3 rounded-xl border border-border/60 text-center shadow-2xs">
                <span className="text-[26px] block">{MOOD_OPTIONS[todayLog.moodScore - 1]?.emoji || '🙂'}</span>
                <span className="text-[10.5px] uppercase font-bold text-medium tracking-wider block mt-1">Mood</span>
                <span className="text-[12.5px] font-medium text-charcoal block">
                  {MOOD_OPTIONS[todayLog.moodScore - 1]?.label || 'Steady'}
                </span>
              </div>

              <div className="bg-white/90 p-3 rounded-xl border border-border/60 text-center shadow-2xs">
                <span className="text-[26px] block">{ENERGY_OPTIONS[todayLog.energyScore - 1]?.emoji || '⚡'}</span>
                <span className="text-[10.5px] uppercase font-bold text-medium tracking-wider block mt-1">Energy</span>
                <span className="text-[12.5px] font-medium text-charcoal block">
                  {ENERGY_OPTIONS[todayLog.energyScore - 1]?.label || 'Steady'}
                </span>
              </div>

              <div className="bg-white/90 p-3 rounded-xl border border-border/60 text-center shadow-2xs">
                <span className="text-[26px] block">{CALM_OPTIONS[todayLog.anxietyScore - 1]?.emoji || '😌'}</span>
                <span className="text-[10.5px] uppercase font-bold text-medium tracking-wider block mt-1">Peace</span>
                <span className="text-[12.5px] font-medium text-charcoal block">
                  {CALM_OPTIONS[todayLog.anxietyScore - 1]?.label || 'Calm'}
                </span>
              </div>
            </div>

            {todayLog.journalResponse && (
              <div className="bg-white/80 p-3.5 rounded-xl border border-border/60 text-left">
                <span className="text-[11px] font-semibold text-medium block mb-1">“{todayLog.journalPrompt}”</span>
                <p className="text-[13px] text-charcoal/90 italic leading-relaxed">
                  {todayLog.journalResponse}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Check-In Form */
          <div className="space-y-6">
            {/* 1. Overall Mood */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Smile className="w-4 h-4 text-sage shrink-0" />
                  <span className="text-[13.5px] font-semibold text-charcoal tracking-wide uppercase whitespace-nowrap">Overall Mood</span>
                </div>
                {activeMoodOption ? (
                  <span className="shrink-0 text-[12px] font-semibold text-sage-dark bg-tulsi-light/70 px-2.5 py-0.5 rounded-full border border-sage/20 whitespace-nowrap">
                    {activeMoodOption.label}
                  </span>
                ) : (
                  <span className="shrink-0 text-[11px] text-light whitespace-nowrap">Select mood</span>
                )}
              </div>

              <div className="grid grid-cols-5 gap-2">
                {MOOD_OPTIONS.map((opt) => {
                  const isSelected = moodScore === opt.score;
                  return (
                    <button
                      key={opt.score}
                      type="button"
                      onClick={() => handleSelectScore('mood', opt.score)}
                      className={`flex flex-col items-center justify-center py-3 px-1 rounded-2xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sage/15 border-2 border-sage shadow-2xs scale-102 ring-2 ring-sage/20'
                          : 'bg-cream/40 border border-border/70 hover:bg-cream/70 hover:scale-102 active:scale-95'
                      }`}
                    >
                      <span className={`text-[28px] transition-transform ${isSelected ? 'scale-115' : 'grayscale opacity-75'}`}>
                        {opt.emoji}
                      </span>
                      <span className={`text-[11px] mt-1.5 font-medium ${isSelected ? 'text-charcoal font-semibold' : 'text-medium'}`}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {activeMoodOption && (
                <div className="text-center pt-0.5">
                  <span className="inline-block text-[12px] text-sage-dark font-medium bg-tulsi-light/40 py-0.5 px-3 rounded-full border border-sage/15 whitespace-nowrap">
                    {activeMoodOption.detail}
                  </span>
                </div>
              )}
            </div>

            {/* 2. Physical Vitality / Energy */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Zap className="w-4 h-4 text-sage shrink-0" />
                  <span className="text-[13.5px] font-semibold text-charcoal tracking-wide uppercase whitespace-nowrap">Energy Level</span>
                </div>
                {activeEnergyOption ? (
                  <span className="shrink-0 text-[12px] font-semibold text-sage-dark bg-tulsi-light/70 px-2.5 py-0.5 rounded-full border border-sage/20 whitespace-nowrap">
                    {activeEnergyOption.label}
                  </span>
                ) : (
                  <span className="shrink-0 text-[11px] text-light whitespace-nowrap">Select vitality</span>
                )}
              </div>

              <div className="grid grid-cols-5 gap-2">
                {ENERGY_OPTIONS.map((opt) => {
                  const isSelected = energyScore === opt.score;
                  return (
                    <button
                      key={opt.score}
                      type="button"
                      onClick={() => handleSelectScore('energy', opt.score)}
                      className={`flex flex-col items-center justify-center py-3 px-1 rounded-2xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sage/15 border-2 border-sage shadow-2xs scale-102 ring-2 ring-sage/20'
                          : 'bg-cream/40 border border-border/70 hover:bg-cream/70 hover:scale-102 active:scale-95'
                      }`}
                    >
                      <span className={`text-[28px] transition-transform ${isSelected ? 'scale-115' : 'grayscale opacity-75'}`}>
                        {opt.emoji}
                      </span>
                      <span className={`text-[11px] mt-1.5 font-medium ${isSelected ? 'text-charcoal font-semibold' : 'text-medium'}`}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {activeEnergyOption && (
                <div className="text-center pt-0.5">
                  <span className="inline-block text-[12px] text-sage-dark font-medium bg-tulsi-light/40 py-0.5 px-3 rounded-full border border-sage/15 whitespace-nowrap">
                    {activeEnergyOption.detail}
                  </span>
                </div>
              )}
            </div>

            {/* 3. Inner Calm / Anxiety */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Heart className="w-4 h-4 text-sage shrink-0" />
                  <span className="text-[13.5px] font-semibold text-charcoal tracking-wide uppercase whitespace-nowrap">Peace of Mind</span>
                </div>
                {activeCalmOption ? (
                  <span className="shrink-0 text-[12px] font-semibold text-sage-dark bg-tulsi-light/70 px-2.5 py-0.5 rounded-full border border-sage/20 whitespace-nowrap">
                    {activeCalmOption.label}
                  </span>
                ) : (
                  <span className="shrink-0 text-[11px] text-light whitespace-nowrap">Select calm</span>
                )}
              </div>

              <div className="grid grid-cols-5 gap-2">
                {CALM_OPTIONS.map((opt) => {
                  const isSelected = anxietyScore === opt.score;
                  return (
                    <button
                      key={opt.score}
                      type="button"
                      onClick={() => handleSelectScore('anxiety', opt.score)}
                      className={`flex flex-col items-center justify-center py-3 px-1 rounded-2xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sage/15 border-2 border-sage shadow-2xs scale-102 ring-2 ring-sage/20'
                          : 'bg-cream/40 border border-border/70 hover:bg-cream/70 hover:scale-102 active:scale-95'
                      }`}
                    >
                      <span className={`text-[28px] transition-transform ${isSelected ? 'scale-115' : 'grayscale opacity-75'}`}>
                        {opt.emoji}
                      </span>
                      <span className={`text-[11px] mt-1.5 font-medium ${isSelected ? 'text-charcoal font-semibold' : 'text-medium'}`}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {activeCalmOption && (
                <div className="text-center pt-0.5">
                  <span className="inline-block text-[12px] text-sage-dark font-medium bg-tulsi-light/40 py-0.5 px-3 rounded-full border border-sage/15 whitespace-nowrap">
                    {activeCalmOption.detail}
                  </span>
                </div>
              )}
            </div>

            {/* Daily Journal Reflection Card */}
            <div className="bg-cream/40 rounded-2xl p-4 border border-border/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sage" />
                  <span className="text-[13px] font-semibold text-charcoal">Daily Reflection</span>
                </div>
                <button
                  type="button"
                  onClick={handleShufflePrompt}
                  className="flex items-center gap-1 text-[11.5px] font-medium text-sage-dark hover:text-charcoal transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Change Prompt</span>
                </button>
              </div>

              <p className="text-[13px] font-serif text-charcoal italic leading-snug">
                “{journalPrompt}”
              </p>

              <textarea 
                value={journalResponse}
                onChange={e => setJournalResponse(e.target.value)}
                placeholder="Write your private thoughts here... (optional)"
                rows={3}
                className="w-full p-3 bg-white border border-border/80 rounded-xl text-[13.5px] text-charcoal placeholder:text-muted/60 focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 transition-all resize-none"
              />

              <div className="flex items-center gap-1.5 text-[11px] text-light pt-0.5">
                <Shield className="w-3 h-3 text-sage" />
                <span>Private & encrypted solely on this device</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleSaveCheckIn}
                disabled={moodScore === 0 || energyScore === 0 || anxietyScore === 0}
                className="w-full py-3.5 bg-sage hover:bg-sage-dark text-white rounded-xl font-medium text-[15px] shadow-sm hover:shadow active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4.5 h-4.5" />
                <span>{isEditing ? 'Update Check-in' : 'Save Today’s Check-in'}</span>
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-full py-2 text-[12.5px] font-medium text-medium hover:text-charcoal transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 14-Day Mood Journey Card */}
      <div className="bg-white border border-border/80 rounded-2xl shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-sage" />
            <h3 className="font-serif text-[18px] text-charcoal font-medium">14-Day Emotional Journey</h3>
          </div>

          {avgMood && (
            <div className="flex items-center gap-1.5 text-[12px] bg-tulsi-light/50 border border-sage/20 px-2.5 py-1 rounded-full text-sage-dark font-medium">
              <Sparkles className="w-3.5 h-3.5 text-sage" />
              <span>Avg: <strong>{avgMood}/5</strong> ({loggedCount} check-ins)</span>
            </div>
          )}
        </div>

        {loggedCount === 0 ? (
          <div className="py-8 px-4 text-center bg-cream/30 rounded-xl border border-dashed border-border/80">
            <Heart className="w-6 h-6 text-sage/40 mx-auto mb-2" />
            <p className="text-[13px] text-medium font-medium">Your 14-day emotional timeline will bloom here.</p>
            <p className="text-[11.5px] text-light mt-0.5">Complete your first daily check-in above to start tracking patterns.</p>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            {/* Timeline Bars Area */}
            <div className="h-[95px] relative w-full flex items-end justify-between gap-1 px-1">
              {chartData.map((d, i) => {
                const hasData = d.log !== null;
                const score = d.log ? d.log.moodScore : 0;
                // Height between 25% and 100% of the 65px bar height
                const heightPercent = hasData ? `${Math.max(25, (score / 5) * 100)}%` : '0%';
                const isToday = d.dateStr === today;

                return (
                  <div key={i} className="flex flex-col items-center justify-end h-full flex-1 group relative">
                    {/* Emoji indicator above bar */}
                    <div className="h-5 flex items-center justify-center">
                      {hasData && (
                        <span className="text-[12px] leading-none select-none">
                          {MOOD_OPTIONS[score - 1]?.emoji}
                        </span>
                      )}
                    </div>

                    {/* Bar Pillar */}
                    <div className="w-full flex items-end justify-center h-[65px]">
                      {hasData ? (
                        <div
                          className={`w-full max-w-[15px] rounded-t-md transition-all duration-300 shadow-2xs ${
                            score >= 4 
                              ? 'bg-sage' 
                              : score === 3 
                              ? 'bg-sage-dark/70' 
                              : 'bg-amber-400'
                          } ${isToday ? 'ring-2 ring-sage/50 ring-offset-1' : ''}`}
                          style={{ height: heightPercent }}
                        />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-border/60 mb-0.5" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grounded Base Axis Line */}
            <div className="w-full h-px bg-border/80" />

            {/* Date Numbers Aligned Below Base Axis Line */}
            <div className="w-full flex items-center justify-between gap-1 px-1">
              {chartData.map((d, i) => {
                const isToday = d.dateStr === today;
                const hasData = d.log !== null;
                return (
                  <div key={i} className="flex-1 text-center">
                    <span className={`text-[10px] select-none block ${
                      isToday 
                        ? 'text-sage-dark font-bold' 
                        : hasData 
                        ? 'text-charcoal font-medium' 
                        : 'text-muted/65'
                    }`}>
                      {d.dayNum}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-5 text-[11px] text-medium pt-3 mt-1 border-t border-border/50">
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-full bg-sage shrink-0" />
                <span>Good (4–5)</span>
              </span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-full bg-sage-dark/70 shrink-0" />
                <span>Steady (3)</span>
              </span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <span>Tender (1–2)</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Postpartum Wellbeing Check (EPDS) - When applicable */}
      {isPostpartum && (
        <div className="bg-white border border-border/80 rounded-2xl shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="border-b border-border/60 pb-3">
            <h3 className="font-serif text-[20px] text-charcoal font-medium">Postpartum Wellbeing Check</h3>
            <p className="text-[12px] text-medium mt-1 leading-relaxed">
              The Edinburgh Postnatal Depression Scale (EPDS) is a validated 10-question screening check. It is not a clinical diagnosis — discuss your answers with your obstetrician or ASHA worker.
            </p>
          </div>

          <div className="space-y-6 pt-2">
            {EPDS_QUESTIONS.map((q, idx) => (
              <div key={idx} className="bg-cream/40 p-4 rounded-xl border border-border/70 space-y-3">
                <p className="text-[13.5px] font-semibold text-charcoal leading-snug">
                  {idx + 1}. {q.q}
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {q.opts.map((opt, optIdx) => {
                    const score = q.scores[optIdx];
                    const isSelected = epdsAnswers[idx] === score;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setEpdsAnswers(prev => ({ ...prev, [idx]: score }));
                        }}
                        className={`text-left px-3.5 py-2.5 rounded-xl border text-[13px] transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-sage/15 border-sage text-sage-dark font-medium shadow-2xs ring-1 ring-sage/30' 
                            : 'bg-white border-border/80 text-charcoal hover:border-sage/50'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {!showEpdsResult ? (
            <button
              type="button"
              onClick={handleEpdsSubmit}
              disabled={Object.keys(epdsAnswers).length < 10}
              className="w-full mt-4 py-3.5 bg-sage hover:bg-sage-dark text-white rounded-xl font-medium text-[14.5px] shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Analyze Answers ({Object.keys(epdsAnswers).length}/10 answered)
            </button>
          ) : (
            <div className="mt-6 space-y-4 animate-in slide-in-from-bottom-2">
              <div className={`p-5 rounded-2xl border ${
                epdsScore >= 12 
                  ? 'bg-red-50/80 border-red-200' 
                  : epdsScore >= 9 
                  ? 'bg-amber-50/80 border-amber-200' 
                  : 'bg-tulsi-light/60 border-sage/30'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-serif text-[18px] text-white ${
                    epdsScore >= 12 ? 'bg-red-500' : epdsScore >= 9 ? 'bg-amber-500' : 'bg-sage'
                  }`}>
                    {epdsScore}
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal text-[15px]">EPDS Score Result</h4>
                    <span className="text-[12px] text-medium">Total score out of 30</span>
                  </div>
                </div>
                
                <p className="text-[13px] text-charcoal/90 leading-relaxed mt-2">
                  {epdsScore <= 8 && "Low likelihood of postpartum depression. Continue checking in with yourself with love and grace. 💚"}
                  {epdsScore > 8 && epdsScore <= 11 && "Some symptoms present. We recommend having a warm conversation with your doctor or community health worker."}
                  {epdsScore >= 12 && "Please speak with a healthcare provider soon. Postpartum depression is common, treatable, and you deserve full support."}
                </p>
              </div>

              {isQ10Flagged && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[13px] font-bold text-red-800">Support is right here for you</h4>
                    <p className="text-[12px] text-red-700 mt-0.5 leading-relaxed">
                      If you are feeling overwhelmed or experiencing thoughts of harm, please dial iCall: <strong>9152987821</strong> or visit your nearest hospital right away.
                    </p>
                  </div>
                </div>
              )}
              
              <button 
                type="button" 
                onClick={() => { setEpdsAnswers({}); setShowEpdsResult(false); }} 
                className="text-sage font-medium text-[13px] hover:underline cursor-pointer"
              >
                Retake screening test
              </button>
            </div>
          )}
        </div>
      )}

      {/* Maternal Support Resources Card */}
      <div className="bg-gradient-to-br from-cream/60 via-cream/30 to-white border border-border/80 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-sage shrink-0" />
          <h3 className="font-serif text-[18px] text-charcoal font-medium whitespace-nowrap">
            Free Maternal & Mental Helplines
          </h3>
        </div>

        <p className="text-[12px] text-medium leading-relaxed">
          Pregnancy hormones and maternal transitions are profound. Reach out anytime — compassionate, free support is available.
        </p>

        <div className="space-y-2 pt-1">
          {SUPPORT_RESOURCES.map((res, idx) => (
            <div 
              key={idx}
              className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-border/70 shadow-2xs"
            >
              <div className="min-w-0 pr-1 space-y-0.5">
                <span className="text-[13px] font-semibold text-charcoal block leading-snug">{res.name}</span>
                <span className="text-[11px] text-medium block leading-snug">{res.desc}</span>
              </div>

              <a
                href={`tel:${res.phone}`}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-tulsi-light hover:bg-tulsi-light/80 text-sage-dark font-semibold text-[12px] rounded-xl border border-sage/30 active:scale-95 transition-all shadow-2xs cursor-pointer whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5 text-sage" />
                <span>{res.displayPhone}</span>
              </a>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-border/60 text-center">
          <p className="text-[11.5px] text-medium italic">
            You can also confide in your local ASHA worker or ANM — they are dedicated to supporting your maternal journey in your community.
          </p>
        </div>
      </div>
    </div>
  );
};
