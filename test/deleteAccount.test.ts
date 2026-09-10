import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs';
import { createRequire } from 'node:module';
import {
  initializeTestEnvironment,
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';

const require = createRequire(import.meta.url);
const admin = require('../functions/node_modules/firebase-admin');

// Point admin to Firestore emulator
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.GCLOUD_PROJECT = 'projectbloompregnancy-test';

// Import Cloud Function
const { deleteMyOwnAccount } = require('../functions/lib/index.js');

let testEnv: RulesTestEnvironment;
let db: any;

describe('Cloud Function: deleteMyOwnAccount', () => {
  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'projectbloompregnancy-test',
      firestore: {
        rules: fs.readFileSync('firestore.rules', 'utf8'),
        host: '127.0.0.1',
        port: 8080,
      },
    });

    if (admin.apps.length === 0) {
      admin.initializeApp({ projectId: 'projectbloompregnancy-test' });
    }
    db = admin.firestore();
  });

  after(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();
    }
  });

  it('Case 1: Unauthenticated caller is rejected', async () => {
    await assert.rejects(
      async () => {
        await deleteMyOwnAccount.run({ auth: null, data: {} });
      },
      (err: any) => {
        assert.strictEqual(err.code, 'unauthenticated');
        return true;
      }
    );
  });

  it('Case 2: Primary administrators are protected from deletion', async () => {
    // Attempt by email sukrat.kaushik@gmail.com
    await assert.rejects(
      async () => {
        await deleteMyOwnAccount.run({
          auth: { uid: 'admin_1', token: { email: 'sukrat.kaushik@gmail.com' } },
          data: {},
        });
      },
      (err: any) => {
        assert.strictEqual(err.code, 'failed-precondition');
        return true;
      }
    );

    // Attempt by email sukrat.kaushik@ourpregnancy.in
    await assert.rejects(
      async () => {
        await deleteMyOwnAccount.run({
          auth: { uid: 'admin_2', token: { email: 'sukrat.kaushik@ourpregnancy.in' } },
          data: {},
        });
      },
      (err: any) => {
        assert.strictEqual(err.code, 'failed-precondition');
        return true;
      }
    );

    // Attempt by uid matching owner email
    await assert.rejects(
      async () => {
        await deleteMyOwnAccount.run({
          auth: { uid: 'sukrat.kaushik@gmail.com', token: { email: 'other@gmail.com' } },
          data: {},
        });
      },
      (err: any) => {
        assert.strictEqual(err.code, 'failed-precondition');
        return true;
      }
    );
  });

  it('Case 3: User deletes own account and associated journeys, trackingData, and feedback', async () => {
    // 1. Seed User A data
    await db.collection('users').doc('user_a').set({
      uid: 'user_a',
      email: 'user_a@example.com',
      displayName: 'User A',
      createdAt: Date.now(),
    });

    const journeyA1Ref = db.collection('journeys').doc('journey_a_1');
    await journeyA1Ref.set({ uid: 'user_a', lmp: '2026-01-01' });
    await journeyA1Ref.collection('trackingData').doc('kick_1').set({ type: 'kick', count: 10 });
    await journeyA1Ref.collection('trackingData').doc('symptom_1').set({ type: 'symptom', name: 'nausea' });

    const journeyA2Ref = db.collection('journeys').doc('journey_a_2');
    await journeyA2Ref.set({ uid: 'user_a', lmp: '2025-01-01' });
    await journeyA2Ref.collection('trackingData').doc('vitals_1').set({ type: 'vitals', bp: '120/80' });

    await db.collection('feedbacks').doc('feedback_a_1').set({
      uid: 'user_a',
      content: 'Feedback from User A',
    });

    // 2. Seed User B data (must NOT be touched)
    await db.collection('users').doc('user_b').set({
      uid: 'user_b',
      email: 'user_b@example.com',
      displayName: 'User B',
      createdAt: Date.now(),
    });

    const journeyB1Ref = db.collection('journeys').doc('journey_b_1');
    await journeyB1Ref.set({ uid: 'user_b', lmp: '2026-02-01' });
    await journeyB1Ref.collection('trackingData').doc('kick_b1').set({ type: 'kick', count: 15 });

    await db.collection('feedbacks').doc('feedback_b_1').set({
      uid: 'user_b',
      content: 'Feedback from User B',
    });

    // 3. Call deleteMyOwnAccount as User A (attempting maliciously to pass targetUid: 'user_b' to test isolation)
    const result = await deleteMyOwnAccount.run({
      auth: { uid: 'user_a', token: { email: 'user_a@example.com' } },
      data: { targetUid: 'user_b' },
    });

    assert.strictEqual(result.success, true);

    // 4. Verify User A data is completely wiped
    const userADoc = await db.collection('users').doc('user_a').get();
    assert.strictEqual(userADoc.exists, false, 'User A doc should be deleted');

    const jA1Doc = await journeyA1Ref.get();
    assert.strictEqual(jA1Doc.exists, false, 'Journey A1 should be deleted');
    const kick1Doc = await journeyA1Ref.collection('trackingData').doc('kick_1').get();
    assert.strictEqual(kick1Doc.exists, false, 'Journey A1 trackingData kick_1 should be deleted');
    const symptom1Doc = await journeyA1Ref.collection('trackingData').doc('symptom_1').get();
    assert.strictEqual(symptom1Doc.exists, false, 'Journey A1 trackingData symptom_1 should be deleted');

    const jA2Doc = await journeyA2Ref.get();
    assert.strictEqual(jA2Doc.exists, false, 'Journey A2 should be deleted');
    const vitals1Doc = await journeyA2Ref.collection('trackingData').doc('vitals_1').get();
    assert.strictEqual(vitals1Doc.exists, false, 'Journey A2 trackingData vitals_1 should be deleted');

    const feedbackADoc = await db.collection('feedbacks').doc('feedback_a_1').get();
    assert.strictEqual(feedbackADoc.exists, false, 'User A feedback should be deleted');

    // 5. Verify User B data is 100% INTACT
    const userBDoc = await db.collection('users').doc('user_b').get();
    assert.strictEqual(userBDoc.exists, true, 'User B doc must remain intact');
    assert.strictEqual(userBDoc.data()?.email, 'user_b@example.com');

    const jB1Doc = await journeyB1Ref.get();
    assert.strictEqual(jB1Doc.exists, true, 'Journey B1 must remain intact');
    const kickB1Doc = await journeyB1Ref.collection('trackingData').doc('kick_b1').get();
    assert.strictEqual(kickB1Doc.exists, true, 'Journey B1 trackingData must remain intact');

    const feedbackBDoc = await db.collection('feedbacks').doc('feedback_b_1').get();
    assert.strictEqual(feedbackBDoc.exists, true, 'User B feedback must remain intact');
  });
});
