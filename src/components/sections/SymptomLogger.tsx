import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, SymptomType, Severity } from '../../db';
import { usePlanner } from '../../store';
import { v4 as uuidv4 } from 'uuid';
import { Activity, Plus, Trash2, HeartPulse, Clock, Sparkles } from 'lucide-react';
import { auth, db as firestoreDb, handleFirestoreError, OperationType } from '../../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { CustomSelect } from '../CustomSelect';
import { triggerHaptic } from '../../utils/nativeBridge';

export const SymptomLogger: React.FC = () => {
  const { state } = usePlanner();
  const journeyId = state.activeJourneyId;

  const [symptomType, setSymptomType] = useState<SymptomType>(SymptomType.NAUSEA);
  const [severity, setSeverity] = useState<Severity>(Severity.MILD);
  const [notes, setNotes] = useState('');

  // Use Dexie's live query to automatically re-render when symptomLogs change
  const logs = useLiveQuery(
    () => journeyId ? db.symptomLogs.where('journeyId').equals(journeyId).reverse().sortBy('timestamp') : [],
    [journeyId]
  );

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
    // Delete locally
    await db.symptomLogs.delete(id);

    // Delete from Firestore
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
    <div className="space-y-5 animate-in fade-in duration-200">
      <div>
        <h2 className="font-serif text-[22px] sm:text-[26px] font-bold text-charcoal leading-tight">
          Symptom Logger
        </h2>
        <p className="text-[12.5px] text-medium mt-0.5">
          Track daily patterns, triggers, and relief notes for your prenatal care team.
        </p>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-border/80 shadow-xs">
        <h3 className="font-serif text-[17px] font-bold mb-4 flex items-center gap-2 text-charcoal">
          <Activity size={17} className="text-sage" />
          <span>Log a Symptom</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold tracking-wider uppercase text-medium">
              Symptom Type
            </span>
            <CustomSelect
              value={symptomType}
              onChange={(value) => setSymptomType(value as SymptomType)}
              options={Object.values(SymptomType).map(type => ({
                label: type.replace('_', ' '),
                value: type
              }))}
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold tracking-wider uppercase text-medium">
              Severity
            </span>
            <CustomSelect
              value={severity}
              onChange={(value) => setSeverity(value as Severity)}
              options={Object.values(Severity).map(sev => ({
                label: sev,
                value: sev
              }))}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 mb-5">
          <span className="text-[11px] font-bold tracking-wider uppercase text-medium">
            Notes / Triggers (Optional)
          </span>
          <input 
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g., Worse in morning, relieved by ginger tea..."
            className="px-3.5 py-2.5 border border-border/80 rounded-xl text-[13.5px] text-charcoal bg-cream/50 transition-all focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage w-full placeholder:text-light"
          />
        </div>

        <button 
          type="button"
          onClick={handleLogSymptom}
          className="flex items-center justify-center gap-2 w-full h-12 bg-sage hover:bg-sage-dark text-white rounded-xl font-bold text-[14px] cursor-pointer transition-all shadow-2xs active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>Save Symptom Log</span>
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-serif text-[17px] font-bold text-charcoal">
            Logged History
          </h3>
          {logs && logs.length > 0 && (
            <span className="text-[11px] font-bold text-sage-dark bg-sage-pale px-2.5 py-0.5 rounded-full">
              {logs.length} entries
            </span>
          )}
        </div>

        {logs === undefined ? (
          <div className="text-light text-[13px] italic p-4 text-center">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="bg-white border border-border/80 rounded-2xl p-7 text-center shadow-2xs">
            <Sparkles size={24} className="mx-auto text-light/50 mb-2" />
            <p className="text-[13.5px] font-bold text-charcoal">No symptoms logged yet</p>
            <p className="text-[11.5px] text-light mt-0.5">Keep track of morning nausea, cramps, or fatigue here.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {logs.map(log => {
              const isSevere = log.severity === Severity.SEVERE;
              const isModerate = log.severity === Severity.MODERATE;
              
              return (
                <div 
                  key={log.id} 
                  className="bg-white p-3.5 sm:p-4 rounded-2xl border border-border/70 flex items-start justify-between gap-3 shadow-2xs hover:border-sage/40 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-[14px] text-charcoal capitalize">
                        {log.symptomType.replace('_', ' ').toLowerCase()}
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
                      <Clock size={12} className="text-light shrink-0" />
                      <span>
                        {new Date(log.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })} • {new Date(log.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit', minute: '2-digit', hour12: true
                        })}
                      </span>
                    </div>

                    {log.notes && (
                      <p className="text-[12.5px] text-charcoal/80 italic bg-cream/60 px-2.5 py-1.5 rounded-lg border border-border/50">
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
                    <Trash2 size={16} />
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
