import React, { useState, useMemo, useEffect } from 'react';
import { TRAINING_STEPS } from '../constants';
import type { TrainingData, Profile } from '../types';

interface TrainingWizardProps {
  onComplete: (profileData: { id: string | null; name: string; data: TrainingData }) => void;
  onCancel?: () => void;
  isCancelable?: boolean;
  initialProfile?: Profile;
}

const initialData = TRAINING_STEPS.reduce((acc, step) => {
  acc[step.id] = step.questions.reduce((qAcc, q) => {
    qAcc[q.id] = '';
    return qAcc;
  }, {} as any);
  return acc;
}, {} as TrainingData);

const totalQuestions = TRAINING_STEPS.reduce((sum, s) => sum + s.questions.length, 0);

export const TrainingWizard: React.FC<TrainingWizardProps> = ({ onComplete, onCancel, isCancelable, initialProfile }) => {
  const [step, setStep] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [data, setData] = useState<TrainingData>(initialData);
  const [profileName, setProfileName] = useState('');
  const [isIntro, setIsIntro] = useState(!initialProfile);
  
  useEffect(() => {
    if (initialProfile) {
      setProfileName(initialProfile.name);
      setData(initialProfile.data);
    }
  }, [initialProfile]);

  const { currentQuestion, overallQuestionIndex, progress } = useMemo(() => {
    const currentStepConfig = TRAINING_STEPS[step];
    const currentQuestionConfig = currentStepConfig.questions[questionIndex];
    
    let overallIndex = 0;
    for (let i = 0; i < step; i++) {
      overallIndex += TRAINING_STEPS[i].questions.length;
    }
    overallIndex += questionIndex;

    const progressPercentage = totalQuestions > 0 ? ((overallIndex + 1) / totalQuestions) * 100 : 0;

    return {
      currentQuestion: { ...currentQuestionConfig, stepId: currentStepConfig.id },
      overallQuestionIndex: overallIndex,
      progress: progressPercentage
    };
  }, [step, questionIndex]);
  
  const handleChange = (value: string) => {
    setData(prev => ({
      ...prev,
      [currentQuestion.stepId]: {
        ...prev[currentQuestion.stepId],
        [currentQuestion.id]: value,
      }
    }));
  };

  const next = () => {
    const currentStepConfig = TRAINING_STEPS[step];
    if (questionIndex < currentStepConfig.questions.length - 1) {
      setQuestionIndex(q => q + 1);
    } else {
      if (step < TRAINING_STEPS.length - 1) {
        setStep(s => s + 1);
        setQuestionIndex(0);
      } else {
        onComplete({ id: initialProfile?.id || null, name: profileName, data });
      }
    }
  };

  const prev = () => {
    if (questionIndex > 0) {
      setQuestionIndex(q => q - 1);
    } else {
      if (step > 0) {
        const prevStepConfig = TRAINING_STEPS[step - 1];
        setStep(s => s - 1);
        setQuestionIndex(prevStepConfig.questions.length - 1);
      }
    }
  };

  if (isIntro) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-transparent p-4">
        <div className="max-w-2xl w-full bg-brand-surface backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-slate-700/50 text-center animate-fade-in-scale">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-brand-secondary mb-4">Empecemos.</h1>
          <p className="text-brand-subtle mb-8 text-lg">
            Primero, dale un nombre a este perfil de IA. Puede ser tu marca, un cliente o un proyecto específico.
          </p>
          <input
            type="text"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="Ej: Mi Marca, Cliente de Coaching..."
            className="w-full max-w-md mx-auto bg-transparent border-b-2 border-slate-600 focus:border-brand-primary text-2xl text-center py-3 text-brand-text leading-tight focus:outline-none transition-colors mb-8"
            aria-label="Nombre del Perfil"
            autoFocus
          />
          <p className="text-brand-subtle mb-10">
            A continuación, te haré unas preguntas para entrenar a la IA con tu voz, cliente y productos. ¡Es clave para un contenido auténtico!
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {isCancelable && onCancel && (
              <button
                onClick={onCancel}
                className="bg-slate-700/50 text-white font-bold py-3 px-8 rounded-lg hover:bg-slate-600/50 transition-colors duration-300 w-full sm:w-auto"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={() => setIsIntro(false)}
              disabled={!profileName.trim()}
              className="bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-primary/80 transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(139,92,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none w-full sm:w-auto"
            >
              Comenzar Entrenamiento 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-transparent p-4 text-brand-text animate-fade-in-scale">
      <div className="w-full max-w-3xl flex-grow flex flex-col justify-center">
        <div className="mb-8">
          <div className="flex justify-between items-center text-sm font-semibold text-brand-subtle mb-2">
            <span>PREGUNTA {overallQuestionIndex + 1} / {totalQuestions}</span>
            <span>PERFIL: {profileName}</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-1.5">
            <div className="bg-gradient-to-r from-brand-secondary to-brand-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="flex-grow flex flex-col justify-center">
            <label htmlFor={currentQuestion.id as string} className="text-3xl md:text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                {currentQuestion.label}
            </label>
            
            {currentQuestion.isTextArea ? (
            <textarea
                id={currentQuestion.id as string}
                rows={6}
                value={data[currentQuestion.stepId][currentQuestion.id] as string}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="w-full bg-transparent border-b-2 border-slate-600 focus:border-brand-primary text-xl md:text-2xl text-center py-3 text-brand-text leading-tight focus:outline-none transition-colors"
                autoFocus
            />
            ) : (
            <input
                id={currentQuestion.id as string}
                type="text"
                value={data[currentQuestion.stepId][currentQuestion.id] as string}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="w-full bg-transparent border-b-2 border-slate-600 focus:border-brand-primary text-xl md:text-2xl text-center py-3 text-brand-text leading-tight focus:outline-none transition-colors"
                autoFocus
            />
            )}
        </div>
      </div>
      
      <div className="w-full max-w-3xl py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
            {isCancelable && onCancel && (
                <button
                    onClick={onCancel}
                    className="text-brand-subtle font-bold py-3 px-6 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                    Cancelar
                </button>
            )}
        </div>
        <div className='flex items-center gap-2'>
            <button
            onClick={prev}
            disabled={step === 0 && questionIndex === 0}
            className="bg-slate-700/50 text-white font-bold py-3 px-8 rounded-lg hover:bg-slate-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
            Anterior
            </button>
            <button
            onClick={next}
            className="bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-primary/80 transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(139,92,246,0.5)]"
            >
            {overallQuestionIndex === totalQuestions - 1 ? (initialProfile ? 'Guardar Cambios' : 'Finalizar') : 'Siguiente'}
            </button>
        </div>
      </div>
    </div>
  );
};