import React, { useState } from 'react';
import { PREP_TASKS } from '../../data';
import { Task } from '../../types';
import { TaskList } from '../TaskItem';
import { ContextBanner } from '../ContextBanner';
import { CustomTaskList } from './CustomTaskList';
import { usePlanner } from '../../store';
import { triggerHaptic } from '../../utils/nativeBridge';

export const Preparation: React.FC<{ filterTasks: (t: Task[]) => Task[] }> = ({ filterTasks }) => {
  const { state } = usePlanner();
  const [tri, setTri] = useState('t1');

  return (
    <div className="animate-in fade-in duration-300">
      <ContextBanner description="Nursery, classes, equipment, and everything in between — organised by trimester." />

      <div className="grid grid-cols-3 gap-1.5 xs:gap-2 mb-4">
        <button
          type="button"
          onClick={() => { triggerHaptic('light'); setTri('t1'); }}
          className={`py-2 px-1 xs:px-2 rounded-xl border text-[12px] xs:text-[12.5px] font-bold text-center transition-all cursor-pointer truncate ${
            tri === 't1'
              ? 'border-blush bg-blush-pale text-blush shadow-2xs'
              : 'border-border/80 bg-white text-charcoal/70 hover:border-sage hover:text-charcoal'
          }`}
        >
          1st Trimester
        </button>
        <button
          type="button"
          onClick={() => { triggerHaptic('light'); setTri('t2'); }}
          className={`py-2 px-1 xs:px-2 rounded-xl border text-[12px] xs:text-[12.5px] font-bold text-center transition-all cursor-pointer truncate ${
            tri === 't2'
              ? 'border-sage bg-sage-pale text-sage shadow-2xs'
              : 'border-border/80 bg-white text-charcoal/70 hover:border-sage hover:text-charcoal'
          }`}
        >
          2nd Trimester
        </button>
        <button
          type="button"
          onClick={() => { triggerHaptic('light'); setTri('t3'); }}
          className={`py-2 px-1 xs:px-2 rounded-xl border text-[12px] xs:text-[12.5px] font-bold text-center transition-all cursor-pointer truncate ${
            tri === 't3'
              ? 'border-amber-500/80 bg-amber-50 text-amber-800 shadow-2xs'
              : 'border-border/80 bg-white text-charcoal/70 hover:border-sage hover:text-charcoal'
          }`}
        >
          3rd Trimester
        </button>
      </div>

      {tri === 't1' && <TaskList tasks={PREP_TASKS.t1} filterTasks={filterTasks} />}
      {tri === 't2' && <TaskList tasks={PREP_TASKS.t2} filterTasks={filterTasks} />}
      {tri === 't3' && <TaskList tasks={PREP_TASKS.t3} filterTasks={filterTasks} />}

      <CustomTaskList sectionId={`prep_${tri}`} />
    </div>
  );
};
