import React, { useState } from 'react';
import { usePlanner } from '../../store';
import {
  Sparkles,
  Baby,
  Heart,
  Globe,
  RefreshCw,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { CustomSelect } from '../CustomSelect';
import { ContextBanner } from '../ContextBanner';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';
import { triggerHaptic } from '../../utils/nativeBridge';

const QUICK_THEMES = [
  '☀️ Light & Radiance',
  '🌊 Peace & Calm',
  '🌿 Nature & Earth',
  '🦁 Strength & Courage',
  '🌸 Grace & Devotion',
  '✨ Star & Celestial'
];

const FALLBACK_NAMES = [
  { name: 'Advait', meaning: 'Unique, non-dual, spiritual oneness', origin: 'Sanskrit', gender: 'Boy', style: 'Traditional Sanskrit' },
  { name: 'Aarav', meaning: 'Peaceful, calm wisdom and harmony', origin: 'Sanskrit', gender: 'Boy', style: 'Modern' },
  { name: 'Ananya', meaning: 'Incomparable, matchless grace', origin: 'Sanskrit', gender: 'Girl', style: 'Traditional Sanskrit' },
  { name: 'Diya', meaning: 'Radiant light, lamp of hope', origin: 'Hindi / Sanskrit', gender: 'Girl', style: 'Modern' },
  { name: 'Ishan', meaning: 'The sun, lord of auspicious wealth', origin: 'Sanskrit', gender: 'Boy', style: 'Traditional Sanskrit' },
  { name: 'Kabir', meaning: 'Great, revered poet-saint of truth', origin: 'Indian / Arabic', gender: 'Neutral', style: 'Modern' },
  { name: 'Mira', meaning: 'Prosperous, sea of devotion and grace', origin: 'Sanskrit / Global', gender: 'Girl', style: 'Modern' },
  { name: 'Neil', meaning: 'Champion, sapphire blue, radiant sky', origin: 'Gaelic / Sanskrit', gender: 'Boy', style: 'Modern' },
  { name: 'Reyansh', meaning: 'First ray of the morning sun, Lord Vishnu', origin: 'Sanskrit', gender: 'Boy', style: 'Modern' },
  { name: 'Tara', meaning: 'Guiding star, radiant shining protector', origin: 'Sanskrit / Global', gender: 'Girl', style: 'Modern' },
  { name: 'Vivaan', meaning: 'Full of life, dawn rays of morning sun', origin: 'Sanskrit', gender: 'Boy', style: 'Modern' },
  { name: 'Zara', meaning: 'Radiance, blooming flower, dawn', origin: 'Arabic / Global', gender: 'Girl', style: 'Modern' },
  { name: 'Arin', meaning: 'Mountain of strength, enlightened peace', origin: 'Sanskrit / Global', gender: 'Neutral', style: 'Modern' },
  { name: 'Kiaan', meaning: 'Grace of God, ancient king, royal heritage', origin: 'Sanskrit', gender: 'Boy', style: 'Modern' },
  { name: 'Sia', meaning: 'Goddess Sita, white moonlight, beautiful', origin: 'Sanskrit', gender: 'Girl', style: 'Modern' },
  { name: 'Zoya', meaning: 'Loving, caring, alive and joyous', origin: 'Global / Arabic', gender: 'Girl', style: 'Modern' },
  { name: 'Reva', meaning: 'Narmada river, star, graceful movement', origin: 'Sanskrit', gender: 'Girl', style: 'Traditional Sanskrit' },
  { name: 'Dev', meaning: 'Divine, shining, godlike spirit', origin: 'Sanskrit', gender: 'Boy', style: 'Traditional Sanskrit' },
  { name: 'Ayla', meaning: 'Oak tree, halo of light around moon', origin: 'Global / Turkish', gender: 'Girl', style: 'Nature Inspired' },
  { name: 'Bodhi', meaning: 'Awakening, spiritual enlightenment', origin: 'Sanskrit', gender: 'Neutral', style: 'Nature Inspired' },
  { name: 'Ishani', meaning: 'Consort of Shiva, ruling goddess of strength', origin: 'Sanskrit', gender: 'Girl', style: 'Traditional Sanskrit' },
  { name: 'Yuvan', meaning: 'Youthful vigor, Lord Shiva', origin: 'Sanskrit', gender: 'Boy', style: 'Modern' }
];

export const BabyNames: React.FC = () => {
  const { state, toggleFavoriteName } = usePlanner();
  const [gender, setGender] = useState('Neutral');
  const [origin, setOrigin] = useState('Modern');
  const [startingLetter, setStartingLetter] = useState('');
  const [keywords, setKeywords] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<{ name: string, meaning: string, origin: string }[]>([]);
  const [error, setError] = useState('');

  const [copiedFavorites, setCopiedFavorites] = useState(false);

  const handleCopyFavorites = () => {
    if (!favoriteNames.length) return;
    triggerHaptic('success');
    navigator.clipboard.writeText(favoriteNames.join(', '));
    setCopiedFavorites(true);
    setTimeout(() => setCopiedFavorites(false), 2000);
  };

  const handleGenerate = async () => {
    triggerHaptic('medium');
    setIsGenerating(true);
    setError('');

    try {
      const prompt = `Generate 6 beautiful, meaningful baby names based on these preferences:
      - Gender: ${gender}
      - Origin/Style: ${origin}
      ${startingLetter ? `- Must start with the letter: ${startingLetter}` : ''}
      ${keywords ? `- Themes/Keywords: ${keywords}` : ''}
      
      Respond STRICTLY in valid JSON format with an array of objects. Do not use markdown backticks around the json. Do not explain anything. 
      Schema:
      [
        {"name": "...", "meaning": "...", "origin": "..."}
      ]`;

      const systemPrompt = `You are a helpful assistant for expecting parents. You suggest beautiful baby names. Always respond with ONLY valid JSON — no markdown, no explanation, no extra text.`;

      const chatWithAI = httpsCallable(functions, 'chatWithAI');
      const response = await chatWithAI({ message: prompt, systemPrompt });
      const result = response.data as { reply: string };

      const cleanText = result.reply.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanText);

      if (Array.isArray(parsed) && parsed.length > 0) {
        setSuggestions(parsed);
        triggerHaptic('success');
      } else {
        throw new Error("Invalid response format");
      }

    } catch (err) {
      console.warn("AI generation fallback to offline curated name bank:", err);
      // Fallback to offline curated database
      let filtered = FALLBACK_NAMES.filter(n => {
        if (gender !== 'Neutral' && n.gender !== gender && n.gender !== 'Neutral') return false;
        if (startingLetter && !n.name.toUpperCase().startsWith(startingLetter.toUpperCase())) return false;
        return true;
      });
      if (filtered.length === 0) {
        filtered = FALLBACK_NAMES.filter(n => gender === 'Neutral' || n.gender === gender || n.gender === 'Neutral');
      }
      const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 6);
      if (shuffled.length > 0) {
        setSuggestions(shuffled.map(s => ({ name: s.name, meaning: s.meaning, origin: s.origin })));
        triggerHaptic('success');
      } else {
        setError('Unable to curate suggestions. Please check your network or adjust filters.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const favoriteNames = state.favoriteNames || [];

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200 max-w-4xl mx-auto pb-12">
      {/* Context Banner */}
      <ContextBanner 
        description="Discover meaningful, culturally resonant baby names rooted in Vedic Sanskrit, traditional Indian heritages, and short globally-phonetic styles. Filter by gender, auspicious starting syllables, and inspiring life themes to curate and shortlist favorites for your little one." 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Form Section */}
        <div className="bg-white border border-border/80 rounded-3xl p-5 sm:p-6 shadow-xs">
          <h3 className="font-serif text-[17px] font-bold text-charcoal mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-sage" />
            <span>Name Preferences</span>
          </h3>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-medium">
                Gender Focus
              </label>
              <div className="flex gap-2">
                {['Boy', 'Girl', 'Neutral'].map(g => {
                  const isSelected = gender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setGender(g);
                      }}
                      className={`flex-1 h-10 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-sage-dark text-white shadow-2xs border border-sage-dark' 
                          : 'bg-cream text-charcoal/70 hover:text-charcoal hover:bg-cream-dark/60 border border-border/70'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-medium">
                Origin / Style
              </label>
              <CustomSelect
                value={origin}
                onChange={(val) => setOrigin(val)}
                className="w-full relative z-10"
                options={[
                  { label: 'Modern (Short & globally phonetic)', value: 'Modern' },
                  { label: 'Traditional Sanskrit', value: 'Traditional Sanskrit' },
                  { label: 'Islamic / Arabic', value: 'Islamic / Arabic' },
                  { label: 'Sikh / Punjabi', value: 'Sikh / Punjabi' },
                  { label: 'Nature Inspired', value: 'Nature Inspired' },
                  { label: 'Global / Western', value: 'Global / Western' }
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-medium">
                  Starting Letter (Optional)
                </label>
                <input
                  type="text"
                  maxLength={1}
                  placeholder="e.g. A"
                  value={startingLetter}
                  onChange={e => setStartingLetter(e.target.value.toUpperCase())}
                  className="px-3.5 py-2.5 border border-border/80 rounded-xl text-[13.5px] text-charcoal bg-cream/40 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-medium">
                  Meaning / Theme (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. light, ocean, brave"
                  value={keywords}
                  onChange={e => setKeywords(e.target.value)}
                  className="px-3.5 py-2.5 border border-border/80 rounded-xl text-[13.5px] text-charcoal bg-cream/40 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
                />
              </div>
            </div>

            {/* Quick Inspiration Pills */}
            <div className="space-y-1.5 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60">
                Quick Theme Inspirations
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_THEMES.map(theme => {
                  const keyword = theme.split(' ')[1] || theme;
                  const isSelected = keywords.toLowerCase() === keyword.toLowerCase();
                  return (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setKeywords(keyword);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sage-dark text-white shadow-3xs'
                          : 'bg-cream text-charcoal/70 hover:bg-border/60 hover:text-charcoal border border-border/60'
                      }`}
                    >
                      {theme}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full h-12 mt-2 rounded-xl bg-sage-dark hover:bg-sage text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-2xs active:scale-[0.98] cursor-pointer"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isGenerating ? 'Curating Names...' : 'Suggest Names'}</span>
            </button>

            {error && (
              <div className="flex items-center gap-2 text-critical text-[12px] bg-critical-bg p-3 rounded-xl border border-critical/30">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white border border-border/80 rounded-3xl shadow-xs flex flex-col min-h-[380px] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/60 bg-cream/40 flex items-center justify-between">
            <h3 className="font-serif text-[16px] font-bold text-charcoal">Curated Suggestions</h3>
            {suggestions.length > 0 && (
              <span className="text-[11px] font-bold text-sage-dark bg-sage-pale px-2.5 py-0.5 rounded-full">
                {suggestions.length} ideas
              </span>
            )}
          </div>

          <div className="flex-1 p-4 sm:p-5 overflow-y-auto">
            {!suggestions.length && !isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-medium">
                <Baby className="w-10 h-10 text-sage/40 mb-2" />
                <p className="text-[14px] font-bold text-charcoal">Ready to explore</p>
                <p className="text-[12px] text-light mt-0.5 max-w-xs">Select your preferences and tap "Suggest Names" to view curated suggestions.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {suggestions.map((suggestion, idx) => {
                  const isFav = favoriteNames.includes(suggestion.name);
                  return (
                    <div 
                      key={idx} 
                      className="p-3.5 rounded-2xl bg-cream/40 border border-border/70 hover:border-sage/40 transition-all flex items-start justify-between gap-3 shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-[18px] text-charcoal font-bold leading-tight">
                            {suggestion.name}
                          </h4>
                          <span className="text-[10px] font-bold text-sage-dark bg-sage-pale px-2 py-0.2 rounded-md">
                            {suggestion.origin}
                          </span>
                        </div>
                        <p className="text-[12.5px] text-medium mt-1 leading-snug">
                          {suggestion.meaning}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          toggleFavoriteName(suggestion.name);
                        }}
                        className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                          isFav ? 'text-coral bg-coral/10' : 'text-light hover:text-charcoal hover:bg-white'
                        }`}
                        aria-label="Toggle favorite"
                      >
                        <Heart size={17} fill={isFav ? 'currentColor' : 'none'} className={isFav ? 'text-rose-500' : ''} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Favorites List */}
      {favoriteNames.length > 0 && (
        <div className="bg-white border border-border/80 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif text-[16px] font-bold text-charcoal flex items-center gap-2">
              <Heart size={16} className="text-rose-500 fill-rose-500" />
              <span>Saved Favorites</span>
              <span className="text-[11px] font-bold text-sage-dark bg-sage-pale px-2 py-0.2 rounded-full">
                {favoriteNames.length}
              </span>
            </h3>

            <button
              type="button"
              onClick={handleCopyFavorites}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold text-charcoal/70 hover:text-charcoal bg-cream hover:bg-border/60 border border-border/70 transition-colors cursor-pointer"
              title="Copy favorites shortlist"
            >
              {copiedFavorites ? (
                <>
                  <Check size={13} className="text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy List</span>
                </>
              )}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {favoriteNames.map((name) => (
              <div 
                key={name} 
                className="inline-flex items-center gap-1.5 bg-sage-pale text-sage-dark pl-3 pr-1.5 py-1 rounded-xl text-[13px] font-bold border border-sage/30 shadow-2xs"
              >
                <span>{name}</span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    toggleFavoriteName(name);
                  }}
                  className="w-5 h-5 rounded-lg flex items-center justify-center hover:bg-sage/20 text-sage-dark cursor-pointer transition-colors"
                  aria-label="Remove favorite"
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
