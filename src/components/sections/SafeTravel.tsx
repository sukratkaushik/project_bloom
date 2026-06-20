import React, { useState, useEffect } from 'react';
import { usePlanner } from '../../store';
import { 
  Plane, 
  Car, 
  MapPin, 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Briefcase, 
  Stethoscope, 
  Info, 
  ShieldCheck, 
  Calendar,
  Compass
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  category: 'prep' | 'packing' | 'enroute';
  checked: boolean;
  isCustom?: boolean;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  // Preparation Category
  { id: 't1', text: "Get your OB/midwife's approval & travel clearance letter", category: 'prep', checked: false },
  { id: 't2', text: "Check airline-specific pregnancy policy & cutoff week (typically 36 weeks)", category: 'prep', checked: false },
  { id: 't3', text: "Research & locate the nearest hospital with obstetric facilities at your destination", category: 'prep', checked: false },
  { id: 't4', text: "Verify travel insurance covers pregnancy complications or newborn care", category: 'prep', checked: false },
  { id: 't5', text: "Print a copy of your prenatal medical records & LMP details", category: 'prep', checked: false },
  // Packing Category
  { id: 't6', text: "Graduated compression socks (critical for preventing blood clots / DVT)", category: 'packing', checked: false },
  { id: 't7', text: "Prenatal vitamins & all regular prescription medications", category: 'packing', checked: false },
  { id: 't8', text: "Comfortable, loose-fitting slip-on shoes for travel swelling", category: 'packing', checked: false },
  { id: 't9', text: "Healthy snack mix & reusable water bottle to stay hydrated", category: 'packing', checked: false },
  { id: 't10', text: "Maternity health record card & doctor's clearance letter", category: 'packing', checked: false },
  { id: 't11', text: "Support pillow (lumbar or neck) for long journeys", category: 'packing', checked: false },
  // En Route Category
  { id: 't12', text: "Stand up and walk for 5-10 minutes every 2 hours to prevent DVT", category: 'enroute', checked: false },
  { id: 't13', text: "Wear seatbelt low across the hips, below your baby bump", category: 'enroute', checked: false },
  { id: 't14', text: "Drink at least 250ml of water per hour of flight/travel", category: 'enroute', checked: false },
  { id: 't15', text: "Perform ankle circles & calf stretches every 30 minutes in your seat", category: 'enroute', checked: false },
  { id: 't16', text: "Request an aisle seat for easy access to stretching & bathroom", category: 'enroute', checked: false }
];

