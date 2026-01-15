import { UserSession, StepRecord } from '../types';
import { userSessions } from '../data/userSessions';
import { steps } from '../data/steps';

/**
 * Records the status of a step for a user on a specific date.
 * @param userId The ID of the user.
 * @param date The session date in YYYY-MM-DD format.
 * @param stepId The ID of the step.
 * @param performed Whether the step was performed.
 */
export const recordStepStatus = (
  userId: string,
  date: string,
  stepId: number,
  performed: boolean
): void => {
  const existingSessionIndex = userSessions.findIndex(
    (session) => session.userId === userId && session.date === date
  );

  if (existingSessionIndex >= 0) {
    const session = userSessions[existingSessionIndex];
    const stepRecordIndex = session.steps.findIndex(
      (step) => step.id === stepId
    );

    if (stepRecordIndex >= 0) {
      session.steps[stepRecordIndex].performed = performed;
    } else {
      session.steps.push({ id: stepId, performed });
    }
  } else {
    const newSession: UserSession = {
      userId,
      date,
      steps: [{ id: stepId, performed }],
    };
    userSessions.push(newSession);
  }
};

/**
 * Retrieves the status of a step for a user on a specific date.
 * @param userId The ID of the user.
 * @param date The session date in YYYY-MM-DD format.
 * @param stepId The ID of the step.
 * @returns The status of the step (true if performed, false otherwise).
 */
export const getStepStatus = (
  userId: string,
  date: string,
  stepId: number
): boolean => {
  const session = userSessions.find(
    (session) => session.userId === userId && session.date === date
  );

  if (session) {
    const stepRecord = session.steps.find((step) => step.id === stepId);
    return stepRecord ? stepRecord.performed : false;
  }

  return false;
};

/**
 * Retrieves all step statuses for a user on a specific date.
 * @param userId The ID of the user.
 * @param date The session date in YYYY-MM-DD format.
 * @returns An array of step records for the user on the specified date.
 */
export const getAllStepStatuses = (
  userId: string,
  date: string
): StepRecord[] => {
  const session = userSessions.find(
    (session) => session.userId === userId && session.date === date
  );

  if (session) {
    return session.steps;
  }

  return [];
};

/**
 * Retrieves all sessions for a user.
 * @param userId The ID of the user.
 * @returns An array of sessions for the user.
 */
export const getUserSessions = (userId: string): UserSession[] => {
  return userSessions.filter((session) => session.userId === userId);
};

/**
 * Retrieves all sessions for a specific date.
 * @param date The session date in YYYY-MM-DD format.
 * @returns An array of sessions for the specified date.
 */
export const getSessionsByDate = (date: string): UserSession[] => {
  return userSessions.filter((session) => session.date === date);
};