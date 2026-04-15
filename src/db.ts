import Dexie, { Table } from 'dexie';

// Enums
export enum JourneyStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED_BIRTH = 'COMPLETED_BIRTH',
  COMPLETED_LOSS = 'COMPLETED_LOSS',
  ARCHIVED = 'ARCHIVED',
}

export enum CalculationMethod {
  LMP = 'LMP',
  CONCEPTION = 'CONCEPTION',
  ULTRASOUND = 'ULTRASOUND',
  IVF_TRANSFER = 'IVF_TRANSFER',
}

export enum TaskCategory {
  MILESTONE = 'MILESTONE',
  APPOINTMENT = 'APPOINTMENT',
  SCREENING = 'SCREENING',
  PREPARATION = 'PREPARATION',
  NUTRITION = 'NUTRITION',
  FINANCIAL = 'FINANCIAL',
  POSTPARTUM = 'POSTPARTUM'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
}

export enum SymptomType {
  NAUSEA = 'NAUSEA',
  FATIGUE = 'FATIGUE',
  CRAMPING = 'CRAMPING',
  SPOTTING = 'SPOTTING',
  HEADACHE = 'HEADACHE',
  MOOD_SWINGS = 'MOOD_SWINGS',
  INSOMNIA = 'INSOMNIA',
  HEARTBURN = 'HEARTBURN',
  OTHER = 'OTHER',
}

export enum Severity {
  MILD = 'MILD',
  MODERATE = 'MODERATE',
  SEVERE = 'SEVERE',
}

export enum SyncPermission {
  READ_TASKS = 'READ_TASKS',
  READ_SYMPTOMS = 'READ_SYMPTOMS',
  READ_MILESTONES = 'READ_MILESTONES',
  WRITE_TASKS = 'WRITE_TASKS',
}

export enum MeasurementSystem {
  METRIC = 'METRIC',
  IMPERIAL = 'IMPERIAL',
}

// Interfaces
export interface UserPreferences {
  theme: string;
  measurementSystem: MeasurementSystem;
}

export interface User {
  id: string;
  createdAt: number;
  updatedAt: number;
  preferences: UserPreferences;
}

export interface PregnancyJourney {
  id: string;
  userId: string;
  status: JourneyStatus;
  calculationMethod: CalculationMethod;
  referenceDate: number; // Unix timestamp (ms)
  estimatedDueDate: number; // Unix timestamp (ms)
  actualEndDate?: number; // Unix timestamp (ms)
  createdAt: number;
  updatedAt: number;
  // Storing the setup flags for UI filtering
  setupFlags: Record<string, boolean>;
  pregnancyNum: string;
  workSit: string;
  partnerSit: string;
}

export interface DbTask {
  id: string;
  journeyId: string;
  category: string;
  title: string;
  description?: string;
  targetGestationalWeek: number;
  status: TaskStatus;
  completedAt?: number; // Unix timestamp (ms)
  createdAt: number;
  updatedAt: number;
  assignedToPartner?: boolean;
  isCritical?: boolean;
}

export interface SymptomLog {
  id: string;
  journeyId: string;
  timestamp: number; // Unix timestamp (ms)
  symptomType: SymptomType;
  severity: Severity;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface PartnerSync {
  id: string;
  journeyId: string;
  syncPasscodeHash: string;
  permissions: SyncPermission[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface KickSession {
  id: string;
  journeyId: string;
  startTime: number;
  endTime: number;
  kickCount: number;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ContractionRecord {
  id: string;
  sessionId: string;
  journeyId: string;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  gapMs: number;
}

export interface ContractionSession {
  id: string;
  journeyId: string;
  startedAt: number;
  endedAt: number;
  createdAt: number;
}

export interface VitalsLog {
  id: string;
  journeyId: string;
  timestamp: number;
  type: 'BP' | 'WEIGHT';
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  weight?: number;
  unit?: string;
  notes?: string;
}

export interface MoodLog {
  id: string;
  journeyId: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  moodScore: number;
  energyScore: number;
  anxietyScore: number;
  journalPrompt?: string;
  journalResponse?: string;
  createdAt: number;
}

export interface HydrationLog {
  id: string;
  journeyId: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  amountMl: number;
}

export interface SupplementLog {
  id: string;
  journeyId: string;
  date: string; // YYYY-MM-DD
  supplementsTaken: string[];
}

export interface FoodScanLog {
  id: string;
  journeyId: string;
  timestamp: number;
  foodItems: string[];
  safetyLevel: string;
  imagePreview?: string;
}

export class PregnancyTrackerDB extends Dexie {
  users!: Table<User, string>;
  journeys!: Table<PregnancyJourney, string>;
  tasks!: Table<DbTask, string>;
  symptomLogs!: Table<SymptomLog, string>;
  partnerSyncs!: Table<PartnerSync, string>;
  kickSessions!: Table<KickSession, string>;
  contractionRecords!: Table<ContractionRecord, string>;
  contractionSessions!: Table<ContractionSession, string>;
  vitalsLogs!: Table<VitalsLog, string>;
  moodLogs!: Table<MoodLog, string>;
  hydrationLogs!: Table<HydrationLog, string>;
  supplementLogs!: Table<SupplementLog, string>;
  foodScanLogs!: Table<FoodScanLog, string>;

  constructor() {
    super('PregnancyTrackerDB');
    this.version(1).stores({
      users: 'id',
      journeys: 'id, userId, status, [userId+status]',
      tasks: 'id, journeyId, targetGestationalWeek, status, category, [journeyId+targetGestationalWeek+status]',
      symptomLogs: 'id, journeyId, timestamp, [journeyId+timestamp], [journeyId+symptomType]',
      partnerSyncs: 'id, journeyId, syncPasscodeHash'
    });
    
    this.version(2).stores({
      kickSessions: 'id, journeyId, startTime, [journeyId+startTime]',
      contractionRecords: 'id, sessionId, journeyId, startedAt, [journeyId+startedAt]',
      contractionSessions: 'id, journeyId, startedAt, [journeyId+startedAt]',
      vitalsLogs: 'id, journeyId, timestamp, type, [journeyId+timestamp]',
      moodLogs: 'id, journeyId, date, timestamp, [journeyId+date]',
      hydrationLogs: 'id, journeyId, date, timestamp, [journeyId+date]',
      supplementLogs: 'id, journeyId, date, [journeyId+date]',
      foodScanLogs: 'id, journeyId, timestamp, [journeyId+timestamp]'
    });
  }
}

export const db = new PregnancyTrackerDB();
