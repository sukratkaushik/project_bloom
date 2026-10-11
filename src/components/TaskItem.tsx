import React, { useState } from 'react';
import { Task } from '../types';
import { usePlanner } from '../store';
import { Check, Trash2, Users, UserCheck } from 'lucide-react';
import { triggerHaptic } from '../utils/nativeBridge';
import { PartnerModal } from './mobile/PartnerModal';
import { syncEngine } from '../syncEngine';

type TaskItemProps = {
  task: Task;
};

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { state, updateState, toggleTask, toggleAssign, deleteTask } = usePlanner();
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  const isDone = !!state.checked[task.id];
  const isAssigned = !!state.assigned[task.id];
  const partnerName = state.partner?.name?.trim() || 'Partner';

  const handleAssignClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // If not yet assigned and no partner is defined yet, open modal to define partner
    if (!isAssigned && !state.partner?.name?.trim()) {
      triggerHaptic('medium');
      setIsPartnerModalOpen(true);
      return;
    }

    triggerHaptic('light');
    toggleAssign(task.id);
    if (syncEngine.conn && syncEngine.conn.open) {
      const newAssigned = { ...state.assigned, [task.id]: !isAssigned };
      syncEngine.broadcastState({ ...state, assigned: newAssigned });
    }
  };

  return (
    <>
      <div 
        onClick={() => {
          triggerHaptic('light');
          toggleTask(task.id);
        }}
        className={`group flex items-center gap-2.5 xs:gap-3 p-2.5 xs:p-3 border rounded-xl mb-2 cursor-pointer transition-all ${
          isDone 
            ? 'bg-cream/60 border-border/70 opacity-65' 
            : 'bg-white border-border/80 hover:border-sage/40 shadow-3xs hover:shadow-2xs'
        }`}
      >
        {/* Checkbox */}
        <div 
          className={`w-5 h-5 rounded-lg border-[1.5px] flex items-center justify-center shrink-0 transition-all ${
            isDone ? 'bg-sage border-sage shadow-3xs' : 'border-border/90 bg-white group-hover:border-sage'
          }`}
        >
          {isDone && <Check size={13} className="text-white" strokeWidth={3} />}
        </div>
        
        {/* Task Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className={`text-[13px] xs:text-[13.5px] leading-snug break-words ${isDone ? 'line-through text-light font-normal' : 'text-charcoal font-medium'}`}>
            {task.text}
          </div>

          {/* Timing & Partner Assignment Badge */}
          {(task.timing || isAssigned) && (
            <div className="text-[11px] text-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
              {task.timing && (
                <span className="bg-gold-pale text-gold border border-gold/20 text-[10px] xs:text-[10.5px] font-medium px-2 py-0.5 rounded-full italic">
                  ⏰ {task.timing}
                </span>
              )}
              {isAssigned && (
                <span className="inline-flex items-center gap-1 bg-sage-pale text-sage-dark border border-sage/30 px-2 py-0.2 rounded-full text-[10px] font-semibold">
                  <UserCheck size={11} className="stroke-[2.5]" />
                  <span>Assigned to {partnerName}</span>
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Right Action Icons: Assign to Partner (Human Icon) & Delete */}
        <div className="shrink-0 flex items-center gap-1 self-center">
          <button 
            type="button"
            onClick={handleAssignClick}
            className={`w-7 h-7 xs:w-8 xs:h-8 rounded-xl flex items-center justify-center border transition-all cursor-pointer active:scale-95 ${
              isAssigned 
                ? 'border-sage/40 bg-sage-pale text-sage-dark shadow-3xs' 
                : 'border-border/80 bg-cream/40 text-charcoal/50 hover:text-sage-dark hover:border-sage/40 hover:bg-sage-pale/60'
            }`}
            title={isAssigned ? `Assigned to ${partnerName} (tap to unassign)` : "Assign to partner"}
            aria-label={isAssigned ? `Assigned to ${partnerName}` : "Assign to partner"}
          >
            {isAssigned ? (
              <UserCheck size={13.5} className="stroke-[2.2]" />
            ) : (
              <Users size={13.5} />
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('light');
              deleteTask(task.id);
            }}
            className="w-7 h-7 xs:w-8 xs:h-8 rounded-xl flex items-center justify-center text-charcoal/40 hover:text-critical hover:bg-critical-bg border border-transparent hover:border-critical/20 transition-all cursor-pointer active:scale-95"
            title="Delete task"
            aria-label="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <PartnerModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        initialPartner={state.partner}
        taskTitleToAssign={task.text}
        onSave={(partnerData) => {
          const newAssigned = { ...state.assigned, [task.id]: true };
          const newState = {
            ...state,
            partner: partnerData,
            assigned: newAssigned,
          };
          updateState(newState);
          if (syncEngine.conn && syncEngine.conn.open) {
            syncEngine.broadcastState(newState);
          }
          setIsPartnerModalOpen(false);
        }}
      />
    </>
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
