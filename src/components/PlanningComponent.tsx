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
              {steps.map(step => (
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
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  </div>
                </label>
              ))}
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
