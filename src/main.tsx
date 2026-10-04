import {StrictMode} from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { Capacitor } from '@capacitor/core';
// import * as Sentry from "@sentry/react";

// Sentry.init({
//   dsn: "https://examplePublicKey@o0.ingest.sentry.io/0", // Replace with actual DSN in production
//   integrations: [
//     Sentry.browserTracingIntegration(),
//     Sentry.replayIntegration(),
//   ],
//   tracesSampleRate: 1.0, 
//   replaysSessionSampleRate: 0.1, 
//   replaysOnErrorSampleRate: 1.0, 
// });

// Service worker is for the WEB/PWA only. Inside the native Android app (Capacitor)
// all assets are bundled in the APK, and a service worker would keep serving the
// OLD cached bundle after an APK update (stale UI on upgraded phones).
if (Capacitor.isNativePlatform()) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(async (regs) => {
      const hadStale = regs.length > 0;
      await Promise.all(regs.map((r) => r.unregister()));
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      // Reload once so the fresh APK-bundled code takes over
      if (hadStale && !sessionStorage.getItem('op_sw_purged')) {
        sessionStorage.setItem('op_sw_purged', '1');
        window.location.reload();
      }
    }).catch(() => {});
  }
} else {
  registerSW({ immediate: true });
}

const rootElement = document.getElementById('root')!;
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, <StrictMode><App /></StrictMode>);
} else {
  createRoot(rootElement).render(<StrictMode><App /></StrictMode>);
}
