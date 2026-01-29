'use client';

import { useState, useEffect, useCallback } from 'react';
import { steps } from '../data/steps';
import { Session, StepRecord } from '../types';
import StepComponent from '../components/StepComponent';
import DarkModeToggle from '../components/DarkModeToggle';

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);
  const [viewTracking, setViewTracking] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<StepRecord[]>([]);
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
    setIsStarted(true);
    setCurrentStepIndex(0);
    setCurrentSession([]);
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
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
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  if (!isStarted) {
    if (viewTracking) {
      // Tracking view
      const stepStats = steps.map(step => {
        // Find the most recent session where this step was performed
        const sessionsWithStep = sessions
          .filter(session => {
            const record = session.steps.find(s => s.id === step.id);
            return record?.performed;
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        const lastPerformed = sessionsWithStep.length > 0 ? sessionsWithStep[0].date : null;
        const daysSinceLastPerformed = lastPerformed 
          ? Math.floor((Date.now() - new Date(lastPerformed).getTime()) / (1000 * 60 * 60 * 24))
          : null;
        
        const performedCount = sessions.reduce((count, session) => {
          const record = session.steps.find(s => s.id === step.id);
          return count + (record?.performed ? 1 : 0);
        }, 0);
        const totalSessions = sessions.length;
        const percentage = totalSessions > 0 ? Math.round((performedCount / totalSessions) * 100) : 0;
        
        return { ...step, performedCount, percentage, lastPerformed, daysSinceLastPerformed };
      });

      return (
        <div className="min-h-screen bg-background p-6 dark:bg-gray-900">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-text dark:text-gray-100">Hair Care Tracking</h1>
              <div className="flex gap-3">
                <DarkModeToggle />
                <button
                  onClick={() => setViewTracking(false)}
                  className="bg-gray-500 dark:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 dark:hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>
              </div>
            </div>

            <div className="bg-card dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-text dark:text-gray-100">Session Summary</h2>
              <p className="text-gray-600 dark:text-gray-300">Total sessions completed: {sessions.length}</p>
            </div>

            <div className="bg-card dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-text dark:text-gray-100">Step Performance</h2>
              <div className="space-y-4">
                {stepStats.map(step => (
                  <div key={step.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-text dark:text-gray-100">{step.title}</h3>
                      {step.lastPerformed ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Last performed: {step.daysSinceLastPerformed === 0 
                            ? 'Today' 
                            : step.daysSinceLastPerformed === 1 
                            ? '1 day ago' 
                            : `${step.daysSinceLastPerformed} days ago`}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Never performed</p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Total: {step.performedCount} out of {sessions.length} sessions ({step.percentage}%)
                      </p>
                    </div>
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 ml-4">
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
          <div className="absolute top-4 right-4">
            <DarkModeToggle />
          </div>
          <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm rounded-2xl shadow-xl max-w-lg w-full p-8 text-center border border-white/20 dark:border-gray-700/20">
            <h1 className="text-4xl font-bold text-slate-800 dark:text-gray-100 mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Abbey Yung Hair Method
            </h1>
            <p className="text-slate-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
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
                    className="w-full px-6 py-4 bg-white/80 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 text-lg text-text dark:text-gray-100"
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
            <div className="mt-8 text-slate-500 dark:text-gray-400 text-sm">
              Follow the steps for salon-quality results at home!
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex flex-col items-center justify-center p-6">
        <div className="absolute top-4 right-4">
          <DarkModeToggle />
        </div>
        <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm rounded-2xl shadow-xl max-w-lg w-full p-8 text-center border border-white/20 dark:border-gray-700/20">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-gray-100 mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Abbey Yung Hair Method
          </h1>
          <p className="text-slate-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
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
          <div className="mt-6 text-slate-500 dark:text-gray-400 text-sm">
            Welcome, {username}! Follow the steps for salon-quality results at home!
          </div>
        </div>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      {/* Progress Bar */}
      <div className="bg-card dark:bg-gray-800 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex justify-between text-sm text-text-secondary dark:text-gray-400 mb-1">
            <span>Step {currentStepIndex + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
        isLast={currentStepIndex === steps.length - 1}
        onStepChoice={handleStepChoice}
      />
    </div>
  );
}
