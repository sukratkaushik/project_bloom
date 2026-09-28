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
        systemPrompt: `You are Bloom AI, a warm, culturally attuned, evidence-based obstetric companion for Indian and South Asian mothers. Always give balanced, reassuring, medical-board aligned advice.`,
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
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Tender coconut water, soaked almonds, and ripe sweet fruits are gentle and hydrating! Please consult Dr. Priya for persistent symptoms.',
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
      <div className="bg-gradient-to-r from-orange-500/10 via-white to-amber-500/10 border border-orange-200/80 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded-full inline-block mb-1">
              AI Vision & Barcode
            </span>
            <h3 className="font-serif font-bold text-charcoal text-[15.5px] leading-tight truncate">
              AI Food & Calorie Guide
            </h3>
            <p className="text-[12px] text-medium mt-0.5 truncate">
              Instant meal calories, FOGSI vitamins, and trimester safety.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              onOpenTool('foodscanner');
            }}
            className="w-11 h-11 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-xs hover:bg-orange-700 active:scale-95 transition-all shrink-0 cursor-pointer"
            aria-label="Scan Meal"
          >
            <Camera size={20} />
          </button>
        </div>

        <div className="mt-3 pt-2.5 border-t border-orange-200/60 flex items-center justify-between text-[11.5px]">
          <span className="text-orange-800 font-semibold flex items-center gap-1">
            <ShieldCheck size={13} /> Trimester Safety Index
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
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles size={15} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-charcoal text-[14px] leading-tight">
                Ask Bloom AI Companion
              </h3>
              <span className="text-[10px] text-medium">Powered by Qwen 2.5-72B</span>
            </div>
          </div>
          <span className="text-[9.5px] font-bold text-sage-dark bg-sage-pale px-2 py-0.2 rounded-full">
            Online
          </span>
        </div>

        {/* Message Bubble Stream */}
        <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-[12px] leading-relaxed shadow-2xs ${
                  m.sender === 'user'
                    ? 'bg-sage-dark text-white rounded-tr-xs'
                    : 'bg-cream text-charcoal rounded-tl-xs border border-border/70'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-light mt-0.5 px-1">{m.time}</span>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-cream rounded-2xl px-3 py-1.5 text-[11.5px] text-medium flex items-center gap-1.5 border border-border/70">
                <RefreshCw size={12} className="animate-spin text-purple-600" />
                <span>Consulting clinical knowledge base...</span>
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
            className="flex-1 h-9 bg-cream/70 border border-border/80 rounded-xl px-3 text-[12px] text-charcoal placeholder:text-light focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 disabled:opacity-40 active:scale-95 transition-all cursor-pointer shadow-xs"
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
          className="h-24 bg-white border border-border/80 rounded-2xl p-3 text-left shadow-2xs hover:border-orange-400 transition-all active:scale-[0.98] cursor-pointer group flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Camera size={17} />
          </div>
          <div>
            <h4 className="font-bold text-charcoal text-[13px] leading-tight truncate group-hover:text-orange-700 transition-colors">
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
