import React, { useState, useRef, useEffect } from 'react';
import { Send, CheckCircle2, Bug, Sparkles, MessageSquareHeart, Mail, Check, ChevronDown } from 'lucide-react';
import { auth, db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { usePlanner } from '../../store';
import { ContextBanner } from '../ContextBanner';
import { triggerHaptic } from '../../utils/nativeBridge';

export const FEATURE_CATEGORIES = [
  {
    category: 'Overall Experience',
    options: [
      { id: 'Entire App / General', label: 'Entire App / General Experience' },
      { id: 'New Feature Idea', label: 'New Feature Idea (Not yet in OPIN)' },
    ]
  },
  {
    category: 'Labor & Postpartum',
    options: [
      { id: 'Hospital Bag Checklist', label: 'Hospital Bag Checklist' },
      { id: 'Birth Plan Builder', label: 'Birth Plan Builder' },
      { id: 'Postpartum Healing', label: 'Postpartum Healing (4th Trimester)' },
    ]
  },
  {
    category: 'Daily Tracking',
    options: [
      { id: 'Kick Counter', label: 'Kick Counter' },
      { id: 'Hydration Tracker', label: 'Hydration Tracker' },
      { id: 'Supplements & Diet', label: 'Supplements & Diet' },
      { id: 'Vitals & BP Tracker', label: 'Vitals & BP Tracker' },
      { id: 'Symptom Logger', label: 'Symptom Logger' },
      { id: 'Mood & Energy', label: 'Mood & Energy' },
      { id: 'Bump Journal', label: 'Bump Journal & Ultrasound Notes' },
    ]
  },
  {
    category: 'Smart AI & Guidance',
    options: [
      { id: 'AI Food Scanner', label: 'AI Food Scanner' },
      { id: 'Breathing & Garbh Sanskar', label: 'Breathing & Garbh Sanskar Audio' },
      { id: 'Baby Names Finder', label: 'Baby Names Finder' },
      { id: 'Safe Travel Guide', label: 'Safe Travel Guide' },
      { id: 'Ask OPIN AI', label: 'Ask OPIN AI' },
    ]
  },
  {
    category: 'Milestones & Preparation',
    options: [
      { id: 'Fetal Development', label: 'Fetal Development (Organogenesis)' },
      { id: 'Due Date Deadlines', label: 'Due Date Deadlines' },
      { id: 'Nursery & Baby Prep', label: 'Nursery & Baby Prep' },
      { id: 'Delivery Cost Planner', label: 'Delivery Cost Planner' },
    ]
  },
  {
    category: 'Medical & Govt Schemes',
    options: [
      { id: 'Govt Maternity Schemes', label: 'Govt Maternity Schemes (PMMVY, JSY)' },
      { id: 'Medical Reports Locker', label: 'Medical Reports Locker (AES-256)' },
      { id: 'Vaccines & Schedule', label: 'Vaccines & Clinical Schedule' },
    ]
  },
  {
    category: 'Connection & Settings',
    options: [
      { id: 'Partner Sync', label: 'Partner Sync (P2P Private)' },
      { id: 'Profile & Settings', label: 'Profile & Journey Settings' },
    ]
  }
];

const POPULAR_FEATURE_CHIPS = [
  'Entire App / General',
  'Hospital Bag Checklist',
  'Birth Plan Builder',
  'Kick Counter',
  'Vitals & BP Tracker',
  'Govt Maternity Schemes',
  'Medical Reports Locker',
  'New Feature Idea',
];

export const Feedback: React.FC = () => {
  const { state } = usePlanner();
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'general'>('bug');
  const [selectedFeature, setSelectedFeature] = useState<string>('Entire App / General');
  const [newFeatureName, setNewFeatureName] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  const allOptions = FEATURE_CATEGORIES.flatMap((c) => c.options);
  const currentOpt = allOptions.find((o) => o.id === selectedFeature || o.label === selectedFeature);
  const currentLabel = currentOpt ? currentOpt.label : selectedFeature;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('founder@ourpregnancy.in');
    setCopiedEmail(true);
    triggerHaptic('light');
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      triggerHaptic('medium');

      const userId = auth.currentUser?.uid || state.activeJourneyId || 'guest_user';
      const userEmail = auth.currentUser?.email || state.userEmail || 'guest';

      const resolvedFeature = selectedFeature === 'New Feature Idea' && newFeatureName.trim()
        ? `New Feature: ${newFeatureName.trim()}`
        : selectedFeature;

      await addDoc(collection(db, 'feedbacks'), {
        uid: userId,
        type: feedbackType,
        feature: resolvedFeature,
        message: message.trim(),
        createdAt: Date.now(),
        userEmail,
        userName: state.userName || 'Anonymous Mother',
        userAgent: navigator.userAgent
      });

      triggerHaptic('success');
      setIsSuccess(true);
      setMessage('');
      setNewFeatureName('');
      setTimeout(() => setIsSuccess(false), 6000);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      // Fallback: If firestore rules fail or user is offline, offer direct email
      alert("Unable to submit directly right now. Please email us at founder@ourpregnancy.in");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlaceholderText = () => {
    if (feedbackType === 'bug') {
      if (selectedFeature === 'Entire App / General') {
        return "What happened? Please describe what went wrong or how we can reproduce it...";
      }
      return `What happened in ${selectedFeature}? Please describe the issue...`;
    }
    if (feedbackType === 'feature') {
      if (selectedFeature === 'New Feature Idea') {
        return "Describe your idea! What would this feature do and how would it help your pregnancy journey?";
      }
      return `What improvements or additions would you love to see in ${selectedFeature}?`;
    }
    return "What's on your mind? Tell us how OPIN is working for you, or what would make it even more welcoming...";
  };

  return (
    <div className="animate-in fade-in duration-300 max-w-2xl space-y-4">
      {/* 1. Context Banner replaces the big text header */}
      <ContextBanner 
        description="Share your feedback, feature ideas, or report any issues. Every note is read directly by our founding team to make OPIN smoother, more supportive, and truly helpful for expectant parents."
      />

      {/* 2. Success Alert */}
      {isSuccess && (
        <div className="p-4 bg-sage-pale border border-sage/40 rounded-2xl flex items-start gap-3 shadow-2xs animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-sage-dark shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[13.5px] font-bold text-charcoal">Feedback Received!</h4>
            <p className="text-[12.5px] text-medium mt-0.5 leading-relaxed">
              Thank you for helping us nurture OPIN. Our founding team reviews every submission and incorporates parent suggestions into upcoming updates.
            </p>
          </div>
        </div>
      )}

      {/* 3. Main Feedback Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 sm:p-7 rounded-[22px] border border-border/80 shadow-xs space-y-5">
        
        {/* Step A: Feedback Type Selection */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-[1px] text-light block">
            1. What type of feedback is this?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Bug Report */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setFeedbackType('bug');
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                feedbackType === 'bug'
                  ? 'bg-amber-50/80 border-amber-300 text-charcoal ring-2 ring-amber-400/30 shadow-3xs'
                  : 'bg-white border-border/80 text-medium hover:border-amber-200 hover:bg-amber-50/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bug size={16} className={feedbackType === 'bug' ? 'text-amber-700' : 'text-medium'} />
                <span className="text-[13px] font-bold text-charcoal">Report a Bug</span>
              </div>
              <span className="text-[11px] text-medium leading-snug">Something isn't working</span>
            </button>

            {/* Feature Request */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setFeedbackType('feature');
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                feedbackType === 'feature'
                  ? 'bg-sage-pale border-sage text-charcoal ring-2 ring-sage/30 shadow-3xs'
                  : 'bg-white border-border/80 text-medium hover:border-sage/40 hover:bg-sage-pale/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles size={16} className={feedbackType === 'feature' ? 'text-sage-dark' : 'text-medium'} />
                <span className="text-[13px] font-bold text-charcoal">Feature Request</span>
              </div>
              <span className="text-[11px] text-medium leading-snug">Suggest an improvement</span>
            </button>

            {/* General Feedback */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setFeedbackType('general');
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                feedbackType === 'general'
                  ? 'bg-rose-50/80 border-rose-300 text-charcoal ring-2 ring-rose-400/30 shadow-3xs'
                  : 'bg-white border-border/80 text-medium hover:border-rose-200 hover:bg-rose-50/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquareHeart size={16} className={feedbackType === 'general' ? 'text-rose-600' : 'text-medium'} />
                <span className="text-[13px] font-bold text-charcoal">General Feedback</span>
              </div>
              <span className="text-[11px] text-medium leading-snug">Overall thoughts & love</span>
            </button>
          </div>
        </div>

        {/* Step B: Target Feature Selection */}
        <div className="space-y-2.5 pt-1 border-t border-border/60">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-[1px] text-light block">
              2. Which feature or area?
            </label>
            <span className="text-[11px] text-medium">
              Quick tap or choose from list
            </span>
          </div>

          {/* Quick Popular Feature Chips */}
          <div className="flex flex-wrap gap-1.5 pb-1">
            {POPULAR_FEATURE_CHIPS.map((chip) => {
              const isSelected = selectedFeature === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedFeature(chip);
                  }}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-charcoal text-white border-charcoal shadow-3xs'
                      : 'bg-cream/60 text-charcoal border-border/80 hover:bg-cream hover:border-border'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          {/* Full Categorized Dropdown Selector */}
          <div className="space-y-1 relative" ref={dropdownRef}>
            <label className="text-[11.5px] font-medium text-medium block">
              Or pick from all OPIN tools:
            </label>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className={`w-full p-3 rounded-xl border border-border/80 bg-white text-charcoal font-sans text-[13.5px] text-left flex items-center justify-between transition-all cursor-pointer hover:border-sage/70 focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/10 ${
                isDropdownOpen ? 'border-sage ring-4 ring-sage/10' : ''
              }`}
            >
              <span className="truncate pr-2 font-medium text-charcoal text-left">
                {currentLabel}
              </span>
              <ChevronDown
                size={16}
                className={`text-medium transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180 text-sage' : ''}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1.5 max-h-[290px] overflow-y-auto bg-white border border-border/90 rounded-2xl shadow-[0_12px_32px_rgba(44,62,80,0.14)] p-1.5 overscroll-contain animate-in fade-in slide-in-from-top-1 duration-150">
                {FEATURE_CATEGORIES.map((cat, idx) => (
                  <div key={cat.category} className={idx > 0 ? "pt-2 mt-1 border-t border-border/50" : ""}>
                    <div className="px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[1px] text-light text-left select-none">
                      {cat.category}
                    </div>
                    <div className="space-y-0.5">
                      {cat.options.map((opt) => {
                        const isSelected = selectedFeature === opt.id || selectedFeature === opt.label;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              triggerHaptic('light');
                              setSelectedFeature(opt.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-[13px] transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-sage-pale text-sage-dark font-semibold shadow-3xs'
                                : 'text-charcoal hover:bg-cream/80 hover:text-charcoal'
                            }`}
                          >
                            <span className="truncate text-left">{opt.label}</span>
                            {isSelected && (
                              <Check size={14} className="text-sage-dark shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Optional New Feature Title Input if 'New Feature Idea' is chosen */}
          {selectedFeature === 'New Feature Idea' && (
            <div className="pt-2 animate-in fade-in duration-200">
              <label className="text-[11px] font-bold uppercase tracking-[1px] text-light mb-1 block">
                Suggested Feature Title (Optional)
              </label>
              <input
                type="text"
                value={newFeatureName}
                onChange={(e) => setNewFeatureName(e.target.value)}
                placeholder="e.g. Baby Shower Planner, Contraction History, Pediatrist Visits..."
                className="w-full p-3 rounded-xl border border-border/80 bg-white text-[13.5px] text-charcoal placeholder:text-light/70 focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/10 transition-all font-sans"
              />
            </div>
          )}
        </div>

        {/* Step C: Message Textarea */}
        <div className="space-y-1.5 pt-1 border-t border-border/60">
          <label className="text-[11px] font-bold uppercase tracking-[1px] text-light block">
            3. Your Details & Feedback
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={getPlaceholderText()}
            rows={5}
            className="w-full p-3.5 sm:p-4 rounded-xl border border-border/80 bg-white text-[13.5px] text-charcoal placeholder:text-light/70 focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/10 transition-all font-sans resize-y leading-relaxed"
            required
          />
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={!message.trim() || isSubmitting}
            className="w-full sm:w-auto px-7 py-3 bg-sage hover:bg-sage-dark text-white rounded-xl text-[13.5px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={15} />
            )}
            <span>Send Feedback</span>
          </button>
        </div>
      </form>

      {/* 4. Sleek Founding Team Direct Email Card */}
      <div className="bg-cream/70 border border-border/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-3xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sage-pale flex items-center justify-center text-sage-dark shrink-0">
            <Mail size={16} />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-charcoal">Prefer to email directly?</h4>
            <p className="text-[11.5px] text-medium mt-0.5">
              Have a critical inquiry or partnership thought? Reach our founders anytime.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <a
            href="mailto:founder@ourpregnancy.in"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-border/80 text-[12px] font-semibold text-charcoal hover:border-sage hover:text-sage transition-all shadow-3xs"
          >
            <Mail size={13} className="text-sage" />
            <span>founder@ourpregnancy.in</span>
          </a>
          <button
            type="button"
            onClick={handleCopyEmail}
            title="Copy email address"
            className="p-1.5 rounded-xl bg-white border border-border/80 text-medium hover:text-charcoal hover:border-sage transition-all shadow-3xs cursor-pointer"
          >
            {copiedEmail ? <Check size={14} className="text-sage" /> : <Mail size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};
