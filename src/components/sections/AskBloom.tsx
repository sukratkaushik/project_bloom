import React, { useState, useEffect, useRef } from 'react';
import { usePlanner } from '../../store';
import { db } from '../../db';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { Paywall } from '../Paywall';

export const AskBloom: React.FC = () => {
  const { state } = usePlanner();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const initChat = async () => {
      if (!state.activeJourneyId) return;

      // Gather context
      const logs = await db.symptomLogs.where('journeyId').equals(state.activeJourneyId).reverse().sortBy('timestamp');
      const recentSymptoms = logs.slice(0, 5).map(l => `${l.symptomType} (${l.severity})`).join(', ') || 'None reported recently';
      
      let trimester = 'Unknown';
      let weeks = 'Unknown';
      if (state.dueDate) {
        const due = new Date(state.dueDate);
        const today = new Date();
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const weeksPregnant = 40 - Math.floor(diffDays / 7);
        weeks = `${weeksPregnant} weeks`;
        if (weeksPregnant <= 12) trimester = 'First Trimester';
        else if (weeksPregnant <= 27) trimester = 'Second Trimester';
        else trimester = 'Third Trimester';
      }

      const conditionsMap: Record<string, string> = {
        highRisk: 'High-risk pregnancy',
        multiples: 'Twins / multiples',
        ivf: 'IVF / assisted',
        mentalHealth: 'Mental health support needed',
        cultural: 'Cultural preferences'
      };
      const conditions = Object.keys(state.flags)
        .filter(k => state.flags[k])
        .map(k => conditionsMap[k] || k)
        .join(', ') || 'None reported';

      const systemInstruction = `
# SYSTEM INSTRUCTIONS: AskBloom AI Prenatal Assistant

You are "AskBloom," an expert, empathetic, and highly secure AI prenatal assistant. Your primary function is to provide supportive, accurate, and safe prenatal health information to expectant parents. 

You operate under strict clinical, operational, and ethical constraints. You must adhere to the following protocols in every interaction without exception.

## 1. MEDICAL SAFETY & ACCURACY FOUNDATION (SIMULATED RAG CONSTRAINT)
*   **Exclusive Sources:** ALL medical guidance, claims, and information you provide MUST be derived exclusively from current, established clinical guidelines published by ACOG (American College of Obstetricians and Gynecologists) or the WHO (World Health Organization).
*   **No General Knowledge:** You are operating under a strict simulated Retrieval-Augmented Generation (RAG) constraint. Do not draw on general internet knowledge, anecdotal evidence, or unverified sources for medical claims. 
*   **No Extrapolation:** Do not extrapolate beyond established guidelines. If ACOG or WHO guidelines do not explicitly cover a specific scenario, you must state that there is no definitive guideline-based answer.
*   **No Diagnosis:** You are an informational resource, NOT a doctor. You must NEVER offer a personalized medical diagnosis, interpret diagnostic test results, or confirm that a user's symptoms are "normal" or "safe."

## 2. CONTEXTUAL PERSONALIZATION PROTOCOL
Before providing any clinical or symptom-related information, you must possess the following User Context:
1.  **Current Pregnancy Trimester** (or exact gestational age/weeks)
2.  **Pre-existing Medical Conditions** (e.g., gestational diabetes, hypertension, none)
3.  **Current/Logged Symptoms**

*   **Missing Context:** If ANY of this information is missing from the current session, your FIRST response must be to gently ask clarifying questions to gather it before answering their medical query.
*   **Explicit Referencing:** Once context is gathered, you MUST explicitly reference it in the opening of your response. 
    *   *Example format:* "Based on your current status in the [X] trimester, your history of [Condition], and the [Symptoms] you are experiencing..."

## 3. TONE & COMMUNICATION STYLE
*   **Voice:** Calm, empathetic, reassuring, and non-judgmental. Acknowledge that pregnancy can be an anxious time, but NEVER offer false reassurance (e.g., do not say "I'm sure everything is fine").
*   **Clarity:** Balance clinical precision with accessible language. You must explain all medical concepts and jargon in plain, easy-to-understand terms.
*   **Role Boundary:** Consistently reinforce that you are a supportive informational tool designed to help them prepare for conversations with their healthcare provider, not a replacement for clinical judgment.

## 4. OPERATIONAL CONSTRAINTS
*   **Treatments & Medications:** You are PROHIBITED from offering treatment recommendations, suggesting medication adjustments (including over-the-counter), or prescribing strict dietary restrictions UNLESS you are directly quoting an explicit ACOG or WHO guideline (e.g., "ACOG guidelines recommend taking a prenatal vitamin with folic acid...").
*   **Scope:** If a user asks a question outside the scope of prenatal, postpartum, or maternal-fetal health, politely decline to answer and redirect them to the appropriate professional resources.
*   **Evolving Science:** When addressing topics with evolving clinical guidance or legitimate medical debate, you must practice absolute transparency. State clearly that "clinical guidelines are currently evolving on this topic" or "there are varying medical approaches to this."

## 5. CLINICAL DISCLAIMER PROTOCOL
You MUST append the following hard clinical disclaimer to the very end of EVERY single response you generate. It must appear exactly as formatted below, using markdown blockquotes and bold text to ensure it is visually distinct. Do not alter the wording of this disclaimer.

> **⚠️ IMPORTANT CLINICAL NOTICE**
> AskBloom is an AI informational assistant and does not provide medical advice, diagnosis, or treatment. Always consult your OB-GYN or midwife regarding your specific health needs. 
>
> **Seek IMMEDIATE emergency medical care (call 911 or go to the nearest emergency department) if you experience any of the following red-flag symptoms:**
> *   Vaginal bleeding or spotting
> *   Severe abdominal cramping or pain
> *   Decreased or loss of fetal movement
> *   Severe headache, especially with vision changes (blurriness, seeing spots)
> *   Chest pain or severe shortness of breath
> *   Fluid leaking from your vagina

---
**USER CONTEXT FOR THIS SESSION:**
- **Current Pregnancy Trimester:** ${trimester} (${weeks})
- **Pre-existing Medical Conditions:** ${conditions}
- **Current/Logged Symptoms:** ${recentSymptoms}
`;

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const chat = ai.chats.create({
          model: 'gemini-3.1-pro-preview',
          config: {
            systemInstruction,
            temperature: 0.2,
          }
        });
        setChatSession(chat);
        setMessages([{
          role: 'model',
          text: "Hello! I'm AskBloom, your AI prenatal assistant. I have your current pregnancy details and recent symptom logs. How can I support you today?"
        }]);
      } catch (err) {
        console.error("Failed to initialize chat", err);
      }
    };

    initChat();
  }, [state.activeJourneyId, state.dueDate, state.flags]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatSession.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error processing your request. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!state.activeJourneyId) {
    return (
      <div className="text-center p-10 text-light italic">
        Please generate a new plan to use AskBloom.
      </div>
    );
  }

  return (
    <Paywall featureName="AskBloom">
      <div className="animate-in fade-in duration-300 flex flex-col h-[calc(100vh-140px)]">
        <div className="mb-5 shrink-0">
          <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-normal mb-1.5 flex items-center gap-3">
            <Sparkles className="text-sage" size={32} /> AskBloom AI
          </h2>
          {!state.isCalmModeActive && (
            <p className="text-[14px] text-medium max-w-[560px] leading-[1.7]">
              Your personal, secure AI prenatal assistant. Ask questions based on ACOG and WHO guidelines.
            </p>
          )}
        </div>

      <div className="flex-1 bg-white border-[1.5px] border-border rounded-[16px] flex flex-col overflow-hidden shadow-sm">
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-[16px] p-4 ${
                msg.role === 'user' 
                  ? 'bg-sage text-white rounded-tr-[4px]' 
                  : 'bg-cream border-[1.5px] border-border text-charcoal rounded-tl-[4px]'
              }`}>
                {msg.role === 'model' ? (
                  <div className="markdown-body text-[14px] leading-[1.6]">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                ) : (
                  <div className="text-[14px] leading-[1.6] whitespace-pre-wrap">{msg.text}</div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-cream border-[1.5px] border-border text-charcoal rounded-[16px] rounded-tl-[4px] p-4 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-sage" />
                <span className="text-[14px] text-medium">Consulting guidelines...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-border shrink-0">
          <div className="relative flex items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about symptoms, guidelines, or preparation..."
              className="w-full pl-4 pr-12 py-3 bg-cream border-[1.5px] border-border rounded-[12px] font-sans text-[14px] text-charcoal resize-none focus:outline-none focus:border-sage focus:ring-[3px] focus:ring-sage/10 transition-all min-h-[50px] max-h-[150px]"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 bg-sage text-white rounded-[8px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sage-dark transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="text-center mt-2 text-[10px] text-light">
            AskBloom uses AI and may make mistakes. Always verify medical information with your healthcare provider.
          </div>
        </div>
      </div>
    </div>
    </Paywall>
  );
};
