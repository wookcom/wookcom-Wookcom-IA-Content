import React, { useState } from 'react';
import { useTrainingData } from './hooks/useTrainingData';
import { TrainingWizard } from './components/TrainingWizard';
import { ContentGenerator } from './components/ContentGenerator';
import type { Profile, TrainingData } from './types';
import { AppHeader } from './components/AppHeader';
import { Dashboard } from './components/Dashboard';
import { CopyAdsGenerator } from './components/CopyAdsGenerator';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { LoaderCircle } from 'lucide-react';

export type AppView = 'dashboard' | 'content' | 'ads';

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
  const [view, setView] = useState<AppView>('dashboard');

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
        <div className="min-h-screen text-brand-text p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
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
