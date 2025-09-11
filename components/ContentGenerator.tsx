import React, { useState, useCallback } from 'react';
import { generateHooks, generateScriptForHook } from '../services/geminiService';
import type { HookCategory, Profile, Script, VideoPlatform } from '../types';
import { HOOK_CATEGORIES } from '../constants';
import { HookCard } from './HookCard';
import { ScriptModal } from './ScriptModal';
import { SavedHooksView } from './SavedHooksView';
import { SavedScriptsView } from './SavedScriptsView';
import { LoaderCircle, Pencil } from 'lucide-react';

interface ContentGeneratorProps {
  activeProfile: Profile;
  saveHook: (hookText: string) => void;
  deleteSavedHook: (hookId: string) => void;
  saveScript: (data: { hook: string; script: Script; platform: VideoPlatform; duration: number; }) => void;
  deleteSavedScript: (scriptId: string) => void;
}

const TabButton: React.FC<{
  name: string;
  activeView: string;
  setView: (view: any) => void;
  viewId: 'generator' | 'hooks' | 'scripts';
}> = ({ name, activeView, setView, viewId }) => (
  <button
    onClick={() => setView(viewId)}
    className={`px-4 sm:px-6 py-3 text-sm font-semibold rounded-t-lg transition-all duration-300 border-b-2 ${
      activeView === viewId
        ? 'border-brand-primary text-brand-primary'
        : 'border-transparent text-brand-subtle hover:text-white hover:border-slate-600'
    }`}
  >
    {name}
  </button>
);


