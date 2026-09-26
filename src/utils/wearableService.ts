import { db, VitalsLog } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { syncHealthConnectVitals } from './healthConnectBridge';

export interface WearableDevice {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isNativeHealth?: boolean;
}

export const WEARABLE_DEVICES: WearableDevice[] = [
  {
    id: 'google_health',
    name: 'Google Health Connect',
    description: 'Sync blood pressure, weight, heart rate, steps, sleep, and SpO2 via Android Health Connect.',
    color: '#4285F4',
    icon: '🩺',
    isNativeHealth: true
  },
  {
    id: 'apple_health',
    name: 'Apple Health',
    description: 'Sync heart rate, physical activity, and sleep metrics from Apple Watch.',
    color: '#FF2D55',
    icon: '⌚'
  },
  {
    id: 'oura',
    name: 'Oura Ring',
    description: 'Import sleep stages, resting heart rate, HRV, and basal body temperature.',
    color: '#0052FF',
    icon: '💍'
  },
  {
    id: 'garmin',
    name: 'Garmin Connect',
    description: 'Import all-day heart rate, body battery, sleep, and step metrics.',
    color: '#000000',
    icon: '🧭'
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    description: 'Sync steps, sleep quality, and daily active zone minutes.',
    color: '#00B0B9',
    icon: '💠'
  }
];

/**
 * Generates realistic pregnancy-related biometrics for simulation.
 * Pregnancy ranges:
 * - Resting Heart Rate: elevated (70-85 bpm) vs normal baseline (60-70 bpm)
 * - HRV: slightly reduced (35-50 ms) vs normal baseline (50-65 ms)
 * - Basal Body Temperature: elevated (36.5°C - 37.1°C)
 * - Steps: 3,000 - 9,000 steps/day
 * - Sleep: 6 - 9 hours
 * - SpO2: 95% - 99%
 */
export function generateMockBiometrics(source: string, daysAgo: number): {
  restingHeartRate: number;
  hrv: number;
  basalBodyTemp: number;
  steps: number;
  sleepHours: number;
  spo2: number;
} {
  // Use a pseudo-random seed based on source and daysAgo to keep data consistent
  const sourceCode = source.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = Math.sin(daysAgo * 123.45 + sourceCode * 67.89) * 10000;
  const pseudoRand = seed - Math.floor(seed);

  // Slight downward trend in temperature and HRV as the pregnancy progresses towards 0 days ago (approaching labor)
  const tempDrift = -0.15 * Math.max(0, 3 - daysAgo) * pseudoRand; // temperature dip right before birth
  const hrvDrift = -5 * Math.max(0, 3 - daysAgo) * pseudoRand; // HRV drop right before birth
  const rhrDrift = 3 * Math.max(0, 3 - daysAgo) * pseudoRand; // RHR spike right before birth

  const restingHeartRate = Math.round(71 + rhrDrift + pseudoRand * 8);
  const hrv = Math.round(39 + hrvDrift + pseudoRand * 10);
  const basalBodyTemp = Math.round((36.6 + tempDrift + pseudoRand * 0.3) * 10) / 10;
  const steps = Math.round(3800 + pseudoRand * 5000);
  const sleepHours = Math.round((6.2 + pseudoRand * 2.2) * 10) / 10;
  const spo2 = Math.round(96 + pseudoRand * 3);

  return { restingHeartRate, hrv, basalBodyTemp, steps, sleepHours, spo2 };
}

/**
 * Syncs data for the last 7 days for a given wearable source into Dexie DB.
 */
export async function syncWearableData(journeyId: string, source: string): Promise<VitalsLog[]> {
  if (source === 'google_health' || source === 'google_fit' || source === 'Google Health Connect') {
    const res = await syncHealthConnectVitals(journeyId, 7);
    return res.syncedLogs;
  }

  const syncedRecords: VitalsLog[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    // Set time to 8:00 AM for clean rendering
    date.setHours(8, 0, 0, 0);
    const timestamp = date.getTime();

    // Check if record already exists for this day and source
    const existing = await db.vitalsLogs
      .where('journeyId')
      .equals(journeyId)
      .filter(log => {
        if (log.type !== 'WEARABLE' || log.source !== source) return false;
        const logDate = new Date(log.timestamp);
        return logDate.toDateString() === date.toDateString();
      })
      .toArray();

    if (existing.length === 0) {
      const biometrics = generateMockBiometrics(source, i);
      const newLog: VitalsLog = {
        id: uuidv4(),
        journeyId,
        timestamp,
        type: 'WEARABLE',
        source,
        notes: `Imported via ${source} sync.`,
        ...biometrics
      };
      await db.vitalsLogs.put(newLog);
      syncedRecords.push(newLog);
    } else {
      syncedRecords.push(existing[0]);
    }
  }

  // Sort by timestamp descending
  return syncedRecords.sort((a, b) => b.timestamp - a.timestamp);
}
