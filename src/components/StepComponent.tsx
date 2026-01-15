'use client';

import { useState, useEffect } from 'react';
import { Step } from '../types';

interface StepComponentProps {
  step: Step;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  onStepChoice?: (stepId: number, performed: boolean) => void;
}

export default function StepComponent({ step, onNext, onPrevious, isFirst, isLast, onStepChoice }: StepComponentProps) {
  const [doStep, setDoStep] = useState<boolean | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(step.timerMinutes ? step.timerMinutes * 60 : 0);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      // Play sound or notification here if possible
      alert('Timer finished!');
    }
  }, [timerActive, timeLeft]);

  useEffect(() => {
    if (!step.isOptional) {
      onStepChoice?.(step.id, true);
    }
  }, [step.id, step.isOptional, onStepChoice]);

  const startTimer = () => {
    if (step.timerMinutes) {
      setTimeLeft(step.timerMinutes * 60);
      setTimerActive(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (step.isOptional && doStep === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Step {step.id}: {step.title}</h2>
          <p className="text-gray-700 mb-6 text-center">{step.description}</p>
          {step.notes && <p className="text-sm text-gray-500 mb-6">{step.notes}</p>}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setDoStep(false);
                onStepChoice?.(step.id, false);
              }}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={() => {
                setDoStep(true);
                onStepChoice?.(step.id, true);
              }}
              className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Done
            </button>
            <button
              onClick={onNext}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              See Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!step.isOptional || doStep) {
    return (
      <div className="flex flex-col min-h-screen p-4 bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto flex-1">
          <h2 className="text-2xl font-bold mb-4 text-center">Step {step.id}: {step.title}</h2>
          <p className="text-gray-700 mb-4">{step.description}</p>

          {step.actions.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Actions:</h3>
              <ul className="list-disc list-inside space-y-1">
                {step.actions.map((action, index) => (
                  <li key={index} className="text-gray-600">{action}</li>
                ))}
              </ul>
            </div>
          )}

          {step.products && step.products.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Products needed:</h3>
              <ul className="list-disc list-inside space-y-1">
                {step.products.map((product, index) => (
                  <li key={index} className="text-gray-600">{product}</li>
                ))}
              </ul>
            </div>
          )}

          {step.timerMinutes && !timerActive && (
            <button
              onClick={startTimer}
              className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors mb-4"
            >
              Start {step.timerMinutes} Minute Timer
            </button>
          )}

          {timerActive && (
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {formatTime(timeLeft)}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${((step.timerMinutes! * 60 - timeLeft) / (step.timerMinutes! * 60)) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {step.notes && <p className="text-sm text-gray-500 mb-6">{step.notes}</p>}

          <div className="flex gap-4">
            {!isFirst && (
              <button
                onClick={onPrevious}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Previous
              </button>
            )}
            <button
              onClick={onNext}
              disabled={step.timerMinutes ? timerActive : false}
              className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLast ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If skipped optional step
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Step {step.id} Skipped</h2>
        <p className="text-gray-700 mb-6 text-center">You chose to skip this optional step.</p>
        <button
          onClick={onNext}
          className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          Continue to Next Step
        </button>
      </div>
    </div>
  );
}