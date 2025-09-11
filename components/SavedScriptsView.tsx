import React, { useState, useCallback } from 'react';
import type { SavedScript } from '../types';
import { Check, Copy, Pencil, Trash2 } from 'lucide-react';

const SavedScriptCard: React.FC<{ savedScript: SavedScript; onDelete: (id: string) => void }> = ({ savedScript, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatScriptForCopy = useCallback(() => {
    const { intro, development, outro } = savedScript.script;
    return `
[INTRO]
${intro}

[DESARROLLO]
${development}

[CIERRE]
${outro}
    `.trim();
  }, [savedScript.script]);

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(formatScriptForCopy()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [formatScriptForCopy]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(savedScript.id);
  };

  return (
    <div className="bg-brand-surface backdrop-blur-lg rounded-2xl shadow-lg border border-slate-700/50 overflow-hidden transition-all duration-300">
      <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer hover:bg-slate-700/30" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="mr-4 flex-1 mb-3 sm:mb-0">
          <p className="font-semibold text-brand-text text-lg">{savedScript.hook}</p>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-brand-subtle mt-2">
            <span>Plataforma: <strong>{savedScript.platform}</strong></span>
            <span>Duración: <strong>{savedScript.duration}s</strong></span>
            <span>Guardado: <strong>{new Date(savedScript.createdAt).toLocaleDateString()}</strong></span>
          </div>
        </div>
        <div className="flex items-center space-x-3 flex-shrink-0 self-end sm:self-center">
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
          <button 
            onClick={handleDelete}
            className="p-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
            aria-label="Eliminar guion guardado"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="bg-slate-900/70 p-6 border-t border-slate-700/50 animate-fade-in-scale" style={{'--animation-duration': '0.2s'} as React.CSSProperties}>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-brand-secondary mb-2">🎬 Introducción</h3>
              <p className="text-brand-text whitespace-pre-line leading-relaxed">{savedScript.script.intro}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-brand-secondary mb-2">✍️ Desarrollo</h3>
              <p className="text-brand-text whitespace-pre-line leading-relaxed">{savedScript.script.development}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-brand-secondary mb-2">🚀 Cierre (CTA)</h3>
              <p className="text-brand-text whitespace-pre-line leading-relaxed">{savedScript.script.outro}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface SavedScriptsViewProps {
  scripts: SavedScript[];
  onDelete: (id: string) => void;
}

export const SavedScriptsView: React.FC<SavedScriptsViewProps> = ({ scripts, onDelete }) => {
  if (scripts.length === 0) {
    return (
       <div className="text-center py-20 bg-brand-surface rounded-2xl border-2 border-dashed border-slate-700">
        <Pencil className="w-12 h-12 mx-auto text-slate-600 mb-4" />
        <h2 className="text-2xl font-semibold text-brand-subtle">No tienes guiones guardados</h2>
        <p className="text-slate-500 mt-2">Los guiones que generes y guardes aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in-scale">
       <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 mb-6">Mis Guiones Guardados</h2>
      {scripts.map(script => (
        <SavedScriptCard key={script.id} savedScript={script} onDelete={onDelete} />
      ))}
    </div>
  );
};