import React, { useState } from 'react';
import {
  Stethoscope, Phone, Calendar, Plus, CheckSquare, Square,
  AlertTriangle, ShieldCheck, Clock, FileText,
  Bell, MessageCircle, ChevronRight, CheckCircle2,
  CalendarCheck, MapPin, Pencil, UserCheck, Download
} from 'lucide-react';
import { triggerHaptic } from '../../../utils/nativeBridge';
import { usePlanner } from '../../../store';
import { exportCarePlanPdf } from '../../../utils/pdfExport';
import { DoctorModal } from '../DoctorModal';

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

  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
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

  const doctor = state.doctor;
  const hasDoctor = Boolean(doctor && doctor.name && doctor.name.trim().length > 0);
  const cleanPhone = doctor?.phone ? doctor.phone.replace(/[^\d+]/g, '') : '';
  const cleanPhoneForWa = doctor?.phone ? doctor.phone.replace(/[^\d]/g, '') : '';
  const doctorShortName = hasDoctor && doctor?.name ? doctor.name.split(',')[0].trim() : 'Obstetrician';

  const [isExporting, setIsExporting] = useState(false);

  const handleExportCarePlan = async () => {
    try {
      setIsExporting(true);
      triggerHaptic('success');
      onShowToast('📄 Generating Clinical Care Plan PDF...');
      await exportCarePlanPdf(state);
      onShowToast('✅ Clinical Care Plan PDF downloaded! Ready to print or share.');
    } catch (err) {
      console.error('Failed to export Care Plan PDF:', err);
      onShowToast('❌ Could not generate Care Plan PDF.');
    } finally {
      setIsExporting(false);
    }
  };

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
      {/* 1. OB-GYN Clinical Care Team Hero Card */}
      <div className="bg-white border border-border/80 rounded-3xl p-4 shadow-xs">
        {hasDoctor && doctor ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-sage-pale text-sage-dark flex items-center justify-center font-bold text-lg shrink-0 border border-sage/20">
                <Stethoscope size={24} />
              </div>
              <div className="min-w-0">
                <span className="text-[9.5px] font-bold text-sage-dark uppercase tracking-wider block">
                  Primary Obstetrician
                </span>
                <h3 className="font-serif font-bold text-charcoal text-[16px] leading-tight truncate">
                  {doctor.name}
                </h3>
                <p className="text-[11.5px] text-medium mt-0.5 flex items-center gap-1 truncate">
                  <MapPin size={11} className="text-sage shrink-0" />
                  <span className="truncate">{doctor.hospital || 'Obstetrics & Gynecology'}</span>
                </p>
                {doctor.notes && (
                  <p className="text-[10.5px] text-sage-dark/90 mt-0.5 font-medium truncate">
                    {doctor.notes}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setIsDoctorModalOpen(true);
                }}
                className="w-8 h-8 rounded-full bg-cream hover:bg-sage-pale text-charcoal hover:text-sage-dark border border-border/70 flex items-center justify-center shadow-2xs active:scale-95 transition-all cursor-pointer"
                aria-label="Edit Doctor Details"
                title="Edit Doctor Details"
              >
                <Pencil size={13} />
              </button>

              {doctor.phone ? (
                <a
                  href={`tel:${cleanPhone}`}
                  onClick={() => triggerHaptic('light')}
                  className="w-8 h-8 rounded-full bg-sage text-white flex items-center justify-center shadow-xs hover:bg-sage-dark active:scale-95 transition-all"
                  aria-label="Call Doctor"
                  title={`Call ${doctor.name}`}
                >
                  <Phone size={14} />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setIsDoctorModalOpen(true);
                  }}
                  className="w-8 h-8 rounded-full bg-cream text-medium hover:text-charcoal border border-border/80 flex items-center justify-center shadow-2xs active:scale-95 transition-all cursor-pointer"
                  aria-label="Add Phone Number"
                  title="Add Phone Number"
                >
                  <Phone size={14} />
                </button>
              )}

              {doctor.phone ? (
                <a
                  href={`https://wa.me/${cleanPhoneForWa}?text=${encodeURIComponent(`Hello ${doctor.name}, query from Bloom app`)}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => triggerHaptic('light')}
                  className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
                  aria-label="WhatsApp Clinic"
                  title="WhatsApp OPD"
                >
                  <MessageCircle size={14} />
                </a>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sage-pale text-sage-dark flex items-center justify-center font-bold text-lg shrink-0 border border-sage/20">
              <Stethoscope size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] font-bold text-sage-dark uppercase tracking-wider block">
                  Primary Obstetrician
                </span>
                <span className="text-[10px] font-bold text-medium bg-cream px-2 py-0.5 rounded-full border border-border/60">
                  Not Assigned
                </span>
              </div>
              <h3 className="font-serif font-bold text-charcoal text-[15.5px] leading-tight mt-0.5">
                Add Your Primary Obstetrician
              </h3>
              <p className="text-[11.5px] text-medium mt-1 leading-snug">
                Save your OB-GYN, hospital, and emergency contact for 1-tap calls, WhatsApp, and visit prep.
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setIsDoctorModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sage hover:bg-sage-dark active:scale-95 text-white font-bold text-[12px] rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Primary Obstetrician</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Patient Clinical Info Bar with Symmetric Equal-Height Boxes */}
        <div className="mt-3.5 pt-3 border-t border-border/60 grid grid-cols-4 gap-2 text-center">
          <div className="bg-cream/70 rounded-xl py-2 px-1 border border-border/40 flex flex-col justify-center">
            <span className="text-medium text-[9px] font-bold uppercase tracking-wider block">UHID</span>
            <span className="font-mono font-bold text-charcoal text-[11px] truncate mt-0.5">#98421</span>
          </div>
          <div className="bg-cream/70 rounded-xl py-2 px-1 border border-border/40 flex flex-col justify-center">
            <span className="text-medium text-[9px] font-bold uppercase tracking-wider block">Blood</span>
            <span className="font-bold text-charcoal text-[11px] truncate mt-0.5">B+ (Rh+)</span>
          </div>
          <div className="bg-cream/70 rounded-xl py-2 px-1 border border-border/40 flex flex-col justify-center">
            <span className="text-medium text-[9px] font-bold uppercase tracking-wider block">Gestation</span>
            <span className="font-bold text-sage-dark text-[11px] truncate mt-0.5">Wk {currentWeek}+{gestationDays}d</span>
          </div>
          <div className="bg-cream/70 rounded-xl py-2 px-1 border border-border/40 flex flex-col justify-center">
            <span className="text-medium text-[9px] font-bold uppercase tracking-wider block">Allergy</span>
            <span className="font-bold text-emerald-700 text-[11px] truncate mt-0.5">NKDA</span>
          </div>
        </div>

        {/* 1-Tap Export & Print Doctor Report Button */}
        <div className="mt-3 pt-2.5 border-t border-border/60">
          <button
            type="button"
            onClick={handleExportCarePlan}
            disabled={isExporting}
            className="w-full h-10 rounded-2xl bg-cream hover:bg-sage-pale/60 border border-border/80 text-charcoal hover:text-sage-dark text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-[0.99] cursor-pointer"
          >
            <Download size={13} className="text-sage-dark" />
            <span>{isExporting ? 'Generating Report...' : '📄 Export & Print Clinical Care Plan (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* 2. Next Prenatal Visit Bento Card */}
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

      {/* 3. Consolidated Clinical Roadmap across Scans, Labs & Vaccines */}
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

      {/* 4. Prenatal Reminders Strip */}
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

      {/* 5. Questions for Doctor Checklist */}
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

      {/* 6. Emergency Hospital Triage */}
      <div className="bg-critical/5 border border-critical/25 rounded-3xl p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-2xl bg-critical/15 text-critical flex items-center justify-center shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-serif font-bold text-critical text-[14px]">
              24x7 Emergency Care
            </h4>
            <p className="text-[11.5px] text-charcoal/80 mt-1 leading-snug">
              Seek immediate care if experiencing severe headaches, sudden face/hand swelling, bleeding, or no fetal kicks.
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <a
                href="tel:108"
                onClick={() => triggerHaptic('warning')}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-critical text-white text-[11.5px] font-bold rounded-xl shadow-xs hover:opacity-90 active:scale-95 transition-all"
              >
                <Phone size={12} />
                <span>Call 108</span>
              </a>
              <a
                href={cleanPhone ? `tel:${cleanPhone}` : 'tel:+919876543210'}
                onClick={() => triggerHaptic('light')}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-critical/30 text-critical text-[11.5px] font-bold rounded-xl shadow-2xs hover:bg-critical/10 active:scale-95 transition-all"
              >
                <span>{doctor?.hospital ? doctor.hospital.split('•')[0].trim() : 'Hospital Triage'}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Management Modal */}
      <DoctorModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        initialDoctor={state.doctor}
        onSave={(doctorData) => {
          updateState({ doctor: doctorData });
        }}
        onRemove={() => {
          updateState({ doctor: null });
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};