export const ContentGenerator: React.FC<ContentGeneratorProps> = ({ 
  activeProfile,
  saveHook,
  deleteSavedHook,
  saveScript,
  deleteSavedScript,
}) => {
  const [view, setView] = useState<'generator' | 'hooks' | 'scripts'>(() => {
    const savedView = sessionStorage.getItem('contentGeneratorView');
    return savedView === 'hooks' || savedView === 'scripts' ? savedView : 'generator';
  });
  
  const [category, setCategory] = useState<HookCategory>('VIDA PERSONAL');
  const [quantity, setQuantity] = useState<number>(10);
  const [hooks, setHooks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedHook, setSelectedHook] = useState<string | null>(null);
  const [script, setScript] = useState<Script | null>(null);
  const [isScriptLoading, setIsScriptLoading] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleSetView = (newView: 'generator' | 'hooks' | 'scripts') => {
    sessionStorage.setItem('contentGeneratorView', newView);
    setView(newView);
  };

  const handleGenerate = useCallback(async () => {
    if (!activeProfile) return;
    setIsLoading(true);
    setError(null);
    setHooks([]);
    setScript(null);
    setSelectedHook(null);
    setScriptError(null);
    try {
      const generated = await generateHooks(activeProfile.data, category, quantity);
      setHooks(generated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
    } finally {
      setIsLoading(false);
    }
  }, [activeProfile, category, quantity]);
  
  const handleSelectHook = useCallback((hook: string) => {
    setSelectedHook(hook);
    setIsScriptLoading(false);
    setScript(null);
    setScriptError(null);
    setIsModalOpen(true);
  }, []);

  const handleGenerateScript = useCallback(async (options: { durationInSeconds: number }) => {
    if (isScriptLoading || !activeProfile || !selectedHook) return;

    setIsScriptLoading(true);
    setScript(null);
    setScriptError(null);

    try {
        const generatedScript = await generateScriptForHook(activeProfile.data, selectedHook, options.durationInSeconds);
        setScript(generatedScript);
    } catch (err) {
        setScriptError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
    } finally {
        setIsScriptLoading(false);
    }
  }, [activeProfile, isScriptLoading, selectedHook]);
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
        setSelectedHook(null);
        setScript(null);
        setScriptError(null);
    }, 300);
  };

  const isHookSaved = useCallback((hookText: string): boolean => {
    return activeProfile.savedHooks.some(h => h.text === hookText);
  }, [activeProfile.savedHooks]);

  return (
    <div className="w-full animate-fade-in-scale">
        <div className="border-b border-slate-700/50 flex flex-wrap space-x-2">
            <TabButton name="Generador" activeView={view} setView={handleSetView} viewId="generator" />
            <TabButton name={`Hooks Guardados (${activeProfile.savedHooks.length})`} activeView={view} setView={handleSetView} viewId="hooks" />
            <TabButton name={`Guiones Guardados (${activeProfile.savedScripts.length})`} activeView={view} setView={handleSetView} viewId="scripts" />
        </div>

        <main className="py-8">
            {view === 'generator' && (
                <>
                    <div className="bg-brand-surface backdrop-blur-lg border border-slate-700/50 p-6 rounded-2xl shadow-lg mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-brand-subtle mb-2">Categoría de Hook</label>
                            <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value as HookCategory)}
                            className="w-full bg-slate-900/70 border border-slate-700 rounded-lg py-2.5 px-3 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            >
                            {HOOK_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-brand-subtle mb-2">Cantidad</label>
                            <select
                            id="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                            className="w-full bg-slate-900/70 border border-slate-700 rounded-lg py-2.5 px-3 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            >
                            {Array.from({ length: 16 }, (_, i) => i + 5).map(num => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                            </select>
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full bg-brand-primary text-white font-bold py-2.5 px-6 rounded-lg hover:bg-brand-primary/80 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-wait shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] transform hover:scale-105"
                        >
                            {isLoading ? <LoaderCircle className="w-6 h-6 animate-spin" /> : 'Generar Hooks 🧠'}
                        </button>
                        </div>
                    </div>

                    {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-8 text-center">{error}</div>}

                    {isLoading && (
                    <div className="text-center">
                        <p className="text-lg text-brand-secondary mb-4">Generando ganchos para {activeProfile.name}... ¡Esto puede tardar un momento!</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(quantity)].map((_, i) => (
                            <div key={i} className="bg-brand-surface rounded-2xl p-4 h-32 animate-pulse border border-slate-700/50"></div>
                        ))}
                        </div>
                    </div>
                    )}
                    
                    {!isLoading && hooks.length === 0 && !error && (
                        <div className="text-center py-20 bg-brand-surface rounded-2xl border-2 border-dashed border-slate-700">
                             <Pencil className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                            <h2 className="text-2xl font-semibold text-brand-subtle">Tus hooks aparecerán aquí</h2>
                            <p className="text-slate-500 mt-2">Selecciona una categoría y haz clic en "Generar" para empezar.</p>
                        </div>
                    )}

                    {hooks.length > 0 && (
                    <div className="mt-10">
                        <div className="text-center mb-8 max-w-2xl mx-auto">
                            <p className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 flex items-center justify-center gap-3">👻 ¡Tus hooks están listos!</p>
                            <p className="text-brand-subtle mt-2 text-lg">
                            👉 Ahora, elige uno para que te escriba un guion completo.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {hooks.map((hook, index) => (
                                <HookCard 
                                    key={index} 
                                    text={hook}
                                    onSelect={handleSelectHook}
                                    isSelected={selectedHook === hook}
                                    isLoading={isScriptLoading && selectedHook === hook}
                                    onSave={saveHook}
                                    isSaved={isHookSaved(hook)}
                                />
                            ))}
                        </div>
                    </div>
                    )}
                </>
            )}
            
            {view === 'hooks' && (
                <SavedHooksView 
                    hooks={activeProfile.savedHooks}
                    onDelete={deleteSavedHook}
                    onGenerateScript={handleSelectHook}
                />
            )}

            {view === 'scripts' && (
                <SavedScriptsView 
                    scripts={activeProfile.savedScripts}
                    onDelete={deleteSavedScript}
                />
            )}
        </main>

        <ScriptModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            script={script}
            isLoading={isScriptLoading}
            error={scriptError}
            hook={selectedHook}
            onGenerate={handleGenerateScript}
            onSave={saveScript}
        />
        
    </div>
  );
};