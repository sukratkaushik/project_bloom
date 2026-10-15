import React, { useState } from 'react';
import { usePlanner } from '../../store';
import { MED_TASKS, VACC_TASKS } from '../../data';
import { Task } from '../../types';
import { TaskList } from '../TaskItem';
import { ContextBanner } from '../ContextBanner';
import { triggerHaptic } from '../../utils/nativeBridge';
import { Plus } from 'lucide-react';

export const Medical: React.FC<{ filterTasks: (t: Task[]) => Task[] }> = ({ filterTasks }) => {
  const { state, addCustomTask } = usePlanner();
  const [tri, setTri] = useState<'t1' | 't2' | 't3'>('t1');
  const [newTaskText, setNewTaskText] = useState('');

  const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('customTaskInput') as HTMLInputElement | null;
    const val = newTaskText.trim() || input?.value.trim() || '';
    if (val) {
      triggerHaptic('light');
      addCustomTask(`medical_${tri}`, val);
      setNewTaskText('');
      if (input) input.value = '';
    }
  };

  const customTasks = state.customTasks[`medical_${tri}`] || [];

  return (
    <div className="animate-in fade-in duration-300">
        <ContextBanner description="Your personalised appointment schedule and screening timeline." />

        {/* Responsive Trimester Switcher */}
        <div className="grid grid-cols-3 gap-1.5 xs:gap-2 mb-3.5">
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

        {/* Add Custom Task Input at Top */}
        <form onSubmit={handleAddTask} className="flex gap-2 mb-3.5">
          <input
            name="customTaskInput"
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a custom task..."
            className="flex-1 py-2.5 px-3.5 border border-border/80 rounded-xl font-sans text-[13px] text-charcoal bg-white focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage/20 transition-all placeholder:text-light/70 shadow-3xs"
          />
          <button
            type="submit"
            className={`w-10 h-10 bg-sage text-white rounded-xl font-semibold transition-all hover:bg-sage-dark flex items-center justify-center active:scale-95 shadow-3xs shrink-0 cursor-pointer ${
              !newTaskText.trim() ? 'opacity-70' : 'opacity-100'
            }`}
            title="Add task"
            aria-label="Add task"
          >
            <Plus size={17} strokeWidth={2.4} />
          </button>
        </form>

        {/* Tasks List with seamlessly integrated custom tasks */}
        {tri === 't1' && <TaskList tasks={[...customTasks, ...MED_TASKS.t1]} filterTasks={filterTasks} />}
        {tri === 't2' && <TaskList tasks={[...customTasks, ...MED_TASKS.t2]} filterTasks={filterTasks} />}
        {tri === 't3' && (
          <div>
            <TaskList tasks={[...customTasks, ...MED_TASKS.t3]} filterTasks={filterTasks} />
            <div className="mt-6 mb-6">
              <div className="font-serif text-[18px] font-medium text-charcoal mb-0.5">Vaccinations</div>
              <div className="text-[12px] text-light italic mb-3">Protecting you and your newborn before they can be vaccinated themselves</div>
              <TaskList tasks={VACC_TASKS} filterTasks={filterTasks} />
            </div>
          </div>
        )}
      </div>
  );
};

