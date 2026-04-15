export type Task = {
  id: string;
  text: string;
  crit: boolean;
  timing?: string;
  partner?: boolean;
  flags?: string[];
  onlyPreg?: string[];
  onlyWork?: string[];
  excludeWork?: string[];
  weeksBeforeDue?: number;
};

export type Decision = {
  id: string;
  title: string;
  desc: string;
  options: string[];
};

export type BudgetItem = {
  id: string;
  label: string;
};

export type BirthPlan = {
  personalDetails?: {
    name?: string;
    hospital?: string;
    doctor?: string;
    partnerName?: string;
  };
  environment?: string[];
  atmosphere?: string[];
  movement?: string[];
  present?: string[];
  cultural?: string;
  painRelief?: string[];
  painReliefNotes?: string;
  pushing?: string;
  episiotomy?: string;
  cSection?: string[];
  studentObservation?: string;
  cordClamping?: string;
  skinToSkin?: string;
  feeding?: string;
  postnatalCustoms?: string;
  placenta?: string;
  vitaminK?: string;
  newbornScreening?: string;
  visitors?: string;
  otherPreferences?: string;
};

export type HospitalBagItem = {
  id: string;
  label: string;
  category: 'mama' | 'baby' | 'partner' | 'documents';
  packed: boolean;
  isCustom: boolean;
};

export type PlannerState = {
  isSetup: boolean;
  dueDate: string | null;
  lmp: string | null;
  t1End: string | null;
  t2End: string | null;
  pregnancyNum: string;
  workSit: string;
  partnerSit: string;
  flags: Record<string, boolean>;
  checked: Record<string, boolean>;
  assigned: Record<string, boolean>;
  assigneeNotes: Record<string, string>;
  decisions: Record<string, string>;
  decisionNotes: Record<string, string>;
  budgetEst: Record<string, string>;
  budgetAct: Record<string, string>;
  customBudgetItems: BudgetItem[];
  customTasks: Record<string, Task[]>;
  notes: Record<string, string>;
  critFilter: boolean;
  activeJourneyId?: string;
  isCalmModeActive: boolean;
  isDarkModeActive: boolean;
  birthPlan?: BirthPlan;
  hospitalBagItems?: HospitalBagItem[];
  hasStartedOnboarding?: boolean;
  isPremium?: boolean;
  premiumPlan?: 'monthly' | 'annual';
  premiumExpiry?: string;
  razorpayPaymentId?: string;
  createdAt?: number;
};
