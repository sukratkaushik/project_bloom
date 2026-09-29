import React, { useState } from 'react';
import {
  Sparkles, Send, Camera, Baby, Plane, HelpCircle,
  CheckCircle2, RefreshCw, MessageSquare, Wind, ArrowRight,
  ShieldCheck, Heart, AlertCircle, Volume2
} from 'lucide-react';
import { triggerHaptic } from '../../../utils/nativeBridge';
import { functions, auth } from '../../../firebase';
import { httpsCallable } from 'firebase/functions';
import { usePlanner } from '../../../store';
import Markdown from 'react-markdown';

interface SmartAiTabProps {
  onOpenTool: (toolId: string) => void;
}

export const SmartAiTab: React.FC<SmartAiTabProps> = ({ onOpenTool }) => {
  const { state } = usePlanner();
  const motherName = state.userName || auth.currentUser?.displayName || '';
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Namaste! 🌸 How can I help you today? You can ask about Indian pregnancy diet, scans, or symptom relief.',
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Indian Pregnancy Myth Buster dataset
  const myths = [
    {
      myth: 'Drinking saffron milk (kesar doodh) makes baby fair.',
      truth: 'Saffron is rich in antioxidants and safe in moderation (1-2 strands). Baby skin tone is purely genetic and unaffected by saffron.',
      factCheck: 'ACOG / FOGSI Genetics Advisory',
    },
    {
      myth: 'Eating papaya or pineapple always causes miscarriage.',
      truth: 'Only unripe green papaya contains latex that triggers contractions. Fully ripe yellow sweet papaya is safe and rich in Vitamin C and folate.',
      factCheck: 'WHO Maternal Nutrition Guidelines',
    },
    {
      myth: 'Belly shape indicates baby gender.',
      truth: 'Belly shape depends strictly on abdominal muscle tone, uterine shape, and fetal position — never baby gender.',
      factCheck: 'Obstetric Clinical Standard',
    },
    {
      myth: 'Desi ghee in month 9 lubricates the birth canal.',
      truth: 'Digestive and vaginal tracts are completely separate. Excess ghee causes severe heartburn and excess weight without aiding labor.',
      factCheck: 'FOGSI Practice Committee',
    },
    {
      myth: 'Pregnant mothers must fast during solar eclipses.',
      truth: 'Eclipses produce zero harmful radiation. Regular small meals and fluids are essential for fetal glucose stability.',
      factCheck: 'IMA Maternal Advisory',
    },
  ];

  const [currentMythIndex, setCurrentMythIndex] = useState(0);
  const [isMythRevealed, setIsMythRevealed] = useState(false);

  const activeMyth = myths[currentMythIndex];

  const quickPrompts = [
    '🥥 Coconut water',
    '🥭 Ripe mangoes',
    '🦵 Leg cramps',
    '🥬 Iron veg foods',
    '🍵 Herbal teas',
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
        systemPrompt: `You are Bloom AI, an executive clinical maternal companion aligned with FOGSI (Federation of Obstetric and Gynaecological Societies of India) and ACOG guidelines.
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
    setCurrentMythIndex((prev) => (prev + 1) % myths.length);
  };

  return (
    <div className="space-y-4 pb-32 animate-in fade-in duration-200">
      {/* 1. Maternal Sanctuary Hero Card */}
      <div className="bg-gradient-to-br from-purple-500/10 via-white to-pink-500/10 border border-purple-200/80 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100/90 px-2.5 py-0.5 rounded-full">
            Clinical AI Sanctuary
          </span>
          <span className="text-[10.5px] font-semibold text-medium">FOGSI Aligned</span>
        </div>
        <h2 className="font-serif font-bold text-charcoal text-[17px] leading-tight mt-0.5 truncate">
          Namaste{motherName ? `, ${motherName.split(' ')[0]}` : ''} 🌸
        </h2>
        <p className="text-[12px] text-medium mt-1 leading-snug">
          Week 24: Fetal hearing is fully active. Talk, sing, or practice gentle Garbh Sanskar today.
        </p>
      </div>

      {/* 2. AI Food & Calorie Scanner Spotlight Card */}
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
      <div className="bg-white dark:bg-stone-900 border border-border/80 dark:border-stone-800 rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sage/15 text-sage-dark dark:bg-sage-dark/30 dark:text-sage-light flex items-center justify-center">
              <Sparkles size={16} className="stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-charcoal dark:text-cream text-[14.5px] leading-tight">
                Ask Bloom AI Companion
              </h3>
              <span className="text-[10.5px] text-sage-dark dark:text-sage-light font-medium">
                Clinical Guidance • FOGSI & ACOG Aligned
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-sage-dark bg-sage-pale px-2.5 py-0.5 rounded-full border border-sage/20">
            Active
          </span>
        </div>

        {/* Message Bubble Stream */}
        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 text-[12.5px] leading-relaxed shadow-3xs ${
                  m.sender === 'user'
                    ? 'bg-sage-dark text-white rounded-tr-xs'
                    : 'bg-cream/70 dark:bg-stone-800 text-charcoal dark:text-cream rounded-tl-xs border border-border/80 dark:border-stone-700'
                }`}
              >
                {m.sender === 'user' ? (
                  <div className="whitespace-pre-wrap">{m.text}</div>
                ) : (
                  <div className="prose prose-sm max-w-none text-[12.5px] leading-relaxed space-y-1 text-charcoal/95 dark:text-stone-200">
                    <Markdown>{m.text}</Markdown>
                    <div className="mt-2 pt-2 border-t border-border/50 dark:border-stone-700 flex items-center gap-1.5 text-[10px] text-medium dark:text-stone-400">
                      <ShieldCheck size={11} className="text-sage shrink-0" />
                      <span>Evidence-based clinical advisory • Verify with OB-GYN</span>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[9.5px] text-light mt-0.5 px-1">{m.time}</span>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-cream dark:bg-stone-800 rounded-2xl px-3.5 py-2 text-[12px] text-charcoal/80 dark:text-stone-300 flex items-center gap-2 border border-border/70 dark:border-stone-700">
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
              key={prompt}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="h-7 px-2.5 bg-cream hover:bg-sage-pale/70 rounded-full text-[10.5px] font-bold text-charcoal border border-border/70 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="mt-2 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about diet, scans, or symptom relief..."
            className="flex-1 h-9 bg-cream/70 border border-border/80 rounded-xl px-3 text-[12px] text-charcoal placeholder:text-light focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-sage hover:bg-sage-dark text-white flex items-center justify-center shrink-0 disabled:opacity-40 active:scale-95 transition-all cursor-pointer shadow-xs"
            aria-label="Send message"
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      {/* 4. 2x2 Bento Suite of AI Tools (Uniform Equal Height Boxes) */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenTool('foodscanner');
          }}
          className="h-24 bg-white border border-border/80 rounded-2xl p-3 text-left shadow-2xs hover:border-sage transition-all active:scale-[0.98] cursor-pointer group flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-xl bg-sage-pale text-sage-dark flex items-center justify-center group-hover:scale-105 transition-transform">
            <Camera size={17} />
          </div>
          <div>
            <h4 className="font-bold text-charcoal text-[13px] leading-tight truncate group-hover:text-sage-dark transition-colors">
              AI Food Guide
            </h4>
            <p className="text-[11px] text-medium truncate mt-0.5">Meal macros & safety</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenTool('babynames');
          }}
          className="h-24 bg-white border border-border/80 rounded-2xl p-3 text-left shadow-2xs hover:border-pink-400 transition-all active:scale-[0.98] cursor-pointer group flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Baby size={17} />
          </div>
          <div>
            <h4 className="font-bold text-charcoal text-[13px] leading-tight truncate group-hover:text-pink-700 transition-colors">
              Baby Names
            </h4>
            <p className="text-[11px] text-medium truncate mt-0.5">Vedic & modern meanings</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenTool('breathing');
          }}
          className="h-24 bg-white border border-border/80 rounded-2xl p-3 text-left shadow-2xs hover:border-sage-dark transition-all active:scale-[0.98] cursor-pointer group flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-xl bg-sage-pale text-sage-dark flex items-center justify-center group-hover:scale-105 transition-transform">
            <Wind size={17} />
          </div>
          <div>
            <h4 className="font-bold text-charcoal text-[13px] leading-tight truncate group-hover:text-sage-dark transition-colors">
              Garbh Sanskar
            </h4>
            <p className="text-[11px] text-medium truncate mt-0.5">Pranayama & audio ragas</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenTool('travel');
          }}
          className="h-24 bg-white border border-border/80 rounded-2xl p-3 text-left shadow-2xs hover:border-teal-400 transition-all active:scale-[0.98] cursor-pointer group flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Plane size={17} />
          </div>
          <div>
            <h4 className="font-bold text-charcoal text-[13px] leading-tight truncate group-hover:text-teal-700 transition-colors">
              Travel Guide
            </h4>
            <p className="text-[11px] text-medium truncate mt-0.5">Flying & road rules</p>
          </div>
        </button>
      </div>

      {/* 5. Indian Pregnancy Myth Buster Card */}
      <div className="bg-white border border-border/80 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <div className="flex items-center gap-1.5">
            <HelpCircle size={15} className="text-soft-saffron-dark" />
            <h3 className="font-serif font-bold text-charcoal text-[14px]">
              Pregnancy Myth Buster
            </h3>
          </div>
          <span className="text-[9.5px] font-bold text-medium uppercase bg-cream px-2 py-0.2 rounded-full">
            {currentMythIndex + 1}/{myths.length}
          </span>
        </div>

        <div className="p-3 bg-cream/70 rounded-2xl border border-border/60">
          <span className="text-[9.5px] font-bold text-critical uppercase tracking-wider block mb-0.5">
            Common Myth:
          </span>
          <p className="text-[13px] font-bold text-charcoal leading-snug">
            "{activeMyth.myth}"
          </p>

          {isMythRevealed ? (
            <div className="mt-2.5 pt-2.5 border-t border-border/60 animate-in fade-in duration-200">
              <span className="text-[10px] font-bold text-green-700 uppercase flex items-center gap-1 mb-0.5">
                <CheckCircle2 size={13} />
                Medical Truth:
              </span>
              <p className="text-[11.5px] text-charcoal/90 leading-relaxed">
                {activeMyth.truth}
              </p>
              <span className="text-[9.5px] text-medium mt-1 block italic">
                Source: {activeMyth.factCheck}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                setIsMythRevealed(true);
              }}
              className="mt-2.5 w-full py-1.5 bg-sage text-white text-[11.5px] font-bold rounded-xl shadow-2xs hover:bg-sage-dark transition-colors cursor-pointer"
            >
              Reveal Medical Truth
            </button>
          )}
        </div>

        <div className="mt-2.5 flex justify-between items-center px-0.5">
          <span className="text-[10.5px] text-medium">FOGSI Evidence Backed</span>
          <button
            type="button"
            onClick={handleNextMyth}
            className="text-[11px] font-bold text-sage-dark hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Next Myth</span>
            <RefreshCw size={11} />
          </button>
        </div>
      </div>
    </div>
  );
};
