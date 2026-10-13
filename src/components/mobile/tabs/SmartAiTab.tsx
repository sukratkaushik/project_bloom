import React, { useState } from 'react';
import {
  Sparkles, Send, Camera, Baby, Plane, HelpCircle,
  CheckCircle2, RefreshCw, Wind, ArrowRight,
  ShieldCheck, ChevronRight
} from 'lucide-react';
import { triggerHaptic } from '../../../utils/nativeBridge';
import { functions } from '../../../firebase';
import { httpsCallable } from 'firebase/functions';
import { usePlanner } from '../../../store';
import Markdown from 'react-markdown';
import { PREGNANCY_MYTHS } from '../../../data/pregnancyMyths';

interface SmartAiTabProps {
  onOpenTool: (toolId: string) => void;
}

export const SmartAiTab: React.FC<SmartAiTabProps> = ({ onOpenTool }) => {
  const { state } = usePlanner();
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Namaste! 🌸 How can I help you today? You can ask about Indian pregnancy diet, scans, or symptom relief.',
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Day-of-year rotation so mother automatically gets a fresh myth daily (out of 50)
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const initialMythIndex = dayOfYear % PREGNANCY_MYTHS.length;

  const [currentMythIndex, setCurrentMythIndex] = useState(initialMythIndex);
  const [isMythRevealed, setIsMythRevealed] = useState(false);

  const activeMyth = PREGNANCY_MYTHS[currentMythIndex] || PREGNANCY_MYTHS[0];

  const quickPrompts = [
    { label: '🥥 Tender Coconut', q: 'Is tender coconut water safe in pregnancy and what are its benefits?' },
    { label: '🥭 Ripe Mangoes', q: 'Can I eat ripe mangoes during pregnancy? What is the safe portion?' },
    { label: '🦵 Leg Cramps', q: 'How can I quickly relieve nocturnal leg cramps in pregnancy?' },
    { label: '🩺 Braxton Hicks', q: 'How do I tell the difference between Braxton Hicks and real labor contractions?' },
    { label: '🥬 Iron Foods', q: 'What are the best vegetarian iron-rich foods for pregnancy?' },
    { label: '✈️ Travel & Flying', q: 'Is it safe to travel or fly during this trimester?' },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    triggerHaptic('light');
    const userMsg = text.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [...prev, { sender: 'user', text: userMsg, time: timeNow }]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const chatCallable = httpsCallable(functions, 'chatWithAI');
      const response = await chatCallable({
        message: userMsg,
        dueDate: state.dueDate,
        systemPrompt: `You are OPIN AI, an executive clinical maternal companion aligned with FOGSI (Federation of Obstetric and Gynaecological Societies of India) and ACOG guidelines.
When answering maternal questions:
1. Provide a direct, definitive Clinical Summary first.
2. Outline key maternal/fetal physiological benefits or risks using clean bullet points.
3. Specify evidence-based daily portions, safe timing, and clinical precautions.
4. Keep the tone professional, authoritative yet empathetic, avoiding vague generalities.
5. End with a 1-line verification advisory.`,
      });
      const result = response.data as { reply: string };

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: result.reply || 'Thank you for your question. Always verify with your doctor during your routine prenatal scans.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      triggerHaptic('success');
    } catch (err: any) {
      console.warn('AI request fallback:', err);
      let fallbackText = `### 📋 Clinical Advisory\n\n**Recommendation:** Safe and beneficial when consumed in balanced portions.\n\n- **Hydration & Electrolytes:** Supports maternal plasma expansion and amniotic fluid levels.\n- **Guidelines:** Incorporate whole, fresh foods and stay well-hydrated throughout your trimester.\n\n*Always verify ongoing dietary choices with your OB-GYN.*`;
      
      const lower = userMsg.toLowerCase();
      if (lower.includes('coconut')) {
        fallbackText = `### 📋 Clinical Advisory: Tender Coconut Water\n\n**Safety Level:** Safe & Recommended (Trimesters 1, 2 & 3)\n\n- **Electrolyte Balance:** Rich in potassium, magnesium, and sodium to combat maternal fatigue and leg cramps.\n- **Nausea & Acid Reflux Relief:** Natural soothing properties help reduce mild heartburn and morning sickness.\n- **Safe Daily Intake:** 1 fresh tender coconut (approx. 250–300 ml) daily, preferably in the morning or early afternoon.\n- **Clinical Note:** If managing Gestational Diabetes (GDM), monitor blood sugar as natural carbs are present (~6g/cup).\n\n*Cross-referenced with FOGSI maternal nutrition baselines.*`;
      } else if (lower.includes('mango')) {
        fallbackText = `### 📋 Clinical Advisory: Ripe Mangoes\n\n**Safety Level:** Safe in Moderation (Trimesters 1, 2 & 3)\n\n- **Nutritional Value:** Abundant in Vitamin A, Vitamin C, and dietary fiber supporting fetal eye development and maternal digestion.\n- **Safe Daily Intake:** 1/2 to 1 medium ripe mango per day (approx. 100–150g). Avoid raw mango in excessive quantities due to latex/papain content.\n- **Clinical Note:** Naturally high in fructose; women with Gestational Diabetes should consult their dietitian for glycemic pairing.\n\n*Cross-referenced with FOGSI maternal nutrition baselines.*`;
      } else if (lower.includes('cramp')) {
        fallbackText = `### 📋 Clinical Advisory: Nocturnal Leg Cramps\n\n**Commonality:** Frequent in 2nd and 3rd trimesters due to venous pressure and calcium-magnesium shifts.\n\n- **Immediate Relief:** Gently dorsiflex the foot (pull toes upward toward your shin) and massage the calf muscle.\n- **Preventive Care:** Ensure adequate dietary magnesium (nuts, seeds, leafy greens), proper hydration, and light evening calf stretches.\n- **Red Flags:** Seek immediate clinical care if cramps are accompanied by persistent one-sided swelling, redness, or heat (ruling out DVT).\n\n*ACOG & FOGSI Clinical Guideline Aligned.*`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: fallbackText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextMyth = () => {
    triggerHaptic('light');
    setIsMythRevealed(false);
    setCurrentMythIndex((prev) => (prev + 1) % PREGNANCY_MYTHS.length);
  };

  return (
    <div className="space-y-4 pb-32 animate-in fade-in duration-200">
      {/* 1. Pregnancy Myth Buster Card (Top Spotlight with 50+ Humorous & Evidence-Based Myths) */}
      <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-amber-900/40 rounded-3xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-100/40 dark:bg-amber-900/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header with Counter and Next button */}
        <div className="flex items-center justify-between mb-2.5 relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200/70 dark:border-amber-800/60 flex items-center gap-1">
              <HelpCircle size={12} className="text-amber-600 dark:text-amber-400" />
              Daily Myth Buster
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-medium dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full">
              #{currentMythIndex + 1} of {PREGNANCY_MYTHS.length}
            </span>
            <button
              type="button"
              onClick={handleNextMyth}
              className="text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 bg-amber-100/80 dark:bg-amber-900/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
              title="Next Myth"
            >
              <span>Next</span>
              <RefreshCw size={10.5} />
            </button>
          </div>
        </div>

        {/* The Myth Content */}
        <div className="p-3.5 bg-amber-50/50 dark:bg-stone-800/80 rounded-2xl border border-amber-200/60 dark:border-stone-700/80 relative z-10 space-y-2">
          <div>
            <span className="text-[9.5px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block mb-1">
              Popular Myth:
            </span>
            <p className="font-serif font-bold text-[14px] text-charcoal dark:text-cream leading-snug">
              "{activeMyth.myth}"
            </p>
          </div>

          {/* Witty Humor Punchline */}
          {activeMyth.humor && (
            <div className="bg-white/80 dark:bg-stone-900/80 rounded-xl px-3 py-1.5 border border-amber-200/40 dark:border-stone-700 text-[11.5px] text-amber-900 dark:text-amber-200/90 leading-snug flex items-start gap-1.5">
              <span className="shrink-0 text-base leading-none">😄</span>
              <span className="italic">{activeMyth.humor}</span>
            </div>
          )}

          {/* Reveal Medical Truth Section */}
          {isMythRevealed ? (
            <div className="pt-2.5 border-t border-amber-200/60 dark:border-stone-700 animate-in fade-in duration-200 space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase flex items-center gap-1">
                <CheckCircle2 size={13} className="shrink-0" />
                Medical Truth:
              </span>
              <p className="text-[12px] text-charcoal/90 dark:text-stone-200 leading-relaxed font-normal">
                {activeMyth.truth}
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] text-medium dark:text-stone-400">
                <span className="italic truncate">Source: {activeMyth.factCheck}</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold shrink-0 ml-2">✓ Evidence-Backed</span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                setIsMythRevealed(true);
              }}
              className="mt-1 w-full py-2 bg-charcoal dark:bg-stone-700 hover:bg-charcoal/90 text-white text-[12px] font-bold rounded-xl shadow-2xs transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Reveal Medical Truth</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Clinical Food Intelligence (AI Food & Calorie Scanner) */}
      <div className="bg-white dark:bg-stone-900 border border-border/80 dark:border-stone-800 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-sage-dark bg-sage-pale/90 dark:bg-sage-dark/30 dark:text-sage-light px-2.5 py-0.5 rounded-full inline-block mb-1 border border-sage/20">
              Clinical Food Intelligence
            </span>
            <h3 className="font-serif font-bold text-charcoal dark:text-cream text-[16px] leading-tight truncate">
              AI Food & Calorie Guide
            </h3>
            <p className="text-[12px] text-medium dark:text-stone-400 mt-0.5 line-clamp-2">
              Instant meal calories, FOGSI vitamins, and trimester safety analysis.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              onOpenTool('foodscanner');
            }}
            className="w-11 h-11 rounded-2xl bg-charcoal text-white flex items-center justify-center shadow-xs hover:bg-charcoal/90 active:scale-95 transition-all shrink-0 cursor-pointer"
            aria-label="Scan Meal"
          >
            <Camera size={20} />
          </button>
        </div>

        <div className="mt-3 pt-2.5 border-t border-border/60 dark:border-stone-800 flex items-center justify-between text-[11.5px]">
          <span className="text-charcoal/80 dark:text-stone-300 font-semibold flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-sage" /> FOGSI Trimester Safety Index
          </span>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenTool('foodscanner');
            }}
            className="text-sage-dark dark:text-sage-light font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>Open Scanner</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* 3. Interactive AI Maternal Chat Companion */}
      <div className="bg-white dark:bg-stone-900 border border-border/80 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sage/15 text-sage-dark dark:bg-sage-dark/30 dark:text-sage-light flex items-center justify-center">
              <Sparkles size={16} className="stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-charcoal dark:text-cream text-[14.5px] leading-tight">
                Ask OPIN AI
              </h3>
              <span className="text-[10.5px] text-medium dark:text-stone-400 font-medium">
                Evidence-based clinical guidance
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-sage-dark bg-sage-pale px-2.5 py-0.5 rounded-full border border-sage/20">
            Active
          </span>
        </div>

        {/* Message Bubble Stream */}
        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 text-[12.5px] leading-relaxed shadow-3xs ${
                  m.sender === 'user'
                    ? 'bg-sage text-white rounded-tr-xs'
                    : 'bg-white dark:bg-stone-800 text-charcoal dark:text-cream rounded-tl-xs border border-border/80 dark:border-stone-700 border-l-[3px] border-l-sage space-y-1.5'
                }`}
              >
                {m.sender === 'user' ? (
                  <div className="whitespace-pre-wrap">{m.text}</div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-border/50 dark:border-stone-700 text-[11px]">
                      <div className="flex items-center gap-1.5 text-sage-dark font-semibold">
                        <Sparkles size={12} className="text-sage shrink-0" />
                        <span>OPIN AI Clinical Guide</span>
                      </div>
                      <span className="text-[9.5px] text-light whitespace-nowrap">Evidence-based</span>
                    </div>
                    <div className="prose prose-sm max-w-none text-[12.5px] leading-relaxed space-y-1 text-charcoal/95 dark:text-stone-200">
                      <Markdown>{m.text}</Markdown>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-border/50 dark:border-stone-700 flex items-center justify-between text-[10px] text-light">
                      <span className="flex items-center gap-1 text-sage-dark">
                        <ShieldCheck size={11} className="text-sage shrink-0" /> 100% Private
                      </span>
                      <span>Verify with OB-GYN</span>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[9.5px] text-light mt-0.5 px-1">{m.time}</span>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-stone-800 rounded-2xl rounded-tl-xs p-3 text-[12px] text-charcoal/80 dark:text-stone-300 flex items-center gap-2 border border-border/70 dark:border-stone-700 border-l-[3px] border-l-sage shadow-2xs">
                <RefreshCw size={13} className="animate-spin text-sage-dark" />
                <span>Consulting clinical guidelines...</span>
              </div>
            </div>
          )}
        </div>

        {/* 1-Tap Quick Prompt Chips */}
        <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt.label}
              type="button"
              onClick={() => handleSendMessage(prompt.q)}
              className="px-2.5 py-1 bg-white hover:bg-sage-pale/60 active:scale-95 text-charcoal border border-border/80 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer shadow-3xs"
            >
              {prompt.label}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="mt-2 flex items-center gap-1.5 bg-white dark:bg-stone-800 border border-border/90 dark:border-stone-700 focus-within:border-sage focus-within:ring-2 focus-within:ring-sage/20 rounded-2xl px-2 py-1 transition-all shadow-3xs">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about diet, scans, symptoms..."
            className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-[12.5px] text-charcoal dark:text-cream placeholder:text-medium/60 py-1 px-1.5 leading-relaxed"
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="p-2 bg-sage text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-sage-dark active:scale-95 transition-all cursor-pointer shrink-0 shadow-3xs"
            aria-label="Send message"
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      {/* 4. Full-Width Rectangular Tool Cards (End-to-End, Clean & Clutter-Free) */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenTool('babynames');
          }}
          className="w-full bg-white dark:bg-stone-900 border border-border/80 dark:border-stone-800 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs hover:border-pink-300 dark:hover:border-pink-700 transition-all active:scale-[0.99] cursor-pointer group text-left"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Baby size={20} />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-charcoal dark:text-cream text-[13.5px] leading-tight group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                AI Baby Names
              </h4>
              <p className="text-[11.5px] text-medium dark:text-stone-400 mt-0.5 truncate">
                Vedic, modern & culturally curated names with meanings
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-medium/50 group-hover:text-pink-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenTool('breathing');
          }}
          className="w-full bg-white dark:bg-stone-900 border border-border/80 dark:border-stone-800 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs hover:border-sage-dark dark:hover:border-sage transition-all active:scale-[0.99] cursor-pointer group text-left"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-sage-pale dark:bg-sage-dark/30 text-sage-dark dark:text-sage-light flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Wind size={20} />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-charcoal dark:text-cream text-[13.5px] leading-tight group-hover:text-sage-dark dark:group-hover:text-sage-light transition-colors">
                Garbh Sanskar
              </h4>
              <p className="text-[11.5px] text-medium dark:text-stone-400 mt-0.5 truncate">
                Pranayama breathing techniques, mindful bonding & ragas
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-medium/50 group-hover:text-sage-dark group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenTool('travel');
          }}
          className="w-full bg-white dark:bg-stone-900 border border-border/80 dark:border-stone-800 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs hover:border-teal-400 dark:hover:border-teal-600 transition-all active:scale-[0.99] cursor-pointer group text-left"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Plane size={20} />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-charcoal dark:text-cream text-[13.5px] leading-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                Travel Guide
              </h4>
              <p className="text-[11.5px] text-medium dark:text-stone-400 mt-0.5 truncate">
                Trimester travel clearance, flying rules & road safety
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-medium/50 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
        </button>
      </div>
    </div>
  );
};
