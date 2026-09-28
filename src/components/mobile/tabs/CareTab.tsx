import React, { useState } from 'react';
import {
  Stethoscope, Phone, Calendar, Plus, CheckSquare, Square,
  Activity, Share2, AlertTriangle, ShieldCheck, Clock, FileText,
  Bell, RefreshCw, MessageCircle, ChevronRight, CheckCircle2,
  CalendarCheck, MapPin, HeartPulse
} from 'lucide-react';
import { triggerHaptic } from '../../../utils/nativeBridge';

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
  const [selectedQuestionCategory, setSelectedQuestionCategory] = useState<string>('All');
  const [prepQuestions, setPrepQuestions] = useState<QuestionItem[]>([
    { id: 1, text: 'Is occasional lower back tightness normal at Week 24?', category: 'Symptoms', done: false },
    { id: 2, text: 'When should I take the Oral Glucose Tolerance Test (OGTT)?', category: 'Scans', done: true },
    { id: 3, text: 'Safe sleeping positions and pregnancy pillow recommendations?', category: 'General', done: false },
    { id: 4, text: 'Are daily iron and calcium supplements best taken together or apart?', category: 'Nutrition', done: true },
    { id: 5, text: 'Recommended target fetal kick frequency for my 3rd trimester baseline?', category: 'Symptoms', done: false },
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');

  // Clinical Prenatal Scan Roadmap
  const scanMilestones = [
    {
      id: 'dating',
      title: 'Dating & Viability Scan',
      period: 'Week 7–9',
      status: 'completed',
      date: 'Completed 12 Jun',
      hospital: 'Cloudnine Whitefield',
    },
    {
      id: 'nt',
      title: 'NT Scan & Dual Marker',
      period: 'Week 11–13',
      status: 'completed',
      date: 'Completed 18 Jul',
      hospital: 'Cloudnine Whitefield',
    },
    {
      id: 'tiffa',
      title: 'Level II TIFFA Anomaly Scan',
      period: 'Week 18–20',
      status: 'completed',
      date: 'Completed 28 Aug',
      hospital: 'Cloudnine Whitefield',
    },
    {
      id: 'ogtt',
      title: 'OGTT & Routine Growth Scan',
      period: 'Week 24–28',
      status: 'upcoming',
      date: 'Wednesday, 23 Sep • 10:30 AM',
      hospital: 'OPD Room 204 • Dr. Priya',
    },
    {
      id: 'doppler',
      title: 'Fetal Growth & Doppler',
      period: 'Week 32',
      status: 'scheduled',
      date: 'Planned for Week 32',
      hospital: 'Cloudnine Whitefield',
    },
    {
      id: 'nst',
      title: 'Non-Stress Test (NST) & GBS',
      period: 'Week 36–37',
      status: 'scheduled',
      date: 'Planned for Week 36',
      hospital: 'Cloudnine Whitefield',
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

  const handleShareFhir = () => {
    triggerHaptic('success');
    onShowToast('📋 Generated FHIR R4 Clinical JSON bundle for Dr. Priya Sharma');
  };

  const filteredQuestions = prepQuestions.filter(
    (q) => selectedQuestionCategory === 'All' || q.category === selectedQuestionCategory
  );

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-200">
      {/* 1. OB-GYN Clinical Care Team Hero Card */}
      <div className="bg-white border border-border/80 rounded-3xl p-4 shadow-xs">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-sage-pale text-sage-dark flex items-center justify-center font-bold text-lg shrink-0 border border-sage/20">
              <Stethoscope size={26} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-sage-dark uppercase tracking-wider block">
                Primary Obstetrician & Gynecologist
              </span>
              <h3 className="font-serif font-bold text-charcoal text-[17px] leading-tight">
                Dr. Priya Sharma, MS
              </h3>
              <p className="text-[12px] text-medium mt-0.5 flex items-center gap-1">
                <MapPin size={12} className="text-sage" />
                <span>Cloudnine Hospital • Whitefield</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Call Clinic Button */}
            <a
              href="tel:+919876543210"
              onClick={() => triggerHaptic('light')}
              className="w-9 h-9 rounded-full bg-sage text-white flex items-center justify-center shadow-xs hover:bg-sage-dark active:scale-95 transition-all"
              aria-label="Call Clinic"
              title="Call Clinic OPD"
            >
              <Phone size={16} />
            </a>
            {/* WhatsApp Nurse Button */}
            <a
              href="https://wa.me/919876543210?text=Namaste%20Cloudnine%20Care%20Team,%20query%20from%20Bloom%20App"
              target="_blank"
              rel="noreferrer"
              onClick={() => triggerHaptic('light')}
              className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
              aria-label="WhatsApp Clinic"
              title="Chat with OPD Care Team"
            >
              <MessageCircle size={16} />
            </a>
          </div>
        </div>

        {/* Patient Clinical Info Bar */}
        <div className="mt-3.5 pt-3 border-t border-border/60 grid grid-cols-4 gap-2 text-center text-[11.5px]">
          <div className="bg-cream/70 rounded-xl py-1.5 px-1 border border-border/40">
            <span className="text-medium text-[9.5px] font-bold uppercase block">UHID</span>
            <span className="font-mono font-bold text-charcoal text-[11px]">#BLM-98421</span>
          </div>
          <div className="bg-cream/70 rounded-xl py-1.5 px-1 border border-border/40">
            <span className="text-medium text-[9.5px] font-bold uppercase block">Blood</span>
            <span className="font-bold text-charcoal text-[11px]">B+ (Rh+)</span>
          </div>
          <div className="bg-cream/70 rounded-xl py-1.5 px-1 border border-border/40">
            <span className="text-medium text-[9.5px] font-bold uppercase block">Gestation</span>
            <span className="font-bold text-sage-dark text-[11px]">Wk 24 + 0d</span>
          </div>
          <div className="bg-cream/70 rounded-xl py-1.5 px-1 border border-border/40">
            <span className="text-medium text-[9.5px] font-bold uppercase block">Allergies</span>
            <span className="font-bold text-emerald-700 text-[11px]">NKDA</span>
          </div>
        </div>
      </div>

      {/* 2. Next Prenatal Visit Bento Card */}
      <div className="bg-gradient-to-r from-sage-pale/70 via-white to-cream border border-sage/35 rounded-3xl p-4 shadow-xs">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-sage-dark uppercase tracking-wide">
              <Clock size={13} />
              <span>Next Checkup • In 6 Days</span>
            </div>
            <h4 className="font-serif font-bold text-charcoal text-[15px] mt-1">
              Routine Growth Scan & OGTT Glucose Screen
            </h4>
            <p className="text-[12px] text-medium mt-0.5">
              Wednesday, 23 Sep • 10:30 AM • OPD Room 204
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenSchedule();
            }}
            className="px-3 py-1.5 bg-sage text-white text-[12px] font-bold rounded-xl shadow-2xs hover:bg-sage-dark active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            Reschedule
          </button>
        </div>

        <div className="mt-3 pt-2.5 border-t border-sage/20 flex items-center justify-between text-[11.5px]">
          <span className="text-medium">
            Pre-test: Fast for 8 hours prior to the fasting glucose blood draw.
          </span>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenTool('medical');
            }}
            className="text-sage-dark font-bold hover:underline shrink-0 ml-2 cursor-pointer"
          >
            View Checklist →
          </button>
        </div>
      </div>

      {/* 3. Interactive Clinical Scan Roadmap */}
      <div className="bg-white border border-border/80 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <CalendarCheck size={17} className="text-sage-dark" />
            <h3 className="font-serif font-bold text-charcoal text-[15px]">
              Prenatal Scan & Milestone Roadmap
            </h3>
          </div>
          <span className="text-[11px] font-bold text-medium">
            ACOG & FOGSI Standard
          </span>
        </div>

        <div className="space-y-2.5">
          {scanMilestones.map((item) => {
            const isCompleted = item.status === 'completed';
            const isUpcoming = item.status === 'upcoming';

            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all ${
                  isUpcoming
                    ? 'bg-sage-pale/40 border-sage/60 shadow-2xs'
                    : isCompleted
                    ? 'bg-cream/40 border-border/60'
                    : 'bg-white border-border/50 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 size={16} className="text-sage-dark" />
                      ) : isUpcoming ? (
                        <Clock size={16} className="text-soft-saffron-dark animate-pulse" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-medium/40" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-charcoal text-[13px] leading-tight">
                          {item.title}
                        </h4>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-white border border-border/70 text-medium">
                          {item.period}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-medium mt-0.5">
                        {item.date} • {item.hospital}
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
                      className="text-[11px] font-bold text-sage-dark hover:underline shrink-0 cursor-pointer"
                    >
                      View Report
                    </button>
                  )}
                  {isUpcoming && (
                    <span className="text-[10px] font-bold text-white bg-sage px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                      Current
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Prenatal Reminders & Notifications Card */}
      <div className="bg-white border border-border/80 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Bell size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-serif font-bold text-charcoal text-[14px]">
                Smart Maternal Reminders
              </h4>
              <span className="text-[10px] font-bold text-sage-dark bg-sage-pale px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <p className="text-[11.5px] text-medium mt-0.5">
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
          className="px-3 py-1.5 bg-cream border border-border text-charcoal hover:bg-sage/10 text-[11.5px] font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
        >
          Configure
        </button>
      </div>

      {/* 5. Questions for Doctor Checklist */}
      <div className="bg-white border border-border/80 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <FileText size={16} className="text-sage-dark" />
            <h3 className="font-serif font-bold text-charcoal text-[14.5px]">
              Questions for Dr. Priya Sharma
            </h3>
          </div>
          <span className="text-[11.5px] font-bold text-sage-dark bg-sage-pale px-2 py-0.5 rounded-full">
            {prepQuestions.filter((q) => q.done).length}/{prepQuestions.length} Discussed
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
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                selectedQuestionCategory === cat
                  ? 'bg-charcoal text-white shadow-2xs'
                  : 'bg-cream text-medium border border-border/60 hover:text-charcoal'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Question List */}
        <div className="space-y-2 mt-1">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              onClick={() => toggleQuestion(q.id)}
              className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-cream/70 transition-colors cursor-pointer"
            >
              {q.done ? (
                <CheckSquare size={18} className="text-sage-dark shrink-0 mt-0.5" />
              ) : (
                <Square size={18} className="text-medium shrink-0 mt-0.5" />
              )}
              <span
                className={`text-[12.5px] leading-snug ${
                  q.done ? 'line-through text-light' : 'text-charcoal font-medium'
                }`}
              >
                {q.text}
              </span>
            </div>
          ))}
        </div>

        {/* Add Question Input */}
        <form onSubmit={handleAddQuestion} className="mt-3 pt-3 border-t border-border/60 flex items-center gap-2">
          <input
            type="text"
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            placeholder="Type a new question for your doctor..."
            className="flex-1 bg-cream/70 border border-border/80 rounded-xl px-3 py-2 text-[12.5px] text-charcoal focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
          />
          <button
            type="submit"
            className="w-9 h-9 rounded-xl bg-charcoal text-white flex items-center justify-center shrink-0 hover:opacity-90 active:scale-95 transition-transform cursor-pointer"
            aria-label="Add question"
          >
            <Plus size={18} />
          </button>
        </form>
      </div>

      {/* 6. Clinical Vitals & Lab Snapshot */}
      <div className="bg-white border border-border/80 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Activity size={16} className="text-rose-500" />
            <h3 className="font-serif font-bold text-charcoal text-[14.5px]">
              Clinical Vitals & Lab Snapshot
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
              <RefreshCw size={12} />
              <span>Log Vitals</span>
            </button>
            <button
              type="button"
              onClick={handleShareFhir}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-medium hover:text-charcoal cursor-pointer"
            >
              <Share2 size={12} />
              <span>FHIR</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[12px]">
          <div className="p-3 rounded-2xl bg-cream/70 border border-border/60">
            <span className="text-medium text-[10.5px] font-medium block">Blood Pressure</span>
            <p className="font-bold text-charcoal text-[15px] mt-0.5">118/76 <span className="text-[11px] font-normal text-medium">mmHg</span></p>
            <span className="text-[10px] text-green-700 font-bold">● Normal Range</span>
          </div>
          <div className="p-3 rounded-2xl bg-cream/70 border border-border/60">
            <span className="text-medium text-[10.5px] font-medium block">Hemoglobin (Hb)</span>
            <p className="font-bold text-charcoal text-[15px] mt-0.5">11.4 <span className="text-[11px] font-normal text-medium">g/dL</span></p>
            <span className="text-[10px] text-green-700 font-bold">● Adequate</span>
          </div>
          <div className="p-3 rounded-2xl bg-cream/70 border border-border/60">
            <span className="text-medium text-[10.5px] font-medium block">Fasting Blood Sugar</span>
            <p className="font-bold text-charcoal text-[15px] mt-0.5">88 <span className="text-[11px] font-normal text-medium">mg/dL</span></p>
            <span className="text-[10px] text-green-700 font-bold">● Non-Diabetic</span>
          </div>
          <div className="p-3 rounded-2xl bg-cream/70 border border-border/60">
            <span className="text-medium text-[10.5px] font-medium block">Daily Kicks Logged</span>
            <p className="font-bold text-charcoal text-[15px] mt-0.5">10 <span className="text-[11px] font-normal text-medium">kicks / 28m</span></p>
            <span className="text-[10px] text-sage-dark font-bold">● Healthy & Active</span>
          </div>
        </div>

        {/* Health Connect Quick Strip */}
        <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11.5px]">
          <div className="flex items-center gap-1.5">
            <HeartPulse size={14} className="text-sage" />
            <span className="font-semibold text-charcoal text-[11px]">Google Health Connect</span>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenTool('vitals');
            }}
            className="text-sage font-bold hover:underline cursor-pointer text-[11px]"
          >
            Import Vitals →
          </button>
        </div>
      </div>

      {/* 7. Emergency Hospital Triage */}
      <div className="bg-critical/5 border border-critical/25 rounded-3xl p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-critical/15 text-critical flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-serif font-bold text-critical text-[14.5px]">
              When to Seek Immediate Emergency Care
            </h4>
            <p className="text-[12px] text-charcoal/80 mt-1 leading-relaxed">
              Contact Cloudnine triage or dial 108 immediately if you experience severe headaches with vision spots, sudden facial/hand swelling, vaginal bleeding, fluid leaking, or decreased fetal movement.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <a
                href="tel:108"
                onClick={() => triggerHaptic('warning')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-critical text-white text-[12px] font-bold rounded-xl shadow-xs hover:opacity-90 active:scale-95 transition-all"
              >
                <Phone size={13} />
                <span>Call 108 Ambulance</span>
              </a>
              <a
                href="tel:+919876543210"
                onClick={() => triggerHaptic('light')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-critical/30 text-critical text-[12px] font-bold rounded-xl shadow-2xs hover:bg-critical/10 active:scale-95 transition-all"
              >
                <span>Hospital Triage</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
