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
  Copy
} from 'lucide-react';
import { HospitalBagItem } from '../../types';

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
    updateState({
      hospitalBagItems: items.map(item => 
        item.id === id ? { ...item, packed: !item.packed } : item
      )
    });
  };

  const deleteItem = (id: string) => {
    updateState({
      hospitalBagItems: items.filter(item => item.id !== id)
    });
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItem.trim()) return;
    
    updateState({
      hospitalBagItems: [
        ...items,
        { id: uuidv4(), label: customItem.trim(), category: activeTab, packed: false, isCustom: true }
      ]
    });
    setCustomItem('');
  };

  const handleCopy = () => {
    const text = `Hospital Bag Checklist:\n\nFor Mama:\n${items.filter(i => i.category === 'mama').map(i => `${i.packed ? '✅' : '☐'} ${i.label}`).join('\n')}\n\nFor Baby:\n${items.filter(i => i.category === 'baby').map(i => `${i.packed ? '✅' : '☐'} ${i.label}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredItems = items.filter(i => i.category === activeTab);
  const totalPacked = items.filter(i => i.packed).length;
  const progressPct = items.length ? Math.round((totalPacked / items.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between flex-wrap gap-4 no-print">
        <div className="flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-sage" />
          <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-normal text-charcoal">Hospital Bag</h1>
        </div>
        
        <div className="flex gap-2">
          <button onClick={handleCopy} className="p-2 border border-border rounded-lg text-medium hover:bg-gray-50 bg-white" title="Copy to clipboard">
            <Copy className="w-5 h-5" />
          </button>
          <button onClick={handlePrint} className="p-2 border border-border rounded-lg text-medium hover:bg-gray-50 bg-white" title="Print checklist">
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-[1.5px] border-border rounded-[16px] shadow-sm p-5 no-print">
        <div className="flex justify-between items-end mb-2">
          <h3 className="font-semibold text-charcoal text-[15px]">Packing Progress</h3>
          <span className="text-[13px] font-semibold text-sage">{totalPacked} of {items.length} items packed</span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-sage transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="bg-white border-[1.5px] border-border rounded-[16px] shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-border hide-scrollbar no-print">
          {[
            { id: 'mama', label: 'For Mama' },
            { id: 'baby', label: 'For Baby' },
            { id: 'partner', label: 'For Partner' },
            { id: 'documents', label: 'Documents' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 font-semibold text-[14px] whitespace-nowrap transition-colors flex-1 ${activeTab === tab.id ? 'bg-sage-pale/20 text-sage border-b-2 border-sage' : 'text-medium hover:bg-gray-50'}`}
            >
              {tab.label}
              <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-medium">
                {items.filter(i => i.category === tab.id && i.packed).length}/{items.filter(i => i.category === tab.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        <div className="p-4 sm:p-6 print-visible">
          <h2 className="hidden print:block font-serif text-2xl mb-4 text-charcoal border-b border-border pb-2 capitalize">
            {activeTab === 'mama' ? 'For Mama' : activeTab === 'baby' ? 'For Baby' : activeTab === 'partner' ? 'For Partner' : 'Documents & Formalities'}
          </h2>
          
          <div className="space-y-1">
            {filteredItems.map(item => (
              <div key={item.id} className="flex grid grid-cols-[auto_1fr_auto] items-center gap-3 p-3 hover:bg-gray-50 rounded-lg group">
                <button onClick={() => togglePacked(item.id)} className="shrink-0 no-print">
                  {item.packed ? <CheckSquare className="w-5 h-5 text-sage" /> : <Square className="w-5 h-5 text-border" />}
                </button>
                {/* Print only checkboxes */}
                <div className="hidden print:block w-4 h-4 border border-black shrink-0"></div>
                
                <span className={`text-[15px] transition-colors ${item.packed ? 'text-medium line-through' : 'text-charcoal'}`}>
                  {item.label}
                </span>
                
                {item.isCustom && (
                  <button onClick={() => deleteItem(item.id)} className="opacity-0 group-hover:opacity-100 text-medium hover:text-critical p-1 transition-opacity no-print">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleAddCustom} className="mt-4 flex gap-2 pt-4 border-t border-border no-print">
            <input
              type="text"
              value={customItem}
              onChange={e => setCustomItem(e.target.value)}
              placeholder="Add custom item..."
              className="flex-1 p-[11px_14px] border border-border rounded-lg text-[14px]"
            />
            <button type="submit" disabled={!customItem.trim()} className="px-5 bg-sage text-white rounded-lg font-semibold text-[14px] disabled:opacity-50 hover:bg-sage-dark flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add
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
                   <div className="w-4 h-4 border border-black shrink-0"></div>
                   <span className="text-[14px] text-charcoal">{item.label}</span>
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
