import React, { useState, useCallback } from 'react';
import type { AdCopyDiagnosis, Profile, RefinedAdCopyAnswers, AdCopyDiagnosisItem, AdContentType, AdCopyResult } from '../types';
import { diagnoseAdScript, generateAdCopy, improveAdCopyAnswer } from '../services/geminiService';
import { Check, ChevronLeft, ChevronRight, Copy, LoaderCircle, Wand2 } from 'lucide-react';

interface CopyAdsGeneratorProps {
  activeProfile: Profile;
}

const initialAnswers: RefinedAdCopyAnswers = {
  resultado: '',
  errorComun: '',
  metodoDiferente: '',
  resultadosPropios: '',
  creenciaFalsa: '',
  llamadoAlaAccion: '',
};

const answerKeys: (keyof RefinedAdCopyAnswers)[] = [
  'resultado', 'errorComun', 'metodoDiferente', 
  'resultadosPropios', 'creenciaFalsa', 'llamadoAlaAccion'
];

const CarouselPreview: React.FC<{ slides: string[], profileName: string }> = ({ slides, profileName }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => setCurrentSlide(prev => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="bg-slate-900 rounded-[2.5rem] p-3 w-full max-w-[280px] mx-auto shadow-2xl border-2 border-slate-700/50">
             <div className="bg-black rounded-[2rem] h-full w-full flex flex-col overflow-hidden relative aspect-[9/19.5]">
                {/* Header */}
                <div className="flex items-center p-3 bg-slate-900/50 backdrop-blur-sm z-10 border-b border-slate-700/50 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary mr-3"></div>
                    <span className="font-bold text-sm text-white">{profileName}</span>
                </div>

                {/* Content */}
                <div className="flex-1 flex justify-center items-center text-center p-6 bg-gradient-to-br from-slate-800 to-slate-900 relative">
                     <p className="text-xl font-semibold text-white z-10 whitespace-pre-line transition-opacity duration-300" key={currentSlide}>
                        {slides[currentSlide]}
                    </p>
                </div>
                
                {/* Footer / Navigation */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between items-center px-2 z-20">
                    <button 
                        onClick={prevSlide}
                        className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
                        aria-label="Diapositiva anterior"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={nextSlide}
                        className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
                        aria-label="Siguiente diapositiva"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {slides.map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentSlide ? 'bg-white' : 'bg-white/40'}`}></div>
                    ))}
                </div>
            </div>
        </div>
    );
};


export const CopyAdsGenerator: React.FC<CopyAdsGeneratorProps> = ({ activeProfile }) => {
  const [step, setStep] = useState<'input' | 'diagnosing' | 'refining' | 'generating' | 'result'>('input');
  const [contentType, setContentType] = useState<AdContentType>('Reel');
  const [userScript, setUserScript] = useState('');
  const [diagnosis, setDiagnosis] = useState<AdCopyDiagnosis | null>(null);
  const [refinedAnswers, setRefinedAnswers] = useState<RefinedAdCopyAnswers>(initialAnswers);
  const [finalResult, setFinalResult] = useState<AdCopyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [improvingState, setImprovingState] = useState<Partial<Record<keyof RefinedAdCopyAnswers, boolean>>>({});

  const handleDiagnose = useCallback(async () => {
    if (!userScript.trim()) {
      setError('Por favor, introduce el guion de tu anuncio.');
      return;
    }
    setStep('diagnosing');
    setError(null);
    try {
      const result = await diagnoseAdScript(userScript, contentType);
      setDiagnosis(result);
      setStep('refining');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al diagnosticar.');
      setStep('input');
    }
  }, [userScript, contentType]);

  const handleAnswerChange = (key: keyof RefinedAdCopyAnswers, value: string) => {
    setRefinedAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleImproveAnswer = useCallback(async (key: keyof RefinedAdCopyAnswers, diagnosisItem: AdCopyDiagnosisItem) => {
    setImprovingState(prev => ({ ...prev, [key]: true }));
    setError(null);
    try {
        const improvedAnswer = await improveAdCopyAnswer(userScript, diagnosisItem, activeProfile.data);
        handleAnswerChange(key, improvedAnswer);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo generar la respuesta mejorada.');
    } finally {
        setImprovingState(prev => ({ ...prev, [key]: false }));
    }
  }, [userScript, activeProfile.data]);

  const isRefiningComplete = useCallback(() => {
    return Object.values(refinedAnswers).every(answer => answer.trim() !== '');
  }, [refinedAnswers]);

  const handleGenerateCopy = useCallback(async () => {
    if (!isRefiningComplete()) {
      setError('Por favor, completa todas las respuestas del diagnóstico.');
      return;
    }
    setStep('generating');
    setError(null);
    try {
      const result = await generateAdCopy(refinedAnswers, userScript, contentType);
      setFinalResult(result);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al generar el copy.');
      setStep('refining');
    }
  }, [refinedAnswers, userScript, contentType, isRefiningComplete]);

  const handleCopy = useCallback(() => {
    if (!finalResult) return;
    
    let textToCopy = '';
    if (finalResult.contentType === 'Carrusel' && Array.isArray(finalResult.copy)) {
        textToCopy = finalResult.copy.map((slide, index) => `DIAPOSITIVA ${index + 1}:\n${slide}`).join('\n\n');
    } else {
        textToCopy = finalResult.copy as string;
    }

    const ctaText = `\n\n---\nEJEMPLOS DE CTA:\n- ${finalResult.ctaExamples.join('\n- ')}`;
    textToCopy += ctaText;

    navigator.clipboard.writeText(textToCopy.trim()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [finalResult]);

  const handleReset = () => {
    setStep('input');
    setUserScript('');
    setDiagnosis(null);
    setRefinedAnswers(initialAnswers);
    setFinalResult(null);
    setError(null);
    setCopied(false);
    setImprovingState({});
    setContentType('Reel');
  };
  
  const renderCurrentStep = () => {
    switch(step) {
        case 'input':
            return (
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 mb-2">Consultor de Anuncios</h2>
                    <p className="text-brand-subtle mb-8">Elige el formato, pega tu guion, y la IA actuará como un consultor experto para ayudarte a mejorarlo.</p>
                    
                    <div className="flex justify-center items-center bg-brand-surface p-1.5 rounded-xl gap-2 mb-8 max-w-sm mx-auto border border-slate-700/50">
                        {(['Reel', 'Carrusel', 'B-roll'] as AdContentType[]).map(type => (
                            <button 
                                key={type} 
                                onClick={() => setContentType(type)}
                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                    contentType === type
                                    ? 'bg-brand-primary text-white shadow-md'
                                    : 'text-brand-subtle hover:bg-slate-700/50 hover:text-white'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={userScript}
                        onChange={(e) => setUserScript(e.target.value)}
                        rows={10}
                        placeholder={`Pega aquí tu guion para el ${contentType}...`}
                        className="w-full bg-brand-surface border border-slate-700/50 rounded-lg py-3 px-4 text-brand-text leading-tight focus:outline-none focus:ring-2 focus:ring-brand-primary mb-6"
                    />
                    <button
                        onClick={handleDiagnose}
                        disabled={!userScript.trim()}
                        className="bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-primary/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                    >
                        Diagnosticar Guion 🧠
                    </button>
                </div>
            )

        case 'diagnosing':
        case 'generating':
            return (
                <div className="text-center py-20">
                    <LoaderCircle className="w-12 h-12 text-brand-primary mx-auto mb-4 animate-spin" />
                    <p className="text-lg text-brand-secondary">
                        {step === 'diagnosing' ? 'Analizando tu guion...' : 'Creando tu copy persuasivo...'}
                    </p>
                    <p className="text-brand-subtle">Esto puede tardar unos segundos.</p>
                </div>
            )

        case 'refining':
            if (!diagnosis) return null;
            return (
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 mb-2 text-center">Diagnóstico y Refinamiento</h2>
                    <p className="text-brand-subtle mb-8 text-center">La IA ha analizado tu guion. Ahora, responde con información más específica para crear un copy ganador.</p>
                    <div className="space-y-6">
                        {diagnosis.map((item, index) => {
                        const currentKey = answerKeys[index];
                        const isImproving = improvingState[currentKey];
                        return (
                        <div key={index} className="bg-brand-surface backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50">
                            <h3 className="font-semibold text-lg text-brand-text mb-3">{item.question}</h3>
                            <div className="bg-slate-900/70 p-4 rounded-lg mb-4 border border-slate-700">
                            <p className="text-sm font-bold text-brand-secondary mb-1">🔍 Diagnóstico de la IA:</p>
                            <p className="text-brand-subtle text-sm whitespace-pre-line">{item.diagnosis}</p>
                            </div>
                            <textarea
                                value={refinedAnswers[currentKey]}
                                onChange={(e) => handleAnswerChange(currentKey, e.target.value)}
                                rows={3}
                                placeholder="Escribe aquí tu respuesta mejorada..."
                                className="w-full bg-slate-900/70 border border-slate-700 rounded-lg py-2 px-3 text-brand-text leading-tight focus:outline-none focus:ring-2 focus:ring-brand-primary mb-2"
                            />
                            <div className="text-right">
                                <button
                                    onClick={() => handleImproveAnswer(currentKey, item)}
                                    disabled={isImproving}
                                    className="bg-brand-primary/20 text-brand-primary font-semibold py-1.5 px-3 rounded-md text-xs hover:bg-brand-primary/40 hover:text-white transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-wait inline-flex"
                                >
                                    {isImproving ? (
                                        <>
                                            <LoaderCircle className="w-4 h-4 animate-spin" />
                                            <span>Mejorando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="w-4 h-4" />
                                            <span>Mejorar con IA</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        )})}
                    </div>
                    <div className="text-center mt-8">
                        <button
                        onClick={handleGenerateCopy}
                        disabled={!isRefiningComplete()}
                        className="bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-primary/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                        >
                        Generar Copy de Anuncio 🚀
                        </button>
                    </div>
                </div>
            )

        case 'result':
            if (!finalResult) return null;
            return (
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 mb-2">¡Aquí tienes tu {finalResult.contentType}!</h2>
                        <p className="text-brand-subtle">Basado en tu guion y tus respuestas, este es el copy que la IA ha creado para ti.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className={`md:col-span-${finalResult.contentType === 'Carrusel' ? '1' : '2'}`}>
                            <div className="bg-brand-surface backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 relative">
                                <button
                                onClick={handleCopy}
                                className={`absolute top-4 right-4 p-2 rounded-full transition-colors duration-200 ${
                                    copied 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : 'bg-slate-700/50 text-brand-subtle hover:bg-slate-600/50 hover:text-white'
                                }`}
                                aria-label="Copiar resultado"
                                >
                                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                </button>
                                
                                <div className="whitespace-pre-line text-brand-text mb-6 pb-6 border-b border-slate-700 leading-relaxed">
                                    {finalResult.contentType !== 'Carrusel' && finalResult.copy}
                                    {finalResult.contentType === 'Carrusel' && Array.isArray(finalResult.copy) && (
                                      finalResult.copy.map((slide, i) => (
                                        <div key={i} className="mb-4">
                                          <p className="font-bold text-brand-secondary">Diapositiva {i+1}:</p>
                                          <p>{slide}</p>
                                        </div>
                                      ))
                                    )}
                                </div>
                                
                                <h3 className="font-bold text-brand-secondary mb-3">💡 Ejemplos de Llamado a la Acción (CTA):</h3>
                                <ul className="list-disc list-inside space-y-2 text-brand-subtle">
                                    {finalResult.ctaExamples.map((cta, i) => <li key={i}><span className="text-brand-text">{cta}</span></li>)}
                                </ul>
                            </div>
                        </div>

                        {finalResult.contentType === 'Carrusel' && Array.isArray(finalResult.copy) && (
                            <div className="hidden md:block">
                                <CarouselPreview slides={finalResult.copy} profileName={activeProfile.name} />
                            </div>
                        )}
                    </div>

                    <div className="text-center mt-8">
                        <button
                        onClick={handleReset}
                        className="bg-slate-700/50 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-600/50 transition-colors"
                        >
                        Empezar de Nuevo
                        </button>
                    </div>
                </div>
            )
        
        default:
             return null;
    }
  }

  return (
    <div className="py-8 animate-fade-in-scale">
      {renderCurrentStep()}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mt-6 max-w-3xl mx-auto text-center">
          {error}
        </div>
      )}
    </div>
  );
};
