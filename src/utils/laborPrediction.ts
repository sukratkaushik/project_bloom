/**
 * CONCEPTUAL ALGORITHM: Predictive Labor Readiness Score
 * 
 * Note: This is a conceptual algorithm designed for demonstration in a premium 
 * maternal health application. It uses physiological heuristics often discussed 
 * in clinical literature regarding the onset of spontaneous labor (e.g., HRV 
 * suppression, RHR elevation, BBT shifts, and increased uterine irritability).
 * 
 * THIS IS NOT A CLINICALLY VALIDATED DIAGNOSTIC TOOL.
 */

export interface DailyBiometrics {
  date: string;
  restingHeartRate: number | null; // bpm
  hrv: number | null; // ms (RMSSD)
  basalBodyTemp: number | null; // Celsius
  braxtonHicksCount: number | null;
}

export interface ReadinessResult {
  score: number; // 0-100
  confidence: number; // 0-100
  advisory: string;
  reasoning: string[];
  isDataSufficient: boolean;
}

/**
 * Calculates a predictive labor readiness score based on deviations from 
 * a user's historical baseline.
 * 
 * @param historicalBaseline - Array of daily biometrics representing the user's 30-day norm
 * @param recentData - Array of daily biometrics from the last 3-7 days
 * @returns ReadinessResult containing the score, confidence, and actionable advisory
 */
export function calculateLaborReadiness(
  historicalBaseline: DailyBiometrics[], 
  recentData: DailyBiometrics[]
): ReadinessResult {
  // 1. Data Validation & Confidence Scoring
  let confidence = 100;
  const reasoning: string[] = [];
  
  if (!recentData || recentData.length === 0) {
    return {
      score: 0,
      confidence: 0,
      advisory: "Insufficient recent data. Please sync your wearable device.",
      reasoning: ["Need more recent data to establish a trend."],
      isDataSufficient: false
    };
  }

  // Helper to calculate averages, ignoring nulls
  const getAvg = (data: DailyBiometrics[], key: keyof DailyBiometrics) => {
    const valid = data.map(d => d[key] as number).filter(v => v !== null && !isNaN(v));
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
  };

  const baseRHR = getAvg(historicalBaseline, 'restingHeartRate');
  const baseHRV = getAvg(historicalBaseline, 'hrv');
  const baseBBT = getAvg(historicalBaseline, 'basalBodyTemp');
  
  const recentRHR = getAvg(recentData, 'restingHeartRate');
  const recentHRV = getAvg(recentData, 'hrv');
  const recentBBT = getAvg(recentData, 'basalBodyTemp');
  const recentBH = getAvg(recentData, 'braxtonHicksCount');

  // Penalize confidence for missing data streams
  if (baseRHR === null || recentRHR === null) confidence -= 25;
  if (baseHRV === null || recentHRV === null) confidence -= 25;
  if (baseBBT === null || recentBBT === null) confidence -= 25;

  if (confidence < 30) {
    return {
      score: 0,
      confidence,
      advisory: "Please sync your wearable device. We need more baseline data to provide an accurate score.",
      reasoning: ["Missing critical baseline or recent biometric data streams."],
      isDataSufficient: false
    };
  }

  // 2. Scoring Logic (Max 100 points)
  let score = 0;

  // A. Heart Rate Variability (HRV) - 30 points
  // Clinical heuristic: HRV often drops as the body experiences physiological stress nearing labor.
  if (baseHRV !== null && recentHRV !== null) {
    const hrvDrop = baseHRV - recentHRV;
    if (hrvDrop > 10) {
      score += 30;
      reasoning.push("Significant drop in HRV detected, indicating physiological preparation.");
    } else if (hrvDrop > 5) {
      score += 15;
      reasoning.push("Slight drop in HRV detected.");
    }
  }

  // B. Resting Heart Rate (RHR) - 20 points
  // Clinical heuristic: RHR may elevate slightly due to increased cardiac output demands.
  if (baseRHR !== null && recentRHR !== null) {
    const rhrRise = recentRHR - baseRHR;
    if (rhrRise > 5) {
      score += 20;
      reasoning.push("Elevated resting heart rate compared to your baseline.");
    } else if (rhrRise > 2) {
      score += 10;
    }
  }

  // C. Basal Body Temperature (BBT) - 20 points
  // Clinical heuristic: Progesterone drops before labor, sometimes causing a slight BBT dip.
  if (baseBBT !== null && recentBBT !== null) {
    const bbtDrop = baseBBT - recentBBT;
    if (bbtDrop > 0.3) {
      score += 20;
      reasoning.push("Slight decrease in basal body temperature detected.");
    }
  }

  // D. Braxton Hicks / Uterine Irritability - 30 points
  // Clinical heuristic: Increased frequency of practice contractions.
  if (recentBH !== null) {
    if (recentBH >= 5) {
      score += 30;
      reasoning.push("High frequency of Braxton Hicks contractions logged.");
    } else if (recentBH >= 2) {
      score += 15;
      reasoning.push("Moderate uterine irritability logged.");
    }
  }

  // 3. Advisory Generation
  let advisory = "";
  if (score >= 80) {
    advisory = "High Readiness: Your biometrics show strong physiological shifts. Finalize your hospital bag and review your birth plan.";
  } else if (score >= 50) {
    advisory = "Elevated Readiness: Your body is beginning to show signs of preparation. Ensure your support team is on standby.";
  } else {
    advisory = "Baseline: Your biometrics are stable. Continue resting and monitoring your symptoms.";
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    confidence,
    advisory,
    reasoning,
    isDataSufficient: true
  };
}
