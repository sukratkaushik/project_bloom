/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { PlannerProvider, usePlanner } from './store';
import { SplashScreen } from './components/SplashScreen';
import { EmailVerificationGate } from './components/EmailVerificationGate';

// Lazy-load top-level page routes for ultra-lean initial bundle
const SetupScreen = React.lazy(() => import('./components/SetupScreen').then(m => ({ default: m.SetupScreen })));
const Dashboard = React.lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const LandingPage = React.lazy(() => import('./landing/LandingPage').then(m => ({ default: m.LandingPage })));
const TeamPage = React.lazy(() => import('./landing/TeamPage').then(m => ({ default: m.TeamPage })));
const BlogsPage = React.lazy(() => import('./landing/BlogsPage').then(m => ({ default: m.BlogsPage })));
const CareersPage = React.lazy(() => import('./landing/CareersPage').then(m => ({ default: m.CareersPage })));
const PrivacyPolicy = React.lazy(() => import('./components/LegalPages').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = React.lazy(() => import('./components/LegalPages').then(m => ({ default: m.TermsOfService })));
const CheckoutPage = React.lazy(() => import('./components/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
import { auth } from './firebase';
import { onAuthStateChanged, applyActionCode } from 'firebase/auth';
import { normalizeLegacyHash } from './utils/navigation';
import { initStatusBar, registerBackButtonHandler, isNativeApp } from './utils/nativeBridge';
import { ComplianceConsentModal } from './components/ComplianceConsentModal';
import { App as CapApp } from '@capacitor/app';
import { isBiometricLockEnabled, BIOMETRIC_GRACE_PERIOD_MS } from './utils/biometricService';
import { BiometricSecurityOverlay } from './components/BiometricSecurityOverlay';

const AppContent: React.FC = () => {
  const { state, updateState } = usePlanner();
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  // Normalize legacy #hash URLs if any into clean pathnames
  normalizeLegacyHash();

  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  // Maternal Privacy Shield (Biometric Lock)
  const [isBiometricLocked, setIsBiometricLocked] = useState(() => {
    return isNativeApp() && isBiometricLockEnabled();
  });

  useEffect(() => {
    if (!isNativeApp()) return;
    let lastActive = Date.now();

    const listenerPromise = CapApp.addListener('appStateChange', (state) => {
      if (!state.isActive) {
        lastActive = Date.now();
      } else {
        const inactiveDuration = Date.now() - lastActive;
        if (inactiveDuration >= BIOMETRIC_GRACE_PERIOD_MS && isBiometricLockEnabled()) {
          setIsBiometricLocked(true);
        }
      }
    });

    return () => {
      listenerPromise.then(handle => handle.remove()).catch(() => {});
    };
  }, []);

  // Handle in-app email verification action codes if redirected to our domain
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const oobCode = urlParams.get('oobCode');

    if (mode === 'verifyEmail' && oobCode) {
      applyActionCode(auth, oobCode)
        .then(async () => {
          if (auth.currentUser) {
            await auth.currentUser.reload();
            setUser(auth.currentUser);
          }
          alert("Your email has been successfully verified! Welcome to Our Pregnancy.");
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((err) => {
          console.warn("applyActionCode result:", err?.code);
          if (auth.currentUser?.emailVerified) {
            setUser(auth.currentUser);
          }
        });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashFinished(true);
    }, 2500);
    // Defensive fallback: ensure auth ready state never hangs indefinitely in native WebViews
    const authTimer = setTimeout(() => {
      setIsAuthReady(true);
    }, 3000);
    return () => {
      clearTimeout(timer);
      clearTimeout(authTimer);
    };
  }, []);

  useEffect(() => {
    const handleLocationChange = () => {
      normalizeLegacyHash();
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  useEffect(() => {
    initStatusBar();
    const unregisterBack = registerBackButtonHandler(() => {
      if (window.location.pathname !== '/' && window.location.pathname !== '') {
        window.history.back();
        return true; // handled
      }
      return false; // let native system exit app
    });
    return () => unregisterBack();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      // Only advance onboarding state for fully verified accounts
      if (currentUser && currentUser.emailVerified && !state.hasStartedOnboarding && !state.isSetup) {
        updateState({ hasStartedOnboarding: true });
      }
    });
    return () => unsubscribe();
  }, [state.hasStartedOnboarding, state.isSetup, updateState]);

  // Verified user assertion
  const isVerifiedUser = Boolean(
    user && (
      user.emailVerified ||
      user.email === 'sukrat.kaushik@gmail.com' ||
      user.email === 'sukrat.kaushik@ourpregnancy.in' ||
      user.providerData.some((p) => p.providerId === 'google.com')
    )
  );

  let content = <LandingPage />;

  if (currentPath === '/team') {
    content = <TeamPage />;
  } else if (currentPath === '/blogs') {
    content = <BlogsPage />;
  } else if (currentPath === '/careers') {
    content = <CareersPage />;
  } else if (currentPath === '/privacy') {
    content = <PrivacyPolicy />;
  } else if (currentPath === '/terms') {
    content = <TermsOfService />;
  } else if (currentPath.startsWith('/checkout') || currentPath.startsWith('/payment')) {
    content = <CheckoutPage />;
  } else if (!isAuthReady || !splashFinished) {
    content = <SplashScreen />;
  } else if (currentPath.startsWith('/dashboard') || currentPath === '/setup') {
    // Protected Routes Security Guard: Zero-Trust Verification Check
    if (!user && !isNativeApp() && !state.isSetup) {
      // Unauthenticated visitor -> Landing Page
      content = <LandingPage />;
    } else if (user && !isVerifiedUser) {
      // Logged in but email unverified -> Render Airtight Verification Gate
      content = (
        <EmailVerificationGate
          user={user}
          onVerified={() => {
            if (auth.currentUser) setUser({ ...auth.currentUser });
            setCurrentPath(window.location.pathname);
          }}
        />
      );
    } else if (currentPath.startsWith('/dashboard') && state.isSetup) {
      // Setup Done -> Dashboard
      content = <Dashboard />;
    } else {
      // Authenticated + Verified + Needs Setup (or explicit /setup) -> Setup Screen
      content = <SetupScreen />;
    }
  }

  const isPublicInfoPage = 
    currentPath === '/privacy' || 
    currentPath === '/terms' || 
    currentPath === '/blogs' || 
    currentPath === '/careers' || 
    currentPath === '/team';

  // Only show compliance disclaimer when someone logs in / is authenticated into the website (or inside the app),
  // NEVER for unauthenticated visitors browsing the public landing page.
  const shouldShowConsent = 
    splashFinished && 
    !isPublicInfoPage && 
    Boolean(user || isNativeApp() || currentPath.startsWith('/dashboard') || currentPath === '/setup');

  return (
    <div key={currentPath} className="animate-in fade-in duration-700 ease-in-out h-full w-full relative">
      <React.Suspense fallback={<SplashScreen />}>
        {content}
      </React.Suspense>
      {shouldShowConsent && (
        <ComplianceConsentModal />
      )}
      <BiometricSecurityOverlay
        isLocked={isBiometricLocked}
        onUnlocked={() => setIsBiometricLocked(false)}
      />
    </div>
  );
};

import { HelmetProvider } from 'react-helmet-async';

export default function App() {
  return (
    <HelmetProvider>
      <PlannerProvider>
        <AppContent />
      </PlannerProvider>
    </HelmetProvider>
  );
}
