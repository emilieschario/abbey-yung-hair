'use client';

import { useState, useEffect } from 'react';
import { Step } from '../types';

interface StepComponentProps {
  step: Step;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  onStepChoice?: (stepId: number, performed: boolean) => void;
}

export default function StepComponent({ step, onNext, onPrevious, isFirst, onStepChoice }: StepComponentProps) {
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


  return (
    <div className="flex flex-col min-h-screen p-6 bg-gray-50">
      <div className="bg-white rounded-lg shadow-sm p-6 w-full max-w-md mx-auto flex-1 border border-gray-200">
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-semibold text-gray-900">Step {step.id}</h2>
            <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium border border-gray-200">
              {step.isOptional ? 'Optional' : 'Required'}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{step.title}</h3>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <p className="text-gray-600 mb-4 leading-relaxed">{step.description}</p>

          {step.actions.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-gray-800">Actions</h4>
              <ul className="space-y-2 ml-4">
                {step.actions.map((action, index) => (
                  <li key={index} className="text-gray-600 list-disc">
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step.products && step.products.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-gray-800">Products</h4>
              <ul className="space-y-2 ml-4">
                {step.products.map((product, index) => (
                  <li key={index} className="text-gray-600 list-disc">
                    {product}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step.notes && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">{step.notes}</p>
            </div>
          )}
        </div>

        {step.timerMinutes && !timerActive && (
          <button
            onClick={startTimer}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4"
          >
            Start {step.timerMinutes} Minute Timer
          </button>
        )}

        {timerActive && (
          <div className="text-center mb-6">
            <div className="text-3xl font-semibold text-gray-900 mb-2">
              {formatTime(timeLeft)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${((step.timerMinutes! * 60 - timeLeft) / (step.timerMinutes! * 60)) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className={`grid gap-3 mt-auto ${!isFirst ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {!isFirst && (
            <button
              onClick={onPrevious}
              className="bg-white text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors border border-gray-200"
            >
              Previous
            </button>
          )}
          <button
            onClick={() => {
              onStepChoice?.(step.id, true);
              onNext();
            }}
            disabled={step.timerMinutes ? timerActive : false}
            className="bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Mark Done
          </button>
          <button
            onClick={() => {
              onStepChoice?.(step.id, false);
              onNext();
            }}
            className="bg-white text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors border border-gray-200"
          >
            Mark Not Done
          </button>
        </div>
      </div>
    </div>
  );
}
