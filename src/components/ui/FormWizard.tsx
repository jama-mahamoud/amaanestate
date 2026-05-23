import React, { useState, useEffect, useRef } from 'react';
import { Button } from './button';
import { Card } from './card';

interface Step {
  id: string;
  title: string;
  component: (data: any, setData: (data: any) => void) => React.ReactNode;
  validate?: (data: any) => boolean;
}

interface FormWizardProps {
  steps: Step[];
  initialData: any;
  onSaveDraft: (data: any) => void;
  onSubmit: (data: any) => void;
  onDataChange: (data: any) => void;
}

export function FormWizard({ steps, initialData, onSaveDraft, onSubmit, onDataChange }: FormWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const wizardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  const handleNext = () => {
    const currentStepConfig = steps[currentStepIndex];
    if (currentStepConfig.validate && !currentStepConfig.validate(formData)) return;

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      window.scrollTo({ top: wizardRef.current ? wizardRef.current.offsetTop - 100 : 0, behavior: 'smooth' });
    } else {
      onSubmit(formData);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      window.scrollTo({ top: wizardRef.current ? wizardRef.current.offsetTop - 100 : 0, behavior: 'smooth' });
    }
  };

  const currentStep = steps[currentStepIndex];

  return (
    <div ref={wizardRef} className="w-full max-w-3xl mx-auto py-12">
      {/* Progress Bar */}
      <div className="flex flex-col gap-3 mb-10">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C5A059]">Step {currentStepIndex + 1} of {steps.length}</div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#C5A059] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Card */}
      <Card className="p-8 md:p-12 bg-white/[0.02] border border-white/10 rounded-[2.5rem] shadow-2xl">
        <h2 className="text-3xl font-display font-black tracking-tighter mb-10 text-white">{currentStep.title}</h2>
        <div className="min-h-[400px]">
          {currentStep.component(formData, setFormData)}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center mt-10">
        <Button variant="ghost" onClick={handleBack} disabled={currentStepIndex === 0} className="text-white/60 hover:text-white uppercase font-bold text-xs tracking-widest">Back</Button>
        <div className="flex gap-4">
            <Button variant="outline" onClick={() => onSaveDraft(formData)} className="bg-transparent border-white/10 text-xs font-bold uppercase tracking-widest rounded-2xl h-12 px-6">Save Draft</Button>
            <Button onClick={handleNext} className="bg-[#C5A059] text-black hover:bg-white text-xs font-bold uppercase tracking-widest rounded-2xl h-12 px-8">
                {currentStepIndex === steps.length - 1 ? 'Submit Property' : 'Next Step'}
            </Button>
        </div>
      </div>
    </div>
  );
}
