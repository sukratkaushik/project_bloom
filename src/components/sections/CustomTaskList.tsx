import React, { useState } from 'react';
import { usePlanner } from '../../store';
import { TaskList } from '../TaskItem';
import { Plus } from 'lucide-react';

type CustomTaskListProps = {
  sectionId: string;
  title?: string;
};

export const CustomTaskList: React.FC<CustomTaskListProps> = ({ sectionId, title = "My Custom Tasks" }) => {
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
    <div className="mt-7">
      <h3 className="font-serif text-[18px] xs:text-[19px] font-medium mb-3 text-charcoal">{title}</h3>
      
      {customTasks.length > 0 && (
        <div className="mb-3">
          <TaskList tasks={customTasks} filterTasks={(t) => t} />
        </div>
      )}

      <form onSubmit={handleAddTask} className="flex gap-2">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add a custom task..."
          className="flex-1 py-2 px-3 border border-border/80 rounded-xl font-sans text-[13px] text-charcoal bg-white focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage/20 transition-all placeholder:text-light/70 shadow-3xs"
        />
        <button
          type="submit"
          disabled={!newTaskText.trim()}
          className="px-3.5 py-2 bg-sage text-white rounded-xl font-semibold text-[13px] hover:bg-sage-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center active:scale-95 shadow-3xs"
        >
          <Plus size={16} />
        </button>
      </form>
    </div>
  );
};
