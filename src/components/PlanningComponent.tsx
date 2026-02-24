'use client';

import { useState, useEffect } from 'react';
import { PlanningStep } from '../types';

interface PlanningComponentProps {
  planningSteps: PlanningStep[];
  onSelectionsSubmit: (selectedSteps: number[]) => void;
  username: string;
  isReturningUser: boolean;
}

export default function PlanningComponent({ planningSteps, onSelectionsSubmit, username, isReturningUser }: PlanningComponentProps) {
  const [selectedSteps, setSelectedSteps] = useState<number[]>([]);

  useEffect(() => {
    const preSelected = planningSteps
      .filter(step => step.category === 'required' || step.category === 'recommended')
      .map(step => step.id);
    setSelectedSteps(preSelected);
  }, [planningSteps]);

  const toggleStep = (stepId: number) => {
    const step = planningSteps.find(s => s.id === stepId);
    if (step?.category === 'required') return;
    setSelectedSteps(prev =>
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const handleSubmit = () => {
    onSelectionsSubmit(selectedSteps);
  };

  const groupedSteps = {
    required: planningSteps.filter(s => s.category === 'required'),
    recommended: planningSteps.filter(s => s.category === 'recommended'),
    optional: planningSteps.filter(s => s.category === 'optional'),
  };

  const categoryConfig: Record<string, { label: string; description: string; icon: React.ReactNode; badgeClass: string; borderColor: string }> = {
    required: {
      label: 'Required Steps',
      description: 'These steps are essential for your routine',
      icon: (
        <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badgeClass: 'badge-required',
      borderColor: 'border-teal-200',
    },
    recommended: {
      label: 'Recommended Steps',
      description: 'Recently performed — keep the momentum going',
      icon: (
        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3.75a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 5.25c0 .372-.052.732-.15 1.073a8.835 8.835 0 01-1.452 2.677 3.001 3.001 0 00-.523 2.25l.035.174a3 3 0 002.916 2.576H19.5a2.25 2.25 0 010 4.5h-2.873c-.372 0-.734.074-1.073.215l-.174.07a3.75 3.75 0 01-2.88 0l-.174-.07A3.001 3.001 0 0011.25 18H9.375A2.625 2.625 0 016.75 15.375v-3.54a3.001 3.001 0 00-.117-1.335z" />
        </svg>
      ),
      badgeClass: 'badge-recommended',
      borderColor: 'border-blue-200',
    },
    optional: {
      label: 'Optional Steps',
      description: 'Add these based on your hair needs today',
      icon: (
        <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badgeClass: 'badge-optional',
      borderColor: 'border-amber-200',
    },
  };

  const greeting = isReturningUser ? `Welcome back, ${username}!` : `Welcome, ${username}!`;

  const simplifyFrequency = (notes: string): string => {
    if (!notes) return '';
    const simplifications: [RegExp, string][] = [
      [/Use as many times per week as needed for your hair type\.?/i, 'As needed'],
      [/Use 1-2 times per week for best results\.?/i, '1-2x per week'],
      [/Use at least once a week, or more frequently if needed based on your hair and scalp condition\.?/i, 'At least 1x per week'],
      [/Use once a week or more frequently if your hair needs it\.?/i, '1x per week or more'],
      [/For K18, use as needed—typically once every few weeks\. For all other bond repair treatments, use once a week or more frequently if your hair needs it\.?/i, 'K18: Every few weeks; Others: 1x per week+'],
      [/Apply every wash day\.?/i, 'Every wash day'],
      [/Do once a week\.?/i, '1x per week'],
      [/Use 1-2 times per week if hair feels weak\.?/i, '1-2x per week'],
      [/^Use /i, ''],
      [/\. This step is optional.*$/i, ''],
      [/\. These can be used.*$/i, ''],
      [/\. Skip this step.*$/i, ''],
    ];
    let simplified = notes;
    for (const [pattern, replacement] of simplifications) {
      simplified = simplified.replace(pattern, replacement);
    }
    return simplified.trim();
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {greeting}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Select the steps you want to include in {"today's"} session. Required steps are pre-selected and cannot be deselected.
          </p>
        </div>

        {/* Step Groups */}
        {Object.entries(groupedSteps).map(([category, steps]) => {
          if (steps.length === 0) return null;
          const config = categoryConfig[category];

          return (
            <div key={category} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center gap-3">
                {config.icon}
                <div>
                  <h2 className="text-base font-semibold text-gray-900">{config.label}</h2>
                  <p className="text-xs text-gray-500">{config.description}</p>
                </div>
              </div>

              {/* Table Card */}
              <div className="card overflow-hidden !p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/80">
                        <th className="w-14 px-4 py-3 text-left">
                          <span className="sr-only">Select</span>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Step
                        </th>
                        <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 sm:table-cell">
                          Frequency
                        </th>
                        <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 md:table-cell">
                          Product
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {steps.map(step => {
                        const frequency = simplifyFrequency(step.notes || '');
                        const firstProduct = step.products && step.products.length > 0 ? step.products[0] : null;
                        const isSelected = selectedSteps.includes(step.id);
                        const isRequired = step.category === 'required';

                        return (
                          <tr
                            key={step.id}
                            onClick={() => toggleStep(step.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-teal-50/50 hover:bg-teal-50'
                                : 'hover:bg-gray-50'
                            } ${isRequired ? 'cursor-default' : ''}`}
                          >
                            <td className="px-4 py-3.5">
                              <div className="flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleStep(step.id)}
                                  disabled={isRequired}
                                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 disabled:opacity-60"
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                                  {step.id}
                                </span>
                                <div>
                                  <span className="text-sm font-medium text-gray-900">{step.title}</span>
                                  {/* Show frequency on mobile */}
                                  {frequency && (
                                    <p className="mt-0.5 text-xs text-gray-400 sm:hidden">{frequency}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="hidden px-4 py-3.5 sm:table-cell">
                              <span className="text-sm text-gray-500">{frequency || '—'}</span>
                            </td>
                            <td className="hidden px-4 py-3.5 md:table-cell">
                              <span className="text-sm text-gray-500">{firstProduct || '—'}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}

        {/* Submit */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {selectedSteps.length} steps selected
            </p>
            <p className="text-xs text-gray-500">Ready to start your session</p>
          </div>
          <button
            onClick={handleSubmit}
            className="btn-primary"
          >
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            Start Session
          </button>
        </div>
      </div>
    </div>
  );
}
