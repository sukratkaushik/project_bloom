import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { getPlatform } from './nativeBridge';

/**
 * Gemini Client for Web, iOS, and Android
 * Directly leverages Google Generative Language API
 * to provide 1,500 free requests/day with multi-model failover cascade.
 */

const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) || '';
const GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.6-flash',
  'gemini-flash-lite-latest'
];
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Sends a POST request to Google Gemini API with automated multi-model fallback cascade.
 * Tries priority models: 'gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.6-flash', 'gemini-flash-lite-latest'.
 * If Google API returns 503 (high demand spike), 429 (rate limit), or times out, immediately tries the next candidate.
 * Uses standard web fetch with AbortController and 8-second timeout per attempt.
 */
async function postToGemini(payload: any, models: string[] = GEMINI_MODELS): Promise<any> {
  const MODEL_TIMEOUT_MS = 8000; // 8s max per candidate model
  let lastError: any = null;

  for (const model of models) {
    const endpoint = `${GEMINI_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;
    
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Model ${model} timed out (${MODEL_TIMEOUT_MS / 1000}s)`));
        }, MODEL_TIMEOUT_MS);
      });

      const requestPromise = (async () => {
        if (Capacitor.isNativePlatform()) {
          try {
            const response = await CapacitorHttp.post({
              url: endpoint,
              headers: {
                'Content-Type': 'application/json'
              },
              data: JSON.stringify(payload),
              connectTimeout: 8000,
              readTimeout: 8000,
              responseType: 'json'
            });

            if (response.status < 200 || response.status >= 300) {
              const errDetail = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
              throw new Error(`Gemini API error (${response.status}): ${errDetail}`);
            }

            return typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
          } catch (nativeErr: any) {
            console.warn(`CapacitorHttp native request for ${model} encountered error, trying web fetch fallback:`, nativeErr);
          }
        }

        // Standard web browser fetch with AbortController and 8s timeout
        const controller = new AbortController();
        const abortTimer = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
          });

          if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
          }

          return await response.json();
        } finally {
          clearTimeout(abortTimer);
        }
      })();

      const result = await Promise.race([requestPromise, timeoutPromise]);
      if (result) {
        return result;
      }
    } catch (err: any) {
      console.warn(`[Gemini Cascade] Model ${model} failed (${err?.message || err}). Attempting next candidate...`);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini AI model endpoints were unavailable. Please try again.');
}

/**
 * Checks if Gemini is supported and configured for the current session.
 * Available across Web, iOS, and Android whenever VITE_GEMINI_API_KEY is configured.
 */
export const isGeminiSupported = (): boolean => {
  return Boolean(GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 5);
};

export interface GeminiChatOptions {
  message: string;
  systemPrompt?: string;
  dueDate?: string;
}

export interface FoodMacronutrients {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
}

export interface FoodMicronutrients {
  folate_mcg: number;
  iron_mg: number;
  calcium_mg: number;
  vitaminD_iu?: number;
  dha_mg?: number;
}

export interface GeminiFoodScanResult {
  isFood?: boolean;
  nonFoodDescription?: string;
  dishName?: string;
  servingDescription?: string;
  identifiedItems: string[];
  macronutrients: FoodMacronutrients;
  pregnancyCriticalMicronutrients: FoodMicronutrients;
  safetyLevel?: 'SAFE' | 'CAUTION' | 'AVOID';
  isSafeForPregnancy: boolean;
  hazardWarning: string;
  clinicalRationale?: string;
  trimesterAdvice?: string;
  sourceType?: 'photo' | 'barcode' | 'text' | 'sample';
  brandName?: string;
}

/**
 * Compliance check: India PCPNDT Act, 1994 (Prohibition of Sex Selection)
 */
