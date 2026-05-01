import React, { useState, useMemo } from 'react';
import { usePlanner } from '../../store';
import { db } from '../../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { 
  Pill, 
  Leaf, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Search, 
  X,
  CheckSquare,
  Square,
  EyeOff,
  Droplets,
  Heart,
  Plus,
  Trash2
} from 'lucide-react';

const SUPPLEMENTS = [
  { id: 'folic', name: 'Folic Acid', dose: '400-800mcg', tooltip: 'Prevents neural tube defects', t1: true, t2: true, t3: true },
  { id: 'vitD', name: 'Vitamin D', dose: '400IU', tooltip: 'Bone development and immunity', t1: true, t2: true, t3: true },
  { id: 'iron', name: 'Iron', dose: '60mg', tooltip: 'Prevents anaemia, supports baby’s growth', t1: false, t2: true, t3: true }, // also true if highRisk
  { id: 'dha', name: 'DHA/Omega-3', dose: '200mg', tooltip: 'Brain and eye development', t1: true, t2: true, t3: true },
  { id: 'calcium', name: 'Calcium', dose: '1000mg', tooltip: 'Bone and teeth development', t1: false, t2: true, t3: true },
  { id: 'iodine', name: 'Iodine', dose: '150mcg', tooltip: 'Thyroid function and brain development', t1: false, t2: true, t3: true },
  { id: 'magnesium', name: 'Magnesium', dose: 'Varies', tooltip: 'Reduces leg cramps', t1: false, t2: false, t3: true },
  { id: 'prenatal', name: 'Prenatal Multivitamin', dose: '1 tablet', tooltip: 'General vitamin cover', t1: true, t2: true, t3: true },
];

const FOOD_DATABASE = [
  { name: 'Dal (all types)', type: 'SAFE', desc: 'Excellent folate and protein' },
  { name: 'Ragi (finger millet)', type: 'SAFE', desc: 'Highest calcium of any grain' },
  { name: 'Palak (spinach)', type: 'SAFE', desc: 'Iron and folate' },
  { name: 'Dahi / Curd', type: 'SAFE', desc: 'Probiotics and calcium (ensure pasteurised)' },
  { name: 'Paneer', type: 'SAFE', desc: 'Protein and calcium' },
  { name: 'Coconut Water', type: 'SAFE', desc: 'Natural electrolytes' },
  { name: 'Amla (gooseberry)', type: 'SAFE', desc: 'Vitamin C, helps iron absorption' },
  { name: 'Dates (khajoor)', type: 'SAFE', desc: 'Iron and natural energy' },
  { name: 'Chai / Tea', type: 'CAUTION', desc: 'Limit to 1-2 cups per day (caffeine)' },
  { name: 'Papad & Pickles', type: 'CAUTION', desc: 'High sodium, avoid if BP issues' },
  { name: 'Maida sweets/snacks', type: 'CAUTION', desc: 'Low nutrition, eat in moderation' },
  { name: 'Street food', type: 'CAUTION', desc: 'Hygiene risk, eat at trusted places only' },
  { name: 'Raw papaya (kaccha)', type: 'AVOID', desc: 'Contains latex that can cause contractions' },
  { name: 'Pineapple (large amts)', type: 'AVOID', desc: 'Bromelain may cause contractions' },
  { name: 'Raw/undercooked meat', type: 'AVOID', desc: 'Listeria, Toxoplasma risk' },
  { name: 'Unpasteurised dairy', type: 'AVOID', desc: 'Listeria risk' },
  { name: 'Raw sprouts (ankurit)', type: 'AVOID', desc: 'Bacterial contamination risk' },
  { name: 'Alcohol', type: 'AVOID', desc: 'No safe amount during pregnancy' },
];

