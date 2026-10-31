import { Capacitor } from '@capacitor/core';
import { HealthFitness } from '@capacitor/health-fitness';
import { db, VitalsLog } from '../db';
import { v4 as uuidv4 } from 'uuid';

export type HealthPlatformType = 'ios' | 'android' | 'web';

export interface HealthConnectStatus {
  isSupported: boolean;
  isNative: boolean;
  isConnected: boolean;
  lastSyncTime: number | null;
  syncedCount: number;
  platform: HealthPlatformType;
  providerName: string;
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
 * Returns current platform: 'ios', 'android', or 'web'.
 */
export const getHealthPlatform = (): HealthPlatformType => {
  if (Capacitor.isNativePlatform()) {
    const p = Capacitor.getPlatform();
    if (p === 'ios') return 'ios';
    if (p === 'android') return 'android';
  }
  return 'web';
};

/**
 * Returns user-facing name of the native health service.
 */
export const getHealthProviderName = (): string => {
  const p = getHealthPlatform();
  if (p === 'ios') return 'Apple Health';
  if (p === 'android') return 'Google Health Connect';
  return 'Connected Health (Preview)';
};

/**
 * Returns concise description of the native health bridge.
 */
export const getHealthProviderDescription = (): string => {
  const p = getHealthPlatform();
  if (p === 'ios') return 'Sync prenatal biometrics via HealthKit & Apple Watch';
  if (p === 'android') return 'Automatic background sync from Android';
  return 'Simulated health sync for web preview';
};

/**
 * Checks whether native health bridge is available (iOS HealthKit or Android Health Connect).
 */
export const isNativeHealthSupported = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Backwards-compatible check.
 */
export const isHealthConnectSupported = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Returns current health connection state and metadata.
 */
export const getHealthStatus = (): HealthConnectStatus => {
  const isNative = Capacitor.isNativePlatform();
  const isSupported = isNativeHealthSupported();
  const isConnected = localStorage.getItem(STORAGE_KEYS.CONNECTED) === 'true';
  const lastSyncRaw = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  const lastSyncTime = lastSyncRaw ? parseInt(lastSyncRaw, 10) : null;
  const syncedCount = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_COUNT) || '0', 10);
  const platform = getHealthPlatform();
  const providerName = getHealthProviderName();

  return {
    isSupported,
    isNative,
    isConnected,
    lastSyncTime,
    syncedCount,
    platform,
    providerName,
  };
};

export const getHealthConnectStatus = getHealthStatus;

/**
 * Requests Health read/write permissions for pregnancy-critical vitals.
 * Works for both Apple HealthKit (iOS) and Health Connect (Android).
 */
export const requestHealthPermissions = async (): Promise<{ success: boolean; error?: string }> => {
  const providerName = getHealthProviderName();

  if (!isNativeHealthSupported()) {
    // In web / desktop preview mode, toggle simulated connection
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
    console.error(`Failed to request ${providerName} permissions:`, err);
    return {
      success: false,
      error: err?.message || 'Permission request was denied or cancelled.',
    };
  }
};

export const requestHealthConnectPermissions = requestHealthPermissions;

/**
 * Disconnects health bridge and resets local session credentials.
 */
