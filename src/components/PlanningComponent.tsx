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

  const categoryConfig: Record<string, { label: string; description: string; badgeClass: string; icon: string; borderColor: string; bgColor: string }> = {
    required: {
      label: 'Required Steps',
      description: 'These steps are essential for every session',
      badgeClass: 'badge-required',
      icon: '🔒',
      borderColor: 'border-rose-200',
      bgColor: 'bg-rose-50/50',
    },
    recommended: {
      label: 'Recommended Steps',
      description: 'Based on your recent routine',
      badgeClass: 'badge-recommended',
      icon: '⭐',
      borderColor: 'border-amber-200',
      bgColor: 'bg-amber-50/50',
    },
    optional: {
      label: 'Optional Steps',
      description: 'Add these based on your needs today',
      badgeClass: 'badge-optional',
      icon: '✨',
      borderColor: 'border-gray-200',
      bgColor: 'bg-gray-50/50',
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
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{greeting}</h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Select the steps for {"today's"} session. Required steps are always included.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100">
            <span className="text-sm font-semibold text-rose-700">{selectedCount}</span>
            <span className="text-sm text-rose-500">of {totalCount} steps selected</span>
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
                <span className="text-lg">{config.icon}</span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">{config.label}</h2>
                  <p className="text-xs text-gray-500">{config.description}</p>
                </div>
              </div>

              {/* Steps List - Card layout for mobile, table-like for desktop */}
              <div className="space-y-2">
                {categorySteps.map(step => {
                  const frequency = simplifyFrequency(step.notes || '');
                  const firstProduct = step.products && step.products.length > 0 ? step.products[0] : null;
                  const isSelected = selectedSteps.includes(step.id);
                  const isRequired = step.category === 'required';

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => toggleStep(step.id)}
                      disabled={isRequired}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? `${config.bgColor} ${config.borderColor} shadow-sm`
                          : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                      } ${isRequired ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <div className="pt-0.5 flex-shrink-0">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors duration-150 ${
                            isSelected
                              ? 'bg-rose-500 border-rose-500'
                              : 'border-gray-300 bg-white'
                          } ${isRequired ? 'opacity-60' : ''}`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{step.title}</h3>
                            {isRequired && (
                              <span className="badge-required text-[10px] px-2 py-0.5">Required</span>
                            )}
                          </div>

                          {/* Details row */}
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                            {frequency && (
                              <span className="inline-flex items-center text-xs text-gray-500">
                                <svg className="w-3.5 h-3.5 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {frequency}
                              </span>
                            )}
                            {firstProduct && (
                              <span className="inline-flex items-center text-xs text-gray-500 truncate max-w-[250px] sm:max-w-none">
                                <svg className="w-3.5 h-3.5 mr-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                                {firstProduct}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Submit Button */}
        <div className="sticky bottom-0 py-4 bg-gradient-to-t from-white via-white to-transparent -mx-4 px-4 sm:-mx-6 sm:px-6">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleSubmit}
              className="btn-primary w-full text-base py-3.5"
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
