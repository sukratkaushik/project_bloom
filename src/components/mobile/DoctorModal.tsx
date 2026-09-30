import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Stethoscope,
  Building2,
  Phone,
  Mail,
  FileText,
  X,
  Check,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { DoctorInfo } from '../../types';
import { triggerHaptic } from '../../utils/nativeBridge';

interface DoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doctor: DoctorInfo) => void;
  onRemove?: () => void;
  initialDoctor?: DoctorInfo | null;
  onShowToast?: (msg: string) => void;
}

export const DoctorModal: React.FC<DoctorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onRemove,
  initialDoctor,
  onShowToast,
}) => {
  const [name, setName] = useState('');
  const [hospital, setHospital] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialDoctor?.name || '');
      setHospital(initialDoctor?.hospital || '');
      setPhone(initialDoctor?.phone || '');
      setEmail(initialDoctor?.email || '');
      setNotes(initialDoctor?.notes || '');
      setError(null);
      setConfirmDelete(false);
    }
  }, [isOpen, initialDoctor]);

  const missingAtSuggestion = useMemo(() => {
    if (!email || email.includes('@')) return null;
    const trimmed = email.trim();
    const match = trimmed.match(/^(.+?)(gmail\.com|yahoo\.com|outlook\.com|icloud\.com|hotmail\.com|cloudnine.*\.com|hospital.*\.com)$/i);
    if (match && match[1] && match[2]) {
      return `${match[1]}@${match[2]}`;
    }
    return null;
  }, [email]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter the doctor or obstetrician name.');
      triggerHaptic('warning');
      return;
    }

    let finalEmail = email.trim();
    if (finalEmail && !finalEmail.includes('@') && missingAtSuggestion) {
      finalEmail = missingAtSuggestion;
    }

    if (finalEmail && !finalEmail.includes('@')) {
      setError('Please include an "@" in the email address (e.g. name@hospital.com).');
      triggerHaptic('warning');
      return;
    }

    const doctorData: DoctorInfo = {
      name: trimmedName,
      hospital: hospital.trim() || undefined,
      phone: phone.trim() || undefined,
      email: finalEmail || undefined,
      notes: notes.trim() || undefined,
    };

    triggerHaptic('success');
    onSave(doctorData);
    if (onShowToast) {
      onShowToast(initialDoctor?.name ? 'Doctor profile updated' : 'Primary obstetrician added');
    }
    onClose();
  };

  const handleRemove = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      triggerHaptic('warning');
      return;
    }

    triggerHaptic('medium');
    if (onRemove) {
      onRemove();
    }
    if (onShowToast) {
      onShowToast('Doctor removed from care profile');
    }
    onClose();
  };

  const isExisting = Boolean(initialDoctor?.name);

  const modalContent = (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-border/80 max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-sage-pale text-sage-dark flex items-center justify-center font-bold shrink-0 border border-sage/20">
              <Stethoscope size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="font-serif font-bold text-charcoal text-[17px] sm:text-[18px] leading-tight truncate">
                {isExisting ? 'Edit Obstetrician' : 'Add Primary Obstetrician'}
              </h2>
              <p className="text-[12px] text-medium truncate">
                {isExisting ? 'Update doctor & clinic contact details' : 'Set up your care team for quick calling & notes'}
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto pt-4 space-y-4 pr-0.5 custom-scrollbar">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[12px] flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Doctor Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70">
                Doctor / Obstetrician Name <span className="text-red-500">*</span>
              </label>
              {!name && (
                <div className="flex items-center gap-1">
                  {['Dr. ', 'OB-GYN'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setName((prev) => (prev ? `${prev} (${chip})` : chip))}
                      className="text-[10px] font-bold bg-cream border border-border/80 px-2 py-0.5 rounded-md text-medium hover:text-charcoal transition-colors cursor-pointer"
                    >
                      +{chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. Dr. Priya Sharma, MS (OB-GYN)"
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream/50 border border-border/80 rounded-xl text-[13.5px] font-medium text-charcoal focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 transition-all placeholder:text-light"
              />
              <Stethoscope size={15} className="absolute left-3 top-3 text-medium" />
            </div>
          </div>

          {/* Hospital / Clinic */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
              Hospital / Clinic Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                placeholder="e.g. Cloudnine Hospital, Whitefield"
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream/50 border border-border/80 rounded-xl text-[13.5px] font-medium text-charcoal focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 transition-all placeholder:text-light"
              />
              <Building2 size={15} className="absolute left-3 top-3 text-medium" />
            </div>
          </div>

          {/* Phone / WhatsApp */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
              Phone / WhatsApp (OPD Contact)
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream/50 border border-border/80 rounded-xl text-[13.5px] font-medium text-charcoal focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 transition-all placeholder:text-light"
              />
              <Phone size={15} className="absolute left-3 top-3 text-medium" />
            </div>
            <p className="text-[11px] text-medium mt-1">
              Enables 1-tap phone calls and WhatsApp messaging directly from the Care tab.
            </p>
          </div>

          {/* Email Address */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70">
                Clinic Email (Optional)
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setEmail((prev) => {
                      if (!prev) return '@';
                      if (prev.includes('@')) return prev;
                      return `${prev}@`;
                    });
                  }}
                  className="text-[10px] font-bold bg-cream border border-border/80 px-2 py-0.5 rounded-md text-medium hover:text-charcoal transition-colors cursor-pointer"
                  title="Insert @ symbol"
                >
                  + @
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setEmail((prev) => {
                      if (!prev) return '@gmail.com';
                      if (prev.endsWith('@')) return `${prev}gmail.com`;
                      if (prev.includes('@')) return prev;
                      return `${prev}@gmail.com`;
                    });
                  }}
                  className="text-[10px] font-bold bg-cream border border-border/80 px-2 py-0.5 rounded-md text-medium hover:text-charcoal transition-colors cursor-pointer"
                  title="Insert @gmail.com"
                >
                  + @gmail.com
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. opd@cloudninecare.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream/50 border border-border/80 rounded-xl text-[13.5px] font-medium text-charcoal focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 transition-all placeholder:text-light"
              />
              <Mail size={15} className="absolute left-3 top-3 text-medium" />
            </div>
            {missingAtSuggestion && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setEmail(missingAtSuggestion);
                }}
                className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-sage-dark font-medium bg-sage/10 hover:bg-sage/20 border border-sage/30 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer w-full text-left"
              >
                <Check size={13} className="shrink-0 text-sage-dark" />
                <span className="truncate">Did you mean <strong>{missingAtSuggestion}</strong>? Tap to fix</span>
              </button>
            )}
          </div>

          {/* Consultation Notes / OPD Hours */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
              Consultation Hours / Location Notes (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Mon–Fri 10:00 AM – 1:00 PM, OPD Room 204"
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream/50 border border-border/80 rounded-xl text-[13.5px] font-medium text-charcoal focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 transition-all placeholder:text-light"
              />
              <FileText size={15} className="absolute left-3 top-3 text-medium" />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between pb-1">
            {isExisting && onRemove ? (
              <div>
                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="h-10 px-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[12px] rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Trash2 size={13} />
                      <span>Confirm Remove</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="h-10 px-3 bg-cream hover:bg-black/5 text-charcoal font-semibold text-[12px] rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="h-10 px-3.5 border border-red-200 text-red-600 hover:bg-red-50 font-bold text-[12.5px] rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Trash2 size={14} />
                    <span>Remove Doctor</span>
                  </button>
                )}
              </div>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                className="h-10 px-4 text-medium hover:text-charcoal font-bold text-[13px] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 px-5 bg-sage hover:bg-sage-dark text-white font-bold text-[13px] rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Check size={15} />
                <span>{isExisting ? 'Save Changes' : 'Save Doctor'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
