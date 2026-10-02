import { db } from './db';
import { db as firestoreDb } from './firebase';
import { collection, doc, setDoc, writeBatch, query, where, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';

export type TrackingType = 'kick' | 'contraction' | 'vitals' | 'mood' | 'hydration' | 'supplement' | 'symptom';

class CloudSync {
  private syncQueue: Map<string, { type: TrackingType, data: any }> = new Map();
  private syncTimer: NodeJS.Timeout | null = null;
  private SYNC_INTERVAL = 5000; // Batch sync every 5 seconds

  /**
   * Queue a record for cloud sync
   */
  queueSync(journeyId: string, type: TrackingType, record: any) {
    if (!journeyId) return;
    
    const key = `${type}_${record.id}`;
    this.syncQueue.set(key, { type, data: record });

    if (!this.syncTimer) {
      this.syncTimer = setTimeout(() => this.flush(), this.SYNC_INTERVAL);
    }
  }

  /**
   * Flush the queue to Firestore
   */
  async flush() {
    if (this.syncQueue.size === 0) return;

    const items = Array.from(this.syncQueue.values());
    this.syncQueue.clear();
    this.syncTimer = null;

    try {
      // Use batches for efficiency (max 500 per batch)
      const batch = writeBatch(firestoreDb);
      
      for (const item of items) {
        const journeyId = item.data.journeyId;
        if (!journeyId) continue;

        // Subcollection: journeys/{journeyId}/trackingData/{docId}
        const docId = `${item.type}_${item.data.id}`;
        const docRef = doc(firestoreDb, 'journeys', journeyId, 'trackingData', docId);
        
        batch.set(docRef, {
          type: item.type,
          data: item.data,
          updatedAt: Date.now()
        }, { merge: true });
      }

      await batch.commit();
      console.log(`CloudSync: Successfully synced ${items.length} records.`);
      
      // Periodically run retention cleanup (10% of the time to save reads)
      if (Math.random() < 0.1) {
        this.performRetentionCleanup(items[0].data.journeyId);
      }
    } catch (error) {
      console.error("CloudSync: Failed to flush batch", error);
    }
  }

  /**
   * Automatically delete records older than 2 years (730 days)
   */
  async performRetentionCleanup(journeyId: string) {
    if (!journeyId) return;
    
    const twoYearsAgo = Date.now() - (730 * 24 * 60 * 60 * 1000);
    
    try {
      const trackingRef = collection(firestoreDb, 'journeys', journeyId, 'trackingData');
      const q = query(trackingRef, where('updatedAt', '<', twoYearsAgo));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const batch = writeBatch(firestoreDb);
        snapshot.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
        console.log(`CloudSync: Cleaned up ${snapshot.size} expired records (2-year retention).`);
      }
    } catch (error) {
      console.error("CloudSync: Retention cleanup failed", error);
    }
  }

  /**
   * Restore all tracking data for a journey from Firestore to IndexedDB
   */
  async restoreJourneyData(journeyId: string, cloudRecords: any[]) {
    try {
      for (const record of cloudRecords) {
        const { type, data } = record;
        
        switch (type) {
          case 'kick': await db.kickSessions.put(data); break;
          case 'contraction': await db.contractionSessions.put(data); break;
          case 'vitals': await db.vitalsLogs.put(data); break;
          case 'mood': await db.moodLogs.put(data); break;
          case 'hydration': await db.hydrationLogs.put(data); break;
          case 'supplement': await db.supplementLogs.put(data); break;
          case 'symptom': await db.symptomLogs.put(data); break;
        }
      }
    } catch (error) {
      console.error("CloudSync: Failed to restore journey data", error);
    }
  }
}

export const cloudSync = new CloudSync();

/**
 * Save user pregnancy journey state to Firestore
 */
export const saveJourney = async (uid: string, state: any) => {
  try {
    const journeyId = state.activeJourneyId || `journey_${uid}`;
    const journeyRef = doc(firestoreDb, 'journeys', journeyId);
    await setDoc(journeyRef, {
      ...state,
      userId: uid,
      updatedAt: Date.now()
    }, { merge: true });

    // Ensure user profile points to this active journey
    const userRef = doc(firestoreDb, 'users', uid);
    await setDoc(userRef, {
      isSetup: true,
      activeJourneyId: journeyId,
      updatedAt: Date.now()
    }, { merge: true });

    console.log(`CloudSync: Saved journey ${journeyId} for user ${uid}`);
  } catch (error) {
    console.error("CloudSync: Failed to save journey", error);
  }
};
