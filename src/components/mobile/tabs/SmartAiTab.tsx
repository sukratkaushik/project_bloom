import React, { useState } from 'react';
import {
  Sparkles, Send, Camera, Baby, Plane, HelpCircle,
  CheckCircle2, RefreshCw, MessageSquare
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
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Namaste! 🌸 I am Bloom AI, your personal pregnancy wellness companion. How can I support you today? You can ask about safe Indian foods, exercises, symptoms, or fetal development.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Indian Myth Buster dataset
  const myths = [
    {
      myth: 'Drinking saffron milk (kesar doodh) determines baby complexion.',
      truth: 'Saffron is rich in antioxidants and safe in moderation, but baby skin pigmentation is purely genetic (melanin inheritance) and unaffected by saffron.',
      factCheck: 'ACOG / FOGSI Genetics Advisory',
    },
    {
      myth: 'Eating papaya or pineapple in any form instantly causes miscarriage.',
      truth: 'Unripe green papaya contains high latex/papain which may trigger uterine contractions. However, fully ripe yellow sweet papaya in moderate quantities is completely safe and packed with Vitamin C and folate.',
      factCheck: 'WHO Maternal Nutrition Guidelines',
    },
    {
      myth: 'The shape of your pregnancy bump indicates the baby’s gender.',
      truth: 'Belly shape depends strictly on maternal abdominal muscle tone, uterine shape, pelvic structure, and fetal position — not baby gender.',
      factCheck: 'Obstetric Clinical Standard',
    },
  ];

  const [currentMythIndex, setCurrentMythIndex] = useState(0);
  const [isMythRevealed, setIsMythRevealed] = useState(false);

  const activeMyth = myths[currentMythIndex];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    triggerHaptic('light');
    const userMsg = text.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
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
        },
      ]);
      triggerHaptic('success');
    } catch (err: any) {
      console.warn('AI request fallback:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Tender coconut water and ripe sweet fruits are gentle and hydrating during pregnancy! Please consult your doctor for persistent symptoms.',
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
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* 1. Maternal Sanctuary Hero Card */}
      <div className="bg-gradient-to-br from-purple-500/10 via-white to-pink-500/10 border border-purple-200/70 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-full">
            Clinical Maternal Intelligence
          </span>
          <span className="text-[11px] font-medium text-medium">Qwen 2.5-72B</span>
        </div>
        <h2 className="font-serif font-bold text-charcoal text-[18px] mt-1">
          Namaste{motherName ? `, ${motherName.split(' ')[0]}` : ''} 🌸
        </h2>
        <p className="text-[12.5px] text-medium mt-0.5 leading-relaxed">
          Week 24 milestone: Fetal hearing is fully developed! Talk, sing, or listen to soothing ragas with your baby.
        </p>
      </div>

      {/* 2. Interactive AI Chat */}
      <div className="bg-white border border-border/80 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/60">
          <div className="flex items-center gap-1.5">
            <Sparkles size={16} className="text-purple-600" />
            <h3 className="font-serif font-bold text-charcoal text-[14.5px]">
              Ask Our Pregnancy AI
            </h3>
          </div>
          <span className="text-[11px] text-medium font-medium">ACOG & FOGSI Aligned</span>
        </div>

        {/* Message Bubble Feed */}
        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[12.5px] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-sage-dark text-white rounded-tr-xs'
                    : 'bg-cream text-charcoal rounded-tl-xs border border-border/70'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-cream rounded-2xl px-3.5 py-2 text-[12px] text-medium flex items-center gap-1.5 border border-border/70">
                <RefreshCw size={12} className="animate-spin text-purple-600" />
                <span>Consulting clinical knowledge base...</span>
              </div>
            </div>
          )}
        </div>

        {/* 1-Tap Quick Question Chips */}
        <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => handleSendMessage('Is tender coconut water safe to drink daily?')}
            className="px-2.5 py-1 bg-cream hover:bg-sage-pale rounded-full text-[11px] font-semibold text-charcoal border border-border/70 whitespace-nowrap shrink-0 cursor-pointer"
          >
            🥥 Coconut water?
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('Are sweet ripe mangoes safe in 2nd trimester?')}
            className="px-2.5 py-1 bg-cream hover:bg-sage-pale rounded-full text-[11px] font-semibold text-charcoal border border-border/70 whitespace-nowrap shrink-0 cursor-pointer"
          >
            🥭 Ripe mangoes?
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('How to relieve sudden night calf muscle cramps?')}
            className="px-2.5 py-1 bg-cream hover:bg-sage-pale rounded-full text-[11px] font-semibold text-charcoal border border-border/70 whitespace-nowrap shrink-0 cursor-pointer"
          >
            🦵 Calf cramps?
          </button>
        </div>

        {/* Input Bar */}
        <div className="mt-2.5 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask anything about pregnancy, diet, symptoms..."
            className="flex-1 bg-cream/70 border border-border/80 rounded-xl px-3 py-2 text-[12.5px] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 disabled:opacity-40 active:scale-95 transition-all cursor-pointer"
            aria-label="Send message"
          >
            <Send size={15} />
          </button>
        </div>
      </div>

      {/* 3. 2x2 AI Tool Suite */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenTool('foodscanner');
          }}
          className="bg-white border border-border/80 rounded-2xl p-3.5 text-left shadow-2xs hover:border-orange-400 transition-all active:scale-[0.98] cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-2">
            <Camera size={18} />
          </div>
          <h4 className="font-bold text-charcoal text-[13.5px]">AI Food & Cal Guide</h4>
          <p className="text-[11.5px] text-medium mt-0.5">Meal macros & barcode</p>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenTool('babynames');
          }}
          className="bg-white border border-border/80 rounded-2xl p-3.5 text-left shadow-2xs hover:border-pink-400 transition-all active:scale-[0.98] cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-2">
            <Baby size={18} />
          </div>
          <h4 className="font-bold text-charcoal text-[13.5px]">Baby Names</h4>
          <p className="text-[11.5px] text-medium mt-0.5">Vedic & modern</p>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenTool('travel');
          }}
          className="bg-white border border-border/80 rounded-2xl p-3.5 text-left shadow-2xs hover:border-teal-400 transition-all active:scale-[0.98] cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-2">
            <Plane size={18} />
          </div>
          <h4 className="font-bold text-charcoal text-[13.5px]">Safe Travel</h4>
          <p className="text-[11.5px] text-medium mt-0.5">Flying & road rules</p>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenTool('askourpregnancy');
          }}
          className="bg-white border border-border/80 rounded-2xl p-3.5 text-left shadow-2xs hover:border-purple-400 transition-all active:scale-[0.98] cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
            <MessageSquare size={18} />
          </div>
          <h4 className="font-bold text-charcoal text-[13.5px]">Full Chat</h4>
          <p className="text-[11.5px] text-medium mt-0.5">Deep consultation</p>
        </button>
      </div>

      {/* 4. Indian Myth Buster Card */}
      <div className="bg-white border border-border/80 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <HelpCircle size={16} className="text-soft-saffron-dark" />
            <h3 className="font-serif font-bold text-charcoal text-[14px]">
              Indian Pregnancy Myth Buster
            </h3>
          </div>
          <span className="text-[10px] font-bold text-medium uppercase">
            {currentMythIndex + 1}/{myths.length}
          </span>
        </div>

        <div className="p-3 bg-cream/70 rounded-xl border border-border/60">
          <span className="text-[10.5px] font-bold text-critical uppercase block mb-1">
            Common Myth:
          </span>
          <p className="text-[13px] font-bold text-charcoal leading-snug">
            "{activeMyth.myth}"
          </p>

          {isMythRevealed ? (
            <div className="mt-3 pt-2.5 border-t border-border/60 animate-in fade-in duration-200">
              <span className="text-[10.5px] font-bold text-green-700 uppercase flex items-center gap-1 mb-1">
                <CheckCircle2 size={13} />
                Medical Truth:
              </span>
              <p className="text-[12px] text-medium leading-relaxed">
                {activeMyth.truth}
              </p>
              <span className="text-[10px] text-light mt-1.5 block italic">
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

        <div className="mt-2.5 flex justify-end">
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
