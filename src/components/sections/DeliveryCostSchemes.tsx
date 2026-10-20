import React, { useState } from 'react';
import { Task } from '../../types';
import { triggerHaptic } from '../../utils/nativeBridge';
import { DollarSign, Building } from 'lucide-react';
import { Financial } from './Financial';
import { GovernmentSchemes } from './GovernmentSchemes';

interface DeliveryCostSchemesProps {
  filterTasks?: (t: Task[]) => Task[];
  initialTab?: 'budget' | 'schemes';
}

export const DeliveryCostSchemes: React.FC<DeliveryCostSchemesProps> = ({
  filterTasks = (t) => t,
  initialTab = 'budget',
}) => {
  const [activeTab, setActiveTab] = useState<'budget' | 'schemes'>(initialTab);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Sleek Segmented Control Tab Switcher */}
      <div className="bg-white border border-border/80 rounded-2xl p-1.5 shadow-2xs">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setActiveTab('budget');
            }}
            className={`py-2.5 px-3 rounded-xl text-[12.5px] xs:text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'budget'
                ? 'bg-sage text-white shadow-xs'
                : 'text-medium hover:text-charcoal hover:bg-cream/60'
            }`}
          >
            <DollarSign size={16} className={activeTab === 'budget' ? 'text-white' : 'text-emerald-700'} />
            <span className="truncate">Delivery Cost & Leave</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setActiveTab('schemes');
            }}
            className={`py-2.5 px-3 rounded-xl text-[12.5px] xs:text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'schemes'
                ? 'bg-sage text-white shadow-xs'
                : 'text-medium hover:text-charcoal hover:bg-cream/60'
            }`}
          >
            <Building size={16} className={activeTab === 'schemes' ? 'text-white' : 'text-yellow-700'} />
            <span className="truncate">Govt Schemes (PMMVY)</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="transition-all">
        {activeTab === 'budget' ? (
          <Financial filterTasks={filterTasks} />
        ) : (
          <GovernmentSchemes />
        )}
      </div>
    </div>
  );
};
