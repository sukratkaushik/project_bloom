import React, { useState, useEffect } from 'react';
import { usePlanner } from '../../store';
import { 
  FileText, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  User,
  Compass,
  HeartPulse,
  Activity,
  Baby,
  ClipboardList,
  Check,
  Eye
} from 'lucide-react';
import { BirthPlan } from '../../types';

/* ─── Sub-components defined OUTSIDE to prevent re-mount on every keystroke ─── */

const Section = ({ 
  title, subtitle, num, icon: Icon, children, activeSection, setActiveSection
}: { 
  title: string; subtitle: string; num: number;
  icon: React.ComponentType<any>; children: React.ReactNode;
  activeSection: number; setActiveSection: (n: number) => void;
}) => {
  const isActive = activeSection === num;
  return (
    <div 
      className={`transition-all duration-300 rounded-[16px] mb-3 overflow-hidden border bg-white
        ${isActive 
          ? 'border-sage/60 shadow-[0_8px_30px_rgba(138,182,163,0.06)]' 
          : 'border-border/60 hover:border-sage-light hover:shadow-[0_4px_20px_rgba(44,62,80,0.02)]'}`}
    >
      <button 
        onClick={() => setActiveSection(isActive ? 0 : num)}
        className="w-full flex items-center justify-between p-4 md:p-5 text-left transition-colors cursor-pointer bg-transparent border-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center transition-all duration-300 shrink-0
            ${isActive 
              ? 'bg-gradient-to-br from-sage to-sage-dark text-white shadow-sm shadow-sage/20' 
              : 'bg-sage-pale/40 text-sage-dark dark:bg-sage/10 dark:text-sage'}`}
          >
            <Icon className="w-[18px] h-[18px]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-[1px] text-sage-dark/70">Step {num}</span>
              <span className="w-1 h-1 rounded-full bg-border hidden sm:block" />
              <h3 className="font-serif text-[16px] md:text-[17px] font-semibold text-charcoal truncate">{title}</h3>
            </div>
            <p className="text-[12.5px] text-medium font-sans leading-normal mt-0.5 truncate">{subtitle}</p>
          </div>
        </div>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ml-2
          ${isActive ? 'bg-sage-pale/45 text-sage-dark' : 'bg-transparent text-light'}`}
        >
          {isActive ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      {isActive && (
        <div className="px-4 pb-5 md:px-6 md:pb-6 border-t border-border/50 bg-white/50 pt-5 animate-in slide-in-from-top-4 duration-300">
          {children}
        </div>
      )}
    </div>
  );
};

const CheckboxGroup = ({ options, fieldKey, plan, onToggle }: { 
  options: string[]; fieldKey: keyof BirthPlan;
  plan: BirthPlan; onToggle: (key: keyof BirthPlan, value: string) => void;
}) => (
  <div className="flex flex-wrap gap-2 mt-2 mb-4">
    {options.map(opt => {
      const isChecked = ((plan[fieldKey] as string[]) || []).includes(opt);
      return (
        <button 
          key={opt}
          onClick={() => onToggle(fieldKey, opt)}
          className={`inline-flex items-center gap-2 py-2 px-3.5 border-[1.5px] rounded-full text-[13px] transition-all select-none cursor-pointer
            ${isChecked 
              ? 'border-sage bg-sage-pale/40 text-sage-dark font-semibold' 
              : 'border-border/80 bg-white text-charcoal/70 hover:border-sage-light hover:bg-sage-pale/10'}`}
        >
          <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-all
            ${isChecked ? 'bg-sage border-sage text-white' : 'border-light/50 bg-white'}`}
          >
            {isChecked && <Check className="w-3 h-3 stroke-[3px]" />}
          </div>
          <span>{opt}</span>
        </button>
      )
    })}
  </div>
);

const RadioGroup = ({ options, fieldKey, plan, onUpdate }: { 
  options: string[]; fieldKey: keyof BirthPlan;
  plan: BirthPlan; onUpdate: (key: keyof BirthPlan, value: any) => void;
}) => (
  <div className="flex flex-wrap gap-2 mt-2 mb-4">
    {options.map(opt => {
      const isChecked = plan[fieldKey] === opt;
      return (
        <button 
          key={opt}
          onClick={() => onUpdate(fieldKey, opt)}
          className={`inline-flex items-center gap-2 py-2 px-3.5 border-[1.5px] rounded-full text-[13px] transition-all select-none cursor-pointer
            ${isChecked 
              ? 'border-sage bg-sage-pale/40 text-sage-dark font-semibold' 
              : 'border-border/80 bg-white text-charcoal/70 hover:border-sage-light hover:bg-sage-pale/10'}`}
        >
          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all
            ${isChecked ? 'border-sage bg-white' : 'border-light/50 bg-white'}`}
          >
            {isChecked && <div className="w-2 h-2 rounded-full bg-sage" />}
          </div>
          <span>{opt}</span>
        </button>
      )
    })}
  </div>
);

