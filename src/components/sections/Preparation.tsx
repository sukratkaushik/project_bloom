import React, { useState } from 'react';
import { PREP_TASKS } from '../../data';
import { Task } from '../../types';
import { TaskList } from '../TaskItem';
import { ContextBanner } from '../ContextBanner';
import { usePlanner } from '../../store';
import { triggerHaptic } from '../../utils/nativeBridge';
import { Plus } from 'lucide-react';

export const Preparation: React.FC<{ filterTasks: (t: Task[]) => Task[] }> = ({ filterTasks }) => {
  const { state, addCustomTask } = usePlanner();
  const [tri, setTri] = useState<'t1' | 't2' | 't3'>('t1');
  const [newTaskText, setNewTaskText] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      triggerHaptic('light');
      addCustomTask(`prep_${tri}`, newTaskText.trim());
      setNewTaskText('');
    }
  };

  const customTasks = (state.customTasks[`prep_${tri}`] || []).filter(t => !state.deletedTasks?.[t.id]);

  return (
    <div className="animate-in fade-in duration-300">
      <ContextBanner description="Nursery, classes, equipment, and everything in between — organised by trimester." />

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
      <form onSubmit={handleAddTask} className="flex gap-2 mb-3.5 no-print">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add a custom preparation task..."
          className="flex-1 py-2.5 px-3.5 border border-border/80 rounded-xl font-sans text-[13px] text-charcoal bg-white focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage/20 transition-all placeholder:text-light/70 shadow-3xs"
        />
        <button
          type="submit"
          disabled={!newTaskText.trim()}
          className={`w-10 h-10 bg-sage text-white rounded-xl font-semibold transition-all hover:bg-sage-dark flex items-center justify-center active:scale-95 shadow-3xs shrink-0 cursor-pointer ${
            !newTaskText.trim() ? 'opacity-70' : 'opacity-100'
          }`}
          title="Add custom task"
          aria-label="Add custom task"
        >
          <Plus size={17} strokeWidth={2.4} />
        </button>
      </form>

      {tri === 't1' && <TaskList tasks={[...customTasks, ...PREP_TASKS.t1]} filterTasks={filterTasks} />}
      {tri === 't2' && <TaskList tasks={[...customTasks, ...PREP_TASKS.t2]} filterTasks={filterTasks} />}
      {tri === 't3' && <TaskList tasks={[...customTasks, ...PREP_TASKS.t3]} filterTasks={filterTasks} />}
    </div>
  );
};
