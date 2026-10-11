import React, { useState, useEffect } from 'react';
import { usePlanner } from '../../store';
import { v4 as uuidv4 } from 'uuid';
import { 
  Briefcase, 
  CheckSquare, 
  Square,
  Plus,
  Trash2,
  Printer,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { HospitalBagItem } from '../../types';
import { triggerHaptic } from '../../utils/nativeBridge';

const INITIAL_MAMA = [
  'Maternity notes — 3 printed copies',
  'Comfortable cotton gown or salwar kameez',
  'Maternity pads — 2 large packs',
  'Nursing bras x2 (front-opening)',
  'Disposable underwear x5',
  'Sanitary towels',
  'Toiletries (shampoo, soap, toothbrush)',
  'Hair ties/clips',
  'Lip balm',
  'Snacks (dry fruits, biscuits, laddoo)',
  'Phone charger + power bank',
  'Headphones',
  'TENS machine if using',
  'Extra dupatta/shawl',
  'Comfortable flip-flops/chappals',
  'Pillow from home (optional)',
  '₹2,000–5,000 cash',
  'Breast pump if planning to use'
];

const INITIAL_BABY = [
  'Cotton jhablas/onesies — 5 (newborn size)',
  'Cotton vests/banyans — 3',
  'Soft cotton cap x2',
  'Cotton socks x3 pairs',
  'Muslin cloths x4',
  'Nappies — 1 pack (newborn)',
  'Baby wipes x2 packs',
  'Cotton blanket/swaddle',
  'Going-home outfit',
  'Warm wrap if winter',
  'Baby nail file',
  'Car seat if available',
  'Baby soap (mild, no fragrance)'
];

const INITIAL_PARTNER = [
  'Change of clothes x2',
  'Toiletries',
  'Phone charger',
  'Cash minimum ₹5,000',
  'Snacks and water',
  'Camera or phone fully charged',
  'List of contacts to call after birth',
  'Own medications if needed'
];

const INITIAL_DOCS = [
  "Mother's Aadhaar card",
  "Partner's Aadhaar card",
  "Marriage certificate",
  "Hospital registration/booking papers",
  "Health insurance card + policy documents",
  "Blood group card",
  "Maternity notes / antenatal record",
  "JSY card or PMMVY registration if applicable",
  "PMSMA card if applicable"
];

export const HospitalBag: React.FC = () => {
  const { state, updateState } = usePlanner();
  
  const [activeTab, setActiveTab] = useState<'mama' | 'baby' | 'partner' | 'documents'>('mama');
  const [customItem, setCustomItem] = useState('');

  // Initialize if empty
  useEffect(() => {
    if (!state.hospitalBagItems || state.hospitalBagItems.length === 0) {
      const items: HospitalBagItem[] = [
        ...INITIAL_MAMA.map(label => ({ id: uuidv4(), label, category: 'mama' as const, packed: false, isCustom: false })),
        ...INITIAL_BABY.map(label => ({ id: uuidv4(), label, category: 'baby' as const, packed: false, isCustom: false })),
        ...INITIAL_PARTNER.map(label => ({ id: uuidv4(), label, category: 'partner' as const, packed: false, isCustom: false })),
        ...INITIAL_DOCS.map(label => ({ id: uuidv4(), label, category: 'documents' as const, packed: false, isCustom: false }))
      ];
      updateState({ hospitalBagItems: items });
    }
  }, []);

  const items = state.hospitalBagItems || [];
  
  const togglePacked = (id: string) => {
    triggerHaptic('light');
    updateState({
      hospitalBagItems: items.map(item => 
        item.id === id ? { ...item, packed: !item.packed } : item
      )
    });
  };

  const deleteItem = (id: string) => {
    triggerHaptic('light');
    updateState({
      hospitalBagItems: items.filter(item => item.id !== id)
    });
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItem.trim()) return;
    triggerHaptic('medium');
    
    const newItem: HospitalBagItem = {
      id: uuidv4(),
      label: customItem.trim(),
      category: activeTab,
      packed: false,
      isCustom: true
    };

    updateState({
      hospitalBagItems: [...items, newItem]
    });
    setCustomItem('');
  };

  const getChecklistText = () => {
    return `*Hospital Bag Checklist:*\n\n` +
      `*For Mama:*\n${items.filter(i => i.category === 'mama').map(i => `${i.packed ? '✅' : '☐'} ${i.label}`).join('\n')}\n\n` +
      `*For Baby:*\n${items.filter(i => i.category === 'baby').map(i => `${i.packed ? '✅' : '☐'} ${i.label}`).join('\n')}\n\n` +
      `*For Partner:*\n${items.filter(i => i.category === 'partner').map(i => `${i.packed ? '✅' : '☐'} ${i.label}`).join('\n')}\n\n` +
      `*Documents:*\n${items.filter(i => i.category === 'documents').map(i => `${i.packed ? '✅' : '☐'} ${i.label}`).join('\n')}`;
  };

  const handleCopy = () => {
    triggerHaptic('light');
    navigator.clipboard.writeText(getChecklistText());
    alert('Copied checklist to clipboard!');
  };

  const handleWhatsAppShare = () => {
    triggerHaptic('light');
    const url = `https://wa.me/?text=${encodeURIComponent(getChecklistText())}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    triggerHaptic('light');
    window.print();
  };

  const filteredItems = items.filter(i => i.category === activeTab);
  const totalPacked = items.filter(i => i.packed).length;
  const progressPct = items.length ? Math.round((totalPacked / items.length) * 100) : 0;

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div>
          <h2 className="font-serif text-[22px] sm:text-[26px] font-bold text-charcoal leading-tight">
            Hospital Bag Checklist
          </h2>
          <p className="text-[12.5px] text-medium mt-0.5">
            Essential packing list for labor ward, postpartum stay & baby welcome
          </p>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0">
          <button 
            type="button"
            onClick={handleWhatsAppShare} 
            className="h-9 px-3 border border-[#25D366]/40 bg-[#25D366]/10 text-[#25D366] rounded-xl hover:bg-[#25D366]/20 transition-colors flex items-center gap-1.5 text-[12px] font-bold cursor-pointer" 
            title="Share via WhatsApp"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span className="hidden sm:inline">Share</span>
          </button>
          <button 
            type="button"
            onClick={handleCopy} 
            className="w-9 h-9 border border-border/80 rounded-xl text-charcoal hover:bg-cream bg-white flex items-center justify-center transition-colors cursor-pointer" 
            title="Copy checklist"
          >
            <Copy size={15} />
          </button>
          <button 
            type="button"
            onClick={handlePrint} 
            className="w-9 h-9 border border-border/80 rounded-xl text-charcoal hover:bg-cream bg-white flex items-center justify-center transition-colors cursor-pointer" 
            title="Print checklist"
          >
            <Printer size={15} />
          </button>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="bg-white border border-border/80 rounded-3xl shadow-xs p-4 sm:p-5 no-print">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-charcoal text-[15px]">Overall Readiness</span>
            <span className="text-[11px] font-bold text-sage-dark bg-sage-pale px-2 py-0.5 rounded-full">
              {progressPct}% Packed
            </span>
          </div>
          <span className="text-[12px] font-bold text-charcoal">{totalPacked} of {items.length} items</span>
        </div>
        <div className="w-full h-2.5 bg-cream rounded-full overflow-hidden border border-border/60">
          <div className="h-full bg-sage transition-all duration-500 rounded-full" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Main Container with Segmented Tabs */}
      <div className="bg-white border border-border/80 rounded-3xl shadow-xs overflow-hidden">
        {/* Sleek Segmented Pill Tabs */}
        <div className="p-2 bg-cream/50 border-b border-border/70 flex items-center gap-1.5 overflow-x-auto no-scrollbar no-print">
          {[
            { id: 'mama', label: 'For Mama' },
            { id: 'baby', label: 'For Baby' },
            { id: 'partner', label: 'For Partner' },
            { id: 'documents', label: 'Documents' }
          ].map(tab => {
            const isSelected = activeTab === tab.id;
            const packedCount = items.filter(i => i.category === tab.id && i.packed).length;
            const totalCount = items.filter(i => i.category === tab.id).length;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab(tab.id as any);
                }}
                className={`h-9 px-3.5 rounded-xl font-bold text-[12.5px] whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-charcoal text-white shadow-2xs'
                    : 'text-medium hover:text-charcoal hover:bg-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-cream-dark/60 text-light'
                }`}>
                  {packedCount}/{totalCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* List */}
        <div className="p-4 sm:p-5 print-visible">
          <h2 className="hidden print:block font-serif text-2xl mb-4 text-charcoal border-b border-border pb-2 capitalize">
            {activeTab === 'mama' ? 'For Mama' : activeTab === 'baby' ? 'For Baby' : activeTab === 'partner' ? 'For Partner' : 'Documents & Formalities'}
          </h2>
          
          <div className="space-y-1.5">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                onClick={() => togglePacked(item.id)}
                className="flex items-center justify-between gap-3 p-3 hover:bg-cream/40 rounded-xl transition-colors cursor-pointer group select-none"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="shrink-0 no-print mt-0.5">
                    {item.packed ? (
                      <CheckCircle2 size={19} className="text-sage" />
                    ) : (
                      <Square size={19} className="text-light hover:text-medium transition-colors" />
                    )}
                  </div>
                  {/* Print only checkboxes */}
                  <div className="hidden print:block w-4 h-4 border border-black shrink-0" />
                  
                  <span className={`text-[13.5px] leading-snug transition-colors ${
                    item.packed ? 'text-light line-through' : 'text-charcoal font-medium'
                  }`}>
                    {item.label}
                  </span>
                </div>
                
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(item.id);
                  }} 
                  className="text-light hover:text-critical p-1.5 rounded-lg transition-colors no-print shrink-0 cursor-pointer"
                  aria-label="Delete item"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddCustom} className="mt-4 flex gap-2 pt-4 border-t border-border/70 no-print">
            <input
              type="text"
              value={customItem}
              onChange={e => setCustomItem(e.target.value)}
              placeholder="Add custom packing item..."
              className="flex-1 px-3.5 py-2.5 border border-border/80 rounded-xl text-[13px] text-charcoal bg-cream/40 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
            />
            <button 
              type="submit" 
              disabled={!customItem.trim()} 
              className="h-10 px-4 bg-sage text-white rounded-xl font-bold text-[13px] disabled:opacity-40 hover:bg-sage-dark flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <Plus size={15} /> 
              <span>Add</span>
            </button>
          </form>
        </div>
      </div>
      
      {/* Print rendering for all sections (hidden on screen) */}
      <div className="hidden print:block space-y-8 mt-8">
        {['mama', 'baby', 'partner', 'documents'].filter(t => t !== activeTab).map(category => (
          <div key={category}>
            <h2 className="font-serif text-2xl mb-4 text-charcoal border-b border-border pb-2 capitalize">
              {category === 'mama' ? 'For Mama' : category === 'baby' ? 'For Baby' : category === 'partner' ? 'For Partner' : 'Documents & Formalities'}
            </h2>
            <div className="space-y-2">
               {items.filter(i => i.category === category).map(item => (
                 <div key={item.id} className="flex items-center gap-3">
                   <div className="w-4 h-4 border border-black shrink-0" />
                   <span className="text-[14px] text-charcoal">{item.label}</span>
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
