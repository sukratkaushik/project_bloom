import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  MessageCircle,
  X,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Building2,
  Stethoscope,
  Sparkles,
  Send,
  HelpCircle
} from 'lucide-react';
import { usePlanner } from '../../store';
import { triggerHaptic } from '../../utils/nativeBridge';
import { UpcomingMilestoneInfo } from '../../data/clinicalSchedule';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextMilestone: UpcomingMilestoneInfo;
  onShowToast: (message: string) => void;
}

type RescheduleMode = 'choose' | 'opin_email' | 'self_service' | 'preview';

const TIME_SLOT_OPTIONS = [
  'Morning (9:00 AM – 12:00 PM)',
  'Mid-Day (12:00 PM – 3:00 PM)',
  'Afternoon (3:00 PM – 6:00 PM)',
  'Evening (6:00 PM – 8:00 PM)',
  'Any Available Slot',
];

const COMMON_REASONS = [
  'Work schedule conflict',
  'Need partner / companion present',
  'Travel or out of town',
  'Feeling unwell / feverish',
  'Doctor OPD schedule change',
];

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  nextMilestone,
  onShowToast,
}) => {
  const { state, updateState } = usePlanner();

  // Gestational calculations
  const due = state.dueDate ? new Date(state.dueDate) : new Date(Date.now() + 112 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffDays = Math.max(0, Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const completedDays = Math.max(1, 280 - diffDays);
  const currentWeek = Math.min(40, Math.max(1, Math.floor(completedDays / 7) + 1));
  const gestationDays = completedDays % 7;

  // Active appointment details
  const activeAppointment = state.nextAppointment;
  const appointmentTitle = activeAppointment?.title || nextMilestone.title;
  const currentSlot = activeAppointment?.date
    ? `${activeAppointment.date}${activeAppointment.time ? ` • ${activeAppointment.time}` : ''}`
    : nextMilestone.date;
  const facility = activeAppointment?.hospital || state.doctor?.hospital || nextMilestone.facility;

  // Workflow state
  const [mode, setMode] = useState<RescheduleMode>('choose');
  const [copied, setCopied] = useState(false);

  // Form state
  const defaultDateStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  const [preferredDate, setPreferredDate] = useState<string>(defaultDateStr());
  const [preferredTime, setPreferredTime] = useState<string>(TIME_SLOT_OPTIONS[0]);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [doctorEmail, setDoctorEmail] = useState<string>(state.doctor?.email || '');
  const [saveEmailToProfile, setSaveEmailToProfile] = useState<boolean>(true);

  // Self-service manual date update
  const [manualDate, setManualDate] = useState<string>(defaultDateStr());
  const [manualTime, setManualTime] = useState<string>('10:30 AM');

  useEffect(() => {
    if (isOpen) {
      setMode('choose');
      setCopied(false);
      setDoctorEmail(state.doctor?.email || '');
      setPreferredDate(defaultDateStr());
      setManualDate(defaultDateStr());
      setSelectedReason('');
      setCustomReason('');
    }
  }, [isOpen, state.doctor?.email]);

  if (!isOpen) return null;

  const effectiveReason = customReason.trim() || selectedReason;
  const doctorName = state.doctor?.name || 'Obstetrician';
  const cleanPhone = state.doctor?.phone ? state.doctor.phone.replace(/[^\d+]/g, '') : '';
  const cleanPhoneForWa = state.doctor?.phone ? state.doctor.phone.replace(/[^\d]/g, '') : '';

  // Generate Email Text
  const generateEmailContent = () => {
    const patientName = state.userName || 'Patient';
    const uhid = '#98421';
    const gestationStr = `Wk ${currentWeek}+${gestationDays}d`;
    const formattedPrefDate = preferredDate
      ? new Date(preferredDate + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Nearest upcoming date';

    const subject = `Reschedule Request: ${patientName} (UHID ${uhid}) - ${appointmentTitle}`;

    const body = `Dear Dr. ${doctorName} & Care Team,

I hope this email finds you well. I am writing to kindly request a reschedule for my upcoming prenatal visit:

• Patient Name: ${patientName}
• UHID: ${uhid}
• Current Gestation: ${gestationStr}
• Current Scheduled Visit: ${appointmentTitle} (${currentSlot})
• Hospital / Clinic: ${facility}

--- REQUESTED RESCHEDULE DETAILS ---
• Preferred New Date: ${formattedPrefDate}
• Preferred Time Window: ${preferredTime}
${effectiveReason ? `• Reason for Reschedule: ${effectiveReason}\n` : ''}
Could you please confirm if this new time slot is available, or suggest the nearest available opening?

Thank you so much for your assistance,
${patientName}
${state.doctor?.phone ? `Contact: ${state.doctor.phone}` : ''}

(Sent via Our Pregnancy App)`;

    return { subject, body, formattedPrefDate };
  };

  const { subject, body, formattedPrefDate } = generateEmailContent();

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      triggerHaptic('success');
      onShowToast('📋 Request letter copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onShowToast('Could not copy to clipboard.');
    }
  };

  const handleSendEmail = () => {
    triggerHaptic('success');
    const targetEmail = doctorEmail.trim();

    // Persist email to doctor profile if selected
    if (saveEmailToProfile && targetEmail && state.doctor && state.doctor.email !== targetEmail) {
      updateState({
        doctor: {
          ...state.doctor,
          email: targetEmail,
        },
      });
    }

    // Update appointment state in Bloom to reflect reschedule request
    updateState({
      nextAppointment: {
        title: appointmentTitle,
        date: preferredDate,
        time: preferredTime,
        hospital: facility,
        doctor: state.doctor?.name,
        notes: effectiveReason ? `Reschedule requested: ${effectiveReason}` : 'Reschedule requested via OPIN',
        prep: nextMilestone.prep,
      },
    });

    onShowToast('✉️ Opening email client...');

    // Launch mailto
    const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;

    onClose();
  };

  const handleSendWhatsApp = () => {
    if (!cleanPhoneForWa) return;
    triggerHaptic('success');

    // Update appointment state
    updateState({
      nextAppointment: {
        title: appointmentTitle,
        date: preferredDate,
        time: preferredTime,
        hospital: facility,
        doctor: state.doctor?.name,
        notes: effectiveReason ? `Reschedule requested: ${effectiveReason}` : 'Reschedule requested via WhatsApp',
        prep: nextMilestone.prep,
      },
    });

    onShowToast('💬 Opening WhatsApp with request...');
    const waUrl = `https://wa.me/${cleanPhoneForWa}?text=${encodeURIComponent(body)}`;
    window.open(waUrl, '_blank');
    onClose();
  };

  const handleManualSave = () => {
    triggerHaptic('success');
    updateState({
      nextAppointment: {
        title: appointmentTitle,
        date: manualDate,
        time: manualTime,
        hospital: facility,
        doctor: state.doctor?.name,
        notes: 'Updated manually in Our Pregnancy',
        prep: nextMilestone.prep,
      },
    });
    onShowToast('📅 Appointment date updated in Our Pregnancy!');
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 pb-[max(2.5rem,calc(env(safe-area-inset-bottom,0px)+1.5rem))] sm:pb-6 shadow-2xl border border-border/80 max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {mode !== 'choose' && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setMode(mode === 'preview' ? 'opin_email' : 'choose');
                }}
                className="p-1.5 -ml-1 text-medium hover:text-charcoal hover:bg-cream rounded-full transition-colors cursor-pointer shrink-0"
                aria-label="Back"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="w-10 h-10 rounded-2xl bg-sage-pale text-sage-dark flex items-center justify-center font-bold shrink-0 border border-sage/20">
              <Calendar size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="font-serif font-bold text-charcoal text-[17px] sm:text-[18px] leading-tight truncate">
                Reschedule Prenatal Visit
              </h2>
              <p className="text-[12px] text-medium truncate">
                {mode === 'choose'
                  ? 'Select how you would like to reschedule'
                  : mode === 'opin_email'
                  ? 'Provide your preferred dates for doctor'
                  : mode === 'preview'
                  ? 'Review & dispatch your request'
                  : 'Coordinate or update appointment date'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-2 text-medium hover:text-charcoal hover:bg-cream rounded-full transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Appointment Banner */}
        <div className="mt-3.5 p-3 rounded-2xl bg-cream/70 border border-border/70 shrink-0">
          <div className="flex items-center justify-between text-[11px] font-bold text-sage-dark uppercase tracking-wider mb-1">
            <span>Current Appointment</span>
            <span className="text-charcoal/70 lowercase font-medium">Wk {currentWeek} scan</span>
          </div>
          <h4 className="font-serif font-bold text-charcoal text-[14px] leading-tight truncate">
            {appointmentTitle}
          </h4>
          <p className="text-[11.5px] text-medium mt-0.5 truncate">
            {currentSlot} • {facility}
          </p>
        </div>

        {/* Dynamic Body Content */}
        <div className="flex-1 overflow-y-auto pt-3.5 space-y-4 pr-0.5 custom-scrollbar">
          {/* STEP 1: CHOOSE METHOD */}
          {mode === 'choose' && (
            <div className="space-y-3">
              <p className="text-[12.5px] text-charcoal/80 font-medium">
                How would you like to handle your appointment rescheduling?
              </p>

              {/* Option A: Let OPIN App Help (Recommended) */}
              <div
                onClick={() => {
                  triggerHaptic('light');
                  setMode('opin_email');
                }}
                className="p-4 rounded-2xl border-2 border-sage/50 bg-gradient-to-r from-sage-pale/40 via-white to-cream hover:border-sage transition-all cursor-pointer shadow-2xs group active:scale-[0.99]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sage text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <Sparkles size={19} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-serif font-bold text-charcoal text-[15px] group-hover:text-sage-dark transition-colors">
                        Let OPIN App Help
                      </h4>
                      <span className="text-[9.5px] font-bold px-2 py-0.2 rounded-full bg-sage-dark text-white shadow-2xs">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[12px] text-medium mt-1 leading-snug">
                      Choose your preferred dates. Our Pregnancy will draft a formal, professional clinic request with your patient UHID, gestation week & notes, ready to email or WhatsApp directly.
                    </p>
                    <div className="mt-2.5 flex items-center gap-1 text-[12px] font-bold text-sage-dark">
                      <span>Draft Request to Doctor</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Option B: Direct Self-Service */}
              <div
                onClick={() => {
                  triggerHaptic('light');
                  setMode('self_service');
                }}
                className="p-4 rounded-2xl border border-border/80 bg-white hover:border-charcoal/30 transition-all cursor-pointer shadow-2xs group active:scale-[0.99]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cream border border-border text-charcoal flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <Phone size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-charcoal text-[15px]">
                      Coordinate Directly Myself
                    </h4>
                    <p className="text-[12px] text-medium mt-1 leading-snug">
                      Call or message the hospital OPD reception directly, or simply update your appointment date manually in your Our Pregnancy calendar.
                    </p>
                    <div className="mt-2.5 flex items-center gap-1 text-[12px] font-bold text-charcoal/70 group-hover:text-charcoal">
                      <span>Call Clinic or Update Date</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: OPIN / APP-ASSISTED RESCHEDULE FORM */}
          {mode === 'opin_email' && (
            <div className="space-y-4">
              {/* Doctor / Clinic Recipient */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                  Doctor / Clinic OPD Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={doctorEmail}
                    onChange={(e) => setDoctorEmail(e.target.value)}
                    placeholder="e.g. opd@cloudninecare.com or doctor@clinic.com"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-cream/50 border border-border/80 rounded-xl text-[13.5px] font-medium text-charcoal focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 transition-all placeholder:text-light"
                  />
                  <Mail size={15} className="absolute left-3 top-3 text-medium" />
                </div>
                {state.doctor && !state.doctor.email && (
                  <label className="flex items-center gap-2 mt-2 cursor-pointer text-[11.5px] text-medium">
                    <input
                      type="checkbox"
                      checked={saveEmailToProfile}
                      onChange={(e) => setSaveEmailToProfile(e.target.checked)}
                      className="rounded text-sage focus:ring-sage"
                    />
                    <span>Save this email to {state.doctor.name}'s profile</span>
                  </label>
                )}
              </div>

              {/* Preferred Rescheduled Date */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                  Preferred Rescheduled Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={preferredDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-cream/50 border border-border/80 rounded-xl text-[13.5px] font-medium text-charcoal focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 transition-all"
                  />
                  <Calendar size={15} className="absolute left-3 top-3 text-medium" />
                </div>
              </div>

              {/* Preferred Time Window */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                  Preferred Time Window
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {TIME_SLOT_OPTIONS.map((slot) => {
                    const isSelected = preferredTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setPreferredTime(slot);
                        }}
                        className={`text-left px-3 py-2 rounded-xl text-[12px] font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sage text-white border-sage shadow-2xs font-bold'
                            : 'bg-cream/60 border-border/70 text-charcoal hover:bg-sage-pale/40'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reason for Reschedule (Optional) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                  Reason for Rescheduling (Optional)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {COMMON_REASONS.map((reason) => {
                    const isSelected = selectedReason === reason;
                    return (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setSelectedReason(isSelected ? '' : reason);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sage-dark text-white border-sage-dark'
                            : 'bg-white border-border/70 text-charcoal/80 hover:bg-cream'
                        }`}
                      >
                        {reason}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Or enter custom reason or instructions..."
                  className="w-full px-3.5 py-2 bg-cream/50 border border-border/80 rounded-xl text-[12.5px] text-charcoal focus:outline-none focus:border-sage transition-all placeholder:text-light"
                />
              </div>

              {/* Next Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!doctorEmail.trim() || !doctorEmail.includes('@')) {
                      triggerHaptic('warning');
                      onShowToast('Please enter a valid clinic email address (with @).');
                      return;
                    }
                    if (!preferredDate) {
                      triggerHaptic('warning');
                      onShowToast('Please pick a preferred date.');
                      return;
                    }
                    triggerHaptic('light');
                    setMode('preview');
                  }}
                  className="w-full h-11 bg-sage hover:bg-sage-dark text-white font-bold text-[13.5px] rounded-2xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>Review Draft Request</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & DISPATCH */}
          {mode === 'preview' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-sage-pale/40 border border-sage/30 rounded-2xl flex items-center gap-2 text-sage-dark text-[11.5px] font-medium">
                <Sparkles size={16} className="shrink-0" />
                <span>
                  Our Pregnancy prepared this official request for <strong>{doctorEmail}</strong>.
                </span>
              </div>

              {/* Draft Preview Box */}
              <div className="p-3.5 rounded-2xl bg-cream/70 border border-border/80 text-[11.5px] text-charcoal space-y-2 font-mono whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto custom-scrollbar">
                <div className="font-bold text-[12px] font-sans text-charcoal pb-1 border-b border-border/60">
                  Subject: {subject}
                </div>
                <div className="font-sans text-[11.5px] text-charcoal/90 pt-1">
                  {body}
                </div>
              </div>

              {/* Dispatch Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleSendEmail}
                  className="w-full h-11 bg-sage hover:bg-sage-dark text-white font-bold text-[13.5px] rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Send size={15} />
                  <span>Send Request via Email</span>
                </button>

                {cleanPhoneForWa && (
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13.5px] rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <MessageCircle size={16} />
                    <span>Send Request via WhatsApp</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopyText}
                  className="w-full h-10 bg-white border border-border hover:bg-cream text-charcoal font-bold text-[12.5px] rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Request Text'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SELF-SERVICE COORDINATION */}
          {mode === 'self_service' && (
            <div className="space-y-4">
              <p className="text-[12px] text-medium">
                You can reach out to your doctor directly, or update the scheduled visit date inside your calendar.
              </p>

              {/* Direct Call / WhatsApp */}
              <div className="grid grid-cols-2 gap-2">
                {cleanPhone ? (
                  <a
                    href={`tel:${cleanPhone}`}
                    onClick={() => triggerHaptic('light')}
                    className="p-3 rounded-2xl bg-sage-pale/60 border border-sage/40 flex items-center justify-center gap-2 text-sage-dark font-bold text-[12.5px] hover:bg-sage-pale active:scale-95 transition-all text-center"
                  >
                    <Phone size={15} />
                    <span>Call OPD</span>
                  </a>
                ) : (
                  <div className="p-3 rounded-2xl bg-cream border border-border/70 flex items-center justify-center gap-1.5 text-medium text-[11.5px] text-center">
                    <Phone size={14} />
                    <span>No phone saved</span>
                  </div>
                )}

                {cleanPhoneForWa ? (
                  <a
                    href={`https://wa.me/${cleanPhoneForWa}?text=${encodeURIComponent(`Hello Dr. ${doctorName}, I would like to inquire about rescheduling my upcoming visit.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => triggerHaptic('light')}
                    className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-center gap-2 text-emerald-800 font-bold text-[12.5px] hover:bg-emerald-100 active:scale-95 transition-all text-center"
                  >
                    <MessageCircle size={15} />
                    <span>WhatsApp</span>
                  </a>
                ) : (
                  <div className="p-3 rounded-2xl bg-cream border border-border/70 flex items-center justify-center gap-1.5 text-medium text-[11.5px] text-center">
                    <MessageCircle size={14} />
                    <span>No WhatsApp</span>
                  </div>
                )}
              </div>

              {/* Update in Calendar */}
              <div className="pt-2 border-t border-border/60 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal/70 block">
                  Update Appointment in Calendar
                </span>

                <div>
                  <label className="block text-[11px] font-medium text-medium mb-1">
                    Confirmed Rescheduled Date
                  </label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-cream/50 border border-border/80 rounded-xl text-[13px] font-medium text-charcoal focus:outline-none focus:border-sage transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-medium mb-1">
                    Confirmed Time
                  </label>
                  <input
                    type="text"
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    placeholder="e.g. 11:00 AM"
                    className="w-full px-3.5 py-2.5 bg-cream/50 border border-border/80 rounded-xl text-[13px] font-medium text-charcoal focus:outline-none focus:border-sage transition-all"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleManualSave}
                  className="w-full h-11 bg-sage hover:bg-sage-dark text-white font-bold text-[13px] rounded-2xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Check size={16} />
                  <span>Update Calendar Date</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
