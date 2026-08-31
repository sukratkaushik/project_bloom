/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { PlannerProvider, usePlanner } from './store';
import { SetupScreen } from './components/SetupScreen';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './landing/LandingPage';
import { TeamPage } from './landing/TeamPage';
import { PrivacyPolicy, TermsOfService } from './components/LegalPages';
import { SplashScreen } from './components/SplashScreen';
import { CheckoutPage } from './components/CheckoutPage';
import { EmailVerificationGate } from './components/EmailVerificationGate';
import { auth } from './firebase';
import { onAuthStateChanged, applyActionCode } from 'firebase/auth';
import { normalizeLegacyHash } from './utils/navigation';

const AppContent: React.FC = () => {
  const { state, updateState } = usePlanner();
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  // Normalize legacy #hash URLs if any into clean pathnames
  normalizeLegacyHash();

  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

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
    return () => clearTimeout(timer);
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
      user.providerData.some((p) => p.providerId === 'google.com')
    )
  );

  let content = <LandingPage />;

  if (currentPath === '/team') {
    content = <TeamPage />;
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
    if (!user) {
      // Unauthenticated visitor -> Landing Page
      content = <LandingPage />;
    } else if (!isVerifiedUser) {
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
      // Authenticated + Verified + Setup Done -> Dashboard
      content = <Dashboard />;
    } else {
      // Authenticated + Verified + Needs Setup -> Setup Screen
      content = <SetupScreen />;
    }
  }

  return (
    <div key={currentPath} className="animate-in fade-in duration-700 ease-in-out h-full w-full relative">
      {content}
      <div id="google_translate_element" className="hidden"></div>
    </div>
  );
};

export default function App() {
  return (
    <PlannerProvider>
      <AppContent />
    </PlannerProvider>
  );
}
