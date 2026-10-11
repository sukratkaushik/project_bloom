import React, { useState, useEffect } from 'react';
import { usePlanner } from '../../store';
import { v4 as uuidv4 } from 'uuid';
import { 
  Check,
  Plus,
  Trash2,
  Users,
  UserCheck
} from 'lucide-react';
import { HospitalBagItem, PartnerInfo } from '../../types';
import { triggerHaptic } from '../../utils/nativeBridge';
import { ContextBanner } from '../ContextBanner';
import { PartnerModal } from '../mobile/PartnerModal';
import { syncEngine } from '../../syncEngine';

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
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [pendingItemToAssign, setPendingItemToAssign] = useState<HospitalBagItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const partnerName = state.partner?.name?.trim() || 'Partner';

  // Initialize default items if empty
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
    const updated = items.map(item => 
      item.id === id ? { ...item, packed: !item.packed } : item
    );
    const newState = {
      ...state,
      hospitalBagItems: updated
    };
    updateState(newState);

    if (syncEngine.conn && syncEngine.conn.open) {
      syncEngine.broadcastState(newState);
    }
  };

  const deleteItem = (id: string) => {
    triggerHaptic('warning');
    const updated = items.filter(item => item.id !== id);
    const newState = {
      ...state,
      hospitalBagItems: updated
    };
    updateState(newState);

    if (syncEngine.conn && syncEngine.conn.open) {
      syncEngine.broadcastState(newState);
    }
    showToast('Item removed from checklist');
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

    const newState = {
      ...state,
      hospitalBagItems: [newItem, ...items]
    };
    updateState(newState);

    if (syncEngine.conn && syncEngine.conn.open) {
      syncEngine.broadcastState(newState);
    }

    setCustomItem('');
    showToast('Custom item added');
  };

  const toggleAssign = (item: HospitalBagItem) => {
    triggerHaptic('light');
    const isCurrentlyAssigned = !!item.assigned || !!state.assigned?.[item.id];
    const newAssigned = !isCurrentlyAssigned;

    const updatedItems = items.map(i =>
      i.id === item.id ? { ...i, assigned: newAssigned } : i
    );
    const updatedAssignedMap = {
      ...state.assigned,
      [item.id]: newAssigned
    };
    const newState = {
      ...state,
      hospitalBagItems: updatedItems,
      assigned: updatedAssignedMap
    };
    updateState(newState);

    if (syncEngine.conn && syncEngine.conn.open) {
      syncEngine.broadcastState(newState);
    }

    if (newAssigned) {
      showToast(`Assigned to ${partnerName} ✨`);
    } else {
      showToast(`Unassigned from ${partnerName}`);
    }
  };

  const handleAssignClick = (e: React.MouseEvent, item: HospitalBagItem) => {
    e.stopPropagation();
    const isCurrentlyAssigned = !!item.assigned || !!state.assigned?.[item.id];

    // If not yet assigned and no partner is configured yet, open modal to define partner
    if (!isCurrentlyAssigned && !state.partner?.name?.trim()) {
      triggerHaptic('medium');
      setPendingItemToAssign(item);
      setIsPartnerModalOpen(true);
      return;
    }

    toggleAssign(item);
  };

  const filteredItems = items.filter(i => i.category === activeTab);
  const totalPacked = items.filter(i => i.packed).length;
  const progressPct = items.length ? Math.round((totalPacked / items.length) * 100) : 0;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Context Banner */}
      <ContextBanner description="Essential packing list for labor ward, postpartum stay & baby welcome." />

      {/* Overall Readiness Progress Bar Card */}
      <div className="bg-white border border-border/80 rounded-2xl shadow-3xs p-4 sm:p-5 no-print">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="font-serif font-semibold text-charcoal text-[15px]">Overall Readiness</span>
            <span className="text-[11px] font-bold text-sage-dark bg-sage-pale px-2.5 py-0.5 rounded-full border border-sage/20">
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
      <div className="bg-white border border-border/80 rounded-2xl shadow-3xs overflow-hidden">
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
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-cream-dark/60 text-light'
                }`}>
                  {packedCount}/{totalCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-3.5 sm:p-5 print-visible">
          {/* Add Custom Packing Item (Top Aligned) */}
          <form onSubmit={handleAddCustom} className="flex gap-2 mb-3.5 no-print">
            <input
              type="text"
              value={customItem}
              onChange={e => setCustomItem(e.target.value)}
              placeholder="Add custom packing item..."
              className="flex-1 py-2.5 px-3.5 border border-border/80 rounded-xl font-sans text-[13px] text-charcoal bg-white focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage/20 transition-all placeholder:text-light/70 shadow-3xs"
            />
            <button 
              type="submit" 
              disabled={!customItem.trim()}
              className={`w-10 h-10 bg-sage text-white rounded-xl font-semibold transition-all hover:bg-sage-dark flex items-center justify-center active:scale-95 shadow-3xs shrink-0 cursor-pointer ${
                !customItem.trim() ? 'opacity-70' : 'opacity-100'
              }`}
              title="Add custom item"
              aria-label="Add custom item"
            >
              <Plus size={17} strokeWidth={2.4} />
            </button>
          </form>

          {/* Checklist Items */}
          <div className="space-y-2">
            {filteredItems.map(item => {
              const isAssigned = !!item.assigned || !!state.assigned?.[item.id];
              return (
                <div 
                  key={item.id} 
                  onClick={() => togglePacked(item.id)}
                  className={`group flex items-center gap-2.5 xs:gap-3 p-2.5 xs:p-3 border rounded-xl cursor-pointer transition-all select-none ${
                    item.packed 
                      ? 'bg-cream/60 border-border/70 opacity-65' 
                      : 'bg-white border-border/80 hover:border-sage/40 shadow-3xs hover:shadow-2xs'
                  }`}
                >
                  {/* Checkbox */}
                  <div 
                    className={`w-5 h-5 rounded-lg border-[1.5px] flex items-center justify-center shrink-0 transition-all ${
                      item.packed ? 'bg-sage border-sage shadow-3xs' : 'border-border/90 bg-white group-hover:border-sage'
                    }`}
                  >
                    {item.packed && <Check size={13} className="text-white" strokeWidth={3} />}
                  </div>

                  {/* Print Checkbox */}
                  <div className="hidden print:block w-4 h-4 border border-black shrink-0" />
                  
                  {/* Item Content */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className={`text-[13px] xs:text-[13.5px] leading-snug break-words ${
                      item.packed ? 'line-through text-light font-normal' : 'text-charcoal font-medium'
                    }`}>
                      {item.label}
                    </div>

                    {/* Assigned to Partner Badge */}
                    {isAssigned && (
                      <div className="text-[11px] text-medium mt-1 flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 bg-sage-pale text-sage-dark border border-sage/30 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                          <UserCheck size={11} className="stroke-[2.5]" />
                          <span>Assigned to {partnerName}</span>
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Right Action Icons: Partner Assign/Share (Human Icon) & Delete */}
                  <div className="shrink-0 flex items-center gap-1 self-center no-print">
                    <button 
                      type="button"
                      onClick={(e) => handleAssignClick(e, item)}
                      className={`w-7 h-7 xs:w-8 xs:h-8 rounded-xl flex items-center justify-center border transition-all cursor-pointer active:scale-95 ${
                        isAssigned 
                          ? 'border-sage/40 bg-sage-pale text-sage-dark shadow-3xs' 
                          : 'border-border/80 bg-cream/40 text-charcoal/50 hover:text-sage-dark hover:border-sage/40 hover:bg-sage-pale/60'
                      }`}
                      title={isAssigned ? `Assigned to ${partnerName} (tap to unassign)` : "Assign to partner"}
                      aria-label={isAssigned ? `Assigned to ${partnerName}` : "Assign to partner"}
                    >
                      {isAssigned ? (
                        <UserCheck size={13.5} className="stroke-[2.2]" />
                      ) : (
                        <Users size={13.5} />
                      )}
                    </button>

                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item.id);
                      }} 
                      className="w-7 h-7 xs:w-8 xs:h-8 rounded-xl flex items-center justify-center text-charcoal/40 hover:text-critical hover:bg-critical-bg border border-transparent hover:border-critical/20 transition-all cursor-pointer active:scale-95"
                      title="Delete item"
                      aria-label="Delete item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="text-center py-8 text-light text-[13px] italic">
                No items in this category yet. Add one above!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Partner Setup & Assignment Modal */}
      <PartnerModal
        isOpen={isPartnerModalOpen}
        onClose={() => {
          setIsPartnerModalOpen(false);
          setPendingItemToAssign(null);
        }}
        initialPartner={state.partner}
        taskTitleToAssign={pendingItemToAssign?.label}
        onSave={(partnerData: PartnerInfo) => {
          triggerHaptic('success');
          let updatedItems = items;
          let updatedAssignedMap = { ...state.assigned };

          if (pendingItemToAssign) {
            updatedItems = items.map(i =>
              i.id === pendingItemToAssign.id ? { ...i, assigned: true } : i
            );
            updatedAssignedMap[pendingItemToAssign.id] = true;
          }

          const newState = {
            ...state,
            partner: partnerData,
            hospitalBagItems: updatedItems,
            assigned: updatedAssignedMap,
          };
          updateState(newState);

          if (syncEngine.conn && syncEngine.conn.open) {
            syncEngine.broadcastState(newState);
          }

          showToast(`Partner saved! Assigned to ${partnerData.name} 💕`);
          setIsPartnerModalOpen(false);
          setPendingItemToAssign(null);
        }}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-charcoal text-white text-[12.5px] font-medium px-4 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-center gap-2 pointer-events-none">
          <span>{toastMessage}</span>
        </div>
      )}

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
