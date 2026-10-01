import React, { useState } from 'react';
import { Task } from '../types';
import { usePlanner } from '../store';
import { Check, Trash2, Users, UserCheck, MessageCircle, Pencil } from 'lucide-react';
import { triggerHaptic } from '../utils/nativeBridge';
import { PartnerModal } from './mobile/PartnerModal';

type TaskItemProps = {
  task: Task;
};

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { state, updateState, toggleTask, toggleAssign, setAssigneeNote, deleteTask } = usePlanner();
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);

  const isDone = !!state.checked[task.id];
  const isAssigned = !!state.assigned[task.id];
  const assigneeNote = state.assigneeNotes?.[task.id] || '';
  
  // Hide partner tag if solo
  const isPartnerTask = task.partner && state.partnerSit !== 'solo';
  const canAssign = state.partnerSit !== 'solo';

  // Partner display name
  const partnerName = state.partner?.name?.trim() || assigneeNote.trim() || 'Partner';
  const partnerPhone = state.partner?.phone?.trim() || '';

  const handleShareToPartner = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');

    const cleanPhone = partnerPhone.replace(/[^\d]/g, '');
    const message = `Hi ${partnerName}! 🌸 In Our Pregnancy, I've assigned this milestone to you:\n\n"${task.text}"\n\nLet's check this off together! 💕`;

    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
      return;
    }

    if (navigator.share) {
      navigator.share({
        title: 'Assigned Milestone in Our Pregnancy',
        text: message,
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(message);
      alert(`Milestone text copied! You can paste and send it to ${partnerName}.`);
    }
  };

  const handleAssignClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // If not yet assigned and no partner is defined yet, open modal to define partner
    if (!isAssigned && !state.partner?.name) {
      triggerHaptic('medium');
      setIsPartnerModalOpen(true);
      return;
    }

    triggerHaptic('light');
    toggleAssign(task.id);
  };

  return (
    <>
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
                  className="inline-flex items-center gap-1.5 bg-sage-pale text-sage-dark border border-sage/30 pl-2.5 pr-1.5 py-0.5 rounded-full text-[11px] font-medium shadow-3xs animate-in fade-in duration-150 flex-wrap"
                >
                  <UserCheck size={12} className="text-sage shrink-0 stroke-[2.2]" />
                  <span className="font-semibold text-charcoal">
                    Assigned to {partnerName}
                  </span>

                  {/* 1-Tap WhatsApp Share Button */}
                  <button
                    type="button"
                    onClick={handleShareToPartner}
                    className="p-1 hover:bg-white text-emerald-600 rounded-full transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                    title={partnerPhone ? `Send to ${partnerName} on WhatsApp` : `Share milestone with ${partnerName}`}
                    aria-label={`Send to ${partnerName}`}
                  >
                    <MessageCircle size={12} className="shrink-0" />
                    <span className="text-[10px] font-bold">Send</span>
                  </button>

                  {/* Edit note or change partner */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic('light');
                      setIsEditingNote(!isEditingNote);
                    }}
                    className="p-1 text-light hover:text-charcoal hover:bg-white rounded-full transition-colors cursor-pointer"
                    title="Add note or edit partner"
                  >
                    <Pencil size={11} />
                  </button>

                  {isEditingNote && (
                    <div className="w-full flex items-center gap-1.5 mt-1 pt-1 border-t border-sage/20">
                      <input
                        type="text"
                        value={assigneeNote}
                        onChange={(e) => setAssigneeNote(task.id, e.target.value)}
                        placeholder="Add custom note (optional)..."
                        className="bg-white border border-sage/30 rounded px-2 py-0.5 text-[10.5px] text-charcoal flex-1 focus:outline-none focus:border-sage placeholder:text-light"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setIsPartnerModalOpen(true)}
                        className="text-[10px] font-semibold text-sage-dark hover:underline whitespace-nowrap px-1"
                      >
                        Edit Partner
                      </button>
                    </div>
                  )}
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
              onClick={handleAssignClick}
              className={`w-7 h-7 xs:w-8 xs:h-8 rounded-xl flex items-center justify-center border transition-all cursor-pointer active:scale-95 ${
                isAssigned 
                  ? 'border-sage/40 bg-sage-pale text-sage-dark shadow-3xs' 
                  : 'border-border/80 bg-cream/40 text-light hover:text-sage-dark hover:border-sage/40 hover:bg-sage-pale/60'
              }`}
              title={isAssigned ? `Assigned to ${partnerName} (tap to unassign)` : "Assign to partner"}
              aria-label={isAssigned ? `Assigned to ${partnerName}` : "Assign to partner"}
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

      <PartnerModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        initialPartner={state.partner}
        taskTitleToAssign={task.text}
        onSave={(partnerData) => {
          updateState({
            partner: partnerData,
            assigned: { ...state.assigned, [task.id]: true }
          });
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
