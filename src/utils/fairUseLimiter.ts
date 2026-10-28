/**
 * Fair Use Protection Service
 * Protects maternal AI services from scrapers, bot abuse, and excessive API usage
 * while ensuring legitimate expectant mothers enjoy unlimited daily personal care.
 */

export interface FairUseLimits {
  food_scan: number;
  ai_chat: number;
  medical_report: number;
}

export const DEFAULT_FAIR_USE_LIMITS: FairUseLimits = {
  food_scan: 25,       // Max 25 food scans / day (typical user scans 3-5 times)
  ai_chat: 60,         // Max 60 maternal AI questions / day
  medical_report: 10   // Max 10 lab / ultrasound reports / day
};

const STORAGE_PREFIX = 'opin_fair_use_';

function getTodayKey(): string {
  const now = new Date();
  return `${STORAGE_PREFIX}${now.toISOString().split('T')[0]}`;
}

interface DailyUsageRecord {
  food_scan?: number;
  ai_chat?: number;
  medical_report?: number;
}

function getTodayUsage(): DailyUsageRecord {
  try {
    const raw = localStorage.getItem(getTodayKey());
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveTodayUsage(usage: DailyUsageRecord): void {
  try {
    localStorage.setItem(getTodayKey(), JSON.stringify(usage));
  } catch (err) {
    console.warn('Could not save fair use stats:', err);
  }
}

/**
 * Checks if the user is within fair use limits for the requested action,
 * and increments the counter if permitted.
 */
export function checkAndIncrementFairUse(
  type: keyof FairUseLimits,
  customLimits: Partial<FairUseLimits> = {}
): { allowed: boolean; count: number; limit: number; remaining: number } {
  const limits: FairUseLimits = { ...DEFAULT_FAIR_USE_LIMITS, ...customLimits };
  const maxAllowed = limits[type] || DEFAULT_FAIR_USE_LIMITS[type];
  const usage = getTodayUsage();
  const currentCount = usage[type] || 0;

  if (currentCount >= maxAllowed) {
    return {
      allowed: false,
      count: currentCount,
      limit: maxAllowed,
      remaining: 0
    };
  }

  const newCount = currentCount + 1;
  usage[type] = newCount;
  saveTodayUsage(usage);

  return {
    allowed: true,
    count: newCount,
    limit: maxAllowed,
    remaining: Math.max(0, maxAllowed - newCount)
  };
}

/**
 * Gets remaining usage for all AI features for today.
 */
export function getFairUseStatus(customLimits: Partial<FairUseLimits> = {}): Record<keyof FairUseLimits, { count: number; limit: number; remaining: number }> {
  const limits: FairUseLimits = { ...DEFAULT_FAIR_USE_LIMITS, ...customLimits };
  const usage = getTodayUsage();

  return {
    food_scan: {
      count: usage.food_scan || 0,
      limit: limits.food_scan,
      remaining: Math.max(0, limits.food_scan - (usage.food_scan || 0))
    },
    ai_chat: {
      count: usage.ai_chat || 0,
      limit: limits.ai_chat,
      remaining: Math.max(0, limits.ai_chat - (usage.ai_chat || 0))
    },
    medical_report: {
      count: usage.medical_report || 0,
      limit: limits.medical_report,
      remaining: Math.max(0, limits.medical_report - (usage.medical_report || 0))
    }
  };
}
