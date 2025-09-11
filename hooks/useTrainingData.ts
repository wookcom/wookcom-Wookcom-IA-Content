import { useState, useCallback, useEffect, useMemo } from 'react';
import type { TrainingData, Profile, SavedHook, SavedScript, Script, VideoPlatform } from '../types';

const STORAGE_KEY = 'wookcomIaContentData';

interface StoredData {
  profiles: Profile[];
  activeProfileId: string | null;
}

export function useTrainingData() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedData: StoredData = JSON.parse(storedData);
        if (parsedData.profiles && Array.isArray(parsedData.profiles)) {
          // Ensure new fields exist
          const sanitizedProfiles = parsedData.profiles.map(p => ({
            ...p,
            savedHooks: p.savedHooks || [],
            savedScripts: p.savedScripts || [],
          }));
          setProfiles(sanitizedProfiles);
          
          const activeId = parsedData.activeProfileId && sanitizedProfiles.some(p => p.id === parsedData.activeProfileId)
            ? parsedData.activeProfileId
            : sanitizedProfiles[0]?.id || null;
          setActiveProfileId(activeId);
        }
      }
    } catch (error) {
      console.error("Failed to parse training data from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const saveDataToStorage = useCallback((data: StoredData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save training data to localStorage", error);
    }
  }, []);

  const saveProfile = useCallback((name: string, data: TrainingData) => {
    const newProfile: Profile = { 
      id: crypto.randomUUID(), 
      name, 
      data,
      savedHooks: [],
      savedScripts: [],
    };
    const updatedProfiles = [...profiles, newProfile];
    
    setProfiles(updatedProfiles);
    setActiveProfileId(newProfile.id);
    saveDataToStorage({ profiles: updatedProfiles, activeProfileId: newProfile.id });
  }, [profiles, saveDataToStorage]);

  const updateProfile = useCallback((id: string, name: string, data: TrainingData) => {
    const updatedProfiles = profiles.map(p =>
      p.id === id ? { ...p, name, data } : p
    );
    setProfiles(updatedProfiles);
    saveDataToStorage({ profiles: updatedProfiles, activeProfileId });
  }, [profiles, activeProfileId, saveDataToStorage]);
  
  const deleteProfile = useCallback((id: string) => {
    const updatedProfiles = profiles.filter(p => p.id !== id);
    let newActiveProfileId = activeProfileId;

    if (id === activeProfileId) {
      newActiveProfileId = updatedProfiles[0]?.id || null;
    }

    setProfiles(updatedProfiles);
    setActiveProfileId(newActiveProfileId);
    saveDataToStorage({ profiles: updatedProfiles, activeProfileId: newActiveProfileId });
  }, [profiles, activeProfileId, saveDataToStorage]);

  const setActiveProfile = useCallback((id: string) => {
    setActiveProfileId(id);
    saveDataToStorage({ profiles, activeProfileId: id });
  }, [profiles, saveDataToStorage]);

  const activeProfile = useMemo(() => {
    return profiles.find(p => p.id === activeProfileId) || null;
  }, [profiles, activeProfileId]);
  
  const saveHookToProfile = useCallback((hookText: string) => {
    if (!activeProfileId) return;

    const updatedProfiles = profiles.map(p => {
      if (p.id === activeProfileId) {
        if (p.savedHooks.some(h => h.text === hookText)) {
          return p;
        }
        const newHook: SavedHook = {
          id: crypto.randomUUID(),
          text: hookText,
          createdAt: new Date().toISOString(),
        };
        return { ...p, savedHooks: [newHook, ...p.savedHooks] };
      }
      return p;
    });

    setProfiles(updatedProfiles);
    saveDataToStorage({ profiles: updatedProfiles, activeProfileId });
  }, [profiles, activeProfileId, saveDataToStorage]);
  
  const deleteSavedHook = useCallback((hookId: string) => {
    if (!activeProfileId) return;

    const updatedProfiles = profiles.map(p => {
      if (p.id === activeProfileId) {
        const updatedHooks = p.savedHooks.filter(h => h.id !== hookId);
        return { ...p, savedHooks: updatedHooks };
      }
      return p;
    });

    setProfiles(updatedProfiles);
    saveDataToStorage({ profiles: updatedProfiles, activeProfileId });
  }, [profiles, activeProfileId, saveDataToStorage]);

  const saveScriptToProfile = useCallback((data: { hook: string; script: Script; platform: VideoPlatform; duration: number; }) => {
    if (!activeProfileId) return;
    
    const newScript: SavedScript = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    const updatedProfiles = profiles.map(p => {
      if (p.id === activeProfileId) {
        return { ...p, savedScripts: [newScript, ...p.savedScripts] };
      }
      return p;
    });

    setProfiles(updatedProfiles);
    saveDataToStorage({ profiles: updatedProfiles, activeProfileId });
  }, [profiles, activeProfileId, saveDataToStorage]);
  
  const deleteSavedScript = useCallback((scriptId: string) => {
    if (!activeProfileId) return;

    const updatedProfiles = profiles.map(p => {
      if (p.id === activeProfileId) {
        const updatedScripts = p.savedScripts.filter(s => s.id !== scriptId);
        return { ...p, savedScripts: updatedScripts };
      }
      return p;
    });

    setProfiles(updatedProfiles);
    saveDataToStorage({ profiles: updatedProfiles, activeProfileId });
  }, [profiles, activeProfileId, saveDataToStorage]);

  return {
    profiles,
    activeProfile,
    isLoading,
    saveProfile,
    updateProfile,
    deleteProfile,
    setActiveProfileId: setActiveProfile,
    saveHookToProfile,
    deleteSavedHook,
    saveScriptToProfile,
    deleteSavedScript,
  };
}