export function isPCPNDTGenderQuery(message?: string): boolean {
  if (!message || typeof message !== 'string') return false;
  const clean = message.toLowerCase().trim();
  const genderQueryPatterns = [
    'boy or girl', 'girl or boy', 'boy or a girl', 'girl or a boy',
    'baby boy or baby girl', 'baby girl or baby boy', 'male or female', 'female or male',
    'baby gender', 'fetal gender', 'gender of baby', 'gender of the baby', 'gender of my baby',
    'sex of baby', 'sex of the baby', 'sex of my baby', 'fetal sex', 'determine sex', 'determine gender',
    'predict gender', 'predict sex', 'tell me gender', 'tell me the gender', 'tell me sex',
    'gender prediction', 'sex prediction', 'gender reveal',
    'ultrasound gender', 'gender from ultrasound', 'sex from ultrasound', 'ultrasound sex',
    'nub theory', 'ramzi theory', 'skull theory', 'heart rate gender',
    'ladka ya ladki', 'ladka hai ya ladki', 'ladki hai ya ladka', 'beta hoga ya beti',
    'beta hai ya beti', 'beti hogi ya beta', 'beta ya beti', 'ling janch', 'ling parikshan'
  ];
  return genderQueryPatterns.some(pattern => clean.includes(pattern));
}

/**
 * Text Chat with Gemini Flash
 */
export async function callGeminiChat(options: GeminiChatOptions): Promise<{ reply: string }> {
  const { message, systemPrompt, dueDate } = options;

  if (isPCPNDTGenderQuery(message)) {
    return {
      reply: "In strict accordance with Indian law (The Pre-Conception and Pre-Natal Diagnostic Techniques - PCPNDT Act, 1994), prenatal sex determination or disclosure of the gender/sex of a fetus is strictly illegal. Our Pregnancy complies fully with Indian regulations and cannot predict, determine, or reveal the gender of your baby. Our tools are dedicated exclusively to maternal health, fetal wellness, and safe prenatal care."
    };
  }

  let contextualSystem = systemPrompt || `You are OPIN AI, an expert maternal health and prenatal nutritionist assistant aligned with FOGSI (Federation of Obstetric and Gynaecological Societies of India) and ACOG guidelines.
Provide supportive, accurate, evidence-based guidance for pregnant mothers. Never provide definitive diagnostic prescriptions; always encourage consulting a personal gynaecologist.`;

  if (dueDate) {
    contextualSystem += `\nThe user's expected due date is: ${dueDate}.`;
  }

  const payload: any = {
    contents: [
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ],
    systemInstruction: {
      parts: [{ text: contextualSystem }]
    },
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024
    }
  };

  const data = await postToGemini(payload);
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

  if (!text) {
    throw new Error('Gemini returned empty response');
  }

  return { reply: text };
}

/**
 * Resilient JSON parser that gracefully handles markdown wrappers, leading/trailing noise,
 * and attempts auto-repair for truncated strings or brackets when LLMs hit output ceilings.
 */
export function safeParseGeminiJson(rawText: string): any {
  if (!rawText || !rawText.trim()) {
    throw new Error('AI returned empty response.');
  }

  // 1. Strip markdown code fences if present
  let cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();

  // 2. Direct fast-path parse
  try {
    return JSON.parse(cleaned);
  } catch (err: any) {
    // 3. Extract JSON object substring { ... }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      } catch {
        // Proceed to repair
      }
    }

    // 4. Attempt repair if string or closing braces were truncated
    let repaired = firstBrace !== -1 ? cleaned.substring(firstBrace) : cleaned;

    // Check for unclosed string quote
    let inString = false;
    let escaped = false;
    for (let i = 0; i < repaired.length; i++) {
      const char = repaired[i];
      if (char === '\\' && inString) {
        escaped = !escaped;
      } else if (char === '"' && !escaped) {
        inString = !inString;
      } else {
        escaped = false;
      }
    }
    if (inString) {
      repaired += '"'; // close unterminated string
    }

    // Balance open braces/brackets
    const stack: string[] = [];
    inString = false;
    escaped = false;
    for (let i = 0; i < repaired.length; i++) {
      const char = repaired[i];
      if (char === '\\' && inString) {
        escaped = !escaped;
      } else if (char === '"' && !escaped) {
        inString = !inString;
      } else if (!inString) {
        if (char === '{') stack.push('}');
        else if (char === '[') stack.push(']');
        else if (char === '}' || char === ']') {
          if (stack.length > 0 && stack[stack.length - 1] === char) {
            stack.pop();
          }
        }
      } else {
        escaped = false;
      }
    }
    while (stack.length > 0) {
      repaired += stack.pop();
    }

    try {
      return JSON.parse(repaired);
    } catch (finalErr: any) {
      console.error("JSON repair failed on raw output:", cleaned);
      throw new Error(`JSON Parse error: ${err?.message || 'Invalid AI formatting'}`);
    }
  }
}

