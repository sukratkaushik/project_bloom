import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePlanner } from '../../store';
import { db } from '../../db';
import Markdown from 'react-markdown';
import { Send, Loader2, Sparkles, Paperclip, X, ShieldCheck } from 'lucide-react';
import { Paywall } from '../Paywall';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';
import { isPregnancyRelated } from '../../utils/pregnancyClassifier';
import { AiConsentPrompt, isAiConsentBlocked } from '../AiConsentPrompt';

export const AskOurPregnancy: React.FC = () => {
  const { state } = usePlanner();
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: "Hello! I'm Bloom AI, your AI prenatal assistant. I have your current pregnancy details and recent symptom logs. How can I support you today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Consulting guidelines...");
  const [systemContext, setSystemContext] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const gatherContext = async () => {
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
# SYSTEM INSTRUCTIONS: Bloom AI Prenatal Assistant

You are "Bloom AI," the warm, knowledgeable, and empathetic AI prenatal assistant for the "Our Pregnancy" application.
Your goal is to provide supportive, accurate, practical, and safe prenatal health information to expectant parents based on established guidelines (ACOG, WHO, NHS, RCOG).

## CRITICAL CAPABILITIES & CONTEXT
- You have direct access to the user's journey context:
  * Current Trimester & Gestation: ${trimester} (${weeks})
  * Known Conditions: ${conditions}
  * Recent Logged Symptoms: ${recentSymptoms}
- Use this context naturally in your responses without requiring the user to repeat themselves.
- You answer all questions related to pregnancy, trimesters, gestational weeks, travel safety (e.g. flying/driving in 3rd trimester/8th month), exercises, nutrition & food safety, fetal development, labor preparation, emotional well-being, baby care, and postpartum recovery.

## COMMUNICATION STYLE & CLINICAL FORMAT (MANDATORY TO PREVENT VAGUE OUTPUT)
- Never output vague conversational fluff. Always ground responses in authoritative obstetric consensus (FOGSI, ACOG, WHO).
- Structure responses into concise, readable markdown sections:
  * **### 📋 Clinical Summary**: Immediate 1-2 sentence direct answer.
  * **### 🔬 Physiological Rationale & Guidance**: Bulleted, precise explanation citing maternal/fetal mechanisms.
  * **### 💡 Practical Maternal Recommendations**: Clear daily portions, timing, dosages, or actionable safe steps.
  * **### ⚠️ When to Consult Your Doctor**: Red flags or specific symptoms requiring physical triage.
- Keep bullet points crisp, high-signal, and easy to skim.

## SAFETY, DISCLAIMER & INDIAN LAW COMPLIANCE (PCPNDT ACT, 1994)
- **STRICT PROHIBITION ON FETAL SEX DETERMINATION:** Under Indian Law (The Pre-Conception and Pre-Natal Diagnostic Techniques - PCPNDT Act, 1994), prenatal sex determination or disclosure of fetal sex/gender is strictly prohibited. You must NEVER predict, guess, determine, or reveal the sex or gender of the baby under any circumstances (including theories like nub theory, ramzi theory, heart rate myths, or ultrasound interpretations). If asked, politely refuse and state that sex determination is strictly illegal under the PCPNDT Act, 1994.
- You provide educational and supportive information, not a clinical prescription or diagnosis.
- End your response with a brief one-line note: 
  *Note: Bloom AI provides prenatal informational guidance based on ACOG/FOGSI/WHO standards. Always check with your doctor for personal medical advice.*
`;

      setSystemContext(systemInstruction);
    };

    gatherContext();
  }, [state.activeJourneyId, state.dueDate, state.flags]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf" || file.type === "text/plain") {
        setAttachedFile(file);
      } else {
        alert("Please select a PDF or Text file.");
      }
    }
  };

  const readBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip the data:application/pdf;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const readText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachedFile) || isLoading) return;

    if (isAiConsentBlocked(state.aiProcessingConsent)) {
      setMessages(prev => [...prev, {
        role: 'model',
        text: "AI processing is currently turned off in your settings. Turn on AI features in your Profile to use this."
      }]);
      return;
    }

    let userMsg = input.trim() || "Please analyze this document.";

    // Optimistically show user message (without huge text dump)
    setMessages(prev => [...prev, {
      role: 'user',
      text: attachedFile ? `📎 ${attachedFile.name}\n\n${userMsg}` : userMsg
    }]);

    setInput('');

    // Fast-path client-side check to limit chatbot to pregnancy-related topics
    if (!isPregnancyRelated(userMsg)) {
      setMessages(prev => [...prev, { role: 'model', text: "I can not help with this, please ask me something related to what I am meant for..." }]);
      return;
    }

    setIsLoading(true);

    try {
      let finalPrompt = userMsg;

      if (attachedFile) {
        setLoadingText("Reading document...");
        let documentText = "";

        if (attachedFile.type === "application/pdf") {
          const base64Data = await readBase64(attachedFile);
          const parseDocument = httpsCallable(functions, 'parseDocument');
          const parseResponse = await parseDocument({ base64Data, fileName: attachedFile.name });
          documentText = (parseResponse.data as any).text;
        } else {
          documentText = await readText(attachedFile);
        }

        finalPrompt = `${userMsg}\n\n--- ATTACHED DOCUMENT: ${attachedFile.name} ---\n\n${documentText}`;
        setAttachedFile(null); // Clear attachment after reading
      }

      setLoadingText("Consulting guidelines...");
      const chatWithAI = httpsCallable(functions, 'chatWithAI');
      const response = await chatWithAI({ message: finalPrompt, systemPrompt: systemContext, dueDate: state.dueDate });
      const result = response.data as { reply: string };

      setMessages(prev => [...prev, { role: 'model', text: result.reply }]);
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error connecting to the AI. " + (error?.message || "Please try again.") }]);
    } finally {
      setIsLoading(false);
      setLoadingText("Consulting guidelines...");
    }
  };

  if (!state.activeJourneyId) {
    return (
      <div className="text-center p-10 text-light italic">
        Please generate a new plan to use Bloom AI.
      </div>
    );
  }

  return (
    <Paywall featureName="AskOurPregnancy">
      <div className="animate-in fade-in duration-300 flex flex-col h-[calc(100vh-140px)]">
        <div className="mb-5 shrink-0">
          <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-normal mb-1.5 flex items-center gap-3">
            <Sparkles className="text-sage" size={32} /> Bloom AI
          </h2>
          <p className="text-[14px] text-medium max-w-[560px] leading-[1.7]">
            Your personal, secure AI prenatal assistant. Ask questions based on ACOG and WHO guidelines.
          </p>
        </div>

        <div className="flex-1 bg-white border-[1.5px] border-border rounded-[16px] flex flex-col overflow-hidden shadow-sm">
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'user' ? (
                  <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-xs bg-sage text-white p-3.5 sm:p-4 text-[13.5px] leading-relaxed shadow-3xs">
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                ) : (
                  <div className="max-w-[95%] sm:max-w-[82%] rounded-2xl rounded-tl-xs bg-white border border-border/90 p-4 sm:p-5 shadow-xs border-l-4 border-l-sage space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                      <div className="flex items-center gap-1.5 text-sage-dark font-bold text-[11px] uppercase tracking-wider">
                        <Sparkles size={13} className="text-sage" />
                        <span>Clinical Advisory</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                        FOGSI & ACOG Aligned
                      </span>
                    </div>

                    <div className="markdown-body text-[13.5px] leading-relaxed text-charcoal/95 space-y-1.5 prose-headings:font-serif prose-headings:font-bold prose-headings:text-charcoal prose-h3:text-[14px] prose-h3:mt-3 prose-h3:mb-1 prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                      <Markdown>{msg.text}</Markdown>
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10.5px] text-medium">
                      <span className="flex items-center gap-1">
                        <ShieldCheck size={12} className="text-sage" /> Evidence-based guidance
                      </span>
                      <span className="text-[10px] text-light">Verify with OB-GYN</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-border/90 text-charcoal rounded-2xl rounded-tl-xs p-4 flex items-center gap-2.5 shadow-xs border-l-4 border-l-sage">
                  <Loader2 size={16} className="animate-spin text-sage" />
                  <span className="text-[13px] text-medium font-medium">{loadingText}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 sm:p-4 bg-white border-t border-border/80 shrink-0">
            {/* Quick Consultation Chips */}
            <div className="mb-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[
                '🥥 Coconut water in pregnancy',
                '🦵 Relieving nocturnal leg cramps',
                '🩺 Normal vs warning contractions',
                '🥬 Top iron-rich vegetarian foods',
                '🍵 Safe herbal teas during 3rd trimester'
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setInput(chip)}
                  className="h-7 px-2.5 bg-cream hover:bg-sage-pale text-charcoal border border-border/80 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* File Attachment Indicator */}
            {attachedFile && (
              <div className="mb-2 inline-flex items-center gap-2 bg-sage-pale text-sage px-3 py-1.5 rounded-full text-[12px] font-medium border border-sage/20">
                <Paperclip size={14} />
                <span className="truncate max-w-[200px]">{attachedFile.name}</span>
                <button onClick={() => setAttachedFile(null)} className="hover:text-red-500 transition-colors cursor-pointer">
                  <X size={14} />
                </button>
              </div>
            )}

            {isAiConsentBlocked(state.aiProcessingConsent) ? (
              <div className="py-2">
                <AiConsentPrompt />
              </div>
            ) : (
              <div className="relative flex items-center">
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.txt"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="absolute left-2.5 p-2 text-sage hover:bg-sage-pale rounded-xl disabled:opacity-50 transition-colors cursor-pointer"
                  title="Attach Document (PDF or Text)"
                >
                  <Paperclip size={18} />
                </button>

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask about diet, scans, symptoms, or attach a report..."
                  className="w-full pl-12 pr-12 py-3 bg-cream/50 border border-border/90 rounded-2xl font-sans text-[13.5px] text-charcoal resize-none focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 transition-all min-h-[48px] max-h-[140px]"
                  rows={1}
                />

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={(!input.trim() && !attachedFile) || isLoading}
                  className="absolute right-2.5 p-2 bg-sage text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sage-dark transition-all cursor-pointer shadow-3xs"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            )}
            <div className="text-center mt-2 text-[10.5px] text-light">
              Bloom AI cross-references FOGSI & ACOG prenatal guidelines. Always consult your obstetrician for personal medical care.
            </div>
          </div>
        </div>
      </div>
    </Paywall>
  );
};
