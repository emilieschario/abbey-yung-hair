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
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-semibold text-gray-900">Hair Care Tracking</h1>
              <button
                onClick={() => setViewTracking(false)}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg font-semibold border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">Session Summary</h2>
              <p className="text-gray-600">Total sessions completed: {sessions.length}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Step Performance</h2>
              <div className="space-y-4">
                {stepStats.map(step => (
                  <div key={step.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{step.title}</h3>
                      <p className="text-sm text-gray-500">
                        Performed {step.performedCount} out of {sessions.length} sessions ({step.percentage}%)
                      </p>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2 ml-4">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${step.percentage}%` }}
                      ></div>
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
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
          <div className="bg-white rounded-lg shadow-sm max-w-lg w-full p-8 text-center border border-gray-200">
            <h1 className="text-3xl font-semibold text-gray-900 mb-4">
              Abbey Yung Hair Method
            </h1>
            <p className="text-gray-600 text-base mb-8 leading-relaxed">
              Transform your hair care routine with this comprehensive 21-step method.
              Get glowing, healthy hair with expert recommendations and guided steps.
            </p>
            <div className="space-y-6">
              <form onSubmit={handleUsernameSubmit} className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && username.trim()) {
                        handleUsernameSubmit(e);
                      }
                    }}
                    placeholder="Enter your username"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-colors"
                    required
                    autoFocus
                  />
                </div>
              </form>
            </div>
            <div className="mt-6 text-gray-500 text-sm">
              Follow the steps for salon-quality results at home!
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-sm max-w-lg w-full p-8 text-center border border-gray-200">
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">
            Abbey Yung Hair Method
          </h1>
          <p className="text-gray-600 text-base mb-8 leading-relaxed">
            Transform your hair care routine with this comprehensive 21-step method.
            Get glowing, healthy hair with expert recommendations and guided steps.
          </p>
          <div className="space-y-4">
            <button
              onClick={handleStart}
              className="bg-green-600 text-white text-base px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors w-full"
            >
              Get Started
            </button>
            {sessions.length > 0 && (
              <button
                onClick={() => setViewTracking(true)}
                className="bg-white text-gray-700 text-base px-6 py-3 rounded-lg font-semibold border border-gray-200 hover:bg-gray-100 transition-colors w-full"
              >
                View Tracking ({sessions.length} sessions)
              </button>
            )}
          </div>
          <div className="mt-6 text-gray-500 text-sm">
            Welcome, {username}! Follow the steps for salon-quality results at home!
          </div>
        </div>
      </div>
    );
  }

  const currentStep = steps.find(s => s.id === selectedStepsIds[currentSelectedIndex]) || steps[0];
  const progress = selectedStepsIds.length > 0 ? ((currentSelectedIndex + 1) / selectedStepsIds.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Step {currentSelectedIndex + 1} of {selectedStepsIds.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
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
