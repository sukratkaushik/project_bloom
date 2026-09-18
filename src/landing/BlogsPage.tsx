import React, { useEffect, useState } from 'react';
import { Sparkles, MailPlus, PenTool, Copy, Check, ExternalLink } from 'lucide-react';
import { usePlanner } from '../store';
import { PublicHeader } from '../components/PublicHeader';

export const BlogsPage: React.FC = () => {
  const { state } = usePlanner();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
    window.location.href = mailtoUrl;
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
              <a
                href={mailtoUrl}
                onClick={handleActionClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-sage text-white rounded-full font-semibold px-8 py-4 text-[15px] sm:text-[16px] transition-all hover:bg-sage-dark hover:-translate-y-0.5 hover:shadow-md cursor-pointer active:scale-98"
              >
                <MailPlus size={19} />
                Share Your Ideas
              </a>

              <a
                href={gmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setToastMessage('Opening Gmail composer...');
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

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-charcoal text-white px-5 py-3 rounded-[12px] shadow-xl flex items-center gap-2.5 text-sm font-semibold animate-in slide-in-from-bottom-5 duration-300 border border-white/20 whitespace-nowrap">
          <span>📋</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