const PreviewPanel: React.FC<{
  plan: BirthPlan; state: any;
  formatDate: (ds: string | null) => string;
}> = ({ plan, state, formatDate }) => (
  <div className="bg-white border-[1.5px] border-border/70 rounded-[20px] shadow-sm p-6 md:p-8 print:border-none print:shadow-none print:p-0 print:rounded-none">
    
    <div className="flex flex-col items-center justify-center mb-5 text-sage/80">
      <svg className="w-7 h-7 opacity-75 mb-1 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M12 3c-3 3-4 6-4 10s2 5 4 8c2-3 4-4 4-8s-1-7-4-10z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10c-2.5.5-3.5 2-3.5 4s1.5 3 3.5 3M16 10c2.5.5 3.5 2 3.5 4s-1.5 3-3.5 3" />
      </svg>
      <div className="text-[9px] tracking-[3px] font-bold uppercase text-sage-dark/90">OUR PREGNANCY</div>
      <div className="w-8 h-[1.5px] bg-sage/30 mt-1"></div>
    </div>

    <div className="border-b border-border/80 pb-4 mb-4 text-center">
      <h2 className="font-serif text-2xl md:text-3xl text-charcoal font-semibold tracking-wide mb-1">Birth Plan</h2>
      <p className="text-[12px] text-medium font-sans italic">A personal guide for labor, delivery, and postpartum care</p>
    </div>

    <div className="grid grid-cols-2 gap-x-4 gap-y-2 border border-border/60 bg-cream/35 rounded-[12px] p-3.5 mb-5">
      <div className="text-[12.5px] font-sans">
        <span className="font-bold text-light uppercase text-[9px] tracking-[0.5px] block mb-0.5">Mother</span> 
        <span className="text-charcoal font-medium">{plan.personalDetails?.name || '[Your Name]'}</span>
      </div>
      <div className="text-[12.5px] font-sans">
        <span className="font-bold text-light uppercase text-[9px] tracking-[0.5px] block mb-0.5">Due Date</span> 
        <span className="text-charcoal font-medium">{formatDate(state.dueDate) || 'TBA'}</span>
      </div>
      <div className="text-[12.5px] font-sans">
        <span className="font-bold text-light uppercase text-[9px] tracking-[0.5px] block mb-0.5">Hospital / Centre</span> 
        <span className="text-charcoal font-medium">{plan.personalDetails?.hospital || 'TBA'}</span>
      </div>
      <div className="text-[12.5px] font-sans">
        <span className="font-bold text-light uppercase text-[9px] tracking-[0.5px] block mb-0.5">Care Provider</span> 
        <span className="text-charcoal font-medium">{plan.personalDetails?.doctor || 'TBA'}</span>
      </div>
      <div className="text-[12.5px] font-sans col-span-2">
        <span className="font-bold text-light uppercase text-[9px] tracking-[0.5px] block mb-0.5">Birth Partner</span> 
        <span className="text-charcoal font-medium">{plan.personalDetails?.partnerName || 'TBA'}</span>
      </div>
    </div>

    <div className="space-y-5 text-[13px] leading-relaxed">
      {((plan.environment && plan.environment.length > 0) || (plan.atmosphere && plan.atmosphere.length > 0) || (plan.movement && plan.movement.length > 0) || (plan.present && plan.present.length > 0) || plan.cultural) && (
        <div className="print-avoid-break">
          <h3 className="font-serif font-bold text-sage-dark uppercase tracking-wide text-[11px] mb-2 border-b border-border pb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sage" />Environment &amp; Labour
          </h3>
          <ul className="space-y-1 mt-2 pl-1">
            {plan.environment?.map(item => <li key={item} className="flex items-start gap-2"><span className="text-sage text-[13px]">✓</span> <span className="font-sans text-charcoal">{item}</span></li>)}
            {plan.atmosphere?.map(item => <li key={item} className="flex items-start gap-2"><span className="text-sage text-[13px]">✓</span> <span className="font-sans text-charcoal">{item}</span></li>)}
            {plan.movement?.map(item => <li key={item} className="flex items-start gap-2"><span className="text-sage text-[13px]">✓</span> <span className="font-sans text-charcoal">{item}</span></li>)}
            {plan.present?.map(item => <li key={item} className="flex items-start gap-2"><span className="text-sage text-[13px]">✓</span> <span className="font-sans text-charcoal">{item}</span></li>)}
            {plan.cultural && <li className="flex items-start gap-2"><span className="text-sage text-[13px]">✓</span> <span className="font-sans text-charcoal"><strong>Customs:</strong> {plan.cultural}</span></li>}
          </ul>
        </div>
      )}

      {((plan.painRelief && plan.painRelief.length > 0) || plan.painReliefNotes) && (
        <div className="print-avoid-break">
          <h3 className="font-serif font-bold text-sage-dark uppercase tracking-wide text-[11px] mb-2 border-b border-border pb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sage" />Pain Management
          </h3>
          <ul className="space-y-1 mt-2 pl-1">
            {plan.painRelief?.map(item => <li key={item} className="flex items-start gap-2"><span className="text-sage text-[13px]">✓</span> <span className="font-sans text-charcoal">{item}</span></li>)}
            {plan.painReliefNotes && <li className="flex items-start gap-2"><span className="text-sage text-[13px]">✓</span> <span className="font-sans text-charcoal"><strong>Instruction:</strong> {plan.painReliefNotes}</span></li>}
          </ul>
        </div>
      )}

      {(plan.pushing || plan.episiotomy || (plan.cSection && plan.cSection.length > 0) || plan.studentObservation) && (
        <div className="print-avoid-break">
          <h3 className="font-serif font-bold text-sage-dark uppercase tracking-wide text-[11px] mb-2 border-b border-border pb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sage" />Delivery Preferences
          </h3>
          <ul className="space-y-1 mt-2 pl-1">
            {plan.pushing && <li className="flex items-start gap-2"><span className="text-sage text-[13px]">✓</span> <span className="font-sans text-charcoal"><strong>Pushing:</strong> {plan.pushing}</span></li>}
            {plan.episiotomy && <li className="flex items-start gap-2"><span className="text-sage text-[13px]">✓</span> <span className="font-sans text-charcoal"><strong>Episiotomy:</strong> {plan.episiotomy}</span></li>}
            {plan.cSection && plan.cSection.length > 0 && <li className="flex items-start gap-2"><span className="text-sage text-[13px]">✓</span> <span className="font-sans text-charcoal"><strong>If C-Section:</strong> {plan.cSection.join(', ')}</span></li>}
            {plan.studentObservation && <li className="flex items-start gap-2"><span className="text-sage text-[13px]">✓</span> <span className="font-sans text-charcoal"><strong>Observation:</strong> {plan.studentObservation}</span></li>}
          </ul>
        </div>
      )}

      {(plan.cordClamping || plan.skinToSkin || plan.placenta || plan.feeding || plan.postnatalCustoms) && (
        <div className="print-avoid-break">
          <h3 className="font-serif font-bold text-sage-dark uppercase tracking-wide text-[11px] mb-2 border-b border-border pb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sage" />Immediately After Birth
          </h3>
          <ul className="space-y-1 mt-2 pl-1">
            {plan.skinToSkin && <li className="flex items-start gap-2"><span className="text-sage text-[13px]">✓</span> <span className="font-sans text-charcoal"><strong>Skin-to-Skin:</strong> {plan.skinToSkin}</span></li>}
            {plan.cordClamping && <li className="flex items-start gap-2"><span className="text-sage text-[13px]">✓</span> <span className="font-sans text-charcoal"><strong>Cord Clamping:</strong> {plan.cordClamping}</span></li>}
            {plan.feeding && <li className="flex items-start gap-2"><span className="text-sage text-[13px]">✓</span> <span className="font-sans text-charcoal"><strong>Feeding:</strong> {plan.feeding}</span></li>}
            {plan.placenta && <li className="flex items-start gap-2"><span className="text-sage text-[13px]">✓</span> <span className="font-sans text-charcoal"><strong>Placenta:</strong> {plan.placenta}</span></li>}
            {plan.postnatalCustoms && <li className="flex items-start gap-2"><span className="text-sage text-[13px]">✓</span> <span className="font-sans text-charcoal"><strong>Postnatal:</strong> {plan.postnatalCustoms}</span></li>}
          </ul>
        </div>
      )}

      {(plan.vitaminK || plan.newbornScreening || plan.visitors || plan.otherPreferences) && (
        <div className="print-avoid-break">
          <h3 className="font-serif font-bold text-sage-dark uppercase tracking-wide text-[11px] mb-2 border-b border-border pb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sage" />Newborn Care
          </h3>
          <ul className="space-y-1 mt-2 pl-1">
            {plan.vitaminK && <li className="flex items-start gap-2"><span className="text-sage text-[13px]">✓</span> <span className="font-sans text-charcoal"><strong>Vitamin K:</strong> {plan.vitaminK}</span></li>}
            {plan.newbornScreening && <li className="flex items-start gap-2"><span className="text-sage text-[13px]">✓</span> <span className="font-sans text-charcoal"><strong>Screenings:</strong> {plan.newbornScreening}</span></li>}
            {plan.visitors && <li className="flex items-start gap-2"><span className="text-sage text-[13px]">✓</span> <span className="font-sans text-charcoal"><strong>Visitors:</strong> {plan.visitors}</span></li>}
            {plan.otherPreferences && <li className="flex items-start gap-2"><span className="text-sage text-[13px]">✓</span> <span className="font-sans text-charcoal"><strong>Notes:</strong> {plan.otherPreferences}</span></li>}
          </ul>
        </div>
      )}
    </div>

    <div className="mt-8 pt-5 border-t border-border/80 space-y-4 print:mt-10">
      <p className="text-[11px] text-medium font-medium leading-relaxed italic text-center">
        We share this birth plan to convey our preferences. We understand that medical circumstances may require changes, which we will discuss with our care providers.
      </p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-2">
        <div className="space-y-1">
          <div className="h-px bg-border/80 w-full mt-6" />
          <span className="text-[9px] font-bold uppercase tracking-[0.5px] text-light block text-center">Patient Signature</span>
        </div>
        <div className="space-y-1">
          <div className="h-px bg-border/80 w-full mt-6" />
          <span className="text-[9px] font-bold uppercase tracking-[0.5px] text-light block text-center">Partner Signature</span>
        </div>
        <div className="space-y-1 col-span-2">
          <div className="h-px bg-border/80 w-full mt-6" />
          <span className="text-[9px] font-bold uppercase tracking-[0.5px] text-light block text-center">Care Provider Signature (Doctor/Midwife)</span>
        </div>
      </div>
    </div>

    <div className="mt-6 text-center text-[10px] text-light border-t border-border/50 pt-3 print:mt-12 print:border-t-2">
      Created with care on Our Pregnancy Planner
    </div>
  </div>
);

