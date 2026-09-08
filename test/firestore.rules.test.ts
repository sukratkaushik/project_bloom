import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

describe('Firestore Security Rules: trackingData isolation', () => {
  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'projectbloompregnancy-test',
      firestore: {
        rules: fs.readFileSync('firestore.rules', 'utf8'),
        host: '127.0.0.1',
        port: 8080,
      },
    });
  });

  after(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();

      // Seed parent journey documents using unauthenticated/admin context
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const firestore = context.firestore();
        // User A's journey
        await setDoc(doc(firestore, 'journeys', 'journey_user_a'), {
          uid: 'user_a',
          createdAt: Date.now(),
        });
        // User B's journey
        await setDoc(doc(firestore, 'journeys', 'journey_user_b'), {
          uid: 'user_b',
          createdAt: Date.now(),
        });
      });
    }
  });

  // Case 1: User A can read/write their own journey's trackingData (regression guard — must still pass).
  it('Case 1: User A can read and write their own journey trackingData', async () => {
    const userAContext = testEnv.authenticatedContext('user_a');
    const userADb = userAContext.firestore();

    const trackingDocRef = doc(userADb, 'journeys', 'journey_user_a', 'trackingData', 'kick_1');

    // Write own tracking data
    await assertSucceeds(
      setDoc(trackingDocRef, {
        type: 'kick',
        data: { count: 10 },
        updatedAt: Date.now(),
      })
    );

    // Read own tracking data
    await assertSucceeds(getDoc(trackingDocRef));
  });

  // Case 2: User A CANNOT read/write User B's journey's trackingData (the bug — must now be denied).
  it('Case 2: User A CANNOT read or write User B journey trackingData', async () => {
    const userAContext = testEnv.authenticatedContext('user_a');
    const userADb = userAContext.firestore();

    const targetDocRef = doc(userADb, 'journeys', 'journey_user_b', 'trackingData', 'kick_secret');

    // Attempt to write into User B's trackingData
    await assertFails(
      setDoc(targetDocRef, {
        type: 'kick',
        data: { count: 999 },
        updatedAt: Date.now(),
      })
    );

    // Attempt to read from User B's trackingData
    await assertFails(getDoc(targetDocRef));
  });

  // Case 3: Admin (matching isAdmin()'s conditions) can read any user's trackingData.
  it('Case 3: Admin can read and write any user trackingData', async () => {
    const adminContext = testEnv.authenticatedContext('admin_user', {
      email: 'sukrat.kaushik@ourpregnancy.in',
    });
    const adminDb = adminContext.firestore();

    const targetDocRef = doc(adminDb, 'journeys', 'journey_user_b', 'trackingData', 'admin_check');

    // Admin writing to User B's trackingData
    await assertSucceeds(
      setDoc(targetDocRef, {
        type: 'kick',
        data: { count: 10 },
        updatedAt: Date.now(),
      })
    );

    // Admin reading User B's trackingData
    await assertSucceeds(getDoc(targetDocRef));
  });

  // Case 4: Unauthenticated requests are denied, as before.
  it('Case 4: Unauthenticated requests are denied', async () => {
    const unauthContext = testEnv.unauthenticatedContext();
    const unauthDb = unauthContext.firestore();

    const targetDocRef = doc(unauthDb, 'journeys', 'journey_user_a', 'trackingData', 'kick_unauth');

    // Attempt write
    await assertFails(
      setDoc(targetDocRef, {
        type: 'kick',
        data: { count: 5 },
      })
    );

    // Attempt read
    await assertFails(getDoc(targetDocRef));
  });

  // Case 5: Real-world check for all 7 tracking types used by CloudSync
  it('Case 5: User can write and read all 7 tracking types (kick, contraction, vitals, symptom, mood, hydration, supplement)', async () => {
    const userAContext = testEnv.authenticatedContext('user_a');
    const userADb = userAContext.firestore();

    const types = ['kick', 'contraction', 'vitals', 'symptom', 'mood', 'hydration', 'supplement'];

    for (const t of types) {
      const docRef = doc(userADb, 'journeys', 'journey_user_a', 'trackingData', `${t}_123`);
      await assertSucceeds(
        setDoc(docRef, {
          type: t,
          data: { id: '123', journeyId: 'journey_user_a', value: 'sample_value' },
          updatedAt: Date.now(),
        })
      );
      const snap = await assertSucceeds(getDoc(docRef));
      assert.strictEqual(snap.data()?.type, t);
    }
  });
});
