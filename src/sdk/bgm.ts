import { getProvider } from '../providers';
import type { MusicParams, MusicResult } from '../types/sdk';

export async function generateMusic(params: MusicParams): Promise<MusicResult> {
  const provider = getProvider(params.provider || 'minimax');
  
  if (!provider.generateMusic) {
    throw new Error(`Provider "${params.provider}" does not support music generation`);
  }
  
  return provider.generateMusic(params);
}
