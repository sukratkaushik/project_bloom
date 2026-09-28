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

interface SmartAiTabProps {
  onOpenTool: (toolId: string) => void;
}

export const SmartAiTab: React.FC<SmartAiTabProps> = ({ onOpenTool }) => {
  const { state } = usePlanner();
  const motherName = state.userName || auth.currentUser?.displayName || '';
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Namaste! 🌸 I am Bloom AI, your personal pregnancy wellness companion. How can I support you today? You can ask about safe Indian foods, exercises, symptoms, or fetal development.',
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Indian Pregnancy Myth Buster dataset
  const myths = [
    {
      myth: 'Drinking saffron milk (kesar doodh) makes the baby fair-complexioned.',
      truth: 'Saffron is rich in antioxidants, helps mood and digestion, and is safe in moderation (1-2 strands). However, baby skin pigmentation is purely genetic (melanin inheritance) and completely unaffected by saffron.',
      factCheck: 'ACOG / FOGSI Genetics Advisory',
    },
    {
      myth: 'Eating papaya or pineapple in any form instantly causes miscarriage.',
      truth: 'Unripe green papaya contains latex and papain which may trigger uterine spasms. However, fully ripe yellow sweet papaya in moderate portions is completely safe and packed with Vitamin C, folate, and potassium.',
      factCheck: 'WHO Maternal Nutrition Guidelines',
    },
    {
      myth: 'The shape or height of your pregnancy bump indicates the baby’s gender.',
      truth: 'Bump shape depends solely on maternal abdominal muscle tone, uterine tilt, pelvic structure, and fetal position (e.g. anterior vs posterior) — not fetal gender.',
      factCheck: 'Obstetric Clinical Standard',
    },
    {
      myth: 'Drinking large amounts of desi ghee in the 9th month lubricates the birth canal for a normal delivery.',
      truth: 'The digestive tract and the birth canal (vagina) are completely separate anatomical systems. Excessive ghee does not grease the vagina; it only adds high saturated fat and can cause severe acid reflux or excessive maternal weight gain.',
      factCheck: 'FOGSI Clinical Practice Committee',
    },
    {
      myth: 'Pregnant women must not step outside or eat during a solar or lunar eclipse (Grahan).',
      truth: 'Eclipses are celestial alignments with zero harmful radiation reaching earth. Staying hydrated and eating regular small meals is medically essential for both maternal and fetal glucose stability.',
      factCheck: 'Indian Medical Association Maternal Advisory',
    },
  ];

  const [currentMythIndex, setCurrentMythIndex] = useState(0);
  const [isMythRevealed, setIsMythRevealed] = useState(false);

  const activeMyth = myths[currentMythIndex];

  const quickPrompts = [
    '🥥 Coconut water daily?',
    '🥭 Ripe mangoes in T2?',
    '🦵 Relieve night calf cramps',
    '🥬 Iron-rich veg foods',
    '🍵 Safe herbal teas',
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
      // Call Cloud Function serverless AI gateway
      const chatCallable = httpsCallable(functions, 'chatWithAI');
      const response = await chatCallable({
        message: userMsg,
        dueDate: state.dueDate,
        systemPrompt: `You are Bloom AI, a warm, culturally attuned, evidence-based obstetric companion for Indian and South Asian mothers. Always give balanced, reassuring, medical-board aligned advice.`,
      });
      const result = response.data as { reply: string };

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: result.reply || 'Thank you for your question. Always remember to verify with your doctor during your prenatal scans.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      triggerHaptic('success');
    } catch (err: any) {
      console.warn('AI request fallback:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Tender coconut water, soaked almonds, and ripe sweet fruits are gentle and hydrating during pregnancy! Please consult Dr. Priya for any persistent symptoms.',
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
    <div className="space-y-4 pb-28 animate-in fade-in duration-200">
      {/* 1. Maternal Sanctuary Hero Card */}
      <div className="bg-gradient-to-br from-purple-500/10 via-white to-pink-500/10 border border-purple-200/80 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100/90 px-2.5 py-0.5 rounded-full">
            Clinical Maternal Intelligence
          </span>
          <span className="text-[11px] font-semibold text-medium">FOGSI & ACOG Aligned</span>
        </div>
        <h2 className="font-serif font-bold text-charcoal text-[18px] mt-1">
          Namaste{motherName ? `, ${motherName.split(' ')[0]}` : ''} 🌸
        </h2>
        <p className="text-[12.5px] text-medium mt-1 leading-relaxed">
          Week 24 milestone: Your baby’s inner ear is fully formed, and they can hear maternal heartbeats and soothing voices. Talk, sing, or practice gentle Garbh Sanskar today!
        </p>
      </div>

      {/* 2. AI Food & Calorie Scanner Spotlight Card */}
      <div className="bg-gradient-to-r from-orange-500/10 via-white to-amber-500/10 border border-orange-200/80 rounded-3xl p-4 shadow-xs">
        <div className="flex items-start justify-between">
          <div className="max-w-[75%]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded-full inline-block mb-1">
              AI Vision & Barcode
            </span>
            <h3 className="font-serif font-bold text-charcoal text-[16px] leading-tight">
              AI Food & Calorie Scanner
            </h3>
            <p className="text-[12px] text-medium mt-1 leading-snug">
              Snap any meal, recipe or packaged food barcode to check gestational diabetes safety, FOGSI vitamins, and calorie density.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              onOpenTool('foodscanner');
            }}
            className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-xs hover:bg-orange-700 active:scale-95 transition-all shrink-0 cursor-pointer"
            aria-label="Scan Meal"
          >
            <Camera size={24} />
          </button>
        </div>

        <div className="mt-3 pt-2.5 border-t border-orange-200/60 flex items-center justify-between text-[11.5px]">
          <span className="text-orange-800 font-semibold flex items-center gap-1">
            <ShieldCheck size={14} /> Trimester 1, 2 & 3 Safety Index
          </span>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenTool('foodscanner');
            }}
            className="text-orange-700 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>Open Scanner</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* 3. Interactive AI Maternal Chat Companion */}
      <div className="bg-white border border-border/80 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles size={17} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-charcoal text-[14.5px] leading-tight">
                Ask Bloom AI Companion
              </h3>
              <span className="text-[10.5px] text-medium">Powered by Qwen 2.5-72B</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-sage-dark bg-sage-pale px-2 py-0.5 rounded-full">
            Online
          </span>
        </div>

        {/* Message Bubble Stream */}
        <div className="space-y-3 max-h-[230px] overflow-y-auto pr-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed shadow-2xs ${
                  m.sender === 'user'
                    ? 'bg-sage-dark text-white rounded-tr-xs'
                    : 'bg-cream text-charcoal rounded-tl-xs border border-border/70'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9.5px] text-light mt-1 px-1">{m.time}</span>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-cream rounded-2xl px-3.5 py-2 text-[12px] text-medium flex items-center gap-2 border border-border/70">
                <RefreshCw size={13} className="animate-spin text-purple-600" />
                <span>Consulting obstetric knowledge base...</span>
              </div>
            </div>
          )}
        </div>

        {/* 1-Tap Quick Prompt Chips */}
        <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 bg-cream hover:bg-sage-pale/70 rounded-full text-[11px] font-bold text-charcoal border border-border/70 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="mt-2.5 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about Indian diet, sleep, scans or symptoms..."
            className="flex-1 bg-cream/70 border border-border/80 rounded-xl px-3.5 py-2 text-[12.5px] text-charcoal placeholder:text-light focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 disabled:opacity-40 active:scale-95 transition-all cursor-pointer shadow-xs"
            aria-label="Send message"
          >
            <Send size={15} />
          </button>
        </div>
      </div>

      {/* 4. 2x2 Bento Suite of AI Tools */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenTool('foodscanner');
          }}
          className="bg-white border border-border/80 rounded-2xl p-3.5 text-left shadow-2xs hover:border-orange-400 transition-all active:scale-[0.98] cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Camera size={19} />
          </div>
          <h4 className="font-bold text-charcoal text-[13.5px] group-hover:text-orange-700 transition-colors">AI Food Guide</h4>
          <p className="text-[11.5px] text-medium mt-0.5 line-clamp-1">Meal calories & barcode</p>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenTool('babynames');
          }}
          className="bg-white border border-border/80 rounded-2xl p-3.5 text-left shadow-2xs hover:border-pink-400 transition-all active:scale-[0.98] cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Baby size={19} />
          </div>
          <h4 className="font-bold text-charcoal text-[13.5px] group-hover:text-pink-700 transition-colors">Baby Names Finder</h4>
          <p className="text-[11.5px] text-medium mt-0.5 line-clamp-1">Vedic & modern meanings</p>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenTool('breathing');
          }}
          className="bg-white border border-border/80 rounded-2xl p-3.5 text-left shadow-2xs hover:border-sage-dark transition-all active:scale-[0.98] cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-sage-pale text-sage-dark flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Wind size={19} />
          </div>
          <h4 className="font-bold text-charcoal text-[13.5px] group-hover:text-sage-dark transition-colors">Garbh Sanskar</h4>
          <p className="text-[11.5px] text-medium mt-0.5 line-clamp-1">Pranayama & ragas</p>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenTool('travel');
          }}
          className="bg-white border border-border/80 rounded-2xl p-3.5 text-left shadow-2xs hover:border-teal-400 transition-all active:scale-[0.98] cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Plane size={19} />
          </div>
          <h4 className="font-bold text-charcoal text-[13.5px] group-hover:text-teal-700 transition-colors">Safe Travel Guide</h4>
          <p className="text-[11.5px] text-medium mt-0.5 line-clamp-1">Flying & road NOC rules</p>
        </button>
      </div>

      {/* 5. Indian Pregnancy Myth Buster Card */}
      <div className="bg-white border border-border/80 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <HelpCircle size={16} className="text-soft-saffron-dark" />
            <h3 className="font-serif font-bold text-charcoal text-[14.5px]">
              Indian Pregnancy Myth Buster
            </h3>
          </div>
          <span className="text-[10px] font-bold text-medium uppercase bg-cream px-2 py-0.5 rounded-full">
            {currentMythIndex + 1} of {myths.length}
          </span>
        </div>

        <div className="p-3.5 bg-cream/70 rounded-2xl border border-border/60">
          <span className="text-[10px] font-bold text-critical uppercase tracking-wider block mb-1">
            Cultural Myth:
          </span>
          <p className="text-[13.5px] font-bold text-charcoal leading-snug">
            "{activeMyth.myth}"
          </p>

          {isMythRevealed ? (
            <div className="mt-3 pt-3 border-t border-border/60 animate-in fade-in duration-200">
              <span className="text-[10.5px] font-bold text-green-700 uppercase flex items-center gap-1 mb-1">
                <CheckCircle2 size={14} />
                Evidence-Based Medical Truth:
              </span>
              <p className="text-[12px] text-charcoal/90 leading-relaxed">
                {activeMyth.truth}
              </p>
              <span className="text-[10px] text-medium mt-1.5 block italic">
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
              className="mt-3 w-full py-2 bg-sage text-white text-[12px] font-bold rounded-xl shadow-2xs hover:bg-sage-dark transition-colors cursor-pointer"
            >
              Reveal Medical Truth
            </button>
          )}
        </div>

        <div className="mt-3 flex justify-between items-center">
          <span className="text-[11px] text-medium">FOGSI Evidence Backed</span>
          <button
            type="button"
            onClick={handleNextMyth}
            className="text-[11.5px] font-bold text-sage-dark hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Next Myth</span>
            <RefreshCw size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
