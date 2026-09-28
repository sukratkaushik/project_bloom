import React, { useState, useMemo } from 'react';
import {
  Search, Star, Footprints, Timer, Activity, Heart, Droplets,
  Apple, BookOpen, Users, Sparkles, Camera, Baby, Plane,
  Calendar, ShoppingBag, DollarSign, Clock, Syringe, FileText,
  Building, HeartHandshake, Briefcase, FileCheck2,
  HelpCircle, CheckCircle2, Wind, X, ArrowRight
} from 'lucide-react';
import { triggerHaptic } from '../../../utils/nativeBridge';

interface ExploreTabProps {
  onOpenTool: (toolId: string) => void;
  pinnedIds: string[];
  onTogglePin: (toolId: string) => void;
}

interface ToolDefinition {
  id: string;
  title: string;
  desc: string;
  category: string;
  icon: React.FC<{ size: number; className?: string }>;
  color: string;
  badge?: string;
}

export const ExploreTab: React.FC<ExploreTabProps> = ({ onOpenTool, pinnedIds, onTogglePin }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const tools: ToolDefinition[] = [
    // Category 1: Daily Tracking (9 tools)
    { id: 'kickcounter', title: 'Kick Counter', desc: 'Count 10 fetal kicks with active timer', category: 'Daily Tracking', icon: Footprints, color: 'text-sage-dark bg-sage-pale', badge: 'Active' },
    { id: 'hydration', title: 'Hydration Tracker', desc: 'Log water, tender coconut water & fluids', category: 'Daily Tracking', icon: Droplets, color: 'text-blue-600 bg-blue-50', badge: 'Daily' },
    { id: 'vitals', title: 'Vitals & BP Tracker', desc: 'Log blood pressure, pulse, weight & sugar', category: 'Daily Tracking', icon: Activity, color: 'text-rose-600 bg-rose-50' },
    { id: 'symptoms', title: 'Symptom Logger', desc: 'Track nausea, fatigue, swelling & cramps', category: 'Daily Tracking', icon: Heart, color: 'text-pink-600 bg-pink-50' },
    { id: 'mood', title: 'Mood & Energy', desc: 'Daily emotional wellbeing & journal check-in', category: 'Daily Tracking', icon: Sparkles, color: 'text-amber-600 bg-amber-50' },
    { id: 'nutrition', title: 'Supplements & Diet', desc: 'Folic acid, iron, calcium & meal log', category: 'Daily Tracking', icon: Apple, color: 'text-emerald-700 bg-emerald-50' },
    { id: 'notes', title: 'Bump Journal', desc: 'Private ultrasound notes & bump diary', category: 'Daily Tracking', icon: BookOpen, color: 'text-teal-700 bg-teal-50' },
    { id: 'partnersync', title: 'Partner Sync (P2P)', desc: 'Encrypted WebRTC live companion sync', category: 'Daily Tracking', icon: Users, color: 'text-indigo-600 bg-indigo-50' },
    { id: 'contractions', title: 'Contraction Timer', desc: 'ACOG 5-1-1 labor contraction timer', category: 'Daily Tracking', icon: Timer, color: 'text-orange-600 bg-orange-50' },

    // Category 2: Smart AI & Cultural Guidance (5 tools)
    { id: 'foodscanner', title: 'AI Food & Calorie Guide', desc: 'Meal calories, FOGSI vitamins, barcode & safety', category: 'Smart AI & Guidance', icon: Camera, color: 'text-orange-600 bg-orange-50', badge: 'AI Powered' },
    { id: 'askourpregnancy', title: 'Ask Bloom AI', desc: 'Empathetic OB-GYN clinical maternal chat', category: 'Smart AI & Guidance', icon: Sparkles, color: 'text-purple-600 bg-purple-50', badge: 'Qwen 2.5' },
    { id: 'breathing', title: 'Pranayama & Garbh Sanskar', desc: 'Guided breathing & offline prenatal audio', category: 'Smart AI & Guidance', icon: Wind, color: 'text-sage-dark bg-sage-pale' },
    { id: 'babynames', title: 'Baby Names Finder', desc: 'Indian modern & Vedic name meanings with rashi', category: 'Smart AI & Guidance', icon: Baby, color: 'text-pink-600 bg-pink-50' },
    { id: 'travel', title: 'Trimester Travel Guide', desc: 'Flying, road trips & doctor NOC guidelines', category: 'Smart AI & Guidance', icon: Plane, color: 'text-teal-600 bg-teal-50' },

    // Category 3: Planning & Milestones (4 tools)
    { id: 'dev', title: 'Fetal Development', desc: 'Week-by-week organogenesis timeline & size', category: 'Milestones & Prep', icon: Calendar, color: 'text-sage-dark bg-sage-pale' },
    { id: 'deadlines', title: 'Due Date Deadlines', desc: 'Essential prenatal scan milestones & visits', category: 'Milestones & Prep', icon: Clock, color: 'text-amber-700 bg-amber-50' },
    { id: 'prep', title: 'Nursery & Baby Prep', desc: 'Essential checklists for baby gear & clothing', category: 'Milestones & Prep', icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
    { id: 'finance', title: 'Delivery Cost Planner', desc: 'Hospital delivery estimates, insurance & savings', category: 'Milestones & Prep', icon: DollarSign, color: 'text-emerald-700 bg-emerald-50' },

    // Category 4: Medical & Schemes (4 tools)
    { id: 'schemes', title: 'Govt Maternity Schemes', desc: 'PMMVY (₹5k), JSY (₹1.4k), PMSMA & state aid', category: 'Medical & Schemes', icon: Building, color: 'text-yellow-700 bg-yellow-50', badge: 'MoHFW' },
    { id: 'medical-reports', title: 'Medical Reports Locker', desc: 'Ultrasound scans & bloodwork AES-256 vault', category: 'Medical & Schemes', icon: FileText, color: 'text-cyan-700 bg-cyan-50' },
    { id: 'medical', title: 'Vaccines & Clinical Schedule', desc: 'Tdap, tetanus, glucose tolerance & labs', category: 'Medical & Schemes', icon: Syringe, color: 'text-rose-600 bg-rose-50' },
    { id: 'postpartum', title: 'Postpartum Healing', desc: 'Fourth trimester recovery, pelvic floor & care', category: 'Medical & Schemes', icon: HeartHandshake, color: 'text-rose-600 bg-rose-50' },

    // Category 5: Labor & Postpartum (4 tools)
    { id: 'hospitalbag', title: 'Hospital Bag Checklist', desc: 'Organized packing for mother, baby & partner', category: 'Labor & Postpartum', icon: Briefcase, color: 'text-stone-700 bg-stone-100' },
    { id: 'birthplan', title: 'Birth Plan Builder', desc: 'Preferences for labor, support person & pain relief', category: 'Labor & Postpartum', icon: FileCheck2, color: 'text-sage-dark bg-sage-pale' },
    { id: 'readiness', title: 'Labor Readiness Score', desc: 'Bishop score & cervical preparation guidance', category: 'Labor & Postpartum', icon: CheckCircle2, color: 'text-indigo-700 bg-indigo-50' },
    { id: 'feedback', title: 'Feedback & Support', desc: 'Share your pregnancy journey suggestions', category: 'Labor & Postpartum', icon: HelpCircle, color: 'text-charcoal bg-cream' },
  ];

  const categoryChips = [
    { label: 'All', count: tools.length },
    { label: 'Daily Tracking', count: 9 },
    { label: 'Smart AI & Guidance', count: 5 },
    { label: 'Milestones & Prep', count: 4 },
    { label: 'Medical & Schemes', count: 4 },
    { label: 'Labor & Postpartum', count: 4 },
  ];

  // Filtered tools by search query and category
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'All' || tool.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [tools, searchQuery, selectedCategory]);

  // Pinned tools lookup for quick-access tray
  const pinnedToolItems = useMemo(() => {
    return tools.filter((t) => pinnedIds.includes(t.id));
  }, [tools, pinnedIds]);

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-200">
      {/* 1. Sticky Search Bar */}
      <div className="relative sticky top-0 z-20 pt-1 pb-1 bg-cream/95 backdrop-blur-xs">
        <div className="relative flex items-center">
          <Search size={18} className="absolute left-3.5 text-medium pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all 29 tools, scans, schemes..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-border/80 rounded-2xl text-[13.5px] font-medium text-charcoal placeholder:text-light focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage shadow-2xs transition-shadow"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setSearchQuery('');
              }}
              className="absolute right-3 p-1 rounded-full text-light hover:text-charcoal transition-colors"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Filter Chips Horizontal Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-1 no-scrollbar">
          {categoryChips.map((chip) => {
            const isSelected = selectedCategory === chip.label;
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedCategory(chip.label);
                }}
                className={`px-3 py-1.5 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-charcoal text-white shadow-xs'
                    : 'bg-white text-medium border border-border/70 hover:bg-cream hover:text-charcoal'
                }`}
              >
                {chip.label} ({chip.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Pinned Quick Access Tray (if any pinned tools exist) */}
      {pinnedToolItems.length > 0 && selectedCategory === 'All' && !searchQuery && (
        <div className="bg-white/80 border border-amber-200/70 rounded-2xl p-3 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Star size={14} className="text-amber-500 fill-amber-400" />
              <span className="text-[11.5px] font-bold text-charcoal uppercase tracking-wider">
                Pinned Daily Rituals ({pinnedToolItems.length})
              </span>
            </div>
            <span className="text-[10px] text-medium">Shown on Today Tab</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {pinnedToolItems.map((tool) => {
              const IconComp = tool.icon;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    onOpenTool(tool.id);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-cream hover:bg-sage-pale/60 border border-border/70 rounded-xl shrink-0 text-left transition-colors cursor-pointer group"
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${tool.color}`}>
                    <IconComp size={13} />
                  </div>
                  <span className="text-[12px] font-bold text-charcoal group-hover:text-sage-dark whitespace-nowrap">
                    {tool.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Active Clinical Spotlight Hero */}
      {!searchQuery && selectedCategory === 'All' && (
        <div className="bg-gradient-to-r from-sage-pale/80 via-white to-cream border border-sage/40 rounded-3xl p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="max-w-[72%]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sage-dark bg-sage/15 px-2 py-0.5 rounded-full inline-block mb-1">
                Featured Clinical Guide
              </span>
              <h3 className="font-serif font-bold text-charcoal text-[16px] leading-tight">
                AI Food, Calorie & Nutrition Guide
              </h3>
              <p className="text-[12px] text-medium mt-1 leading-snug">
                Scan ingredients or check ACOG & FOGSI safety guidelines for Indian spices, raw foods, and safe trimester macros.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                onOpenTool('foodscanner');
              }}
              className="w-11 h-11 rounded-2xl bg-sage text-white flex items-center justify-center shadow-xs hover:bg-sage-dark active:scale-95 transition-all shrink-0 cursor-pointer"
              aria-label="Open AI Food Guide"
            >
              <Camera size={22} />
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-sage/20 flex items-center justify-between text-[11.5px]">
            <span className="text-sage-dark font-medium flex items-center gap-1">
              <Sparkles size={13} /> Includes Barcode & Camera Scanner
            </span>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onOpenTool('foodscanner');
              }}
              className="text-sage-dark font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Scan Meal</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* 4. Bento Grid Directory */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-serif text-[14.5px] font-bold text-charcoal flex items-center gap-1.5">
            <span>{selectedCategory === 'All' ? 'All Pregnancy Tools' : selectedCategory}</span>
            <span className="text-[11px] font-sans font-bold text-sage-dark bg-sage-pale px-2 py-0.5 rounded-full">
              {filteredTools.length}
            </span>
          </h3>
          {searchQuery && (
            <span className="text-[11px] text-medium">
              Filtered by "{searchQuery}"
            </span>
          )}
        </div>

        {filteredTools.length === 0 ? (
          <div className="bg-white border border-border/80 rounded-2xl p-8 text-center shadow-xs">
            <Search size={32} className="mx-auto text-light mb-2" />
            <h4 className="font-bold text-charcoal text-[14px]">No matching tools found</h4>
            <p className="text-[12px] text-medium mt-1">
              Try searching for "scans", "schemes", "vitals", or "kick counter".
            </p>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-3 px-4 py-1.5 bg-sage text-white text-[12px] font-bold rounded-xl shadow-2xs hover:bg-sage-dark transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredTools.map((tool) => {
              const isPinned = pinnedIds.includes(tool.id);
              const IconComp = tool.icon;

              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    triggerHaptic('light');
                    onOpenTool(tool.id);
                  }}
                  className="bg-white border border-border/80 hover:border-sage rounded-2xl p-3.5 flex items-start justify-between gap-2.5 shadow-2xs hover:shadow-xs active:scale-[0.99] transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tool.color} group-hover:scale-105 transition-transform`}>
                      <IconComp size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-charcoal text-[13.5px] leading-tight truncate group-hover:text-sage-dark transition-colors">
                          {tool.title}
                        </h4>
                        {tool.badge && (
                          <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-md bg-sage-pale text-sage-dark shrink-0">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11.5px] text-medium mt-1 leading-snug line-clamp-2">
                        {tool.desc}
                      </p>
                    </div>
                  </div>

                  {/* Pin / Star Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic('light');
                      onTogglePin(tool.id);
                    }}
                    className={`p-1.5 rounded-full transition-colors shrink-0 ${
                      isPinned
                        ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                        : 'text-light hover:text-medium hover:bg-cream'
                    }`}
                    aria-label={isPinned ? 'Unpin from Rituals' : 'Pin to Rituals'}
                    title={isPinned ? 'Pinned to Today Tab' : 'Pin to Today Tab'}
                  >
                    <Star size={16} fill={isPinned ? 'currentColor' : 'none'} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
