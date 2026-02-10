export type StepCategory = 'required' | 'optional' | 'recommended';

export interface Step {
  id: number;
  title: string;
  description: string;
  isOptional: boolean;
  actions: string[];
  timerMinutes?: number;
  products?: string[];
  preferredProduct?: string;
  notes?: string;
}

export interface PlanningStep extends Step {
  category: StepCategory;
}

export interface StepRecord {
  id: number;
  performed: boolean;
}

export interface Session {
  id: string;
  date: string;
  steps: StepRecord[];
}

export interface UserSession {
  userId: string;
  date: string;
  steps: StepRecord[];
}

export interface UserSessionRecord {
  userId: string;
  date: string;
  stepId: number;
  performed: boolean;
}

export interface PlanningSelections {
  userId: string;
  date: string;
  selectedSteps: number[];
}