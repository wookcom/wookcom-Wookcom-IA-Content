
import type { TrainingData, HookCategory, Script, AdCopyDiagnosis, RefinedAdCopyAnswers, AdCopyDiagnosisItem, AdContentType, AdCopyResult } from '../types';

/**
 * A helper function to call our new secure serverless proxy.
 * @param action The specific Gemini action to perform.
 * @param payload The data required for that action.
 * @returns The JSON response from the proxy.
 */
async function callProxy<T>(action: string, payload: any): Promise<T> {
  const response = await fetch('/api/gemini-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, payload }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    // Use the server's error message if available, otherwise provide a generic one.
    throw new Error(responseData.error || `Error from server: ${response.statusText}`);
  }

  return responseData;
}

export const generateHooks = async (
  trainingData: TrainingData,
  category: HookCategory,
  quantity: number
): Promise<string[]> => {
  return callProxy<string[]>('generateHooks', { trainingData, category, quantity });
};

export const generateScriptForHook = async (
  trainingData: TrainingData,
  hook: string,
  durationInSeconds: number
): Promise<Script> => {
  return callProxy<Script>('generateScriptForHook', { trainingData, hook, durationInSeconds });
};

// ==================================================================
// AD COPY CONSULTANT LOGIC
// ==================================================================

export const diagnoseAdScript = async (
  userScript: string,
  contentType: AdContentType
): Promise<AdCopyDiagnosis> => {
  return callProxy<AdCopyDiagnosis>('diagnoseAdScript', { userScript, contentType });
};

export const improveAdCopyAnswer = async (
  originalScript: string,
  diagnosisItem: AdCopyDiagnosisItem,
  trainingData: TrainingData
): Promise<string> => {
  return callProxy<string>('improveAdCopyAnswer', { originalScript, diagnosisItem, trainingData });
};

export const generateAdCopy = async (
  refinedAnswers: RefinedAdCopyAnswers,
  userScript: string,
  contentType: AdContentType,
): Promise<AdCopyResult> => {
  return callProxy<AdCopyResult>('generateAdCopy', { refinedAnswers, userScript, contentType });
};
