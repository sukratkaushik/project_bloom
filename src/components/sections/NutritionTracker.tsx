import React, { useState, useMemo } from 'react';
import { usePlanner } from '../../store';
import { db } from '../../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { 
  Pill, 
  Leaf, 
  Info, 
  Check, 
  Droplets, 
  Heart, 
  Plus, 
  Trash2,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Utensils
} from 'lucide-react';

const SUPPLEMENTS = [
  { id: 'folic', name: 'Folic Acid', dose: '400-800mcg', tooltip: 'Prevents neural tube defects', t1: true, t2: true, t3: true },
  { id: 'vitD', name: 'Vitamin D', dose: '400IU', tooltip: 'Bone development and immunity', t1: true, t2: true, t3: true },
  { id: 'iron', name: 'Iron', dose: '60mg', tooltip: 'Prevents anaemia, supports baby’s growth', t1: false, t2: true, t3: true },
  { id: 'dha', name: 'DHA / Omega-3', dose: '200mg', tooltip: 'Brain and eye development', t1: true, t2: true, t3: true },
  { id: 'calcium', name: 'Calcium', dose: '1000mg', tooltip: 'Bone and teeth development', t1: false, t2: true, t3: true },
  { id: 'iodine', name: 'Iodine', dose: '150mcg', tooltip: 'Thyroid function & cognitive health', t1: false, t2: true, t3: true },
  { id: 'magnesium', name: 'Magnesium', dose: 'Varies', tooltip: 'Reduces muscle & leg cramps', t1: false, t2: false, t3: true },
  { id: 'prenatal', name: 'Prenatal Multivitamin', dose: '1 tablet', tooltip: 'Comprehensive vitamin cover', t1: true, t2: true, t3: true },
];

const FOOD_DATABASE = [
  { name: 'Dal (all types)', type: 'SAFE', desc: 'Excellent source of maternal folate & plant protein' },
  { name: 'Ragi (finger millet)', type: 'SAFE', desc: 'Highest natural calcium of any whole grain' },
  { name: 'Palak (spinach)', type: 'SAFE', desc: 'Natural iron and essential folates' },
  { name: 'Dahi / Curd', type: 'SAFE', desc: 'Gut probiotics & easily digestible calcium' },
  { name: 'Paneer (fresh)', type: 'SAFE', desc: 'Rich in gentle protein & bone-building calcium' },
  { name: 'Coconut Water', type: 'SAFE', desc: 'Natural potassium & electrolyte hydration' },
  { name: 'Amla (gooseberry)', type: 'SAFE', desc: 'Rich in Vitamin C; boosts iron absorption' },
  { name: 'Dates (khajoor)', type: 'SAFE', desc: 'Natural iron, dietary fiber & sustained energy' },
  { name: 'Chai / Tea', type: 'CAUTION', desc: 'Limit to 1-2 small cups/day; high caffeine can inhibit iron' },
  { name: 'Papad & Pickles', type: 'CAUTION', desc: 'High sodium content; enjoy sparingly if monitoring BP' },
  { name: 'Maida sweets / Bakery', type: 'CAUTION', desc: 'High refined carbs; eat in gentle moderation' },
  { name: 'Street food & Chaat', type: 'CAUTION', desc: 'Hygiene risk; choose clean, trusted home-made options' },
  { name: 'Raw papaya (kaccha)', type: 'AVOID', desc: 'Contains latex enzymes that may stimulate uterine contractions' },
  { name: 'Pineapple (in large amts)', type: 'AVOID', desc: 'Bromelain enzymes in heavy quantity can soften cervix' },
  { name: 'Raw / undercooked meat', type: 'AVOID', desc: 'Toxoplasma & Listeria bacterial risks' },
  { name: 'Unpasteurised dairy', type: 'AVOID', desc: 'Risk of Listeria infection; ensure milk & cheese are pasteurised' },
  { name: 'Raw sprouts (ankurit)', type: 'AVOID', desc: 'Warm humid sprouting encourages Salmonella growth; steam before eating' },
  { name: 'Alcohol', type: 'AVOID', desc: 'Crosses placenta directly; no safe amount during pregnancy' },
];

