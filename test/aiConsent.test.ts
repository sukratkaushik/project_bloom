import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs';
import {
  initializeTestEnvironment,
  assertSucceeds,
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { isAiConsentBlocked } from '../src/components/AiConsentPrompt';

const CURRENT_POLICY_VERSION = '2026-04';

let testEnv: RulesTestEnvironment;

describe('Separable AI Processing Consent & Gating', () => {
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
    }
  });

  // Case (a): Brand-new signup who checks BOTH boxes (Privacy/Terms + AI Features)
  it('Case (a): Brand-new signup who checks both boxes has aiProcessingConsent=true and AI features work', async () => {
    const userContext = testEnv.authenticatedContext('user_both_boxes');
    const userDb = userContext.firestore();
    const userRef = doc(userDb, 'users', 'user_both_boxes');

    // SetupScreen logic with hasConsented=true and hasAiConsented=true
    const hasConsented = true;
    const hasAiConsented = true;

    await assertSucceeds(
      setDoc(userRef, {
        uid: 'user_both_boxes',
        consentGiven: true,
        consentedAt: serverTimestamp(),
        policyVersion: CURRENT_POLICY_VERSION,
        aiProcessingConsent: hasAiConsented,
        aiProcessingConsentedAt: hasAiConsented ? serverTimestamp() : null,
      }, { merge: true })
    );

    const snap = await assertSucceeds(getDoc(userRef));
    const data = snap.data();

    assert.strictEqual(data?.consentGiven, true);
    assert.strictEqual(data?.aiProcessingConsent, true);
    assert.ok(data?.aiProcessingConsentedAt, 'aiProcessingConsentedAt timestamp should exist');
    assert.ok(data?.aiProcessingConsentedAt instanceof Timestamp || typeof data?.aiProcessingConsentedAt?.seconds === 'number');

    // AI Gating Check
    const isBlocked = isAiConsentBlocked(data?.aiProcessingConsent);
    assert.strictEqual(isBlocked, false, 'AI features must NOT be blocked when user consented to AI processing');
  });

  // Case (b): Brand-new signup who checks ONLY the required box (declines/skips optional AI checkbox)
  it('Case (b): Brand-new signup who checks only required box has aiProcessingConsent=false and AI features are blocked with prompt', async () => {
    const userContext = testEnv.authenticatedContext('user_required_only');
    const userDb = userContext.firestore();
    const userRef = doc(userDb, 'users', 'user_required_only');

    // SetupScreen logic with hasConsented=true and hasAiConsented=false (user left optional box unchecked)
    const hasConsented = true;
    const hasAiConsented = false;

    await assertSucceeds(
      setDoc(userRef, {
        uid: 'user_required_only',
        consentGiven: true,
        consentedAt: serverTimestamp(),
        policyVersion: CURRENT_POLICY_VERSION,
        aiProcessingConsent: hasAiConsented,
        aiProcessingConsentedAt: hasAiConsented ? serverTimestamp() : null,
      }, { merge: true })
    );

    const snap = await assertSucceeds(getDoc(userRef));
    const data = snap.data();

    assert.strictEqual(data?.consentGiven, true);
    assert.strictEqual(data?.aiProcessingConsent, false);
    assert.strictEqual(data?.aiProcessingConsentedAt, null);

    // AI Gating Check
    const isBlocked = isAiConsentBlocked(data?.aiProcessingConsent);
    assert.strictEqual(isBlocked, true, 'AI features MUST be blocked and show in-context prompt when aiProcessingConsent is false');
  });

  // Case (c): Pre-existing user with NO aiProcessingConsent field at all (critical grandfathering check)
  it('Case (c): Pre-existing user with no aiProcessingConsent field is grandfathered in (AI features work)', async () => {
    // Seed existing user created prior to this change (e.g. paying AI ULTIMATE subscriber)
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const firestore = context.firestore();
      await setDoc(doc(firestore, 'users', 'legacy_paid_user'), {
        uid: 'legacy_paid_user',
        email: 'legacy@ourpregnancy.in',
        displayName: 'Existing Subscriber',
        isSetup: true,
        activeJourneyId: 'journey_legacy_sub',
        planTier: 'premium',
        createdAt: 1690000000000,
        updatedAt: 1690000000000,
        // Notice: no aiProcessingConsent or aiProcessingConsentedAt fields!
      });
    });

    const userContext = testEnv.authenticatedContext('legacy_paid_user');
    const userDb = userContext.firestore();
    const userRef = doc(userDb, 'users', 'legacy_paid_user');

    const snap = await assertSucceeds(getDoc(userRef));
    const data = snap.data();

    assert.strictEqual(data?.aiProcessingConsent, undefined, 'Pre-existing user has undefined aiProcessingConsent');

    // AI Gating Check - critical grandfather rule
    const isBlocked = isAiConsentBlocked(data?.aiProcessingConsent);
    assert.strictEqual(isBlocked, false, 'Pre-existing users with undefined consent MUST NOT be blocked');
  });

  // Case (d): User explicitly turns the Profile toggle off (and back on)
  it('Case (d): User explicitly turns Profile toggle off (AI blocked), then back on (AI unblocked)', async () => {
    const userContext = testEnv.authenticatedContext('user_toggle_test');
    const userDb = userContext.firestore();
    const userRef = doc(userDb, 'users', 'user_toggle_test');

    // 1. Initially active user (either consented or grandfathered)
    await setDoc(userRef, {
      uid: 'user_toggle_test',
      email: 'toggle@example.com',
      aiProcessingConsent: true,
      aiProcessingConsentedAt: serverTimestamp(),
      createdAt: Date.now(),
    });

    let snap = await assertSucceeds(getDoc(userRef));
    assert.strictEqual(isAiConsentBlocked(snap.data()?.aiProcessingConsent), false);

    // 2. User navigates to Profile and turns the AI Processing toggle OFF
    await assertSucceeds(
      setDoc(userRef, {
        aiProcessingConsent: false,
        aiProcessingConsentedAt: null,
      }, { merge: true })
    );

    snap = await assertSucceeds(getDoc(userRef));
    assert.strictEqual(snap.data()?.aiProcessingConsent, false);
    assert.strictEqual(snap.data()?.aiProcessingConsentedAt, null);
    assert.strictEqual(isAiConsentBlocked(snap.data()?.aiProcessingConsent), true, 'Turning toggle off must block AI features');

    // 3. User later navigates to Profile and turns the AI Processing toggle back ON
    await assertSucceeds(
      setDoc(userRef, {
        aiProcessingConsent: true,
        aiProcessingConsentedAt: serverTimestamp(),
      }, { merge: true })
    );

    snap = await assertSucceeds(getDoc(userRef));
    assert.strictEqual(snap.data()?.aiProcessingConsent, true);
    assert.ok(snap.data()?.aiProcessingConsentedAt?.seconds > 0);
    assert.strictEqual(isAiConsentBlocked(snap.data()?.aiProcessingConsent), false, 'Turning toggle on must unblock AI features');
  });
});
