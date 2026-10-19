import React, { useState } from 'react';
import {
  Calendar, Plus, CheckSquare, Square,
  Clock, FileText,
  Bell, ChevronRight, CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import { triggerHaptic } from '../../../utils/nativeBridge';
import { usePlanner } from '../../../store';

import {
  CLINICAL_MILESTONES,
  getAuthoritativeNextMilestone,
  MilestoneCategory,
  ClinicalMilestone,
} from '../../../data/clinicalSchedule';

interface CareTabProps {
  onOpenTool: (toolId: string) => void;
  onOpenSchedule: () => void;
  onOpenNotifications: () => void;
  onShowToast: (message: string) => void;
}

interface QuestionItem {
  id: number;
  text: string;
  category: 'Symptoms' | 'Nutrition' | 'Scans' | 'General';
  done: boolean;
}

export const CareTab: React.FC<CareTabProps> = ({
  onOpenTool,
  onOpenSchedule,
  onOpenNotifications,
  onShowToast,
}) => {
  const { state, updateState } = usePlanner();

  // Gestational calculations matching Today tab exactly
  const due = state.dueDate ? new Date(state.dueDate) : new Date(Date.now() + 112 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffDays = Math.max(0, Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const completedDays = Math.max(1, 280 - diffDays);
  const currentWeek = Math.min(40, Math.max(1, Math.floor(completedDays / 7) + 1));
  const gestationDays = completedDays % 7;
  const nextMilestone = getAuthoritativeNextMilestone(currentWeek);

  const [selectedQuestionCategory, setSelectedQuestionCategory] = useState<string>('All');
  const [milestoneCategoryFilter, setMilestoneCategoryFilter] = useState<'all' | 'scan' | 'lab' | 'vaccine'>('all');
  const [prepQuestions, setPrepQuestions] = useState<QuestionItem[]>([
    { id: 1, text: 'Lower back tightness at Week 24 normal?', category: 'Symptoms', done: false },
    { id: 2, text: 'Schedule for Oral Glucose Test (OGTT)?', category: 'Scans', done: true },
    { id: 3, text: 'Safe sleep positions & pillow advice?', category: 'General', done: false },
    { id: 4, text: 'Best timing for iron & calcium tablets?', category: 'Nutrition', done: true },
    { id: 5, text: 'Target fetal kick frequency baseline?', category: 'Symptoms', done: false },
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');

  const toggleQuestion = (id: number) => {
    triggerHaptic('light');
    setPrepQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, done: !q.done } : q))
    );
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    triggerHaptic('medium');
    setPrepQuestions((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: newQuestionText.trim(),
        category: 'General',
        done: false,
      },
    ]);
    setNewQuestionText('');
  };

  const doctorShortName = state.doctor?.name ? state.doctor.name.split(',')[0].trim() : 'Obstetrician';

  const filteredQuestions = prepQuestions.filter(
    (q) => selectedQuestionCategory === 'All' || q.category === selectedQuestionCategory
  );

  const filteredMilestones = CLINICAL_MILESTONES.filter((item) => {
    if (milestoneCategoryFilter === 'all') return true;
    return item.category === milestoneCategoryFilter;
  });

  const scanCount = CLINICAL_MILESTONES.filter((m) => m.category === 'scan').length;
  const labCount = CLINICAL_MILESTONES.filter((m) => m.category === 'lab').length;
  const vaccineCount = CLINICAL_MILESTONES.filter((m) => m.category === 'vaccine').length;

  return (
    <div className="space-y-4 pb-32 animate-in fade-in duration-200">
      {/* 1. Next Prenatal Visit Bento Card */}
      {(() => {
        const activeAppointment = state.nextAppointment;
        const isReschedulePending = Boolean(activeAppointment?.notes?.includes('Reschedule requested'));
        const appointmentTitle = activeAppointment?.title || nextMilestone.title;
        const appointmentDateFormatted = activeAppointment?.date
          ? `${new Date(activeAppointment.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}${activeAppointment.time ? ` • ${activeAppointment.time}` : ''}`
          : nextMilestone.date;
        const appointmentFacility = activeAppointment?.hospital || state.doctor?.hospital || nextMilestone.facility;

        return (
          <div className="bg-gradient-to-r from-sage-pale/70 via-white to-cream border border-sage/35 rounded-3xl p-4 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-sage-dark uppercase tracking-wide flex-wrap">
                  <Clock size={12} />
                  <span>
                    {isReschedulePending ? 'Reschedule Requested' : `Next Checkup • ${nextMilestone.daysAway}`}
                  </span>
                  {isReschedulePending && (
                    <span className="text-[9px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                      Pending OPD
                    </span>
                  )}
                </div>
                <h4 className="font-serif font-bold text-charcoal text-[15px] leading-tight mt-0.5 truncate">
                  {appointmentTitle}
                </h4>
                <p className="text-[11.5px] text-medium mt-0.5 truncate">
                  {appointmentDateFormatted} • {appointmentFacility}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onOpenSchedule();
                }}
                className="px-3 py-1.5 bg-sage text-white text-[11.5px] font-bold rounded-xl shadow-2xs hover:bg-sage-dark active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                Reschedule
              </button>
            </div>

            <div className="mt-3 pt-2.5 border-t border-sage/20 flex items-center justify-between text-[11px]">
              <span className="text-medium truncate">
                {activeAppointment?.notes || nextMilestone.prep}
              </span>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onOpenTool('medical');
                }}
                className="text-sage-dark font-bold hover:underline shrink-0 ml-2 whitespace-nowrap cursor-pointer"
              >
                Checklist →
              </button>
            </div>
          </div>
        );
      })()}

      {/* 2. Consolidated Clinical Roadmap across Scans, Labs & Vaccines */}
      <div className="bg-white border border-border/80 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 px-0.5">
          <div className="flex items-center gap-1.5">
            <CalendarCheck size={16} className="text-sage-dark" />
            <h3 className="font-serif font-bold text-charcoal text-[14.5px]">
              Consolidated Clinical Roadmap
            </h3>
          </div>
          <span className="text-[10px] font-bold text-medium bg-cream px-2 py-0.5 rounded-full border border-border/60">
            ACOG & FOGSI
          </span>
        </div>

        {/* Milestone Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2.5 mb-1 -mx-0.5 px-0.5">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setMilestoneCategoryFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              milestoneCategoryFilter === 'all'
                ? 'bg-sage text-white shadow-2xs'
                : 'bg-cream/80 text-charcoal hover:bg-sage-pale/60 border border-border/60'
            }`}
          >
            All ({CLINICAL_MILESTONES.length})
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setMilestoneCategoryFilter('scan');
            }}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              milestoneCategoryFilter === 'scan'
                ? 'bg-sage text-white shadow-2xs'
                : 'bg-cream/80 text-charcoal hover:bg-sage-pale/60 border border-border/60'
            }`}
          >
            Ultrasounds ({scanCount})
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setMilestoneCategoryFilter('lab');
            }}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              milestoneCategoryFilter === 'lab'
                ? 'bg-sage text-white shadow-2xs'
                : 'bg-cream/80 text-charcoal hover:bg-sage-pale/60 border border-border/60'
            }`}
          >
            Lab Tests ({labCount})
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setMilestoneCategoryFilter('vaccine');
            }}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              milestoneCategoryFilter === 'vaccine'
                ? 'bg-sage text-white shadow-2xs'
                : 'bg-cream/80 text-charcoal hover:bg-sage-pale/60 border border-border/60'
            }`}
          >
            Vaccines ({vaccineCount})
          </button>
        </div>

        <div className="space-y-2">
          {filteredMilestones.map((item) => {
            const isCompleted = item.status === 'completed';
            const isUpcoming = item.status === 'upcoming';

            return (
              <div
                key={item.id}
                className={`min-h-[58px] p-3 rounded-2xl border flex items-center justify-between gap-2.5 transition-all ${
                  isUpcoming
                    ? 'bg-sage-pale/40 border-sage/60 shadow-2xs'
                    : isCompleted
                    ? 'bg-cream/40 border-border/60'
                    : 'bg-white border-border/40 opacity-75'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 size={16} className="text-sage-dark" />
                    ) : isUpcoming ? (
                      <Clock size={16} className="text-soft-saffron-dark animate-pulse" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-medium/40" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-charcoal text-[12.5px] leading-tight truncate">
                        {item.title}
                      </h4>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-white border border-border/70 text-medium whitespace-nowrap shrink-0">
                        {item.period}
                      </span>
                    </div>
                    <p className="text-[11px] text-medium truncate mt-0.5">
                      {item.date} {item.facility ? `• ${item.facility}` : ''}
                    </p>
                  </div>
                </div>

                {isCompleted && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      onOpenTool('medical-reports');
                    }}
                    className="text-[11px] font-bold text-sage-dark hover:underline shrink-0 whitespace-nowrap cursor-pointer"
                  >
                    Report →
                  </button>
                )}
                {isUpcoming && (
                  <span className="text-[9px] font-bold text-white bg-sage px-2 py-0.5 rounded-full shrink-0 shadow-2xs whitespace-nowrap">
                    Current
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Prenatal Reminders Strip */}
      <div className="bg-white border border-border/80 rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Bell size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-serif font-bold text-charcoal text-[13.5px] truncate">
                Prenatal Reminders
              </h4>
              <span className="text-[9px] font-bold text-sage-dark bg-sage-pale px-1.5 py-0.2 rounded-full whitespace-nowrap shrink-0">
                Active
              </span>
            </div>
            <p className="text-[11px] text-medium truncate mt-0.5">
              Hydration, kick counts & doctor alerts
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenNotifications();
          }}
          className="h-8 px-3 bg-cream border border-border text-charcoal hover:bg-sage/10 text-[11px] font-bold rounded-xl transition-colors shrink-0 whitespace-nowrap cursor-pointer"
        >
          Configure
        </button>
      </div>

      {/* 4. Questions for Doctor Checklist */}
      <div className="bg-white border border-border/80 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <div className="flex items-center gap-1.5">
            <FileText size={15} className="text-sage-dark" />
            <h3 className="font-serif font-bold text-charcoal text-[14px]">
              Questions for {doctorShortName}
            </h3>
          </div>
          <span className="text-[11px] font-bold text-sage-dark bg-sage-pale px-2 py-0.2 rounded-full whitespace-nowrap">
            {prepQuestions.filter((q) => q.done).length}/{prepQuestions.length} Done
          </span>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
          {['All', 'Symptoms', 'Nutrition', 'Scans', 'General'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setSelectedQuestionCategory(cat);
              }}
              className={`h-7 px-2.5 rounded-lg text-[10.5px] font-bold transition-all shrink-0 cursor-pointer flex items-center ${
                selectedQuestionCategory === cat
                  ? 'bg-charcoal text-white shadow-2xs'
                  : 'bg-cream text-medium border border-border/60 hover:text-charcoal'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Single-Line Question List */}
        <div className="space-y-1.5 mt-1">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              onClick={() => toggleQuestion(q.id)}
              className="h-10 px-2 rounded-xl hover:bg-cream/70 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              {q.done ? (
                <CheckSquare size={16} className="text-sage-dark shrink-0" />
              ) : (
                <Square size={16} className="text-medium shrink-0" />
              )}
              <span
                className={`text-[12px] truncate ${
                  q.done ? 'line-through text-light' : 'text-charcoal font-medium'
                }`}
              >
                {q.text}
              </span>
            </div>
          ))}
        </div>

        {/* Add Question Input */}
        <form onSubmit={handleAddQuestion} className="mt-2.5 pt-2.5 border-t border-border/60 flex items-center gap-2">
          <input
            type="text"
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            placeholder={`Add a question for ${doctorShortName}...`}
            className="flex-1 h-9 bg-cream/70 border border-border/80 rounded-xl px-3 text-[12px] text-charcoal focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage placeholder:text-light"
          />
          <button
            type="submit"
            className="w-9 h-9 rounded-xl bg-charcoal text-white flex items-center justify-center shrink-0 hover:opacity-90 active:scale-95 transition-transform cursor-pointer"
            aria-label="Add question"
          >
            <Plus size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
