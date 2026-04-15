import React from 'react';
import { Task } from '../types';
import { usePlanner } from '../store';
import { Check } from 'lucide-react';

type TaskItemProps = {
  task: Task;
};

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { state, toggleTask, toggleAssign, setAssigneeNote } = usePlanner();
  
  const isDone = !!state.checked[task.id];
  const isAssigned = !!state.assigned[task.id];
  const assigneeNote = state.assigneeNotes[task.id] || '';
  
  if (state.critFilter && !task.crit) {
    return null;
  }

  // Hide partner tag if solo
  const isPartnerTask = task.partner && state.partnerSit !== 'solo';
  const canAssign = state.partnerSit !== 'solo';

  return (
    <div 
      onClick={() => toggleTask(task.id)}
      className={`flex items-start gap-3 p-[13px_15px] border-[1.5px] rounded-[11px] mb-[7px] cursor-pointer transition-all
        ${isDone ? 'bg-cream border-border opacity-70' : 'bg-white border-border hover:border-sage-light'}`}
    >
      <div className={`w-5 h-5 border-2 rounded-[6px] flex items-center justify-center shrink-0 mt-[1px] transition-all
        ${isDone ? 'bg-sage border-sage' : 'border-border'}`}>
        {isDone && <Check size={14} className="text-white" strokeWidth={3} />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className={`text-[14px] leading-[1.45] ${isDone ? 'line-through text-light' : 'text-charcoal'}`}>
          {task.text}
        </div>
        {!state.isCalmModeActive && (
          <div className="flex items-center gap-[7px] mt-[5px] flex-wrap">
            <span className={`text-[10px] font-semibold tracking-[0.7px] uppercase px-2 py-0.5 rounded-[10px]
              ${task.crit ? 'bg-critical-bg text-critical' : 'bg-optional-bg text-optional'}`}>
              {task.crit ? 'Critical' : 'Nice to have'}
            </span>
            
            {task.timing && (
              <span className="bg-gold-pale text-gold text-[11px] px-2 py-0.5 rounded-[10px] italic">
                ⏰ {task.timing}
              </span>
            )}
            
            {isPartnerTask && (
              <span className="bg-blush-pale text-blush text-[10px] font-semibold tracking-[0.7px] uppercase px-2 py-0.5 rounded-[10px]">
                👥 Partner
              </span>
            )}
          </div>
        )}
      </div>
      
      {canAssign && (
        <div className="ml-auto shrink-0 flex flex-col items-end gap-1.5">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleAssign(task.id);
            }}
            className={`text-[11px] px-2.5 py-1 border rounded-[10px] font-sans transition-all
              ${isAssigned ? 'border-blush-light text-blush bg-blush-pale' : 'border-border text-light bg-transparent hover:border-blush hover:text-blush hover:bg-blush-pale'}`}
          >
            {isAssigned ? '✓ Assigned' : 'Assign to partner'}
          </button>
          
          {isAssigned && (
            <input
              type="text"
              value={assigneeNote}
              onChange={(e) => setAssigneeNote(task.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Who's doing this?"
              className="text-[10px] p-[3px_6px] border border-border rounded-[4px] bg-white text-charcoal w-[110px] focus:outline-none focus:border-blush transition-colors placeholder:italic placeholder:text-light"
            />
          )}
        </div>
      )}
    </div>
  );
};

export const TaskList: React.FC<{ tasks: Task[], filterTasks: (t: Task[]) => Task[] }> = ({ tasks, filterTasks }) => {
  const filtered = filterTasks(tasks);
  
  if (filtered.length === 0) {
    return <div className="text-center p-10 text-light text-[14px] italic">No tasks for your current settings in this section.</div>;
  }

  return (
    <div>
      {filtered.map(t => <TaskItem key={t.id} task={t} />)}
    </div>
  );
};
