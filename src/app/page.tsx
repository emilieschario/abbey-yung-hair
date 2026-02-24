'use client';

import { useState, useEffect, useCallback } from 'react';
import { steps } from '../data/steps';
import { Session, StepRecord, PlanningStep, PlanningSelections } from '../types';
import StepComponent from '../components/StepComponent';
import PlanningComponent from '../components/PlanningComponent';

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);
  const [viewTracking, setViewTracking] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<StepRecord[]>([]);
  const [username, setUsername] = useState<string>('');
  const [usernameEntered, setUsernameEntered] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const [planningSteps, setPlanningSteps] = useState<PlanningStep[]>([]);
  const [selectedStepsIds, setSelectedStepsIds] = useState<number[]>([]);
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState(0);
  const [planningSelections, setPlanningSelections] = useState<PlanningSelections[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('hairCareSessions');
    if (stored) {
      setSessions(JSON.parse(stored));
    }
    const storedUsername = localStorage.getItem('hairCareUsername');
    if (storedUsername) {
      setUsername(storedUsername);
      setUsernameEntered(true);
      setIsReturningUser(true);
    }
    const storedPlanning = localStorage.getItem('hairCarePlanningSelections');
    if (storedPlanning) {
      setPlanningSelections(JSON.parse(storedPlanning));
    }
  }, []);

  const saveSessions = (newSessions: Session[]) => {
    setSessions(newSessions);
    localStorage.setItem('hairCareSessions', JSON.stringify(newSessions));
  };

  const savePlanningSelections = (newSelections: PlanningSelections[]) => {
    setPlanningSelections(newSelections);
    localStorage.setItem('hairCarePlanningSelections', JSON.stringify(newSelections));
  };

  const getLastPerformedDate = (stepId: number): string | null => {
    const performedSessions = sessions.filter(session =>
      session.steps.some(step => step.id === stepId && step.performed)
    );
    if (performedSessions.length === 0) return null;
    const sorted = performedSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted[0].date;
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('hairCareUsername', username);
      setUsernameEntered(true);
    }
  };

  const handleStepChoice = useCallback((stepId: number, performed: boolean) => {
    setCurrentSession(prev => {
      const existing = prev.find(s => s.id === stepId);
      if (existing) {
        return prev.map(s => s.id === stepId ? { ...s, performed } : s);
      } else {
        return [...prev, { id: stepId, performed }];
      }
    });
  }, []);

  const handleStart = () => {
    if (!usernameEntered) {
      alert('Please enter your username first!');
      return;
    }
    setIsPlanning(true);
    const calculatedPlanningSteps: PlanningStep[] = steps.map(step => {
      const lastDate = getLastPerformedDate(step.id);
      const daysSince = lastDate ? (new Date().getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24) : Infinity;
      const RECENT_DAYS_THRESHOLD = 2;
      const category: 'required' | 'optional' | 'recommended' =
        !step.isOptional
          ? 'required'
          : (daysSince > 0 && daysSince <= RECENT_DAYS_THRESHOLD)
            ? 'recommended'
            : 'optional';
      return { ...step, category };
    });
    setPlanningSteps(calculatedPlanningSteps);
  };

  const handlePlanningSubmit = (selected: number[]) => {
    const sortedSelected = [...selected].sort((a, b) => a - b);
    setSelectedStepsIds(sortedSelected);
    setCurrentSelectedIndex(0);
    setCurrentSession([]);
    setIsPlanning(false);
    setIsStarted(true);
    const today = new Date().toISOString().split('T')[0];
    const newSelection: PlanningSelections = {
      userId: username,
      date: today,
      selectedSteps: sortedSelected,
    };
    const newSelections = [...planningSelections, newSelection];
    savePlanningSelections(newSelections);
  };

  const handleNext = () => {
    if (currentSelectedIndex < selectedStepsIds.length - 1) {
      setCurrentSelectedIndex(currentSelectedIndex + 1);
    } else {
      const session: Session = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        steps: currentSession,
      };
      const newSessions = [...sessions, session];
      saveSessions(newSessions);
      setIsStarted(false);
    }
  };

  const handlePrevious = () => {
    if (currentSelectedIndex > 0) {
      setCurrentSelectedIndex(currentSelectedIndex - 1);
    }
  };

  if (isPlanning) {
    return <PlanningComponent planningSteps={planningSteps} onSelectionsSubmit={handlePlanningSubmit} username={username} isReturningUser={isReturningUser} />;
  }

  if (!isStarted) {
    if (viewTracking) {
      const stepStats = steps.map(step => {
        const performedCount = sessions.reduce((count, session) => {
          const record = session.steps.find(s => s.id === step.id);
          return count + (record?.performed ? 1 : 0);
        }, 0);
        const totalSessions = sessions.length;
        const percentage = totalSessions > 0 ? Math.round((performedCount / totalSessions) * 100) : 0;
        return { ...step, performedCount, percentage };
      });

      return (
        <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  Hair Care Tracking
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Your routine performance at a glance
                </p>
              </div>
              <button
                onClick={() => setViewTracking(false)}
                className="btn-secondary text-sm"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back
              </button>
            </div>

            {/* Summary Card */}
            <div className="card bg-gradient-to-r from-teal-500 to-teal-600 text-white border-none">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-teal-100">Total Sessions</p>
                  <p className="text-3xl font-bold">{sessions.length}</p>
                </div>
              </div>
            </div>

            {/* Step Performance */}
            <div className="card">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Step Performance</h2>
              <div className="space-y-3">
                {stepStats.map(step => (
                  <div
                    key={step.id}
                    className="group rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:border-teal-200 hover:bg-teal-50/30"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                            {step.id}
                          </span>
                          <h3 className="truncate text-sm font-semibold text-gray-900">
                            {step.title}
                          </h3>
                        </div>
                        <p className="mt-1 pl-8 text-xs text-gray-500">
                          {step.performedCount} of {sessions.length} sessions ({step.percentage}%)
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-teal-600">{step.percentage}%</span>
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-500"
                            style={{ width: `${step.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!usernameEntered) {
      return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12">
          <div className="card w-full max-w-md text-center">
            {/* Logo / Icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg shadow-teal-200">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Abbey Yung Hair Method
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Transform your hair care routine with this comprehensive 21-step method.
              Get glowing, healthy hair with expert recommendations and guided steps.
            </p>

            <form onSubmit={handleUsernameSubmit} className="mt-8 space-y-4">
              <div>
                <label htmlFor="username" className="sr-only">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && username.trim()) {
                      handleUsernameSubmit(e);
                    }
                  }}
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-teal-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-100"
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!username.trim()}
                className="btn-primary w-full"
              >
                Get Started
              </button>
            </form>

            <p className="mt-6 text-xs text-gray-400">
              Follow the steps for salon-quality results at home ✨
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="card w-full max-w-md text-center">
          {/* Logo / Icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg shadow-teal-200">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Abbey Yung Hair Method
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Transform your hair care routine with this comprehensive 21-step method.
            Get glowing, healthy hair with expert recommendations and guided steps.
          </p>

          <div className="mt-8 space-y-3">
            <button
              onClick={handleStart}
              className="btn-primary w-full"
            >
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              Start Session
            </button>
            {sessions.length > 0 && (
              <button
                onClick={() => setViewTracking(true)}
                className="btn-secondary w-full"
              >
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                View Tracking ({sessions.length} sessions)
              </button>
            )}
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
              {username.charAt(0).toUpperCase()}
            </span>
            <span>Welcome, <span className="font-medium text-gray-600">{username}</span>!</span>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = steps.find(s => s.id === selectedStepsIds[currentSelectedIndex]) || steps[0];
  const progress = selectedStepsIds.length > 0 ? ((currentSelectedIndex + 1) / selectedStepsIds.length) * 100 : 0;

  return (
    <div className="min-h-screen">
      {/* Progress Bar */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-md px-4 py-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-gray-600">
              Step {currentSelectedIndex + 1} of {selectedStepsIds.length}
            </span>
            <span className="rounded-full bg-teal-100 px-2.5 py-0.5 font-semibold text-teal-700">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <StepComponent
        step={currentStep}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isFirst={currentSelectedIndex === 0}
        onStepChoice={handleStepChoice}
      />
    </div>
  );
}
