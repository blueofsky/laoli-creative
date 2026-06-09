import { getProvider } from '../providers';
import { getVoices as getMimoVoices } from '../providers/mimo';
import { getVoices as getMinimaxVoices } from '../providers/minimax';
import type { TTSParams, TTSResult } from '../types/sdk';

export async function synthesizeSpeech(params: TTSParams): Promise<TTSResult> {
  const provider = getProvider(params.provider || 'minimax');

  if (!provider.synthesizeSpeech) {
    throw new Error(`Provider "${params.provider}" does not support TTS`);
  }

  return provider.synthesizeSpeech(params);
}

export async function listVoices(providerName?: string): Promise<any[]> {
  const name = providerName || 'minimax';

  if (name === 'mimo') {
    return getMimoVoices();
  }

  return getMinimaxVoices();
}
