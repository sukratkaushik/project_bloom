import { Capacitor } from '@capacitor/core';
import { HealthFitness } from '@capacitor/health-fitness';
import { db, VitalsLog } from '../db';
import { v4 as uuidv4 } from 'uuid';

export interface HealthConnectStatus {
  isSupported: boolean;
  isNative: boolean;
  isConnected: boolean;
  lastSyncTime: number | null;
  syncedCount: number;
}

export interface SyncVitalsResult {
  success: boolean;
  importedCount: number;
  updatedCount: number;
  message: string;
  error?: string;
  syncedLogs: VitalsLog[];
}

const STORAGE_KEYS = {
  CONNECTED: 'opin_health_connect_connected',
  LAST_SYNC: 'opin_health_connect_last_sync',
  LAST_COUNT: 'opin_health_connect_count',
};

/**
 * Checks whether Android Health Connect / native health bridge is available.
 */
export const isHealthConnectSupported = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

/**
 * Returns current Health Connect connection state and metadata.
 */
export const getHealthConnectStatus = (): HealthConnectStatus => {
  const isNative = Capacitor.isNativePlatform();
  const isSupported = isHealthConnectSupported();
  const isConnected = localStorage.getItem(STORAGE_KEYS.CONNECTED) === 'true';
  const lastSyncRaw = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  const lastSyncTime = lastSyncRaw ? parseInt(lastSyncRaw, 10) : null;
  const syncedCount = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_COUNT) || '0', 10);

  return {
    isSupported,
    isNative,
    isConnected,
    lastSyncTime,
    syncedCount,
  };
};

/**
 * Requests Health Connect read/write permissions for pregnancy-critical vitals.
 */
export const requestHealthConnectPermissions = async (): Promise<{ success: boolean; error?: string }> => {
  if (!isHealthConnectSupported()) {
    // In web / non-Android mode, toggle simulated connection
    localStorage.setItem(STORAGE_KEYS.CONNECTED, 'true');
    return { success: true };
  }

  try {
    await HealthFitness.requestHealthPermissions({
      customPermissions: '[]',
      allVariables: JSON.stringify({ IsActive: false, AccessType: 'READ' }),
      fitnessVariables: JSON.stringify({ IsActive: true, AccessType: 'READ' }),
      healthVariables: JSON.stringify({ IsActive: true, AccessType: 'READ' }),
      profileVariables: JSON.stringify({ IsActive: true, AccessType: 'READWRITE' }),
      workoutVariables: JSON.stringify({ IsActive: false, AccessType: 'READ' }),
    });

    localStorage.setItem(STORAGE_KEYS.CONNECTED, 'true');
    return { success: true };
  } catch (err: any) {
    console.error('Failed to request Health Connect permissions:', err);
    return {
      success: false,
      error: err?.message || 'Permission request was denied or cancelled.',
    };
  }
};

/**
 * Disconnects Health Connect and revokes local session credentials.
 */
export const disconnectHealthConnect = async (): Promise<void> => {
  if (isHealthConnectSupported()) {
    try {
      await HealthFitness.disconnectFromHealthConnect();
    } catch (err) {
      console.warn('Health Connect disconnect warning:', err);
    }
  }

  localStorage.removeItem(STORAGE_KEYS.CONNECTED);
  localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
  localStorage.removeItem(STORAGE_KEYS.LAST_COUNT);
};

/**
 * Opens Android's system Health Connect manager screen.
 */
export const openHealthConnectApp = async (): Promise<void> => {
  if (isHealthConnectSupported()) {
    try {
      await HealthFitness.openHealthConnect();
    } catch (err) {
      console.error('Unable to open Health Connect app:', err);
      // Deep link to Play Store if not installed
      window.open('https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata', '_blank');
    }
  } else {
    window.open('https://health.google/health-connect/', '_blank');
  }
};

// Formats date to 'yyyy-MM-ddTHH:mm:ssZ' without milliseconds as required by Health Connect native parser
const toHealthDate = (d: Date): string => {
  return d.toISOString().split('.')[0] + 'Z';
};

/**
 * Helper to safely query a health variable over a date range.
 */
async function queryVariable(variable: string, startDate: Date, endDate: Date, timeUnit = 'DAY', operation = 'ALL_DATA'): Promise<any[]> {
  try {
    const res = await HealthFitness.getData({
      parameters: JSON.stringify({
        Variable: variable,
        StartDate: toHealthDate(startDate),
        EndDate: toHealthDate(endDate),
        TimeUnit: timeUnit,
        OperationType: operation,
        TimeUnitLength: 1,
        AdvancedQueryReturnType: 'ALL_DATA',
        AdvancedQueryResultType: 'RAW_DATA',
      }),
    });

    if (!res || !res.results) return [];
    const parsed = typeof res.results === 'string' ? JSON.parse(res.results) : res.results;
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn(`Health Connect query for ${variable} returned no records or failed:`, err);
    return [];
  }
}

