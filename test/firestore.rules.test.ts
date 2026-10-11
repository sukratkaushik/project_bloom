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

  // --- User Profile Privilege Escalation & Plan Security ---

  it('Case 6: User CANNOT create a profile with role="admin", isAdmin=true, or premium plan fields', async () => {
    const attackerContext = testEnv.authenticatedContext('attacker_uid');
    const db = attackerContext.firestore();

    // Attempt create with role: 'admin'
    await assertFails(
      setDoc(doc(db, 'users', 'attacker_uid'), {
        uid: 'attacker_uid',
        email: 'attacker@example.com',
        role: 'admin',
      })
    );

    // Attempt create with isAdmin: true
    await assertFails(
      setDoc(doc(db, 'users', 'attacker_uid'), {
        uid: 'attacker_uid',
        email: 'attacker@example.com',
        isAdmin: true,
      })
    );

    // Attempt create with planTier: 'premium'
    await assertFails(
      setDoc(doc(db, 'users', 'attacker_uid'), {
        uid: 'attacker_uid',
        email: 'attacker@example.com',
        planTier: 'premium',
      })
    );

    // Attempt create with isPremium: true
    await assertFails(
      setDoc(doc(db, 'users', 'attacker_uid'), {
        uid: 'attacker_uid',
        email: 'attacker@example.com',
        isPremium: true,
      })
    );

    // Attempt create with planExpiry
    await assertFails(
      setDoc(doc(db, 'users', 'attacker_uid'), {
        uid: 'attacker_uid',
        email: 'attacker@example.com',
        planExpiry: Date.now() + 1000000,
      })
    );
  });

  it('Case 7: User CAN create their own profile without restricted fields', async () => {
    const normalUserContext = testEnv.authenticatedContext('normal_user_1');
    const db = normalUserContext.firestore();

    await assertSucceeds(
      setDoc(doc(db, 'users', 'normal_user_1'), {
        uid: 'normal_user_1',
        email: 'normal@example.com',
        displayName: 'Normal User',
        isSetup: false,
        isEmailVerified: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    );
  });

  it('Case 8: User CANNOT update their existing profile to escalate role or upgrade planTier', async () => {
    // Seed existing profile
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users', 'existing_user'), {
        uid: 'existing_user',
        email: 'existing@example.com',
        displayName: 'Existing User',
        role: 'user',
        planTier: 'free',
        createdAt: Date.now(),
      });
    });

    const userContext = testEnv.authenticatedContext('existing_user');
    const db = userContext.firestore();
    const userDocRef = doc(db, 'users', 'existing_user');

    // Attempt to update role to 'admin'
    await assertFails(
      setDoc(userDocRef, { role: 'admin' }, { merge: true })
    );

    // Attempt to update planTier to 'premium'
    await assertFails(
      setDoc(userDocRef, { planTier: 'premium' }, { merge: true })
    );

    // Attempt to add isAdmin: true
    await assertFails(
      setDoc(userDocRef, { isAdmin: true }, { merge: true })
    );

    // Attempt to add isPremium: true
    await assertFails(
      setDoc(userDocRef, { isPremium: true }, { merge: true })
    );

    // Attempt to add planExpiry
    await assertFails(
      setDoc(userDocRef, { planExpiry: Date.now() + 9999999 }, { merge: true })
    );
  });

  it('Case 9: User CAN update permitted fields on their own profile', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users', 'permitted_user'), {
        uid: 'permitted_user',
        displayName: 'Old Name',
        isSetup: false,
      });
    });

    const userContext = testEnv.authenticatedContext('permitted_user');
    const db = userContext.firestore();
    const userDocRef = doc(db, 'users', 'permitted_user');

    // Permitted updates: displayName, isSetup, consent
    await assertSucceeds(
      setDoc(userDocRef, {
        displayName: 'New Name',
        isSetup: true,
        consentGiven: true,
        updatedAt: Date.now(),
      }, { merge: true })
    );
  });

  it('Case 10: Admin with custom claim admin=true CAN update user role and planTier', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users', 'target_user'), {
        uid: 'target_user',
        role: 'user',
        planTier: 'free',
      });
    });

    // Admin authenticated via token custom claim
    const adminContext = testEnv.authenticatedContext('admin_super', {
      admin: true,
    });
    const adminDb = adminContext.firestore();
    const targetDocRef = doc(adminDb, 'users', 'target_user');

    // Admin can update role and planTier
    await assertSucceeds(
      setDoc(targetDocRef, {
        role: 'admin',
        planTier: 'premium',
        planExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
      }, { merge: true })
    );
  });

  it('Case 11: Non-admin CANNOT delete profile; Admin CAN delete profile', async () => {
    const { deleteDoc } = await import('firebase/firestore');

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users', 'deletable_user'), {
        uid: 'deletable_user',
      });
    });

    // Non-admin attempt
    const userContext = testEnv.authenticatedContext('deletable_user');
    await assertFails(deleteDoc(doc(userContext.firestore(), 'users', 'deletable_user')));

    // Admin attempt
    const adminContext = testEnv.authenticatedContext('admin_claimer', { admin: true });
    await assertSucceeds(deleteDoc(doc(adminContext.firestore(), 'users', 'deletable_user')));
  });
});
