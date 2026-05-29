import React, { useState, useEffect } from 'react';
import { Bot, MessageCircle, Send, X, Sparkles, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { usePlanner } from '../store';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { isPregnancyRelated } from '../utils/pregnancyClassifier';

interface FloatingChatbotProps {
  activePage?: string;
}

const CONTEXT_GUIDES: Record<string, { greeting: string, suggestions: string[] }> = {
  tracker: {
    greeting: "Viewing your tracker? I can explain what's happening with your baby this week or help you set your due date. ✨",
    suggestions: ["What's baby's size?", "Explain Week 24", "Preeclampsia signs"]
  },
  vitals: {
    greeting: "Monitoring your vitals is so important! I can help you understand blood pressure readings or explain why we track weight. 🩺",
    suggestions: ["What is Normal BP?", "High BP symptoms", "Weight gain guide"]
  },
  foodscanner: {
    greeting: "Curious about what's safe to eat? I know all about Indian foods and pregnancy safety. 🥗",
    suggestions: ["Can I eat Papaya?", "Safe street foods", "Ragi benefits"]
  },
  kickcounter: {
    greeting: "Counting kicks is a beautiful way to bond. I can explain the 'Count to 10' rule or what to do if movement feels low. 💓",
    suggestions: ["Count to 10 rule", "Best time to count", "When to call doctor"]
  },
  finance: {
    greeting: "Planning your finances? I can explain government schemes like PMMVY or help you budget for the hospital. 🇮🇳",
    suggestions: ["PMMVY Scheme info", "JSY benefits", "Delivery costs"]
  }
};

const DEFAULT_CONTEXT = {
  greeting: "Hi! I'm Our Pregnancy AI ✨ How can I help you with your journey today?",
  suggestions: ["Food safety", "Kick counting", "BP Tracking"]
};

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ activePage }) => {
  const { state } = usePlanner();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [input, setInput] = useState('');
  const context = activePage ? (CONTEXT_GUIDES[activePage] || DEFAULT_CONTEXT) : DEFAULT_CONTEXT;

  useEffect(() => {
    // Reset or update initial message when page changes if chat is fresh
    if (messages.length <= 1) {
      setMessages([{ role: 'ai', text: context.greeting }]);
    }
  }, [activePage]);

  const handleSend = async (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();
    const textToSend = typeof e === 'string' ? e : input;
    if (!textToSend.trim()) return;

    // Add the user's message to the chat
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setInput('');

    // Fast-path client-side check to limit chatbot to pregnancy-related topics
    if (!isPregnancyRelated(textToSend)) {
      setMessages(prev => [...prev, { role: 'ai', text: "I can not help with this, please ask me something related to what I am meant for..." }]);
      return;
    }

    // Add a temporary typing indicator
    setMessages(prev => [...prev, { role: 'ai', text: "Thinking..." }]);

    try {
      // 2. Call the secure Firebase Cloud Function instead of HF directly
      const chatWithAI = httpsCallable(functions, 'chatWithAI');
      const response = await chatWithAI({ message: textToSend });
      const result = response.data as { reply: string };

      // Replace the "Thinking..." message with the actual response
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { role: 'ai', text: result.reply };
        return newMessages;
      });

    } catch (error: any) {
      console.error("AI Cloud Function Error:", error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { role: 'ai', text: `Sorry, there was an error: ${error?.message || "Unknown error"}` };
        return newMessages;
      });
    }
  };

  if (activePage === 'askourpregnancy') return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end print:hidden">
      {isOpen && (
        <div className="mb-4 w-[320px] sm:w-[360px] bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-border overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-500 ease-[0.22,1,0.36,1]">
          {/* Header */}
          <div className="bg-sage text-white p-4 flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1 opacity-20 transform translate-x-2 -translate-y-2">
              <Bot size={80} />
            </div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[15px] flex items-center gap-1.5">
                  Our Pregnancy AI
                  <Sparkles size={12} className="animate-pulse" />
                </h3>
                <div className="flex items-center gap-1.5 opacity-80 text-[10px] font-medium uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-ping" />
                  Context: {activePage || 'General'}
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors p-1 bg-white/10 rounded-full relative z-10">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="h-[340px] p-4 overflow-y-auto bg-cream flex flex-col gap-4 scroll-smooth">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[88%] p-3.5 rounded-[18px] text-[13.5px] leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300
                  ${msg.role === 'ai'
                    ? 'bg-white border border-border text-charcoal rounded-tl-sm self-start shadow-sm'
                    : 'bg-sage text-white rounded-tr-sm self-end shadow-md'}`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Contextual Suggestions */}
          <div className="px-3 pb-3 bg-cream">
            <div className="flex flex-wrap gap-2">
              {context.suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(suggestion)}
                  className="text-[11px] bg-white border border-border text-sage font-semibold px-3 py-1.5 rounded-full hover:border-sage hover:bg-sage-pale transition-all flex items-center gap-1 shadow-sm"
                >
                  {suggestion}
                  <ChevronRight size={10} />
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-border flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about ${activePage || 'your pregnancy'}...`}
              className="flex-1 bg-cream border border-border rounded-full px-5 py-2.5 text-[14px] focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-10 h-10 rounded-full bg-sage text-white flex items-center justify-center disabled:opacity-30 hover:bg-sage-dark transition-all shadow-md shrink-0 active:scale-90"
            >
              <Send size={16} className="-ml-0.5" />
            </button>
          </form>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-[0_10px_30px_rgba(107,146,120,0.4)] flex items-center justify-center text-white transition-all duration-500 hover:scale-110 
          ${isOpen ? 'bg-charcoal rotate-[360deg]' : 'bg-sage hover:bg-sage-dark hover:rotate-12'}`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              className="relative"
              initial={{ opacity: 0, scale: 0.5, rotate: 90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle size={28} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center border-2 border-sage">
                <span className="w-1 h-1 bg-sage rounded-full animate-pulse" />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};
