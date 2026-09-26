import React, { useState } from 'react';
import {
  Stethoscope, Phone, Calendar, Plus, CheckSquare, Square,
  Activity, Share2, AlertTriangle, ShieldCheck, Clock, FileText, Bell, RefreshCw
} from 'lucide-react';
import { triggerHaptic } from '../../../utils/nativeBridge';

interface CareTabProps {
  onOpenTool: (toolId: string) => void;
  onOpenSchedule: () => void;
  onOpenNotifications: () => void;
  onShowToast: (message: string) => void;
}

export const CareTab: React.FC<CareTabProps> = ({
  onOpenTool,
  onOpenSchedule,
  onOpenNotifications,
  onShowToast,
}) => {
  const [prepQuestions, setPrepQuestions] = useState<Array<{ id: number; text: string; done: boolean }>>([
    { id: 1, text: 'Is occasional lower back tightness normal at Week 24?', done: false },
    { id: 2, text: 'When should I take the Oral Glucose Tolerance Test (OGTT)?', done: true },
    { id: 3, text: 'Safe sleeping positions and pregnancy pillow recommendations?', done: false },
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
      { id: Date.now(), text: newQuestionText.trim(), done: false },
    ]);
    setNewQuestionText('');
  };

  const handleShareFhir = () => {
    triggerHaptic('success');
    onShowToast('📋 Generated FHIR R4 Clinical JSON bundle for Dr. Priya Sharma');
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* 1. OB-GYN Care Team Card */}
      <div className="bg-white border border-border/80 rounded-3xl p-4 shadow-xs">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sage-pale text-sage-dark flex items-center justify-center font-bold text-lg shrink-0">
              <Stethoscope size={24} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-sage-dark uppercase tracking-wider block">
                Primary Obstetrician
              </span>
              <h3 className="font-serif font-bold text-charcoal text-[16px] leading-tight">
                Dr. Priya Sharma, MS
              </h3>
              <p className="text-[12px] text-medium mt-0.5">
                Cloudnine Hospital • OB-GYN
              </p>
            </div>
          </div>

          <a
            href="tel:+919876543210"
            onClick={() => triggerHaptic('light')}
            className="w-9 h-9 rounded-full bg-sage text-white flex items-center justify-center shadow-xs hover:bg-sage-dark transition-colors"
            aria-label="Call Clinic"
          >
            <Phone size={17} />
          </a>
        </div>

        {/* Patient Clinical Info Bar */}
        <div className="mt-3 pt-3 border-t border-border/60 grid grid-cols-3 gap-2 text-center text-[11.5px]">
          <div className="bg-cream/70 rounded-xl py-1.5 px-1">
            <span className="text-medium text-[10px] block">UHID</span>
            <span className="font-mono font-bold text-charcoal">#BLM-98421</span>
          </div>
          <div className="bg-cream/70 rounded-xl py-1.5 px-1">
            <span className="text-medium text-[10px] block">Blood Group</span>
            <span className="font-bold text-charcoal">B Positive (Rh+)</span>
          </div>
          <div className="bg-cream/70 rounded-xl py-1.5 px-1">
            <span className="text-medium text-[10px] block">Gestation</span>
            <span className="font-bold text-sage-dark">Week 24 + 0d</span>
          </div>
        </div>
      </div>

      {/* 2. Next Prenatal Visit Banner */}
      <div className="bg-gradient-to-r from-sage-pale/60 via-white to-cream border border-sage/30 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-sage-dark uppercase tracking-wide">
              <Clock size={13} />
              <span>Next Checkup in 6 Days</span>
            </div>
            <h4 className="font-serif font-bold text-charcoal text-[14.5px] mt-1">
              Routine Growth Scan & OGTT Check
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
            className="px-3 py-1.5 bg-sage text-white text-[11.5px] font-bold rounded-xl shadow-2xs hover:bg-sage-dark transition-colors shrink-0 cursor-pointer"
          >
            + Reschedule
          </button>
        </div>
      </div>

      {/* 2.5 Prenatal Reminders & Notifications */}
      <div className="bg-white border border-border/80 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Bell size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-serif font-bold text-charcoal text-[14px]">
                Prenatal Reminders
              </h4>
              <span className="text-[10px] font-bold text-sage-dark bg-sage/15 px-2 py-0.5 rounded-full">
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

      {/* 3. Questions for Doctor Checklist */}
      <div className="bg-white border border-border/80 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <FileText size={16} className="text-sage-dark" />
            <h3 className="font-serif font-bold text-charcoal text-[14.5px]">
              Questions for Your Doctor
            </h3>
          </div>
          <span className="text-[11px] text-medium">
            {prepQuestions.filter((q) => q.done).length}/{prepQuestions.length} discussed
          </span>
        </div>

        <div className="space-y-2">
          {prepQuestions.map((q) => (
            <div
              key={q.id}
              onClick={() => toggleQuestion(q.id)}
              className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-cream transition-colors cursor-pointer"
            >
              {q.done ? (
                <CheckSquare size={18} className="text-sage-dark shrink-0 mt-0.5" />
              ) : (
                <Square size={18} className="text-medium shrink-0 mt-0.5" />
              )}
              <span
                className={`text-[13px] leading-snug ${
                  q.done ? 'line-through text-light' : 'text-charcoal font-medium'
                }`}
              >
                {q.text}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddQuestion} className="mt-3 pt-3 border-t border-border/60 flex items-center gap-2">
          <input
            type="text"
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            placeholder="Type a new question for Dr. Priya..."
            className="flex-1 bg-cream/60 border border-border/80 rounded-xl px-3 py-2 text-[12.5px] focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
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

      {/* 4. Clinical Vitals Snapshot */}
      <div className="bg-white border border-border/80 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Activity size={16} className="text-red-500" />
            <h3 className="font-serif font-bold text-charcoal text-[14.5px]">
              Clinical Vitals Snapshot
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
              <span>Vitals & Sync</span>
            </button>
            <button
              type="button"
              onClick={handleShareFhir}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-medium hover:underline cursor-pointer"
            >
              <Share2 size={12} />
              <span>FHIR</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[12px]">
          <div className="p-2.5 rounded-xl bg-cream/70 border border-border/60">
            <span className="text-medium text-[11px]">Blood Pressure</span>
            <p className="font-bold text-charcoal text-[14px]">118/76 mmHg</p>
            <span className="text-[10px] text-green-700 font-semibold">● Normal</span>
          </div>
          <div className="p-2.5 rounded-xl bg-cream/70 border border-border/60">
            <span className="text-medium text-[11px]">Hemoglobin</span>
            <p className="font-bold text-charcoal text-[14px]">11.4 g/dL</p>
            <span className="text-[10px] text-green-700 font-semibold">● Adequate</span>
          </div>
          <div className="p-2.5 rounded-xl bg-cream/70 border border-border/60">
            <span className="text-medium text-[11px]">Fasting Blood Sugar</span>
            <p className="font-bold text-charcoal text-[14px]">88 mg/dL</p>
            <span className="text-[10px] text-green-700 font-semibold">● Normal Range</span>
          </div>
          <div className="p-2.5 rounded-xl bg-cream/70 border border-border/60">
            <span className="text-medium text-[11px]">Daily Kicks Logged</span>
            <p className="font-bold text-charcoal text-[14px]">8 Kicks / 30m</p>
            <span className="text-[10px] text-sage-dark font-semibold">● Active Fetus</span>
          </div>
        </div>

        {/* Health Connect Quick Strip */}
        <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11.5px]">
          <div className="flex items-center gap-1.5">
            <Activity size={13} className="text-sage" />
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

      {/* 5. Emergency Red Flag Triage */}
      <div className="bg-critical/5 border border-critical/20 rounded-2xl p-4">
        <div className="flex items-start gap-2.5">
          <AlertTriangle size={18} className="text-critical shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-critical text-[13.5px]">
              When to Seek Immediate Emergency Care
            </h4>
            <p className="text-[12px] text-medium mt-1 leading-relaxed">
              Contact Cloudnine triage or dial 108 immediately if you experience severe headaches with vision spots, sudden face/hand swelling, vaginal bleeding, or no fetal movement in 2 hours.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <a
                href="tel:108"
                onClick={() => triggerHaptic('warning')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-critical text-white text-[12px] font-bold rounded-xl shadow-xs hover:opacity-90"
              >
                <Phone size={13} />
                <span>Call 108 Ambulance</span>
              </a>
              <a
                href="tel:+919876543210"
                onClick={() => triggerHaptic('light')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-critical/30 text-critical text-[12px] font-bold rounded-xl shadow-2xs hover:bg-critical/10"
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
