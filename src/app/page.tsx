'use client';

import { useState, useEffect, useCallback } from 'react';
import { steps } from '../data/steps';
import { Session, StepRecord } from '../types';
import StepComponent from '../components/StepComponent';

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const [viewTracking, setViewTracking] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<StepRecord[]>([]);
  const [selectedSteps, setSelectedSteps] = useState<number[]>([]);
  const [username, setUsername] = useState<string>('');
  const [usernameEntered, setUsernameEntered] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('hairCareSessions');
    if (stored) {
      setSessions(JSON.parse(stored));
    }
    const storedUsername = localStorage.getItem('hairCareUsername');
    if (storedUsername) {
      setUsername(storedUsername);
      setUsernameEntered(true);
    }
  }, []);

  const saveSessions = (newSessions: Session[]) => {
    setSessions(newSessions);
    localStorage.setItem('hairCareSessions', JSON.stringify(newSessions));
  };

  const getLastPerformedDate = (stepId: number): Date | null => {
    const userSessions = sessions.filter(s => s.username === username);
    const performedSessions = userSessions
      .filter(s => s.steps.some(r => r.id === stepId && r.performed))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return performedSessions.length > 0 ? new Date(performedSessions[0].date) : null;
  };

  const categorizeSteps = () => {
    const now = new Date();
    return steps.map(step => {
      const lastPerformed = getLastPerformedDate(step.id);
      const daysSince = lastPerformed ? (now.getTime() - lastPerformed.getTime()) / (1000 * 60 * 60 * 24) : Infinity;
      let category: 'required' | 'optional' | 'recommended';
      if (!step.isOptional) {
        category = 'required';
      } else if (daysSince > 5) {
        category = 'recommended';
      } else {
        category = 'optional';
      }
      return { ...step, category };
    });
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
    const requiredIds = steps.filter(s => !s.isOptional).map(s => s.id);
    setSelectedSteps(requiredIds);
    setIsPlanning(true);
  };

  const handleStartRoutine = () => {
    setIsPlanning(false);
    setIsStarted(true);
    setCurrentStepIndex(0);
    setCurrentSession([]);
  };

  const handleNext = () => {
    if (currentStepIndex < selectedSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Finish - save session
      const session: Session = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        username,
        steps: currentSession,
      };
      const newSessions = [...sessions, session];
      saveSessions(newSessions);
      setIsStarted(false);
      setSelectedSteps([]);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  if (isPlanning) {
    const categorizedSteps = categorizeSteps();
    const requiredSteps = categorizedSteps.filter(s => s.category === 'required');
    const optionalSteps = categorizedSteps.filter(s => s.category === 'optional');
    const recommendedSteps = categorizedSteps.filter(s => s.category === 'recommended');

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Plan Your Hair Care Routine</h1>
            <p className="text-gray-600 mb-6">
              Select the steps you want to include in this session. Steps are categorized based on your recent activity.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-red-600">Required Steps</h2>
              <div className="space-y-3">
                {requiredSteps.map(step => (
                  <label key={step.id} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedSteps.includes(step.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSteps(prev => [...prev, step.id]);
                        } else {
                          setSelectedSteps(prev => prev.filter(id => id !== step.id));
                        }
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-yellow-600">Optional Steps</h2>
              <div className="space-y-3">
                {optionalSteps.map(step => (
                  <label key={step.id} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedSteps.includes(step.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSteps(prev => [...prev, step.id]);
                        } else {
                          setSelectedSteps(prev => prev.filter(id => id !== step.id));
                        }
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-green-600">Recommended Steps</h2>
              <div className="space-y-3">
                {recommendedSteps.map(step => (
                  <label key={step.id} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedSteps.includes(step.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSteps(prev => [...prev, step.id]);
                        } else {
                          setSelectedSteps(prev => prev.filter(id => id !== step.id));
                        }
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={handleStartRoutine}
              disabled={selectedSteps.length === 0}
              className="gradient-bg text-white text-xl px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Routine ({selectedSteps.length} steps selected)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    if (viewTracking) {
      // Tracking view
      const userSessions = sessions.filter(s => s.username === username);
      const stepStats = steps.map(step => {
        const performedCount = userSessions.reduce((count, session) => {
          const record = session.steps.find(s => s.id === step.id);
          return count + (record?.performed ? 1 : 0);
        }, 0);
        const totalSessions = userSessions.length;
        const percentage = totalSessions > 0 ? Math.round((performedCount / totalSessions) * 100) : 0;
        return { ...step, performedCount, percentage };
      });

      return (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Hair Care Tracking</h1>
              <button
                onClick={() => setViewTracking(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Session Summary</h2>
              <p className="text-gray-600">Total sessions completed: {userSessions.length}</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Step Performance</h2>
              <div className="space-y-4">
                {stepStats.map(step => (
                  <div key={step.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm text-gray-500">
                         Performed {step.performedCount} out of {userSessions.length} sessions ({step.percentage}%)
                       </p>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2 ml-4">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
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
        <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex flex-col items-center justify-center p-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl max-w-lg w-full p-8 text-center border border-white/20">
            <h1 className="text-4xl font-bold text-slate-800 mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Abbey Yung Hair Method
            </h1>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
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
                    placeholder="Enter your username"
                    className="w-full px-6 py-4 bg-white/80 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 text-lg"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                </div>
                <button
                  type="submit"
                  className="gradient-bg text-white text-xl px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 w-full transform hover:scale-105"
                >
                  Continue
                </button>
              </form>
            </div>
            <div className="mt-8 text-slate-500 text-sm">
              Follow the steps for salon-quality results at home!
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex flex-col items-center justify-center p-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl max-w-lg w-full p-8 text-center border border-white/20">
          <h1 className="text-4xl font-bold text-slate-800 mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Abbey Yung Hair Method
          </h1>
          <p className="text-slate-600 text-lg mb-8 leading-relaxed">
            Transform your hair care routine with this comprehensive 21-step method.
            Get glowing, healthy hair with expert recommendations and guided steps.
          </p>
          <div className="space-y-4">
            <button
              onClick={handleStart}
              className="gradient-bg text-white text-xl px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 w-full transform hover:scale-105"
            >
              Get Started
            </button>
            {sessions.length > 0 && (
              <button
                onClick={() => setViewTracking(true)}
                className="bg-green-500 text-white text-lg px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors w-full"
              >
                View Tracking ({sessions.length} sessions)
              </button>
            )}
          </div>
          <div className="mt-6 text-slate-500 text-sm">
            Welcome, {username}! Follow the steps for salon-quality results at home!
          </div>
        </div>
      </div>
    );
  }

  const currentStep = steps.find(s => s.id === selectedSteps[currentStepIndex])!;
  const progress = ((currentStepIndex + 1) / selectedSteps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Step {currentStepIndex + 1} of {selectedSteps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
        isFirst={currentStepIndex === 0}
        isLast={currentStepIndex === selectedSteps.length - 1}
        onStepChoice={handleStepChoice}
      />
    </div>
  );
}
