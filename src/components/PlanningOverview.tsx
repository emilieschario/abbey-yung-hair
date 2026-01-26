'use client';

import { steps } from '../data/steps';
import { Session } from '../types';

interface PlanningOverviewProps {
  sessions: Session[];
  onProceed: () => void;
}

export default function PlanningOverview({ sessions, onProceed }: PlanningOverviewProps) {
  const getLastPerformedDate = (stepId: number, sessions: Session[]): string | null => {
    const sortedSessions = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const session of sortedSessions) {
      const record = session.steps.find(s => s.id === stepId);
      if (record && record.performed) {
        return session.date;
      }
    }
    return null;
  };

  const getCategory = (step: typeof steps[0]): string => {
    const lastDate = getLastPerformedDate(step.id, sessions);
    const now = new Date();
    const daysSince = lastDate ? (now.getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24) : Infinity;
    const frequency = 7; // assume 7 days
    const overdueDays = daysSince - frequency;

    if (!step.isOptional) {
      return 'required';
    } else if (overdueDays <= 2 && overdueDays > -Infinity) { // if overdue by <=2 days or never performed
      return 'recommended';
    } else {
      return 'optional';
    }
  };

  const categorizedSteps = {
    required: steps.filter(step => getCategory(step) === 'required'),
    recommended: steps.filter(step => getCategory(step) === 'recommended'),
    optional: steps.filter(step => getCategory(step) === 'optional'),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Planning Overview</h1>
          <p className="text-gray-600 mb-6">
            Here is an overview of all 20 steps in the Abbey Yung Hair Method. Steps are categorized based on their importance and your recent activity.
          </p>
        </div>

        {categorizedSteps.required.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Required Steps</h2>
            <div className="space-y-4">
              {categorizedSteps.required.map(step => (
                <div key={step.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    Required
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {categorizedSteps.recommended.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-yellow-600">Recommended Steps</h2>
            <div className="space-y-4">
              {categorizedSteps.recommended.map(step => (
                <div key={step.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    Recommended
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {categorizedSteps.optional.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-green-600">Optional Steps</h2>
            <div className="space-y-4">
              {categorizedSteps.optional.map(step => (
                <div key={step.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Optional
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <button
            onClick={onProceed}
            className="w-full gradient-bg text-white text-xl px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105"
          >
            Proceed to Steps
          </button>
        </div>
      </div>
    </div>
  );
}