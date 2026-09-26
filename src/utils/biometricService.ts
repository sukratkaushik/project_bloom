import { BiometricAuth, BiometryType } from '@aparajita/capacitor-biometric-auth';

export const BIOMETRIC_LOCK_STORAGE_KEY = 'bloom_biometric_lock_enabled';
export const BIOMETRIC_LAST_ACTIVE_KEY = 'bloom_last_active_timestamp';
export const BIOMETRIC_GRACE_PERIOD_MS = 60 * 1000; // 1-minute grace period

export const isNativePlatform = (): boolean => {
  return typeof window !== 'undefined' && Boolean((window as any).Capacitor?.isNativePlatform?.());
};

export interface BiometricStatus {
  isSupported: boolean;
  hasEnrolledBiometrics: boolean;
  isDeviceSecure: boolean;
  biometryType: 'face' | 'fingerprint' | 'biometric' | 'none';
  label: string;
}

/**
 * Checks the hardware and enrollment status of biometrics on the device.
 */
export async function checkBiometricSupport(): Promise<BiometricStatus> {
  if (!isNativePlatform()) {
    // Web fallback / check for WebAuthn
    const hasWebAuthn = typeof window !== 'undefined' && Boolean(window.PublicKeyCredential);
    return {
      isSupported: hasWebAuthn,
      hasEnrolledBiometrics: false,
      isDeviceSecure: false,
      biometryType: hasWebAuthn ? 'biometric' : 'none',
      label: hasWebAuthn ? 'Browser Passkey' : 'None',
    };
  }

  try {
    const result = await BiometricAuth.checkBiometry();

    let biometryType: 'face' | 'fingerprint' | 'biometric' | 'none' = 'none';
    let label = 'Biometrics';

    if (
      result.biometryType === BiometryType.faceId ||
      result.biometryType === BiometryType.faceAuthentication
    ) {
      biometryType = 'face';
      label = 'Face Unlock';
    } else if (
      result.biometryType === BiometryType.touchId ||
      result.biometryType === BiometryType.fingerprintAuthentication
    ) {
      biometryType = 'fingerprint';
      label = 'Fingerprint';
    } else if (result.biometryTypes && result.biometryTypes.length > 0) {
      biometryType = 'biometric';
      label = 'Fingerprint / Face';
    }

    return {
      isSupported: result.isAvailable || result.deviceIsSecure,
      hasEnrolledBiometrics: result.isAvailable || result.strongBiometryIsAvailable,
      isDeviceSecure: result.deviceIsSecure,
      biometryType,
      label,
    };
  } catch (error) {
    console.warn('Failed to check biometric status:', error);
    return {
      isSupported: false,
      hasEnrolledBiometrics: false,
      isDeviceSecure: false,
      biometryType: 'none',
      label: 'Unavailable',
    };
  }
}

/**
 * Prompts the unified native BiometricPrompt dialog.
 * Automatically supports Fingerprint, Face Unlock, and device PIN/Pattern fallback.
 */
export async function authenticateWithBiometrics(
  reason = 'Unlock Our Pregnancy to access your maternal health records'
): Promise<{ success: boolean; error?: string }> {
  if (!isNativePlatform()) {
    // On web, mock success for dev/preview
    return { success: true };
  }

  try {
    await BiometricAuth.authenticate({
      reason,
      cancelTitle: 'Cancel',
      allowDeviceCredential: true, // Graceful fallback to phone PIN / pattern
      androidTitle: 'Our Pregnancy Maternal Shield',
      androidSubtitle: 'Confirm your fingerprint, face, or PIN to continue',
      iosFallbackTitle: 'Enter Passcode',
    });

    return { success: true };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.warn('Biometric authentication cancelled or failed:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Persisted preference helpers
 */
export function isBiometricLockEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(BIOMETRIC_LOCK_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setBiometricLockEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (enabled) {
      localStorage.setItem(BIOMETRIC_LOCK_STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(BIOMETRIC_LOCK_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('Failed to save biometric preference', e);
  }
}
