import React from 'react';
import { Task } from '../types';
import { usePlanner } from '../store';
import { Check, Trash2, Users, UserCheck } from 'lucide-react';
import { triggerHaptic } from '../utils/nativeBridge';

type TaskItemProps = {
  task: Task;
};

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { state, toggleTask, toggleAssign, setAssigneeNote, deleteTask } = usePlanner();
  
  const isDone = !!state.checked[task.id];
  const isAssigned = !!state.assigned[task.id];
  const assigneeNote = state.assigneeNotes?.[task.id] || '';
  // Hide partner tag if solo
  const isPartnerTask = task.partner && state.partnerSit !== 'solo';
  const canAssign = state.partnerSit !== 'solo';

  return (
    <div 
      onClick={() => {
        triggerHaptic('light');
        toggleTask(task.id);
      }}
      className={`group flex items-start gap-2.5 xs:gap-3 p-3 xs:p-3.5 border rounded-2xl mb-2 cursor-pointer transition-all ${
        isDone 
          ? 'bg-cream/60 border-border/70 opacity-65' 
          : 'bg-white border-border/80 hover:border-sage/40 shadow-3xs hover:shadow-2xs'
      }`}
    >
      {/* Checkbox */}
      <div 
        className={`w-5 h-5 rounded-lg border-[1.5px] flex items-center justify-center shrink-0 mt-0.5 transition-all ${
          isDone ? 'bg-sage border-sage shadow-3xs' : 'border-border/90 bg-white group-hover:border-sage'
        }`}
      >
        {isDone && <Check size={13} className="text-white" strokeWidth={3} />}
      </div>
      
      {/* Task Content */}
      <div className="flex-1 min-w-0 pr-1">
        <div className={`text-[13.5px] xs:text-[14px] leading-snug break-words ${isDone ? 'line-through text-light font-normal' : 'text-charcoal font-medium'}`}>
          {task.text}
        </div>

        {/* Metadata Badges & Partner Note */}
        {(task.timing || isPartnerTask || isAssigned || task.crit) && (
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {task.crit && !isDone && (
              <span className="bg-critical-bg text-critical border border-critical/20 text-[9.5px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full">
                Critical
              </span>
            )}

            {task.timing && (
              <span className="bg-gold-pale text-gold border border-gold/20 text-[10px] xs:text-[10.5px] font-medium px-2 py-0.5 rounded-full italic">
                ⏰ {task.timing}
              </span>
            )}
            
            {isPartnerTask && !isAssigned && (
              <span className="bg-blush-pale text-blush border border-blush/20 text-[9.5px] xs:text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full">
                👥 Partner
              </span>
            )}

            {isAssigned && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 bg-sage-pale text-sage-dark border border-sage/30 px-2 py-0.5 rounded-full text-[10.5px] font-medium shadow-3xs animate-in fade-in duration-150"
              >
                <UserCheck size={11} className="text-sage shrink-0" />
                <span className="font-semibold">Partner</span>
                <input
                  type="text"
                  value={assigneeNote}
                  onChange={(e) => setAssigneeNote(task.id, e.target.value)}
                  placeholder="Note/Name..."
                  className="ml-1 bg-white/95 border border-sage/30 rounded px-1.5 py-0.2 text-[10px] text-charcoal w-20 xs:w-24 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage/20 placeholder:text-light"
                />
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Right Action Icons (Compact ~60px) */}
      <div className="shrink-0 flex items-center gap-1 sm:gap-1.5 self-start pt-0.5">
        {canAssign && (
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('light');
              toggleAssign(task.id);
            }}
            className={`w-7 h-7 xs:w-8 xs:h-8 rounded-xl flex items-center justify-center border transition-all cursor-pointer active:scale-95 ${
              isAssigned 
                ? 'border-sage/40 bg-sage-pale text-sage-dark shadow-3xs' 
                : 'border-border/80 bg-cream/40 text-light hover:text-sage-dark hover:border-sage/40 hover:bg-sage-pale/60'
            }`}
            title={isAssigned ? "Assigned to partner (tap to unassign)" : "Assign to partner"}
            aria-label={isAssigned ? "Assigned to partner" : "Assign to partner"}
          >
            {isAssigned ? (
              <UserCheck size={15} className="stroke-[2.2]" />
            ) : (
              <Users size={14} />
            )}
          </button>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic('light');
            deleteTask(task.id);
          }}
          className="w-7 h-7 xs:w-8 xs:h-8 rounded-xl flex items-center justify-center text-light hover:text-critical hover:bg-critical-bg border border-transparent hover:border-critical/20 transition-all cursor-pointer active:scale-95"
          title="Delete task"
          aria-label="Delete task"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export const TaskList: React.FC<{ tasks: Task[], filterTasks: (t: Task[]) => Task[] }> = ({ tasks, filterTasks }) => {
  const { state } = usePlanner();
  const filtered = filterTasks(tasks).filter(t => !state.deletedTasks?.[t.id]);
  
  if (filtered.length === 0) {
    return <div className="text-center p-8 text-light text-[13.5px] italic">No tasks for your current settings in this section.</div>;
  }

  return (
    <div className="space-y-1">
      {filtered.map(t => <TaskItem key={t.id} task={t} />)}
    </div>
  );
};
