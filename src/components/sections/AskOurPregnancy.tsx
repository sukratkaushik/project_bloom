import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePlanner } from '../../store';
import { db } from '../../db';
import Markdown from 'react-markdown';
import { Send, Loader2, Sparkles, Paperclip, X } from 'lucide-react';
import { Paywall } from '../Paywall';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';
import { isPregnancyRelated } from '../../utils/pregnancyClassifier';

export const AskOurPregnancy: React.FC = () => {
  const { state } = usePlanner();
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: "Hello! I'm AskOurPregnancy, your AI prenatal assistant. I have your current pregnancy details and recent symptom logs. How can I support you today?" }
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
# SYSTEM INSTRUCTIONS: AskOur Pregnancy AI Prenatal Assistant

You are "AskOurPregnancy," the built-in AI prenatal assistant for the "Project Bloom" / "Our Pregnancy" application. Your primary function is to provide supportive, accurate, and safe prenatal health information to expectant parents. 

CRITICAL RULE: You are the native AI for this pregnancy app. NEVER recommend that the user "download a pregnancy app" or "use an app to track growth" — they are already using your app! You have direct access to their gestational age in the context below, so use it to directly answer questions about baby size, development, and milestones.

You operate under strict clinical, operational, and ethical constraints. You must adhere to the following protocols in every interaction without exception.

## 1. MEDICAL SAFETY & ACCURACY FOUNDATION
*   **Exclusive Sources:** ALL medical guidance and claims MUST be derived from established clinical guidelines (ACOG, WHO, etc.).
*   **Fetal Development:** If asked about fetal size or development, use the "Current Pregnancy Trimester" and gestational age provided in the context below to give an accurate, standard milestone description (e.g., fruit sizes, development stages).
*   **No Diagnosis:** You are an informational resource, NOT a doctor. You must NEVER offer a personalized medical diagnosis.

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
> AskOurPregnancy is an AI informational assistant and does not provide medical advice, diagnosis, or treatment. Always consult your OB-GYN or midwife regarding your specific health needs. 
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
      const response = await chatWithAI({ message: finalPrompt, systemPrompt: systemContext });
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
        Please generate a new plan to use AskOurPregnancy.
      </div>
    );
  }

  return (
    <Paywall featureName="AskOurPregnancy">
      <div className="animate-in fade-in duration-300 flex flex-col h-[calc(100vh-140px)]">
        <div className="mb-5 shrink-0">
          <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-normal mb-1.5 flex items-center gap-3">
            <Sparkles className="text-sage" size={32} /> AskOur Pregnancy AI
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
                <div className={`max-w-[85%] rounded-[16px] p-4 ${msg.role === 'user'
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
                  <span className="text-[14px] text-medium">{loadingText}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-border shrink-0">
            {/* File Attachment Indicator */}
            {attachedFile && (
              <div className="mb-2 inline-flex items-center gap-2 bg-sage-pale text-sage px-3 py-1.5 rounded-full text-[12px] font-medium border border-sage/20">
                <Paperclip size={14} />
                <span className="truncate max-w-[200px]">{attachedFile.name}</span>
                <button onClick={() => setAttachedFile(null)} className="hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
            )}

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
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="absolute left-2 p-2 text-sage hover:bg-sage-pale rounded-[8px] disabled:opacity-50 transition-colors"
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
                placeholder="Ask about symptoms, or attach a document..."
                className="w-full pl-12 pr-12 py-3 bg-cream border-[1.5px] border-border rounded-[12px] font-sans text-[14px] text-charcoal resize-none focus:outline-none focus:border-sage focus:ring-[3px] focus:ring-sage/10 transition-all min-h-[50px] max-h-[150px]"
                rows={1}
              />

              <button
                onClick={handleSend}
                disabled={(!input.trim() && !attachedFile) || isLoading}
                className="absolute right-2 p-2 bg-sage text-white rounded-[8px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sage-dark transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="text-center mt-2 text-[10px] text-light">
              AskOurPregnancy uses AI and may make mistakes. Always verify medical information with your healthcare provider.
            </div>
          </div>
        </div>
      </div>
    </Paywall>
  );
};
