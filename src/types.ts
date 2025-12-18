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