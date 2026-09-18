import React, { useEffect, useState } from 'react';
import { Sparkles, MailPlus, PenTool, Copy, Check, ExternalLink, X, Mail } from 'lucide-react';
import { usePlanner } from '../store';
import { PublicHeader } from '../components/PublicHeader';

export const BlogsPage: React.FC = () => {
  const { state } = usePlanner();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const recipientEmail = 'founder@ourpregnancy.in';
  const subject = 'Blog Topic Suggestion / Feedback';
  const body = 'Hello Our Pregnancy Team,\n\nI have a topic idea / suggestion for the Our Pregnancy blog:\n\n';

  const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipientEmail}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const copyToClipboard = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(recipientEmail).catch(() => {});
    }
    setCopied(true);
    setToastMessage(`Copied ${recipientEmail} to clipboard!`);
    setTimeout(() => {
      setToastMessage(null);
      setCopied(false);
    }, 4000);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    copyToClipboard();
    setIsModalOpen(true);
  };

  const triggerSystemMail = () => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = mailtoUrl;
    document.body.appendChild(iframe);
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 2000);
    setToastMessage('Triggering default email app...');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-cream font-sans overflow-x-hidden selection:bg-sage-pale selection:text-sage-dark text-charcoal relative">
      {/* Mesh Glow Background Blobs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-sage-light/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob -z-10" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-blush-light/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 -z-10" />
      <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-gold-pale/35 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 -z-10" />

      <PublicHeader />

      {/* Main Container */}
      <main className="max-w-[1200px] mx-auto px-6 pt-36 pb-24 flex flex-col items-center min-h-[85vh] justify-center text-center">
        
        {/* Status Notification */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-pale text-[13px] font-bold text-sage uppercase tracking-wider mb-8 border border-sage/20 animate-bounce shadow-sm">
          <PenTool size={16} /> Blogs are in progress
        </div>

        <h1 className="font-serif text-[clamp(40px,6vw,72px)] leading-[1.15] text-charcoal mb-6">
          We are brewing <br />
          <span className="italic text-sage font-medium">something special.</span>
        </h1>

        <p className="text-medium text-[17px] md:text-[20px] max-w-2xl leading-relaxed mb-12">
          Our team is currently working hard to bring you insightful, expert-backed articles and stories. The blogs section will be updated very soon!
        </p>

        {/* Suggestion Section */}
        <div className="bg-white/80 backdrop-blur-sm border border-border rounded-3xl p-8 md:p-12 w-full max-w-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden transition-all duration-300 hover:shadow-[0_15px_40px_rgba(107,146,120,0.12)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-sage-pale/40 via-gold/5 to-transparent rounded-full filter blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mb-6 shadow-sm border border-border">
              <Sparkles className="w-8 h-8 text-gold" />
            </div>
            
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal mb-4">
              Have a topic in mind?
            </h2>
            
            <p className="text-medium text-[15px] md:text-[16px] max-w-xl text-center mb-8 leading-relaxed">
              We want to write about what matters most to you. Suggest ideas for blog topics, share your feedback, or voice any other concerns. We'd love to hear from you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleActionClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-sage text-white rounded-full font-semibold px-8 py-4 text-[15px] sm:text-[16px] transition-all hover:bg-sage-dark hover:-translate-y-0.5 hover:shadow-md cursor-pointer active:scale-98"
              >
                <MailPlus size={19} />
                Share Your Ideas
              </button>

              <a
                href={gmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setToastMessage('Opening Gmail composer in new tab...');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-charcoal border border-border rounded-full font-semibold px-6 py-4 text-[15px] transition-all hover:bg-cream hover:-translate-y-0.5 hover:shadow-sm"
              >
                <ExternalLink size={17} className="text-sage" />
                Open in Gmail
              </a>
            </div>

            <p className="text-light text-[13px] mt-6 flex items-center justify-center gap-1.5 flex-wrap">
              <span>Or email us directly at</span>
              <button
                type="button"
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1 font-semibold text-charcoal hover:text-sage underline cursor-pointer transition-colors"
                title="Click to copy email address"
              >
                <span>{recipientEmail}</span>
                {copied ? <Check size={14} className="text-sage" /> : <Copy size={13} className="opacity-70" />}
              </button>
            </p>
          </div>
        </div>

      </main>

      {/* Interactive Suggestion Modal (Guarantees web app never navigates away) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-charcoal/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-border max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-left animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-cream hover:bg-border text-charcoal flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-sage-pale text-sage flex items-center justify-center shrink-0">
                <PenTool size={20} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-charcoal text-[20px]">
                  Suggest a Blog Topic
                </h3>
                <p className="text-[12px] text-medium">
                  Direct communication with our editorial team
                </p>
              </div>
            </div>

            <p className="text-medium text-[13.5px] leading-relaxed mb-5">
              Have a prenatal topic or question you want our doctors and writers to answer? Reach out directly:
            </p>

            {/* Email Address Container with Copy Action */}
            <div className="bg-cream/80 border border-border rounded-2xl p-3.5 mb-5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-medium block">
                  Editorial Team Email
                </span>
                <span className="font-mono text-charcoal font-semibold text-[14px] truncate block">
                  {recipientEmail}
                </span>
              </div>
              <button
                type="button"
                onClick={copyToClipboard}
                className="px-3 py-1.5 rounded-xl bg-white border border-border text-[12px] font-bold text-charcoal hover:bg-cream transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {copied ? <Check size={13} className="text-sage" /> : <Copy size={13} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <a
                href={gmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setToastMessage('Opening Gmail composer in new tab...');
                  setTimeout(() => setToastMessage(null), 3000);
                  setIsModalOpen(false);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-sage text-white font-semibold text-[14px] hover:bg-sage-dark transition-all flex items-center justify-center gap-2 shadow-sm text-center"
              >
                <ExternalLink size={16} />
                <span>Open in Gmail (New Tab)</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  triggerSystemMail();
                  setIsModalOpen(false);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-cream text-charcoal font-semibold text-[14px] border border-border hover:bg-border/60 transition-all flex items-center justify-center gap-2 text-center cursor-pointer"
              >
                <Mail size={16} className="text-medium" />
                <span>Open Default Mail App</span>
              </button>
            </div>

            <p className="text-[11.5px] text-light text-center mt-4">
              The subject <span className="font-semibold text-charcoal">"Blog Topic Suggestion / Feedback"</span> will be pre-filled.
            </p>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] bg-charcoal text-white px-5 py-3 rounded-[12px] shadow-xl flex items-center gap-2.5 text-sm font-semibold animate-in slide-in-from-bottom-5 duration-300 border border-white/20 whitespace-nowrap">
          <span>📋</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
