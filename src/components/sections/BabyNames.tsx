import React, { useState } from 'react';
import { usePlanner } from '../../store';
import { 
  Sparkles, 
  Baby, 
  Heart, 
  Globe, 
  RefreshCw, 
  AlertCircle
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { CustomSelect } from '../CustomSelect';

export const BabyNames: React.FC = () => {
  const { state, toggleFavoriteName } = usePlanner();
  const [gender, setGender] = useState('Neutral');
  const [origin, setOrigin] = useState('Modern Indian');
  const [startingLetter, setStartingLetter] = useState('');
  const [keywords, setKeywords] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<{name: string, meaning: string, origin: string}[]>([]);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are a helpful assistant for expecting parents in India. Generate 6 beautiful, meaningful baby names based on these preferences:
      - Gender: ${gender}
      - Origin/Style: ${origin}
      ${startingLetter ? `- Must start with the letter: ${startingLetter}` : ''}
      ${keywords ? `- Themes/Keywords: ${keywords}` : ''}
      
      Respond STRICTLY in valid JSON format with an array of objects. Do not use markdown backticks around the json. Do not explain anything. 
      Schema:
      [
        {"name": "...", "meaning": "...", "origin": "..."}
      ]`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });
      
      const text = response.text || '';
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanText);
      
      if (Array.isArray(parsed)) {
        setSuggestions(parsed);
      } else {
        throw new Error("Invalid response format");
      }
      
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please securely try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const favoriteNames = state.favoriteNames || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Sparkles className="w-8 h-8 text-sage" />
        <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-normal text-charcoal">Name Boutique</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="bg-white border-[1.5px] border-border rounded-[16px] p-6 shadow-sm">
          <h3 className="font-semibold text-charcoal text-[17px] mb-5">AI Name Generator</h3>
          
          <div className="space-y-4">
            <div className="flex flex-col">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-light mb-1.5 ml-1">Gender focus</label>
              <div className="flex gap-2">
                {['Boy', 'Girl', 'Neutral'].map(g => (
                  <button 
                    key={g} 
                    onClick={() => setGender(g)}
                    className={`flex-1 py-2.5 rounded-[10px] text-[14px] font-medium border-[1.5px] transition-all
                      ${gender === g ? 'bg-sage-pale/40 border-sage text-sage' : 'border-border text-medium hover:border-medium/30'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-light mb-1.5 ml-1">Origin / Style</label>
              <CustomSelect 
                value={origin} 
                onChange={(val) => setOrigin(val)}
                className="w-full relative z-10"
                options={[
                  { label: 'Modern Indian (Short, easy to pronounce globally)', value: 'Modern Indian' },
                  { label: 'Traditional Sanskrit', value: 'Traditional Sanskrit' },
                  { label: 'Islamic / Arabic', value: 'Islamic / Arabic' },
                  { label: 'Sikh / Punjabi', value: 'Sikh / Punjabi' },
                  { label: 'Nature Inspired', value: 'Nature Inspired' },
                  { label: 'Global / Western', value: 'Global / Western' }
                ]}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-light mb-1.5 ml-1">Starting Letter (Optional)</label>
              <input 
                type="text" 
                maxLength={1}
                placeholder="e.g., A" 
                value={startingLetter} 
                onChange={e => setStartingLetter(e.target.value)} 
                className="p-3 border-[1.5px] border-border rounded-[10px] focus:border-sage focus:ring-[3px] focus:ring-sage/10 text-charcoal text-[15px] outline-none" 
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-light mb-1.5 ml-1">Specific meaning? (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g., light, warrior, ocean" 
                value={keywords} 
                onChange={e => setKeywords(e.target.value)} 
                className="p-3 border-[1.5px] border-border rounded-[10px] focus:border-sage focus:ring-[3px] focus:ring-sage/10 text-charcoal text-[15px] outline-none" 
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full mt-4 py-4 rounded-[12px] bg-sage text-white font-semibold flex flex-row items-center justify-center gap-2 transition-all hover:bg-sage-dark disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
            >
              {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {isGenerating ? 'Curating Names...' : 'Suggest Names'}
            </button>

            {error && (
              <div className="flex gap-2 text-critical text-[13px] bg-critical-bg p-3 rounded-[8px]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border-[1.5px] border-border rounded-[16px] shadow-sm flex flex-col h-full min-h-[400px]">
            <div className="px-6 py-4 border-b border-border bg-gray-50/50">
              <h3 className="font-semibold text-charcoal text-[17px]">Suggestions</h3>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              {!suggestions.length && !isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-medium space-y-3">
                  <Baby className="w-12 h-12 text-sage/40" />
                  <p className="text-[15px] max-w-[200px]">Tell AskOurPregnancy what you're looking for to unveil beautiful names.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestions.map((suggestion, idx) => {
                    const isFav = favoriteNames.includes(suggestion.name);
                    return (
                      <div key={idx} className="p-4 border-[1.5px] border-border rounded-[12px] bg-white transition-all hover:shadow-sm">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-serif text-[22px] text-charcoal font-medium leading-none mb-2">{suggestion.name}</h4>
                            <p className="text-[14px] text-medium leading-snug">{suggestion.meaning}</p>
                            <div className="flex items-center gap-1.5 mt-2.5">
                              <Globe className="w-3.5 h-3.5 text-sage" />
                              <span className="text-[11px] font-semibold text-sage uppercase tracking-wide">{suggestion.origin}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => toggleFavoriteName(suggestion.name)}
                            className="p-2 -mr-2 -mt-2 rounded-full hover:bg-gray-50 transition-colors"
                          >
                            <Heart className={`w-5 h-5 transition-colors ${isFav ? 'fill-sage text-sage' : 'text-medium'}`} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Favorites List */}
      {favoriteNames.length > 0 && (
        <div className="bg-white border-[1.5px] border-border rounded-[16px] p-6 shadow-sm">
          <h3 className="font-semibold text-charcoal text-[17px] mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-sage" fill="currentColor" /> 
            Saved Favorites
          </h3>
          <div className="flex flex-wrap gap-2">
            {favoriteNames.map((name) => (
              <div key={name} className="flex items-center gap-1.5 bg-sage-pale text-sage pl-3 pr-1 py-1 rounded-full text-[14px] font-medium border border-sage/20">
                {name}
                <button 
                  onClick={() => toggleFavoriteName(name)} 
                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-sage/20"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
