"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeFood = exports.parseDocument = exports.chatWithAI = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
// Define the secure secret that we will store in Firebase Secret Manager
const hfApiKey = (0, params_1.defineSecret)("HUGGINGFACE_API_KEY");
exports.chatWithAI = (0, https_1.onCall)({ secrets: [hfApiKey], region: "asia-south1" }, async (request) => {
    const { message, systemPrompt, maxTokens } = request.data;
    if (!message) {
        throw new https_1.HttpsError("invalid-argument", "Message is required.");
    }
    const apiKey = hfApiKey.value();
    if (!apiKey) {
        console.error("Missing Hugging Face API Key");
        throw new https_1.HttpsError("internal", "Server configuration error.");
    }
    const defaultSystemPrompt = "You are a helpful AI assistant for a pregnancy app called 'Project Bloom'. Keep answers short (1-3 sentences), encouraging, and rooted in safe medical guidelines. Do not provide dangerous medical advice. If you are unsure, advise them to consult a doctor.";
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
                        content: systemPrompt || defaultSystemPrompt
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
    const systemPrompt = `You are an expert prenatal nutritionist and clinical AI assistant. Analyze the food image and return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "identifiedItems": ["item1", "item2"],
  "macronutrients": { "protein_g": 0, "carbs_g": 0, "fats_g": 0, "fiber_g": 0 },
  "pregnancyCriticalMicronutrients": { "folate_mcg": 0, "iron_mg": 0, "calcium_mg": 0 },
  "isSafeForPregnancy": true,
  "hazardWarning": ""
}

Rules:
1. List all visible food items in identifiedItems.
2. Estimate macronutrients based on standard Indian portion sizes.
3. Estimate folate (mcg), iron (mg), and calcium (mg).
4. Set isSafeForPregnancy to false and fill hazardWarning if any of these are detected: raw/undercooked meat/eggs/seafood, unpasteurized dairy, high-mercury fish, raw sprouts, excessive caffeine (>200mg), or alcohol.
5. If safe, leave hazardWarning as empty string.
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
//# sourceMappingURL=index.js.map