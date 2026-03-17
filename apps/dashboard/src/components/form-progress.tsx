'use client';

import { Progress } from '@/components/ui/progress';
import { designTokens } from '@/lib/design-tokens';

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export function FormProgress({ currentStep, totalSteps, labels }: FormProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-zinc-400">
          Paso {currentStep} de {totalSteps}
        </span>
        <span className="text-sm text-zinc-400">
          {Math.round(progress)}% completado
        </span>
      </div>
      
      <Progress 
        value={progress} 
        className="h-2 bg-zinc-800"
      />
      
      {labels && (
        <div className="flex justify-between text-xs text-zinc-500">
          {labels.map((label, index) => (
            <span 
              key={index}
              className={`${
                index < currentStep 
                  ? 'text-blue-400' 
                  : index === currentStep - 1 
                  ? 'text-white' 
                  : 'text-zinc-600'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
