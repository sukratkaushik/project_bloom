import React, { useState, useEffect } from 'react';
import { usePlanner } from '../../store';
import { db } from '../../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { 
  Heart, 
  Sun, 
  Cloud, 
  TrendingUp, 
  BookOpen, 
  Smile,
  AlertTriangle
} from 'lucide-react';

const JOURNAL_PROMPTS = [
  "What would you tell your pre-pregnancy self?", // Sun (0)
  "What are you most looking forward to this week?", // Mon (1)
  "What feels heavy right now? It's okay to name it.", // Tue (2)
  "What does your body need today?", // Wed (3)
  "One thing you're grateful for today?", // Thu (4)
  "What would make today feel easier?", // Fri (5)
  "How are you really feeling about becoming a mother?", // Sat (6)
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

const scaleOptions = [
  { mood: ['😔','😟','😐','🙂','😄'], label: 'Mood' },
  { mood: ['🪫','😴','😐','⚡','🌟'], label: 'Energy' },
  { mood: ['😰','😟','😐','😌','🧘'], label: 'Anxiety' }
];

export const MoodTracker: React.FC = () => {
  const { state } = usePlanner();
  const [greeting, setGreeting] = useState('');
  
  // Daily check-in
  const [moodScore, setMoodScore] = useState<number>(0);
  const [energyScore, setEnergyScore] = useState<number>(0);
  const [anxietyScore, setAnxietyScore] = useState<number>(0);
  const [journalResponse, setJournalResponse] = useState('');
  const [journalPrompt, setJournalPrompt] = useState(JOURNAL_PROMPTS[new Date().getDay()]);
  
  // EPDS
  const [epdsAnswers, setEpdsAnswers] = useState<Record<number, number>>({});
  const [showEpdsResult, setShowEpdsResult] = useState(false);

  const today = new Date().toISOString().split('T')[0];

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
    else setGreeting("Hope you're resting 🌸");
  }, []);

  const handleSaveCheckIn = async () => {
    if (!state.activeJourneyId || moodScore === 0 || energyScore === 0 || anxietyScore === 0) return;
    await db.moodLogs.put({
      id: uuidv4(),
      journeyId: state.activeJourneyId,
      date: today,
      timestamp: Date.now(),
      moodScore,
      energyScore,
      anxietyScore,
      journalPrompt,
      journalResponse: journalResponse.trim(),
      createdAt: Date.now()
    });
  };

  const isPostpartum = state.dueDate && new Date(state.dueDate).getTime() < Date.now();

  const handleEpdsSubmit = () => {
    if (Object.keys(epdsAnswers).length === 10) {
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

  // Trend chart logic
  const last14Days = Array.from({length: 14}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last14Days.map(dateStr => {
    const log = logs.find(l => l.date === dateStr);
    return log ? log.moodScore : null;
  });

  const validData = chartData.filter(v => v !== null) as number[];
  const trendUp = validData.length > 2 && validData[validData.length - 1] >= validData[0];
  const color = trendUp ? '#7A9E87' : '#F59E0B'; // Sage vs Amber

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Smile className="w-8 h-8 text-sage" />
        <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-normal text-charcoal">Mood Tracker</h1>
      </div>

      <div className="bg-white border-[1.5px] border-border rounded-[16px] shadow-sm p-6 sm:p-8">
        <h2 className="font-serif text-2xl text-charcoal mb-6">{greeting}</h2>

        {todayLog ? (
          <div className="bg-sage-pale/40 p-6 rounded-[12px] border border-sage-light text-center">
            <div className="text-[48px] mb-2">{scaleOptions[0].mood[todayLog.moodScore - 1]}</div>
            <h3 className="font-semibold text-charcoal text-lg mb-1">You've already checked in today ✓</h3>
            <p className="text-medium text-[14px]">Great job making space for your feelings.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Mood', val: moodScore, set: setMoodScore, opts: scaleOptions[0].mood },
                { label: 'Energy', val: energyScore, set: setEnergyScore, opts: scaleOptions[1].mood },
                { label: 'Anxiety', val: anxietyScore, set: setAnxietyScore, opts: scaleOptions[2].mood }
              ].map(scale => (
                <div key={scale.label} className="flex flex-col items-center">
                  <span className="text-[14px] font-semibold uppercase tracking-wider text-charcoal mb-4">{scale.label}</span>
                  <div className="flex justify-between w-full">
                    {scale.opts.map((emoji, idx) => {
                      const score = idx + 1;
                      const isSelected = scale.val === score;
                      return (
                        <button
                          key={score}
                          onClick={() => scale.set(score)}
                          className={`text-[28px] sm:text-[32px] transition-all hover:-translate-y-1 ${isSelected ? 'scale-125 saturate-150 drop-shadow-sm outline outline-[3px] outline-sage rounded-full outline-offset-2 bg-sage-pale/20' : 'grayscale opacity-70 hover:grayscale-0 hover:opacity-100'}`}
                        >
                          {emoji}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-cream p-5 rounded-[12px] border border-border">
              <label className="text-[14px] font-semibold text-charcoal mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sage" />
                {journalPrompt}
              </label>
              <textarea 
                value={journalResponse}
                onChange={e => setJournalResponse(e.target.value)}
                placeholder="Write your thoughts here..."
                className="w-full mt-2 p-3 bg-white border border-border rounded-lg text-[14px] text-charcoal resize-y min-h-[100px] outline-none focus:border-sage focus:ring-[3px] focus:ring-sage/10 transition-shadow"
              />
            </div>

            <button
              onClick={handleSaveCheckIn}
              disabled={moodScore === 0 || energyScore === 0 || anxietyScore === 0}
              className="w-full bg-sage text-white rounded-[10px] font-semibold px-6 py-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sage-dark transition-colors shadow-sm text-[15px]"
            >
              Save Check-in
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border-[1.5px] border-border rounded-[16px] shadow-sm p-6 overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-sage" />
          <h3 className="font-semibold text-charcoal text-[17px]">14-Day Mood Trend</h3>
        </div>
        
        <div className="h-[120px] relative w-full flex items-end justify-between px-2">
          {chartData.map((val, i) => {
            if (val === null) return (
              <div key={i} className="flex flex-col items-center justify-end h-full w-full opacity-30">
                <div className="text-[10px] text-light mt-auto mb-1">{last14Days[i].slice(8, 10)}/{last14Days[i].slice(5, 7)}</div>
              </div>
            );
            
            const height = `${(val / 5) * 100}%`;
            return (
              <div key={i} className="flex flex-col items-center justify-end h-full w-full group relative">
                <div 
                  className="w-full max-w-[20px] rounded-t-sm transition-all duration-500 ease-out"
                  style={{ height, backgroundColor: color }}
                />
                <div className="absolute bottom-[calc(100%+8px)] opacity-0 group-hover:opacity-100 bg-charcoal text-white text-[12px] px-2 py-1 rounded transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  {scaleOptions[0].mood[val - 1]} ({val}/5)
                </div>
                <div className="text-[10px] text-medium mt-auto mb-1 pt-2">{last14Days[i].slice(8, 10)}/{last14Days[i].slice(5, 7)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {isPostpartum && (
        <div className="bg-white border-[1.5px] border-border rounded-[16px] shadow-sm p-6 sm:p-8">
          <h3 className="font-serif text-2xl text-charcoal mb-2">Postpartum Wellbeing Check</h3>
          <p className="text-medium text-[14px] mb-6 border-b border-border pb-6 italic">
            The Edinburgh Postnatal Depression Scale (EPDS) is a 10-question check used by doctors worldwide. It is not a diagnosis — please share your score with your doctor or ASHA worker.
          </p>

          <div className="space-y-8">
            {EPDS_QUESTIONS.map((q, idx) => (
              <div key={idx} className="bg-cream/50 p-5 rounded-[12px] border border-border/80">
                <p className="text-[15px] font-semibold text-charcoal mb-4">{idx + 1}. {q.q}</p>
                <div className="flex flex-col gap-2">
                  {q.opts.map((opt, optIdx) => {
                    const score = q.scores[optIdx];
                    const isSelected = epdsAnswers[idx] === score;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => setEpdsAnswers(prev => ({ ...prev, [idx]: score }))}
                        className={`text-left p-3 rounded-lg border-[1.5px] text-[14px] transition-colors ${isSelected ? 'bg-sage-pale border-sage text-sage font-medium cursor-default' : 'bg-white border-border text-charcoal hover:border-sage-dark'}`}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {!showEpdsResult ? (
            <button
              onClick={handleEpdsSubmit}
              disabled={Object.keys(epdsAnswers).length < 10}
              className="mt-8 w-full bg-sage text-white rounded-[10px] font-semibold px-6 py-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sage-dark transition-colors shadow-sm text-[15px]"
            >
              Analyze Answers
            </button>
          ) : (
            <div className="mt-8 animate-in slide-in-from-bottom-4">
              <div className={`p-6 rounded-[16px] border-[1.5px] mb-6 ${epdsScore >= 12 ? 'bg-red-50 border-red-300' : epdsScore >= 9 ? 'bg-amber-50 border-amber-300' : 'bg-green-50 border-green-300'}`}>
                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-serif text-[24px] text-white ${epdsScore >= 12 ? 'bg-red-500' : epdsScore >= 9 ? 'bg-amber-500' : 'bg-sage'}`}>
                    {epdsScore}
                  </div>
                  <h4 className="font-semibold text-charcoal text-[18px]">Your EPDS Score</h4>
                </div>
                
                <p className="text-[15px] text-charcoal ml-[64px]">
                  {epdsScore <= 8 && "Low likelihood of depression. Keep checking in with yourself. 💚"}
                  {epdsScore > 8 && epdsScore <= 11 && "Some symptoms present. Consider speaking with your doctor or ASHA worker."}
                  {epdsScore >= 12 && "Please speak with a healthcare provider soon. You deserve support."}
                </p>
              </div>

              {isQ10Flagged && (
                <div className="bg-critical-bg text-critical p-5 rounded-[12px] border border-red-300 flex items-start gap-4 mb-6">
                  <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold mb-1">Important</h4>
                    <p className="text-[14px]">If you are having thoughts of harming yourself, please call iCall: <strong>9152987821</strong> or go to your nearest hospital.</p>
                  </div>
                </div>
              )}
              
              <button onClick={() => { setEpdsAnswers({}); setShowEpdsResult(false); }} className="text-sage font-medium text-[14px]">Retake test</button>
            </div>
          )}
        </div>
      )}

      <div className="bg-blue-50/50 border-[1.5px] border-blue-100 rounded-[16px] p-6 shadow-inner">
        <h3 className="font-semibold text-charcoal text-[15px] mb-3">Support Resources</h3>
        <ul className="space-y-2 text-[14px] text-medium">
          <li className="flex justify-between items-center bg-white p-3 rounded-lg border border-border">
            <span>iCall (Psychosocial Helpline)</span>
            <a href="tel:9152987821" className="font-semibold text-sage">9152987821</a>
          </li>
          <li className="flex justify-between items-center bg-white p-3 rounded-lg border border-border">
            <span>Vandrevala Foundation (24/7)</span>
            <a href="tel:18602662345" className="font-semibold text-sage">1860-2662-345</a>
          </li>
          <li className="flex justify-between items-center bg-white p-3 rounded-lg border border-border">
            <span>NIMHANS Helpline</span>
            <a href="tel:08046110007" className="font-semibold text-sage">080-46110007</a>
          </li>
        </ul>
        <p className="mt-4 text-[13px] text-light italic text-center">Talk to your ASHA worker — they are trained to support you locally.</p>
      </div>
    </div>
  );
};
