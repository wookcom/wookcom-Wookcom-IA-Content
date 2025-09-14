import React, { useState, useCallback, useEffect } from 'react';
import type { Script, VideoPlatform, Profile } from '../types';
import { PLATFORM_DURATIONS } from '../constants';
import { generateScriptForHook } from '../services/geminiService';
import { Bookmark, Check, ChevronLeft, Copy, LoaderCircle } from 'lucide-react';

interface ScriptGeneratorProps {
  hook: string;
  activeProfile: Profile;
  onBack: () => void;
  onSave: (data: { hook: string; script: Script; platform: VideoPlatform; duration: number; }) => void;
  setIsLoadingOnCard: (isLoading: boolean) => void;
}

const ScriptContent: React.FC<{ 
    script: Script, 
    onSave: () => void
}> = ({ script, onSave }) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const formatScriptForCopy = useCallback(() => {
    return `
[INTRO]
${script.intro}

[DESARROLLO]
${script.development}

[CIERRE]
${script.outro}
    `.trim();
  }, [script]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(formatScriptForCopy()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [formatScriptForCopy]);
  
  const handleSave = () => {
    onSave();
    setSaved(true);
  };

  return (
    <div className="bg-slate-900/70 p-4 sm:p-6 rounded-xl shadow-inner relative w-full max-w-3xl mx-auto">
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <button
          onClick={handleSave}
          disabled={saved}
          className={`p-2 rounded-full transition-colors duration-200 ${
            saved 
              ? 'bg-green-500/20 text-green-400 cursor-default' 
              : 'bg-slate-700/50 text-brand-subtle hover:bg-slate-600/50 hover:text-white'
          }`}
          aria-label="Guardar guion"
        >
          {saved ? <Check className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
        </button>
        <button
          onClick={handleCopy}
          className={`p-2 rounded-full transition-colors duration-200 ${
            copied 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-slate-700/50 text-brand-subtle hover:bg-slate-600/50 hover:text-white'
          }`}
          aria-label="Copiar guion"
        >
          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        </button>
      </div>


      <div className="space-y-6">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-brand-secondary mb-2">🎬 Introducción</h3>
          <p className="text-brand-text whitespace-pre-line leading-relaxed text-sm sm:text-base">{script.intro}</p>
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-brand-secondary mb-2">✍️ Desarrollo</h3>
          <p className="text-brand-text whitespace-pre-line leading-relaxed text-sm sm:text-base">{script.development}</p>
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-brand-secondary mb-2">🚀 Cierre (CTA)</h3>
          <p className="text-brand-text whitespace-pre-line leading-relaxed text-sm sm:text-base">{script.outro}</p>
        </div>
      </div>
    </div>
  );
};

const ScriptConfig: React.FC<{ 
    platform: VideoPlatform;
    setPlatform: (p: VideoPlatform) => void;
    duration: number;
    setDuration: (d: number) => void;
    onGenerate: () => void;
    isLoading: boolean;
}> = ({ platform, setPlatform, duration, setDuration, onGenerate, isLoading }) => {

    useEffect(() => {
        if (!PLATFORM_DURATIONS[platform].includes(duration)) {
          setDuration(PLATFORM_DURATIONS[platform][0]);
        }
    }, [platform, duration, setDuration]);

    return (
        <div className="space-y-4 sm:space-y-6 w-full max-w-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                    <label htmlFor="platform" className="block text-sm font-medium text-brand-subtle mb-2">Plataforma</label>
                    <select
                        id="platform"
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value as VideoPlatform)}
                        className="w-full bg-slate-900/70 border border-slate-700 rounded-lg py-2.5 px-3 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    >
                        {Object.keys(PLATFORM_DURATIONS).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-brand-subtle mb-2">Duración</label>
                    <select
                        id="duration"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                        className="w-full bg-slate-900/70 border border-slate-700 rounded-lg py-2.5 px-3 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    >
                        {PLATFORM_DURATIONS[platform].map(d => <option key={d} value={d}>{d < 60 ? `${d}s` : `${d/60}min`}</option>)}
                    </select>
                </div>
            </div>
             <button
                onClick={onGenerate}
                disabled={isLoading}
                className="w-full bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-primary/80 transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(139,92,246,0.5)] disabled:opacity-50 disabled:cursor-wait flex items-center justify-center"
            >
                {isLoading ? <LoaderCircle className="w-6 h-6 animate-spin" /> : "Generar Guion"}
            </button>
        </div>
    );
}

export const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({ hook, activeProfile, onBack, onSave, setIsLoadingOnCard }) => {
  const [platform, setPlatform] = useState<VideoPlatform>('Instagram Reels');
  const [duration, setDuration] = useState<number>(PLATFORM_DURATIONS[platform][0]);
  const [script, setScript] = useState<Script | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setIsLoadingOnCard(true);
    setError(null);
    setScript(null);

    try {
        const generatedScript = await generateScriptForHook(activeProfile.data, hook, duration);
        setScript(generatedScript);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
    } finally {
        setIsLoading(false);
        setIsLoadingOnCard(false);
    }
  }, [activeProfile, hook, duration, setIsLoadingOnCard]);
  
  const handleSave = () => {
    if (script && hook) {
      onSave({ hook, script, platform, duration });
    }
  };
  
  const showConfig = !script && !error;

  return (
    <div className="w-full animate-slide-in-from-right">
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-subtle hover:text-white font-semibold transition-colors">
            <ChevronLeft className="w-5 h-5" />
            Volver a Hooks
        </button>
      </div>

      <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
                {isLoading && "Creando tu Guion..."}
                {script && "✍️ ¡Guion Completo!"}
                {showConfig && "Configura tu Guion"}
                {error && "Algo Salió Mal"}
            </h2>
            <p className="text-brand-subtle mt-2 text-sm sm:text-base max-w-2xl mx-auto">Para el hook: <span className="text-brand-text font-medium">"{hook}"</span></p>
      </div>
      
      <div className="min-h-[300px] flex flex-col items-center justify-center">
          {showConfig && !isLoading && (
              <ScriptConfig 
                  platform={platform}
                  setPlatform={setPlatform}
                  duration={duration}
                  setDuration={setDuration}
                  onGenerate={handleGenerate}
                  isLoading={isLoading}
              />
          )}
          {isLoading && <LoaderCircle className="w-12 h-12 text-brand-primary animate-spin" />}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg text-center max-w-md w-full">
                <p>{error}</p>
                <button
                    onClick={handleGenerate}
                    className="mt-4 bg-brand-primary/80 text-white font-semibold text-sm py-2 px-4 rounded-lg hover:bg-brand-primary"
                >
                    Intentar de nuevo
                </button>
            </div>
          )}
          {script && <ScriptContent script={script} onSave={handleSave} />}
      </div>
    </div>
  );
};