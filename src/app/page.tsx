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
      // Category logic:
      // - required: non-optional steps
      // - recommended: optional steps performed recently (within threshold)
      // - optional: optional steps not performed recently, including never performed (daysSince = Infinity)
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
    // Sort selected steps by their step number to maintain proper order
    const sortedSelected = [...selected].sort((a, b) => a - b);
    setSelectedStepsIds(sortedSelected);
    setCurrentSelectedIndex(0);
    setCurrentSession([]);
    setIsPlanning(false);
    setIsStarted(true);
    // Save planning selection
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
      // Finish - save session
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
      // Tracking view
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
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Hair Care Tracking</h1>
                <p className="text-gray-500 mt-1">Your routine performance over time</p>
              </div>
              <button
                onClick={() => setViewTracking(false)}
                className="btn-secondary self-start"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            </div>

            {/* Summary Card */}
            <div className="card-elevated p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Session Summary</h2>
                  <p className="text-gray-500">
                    <span className="text-2xl font-bold text-rose-600">{sessions.length}</span> sessions completed
                  </p>
                </div>
              </div>
            </div>

            {/* Step Performance */}
            <div className="card-elevated p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Step Performance</h2>
              <div className="space-y-3">
                {stepStats.map(step => (
                  <div key={step.id} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-sm font-bold">
                      {step.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900 text-sm truncate pr-2">{step.title}</h3>
                        <span className="text-xs font-semibold text-gray-500 flex-shrink-0">
                          {step.performedCount}/{sessions.length} ({step.percentage}%)
                        </span>
                      </div>
                      <div className="progress-bar h-2">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${step.percentage}%` }}
                        ></div>
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
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
          <div className="card-elevated max-w-md w-full p-8 sm:p-10 text-center">
            {/* Decorative element */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center mb-6 shadow-lg shadow-rose-500/25">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Abbey Yung Hair Method
            </h1>
            <p className="text-gray-500 text-sm sm:text-base mb-8 leading-relaxed max-w-sm mx-auto">
              Transform your hair care routine with this comprehensive 21-step method.
              Get glowing, healthy hair with expert recommendations.
            </p>

            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && username.trim()) {
                    handleUsernameSubmit(e);
                  }
                }}
                placeholder="Enter your name"
                className="input-field text-center"
                required
                autoFocus
              />
              <button
                type="submit"
                disabled={!username.trim()}
                className="btn-primary w-full"
              >
                Get Started
              </button>
            </form>

            <p className="mt-6 text-gray-400 text-xs">
              Follow the steps for salon-quality results at home ✨
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="card-elevated max-w-md w-full p-8 sm:p-10 text-center">
          {/* Decorative element */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center mb-6 shadow-lg shadow-rose-500/25">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Abbey Yung Hair Method
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mb-8 leading-relaxed max-w-sm mx-auto">
            Transform your hair care routine with this comprehensive 21-step method.
            Get glowing, healthy hair with expert recommendations.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleStart}
              className="btn-primary w-full"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Session
            </button>
            {sessions.length > 0 && (
              <button
                onClick={() => setViewTracking(true)}
                className="btn-secondary w-full"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Tracking ({sessions.length} sessions)
              </button>
            )}
          </div>

          <p className="mt-6 text-gray-400 text-xs">
            Welcome back, <span className="font-medium text-gray-500">{username}</span>! ✨
          </p>
        </div>
      </div>
    );
  }

  const currentStep = steps.find(s => s.id === selectedStepsIds[currentSelectedIndex]) || steps[0];
  const progress = selectedStepsIds.length > 0 ? ((currentSelectedIndex + 1) / selectedStepsIds.length) * 100 : 0;

  return (
    <div className="min-h-screen">
      {/* Progress Bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
            <span>Step {currentSelectedIndex + 1} of {selectedStepsIds.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="progress-bar h-2">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            ></div>
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
