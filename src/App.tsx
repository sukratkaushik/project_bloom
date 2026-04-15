/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { PlannerProvider, usePlanner } from './store';
import { SetupScreen } from './components/SetupScreen';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './landing/LandingPage';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AppContent: React.FC = () => {
  const { state, updateState } = usePlanner();
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthReady(true);
      if (user && !state.hasStartedOnboarding && !state.isSetup) {
        // If user is logged in but hasn't started onboarding, start it
        updateState({ hasStartedOnboarding: true });
      }
    });
    return () => unsubscribe();
  }, [state.hasStartedOnboarding, state.isSetup, updateState]);

  if (!isAuthReady) {
    return <div className="min-h-screen bg-cream flex items-center justify-center font-serif text-sage text-2xl italic">Loading...</div>;
  }

  if (state.isSetup) {
    return <Dashboard />;
  }

  if (state.hasStartedOnboarding || auth.currentUser) {
    return <SetupScreen />;
  }

  return <LandingPage />;
};

export default function App() {
  return (
    <PlannerProvider>
      <AppContent />
    </PlannerProvider>
  );
}
