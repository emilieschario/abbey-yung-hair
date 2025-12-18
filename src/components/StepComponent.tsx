'use client';

import { useState, useEffect } from 'react';
import { Step } from '../types';

interface StepComponentProps {
  step: Step;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export default function StepComponent({ step, onNext, onPrevious, isFirst, isLast }: StepComponentProps) {
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
      <div className="flex flex-col items-center justify-center min-h-screen p-4 y2k-bg">
        <div className="y2k-card p-6 w-full max-w-md">
          <h2 className="y2k-step-title text-2xl mb-4 text-center">Step {step.id}: {step.title}</h2>
          <p className="y2k-text mb-6 text-center">{step.description}</p>
          {step.notes && <p className="text-sm y2k-text mb-6">{step.notes}</p>}
          <div className="flex gap-4">
            <button
              onClick={() => setDoStep(false)}
              className="flex-1 y2k-step-button py-3 px-6"
            >
              Skip
            </button>
            <button
              onClick={() => setDoStep(true)}
              className="flex-1 y2k-step-button py-3 px-6"
            >
              Do It
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!step.isOptional || doStep) {
    return (
      <div className="flex flex-col min-h-screen p-4 y2k-bg">
        <div className="y2k-step-card p-6 w-full max-w-md mx-auto flex-1">
          <h2 className="y2k-step-title text-2xl mb-4 text-center">Step {step.id}: {step.title}</h2>
          <p className="y2k-text mb-4">{step.description}</p>

          {step.actions.length > 0 && (
            <div className="mb-6">
              <h3 className="y2k-step-title mb-2">Actions:</h3>
              <ul className="list-disc list-inside space-y-1">
                {step.actions.map((action, index) => (
                  <li key={index} className="y2k-text">{action}</li>
                ))}
              </ul>
            </div>
          )}

          {step.products && step.products.length > 0 && (
            <div className="mb-6">
              <h3 className="y2k-step-title mb-2">Products needed:</h3>
              <ul className="list-disc list-inside space-y-1">
                {step.products.map((product, index) => (
                  <li key={index} className="y2k-text">{product}</li>
                ))}
              </ul>
            </div>
          )}

          {step.timerMinutes && !timerActive && (
            <button
              onClick={startTimer}
              className="w-full y2k-step-button py-3 px-6 mb-4"
            >
              Start {step.timerMinutes} Minute Timer
            </button>
          )}

          {timerActive && (
            <div className="text-center mb-6">
              <div className="text-4xl font-bold y2k-title mb-2">
                {formatTime(timeLeft)}
              </div>
              <div className="w-full y2k-progress-bg rounded-full h-4">
                <div
                  className="y2k-progress-fill rounded-full transition-all duration-1000"
                  style={{ width: `${((step.timerMinutes! * 60 - timeLeft) / (step.timerMinutes! * 60)) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {step.notes && <p className="text-sm y2k-text mb-6">{step.notes}</p>}

          <div className="flex gap-4">
            {!isFirst && (
              <button
                onClick={onPrevious}
                className="flex-1 y2k-step-button py-3 px-6"
                style={{ background: 'linear-gradient(45deg, #ff8000, #ffff00)' }}
              >
                Previous
              </button>
            )}
            <button
              onClick={onNext}
              disabled={step.timerMinutes ? timerActive : false}
              className="flex-1 y2k-step-button py-3 px-6"
            >
              {isLast ? 'Finish ✨' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If skipped optional step
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 y2k-bg">
      <div className="y2k-card p-6 w-full max-w-md">
        <h2 className="y2k-step-title text-2xl mb-4 text-center">Step {step.id} Skipped</h2>
        <p className="y2k-text mb-6 text-center">You chose to skip this optional step.</p>
        <button
          onClick={onNext}
          className="w-full y2k-step-button py-3 px-6"
        >
          Continue to Next Step
        </button>
      </div>
    </div>
  );
}