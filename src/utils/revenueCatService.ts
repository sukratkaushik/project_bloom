import { Capacitor } from '@capacitor/core';
import { Purchases, CustomerInfo, PurchasesOfferings } from '@revenuecat/purchases-capacitor';

// Public Apple RevenueCat API Key (can be configured via .env VITE_REVENUECAT_APPLE_KEY)
export const REVENUECAT_APPLE_API_KEY = (import.meta.env.VITE_REVENUECAT_APPLE_KEY as string) || 'appl_OurPregnancyProdKey';

// Entitlement identifier configured in RevenueCat dashboard
export const PRO_ENTITLEMENT_ID = 'pro';

export interface SubscriptionDetails {
  isActive: boolean;
  expirationDate: string | null;
  productIdentifier: string | null;
  willRenew: boolean;
}

let isInitialized = false;

/**
 * Initializes RevenueCat Purchases SDK on iOS devices.
 * Safe to call multiple times or on Web/Android (gracefully no-ops on non-iOS).
 */
export async function initRevenueCat(appUserId?: string): Promise<boolean> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    return false;
  }

  try {
    if (!isInitialized) {
      await Purchases.setLogLevel({ level: 'DEBUG' });
      await Purchases.configure({
        apiKey: REVENUECAT_APPLE_API_KEY,
        appUserID: appUserId || null
      });
      isInitialized = true;
      console.log('RevenueCat initialized successfully for iOS.');
    } else if (appUserId) {
      await Purchases.logIn({ appUserID: appUserId });
    }
    return true;
  } catch (error) {
    console.warn('RevenueCat initialization notice:', error);
    return false;
  }
}

/**
 * Retrieves the current user's Pro subscription status from RevenueCat.
 */
export async function checkRevenueCatSubscription(): Promise<SubscriptionDetails> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
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
 * Fetches available offerings configured in RevenueCat & App Store Connect.
 */
export async function getSubscriptionOfferings(): Promise<PurchasesOfferings | null> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
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
 * Triggers native Apple In-App Purchase / Face ID sheet for Pro subscription.
 */
export async function purchaseProSubscription(packageToPurchase?: any): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    return { success: false, error: 'In-app purchases are only available on iOS.' };
  }

  try {
    let result;
    if (packageToPurchase) {
      result = await Purchases.purchasePackage({ aPackage: packageToPurchase });
    } else {
      const offerings = await Purchases.getOfferings();
      const currentPackage = offerings.current?.monthly || offerings.current?.availablePackages?.[0];
      if (!currentPackage) {
        throw new Error('No active subscription package found in App Store Connect. Please ensure offerings are configured.');
      }
      result = await Purchases.purchasePackage({ aPackage: currentPackage });
    }

    const isPro = Boolean(result.customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]);
    return { success: isPro, customerInfo: result.customerInfo };
  } catch (error: any) {
    if (error?.userCancelled) {
      return { success: false, error: 'User cancelled transaction.' };
    }
    console.error('Apple purchase failed:', error);
    return { success: false, error: error?.message || 'Transaction could not be completed.' };
  }
}

/**
 * Restores previous App Store purchases for the current Apple ID.
 * Mandatory for Apple App Store Review compliance (Guideline 3.1.2).
 */
export async function restoreApplePurchases(): Promise<{ success: boolean; isActive: boolean; error?: string }> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    return { success: false, isActive: false, error: 'Restore purchases is only available on iOS.' };
  }

  try {
    const result = await Purchases.restorePurchases();
    const isPro = Boolean(result.customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]);
    return { success: true, isActive: isPro };
  } catch (error: any) {
    console.error('Apple restore purchases failed:', error);
    return { success: false, isActive: false, error: error?.message || 'Could not restore purchases.' };
  }
}

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
