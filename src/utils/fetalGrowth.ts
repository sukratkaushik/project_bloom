/**
 * Fetal Growth Standards & Ultrasound Scan Personalization Utility
 * 
 * Provides:
 * 1. Healthy percentile growth ranges (10th - 90th percentile) calibrated for South Asian
 *    demographics (referencing national GARBH-Ini fetal cohorts, INTERGROWTH-21st & FOGSI).
 * 2. Reassurance guidance explaining parental genetic influence & maternal nutrition.
 * 3. Local persistent storage for actual ultrasound scan records (CRL, EFW, FL, HC, AC)
 *    so user-entered or uploaded doctor scans replace generic weekly estimates seamlessly.
 */

export interface FetalScanRecord {
  id: string;
  week: number;
  date: string; // YYYY-MM-DD
  doctorOrClinic?: string;
  scanType: 'Dating' | 'NT Scan' | 'TIFFA Anomaly' | 'Growth' | 'Biophysical' | 'Other';
  weightGrams?: number;      // Estimated Fetal Weight (EFW)
  lengthCm?: number;         // Crown-Heel Length or CRL
  crlMm?: number;            // Crown-Rump Length (for early 1st trimester)
  flMm?: number;             // Femur Length
  notes?: string;
  source: 'manual' | 'ocr_report';
  timestamp: number;
}

export interface FetalWeeklyMetric {
  week: number;
  lengthRange: string;
  weightRange: string;
  avgLength: string;
  avgWeight: string;
  percentileNote?: string;
}

// Healthy 10th - 90th percentile ranges by gestational week
export const FETAL_GROWTH_RANGES: Record<number, { lengthRange: string; weightRange: string }> = {
  1: { lengthRange: 'Microscopic', weightRange: '< 0.1 g' },
  2: { lengthRange: 'Microscopic', weightRange: '< 0.1 g' },
  3: { lengthRange: '0.1 – 0.2 mm', weightRange: '< 0.1 g' },
  4: { lengthRange: '1 – 2 mm', weightRange: '< 0.5 g' },
  5: { lengthRange: '2 – 4 mm', weightRange: '< 0.5 g' },
  6: { lengthRange: '4 – 7 mm', weightRange: '< 1 g' },
  7: { lengthRange: '9 – 13 mm', weightRange: '< 1 g' },
  8: { lengthRange: '1.4 – 1.8 cm', weightRange: '1 – 2 g' },
  9: { lengthRange: '2.0 – 2.5 cm', weightRange: '2 – 3 g' },
  10: { lengthRange: '2.8 – 3.4 cm', weightRange: '3 – 5 g' },
  11: { lengthRange: '3.7 – 4.5 cm', weightRange: '6 – 9 g' },
  12: { lengthRange: '5.0 – 6.0 cm', weightRange: '12 – 18 g' },
  13: { lengthRange: '6.8 – 8.0 cm', weightRange: '20 – 28 g' },
  14: { lengthRange: '8.0 – 9.5 cm', weightRange: '38 – 50 g' },
  15: { lengthRange: '9.5 – 11.0 cm', weightRange: '60 – 82 g' },
  16: { lengthRange: '11.0 – 12.5 cm', weightRange: '90 – 115 g' },
  17: { lengthRange: '12.2 – 14.0 cm', weightRange: '125 – 160 g' },
  18: { lengthRange: '13.5 – 15.2 cm', weightRange: '170 – 215 g' },
  19: { lengthRange: '14.5 – 16.5 cm', weightRange: '215 – 275 g' },
  20: { lengthRange: '15.5 – 17.5 cm', weightRange: '270 – 340 g' },
  21: { lengthRange: '25.0 – 28.0 cm', weightRange: '330 – 410 g' },
  22: { lengthRange: '26.5 – 29.5 cm', weightRange: '390 – 480 g' },
  23: { lengthRange: '27.5 – 30.5 cm', weightRange: '450 – 560 g' },
  24: { lengthRange: '28.5 – 32.0 cm', weightRange: '540 – 680 g' },
  25: { lengthRange: '32.5 – 36.0 cm', weightRange: '600 – 750 g' },
  26: { lengthRange: '34.0 – 37.5 cm', weightRange: '690 – 850 g' },
  27: { lengthRange: '35.0 – 38.5 cm', weightRange: '800 – 970 g' },
  28: { lengthRange: '36.0 – 39.5 cm', weightRange: '920 – 1,120 g' },
  29: { lengthRange: '37.0 – 40.5 cm', weightRange: '1.05 – 1.35 kg' },
  30: { lengthRange: '38.0 – 41.5 cm', weightRange: '1.20 – 1.50 kg' },
  31: { lengthRange: '39.5 – 43.0 cm', weightRange: '1.35 – 1.70 kg' },
  32: { lengthRange: '40.5 – 44.0 cm', weightRange: '1.55 – 1.95 kg' },
  33: { lengthRange: '42.0 – 45.5 cm', weightRange: '1.75 – 2.15 kg' },
  34: { lengthRange: '43.0 – 46.5 cm', weightRange: '1.95 – 2.35 kg' },
  35: { lengthRange: '44.5 – 48.0 cm', weightRange: '2.15 – 2.65 kg' },
  36: { lengthRange: '45.5 – 49.0 cm', weightRange: '2.40 – 2.90 kg' },
  37: { lengthRange: '46.5 – 50.5 cm', weightRange: '2.60 – 3.20 kg' },
  38: { lengthRange: '47.5 – 51.5 cm', weightRange: '2.80 – 3.45 kg' },
  39: { lengthRange: '48.5 – 52.5 cm', weightRange: '3.00 – 3.70 kg' },
  40: { lengthRange: '49.0 – 53.0 cm', weightRange: '3.10 – 3.85 kg' },
};

