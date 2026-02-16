// Shared step navigation logic
// This eliminates 150+ duplicate lines across 6 services

import { useState } from 'react';

interface UseStepNavigationProps {
  totalSteps: number;
  onStepChange?: (step: number) => void;
}

export const useStepNavigation = ({ totalSteps, onStepChange }: UseStepNavigationProps) => {
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set<number>());
  const [maxStepReached, setMaxStepReached] = useState(1);

  const handleNext = () => {
    if (step < totalSteps) {
      setCompletedSteps(prev => new Set([...prev, step]));
      const nextStep = step + 1;
      setStep(nextStep);
      if (nextStep > maxStepReached) {
        setMaxStepReached(nextStep);
      }
      onStepChange?.(nextStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      onStepChange?.(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (clickedStep: number) => {
    if (clickedStep <= maxStepReached) {
      setStep(clickedStep);
      onStepChange?.(clickedStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const resetSteps = () => {
    setStep(1);
    setCompletedSteps(new Set());
    setMaxStepReached(1);
  };

  return {
    step,
    completedSteps,
    maxStepReached,
    handleNext,
    handleBack,
    handleStepClick,
    resetSteps,
  };
};
