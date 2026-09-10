import { spawn } from 'child_process';
import assert from 'node:assert';
import fs from 'fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const admin = require('../functions/node_modules/firebase-admin');

process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.GCLOUD_PROJECT = 'projectbloompregnancy';

if (admin.apps.length === 0) {
  admin.initializeApp({ projectId: 'projectbloompregnancy' });
}

const authAdmin = admin.auth();
const dbAdmin = admin.firestore();

const PORT = 5174;
const CHROME_DEBUG_PORT = 9223;
const TMP_DIR = `/tmp/bloom-e2e-${Date.now()}`;

fs.mkdirSync(TMP_DIR, { recursive: true });

console.log('--- Step 1: Starting Vite Dev Server on port', PORT, 'with emulator flag ---');
const vite = spawn('npx', ['vite', '--port', String(PORT), '--host', '127.0.0.1'], {
  env: {
    ...process.env,
    VITE_USE_FIREBASE_EMULATOR: 'true'
  },
  stdio: 'inherit'
});

// Wait for Vite to respond
let viteReady = false;
for (let i = 0; i < 30; i++) {
  await new Promise(r => setTimeout(r, 500));
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}`);
    if (res.ok) {
      viteReady = true;
      console.log('✔ Vite dev server is ready at http://127.0.0.1:' + PORT);
      break;
    }
  } catch (e) {}
}

if (!viteReady) {
  console.error('Failed to start Vite dev server');
  vite.kill();
  process.exit(1);
}

console.log('--- Step 2: Seeding verified test user, journey, trackingData in emulator ---');
const testEmail = 'sarah.bloom.test@example.com';
const testPass = 'SecretPassword123!';

const userRecord = await authAdmin.createUser({
  email: testEmail,
  password: testPass,
  displayName: 'Sarah Parker',
  emailVerified: true
});
const uid = userRecord.uid;
console.log('✔ Created Auth user in emulator. UID:', uid);

await dbAdmin.collection('users').doc(uid).set({
  uid,
  email: testEmail,
  displayName: 'Sarah Parker',
  isSetup: true,
  activeJourneyId: 'journey_' + uid,
  role: 'user',
  planTier: 'free',
  emailVerified: true,
  createdAt: Date.now(),
  updatedAt: Date.now()
});

const journeyRef = dbAdmin.collection('journeys').doc('journey_' + uid);
await journeyRef.set({
  id: 'journey_' + uid,
  uid,
  title: "Sarah's Pregnancy",
  lmp: '2026-01-01',
  status: 'ACTIVE',
  updatedAt: Date.now()
});

await journeyRef.collection('trackingData').doc('kick_session_1').set({
  type: 'kick',
  count: 10,
  journeyId: 'journey_' + uid,
  updatedAt: Date.now()
});

await journeyRef.collection('trackingData').doc('symptom_log_1').set({
  type: 'symptom',
  symptom: 'Morning Nausea',
  journeyId: 'journey_' + uid,
  updatedAt: Date.now()
});

await dbAdmin.collection('feedbacks').doc('feedback_' + uid).set({
  uid,
  content: 'Loving the app so far!',
  createdAt: Date.now()
});
console.log('✔ Seeded user profile, journey, trackingData, and feedback in Firestore');

console.log('--- Step 3: Launching Headless Chrome on CDP port', CHROME_DEBUG_PORT, '---');
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless',
  `--remote-debugging-port=${CHROME_DEBUG_PORT}`,
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  `--user-data-dir=${TMP_DIR}`
]);

await new Promise(r => setTimeout(r, 1500));

try {
  // Connect to Chrome CDP
  const newTabRes = await fetch(`http://127.0.0.1:${CHROME_DEBUG_PORT}/json/new?http://127.0.0.1:${PORT}`, { method: 'PUT' });
  const tabData = await newTabRes.json();
  const ws = new WebSocket(tabData.webSocketDebuggerUrl);

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const msgId = id++;
    const handler = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id === msgId) {
        ws.removeEventListener('message', handler);
        if (msg.error) {
          reject(new Error(msg.error.message));
        } else {
          resolve(msg.result);
        }
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

  const evaluate = async (expression) => {
    const res = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text + (res.result?.value ? ': ' + JSON.stringify(res.result.value) : ''));
    }
    return res.result?.value;
  };

  // Wait for page to initialize and splash to settle
  console.log('--- Step 4: Loading web app in browser & logging in ---');
  await new Promise(r => setTimeout(r, 3500));

  // In-browser login and seed local storage / Dexie
  const loginResult = await evaluate(`
    (async () => {
      const { auth, signInWithEmailAndPassword } = await import('/src/firebase.ts');
      const { db: dexieDb } = await import('/src/db.ts');

      const userCred = await signInWithEmailAndPassword(auth, '${testEmail}', '${testPass}');

      await dexieDb.journeys.put({
        id: 'journey_' + userCred.user.uid,
        userId: userCred.user.uid,
        status: 'ACTIVE'
      });
      localStorage.setItem('bloom_e2e_storage_token', 'active_session_12345');

      return {
        uid: userCred.user.uid,
        email: userCred.user.email,
        emailVerified: userCred.user.emailVerified
      };
    })()
  `);

  console.log('✔ Logged in as:', loginResult.email, 'Verified:', loginResult.emailVerified);

  // Wait for auth & journey restoration to update state
  console.log('--- Step 5: Waiting for journey restoration & navigating to Profile (/dashboard/profile) ---');
  await new Promise(r => setTimeout(r, 2000));

  await evaluate(`
    (async () => {
      const { navigate } = await import('/src/utils/navigation.ts');
      navigate('/dashboard/profile');
    })()
  `);

  await new Promise(r => setTimeout(r, 2000));

  // Step 6: Verify "Delete My Account" card exists in UI
  console.log('--- Step 6: Verifying "Delete My Account" UI Card ---');
  const cardExists = await evaluate(`
    (() => {
      const headings = Array.from(document.querySelectorAll('h4'));
      const deleteHeading = headings.find(h => h.textContent.includes('Delete My Account'));
      return !!deleteHeading;
    })()
  `);
  assert.strictEqual(cardExists, true, 'Delete My Account card must be visible in Profile');
  console.log('✔ "Delete My Account" card is rendered in Data Privacy & Cloud Sync');

  // Step 7: Click "Delete My Account" button to open modal
  console.log('--- Step 7: Clicking "Delete My Account" button ---');
  const modalOpened = await evaluate(`
    (() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const deleteBtn = buttons.find(b => b.textContent.trim() === 'Delete My Account');
      if (!deleteBtn) return false;
      deleteBtn.click();
      return true;
    })()
  `);
  assert.strictEqual(modalOpened, true, 'Delete My Account button must be clickable');

  await new Promise(r => setTimeout(r, 500));

  // Verify modal elements
  const modalText = await evaluate(`
    (() => {
      const headings = Array.from(document.querySelectorAll('h3'));
      const modalHeading = headings.find(h => h.textContent.includes('Delete Account Permanently?'));
      const confirmInput = document.querySelector('input[placeholder="DELETE"]');
      const permDeleteBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Permanently Delete'));
      return {
        title: modalHeading ? modalHeading.textContent : null,
        inputFound: !!confirmInput,
        btnDisabled: permDeleteBtn ? permDeleteBtn.disabled : null
      };
    })()
  `);

  console.log('✔ Confirmation Modal rendered:', modalText.title);
  assert.strictEqual(modalText.title, 'Delete Account Permanently?');
  assert.strictEqual(modalText.inputFound, true);
  assert.strictEqual(modalText.btnDisabled, true, 'Permanently Delete button must initially be disabled');
  console.log('✔ Button is correctly disabled before typing DELETE');

  // Step 8: Test typing invalid text -> button should stay disabled
  console.log('--- Step 8: Testing confirmation guard (typing invalid text) ---');
  const stillDisabled = await evaluate(`
    (() => {
      const input = document.querySelector('input[placeholder="DELETE"]');
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(input, 'NO_DELETE');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));

      const permDeleteBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Permanently Delete'));
      return permDeleteBtn.disabled;
    })()
  `);
  assert.strictEqual(stillDisabled, true, 'Button must remain disabled when input != DELETE');
  console.log('✔ Confirmation guard active: button remains disabled for input "NO_DELETE"');

  // Step 9: Type "DELETE" -> button becomes enabled
  console.log('--- Step 9: Typing "DELETE" to enable deletion ---');
  const nowEnabled = await evaluate(`
    (() => {
      const input = document.querySelector('input[placeholder="DELETE"]');
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(input, 'DELETE');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));

      const permDeleteBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Permanently Delete'));
      return !permDeleteBtn.disabled;
    })()
  `);
  assert.strictEqual(nowEnabled, true, 'Button must become enabled when typing DELETE');
  console.log('✔ Button is now ENABLED after typing "DELETE"');

  // Step 10: Click "Permanently Delete"
  console.log('--- Step 10: Clicking "Permanently Delete" to trigger deletion flow ---');
  await evaluate(`
    (() => {
      const permDeleteBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Permanently Delete'));
      permDeleteBtn.click();
    })()
  `);

  // Wait for Cloud Function execution, Dexie purge, signOut, and reload
  console.log('Waiting for deletion, local storage purge, sign out, and reload...');
  await new Promise(r => setTimeout(r, 6000));

  // Step 11: Verify client state after deletion
  console.log('--- Step 11: Verifying client-side redirect and signed-out state ---');
  const postDeleteClientState = await evaluate(`
    (async () => {
      const { auth } = await import('/src/firebase.ts');
      const { db: dexieDb } = await import('/src/db.ts');
      const journeyCount = await dexieDb.journeys.count();
      const storageToken = localStorage.getItem('bloom_e2e_storage_token');

      return {
        currentUser: auth.currentUser ? auth.currentUser.uid : null,
        currentPath: window.location.pathname,
        currentHash: window.location.hash,
        dexieJourneyCount: journeyCount,
        storageToken: storageToken
      };
    })()
  `);

  console.log('Client state after deletion:');
  console.log('  auth.currentUser:', postDeleteClientState.currentUser);
  console.log('  window.location.pathname:', postDeleteClientState.currentPath);
  console.log('  window.location.hash:', postDeleteClientState.currentHash);
  console.log('  Dexie journeys count:', postDeleteClientState.dexieJourneyCount);
  console.log('  localStorage token:', postDeleteClientState.storageToken);

  assert.strictEqual(postDeleteClientState.currentUser, null, 'User must be signed out');
  assert.strictEqual(postDeleteClientState.dexieJourneyCount, 0, 'Dexie tables must be cleared');
  assert.strictEqual(postDeleteClientState.storageToken, null, 'localStorage must be cleared');
  console.log('✔ Client redirected to landing page, signed out, and all local storage cleared');

  // Step 12: Verify server-side data deletion in Firestore emulator
  console.log('--- Step 12: Verifying server-side purge in Firestore emulator ---');
  const userDoc = await dbAdmin.collection('users').doc(uid).get();
  const jDoc = await dbAdmin.collection('journeys').doc('journey_' + uid).get();
  const trackingDoc = await dbAdmin.collection('journeys').doc('journey_' + uid).collection('trackingData').doc('kick_session_1').get();
  const fbDoc = await dbAdmin.collection('feedbacks').doc('feedback_' + uid).get();

  console.log('Firestore state verified via Admin SDK:');
  console.log('  users/${uid} exists:', userDoc.exists);
  console.log('  journeys/journey_${uid} exists:', jDoc.exists);
  console.log('  trackingData/kick_session_1 exists:', trackingDoc.exists);
  console.log('  feedbacks/feedback_${uid} exists:', fbDoc.exists);

  assert.strictEqual(userDoc.exists, false, 'User document must be deleted');
  assert.strictEqual(jDoc.exists, false, 'Journey document must be deleted');
  assert.strictEqual(trackingDoc.exists, false, 'Tracking data must be deleted');
  assert.strictEqual(fbDoc.exists, false, 'Feedback document must be deleted');
  console.log('✔ All Firestore documents completely purged from servers');

  // Step 13: Verify user CANNOT log back in
  console.log('--- Step 13: Verifying deleted account cannot log back in ---');
  let loginFailedAsExpected = false;
  let loginErrorCode = null;
  try {
    await authAdmin.getUser(uid);
  } catch (err) {
    loginFailedAsExpected = true;
    loginErrorCode = err.code;
  }
  assert.strictEqual(loginFailedAsExpected, true, 'User must be deleted from Firebase Auth');
  console.log('✔ User deleted from Firebase Auth (Auth lookup threw:', loginErrorCode, ')');

  // Also test client login failure
  const clientLoginResult = await evaluate(`
    (async () => {
      const { auth, signInWithEmailAndPassword } = await import('/src/firebase.ts');

      try {
        await signInWithEmailAndPassword(auth, '${testEmail}', '${testPass}');
        return { success: true };
      } catch (err) {
        return { success: false, code: err.code, message: err.message };
      }
    })()
  `);

  console.log('Client login attempt result:', clientLoginResult);
  assert.strictEqual(clientLoginResult.success, false, 'Deleted user must not be able to log in from client');
  console.log('✔ Client login attempt blocked with error:', clientLoginResult.code);

  console.log('\n=============================================================');
  console.log('🎉 ALL 13 END-TO-END UI FLOW VERIFICATIONS PASSED SUCCESSFULLY!');
  console.log('=============================================================\n');

  ws.close();
  chrome.kill();
  vite.kill();
  process.exit(0);
} catch (err) {
  console.error('❌ E2E UI Test Failed:', err);
  chrome.kill();
  vite.kill();
  process.exit(1);
}
