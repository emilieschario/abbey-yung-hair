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
    // Pre-select required and recommended
    const preSelected = planningSteps
      .filter(step => step.category === 'required' || step.category === 'recommended')
      .map(step => step.id);
    setSelectedSteps(preSelected);
  }, [planningSteps]);

  const toggleStep = (stepId: number) => {
    const step = planningSteps.find(s => s.id === stepId);
    if (step?.category === 'required') return; // Can't unselect required
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

  const categoryConfig: Record<string, { label: string; description: string; badgeClass: string; icon: React.ReactNode }> = {
    required: {
      label: 'Required Steps',
      description: 'These steps are essential for your routine',
      badgeClass: 'badge-required',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    recommended: {
      label: 'Recommended Steps',
      description: 'Based on your recent routine history',
      badgeClass: 'badge-recommended',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    optional: {
      label: 'Optional Steps',
      description: 'Add these based on your needs today',
      badgeClass: 'badge-optional',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
  };

  const greeting = isReturningUser ? `Welcome back, ${username}!` : `Welcome, ${username}!`;

  // Function to simplify frequency text
  const simplifyFrequency = (notes: string): string => {
    if (!notes) return '';
    
    // Common patterns to simplify
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

  const selectedCount = selectedSteps.length;
  const totalCount = planningSteps.length;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{greeting}</h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Select the steps for {"today's"} session. Required steps are always included.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {selectedCount} of {totalCount} steps selected
          </div>
        </div>

        {/* Step Groups */}
        {Object.entries(groupedSteps).map(([category, categorySteps]) => {
          if (categorySteps.length === 0) return null;
          const config = categoryConfig[category];

          return (
            <div key={category} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center gap-3">
                <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                  category === 'required' ? 'bg-rose-100 text-rose-600' :
                  category === 'recommended' ? 'bg-amber-100 text-amber-600' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {config.icon}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">{config.label}</h2>
                  <p className="text-xs text-gray-400">{config.description}</p>
                </div>
              </div>

              {/* Steps List - Card layout for mobile, table for desktop */}
              <div className="card overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden sm:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="w-14 px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Step
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-44">
                          Frequency
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Product
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {categorySteps.map(step => {
                        const frequency = simplifyFrequency(step.notes || '');
                        const firstProduct = step.products && step.products.length > 0 ? step.products[0] : null;
                        const isSelected = selectedSteps.includes(step.id);
                        const isRequired = step.category === 'required';

                        return (
                          <tr
                            key={step.id}
                            onClick={() => toggleStep(step.id)}
                            className={`transition-colors cursor-pointer ${
                              isSelected ? 'bg-rose-50/50' : 'hover:bg-gray-50'
                            } ${isRequired ? 'cursor-default' : ''}`}
                          >
                            <td className="px-4 py-3.5">
                              <div className="flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleStep(step.id)}
                                  disabled={isRequired}
                                  className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500 cursor-pointer disabled:cursor-default"
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <span className="flex-shrink-0 w-6 h-6 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold">
                                  {step.id}
                                </span>
                                <span className={`font-medium text-sm ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                                  {step.title}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="text-xs text-gray-400">{frequency || '—'}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="text-xs text-gray-400 line-clamp-1">{firstProduct || '—'}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card Layout */}
                <div className="sm:hidden divide-y divide-gray-50">
                  {categorySteps.map(step => {
                    const frequency = simplifyFrequency(step.notes || '');
                    const firstProduct = step.products && step.products.length > 0 ? step.products[0] : null;
                    const isSelected = selectedSteps.includes(step.id);
                    const isRequired = step.category === 'required';

                    return (
                      <div
                        key={step.id}
                        onClick={() => toggleStep(step.id)}
                        className={`flex items-start gap-3 p-4 transition-colors cursor-pointer ${
                          isSelected ? 'bg-rose-50/50' : ''
                        } ${isRequired ? 'cursor-default' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleStep(step.id)}
                          disabled={isRequired}
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500 cursor-pointer disabled:cursor-default flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="flex-shrink-0 w-5 h-5 rounded bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-bold">
                              {step.id}
                            </span>
                            <span className={`font-medium text-sm ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                              {step.title}
                            </span>
                          </div>
                          {(frequency || firstProduct) && (
                            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                              {frequency && (
                                <span className="text-xs text-gray-400">
                                  <span className="text-gray-300">⏱</span> {frequency}
                                </span>
                              )}
                              {firstProduct && (
                                <span className="text-xs text-gray-400 truncate">
                                  <span className="text-gray-300">💧</span> {firstProduct}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Submit Button */}
        <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-4 pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleSubmit}
              className="btn-primary w-full text-base"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Session ({selectedCount} steps)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