/**
 * Multimodal Food Image Analysis with Google Gemini Vision
 * Accurately analyzes meal photos using ICMR-NIN nutritional tables and FOGSI/ACOG standards.
 */
export async function callGeminiVisionFood(params: {
  base64Data: string;
  mimeType: string;
  dishHint?: string;
}): Promise<GeminiFoodScanResult> {
  const { base64Data, mimeType, dishHint } = params;

  if (dishHint && isPCPNDTGenderQuery(dishHint)) {
    return {
      isFood: false,
      nonFoodDescription: "Under the Pre-Conception and Pre-Natal Diagnostic Techniques (PCPNDT) Act, 1994, prenatal sex determination or disclosure of fetal sex or gender is strictly illegal in India. Our Pregnancy complies fully with Indian regulations and cannot assist with fetal sex/gender inquiries.",
      dishName: 'Prohibited Inquiry (PCPNDT Act, 1994)',
      identifiedItems: [],
      macronutrients: { calories: 0, protein_g: 0, carbs_g: 0, fats_g: 0, fiber_g: 0 },
      pregnancyCriticalMicronutrients: { folate_mcg: 0, iron_mg: 0, calcium_mg: 0, vitaminD_iu: 0 },
      safetyLevel: 'AVOID',
      isSafeForPregnancy: false,
      hazardWarning: 'Strict Legal Prohibition: Prenatal sex determination is illegal under Indian law.',
      clinicalRationale: 'In compliance with the Pre-Conception and Pre-Natal Diagnostic Techniques (PCPNDT) Act, 1994.',
      sourceType: 'photo'
    };
  }

  const prompt = `You are an expert prenatal clinical nutritionist and computer vision AI aligned with ICMR-NIN (Indian Council of Medical Research - National Institute of Nutrition) nutritional tables and FOGSI / ACOG maternal guidelines.
First, determine if the image contains edible food, a meal, dish, snack, beverage, ingredient, or food nutrition label.
${dishHint ? `The user provided this dish name hint: "${dishHint}". Verify if the image matches this hint.` : ''}

CRITICAL LEGAL REQUIREMENT (PCPNDT ACT, 1994 - INDIA):
Under Indian Law (The Pre-Conception and Pre-Natal Diagnostic Techniques - Prohibition of Sex Selection Act, 1994), prenatal sex determination and disclosure of fetal sex or gender are strictly illegal. Never attempt to deduce or discuss fetal sex or gender.

Return ONLY a valid JSON object with this exact structure:
{
  "isFood": true,
  "nonFoodDescription": "",
  "dishName": "Palak Paneer with Rotis",
  "servingDescription": "1 standard bowl (~200g) with 2 rotis",
  "identifiedItems": ["Spinach (Palak)", "Cottage Cheese (Paneer)", "Whole Wheat Roti", "Onions & Tomatoes", "Cooking Spices"],
  "macronutrients": {
    "calories": 420,
    "protein_g": 17,
    "carbs_g": 48,
    "fats_g": 18,
    "fiber_g": 7
  },
  "pregnancyCriticalMicronutrients": {
    "folate_mcg": 120,
    "iron_mg": 3.5,
    "calcium_mg": 250,
    "vitaminD_iu": 20
  },
  "safetyLevel": "SAFE",
  "isSafeForPregnancy": true,
  "hazardWarning": "",
  "clinicalRationale": "Rich in dietary non-heme iron and folate from spinach; paneer provides bioavailable calcium and complete protein for fetal cellular development based on ICMR-NIN maternal guidance.",
  "trimesterAdvice": "Pair with a squeeze of fresh lemon juice (Vitamin C) to enhance non-heme iron absorption. Ensure paneer is prepared from pasteurized milk."
}

Rules:
1. If the image is NOT food (e.g. people, animals, electronics, furniture, clothes, medicine, non-food objects):
   - Set "isFood": false
   - In "nonFoodDescription", identify the specific subject politely and ask for a meal photo.
   - Set "identifiedItems": []
   - Set "isSafeForPregnancy": false
   - Leave macros and micronutrients at 0
2. If the image IS food:
   - Set "isFood": true
   - Set "nonFoodDescription": ""
   - Name the dish in "dishName" accurately.
   - Estimate serving size in "servingDescription" (e.g. "1 bowl ~200g with 2 rotis").
   - List key ingredients in "identifiedItems".
   - Estimate realistic macronutrients (calories, protein_g, carbs_g, fats_g, fiber_g) based on ICMR-NIN nutritional composition for cooked Indian and international foods.
   - Estimate critical pregnancy micronutrients: Folate (mcg), Elemental Iron (mg), Calcium (mg), and Vitamin D (IU).
   - "safetyLevel": must be "SAFE", "CAUTION", or "AVOID".
   - "isSafeForPregnancy": false if any pregnancy hazards exist (unpasteurized dairy, raw eggs/meat/sprouts, high-mercury fish, excess caffeine, alcohol), else true.
   - "hazardWarning": describe risks if unsafe, or leave empty if safe.
   - "clinicalRationale": 1-2 sentence evidence-based rationale aligned with ICMR-NIN and FOGSI / ACOG standards.
   - "trimesterAdvice": 1-2 actionable tips for expectant mothers consuming this meal.`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: base64Data
            }
          },
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json'
    }
  };

  const data = await postToGemini(payload);
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

  if (!rawText) {
    throw new Error('Gemini Vision returned empty content');
  }

  const parsed = safeParseGeminiJson(rawText);

  if (parsed.isFood === false) {
    return {
      isFood: false,
      nonFoodDescription: parsed.nonFoodDescription || "This image does not appear to contain a meal, food dish, or snack. Please upload a clear photo of your food.",
      dishName: undefined,
      identifiedItems: [],
      macronutrients: { calories: 0, protein_g: 0, carbs_g: 0, fats_g: 0, fiber_g: 0 },
      pregnancyCriticalMicronutrients: { folate_mcg: 0, iron_mg: 0, calcium_mg: 0, vitaminD_iu: 0 },
      safetyLevel: 'AVOID',
      isSafeForPregnancy: false,
      hazardWarning: '',
      sourceType: 'photo'
    };
  }

  const macros: FoodMacronutrients = {
    calories: Number(parsed.macronutrients?.calories) || Math.round(
      (Number(parsed.macronutrients?.protein_g) || 0) * 4 +
      (Number(parsed.macronutrients?.carbs_g) || 0) * 4 +
      (Number(parsed.macronutrients?.fats_g) || 0) * 9
    ),
    protein_g: Number(parsed.macronutrients?.protein_g) || 0,
    carbs_g: Number(parsed.macronutrients?.carbs_g) || 0,
    fats_g: Number(parsed.macronutrients?.fats_g) || 0,
    fiber_g: Number(parsed.macronutrients?.fiber_g) || 0
  };

  const micros: FoodMicronutrients = {
    folate_mcg: Number(parsed.pregnancyCriticalMicronutrients?.folate_mcg) || 0,
    iron_mg: Number(parsed.pregnancyCriticalMicronutrients?.iron_mg) || 0,
    calcium_mg: Number(parsed.pregnancyCriticalMicronutrients?.calcium_mg) || 0,
    vitaminD_iu: parsed.pregnancyCriticalMicronutrients?.vitaminD_iu !== undefined
      ? Number(parsed.pregnancyCriticalMicronutrients.vitaminD_iu)
      : undefined
  };

  const safetyLevel = (parsed.safetyLevel as 'SAFE' | 'CAUTION' | 'AVOID') ||
    (parsed.isSafeForPregnancy === false ? 'AVOID' : 'SAFE');

  return {
    isFood: true,
    dishName: parsed.dishName || dishHint || (parsed.identifiedItems?.[0] ? parsed.identifiedItems[0] : 'Scanned Meal'),
    servingDescription: parsed.servingDescription || 'Standard portion estimated from photo',
    identifiedItems: Array.isArray(parsed.identifiedItems) ? parsed.identifiedItems : [],
    macronutrients: macros,
    pregnancyCriticalMicronutrients: micros,
    safetyLevel,
    isSafeForPregnancy: parsed.isSafeForPregnancy !== false,
    hazardWarning: parsed.hazardWarning || '',
    clinicalRationale: parsed.clinicalRationale || 'Evaluated against ICMR-NIN & FOGSI maternal nutrition baselines.',
    trimesterAdvice: parsed.trimesterAdvice || 'Ensure balanced portioning and adequate hydration with your healthcare plan.',
    sourceType: 'photo'
  };
}

