import React, { useEffect, useState } from 'react';
import { ArrowLeft, Linkedin, Sparkles, Shield, Heart, Wifi, Lock } from 'lucide-react';
import { usePlanner } from '../store';
import { LanguageSelector } from '../components/LanguageSelector';

export const TeamPage: React.FC = () => {
  const { state, toggleDarkMode } = usePlanner();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleEmailClick = (email: string, e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = `mailto:${email}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(() => {
        setToastMessage("Email copied to clipboard!");
        setTimeout(() => setToastMessage(null), 3000);
      }).catch((err) => {
        console.error("Could not copy email: ", err);
      });
    } else {
      try {
        const tempInput = document.createElement("input");
        tempInput.value = email;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        setToastMessage("Email copied to clipboard!");
        setTimeout(() => setToastMessage(null), 3000);
      } catch (err) {
        console.error("Fallback copy failed: ", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-cream font-sans overflow-x-hidden selection:bg-sage-pale selection:text-sage-dark text-charcoal relative">
      {/* Mesh Glow Background Blobs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-sage-light/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob -z-10" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-blush-light/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 -z-10" />
      <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-gold-pale/35 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 -z-10" />

      {/* Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[1200px] z-50 rounded-[20px] border border-border/80 bg-white/90 backdrop-blur-md py-2 px-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <nav className="w-full flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="Our Pregnancy Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
            <span className="font-serif text-[18px] sm:text-[22px] font-semibold text-sage tracking-wide notranslate">Our Pregnancy</span>
          </a>

          <div className="flex items-center gap-2">
            <LanguageSelector />
            <button
              onClick={toggleDarkMode}
              className="p-1.5 sm:p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-charcoal flex items-center justify-center mr-1"
              title="Toggle Dark Mode"
              aria-label="Toggle Dark Mode"
            >
              <span className="text-[16px] sm:text-[18px] leading-none">{state.isDarkModeActive ? '🌙' : '☀️'}</span>
            </button>
            <a href="#" className="inline-flex items-center gap-1.5 bg-charcoal text-cream rounded-[10px] text-[13px] font-semibold px-4 py-2 hover:opacity-90 transition-all shadow-sm whitespace-nowrap">
              <ArrowLeft size={14} /> Back Home
            </a>
          </div>
        </nav>
      </header>

      {/* Main Container */}
      <main className="max-w-[1200px] mx-auto px-6 pt-32 pb-24">

        {/* Section 1: Vision (Defined First) */}
        <section className="text-center max-w-4xl mx-auto mb-20 md:mb-28">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-pale text-[12px] font-bold text-sage uppercase tracking-wider mb-6 border border-sage/20 animate-in fade-in duration-500">
            <Sparkles size={14} /> Our Vision & Mission
          </div>

          <h1 className="font-serif text-[clamp(36px,6vw,64px)] leading-[1.15] text-charcoal mb-8">
            Empowering mothers with <br />
            <span className="italic text-sage font-medium">privacy, safety, & support.</span>
          </h1>

          <div className="prose prose-sage max-w-3xl mx-auto text-left text-medium text-[16px] md:text-[18px] leading-relaxed space-y-6">
            <p>
              Pregnancy is an extraordinary journey, yet finding reliable, context-specific, and private digital tools remains a challenge for many. Our Pregnancy was born out of a desire to create a digital sanctuary for expectant parents, designed explicitly to serve Indian mothers with tools optimized for their lives.
            </p>
            <p>
              We envision a future where high-quality prenatal guidance is accessible to everyone. Our core philosophy bridges cutting-edge engineering with maternal empathy. We prioritize your privacy above all, building local-first solutions that perform perfectly offline because maternal health shouldn’t depend on stable internet.
            </p>
            <p>
              From verifying local recipes to understanding maternity health benefits, we are committed to constructing a secure and supportive network where mothers own their data, partner relationships are synchronized securely, and every baby step is documented with respect.
            </p>
          </div>
        </section>

        {/* Section 2: Interactive Pillar Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 md:mb-32">
          {[
            {
              icon: <Shield className="w-6 h-6 text-sage" />,
              title: "Privacy First",
              desc: "Your medical, symptom, and baby logs are encrypted and private. We never monetize or sell your medical profile. You have complete ownership of your personal data."
            },
            {
              icon: <Heart className="w-6 h-6 text-blush" />,
              title: "Local Indian Context",
              desc: "From ragi and aamla risk factors in our local food database to actionable guides for national maternity schemes (like PMMVY), our features fit your life."
            },
            {
              icon: <Wifi className="w-6 h-6 text-gold" />,
              title: "Offline Resilience",
              desc: "Built as an offline-first Progressive Web App (PWA). Log your vitals, contractions, and checklists on the go without cellular data, sync securely when online."
            }
          ].map((pillar, i) => (
            <div key={i} className="premium-card p-8 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-[14px] bg-cream border border-border flex items-center justify-center mb-6 shadow-sm">
                {pillar.icon}
              </div>
              <h3 className="font-serif text-[20px] font-bold text-charcoal mb-3">{pillar.title}</h3>
              <p className="text-[14px] text-medium leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </section>

        {/* Section Divider */}
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-center py-6">
          <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="mx-4 text-sage/40 text-[10px] tracking-[4px] uppercase font-bold">Team</span>
          <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Section 3: Meet the Team (Visual Grid with Pictures) */}
        <section id="team" className="mb-24 md:mb-32">
          <div className="text-center mb-16">
            <h2 className="font-serif text-[32px] md:text-[44px] text-charcoal mb-4">The Team Behind ''Our Pregnancy''</h2>
            <p className="text-medium text-[16px] max-w-2xl mx-auto">
              Our core team is dedicated to designing, building, and delivering a safer digital companion for pregnancy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sukrat Kaushik",
                role: "Founder",
                roleBg: "bg-sage-pale text-sage border-sage/10",
                initials: "SK",
                gradient: "from-sage-light to-sage",
                bio: "Visionary founder passionate about scaling health solutions and building secure, mother-centric technologies.",
                linkedin: "https://www.linkedin.com/in/sukratkaushik/",
                image: "/sukrat.jpg"
              },
              {
                name: "Lakshay Trehan",
                role: "Co-Founder",
                roleBg: "bg-blush-pale text-blush border-blush/20",
                initials: "LT",
                gradient: "from-blush-light to-blush",
                bio: "Engineering lead focused on offline-first architectures, privacy, and seamless user experiences.",
                linkedin: "https://www.linkedin.com/in/lakshaytrehan",
                image: "/lakshay.jpg"
              },
              {
                name: "Vaishali Kaushik",
                role: "CMO & COO",
                roleBg: "bg-gold-pale text-gold border-gold/10",
                initials: "VK",
                gradient: "from-gold-pale to-gold",
                bio: "Growth and marketing specialist dedicated to building supportive maternal communities across India.",
                linkedin: null,
                image: "/vaishali.png"
              }
            ].map((member, i) => (
              <div key={i} className="premium-card p-8 flex flex-col items-center text-center relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sage/5 rounded-full filter blur-[40px] -z-0"></div>

                {/* Profile Photo Avatar */}
                <div className={`w-32 h-32 rounded-full bg-gradient-to-tr ${member.gradient} flex items-center justify-center text-charcoal font-serif text-[32px] font-bold shadow-[0_8px_24px_rgba(0,0,0,0.06)] group-hover:scale-105 group-hover:shadow-[0_12px_32px_rgba(138,182,163,0.25)] transition-all duration-300 relative z-10 mb-6 border-[3px] border-white overflow-hidden`}>
                  {member.image ? (
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    member.initials
                  )}
                </div>

                <h3 className="font-serif text-[24px] font-bold text-charcoal mb-1 relative z-10">{member.name}</h3>

                <span className={`text-[12px] font-bold tracking-[1px] uppercase px-3 py-1 rounded-full border ${member.roleBg} mb-4 relative z-10`}>
                  {member.role}
                </span>

                <p className="text-[14.5px] text-medium leading-relaxed mb-6 flex-grow relative z-10">
                  {member.bio}
                </p>

                {member.linkedin ? (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[13px] font-semibold text-medium hover:text-[#0a66c2] transition-colors relative z-10 group/link mt-auto"
                  >
                    <Linkedin size={16} className="transition-transform group-hover/link:-translate-y-0.5" />
                    <span>Connect on LinkedIn</span>
                  </a>
                ) : (
                  <div className="h-6 mt-auto"></div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section Divider */}
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-center py-6">
          <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="mx-4 text-sage/40 text-[10px] tracking-[4px] uppercase font-bold">Philosophy</span>
          <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Section 4: Design Philosophy & Creative Text */}
        <section className="bg-white border border-border rounded-[32px] p-8 md:p-12 shadow-sm relative overflow-hidden mb-16">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sage-pale/50 rounded-full filter blur-[100px] -z-10" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <h3 className="font-serif text-[28px] md:text-[36px] text-charcoal mb-4">Building with Compassion and Code</h3>
              <p className="text-medium text-[16px] leading-relaxed mb-6">
                At the intersection of health, pregnancy, and technology lies a crucial need for clarity. We believe complex biometrics don’t have to feel overwhelming. That’s why we design clean interface spaces, subtle animations, and highly structured checklists to keep anxiety at bay.
              </p>
              <p className="text-medium text-[16px] leading-relaxed mb-8">
                Every detail in Our Pregnancy is thoroughly planned—from our preeclampsia alert algorithms down to the visual size updates of our baby womb widget. By keeping the core features open and entirely free, we hope to build a more equitable maternal health system across India.
              </p>

              <div className="flex flex-wrap gap-x-8 gap-y-4">
                <div>
                  <div className="text-[32px] font-serif font-bold text-sage">100%</div>
                  <div className="text-[13px] text-medium font-bold uppercase tracking-wider">Privacy & Security</div>
                </div>
                <div className="border-r border-border hidden sm:block" />
                <div>
                  <div className="text-[32px] font-serif font-bold text-blush">Local</div>
                  <div className="text-[13px] text-medium font-bold uppercase tracking-wider">Indian Context</div>
                </div>
                <div className="border-r border-border hidden sm:block" />
                <div>
                  <div className="text-[32px] font-serif font-bold text-gold">Free</div>
                  <div className="text-[13px] text-medium font-bold uppercase tracking-wider">Core Diagnostics</div>
                </div>
              </div>
            </div>

            {/* Right Graphic Column */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="relative w-72 h-72 flex items-center justify-center">
                {/* Glowing Ambient Background */}
                <div className="absolute inset-0 bg-sage-pale/40 dark:bg-sage-pale/10 rounded-full filter blur-[40px] animate-pulse" style={{ animationDuration: '4s' }} />

                {/* Outer Rotating Dotted Circle (representing code/structure) */}
                <div className="absolute w-64 h-64 border-2 border-dashed border-sage/40 rounded-full animate-[spin_40s_linear_infinite]" />

                {/* Middle Rotating Dash Circle (representing compassion/flow) */}
                <div className="absolute w-52 h-52 border-2 border-dotted border-blush/60 rounded-full animate-[spin_25s_linear_infinite_reverse]" />

                {/* Inner Glowing Core */}
                <div className="relative w-36 h-36 bg-gradient-to-tr from-sage-pale to-white dark:from-sage-pale/20 dark:to-charcoal border border-white/60 dark:border-border/30 rounded-full shadow-[0_8px_32px_rgba(138,182,163,0.15)] flex flex-col items-center justify-center p-4 transition-all duration-300 hover:scale-105">
                  <img src="/logo.png" alt="Our Pregnancy Logo" className="w-12 h-12 object-contain animate-pulse mb-1" style={{ animationDuration: '1.5s' }} />
                  <span className="text-[11px] font-bold text-sage uppercase tracking-[1px] text-center">Our Pregnancy</span>
                  <div className="w-1.5 h-1.5 bg-gold rounded-full absolute bottom-4 animate-ping" />
                </div>

                {/* Floating Orbiting Accents */}
                <div className="absolute top-4 left-4 w-10 h-10 bg-white dark:bg-charcoal border border-border/80 dark:border-border/20 rounded-xl flex items-center justify-center shadow-sm animate-bounce" style={{ animationDuration: '3.5s' }}>
                  <Shield className="w-5 h-5 text-sage" />
                </div>

                <div className="absolute bottom-6 right-6 w-10 h-10 bg-white dark:bg-charcoal border border-border/80 dark:border-border/20 rounded-xl flex items-center justify-center shadow-sm animate-bounce" style={{ animationDuration: '4.5s' }}>
                  <Sparkles className="w-5 h-5 text-gold" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA to Main Page */}
        <section className="text-center pt-8">
          <a href="#" className="inline-flex items-center gap-2 bg-sage hover:bg-sage-dark text-white rounded-full font-bold px-8 py-4 shadow-lg transition-all hover:-translate-y-0.5">
            Start Your Journey Now <Sparkles size={18} />
          </a>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-charcoal text-white px-6 py-12 text-center md:text-left">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-light/20 pb-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
              <img src="/logo.png" alt="Our Pregnancy Logo" className="w-8 h-8 object-contain" />
              <span className="font-serif text-[24px] font-semibold text-sage tracking-wide notranslate">Our Pregnancy</span>
            </div>
            <p className="text-[14px] text-light">Made with ❤️ for Indian mothers</p>
          </div>

          <div className="flex flex-col md:flex-row md:justify-end gap-4 md:gap-8 text-[14px] text-light">
            <a href="#" className="hover:text-white transition-colors">Home</a>
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="mailto:hello@ourpregnancy.in" onClick={(e) => handleEmailClick("hello@ourpregnancy.in", e)} className="hover:text-white transition-colors">hello@ourpregnancy.in</a>
          </div>
        </div>

        <div className="flex justify-center items-center gap-2 text-[13px] text-light/70">
          <Lock className="w-4 h-4" />
          Your data is encrypted and only accessible by you.
        </div>
      </footer>

      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-[100] bg-charcoal text-white px-5 py-3 rounded-[12px] shadow-lg flex items-center gap-2 text-sm font-semibold animate-in slide-in-from-bottom-5 duration-300 border border-light/20">
          <span>📋</span> {toastMessage}
        </div>
      )}
    </div>
  );
};
