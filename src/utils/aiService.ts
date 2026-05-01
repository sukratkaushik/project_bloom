import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || '';

// Hugging Face models to use as fallback
const HF_TEXT_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';
const HF_VISION_MODEL = 'Salesforce/blip-image-captioning-large';

export interface AIResponse {
  text: string;
  isFallback: boolean;
  error?: string;
}

export const generateAIContent = async (
  prompt: string,
  options: {
    systemInstruction?: string;
    temperature?: number;
    jsonMode?: boolean;
    image?: { data: string; mimeType: string };
  } = {}
): Promise<AIResponse> => {
  const { systemInstruction, temperature = 0.7, jsonMode = false, image } = options;

  // 1. Try Gemini first
  try {
    if (!GEMINI_API_KEY) throw new Error('Gemini API Key missing');

    const genAI = new GoogleGenAI(GEMINI_API_KEY);
    const modelId = image ? 'gemini-3-flash-preview' : 'gemini-3.1-pro-preview';
    
    const model = genAI.getGenerativeModel({
      model: modelId,
      generationConfig: {
        temperature,
        ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
      ...(systemInstruction ? { systemInstruction } : {}),
    });

    let result;
    if (image) {
      result = await model.generateContent([
        {
          inlineData: {
            data: image.data,
            mimeType: image.mimeType,
          },
        },
        { text: prompt },
      ]);
    } else {
      result = await model.generateContent(prompt);
    }

    const response = await result.response;
    return { text: response.text(), isFallback: false };

  } catch (error: any) {
    console.warn('Gemini AI failed or quota exhausted, falling back to Hugging Face:', error.message);
    
    // 2. Fallback to Hugging Face
    if (!HF_API_KEY) {
      return { 
        text: '', 
        isFallback: false, 
        error: 'Both Gemini and Hugging Face keys are missing or failed.' 
      };
    }

    try {
      const modelToUse = image ? HF_VISION_MODEL : HF_TEXT_MODEL;
      const url = `https://api-inference.huggingface.co/models/${modelToUse}`;
      
      const hfPrompt = systemInstruction 
        ? `[INST] ${systemInstruction}\n\nUser Question: ${prompt} [/INST]` 
        : prompt;

      const body = image 
        ? { inputs: image.data } // Simplistic fallback for vision
        : { 
            inputs: hfPrompt,
            parameters: { 
              max_new_tokens: 1000,
              temperature: Math.max(temperature, 0.1),
              return_full_text: false
            }
          };

      const hfResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!hfResponse.ok) {
        throw new Error(`HF API error: ${hfResponse.statusText}`);
      }

      const hfResult = await hfResponse.json();
      
      let text = '';
      if (Array.isArray(hfResult)) {
        text = hfResult[0]?.generated_text || hfResult[0]?.label || JSON.stringify(hfResult);
      } else {
        text = hfResult.generated_text || JSON.stringify(hfResult);
      }

      return { text, isFallback: true };

    } catch (hfErr: any) {
      console.error('Hugging Face fallback also failed:', hfErr.message);
      return { 
        text: '', 
        isFallback: false, 
        error: `AI Error: ${error.message}. Fallback also failed: ${hfErr.message}` 
      };
    }
  }
};
