import React from 'react';
import type { Profile } from '../types';
import type { AppView } from '../App';
import { ChevronDown, FilePenLine, LayoutGrid, Pencil, Trash2, Wand2 } from 'lucide-react';

interface AppHeaderProps {
  profiles: Profile[];
  activeProfile: Profile;
  setActiveProfileId: (id: string) => void;
  onCreateNewProfile: () => void;
  onEditProfile: (profile: Profile) => void;
  onDeleteProfile: () => void;
  activeView: AppView;
  setView: (view: AppView) => void;
}

const ViewButton: React.FC<{
  label: string;
  viewId: AppView;
  activeView: AppView;
  onClick: (viewId: AppView) => void;
  children: React.ReactNode;
}> = ({ label, viewId, activeView, onClick, children }) => {
  const isActive = activeView === viewId;
  return (
    <button
      onClick={() => onClick(viewId)}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
        isActive
          ? 'bg-brand-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]'
          : 'bg-transparent text-brand-subtle hover:bg-slate-700/50 hover:text-white'
      }`}
      aria-label={label}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  profiles,
  activeProfile,
  setActiveProfileId,
  onCreateNewProfile,
  onEditProfile,
  onDeleteProfile,
  activeView,
  setView,
}) => {
  return (
    <header className="space-y-6 sm:space-y-8 animate-fade-in-scale">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-center md:text-left">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-brand-secondary">Wookcom </span>
          <span className="shimmer-text">IA Content</span>
        </h1>
        <div className="flex items-center flex-wrap justify-center gap-2 md:gap-3 bg-brand-surface border border-slate-700/50 rounded-full p-1.5">
          <div className="relative">
            <select
              value={activeProfile.id}
              onChange={(e) => setActiveProfileId(e.target.value)}
              className="bg-transparent rounded-full py-2 pl-4 pr-10 text-base focus:outline-none appearance-none cursor-pointer"
              aria-label="Seleccionar perfil activo"
            >
              {profiles.map(p => <option key={p.id} value={p.id} className="bg-brand-dark">{p.name}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-brand-subtle">
                <ChevronDown className="h-5 w-5" />
            </div>
          </div>
          <button
            onClick={() => onEditProfile(activeProfile)}
            className="p-2 text-brand-subtle hover:text-brand-primary transition-colors rounded-full hover:bg-slate-700/50"
            aria-label="Editar perfil actual"
          >
            <FilePenLine className="w-5 h-5" />
          </button>
          <button
            onClick={onDeleteProfile}
            className="p-2 text-brand-subtle hover:text-red-400 transition-colors rounded-full hover:bg-slate-700/50"
            aria-label="Eliminar perfil actual"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={onCreateNewProfile}
            className="text-sm bg-brand-primary text-white hover:bg-brand-primary/80 font-semibold py-2 px-4 rounded-full transition-colors"
          >
            + Nuevo
          </button>
        </div>
      </div>
      
      <div className="hidden sm:flex justify-center items-center bg-brand-surface backdrop-blur-lg p-1.5 rounded-xl gap-2 border border-slate-700/50 max-w-md mx-auto">
        <ViewButton
            label="Dashboard"
            viewId="dashboard"
            activeView={activeView}
            onClick={setView}
        >
            <LayoutGrid className="w-4 h-4" />
        </ViewButton>
        <ViewButton
            label="Contenido"
            viewId="content"
            activeView={activeView}
            onClick={setView}
        >
            <Pencil className="w-4 h-4" />
        </ViewButton>
        <ViewButton
            label="Anuncios"
            viewId="ads"
            activeView={activeView}
            onClick={setView}
        >
            <Wand2 className="w-4 h-4" />
        </ViewButton>
      </div>

    </header>
  );
};