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
  Check
} from 'lucide-react';
import { BirthPlan } from '../../types';

export const BirthPlanBuilder: React.FC = () => {
  const { state, updateState } = usePlanner();
  
  // Local state for the birth plan
  const [plan, setPlan] = useState<BirthPlan>(() => {
    if (state.birthPlan && Object.keys(state.birthPlan).length > 0) {
      return state.birthPlan;
    }
    
    // Pre-populate from decisions
    return {
      personalDetails: {
        name: '',
        hospital: '',
        doctor: '',
      },
      environment: state.decisions['birthSetting'] ? [state.decisions['birthSetting']] : [],
      painRelief: state.decisions['painRelief'] ? [state.decisions['painRelief']] : [],
      feeding: state.decisions['feedingMethod'] || '',
      cordClamping: state.decisions['cordClamping'] || '',
      skinToSkin: state.decisions['skinToSkin'] || '',
    };
  });

  const [activeSection, setActiveSection] = useState<number>(1);

  // Sync back to context when 'plan' changes
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
      personalDetails: {
        ...(prev.personalDetails || {}),
        [field]: value
      }
    }));
  };

  const Section = ({ 
    title, 
    subtitle, 
    num, 
    icon: Icon, 
    children 
  }: { 
    title: string;
    subtitle: string;
    num: number;
    icon: React.ComponentType<any>;
    children: React.ReactNode;
  }) => {
    const isActive = activeSection === num;
    return (
      <div 
        className={`transition-all duration-300 rounded-[20px] mb-4 overflow-hidden border bg-white
          ${isActive 
            ? 'border-sage/60 shadow-[0_8px_30px_rgba(138,182,163,0.06)]' 
            : 'border-border/60 hover:border-sage-light hover:shadow-[0_4px_20px_rgba(44,62,80,0.02)]'}`}
      >
        <button 
          onClick={() => setActiveSection(isActive ? 0 : num)}
          className="w-full flex items-center justify-between p-5 text-left transition-colors cursor-pointer bg-transparent border-none"
        >
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center transition-all duration-300 shrink-0
              ${isActive 
                ? 'bg-gradient-to-br from-sage to-sage-dark text-white shadow-sm shadow-sage/20' 
                : 'bg-sage-pale/40 text-sage-dark dark:bg-sage/10 dark:text-sage'}`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold uppercase tracking-[1px] text-sage-dark dark:text-sage">Step {num}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-border" />
                <h3 className="font-serif text-[17px] md:text-[18px] font-semibold text-charcoal">{title}</h3>
              </div>
              <p className="text-[13px] text-medium font-sans font-semibold leading-normal">{subtitle}</p>
            </div>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
            ${isActive ? 'bg-sage-pale/45 text-sage-dark' : 'bg-transparent text-light'}`}
          >
            {isActive ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>
        {isActive && (
          <div className="p-6 border-t border-border/50 bg-white/50 animate-in slide-in-from-top-4 duration-300">
            {children}
          </div>
        )}
      </div>
    );
  };

  const CheckboxGroup = ({ options, fieldKey }: { options: string[], fieldKey: keyof BirthPlan }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 mb-4">
      {options.map(opt => {
        const isChecked = ((plan[fieldKey] as string[]) || []).includes(opt);
        return (
          <button 
            key={opt}
            onClick={() => toggleArrayItem(fieldKey, opt)}
            className={`flex items-center gap-3 text-left p-3.5 rounded-[14px] border transition-all duration-300 cursor-pointer
              ${isChecked 
                ? 'bg-sage-pale/40 border-sage/60 dark:bg-sage/10 text-sage-dark font-bold' 
                : 'bg-transparent border-border/60 text-charcoal/80 hover:border-sage-light hover:bg-sage-pale/5'}`}
          >
            <div className={`w-5 h-5 rounded-[6px] border flex items-center justify-center shrink-0 transition-all duration-300
              ${isChecked 
                ? 'bg-sage border-sage text-white' 
                : 'border-light/65 bg-white'}`}
            >
              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
            </div>
            <span className="text-[13.5px] font-sans font-bold leading-snug">{opt}</span>
          </button>
        )
      })}
    </div>
  );

  const RadioGroup = ({ options, fieldKey }: { options: string[], fieldKey: keyof BirthPlan }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 mb-4">
      {options.map(opt => {
        const isChecked = plan[fieldKey] === opt;
        return (
          <button 
            key={opt}
            onClick={() => updateField(fieldKey, opt)}
            className={`flex items-center gap-3 text-left p-3.5 rounded-[14px] border transition-all duration-300 cursor-pointer
              ${isChecked 
                ? 'bg-sage-pale/40 border-sage/60 dark:bg-sage/10 text-sage-dark font-bold' 
                : 'bg-transparent border-border/60 text-charcoal/80 hover:border-sage-light hover:bg-sage-pale/5'}`}
          >
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300
              ${isChecked 
                ? 'border-sage bg-white' 
                : 'border-light/65 bg-white'}`}
            >
              {isChecked && <div className="w-2.5 h-2.5 rounded-full bg-sage animate-in zoom-in duration-200" />}
            </div>
            <span className="text-[13.5px] font-sans font-bold leading-snug">{opt}</span>
          </button>
        )
      })}
    </div>
  );

  const formatDate = (ds: string | null) => {
    if (!ds) return '';
    const d = new Date(ds);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 animate-in fade-in duration-300">
      <div className="no-print space-y-6">
        <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <FileText className="w-7 h-7 text-sage" />
              <h1 className="font-serif text-[28px] md:text-[34px] font-semibold text-charcoal">Birth Plan Builder</h1>
            </div>
            <p className="text-[14px] text-medium font-sans font-semibold leading-relaxed max-w-[600px]">
              Customize your labor preferences, environment, pain management, and newborn care to share with your medical team. Your plan saves automatically.
            </p>
          </div>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-sage text-white rounded-full text-[14px] font-bold hover:bg-sage-dark transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            Print Plan
          </button>
        </div>

        <div className="space-y-4">
          <Section 
            title="Personal Details" 
            subtitle="Your name, hospital, care providers, and birth partner" 
            num={1} 
            icon={User}
          >
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[1px] text-light mb-1.5 block">Full Name</label>
                <input 
                  type="text" 
                  value={plan.personalDetails?.name || ''} 
                  onChange={e => updatePersonal('name', e.target.value)} 
                  className="w-full p-3.5 border border-border/80 rounded-[12px] bg-white text-charcoal focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/10 transition-all font-sans font-semibold text-[14px]" 
                  placeholder="Your name" 
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[1px] text-light mb-1.5 block">Hospital / Centre</label>
                  <input 
                    type="text" 
                    value={plan.personalDetails?.hospital || ''} 
                    onChange={e => updatePersonal('hospital', e.target.value)} 
                    className="w-full p-3.5 border border-border/80 rounded-[12px] bg-white text-charcoal focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/10 transition-all font-sans font-semibold text-[14px]" 
                    placeholder="e.g. City General Hospital"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[1px] text-light mb-1.5 block">Due Date</label>
                  <input 
                    type="text" 
                    value={formatDate(state.dueDate)} 
                    readOnly 
                    className="w-full p-3.5 border border-border/80 rounded-[12px] bg-sage-pale/15 text-medium cursor-not-allowed font-sans font-semibold text-[14px]" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[1px] text-light mb-1.5 block">Doctor / Midwife</label>
                  <input 
                    type="text" 
                    value={plan.personalDetails?.doctor || ''} 
                    onChange={e => updatePersonal('doctor', e.target.value)} 
                    className="w-full p-3.5 border border-border/80 rounded-[12px] bg-white text-charcoal focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/10 transition-all font-sans font-semibold text-[14px]" 
                    placeholder="e.g. Dr. Sarah Jenkins"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[1px] text-light mb-1.5 block">Birth Partner(s)</label>
                  <input 
                    type="text" 
                    value={plan.personalDetails?.partnerName || ''} 
                    onChange={e => updatePersonal('partnerName', e.target.value)} 
                    className="w-full p-3.5 border border-border/80 rounded-[12px] bg-white text-charcoal focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/10 transition-all font-sans font-semibold text-[14px]" 
                    placeholder="e.g. Marcus (Husband)"
                  />
                </div>
              </div>
            </div>
          </Section>

          <Section 
            title="Labour Preferences" 
            subtitle="Environment, atmosphere, movement, and who is present" 
            num={2} 
            icon={Compass}
          >
            <h4 className="font-serif font-bold text-[14.5px] text-charcoal mt-2 mb-1.5">Environment</h4>
            <CheckboxGroup options={['Hospital room', 'Birth centre', 'Home birth']} fieldKey="environment" />
            
            <h4 className="font-serif font-bold text-[14.5px] text-charcoal mt-4 mb-1.5">Atmosphere</h4>
            <CheckboxGroup options={['Dimmed lights', 'Quiet environment', 'Music allowed', 'Own clothes']} fieldKey="atmosphere" />
            
            <h4 className="font-serif font-bold text-[14.5px] text-charcoal mt-4 mb-1.5">Movement</h4>
            <CheckboxGroup options={['Free to move', 'Birthing ball', 'Water immersion']} fieldKey="movement" />
            
            <h4 className="font-serif font-bold text-[14.5px] text-charcoal mt-4 mb-1.5">Who is present</h4>
            <CheckboxGroup options={['Partner', 'Mother/Mother-in-law', 'Doula', 'No visitors during active labour']} fieldKey="present" />

            <div className="mt-5">
              <label className="text-[11px] font-bold uppercase tracking-[1px] text-light mb-1.5 block">Cultural or religious customs during labour</label>
              <input 
                type="text" 
                value={plan.cultural || ''} 
                onChange={e => updateField('cultural', e.target.value)} 
                className="w-full p-3.5 border border-border/80 rounded-[12px] bg-white text-charcoal focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/10 transition-all font-sans font-semibold text-[14px]" 
                placeholder="e.g. Traditional prayers, birth hymns..." 
              />
            </div>
          </Section>

          <Section 
            title="Pain Management" 
            subtitle="Natural relief methods, medical options, and preferences" 
            num={3} 
            icon={HeartPulse}
          >
            <CheckboxGroup 
              options={['Epidural', 'Gas and air', 'Pethidine/opioids', 'Water/hydrotherapy', 'TENS machine', 'Massage', 'Hypnobirthing', 'No pain relief unless I request it']} 
              fieldKey="painRelief" 
            />
            <div className="mt-5">
              <label className="text-[11px] font-bold uppercase tracking-[1px] text-light mb-1.5 block">Special pain relief requests</label>
              <input 
                type="text" 
                value={plan.painReliefNotes || ''} 
                onChange={e => updateField('painReliefNotes', e.target.value)} 
                className="w-full p-3.5 border border-border/80 rounded-[12px] bg-white text-charcoal focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/10 transition-all font-sans font-semibold text-[14px]" 
                placeholder="e.g. Please do not offer unless I explicitly ask" 
              />
            </div>
          </Section>

          <Section 
            title="Delivery Preferences" 
            subtitle="Pushing style, episiotomy, C-section guidelines, and observation" 
            num={4} 
            icon={Activity}
          >
            <h4 className="font-serif font-bold text-[14.5px] text-charcoal mt-2 mb-1.5">Pushing Strategy</h4>
            <RadioGroup options={['Directed pushing', 'Spontaneous pushing', 'No preference']} fieldKey="pushing" />

            <h4 className="font-serif font-bold text-[14.5px] text-charcoal mt-5 mb-1.5">Episiotomy</h4>
            <RadioGroup options={['Prefer to avoid/Tear naturally', 'Accept if medically necessary']} fieldKey="episiotomy" />

            <h4 className="font-serif font-bold text-[14.5px] text-charcoal mt-5 mb-1.5">If C-Section is needed</h4>
            <CheckboxGroup options={['Partner present', 'Screen lowered if possible', 'Immediate skin-to-skin', 'Music playing']} fieldKey="cSection" />

            <h4 className="font-serif font-bold text-[14.5px] text-charcoal mt-5 mb-1.5">Observation</h4>
            <RadioGroup options={['Consent to student doctors observing', 'Do not want student doctors', 'Please ask me before each procedure']} fieldKey="studentObservation" />
          </Section>

          <Section 
            title="After Birth" 
            subtitle="Cord clamping, immediate skin-to-skin, placenta, and feeding" 
            num={5} 
            icon={Baby}
          >
            <h4 className="font-serif font-bold text-[14.5px] text-charcoal mt-2 mb-1.5">Cord Clamping</h4>
            <RadioGroup options={['Immediate', 'Delayed (≥1 minute)', 'Until cord stops pulsing']} fieldKey="cordClamping" />

            <h4 className="font-serif font-bold text-[14.5px] text-charcoal mt-5 mb-1.5">Skin-to-Skin Contact</h4>
            <RadioGroup options={['Immediate', 'After baby is cleaned and weighed', 'No preference']} fieldKey="skinToSkin" />

            <h4 className="font-serif font-bold text-[14.5px] text-charcoal mt-5 mb-1.5">Placenta</h4>
            <RadioGroup options={['Hospital can dispose of it', 'Would like to see it first', 'Keep for burial per customs']} fieldKey="placenta" />

            <h4 className="font-serif font-bold text-[14.5px] text-charcoal mt-5 mb-1.5">Feeding Method</h4>
            <RadioGroup options={['Breastfeeding exclusively', 'Formula exclusively', 'Combination/Both', 'Undecided']} fieldKey="feeding" />

            <div className="mt-5">
              <label className="text-[11px] font-bold uppercase tracking-[1px] text-light mb-1.5 block">Postnatal Customs/Diet</label>
              <input 
                type="text" 
                value={plan.postnatalCustoms || ''} 
                onChange={e => updateField('postnatalCustoms', e.target.value)} 
                className="w-full p-3.5 border border-border/80 rounded-[12px] bg-white text-charcoal focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/10 transition-all font-sans font-semibold text-[14px]" 
                placeholder="e.g. Warm water diet, postpartum soup preferences..." 
              />
            </div>
          </Section>

          <Section 
            title="Newborn Care" 
            subtitle="Vitamin K, routine screenings, and hospital visitors" 
            num={6} 
            icon={ClipboardList}
          >
            <h4 className="font-serif font-bold text-[14.5px] text-charcoal mt-2 mb-1.5">Vitamin K</h4>
            <RadioGroup options={['Injection', 'Oral drops', 'Will discuss with paediatrician']} fieldKey="vitaminK" />

            <h4 className="font-serif font-bold text-[14.5px] text-charcoal mt-5 mb-1.5">Newborn Screening (Heel Prick)</h4>
            <RadioGroup options={['Accept all routine screenings', 'Will discuss each one first']} fieldKey="newbornScreening" />

            <h4 className="font-serif font-bold text-[14.5px] text-charcoal mt-5 mb-1.5">Visitors in Hospital</h4>
            <RadioGroup options={['Immediate family only', 'No visitors for first 24 hours', 'Open entirely']} fieldKey="visitors" />

            <div className="mt-5">
              <label className="text-[11px] font-bold uppercase tracking-[1px] text-light mb-1.5 block">Other personal/cultural preferences</label>
              <textarea 
                value={plan.otherPreferences || ''} 
                onChange={e => updateField('otherPreferences', e.target.value)} 
                className="w-full p-3.5 border border-border/80 rounded-[12px] bg-white text-charcoal focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/10 transition-all font-sans font-semibold text-[14px] h-28" 
                placeholder="Any additional instructions or preferences for your labor team..." 
              />
            </div>
          </Section>
        </div>
      </div>

      {/* Live Preview Panel (also used for Print) */}
      <div className="print-visible xl:sticky xl:top-[80px] self-start w-full">
        <div className="bg-white border-[1.5px] border-border/70 rounded-[20px] shadow-sm p-8 print:border-none print:shadow-none print:p-0">
          
          {/* Beautiful Elegant Botanical Crest */}
          <div className="flex flex-col items-center justify-center mb-6 text-sage/80">
            <svg className="w-8 h-8 opacity-75 mb-1.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M12 3c-3 3-4 6-4 10s2 5 4 8c2-3 4-4 4-8s-1-7-4-10z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10c-2.5.5-3.5 2-3.5 4s1.5 3 3.5 3M16 10c2.5.5 3.5 2 3.5 4s-1.5 3-3.5 3" />
            </svg>
            <div className="text-[10px] tracking-[3.5px] font-bold uppercase text-sage-dark/95">OUR PREGNANCY</div>
            <div className="w-10 h-[1.5px] bg-sage/30 mt-1.5"></div>
          </div>

          <div className="border-b border-border/80 pb-5 mb-5 text-center">
            <h2 className="font-serif text-3xl text-charcoal font-semibold tracking-wide mb-1">Birth Plan</h2>
            <p className="text-[13px] text-medium font-sans font-semibold italic">A personal guide for labor, delivery, and postpartum care</p>
          </div>

          {/* Elegant Metadata Card */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 border border-border/60 bg-cream/35 rounded-[12px] p-4 mb-6">
            <div className="text-[13px] font-sans font-semibold">
              <span className="font-bold text-light uppercase text-[9.5px] tracking-[0.5px] block mb-0.5">Mother</span> 
              <span className="text-charcoal">{plan.personalDetails?.name || '[Your Name]'}</span>
            </div>
            <div className="text-[13px] font-sans font-semibold">
              <span className="font-bold text-light uppercase text-[9.5px] tracking-[0.5px] block mb-0.5">Due Date</span> 
              <span className="text-charcoal">{formatDate(state.dueDate) || 'TBA'}</span>
            </div>
            <div className="text-[13px] font-sans font-semibold">
              <span className="font-bold text-light uppercase text-[9.5px] tracking-[0.5px] block mb-0.5">Hospital / Centre</span> 
              <span className="text-charcoal">{plan.personalDetails?.hospital || 'TBA'}</span>
            </div>
            <div className="text-[13px] font-sans font-semibold">
              <span className="font-bold text-light uppercase text-[9.5px] tracking-[0.5px] block mb-0.5">Care Provider</span> 
              <span className="text-charcoal">{plan.personalDetails?.doctor || 'TBA'}</span>
            </div>
            <div className="text-[13px] font-sans font-semibold col-span-2">
              <span className="font-bold text-light uppercase text-[9.5px] tracking-[0.5px] block mb-0.5">Birth Partner</span> 
              <span className="text-charcoal">{plan.personalDetails?.partnerName || 'TBA'}</span>
            </div>
          </div>

          {/* Plan Content */}
          <div className="space-y-6 text-[13.5px] leading-relaxed">
            
            {/* Labour Environment */}
            {((plan.environment && plan.environment.length > 0) || (plan.atmosphere && plan.atmosphere.length > 0) || (plan.movement && plan.movement.length > 0) || (plan.present && plan.present.length > 0) || plan.cultural) && (
              <div className="print-avoid-break">
                <h3 className="font-serif font-bold text-sage-dark uppercase tracking-wide text-[11.5px] mb-2 border-b border-border pb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                  Environment & Labour
                </h3>
                <ul className="space-y-1.5 mt-2 pl-1">
                  {plan.environment?.map(item => <li key={item} className="flex items-start gap-2"><span className="text-sage text-[14px]">✓</span> <span className="font-sans font-semibold text-charcoal">{item}</span></li>)}
                  {plan.atmosphere?.map(item => <li key={item} className="flex items-start gap-2"><span className="text-sage text-[14px]">✓</span> <span className="font-sans font-semibold text-charcoal">{item}</span></li>)}
                  {plan.movement?.map(item => <li key={item} className="flex items-start gap-2"><span className="text-sage text-[14px]">✓</span> <span className="font-sans font-semibold text-charcoal">{item}</span></li>)}
                  {plan.present?.map(item => <li key={item} className="flex items-start gap-2"><span className="text-sage text-[14px]">✓</span> <span className="font-sans font-semibold text-charcoal">{item}</span></li>)}
                  {plan.cultural && <li className="flex items-start gap-2"><span className="text-sage text-[14px]">✓</span> <span className="font-sans font-semibold text-charcoal"><strong>Customs:</strong> {plan.cultural}</span></li>}
                </ul>
              </div>
            )}

            {/* Pain Management */}
            {((plan.painRelief && plan.painRelief.length > 0) || plan.painReliefNotes) && (
              <div className="print-avoid-break">
                <h3 className="font-serif font-bold text-sage-dark uppercase tracking-wide text-[11.5px] mb-2 border-b border-border pb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                  Pain Management
                </h3>
                <ul className="space-y-1.5 mt-2 pl-1">
                  {plan.painRelief?.map(item => <li key={item} className="flex items-start gap-2"><span className="text-sage text-[14px]">✓</span> <span className="font-sans font-semibold text-charcoal">{item}</span></li>)}
                  {plan.painReliefNotes && <li className="flex items-start gap-2"><span className="text-sage text-[14px]">✓</span> <span className="font-sans font-semibold text-charcoal"><strong>Instruction:</strong> {plan.painReliefNotes}</span></li>}
                </ul>
              </div>
            )}

            {/* Delivery */}
            {(plan.pushing || plan.episiotomy || (plan.cSection && plan.cSection.length > 0) || plan.studentObservation) && (
              <div className="print-avoid-break">
                <h3 className="font-serif font-bold text-sage-dark uppercase tracking-wide text-[11.5px] mb-2 border-b border-border pb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                  Delivery Preferences
                </h3>
                <ul className="space-y-1.5 mt-2 pl-1">
                  {plan.pushing && <li className="flex items-start gap-2"><span className="text-sage text-[14px]">✓</span> <span className="font-sans font-semibold text-charcoal"><strong>Pushing:</strong> {plan.pushing}</span></li>}
                  {plan.episiotomy && <li className="flex items-start gap-2"><span className="text-sage text-[14px]">✓</span> <span className="font-sans font-semibold text-charcoal"><strong>Episiotomy:</strong> {plan.episiotomy}</span></li>}
                  {plan.cSection && plan.cSection.length > 0 && <li className="flex items-start gap-2"><span className="text-sage text-[14px]">✓</span> <span className="font-sans font-semibold text-charcoal"><strong>If C-Section:</strong> {plan.cSection.join(', ')}</span></li>}
                  {plan.studentObservation && <li className="flex items-start gap-2"><span className="text-sage text-[14px]">✓</span> <span className="font-sans font-semibold text-charcoal"><strong>Observation:</strong> {plan.studentObservation}</span></li>}
                </ul>
              </div>
            )}

            {/* After Birth */}
            {(plan.cordClamping || plan.skinToSkin || plan.placenta || plan.feeding || plan.postnatalCustoms) && (
              <div className="print-avoid-break">
                <h3 className="font-serif font-bold text-sage-dark uppercase tracking-wide text-[11.5px] mb-2 border-b border-border pb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                  Immediately After Birth
                </h3>
                <ul className="space-y-1.5 mt-2 pl-1">
                  {plan.skinToSkin && <li className="flex items-start gap-2"><span className="text-sage text-[14px]">✓</span> <span className="font-sans font-semibold text-charcoal"><strong>Skin-to-Skin:</strong> {plan.skinToSkin}</span></li>}
                  {plan.cordClamping && <li className="flex items-start gap-2"><span className="text-sage text-[14px]">✓</span> <span className="font-sans font-semibold text-charcoal"><strong>Cord Clamping:</strong> {plan.cordClamping}</span></li>}
                  {plan.feeding && <li className="flex items-start gap-2"><span className="text-sage text-[14px]">✓</span> <span className="font-sans font-semibold text-charcoal"><strong>Feeding:</strong> {plan.feeding}</span></li>}
                  {plan.placenta && <li className="flex items-start gap-2"><span className="text-sage text-[14px]">✓</span> <span className="font-sans font-semibold text-charcoal"><strong>Placenta:</strong> {plan.placenta}</span></li>}
                  {plan.postnatalCustoms && <li className="flex items-start gap-2"><span className="text-sage text-[14px]">✓</span> <span className="font-sans font-semibold text-charcoal"><strong>Postnatal:</strong> {plan.postnatalCustoms}</span></li>}
                </ul>
              </div>
            )}

            {/* Newborn Care */}
            {(plan.vitaminK || plan.newbornScreening || plan.visitors || plan.otherPreferences) && (
              <div className="print-avoid-break">
                <h3 className="font-serif font-bold text-sage-dark uppercase tracking-wide text-[11.5px] mb-2 border-b border-border pb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                  Newborn Care
                </h3>
                <ul className="space-y-1.5 mt-2 pl-1">
                  {plan.vitaminK && <li className="flex items-start gap-2"><span className="text-sage text-[14px]">✓</span> <span className="font-sans font-semibold text-charcoal"><strong>Vitamin K:</strong> {plan.vitaminK}</span></li>}
                  {plan.newbornScreening && <li className="flex items-start gap-2"><span className="text-sage text-[14px]">✓</span> <span className="font-sans font-semibold text-charcoal"><strong>Screenings:</strong> {plan.newbornScreening}</span></li>}
                  {plan.visitors && <li className="flex items-start gap-2"><span className="text-sage text-[14px]">✓</span> <span className="font-sans font-semibold text-charcoal"><strong>Visitors:</strong> {plan.visitors}</span></li>}
                  {plan.otherPreferences && <li className="flex items-start gap-2"><span className="text-sage text-[14px]">✓</span> <span className="font-sans font-semibold text-charcoal"><strong>Notes:</strong> {plan.otherPreferences}</span></li>}
                </ul>
              </div>
            )}
          </div>

          {/* Elegant Clinic Signature Block */}
          <div className="mt-8 pt-6 border-t border-border/80 space-y-5 print:mt-10">
            <p className="text-[11.5px] text-medium font-medium leading-relaxed italic text-center">
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

          <div className="mt-8 text-center text-[10.5px] text-light border-t border-border/50 pt-3.5 print:mt-12 print:border-t-2">
            Created with care on Our Pregnancy Planner
          </div>
        </div>
      </div>

    </div>
  );
};
