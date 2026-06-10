import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import crypto from "crypto";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Define the secure secret that we will store in Firebase Secret Manager
const hfApiKey = defineSecret("HUGGINGFACE_API_KEY");
const razorpayKeyId = defineSecret("RAZORPAY_KEY_ID");
const razorpayKeySecret = defineSecret("RAZORPAY_KEY_SECRET");

export const chatWithAI = onCall(
  { secrets: [hfApiKey], region: "asia-south1" },
  async (request) => {
    const { message, systemPrompt, maxTokens } = request.data;

    if (!message) {
      throw new HttpsError("invalid-argument", "Message is required.");
    }

    const apiKey = hfApiKey.value();

    if (!apiKey) {
      console.error("Missing Hugging Face API Key");
      throw new HttpsError("internal", "Server configuration error.");
    }

    const defaultSystemPrompt = "You are a helpful AI assistant for a pregnancy app called 'Project Bloom'. Keep answers short (1-3 sentences), encouraging, and rooted in safe medical guidelines. Do not provide dangerous medical advice. If you are unsure, advise them to consult a doctor.";

    const scopeConstraint = "\n\nCRITICAL SCOPE CONSTRAINT: You are strictly limited to answering questions related to pregnancy, maternal health, prenatal/postpartum care, fetal/baby development, baby naming, or pregnancy tracking/planning. If the user asks about unrelated topics (such as computer programming, writing code, general IT, non-pregnancy math, history, general knowledge, etc.), you MUST reply with exactly: 'I can not help with this, please ask me something related to what I am meant for...' and nothing else. Do not explain, do not apologize, and do not output anything else.";

    const finalSystemPrompt = (systemPrompt || defaultSystemPrompt) + scopeConstraint;

    try {
      const response = await fetch(
        "https://router.huggingface.co/v1/chat/completions",
        {
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
        }
      );

      const result = await response.json();

      if (result.choices && result.choices.length > 0 && result.choices[0].message) {
        return { reply: result.choices[0].message.content.trim() };
      } else if (result.error) {
        console.error("HF Error:", result.error);
        throw new HttpsError("internal", "AI Error.");
      }

      return { reply: "I'm having trouble connecting right now. Please try again." };

    } catch (error) {
      console.error("Fetch Error:", error);
      throw new HttpsError("internal", "Unable to connect to AI.");
    }
  }
);

export const parseDocument = onCall(
  { region: "asia-south1", memory: "512MiB" },
  async (request) => {
    const { base64Data, fileName } = request.data;

    if (!base64Data) {
      throw new HttpsError("invalid-argument", "No document data provided.");
    }

    try {
      const buffer = Buffer.from(base64Data, "base64");

      // We only support PDFs via this endpoint for now
      if (fileName.toLowerCase().endsWith('.pdf')) {
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(buffer);
        return { text: data.text };
      } else {
        throw new HttpsError("invalid-argument", "Only PDF files are supported by this parser.");
      }
    } catch (error) {
      console.error("Document Parse Error:", error);
      throw new HttpsError("internal", "Failed to parse document.");
    }
  }
);
export const analyzeFood = onCall(
  { secrets: [hfApiKey], region: "asia-south1", memory: "512MiB" },
  async (request) => {
    const { base64Data, mimeType } = request.data;

    if (!base64Data || !mimeType) {
      throw new HttpsError("invalid-argument", "Image data and mimeType are required.");
    }

    const apiKey = hfApiKey.value();
    if (!apiKey) {
      throw new HttpsError("internal", "Server configuration error.");
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
      const response = await fetch(
        "https://router.huggingface.co/v1/chat/completions",
        {
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
        }
      );

      const result = await response.json();

      if (result.choices && result.choices.length > 0 && result.choices[0].message) {
        let content = result.choices[0].message.content.trim();
        // Strip any markdown code fences if the model adds them
        content = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
        try {
          const parsed = JSON.parse(content);
          return parsed;
        } catch (parseErr) {
          console.error("JSON parse error from model output:", content);
          throw new HttpsError("internal", "Failed to parse AI response.");
        }
      } else if (result.error) {
        console.error("HF VL Error:", result.error);
        throw new HttpsError("internal", `AI model error: ${result.error.message || "Unknown error"}`);
      }

      throw new HttpsError("internal", "No response from AI model.");
    } catch (error: any) {
      console.error("analyzeFood Error:", error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError("internal", "Failed to analyze food image.");
    }
  }
);

export const analyzeMedicalReport = onCall(
  { secrets: [hfApiKey], region: "asia-south1", memory: "512MiB", timeoutSeconds: 120 },
  async (request) => {
    const { base64Data, fileType, fileName } = request.data;

    if (!base64Data || !fileType || !fileName) {
      throw new HttpsError("invalid-argument", "base64Data, fileType, and fileName are required.");
    }

    const apiKey = hfApiKey.value();
    if (!apiKey) {
      throw new HttpsError("internal", "Server configuration error: Hugging Face API key is missing.");
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
          throw new HttpsError(
            "invalid-argument",
            "This PDF file appears to be a scanned image containing no extractable text. Please upload the report as an image (PNG, JPG, WebP) to analyze the visual scan."
          );
        }

        const response = await fetch(
          "https://router.huggingface.co/v1/chat/completions",
          {
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
          }
        );

        const result = await response.json();
        return parseResponseContent(result);

      } else if (fileType.startsWith("image/")) {
        const response = await fetch(
          "https://router.huggingface.co/v1/chat/completions",
          {
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
          }
        );

        const result = await response.json();
        return parseResponseContent(result);

      } else {
        throw new HttpsError("invalid-argument", "Unsupported file type. Only PDFs and images are supported.");
      }

    } catch (error: any) {
      console.error("analyzeMedicalReport Error:", error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError("internal", error.message || "Failed to analyze medical report.");
    }
  }
);

function parseResponseContent(result: any) {
  if (result.choices && result.choices.length > 0 && result.choices[0].message) {
    let content = result.choices[0].message.content.trim();
    content = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    try {
      return JSON.parse(content);
    } catch (parseErr) {
      console.error("JSON parse error from model output:", content);
      throw new HttpsError("internal", "Failed to parse AI response. The model output was not valid JSON.");
    }
  } else if (result.error) {
    console.error("HF API Error:", result.error);
    throw new HttpsError("internal", `AI model error: ${result.error.message || "Unknown error"}`);
  }
  throw new HttpsError("internal", "No response received from AI model.");
}

/**
 * Creates a secure payment order via Razorpay API
 */
export const createPaymentOrder = onCall(
  { secrets: [razorpayKeyId, razorpayKeySecret], region: "asia-south1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication is required.");
    }

    const { planTier, months } = request.data;
    if (!['standard', 'premium'].includes(planTier) || !months) {
      throw new HttpsError("invalid-argument", "Valid planTier and months are required.");
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
    } catch (err: any) {
      console.error("Razorpay order creation error:", err);
      throw new HttpsError("internal", `Payment gateway error: ${err.message || "Unknown error"}`);
    }
  }
);

/**
 * Securely verifies payment signature and updates user's plan state in Firestore
 */
export const verifyPaymentSignature = onCall(
  { secrets: [razorpayKeySecret], region: "asia-south1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication is required.");
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planTier, months } = request.data;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planTier || !months) {
      throw new HttpsError("invalid-argument", "Missing required verification parameters.");
    }

    const secret = razorpayKeySecret.value();
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      throw new HttpsError("permission-denied", "Payment verification failed: invalid signature.");
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
  }
);