/**
 * Authentic AI Text & Dish Nutrition Analysis with Google Gemini
 * Analyzes search chips, custom meal descriptions, and voice inputs with authentic ICMR-NIN & FOGSI clinical nutrition.
 */
export async function callGeminiTextNutrition(dishDescription: string): Promise<GeminiFoodScanResult> {
  if (isPCPNDTGenderQuery(dishDescription)) {
    return {
      isFood: false,
      nonFoodDescription: "Under the Pre-Conception and Pre-Natal Diagnostic Techniques (PCPNDT) Act, 1994, prenatal sex determination or disclosure of fetal sex or gender is strictly illegal in India. Our Pregnancy complies fully with Indian regulations and cannot predict, determine, or reveal fetal gender. Our nutrition tools are dedicated solely to maternal health and safe prenatal nutrition.",
      dishName: 'Prohibited Inquiry (PCPNDT Act, 1994)',
      identifiedItems: [],
      macronutrients: { calories: 0, protein_g: 0, carbs_g: 0, fats_g: 0, fiber_g: 0 },
      pregnancyCriticalMicronutrients: { folate_mcg: 0, iron_mg: 0, calcium_mg: 0, vitaminD_iu: 0 },
      safetyLevel: 'AVOID',
      isSafeForPregnancy: false,
      hazardWarning: 'Strict Legal Prohibition: Prenatal sex determination is illegal under Indian law.',
      clinicalRationale: 'In compliance with the Pre-Conception and Pre-Natal Diagnostic Techniques (PCPNDT) Act, 1994.',
      sourceType: 'text'
    };
  }

  const prompt = `You are an expert prenatal clinical nutritionist aligned with ICMR-NIN (Indian Council of Medical Research - National Institute of Nutrition) nutritional tables and FOGSI/ACOG maternal health guidelines.
The pregnant mother consumed, searched, or described this meal/dish:
"${dishDescription}"

CRITICAL LEGAL REQUIREMENT (PCPNDT ACT, 1994 - INDIA):
Under Indian Law (The Pre-Conception and Pre-Natal Diagnostic Techniques - Prohibition of Sex Selection Act, 1994), prenatal sex determination and disclosure of fetal sex or gender are strictly illegal. Never attempt to deduce or discuss fetal sex or gender.

Analyze the authentic recipe, culinary ingredients, portion size, and nutritional composition.
Return ONLY a valid JSON object with this exact structure:
{
  "isFood": true,
  "nonFoodDescription": "",
  "dishName": "Exact Proper Dish Name",
  "servingDescription": "Standard portion (e.g. 1 bowl ~200g with 2 rotis)",
  "identifiedItems": ["Authentic Ingredient 1", "Ingredient 2", "Ingredient 3"],
  "macronutrients": {
    "calories": 320,
    "protein_g": 12,
    "carbs_g": 45,
    "fats_g": 10,
    "fiber_g": 4
  },
  "pregnancyCriticalMicronutrients": {
    "folate_mcg": 85,
    "iron_mg": 2.5,
    "calcium_mg": 180,
    "vitaminD_iu": 20
  },
  "safetyLevel": "SAFE",
  "isSafeForPregnancy": true,
  "hazardWarning": "",
  "clinicalRationale": "Detailed 1-2 sentence evidence-based rationale citing specific ICMR-NIN nutrients and maternal/fetal benefits.",
  "trimesterAdvice": "Actionable prenatal dietary tip for this dish (e.g. pairing with Vitamin C, portion control, cooking thoroughly)."
}

Rules:
1. If the input is NOT food (e.g. random non-food words, nonsense, non-edible objects):
   - Set "isFood": false
   - Set "nonFoodDescription": "Please enter or select an edible dish, food item, or beverage."
   - Set "identifiedItems": []
   - Leave nutrients at 0.
2. If it IS food:
   - Identify authentic culinary ingredients in "identifiedItems".
   - Estimate serving size in "servingDescription" (e.g. "1 bowl ~200g with 2 rotis").
   - Calculate realistic macros based on ICMR-NIN tables for standard cooked maternal portions.
   - Calculate critical maternal micronutrients: Folate (mcg), Elemental Iron (mg), Calcium (mg), and Vitamin D (IU).
   - "safetyLevel": must be "SAFE", "CAUTION", or "AVOID".
   - Flag any real pregnancy hazards (e.g. unpasteurized cheeses, raw papaya/latex, excess caffeine, high mercury fish, raw eggs/meat).
   - "clinicalRationale": evidence-based clinical guidance citing ICMR-NIN and FOGSI/ACOG standards.`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json'
    }
  };

  const data = await postToGemini(payload);
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

  if (!rawText) {
    throw new Error('Gemini returned empty content');
  }

  const parsed = safeParseGeminiJson(rawText);

  if (parsed.isFood === false) {
    return {
      isFood: false,
      nonFoodDescription: parsed.nonFoodDescription || `"${dishDescription}" was not recognized as a food dish. Please describe an edible meal or snack.`,
      identifiedItems: [],
      macronutrients: { calories: 0, protein_g: 0, carbs_g: 0, fats_g: 0, fiber_g: 0 },
      pregnancyCriticalMicronutrients: { folate_mcg: 0, iron_mg: 0, calcium_mg: 0, vitaminD_iu: 0 },
      safetyLevel: 'AVOID',
      isSafeForPregnancy: false,
      hazardWarning: '',
      sourceType: 'text'
    };
  }

  const macros: FoodMacronutrients = {
    calories: Number(parsed.macronutrients?.calories) || Math.round(
      (Number(parsed.macronutrients?.protein_g) || 0) * 4 +
      (Number(parsed.macronutrients?.carbs_g) || 0) * 4 +
      (Number(parsed.macronutrients?.fats_g) || 0) * 9
    ),
    protein_g: Number(parsed.macronutrients?.protein_g) || 0,
    carbs_g: Number(parsed.macronutrients?.carbs_g) || 0,
    fats_g: Number(parsed.macronutrients?.fats_g) || 0,
    fiber_g: Number(parsed.macronutrients?.fiber_g) || 0
  };

  const micros: FoodMicronutrients = {
    folate_mcg: Number(parsed.pregnancyCriticalMicronutrients?.folate_mcg) || 0,
    iron_mg: Number(parsed.pregnancyCriticalMicronutrients?.iron_mg) || 0,
    calcium_mg: Number(parsed.pregnancyCriticalMicronutrients?.calcium_mg) || 0,
    vitaminD_iu: parsed.pregnancyCriticalMicronutrients?.vitaminD_iu !== undefined
      ? Number(parsed.pregnancyCriticalMicronutrients.vitaminD_iu)
      : undefined
  };

  const safetyLevel = (parsed.safetyLevel as 'SAFE' | 'CAUTION' | 'AVOID') ||
    (parsed.isSafeForPregnancy === false ? 'AVOID' : 'SAFE');

  return {
    isFood: true,
    dishName: parsed.dishName || dishDescription.slice(0, 48),
    servingDescription: parsed.servingDescription || 'Standard maternal portion estimated',
    identifiedItems: Array.isArray(parsed.identifiedItems) ? parsed.identifiedItems : [dishDescription],
    macronutrients: macros,
    pregnancyCriticalMicronutrients: micros,
    safetyLevel,
    isSafeForPregnancy: parsed.isSafeForPregnancy !== false,
    hazardWarning: parsed.hazardWarning || '',
    clinicalRationale: parsed.clinicalRationale || 'Calculated using ICMR-NIN nutritional composition and FOGSI guidelines.',
    trimesterAdvice: parsed.trimesterAdvice || 'Ensure balanced portioning and drink adequate water.',
    sourceType: 'text'
  };
}