export const SafeTravel: React.FC = () => {
  const { state } = usePlanner();
  const [activeTab, setActiveTab] = useState<'calculator' | 'checklist' | 'tips'>('calculator');
  const [selectedTrimester, setSelectedTrimester] = useState<'t1' | 't2' | 't3'>('t1');
  const [travelMethod, setTravelMethod] = useState<'flying' | 'driving' | 'cruise'>('flying');
  const [destinationInfo, setDestinationInfo] = useState('');
  
  // Checklist State
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('bloom_travel_checklist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_CHECKLIST;
      }
    }
    return DEFAULT_CHECKLIST;
  });
  const [checklistFilter, setChecklistFilter] = useState<'prep' | 'packing' | 'enroute'>('prep');
  const [newTodoText, setNewTodoText] = useState('');

  // Persist Checklist
  useEffect(() => {
    localStorage.setItem('bloom_travel_checklist', JSON.stringify(checklist));
  }, [checklist]);

  // Autofill trimester from state if available
  useEffect(() => {
    if (state.lmp) {
      const lmpDate = new Date(state.lmp);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lmpDate.getTime());
      const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
      
      if (diffWeeks >= 28) {
        setSelectedTrimester('t3');
      } else if (diffWeeks >= 13) {
        setSelectedTrimester('t2');
      } else {
        setSelectedTrimester('t1');
      }
    }
  }, [state.lmp]);

  // Add Item to Checklist
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    const newItem: ChecklistItem = {
      id: 'custom_' + Date.now(),
      text: newTodoText.trim(),
      category: checklistFilter,
      checked: false,
      isCustom: true
    };
    setChecklist(prev => [...prev, newItem]);
    setNewTodoText('');
  };

  // Toggle checklist check state
  const toggleCheck = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  // Delete custom checklist item
  const handleDelete = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  // Reset checklist to defaults
  const resetChecklist = () => {
    if (window.confirm("Are you sure you want to reset your checklist to default items? Your custom items will be deleted.")) {
      setChecklist(DEFAULT_CHECKLIST);
    }
  };

  // Trimester & Method Advice Generator
  const getTravelAnalysis = () => {
    const analyses: Record<string, { risk: 'low' | 'moderate' | 'high', summary: string, ObAdvice: string, airlineWarning?: string }> = {
      't1-flying': {
        risk: 'low',
        summary: "Generally safe to fly. Morning sickness, fatigue, and increased risk of minor spotting are common first-trimester issues.",
        ObAdvice: "Ensure you keep anti-nausea remedies close. Stay hydrated, as air cabin pressure dries mucous membranes.",
        airlineWarning: "Airlines rarely restrict travel under 28 weeks. However, check for vaccination needs if traveling internationally."
      },
      't1-driving': {
        risk: 'low',
        summary: "Safe for driving. Ensure the seatbelt is placed correctly below your belly.",
        ObAdvice: "Frequent breaks are essential. Break every 90-120 minutes to stretch legs and walk to stimulate circulation.",
      },
      't1-cruise': {
        risk: 'moderate',
        summary: "Generally safe, but severe motion sickness / morning sickness can be compounded by sea swells.",
        ObAdvice: "Verify if the ship has a doctor on board and double-check safety policies. Take natural ginger or safe antiemetics.",
      },
      't2-flying': {
        risk: 'low',
        summary: "The safest and most comfortable time to travel. Morning sickness has usually subsided, and energy levels are higher.",
        ObAdvice: "Perfect window for a 'babymoon'! Still wear compression socks and keep stretching during the flight.",
        airlineWarning: "Most airlines permit restriction-free travel up to 28-36 weeks, but some require a simple letter stating your due date."
      },
      't2-driving': {
        risk: 'low',
        summary: "Excellent window for road trips. Belly is growing but usually not restricting movement.",
        ObAdvice: "Position lumbar support correctly. Ensure seatbelt remains snug under the bump, never across it.",
      },
      't2-cruise': {
        risk: 'low',
        summary: "Safe and relaxing. Choose itineraries with stable waters.",
        ObAdvice: "Be aware of cruise line cutoffs. Many lines do not allow passengers who have entered their 24th week of pregnancy.",
      },
      't3-flying': {
        risk: 'high',
        summary: "High risk of premature labour onset or deep vein thrombosis (DVT). Long-haul flights are strongly discouraged.",
        ObAdvice: "Keep travel local and short. Have a printed copy of your pregnancy records, check hospital location at the destination, and carry an OB travel clearance letter.",
        airlineWarning: "CRITICAL: Most commercial airlines strictly ban travel after 36 weeks (single pregnancy) or 32 weeks (multiples). A medical certificate is mandatory after 28 weeks."
      },
      't3-driving': {
        risk: 'moderate',
        summary: "Moderate risk. High fatigue and physical discomfort. Driving long hours is not recommended.",
        ObAdvice: "Keep trips short (under 2 hours). Avoid driving solo. Stop every hour to walk. Ensure airbags are active and seat is pushed back.",
      },
      't3-cruise': {
        risk: 'high',
        summary: "Very high risk. Most cruise lines do not permit travel in the third trimester.",
        ObAdvice: "Almost all cruise lines strictly prohibit passengers who are 24+ weeks pregnant. Emergency neonatal care is typically unavailable at sea.",
      }
    };

    const key = `${selectedTrimester}-${travelMethod}`;
    return analyses[key] || { risk: 'low', summary: "Safe with standard precautions.", ObAdvice: "Consult your doctor." };
  };

  const analysis = getTravelAnalysis();

  return (
    <div className="space-y-6">
      {/* Premium Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-sage-pale to-blush-pale dark:from-sage-pale/25 dark:to-blush-pale/25 rounded-[32px] p-6 md:p-8 border border-border/60 dark:border-border/10 shadow-sm mesh-glow-container">
        <div className="mesh-glow-blob-1" />
        <div className="mesh-glow-blob-2" />
        <div className="relative z-10 max-w-[600px] space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage/20 dark:bg-sage/10 text-sage-dark dark:text-sage text-[12px] font-bold tracking-[1.5px] uppercase">
            <Compass className="w-3.5 h-3.5" /> Travel Safety Guide
          </div>
          <h1 className="font-serif text-[28px] md:text-[34px] text-charcoal dark:text-white font-semibold leading-tight">
            Safe Travel During Pregnancy
          </h1>
          <p className="text-[14px] md:text-[15px] text-charcoal/80 dark:text-white/80 leading-relaxed font-sans font-medium">
            Plan your baby-moons and trips with confidence. Calculate risks by trimester, customize your packing checklists, and review clinically backed travel tips.
          </p>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-border/60 dark:border-border/10 gap-1 overflow-x-auto no-print">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-3 text-[14px] font-bold tracking-[0.5px] whitespace-nowrap cursor-pointer transition-all border-b-2
            ${activeTab === 'calculator' ? 'border-sage-dark dark:border-sage text-sage-dark dark:text-sage' : 'border-transparent text-charcoal/60 dark:text-white/60 hover:text-charcoal'}`}
        >
          🧮 Travel Risk Calculator
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-4 py-3 text-[14px] font-bold tracking-[0.5px] whitespace-nowrap cursor-pointer transition-all border-b-2
            ${activeTab === 'checklist' ? 'border-sage-dark dark:border-sage text-sage-dark dark:text-sage' : 'border-transparent text-charcoal/60 dark:text-white/60 hover:text-charcoal'}`}
        >
          📋 Travel Checklist Planner
        </button>
        <button
          onClick={() => setActiveTab('tips')}
          className={`px-4 py-3 text-[14px] font-bold tracking-[0.5px] whitespace-nowrap cursor-pointer transition-all border-b-2
            ${activeTab === 'tips' ? 'border-sage-dark dark:border-sage text-sage-dark dark:text-sage' : 'border-transparent text-charcoal/60 dark:text-white/60 hover:text-charcoal'}`}
        >
          💡 Crucial Safety Tips
        </button>
      </div>

      {/* Tab Content: Risk Calculator */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <div className="premium-card p-6 space-y-5">
              <h2 className="font-serif text-[20px] text-charcoal dark:text-white font-semibold">Your Trip Config</h2>
              
              {/* Trimester Selector */}
              <div className="space-y-2">
                <label className="text-[12px] font-bold uppercase tracking-[1px] text-charcoal/60 dark:text-white/60">Select Trimester</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['t1', 't2', 't3'] as const).map(tri => (
                    <button
                      key={tri}
                      onClick={() => setSelectedTrimester(tri)}
                      className={`py-2 px-3 rounded-[12px] text-[13px] font-bold transition-all border cursor-pointer
                        ${selectedTrimester === tri
                          ? 'border-sage bg-sage-pale/60 text-sage-dark dark:text-sage dark:bg-sage/10 font-bold'
                          : 'border-border/60 dark:border-border/10 bg-transparent text-charcoal/80 dark:text-white/80 hover:border-sage-light'}`}
                    >
                      {tri === 't1' ? '1st' : tri === 't2' ? '2nd' : '3rd'} Tri
                    </button>
                  ))}
                </div>
              </div>

              {/* Travel Method Selector */}
              <div className="space-y-2">
                <label className="text-[12px] font-bold uppercase tracking-[1px] text-charcoal/60 dark:text-white/60">Travel Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTravelMethod('flying')}
                    className={`py-3 px-2 rounded-[12px] text-[12.5px] font-bold transition-all border cursor-pointer flex flex-col items-center gap-1.5
                      ${travelMethod === 'flying'
                        ? 'border-sage bg-sage-pale/60 text-sage-dark dark:text-sage dark:bg-sage/10 font-bold'
                        : 'border-border/60 dark:border-border/10 bg-transparent text-charcoal/80 dark:text-white/80 hover:border-sage-light'}`}
                  >
                    <Plane className="w-4 h-4" />
                    <span>Flying</span>
                  </button>
                  <button
                    onClick={() => setTravelMethod('driving')}
                    className={`py-3 px-2 rounded-[12px] text-[12.5px] font-bold transition-all border cursor-pointer flex flex-col items-center gap-1.5
                      ${travelMethod === 'driving'
                        ? 'border-sage bg-sage-pale/60 text-sage-dark dark:text-sage dark:bg-sage/10 font-bold'
                        : 'border-border/60 dark:border-border/10 bg-transparent text-charcoal/80 dark:text-white/80 hover:border-sage-light'}`}
                  >
                    <Car className="w-4 h-4" />
                    <span>Driving</span>
                  </button>
                  <button
                    onClick={() => setTravelMethod('cruise')}
                    className={`py-3 px-2 rounded-[12px] text-[12.5px] font-bold transition-all border cursor-pointer flex flex-col items-center gap-1.5
                      ${travelMethod === 'cruise'
                        ? 'border-sage bg-sage-pale/60 text-sage-dark dark:text-sage dark:bg-sage/10 font-bold'
                        : 'border-border/60 dark:border-border/10 bg-transparent text-charcoal/80 dark:text-white/80 hover:border-sage-light'}`}
                  >
                    <Compass className="w-4 h-4" />
                    <span>Cruise</span>
                  </button>
                </div>
              </div>

              {/* Destination Input (Helper info) */}
              <div className="space-y-2">
                <label className="text-[12px] font-bold uppercase tracking-[1px] text-charcoal/60 dark:text-white/60">Destination (Optional)</label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3.5 w-4 h-4 text-charcoal/50" />
                  <input
                    type="text"
                    value={destinationInfo}
                    onChange={(e) => setDestinationInfo(e.target.value)}
                    placeholder="e.g. Hawaii, Rome, Local Roadtrip"
                    className="w-full pl-10 pr-4 py-2.5 text-[14px] rounded-[12px] border border-border/80 dark:border-border/20 bg-white dark:bg-charcoal/15 text-charcoal placeholder:text-charcoal/45 focus:outline-none focus:border-sage"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="premium-card p-6 space-y-6">
              <div className="flex justify-between items-start">
                <h2 className="font-serif text-[20px] text-charcoal dark:text-white font-semibold">Safety Assessment</h2>
                
                {/* Risk Badge */}
                <div className={`px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-[1px]
                  ${analysis.risk === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400 border border-green-300/30' : 
                    analysis.risk === 'moderate' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-300/30' : 
                    'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400 border border-red-300/30'}`}>
                  {analysis.risk} risk
                </div>
              </div>

              <div className="p-4 rounded-[16px] bg-charcoal/5 dark:bg-charcoal/10 border border-border/50 dark:border-border/10 space-y-3">
                <div className="flex gap-2 items-start text-charcoal dark:text-white font-medium text-[14px] leading-relaxed">
                  <Info className="w-5 h-5 text-sage shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Overview: </span>
                    {analysis.summary}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <Stethoscope className="w-5 h-5 text-sage shrink-0 mt-1" />
                  <div>
                    <h4 className="text-[14px] font-bold text-charcoal dark:text-white">OB/Midwife Advice:</h4>
                    <p className="text-[13.5px] text-charcoal/80 dark:text-white/80 leading-relaxed font-medium mt-0.5">{analysis.ObAdvice}</p>
                  </div>
                </div>

                {analysis.airlineWarning && (
                  <div className="flex gap-3 items-start border-t border-border/40 dark:border-border/10 pt-4">
                    <AlertCircle className="w-5 h-5 text-critical shrink-0 mt-1" />
                    <div>
                      <h4 className="text-[14px] font-bold text-critical">Travel/Airline Restrictions:</h4>
                      <p className="text-[13.5px] text-charcoal/80 dark:text-white/80 leading-relaxed font-medium mt-0.5">{analysis.airlineWarning}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Custom destination safety helper */}
              {destinationInfo && (
                <div className="p-4 border border-sage/20 bg-sage-pale/20 rounded-[16px] flex gap-2.5 items-start">
                  <ShieldCheck className="w-5 h-5 text-sage shrink-0 mt-0.5" />
                  <div className="text-[13px] text-charcoal/80 dark:text-white/80 leading-normal font-medium">
                    Planning for <span className="font-bold text-charcoal dark:text-white">{destinationInfo}</span>: Ensure your pregnancy health insurance includes international/out-of-state emergency delivery and medical repatriation. Locate the nearest Level III neonatal care ward (NICU) at your destination before packing!
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Checklist Planner */}
      {activeTab === 'checklist' && (
        <div className="premium-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h2 className="font-serif text-[20px] text-charcoal dark:text-white font-semibold">Your Travel Checklist</h2>
            
            <button
              onClick={resetChecklist}
              className="text-[12px] font-bold uppercase tracking-[0.5px] text-critical hover:text-red-700 bg-transparent border-none cursor-pointer self-start sm:self-center"
            >
              🔄 Reset to Default List
            </button>
          </div>

          {/* Checklist Categories Navigation */}
          <div className="flex border-b border-border/40 dark:border-border/10 gap-2 overflow-x-auto">
            <button
              onClick={() => setChecklistFilter('prep')}
              className={`pb-2.5 text-[13px] font-bold tracking-[0.5px] cursor-pointer transition-all border-b-2 whitespace-nowrap
                ${checklistFilter === 'prep' ? 'border-sage text-sage-dark dark:text-sage' : 'border-transparent text-charcoal/60 dark:text-white/60'}`}
            >
              1. Before You Go
            </button>
            <button
              onClick={() => setChecklistFilter('packing')}
              className={`pb-2.5 text-[13px] font-bold tracking-[0.5px] cursor-pointer transition-all border-b-2 whitespace-nowrap
                ${checklistFilter === 'packing' ? 'border-sage text-sage-dark dark:text-sage' : 'border-transparent text-charcoal/60 dark:text-white/60'}`}
            >
              2. Packing List
            </button>
            <button
              onClick={() => setChecklistFilter('enroute')}
              className={`pb-2.5 text-[13px] font-bold tracking-[0.5px] cursor-pointer transition-all border-b-2 whitespace-nowrap
                ${checklistFilter === 'enroute' ? 'border-sage text-sage-dark dark:text-sage' : 'border-transparent text-charcoal/60 dark:text-white/60'}`}
            >
              3. En Route Guidelines
            </button>
          </div>

          {/* Checklist List */}
          <div className="space-y-2">
            {checklist.filter(item => item.category === checklistFilter).length > 0 ? (
              checklist
                .filter(item => item.category === checklistFilter)
                .map((item) => (
                  <div 
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-[12px] border transition-all cursor-pointer group
                      ${item.checked 
                        ? 'bg-sage-pale/40 border-sage/20 opacity-80' 
                        : 'bg-transparent border-border/50 dark:border-border/10 hover:border-sage-light'}`}
                    onClick={() => toggleCheck(item.id)}
                  >
                    <button
                      className="text-sage focus:outline-none cursor-pointer p-0 bg-transparent border-none flex items-center justify-center shrink-0"
                    >
                      {item.checked ? <CheckSquare className="w-5 h-5 fill-sage-pale text-sage-dark" /> : <Square className="w-5 h-5 text-charcoal/40" />}
                    </button>
                    <span className={`text-[14px] leading-relaxed font-sans font-semibold text-charcoal/80 dark:text-white/80 flex-1 ${item.checked ? 'line-through opacity-60' : ''}`}>
                      {item.text}
                    </span>
                    {item.isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-charcoal/40 hover:text-critical hover:bg-critical-bg rounded-md transition-all cursor-pointer border-none bg-transparent"
                        title="Delete custom item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
            ) : (
              <div className="text-[13px] text-charcoal/60 dark:text-white/60 text-center py-6 italic">
                No checklist items in this category. Add one below!
              </div>
            )}
          </div>

          {/* Add custom item form */}
          <form onSubmit={handleAddTodo} className="flex gap-2 pt-4 border-t border-border/40 dark:border-border/10">
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder={`Add custom ${checklistFilter === 'prep' ? 'prep task' : checklistFilter === 'packing' ? 'packing item' : 'en-route check'}...`}
              className="flex-1 px-4 py-2.5 text-[14px] rounded-[10px] border border-border/80 dark:border-border/20 bg-white dark:bg-charcoal/15 text-charcoal placeholder:text-charcoal/45 focus:outline-none focus:border-sage"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-sage text-white text-[13px] font-bold rounded-[10px] hover:bg-sage-dark transition-all cursor-pointer flex items-center gap-1 shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>
        </div>
      )}

      {/* Tab Content: Crucial Safety Tips */}
      {activeTab === 'tips' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="premium-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-sage-dark dark:text-sage font-serif text-[18px] font-bold border-b border-border/40 dark:border-border/10 pb-2">
              <Plane className="w-5 h-5" /> Flying Safely
            </div>
            <ul className="space-y-3 text-[13.5px] text-charcoal/80 dark:text-white/80 leading-relaxed font-sans font-semibold">
              <li className="flex items-start gap-2.5">
                <span className="text-sage font-bold shrink-0">•</span>
                <span>Select an aisle seat to facilitate walking and frequent bathroom access.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-sage font-bold shrink-0">•</span>
                <span>Wear loose, breathable layers. Feet and hands swell significantly during pressurized flights.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-sage font-bold shrink-0">•</span>
                <span>Fasten seatbelts low, directly across your pelvis (underneath your baby bump). Keep it secure throughout to protect against turbulence.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-sage font-bold shrink-0">•</span>
                <span>DVT Prevention: Wear medical graduated compression socks. Flex ankles, stretch calves, and stand to walk 5 minutes every hour.</span>
              </li>
            </ul>
          </div>

          <div className="premium-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-sage-dark dark:text-sage font-serif text-[18px] font-bold border-b border-border/40 dark:border-border/10 pb-2">
              <Car className="w-5 h-5" /> Roadtrips & Driving
            </div>
            <ul className="space-y-3 text-[13.5px] text-charcoal/80 dark:text-white/80 leading-relaxed font-sans font-semibold">
              <li className="flex items-start gap-2.5">
                <span className="text-sage font-bold shrink-0">•</span>
                <span>Position the shoulder strap of the seatbelt between your breasts and low over your pelvis, under the belly.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-sage font-bold shrink-0">•</span>
                <span>Push your vehicle seat back as far as comfortable to keep safe distance from the steering wheel/airbag.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-sage font-bold shrink-0">•</span>
                <span>Take regular pit stops every 90 minutes. Never drive for longer than 6 hours per day.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-sage font-bold shrink-0">•</span>
                <span>Stay hydrated and snack frequently to manage energy drops and nausea.</span>
              </li>
            </ul>
          </div>

          <div className="premium-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-sage-dark dark:text-sage font-serif text-[18px] font-bold border-b border-border/40 dark:border-border/10 pb-2">
              <Briefcase className="w-5 h-5" /> Travel Vaccinations
            </div>
            <ul className="space-y-3 text-[13.5px] text-charcoal/80 dark:text-white/80 leading-relaxed font-sans font-semibold">
              <li className="flex items-start gap-2.5">
                <span className="text-sage font-bold shrink-0">•</span>
                <span>Consult your GP or a travel clinic at least 4–6 weeks before international departures.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-sage font-bold shrink-0">•</span>
                <span>Live vaccines (like yellow fever, MMR, BCG) are generally contraindicated / unsafe during pregnancy.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-sage font-bold shrink-0">•</span>
                <span>Inactivated vaccines (Flu, Tdap/whooping cough, COVID-19) are safe and actively recommended.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-sage font-bold shrink-0">•</span>
                <span>Avoid regions with high malaria transmission or active Zika virus outbreaks, as complications are severe.</span>
              </li>
            </ul>
          </div>

          <div className="premium-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-critical font-serif text-[18px] font-bold border-b border-border/40 dark:border-border/10 pb-2">
              <AlertCircle className="w-5 h-5" /> Warning Signs to Seek Care
            </div>
            <ul className="space-y-3 text-[13.5px] text-charcoal/80 dark:text-white/80 leading-relaxed font-sans font-semibold">
              <li className="flex items-start gap-2.5 text-critical">
                <span className="text-critical font-bold shrink-0">•</span>
                <span>Any vaginal bleeding, spotting, or unusual fluid leaking.</span>
              </li>
              <li className="flex items-start gap-2.5 text-critical">
                <span className="text-critical font-bold shrink-0">•</span>
                <span>Severe, persistent abdominal pain or cramping.</span>
              </li>
              <li className="flex items-start gap-2.5 text-critical">
                <span className="text-critical font-bold shrink-0">•</span>
                <span>Sudden, severe swelling in face, hands, or one leg (indicates DVT or pre-eclampsia).</span>
              </li>
              <li className="flex items-start gap-2.5 text-critical">
                <span className="text-critical font-bold shrink-0">•</span>
                <span>Unusual shortness of breath, chest pain, or palpitations.</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
