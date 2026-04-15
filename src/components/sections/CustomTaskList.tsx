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
    <div className="mt-8">
      <h3 className="font-serif text-[22px] font-medium mb-4 text-charcoal">{title}</h3>
      
      {customTasks.length > 0 && (
        <div className="mb-4">
          <TaskList tasks={customTasks} filterTasks={(t) => t} />
        </div>
      )}

      <form onSubmit={handleAddTask} className="flex gap-2">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add a custom task..."
          className="flex-1 p-[10px_15px] border-[1.5px] border-border rounded-[11px] font-sans text-[14px] text-charcoal bg-white focus:outline-none focus:border-sage transition-colors placeholder:text-light"
        />
        <button
          type="submit"
          disabled={!newTaskText.trim()}
          className="px-4 bg-sage text-white rounded-[11px] font-semibold text-[13px] hover:bg-sage-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Plus size={18} />
        </button>
      </form>
    </div>
  );
};