/* ─── Main Component ─── */

export const BirthPlanBuilder: React.FC = () => {
  const { state, updateState } = usePlanner();
  const [showPreview, setShowPreview] = useState(false);
  
  const [plan, setPlan] = useState<BirthPlan>(() => {
    if (state.birthPlan && Object.keys(state.birthPlan).length > 0) {
      return state.birthPlan;
    }
    return {
      personalDetails: { name: '', hospital: '', doctor: '' },
      environment: state.decisions['birthSetting'] ? [state.decisions['birthSetting']] : [],
      painRelief: state.decisions['painRelief'] ? [state.decisions['painRelief']] : [],
      feeding: state.decisions['feedingMethod'] || '',
      cordClamping: state.decisions['cordClamping'] || '',
      skinToSkin: state.decisions['skinToSkin'] || '',
    };
  });

  const [activeSection, setActiveSection] = useState<number>(1);

  useEffect(() => {
    updateState({ birthPlan: plan });
  }, [plan]);

  const toggleArrayItem = (key: keyof BirthPlan, value: string) => {
    setPlan(prev => {
      const current = (prev[key] as string[]) || [];
      const updated = current.includes(value) 
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const updateField = (key: keyof BirthPlan, value: any) => {
    setPlan(prev => ({ ...prev, [key]: value }));
  };

  const updatePersonal = (field: string, value: string) => {
    setPlan(prev => ({
      ...prev,
      personalDetails: { ...(prev.personalDetails || {}), [field]: value }
    }));
  };

  const formatDate = (ds: string | null) => {
    if (!ds) return '';
    const d = new Date(ds);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className="animate-in fade-in duration-300 max-w-[800px]">
      {/* Header */}
      <div className="no-print mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-sage" />
              <h1 className="font-serif text-[28px] md:text-[32px] font-semibold text-charcoal">Birth Plan Builder</h1>
            </div>
            <p className="text-[13.5px] text-medium font-sans leading-relaxed max-w-[550px]">
              Document your labor preferences, environment, pain management, and newborn care wishes. Your plan saves automatically and can be printed for your medical team.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-semibold transition-all cursor-pointer
                ${showPreview 
                  ? 'bg-sage-pale border border-sage text-sage-dark' 
                  : 'bg-white border border-border text-medium hover:border-sage-light'}`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2.5 bg-sage text-white rounded-full text-[13px] font-semibold hover:bg-sage-dark transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {!state.isCalmModeActive && (
          <div className="bg-sage-pale/50 border-l-[3px] border-sage rounded-r-[10px] p-3 text-[12.5px] text-medium mt-4 leading-[1.65]">
            <strong className="text-charcoal">Remember:</strong> These are preferences, not contracts. Many can — and will — evolve as your pregnancy progresses. The goal is to think them through in advance, not lock them in.
          </div>
        )}
      </div>

      {showPreview && (
        <div className="no-print mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <PreviewPanel plan={plan} state={state} formatDate={formatDate} />
        </div>
      )}

      {/* Wizard Sections */}
      <div className="no-print space-y-3">
        <Section title="Personal Details" subtitle="Your name, hospital, care providers, and birth partner" num={1} icon={User} activeSection={activeSection} setActiveSection={setActiveSection}>
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[1px] text-light mb-1.5 block">Full Name</label>
              <input type="text" value={plan.personalDetails?.name || ''} onChange={e => updatePersonal('name', e.target.value)} className="w-full p-3 border border-border/80 rounded-[12px] bg-white text-charcoal focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/10 transition-all font-sans text-[14px]" placeholder="Your name" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[1px] text-light mb-1.5 block">Hospital / Centre</label>
                <input type="text" value={plan.personalDetails?.hospital || ''} onChange={e => updatePersonal('hospital', e.target.value)} className="w-full p-3 border border-border/80 rounded-[12px] bg-white text-charcoal focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/10 transition-all font-sans text-[14px]" placeholder="e.g. City General Hospital" />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[1px] text-light mb-1.5 block">Due Date</label>
                <input type="text" value={formatDate(state.dueDate)} readOnly className="w-full p-3 border border-border/80 rounded-[12px] bg-sage-pale/15 text-medium cursor-not-allowed font-sans text-[14px]" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[1px] text-light mb-1.5 block">Doctor / Midwife</label>
                <input type="text" value={plan.personalDetails?.doctor || ''} onChange={e => updatePersonal('doctor', e.target.value)} className="w-full p-3 border border-border/80 rounded-[12px] bg-white text-charcoal focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/10 transition-all font-sans text-[14px]" placeholder="e.g. Dr. Sarah Jenkins" />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[1px] text-light mb-1.5 block">Birth Partner(s)</label>
                <input type="text" value={plan.personalDetails?.partnerName || ''} onChange={e => updatePersonal('partnerName', e.target.value)} className="w-full p-3 border border-border/80 rounded-[12px] bg-white text-charcoal focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/10 transition-all font-sans text-[14px]" placeholder="e.g. Marcus (Husband)" />
              </div>
            </div>
          </div>
        </Section>

        <Section title="Labour Preferences" subtitle="Environment, atmosphere, movement, and who is present" num={2} icon={Compass} activeSection={activeSection} setActiveSection={setActiveSection}>
          <h4 className="font-serif font-semibold text-[14px] text-charcoal mt-1 mb-1">Environment</h4>
          <CheckboxGroup options={['Public hospital', 'Private hospital', 'Birth centre', 'Home birth', 'Undecided']} fieldKey="environment" plan={plan} onToggle={toggleArrayItem} />
          <h4 className="font-serif font-semibold text-[14px] text-charcoal mt-3 mb-1">Atmosphere</h4>
          <CheckboxGroup options={['Dimmed lights', 'Quiet environment', 'Music allowed', 'Own clothes']} fieldKey="atmosphere" plan={plan} onToggle={toggleArrayItem} />
          <h4 className="font-serif font-semibold text-[14px] text-charcoal mt-3 mb-1">Movement</h4>
          <CheckboxGroup options={['Free to move', 'Birthing ball', 'Water immersion']} fieldKey="movement" plan={plan} onToggle={toggleArrayItem} />
          <h4 className="font-serif font-semibold text-[14px] text-charcoal mt-3 mb-1">Who is present</h4>
          <CheckboxGroup options={['Partner only', 'Partner + doula', 'Partner + family member', 'Solo / midwife-led']} fieldKey="present" plan={plan} onToggle={toggleArrayItem} />
          <div className="mt-4">
            <label className="text-[11px] font-bold uppercase tracking-[1px] text-light mb-1.5 block">Cultural or religious customs during labour</label>
            <input type="text" value={plan.cultural || ''} onChange={e => updateField('cultural', e.target.value)} className="w-full p-3 border border-border/80 rounded-[12px] bg-white text-charcoal focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/10 transition-all font-sans text-[14px]" placeholder="e.g. Traditional prayers, birth hymns..." />
          </div>
        </Section>

        <Section title="Pain Management" subtitle="Natural relief methods, medical options, and preferences" num={3} icon={HeartPulse} activeSection={activeSection} setActiveSection={setActiveSection}>
          <CheckboxGroup options={['Epidural available', 'Gas and air (Entonox)', 'Pethidine/opioids', 'Water/hydrotherapy', 'TENS machine', 'Massage / Hypnobirthing', 'Natural / low-intervention', 'Open to all options']} fieldKey="painRelief" plan={plan} onToggle={toggleArrayItem} />
          <div className="mt-4">
            <label className="text-[11px] font-bold uppercase tracking-[1px] text-light mb-1.5 block">Special pain relief requests</label>
            <input type="text" value={plan.painReliefNotes || ''} onChange={e => updateField('painReliefNotes', e.target.value)} className="w-full p-3 border border-border/80 rounded-[12px] bg-white text-charcoal focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/10 transition-all font-sans text-[14px]" placeholder="e.g. Please do not offer unless I explicitly ask" />
          </div>
        </Section>

        <Section title="Delivery Preferences" subtitle="Pushing style, episiotomy, C-section guidelines, and observation" num={4} icon={Activity} activeSection={activeSection} setActiveSection={setActiveSection}>
          <h4 className="font-serif font-semibold text-[14px] text-charcoal mt-1 mb-1">Pushing Strategy</h4>
          <RadioGroup options={['Directed pushing', 'Spontaneous pushing', 'No preference']} fieldKey="pushing" plan={plan} onUpdate={updateField} />
          <h4 className="font-serif font-semibold text-[14px] text-charcoal mt-3 mb-1">Episiotomy</h4>
          <RadioGroup options={['Prefer to avoid/Tear naturally', 'Accept if medically necessary']} fieldKey="episiotomy" plan={plan} onUpdate={updateField} />
          <h4 className="font-serif font-semibold text-[14px] text-charcoal mt-3 mb-1">If C-Section is needed</h4>
          <CheckboxGroup options={['Partner present', 'Screen lowered if possible', 'Immediate skin-to-skin', 'Music playing']} fieldKey="cSection" plan={plan} onToggle={toggleArrayItem} />
          <h4 className="font-serif font-semibold text-[14px] text-charcoal mt-3 mb-1">Observation</h4>
          <RadioGroup options={['Consent to student doctors observing', 'Do not want student doctors', 'Please ask me before each procedure']} fieldKey="studentObservation" plan={plan} onUpdate={updateField} />
        </Section>

        <Section title="After Birth" subtitle="Cord clamping, skin-to-skin, placenta, and feeding" num={5} icon={Baby} activeSection={activeSection} setActiveSection={setActiveSection}>
          <h4 className="font-serif font-semibold text-[14px] text-charcoal mt-1 mb-0.5">Cord Clamping</h4>
          <p className="text-[12px] text-medium mb-1 leading-snug">Delayed cord clamping (1–3 min) allows more blood to transfer to baby and is widely recommended.</p>
          <RadioGroup options={['Delayed clamping (preferred)', 'Immediate clamping', 'Partner to cut cord', 'Care team decides']} fieldKey="cordClamping" plan={plan} onUpdate={updateField} />
          <h4 className="font-serif font-semibold text-[14px] text-charcoal mt-3 mb-0.5">Skin-to-Skin Contact</h4>
          <p className="text-[12px] text-medium mb-1 leading-snug">Immediate skin-to-skin supports bonding, temperature regulation, and breastfeeding.</p>
          <RadioGroup options={['Immediate with birthing parent', 'With partner if I cannot', 'When medically ready', 'Happy with care team guidance']} fieldKey="skinToSkin" plan={plan} onUpdate={updateField} />
          <h4 className="font-serif font-semibold text-[14px] text-charcoal mt-3 mb-1">Placenta</h4>
          <RadioGroup options={['Hospital can dispose of it', 'Would like to see it first', 'Keep for burial per customs']} fieldKey="placenta" plan={plan} onUpdate={updateField} />
          <h4 className="font-serif font-semibold text-[14px] text-charcoal mt-3 mb-1">Feeding Method</h4>
          <RadioGroup options={['Breastfeeding (exclusive)', 'Breastfeeding + formula top-up', 'Formula from start', 'Combination', 'See how it goes']} fieldKey="feeding" plan={plan} onUpdate={updateField} />
          <div className="mt-4">
            <label className="text-[11px] font-bold uppercase tracking-[1px] text-light mb-1.5 block">Postnatal Customs/Diet</label>
            <input type="text" value={plan.postnatalCustoms || ''} onChange={e => updateField('postnatalCustoms', e.target.value)} className="w-full p-3 border border-border/80 rounded-[12px] bg-white text-charcoal focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/10 transition-all font-sans text-[14px]" placeholder="e.g. Warm water diet, postpartum soup preferences..." />
          </div>
        </Section>

        <Section title="Newborn Care" subtitle="Vitamin K, routine screenings, and hospital visitors" num={6} icon={ClipboardList} activeSection={activeSection} setActiveSection={setActiveSection}>
          <h4 className="font-serif font-semibold text-[14px] text-charcoal mt-1 mb-1">Vitamin K</h4>
          <RadioGroup options={['Injection', 'Oral drops', 'Will discuss with paediatrician']} fieldKey="vitaminK" plan={plan} onUpdate={updateField} />
          <h4 className="font-serif font-semibold text-[14px] text-charcoal mt-3 mb-1">Newborn Screening (Heel Prick)</h4>
          <RadioGroup options={['Accept all routine screenings', 'Will discuss each one first']} fieldKey="newbornScreening" plan={plan} onUpdate={updateField} />
          <h4 className="font-serif font-semibold text-[14px] text-charcoal mt-3 mb-1">Visitors in Hospital</h4>
          <RadioGroup options={['Immediate family only', 'No visitors for first 24 hours', 'Open entirely']} fieldKey="visitors" plan={plan} onUpdate={updateField} />
          <div className="mt-4">
            <label className="text-[11px] font-bold uppercase tracking-[1px] text-light mb-1.5 block">Other personal/cultural preferences</label>
            <textarea value={plan.otherPreferences || ''} onChange={e => updateField('otherPreferences', e.target.value)} className="w-full p-3 border border-border/80 rounded-[12px] bg-white text-charcoal focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/10 transition-all font-sans text-[14px] h-24 resize-y" placeholder="Any additional instructions or preferences for your labor team..." />
          </div>
        </Section>
      </div>

      {/* Print-Only Preview */}
      <div className="hidden print:block">
        <PreviewPanel plan={plan} state={state} formatDate={formatDate} />
      </div>
    </div>
  );
};
