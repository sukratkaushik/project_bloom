"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.sendVerificationOtp = exports.deleteUserByAdmin = exports.getAdminUsersList = exports.sendPlanChangeNotificationEmail = exports.verifyPaymentSignature = exports.createPaymentOrder = exports.analyzeMedicalReport = exports.analyzeFood = exports.parseDocument = exports.chatWithAI = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const admin = __importStar(require("firebase-admin"));
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
// Initialize Firebase Admin SDK
admin.initializeApp();
// Define the secure secret that we will store in Firebase Secret Manager
const hfApiKey = (0, params_1.defineSecret)("HUGGINGFACE_API_KEY");
const razorpayKeyId = (0, params_1.defineSecret)("RAZORPAY_KEY_ID");
const razorpayKeySecret = (0, params_1.defineSecret)("RAZORPAY_KEY_SECRET");
const smtpUserSecret = (0, params_1.defineSecret)("SMTP_USER");
const smtpPassSecret = (0, params_1.defineSecret)("SMTP_PASS");
function isQueryDueDateInvalid(message) {
    const clean = message.toLowerCase();
    // 1. Check if the message contains a year 2028 or later
    const year2028PlusMatch = clean.match(/\b(202[8-9]|20[3-9][0-9])\b/);
    if (year2028PlusMatch) {
        return true;
    }
    // 2. Check if the message contains 2027
    if (clean.includes("2027")) {
        // Check for invalid months in 2027 (April to December)
        const outOfRangeMonths = [
            // English
            'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
            'april', 'june', 'july', 'august', 'september', 'october', 'november', 'december',
            // German
            'mai', 'okt', 'dez', 'juni', 'juli', 'oktober', 'dezember',
            // Hindi / Hinglish transliterated
            'aprail', 'mai', 'jun', 'julai', 'agast', 'sitambar', 'aktubar', 'navambar', 'disambar',
            'dec', 'disember', 'december',
            // Devanagari Hindi
            'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर',
            // Punjabi
            'ਅਪ੍ਰੈਲ', 'ਮਈ', 'ਜੂਨ', 'ਜੁਲਾਈ', 'ਅਗਸਤ', 'ਸਤੰਬਰ', 'ਅਕਤੂਬਰ', 'ਨਵੰਬਰ', 'ਦਸੰਬਰ',
            // Gujarati
            'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઓગસ્ટ', 'સપ્ટેમ્બર', 'ઓક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર',
            // Marathi
            'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर',
            // Bengali
            'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
            // Tamil
            'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்',
            // Kannada
            'ಏಪ್ರಿಲ್', 'ಮೇ', 'ಜೂನ್', 'ಜುಲೈ', 'ಆಗಸ್ಟ್', 'ಸೆಪ್ಟೆಂಬರ್', 'ಅಕ್ಟೋಬರ್', 'ನವೆಂಬರ್', 'ಡಿಸೆಂಬರ್',
            // Telugu
            'ఏప్రిల్', 'మే', 'జూన్', 'జూలై', 'ఆగస్టు', 'సెప్టेंबर', 'అక్టోబర్', 'నవంబర్', 'డిసెంబర్',
            // Malayalam
            'ഏപ്രിൽ', 'മേയ്', 'ജൂൺ', 'ജൂലൈ', 'ആഗസ്റ്റ്', 'സെപ്റ്റംബർ', 'ഒക്ടോബർ', 'നവംബർ', 'ഡിസംബർ',
            // Urdu
            'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'
        ];
        for (const m of outOfRangeMonths) {
            if (clean.includes(m)) {
                return true;
            }
        }
        // Check numeric dates like DD/MM/2027 or MM/DD/2027
        const numericDateMatches = clean.match(/\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.]2027\b/);
        if (numericDateMatches) {
            const val1 = parseInt(numericDateMatches[1], 10);
            const val2 = parseInt(numericDateMatches[2], 10);
            const minVal = Math.min(val1, val2);
            const maxVal = Math.max(val1, val2);
            if (minVal > 3) {
                return true;
            }
            if (maxVal > 12 && minVal > 3) {
                return true;
            }
        }
    }
    // 3. Check for relative time phrases
    const outOfRangePhrases = [
        'in 10 month', 'in 11 month', 'in 12 month', 'in 13 month', 'in 14 month', 'in 15 month',
        'in 16 month', 'in 17 month', 'in 18 month', 'in 19 month', 'in 20 month', 'in 24 month',
        'in 1 year', 'in 2 year', 'in 3 year', 'in 1.5 year', 'next year', 'after 9 months',
        '10 mahine', '11 mahine', '12 mahine', '1 saal', '2 saal', 'agle saal',
        '10 महीने', '11 महीने', '12 महीने', '1 साल', '2 साल'
    ];
    if (outOfRangePhrases.some(phrase => clean.includes(phrase))) {
        return true;
    }
    return false;
}
exports.chatWithAI = (0, https_1.onCall)({ secrets: [hfApiKey], region: "asia-south1" }, async (request) => {
    const { message, systemPrompt, maxTokens, dueDate } = request.data;
    if (!message) {
        throw new https_1.HttpsError("invalid-argument", "Message is required.");
    }
    const apiKey = hfApiKey.value();
    if (!apiKey) {
        console.error("Missing Hugging Face API Key");
        throw new https_1.HttpsError("internal", "Server configuration error.");
    }
    let isDueDateOutside9Months = false;
    if (dueDate) {
        try {
            const due = new Date(dueDate);
            const today = new Date();
            const limitDate = new Date(today);
            limitDate.setMonth(today.getMonth() + 9);
            if (due < today || due > limitDate) {
                isDueDateOutside9Months = true;
            }
        }
        catch (e) {
            console.error("Error parsing due date in functions:", e);
        }
    }
    // Also check the user's message programmatically
    if (isQueryDueDateInvalid(message)) {
        isDueDateOutside9Months = true;
    }
    let finalSystemPrompt = "";
    if (isDueDateOutside9Months) {
        finalSystemPrompt = `You are a professional translator and conversational AI.
Detect the language and style of the user's message.
Reply ONLY with the following statement translated into the detected language and style of the user's message:
"I currently can help you when you are expecting your due date within 9 months from tday."

CRITICAL TRANSLATION RULES:
1. If the user's message is written in Romanized Hindi (Hinglish) (e.g. using English/Latin alphabet to write Hindi words like "agar", "m", "apna", "expect krr rhi hu", "kya", "kar sakte ho", etc.), you MUST reply in Romanized Hindi (Hinglish), for example: "Main abhi tabhi help kar sakta hoon jab aap apni due date aaj se 9 mahine ke andar expect kar rahe hon."
2. If the user's message is in German, translate it to German: "Ich kann Ihnen derzeit helfen, wenn Sie Ihren Geburtstermin innerhalb von 9 Monaten ab heute erwarten."
3. If the user's message is in English, reply in English: "I currently can help you when you are expecting your due date within 9 months from tday."
4. If the user's message is in Devanagari Hindi, translate it to Hindi: "मैं वर्तमान में आपकी मदद कर सकता हूँ जब आप आज से 9 महीने के भीतर अपनी नियत तारीख की उम्मीद कर रहे हों।"
5. Otherwise, translate the statement into the matching native language and script of the user's message (e.g. Punjabi, Gujarati, Marathi, Bengali, Tamil, Kannada, Telugu, Malayalam, Urdu, etc.).

Do not output anything else. Do not explain, do not apologize, do not add any other text. Output ONLY the translated statement. This overrides all other instructions.`;
    }
    else {
        const defaultSystemPrompt = "You are Bloom AI, a helpful, warm, and supportive AI prenatal assistant for the pregnancy app 'Our Pregnancy'. You answer all questions related to maternal health, trimesters, gestational weeks, pregnancy travel safety, exercises, diet/nutrition, fetal growth, labor preparation, emotional well-being, baby care, and postpartum recovery. Keep answers warm, encouraging, concise, and rooted in safe medical guidelines (ACOG/WHO).";
        const scopeConstraint = `\n\nCRITICAL SCOPE & DOMAIN INSTRUCTIONS:
1. You answer all questions related to pregnancy, maternal health, prenatal/postpartum care, fetal/baby development, baby naming, pregnancy travel safety, nutrition, or pregnancy tracking/planning.
2. If the user asks about completely unrelated domains (such as computer programming, writing code, non-pregnancy math, cryptocurrency, or general IT), politely reply: "I am designed specifically to support you with pregnancy and baby care questions. How can I help with your pregnancy journey today?"
3. Language: Always detect the language/style of the user's message (e.g. English, Hindi, Hinglish, German, Spanish, Punjabi, etc.) and respond naturally in that exact same language.`;
        finalSystemPrompt = (systemPrompt || defaultSystemPrompt) + scopeConstraint;
    }
    try {
        const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                model: "Qwen/Qwen2.5-72B-Instruct",
                messages: [
                    {
                        role: "system",
                        content: finalSystemPrompt
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                max_tokens: maxTokens || 500,
                temperature: 0.7
            }),
        });
        const result = await response.json();
        if (result.choices && result.choices.length > 0 && result.choices[0].message) {
            return { reply: result.choices[0].message.content.trim() };
        }
        else if (result.error) {
            console.error("HF Error:", result.error);
            throw new https_1.HttpsError("internal", "AI Error.");
        }
        return { reply: "I'm having trouble connecting right now. Please try again." };
    }
    catch (error) {
        console.error("Fetch Error:", error);
        throw new https_1.HttpsError("internal", "Unable to connect to AI.");
    }
});
exports.parseDocument = (0, https_1.onCall)({ region: "asia-south1", memory: "512MiB" }, async (request) => {
    const { base64Data, fileName } = request.data;
    if (!base64Data) {
        throw new https_1.HttpsError("invalid-argument", "No document data provided.");
    }
    try {
        const buffer = Buffer.from(base64Data, "base64");
        // We only support PDFs via this endpoint for now
        if (fileName.toLowerCase().endsWith('.pdf')) {
            const pdfParse = require('pdf-parse');
            const data = await pdfParse(buffer);
            return { text: data.text };
        }
        else {
            throw new https_1.HttpsError("invalid-argument", "Only PDF files are supported by this parser.");
        }
    }
    catch (error) {
        console.error("Document Parse Error:", error);
        throw new https_1.HttpsError("internal", "Failed to parse document.");
    }
});
exports.analyzeFood = (0, https_1.onCall)({ secrets: [hfApiKey], region: "asia-south1", memory: "512MiB" }, async (request) => {
    const { base64Data, mimeType } = request.data;
    if (!base64Data || !mimeType) {
        throw new https_1.HttpsError("invalid-argument", "Image data and mimeType are required.");
    }
    const apiKey = hfApiKey.value();
    if (!apiKey) {
        throw new https_1.HttpsError("internal", "Server configuration error.");
    }
    const systemPrompt = `You are an expert prenatal nutritionist and clinical vision AI assistant.
First, determine if the image contains edible food, a meal, dish, snack, beverage, ingredient, or food nutrition label.

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "isFood": true,
  "nonFoodDescription": "",
  "identifiedItems": ["item1", "item2"],
  "macronutrients": { "protein_g": 0, "carbs_g": 0, "fats_g": 0, "fiber_g": 0 },
  "pregnancyCriticalMicronutrients": { "folate_mcg": 0, "iron_mg": 0, "calcium_mg": 0 },
  "isSafeForPregnancy": true,
  "hazardWarning": ""
}

Rules:
1. If the image is NOT food (e.g. it shows people, children, animals/pets, cars/vehicles, electronic devices, laptops, smartphones, furniture, clothes, toys, documents, landscapes, etc.):
   - Set "isFood": false
   - In "nonFoodDescription", identify the specific non-food subject clearly and politely (e.g. "This appears to be a photo of an animal/pet [or vehicle, electronic device, household object, person], not an edible food item. Please upload a clear photo of your meal, snack, or food label.")
   - Set "identifiedItems": []
   - Set "isSafeForPregnancy": false
   - Leave macros and micronutrients at 0
2. If the image IS food:
   - Set "isFood": true
   - Set "nonFoodDescription": ""
   - List all visible food items in "identifiedItems".
   - Estimate macronutrients based on standard portion sizes.
   - Estimate folate (mcg), iron (mg), and calcium (mg).
   - Set "isSafeForPregnancy": false and fill "hazardWarning" if any pregnancy hazards are present: raw/undercooked meat/eggs/seafood, unpasteurized dairy/cheese, high-mercury fish, raw sprouts, excessive caffeine (>200mg), or alcohol.
   - If safe, set "isSafeForPregnancy": true and leave "hazardWarning" empty.

Return ONLY the JSON object.`;
    try {
        const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                model: "Qwen/Qwen2.5-VL-72B-Instruct",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:${mimeType};base64,${base64Data}`,
                                },
                            },
                            {
                                type: "text",
                                text: systemPrompt,
                            },
                        ],
                    },
                ],
                max_tokens: 700,
                temperature: 0.1,
            }),
        });
        const result = await response.json();
        if (result.choices && result.choices.length > 0 && result.choices[0].message) {
            let content = result.choices[0].message.content.trim();
            // Strip any markdown code fences if the model adds them
            content = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
            try {
                const parsed = JSON.parse(content);
                return parsed;
            }
            catch (parseErr) {
                console.error("JSON parse error from model output:", content);
                throw new https_1.HttpsError("internal", "Failed to parse AI response.");
            }
        }
        else if (result.error) {
            console.error("HF VL Error:", result.error);
            throw new https_1.HttpsError("internal", `AI model error: ${result.error.message || "Unknown error"}`);
        }
        throw new https_1.HttpsError("internal", "No response from AI model.");
    }
    catch (error) {
        console.error("analyzeFood Error:", error);
        if (error instanceof https_1.HttpsError)
            throw error;
        throw new https_1.HttpsError("internal", "Failed to analyze food image.");
    }
});
exports.analyzeMedicalReport = (0, https_1.onCall)({ secrets: [hfApiKey], region: "asia-south1", memory: "512MiB", timeoutSeconds: 120 }, async (request) => {
    const { base64Data, fileType, fileName } = request.data;
    if (!base64Data || !fileType || !fileName) {
        throw new https_1.HttpsError("invalid-argument", "base64Data, fileType, and fileName are required.");
    }
    const apiKey = hfApiKey.value();
    if (!apiKey) {
        throw new https_1.HttpsError("internal", "Server configuration error: Hugging Face API key is missing.");
    }
    const systemPrompt = `You are a clinical AI assistant helping a pregnant mother understand her medical reports, ultrasound records, or doctor's prescriptions.
A major task is deciphering doctor handwriting or complex medical terms, presenting them in a clear, supportive, and easy-to-understand patient-friendly manner.

Extract the information and return ONLY a valid JSON object with the following structure (do NOT wrap it in HTML/markdown, do not add any additional text, just the raw JSON object itself):
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
4. Keep all responses supportive, and tailored for a mother's understanding.`;
    try {
        let extractedText = "";
        if (fileType === "application/pdf") {
            const pdfParse = require("pdf-parse");
            const buffer = Buffer.from(base64Data, "base64");
            const parsed = await pdfParse(buffer);
            extractedText = parsed.text || "";
            if (extractedText.trim().length < 10) {
                throw new https_1.HttpsError("invalid-argument", "This PDF file appears to be a scanned image containing no extractable text. Please upload the report as an image (PNG, JPG, WebP) to analyze the visual scan.");
            }
            const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    model: "Qwen/Qwen2.5-72B-Instruct",
                    messages: [
                        {
                            role: "system",
                            content: systemPrompt,
                        },
                        {
                            role: "user",
                            content: `Please analyze the following extracted text from a medical report:\n\n${extractedText}`,
                        },
                    ],
                    max_tokens: 800,
                    temperature: 0.2,
                }),
            });
            const result = await response.json();
            return parseResponseContent(result);
        }
        else if (fileType.startsWith("image/")) {
            const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    model: "Qwen/Qwen2.5-VL-72B-Instruct",
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:${fileType};base64,${base64Data}`,
                                    },
                                },
                                {
                                    type: "text",
                                    text: systemPrompt,
                                },
                            ],
                        },
                    ],
                    max_tokens: 800,
                    temperature: 0.1,
                }),
            });
            const result = await response.json();
            return parseResponseContent(result);
        }
        else {
            throw new https_1.HttpsError("invalid-argument", "Unsupported file type. Only PDFs and images are supported.");
        }
    }
    catch (error) {
        console.error("analyzeMedicalReport Error:", error);
        if (error instanceof https_1.HttpsError)
            throw error;
        throw new https_1.HttpsError("internal", error.message || "Failed to analyze medical report.");
    }
});
function parseResponseContent(result) {
    if (result.choices && result.choices.length > 0 && result.choices[0].message) {
        let content = result.choices[0].message.content.trim();
        content = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
        try {
            return JSON.parse(content);
        }
        catch (parseErr) {
            console.error("JSON parse error from model output:", content);
            throw new https_1.HttpsError("internal", "Failed to parse AI response. The model output was not valid JSON.");
        }
    }
    else if (result.error) {
        console.error("HF API Error:", result.error);
        throw new https_1.HttpsError("internal", `AI model error: ${result.error.message || "Unknown error"}`);
    }
    throw new https_1.HttpsError("internal", "No response received from AI model.");
}
/**
 * Creates a secure payment order via Razorpay API
 */
exports.createPaymentOrder = (0, https_1.onCall)({ secrets: [razorpayKeyId, razorpayKeySecret], region: "asia-south1" }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Authentication is required.");
    }
    const { planTier, months } = request.data;
    if (!['standard', 'premium'].includes(planTier) || !months) {
        throw new https_1.HttpsError("invalid-argument", "Valid planTier and months are required.");
    }
    const basePrice = planTier === 'standard' ? 199 : 499;
    const discount = Math.floor(months / 3) * 50;
    const finalTotal = Math.max(0, (basePrice * months) - discount);
    const Razorpay = require("razorpay");
    const rzp = new Razorpay({
        key_id: razorpayKeyId.value(),
        key_secret: razorpayKeySecret.value(),
    });
    try {
        const order = await rzp.orders.create({
            amount: finalTotal * 100, // Razorpay requires amounts in paise
            currency: "INR",
            receipt: `rcpt_${request.auth.uid.substring(0, 10)}_${Date.now()}`,
            notes: {
                uid: request.auth.uid,
                planTier,
                months: months.toString()
            }
        });
        return { orderId: order.id, amount: order.amount };
    }
    catch (err) {
        console.error("Razorpay order creation error:", err);
        throw new https_1.HttpsError("internal", `Payment gateway error: ${err.message || "Unknown error"}`);
    }
});
/**
 * Securely verifies payment signature and updates user's plan state in Firestore
 */
exports.verifyPaymentSignature = (0, https_1.onCall)({ secrets: [razorpayKeySecret], region: "asia-south1" }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Authentication is required.");
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planTier, months } = request.data;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planTier || !months) {
        throw new https_1.HttpsError("invalid-argument", "Missing required verification parameters.");
    }
    const secret = razorpayKeySecret.value();
    const hmac = crypto_1.default.createHmac("sha256", secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");
    if (generatedSignature !== razorpay_signature) {
        throw new https_1.HttpsError("permission-denied", "Payment verification failed: invalid signature.");
    }
    // Determine plan expiry
    const db = admin.firestore();
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + Number(months));
    // Update the user profile in database
    await db.collection("users").doc(request.auth.uid).set({
        planTier,
        planExpiry: expiry.toISOString(),
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        isPremium: planTier === 'premium', // backward compatibility mapping
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    return { success: true, planTier, expiry: expiry.toISOString() };
});
/**
 * Sends a warm, branded email to the user when their subscription plan is updated by the Admin.
 */
exports.sendPlanChangeNotificationEmail = (0, https_1.onCall)({ region: "asia-south1", secrets: [smtpUserSecret, smtpPassSecret] }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Authentication is required.");
    }
    // Verify caller is admin
    const callerEmail = request.auth.token.email;
    const db = admin.firestore();
    const callerDoc = await db.collection("users").doc(request.auth.uid).get();
    const isCallerAdmin = callerEmail === "sukrat.kaushik@gmail.com" || callerDoc.data()?.role === "admin";
    if (!isCallerAdmin) {
        throw new https_1.HttpsError("permission-denied", "Only administrators can send plan notifications.");
    }
    const { targetEmail, targetName, planTier, durationMonths } = request.data;
    if (!targetEmail || !planTier) {
        throw new https_1.HttpsError("invalid-argument", "Target email and plan tier are required.");
    }
    let userVal = "sukrat.kaushik@gmail.com";
    let passVal = "";
    try {
        userVal = smtpUserSecret.value() || process.env.SMTP_USER || "sukrat.kaushik@gmail.com";
    }
    catch {
        userVal = process.env.SMTP_USER || "sukrat.kaushik@gmail.com";
    }
    try {
        passVal = smtpPassSecret.value() || process.env.SMTP_PASS || "";
    }
    catch {
        passVal = process.env.SMTP_PASS || "";
    }
    if (!passVal) {
        console.error("[SMTP ERROR]: SMTP_PASS secret is missing or empty. Cannot send plan upgrade email.");
        throw new https_1.HttpsError("failed-precondition", "Email delivery credentials (SMTP_PASS) are not configured.");
    }
    const recipientName = targetName && targetName.trim().length > 0 ? targetName.trim() : "there";
    const tierTitle = planTier === "premium" ? "Premium Plan (AI Ultimate)" : "Standard Plan (Maternal Care)";
    const durationText = durationMonths ? `${durationMonths} month${durationMonths > 1 ? "s" : ""} access` : "lifetime access";
    const standardBenefits = `
      <li style="margin-bottom: 10px; color: #2C3E50;">🏛️ <strong>Government Maternity Schemes Guide</strong> — Step-by-step guidance on PMMVY, JSY, and financial benefits.</li>
      <li style="margin-bottom: 10px; color: #2C3E50;">🌿 <strong>Postpartum &amp; Early Parenthood Recovery</strong> — Guided recovery logs and daily newborn care checklists.</li>
      <li style="margin-bottom: 10px; color: #2C3E50;">🤝 <strong>Encrypted Partner Sync</strong> — Real-time synchronization of vitals and appointments.</li>
      <li style="margin-bottom: 10px; color: #2C3E50;">🏥 <strong>Complete Clinical &amp; Vaccine Checklists</strong> — Full clinic schedules and immunization trackers.</li>
    `;
    const premiumBenefits = `
      <li style="margin-bottom: 10px; color: #2C3E50;">🤖 <strong>24/7 Bloom AI Prenatal Guide</strong> — Instant, comforting answers to any pregnancy question or symptom.</li>
      <li style="margin-bottom: 10px; color: #2C3E50;">🥗 <strong>AI Food Safety Scanner</strong> — Check Indian &amp; international foods and ingredients for pregnancy safety.</li>
      <li style="margin-bottom: 10px; color: #2C3E50;">📋 <strong>FHIR R4 Doctor EHR Medical Exports</strong> — Formatted clinical summaries ready for OB-GYN visits.</li>
      <li style="margin-bottom: 10px; color: #2C3E50;">🏛️ <strong>Government Maternity Schemes Guide</strong> — PMMVY, JSY, and financial support.</li>
      <li style="margin-bottom: 10px; color: #2C3E50;">🌿 <strong>Postpartum &amp; Early Parenthood Recovery Guides</strong></li>
      <li style="margin-bottom: 10px; color: #2C3E50;">🤝 <strong>Encrypted Partner Sync &amp; Collaboration</strong></li>
    `;
    const benefitItemsHtml = planTier === "premium" ? premiumBenefits : standardBenefits;
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A gift for your pregnancy journey</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #FDFBF7; font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2C3E50; -webkit-font-smoothing: antialiased;">
  <!-- Preheader for inbox preview -->
  <div style="display: none; max-height: 0px; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px;">
    You've been upgraded to Our Pregnancy ${planTier === 'premium' ? 'Premium' : 'Standard'} (${durationText}).
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FDFBF7; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px -4px rgba(44, 62, 80, 0.05); border: 1px solid #E8EDE9;">
          <!-- Header with Canonical Lotus Logo -->
          <tr>
            <td style="padding: 32px 32px 20px; text-align: center; border-bottom: 1px solid #F4F2EC;">
              <a href="https://ourpregnancy.in" target="_blank" style="text-decoration: none; display: inline-block;">
                <img src="https://ourpregnancy.in/logo.png" width="48" height="48" alt="Our Pregnancy" style="display: block; margin: 0 auto; width: 48px; height: 48px; border: 0;" />
              </a>
              <h2 style="margin: 10px 0 2px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 500; color: #2C3E50; letter-spacing: 0.2px;">
                Our Pregnancy
              </h2>
              <p style="margin: 0; font-size: 12.5px; color: #6B7A87; font-family: 'Nunito', Helvetica, Arial, sans-serif;">
                Your pregnancy companion — secure &amp; synced
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 28px;">
              <h1 style="margin: 0 0 16px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 25px; font-weight: 600; color: #2C3E50; line-height: 1.35;">
                A gift for your pregnancy journey
              </h1>
              <p style="font-size: 15.5px; line-height: 1.6; color: #2C3E50; margin: 0 0 14px 0;">
                Hello ${recipientName},
              </p>
              <p style="font-size: 15px; line-height: 1.6; color: #4A5568; margin: 0 0 22px 0;">
                As part of our commitment to supporting expectant mothers and families with gentle, science-backed guidance, we have gifted you full access to the <strong>Our Pregnancy ${tierTitle}</strong> with ${durationText}.
              </p>

              <!-- Feature Highlight Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${planTier === 'premium' ? '#FEF9EE' : '#E9F5E9'}; border-radius: 14px; border: 1px solid ${planTier === 'premium' ? '#F4A261' : '#8AB6A3'}; margin-bottom: 26px;">
                <tr>
                  <td style="padding: 20px 22px;">
                    <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #2C3E50; font-family: 'Playfair Display', Georgia, serif; font-weight: 600;">
                      🎁 What's now unlocked for you:
                    </h3>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.75;">
                      ${benefitItemsHtml}
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- CTA Button (Pill shaped, Sage) -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0 16px 0;">
                <tr>
                  <td align="center">
                    <a href="https://ourpregnancy.in/#dashboard" target="_blank" style="background-color: #8AB6A3; color: #FFFFFF; padding: 14px 34px; border-radius: 9999px; font-size: 15px; font-weight: 600; text-decoration: none; display: inline-block; font-family: 'Nunito', Helvetica, Arial, sans-serif; box-shadow: 0 3px 12px rgba(138, 182, 163, 0.35);">
                      Open my dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; color: #6B7A87; line-height: 1.6; margin: 16px 0 0 0; text-align: center;">
                <em>No credit card or payment required. This access is activated directly on your account.</em>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAFBF9; border-top: 1px solid #E8EDE9; padding: 22px 32px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 13.5px; color: #2C3E50; font-weight: 600;">
                With care,
              </p>
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B7A87;">
                Our Pregnancy Team &middot; Made with &#x1F90D; for expectant mothers
              </p>
              <p style="margin: 0; font-size: 12px; color: #8F9E99;">
                Questions? Reach out to <a href="mailto:hello@ourpregnancy.in" style="color: #8AB6A3; text-decoration: underline;">hello@ourpregnancy.in</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    const transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: userVal,
            pass: passVal,
        },
    });
    const mailOptions = {
        from: `"Our Pregnancy Team" <${userVal}>`,
        replyTo: "hello@ourpregnancy.in",
        to: targetEmail,
        subject: `You've been upgraded to Our Pregnancy ${planTier === 'premium' ? 'Premium' : 'Standard'}`,
        html: emailHtml,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[SMTP SUCCESS]: Plan notification email sent to ${targetEmail}. Message ID: ${info.messageId}`);
        return { success: true, message: `Email sent to ${targetEmail}` };
    }
    catch (err) {
        console.error(`[SMTP ERROR]: Failed to send plan change email to ${targetEmail}:`, err?.message || err, err?.code, err?.response);
        return { success: false, error: err?.message || "SMTP transmission error" };
    }
});
/**
 * Fetches all registered users from both Firebase Auth and Firestore users collection.
 * Automatically synchronizes any users who exist in Auth but were missing in Firestore.
 */
exports.getAdminUsersList = (0, https_1.onCall)({ region: "asia-south1" }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Authentication is required.");
    }
    const callerEmail = request.auth.token.email;
    const db = admin.firestore();
    const callerDoc = await db.collection("users").doc(request.auth.uid).get();
    const isCallerAdmin = callerEmail === "sukrat.kaushik@gmail.com" || callerDoc.data()?.role === "admin";
    if (!isCallerAdmin) {
        throw new https_1.HttpsError("permission-denied", "Only administrators can view the user directory.");
    }
    try {
        // 1. Fetch all Firestore user documents
        const firestoreUsersSnap = await db.collection("users").get();
        const firestoreUserMap = new Map();
        firestoreUsersSnap.docs.forEach((doc) => {
            firestoreUserMap.set(doc.id, { id: doc.id, ...doc.data() });
        });
        // 2. Fetch all Firebase Auth users
        const listUsersResult = await admin.auth().listUsers(1000);
        const combinedUsers = [];
        const seenUids = new Set();
        for (const authUser of listUsersResult.users) {
            seenUids.add(authUser.uid);
            const existingDoc = firestoreUserMap.get(authUser.uid) || {};
            // If Firestore document is missing, backfill it so it's persisted in the DB
            if (!firestoreUserMap.has(authUser.uid)) {
                const newProfile = {
                    uid: authUser.uid,
                    email: authUser.email || null,
                    displayName: authUser.displayName || null,
                    role: authUser.email === "sukrat.kaushik@gmail.com" ? "admin" : "user",
                    planTier: "free",
                    planExpiry: null,
                    isSetup: false,
                    createdAt: authUser.metadata.creationTime ? new Date(authUser.metadata.creationTime).getTime() : Date.now(),
                    updatedAt: Date.now(),
                };
                db.collection("users").doc(authUser.uid).set(newProfile, { merge: true }).catch((e) => {
                    console.warn(`Backfill failed for ${authUser.uid}:`, e);
                });
            }
            combinedUsers.push({
                uid: authUser.uid,
                email: authUser.email || existingDoc.email || null,
                displayName: authUser.displayName || existingDoc.displayName || null,
                role: existingDoc.role || (authUser.email === "sukrat.kaushik@gmail.com" ? "admin" : "user"),
                planTier: existingDoc.planTier || "free",
                planExpiry: existingDoc.planExpiry || null,
                isSetup: existingDoc.isSetup ?? false,
                activeJourneyId: existingDoc.activeJourneyId || null,
                emailVerified: authUser.emailVerified,
                createdAt: existingDoc.createdAt || (authUser.metadata.creationTime ? new Date(authUser.metadata.creationTime).getTime() : Date.now()),
                updatedAt: existingDoc.updatedAt || Date.now(),
            });
        }
        // 3. Include any Firestore users not present in Auth
        for (const [uid, fUser] of firestoreUserMap.entries()) {
            if (!seenUids.has(uid)) {
                combinedUsers.push({
                    uid,
                    ...fUser,
                    emailVerified: true,
                    createdAt: fUser.createdAt || Date.now(),
                });
            }
        }
        // Sort by newest joined first
        combinedUsers.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        return { users: combinedUsers };
    }
    catch (error) {
        console.error("Failed to list users for admin:", error);
        throw new https_1.HttpsError("internal", error.message || "Failed to list users.");
    }
});
/**
 * Permanently deletes a user from Firebase Auth, Firestore profiles, journeys, trackingData, and feedback.
 */
exports.deleteUserByAdmin = (0, https_1.onCall)({ region: "asia-south1" }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Authentication is required.");
    }
    const callerEmail = request.auth.token.email;
    const db = admin.firestore();
    const callerDoc = await db.collection("users").doc(request.auth.uid).get();
    const isCallerAdmin = callerEmail === "sukrat.kaushik@gmail.com" || callerDoc.data()?.role === "admin";
    if (!isCallerAdmin) {
        throw new https_1.HttpsError("permission-denied", "Only administrators can delete users.");
    }
    const { targetUid } = request.data;
    if (!targetUid) {
        throw new https_1.HttpsError("invalid-argument", "targetUid is required.");
    }
    // Safety: Protect the primary owner account from deletion
    if (targetUid === request.auth.uid || targetUid === "sukrat.kaushik@gmail.com") {
        throw new https_1.HttpsError("failed-precondition", "Primary administrator account cannot be deleted.");
    }
    try {
        // 1. Delete all journeys and nested tracking data for this user
        const journeysSnap = await db.collection("journeys").where("uid", "==", targetUid).get();
        for (const jDoc of journeysSnap.docs) {
            const trackingSnap = await jDoc.ref.collection("trackingData").get();
            if (!trackingSnap.empty) {
                const batch = db.batch();
                trackingSnap.docs.forEach((doc) => batch.delete(doc.ref));
                await batch.commit();
            }
            await jDoc.ref.delete();
        }
        // 2. Delete any feedbacks submitted by user
        const feedbackSnap = await db.collection("feedbacks").where("uid", "==", targetUid).get();
        if (!feedbackSnap.empty) {
            const fBatch = db.batch();
            feedbackSnap.docs.forEach((doc) => fBatch.delete(doc.ref));
            await fBatch.commit();
        }
        // 3. Delete user document in Firestore
        await db.collection("users").doc(targetUid).delete();
        // 4. Delete user account in Firebase Authentication
        try {
            await admin.auth().deleteUser(targetUid);
        }
        catch (authErr) {
            console.warn(`Auth delete warning for ${targetUid}:`, authErr.message);
        }
        return { success: true, message: `User ${targetUid} and all associated data permanently deleted.` };
    }
    catch (err) {
        console.error(`Failed to delete user ${targetUid}:`, err);
        throw new https_1.HttpsError("internal", err.message || "Failed to delete user.");
    }
});
/**
 * Generates and dispatches a 6-digit numeric OTP for email verification.
 * Immune to email crawlers, link pre-fetchers, and SafeLinks scanners.
 */
exports.sendVerificationOtp = (0, https_1.onCall)({ region: "asia-south1", secrets: [smtpUserSecret, smtpPassSecret] }, async (request) => {
    const { email, displayName, uid } = request.data || {};
    if (!email || typeof email !== "string" || !email.includes("@")) {
        throw new https_1.HttpsError("invalid-argument", "Valid email address is required.");
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = displayName && typeof displayName === "string" ? displayName.trim() : "there";
    const db = admin.firestore();
    // Check rate limit: 45s cooldown
    const existingOtpDoc = await db.collection("emailOtps").doc(cleanEmail).get();
    if (existingOtpDoc.exists) {
        const data = existingOtpDoc.data();
        if (Date.now() - (data.createdAt || 0) < 45 * 1000) {
            throw new https_1.HttpsError("resource-exhausted", "Please wait 45 seconds before requesting another code.");
        }
    }
    // Generate secure 6-digit OTP
    const otpCode = crypto_1.default.randomInt(100000, 999999).toString();
    // Persist OTP in Firestore emailOtps collection
    await db.collection("emailOtps").doc(cleanEmail).set({
        email: cleanEmail,
        otp: otpCode,
        uid: uid || null,
        attempts: 0,
        createdAt: Date.now(),
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes expiry
    });
    let userVal = "sukrat.kaushik@gmail.com";
    let passVal = "";
    try {
        userVal = smtpUserSecret.value() || process.env.SMTP_USER || "sukrat.kaushik@gmail.com";
    }
    catch {
        userVal = process.env.SMTP_USER || "sukrat.kaushik@gmail.com";
    }
    try {
        passVal = smtpPassSecret.value() || process.env.SMTP_PASS || "";
    }
    catch {
        passVal = process.env.SMTP_PASS || "";
    }
    if (!passVal) {
        console.error(`[SMTP ERROR]: SMTP_PASS secret is missing or empty. Cannot dispatch OTP to ${cleanEmail}`);
        throw new https_1.HttpsError("failed-precondition", "Email delivery credentials (SMTP_PASS) are not configured.");
    }
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your verification code</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #FDFBF7; font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2C3E50; -webkit-font-smoothing: antialiased;">
  <!-- Preheader for inbox preview -->
  <div style="display: none; max-height: 0px; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px;">
    Your 6-digit Our Pregnancy verification code is ${otpCode}.
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FDFBF7; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px -4px rgba(44, 62, 80, 0.05); border: 1px solid #E8EDE9;">
          <!-- Header with Canonical Lotus Logo -->
          <tr>
            <td style="padding: 32px 32px 20px; text-align: center; border-bottom: 1px solid #F4F2EC;">
              <a href="https://ourpregnancy.in" target="_blank" style="text-decoration: none; display: inline-block;">
                <img src="https://ourpregnancy.in/logo.png" width="48" height="48" alt="Our Pregnancy" style="display: block; margin: 0 auto; width: 48px; height: 48px; border: 0;" />
              </a>
              <h2 style="margin: 10px 0 2px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 500; color: #2C3E50; letter-spacing: 0.2px;">
                Our Pregnancy
              </h2>
              <p style="margin: 0; font-size: 12.5px; color: #6B7A87; font-family: 'Nunito', Helvetica, Arial, sans-serif;">
                Your pregnancy companion — secure &amp; synced
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 28px; text-align: center;">
              <h1 style="margin: 0 0 12px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 600; color: #2C3E50; line-height: 1.3;">
                Your verification code
              </h1>
              <p style="font-size: 15px; color: #6B7A87; margin: 0 0 24px 0; line-height: 1.5;">
                Hello <strong>${cleanName}</strong>,<br/>
                Please use the following 6-digit code to confirm your email and activate your account:
              </p>

              <!-- OTP Code Box in Tulsi Mint Pale with Sage dashed border -->
              <div style="background-color: #E9F5E9; border: 2px dashed #8AB6A3; border-radius: 14px; padding: 20px 16px; text-align: center; margin: 0 0 24px;">
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 700; letter-spacing: 12px; color: #2C3E50; padding-left: 12px;">
                  ${otpCode}
                </div>
              </div>

              <p style="font-size: 13px; color: #6B7A87; margin: 0 0 8px; line-height: 1.5;">
                This code is valid for <strong>10 minutes</strong>. Never share this code with anyone.
              </p>
              <p style="font-size: 12px; color: #8F9E99; margin: 0;">
                If you did not request this verification code, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAFBF9; border-top: 1px solid #E8EDE9; padding: 20px 32px; text-align: center; font-size: 12.5px; color: #6B7A87;">
              <p style="margin: 0 0 4px 0; font-size: 13px; color: #6B7A87;">
                Our Pregnancy &middot; Made with &#x1F90D; for expectant mothers
              </p>
              <p style="margin: 0; font-size: 12px; color: #8F9E99;">
                &copy; ${new Date().getFullYear()} Our Pregnancy. Dedicated to maternal care.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    const transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: userVal,
            pass: passVal,
        },
    });
    const mailOptions = {
        from: `"Our Pregnancy Team" <${userVal}>`,
        replyTo: "hello@ourpregnancy.in",
        to: cleanEmail,
        subject: `Your verification code: ${otpCode} — Our Pregnancy`,
        html: emailHtml,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[SMTP SUCCESS]: Verification OTP email delivered to ${cleanEmail}. Message ID: ${info.messageId}`);
        return { success: true, message: `Verification code sent to ${cleanEmail}` };
    }
    catch (err) {
        console.error(`[SMTP ERROR]: Failed to send OTP email to ${cleanEmail}:`, err?.message || err, err?.code, err?.response);
        throw new https_1.HttpsError("internal", `Could not dispatch verification email: ${err?.message || "SMTP transmission error"}`);
    }
});
/**
 * Validates a 6-digit OTP and marks the user as emailVerified in Firebase Authentication.
 */
