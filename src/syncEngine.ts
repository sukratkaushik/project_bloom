import { Peer, DataConnection } from 'peerjs';
import { db } from './db';

class SyncEngine {
  peer: Peer | null = null;
  conn: DataConnection | null = null;
  onStatusChange?: (status: string) => void;
  onStateReceived?: (state: any) => void;
  isSyncing: boolean = false;

  private _setStatus(status: string) {
    if (this.onStatusChange) {
      this.onStatusChange(status);
    }
  }

  initHost(onIdCallback: (id: string) => void) {
    this._setStatus('Initializing host...');
    this.peer = new Peer();
    
    this.peer.on('open', (id) => {
      onIdCallback(id);
      this._setStatus('Waiting for partner to connect...');
    });

    this.peer.on('connection', (connection) => {
      this._handleConnection(connection);
    });

    this.peer.on('error', (err) => {
      this._setStatus(`Error: ${err.message}`);
    });
  }

  connectToPartner(partnerId: string) {
    this._setStatus(`Connecting to partner...`);
    this.peer = new Peer();
    
    this.peer.on('open', () => {
      const connection = this.peer!.connect(partnerId);
      this._handleConnection(connection);
    });

    this.peer.on('error', (err) => {
      this._setStatus(`Error: ${err.message}`);
    });
  }

  _handleConnection(connection: DataConnection) {
    this.conn = connection;

    this.conn.on('open', () => {
      this._setStatus('Connected securely. Syncing active.');
    });

    this.conn.on('data', async (data: any) => {
      this.isSyncing = true;
      try {
        const payload = typeof data === 'string' ? JSON.parse(data) : data;
        
        // Handle Dexie DB sync payload
        if (payload.dexie) {
          if (payload.dexie.kickSessions?.length) await db.kickSessions.bulkPut(payload.dexie.kickSessions);
          if (payload.dexie.contractionSessions?.length) await db.contractionSessions.bulkPut(payload.dexie.contractionSessions);
          if (payload.dexie.vitalsLogs?.length) await db.vitalsLogs.bulkPut(payload.dexie.vitalsLogs);
          if (payload.dexie.moodLogs?.length) await db.moodLogs.bulkPut(payload.dexie.moodLogs);
          if (payload.dexie.hydrationLogs?.length) await db.hydrationLogs.bulkPut(payload.dexie.hydrationLogs);
          if (payload.dexie.supplementLogs?.length) await db.supplementLogs.bulkPut(payload.dexie.supplementLogs);
          if (payload.dexie.symptomLogs?.length) await db.symptomLogs.bulkPut(payload.dexie.symptomLogs);
        }

        // Handle PlannerState sync payload
        if (payload.state && this.onStateReceived) {
          if (payload.config) {
            payload.state.isPartnerReadOnly = payload.config.mode === 'read';
          }
          this.onStateReceived(payload.state);
        }
      } catch (e) {
        console.error("Failed to process sync data", e);
      } finally {
        setTimeout(() => { this.isSyncing = false; }, 500); 
      }
    });

    this.conn.on('close', () => {
      this._setStatus('Disconnected.');
      this.conn = null;
    });
  }

  async broadcastState(state: any) {
    if (this.conn && this.conn.open && !this.isSyncing) {
      // Default to permissive if no permissions exist
      const perms = state.syncPermissions || {};
      const excludedTaskIds = perms.excludedTaskIds || [];
      
      const filterTasks = (taskMap: Record<string, any>) => {
        if (!taskMap) return taskMap;
        const filtered = { ...taskMap };
        for (const id of excludedTaskIds) {
          delete filtered[id];
        }
        return filtered;
      };
      
      const syncData: any = { 
        state: {}, 
        dexie: {},
        config: { mode: perms.mode || 'edit' }
      };
      
      // We sync common planning structures if any related task section is enabled
      const hasAnyTask = perms.dev !== false || perms.prep !== false || perms.deadlines !== false || perms.medical !== false || perms.schemes !== false || perms.postpartum !== false;
      if (hasAnyTask) {
        syncData.state.checked = filterTasks(state.checked);
        syncData.state.assigned = filterTasks(state.assigned);
        syncData.state.assigneeNotes = filterTasks(state.assigneeNotes);
        syncData.state.deletedTasks = filterTasks(state.deletedTasks);
        syncData.state.customTasks = state.customTasks; // we won't filter custom tasks broadly here
      }
      
      if (perms.finance !== false) {
        syncData.state.budgetEst = state.budgetEst;
        syncData.state.budgetAct = state.budgetAct;
        syncData.state.customBudgetItems = state.customBudgetItems;
      }
      
      if (perms.hospitalbag !== false) {
        syncData.state.hospitalBagItems = state.hospitalBagItems;
      }
      
      if (perms.decisions !== false) {
        syncData.state.decisions = state.decisions;
        syncData.state.decisionNotes = state.decisionNotes;
      }
      
      if (perms.birthplan !== false) {
        syncData.state.birthPlan = state.birthPlan;
      }
      
      if (perms.notes !== false) {
        syncData.state.notes = state.notes;
      }
      
      if (perms.babynames !== false) {
        syncData.state.favoriteNames = state.favoriteNames;
      }

      // Read required db tables based on permissions
      if (state.activeJourneyId) {
        if (perms.kickcounter !== false) syncData.dexie.kickSessions = await db.kickSessions.where('journeyId').equals(state.activeJourneyId).toArray();
        if (perms.contractions !== false) syncData.dexie.contractionSessions = await db.contractionSessions.where('journeyId').equals(state.activeJourneyId).toArray();
        if (perms.vitals !== false || perms.readiness !== false) syncData.dexie.vitalsLogs = await db.vitalsLogs.where('journeyId').equals(state.activeJourneyId).toArray();
        if (perms.mood !== false) syncData.dexie.moodLogs = await db.moodLogs.where('journeyId').equals(state.activeJourneyId).toArray();
        if (perms.hydration !== false) syncData.dexie.hydrationLogs = await db.hydrationLogs.where('journeyId').equals(state.activeJourneyId).toArray();
        if (perms.nutrition !== false) syncData.dexie.supplementLogs = await db.supplementLogs.where('journeyId').equals(state.activeJourneyId).toArray();
        if (perms.symptoms !== false) syncData.dexie.symptomLogs = await db.symptomLogs.where('journeyId').equals(state.activeJourneyId).toArray();
      }

      this.conn.send(JSON.stringify(syncData));
    }
  }

  disconnect() {
    if (this.conn) {
      this.conn.close();
      this.conn = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this._setStatus('Disconnected');
  }
}

export const syncEngine = new SyncEngine();
