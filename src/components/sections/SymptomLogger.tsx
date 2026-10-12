import React, { useState, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, SymptomType, Severity } from '../../db';
import { usePlanner } from '../../store';
import { v4 as uuidv4 } from 'uuid';
import { Activity, Plus, Trash2, HeartPulse, Clock, Sparkles, ChevronDown, FileText } from 'lucide-react';
import { auth, db as firestoreDb, handleFirestoreError, OperationType } from '../../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { triggerHaptic } from '../../utils/nativeBridge';
import { ContextBanner } from '../ContextBanner';

interface SymptomMeta {
  value: SymptomType;
  label: string;
  icon: string;
}

const SYMPTOM_OPTIONS: SymptomMeta[] = [
  { value: SymptomType.NAUSEA, label: 'Nausea & Morning Sickness', icon: '🤢' },
  { value: SymptomType.FATIGUE, label: 'Fatigue & Low Energy', icon: '😴' },
  { value: SymptomType.CRAMPING, label: 'Abdominal Cramping', icon: '⚡' },
  { value: SymptomType.HEADACHE, label: 'Headache & Migraine', icon: '🤕' },
  { value: SymptomType.HEARTBURN, label: 'Heartburn & Acidity', icon: '🔥' },
  { value: SymptomType.SPOTTING, label: 'Spotting / Light Bleeding', icon: '🩸' },
  { value: SymptomType.INSOMNIA, label: 'Insomnia & Sleep Issues', icon: '🌙' },
  { value: SymptomType.MOOD_SWINGS, label: 'Mood Swings & Anxiety', icon: '💭' },
  { value: SymptomType.OTHER, label: 'Other Symptom', icon: '📝' },
];

const QUICK_CHIPS: { value: SymptomType; label: string; icon: string }[] = [
  { value: SymptomType.NAUSEA, label: 'Nausea', icon: '🤢' },
  { value: SymptomType.FATIGUE, label: 'Fatigue', icon: '😴' },
  { value: SymptomType.CRAMPING, label: 'Cramping', icon: '⚡' },
  { value: SymptomType.HEADACHE, label: 'Headache', icon: '🤕' },
  { value: SymptomType.HEARTBURN, label: 'Heartburn', icon: '🔥' },
];

