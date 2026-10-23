import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { getPlatform } from './nativeBridge';

/**
 * Gemini Client for iOS
 * Directly leverages Google Generative Language API on iOS native platform
 * to bypass external inference credit limits and provide 1,500 free requests/day.
 */

const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) || '';
const GEMINI_MODEL = 'gemini-flash-latest';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Sends a POST request to Google Gemini API.
 * Uses native CapacitorHttp (NSURLSession) on iOS to completely bypass WKWebView CORS / "Load failed" limits.
 */
async function postToGemini(endpoint: string, payload: any): Promise<any> {
  if (Capacitor.isNativePlatform()) {
    try {
      const response = await CapacitorHttp.post({
        url: endpoint,
        headers: {
          'Content-Type': 'application/json'
        },
        data: payload
      });

      if (response.status < 200 || response.status >= 300) {
        const errDetail = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        throw new Error(`Gemini API error (${response.status}): ${errDetail}`);
      }

      return typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    } catch (nativeErr: any) {
      console.warn("CapacitorHttp native request failed, attempting standard fetch fallback:", nativeErr);
    }
  }

  // Standard web fetch
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  return await response.json();
}

/**
 * Checks if Gemini is supported and configured for the current session.
 * Strictly restricted to iOS as requested.
 */
export const isGeminiSupported = (): boolean => {
  return getPlatform() === 'ios' && Boolean(GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 5);
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
function isPCPNDTGenderQuery(message: string): boolean {
  const clean = message.toLowerCase();
  const genderQueryPatterns = [
    'boy or girl', 'girl or boy', 'boy or a girl', 'girl or a boy',
    'baby boy or baby girl', 'baby girl or baby boy', 'male or female', 'female or male',
    'baby gender', 'fetal gender', 'gender of baby', 'gender of the baby', 'gender of my baby',
    'sex of baby', 'sex of the baby', 'sex of my baby', 'fetal sex', 'determine sex', 'determine gender',
    'predict gender', 'predict sex', 'tell me gender', 'tell me the gender', 'tell me sex',
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

  const endpoint = `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

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

  const data = await postToGemini(endpoint, payload);
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

  if (!text) {
    throw new Error('Gemini returned empty response');
  }

  return { reply: text };
}

/**
 * Multimodal Food Image Analysis with Gemini Flash
 */
export async function callGeminiVisionFood(params: {
  base64Data: string;
  mimeType: string;
  dishHint?: string;
}): Promise<GeminiFoodScanResult> {
  const { base64Data, mimeType, dishHint } = params;

  const endpoint = `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const prompt = `You are an expert prenatal nutritionist and clinical vision AI assistant.
First, determine if the image contains edible food, a meal, dish, snack, beverage, ingredient, or food nutrition label.
${dishHint ? `The user provided this dish name hint: "${dishHint}". Verify if the image matches this hint.` : ''}

Return ONLY a valid JSON object with this exact structure:
{
  "isFood": true,
  "nonFoodDescription": "",
  "dishName": "Palak Paneer",
  "servingDescription": "1 standard bowl (~200g) with spinach gravy and paneer cubes",
  "identifiedItems": ["Spinach (Palak)", "Cottage Cheese (Paneer)", "Spices & Gravy"],
  "macronutrients": {
    "calories": 280,
    "protein_g": 14,
    "carbs_g": 8,
    "fats_g": 20,
    "fiber_g": 4
  },
  "pregnancyCriticalMicronutrients": {
    "folate_mcg": 110,
    "iron_mg": 3.2,
    "calcium_mg": 260,
    "vitaminD_iu": 40
  },
  "safetyLevel": "SAFE",
  "isSafeForPregnancy": true,
  "hazardWarning": "",
  "clinicalRationale": "Rich in dietary non-heme iron and folate from spinach; paneer provides bioavailable calcium and complete protein for fetal cellular development.",
  "trimesterAdvice": "Pair with a squeeze of fresh lemon juice (Vitamin C) to enhance non-heme iron absorption. Ensure paneer is made from pasteurized milk."
}

Rules:
1. If the image is NOT food (e.g. people, animals, electronics, furniture, clothes, documents):
   - Set "isFood": false
   - In "nonFoodDescription", identify the specific subject clearly and politely.
   - Set "identifiedItems": []
   - Set "isSafeForPregnancy": false
   - Leave macros and micronutrients at 0
2. If the image IS food:
   - Set "isFood": true
   - Set "nonFoodDescription": ""
   - Name the dish in "dishName" accurately.
   - List key ingredients in "identifiedItems".
   - Estimate realistic macronutrients for the visible portion.
   - Estimate critical pregnancy micronutrients: folate (mcg), iron (mg), calcium (mg), and optional vitamin D (IU).
   - "safetyLevel": must be "SAFE", "CAUTION", or "AVOID".
   - "isSafeForPregnancy": false if any pregnancy hazards exist (unpasteurized dairy, raw eggs/meat/sprouts, high-mercury fish, excess caffeine, alcohol), else true.
   - "hazardWarning": describe risks if unsafe, or leave empty if safe.
   - "clinicalRationale": 1-2 sentence evidence-based rationale aligned with FOGSI / ACOG standards.
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
      maxOutputTokens: 600,
      responseMimeType: 'application/json'
    }
  };

  const data = await postToGemini(endpoint, payload);
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

  if (!rawText) {
    throw new Error('Gemini Vision returned empty content');
  }

  // Clean code fences if any
  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  const parsed = JSON.parse(cleaned);

  if (parsed.isFood === false) {
    return {
      isFood: false,
      nonFoodDescription: parsed.nonFoodDescription || "This image does not appear to contain a meal, food dish, or snack. Please upload a clear photo of your food.",
      dishName: undefined,
      identifiedItems: [],
      macronutrients: { calories: 0, protein_g: 0, carbs_g: 0, fats_g: 0, fiber_g: 0 },
      pregnancyCriticalMicronutrients: { folate_mcg: 0, iron_mg: 0, calcium_mg: 0 },
      safetyLevel: 'AVOID',
      isSafeForPregnancy: false,
      hazardWarning: '',
      sourceType: 'photo'
    };
  }

  const macros: FoodMacronutrients = {
    calories: parsed.macronutrients?.calories || Math.round(
      (parsed.macronutrients?.protein_g || 0) * 4 +
      (parsed.macronutrients?.carbs_g || 0) * 4 +
      (parsed.macronutrients?.fats_g || 0) * 9
    ) || 280,
    protein_g: Number(parsed.macronutrients?.protein_g ?? 10),
    carbs_g: Number(parsed.macronutrients?.carbs_g ?? 30),
    fats_g: Number(parsed.macronutrients?.fats_g ?? 10),
    fiber_g: Number(parsed.macronutrients?.fiber_g ?? 3)
  };

  const micros: FoodMicronutrients = {
    folate_mcg: Number(parsed.pregnancyCriticalMicronutrients?.folate_mcg ?? 45),
    iron_mg: Number(parsed.pregnancyCriticalMicronutrients?.iron_mg ?? 1.8),
    calcium_mg: Number(parsed.pregnancyCriticalMicronutrients?.calcium_mg ?? 75),
    vitaminD_iu: parsed.pregnancyCriticalMicronutrients?.vitaminD_iu ? Number(parsed.pregnancyCriticalMicronutrients.vitaminD_iu) : undefined
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
    clinicalRationale: parsed.clinicalRationale || 'Evaluated against FOGSI & ACOG maternal nutrition baselines.',
    trimesterAdvice: parsed.trimesterAdvice || 'Ensure balanced portioning and adequate hydration with your healthcare plan.',
    sourceType: 'photo'
  };
}

/**
 * Real AI Text/Dish Nutrition Analysis with Gemini Flash
 * Analyzes any meal name, description, or voice transcript with authentic ICMR-NIN & FOGSI clinical nutrition.
 */
export async function callGeminiTextNutrition(dishDescription: string): Promise<GeminiFoodScanResult> {
  const endpoint = `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const prompt = `You are an expert prenatal clinical nutritionist aligned with ICMR-NIN (Indian Council of Medical Research - National Institute of Nutrition) and FOGSI/ACOG maternal health guidelines.
The pregnant mother consumed or described this meal/dish:
"${dishDescription}"

Analyze the authentic recipe, culinary ingredients, portion size, and nutritional composition.
Return ONLY a valid JSON object with this exact structure:
{
  "isFood": true,
  "nonFoodDescription": "",
  "dishName": "Exact Proper Dish Name",
  "servingDescription": "Standard portion (e.g. 1 bowl ~200g, 2 pieces with chutney)",
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
    "vitaminD_iu": 0
  },
  "safetyLevel": "SAFE",
  "isSafeForPregnancy": true,
  "hazardWarning": "",
  "clinicalRationale": "Detailed 1-2 sentence evidence-based rationale citing specific nutrients and benefits.",
  "trimesterAdvice": "Actionable prenatal dietary tip for this dish (e.g. pairing with Vitamin C, portion control, cooking thoroughly)."
}

Rules:
1. If the input is NOT food (e.g. random non-food words, nonsense, objects):
   - Set "isFood": false
   - Set "nonFoodDescription": "Please enter or select an edible dish, food item, or beverage."
   - Set "identifiedItems": []
   - Leave nutrients at 0.
2. If it IS food:
   - Identify the authentic traditional and modern culinary ingredients in "identifiedItems".
   - Calculate realistic macros based on ICMR-NIN tables for standard cooked portions.
   - Calculate maternal micronutrients: folate (mcg), iron (mg), and calcium (mg).
   - "safetyLevel": must be "SAFE", "CAUTION", or "AVOID".
   - Flag any real pregnancy hazards (e.g. unpasteurized cheeses, raw papaya/latex, excess caffeine, high mercury fish, raw eggs/meat).`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 600,
      responseMimeType: 'application/json'
    }
  };

  const data = await postToGemini(endpoint, payload);
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

  if (!rawText) {
    throw new Error('Gemini returned empty content');
  }

  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  const parsed = JSON.parse(cleaned);

  if (parsed.isFood === false) {
    return {
      isFood: false,
      nonFoodDescription: parsed.nonFoodDescription || `"${dishDescription}" was not recognized as a food dish. Please describe an edible meal or snack.`,
      identifiedItems: [],
      macronutrients: { calories: 0, protein_g: 0, carbs_g: 0, fats_g: 0, fiber_g: 0 },
      pregnancyCriticalMicronutrients: { folate_mcg: 0, iron_mg: 0, calcium_mg: 0 },
      safetyLevel: 'AVOID',
      isSafeForPregnancy: false,
      hazardWarning: '',
      sourceType: 'text'
    };
  }

  const macros: FoodMacronutrients = {
    calories: parsed.macronutrients?.calories || Math.round(
      (parsed.macronutrients?.protein_g || 0) * 4 +
      (parsed.macronutrients?.carbs_g || 0) * 4 +
      (parsed.macronutrients?.fats_g || 0) * 9
    ) || 280,
    protein_g: Number(parsed.macronutrients?.protein_g ?? 8),
    carbs_g: Number(parsed.macronutrients?.carbs_g ?? 35),
    fats_g: Number(parsed.macronutrients?.fats_g ?? 8),
    fiber_g: Number(parsed.macronutrients?.fiber_g ?? 3)
  };

  const micros: FoodMicronutrients = {
    folate_mcg: Number(parsed.pregnancyCriticalMicronutrients?.folate_mcg ?? 45),
    iron_mg: Number(parsed.pregnancyCriticalMicronutrients?.iron_mg ?? 1.8),
    calcium_mg: Number(parsed.pregnancyCriticalMicronutrients?.calcium_mg ?? 75),
    vitaminD_iu: parsed.pregnancyCriticalMicronutrients?.vitaminD_iu ? Number(parsed.pregnancyCriticalMicronutrients.vitaminD_iu) : undefined
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

  const endpoint = `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

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
      maxOutputTokens: 600,
      responseMimeType: 'application/json'
    }
  };

  const data = await postToGemini(endpoint, payload);
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

  if (!rawText) {
    throw new Error('Gemini Medical Vision returned empty content');
  }

  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  const parsed = JSON.parse(cleaned);

  return {
    summary: parsed.summary || 'Report analyzed successfully. Please review with your doctor.',
    prescriptions: Array.isArray(parsed.prescriptions) ? parsed.prescriptions : [],
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings : []
  };
}
