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

  const categoryConfig: Record<string, { label: string; color: string; bg: string }> = {
    required: { label: 'Required', color: 'text-teal-800', bg: 'bg-teal-50' },
    recommended: { label: 'Recommended', color: 'text-blue-800', bg: 'bg-blue-50' },
    optional: { label: 'Optional', color: 'text-amber-800', bg: 'bg-amber-50' },
  };

  if (step.id === 0 && planningOverview) {
    return (
      <div className="flex min-h-screen flex-col px-4 py-6 sm:px-6">
        <div className="card mx-auto w-full max-w-md flex-1 flex flex-col">
          {/* Step Header */}
          <div className="mb-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-sm font-bold text-white shadow-md">
                  {step.id}
                </span>
                <h2 className="text-xl font-bold text-gray-900">{step.title}</h2>
              </div>
              <span className={step.isOptional ? 'badge-optional' : 'badge-required'}>
                {step.isOptional ? 'Optional' : 'Required'}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6 flex-1 space-y-4 rounded-xl bg-gray-50 p-4">
            {step.description && (
              <p className="text-sm leading-relaxed text-gray-600">{step.description}</p>
            )}

            {/* Overview of all steps */}
            <div className="space-y-4">
              {Object.entries(groupedSteps).map(([category, steps]) => {
                const config = categoryConfig[category];
                return (
                  <div key={category}>
                    <h4 className={`mb-2 text-xs font-semibold uppercase tracking-wider ${config.color}`}>
                      {config.label} Steps
                    </h4>
                    <div className="space-y-1.5">
                      {steps.map(s => (
                        <div
                          key={s.id}
                          className={`flex items-center gap-2 rounded-lg ${config.bg} px-3 py-2 text-sm ${config.color}`}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold">
                            {s.id}
                          </span>
                          <span className="font-medium">{s.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`grid gap-3 ${!isFirst ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {!isFirst && (
              <button onClick={onPrevious} className="btn-secondary text-sm">
                ← Back
              </button>
            )}
            <button
              onClick={() => {
                onStepChoice?.(step.id, true);
                onNext();
              }}
              className="btn-primary text-sm"
            >
              ✓ Done
            </button>
            <button
              onClick={() => {
                onStepChoice?.(step.id, false);
                onNext();
              }}
              className="btn-secondary text-sm"
            >
              Skip →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col px-4 py-6 sm:px-6">
      <div className="card mx-auto w-full max-w-md flex-1 flex flex-col">
        {/* Step Header */}
        <div className="mb-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-sm font-bold text-white shadow-md">
                {step.id}
              </span>
              <h2 className="text-xl font-bold text-gray-900">{step.title}</h2>
            </div>
            <span className={step.isOptional ? 'badge-optional' : 'badge-required'}>
              {step.isOptional ? 'Optional' : 'Required'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6 flex-1 space-y-4 rounded-xl bg-gray-50 p-4">
          {step.description && (
            <p className="text-sm leading-relaxed text-gray-600">{step.description}</p>
          )}

          {/* Preferred Product */}
          {step.preferredProduct && (
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-700">Preferred Product</h4>
              </div>
              <p className="text-sm font-medium text-teal-800">{step.preferredProduct}</p>
            </div>
          )}

          {/* Actions */}
          {step.actions.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                Actions
              </h4>
              <ul className="space-y-2">
                {step.actions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                      {index + 1}
                    </span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Products */}
          {step.products && step.products.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                Products
              </h4>
              <ul className="space-y-1.5">
                {step.products.map((product, index) => (
                  <li key={index} className="flex items-start gap-2 rounded-lg bg-white px-3 py-2 text-sm text-gray-600 shadow-sm">
                    <span className="mt-0.5 text-teal-400">•</span>
                    <span>{product}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Notes */}
          {step.notes && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="text-sm text-amber-800">{step.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Timer */}
        {step.timerMinutes && !timerActive && (
          <button
            onClick={startTimer}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-teal-300 bg-teal-50 px-6 py-3 text-sm font-semibold text-teal-700 transition-all hover:border-teal-400 hover:bg-teal-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start {step.timerMinutes} Minute Timer
          </button>
        )}

        {timerActive && (
          <div className="mb-6 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 p-4 text-center text-white shadow-lg">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-teal-100">Time Remaining</p>
            <div className="text-4xl font-bold tabular-nums tracking-tight">
              {formatTime(timeLeft)}
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-1000 ease-linear"
                style={{ width: `${((step.timerMinutes! * 60 - timeLeft) / (step.timerMinutes! * 60)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`grid gap-3 mt-auto ${!isFirst ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {!isFirst && (
            <button onClick={onPrevious} className="btn-secondary text-sm">
              ← Back
            </button>
          )}
          <button
            onClick={() => {
              onStepChoice?.(step.id, true);
              onNext();
            }}
            disabled={step.timerMinutes ? timerActive : false}
            className="btn-primary text-sm"
          >
            ✓ Done
          </button>
          <button
            onClick={() => {
              onStepChoice?.(step.id, false);
              onNext();
            }}
            className="btn-secondary text-sm"
          >
            Skip →
          </button>
        </div>
      </div>
    </div>
  );
}
