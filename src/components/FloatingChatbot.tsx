import React, { useState } from 'react';
import { Bot, MessageCircle, Send, X } from 'lucide-react';

export const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Hi! I'm Bloom AI ✨ How can I help you with your pregnancy journey today?" }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: "That's a great question! I am here to help you navigate your journey. Feel free to use the AskBloom feature in the dashboard for a full-screen, in-depth conversation grounded in WHO guidelines." }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end print:hidden">
      {isOpen && (
        <div className="mb-4 w-[320px] sm:w-[360px] bg-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-border overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-sage text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[15px]">Bloom AI</h3>
                <p className="text-[11px] opacity-80">Quick answers anytime</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors p-1">
              <X size={20} />
            </button>
          </div>

          <div className="h-[320px] p-4 overflow-y-auto bg-cream flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div key={i} className={`max-w-[85%] p-3 rounded-[16px] text-[14px] leading-relaxed ${msg.role === 'ai' ? 'bg-white border border-border text-charcoal rounded-tl-sm self-start shadow-sm' : 'bg-sage text-white rounded-tr-sm self-end shadow-sm'}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-border flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-cream border border-border rounded-full px-4 py-2.5 text-[14px] focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
            />
            <button type="submit" disabled={!input.trim()} className="w-10 h-10 rounded-full bg-sage text-white flex items-center justify-center disabled:opacity-50 hover:bg-sage-dark transition-colors shrink-0">
              <Send size={16} className="-ml-0.5" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-[0_8px_25px_rgba(107,146,120,0.5)] flex items-center justify-center text-white transition-all duration-300 hover:scale-110 ${isOpen ? 'bg-charcoal rotate-90' : 'bg-sage hover:bg-sage-dark'}`}
      >
        {isOpen ? <X size={24} className="-rotate-90" /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};
