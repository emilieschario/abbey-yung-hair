export interface Step {
  id: number;
  title: string;
  description: string;
  isOptional: boolean;
  actions: string[];
  timerMinutes?: number;
  products?: string[];
  notes?: string;
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