import React, { useState } from 'react';
import { usePlanner } from '../../store';
import { MED_TASKS, VACC_TASKS } from '../../data';
import { Task } from '../../types';
import { TaskList } from '../TaskItem';
import { ContextBanner } from '../ContextBanner';
import { CustomTaskList } from './CustomTaskList';

export const Medical: React.FC<{ filterTasks: (t: Task[]) => Task[] }> = ({ filterTasks }) => {
  const { state, setNote } = usePlanner();
  const [tri, setTri] = useState('t1');

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-7">
        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-normal mb-1.5">Medical & Healthcare</h2>
        {!state.isCalmModeActive && (
          <p className="text-[14px] text-medium max-w-[560px] leading-[1.7]">Your personalised appointment schedule and screening timeline.</p>
        )}
      </div>
      
      {!state.isCalmModeActive && <ContextBanner />}
      
      {!state.isCalmModeActive && (
        <div className="flex gap-[14px] flex-wrap p-[13px_16px] bg-white border-[1.5px] border-border rounded-[11px] mb-5">
          <div className="flex items-center gap-[7px] text-[12px] text-medium">
            <span className="bg-critical-bg text-critical text-[10px] font-semibold tracking-[0.7px] uppercase px-2 py-0.5 rounded-[10px]">Critical</span>
            Medically recommended or time-sensitive
          </div>
          <div className="flex items-center gap-[7px] text-[12px] text-medium">
            <span className="bg-optional-bg text-optional text-[10px] font-semibold tracking-[0.7px] uppercase px-2 py-0.5 rounded-[10px]">Optional</span>
            Beneficial but flexible
          </div>
        </div>
      )}

      <div className="flex gap-1.5 mb-5">
        <button onClick={() => setTri('t1')} className={`px-4 py-2 rounded-[20px] border-[1.5px] font-sans text-[13px] font-medium transition-all ${tri === 't1' ? 'border-blush bg-blush-pale text-blush' : 'border-border bg-white text-medium'}`}>First Trimester</button>
        <button onClick={() => setTri('t2')} className={`px-4 py-2 rounded-[20px] border-[1.5px] font-sans text-[13px] font-medium transition-all ${tri === 't2' ? 'border-sage bg-sage-pale text-sage' : 'border-border bg-white text-medium'}`}>Second Trimester</button>
        <button onClick={() => setTri('t3')} className={`px-4 py-2 rounded-[20px] border-[1.5px] font-sans text-[13px] font-medium transition-all ${tri === 't3' ? 'border-gold bg-gold-pale text-gold' : 'border-border bg-white text-medium'}`}>Third Trimester</button>
      </div>

      {tri === 't1' && <TaskList tasks={MED_TASKS.t1} filterTasks={filterTasks} />}
      {tri === 't2' && <TaskList tasks={MED_TASKS.t2} filterTasks={filterTasks} />}
      {tri === 't3' && (
        <div>
          <TaskList tasks={MED_TASKS.t3} filterTasks={filterTasks} />
          <div className="mt-7 mb-7">
            <div className="font-serif text-[20px] font-medium mb-1">Vaccinations</div>
            <div className="text-[12px] text-light italic mb-3">Protecting you and your newborn before they can be vaccinated themselves</div>
            <TaskList tasks={VACC_TASKS} filterTasks={filterTasks} />
          </div>
        </div>
      )}

      <div className="h-px bg-border my-7" />
      
      <div className="font-serif text-[20px] font-medium mb-3">Provider Notes</div>
      <label className="text-[11px] font-semibold tracking-[1px] uppercase text-medium block mb-2">My healthcare team</label>
      <textarea 
        value={state.notes['notesMed'] || ''}
        onChange={(e) => setNote('notesMed', e.target.value)}
        className="w-full p-3.5 border-[1.5px] border-border rounded-[12px] font-sans text-[14px] text-charcoal bg-white resize-y min-h-[100px] transition-all leading-[1.65] focus:outline-none focus:border-sage focus:ring-[3px] focus:ring-sage/10 placeholder:text-light placeholder:italic"
        placeholder="Midwife name, OB, hospital, after-hours number…"
      />

      <CustomTaskList sectionId={`medical_${tri}`} />
    </div>
  );
};
