import {StrictMode} from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
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

registerSW({ immediate: true });

const rootElement = document.getElementById('root')!;
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, <StrictMode><App /></StrictMode>);
} else {
  createRoot(rootElement).render(<StrictMode><App /></StrictMode>);
}
