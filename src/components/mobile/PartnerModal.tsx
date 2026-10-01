import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Users,
  Heart,
  Phone,
  Mail,
  FileText,
  X,
  Check,
  Trash2,
  AlertTriangle,
  Smartphone,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { PartnerInfo } from '../../types';
import { triggerHaptic } from '../../utils/nativeBridge';

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (partner: PartnerInfo) => void;
  onRemove?: () => void;
  initialPartner?: PartnerInfo | null;
  onShowToast?: (msg: string) => void;
  taskTitleToAssign?: string | null;
}

export const PartnerModal: React.FC<PartnerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onRemove,
  initialPartner,
  onShowToast,
  taskTitleToAssign,
}) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Husband / Partner');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialPartner?.name || '');
      setRelationship(initialPartner?.relationship || 'Husband / Partner');
      setPhone(initialPartner?.phone || '');
      setEmail(initialPartner?.email || '');
      setNotes(initialPartner?.notes || '');
      setError(null);
      setConfirmDelete(false);
    }
  }, [isOpen, initialPartner]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your partner or support person\'s name.');
      triggerHaptic('warning');
      return;
    }

    const finalEmail = email.trim();
    if (finalEmail && !finalEmail.includes('@')) {
      setError('Please enter a valid email address with "@".');
      triggerHaptic('warning');
      return;
    }

    const partnerData: PartnerInfo = {
      name: trimmedName,
      relationship: relationship.trim() || 'Partner',
      phone: phone.trim() || undefined,
      email: finalEmail || undefined,
      notes: notes.trim() || undefined,
    };

    triggerHaptic('success');
    onSave(partnerData);
    if (onShowToast) {
      onShowToast(initialPartner?.name ? 'Partner details updated' : `Partner ${trimmedName} saved & task assigned`);
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
      onShowToast('Partner profile removed');
    }
    onClose();
  };

  const isExisting = Boolean(initialPartner?.name);

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
            <div className="w-10 h-10 rounded-2xl bg-blush-pale text-blush flex items-center justify-center font-bold shrink-0 border border-blush/20">
              <Heart size={20} className="fill-blush/30" />
            </div>
            <div className="min-w-0">
              <h2 className="font-serif font-bold text-charcoal text-[17px] sm:text-[18px] leading-tight truncate">
                {isExisting ? 'Partner & Support Person' : 'Define Your Partner'}
              </h2>
              <p className="text-[12px] text-medium truncate">
                {isExisting ? 'Manage partner name, WhatsApp contact & app sync' : 'Assign tasks, share updates & sync with their app'}
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

        {/* Task Assignment Context Banner */}
        {taskTitleToAssign && (
          <div className="mt-3.5 p-2.5 bg-sage-pale/60 border border-sage/30 rounded-xl flex items-center gap-2 text-[12px] text-sage-dark shrink-0">
            <Sparkles size={14} className="shrink-0 text-sage" />
            <span className="truncate">
              Assigning: <strong className="text-charcoal font-semibold">"{taskTitleToAssign}"</strong>
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto pt-3.5 space-y-4 pr-0.5 custom-scrollbar">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[12px] flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Partner Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70">
                Partner / Support Person Name <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. Rahul, Alex, David"
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream/50 border border-border/80 rounded-xl text-[13.5px] font-medium text-charcoal focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 transition-all placeholder:text-light"
              />
              <Users size={15} className="absolute left-3 top-3 text-medium" />
            </div>
          </div>

          {/* Relationship / Role */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
              Role / Relationship
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {['Husband / Partner', 'Father-to-be', 'Co-Parent', 'Support Person', 'Doula / Family'].map((roleOption) => (
                <button
                  key={roleOption}
                  type="button"
                  onClick={() => setRelationship(roleOption)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    relationship === roleOption
                      ? 'bg-sage text-white border-sage shadow-3xs'
                      : 'bg-cream/60 border-border text-charcoal/80 hover:bg-cream'
                  }`}
                >
                  {roleOption}
                </button>
              ))}
            </div>
          </div>

          {/* Phone / WhatsApp */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70">
                Phone / WhatsApp Number
              </label>
              <span className="text-[10.5px] text-emerald-600 font-medium flex items-center gap-1">
                <MessageCircle size={11} /> 1-tap WhatsApp ready
              </span>
            </div>
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
              Enables 1-tap WhatsApp task sharing, milestone alerts, and SOS alerts.
            </p>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
              Partner Email (Optional)
            </label>
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
                placeholder="e.g. partner@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream/50 border border-border/80 rounded-xl text-[13.5px] font-medium text-charcoal focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 transition-all placeholder:text-light"
              />
              <Mail size={15} className="absolute left-3 top-3 text-medium" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
              Personal Notes / Availability (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Available after 6 PM, in charge of hospital bag prep"
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream/50 border border-border/80 rounded-xl text-[13.5px] font-medium text-charcoal focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 transition-all placeholder:text-light"
              />
              <FileText size={15} className="absolute left-3 top-3 text-medium" />
            </div>
          </div>

          {/* Live App Sync Tip */}
          <div className="p-3 bg-cream/60 border border-border/80 rounded-2xl flex items-start gap-2.5">
            <Smartphone size={18} className="text-sage shrink-0 mt-0.5" />
            <div className="text-[12px] text-charcoal/80 leading-relaxed">
              <strong className="text-charcoal block mb-0.5">Want tasks to appear inside their app?</strong>
              Connect live via <strong>Partner Sync</strong> using a private 6-letter pairing code. All assigned milestones and health updates will automatically reflect on their device.
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
                    <span>Remove Partner</span>
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
                <span>{isExisting ? 'Save Changes' : 'Save Partner'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
