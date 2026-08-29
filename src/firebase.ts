import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile, sendEmailVerification } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFunctions } from 'firebase/functions';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const functions = getFunctions(app, "asia-south1");

export interface UserProfile {
  uid: string;
  isSetup: boolean;
  activeJourneyId?: string;
  email: string | null;
  displayName: string | null;
  role?: 'admin' | 'user';
  planTier?: 'free' | 'standard' | 'premium';
  planExpiry?: number | null; // timestamp in ms, or null for lifetime
  emailVerified?: boolean;
  createdAt: number;
  updatedAt: number;
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    return null;
  }
};

export const saveUserProfile = async (uid: string, profile: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...profile,
      uid,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
  }
};

// Admin Functions
export const getAllUsersForAdmin = async (): Promise<UserProfile[]> => {
  // 1. Try server-side Cloud Function first (combines Firebase Auth + Firestore users)
  try {
    const { httpsCallable } = await import('firebase/functions');
    const fn = httpsCallable(functions, 'getAdminUsersList');
    const res = await fn() as { data: { users: UserProfile[] } };
    if (res?.data?.users && Array.isArray(res.data.users)) {
      return res.data.users;
    }
  } catch (fnErr) {
    console.warn("Cloud function getAdminUsersList unreachable, using direct Firestore fallback:", fnErr);
  }

  // 2. Fallback: Direct Firestore collection query
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as UserProfile);
  } catch (error) {
    console.error("Error fetching all users for admin:", error);
    throw error;
  }
};

export const deleteUserByAdminCallable = async (targetUid: string): Promise<{ success: boolean; message?: string }> => {
  const { httpsCallable } = await import('firebase/functions');
  const fn = httpsCallable(functions, 'deleteUserByAdmin');
  const res = await fn({ targetUid }) as { data: { success: boolean; message?: string } };
  return res.data;
};

export const updateUserSubscription = async (
  targetUid: string,
  planTier: 'free' | 'standard' | 'premium',
  months: number | null
) => {
  try {
    const userRef = doc(db, 'users', targetUid);
    const planExpiry = months ? Date.now() + months * 30 * 24 * 60 * 60 * 1000 : null;
    await setDoc(userRef, {
      planTier,
      planExpiry,
      updatedAt: Date.now()
    }, { merge: true });
    return { planTier, planExpiry };
  } catch (error) {
    console.error("Error updating user subscription:", error);
    throw error;
  }
};

export const setUserRole = async (targetUid: string, role: 'admin' | 'user') => {
  try {
    const userRef = doc(db, 'users', targetUid);
    await setDoc(userRef, {
      role,
      updatedAt: Date.now()
    }, { merge: true });
    return role;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

export const sendPlanChangeEmail = async (
  targetEmail: string,
  targetName: string | null | undefined,
  planTier: 'standard' | 'premium',
  durationMonths: number | null
) => {
  try {
    const { httpsCallable } = await import('firebase/functions');
    const fn = httpsCallable(functions, 'sendPlanChangeNotificationEmail');
    const res = await fn({
      targetEmail,
      targetName: targetName || '',
      planTier,
      durationMonths,
    });
    return res.data as { success: boolean; message?: string; error?: string };
  } catch (error) {
    console.error("Error sending plan change notification email:", error);
    return { success: false, error: String(error) };
  }
};

// Initialize Analytics safely
export const analyticsPromise = isSupported().then(yes => yes ? getAnalytics(app) : null);

export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    // Try popup first (works on most browsers)
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    // If popup is blocked, fall back to redirect
    if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/cancelled-popup-request') {
      await signInWithRedirect(auth, googleProvider);
      return null; // Page will redirect, result captured on return
    }
    if (error?.code !== 'auth/popup-closed-by-user') {
      console.error("Error signing in with Google", error);
    }
    throw error;
  }
};

// Handle redirect result when the page loads after a Google sign-in redirect
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return result.user;
    }
    return null;
  } catch (error) {
    console.error("Error handling redirect result", error);
    return null;
  }
};

// Email/Password authentication
export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = displayName.trim();

  // Persist user record in Firestore immediately so Admin Suite sees them right away
  try {
    await setDoc(doc(db, 'users', result.user.uid), {
      uid: result.user.uid,
      email: cleanEmail,
      displayName: cleanName,
      role: 'user',
      planTier: 'free',
      planExpiry: null,
      isSetup: false,
      isEmailVerified: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (fsErr) {
    console.warn("Could not save initial user doc to Firestore:", fsErr);
  }

  // Dispatch 6-digit OTP to user's email
  try {
    await sendVerificationOtpCallable(cleanEmail, cleanName, result.user.uid);
  } catch (otpErr) {
    console.error("Failed to dispatch verification OTP:", otpErr);
  }

  // Sign out immediately so unverified account is never logged in
  await signOut(auth);
  return result.user;
};

export const sendVerificationOtpCallable = async (email: string, displayName?: string, uid?: string) => {
  const { httpsCallable } = await import('firebase/functions');
  const fn = httpsCallable(functions, 'sendVerificationOtp');
  const res = await fn({ email, displayName, uid }) as { data: { success: boolean; message?: string; devNotice?: string } };
  return res.data;
};

export const verifyOtpCallable = async (email: string, otp: string) => {
  const { httpsCallable } = await import('firebase/functions');
  const fn = httpsCallable(functions, 'verifyOtp');
  const res = await fn({ email, otp }) as { data: { success: boolean; message?: string } };
  return res.data;
};

export const signInWithEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  if (!result.user.emailVerified) {
    // Immediately terminate unverified session
    await signOut(auth);
    const error: any = new Error('Email not verified');
    error.code = 'auth/email-not-verified';
    throw error;
  }
  return result.user;
};

export const resendVerificationEmail = async (email: string, password?: string) => {
  // Dispatches fresh 6-digit OTP code to the email
  try {
    await sendVerificationOtpCallable(email);
    return true;
  } catch (err) {
    console.error("Failed to resend OTP:", err);
    return false;
  }
};

export const resetPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