export const SymptomLogger: React.FC = () => {
  const { state } = usePlanner();
  const journeyId = state.activeJourneyId;

  const [symptomType, setSymptomType] = useState<SymptomType>(SymptomType.NAUSEA);
  const [severity, setSeverity] = useState<Severity>(Severity.MILD);
  const [notes, setNotes] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Dexie live query
  const logs = useLiveQuery(
    () => journeyId ? db.symptomLogs.where('journeyId').equals(journeyId).reverse().sortBy('timestamp') : [],
    [journeyId]
  );

  const selectedSymptomMeta = SYMPTOM_OPTIONS.find(s => s.value === symptomType) || SYMPTOM_OPTIONS[0];

  const handleLogSymptom = async () => {
    if (!journeyId) return;
    triggerHaptic('success');
    
    const id = uuidv4();
    const timestamp = Date.now();
    const symptomData = {
      id,
      journeyId,
      timestamp,
      symptomType,
      severity,
      notes: notes.trim() || undefined,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Save locally
    await db.symptomLogs.put(symptomData);

    // Sync to Firestore
    if (auth.currentUser) {
      try {
        const symptomRef = doc(firestoreDb, 'symptoms', id);
        await setDoc(symptomRef, {
          ...symptomData,
          uid: auth.currentUser.uid
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `symptoms/${id}`);
      }
    }

    setNotes('');
  };

  const handleDelete = async (id: string) => {
    triggerHaptic('light');
    await db.symptomLogs.delete(id);

    if (auth.currentUser) {
      try {
        const symptomRef = doc(firestoreDb, 'symptoms', id);
        await deleteDoc(symptomRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `symptoms/${id}`);
      }
    }
  };

  if (!journeyId) {
    return (
      <div className="text-center p-8 bg-white border border-border/80 rounded-3xl shadow-xs">
        <HeartPulse className="w-10 h-10 text-sage mx-auto mb-3" />
        <h2 className="font-serif text-2xl font-bold text-charcoal mb-1.5">Symptom Logger</h2>
        <p className="text-medium text-[14px]">Please complete setup first to begin logging symptoms.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Brand Context Banner with Guidance */}
      <ContextBanner description="Track daily patterns, triggers, and relief notes for your prenatal care team." />

      {/* Main Logging Card */}
      <div className="bg-white p-4 xs:p-5 rounded-2xl border border-border/80 shadow-3xs space-y-4">
        <div className="flex items-center gap-2 pb-2.5 border-b border-border/50">
          <div className="w-6 h-6 rounded-lg bg-sage/10 flex items-center justify-center text-sage">
            <Activity size={14} />
          </div>
          <h3 className="font-serif text-[15px] font-bold text-charcoal">
            Log a Symptom
          </h3>
        </div>
        
        {/* Symptom Type Dropdown & Quick Chips */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold tracking-wider uppercase text-medium">
            Symptom Type
          </label>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border bg-cream/40 text-charcoal text-[13.5px] transition-all text-left cursor-pointer focus:outline-none ${
                isDropdownOpen ? 'border-sage ring-2 ring-sage/10' : 'border-border/80 hover:border-sage/50'
              }`}
            >
              <span className="flex items-center gap-2 font-medium">
                <span className="text-base">{selectedSymptomMeta.icon}</span>
                <span>{selectedSymptomMeta.label}</span>
              </span>
              <ChevronDown 
                size={16} 
                className={`text-medium transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-border rounded-xl shadow-lg overscroll-contain py-1 animate-in fade-in slide-in-from-top-1">
                {SYMPTOM_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSymptomType(opt.value);
                      setIsDropdownOpen(false);
                      triggerHaptic('selection');
                    }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-[13px] transition-colors cursor-pointer ${
                      opt.value === symptomType 
                        ? 'bg-sage-pale/70 text-sage-dark font-semibold' 
                        : 'text-charcoal hover:bg-cream/60'
                    }`}
                  >
                    <span className="text-sm">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick-Select Chips */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {QUICK_CHIPS.map((chip) => {
              const isSelected = symptomType === chip.value;
              return (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => {
                    setSymptomType(chip.value);
                    triggerHaptic('selection');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11.5px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-sage text-white shadow-3xs'
                      : 'bg-cream/70 text-charcoal/80 hover:bg-cream border border-border/60'
                  }`}
                >
                  <span>{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Severity Selector - Sleek Segmented Control */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold tracking-wider uppercase text-medium">
              Severity Level
            </label>
            <span className="text-[11px] text-light">Select intensity</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-1 bg-cream/60 rounded-xl border border-border/70">
            <button
              type="button"
              onClick={() => {
                setSeverity(Severity.MILD);
                triggerHaptic('selection');
              }}
              className={`py-2 px-2 rounded-lg text-[12px] font-semibold text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                severity === Severity.MILD
                  ? 'bg-sage text-white shadow-3xs'
                  : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              <span>🌱</span>
              <span>Mild</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSeverity(Severity.MODERATE);
                triggerHaptic('selection');
              }}
              className={`py-2 px-2 rounded-lg text-[12px] font-semibold text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                severity === Severity.MODERATE
                  ? 'bg-gold-dark text-white shadow-3xs'
                  : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              <span>⚡</span>
              <span>Moderate</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSeverity(Severity.SEVERE);
                triggerHaptic('selection');
              }}
              className={`py-2 px-2 rounded-lg text-[12px] font-semibold text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                severity === Severity.SEVERE
                  ? 'bg-terracotta text-white shadow-3xs'
                  : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              <span>🚨</span>
              <span>Severe</span>
            </button>
          </div>
        </div>

        {/* Notes & Triggers */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold tracking-wider uppercase text-medium flex items-center gap-1">
            <FileText size={11} className="text-sage" />
            <span>Notes & Triggers (Optional)</span>
          </label>
          <input 
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g., Worse in morning, relieved by ginger tea / rest..."
            className="px-3.5 py-2.5 border border-border/80 rounded-xl text-[13px] text-charcoal bg-cream/40 transition-all focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage w-full placeholder:text-light/70"
          />
        </div>

        {/* Save Button */}
        <button 
          type="button"
          onClick={handleLogSymptom}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-sage hover:bg-sage-dark text-white rounded-xl font-bold text-[13.5px] cursor-pointer transition-all shadow-3xs active:scale-[0.98]"
        >
          <Plus size={15} />
          <span>Save Symptom Log</span>
        </button>
      </div>

      {/* Logged History */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-serif text-[15px] font-bold text-charcoal">
            Logged History
          </h3>
          {logs && logs.length > 0 && (
            <span className="text-[11px] font-bold text-sage-dark bg-sage-pale px-2.5 py-0.5 rounded-full">
              {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
            </span>
          )}
        </div>

        {logs === undefined ? (
          <div className="text-light text-[13px] italic p-4 text-center">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="bg-white border border-border/80 rounded-2xl p-6 text-center shadow-3xs">
            <Sparkles size={22} className="mx-auto text-light/50 mb-2" />
            <p className="text-[13px] font-bold text-charcoal">No symptoms logged yet</p>
            <p className="text-[11.5px] text-light mt-0.5">Keep track of morning nausea, cramps, or fatigue here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map(log => {
              const isSevere = log.severity === Severity.SEVERE;
              const isModerate = log.severity === Severity.MODERATE;
              const meta = SYMPTOM_OPTIONS.find(s => s.value === log.symptomType);
              
              return (
                <div 
                  key={log.id} 
                  className="bg-white p-3.5 rounded-xl border border-border/70 flex items-start justify-between gap-3 shadow-3xs hover:border-sage/40 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm">{meta?.icon || '🌸'}</span>
                      <span className="font-bold text-[13.5px] text-charcoal">
                        {meta?.label.split('&')[0].trim() || log.symptomType.replace('_', ' ').toLowerCase()}
                      </span>
                      <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md border ${
                        isSevere 
                          ? 'bg-terracotta-pale text-terracotta border-terracotta/30' 
                          : isModerate 
                            ? 'bg-gold-pale text-gold-dark border-gold/30' 
                            : 'bg-sage-pale text-sage-dark border-sage/30'
                      }`}>
                        {log.severity}
                      </span>
                    </div>

                    <div className="text-[11px] text-medium flex items-center gap-1.5 mb-1.5">
                      <Clock size={11} className="text-light shrink-0" />
                      <span>
                        {new Date(log.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })} • {new Date(log.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit', minute: '2-digit', hour12: true
                        })}
                      </span>
                    </div>

                    {log.notes && (
                      <p className="text-[12px] text-charcoal/80 italic bg-cream/60 px-2.5 py-1.5 rounded-lg border border-border/50">
                        &ldquo;{log.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  <button 
                    type="button"
                    onClick={() => handleDelete(log.id)}
                    className="p-1.5 text-light hover:text-critical hover:bg-critical-bg rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Delete log"
                    aria-label="Delete symptom log"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
