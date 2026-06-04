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
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AppContent: React.FC = () => {
  const { state, updateState } = usePlanner();
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashFinished(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
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

  if (currentHash === '#team') {
    content = <TeamPage />;
  } else if (currentHash === '#privacy') {
    content = <PrivacyPolicy />;
  } else if (currentHash === '#terms') {
    content = <TermsOfService />;
  } else if (!isAuthReady || !splashFinished) {
    content = <SplashScreen />;
  } else if (currentHash === '#dashboard' && state.isSetup) {
    content = <Dashboard />;
  } else if (currentHash === '#setup' || ((state.hasStartedOnboarding || user) && !state.isSetup)) {
    content = <SetupScreen />;
  }

  return (
    <div key={currentHash} className="animate-in fade-in duration-700 ease-in-out h-full w-full relative">
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
