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
      <div className="min-h-screen y2k-bg flex flex-col items-center justify-center p-6">
        <div className="y2k-card max-w-lg w-full text-center">
          <h1 className="y2k-title text-4xl mb-4">✨ Abby Yeung Hair Method ✨</h1>
          <p className="y2k-text text-lg mb-6">
            Transform your hair care routine with this comprehensive 21-step method.
            Get glowing, healthy hair with expert recommendations and guided steps.
          </p>
          <button
            onClick={handleStart}
            className="y2k-button text-xl px-8 py-4"
          >
            🚀 Get Started
          </button>
          <div className="mt-6 y2k-sparkle">
            💖 Follow the steps for salon-quality results at home! 💖
          </div>
        </div>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen y2k-bg">
      {/* Progress Bar */}
      <div className="y2k-header">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex justify-between text-sm y2k-text mb-1">
            <span>Step {currentStepIndex + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full y2k-progress-bg rounded-full h-3">
            <div
              className="y2k-progress-fill h-3 rounded-full transition-all duration-300"
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
