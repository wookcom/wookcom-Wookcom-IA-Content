export interface TrainingData {
  brandVoice: {
    tone: string;
    phrases: string;
    examples: string;
  };
  idealClient: {
    description: string;
    desire: string;
    struggle: string;
    obstacle: string;
    limitingBeliefs: string;
    problemSolved: string;
  };
  products: {
    name: string;
    includes: string;
    transformation: string;
    uniqueness: string;
  };
  personalStory: {
    problem: string;
    turningPoint: string;
    transformation: string;
    why: string;
  };
  results: {
    personalResults: string;
    clientResults: string;
    authority: string;
  };
}

export interface SavedHook {
  id: string;
  text: string;
  createdAt: string;
}

export interface SavedScript {
  id: string;
  hook: string;
  script: Script;
  platform: VideoPlatform;
  duration: number; // in seconds
  createdAt: string;
}

export interface Profile {
  id: string;
  name: string;
  data: TrainingData;
  savedHooks: SavedHook[];
  savedScripts: SavedScript[];
}

export type HookCategory = 'VIDA PERSONAL' | 'OPINIÓN' | 'EDUCACIONAL';

export type VideoPlatform = 'Instagram Reels' | 'TikTok';

export interface Script {
  intro: string;
  development: string;
  outro: string;
}

// ---- New types for Ad Copy Consultant ----
export type AdContentType = 'Reel' | 'Carrusel' | 'B-roll';

export interface AdCopyDiagnosisItem {
  question: string;
  diagnosis: string;
}

export type AdCopyDiagnosis = AdCopyDiagnosisItem[];

export interface RefinedAdCopyAnswers {
  resultado: string;
  errorComun: string;
  metodoDiferente: string;
  resultadosPropios: string;
  creenciaFalsa: string;
  llamadoAlaAccion: string;
}

export interface AdCopyResult {
  contentType: AdContentType;
  copy: string | string[];
  ctaExamples: string[];
}
// -----------------------------------------


// Create a mapped type to correctly link step ID to question IDs
type TrainingStepMap = {
  [K in keyof TrainingData]: {
    id: K;
    title: string;
    questions: {
      id: keyof TrainingData[K];
      label: string;
      placeholder: string;
      isTextArea?: boolean;
    }[];
  }
};

// TrainingStep is a union of all possible step configurations
export type TrainingStep = TrainingStepMap[keyof TrainingData];