export const NutritionTracker: React.FC = () => {
  const { state, addCustomSupplement, deleteCustomSupplement } = usePlanner();
  const [search, setSearch] = useState('');
  const [showAddSupp, setShowAddSupp] = useState(false);
  const [newSuppName, setNewSuppName] = useState('');
  const [newSuppDose, setNewSuppDose] = useState('');
  const [hiddenSupps, setHiddenSupps] = useState<string[]>(() => {
    const saved = localStorage.getItem('bloom_hidden_supps');
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
    localStorage.setItem('bloom_hidden_supps', JSON.stringify(newHidden));
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
    if (currentTrimester === 'post' && (s.t2 || s.t3)) return true; // generic postpartum logic
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

  const filteredFood = useMemo(() => {
    if (!search.trim()) return FOOD_DATABASE;
    const lower = search.toLowerCase();
    return FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(lower) || f.desc.toLowerCase().includes(lower));
  }, [search]);

  if (!state.activeJourneyId) {
    return (
      <div className="p-6 bg-white border border-border rounded-2xl shadow-sm text-center">
        <Pill className="w-12 h-12 text-medium mx-auto mb-4" />
        <h2 className="font-serif text-2xl text-charcoal mb-2">Nutrition & Supplements</h2>
        <p className="text-medium text-[15px]">Please complete setup first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Pill className="w-8 h-8 text-sage" />
        <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-normal text-charcoal">Nutrition</h1>
      </div>

      {/* Trimester Focus */}
      <div className="bg-sage-pale/40 border border-sage rounded-[16px] p-5 shadow-sm flex items-start gap-4">
        {currentTrimester === 1 && <Leaf className="w-6 h-6 text-sage shrink-0 mt-0.5" />}
        {currentTrimester === 2 && <Droplets className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />}
        {currentTrimester === 3 && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mt-0.5 shrink-0"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
        {currentTrimester === 'post' && <Heart className="w-6 h-6 text-gold shrink-0 mt-0.5" />}
        
        <p className="text-[14px] text-charcoal font-medium leading-relaxed">
          {currentTrimester === 1 && "🌱 Focus on Folate — critical for neural tube development. Green leafy vegetables, dal, and fortified atta are excellent sources."}
          {currentTrimester === 2 && "🩸 Focus on Iron — your blood volume is increasing. Eat palak dal, ragi, and dates. Add lemon juice to improve absorption."}
          {currentTrimester === 3 && "🦴 Focus on Calcium — supporting baby's bone development. Dahi, paneer, ragi, and til are great sources. 15 minutes morning sunlight for Vitamin D."}
          {currentTrimester === 'post' && "💛 If breastfeeding, continue prenatal vitamins. Focus on DHA (walnuts, alsi), iodine, and staying hydrated."}
        </p>
      </div>

      {/* Supplement Checklist */}
      <div className="bg-white border-[1.5px] border-border rounded-[16px] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-gray-50/50 flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between sm:items-center">
          <div className="flex justify-between items-center w-full">
            <h3 className="font-semibold text-charcoal text-[17px]">Daily Supplements</h3>
            <span className="text-[13px] text-medium">{takenList.length} / {activeSupplements.length} taken</span>
          </div>
        </div>
        
        <div className="p-4 sm:p-6 space-y-3">
          {activeSupplements.map(supp => {
            const isTaken = takenList.includes(supp.id);
            const isCustom = supp.id.startsWith('custom_');
            return (
              <div key={supp.id} className="flex justify-between flex-wrap gap-4 items-center p-4 border border-border rounded-[12px] bg-white hover:border-sage transition-colors group">
                <div className="flex items-center gap-3">
                  <button onClick={() => handleToggleSupp(supp.id)}>
                     {isTaken ? <CheckSquare className="w-[22px] h-[22px] text-sage" /> : <Square className="w-[22px] h-[22px] text-border group-hover:text-sage-light transition-colors" />}
                  </button>
                  <div>
                    <h4 className={`font-semibold text-[15px] ${isTaken ? 'text-charcoal/50 line-through' : 'text-charcoal'}`}>{supp.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[12px] font-semibold text-medium bg-gray-100 px-2 py-0.5 rounded-full">{supp.dose}</span>
                      <span className="text-[12px] text-light flex items-center gap-1" title={supp.tooltip}>
                        <Info className="w-3 h-3" /> {supp.tooltip}
                      </span>
                    </div>
                  </div>
                </div>
                
                {isCustom ? (
                  <button onClick={() => deleteCustomSupplement(supp.id)} className="text-medium hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-2 text-[12px] font-medium" title="Delete custom supplement">
                    <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Delete</span>
                  </button>
                ) : (
                  <button onClick={() => hideSupplement(supp.id)} className="text-medium hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-2 text-[12px] font-medium" title="Delete supplement">
                    <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Delete</span>
                  </button>
                )}
              </div>
            )
          })}
          {activeSupplements.length === 0 && (
            <div className="text-center p-4 text-medium text-[14px]">No active supplements for your current stage.</div>
          )}

          {!showAddSupp ? (
            <button 
              onClick={() => setShowAddSupp(true)}
              className="w-full mt-2 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-[12px] text-medium hover:text-sage hover:border-sage hover:bg-sage-pale/20 transition-all text-[14px] font-semibold"
            >
              <Plus className="w-4 h-4" /> Add Custom Supplement
            </button>
          ) : (
            <form onSubmit={handleAddCustom} className="p-4 border-[1.5px] border-sage rounded-[12px] bg-sage-pale/10 mt-4 animate-in fade-in slide-in-from-top-2">
              <h4 className="font-semibold text-[14px] text-charcoal mb-3">Add Custom Supplement</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Name (e.g. Iron)"
                  required
                  value={newSuppName}
                  onChange={e => setNewSuppName(e.target.value)}
                  className="w-full p-2.5 border-[1.5px] border-border rounded-[8px] focus:border-sage focus:ring-[3px] focus:ring-sage/10 text-[14px] outline-none"
                />
                <input
                  type="text"
                  placeholder="Dose (e.g. 1 Tablet)"
                  required
                  value={newSuppDose}
                  onChange={e => setNewSuppDose(e.target.value)}
                  className="w-full p-2.5 border-[1.5px] border-border rounded-[8px] focus:border-sage focus:ring-[3px] focus:ring-sage/10 text-[14px] outline-none"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowAddSupp(false)}
                  className="px-4 py-2 font-semibold text-[13px] text-charcoal hover:bg-gray-100 rounded-[8px] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 font-semibold text-[13px] text-white bg-sage hover:bg-sage-dark rounded-[8px] shadow-sm transition-colors"
                >
                  Save Supplement
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* Foods DB */}
      <div className="bg-white border-[1.5px] border-border rounded-[16px] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-gray-50/50">
          <h3 className="font-semibold text-charcoal text-[17px]">Indian Food Guide</h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="relative mb-6">
            <Search className="w-5 h-5 text-medium absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search foods (e.g. paneer, papaya)" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 p-3 border border-border rounded-[10px] focus:border-sage focus:ring-[3px] focus:ring-sage/10 outline-none text-[14px]"
            />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-medium"><X className="w-4 h-4" /></button>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['AVOID', 'CAUTION', 'SAFE'].map(tier => {
              const tierFoods = filteredFood.filter(f => f.type === tier);
              if (tierFoods.length === 0) return null;

              let icon, color, bg;
              if (tier === 'AVOID') { icon = '🚫'; color = 'text-red-800'; bg = 'bg-red-50 border-red-200'; }
              else if (tier === 'CAUTION') { icon = '⚠️'; color = 'text-amber-800'; bg = 'bg-amber-50 border-amber-200'; }
              else { icon = '✅'; color = 'text-green-800'; bg = 'bg-green-50 border-green-200'; }

              return (
                <div key={tier} className={`p-4 rounded-[12px] border ${bg} md:col-span-1`}>
                  <h4 className={`font-bold text-[14px] flex items-center gap-2 mb-3 uppercase tracking-wide ${color}`}>
                    {icon} {tier}
                  </h4>
                  <ul className="space-y-3">
                    {tierFoods.map(food => (
                      <li key={food.name} className="flex flex-col">
                        <span className="font-semibold text-[14px] text-charcoal">{food.name}</span>
                        <span className="text-[13px] text-medium">{food.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
