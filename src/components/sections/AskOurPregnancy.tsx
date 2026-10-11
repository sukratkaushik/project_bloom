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
import { triggerHaptic } from '../../utils/nativeBridge';

function getLocalClinicalGuidance(query: string, weekStr: string): string {
  const q = query.toLowerCase();

  if (q.includes('coconut')) {
    return `### 📋 Clinical Summary
Tender coconut water is safe, hydrating, and clinically recommended across all trimesters.

### 🔬 Physiological Benefits
- **Natural Electrolyte Balance:** Rich in potassium, magnesium, and sodium to help prevent dehydration, maternal fatigue, and leg cramps.
- **Acidity & Heartburn Relief:** Its mild alkaline nature helps soothe gastric irritation and morning nausea.
- **Amniotic Fluid Support:** Daily hydration directly supports healthy blood volume expansion and amniotic fluid index (AFI).

### 💡 Safe Intake & Practical Tips
- **Recommended Portion:** 1 fresh green coconut (250–300 ml) daily, best consumed fresh in the morning or midday.
- **Clinical Note:** If you are monitoring Gestational Diabetes (GDM), account for ~6g of natural carbs per cup.`;
  }

  if (q.includes('mango')) {
    return `### 📋 Clinical Summary
Naturally ripened sweet mangoes are safe and nutritious when eaten in moderation.

### 🔬 Physiological Benefits
- **Vitamins A & C:** Supports fetal vision development, skin integrity, and maternal immune defense.
- **Dietary Fiber:** Helps regulate bowel movements and prevent common pregnancy constipation.

### 💡 Safe Intake & Practical Tips
- **Recommended Portion:** 1/2 to 1 medium ripe mango per day (approx. 100–150g), preferably alongside protein or fiber.
- **What to Avoid:** Avoid raw or unripe mangoes in large quantities due to latex and papain content. Wash thoroughly before peeling.
- **Clinical Note:** If managing Gestational Diabetes, consult your dietitian for carbohydrate pairing.`;
  }

  if (q.includes('cramp') || q.includes('leg')) {
    return `### 📋 Clinical Summary
Nocturnal leg cramps are very common, especially in the 2nd and 3rd trimesters, usually due to circulatory shifts and mineral balance.

### 🔬 Immediate Relief
- **Active Dorsiflexion:** Immediately pull your toes and foot upward toward your shin to stretch the calf muscle.
- **Gentle Massage & Warmth:** Massage the calf muscle with upward strokes or apply a warm compress.

### 💡 Preventive Care & Red Flags
- Stay well-hydrated and include magnesium-rich foods (almonds, pumpkin seeds, leafy greens) or prenatal supplements.
- **Red Flag:** Seek immediate physical triage if you notice persistent one-sided calf pain, redness, or heat, to rule out deep vein thrombosis (DVT).`;
  }

  if (q.includes('braxton') || q.includes('contraction')) {
    return `### 📋 Clinical Summary
Understanding the difference between false labor (Braxton Hicks) and true labor contractions is key to timely hospital arrival.

### 🔬 Key Differences
- **Braxton Hicks:** Irregular, sporadic, do not increase in intensity, often ease when you change position, drink water, or rest.
- **True Labor Contractions:** Regular, progressively closer together, longer in duration, and consistently stronger regardless of movement.

### 💡 The 5-1-1 Rule
- Head to the hospital when contractions are **5 minutes apart**, each lasting **1 minute**, for at least **1 hour** (or earlier if your doctor advised).
- **Urgent Signs:** Immediately contact triage if you experience bleeding, sudden fluid leakage (rupture of membranes), or severe unremitting pain.`;
  }

  if (q.includes('iron') || q.includes('spinach') || q.includes('food') || q.includes('diet') || q.includes('veg')) {
    return `### 📋 Clinical Summary
A balanced iron- and micronutrient-rich diet is critical to support your expanding red blood cell volume and fetal development.

### 🔬 Top Nutrient-Dense Choices
- **Vegetarian Iron Sources:** Palak (spinach), methi (fenugreek leaves), moringa (drumstick leaves), chickpeas, lentils (dal), and roasted chana.
- **Vitamin C Pairing:** Squeeze fresh lemon juice over cooked lentils or eat an amla/orange to significantly enhance non-heme iron absorption.
- **Calcium Timing:** Avoid consuming calcium supplements, milk, or tea at the exact same meal as iron, as they inhibit iron absorption.

### 💡 Practical Advice
- Maintain adequate hydration (2.5–3 liters daily) and eat small, frequent meals to avoid acid reflux.`;
  }

  if (q.includes('travel') || q.includes('fly') || q.includes('flight') || q.includes('trip') || q.includes('car')) {
    return `### 📋 Clinical Summary
Travel is generally safest during the second trimester (14–28 weeks) when nausea has subsided and energy levels are highest.

### 🔬 Travel Guidelines
- **Domestic Flying:** Most commercial airlines allow travel up to 36 weeks for uncomplicated single pregnancies (obtain a doctor's fit-to-fly certificate after 28 weeks).
- **In-Transit Care:** Walk every 60–90 minutes to promote lower-limb circulation and wear graduated compression stockings.
- **Vehicle Seatbelts:** Place the lap belt flat under your baby bump across your pelvic bone, never across the dome of your uterus.

### 💡 Before You Go
- Keep a digital or physical copy of your latest antenatal card, blood group records, and obstetrician's contact.`;
  }

  if (q.includes('papaya')) {
    return `### 📋 Clinical Summary
Fully ripe yellow papaya is safe in moderation. However, raw or semi-ripe green papaya should be avoided.

### 🔬 Clinical Rationale
- **Raw / Semi-Ripe Papaya:** Contains latex and papain enzymes that can stimulate uterine contractions and prostaglandins.
- **Fully Ripe Papaya:** Rich in carotenoids, Vitamin C, and antioxidants; safe to consume in small, fresh portions once peeled.`;
  }

  if (q.includes('saffron') || q.includes('kesar')) {
    return `### 📋 Clinical Summary
Culinary amounts of saffron (1–2 strands in warm milk) are safe, soothing, and culturally traditional.

### 🔬 Clinical Truth
- Saffron contains mild antioxidants and promotes relaxation.
- It does **not** alter fetal skin complexion, which is determined purely by parental genetics.
- Avoid large pharmaceutical doses or saffron extracts during pregnancy.`;
  }

  if (q.includes('scan') || q.includes('ultrasound') || q.includes('tiffa') || q.includes('nt')) {
    return `### 📋 Clinical Summary
Standard ultrasound scans provide critical anatomical and developmental confirmation for maternal reassurance.

### 🔬 Standard Scan Milestones
- **Dating / Viability Scan (6–9 weeks):** Confirms intrauterine gestational sac, fetal heart activity, and EDD.
- **NT Scan (11–13+6 weeks):** Measures nuchal translucency and nasal bone to assess chromosomal baselines.
- **Level II / TIFFA Anomaly Scan (18–20 weeks):** Detailed anatomical evaluation of all fetal organs, spine, brain, and placenta location.
- **Growth & Doppler Scans (28–36 weeks):** Assesses fetal estimated weight (EFW), amniotic fluid index (AFI), and placental blood flow.`;
  }

  return `### 📋 Clinical Guidance (${weekStr !== 'Unknown' ? weekStr : 'Pregnancy'})
Here is evidence-based clinical guidance aligned with prenatal obstetric standards:

### 🔬 Key Recommendations
- **Rest & Hydration:** Maintain a daily intake of 2.5–3 liters of water and restorative rest.
- **Balanced Nutrition:** Prioritize protein, whole grains, and fresh seasonal vegetables.
- **Routine Monitoring:** Keep track of fetal movement (after 28 weeks, count at least 10 movements within 2 hours of quiet rest).

### 💡 Next Steps
- Bring any persistent questions to your next scheduled antenatal checkup.
- For sudden acute symptoms (bleeding, vision disturbances, sudden fluid leakage, severe headache), contact hospital emergency triage immediately.`;
}

