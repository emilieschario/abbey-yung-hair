'use client';

import { useState } from 'react';
import { steps } from '../data/steps';
import StepComponent from '../components/StepComponent';

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const handleStart = () => {
    setIsStarted(true);
    setCurrentStepIndex(0);
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Finish
      setIsStarted(false);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Abby Yeung Hair Method</h1>
          <p className="text-gray-600 text-lg mb-6">
            Transform your hair care routine with this comprehensive 21-step method.
            Get glowing, healthy hair with expert recommendations and guided steps.
          </p>
          <button
            onClick={handleStart}
            className="bg-blue-500 text-white text-xl px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Get Started
          </button>
          <div className="mt-6 text-gray-500">
            Follow the steps for salon-quality results at home!
          </div>
        </div>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Step {currentStepIndex + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <StepComponent
        step={currentStep}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isFirst={currentStepIndex === 0}
        isLast={currentStepIndex === steps.length - 1}
      />
    </div>
  );
}
