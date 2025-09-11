import React from 'react';
import type { Profile } from '../types';
import type { AppView } from '../App';
import { ActionCard } from './ActionCard';
import { Pencil, Wand2, Bookmark } from 'lucide-react';

interface DashboardProps {
  activeProfile: Profile;
  setView: (view: AppView) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ activeProfile, setView }) => {
  
  const recentActivity = [
      // FIX: Add `as const` to ensure the `type` property is inferred as a literal type,
      // which is necessary for TypeScript's discriminated union type guarding to work correctly.
      ...activeProfile.savedScripts.map(s => ({ type: 'script' as const, ...s })),
      ...activeProfile.savedHooks.map(h => ({ type: 'hook' as const, ...h }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 3);

  return (
    <div className="animate-fade-in-scale">
      <div className="text-center mb-10 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-text">
          Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">{activeProfile.name}</span>!
        </h1>
        <p className="text-brand-subtle text-base sm:text-lg mt-2">¿Qué vamos a crear hoy?</p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <ActionCard
          icon={<Pencil className="w-6 h-6" />}
          title="Generador de Contenido"
          description="Crea hooks y guiones para Reels & TikToks."
          onClick={() => setView('content')}
        />
        <ActionCard
          icon={<Wand2 className="w-6 h-6" />}
          title="Consultor de Anuncios"
          description="Mejora tus guiones de anuncios para convertir más."
          onClick={() => setView('ads')}
        />
      </div>
      
      {recentActivity.length > 0 && (
        <div className="max-w-4xl mx-auto mt-12 sm:mt-16">
          <h2 className="text-xl sm:text-2xl font-bold text-brand-text mb-6 text-center">Actividad Reciente</h2>
          <div className="space-y-4">
            {recentActivity.map(item => (
              <div key={item.id} className="bg-brand-surface/50 border border-slate-700/30 rounded-lg p-4 flex items-center gap-4">
                <div className="bg-slate-700/50 p-2 rounded-md">
                    <Bookmark className="w-5 h-5 text-brand-subtle" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-brand-text text-sm truncate">
                        {item.type === 'hook' ? item.text : item.hook}
                    </p>
                    <p className="text-xs text-brand-subtle capitalize">
                        {item.type === 'hook' ? 'Hook Guardado' : 'Guion Guardado'}
                    </p>
                </div>
                 <span className="text-xs text-brand-subtle flex-shrink-0">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};