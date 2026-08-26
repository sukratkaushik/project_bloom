import React from 'react';
import { usePlanner } from '../../store';
import { DEADLINE_TASKS } from '../../data';
import { Task } from '../../types';
import { ContextBanner } from '../ContextBanner';
import { CustomTaskList } from './CustomTaskList';
import { addWeeks, fmtDay, fmtMonth } from '../../utils';
import { Check, Trash2 } from 'lucide-react';

export const Deadlines: React.FC<{ filterTasks: (t: Task[]) => Task[] }> = ({ filterTasks }) => {
  const { state, toggleTask, deleteTask } = usePlanner();
  
  const today = new Date();
  const sorted = [...DEADLINE_TASKS].sort((a, b) => (a.weeksBeforeDue || 0) - (b.weeksBeforeDue || 0));
  const filtered = filterTasks(sorted);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-7">
        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-normal mb-1.5">Important Deadlines</h2>
        {!state.isCalmModeActive && (
          <p className="text-[14px] text-medium max-w-[560px] leading-[1.7]">Time-sensitive items calculated from your due date, sorted earliest to latest.</p>
        )}
      </div>
      
      {!state.isCalmModeActive && <ContextBanner />}
      
      <div>
        {filtered.map(t => {
          const byDate = addWeeks(new Date(state.dueDate!), -(t.weeksBeforeDue || 0));
          const isPast = byDate < today;
          const isDone = !!state.checked[t.id];
          
          return (
            <div 
              key={t.id}
              onClick={() => toggleTask(t.id)}
              className={`flex gap-4 items-start p-[14px_16px] bg-white border-[1.5px] rounded-[11px] mb-2 cursor-pointer transition-all
                ${isDone ? 'opacity-60 border-border' : (isPast ? 'border-blush-light bg-blush-pale' : 'border-border hover:border-sage-light')}`}
            >
              <div className="text-center min-w-[54px]">
                <div className="font-serif text-[26px] font-normal leading-none text-charcoal">{fmtDay(byDate)}</div>
                <div className="text-[11px] font-semibold tracking-[0.8px] uppercase text-light">{fmtMonth(byDate)}</div>
              </div>
              
              <div className={`w-5 h-5 border-2 rounded-[6px] flex items-center justify-center shrink-0 mt-1.5 transition-all
                ${isDone ? 'bg-sage border-sage' : 'border-border'}`}>
                {isDone && <Check size={14} className="text-white" strokeWidth={3} />}
              </div>
              
              <div className="flex-1">
                <div className={`text-[14px] leading-[1.4] ${isDone ? 'line-through text-light' : 'text-charcoal'}`}>
                  {t.text}
                </div>
                {!state.isCalmModeActive && (
                  <div className="flex gap-[7px] mt-[5px] flex-wrap items-center">
                    <span className="text-[12px] text-light">{t.weeksBeforeDue} weeks before due date</span>
                    {!isDone && isPast && (
                      <span className="text-[11px] text-blush font-semibold">⚠ Past date — check if done</span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTask(t.id);
                }}
                className="text-gray-300 hover:text-red-400 transition-colors mt-1.5 ml-2"
                title="Delete task"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>
      
      <CustomTaskList sectionId="deadlines" title="My Custom Deadlines" />
    </div>
  );
};
