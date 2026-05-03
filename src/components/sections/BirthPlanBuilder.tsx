import React, { useState, useEffect } from 'react';
import { usePlanner } from '../../store';
import { 
  FileText, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  CheckSquare, 
  Square 
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

  const Section = ({ title, num, children }: { title: string, num: number, children: React.ReactNode }) => {
    const isActive = activeSection === num;
    return (
      <div className="border border-border rounded-xl mb-4 overflow-hidden bg-white">
        <button 
          onClick={() => setActiveSection(isActive ? 0 : num)}
          className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-sage-pale/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold ${isActive ? 'bg-sage text-white' : 'bg-gray-200 text-medium'}`}>
              {num}
            </div>
            <h3 className="font-semibold text-charcoal">{title}</h3>
          </div>
          {isActive ? <ChevronUp className="w-5 h-5 text-medium" /> : <ChevronDown className="w-5 h-5 text-medium" />}
        </button>
        {isActive && (
          <div className="p-5 border-t border-border animate-in slide-in-from-top-2">
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
            className="flex items-center gap-3 text-left p-2 rounded hover:bg-gray-50 transition-colors"
          >
            {isChecked ? <CheckSquare className="w-5 h-5 text-sage shrink-0" /> : <Square className="w-5 h-5 text-border shrink-0" />}
            <span className="text-[14px] text-charcoal">{opt}</span>
          </button>
        )
      })}
    </div>
  );

  const RadioGroup = ({ options, fieldKey }: { options: string[], fieldKey: keyof BirthPlan }) => (
    <div className="flex flex-col gap-3 mt-2 mb-4">
      {options.map(opt => {
        const isChecked = plan[fieldKey] === opt;
        return (
          <button 
            key={opt}
            onClick={() => updateField(fieldKey, opt)}
            className="flex items-center gap-3 text-left p-2 rounded hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${isChecked ? 'border-sage' : 'border-border'}`}>
              {isChecked && <div className="w-2 h-2 rounded-full bg-sage" />}
            </div>
            <span className="text-[14px] text-charcoal">{opt}</span>
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
      <div className="no-print">
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-sage" />
            <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-normal text-charcoal">Birth Plan</h1>
          </div>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-sage text-white rounded-full text-[14px] font-semibold hover:bg-sage-dark transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Plan
          </button>
        </div>

        <Section title="Personal Details" num={1}>
          <div className="space-y-4">
            <div>
              <label className="text-[12px] font-semibold uppercase text-light mb-1 block">Full Name</label>
              <input type="text" value={plan.personalDetails?.name || ''} onChange={e => updatePersonal('name', e.target.value)} className="w-full p-3 border border-border rounded-lg" placeholder="Your name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-semibold uppercase text-light mb-1 block">Hospital / Centre</label>
                <input type="text" value={plan.personalDetails?.hospital || ''} onChange={e => updatePersonal('hospital', e.target.value)} className="w-full p-3 border border-border rounded-lg" />
              </div>
              <div>
                <label className="text-[12px] font-semibold uppercase text-light mb-1 block">Due Date</label>
                <input type="text" value={formatDate(state.dueDate)} readOnly className="w-full p-3 border border-border rounded-lg bg-gray-50 text-medium" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-semibold uppercase text-light mb-1 block">Doctor / Midwife</label>
                <input type="text" value={plan.personalDetails?.doctor || ''} onChange={e => updatePersonal('doctor', e.target.value)} className="w-full p-3 border border-border rounded-lg" />
              </div>
              <div>
                <label className="text-[12px] font-semibold uppercase text-light mb-1 block">Birth Partner(s)</label>
                <input type="text" value={plan.personalDetails?.partnerName || ''} onChange={e => updatePersonal('partnerName', e.target.value)} className="w-full p-3 border border-border rounded-lg" />
              </div>
            </div>
          </div>
        </Section>

        <Section title="Labour Preferences" num={2}>
          <h4 className="font-semibold text-[14px] text-charcoal mt-2 mb-1">Environment</h4>
          <CheckboxGroup options={['Hospital room', 'Birth centre', 'Home birth']} fieldKey="environment" />
          
          <h4 className="font-semibold text-[14px] text-charcoal mt-2 mb-1">Atmosphere</h4>
          <CheckboxGroup options={['Dimmed lights', 'Quiet environment', 'Music allowed', 'Own clothes']} fieldKey="atmosphere" />
          
          <h4 className="font-semibold text-[14px] text-charcoal mt-2 mb-1">Movement</h4>
          <CheckboxGroup options={['Free to move', 'Birthing ball', 'Water immersion']} fieldKey="movement" />
          
          <h4 className="font-semibold text-[14px] text-charcoal mt-2 mb-1">Who is present</h4>
          <CheckboxGroup options={['Partner', 'Mother/Mother-in-law', 'Doula', 'No visitors during active labour']} fieldKey="present" />

          <div className="mt-4">
            <label className="text-[12px] font-semibold uppercase text-light mb-1 block">Cultural or religious customs during labour</label>
            <input type="text" value={plan.cultural || ''} onChange={e => updateField('cultural', e.target.value)} className="w-full p-3 border border-border rounded-lg" placeholder="e.g. I follow..." />
          </div>
        </Section>

        <Section title="Pain Management" num={3}>
          <CheckboxGroup 
            options={['Epidural', 'Gas and air', 'Pethidine/opioids', 'Water/hydrotherapy', 'TENS machine', 'Massage', 'Hypnobirthing', 'No pain relief unless I request it']} 
            fieldKey="painRelief" 
          />
          <div className="mt-4">
            <label className="text-[12px] font-semibold uppercase text-light mb-1 block">Special pain relief requests</label>
            <input type="text" value={plan.painReliefNotes || ''} onChange={e => updateField('painReliefNotes', e.target.value)} className="w-full p-3 border border-border rounded-lg" placeholder="e.g. Please ask before offering" />
          </div>
        </Section>

        <Section title="Delivery Preferences" num={4}>
          <h4 className="font-semibold text-[14px] text-charcoal mt-2 mb-1">Pushing Strategy</h4>
          <RadioGroup options={['Directed pushing', 'Spontaneous pushing', 'No preference']} fieldKey="pushing" />

          <h4 className="font-semibold text-[14px] text-charcoal mt-6 mb-1">Episiotomy</h4>
          <RadioGroup options={['Prefer to avoid/Tear naturally', 'Accept if medically necessary']} fieldKey="episiotomy" />

          <h4 className="font-semibold text-[14px] text-charcoal mt-6 mb-1">If C-Section is needed</h4>
          <CheckboxGroup options={['Partner present', 'Screen lowered if possible', 'Immediate skin-to-skin', 'Music playing']} fieldKey="cSection" />

          <h4 className="font-semibold text-[14px] text-charcoal mt-6 mb-1">Observation</h4>
          <RadioGroup options={['Consent to student doctors observing', 'Do not want student doctors', 'Please ask me before each procedure']} fieldKey="studentObservation" />
        </Section>

        <Section title="After Birth" num={5}>
          <h4 className="font-semibold text-[14px] text-charcoal mt-2 mb-1">Cord Clamping</h4>
          <RadioGroup options={['Immediate', 'Delayed (≥1 minute)', 'Until cord stops pulsing']} fieldKey="cordClamping" />

          <h4 className="font-semibold text-[14px] text-charcoal mt-6 mb-1">Skin-to-Skin Contact</h4>
          <RadioGroup options={['Immediate', 'After baby is cleaned and weighed', 'No preference']} fieldKey="skinToSkin" />

          <h4 className="font-semibold text-[14px] text-charcoal mt-6 mb-1">Placenta</h4>
          <RadioGroup options={['Hospital can dispose of it', 'Would like to see it first', 'Keep for burial per customs']} fieldKey="placenta" />

          <h4 className="font-semibold text-[14px] text-charcoal mt-6 mb-1">Feeding Method</h4>
          <RadioGroup options={['Breastfeeding exclusively', 'Formula exclusively', 'Combination/Both', 'Undecided']} fieldKey="feeding" />

          <div className="mt-6">
            <label className="text-[12px] font-semibold uppercase text-light mb-1 block">Postnatal Customs/Diet</label>
            <input type="text" value={plan.postnatalCustoms || ''} onChange={e => updateField('postnatalCustoms', e.target.value)} className="w-full p-3 border border-border rounded-lg" placeholder="I would like to follow traditional postnatal diet..." />
          </div>
        </Section>

        <Section title="Newborn Care" num={6}>
          <h4 className="font-semibold text-[14px] text-charcoal mt-2 mb-1">Vitamin K</h4>
          <RadioGroup options={['Injection', 'Oral drops', 'Will discuss with paediatrician']} fieldKey="vitaminK" />

          <h4 className="font-semibold text-[14px] text-charcoal mt-6 mb-1">Newborn Screening (Heel Prick)</h4>
          <RadioGroup options={['Accept all routine screenings', 'Will discuss each one first']} fieldKey="newbornScreening" />

          <h4 className="font-semibold text-[14px] text-charcoal mt-6 mb-1">Visitors in Hospital</h4>
          <RadioGroup options={['Immediate family only', 'No visitors for first 24 hours', 'Open entirely']} fieldKey="visitors" />

          <div className="mt-6">
            <label className="text-[12px] font-semibold uppercase text-light mb-1 block">Other personal/cultural preferences</label>
            <textarea value={plan.otherPreferences || ''} onChange={e => updateField('otherPreferences', e.target.value)} className="w-full p-3 border border-border rounded-lg h-24" placeholder="Any additional instructions..." />
          </div>
        </Section>
      </div>

      {/* Live Preview Panel (also used for Print) */}
      <div className="print-visible xl:sticky xl:top-[80px] self-start">
        <div className="bg-white border-[1.5px] border-border rounded-none xl:rounded-[16px] shadow-sm p-8 xl:p-6 print:border-none print:shadow-none print:p-0">
          <div className="border-b border-border pb-4 mb-6">
            <h2 className="font-serif text-3xl text-charcoal mb-2">Birth Plan</h2>
            <p className="text-[16px] text-charcoal font-semibold">{plan.personalDetails?.name || '[Your Name]'}</p>
            <div className="flex gap-4 text-[13px] text-medium mt-2">
              <span>EDD: {formatDate(state.dueDate)}</span>
              <span>Hospital: {plan.personalDetails?.hospital || 'TBA'}</span>
            </div>
            <div className="flex gap-4 text-[13px] text-medium mt-1">
              <span>Doctor: {plan.personalDetails?.doctor || 'TBA'}</span>
              <span>Partner: {plan.personalDetails?.partnerName || 'TBA'}</span>
            </div>
          </div>

          <div className="space-y-6 text-[14px] leading-relaxed">
            
            {/* Labour Environment */}
            {((plan.environment && plan.environment.length > 0) || (plan.atmosphere && plan.atmosphere.length > 0) || plan.cultural) && (
              <div>
                <h3 className="font-bold text-charcoal uppercase tracking-wider text-[11px] mb-2 border-b border-gray-100 pb-1">Environment & Labour</h3>
                <ul className="list-disc pl-5 text-charcoal space-y-1 mt-2">
                  {plan.environment?.map(item => <li key={item}>{item}</li>)}
                  {plan.atmosphere?.map(item => <li key={item}>{item}</li>)}
                  {plan.movement?.map(item => <li key={item}>{item}</li>)}
                  {plan.present?.map(item => <li key={item}>{item}</li>)}
                  {plan.cultural && <li><strong>Cultural notes:</strong> {plan.cultural}</li>}
                </ul>
              </div>
            )}

            {/* Pain Management */}
            {((plan.painRelief && plan.painRelief.length > 0) || plan.painReliefNotes) && (
              <div>
                <h3 className="font-bold text-charcoal uppercase tracking-wider text-[11px] mb-2 border-b border-gray-100 pb-1">Pain Management</h3>
                <ul className="list-disc pl-5 text-charcoal space-y-1 mt-2">
                  {plan.painRelief?.map(item => <li key={item}>{item}</li>)}
                  {plan.painReliefNotes && <li><strong>Notes:</strong> {plan.painReliefNotes}</li>}
                </ul>
              </div>
            )}

            {/* Delivery */}
            {(plan.pushing || plan.episiotomy || (plan.cSection && plan.cSection.length > 0) || plan.studentObservation) && (
              <div>
                <h3 className="font-bold text-charcoal uppercase tracking-wider text-[11px] mb-2 border-b border-gray-100 pb-1">Delivery Preferences</h3>
                <ul className="list-disc pl-5 text-charcoal space-y-1 mt-2">
                  {plan.pushing && <li><strong>Pushing:</strong> {plan.pushing}</li>}
                  {plan.episiotomy && <li><strong>Episiotomy:</strong> {plan.episiotomy}</li>}
                  {plan.cSection && plan.cSection.length > 0 && <li><strong>C-Section preferences:</strong> {plan.cSection.join(', ')}</li>}
                  {plan.studentObservation && <li><strong>Observation:</strong> {plan.studentObservation}</li>}
                </ul>
              </div>
            )}

            {/* After Birth */}
            {(plan.cordClamping || plan.skinToSkin || plan.placenta || plan.feeding || plan.postnatalCustoms) && (
              <div>
                <h3 className="font-bold text-charcoal uppercase tracking-wider text-[11px] mb-2 border-b border-gray-100 pb-1">Immediately After Birth</h3>
                <ul className="list-disc pl-5 text-charcoal space-y-1 mt-2">
                  {plan.skinToSkin && <li><strong>Skin-to-skin:</strong> {plan.skinToSkin}</li>}
                  {plan.cordClamping && <li><strong>Cord Clamping:</strong> {plan.cordClamping}</li>}
                  {plan.feeding && <li><strong>Feeding:</strong> {plan.feeding}</li>}
                  {plan.placenta && <li><strong>Placenta:</strong> {plan.placenta}</li>}
                  {plan.postnatalCustoms && <li><strong>Postnatal Customs:</strong> {plan.postnatalCustoms}</li>}
                </ul>
              </div>
            )}

            {/* Newborn Care */}
            {(plan.vitaminK || plan.newbornScreening || plan.visitors || plan.otherPreferences) && (
              <div>
                <h3 className="font-bold text-charcoal uppercase tracking-wider text-[11px] mb-2 border-b border-gray-100 pb-1">Newborn Care & Postpartum</h3>
                <ul className="list-disc pl-5 text-charcoal space-y-1 mt-2">
                  {plan.vitaminK && <li><strong>Vitamin K:</strong> {plan.vitaminK}</li>}
                  {plan.newbornScreening && <li><strong>Screening:</strong> {plan.newbornScreening}</li>}
                  {plan.visitors && <li><strong>Visitors:</strong> {plan.visitors}</li>}
                  {plan.otherPreferences && <li><strong>Other preferences:</strong> {plan.otherPreferences}</li>}
                </ul>
              </div>
            )}

          </div>

          <div className="mt-12 text-center text-[11px] text-light border-t border-border pt-4 print:mt-16 print:border-t-2">
            Created privately on Bloom Pregnancy Planner
          </div>
        </div>
      </div>

    </div>
  );
};
