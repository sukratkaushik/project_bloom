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

export type CustomSupplement = {
  id: string;
  name: string;
  dose: string;
};

export type SyncPermissions = {
  mode?: 'edit' | 'read';
  excludedTaskIds?: string[];
  
  kickcounter: boolean;
  contractions: boolean;
  vitals: boolean;
  mood: boolean;
  hydration: boolean;
  nutrition: boolean;
  symptoms: boolean;

  askbloom: boolean;
  foodscanner: boolean;
  babynames: boolean;

  dev: boolean;
  prep: boolean;
  finance: boolean;
  deadlines: boolean;

  medical: boolean;
  schemes: boolean;

  readiness: boolean;
  hospitalbag: boolean;
  birthplan: boolean;
  decisions: boolean;
  postpartum: boolean;

  notes: boolean;
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
  dietPref: string;
  flags: Record<string, boolean>;
  checked: Record<string, boolean>;
  assigned: Record<string, boolean>;
  assigneeNotes: Record<string, string>;
  deletedTasks: Record<string, boolean>;
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
  favoriteNames?: string[];
  favoritePages?: string[];
  userName?: string;
  weightUnit?: 'kg' | 'lbs';
  calendarStartDay?: 'sunday' | 'monday';
  createdAt?: number;
  syncPermissions?: SyncPermissions;
  isPartnerReadOnly?: boolean;
  dailyKnowledgeStreak?: number;
  lastKnowledgeDropDate?: string;
  customSupplements?: CustomSupplement[];
};
