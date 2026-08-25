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
  // Send verification email (non-blocking — user can proceed immediately)
  sendEmailVerification(result.user).catch(console.error);
  return result.user;
};

export const signInWithEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
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