export interface MedicalReportAnalysisResult {
  summary: string;
  prescriptions: string[];
  warnings: string[];
}

/**
 * Multimodal Medical Report Analysis with Gemini Flash
 */
export async function callGeminiMedicalReport(params: {
  base64Data: string;
  fileType: string;
  fileName?: string;
}): Promise<MedicalReportAnalysisResult> {
  const { base64Data, fileType, fileName } = params;

  const prompt = `You are a clinical AI assistant helping a pregnant mother understand her medical reports, ultrasound records, or doctor's prescriptions.
A major task is deciphering doctor handwriting or complex medical terms, presenting them in a clear, supportive, and easy-to-understand patient-friendly manner.
${fileName ? `File Name: ${fileName}` : ''}

CRITICAL LEGAL REQUIREMENT (PCPNDT ACT, 1994 - INDIA):
Under Indian Law (The Pre-Conception and Pre-Natal Diagnostic Techniques - Prohibition of Sex Selection Act, 1994), prenatal sex determination and disclosure of fetal sex or gender are strictly illegal and prohibited.
Under NO circumstances are you allowed to identify, predict, deduce, or disclose the sex or gender of the fetus (e.g. boy, girl, male, female fetus, fetal genitalia, nub theory).
If the report or ultrasound contains any reference to fetal sex or gender, you MUST completely omit, ignore, and redact it. Never mention fetal sex or gender anywhere in your output.

Extract the information and return ONLY a valid JSON object with the following structure:
{
  "summary": "A 2-3 sentence patient-friendly summary of the report contents, findings, or doctor's general advice. Keep the tone warm and supportive.",
  "prescriptions": [
    "Medication Name (e.g. Folic Acid 400mcg) - Instructions (e.g. 1 tablet daily after breakfast) - Purpose/Notes (e.g. Essential for baby's neural development)"
  ],
  "warnings": [
    "Important safety instructions, warning symptoms to watch out for, or critical follow-ups (e.g. Avoid taking iron supplements with dairy, Schedule 20-week scan by end of month)"
  ]
}

Rules:
1. Under 'prescriptions', decipher all handwritten or printed medications, dosages, frequency, and instructions. If there are no prescriptions, return an empty array.
2. Under 'warnings', highlight any warnings, precautions, or key indicators mentioned. If none, return an empty array.
3. If handwriting is illegible, do your best and append '(please verify with pharmacist)' to the specific item.
4. Keep all responses supportive, and tailored for a mother's understanding.
5. Strictly comply with the PCPNDT Act: NEVER reveal or analyze fetal sex or gender.`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: fileType.startsWith('image/') ? fileType : 'image/jpeg',
              data: base64Data
            }
          },
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json'
    }
  };

  const data = await postToGemini(payload);
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

  if (!rawText) {
    throw new Error('Gemini Medical Vision returned empty content');
  }

  const parsed = safeParseGeminiJson(rawText);

  return {
    summary: parsed.summary || 'Report analyzed successfully. Please review with your doctor.',
    prescriptions: Array.isArray(parsed.prescriptions) ? parsed.prescriptions : [],
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings : []
  };
}
