import { BiometricAuth, BiometryType } from '@aparajita/capacitor-biometric-auth';

export const BIOMETRIC_LOCK_STORAGE_KEY = 'bloom_biometric_lock_enabled';
export const BIOMETRIC_LAST_ACTIVE_KEY = 'bloom_last_active_timestamp';
export const BIOMETRIC_PREFERRED_MODE_KEY = 'bloom_biometric_preferred_mode';
export const BIOMETRIC_GRACE_PERIOD_MS = 60 * 1000; // 1-minute grace period

export type BiometricMode = 'auto' | 'face' | 'fingerprint' | 'pin';

export const isNativePlatform = (): boolean => {
  return typeof window !== 'undefined' && Boolean((window as any).Capacitor?.isNativePlatform?.());
};

export interface BiometricStatus {
  isSupported: boolean;
  hasEnrolledBiometrics: boolean;
  isDeviceSecure: boolean;
  biometryType: 'face' | 'fingerprint' | 'biometric' | 'none';
  availableTypes: ('face' | 'fingerprint' | 'iris')[];
  supportsFace: boolean;
  supportsFingerprint: boolean;
  preferredMode: BiometricMode;
  label: string;
}

/**
 * Gets the user's preferred authentication mode ('auto' | 'face' | 'fingerprint' | 'pin').
 */
export function getPreferredBiometricMode(): BiometricMode {
  if (typeof window === 'undefined') return 'auto';
  try {
    const saved = localStorage.getItem(BIOMETRIC_PREFERRED_MODE_KEY) as BiometricMode;
    if (saved && ['auto', 'face', 'fingerprint', 'pin'].includes(saved)) {
      return saved;
    }
  } catch {}
  return 'auto';
}

/**
 * Saves the user's preferred authentication mode.
 */
export function setPreferredBiometricMode(mode: BiometricMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BIOMETRIC_PREFERRED_MODE_KEY, mode);
  } catch (e) {
    console.warn('Failed to save preferred biometric mode', e);
  }
}

/**
 * Checks the hardware and enrollment status of biometrics on the device.
 */
