import React, { useState } from 'react';
import { useTrainingData } from './hooks/useTrainingData';
import { TrainingWizard } from './components/TrainingWizard';
import { ContentGenerator } from './components/ContentGenerator';
import type { Profile, TrainingData } from './types';
import { AppHeader } from './components/AppHeader';
import { Dashboard } from './components/Dashboard';
import { CopyAdsGenerator } from './components/CopyAdsGenerator';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { LayoutGrid, LoaderCircle, Pencil, Wand2 } from 'lucide-react';

export type AppView = 'dashboard' | 'content' | 'ads';

const getInitialView = (): AppView => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'content' || viewParam === 'ads') {
        return viewParam;
    }
    return 'dashboard';
};

const NavButton: React.FC<{
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
      className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
        isActive ? 'text-brand-primary' : 'text-brand-subtle hover:bg-slate-800'
      }`}
      aria-label={label}
    >
      {children}
      <span>{label}</span>
    </button>
  );
};

const BottomNavBar: React.FC<{
  activeView: AppView;
  setView: (view: AppView) => void;
}> = ({ activeView, setView }) => {
    return (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-brand-dark/80 backdrop-blur-2xl border-t border-slate-700/50 z-50 pb-[env(safe-area-inset-bottom)]">
            <div className="flex justify-around items-center max-w-7xl mx-auto px-2 pt-1">
                <NavButton label="Dashboard" viewId="dashboard" activeView={activeView} onClick={setView}>
                    <LayoutGrid className="w-5 h-5" />
                </NavButton>
                <NavButton label="Contenido" viewId="content" activeView={activeView} onClick={setView}>
                    <Pencil className="w-5 h-5" />
                </NavButton>
                <NavButton label="Anuncios" viewId="ads" activeView={activeView} onClick={setView}>
                    <Wand2 className="w-5 h-5" />
                </NavButton>
            </div>
        </nav>
    );
};


function App() {
  const { 
    profiles, 
    activeProfile, 
    isLoading, 
    saveProfile,
    updateProfile,
    deleteProfile, 
    setActiveProfileId,
    saveHookToProfile,
    deleteSavedHook,
    saveScriptToProfile,
    deleteSavedScript,
  } = useTrainingData();
  
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [view, setView] = useState<AppView>(getInitialView);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center">
        <LoaderCircle className="w-12 h-12 text-brand-primary animate-spin" />
        <p className="mt-4 text-brand-text">Cargando Wookcom IA Content...</p>
      </div>
    );
  }

  const handleCreateNewProfile = () => {
    setIsCreatingProfile(true);
  };

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
  };
  
  const handleDeleteProfileClick = () => {
    setIsDeleteModalOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (activeProfile) {
        deleteProfile(activeProfile.id);
    }
    setIsDeleteModalOpen(false);
  };

  const handleProfileCompletion = ({ id, name, data }: { id: string | null; name: string; data: TrainingData }) => {
    if (id) {
      updateProfile(id, name, data);
      setEditingProfile(null);
    } else {
      saveProfile(name, data);
      setIsCreatingProfile(false);
    }
    setView('dashboard');
  };

  const handleCancel = () => {
    setIsCreatingProfile(false);
    setEditingProfile(null);
  }
  
  if (editingProfile) {
    return (
      <TrainingWizard 
        initialProfile={editingProfile}
        onComplete={handleProfileCompletion} 
        onCancel={handleCancel}
        isCancelable={true}
      />
    );
  }

  if (isCreatingProfile || profiles.length === 0) {
    return (
      <TrainingWizard 
        onComplete={handleProfileCompletion} 
        onCancel={handleCancel}
        isCancelable={profiles.length > 0}
      />
    );
  }

  if (activeProfile) {
    return (
        <div className="min-h-screen text-brand-text">
            <div className="max-w-7xl mx-auto p-4 pb-24 sm:p-6 sm:pb-6 lg:p-8 lg:pb-8">
                <AppHeader
                    profiles={profiles}
                    activeProfile={activeProfile}
                    setActiveProfileId={setActiveProfileId}
                    onCreateNewProfile={handleCreateNewProfile}
                    onEditProfile={handleEditProfile}
                    onDeleteProfile={handleDeleteProfileClick}
                    activeView={view}
                    setView={setView}
                />
                
                <main className="mt-8">
                  {view === 'dashboard' && (
                    <Dashboard 
                      activeProfile={activeProfile} 
                      setView={setView} 
                    />
                  )}
                  {view === 'content' && (
                      <ContentGenerator 
                          activeProfile={activeProfile}
                          saveHook={saveHookToProfile}
                          deleteSavedHook={deleteSavedHook}
                          saveScript={saveScriptToProfile}
                          deleteSavedScript={deleteSavedScript}
                      />
                  )}
                  {view === 'ads' && (
                      <CopyAdsGenerator activeProfile={activeProfile} />
                  )}
                </main>

                <ConfirmDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    profileName={activeProfile?.name || ''}
                />
            </div>
            <BottomNavBar activeView={view} setView={setView} />
        </div>
    );
  }
  
  // This case might happen briefly if a profile is deleted and state is updating.
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center">
        <LoaderCircle className="w-12 h-12 text-brand-primary animate-spin" />
        <p className="mt-4 text-brand-text">Cargando perfil...</p>
    </div>
  );
}

export default App;