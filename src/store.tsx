import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlannerState, BudgetItem } from './types';
import { db, JourneyStatus, CalculationMethod } from './db';
import { v4 as uuidv4 } from 'uuid';
import { addDays, addWeeks } from './utils';
import { auth, db as firestoreDb, handleFirestoreError, OperationType } from './firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

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
  setNote: (id: string, value: string) => void;
  generatePlan: (setupData: Partial<PlannerState>) => void;
  resetPlan: () => void;
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
  // isCalmModeActive is deprecated but kept for backwards compatibility parsing
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
    askbloom: true, foodscanner: true, babynames: true,
    dev: true, prep: true, finance: true, deadlines: true,
    medical: true, schemes: true,
    readiness: true, hospitalbag: true, birthplan: true, decisions: true, postpartum: true,
    notes: true,
  },
};

const getInitialState = (): PlannerState => {
  try {
    const savedUi = localStorage.getItem('bloom_planner_ui');
    if (savedUi) {
      const parsed = JSON.parse(savedUi);
      return { ...defaultState, isCalmModeActive: false, isDarkModeActive: parsed.isDarkModeActive || false };
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
          setState({ ...defaultState, ...JSON.parse(record.stateJSON) });
        } else {
          // Fallback to localStorage just in case of migration
          const saved = localStorage.getItem('bloom_planner');
          if (saved) {
            setState({ ...defaultState, ...JSON.parse(saved) });
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
      if (user && state.activeJourneyId) {
        try {
          const journeyRef = doc(firestoreDb, 'journeys', state.activeJourneyId);
          const docSnap = await getDoc(journeyRef);
          if (docSnap.exists()) {
            const cloudData = docSnap.data();
            setState(prev => ({ ...prev, ...cloudData }));
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `journeys/${state.activeJourneyId}`);
        }
      }
    });
    return () => unsubscribe();
  }, [state.activeJourneyId]);

  // Sync to Dexie, localStorage and Firestore
  useEffect(() => {
    // Save minimal UI preferences to local storage for instant loading on refresh
    try {
      localStorage.setItem('bloom_planner_ui', JSON.stringify({
        isCalmModeActive: state.isCalmModeActive,
        isDarkModeActive: state.isDarkModeActive,
      }));
    } catch(e) {}

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
    }
  }, [state]);

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

    const journeyId = uuidv4();
    
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
  };

  const resetPlan = () => {
    setState(defaultState);
  };

  const toggleCalmMode = () => {
    // Deprecated
  };

  const toggleDarkMode = () => {
    setState((prev) => ({ ...prev, isDarkModeActive: !prev.isDarkModeActive }));
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
        setNote,
        generatePlan,
        resetPlan,
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
