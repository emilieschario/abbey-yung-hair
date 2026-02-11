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

  const categoryLabels: Record<string, string> = {
    required: 'Required steps',
    recommended: 'Recommended steps',
    optional: 'Optional steps',
  };

  const greeting = isReturningUser ? `Welcome back, ${username}!` : `Welcome, ${username}!`;

  // Function to simplify frequency text
  const simplifyFrequency = (notes: string): string => {
    if (!notes) return '';
    
    // Common patterns to simplify
    const simplifications: [RegExp, string][] = [
      [/Use as many times per week as needed for your hair type\.?/i, 'as many times per week as needed'],
      [/Use 1-2 times per week for best results\.?/i, '1-2 times per week'],
      [/Use at least once a week, or more frequently if needed based on your hair and scalp condition\.?/i, 'at least once a week'],
      [/Use once a week or more frequently if your hair needs it\.?/i, 'once a week or more'],
      [/For K18, use as needed—typically once every few weeks\. For all other bond repair treatments, use once a week or more frequently if your hair needs it\.?/i, 'K18: once every few weeks; others: once a week or more'],
      [/Apply every wash day\.?/i, 'every wash day'],
      [/Do once a week\.?/i, 'once a week'],
      [/Use 1-2 times per week if hair feels weak\.?/i, '1-2 times per week'],
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">{greeting}</h1>
          <p className="text-gray-600 mt-2">
            Select the steps you want to include in {"today's"} session. Required steps are pre-selected and cannot be deselected.
          </p>
        </div>

        {Object.entries(groupedSteps).map(([category, steps]) => (
          <div key={category} className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">{categoryLabels[category]}</h2>
            <div className="space-y-3">
              {steps.map(step => {
                // Extract and simplify frequency from notes
                const frequency = simplifyFrequency(step.notes || '');
                // Get first product if available
                const firstProduct = step.products && step.products.length > 0 ? step.products[0] : null;
                
                return (
                  <label key={step.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedSteps.includes(step.id)}
                      onChange={() => toggleStep(step.id)}
                      disabled={step.category === 'required'}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{step.title}</h3>
                      <div className="text-sm text-gray-600 mt-1 space-y-0.5">
                        {frequency && <p>{frequency}</p>}
                        {firstProduct && <p className="text-gray-500">Product: {firstProduct}</p>}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        <div className="text-center">
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Start session
          </button>
        </div>
      </div>
    </div>
  );
}
