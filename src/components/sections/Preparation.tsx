import React, { useState } from 'react';
import { PREP_TASKS } from '../../data';
import { Task } from '../../types';
import { TaskList } from '../TaskItem';
import { ContextBanner } from '../ContextBanner';
import { CustomTaskList } from './CustomTaskList';
import { usePlanner } from '../../store';

export const Preparation: React.FC<{ filterTasks: (t: Task[]) => Task[] }> = ({ filterTasks }) => {
  const { state } = usePlanner();
  const [tri, setTri] = useState('t1');

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-7">
        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-normal mb-1.5">Preparation Tasks</h2>
        {!state.isCalmModeActive && (
          <p className="text-[14px] text-medium max-w-[560px] leading-[1.7]">Nursery, classes, equipment, and everything in between — organised by trimester.</p>
        )}
      </div>
      
      {!state.isCalmModeActive && <ContextBanner />}
      
      {!state.isCalmModeActive && (
        <div className="flex gap-[14px] flex-wrap p-[13px_16px] bg-white border-[1.5px] border-border rounded-[11px] mb-5">
          <div className="flex items-center gap-[7px] text-[12px] text-medium">
            <span className="bg-critical-bg text-critical text-[10px] font-semibold tracking-[0.7px] uppercase px-2 py-0.5 rounded-[10px]">Critical</span>
            Important before baby arrives
          </div>
          <div className="flex items-center gap-[7px] text-[12px] text-medium">
            <span className="bg-optional-bg text-optional text-[10px] font-semibold tracking-[0.7px] uppercase px-2 py-0.5 rounded-[10px]">Optional</span>
            Helpful but flexible
          </div>
          <div className="flex items-center gap-[7px] text-[12px] text-medium">
            <span className="bg-blush-pale text-blush text-[10px] font-semibold tracking-[0.7px] uppercase px-2 py-0.5 rounded-[10px]">👥 Partner</span>
            Involves your support person
          </div>
        </div>
      )}

      <div className="flex gap-1.5 mb-5">
        <button onClick={() => setTri('t1')} className={`px-4 py-2 rounded-[20px] border-[1.5px] font-sans text-[13px] font-medium transition-all ${tri === 't1' ? 'border-blush bg-blush-pale text-blush' : 'border-border bg-white text-medium'}`}>First Trimester</button>
        <button onClick={() => setTri('t2')} className={`px-4 py-2 rounded-[20px] border-[1.5px] font-sans text-[13px] font-medium transition-all ${tri === 't2' ? 'border-sage bg-sage-pale text-sage' : 'border-border bg-white text-medium'}`}>Second Trimester</button>
        <button onClick={() => setTri('t3')} className={`px-4 py-2 rounded-[20px] border-[1.5px] font-sans text-[13px] font-medium transition-all ${tri === 't3' ? 'border-gold bg-gold-pale text-gold' : 'border-border bg-white text-medium'}`}>Third Trimester</button>
      </div>

      {tri === 't1' && <TaskList tasks={PREP_TASKS.t1} filterTasks={filterTasks} />}
      {tri === 't2' && <TaskList tasks={PREP_TASKS.t2} filterTasks={filterTasks} />}
      {tri === 't3' && <TaskList tasks={PREP_TASKS.t3} filterTasks={filterTasks} />}

      <CustomTaskList sectionId={`prep_${tri}`} />
    </div>
  );
};
