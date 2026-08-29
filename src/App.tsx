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
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { normalizeLegacyHash } from './utils/navigation';

const AppContent: React.FC = () => {
  const { state, updateState } = usePlanner();
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  // Normalize legacy #hash URLs if any into clean pathnames
  normalizeLegacyHash();

  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

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
      // Security Guard: Terminate session for unverified email/password accounts
      if (currentUser && !currentUser.emailVerified && currentUser.providerData.some(p => p.providerId === 'password')) {
        auth.signOut();
        setUser(null);
        setIsAuthReady(true);
        return;
      }
      setUser(currentUser);
      setIsAuthReady(true);
      if (currentUser && !state.hasStartedOnboarding && !state.isSetup) {
        // If user is logged in but hasn't started onboarding, start it
        updateState({ hasStartedOnboarding: true });
      }
    });
    return () => unsubscribe();
  }, [state.hasStartedOnboarding, state.isSetup, updateState]);

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
  } else if (currentPath.startsWith('/dashboard') && state.isSetup) {
    content = <Dashboard />;
  } else if (currentPath === '/setup' || ((state.hasStartedOnboarding || user) && !state.isSetup)) {
    content = <SetupScreen />;
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
