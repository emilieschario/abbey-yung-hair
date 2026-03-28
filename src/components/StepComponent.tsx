'use client';

import { useState, useEffect } from 'react';
import { Step } from '../types';

interface StepComponentProps {
  step: Step;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  onStepChoice?: (stepId: number, performed: boolean) => void;
  planningOverview?: import('../types').PlanningStep[];
}

export default function StepComponent({ step, onNext, onPrevious, isFirst, onStepChoice, planningOverview }: StepComponentProps) {
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


  const groupedSteps: Record<string, import('../types').PlanningStep[]> = planningOverview ? {
    required: planningOverview.filter(s => s.category === 'required'),
    recommended: planningOverview.filter(s => s.category === 'recommended'),
    optional: planningOverview.filter(s => s.category === 'optional'),
  } : {};

  if (step.id === 0 && planningOverview) {
    return (
      <div className="flex flex-col min-h-screen p-4 sm:p-6">
        <div className="card-elevated p-6 sm:p-8 w-full max-w-lg mx-auto flex-1 flex flex-col">
          {/* Step Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-rose-500/20">
                  {step.id}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{step.title}</h2>
                </div>
              </div>
              <span className={step.isOptional ? 'badge-optional' : 'badge-required'}>
                {step.isOptional ? 'Optional' : 'Required'}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="bg-gray-50 rounded-xl p-5 mb-6 flex-1">
            <p className="text-gray-600 mb-5 leading-relaxed">{step.description}</p>

            {/* Overview of all steps */}
            <div className="space-y-5">
              {Object.entries(groupedSteps).map(([category, steps]) => (
                <div key={category}>
                  <h4 className="font-semibold capitalize text-gray-800 text-sm mb-2 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      category === 'required' ? 'bg-rose-500' :
                      category === 'recommended' ? 'bg-amber-500' :
                      'bg-gray-400'
                    }`}></span>
                    {category} Steps
                  </h4>
                  <div className="space-y-1.5 ml-4">
                    {steps.map(s => (
                      <div key={s.id} className="text-gray-500 text-sm flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-gray-100 text-gray-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          {s.id}
                        </span>
                        {s.title}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`grid gap-3 mt-auto ${!isFirst ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {!isFirst && (
              <button onClick={onPrevious} className="btn-ghost text-sm py-2.5">
                ← Back
              </button>
            )}
            <button
              onClick={() => {
                onStepChoice?.(step.id, true);
                onNext();
              }}
              className="btn-primary text-sm py-2.5"
            >
              ✓ Done
            </button>
            <button
              onClick={() => {
                onStepChoice?.(step.id, false);
                onNext();
              }}
              className="btn-secondary text-sm py-2.5"
            >
              Skip →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const timerProgress = step.timerMinutes
    ? ((step.timerMinutes * 60 - timeLeft) / (step.timerMinutes * 60)) * 100
    : 0;

  return (
    <div className="flex flex-col min-h-[calc(100vh-60px)] p-4 sm:p-6">
      <div className="card-elevated p-6 sm:p-8 w-full max-w-lg mx-auto flex-1 flex flex-col">
        {/* Step Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-rose-500/20">
                {step.id}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{step.title}</h2>
              </div>
            </div>
            <span className={step.isOptional ? 'badge-optional' : 'badge-required'}>
              {step.isOptional ? 'Optional' : 'Required'}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-4 mb-6 flex-1">
          {/* Description */}
          {step.description && (
            <p className="text-gray-600 leading-relaxed text-sm">{step.description}</p>
          )}

          {/* Preferred Product */}
          {step.preferredProduct && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-800 text-sm">Preferred Product</h4>
                  <p className="text-emerald-700 text-sm mt-0.5">{step.preferredProduct}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {step.actions.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Actions
              </h4>
              <ul className="space-y-2">
                {step.actions.map((action, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-[10px] font-bold mt-0.5">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Products */}
          {step.products && step.products.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-fuchsia-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Products
              </h4>
              <ul className="space-y-2">
                {step.products.map((product, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-fuchsia-400 mt-1 flex-shrink-0">•</span>
                    <span className="leading-relaxed">{product}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Notes */}
          {step.notes && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-amber-800 leading-relaxed">{step.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Timer */}
        {step.timerMinutes && !timerActive && (
          <button
            onClick={startTimer}
            className="w-full mb-4 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-fuchsia-500/25 hover:shadow-xl hover:shadow-fuchsia-500/30 active:scale-[0.98] transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start {step.timerMinutes} Minute Timer
          </button>
        )}

        {timerActive && (
          <div className="mb-6 p-5 bg-gradient-to-br from-fuchsia-50 to-purple-50 rounded-xl border border-fuchsia-100">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-3 font-mono tracking-wider">
                {formatTime(timeLeft)}
              </div>
              <div className="progress-bar h-3 mb-2">
                <div
                  className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-full transition-all duration-1000"
                  style={{ width: `${timerProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400">
                {timeLeft > 0 ? 'Timer running...' : 'Timer complete! ✨'}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`grid gap-3 mt-auto ${!isFirst ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {!isFirst && (
            <button onClick={onPrevious} className="btn-ghost text-sm py-2.5">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}
          <button
            onClick={() => {
              onStepChoice?.(step.id, true);
              onNext();
            }}
            disabled={step.timerMinutes ? timerActive : false}
            className="btn-primary text-sm py-2.5"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Done
          </button>
          <button
            onClick={() => {
              onStepChoice?.(step.id, false);
              onNext();
            }}
            className="btn-secondary text-sm py-2.5"
          >
            Skip
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