export const disconnectHealthPlatform = async (): Promise<void> => {
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
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

export const disconnectHealthConnect = disconnectHealthPlatform;

/**
 * Opens native health manager (Apple Health on iOS, Health Connect on Android).
 */
export const openHealthApp = async (): Promise<void> => {
  const platform = getHealthPlatform();
  if (platform === 'android') {
    try {
      await HealthFitness.openHealthConnect();
    } catch (err) {
      console.error('Unable to open Health Connect app:', err);
      // Deep link to Play Store if not installed
      window.open('https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata', '_blank');
    }
  } else if (platform === 'ios') {
    window.location.href = 'x-apple-health://';
  } else {
    window.open('https://health.google/health-connect/', '_blank');
  }
};

export const openHealthConnectApp = openHealthApp;

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
export const syncHealthVitals = async (
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

  const platform = getHealthPlatform();
  const providerName = getHealthProviderName();
  const sourceName = platform === 'ios' ? 'Apple Health' : platform === 'android' ? 'Google Health Connect' : 'Connected Health (Preview)';

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 1); // include current day

  const importedLogs: VitalsLog[] = [];
  let updatedCount = 0;

  try {
    if (isNativeHealthSupported()) {
      // 1. Native Health Queries (Apple HealthKit on iOS / Health Connect on Android)
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
        const sys = r.systolic || r.value?.systolic || (typeof r.value === 'number' ? r.value : 120);
        const dia = r.diastolic || r.value?.diastolic || 80;
        existing.systolic = Math.round(sys);
        existing.diastolic = Math.round(dia);
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
        const bpm = Math.round(r.bpm || r.heartRate || (typeof r.value === 'number' ? r.value : 0));
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
        const steps = Math.round(r.steps || (typeof r.value === 'number' ? r.value : 0));
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
        let hours = 0;
        if (r.durationMinutes) {
          hours = r.durationMinutes / 60;
        } else if (r.startDate && r.endDate) {
          hours = (new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / (1000 * 60 * 60);
        } else if (typeof r.value === 'number') {
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
        const spo2 = Math.round(r.percentage || (typeof r.value === 'number' ? r.value : 0));
        if (spo2 > 0) existing.spo2 = spo2;
        dayMap.set(key, existing);
      });

      // Process Body Temperature
      tempRecords.forEach((r: any) => {
        const t = r.startDate ? new Date(r.startDate).getTime() : Date.now();
        const key = getDayKey(t);
        const existing = dayMap.get(key) || { timestamp: t };
        const temp = Number(r.temperature || (typeof r.value === 'number' ? r.value : 0));
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
            return (
              lDate === dayKey &&
              (log.source === sourceName ||
                log.source === 'Google Health Connect' ||
                log.source === 'Apple Health' ||
                log.source === 'apple_health')
            );
          })
          .first();

        if (existingInDb) {
          await db.vitalsLogs.update(existingInDb.id, {
            ...metrics,
            source: sourceName,
            notes: existingInDb.notes || `Imported from ${sourceName}`,
          });
          updatedCount++;
          importedLogs.push({ ...existingInDb, ...metrics });
        } else {
          const newEntry: VitalsLog = {
            id: uuidv4(),
            journeyId,
            timestamp: ts,
            type: 'WEARABLE',
            source: sourceName,
            notes: `Imported from ${sourceName}`,
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
              (log.source === sourceName ||
                log.source === 'Google Health Connect' ||
                log.source === 'Google Health Connect (Preview)' ||
                log.source === 'Apple Health' ||
                log.source === 'Apple Health (Preview)') &&
              new Date(log.timestamp).toDateString() === dayStr
            );
          })
          .first();

        if (existing) {
          await db.vitalsLogs.update(existing.id, {
            ...mock,
            source: sourceName,
          });
          updatedCount++;
          importedLogs.push({ ...existing, ...mock });
        } else {
          const newEntry: VitalsLog = {
            id: uuidv4(),
            journeyId,
            type: 'WEARABLE',
            source: sourceName,
            notes: `Imported from ${sourceName}`,
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
      message: `Successfully synchronized ${importedLogs.length} days of ${providerName} records into local database.`,
      syncedLogs: importedLogs,
    };
  } catch (err: any) {
    console.error(`Error synchronizing ${providerName} vitals:`, err);
    return {
      success: false,
      importedCount: 0,
      updatedCount: 0,
      message: `Failed to synchronize with ${providerName}.`,
      error: err?.message || String(err),
      syncedLogs: [],
    };
  }
};

export const syncHealthConnectVitals = syncHealthVitals;
