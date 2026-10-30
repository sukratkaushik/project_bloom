import { Capacitor } from '@capacitor/core';
import { Purchases, CustomerInfo, PurchasesOfferings, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

// Public Apple RevenueCat API Key (can be configured via .env VITE_REVENUECAT_APPLE_KEY)
export const REVENUECAT_APPLE_API_KEY = (import.meta.env.VITE_REVENUECAT_APPLE_KEY as string) || 'appl_OurPregnancyProdKey';

// Public Google Play RevenueCat API Key (can be configured via .env VITE_REVENUECAT_GOOGLE_KEY)
export const REVENUECAT_GOOGLE_API_KEY = (import.meta.env.VITE_REVENUECAT_GOOGLE_KEY as string) || 'goog_OurPregnancyProdKey';

// Entitlement identifier configured in RevenueCat dashboard
export const PRO_ENTITLEMENT_ID = 'pro';

// Default product / base plan identifiers for Google Play & App Store
export const PRO_MONTHLY_PRODUCT_ID = 'opin_pro_monthly';
export const PRO_MONTHLY_BASE_PLAN_ID = 'monthly-auto-renew';

export interface SubscriptionDetails {
  isActive: boolean;
  expirationDate: string | null;
  productIdentifier: string | null;
  willRenew: boolean;
}

let isInitialized = false;

function isSupportedNativeMobilePlatform(): boolean {
  if (!Capacitor.isNativePlatform()) return false;
  const platform = Capacitor.getPlatform();
  return platform === 'ios' || platform === 'android';
}

/**
 * Initializes RevenueCat Purchases SDK on iOS (StoreKit 2) and Android (Google Play Billing).
 * Safe to call multiple times or on Web (gracefully no-ops on Web).
 */
export async function initRevenueCat(appUserId?: string): Promise<boolean> {
  if (!isSupportedNativeMobilePlatform()) {
    return false;
  }

  const platform = Capacitor.getPlatform();
  const apiKey = platform === 'android' ? REVENUECAT_GOOGLE_API_KEY : REVENUECAT_APPLE_API_KEY;

  try {
    if (!isInitialized) {
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
      await Purchases.configure({
        apiKey,
        appUserID: appUserId || null
      });
      isInitialized = true;
      console.log(`RevenueCat initialized successfully for ${platform}.`);
    } else if (appUserId) {
      await Purchases.logIn({ appUserID: appUserId });
    }
    return true;
  } catch (error) {
    console.warn(`RevenueCat initialization notice (${platform}):`, error);
    return false;
  }
}

/**
 * Retrieves the current user's Pro subscription status from RevenueCat (iOS & Android).
 */
export async function checkRevenueCatSubscription(): Promise<SubscriptionDetails> {
  if (!isSupportedNativeMobilePlatform()) {
    return { isActive: false, expirationDate: null, productIdentifier: null, willRenew: false };
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return parseCustomerInfo(customerInfo.customerInfo);
  } catch (error) {
    console.warn('Could not fetch RevenueCat customer info:', error);
    return { isActive: false, expirationDate: null, productIdentifier: null, willRenew: false };
  }
}

/**
 * Fetches available offerings configured in RevenueCat (App Store Connect & Google Play Console).
 */
export async function getSubscriptionOfferings(): Promise<PurchasesOfferings | null> {
  if (!isSupportedNativeMobilePlatform()) {
    return null;
  }

  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.warn('Could not fetch RevenueCat offerings:', error);
    return null;
  }
}

/**
 * Triggers native In-App Purchase sheet:
 * - iOS: Apple StoreKit 2 / Face ID sheet
 * - Android: Google Play Billing sheet (supports basePlanId & introductory offers)
 */
export async function purchaseProSubscription(packageToPurchase?: any): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
  if (!isSupportedNativeMobilePlatform()) {
    return { success: false, error: 'In-app subscriptions are only available on the iOS and Android mobile apps.' };
  }

  const platform = Capacitor.getPlatform();
  const storeName = platform === 'android' ? 'Google Play Console' : 'App Store Connect';

  try {
    let result;
    if (packageToPurchase) {
      result = await Purchases.purchasePackage({ aPackage: packageToPurchase });
    } else {
      const offerings = await Purchases.getOfferings();
      const availablePackages = offerings.current?.availablePackages || [];

      // Match monthly package or explicit opin_pro_monthly / basePlanId package
      const matchedPackage =
        offerings.current?.monthly ||
        availablePackages.find((pkg: any) =>
          pkg?.product?.identifier?.includes(PRO_MONTHLY_PRODUCT_ID) ||
          pkg?.product?.defaultOption?.basePlanId === PRO_MONTHLY_BASE_PLAN_ID ||
          pkg?.identifier === '$rc_monthly'
        ) ||
        availablePackages[0];

      if (!matchedPackage) {
        throw new Error(`No active subscription package found in ${storeName}. Please ensure offerings and base plans are configured.`);
      }

      result = await Purchases.purchasePackage({ aPackage: matchedPackage });
    }

    const isPro = Boolean(result.customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]);
    return { success: isPro, customerInfo: result.customerInfo };
  } catch (error: any) {
    if (error?.userCancelled) {
      return { success: false, error: 'User cancelled transaction.' };
    }
    console.error(`${platform === 'android' ? 'Google Play' : 'Apple'} purchase failed:`, error);
    return { success: false, error: error?.message || 'Transaction could not be completed.' };
  }
}

/**
 * Restores previous App Store or Google Play purchases for the current store account.
 */
export async function restorePurchases(): Promise<{ success: boolean; isActive: boolean; error?: string }> {
  if (!isSupportedNativeMobilePlatform()) {
    return { success: false, isActive: false, error: 'Restore purchases is only available on iOS and Android.' };
  }

  const platform = Capacitor.getPlatform();

  try {
    const result = await Purchases.restorePurchases();
    const isPro = Boolean(result.customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]);
    return { success: true, isActive: isPro };
  } catch (error: any) {
    console.error(`${platform === 'android' ? 'Google Play' : 'Apple'} restore purchases failed:`, error);
    return { success: false, isActive: false, error: error?.message || 'Could not restore purchases.' };
  }
}

// Backwards-compatible alias
export const restoreApplePurchases = restorePurchases;

function parseCustomerInfo(info: CustomerInfo): SubscriptionDetails {
  const entitlement = info.entitlements.active[PRO_ENTITLEMENT_ID];
  if (entitlement) {
    return {
      isActive: true,
      expirationDate: entitlement.expirationDate || null,
      productIdentifier: entitlement.productIdentifier,
      willRenew: entitlement.willRenew
    };
  }
  return {
    isActive: false,
    expirationDate: null,
    productIdentifier: null,
    willRenew: false
  };
}
