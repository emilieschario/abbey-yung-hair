'use client';

import { useState, useEffect } from 'react';
import { steps } from '../data/steps';
import { Session, StepRecord } from '../types';
import StepComponent from '../components/StepComponent';

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);
  const [viewTracking, setViewTracking] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<StepRecord[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('hairCareSessions');
    if (stored) {
      setSessions(JSON.parse(stored));
    }
  }, []);

  const saveSessions = (newSessions: Session[]) => {
    setSessions(newSessions);
    localStorage.setItem('hairCareSessions', JSON.stringify(newSessions));
  };

  const handleStepChoice = (stepId: number, performed: boolean) => {
    setCurrentSession(prev => {
      const existing = prev.find(s => s.id === stepId);
      if (existing) {
        return prev.map(s => s.id === stepId ? { ...s, performed } : s);
      } else {
        return [...prev, { id: stepId, performed }];
      }
    });
  };

  const handleStart = () => {
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
              <p className="text-gray-600">Total sessions completed: {sessions.length}</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Step Performance</h2>
              <div className="space-y-4">
                {stepStats.map(step => (
                  <div key={step.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm text-gray-500">
                        Performed {step.performedCount} out of {sessions.length} sessions ({step.percentage}%)
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

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Abbey Yung Hair Method</h1>
          <p className="text-gray-600 text-lg mb-6">
            Transform your hair care routine with this comprehensive 21-step method.
            Get glowing, healthy hair with expert recommendations and guided steps.
          </p>
          <div className="space-y-4">
            <button
              onClick={handleStart}
              className="bg-blue-500 text-white text-xl px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors w-full"
            >
              Get Started
            </button>
            {sessions.length > 0 && (
              <button
                onClick={() => setViewTracking(true)}
                className="bg-green-500 text-white text-lg px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors w-full"
              >
                View Tracking ({sessions.length} sessions)
              </button>
            )}
          </div>
          <div className="mt-6 text-gray-500">
            Follow the steps for salon-quality results at home!
          </div>
        </div>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Step {currentStepIndex + 1} of {steps.length}</span>
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
        isLast={currentStepIndex === steps.length - 1}
        onStepChoice={handleStepChoice}
      />
    </div>
  );
}
