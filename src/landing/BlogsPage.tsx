import React, { useEffect } from 'react';
import { ArrowLeft, Sparkles, MailPlus, PenTool } from 'lucide-react';
import { usePlanner } from '../store';
import { LanguageSelector } from '../components/LanguageSelector';
import { PublicHeader } from '../components/PublicHeader';
import { navigate } from '../utils/navigation';

export const BlogsPage: React.FC = () => {
  const { state, toggleDarkMode } = usePlanner();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

            <a
              href="mailto:sukrat.kaushik@ourpregnancy.in?subject=Blog%20Topic%20Suggestion%20/%20Feedback"
              className="inline-flex items-center justify-center gap-2 bg-sage text-white rounded-full font-semibold px-8 py-4 text-[16px] transition-all hover:bg-sage-dark hover:-translate-y-1 hover:shadow-md"
            >
              <MailPlus size={20} />
              Share Your Ideas
            </a>
            
            <p className="text-light text-[13px] mt-6">
              Or email us directly at <span className="font-semibold text-charcoal">sukrat.kaushik@ourpregnancy.in</span>
            </p>
          </div>
        </div>

      </main>
    </div>
  );
};