export const NutritionTracker: React.FC = () => {
  const { state, addCustomSupplement, deleteCustomSupplement } = usePlanner();
  const [showAddSupp, setShowAddSupp] = useState(false);
  const [newSuppName, setNewSuppName] = useState('');
  const [newSuppDose, setNewSuppDose] = useState('');
  const [foodSearch, setFoodSearch] = useState('');
  const [foodCategory, setFoodCategory] = useState<'ALL' | 'SAFE' | 'CAUTION' | 'AVOID'>('ALL');
  const [hiddenSupps, setHiddenSupps] = useState<string[]>(() => {
    const saved = localStorage.getItem('ourpregnancy_hidden_supps');
    return saved ? JSON.parse(saved) : [];
  });

  const today = new Date().toISOString().split('T')[0];

  const logs = useLiveQuery(
    () => {
      if (!state.activeJourneyId) return [];
      return db.supplementLogs
        .where('[journeyId+date]')
        .equals([state.activeJourneyId, today])
        .toArray();
    },
    [state.activeJourneyId, today]
  ) || [];

  const todayLog = logs.length > 0 ? logs[0] : null;
  const takenList = todayLog ? todayLog.supplementsTaken : [];

  const handleToggleSupp = async (id: string) => {
    if (!state.activeJourneyId) return;
    
    const isTaken = takenList.includes(id);
    const newList = isTaken ? takenList.filter(s => s !== id) : [...takenList, id];

    if (todayLog) {
      await db.supplementLogs.update(todayLog.id, { supplementsTaken: newList });
    } else {
      await db.supplementLogs.put({
        id: uuidv4(),
        journeyId: state.activeJourneyId,
        date: today,
        supplementsTaken: newList
      });
    }
  };

  const hideSupplement = (id: string) => {
    const newHidden = [...hiddenSupps, id];
    setHiddenSupps(newHidden);
    localStorage.setItem('ourpregnancy_hidden_supps', JSON.stringify(newHidden));
  };

  // Trimester focus logic
  const now = Date.now();
  const lmp = state.lmp ? new Date(state.lmp).getTime() : 0;
  const weeks = Math.floor((now - lmp) / (7 * 24 * 60 * 60 * 1000));
  
  let currentTrimester: 1 | 2 | 3 | 'post' = 1;
  if (weeks >= 13 && weeks <= 27) currentTrimester = 2;
  else if (weeks >= 28 && state.dueDate && new Date(state.dueDate).getTime() > now) currentTrimester = 3;
  else if (state.dueDate && new Date(state.dueDate).getTime() < now) currentTrimester = 'post';

  const isHighRisk = state.flags['highRisk'] === true;

  const baseSupplements = SUPPLEMENTS.filter(s => {
    if (hiddenSupps.includes(s.id)) return false;
    if (currentTrimester === 1 && s.t1) return true;
    if (currentTrimester === 2 && s.t2) return true;
    if (currentTrimester === 3 && s.t3) return true;
    if (currentTrimester === 'post' && (s.t2 || s.t3)) return true;
    if (s.id === 'iron' && isHighRisk) return true;
    return false;
  });

  const activeSupplements = useMemo(() => {
    const combined = [...baseSupplements];
    if (state.customSupplements) {
      state.customSupplements.forEach(cs => {
        combined.push({
          id: cs.id,
          name: cs.name,
          dose: cs.dose,
          tooltip: 'Custom added supplement',
          t1: true, t2: true, t3: true
        });
      });
    }
    return combined;
  }, [baseSupplements, state.customSupplements]);

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSuppName.trim() && newSuppDose.trim()) {
      addCustomSupplement(newSuppName.trim(), newSuppDose.trim());
      setNewSuppName('');
      setNewSuppDose('');
      setShowAddSupp(false);
    }
  };

  const filteredFoods = useMemo(() => {
    return FOOD_DATABASE.filter(f => {
      const matchesCategory = foodCategory === 'ALL' || f.type === foodCategory;
      const matchesSearch = !foodSearch.trim() || 
        f.name.toLowerCase().includes(foodSearch.toLowerCase()) || 
        f.desc.toLowerCase().includes(foodSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [foodCategory, foodSearch]);

  const completionPct = activeSupplements.length > 0 
    ? Math.round((takenList.length / activeSupplements.length) * 100) 
    : 0;

  if (!state.activeJourneyId) {
    return (
      <div className="p-6 bg-white border border-border/80 rounded-2xl shadow-xs text-center">
        <Pill className="w-12 h-12 text-medium mx-auto mb-4" />
        <h2 className="font-serif text-2xl text-charcoal mb-2">Nutrition</h2>
        <p className="text-medium text-[15px]">Please complete setup first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-sage/10 flex items-center justify-center text-sage">
          <Pill className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-serif text-[clamp(24px,3.5vw,36px)] font-normal text-charcoal leading-tight">Nutrition</h1>
          <p className="text-[12.5px] text-medium font-normal">Daily maternal supplements & evidence-based Indian food guide</p>
        </div>
      </div>

      {/* Trimester Focus Card - Warm, Welcoming & Brand Aligned */}
      <div className="bg-gradient-to-br from-tulsi-light/60 via-cream to-white border border-sage/30 rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-sage/15 flex items-center justify-center text-sage-dark shrink-0 mt-0.5">
            {currentTrimester === 1 && <Leaf className="w-5 h-5 text-sage" />}
            {currentTrimester === 2 && <Droplets className="w-5 h-5 text-sage" />}
            {currentTrimester === 3 && <Sparkles className="w-5 h-5 text-sage" />}
            {currentTrimester === 'post' && <Heart className="w-5 h-5 text-blush" />}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-sage-dark bg-sage/15 px-2 py-0.5 rounded-full">
                {currentTrimester === 'post' ? 'Postpartum Focus' : `Trimester ${currentTrimester} Priority`}
              </span>
            </div>
            <p className="text-[13.5px] text-charcoal leading-relaxed font-normal">
              {currentTrimester === 1 && "Focus on Folate — critical for neural tube development. Green leafy vegetables, dal, and fortified atta are excellent sources."}
              {currentTrimester === 2 && "Focus on Iron — your blood volume is expanding. Enjoy palak dal, ragi, and dates. Pair with fresh lemon to boost iron absorption."}
              {currentTrimester === 3 && "Focus on Calcium — supporting baby's bone development. Dahi, paneer, ragi, and til are rich sources. Enjoy 15 minutes of gentle morning sunlight for Vitamin D."}
              {currentTrimester === 'post' && "If breastfeeding, continue your prenatal routine. Prioritize DHA (walnuts, alsi/flaxseed), iodine, and staying well hydrated with warm fluids."}
            </p>
          </div>
        </div>
      </div>

      {/* Daily Supplements Section */}
      <div className="bg-white border border-border/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Header with completion counter & progress bar */}
        <div className="p-4 sm:p-5 border-b border-border/60 bg-cream/40">
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <h3 className="font-serif text-[17px] sm:text-[18px] text-charcoal font-normal">Daily Supplements</h3>
              <p className="text-[11.5px] text-medium font-medium">Track your prescribed routine for today</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${
                completionPct === 100 
                  ? 'bg-sage text-white shadow-2xs' 
                  : 'bg-tulsi-light text-sage-dark border border-sage/20'
              }`}>
                {takenList.length} of {activeSupplements.length} taken
              </span>
            </div>
          </div>

          {/* Smooth Progress Bar */}
          <div className="w-full h-1.5 bg-border/60 rounded-full overflow-hidden">
            <div 
              className="h-full bg-sage transition-all duration-500 ease-out rounded-full"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        {/* List of Supplements */}
        <div className="p-3.5 sm:p-4 space-y-2.5">
          {activeSupplements.map(supp => {
            const isTaken = takenList.includes(supp.id);
            const isCustom = supp.id.startsWith('custom_');

            return (
              <div 
                key={supp.id} 
                className={`flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl border transition-all ${
                  isTaken 
                    ? 'bg-tulsi-light/35 border-sage/40 shadow-2xs' 
                    : 'bg-white border-border/75 hover:border-sage/40 hover:bg-cream/20 shadow-2xs'
                }`}
              >
                {/* Left: Custom Checkbox + Details */}
                <div 
                  onClick={() => handleToggleSupp(supp.id)}
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer select-none"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSupp(supp.id);
                    }}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                      isTaken 
                        ? 'bg-sage border-sage text-white shadow-2xs scale-105' 
                        : 'border-border/90 bg-cream/50 hover:border-sage text-transparent'
                    }`}
                    aria-label={`Mark ${supp.name} as ${isTaken ? 'not taken' : 'taken'}`}
                  >
                    <Check className={`w-3.5 h-3.5 stroke-[3] ${isTaken ? 'opacity-100' : 'opacity-0'}`} />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-serif text-[15px] sm:text-[16px] leading-tight transition-colors ${
                        isTaken ? 'text-charcoal/60 line-through' : 'text-charcoal font-normal'
                      }`}>
                        {supp.name}
                      </span>
                      <span className="text-[11px] font-semibold text-sage-dark bg-sage/10 px-2 py-0.5 rounded-md">
                        {supp.dose}
                      </span>
                    </div>
                    <p className="text-[12px] text-medium mt-0.5 leading-snug truncate">
                      {supp.tooltip}
                    </p>
                  </div>
                </div>

                {/* Right: Anchored Delete / Hide Button (never wraps below) */}
                <div className="shrink-0 flex items-center">
                  {isCustom ? (
                    <button 
                      type="button"
                      onClick={() => deleteCustomSupplement(supp.id)} 
                      className="p-2 text-light hover:text-red-500 hover:bg-red-50/80 rounded-lg transition-colors cursor-pointer"
                      title="Delete custom supplement"
                      aria-label="Delete supplement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => hideSupplement(supp.id)} 
                      className="p-2 text-light hover:text-red-500 hover:bg-red-50/80 rounded-lg transition-colors cursor-pointer"
                      title="Hide supplement"
                      aria-label="Hide supplement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {activeSupplements.length === 0 && (
            <div className="text-center py-6 text-medium text-[13.5px]">
              No active supplements configured for your current stage.
            </div>
          )}

          {/* Add Custom Button / Form */}
          {!showAddSupp ? (
            <button 
              type="button"
              onClick={() => setShowAddSupp(true)}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 border border-dashed border-sage/40 rounded-xl text-sage hover:text-sage-dark hover:border-sage hover:bg-sage-pale/30 transition-all text-[13.5px] font-semibold cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Supplement</span>
            </button>
          ) : (
            <form onSubmit={handleAddCustom} className="p-4 border border-sage/40 rounded-xl bg-sage-pale/20 mt-3 animate-in fade-in slide-in-from-top-2">
              <h4 className="font-serif text-[15px] text-charcoal mb-3">Add Custom Supplement</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                <input
                  type="text"
                  placeholder="Supplement Name (e.g. Iron, Calcium)"
                  required
                  value={newSuppName}
                  onChange={e => setNewSuppName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-border/80 rounded-xl focus:border-sage focus:ring-2 focus:ring-sage/10 text-[13.5px] outline-none text-charcoal placeholder:text-medium/60"
                />
                <input
                  type="text"
                  placeholder="Dose (e.g. 1 Tablet, 500mg)"
                  required
                  value={newSuppDose}
                  onChange={e => setNewSuppDose(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-border/80 rounded-xl focus:border-sage focus:ring-2 focus:ring-sage/10 text-[13.5px] outline-none text-charcoal placeholder:text-medium/60"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowAddSupp(false)}
                  className="px-3.5 py-2 font-medium text-[13px] text-medium hover:text-charcoal hover:bg-white rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 font-medium text-[13px] text-white bg-sage hover:bg-sage-dark rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  Save Supplement
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Pregnancy Food Safety Guide */}
      <div className="bg-white border border-border/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border/60 bg-cream/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-sage" />
              <h3 className="font-serif text-[17px] sm:text-[18px] text-charcoal font-normal">Pregnancy Food Guide</h3>
            </div>
            <span className="text-[11.5px] text-medium font-medium">Evidence-based safety reference</span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-medium/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search food safety (e.g. papaya, chai, curd, dates...)"
              value={foodSearch}
              onChange={e => setFoodSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-white border border-border/80 rounded-xl text-[13px] text-charcoal placeholder:text-medium/60 outline-none focus:border-sage focus:ring-2 focus:ring-sage/10 transition-all"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            {[
              { id: 'ALL', label: 'All Items' },
              { id: 'SAFE', label: 'Safe & Nourishing' },
              { id: 'CAUTION', label: 'Eat in Moderation' },
              { id: 'AVOID', label: 'Avoid' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFoodCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-full text-[11.5px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  foodCategory === tab.id
                    ? 'bg-sage text-white shadow-2xs'
                    : 'bg-cream/80 text-medium hover:text-charcoal hover:bg-cream-dark/60 border border-border/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Food Items List */}
        <div className="p-3.5 sm:p-4">
          <div className="space-y-2.5">
            {filteredFoods.map(food => {
              const isSafe = food.type === 'SAFE';
              const isCaution = food.type === 'CAUTION';
              const isAvoid = food.type === 'AVOID';

              return (
                <div 
                  key={food.name}
                  className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                    isSafe 
                      ? 'bg-tulsi-light/25 border-sage/30' 
                      : isCaution 
                        ? 'bg-amber-50/40 border-amber-200/60' 
                        : 'bg-red-50/40 border-red-200/50'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {isSafe && <CheckCircle2 className="w-4 h-4 text-sage" />}
                    {isCaution && <AlertCircle className="w-4 h-4 text-amber-600" />}
                    {isAvoid && <ShieldAlert className="w-4 h-4 text-critical" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-serif text-[14.5px] text-charcoal font-medium">
                        {food.name}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isSafe 
                          ? 'bg-sage/15 text-sage-dark' 
                          : isCaution 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-red-100/90 text-critical font-bold'
                      }`}>
                        {isSafe ? 'Safe' : isCaution ? 'Caution' : 'Avoid'}
                      </span>
                    </div>
                    <p className="text-[12.5px] text-medium mt-1 leading-relaxed">
                      {food.desc}
                    </p>
                  </div>
                </div>
              );
            })}

            {filteredFoods.length === 0 && (
              <div className="text-center py-8 text-medium text-[13.5px]">
                No matching foods found for "{foodSearch}".
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
