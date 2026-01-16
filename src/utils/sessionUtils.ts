import { UserSession, StepRecord } from '../types';
import { supabase } from '../lib/supabaseClient';

/**
 * Records the status of a step for a user on a specific date.
 * @param userId The ID of the user.
 * @param date The session date in YYYY-MM-DD format.
 * @param stepId The ID of the step.
 * @param performed Whether the step was performed.
 */
export const recordStepStatus = async (
  userId: string,
  date: string,
  stepId: number,
  performed: boolean
): Promise<void> => {
  if (!supabase) {
    console.warn('Supabase client not initialized. Skipping recordStepStatus.');
    return;
  }

  const { data: existingSession, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('userId', userId)
    .eq('date', date)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching session:', error);
    throw error;
  }

  if (existingSession) {
    const stepRecordIndex = existingSession.steps.findIndex(
      (step: StepRecord) => step.id === stepId
    );

    if (stepRecordIndex >= 0) {
      existingSession.steps[stepRecordIndex].performed = performed;
    } else {
      existingSession.steps.push({ id: stepId, performed });
    }

    const { error: updateError } = await supabase
      .from('user_sessions')
      .update({ steps: existingSession.steps })
      .eq('userId', userId)
      .eq('date', date);

    if (updateError) {
      console.error('Error updating session:', updateError);
      throw updateError;
    }
  } else {
    const newSession: UserSession = {
      userId,
      date,
      steps: [{ id: stepId, performed }],
    };

    const { error: insertError } = await supabase
      .from('user_sessions')
      .insert([newSession]);

    if (insertError) {
      console.error('Error inserting session:', insertError);
      throw insertError;
    }
  }
};

/**
 * Retrieves the status of a step for a user on a specific date.
 * @param userId The ID of the user.
 * @param date The session date in YYYY-MM-DD format.
 * @param stepId The ID of the step.
 * @returns The status of the step (true if performed, false otherwise).
 */
export const getStepStatus = async (
  userId: string,
  date: string,
  stepId: number
): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase client not initialized. Returning false for getStepStatus.');
    return false;
  }

  const { data: session, error } = await supabase
    .from('user_sessions')
    .select('steps')
    .eq('userId', userId)
    .eq('date', date)
    .single();

  if (error) {
    console.error('Error fetching session:', error);
    return false;
  }

  if (session) {
    const stepRecord = session.steps.find((step: StepRecord) => step.id === stepId);
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
export const getAllStepStatuses = async (
  userId: string,
  date: string
): Promise<StepRecord[]> => {
  if (!supabase) {
    console.warn('Supabase client not initialized. Returning empty array for getAllStepStatuses.');
    return [];
  }

  const { data: session, error } = await supabase
    .from('user_sessions')
    .select('steps')
    .eq('userId', userId)
    .eq('date', date)
    .single();

  if (error) {
    console.error('Error fetching session:', error);
    return [];
  }

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
export const getUserSessions = async (userId: string): Promise<UserSession[]> => {
  if (!supabase) {
    console.warn('Supabase client not initialized. Returning empty array for getUserSessions.');
    return [];
  }

  const { data: sessions, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('userId', userId);

  if (error) {
    console.error('Error fetching user sessions:', error);
    return [];
  }

  return sessions || [];
};

/**
 * Retrieves all sessions for a specific date.
 * @param date The session date in YYYY-MM-DD format.
 * @returns An array of sessions for the specified date.
 */
export const getSessionsByDate = async (date: string): Promise<UserSession[]> => {
  if (!supabase) {
    console.warn('Supabase client not initialized. Returning empty array for getSessionsByDate.');
    return [];
  }

  const { data: sessions, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('date', date);

  if (error) {
    console.error('Error fetching sessions by date:', error);
    return [];
  }

  return sessions || [];
};
