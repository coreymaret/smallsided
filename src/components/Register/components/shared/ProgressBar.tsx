import React from 'react';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  completedSteps: Set<number>;
  maxStepReached: number;
  onStepClick: (step: number) => void;
  styles: any; // SCSS module styles
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  stepLabels,
  completedSteps,
  maxStepReached,
  onStepClick,
  styles,
}) => {
  return (
    <div className={styles.progress}>
      <div className={styles.progressSteps}>
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => {
          const isClickable = s <= maxStepReached;
          const isCompleted = completedSteps.has(s) || currentStep > s;
          
          return (
            <div
              key={s}
              onClick={() => isClickable && onStepClick(s)}
              className={`${styles.progressStep} ${isClickable ? styles.clickable : ''} ${isCompleted ? styles.completed : ''} ${currentStep === s ? styles.active : ''}`}
            >
              <div className={styles.progressCircle}>
                {isCompleted ? <Check size={16} /> : s}
              </div>
              <span className={styles.progressLabel}>
                {stepLabels[s - 1]}
              </span>
            </div>
          );
        })}
      </div>
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${(currentStep / totalSteps) * 100}%` }} 
        />
      </div>
    </div>
  );
};

export default ProgressBar;
