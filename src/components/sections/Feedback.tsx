import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { auth, db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const Feedback: React.FC = () => {
  const [feedbackType, setFeedbackType] = useState('bug');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("Must be logged in to submit feedback.");

      await addDoc(collection(db, 'feedbacks'), {
        uid: userId,
        type: feedbackType,
        message: message.trim(),
        createdAt: Date.now(),
        userEmail: auth.currentUser?.email || 'unknown',
        userAgent: navigator.userAgent
      });

      setIsSuccess(true);
      setMessage('');
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      alert("Failed to send feedback. You can also email us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-300 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[28px]">💬</span>
        <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-normal text-charcoal tracking-tight">Feedback & Support</h1>
      </div>
      
      <p className="text-[14px] text-medium mb-8 leading-relaxed">
        Let me know if you run into any issues, have suggestions for new features, or just want to tell me how the app is helping you. Your feedback goes directly to me!
      </p>

      {isSuccess && (
        <div className="mb-6 p-4 bg-sage-pale border border-sage/30 rounded-[12px] flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-sage" />
          <p className="text-[14px] text-charcoal font-medium">Thank you for your feedback! It has been successfully sent.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 md:p-8 rounded-[16px] border border-border shadow-sm">
        
        <div className="space-y-3">
          <label className="text-[13px] font-semibold text-charcoal uppercase tracking-wider block">Feedback Type</label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setFeedbackType('bug')}
              className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                feedbackType === 'bug' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-gray-50 text-medium border-border hover:bg-gray-100'
              } border`}
            >
              🐛 Report a Bug
            </button>
            <button
              type="button"
              onClick={() => setFeedbackType('feature')}
              className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                feedbackType === 'feature' ? 'bg-sage-pale text-sage-dark border-sage/30' : 'bg-gray-50 text-medium border-border hover:bg-gray-100'
              } border`}
            >
              ✨ Feature Request
            </button>
            <button
              type="button"
              onClick={() => setFeedbackType('general')}
              className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                feedbackType === 'general' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-medium border-border hover:bg-gray-100'
              } border`}
            >
              💭 General Feedback
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[13px] font-semibold text-charcoal uppercase tracking-wider block">Your Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              feedbackType === 'bug' ? "What happened? Please describe the issue..." :
              feedbackType === 'feature' ? "What would you like to see added?" :
              "What's on your mind?"
            }
            rows={5}
            className="w-full p-4 border border-border rounded-[12px] bg-white text-[14px] text-charcoal placeholder:text-medium/50 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent resize-y"
            required
          />
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-[12px] text-medium">
            Or email me directly: <a href="mailto:sukrat.kaushik@gmail.com" className="text-sage hover:underline font-medium">sukrat.kaushik@gmail.com</a>
          </p>
          <button
            type="submit"
            disabled={!message.trim() || isSubmitting}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-sage hover:bg-sage-dark text-white rounded-[10px] text-[14px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send Feedback
          </button>
        </div>

      </form>
    </div>
  );
};
