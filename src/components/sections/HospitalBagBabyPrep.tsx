import React, { useState } from 'react';
import { Task } from '../../types';
import { triggerHaptic } from '../../utils/nativeBridge';
import { Briefcase, ShoppingBag } from 'lucide-react';
import { HospitalBag } from './HospitalBag';
import { Preparation } from './Preparation';

interface HospitalBagBabyPrepProps {
  filterTasks?: (t: Task[]) => Task[];
  initialTab?: 'bag' | 'nursery';
}

export const HospitalBagBabyPrep: React.FC<HospitalBagBabyPrepProps> = ({
  filterTasks = (t) => t,
  initialTab = 'bag',
}) => {
  const [activeTab, setActiveTab] = useState<'bag' | 'nursery'>(initialTab);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Sleek Segmented Control Tab Switcher */}
      <div className="bg-white border border-border/80 rounded-2xl p-1.5 shadow-2xs">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setActiveTab('bag');
            }}
            className={`py-2.5 px-3 rounded-xl text-[12.5px] xs:text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'bag'
                ? 'bg-sage text-white shadow-xs'
                : 'text-medium hover:text-charcoal hover:bg-cream/60'
            }`}
          >
            <Briefcase size={16} className={activeTab === 'bag' ? 'text-white' : 'text-stone-700'} />
            <span className="truncate">Hospital Packing Bag</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setActiveTab('nursery');
            }}
            className={`py-2.5 px-3 rounded-xl text-[12.5px] xs:text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'nursery'
                ? 'bg-sage text-white shadow-xs'
                : 'text-medium hover:text-charcoal hover:bg-cream/60'
            }`}
          >
            <ShoppingBag size={16} className={activeTab === 'nursery' ? 'text-white' : 'text-blue-600'} />
            <span className="truncate">Nursery & Baby Gear</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="transition-all">
        {activeTab === 'bag' ? (
          <HospitalBag />
        ) : (
          <Preparation filterTasks={filterTasks} />
        )}
      </div>
    </div>
  );
};
