import React, { useState } from 'react';
import {
  Search, Star, Footprints, Timer, Activity, Heart, Droplets,
  Apple, BookOpen, Users, Sparkles, Camera, Baby, Plane,
  Calendar, ShoppingBag, DollarSign, Clock, Syringe, FileText,
  Building, ShieldCheck, HeartHandshake, Briefcase, FileCheck2,
  HelpCircle, CheckCircle2, Wind
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
}

export const ExploreTab: React.FC<ExploreTabProps> = ({ onOpenTool, pinnedIds, onTogglePin }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const tools: ToolDefinition[] = [
    // Category 1: Daily Health Logs
    { id: 'kickcounter', title: 'Kick Counter', desc: 'Count 10 fetal kicks with timer', category: 'Daily Health Logs', icon: Footprints, color: 'text-sage-dark bg-sage-pale' },
    { id: 'contractions', title: 'Contraction Timer', desc: 'ACOG 5-1-1 labor contraction timer', category: 'Daily Health Logs', icon: Timer, color: 'text-soft-saffron-dark bg-soft-saffron/15' },
    { id: 'vitals', title: 'Vitals & BP Tracker', desc: 'Log blood pressure, pulse, weight', category: 'Daily Health Logs', icon: Activity, color: 'text-red-600 bg-red-50' },
    { id: 'symptoms', title: 'Symptom Logger', desc: 'Track nausea, fatigue, cramping', category: 'Daily Health Logs', icon: Heart, color: 'text-pink-600 bg-pink-50' },
    { id: 'mood', title: 'Mood & Energy', desc: 'Daily emotional wellbeing check-in', category: 'Daily Health Logs', icon: Sparkles, color: 'text-amber-600 bg-amber-50' },
    { id: 'hydration', title: 'Hydration Tracker', desc: 'Log water and tender coconut water', category: 'Daily Health Logs', icon: Droplets, color: 'text-blue-600 bg-blue-50' },
    { id: 'nutrition', title: 'Nutrition & Supplements', desc: 'Folic acid, iron, calcium tracker', category: 'Daily Health Logs', icon: Apple, color: 'text-green-700 bg-green-50' },
    { id: 'notes', title: 'Bump Journal', desc: 'Private ultrasound notes & bump diary', category: 'Daily Health Logs', icon: BookOpen, color: 'text-emerald-700 bg-emerald-50' },
    { id: 'partnersync', title: 'Partner Sync (P2P)', desc: 'Encrypted WebRTC device sync', category: 'Daily Health Logs', icon: Users, color: 'text-indigo-600 bg-indigo-50' },

    // Category 2: Smart AI & Cultural Guidance
    { id: 'breathing', title: 'Pranayama & Garbh Sanskar', desc: 'Guided breathing & offline prenatal audio', category: 'Smart AI & Cultural Guidance', icon: Wind, color: 'text-sage-dark bg-sage-pale' },
    { id: 'askourpregnancy', title: 'Ask Bloom AI', desc: 'Empathetic OB-GYN clinical chat', category: 'Smart AI & Cultural Guidance', icon: Sparkles, color: 'text-purple-600 bg-purple-50' },
    { id: 'foodscanner', title: 'AI Food & Cal Guide', desc: 'Meal calories, FOGSI vitamins, barcode DB & safety', category: 'Smart AI & Cultural Guidance', icon: Camera, color: 'text-orange-600 bg-orange-50' },
    { id: 'babynames', title: 'Baby Names Finder', desc: 'Indian modern & Vedic name meanings', category: 'Smart AI & Cultural Guidance', icon: Baby, color: 'text-pink-600 bg-pink-50' },
    { id: 'travel', title: 'Trimester Travel Guide', desc: 'Flying, road trips & doctor NOC rules', category: 'Smart AI & Cultural Guidance', icon: Plane, color: 'text-teal-600 bg-teal-50' },

    // Category 3: Planning & Milestones
    { id: 'dev', title: 'Fetal Development', desc: 'Week-by-week organogenesis timeline', category: 'Planning & Milestones', icon: Calendar, color: 'text-sage-dark bg-sage-pale' },
    { id: 'prep', title: 'Nursery & Baby Prep', desc: 'Checklists for baby gear and clothing', category: 'Planning & Milestones', icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
    { id: 'finance', title: 'Cost & Delivery Planner', desc: 'Hospital delivery estimates & savings', category: 'Planning & Milestones', icon: DollarSign, color: 'text-emerald-700 bg-emerald-50' },
    { id: 'deadlines', title: 'Due Date Deadlines', desc: 'Essential prenatal scan milestones', category: 'Planning & Milestones', icon: Clock, color: 'text-amber-700 bg-amber-50' },

    // Category 4: Medical, Schemes & Legal
    { id: 'medical', title: 'Medical & Vaccines', desc: 'Tdap, tetanus, glucose tolerance test', category: 'Medical, Schemes & Legal', icon: Syringe, color: 'text-red-600 bg-red-50' },
    { id: 'medical-reports', title: 'Medical Reports Locker', desc: 'Ultrasound scans & bloodwork summary', category: 'Medical, Schemes & Legal', icon: FileText, color: 'text-cyan-700 bg-cyan-50' },
    { id: 'schemes', title: 'Govt Maternity Schemes', desc: 'PMMVY (₹5k), JSY (₹1.4k), PMSMA guide', category: 'Medical, Schemes & Legal', icon: Building, color: 'text-yellow-700 bg-yellow-50' },
    { id: 'postpartum', title: 'Postpartum Care', desc: 'Fourth trimester healing & lactation', category: 'Medical, Schemes & Legal', icon: HeartHandshake, color: 'text-rose-600 bg-rose-50' },

    // Category 5: Labor & Fourth Trimester
    { id: 'hospitalbag', title: 'Hospital Bag Checklist', desc: 'Essentials for mother, baby & partner', category: 'Labor & Fourth Trimester', icon: Briefcase, color: 'text-stone-700 bg-stone-100' },
    { id: 'birthplan', title: 'Birth Plan Builder', desc: 'Preferences for labor & pain relief', category: 'Labor & Fourth Trimester', icon: FileCheck2, color: 'text-sage-dark bg-sage-pale' },
    { id: 'readiness', title: 'Labor Readiness Score', desc: 'Bishop score & cervical preparation', category: 'Labor & Fourth Trimester', icon: CheckCircle2, color: 'text-indigo-700 bg-indigo-50' },
    { id: 'feedback', title: 'Feedback & Support', desc: 'Share your pregnancy journey thoughts', category: 'Labor & Fourth Trimester', icon: HelpCircle, color: 'text-medium bg-cream' },
  ];

  const filteredTools = searchQuery.trim()
    ? tools.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tools;

  const categories = Array.from(new Set(tools.map((t) => t.category)));

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Search Bar */}
      <div className="relative sticky top-0 z-20 pt-1 pb-1 bg-cream/95 backdrop-blur-xs">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-medium pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search all 29 health tools, schemes, scans..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-border/80 rounded-2xl text-[13.5px] font-medium placeholder:text-light focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage shadow-xs transition-shadow"
        />
      </div>

      {/* Category Bento Blocks */}
      {categories.map((category) => {
        const categoryTools = filteredTools.filter((t) => t.category === category);
        if (categoryTools.length === 0) return null;

        return (
          <div key={category} className="space-y-2">
            <h3 className="font-serif text-[14px] font-bold text-charcoal px-1 flex items-center justify-between">
              <span>{category}</span>
              <span className="text-[11px] text-medium font-sans font-medium">
                {categoryTools.length} tools
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categoryTools.map((tool) => {
                const isPinned = pinnedIds.includes(tool.id);
                const IconComponent = tool.icon;

                return (
                  <div
                    key={tool.id}
                    onClick={() => {
                      triggerHaptic('light');
                      onOpenTool(tool.id);
                    }}
                    className="bg-white border border-border/80 hover:border-sage rounded-2xl p-3.5 flex items-start justify-between gap-3 shadow-2xs hover:shadow-xs active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tool.color}`}>
                        <IconComponent size={19} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-charcoal text-[13.5px] leading-tight truncate">
                          {tool.title}
                        </h4>
                        <p className="text-[11.5px] text-medium mt-0.5 leading-snug line-clamp-2">
                          {tool.desc}
                        </p>
                      </div>
                    </div>

                    {/* Star to Pin */}
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
                    >
                      <Star size={16} fill={isPinned ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