export const AskOurPregnancy: React.FC = () => {
  const { state } = usePlanner();
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: "Hello! I'm Bloom AI, your personal prenatal companion. I have your gestational details and recent symptom logs ready. How can I support you today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Consulting guidelines...");
  const [systemContext, setSystemContext] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const gestationalInfo = useMemo(() => {
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
    return { weeks, trimester };
  }, [state.dueDate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const gatherContext = async () => {
      if (!state.activeJourneyId) return;

      const logs = await db.symptomLogs.where('journeyId').equals(state.activeJourneyId).reverse().sortBy('timestamp');
      const recentSymptoms = logs.slice(0, 5).map(l => `${l.symptomType} (${l.severity})`).join(', ') || 'None reported recently';

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
  * Current Trimester & Gestation: ${gestationalInfo.trimester} (${gestationalInfo.weeks})
  * Known Conditions: ${conditions}
  * Recent Logged Symptoms: ${recentSymptoms}
- Use this context naturally in your responses without requiring the user to repeat themselves.
- You answer all questions related to pregnancy, trimesters, gestational weeks, travel safety, exercises, nutrition & food safety, fetal development, labor preparation, emotional well-being, baby care, and postpartum recovery.

## COMMUNICATION STYLE & CLINICAL FORMAT
- Never output vague conversational fluff. Always ground responses in authoritative obstetric consensus.
- Structure responses into concise, readable markdown sections:
  * **### 📋 Clinical Summary**: Immediate 1-2 sentence direct answer.
  * **### 🔬 Physiological Rationale & Guidance**: Bulleted, precise explanation citing maternal/fetal mechanisms.
  * **### 💡 Practical Maternal Recommendations**: Clear daily portions, timing, dosages, or actionable safe steps.
  * **### ⚠️ When to Consult Your Doctor**: Red flags or specific symptoms requiring physical triage.
- Keep bullet points crisp, high-signal, and easy to skim.

## SAFETY, DISCLAIMER & INDIAN LAW COMPLIANCE (PCPNDT ACT, 1994)
- **STRICT PROHIBITION ON FETAL SEX DETERMINATION:** Under Indian Law (The Pre-Conception and Pre-Natal Diagnostic Techniques - PCPNDT Act, 1994), prenatal sex determination or disclosure of fetal sex/gender is strictly prohibited. You must NEVER predict, guess, determine, or reveal the sex or gender of the baby under any circumstances. If asked, politely refuse and state that sex determination is strictly illegal under the PCPNDT Act, 1994.
- You provide educational and supportive information, not a clinical prescription or diagnosis.
`;

      setSystemContext(systemInstruction);
    };

    gatherContext();
  }, [state.activeJourneyId, state.dueDate, state.flags, gestationalInfo]);

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

  const handleSend = async (customQuery?: string) => {
    const rawText = customQuery !== undefined ? customQuery : input;
    if ((!rawText.trim() && !attachedFile) || isLoading) return;

    triggerHaptic('light');

    if (isAiConsentBlocked(state.aiProcessingConsent)) {
      setMessages(prev => [...prev, {
        role: 'model',
        text: "AI processing is currently turned off in your settings. Turn on AI features in your Profile to use this."
      }]);
      return;
    }

    const userMsg = rawText.trim() || "Please analyze this document.";

    // Optimistically show user message
    setMessages(prev => [...prev, {
      role: 'user',
      text: attachedFile ? `📎 ${attachedFile.name}\n\n${userMsg}` : userMsg
    }]);

    if (customQuery === undefined) {
      setInput('');
    }

    // Fast-path client-side check to limit chatbot to pregnancy-related topics
    if (!isPregnancyRelated(userMsg)) {
      setMessages(prev => [...prev, {
        role: 'model',
        text: "I can only help with questions related to your pregnancy, baby's development, maternal diet, and postpartum care. Please ask me something related to your journey!"
      }]);
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
        setAttachedFile(null);
      }

      setLoadingText("Consulting guidelines...");
      const chatWithAI = httpsCallable(functions, 'chatWithAI');
      const response = await chatWithAI({ message: finalPrompt, systemPrompt: systemContext, dueDate: state.dueDate });
      const result = response.data as { reply: string };

      if (result?.reply) {
        setMessages(prev => [...prev, { role: 'model', text: result.reply }]);
        triggerHaptic('success');
      } else {
        const fallback = getLocalClinicalGuidance(userMsg, gestationalInfo.weeks);
        setMessages(prev => [...prev, { role: 'model', text: fallback }]);
      }
    } catch (error: any) {
      console.warn("Live AI call failed, resolving via evidence-based clinical guidance:", error);
      const fallback = getLocalClinicalGuidance(userMsg, gestationalInfo.weeks);
      setMessages(prev => [...prev, { role: 'model', text: fallback }]);
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

  const quickChips = [
    { label: '🥥 Tender Coconut', q: 'Is tender coconut water safe in pregnancy and what are its benefits?' },
    { label: '🥭 Ripe Mangoes', q: 'Can I eat ripe mangoes during pregnancy? What is the safe portion?' },
    { label: '🦵 Leg Cramps', q: 'How can I quickly relieve nocturnal leg cramps in pregnancy?' },
    { label: '🩺 Braxton Hicks', q: 'How do I tell the difference between Braxton Hicks and real labor contractions?' },
    { label: '🥬 Iron Foods', q: 'What are the best vegetarian iron-rich foods for pregnancy?' },
    { label: '✈️ Travel & Flying', q: 'Is it safe to travel or fly during this trimester?' },
  ];

  return (
    <Paywall featureName="AskOurPregnancy">
      <div className="flex flex-col h-[calc(100dvh-185px)] sm:h-[680px] w-full">
        {/* Subtle Top Status Row: Single clean line */}
        <div className="mb-2 px-1 flex items-center justify-between text-[12px] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-serif font-bold text-charcoal text-[14.5px]">Bloom AI Companion</span>
          </div>
          <span className="text-[10.5px] font-medium text-sage-dark bg-sage-pale/70 px-2.5 py-0.5 rounded-full border border-sage/20 whitespace-nowrap">
            {gestationalInfo.weeks !== 'Unknown' ? `Week ${gestationalInfo.weeks.replace(' weeks', '')}` : 'Active'}
          </span>
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-white border border-border/80 rounded-2xl flex flex-col overflow-hidden shadow-2xs">
          {/* Scrollable Message List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'user' ? (
                  <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-xs bg-sage text-white p-3 text-[13px] leading-relaxed shadow-3xs">
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                ) : (
                  <div className="max-w-[96%] sm:max-w-[85%] rounded-2xl rounded-tl-xs bg-white border border-border/80 p-3.5 shadow-2xs border-l-[3px] border-l-sage space-y-2">
                    {/* Header in ONE single row */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-border/50 text-[11.5px]">
                      <div className="flex items-center gap-1.5 text-sage-dark font-semibold">
                        <Sparkles size={13} className="text-sage shrink-0" />
                        <span className="whitespace-nowrap">Bloom AI Clinical Guide</span>
                      </div>
                      <span className="text-[10px] text-light whitespace-nowrap">Evidence-based</span>
                    </div>

                    <div className="markdown-body text-[13px] leading-relaxed text-charcoal/95 space-y-1 prose-headings:font-serif prose-headings:font-bold prose-headings:text-charcoal prose-h3:text-[13.5px] prose-h3:mt-2.5 prose-h3:mb-1 prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                      <Markdown>{msg.text}</Markdown>
                    </div>

                    <div className="pt-1.5 border-t border-border/50 flex items-center justify-between text-[10px] text-light">
                      <span className="flex items-center gap-1 text-sage-dark">
                        <ShieldCheck size={12} className="text-sage shrink-0" /> 100% Private
                      </span>
                      <span className="whitespace-nowrap">Verify with your doctor</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-border/80 text-charcoal rounded-2xl rounded-tl-xs p-3 flex items-center gap-2 shadow-2xs border-l-[3px] border-l-sage">
                  <Loader2 size={14} className="animate-spin text-sage" />
                  <span className="text-[12px] text-medium font-medium">{loadingText}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Controls Dock */}
          <div className="p-2.5 bg-[#FAF8F5]/90 border-t border-border/70 shrink-0">
            {/* Quick Consultation Chips: Single-row horizontal scroll */}
            <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              {quickChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleSend(chip.q)}
                  className="px-2.5 py-1 bg-white hover:bg-sage-pale/60 active:scale-95 text-charcoal border border-border/80 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer shadow-3xs"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* File Attachment Pill */}
            {attachedFile && (
              <div className="mb-2 inline-flex items-center gap-1.5 bg-sage-pale/80 text-sage-dark px-2.5 py-1 rounded-full text-[11px] font-medium border border-sage/20">
                <Paperclip size={12} />
                <span className="truncate max-w-[180px]">{attachedFile.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="hover:text-critical p-0.5 cursor-pointer"
                  aria-label="Remove attachment"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {isAiConsentBlocked(state.aiProcessingConsent) ? (
              <div className="py-2">
                <AiConsentPrompt />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-white border border-border/90 focus-within:border-sage focus-within:ring-2 focus-within:ring-sage/20 rounded-2xl px-2 py-1 transition-all shadow-3xs">
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
                  className="p-1.5 text-sage hover:bg-sage-pale/60 rounded-xl transition-colors cursor-pointer shrink-0 disabled:opacity-40"
                  title="Attach Report (PDF / Text)"
                  aria-label="Attach Report"
                >
                  <Paperclip size={16} />
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
                  placeholder="Ask about diet, scans, symptoms..."
                  className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-[13px] text-charcoal placeholder:text-medium/60 py-1.5 resize-none min-h-[22px] max-h-[90px] leading-relaxed"
                  rows={1}
                />

                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && !attachedFile) || isLoading}
                  className="p-2 bg-sage text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-sage-dark active:scale-95 transition-all cursor-pointer shrink-0 shadow-3xs"
                  aria-label="Send message"
                >
                  <Send size={14} />
                </button>
              </div>
            )}

            <div className="text-center mt-1.5 text-[10px] text-light">
              Private & confidential • Consult your obstetrician for clinical diagnoses
            </div>
          </div>
        </div>
      </div>
    </Paywall>
  );
};
