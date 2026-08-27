import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, SymptomType, Severity } from '../../db';
import { usePlanner } from '../../store';
import { v4 as uuidv4 } from 'uuid';
import { Activity, Plus, Trash2 } from 'lucide-react';
import { auth, db as firestoreDb, handleFirestoreError, OperationType } from '../../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { CustomSelect } from '../CustomSelect';

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
      <div className="text-center p-10 text-light italic">
        Please generate a new plan to start logging symptoms.
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-7">
        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-normal mb-1.5">Symptom Log</h2>
        <p className="text-[14px] text-medium max-w-[560px] leading-[1.7]">
          Track your daily symptoms. This data is securely synced to your private cloud storage.
        </p>
      </div>

      <div className="bg-white p-6 rounded-[16px] border-[1.5px] border-border shadow-sm mb-8">
        <h3 className="font-serif text-[18px] font-medium mb-4 flex items-center gap-2 text-charcoal">
          <Activity size={18} className="text-sage" /> Log a new symptom
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold tracking-[1.2px] uppercase text-medium">Symptom Type</span>
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
            <span className="text-[11px] font-semibold tracking-[1.2px] uppercase text-medium">Severity</span>
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
          <span className="text-[11px] font-semibold tracking-[1.2px] uppercase text-medium">Notes (Optional)</span>
          <input 
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g., Worse in the morning, triggered by coffee..."
            className="p-[11px_14px] border-[1.5px] border-border rounded-[10px] font-sans text-[14px] text-charcoal bg-cream transition-all focus:outline-none focus:border-sage focus:ring-[3px] focus:ring-sage/10 w-full"
          />
        </div>

        <button 
          onClick={handleLogSymptom}
          className="flex items-center justify-center gap-2 w-full p-[12px] bg-sage text-white border-none rounded-[10px] font-sans text-[14px] font-semibold tracking-[0.4px] cursor-pointer transition-all hover:bg-sage-dark"
        >
          <Plus size={16} /> Save Log Entry
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="font-serif text-[20px] font-medium mb-3">History</h3>
        {logs === undefined ? (
          <div className="text-light text-[14px] italic">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-light text-[14px] italic">No symptoms logged yet.</div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="bg-white p-4 rounded-[12px] border-[1.5px] border-border flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-[15px] text-charcoal capitalize">{log.symptomType.replace('_', ' ').toLowerCase()}</span>
                  <span className={`text-[10px] font-semibold tracking-[0.7px] uppercase px-2 py-0.5 rounded-[10px]
                    ${log.severity === Severity.SEVERE ? 'bg-critical-bg text-critical' : 
                      log.severity === Severity.MODERATE ? 'bg-gold-pale text-gold' : 
                      'bg-sage-pale text-sage'}`}>
                    {log.severity}
                  </span>
                </div>
                <div className="text-[12px] text-light mb-2">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
                {log.notes && (
                  <div className="text-[13px] text-medium italic">"{log.notes}"</div>
                )}
              </div>
              <button 
                onClick={() => handleDelete(log.id)}
                className="text-light hover:text-critical transition-colors p-2"
                title="Delete log"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
