import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlannerState, BudgetItem } from './types';
import { db, JourneyStatus, CalculationMethod } from './db';
import { v4 as uuidv4 } from 'uuid';
import { addDays, addWeeks } from './utils';
import { auth, db as firestoreDb } from './firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

type PlannerContextType = {
  state: PlannerState;
  updateState: (updates: Partial<PlannerState>) => void;
  toggleTask: (id: string) => void;
  toggleAssign: (id: string) => void;
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
  flags: {},
  checked: {},
  assigned: {},
  assigneeNotes: {},
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
};

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PlannerState>(() => {
    const saved = localStorage.getItem('bloom_planner');
    if (saved) {
      try {
        return { ...defaultState, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }
    return defaultState;
  });

  // Listen for auth state and load cloud data if available
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user && state.activeJourneyId) {
        const journeyRef = doc(firestoreDb, 'journeys', state.activeJourneyId);
        const docSnap = await getDoc(journeyRef);
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          setState(prev => ({ ...prev, ...cloudData }));
        }
      }
    });
    return () => unsubscribe();
  }, [state.activeJourneyId]);

  // Sync to localStorage and Firestore
  useEffect(() => {
    localStorage.setItem('bloom_planner', JSON.stringify(state));
    
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
      }, { merge: true }).catch(err => console.error("Firestore sync error:", err));
    }
  }, [state]);

  const updateState = (updates: Partial<PlannerState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const toggleTask = (id: string) => {
    setState((prev) => ({
      ...prev,
      checked: { ...prev.checked, [id]: !prev.checked[id] },
    }));
  };

  const toggleAssign = (id: string) => {
    setState((prev) => ({
      ...prev,
      assigned: { ...prev.assigned, [id]: !prev.assigned[id] },
    }));
  };

  const setAssigneeNote = (id: string, note: string) => {
    setState((prev) => ({
      ...prev,
      assigneeNotes: { ...prev.assigneeNotes, [id]: note },
    }));
  };

  const setDecision = (id: string, value: string) => {
    setState((prev) => ({
      ...prev,
      decisions: { ...prev.decisions, [id]: value },
    }));
  };

  const setDecisionNote = (id: string, value: string) => {
    setState((prev) => ({
      ...prev,
      decisionNotes: { ...prev.decisionNotes, [id]: value },
    }));
  };

  const setBudgetEst = (id: string, value: string) => {
    setState((prev) => ({
      ...prev,
      budgetEst: { ...prev.budgetEst, [id]: value },
    }));
  };

  const setBudgetAct = (id: string, value: string) => {
    setState((prev) => ({
      ...prev,
      budgetAct: { ...prev.budgetAct, [id]: value },
    }));
  };

  const addCustomBudgetItem = (label: string) => {
    const id = 'custom_' + Date.now();
    setState((prev) => ({
      ...prev,
      customBudgetItems: [...prev.customBudgetItems, { id, label }],
    }));
  };

  const addCustomTask = (section: string, text: string) => {
    const id = `custom_task_${Date.now()}`;
    const newTask = { id, text, crit: false };
    setState((prev) => {
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
    setState((prev) => ({
      ...prev,
      notes: { ...prev.notes, [id]: value },
    }));
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
    setState((prev) => ({ ...prev, isCalmModeActive: !prev.isCalmModeActive }));
  };

  const toggleDarkMode = () => {
    setState((prev) => ({ ...prev, isDarkModeActive: !prev.isDarkModeActive }));
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