exports.verifyOtp = (0, https_1.onCall)({ region: "asia-south1" }, async (request) => {
    const { email, otp } = request.data || {};
    if (!email || !otp) {
        throw new https_1.HttpsError("invalid-argument", "Email and 6-digit OTP code are required.");
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();
    const db = admin.firestore();
    const otpDocRef = db.collection("emailOtps").doc(cleanEmail);
    const otpDoc = await otpDocRef.get();
    if (!otpDoc.exists) {
        throw new https_1.HttpsError("not-found", "No active verification code found for this email. Please request a new code.");
    }
    const data = otpDoc.data();
    // Check expiry (10 minutes)
    if (Date.now() > (data.expiresAt || 0)) {
        await otpDocRef.delete();
        throw new https_1.HttpsError("deadline-exceeded", "This verification code has expired. Please request a new one.");
    }
    // Rate-limit check: Max 5 incorrect attempts
    if ((data.attempts || 0) >= 5) {
        await otpDocRef.delete();
        throw new https_1.HttpsError("resource-exhausted", "Too many incorrect attempts. Please request a new code.");
    }
    // Check code match
    if (data.otp !== cleanOtp) {
        await otpDocRef.update({ attempts: admin.firestore.FieldValue.increment(1) });
        const remaining = 5 - ((data.attempts || 0) + 1);
        throw new https_1.HttpsError("permission-denied", `Incorrect code. ${remaining > 0 ? `${remaining} attempt${remaining > 1 ? "s" : ""} remaining.` : "Please request a new code."}`);
    }
    // Correct OTP! Mark user as emailVerified in Firebase Authentication
    let targetUid = data.uid;
    try {
        if (!targetUid) {
            const userRec = await admin.auth().getUserByEmail(cleanEmail);
            targetUid = userRec.uid;
        }
        await admin.auth().updateUser(targetUid, { emailVerified: true });
    }
    catch (authErr) {
        console.error(`Failed to mark emailVerified in Auth for ${cleanEmail}:`, authErr);
        throw new https_1.HttpsError("internal", "Failed to update verification status.");
    }
    // Mark Firestore profile as verified
    if (targetUid) {
        await db.collection("users").doc(targetUid).set({
            isEmailVerified: true,
            updatedAt: Date.now(),
        }, { merge: true }).catch(console.warn);
    }
    // Delete redeemed OTP
    await otpDocRef.delete();
    return { success: true, message: "Email successfully verified!" };
});
//# sourceMappingURL=index.js.map