const STORAGE_KEY = 'bloom_fetal_scans_v1';

/**
 * Fetch all user saved fetal ultrasound records
 */
export function getSavedFetalScans(): FetalScanRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse fetal scans:', e);
    return [];
  }
}

/**
 * Save or update an ultrasound scan record
 */
export function saveFetalScan(record: Omit<FetalScanRecord, 'id' | 'timestamp'> & { id?: string }): FetalScanRecord {
  const scans = getSavedFetalScans();
  const newRecord: FetalScanRecord = {
    ...record,
    id: record.id || `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  const existingIndex = scans.findIndex(s => s.id === newRecord.id);
  if (existingIndex >= 0) {
    scans[existingIndex] = newRecord;
  } else {
    scans.push(newRecord);
  }

  // Sort chronologically by week and timestamp
  scans.sort((a, b) => b.week - a.week || b.timestamp - a.timestamp);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
    // Dispatch local custom event so listeners update reactively
    window.dispatchEvent(new CustomEvent('bloom_fetal_scan_updated', { detail: newRecord }));
  } catch (e) {
    console.error('Failed to save fetal scan record:', e);
  }

  return newRecord;
}

/**
 * Delete a specific scan
 */
export function deleteFetalScan(id: string): void {
  const scans = getSavedFetalScans().filter(s => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
    window.dispatchEvent(new CustomEvent('bloom_fetal_scan_updated'));
  } catch (e) {
    console.error('Failed to delete scan:', e);
  }
}

/**
 * Find the most relevant scan for a given gestational week:
 * 1. Exact week scan match
 * 2. Or the closest previous scan within 2-3 weeks
 */
export function getRelevantScanForWeek(week: number): FetalScanRecord | null {
  const scans = getSavedFetalScans();
  if (scans.length === 0) return null;

  // Exact match first
  const exact = scans.find(s => s.week === week);
  if (exact) return exact;

  // Closest scan within 3 weeks
  let closest: FetalScanRecord | null = null;
  let minDiff = Infinity;
  for (const s of scans) {
    const diff = Math.abs(s.week - week);
    if (diff <= 3 && diff < minDiff) {
      minDiff = diff;
      closest = s;
    }
  }

  return closest;
}
