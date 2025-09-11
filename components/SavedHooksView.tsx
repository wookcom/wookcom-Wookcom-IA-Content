import React from 'react';
import type { SavedHook } from '../types';
import { Bookmark, Pencil, Trash2 } from 'lucide-react';

interface SavedHooksViewProps {
  hooks: SavedHook[];
  onDelete: (id: string) => void;
  onGenerateScript: (hookText: string) => void;
}

export const SavedHooksView: React.FC<SavedHooksViewProps> = ({ hooks, onDelete, onGenerateScript }) => {
  if (hooks.length === 0) {
    return (
      <div className="text-center py-20 bg-brand-surface rounded-2xl border-2 border-dashed border-slate-700">
        <Bookmark className="w-12 h-12 mx-auto text-slate-600 mb-4" />
        <h2 className="text-2xl font-semibold text-brand-subtle">No tienes hooks guardados</h2>
        <p className="text-slate-500 mt-2">Los hooks que guardes desde el generador aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in-scale">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 mb-6">Mis Hooks Guardados</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hooks.map(hook => (
          <div key={hook.id} className="bg-brand-surface backdrop-blur-lg rounded-2xl p-5 flex justify-between items-start shadow-lg border border-slate-700/50">
            <div className="flex-1">
              <p className="text-brand-text text-lg leading-relaxed mr-4">{hook.text}</p>
              <p className="text-xs text-brand-subtle mt-2">
                Guardado el: {new Date(hook.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col items-center space-y-3 flex-shrink-0">
              <button 
                onClick={() => onGenerateScript(hook.text)} 
                className="p-2 rounded-full bg-brand-primary/20 text-brand-primary hover:bg-brand-primary/40 hover:text-white transition-colors"
                aria-label="Generar guion para este hook"
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onDelete(hook.id)} 
                className="p-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                aria-label="Eliminar hook guardado"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};