import React, { useState, useRef } from 'react';
import { usePlanner } from '../../store';
import { GoogleGenAI, Type } from '@google/genai';
import { Upload, AlertTriangle, CheckCircle, Loader2, Bot, Sparkles } from 'lucide-react';
import { Paywall } from '../Paywall';

interface ScanResult {
  identifiedItems: string[];
  macronutrients: {
    protein_g: number;
    carbs_g: number;
    fats_g: number;
    fiber_g: number;
  };
  pregnancyCriticalMicronutrients: {
    folate_mcg: number;
    iron_mg: number;
    calcium_mg: number;
  };
  isSafeForPregnancy: boolean;
  hazardWarning: string;
}

export const FoodScanner: React.FC = () => {
  const { state } = usePlanner();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setResult(null);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!imagePreview || !imageFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const base64Data = imagePreview.split(',')[1];
      const mimeType = imageFile.type;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              },
              {
                text: "Analyze this food image and provide the nutritional breakdown and pregnancy safety assessment.",
              }
            ],
          },
        ],
        config: {
          systemInstruction: `You are an expert prenatal nutritionist and clinical AI assistant. Your task is to analyze images of food, meals, or ingredient labels and provide a detailed, structured nutritional assessment specifically tailored for a pregnant user.

**CORE OBJECTIVES:**
1. Identify all visible food items, ingredients, or components in the provided image.
2. Calculate or estimate macronutrients (protein, carbohydrates, fats, fiber) based on standard portion sizes if exact label data is not visible.
3. Calculate or estimate three pregnancy-critical micronutrients: Folate (mcg), Iron (mg), and Calcium (mg).
4. Evaluate the food for pregnancy safety and flag any potential hazards.

**PREGNANCY SAFETY PROTOCOL:**
You must default to caution. If an item is ambiguous (e.g., a soft cheese that might be unpasteurized, or sushi where the fish type is unclear), assume the higher risk and flag it. 
Specifically, you MUST detect and flag the following hazards:
- Unpasteurized (raw) dairy products
- High-mercury fish species (e.g., shark, swordfish, king mackerel, tilefish, bigeye tuna)
- Raw or undercooked meat, poultry, eggs, or seafood (including most sushi)
- Raw sprouts (alfalfa, clover, radish, mung bean)
- Excessive caffeine content (anything exceeding 200mg per serving)
- Alcohol

**TONE & COMMUNICATION:**
- Maintain clinical accuracy while being reassuring and non-alarmist. 
- If a hazard is detected, explain *why* it is a risk in a calm, educational manner.
- If the food is safe, leave the hazard warning empty.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              identifiedItems: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of all visible food items or ingredients.",
              },
              macronutrients: {
                type: Type.OBJECT,
                properties: {
                  protein_g: { type: Type.NUMBER },
                  carbs_g: { type: Type.NUMBER },
                  fats_g: { type: Type.NUMBER },
                  fiber_g: { type: Type.NUMBER },
                },
                required: ["protein_g", "carbs_g", "fats_g", "fiber_g"],
              },
              pregnancyCriticalMicronutrients: {
                type: Type.OBJECT,
                properties: {
                  folate_mcg: { type: Type.NUMBER },
                  iron_mg: { type: Type.NUMBER },
                  calcium_mg: { type: Type.NUMBER },
                },
                required: ["folate_mcg", "iron_mg", "calcium_mg"],
              },
              isSafeForPregnancy: {
                type: Type.BOOLEAN,
                description: "True if safe to consume during pregnancy, false if hazards are detected.",
              },
              hazardWarning: {
                type: Type.STRING,
                description: "Detailed warning if hazards are detected. Empty string if safe.",
              },
            },
            required: [
              "identifiedItems",
              "macronutrients",
              "pregnancyCriticalMicronutrients",
              "isSafeForPregnancy",
              "hazardWarning"
            ],
          },
          temperature: 0.2,
        },
      });

      const resultText = response.text || "{}";
      const parsedResult = JSON.parse(resultText) as ScanResult;
      setResult(parsedResult);
    } catch (err) {
      console.error("Error analyzing image:", err);
      setError("Failed to analyze the image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Paywall featureName="FoodScanner">
      <div className="animate-in fade-in duration-300">
        <div className="mb-7">
          <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-normal mb-1.5 flex items-center gap-3">
            <Bot className="text-sage" size={32} /> Our Pregnancy AI Food Guide
          </h2>
          {!state.isCalmModeActive && (
            <p className="text-[14px] text-medium max-w-[560px] leading-[1.7]">
              Upload a photo of your meal, Indian snack, or food label to get an AI nutritional breakdown and pregnancy safety check.
            </p>
          )}
        </div>

      <div className="bg-white p-6 rounded-[16px] border-[1.5px] border-border shadow-sm mb-8">
        {!imagePreview ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-[12px] p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-sage-pale/30 transition-colors"
          >
            <Upload size={32} className="text-sage mb-3" />
            <h3 className="font-medium text-charcoal mb-1">Upload food image</h3>
            <p className="text-[13px] text-light">JPEG, PNG, WEBP up to 5MB</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="relative rounded-[12px] overflow-hidden border-[1.5px] border-border bg-cream flex justify-center">
              <img src={imagePreview} alt="Food preview" className="max-h-[300px] object-contain" />
              <button 
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  setResult(null);
                }}
                className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-charcoal text-[12px] font-medium px-3 py-1.5 rounded-full shadow-sm hover:bg-white transition-colors"
              >
                Change Image
              </button>
            </div>
            
            {!result && (
              <button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="w-full p-[14px] bg-sage text-white rounded-[10px] font-sans text-[14px] font-semibold tracking-[0.4px] cursor-pointer transition-all hover:bg-sage-dark disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Analyzing Nutrition & Safety...
                  </>
                ) : (
                  <>
                    <Bot size={18} /> Analyze Food with Our Pregnancy AI
                  </>
                )}
              </button>
            )}
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageChange} 
          accept="image/jpeg, image/png, image/webp" 
          className="hidden" 
        />

        {error && (
          <div className="mt-4 p-4 bg-critical-bg text-critical rounded-[10px] text-[13px] flex items-start gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-5 animate-in slide-in-from-bottom-4 duration-500">
            {/* Safety Banner */}
            <div className={`p-4 rounded-[12px] flex items-start gap-3 ${result.isSafeForPregnancy ? 'bg-sage-pale border border-sage/20' : 'bg-critical-bg border border-critical/20'}`}>
              {result.isSafeForPregnancy ? (
                <CheckCircle className="text-sage shrink-0 mt-0.5" size={20} />
              ) : (
                <AlertTriangle className="text-critical shrink-0 mt-0.5" size={20} />
              )}
              <div>
                <h4 className={`font-semibold text-[15px] mb-1 ${result.isSafeForPregnancy ? 'text-sage-dark' : 'text-critical'}`}>
                  {result.isSafeForPregnancy ? 'Looks safe for pregnancy' : 'Pregnancy Safety Warning'}
                </h4>
                {result.hazardWarning && (
                  <p className={`text-[13px] leading-[1.5] ${result.isSafeForPregnancy ? 'text-sage-dark/80' : 'text-critical/90'}`}>
                    {result.hazardWarning}
                  </p>
                )}
              </div>
            </div>

            {/* Identified Items */}
            <div>
              <h4 className="text-[11px] font-semibold tracking-[1.2px] uppercase text-medium mb-2">Identified Items</h4>
              <div className="flex flex-wrap gap-2">
                {result.identifiedItems.map((item, idx) => (
                  <span key={idx} className="bg-cream border border-border px-3 py-1 rounded-full text-[13px] text-charcoal capitalize">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Macronutrients */}
              <div className="border-[1.5px] border-border rounded-[12px] p-4">
                <h4 className="text-[11px] font-semibold tracking-[1.2px] uppercase text-medium mb-3">Macronutrients</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-light">Protein</span>
                    <span className="font-medium text-charcoal">{result.macronutrients.protein_g}g</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-light">Carbs</span>
                    <span className="font-medium text-charcoal">{result.macronutrients.carbs_g}g</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-light">Fats</span>
                    <span className="font-medium text-charcoal">{result.macronutrients.fats_g}g</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-light">Fiber</span>
                    <span className="font-medium text-charcoal">{result.macronutrients.fiber_g}g</span>
                  </div>
                </div>
              </div>

              {/* Micronutrients */}
              <div className="border-[1.5px] border-border rounded-[12px] p-4 bg-sage-pale/30">
                <h4 className="text-[11px] font-semibold tracking-[1.2px] uppercase text-sage mb-3">Key Prenatal Nutrients</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-sage-dark">Folate</span>
                    <span className="font-medium text-sage-dark">{result.pregnancyCriticalMicronutrients.folate_mcg}mcg</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-sage-dark">Iron</span>
                    <span className="font-medium text-sage-dark">{result.pregnancyCriticalMicronutrients.iron_mg}mg</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-sage-dark">Calcium</span>
                    <span className="font-medium text-sage-dark">{result.pregnancyCriticalMicronutrients.calcium_mg}mg</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-[11px] text-light italic text-center mt-2">
              *Nutritional values are estimates based on standard portion sizes. Always consult your healthcare provider.
            </div>
          </div>
        )}
      </div>
    </div>
    </Paywall>
  );
};
