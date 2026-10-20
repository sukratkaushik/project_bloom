import React, { useState } from 'react';
import { Task } from '../../types';
import { triggerHaptic } from '../../utils/nativeBridge';
import { Calendar, Syringe, Clock, Stethoscope } from 'lucide-react';
import { Deadlines } from './Deadlines';
import { Medical } from './Medical';

interface VisitsVaccinesScheduleProps {
  filterTasks?: (t: Task[]) => Task[];
  initialTab?: 'scans' | 'vaccines';
}

export const VisitsVaccinesSchedule: React.FC<VisitsVaccinesScheduleProps> = ({
  filterTasks = (t) => t,
  initialTab = 'scans',
}) => {
  const [activeTab, setActiveTab] = useState<'scans' | 'vaccines'>(initialTab);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Sleek Segmented Control Tab Switcher */}
      <div className="bg-white border border-border/80 rounded-2xl p-1.5 shadow-2xs">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setActiveTab('scans');
            }}
            className={`py-2.5 px-3 rounded-xl text-[12.5px] xs:text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'scans'
                ? 'bg-sage text-white shadow-xs'
                : 'text-medium hover:text-charcoal hover:bg-cream/60'
            }`}
          >
            <Clock size={16} className={activeTab === 'scans' ? 'text-white' : 'text-sage-dark'} />
            <span className="truncate">Scans & Visits</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setActiveTab('vaccines');
            }}
            className={`py-2.5 px-3 rounded-xl text-[12.5px] xs:text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'vaccines'
                ? 'bg-sage text-white shadow-xs'
                : 'text-medium hover:text-charcoal hover:bg-cream/60'
            }`}
          >
            <Syringe size={16} className={activeTab === 'vaccines' ? 'text-white' : 'text-rose-600'} />
            <span className="truncate">Vaccines & Labs</span>
          </button>
        </div>
      </div>

      {/* Tab Content with Smooth Transitions */}
      <div className="transition-all">
        {activeTab === 'scans' ? (
          <Deadlines filterTasks={filterTasks} />
        ) : (
          <Medical filterTasks={filterTasks} />
        )}
      </div>
    </div>
  );
};
