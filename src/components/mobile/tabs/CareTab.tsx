import React, { useState } from 'react';
import {
  Stethoscope, Phone, Calendar, Plus, CheckSquare, Square,
  Activity, Share2, AlertTriangle, ShieldCheck, Clock, FileText,
  Bell, RefreshCw, MessageCircle, ChevronRight, CheckCircle2,
  CalendarCheck, MapPin, HeartPulse, Pencil, UserCheck
} from 'lucide-react';
import { triggerHaptic } from '../../../utils/nativeBridge';
import { usePlanner } from '../../../store';
import { DoctorModal } from '../DoctorModal';

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
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [selectedQuestionCategory, setSelectedQuestionCategory] = useState<string>('All');
  const [prepQuestions, setPrepQuestions] = useState<QuestionItem[]>([
    { id: 1, text: 'Lower back tightness at Week 24 normal?', category: 'Symptoms', done: false },
    { id: 2, text: 'Schedule for Oral Glucose Test (OGTT)?', category: 'Scans', done: true },
    { id: 3, text: 'Safe sleep positions & pillow advice?', category: 'General', done: false },
    { id: 4, text: 'Best timing for iron & calcium tablets?', category: 'Nutrition', done: true },
    { id: 5, text: 'Target fetal kick frequency baseline?', category: 'Symptoms', done: false },
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');

  // Clinical Prenatal Scan Roadmap with clean, non-wrapping badges
  const scanMilestones = [
    {
      id: 'dating',
      title: 'Dating & Viability Scan',
      period: 'Wk 7–9',
      status: 'completed',
      date: '12 Jun • Cloudnine',
    },
    {
      id: 'nt',
      title: 'NT Scan & Dual Marker',
      period: 'Wk 11–13',
      status: 'completed',
      date: '18 Jul • Cloudnine',
    },
    {
      id: 'tiffa',
      title: 'Level II TIFFA Anomaly',
      period: 'Wk 18–20',
      status: 'completed',
      date: '28 Aug • Cloudnine',
    },
    {
      id: 'ogtt',
      title: 'OGTT & Growth Scan',
      period: 'Wk 24–28',
      status: 'upcoming',
      date: 'Wed, 23 Sep • 10:30 AM',
    },
    {
      id: 'doppler',
      title: 'Fetal Growth & Doppler',
      period: 'Wk 32',
      status: 'scheduled',
      date: 'Planned for Week 32',
    },
    {
      id: 'nst',
      title: 'Non-Stress Test (NST)',
      period: 'Wk 36–37',
      status: 'scheduled',
      date: 'Planned for Week 36',
    },
  ];

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

  const handleShareFhir = () => {
    triggerHaptic('success');
    const doctorLabel = hasDoctor && doctor?.name ? doctor.name : 'Primary Care Provider';
    onShowToast(`📋 Generated FHIR R4 Clinical JSON bundle for ${doctorLabel}`);
  };

  const filteredQuestions = prepQuestions.filter(
    (q) => selectedQuestionCategory === 'All' || q.category === selectedQuestionCategory
  );

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
            <span className="font-bold text-sage-dark text-[11px] truncate mt-0.5">Wk 24+0d</span>
          </div>
          <div className="bg-cream/70 rounded-xl py-2 px-1 border border-border/40 flex flex-col justify-center">
            <span className="text-medium text-[9px] font-bold uppercase tracking-wider block">Allergy</span>
            <span className="font-bold text-emerald-700 text-[11px] truncate mt-0.5">NKDA</span>
          </div>
        </div>
      </div>

      {/* 2. Next Prenatal Visit Bento Card */}
      <div className="bg-gradient-to-r from-sage-pale/70 via-white to-cream border border-sage/35 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-sage-dark uppercase tracking-wide">
              <Clock size={12} />
              <span>Next Checkup • In 6 Days</span>
            </div>
            <h4 className="font-serif font-bold text-charcoal text-[15px] leading-tight mt-0.5 truncate">
              Routine Growth Scan & OGTT
            </h4>
            <p className="text-[11.5px] text-medium mt-0.5 truncate">
              Wed, 23 Sep • 10:30 AM • OPD Room 204
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
            Fast 8 hours prior to the glucose test.
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

      {/* 3. Interactive Clinical Scan Roadmap with Single-Line Rows */}
      <div className="bg-white border border-border/80 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 px-0.5">
          <div className="flex items-center gap-1.5">
            <CalendarCheck size={16} className="text-sage-dark" />
            <h3 className="font-serif font-bold text-charcoal text-[14.5px]">
              Prenatal Scan Roadmap
            </h3>
          </div>
          <span className="text-[10.5px] font-bold text-medium">
            FOGSI Standard
          </span>
        </div>

        <div className="space-y-2">
          {scanMilestones.map((item) => {
            const isCompleted = item.status === 'completed';
            const isUpcoming = item.status === 'upcoming';

            return (
              <div
                key={item.id}
                className={`h-14 px-3 rounded-2xl border flex items-center justify-between gap-2.5 transition-all ${
                  isUpcoming
                    ? 'bg-sage-pale/40 border-sage/60 shadow-2xs'
                    : isCompleted
                    ? 'bg-cream/40 border-border/60'
                    : 'bg-white border-border/40 opacity-70'
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
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-charcoal text-[12.5px] leading-tight truncate">
                        {item.title}
                      </h4>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-white border border-border/70 text-medium whitespace-nowrap shrink-0">
                        {item.period}
                      </span>
                    </div>
                    <p className="text-[11px] text-medium truncate mt-0.5">
                      {item.date}
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

      {/* 6. Clinical Vitals & Lab Snapshot (Equal Height 2x2 Grid) */}
      <div className="bg-white border border-border/80 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 px-0.5">
          <div className="flex items-center gap-1.5">
            <Activity size={15} className="text-rose-500" />
            <h3 className="font-serif font-bold text-charcoal text-[14px]">
              Vitals & Lab Snapshot
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onOpenTool('vitals');
              }}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-sage-dark hover:underline cursor-pointer"
            >
              <RefreshCw size={11} />
              <span>Log Vitals</span>
            </button>
            <button
              type="button"
              onClick={handleShareFhir}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-medium hover:text-charcoal cursor-pointer"
            >
              <Share2 size={11} />
              <span>FHIR</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[12px]">
          <div className="h-20 p-2.5 rounded-2xl bg-cream/70 border border-border/60 flex flex-col justify-between">
            <span className="text-medium text-[10px] font-medium block">Blood Pressure</span>
            <p className="font-bold text-charcoal text-[14.5px] leading-tight">118/76 <span className="text-[10px] font-normal text-medium">mmHg</span></p>
            <span className="text-[9.5px] text-green-700 font-bold">● Normal Range</span>
          </div>
          <div className="h-20 p-2.5 rounded-2xl bg-cream/70 border border-border/60 flex flex-col justify-between">
            <span className="text-medium text-[10px] font-medium block">Hemoglobin (Hb)</span>
            <p className="font-bold text-charcoal text-[14.5px] leading-tight">11.4 <span className="text-[10px] font-normal text-medium">g/dL</span></p>
            <span className="text-[9.5px] text-green-700 font-bold">● Adequate</span>
          </div>
          <div className="h-20 p-2.5 rounded-2xl bg-cream/70 border border-border/60 flex flex-col justify-between">
            <span className="text-medium text-[10px] font-medium block">Fasting Sugar</span>
            <p className="font-bold text-charcoal text-[14.5px] leading-tight">88 <span className="text-[10px] font-normal text-medium">mg/dL</span></p>
            <span className="text-[9.5px] text-green-700 font-bold">● Non-Diabetic</span>
          </div>
          <div className="h-20 p-2.5 rounded-2xl bg-cream/70 border border-border/60 flex flex-col justify-between">
            <span className="text-medium text-[10px] font-medium block">Daily Kicks</span>
            <p className="font-bold text-charcoal text-[14.5px] leading-tight">10 <span className="text-[10px] font-normal text-medium">kicks / 28m</span></p>
            <span className="text-[9.5px] text-sage-dark font-bold">● Active Fetus</span>
          </div>
        </div>

        {/* Health Connect Quick Strip */}
        <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <HeartPulse size={13} className="text-sage" />
            <span className="font-semibold text-charcoal">Google Health Connect</span>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenTool('vitals');
            }}
            className="text-sage font-bold hover:underline cursor-pointer"
          >
            Import Vitals →
          </button>
        </div>
      </div>

      {/* 7. Emergency Hospital Triage */}
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
