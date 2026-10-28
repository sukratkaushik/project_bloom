import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface IosMonetizationConfig {
  isIosPaywallActive: boolean;
  isAndroidPaywallActive: boolean;
  introPriceUsd: number;
  regularPriceUsd: number;
  discountPercentage: number;
  dailyFoodScanLimit: number;
  dailyAiChatLimit: number;
  dailyReportLimit: number;
}

export type MobileMonetizationConfig = IosMonetizationConfig;

export const DEFAULT_IOS_CONFIG: IosMonetizationConfig = {
  isIosPaywallActive: true,      // Set to true to require Apple App Store subscription
  isAndroidPaywallActive: true,  // Set to true to require Google Play Billing subscription
  introPriceUsd: 2.99,          // Discounted intro price
  regularPriceUsd: 9.99,        // Regular price
  discountPercentage: 70,       // 70% off
  dailyFoodScanLimit: 25,       // Max 25 food scans/day
  dailyAiChatLimit: 60,         // Max 60 chats/day
  dailyReportLimit: 10          // Max 10 reports/day
};

const LOCAL_STORAGE_KEY = 'opin_ios_monetization_config';

/**
 * Reads the latest monetization config (local storage fast-path, then cloud).
 */
export function getLocalMonetizationConfig(): IosMonetizationConfig {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_IOS_CONFIG, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_IOS_CONFIG;
}

/**
 * Saves monetization configuration locally and broadcasts change event.
 */
export function saveLocalMonetizationConfig(config: Partial<IosMonetizationConfig>): IosMonetizationConfig {
  const current = getLocalMonetizationConfig();
  const updated = { ...current, ...config };
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('opin_monetization_changed', { detail: updated }));
  } catch (err) {
    console.warn('Could not save local monetization config:', err);
  }
  return updated;
}

/**
 * Syncs monetization config to Firestore (Admin only)
 */
export async function syncMonetizationConfigToCloud(config: IosMonetizationConfig): Promise<boolean> {
  saveLocalMonetizationConfig(config);
  try {
    const configRef = doc(db, 'system_config', 'ios_pricing');
    await setDoc(configRef, {
      ...config,
      updatedAt: Date.now()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Could not sync monetization config to Firestore (falling back to local):', err);
    return false;
  }
}

/**
 * Loads monetization config from Firestore with fallback to local defaults.
 */
export async function loadMonetizationConfigFromCloud(): Promise<IosMonetizationConfig> {
  try {
    const configRef = doc(db, 'system_config', 'ios_pricing');
    const snap = await getDoc(configRef);
    if (snap.exists()) {
      const data = snap.data() as Partial<IosMonetizationConfig>;
      const merged = { ...DEFAULT_IOS_CONFIG, ...data };
      saveLocalMonetizationConfig(merged);
      return merged;
    }
  } catch (err) {
    // Graceful fallback
  }
  return getLocalMonetizationConfig();
}