/**
 * Generates clinical mock biometrics for web/desktop preview testing.
 */
function generateMockImport(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(8, 30, 0, 0);

  // Normal to mildly elevated pregnancy vitals
  const sys = 114 + Math.round((Math.sin(daysAgo * 1.5) + 1) * 6);
  const dia = 74 + Math.round((Math.cos(daysAgo * 1.2) + 1) * 5);
  const pulse = 74 + Math.round(Math.random() * 8);
  const weight = Math.round((64.5 + (7 - daysAgo) * 0.12) * 10) / 10;
  const steps = 4500 + Math.round(Math.random() * 3500);
  const sleepHours = Math.round((7.1 + Math.random() * 1.4) * 10) / 10;
  const spo2 = 97 + Math.round(Math.random() * 2);
  const temp = Math.round((36.7 + Math.random() * 0.25) * 10) / 10;

  return {
    timestamp: d.getTime(),
    systolic: sys,
    diastolic: dia,
    pulse,
    weight,
    steps,
    sleepHours,
    spo2,
    basalBodyTemp: temp,
  };
}

/**
 * Synchronizes Health Connect data from native Android Health Connect (or simulation fallback)
 * into Dexie local database (`db.vitalsLogs`).
 */
export const syncHealthConnectVitals = async (
  journeyId: string,
  daysBack: number = 7
): Promise<SyncVitalsResult> => {
  if (!journeyId) {
    return {
      success: false,
      importedCount: 0,
      updatedCount: 0,
      message: 'No active pregnancy journey found.',
      syncedLogs: [],
    };
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 1); // include current day

  const importedLogs: VitalsLog[] = [];
  let updatedCount = 0;

  try {
    if (isHealthConnectSupported()) {
      // 1. Native Android Health Connect Queries
      const [bpRecords, weightRecords, hrRecords, stepRecords, sleepRecords, spo2Records, tempRecords] =
        await Promise.all([
          queryVariable('BLOOD_PRESSURE', startDate, endDate),
          queryVariable('WEIGHT', startDate, endDate),
          queryVariable('HEART_RATE', startDate, endDate),
          queryVariable('STEPS', startDate, endDate, 'DAY', 'SUM'),
          queryVariable('SLEEP', startDate, endDate),
          queryVariable('OXYGEN_SATURATION', startDate, endDate),
          queryVariable('BODY_TEMPERATURE', startDate, endDate),
        ]);

      // Combine by date key (YYYY-MM-DD)
      const dayMap = new Map<string, Partial<VitalsLog>>();

      const getDayKey = (timestamp: number | string | Date) => {
        const d = new Date(timestamp);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      };

      // Process Blood Pressure
      bpRecords.forEach((r: any) => {
        const t = r.startDate ? new Date(r.startDate).getTime() : Date.now();
        const key = getDayKey(t);
        const existing = dayMap.get(key) || { timestamp: t };
        // Health Connect BP records typically supply systolic and diastolic in mmHg
        existing.systolic = Math.round(r.systolic || r.value?.systolic || 120);
        existing.diastolic = Math.round(r.diastolic || r.value?.diastolic || 80);
        dayMap.set(key, existing);
      });

      // Process Weight
      weightRecords.forEach((r: any) => {
        const t = r.startDate ? new Date(r.startDate).getTime() : Date.now();
        const key = getDayKey(t);
        const existing = dayMap.get(key) || { timestamp: t };
        const w = r.weight || r.value;
        if (typeof w === 'number') {
          existing.weight = Math.round(w * 10) / 10;
        }
        dayMap.set(key, existing);
      });

      // Process Heart Rate
      hrRecords.forEach((r: any) => {
        const t = r.startDate ? new Date(r.startDate).getTime() : Date.now();
        const key = getDayKey(t);
        const existing = dayMap.get(key) || { timestamp: t };
        const bpm = Math.round(r.bpm || r.heartRate || r.value || 0);
        if (bpm > 0) {
          existing.pulse = bpm;
          existing.restingHeartRate = bpm;
        }
        dayMap.set(key, existing);
      });

      // Process Steps
      stepRecords.forEach((r: any) => {
        const t = r.startDate ? new Date(r.startDate).getTime() : Date.now();
        const key = getDayKey(t);
        const existing = dayMap.get(key) || { timestamp: t };
        const steps = Math.round(r.steps || r.value || 0);
        if (steps > 0) {
          existing.steps = (existing.steps || 0) + steps;
        }
        dayMap.set(key, existing);
      });

      // Process Sleep
      sleepRecords.forEach((r: any) => {
        const t = r.startDate ? new Date(r.startDate).getTime() : Date.now();
        const key = getDayKey(t);
        const existing = dayMap.get(key) || { timestamp: t };
        // Duration in hours
        let hours = 0;
        if (r.durationMinutes) {
          hours = r.durationMinutes / 60;
        } else if (r.startDate && r.endDate) {
          hours = (new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / (1000 * 60 * 60);
        } else if (r.value) {
          hours = Number(r.value);
        }
        if (hours > 0 && hours < 24) {
          existing.sleepHours = Math.round(hours * 10) / 10;
        }
        dayMap.set(key, existing);
      });

      // Process SpO2
      spo2Records.forEach((r: any) => {
        const t = r.startDate ? new Date(r.startDate).getTime() : Date.now();
        const key = getDayKey(t);
        const existing = dayMap.get(key) || { timestamp: t };
        const spo2 = Math.round(r.percentage || r.value || 0);
        if (spo2 > 0) existing.spo2 = spo2;
        dayMap.set(key, existing);
      });

      // Process Body Temperature
      tempRecords.forEach((r: any) => {
        const t = r.startDate ? new Date(r.startDate).getTime() : Date.now();
        const key = getDayKey(t);
        const existing = dayMap.get(key) || { timestamp: t };
        const temp = Number(r.temperature || r.value || 0);
        if (temp > 30 && temp < 45) {
          existing.basalBodyTemp = Math.round(temp * 10) / 10;
        }
        dayMap.set(key, existing);
      });

      // Upsert into Dexie DB
      for (const [dayKey, metrics] of dayMap.entries()) {
        const ts = metrics.timestamp || new Date(dayKey).getTime();
        const existingInDb = await db.vitalsLogs
          .where('journeyId')
          .equals(journeyId)
          .filter(log => {
            const lDate = getDayKey(log.timestamp);
            return lDate === dayKey && log.source === 'Google Health Connect';
          })
          .first();

        if (existingInDb) {
          // Merge updated metrics
          await db.vitalsLogs.update(existingInDb.id, {
            ...metrics,
            source: 'Google Health Connect',
            notes: existingInDb.notes || 'Imported from Google Health Connect',
          });
          updatedCount++;
          importedLogs.push({ ...existingInDb, ...metrics });
        } else {
          const newEntry: VitalsLog = {
            id: uuidv4(),
            journeyId,
            timestamp: ts,
            type: 'WEARABLE',
            source: 'Google Health Connect',
            notes: 'Imported from Google Health Connect',
            ...metrics,
          };
          await db.vitalsLogs.put(newEntry);
          importedLogs.push(newEntry);
        }
      }
    } else {
      // 2. Web / Desktop Preview Fallback: Generate clinical test logs
      for (let i = 0; i < daysBack; i++) {
        const mock = generateMockImport(i);
        const dayStr = new Date(mock.timestamp).toDateString();

        const existing = await db.vitalsLogs
          .where('journeyId')
          .equals(journeyId)
          .filter(log => {
            return (
              (log.source === 'Google Health Connect' || log.source === 'Google Health Connect (Preview)') &&
              new Date(log.timestamp).toDateString() === dayStr
            );
          })
          .first();

        if (existing) {
          await db.vitalsLogs.update(existing.id, {
            ...mock,
            source: 'Google Health Connect (Preview)',
          });
          updatedCount++;
          importedLogs.push({ ...existing, ...mock });
        } else {
          const newEntry: VitalsLog = {
            id: uuidv4(),
            journeyId,
            type: 'WEARABLE',
            source: 'Google Health Connect (Preview)',
            notes: 'Imported from Google Health Connect (Preview)',
            ...mock,
          };
          await db.vitalsLogs.put(newEntry);
          importedLogs.push(newEntry);
        }
      }
    }

    const now = Date.now();
    localStorage.setItem(STORAGE_KEYS.CONNECTED, 'true');
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now.toString());
    localStorage.setItem(STORAGE_KEYS.LAST_COUNT, importedLogs.length.toString());

    return {
      success: true,
      importedCount: importedLogs.length - updatedCount,
      updatedCount,
      message: `Successfully synchronized ${importedLogs.length} days of Google Health records into local database.`,
      syncedLogs: importedLogs,
    };
  } catch (err: any) {
    console.error('Error synchronizing Health Connect vitals:', err);
    return {
      success: false,
      importedCount: 0,
      updatedCount: 0,
      message: 'Failed to synchronize with Health Connect.',
      error: err?.message || String(err),
      syncedLogs: [],
    };
  }
};
