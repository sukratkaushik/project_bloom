import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

const CURRENT_POLICY_VERSION = '2026-04';

let testEnv: RulesTestEnvironment;

describe('User Consent Persistence & Backward Compatibility', () => {
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

  // Case 1: Fresh signup writes consent record upon plan generation
  it('Case 1: Fresh signup writes consent record with valid serverTimestamp', async () => {
    const userContext = testEnv.authenticatedContext('fresh_user_1');
    const userDb = userContext.firestore();

    const userRef = doc(userDb, 'users', 'fresh_user_1');

    // Simulate setup write with merge: true as done in SetupScreen.tsx
    await assertSucceeds(
      setDoc(userRef, {
        uid: 'fresh_user_1',
        consentGiven: true,
        consentedAt: serverTimestamp(),
        policyVersion: CURRENT_POLICY_VERSION,
      }, { merge: true })
    );

    // Read back and assert fields
    const snap = await assertSucceeds(getDoc(userRef));
    assert.strictEqual(snap.exists(), true);
    const data = snap.data();

    assert.strictEqual(data?.uid, 'fresh_user_1');
    assert.strictEqual(data?.consentGiven, true);
    assert.strictEqual(data?.policyVersion, '2026-04');
    assert.ok(data?.consentedAt, 'consentedAt should exist');
    assert.ok(data?.consentedAt instanceof Timestamp || typeof data?.consentedAt?.seconds === 'number', 'consentedAt should be a Firestore Timestamp');
    assert.ok(data?.consentedAt?.seconds > 0, 'consentedAt seconds must be > 0');
  });

  // Case 2: Direct set/merge write preserves existing profile fields
  it('Case 2: Consent merge preserves pre-existing user profile fields', async () => {
    // Seed initial user profile with unauthenticated/admin bypass
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const firestore = context.firestore();
      await setDoc(doc(firestore, 'users', 'user_with_profile'), {
        uid: 'user_with_profile',
        email: 'pregnant_user@example.com',
        displayName: 'Aarohi',
        planTier: 'free',
        createdAt: 1710000000000,
        updatedAt: 1710000000000,
      });
    });

    const userContext = testEnv.authenticatedContext('user_with_profile');
    const userDb = userContext.firestore();
    const userRef = doc(userDb, 'users', 'user_with_profile');

    // Merge consent
    await assertSucceeds(
      setDoc(userRef, {
        uid: 'user_with_profile',
        consentGiven: true,
        consentedAt: serverTimestamp(),
        policyVersion: CURRENT_POLICY_VERSION,
      }, { merge: true })
    );

    // Verify all existing fields remained intact
    const snap = await assertSucceeds(getDoc(userRef));
    const data = snap.data();

    assert.strictEqual(data?.uid, 'user_with_profile');
    assert.strictEqual(data?.email, 'pregnant_user@example.com');
    assert.strictEqual(data?.displayName, 'Aarohi');
    assert.strictEqual(data?.planTier, 'free');
    assert.strictEqual(data?.createdAt, 1710000000000);
    assert.strictEqual(data?.consentGiven, true);
    assert.strictEqual(data?.policyVersion, '2026-04');
    assert.ok(data?.consentedAt?.seconds > 0);
  });

  // Case 3: Backward compatibility for existing users who already completed setup
  it('Case 3: Existing users without consent fields can access profile and dashboard normally', async () => {
    // Seed legacy user without consent fields
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const firestore = context.firestore();
      await setDoc(doc(firestore, 'users', 'legacy_user_no_consent'), {
        uid: 'legacy_user_no_consent',
        email: 'legacy@ourpregnancy.in',
        displayName: 'Legacy User',
        isSetup: true,
        activeJourneyId: 'journey_legacy_1',
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
      });
    });

    const userContext = testEnv.authenticatedContext('legacy_user_no_consent');
    const userDb = userContext.firestore();
    const userRef = doc(userDb, 'users', 'legacy_user_no_consent');

    const snap = await assertSucceeds(getDoc(userRef));
    assert.strictEqual(snap.exists(), true);
    const data = snap.data();

    assert.strictEqual(data?.uid, 'legacy_user_no_consent');
    assert.strictEqual(data?.consentGiven, undefined, 'Legacy user has no retroactive consent fabricated');
    assert.strictEqual(data?.policyVersion, undefined);
    assert.strictEqual(data?.consentedAt, undefined);
    assert.strictEqual(data?.isSetup, true);
    assert.strictEqual(data?.activeJourneyId, 'journey_legacy_1');
  });

  // Case 4: Security rules boundary enforcement
  it('Case 4: User cannot write or read consent record of another user', async () => {
    const attackerContext = testEnv.authenticatedContext('attacker_user');
    const attackerDb = attackerContext.firestore();

    const victimUserRef = doc(attackerDb, 'users', 'victim_user');

    // Attacker cannot write to victim's user doc
    await assertFails(
      setDoc(victimUserRef, {
        uid: 'victim_user',
        consentGiven: true,
        consentedAt: serverTimestamp(),
        policyVersion: CURRENT_POLICY_VERSION,
      }, { merge: true })
    );

    // Attacker cannot read victim's user doc
    await assertFails(getDoc(victimUserRef));

    // Unauthenticated caller cannot write
    const unauthContext = testEnv.unauthenticatedContext();
    const unauthDb = unauthContext.firestore();
    await assertFails(
      setDoc(doc(unauthDb, 'users', 'victim_user'), {
        uid: 'victim_user',
        consentGiven: true,
      }, { merge: true })
    );
  });
});
