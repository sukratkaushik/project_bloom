import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlannerState, BudgetItem } from './types';
import { db, JourneyStatus, CalculationMethod } from './db';
import { v4 as uuidv4 } from 'uuid';
import { addDays, addWeeks } from './utils';
import { auth, db as firestoreDb, handleFirestoreError, OperationType, getUserProfile, saveUserProfile } from './firebase';
import { doc, setDoc, getDoc, onSnapshot, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { cloudSync } from './cloudSync';

type PlannerContextType = {
  state: PlannerState;
  updateState: (updates: Partial<PlannerState>) => void;
  toggleTask: (id: string) => void;
  toggleAssign: (id: string) => void;
  deleteTask: (id: string) => void;
  setAssigneeNote: (id: string, note: string) => void;
  setDecision: (id: string, value: string) => void;
  setDecisionNote: (id: string, value: string) => void;
  setBudgetEst: (id: string, value: string) => void;
  setBudgetAct: (id: string, value: string) => void;
  addCustomBudgetItem: (label: string) => void;
  addCustomTask: (section: string, text: string) => void;
  addCustomSupplement: (name: string, dose: string) => void;
  deleteCustomSupplement: (id: string) => void;
  setNote: (id: string, value: string) => void;
  generatePlan: (setupData: Partial<PlannerState>) => void;
  resetPlan: () => void;
  restoreJourney: (uid: string) => Promise<boolean>;
  toggleCalmMode: () => void;
  toggleDarkMode: () => void;
  toggleFavoriteName: (name: string) => void;
  toggleFavoritePage: (id: string) => void;
  claimDailyKnowledge: () => void;
};

const defaultState: PlannerState = {
  isSetup: false,
  dueDate: null,
  lmp: null,
  t1End: null,
  t2End: null,
  pregnancyNum: 'first',
  workSit: 'employed',
  partnerSit: 'partner',
  dietPref: 'vegetarian',
  flags: {},
  checked: {},
  assigned: {},
  assigneeNotes: {},
  deletedTasks: {},
  decisions: {},
  decisionNotes: {},
  budgetEst: {},
  budgetAct: {},
  customBudgetItems: [],
  customTasks: {},
  notes: {},
  critFilter: false,
  isCalmModeActive: false,
  isDarkModeActive: false,
  isPremium: false,
  hospitalBagItems: [],
  birthPlan: {},
  hasStartedOnboarding: false,
  weightUnit: 'kg',
  calendarStartDay: 'monday',
  syncPermissions: {
    kickcounter: true, contractions: true, vitals: true, mood: true, hydration: true, nutrition: true, symptoms: true,
    askourpregnancy: true, foodscanner: true, babynames: true,
    dev: true, prep: true, finance: true, deadlines: true,
    medical: true, schemes: true,
    readiness: true, hospitalbag: true, birthplan: true, decisions: true, postpartum: true,
    notes: true,
  },
  isRestoring: false,
};

const getInitialState = (): PlannerState => {
  try {
    const savedUi = localStorage.getItem('bloom_planner_ui');
    if (savedUi) {
      const parsed = JSON.parse(savedUi);
      return { ...defaultState, isCalmModeActive: parsed.isCalmModeActive || false, isDarkModeActive: parsed.isDarkModeActive || false };
    }
  } catch (e) {
    // Ignore error
  }
  return defaultState;
};

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PlannerState>(getInitialState);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  // 1. Load state asynchronously from Dexie on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const record = await db.appState.get('global');
        if (record) {
          setState(prev => ({
            ...prev,
            ...JSON.parse(record.stateJSON),
            isCalmModeActive: prev.isCalmModeActive,
            isDarkModeActive: prev.isDarkModeActive
          }));
        } else {
          // Fallback to localStorage just in case of migration
          const saved = localStorage.getItem('bloom_planner');
          if (saved) {
            setState(prev => ({
              ...prev,
              ...JSON.parse(saved),
              isCalmModeActive: prev.isCalmModeActive,
              isDarkModeActive: prev.isDarkModeActive
            }));
          }
        }
      } catch (e) {
        console.error('Failed to load state from Dexie', e);
      } finally {
        setIsDbLoaded(true);
      }
    };
    loadState();
  }, []);

  // Listen for auth state and load cloud data if available
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // 1. Check for cloud user profile first
          const profile = await getUserProfile(user.uid);

          if (profile && profile.isSetup && profile.activeJourneyId) {
            // 2. If already setup in cloud, fetch that journey
            const journeyRef = doc(firestoreDb, 'journeys', profile.activeJourneyId);
            const docSnap = await getDoc(journeyRef);

            if (docSnap.exists()) {
              const cloudData = docSnap.data();

              // 3. Restore all tracking data (logs, vitals, etc.)
              const trackingRef = collection(firestoreDb, 'journeys', profile.activeJourneyId, 'trackingData');
              const trackingSnap = await getDocs(trackingRef);
              const cloudRecords = trackingSnap.docs.map(d => d.data());
              await cloudSync.restoreJourneyData(profile.activeJourneyId, cloudRecords);

              setState(prev => ({
                ...prev,
                ...cloudData,
                isCalmModeActive: prev.isCalmModeActive,
                isDarkModeActive: prev.isDarkModeActive,
                isSetup: true,
                activeJourneyId: profile.activeJourneyId
              }));

              // Immediately persist state to Dexie
              if (isDbLoaded) {
                db.appState.put({
                  id: 'global',
                  stateJSON: JSON.stringify({
                    ...state,
                    ...cloudData,
                    isCalmModeActive: state.isCalmModeActive,
                    isDarkModeActive: state.isDarkModeActive,
                    isSetup: true,
                    activeJourneyId: profile.activeJourneyId
                  }),
                  updatedAt: Date.now(),
                }).catch(console.error);
              }
            }
          }
        } catch (error) {
          console.error("Error restoring session from cloud:", error);
        }
      }
    });
    return () => unsubscribe();
  }, [isDbLoaded]); // We need to know when Dexie is ready before we start writing to it

  // Sync to Dexie, localStorage and Firestore (debounced to avoid thrashing on typing)
  useEffect(() => {
    // Save minimal UI preferences to local storage for instant loading on refresh
    try {
      localStorage.setItem('bloom_planner_ui', JSON.stringify({
        isCalmModeActive: state.isCalmModeActive,
        isDarkModeActive: state.isDarkModeActive,
      }));
    } catch (e) { }

    const timer = setTimeout(() => {
      // Only save the full state to Dexie AFTER we have finished loading it from Dexie
      if (isDbLoaded) {
        db.appState.put({
          id: 'global',
          stateJSON: JSON.stringify(state),
          updatedAt: Date.now(),
        }).catch(err => {
          console.error('Failed to sync state to Dexie:', err);
        });
      }

      if (auth.currentUser && state.activeJourneyId && state.isSetup) {
        const journeyRef = doc(firestoreDb, 'journeys', state.activeJourneyId);
        setDoc(journeyRef, {
          ...state,
          uid: auth.currentUser.uid,
          status: 'ACTIVE',
          calculationMethod: 'LMP',
          referenceDate: state.lmp ? new Date(state.lmp).getTime() : Date.now(),
          estimatedDueDate: state.dueDate ? new Date(state.dueDate).getTime() : Date.now(),
          createdAt: state.createdAt || Date.now(),
          updatedAt: Date.now()
        }, { merge: true }).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `journeys/${state.activeJourneyId}`);
        });

        // Also ensure user profile is synced with the active journey
        saveUserProfile(auth.currentUser.uid, {
          isSetup: true,
          activeJourneyId: state.activeJourneyId,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName,
          createdAt: state.createdAt || Date.now()
        });
      }
    }, 1000); // 1-second debounce to prevent lag during typing

    return () => clearTimeout(timer);
  }, [state, isDbLoaded]);

  const claimDailyKnowledge = () => {
    setState((prev) => {
      const today = new Date().toISOString().split('T')[0];
      if (prev.lastKnowledgeDropDate === today) return prev;

      let newStreak = (prev.dailyKnowledgeStreak || 0) + 1;

      if (prev.lastKnowledgeDropDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        if (prev.lastKnowledgeDropDate !== yesterdayStr) {
          newStreak = 1;
        }
      }

      return {
        ...prev,
        lastKnowledgeDropDate: today,
        dailyKnowledgeStreak: newStreak
      };
    });
  };

  const updateState = (updates: Partial<PlannerState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const toggleTask = (id: string) => {
    setState((prev) => {
      if (prev.isPartnerReadOnly) return prev;
      return {
        ...prev,
        checked: { ...prev.checked, [id]: !prev.checked[id] },
      };
    });
  };

  const toggleAssign = (id: string) => {
    setState((prev) => {
      if (prev.isPartnerReadOnly) return prev;
      return {
        ...prev,
        assigned: { ...prev.assigned, [id]: !prev.assigned[id] },
      };
    });
  };

  const deleteTask = (id: string) => {
    setState((prev) => {
      if (prev.isPartnerReadOnly) return prev;
      return {
        ...prev,
        deletedTasks: { ...prev.deletedTasks, [id]: true },
      };
    });
  };

  const setAssigneeNote = (id: string, note: string) => {
    setState((prev) => {
      if (prev.isPartnerReadOnly) return prev;
      return {
        ...prev,
        assigneeNotes: { ...prev.assigneeNotes, [id]: note },
      };
    });
  };

  const setDecision = (id: string, value: string) => {
    setState((prev) => {
      if (prev.isPartnerReadOnly) return prev;
      return {
        ...prev,
        decisions: { ...prev.decisions, [id]: value },
      };
    });
  };

  const setDecisionNote = (id: string, value: string) => {
    setState((prev) => {
      if (prev.isPartnerReadOnly) return prev;
      return {
        ...prev,
        decisionNotes: { ...prev.decisionNotes, [id]: value },
      };
    });
  };

  const setBudgetEst = (id: string, value: string) => {
    setState((prev) => {
      if (prev.isPartnerReadOnly) return prev;
      return {
        ...prev,
        budgetEst: { ...prev.budgetEst, [id]: value },
      };
    });
  };

  const setBudgetAct = (id: string, value: string) => {
    setState((prev) => {
      if (prev.isPartnerReadOnly) return prev;
      return {
        ...prev,
        budgetAct: { ...prev.budgetAct, [id]: value },
      };
    });
  };

  const addCustomBudgetItem = (label: string) => {
    const id = 'custom_' + Date.now();
    setState((prev) => {
      if (prev.isPartnerReadOnly) return prev;
      return {
        ...prev,
        customBudgetItems: [...prev.customBudgetItems, { id, label }],
      };
    });
  };

  const addCustomTask = (section: string, text: string) => {
    const id = `custom_task_${Date.now()}`;
    const newTask = { id, text, crit: false };
    setState((prev) => {
      if (prev.isPartnerReadOnly) return prev;
      const sectionTasks = prev.customTasks[section] || [];
      return {
        ...prev,
        customTasks: {
          ...prev.customTasks,
          [section]: [...sectionTasks, newTask],
        },
      };
    });
  };

  const addCustomSupplement = (name: string, dose: string) => {
    const id = `custom_supp_${Date.now()}`;
    setState((prev) => {
      if (prev.isPartnerReadOnly) return prev;
      return {
        ...prev,
        customSupplements: [...(prev.customSupplements || []), { id, name, dose }],
      };
    });
  };

  const deleteCustomSupplement = (id: string) => {
    setState((prev) => {
      if (prev.isPartnerReadOnly) return prev;
      return {
        ...prev,
        customSupplements: (prev.customSupplements || []).filter(s => s.id !== id),
      };
    });
  };

  const setNote = (id: string, value: string) => {
    setState((prev) => {
      if (prev.isPartnerReadOnly) return prev;
      return {
        ...prev,
        notes: { ...prev.notes, [id]: value },
      };
    });
  };

  const generatePlan = async (setupData: Partial<PlannerState>) => {
    if (!setupData.dueDate) return;

    const dueDate = new Date(setupData.dueDate);
    const lmp = addDays(dueDate, -280);
    const t1End = addWeeks(lmp, 12);
    const t2End = addWeeks(lmp, 27);

    const journeyId = state.activeJourneyId || uuidv4();

    // Execute Dexie Schema: Create User and Journey (Local fallback)
    try {
      const userId = auth.currentUser ? auth.currentUser.uid : 'local-user-1';
      const userCount = await db.users.where('id').equals(userId).count();
      if (userCount === 0) {
        await db.users.put({
          id: userId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          preferences: { theme: 'light', measurementSystem: 'METRIC' as any }
        });
      }

      await db.journeys.put({
        id: journeyId,
        userId,
        status: JourneyStatus.ACTIVE,
        calculationMethod: CalculationMethod.LMP,
        referenceDate: lmp.getTime(),
        estimatedDueDate: dueDate.getTime(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        setupFlags: setupData.flags || {},
        pregnancyNum: setupData.pregnancyNum || 'first',
        workSit: setupData.workSit || 'employed',
        partnerSit: setupData.partnerSit || 'partner',
        dietPref: setupData.dietPref || 'vegetarian',
      });
    } catch (err) {
      console.error('Failed to initialize Dexie DB', err);
    }

    setState((prev) => ({
      ...prev,
      ...setupData,
      dueDate: dueDate.toISOString(),
      lmp: lmp.toISOString(),
      t1End: t1End.toISOString(),
      t2End: t2End.toISOString(),
      isSetup: true,
      activeJourneyId: journeyId,
      createdAt: Date.now()
    }));

    // Save to Firestore User Profile immediately
    if (auth.currentUser) {
      saveUserProfile(auth.currentUser.uid, {
        isSetup: true,
        activeJourneyId: journeyId,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        createdAt: Date.now()
      });
    }
  };

  const resetPlan = () => {
    setState((prev) => ({
      ...defaultState,
      isCalmModeActive: prev.isCalmModeActive,
      isDarkModeActive: prev.isDarkModeActive
    }));
  };

  const restoreJourney = async (uid: string): Promise<boolean> => {
    try {
      const profile = await getUserProfile(uid);
      if (profile && profile.activeJourneyId) {
        const journeyRef = doc(firestoreDb, 'journeys', profile.activeJourneyId);
        const snapshot = await getDoc(journeyRef);

        if (snapshot.exists()) {
          const cloudData = snapshot.data() as Partial<PlannerState>;

          setState((prev) => {
            const newState = {
              ...prev,
              ...cloudData,
              isCalmModeActive: prev.isCalmModeActive,
              isDarkModeActive: prev.isDarkModeActive,
              isSetup: true,
              activeJourneyId: profile.activeJourneyId
            };
            if (isDbLoaded) {
              db.appState.put({
                id: 'global',
                stateJSON: JSON.stringify(newState),
                updatedAt: Date.now(),
              }).catch(console.error);
            }
            return newState;
          });

          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Failed to restore journey from cloud:', err);
      return false;
    }
  };

  const toggleCalmMode = () => {
    setState((prev) => {
      const nextCalm = !prev.isCalmModeActive;
      return {
        ...prev,
        isCalmModeActive: nextCalm,
        isDarkModeActive: nextCalm ? false : prev.isDarkModeActive,
      };
    });
  };

  const toggleDarkMode = () => {
    setState((prev) => {
      const nextDark = !prev.isDarkModeActive;
      return {
        ...prev,
        isDarkModeActive: nextDark,
        isCalmModeActive: nextDark ? false : prev.isCalmModeActive,
      };
    });
  };

  const toggleFavoriteName = (name: string) => {
    setState((prev) => {
      const current = prev.favoriteNames || [];
      if (current.includes(name)) {
        return { ...prev, favoriteNames: current.filter(n => n !== name) };
      }
      return { ...prev, favoriteNames: [...current, name] };
    });
  };

  const toggleFavoritePage = (id: string) => {
    setState((prev) => {
      const current = prev.favoritePages || [];
      if (current.includes(id)) {
        return { ...prev, favoritePages: current.filter(p => p !== id) };
      }
      return { ...prev, favoritePages: [...current, id] };
    });
  };

  useEffect(() => {
    if (state.isCalmModeActive) {
      document.body.classList.add('calm-mode');
    } else {
      document.body.classList.remove('calm-mode');
    }
  }, [state.isCalmModeActive]);

  useEffect(() => {
    if (state.isDarkModeActive) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.isDarkModeActive]);

  return (
    <PlannerContext.Provider
      value={{
        state,
        updateState,
        toggleTask,
        toggleAssign,
        deleteTask,
        setAssigneeNote,
        setDecision,
        setDecisionNote,
        setBudgetEst,
        setBudgetAct,
        addCustomBudgetItem,
        addCustomTask,
        addCustomSupplement,
        deleteCustomSupplement,
        setNote,
        generatePlan,
        resetPlan,
        restoreJourney,
        toggleCalmMode,
        toggleDarkMode,
        toggleFavoriteName,
        toggleFavoritePage,
        claimDailyKnowledge,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = () => {
  const context = useContext(PlannerContext);
  if (context === undefined) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
};
