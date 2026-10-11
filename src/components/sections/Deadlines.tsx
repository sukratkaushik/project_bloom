import React, { useState } from 'react';
import { usePlanner } from '../../store';
import { DEADLINE_TASKS } from '../../data';
import { Task } from '../../types';
import { ContextBanner } from '../ContextBanner';
import { CustomTaskList } from './CustomTaskList';
import { addWeeks, fmtDay, fmtMonth } from '../../utils';
import { Check, Trash2, Users, UserCheck } from 'lucide-react';
import { triggerHaptic } from '../../utils/nativeBridge';
import { PartnerModal } from '../mobile/PartnerModal';
import { syncEngine } from '../../syncEngine';

export const Deadlines: React.FC<{ filterTasks: (t: Task[]) => Task[] }> = ({ filterTasks }) => {
  const { state, updateState, toggleTask, deleteTask, toggleAssign } = usePlanner();
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [pendingShareTask, setPendingShareTask] = useState<{ id: string; text: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const today = new Date();
  const baseDueDate = state.dueDate ? new Date(state.dueDate) : addWeeks(new Date(), 40);

  const sorted = [...DEADLINE_TASKS].sort((a, b) => (a.weeksBeforeDue || 0) - (b.weeksBeforeDue || 0));
  const filtered = filterTasks(sorted).filter(t => !state.deletedTasks?.[t.id]);

  const partnerName = state.partner?.name?.trim() || 'Partner';
  const partnerPhone = state.partner?.phone?.trim() || '';
  const partnerEmail = state.partner?.email?.trim() || '';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleToggle = (id: string) => {
    triggerHaptic('selection');
    toggleTask(id);
  };

  const handleDelete = (id: string) => {
    triggerHaptic('warning');
    deleteTask(id);
  };

  // Mother assigns / unassigns a specific deadline to her partner (or opens PartnerModal if unconfigured)
  const handleAssignClick = (t: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    const isAssigned = !!state.assigned[t.id];

    // If not yet assigned and no partner is configured yet, open modal to define partner
    if (!isAssigned && !state.partner?.name?.trim()) {
      triggerHaptic('medium');
      setPendingShareTask({ id: t.id, text: t.text });
      setIsPartnerModalOpen(true);
      return;
    }

    triggerHaptic('light');
    const newAssigned = { ...state.assigned, [t.id]: !isAssigned };
    const newState = { ...state, assigned: newAssigned };
    updateState({ assigned: newAssigned });

    // Sync across P2P if active
    if (syncEngine.conn && syncEngine.conn.open) {
      syncEngine.broadcastState(newState);
    }

    if (!isAssigned) {
      showToast(`Assigned to ${partnerName} ✨`);
    } else {
      showToast(`Unassigned from ${partnerName}`);
    }
  };

  // Mother syncs all deadlines with her partner configured in P2P Partner Sync
  const handleSyncAllToPartner = () => {
    triggerHaptic('medium');

    const hasPartner = !!state.partner?.name?.trim();
    if (!hasPartner) {
      // Mother hasn't configured partner yet in P2P Partner Sync -> open Partner Profile setup
      setPendingShareTask(null);
      setIsPartnerModalOpen(true);
      return;
    }

    // 1. Mark all deadlines as assigned to partner in shared state
    const newAssigned = { ...state.assigned };
    filtered.forEach(t => { newAssigned[t.id] = true; });
    const newState = { ...state, assigned: newAssigned };
    updateState({ assigned: newAssigned });

    // 2. Direct P2P Sync if WebRTC connection is active
    if (syncEngine.conn && syncEngine.conn.open) {
      syncEngine.broadcastState(newState);
      showToast(`Synced all deadlines with ${partnerName} ✨`);
    } else {
      showToast(`Assigned all deadlines to ${partnerName} in Partner Sync ✨`);
    }
  };

  const completedCount = filtered.filter(t => !!state.checked[t.id]).length;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Context banner with integrated time-sensitive subtitle and circumstances */}
      <ContextBanner description="Time-sensitive items calculated from your due date, sorted earliest to latest." />

      {/* Deadlines Section Header & Partner Share Button */}
      <div className="flex items-center justify-between gap-2 mb-3 pt-1">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-serif text-[18px] xs:text-[20px] font-bold text-charcoal truncate">
            Deadlines
          </h3>
          <span className="text-[11px] font-medium text-light bg-cream/90 px-2 py-0.5 rounded-full border border-border/60 shrink-0">
            {completedCount}/{filtered.length} done
          </span>
        </div>

        <button
          type="button"
          onClick={handleSyncAllToPartner}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] xs:text-[12px] font-semibold bg-sage/15 text-sage-dark hover:bg-sage/25 border border-sage/30 active:scale-95 transition-all shadow-3xs cursor-pointer"
          title="Sync complete deadline list with partner"
          aria-label="Sync complete deadline list with partner"
        >
          <Users size={12.5} />
          <span>Sync with Partner</span>
        </button>
      </div>

      {/* Deadlines List */}
      <div className="space-y-2">
        {filtered.map(t => {
          const byDate = addWeeks(baseDueDate, -(t.weeksBeforeDue || 0));
          const isPast = byDate < today;
          const isDone = !!state.checked[t.id];
          const isAssigned = !!state.assigned[t.id];

          return (
            <div 
              key={t.id}
              onClick={() => handleToggle(t.id)}
              className={`group flex items-center gap-2.5 xs:gap-3 p-2.5 xs:p-3 border rounded-xl cursor-pointer transition-all ${
                isDone 
                  ? 'bg-cream/50 border-border/70 opacity-60' 
                  : isPast 
                  ? 'bg-rose-50/40 border-rose-200/80 hover:border-rose-300 shadow-3xs hover:shadow-2xs' 
                  : 'bg-white border-border/80 hover:border-sage/50 shadow-3xs hover:shadow-2xs'
              }`}
            >
              {/* Date Box */}
              <div className={`text-center min-w-[44px] xs:min-w-[48px] shrink-0 py-1 px-1 rounded-xl border transition-all ${
                isDone
                  ? 'bg-cream/60 border-border/50 text-light'
                  : isPast
                  ? 'bg-rose-100/70 border-rose-200 text-rose-800'
                  : 'bg-cream/80 border-border/60 text-charcoal'
              }`}>
                <div className="font-serif text-[18px] xs:text-[20px] font-normal leading-none">
                  {fmtDay(byDate)}
                </div>
                <div className="text-[9px] xs:text-[9.5px] font-bold tracking-wider uppercase text-light mt-0.5">
                  {fmtMonth(byDate)}
                </div>
              </div>

              {/* Checkbox */}
              <div className={`w-5 h-5 rounded-lg border-[1.5px] flex items-center justify-center shrink-0 transition-all ${
                isDone 
                  ? 'bg-sage border-sage shadow-3xs' 
                  : isPast
                  ? 'border-rose-300 bg-white group-hover:border-rose-400'
                  : 'border-border/90 bg-white group-hover:border-sage'
              }`}>
                {isDone && <Check size={12} className="text-white" strokeWidth={3} />}
              </div>

              {/* Content: Title & Timing */}
              <div className="flex-1 min-w-0 pr-1">
                <div className={`text-[13px] xs:text-[13.5px] leading-snug break-words ${
                  isDone ? 'line-through text-light font-normal' : 'text-charcoal font-medium'
                }`}>
                  {t.text}
                </div>
                <div className="text-[11px] text-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span>{t.weeksBeforeDue} wks before due date</span>
                  {!isDone && isPast && (
                    <span className="text-[10px] text-rose-700 bg-rose-100/80 px-1.5 py-0.2 rounded-full font-bold">
                      Past date
                    </span>
                  )}
                  {isAssigned && (
                    <span className="inline-flex items-center gap-1 bg-sage-pale text-sage-dark border border-sage/30 px-2 py-0.2 rounded-full text-[10px] font-semibold">
                      <UserCheck size={11} className="stroke-[2.5]" />
                      <span>Assigned to {partnerName}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Icons: Assign to Partner (Human Icon) & Delete */}
              <div className="shrink-0 flex items-center gap-1 self-center">
                <button
                  type="button"
                  onClick={(e) => handleAssignClick(t, e)}
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
                    handleDelete(t.id);
                  }}
                  className="w-7 h-7 xs:w-8 xs:h-8 rounded-xl flex items-center justify-center text-charcoal/30 hover:text-critical hover:bg-critical-bg border border-transparent hover:border-critical/20 transition-all cursor-pointer active:scale-95"
                  title="Delete deadline"
                  aria-label="Delete deadline"
                >
                  <Trash2 size={13.5} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <CustomTaskList sectionId="deadlines" title="My Custom Deadlines" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-charcoal/90 text-white text-[12px] font-medium px-4 py-2 rounded-full shadow-lg border border-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Partner Profile Modal */}
      <PartnerModal
        isOpen={isPartnerModalOpen}
        onClose={() => {
          setIsPartnerModalOpen(false);
          setPendingShareTask(null);
        }}
        initialPartner={state.partner}
        taskTitleToAssign={pendingShareTask?.text}
        onSave={(partnerData) => {
          const newAssigned = pendingShareTask
            ? { ...state.assigned, [pendingShareTask.id]: true }
            : state.assigned;

          const updatedState = {
            ...state,
            partner: partnerData,
            assigned: newAssigned,
            birthPlan: {
              ...state.birthPlan,
              personalDetails: {
                ...state.birthPlan?.personalDetails,
                partnerName: partnerData.name,
              },
            },
          };

          updateState(updatedState);

          if (syncEngine.conn && syncEngine.conn.open) {
            syncEngine.broadcastState(updatedState);
          }

          showToast(`Partner saved! Linked with ${partnerData.name} 💕`);
          setIsPartnerModalOpen(false);
          setPendingShareTask(null);
        }}
        onRemove={() => {
          updateState({ partner: null });
          showToast('Partner profile removed');
        }}
      />
    </div>
  );
};
