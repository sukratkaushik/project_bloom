import React, { useState } from 'react';
import { usePlanner } from '../../store';
import { TaskList } from '../TaskItem';
import { Plus } from 'lucide-react';

type CustomTaskListProps = {
  sectionId: string;
  title?: string;
};

export const CustomTaskList: React.FC<CustomTaskListProps> = ({ sectionId, title }) => {
  const { state, addCustomTask } = usePlanner();
  const [newTaskText, setNewTaskText] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      addCustomTask(sectionId, newTaskText.trim());
      setNewTaskText('');
    }
  };

  const customTasks = state.customTasks[sectionId] || [];

  return (
    <div className="mt-5 no-print">
      {title && (
        <h4 className="text-[12px] font-bold uppercase tracking-wider text-charcoal/70 mb-2.5">
          {title}
        </h4>
      )}
      
      {customTasks.length > 0 && (
        <div className="mb-3 space-y-2">
          <TaskList tasks={customTasks} filterTasks={(t) => t} />
        </div>
      )}

      <form onSubmit={handleAddTask} className="flex gap-2">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add a custom task..."
          className="flex-1 py-2.5 px-3.5 border border-border/80 rounded-xl font-sans text-[13px] text-charcoal bg-white focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage/20 transition-all placeholder:text-light/70 shadow-3xs"
        />
        <button
          type="submit"
          disabled={!newTaskText.trim()}
          className={`w-10 h-10 bg-sage text-white rounded-xl font-semibold transition-all hover:bg-sage-dark flex items-center justify-center active:scale-95 shadow-3xs shrink-0 cursor-pointer ${
            !newTaskText.trim() ? 'opacity-70' : 'opacity-100'
          }`}
          title="Add task"
          aria-label="Add task"
        >
          <Plus size={17} strokeWidth={2.4} />
        </button>
      </form>
    </div>
  );
};
