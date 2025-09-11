import React, { useState, useCallback, useEffect } from 'react';
import type { Script, VideoPlatform } from '../types';
import { PLATFORM_DURATIONS } from '../constants';
import { Modal } from './Modal';
import { Bookmark, Check, Copy, LoaderCircle } from 'lucide-react';

interface ScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: Script | null;
  isLoading: boolean;
  error: string | null;
  hook: string | null;
  onGenerate: (options: { durationInSeconds: number }) => void;
  onSave: (data: { hook: string; script: Script; platform: VideoPlatform; duration: number; }) => void;
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
    <div className="bg-slate-900/70 p-6 rounded-xl shadow-inner relative w-full">
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
          <h3 className="text-lg font-semibold text-brand-secondary mb-2">🎬 Introducción</h3>
          <p className="text-brand-text whitespace-pre-line leading-relaxed">{script.intro}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-brand-secondary mb-2">✍️ Desarrollo</h3>
          <p className="text-brand-text whitespace-pre-line leading-relaxed">{script.development}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-brand-secondary mb-2">🚀 Cierre (CTA)</h3>
          <p className="text-brand-text whitespace-pre-line leading-relaxed">{script.outro}</p>
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
}> = ({ platform, setPlatform, duration, setDuration, onGenerate }) => {

    useEffect(() => {
        // Only set default duration if the current one is not valid for the new platform
        if (!PLATFORM_DURATIONS[platform].includes(duration)) {
          setDuration(PLATFORM_DURATIONS[platform][0]);
        }
    }, [platform, duration, setDuration]);

    return (
        <div className="space-y-6 w-full max-w-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="w-full bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-primary/80 transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(139,92,246,0.5)]"
            >
                Generar Guion
            </button>
        </div>
    );
}

export const ScriptModal: React.FC<ScriptModalProps> = ({ isOpen, onClose, script, isLoading, error, hook, onGenerate, onSave }) => {
  const [platform, setPlatform] = useState<VideoPlatform>('Instagram Reels');
  const [duration, setDuration] = useState<number>(PLATFORM_DURATIONS[platform][0]);
  
  const handleGenerateClick = () => {
    onGenerate({ durationInSeconds: duration });
  };
  
  const handleSave = () => {
    if (script && hook) {
      onSave({ hook, script, platform, duration });
    }
  };
  
  const showConfig = !isLoading && !script && !error;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 md:p-8">
        <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
                {showConfig && "Configura tu Guion"}
                {isLoading && "Creando tu Guion..."}
                {script && "✍️ ¡Guion Completo Listo!"}
                {error && "Ups... Algo Salió Mal"}
            </h2>
            {showConfig && hook && (
                <p className="text-brand-subtle mt-2 text-sm max-w-md mx-auto">Para el hook: <span className="text-brand-text font-medium">"{hook}"</span></p>
            )}
        </div>
        
        <div className="min-h-[200px] flex items-center justify-center">
            {showConfig && (
                <ScriptConfig 
                    platform={platform}
                    setPlatform={setPlatform}
                    duration={duration}
                    setDuration={setDuration}
                    onGenerate={handleGenerateClick}
                />
            )}
            {isLoading && <LoaderCircle className="w-12 h-12 text-brand-primary animate-spin" />}
            {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg text-center">{error}</div>}
            {script && <ScriptContent script={script} onSave={handleSave} />}
        </div>
        
        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="bg-slate-700/50 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-600/50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};