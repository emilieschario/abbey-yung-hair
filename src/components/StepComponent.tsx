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
    <div className="flex flex-col min-h-screen p-4 bg-gradient-to-br from-primary to-secondary">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 w-full max-w-md mx-auto flex-1 border border-white/20">
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-bold text-slate-800">Step {step.id}</h2>
            <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
              {step.isOptional ? 'Optional' : 'Required'}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-3">{step.title}</h3>
        </div>

          <div className="bg-white/60 rounded-xl p-4 mb-6 border border-slate-100">
            <p className="text-slate-600 mb-4 leading-relaxed">{step.description}</p>

            {step.actions.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-slate-700 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  Actions:
                </h4>
                <ul className="space-y-2 ml-6">
                  {step.actions.map((action, index) => (
                    <li key={index} className="text-slate-600 flex items-start">
                      <span className="text-primary mr-2">•</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {step.products && step.products.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-slate-700 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  Products:
                </h4>
                <ul className="space-y-2 ml-6">
                  {step.products.map((product, index) => (
                    <li key={index} className="text-slate-600 flex items-start">
                      <span className="text-primary mr-2">•</span>
                      {product}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {step.notes && (
              <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                <p className="text-sm text-slate-600 italic">
                  <svg className="w-4 h-4 inline mr-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {step.notes}
                </p>
              </div>
            )}
          </div>

          {step.timerMinutes && !timerActive && (
            <button
              onClick={startTimer}
              className="w-full gradient-bg text-white py-3 px-6 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 mb-4 transform hover:scale-105"
            >
              Start {step.timerMinutes} Minute Timer
            </button>
          )}

          {timerActive && (
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-primary mb-2">
                {formatTime(timeLeft)}
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${((step.timerMinutes! * 60 - timeLeft) / (step.timerMinutes! * 60)) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

        <div className={`grid gap-3 mt-auto ${!isFirst ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {!isFirst && (
            <button
              onClick={onPrevious}
              className="bg-white/70 text-slate-700 py-3 px-4 rounded-xl font-semibold hover:bg-white transition-colors border border-slate-200"
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
            className="gradient-bg text-white py-3 px-4 rounded-xl font-semibold hover:opacity-90 transition-colors"
          >
            Mark Done
          </button>
          <button
            onClick={() => {
              onStepChoice?.(step.id, false);
              onNext();
            }}
            className="bg-gray-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
          >
            Mark Not Done
          </button>
        </div>
        </div>
      </div>
    );
}
