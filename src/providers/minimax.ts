import type { Provider, ImageParams, ImageResult, BatchImageParams, BatchImageResult, TTSParams, TTSResult, MusicParams, MusicResult } from '../types/sdk';
import { ProviderError, NetworkError } from '../errors/codes';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { getApiKey } from './shared';
import { downloadFile } from '../client/http';

const BASE_URL = 'https://api.minimax.io/v1';

const VOICES = [
  { id: '冰糖', name: '冰糖', language: 'Chinese', gender: 'Female', style: '活泼少女' },
  { id: '茉莉', name: '茉莉', language: 'Chinese', gender: 'Female', style: '知性女声' },
  { id: '苏打', name: '苏打', language: 'Chinese', gender: 'Male', style: '阳光少年' },
  { id: '白桦', name: '白桦', language: 'Chinese', gender: 'Male', style: '成熟男声' },
  { id: 'Mia', name: 'Mia', language: 'English', gender: 'Female', style: 'Lively girl' },
  { id: 'Chloe', name: 'Chloe', language: 'English', gender: 'Female', style: 'Sweet Dreamy' },
  { id: 'Milo', name: 'Milo', language: 'English', gender: 'Male', style: 'Sunny boy' },
  { id: 'Dean', name: 'Dean', language: 'English', gender: 'Male', style: 'Steady Gentle' },
];

export const minimaxProvider: Provider = {
  name: 'minimax',

  async generateImage(params: ImageParams): Promise<ImageResult> {
    const apiKey = getApiKey('minimax');
    const model = params.model || 'MiniMax-M2.7';
    
    const requestBody: any = { model, prompt: params.prompt };
    
    try {
      const response = await fetch(`${BASE_URL}/images/generations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ProviderError(`MiniMax API error: ${error.error?.message || response.statusText}`, 'minimax', response.status);
      }
      
      const data = await response.json();
      const url = data.data[0].url;
      const outputPath = await downloadFile(url, params.outputPath);
      
      return { url, outputPath, metadata: { provider: 'minimax', model } };
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new NetworkError(`MiniMax API request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async editImage(): Promise<ImageResult> {
    throw new ProviderError('Image editing not supported by MiniMax provider', 'minimax');
  },

  async batchGenerateImages(params: BatchImageParams): Promise<BatchImageResult[]> {
    getApiKey('minimax');
    
    if (!existsSync(params.batchFile)) {
      throw new ProviderError(`Batch file not found: ${params.batchFile}`, 'minimax');
    }
    
    const batchContent = readFileSync(params.batchFile, 'utf-8');
    const batchItems = JSON.parse(batchContent);
    if (!Array.isArray(batchItems)) {
      throw new ProviderError('Batch file must contain a JSON array', 'minimax');
    }
    
    const results: BatchImageResult[] = [];
    const concurrency = params.jobs || 4;
    
    for (let i = 0; i < batchItems.length; i += concurrency) {
      const batch = batchItems.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(async (item: any) => {
          const result = await this.generateImage({
            prompt: item.prompt, outputPath: item.output, model: item.model,
          });
          return { url: result.url, outputPath: result.outputPath, metadata: result.metadata };
        })
      );
      results.push(...batchResults);
    }
    
    return results;
  },

  async synthesizeSpeech(params: TTSParams): Promise<TTSResult> {
    const apiKey = getApiKey('minimax');
    const model = params.model || 'speech-2.8-hd';
    
    const requestBody: any = {
      model,
      text: params.text,
      voice_setting: { voice_id: params.voice || '冰糖' },
    };
    
    if (params.speed) requestBody.voice_setting.speed = params.speed;
    if (params.pitch) requestBody.voice_setting.pitch = params.pitch;
    
    try {
      const response = await fetch(`${BASE_URL}/t2a_v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ProviderError(`MiniMax TTS API error: ${error.error?.message || response.statusText}`, 'minimax', response.status);
      }
      
      const data = await response.json();
      const audioBuffer = Buffer.from(data.data.audio, 'hex');
      
      const outputDir = dirname(params.outputPath);
      if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
      writeFileSync(params.outputPath, audioBuffer);
      
      return {
        outputPath: params.outputPath,
        duration: data.data.duration,
        metadata: { provider: 'minimax', model, voice: params.voice || '冰糖' },
      };
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new NetworkError(`MiniMax TTS API request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async generateMusic(params: MusicParams): Promise<MusicResult> {
    const apiKey = getApiKey('minimax');
    const model = params.model || 'music-2.6';
    
    const requestBody: any = { model, prompt: params.prompt };
    if (params.lyrics) requestBody.lyrics = params.lyrics;
    if (params.instrumental) requestBody.instrumental = true;
    
    try {
      const response = await fetch(`${BASE_URL}/music_generation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ProviderError(`MiniMax Music API error: ${error.error?.message || response.statusText}`, 'minimax', response.status);
      }
      
      const data = await response.json();
      const audioBuffer = Buffer.from(data.data.audio, 'hex');
      
      const outputDir = dirname(params.outputPath);
      if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
      writeFileSync(params.outputPath, audioBuffer);
      
      return {
        outputPath: params.outputPath,
        duration: data.data.duration,
        metadata: { provider: 'minimax', model },
      };
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new NetworkError(`MiniMax Music API request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
};

export function getVoices() {
  return VOICES;
}
