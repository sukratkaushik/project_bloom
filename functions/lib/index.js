"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithAI = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
// Define the secure secret that we will store in Firebase Secret Manager
const hfApiKey = (0, params_1.defineSecret)("HUGGINGFACE_API_KEY");
exports.chatWithAI = (0, https_1.onCall)({ secrets: [hfApiKey] }, async (request) => {
    const { message } = request.data;
    if (!message) {
        throw new https_1.HttpsError("invalid-argument", "Message is required.");
    }
    const apiKey = hfApiKey.value();
    if (!apiKey) {
        console.error("Missing Hugging Face API Key");
        throw new https_1.HttpsError("internal", "Server configuration error.");
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
                        content: "You are a helpful AI assistant for a pregnancy app called 'Project Bloom'. Keep answers short (1-3 sentences), encouraging, and rooted in safe medical guidelines. Do not provide dangerous medical advice. If you are unsure, advise them to consult a doctor."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                max_tokens: 150,
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
//# sourceMappingURL=index.js.map