export async function checkBiometricSupport(): Promise<BiometricStatus> {
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const preferredMode = getPreferredBiometricMode();

  if (!isNativePlatform()) {
    // Web fallback / check for WebAuthn
    const hasWebAuthn = typeof window !== 'undefined' && Boolean(window.PublicKeyCredential);
    let label = 'Face ID / Fingerprint';
    if (preferredMode === 'face') label = isIOS ? 'Face ID' : 'Face Unlock';
    else if (preferredMode === 'fingerprint') label = isIOS ? 'Touch ID' : 'Fingerprint';
    else label = hasWebAuthn ? 'Face ID / Fingerprint / Passkey' : 'Face ID / Fingerprint';

    return {
      isSupported: hasWebAuthn,
      hasEnrolledBiometrics: false,
      isDeviceSecure: false,
      biometryType: hasWebAuthn ? 'biometric' : 'none',
      availableTypes: hasWebAuthn ? ['face', 'fingerprint'] : [],
      supportsFace: true,
      supportsFingerprint: true,
      preferredMode,
      label,
    };
  }

  try {
    const result = await BiometricAuth.checkBiometry();
    const availableTypes: ('face' | 'fingerprint' | 'iris')[] = [];

    if (result.biometryTypes && result.biometryTypes.length > 0) {
      if (
        result.biometryTypes.includes(BiometryType.faceId) ||
        result.biometryTypes.includes(BiometryType.faceAuthentication)
      ) {
        availableTypes.push('face');
      }
      if (
        result.biometryTypes.includes(BiometryType.touchId) ||
        result.biometryTypes.includes(BiometryType.fingerprintAuthentication)
      ) {
        availableTypes.push('fingerprint');
      }
      if (result.biometryTypes.includes(BiometryType.irisAuthentication)) {
        availableTypes.push('iris');
      }
    } else if (result.biometryType) {
      if (
        result.biometryType === BiometryType.faceId ||
        result.biometryType === BiometryType.faceAuthentication
      ) {
        availableTypes.push('face');
      } else if (
        result.biometryType === BiometryType.touchId ||
        result.biometryType === BiometryType.fingerprintAuthentication
      ) {
        availableTypes.push('fingerprint');
      }
    }

    const supportsFace = availableTypes.includes('face') || (isIOS && !availableTypes.includes('fingerprint'));
    const supportsFingerprint = availableTypes.includes('fingerprint') || (!isIOS && availableTypes.length === 0);

    let biometryType: 'face' | 'fingerprint' | 'biometric' | 'none' = 'none';
    if (availableTypes.includes('face') && !availableTypes.includes('fingerprint')) {
      biometryType = 'face';
    } else if (availableTypes.includes('fingerprint') && !availableTypes.includes('face')) {
      biometryType = 'fingerprint';
    } else if (availableTypes.length > 0) {
      biometryType = 'biometric';
    }

    let label = 'Face ID / Fingerprint';
    if (preferredMode === 'face') {
      label = isIOS ? 'Face ID' : 'Face Unlock';
    } else if (preferredMode === 'fingerprint') {
      label = isIOS ? 'Touch ID' : 'Fingerprint';
    } else if (preferredMode === 'pin') {
      label = 'Device PIN / Pattern';
    } else {
      // Auto mode
      if (biometryType === 'face') {
        label = isIOS ? 'Face ID' : 'Face Unlock';
      } else if (biometryType === 'fingerprint') {
        label = isIOS ? 'Touch ID' : 'Fingerprint';
      } else {
        label = 'Face ID / Fingerprint';
      }
    }

    return {
      isSupported: result.isAvailable || result.deviceIsSecure,
      hasEnrolledBiometrics: result.isAvailable || result.strongBiometryIsAvailable,
      isDeviceSecure: result.deviceIsSecure,
      biometryType,
      availableTypes,
      supportsFace,
      supportsFingerprint,
      preferredMode,
      label,
    };
  } catch (error) {
    console.warn('Failed to check biometric status:', error);
    return {
      isSupported: false,
      hasEnrolledBiometrics: false,
      isDeviceSecure: false,
      biometryType: 'none',
      availableTypes: [],
      supportsFace: true,
      supportsFingerprint: true,
      preferredMode,
      label: preferredMode === 'face' ? 'Face Unlock' : preferredMode === 'fingerprint' ? 'Fingerprint' : 'Face ID / Fingerprint',
    };
  }
}

/**
 * Prompts the unified native BiometricPrompt dialog.
 * Automatically supports Fingerprint, Face Unlock, and device PIN/Pattern fallback.
 */
export async function authenticateWithBiometrics(
  customReason?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isNativePlatform()) {
    // On web, mock success for dev/preview
    return { success: true };
  }

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const mode = getPreferredBiometricMode();

  let reason = customReason;
  let androidTitle = 'Our Pregnancy Maternal Shield';
  let androidSubtitle = 'Confirm your Face Unlock, Fingerprint, or PIN to continue';

  if (mode === 'face') {
    androidTitle = 'Our Pregnancy Face Unlock';
    androidSubtitle = 'Look at the camera or enter screen lock PIN to continue';
    if (!reason) reason = isIOS ? 'Unlock Our Pregnancy with Face ID' : 'Unlock Our Pregnancy with Face Unlock';
  } else if (mode === 'fingerprint') {
    androidTitle = 'Our Pregnancy Fingerprint Unlock';
    androidSubtitle = 'Touch the fingerprint sensor or enter screen lock PIN to continue';
    if (!reason) reason = isIOS ? 'Unlock Our Pregnancy with Touch ID' : 'Unlock Our Pregnancy with Fingerprint';
  } else {
    if (!reason) reason = 'Unlock Our Pregnancy to access your maternal health records';
  }

  try {
    await BiometricAuth.authenticate({
      reason,
      cancelTitle: 'Cancel',
      allowDeviceCredential: true, // Graceful fallback to phone PIN / pattern
      androidTitle,
      androidSubtitle,
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
