import type { Provider, ImageParams, ImageResult, BatchImageParams, BatchImageResult, TTSParams, TTSResult, MusicParams, MusicResult } from '../types/sdk';
import { ProviderError, NetworkError } from '../errors/codes';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { getApiKey } from './shared';
import { downloadFile, apiFetch } from '../client/http';


const BASE_URL = 'https://api.minimaxi.com/v1';

export const minimaxProvider: Provider = {
  name: 'minimax',

  async generateImage(params: ImageParams): Promise<ImageResult> {
    const apiKey = getApiKey('minimax');
    const model = params.model || 'MiniMax-M2.7';
    const requestBody: any = { model, prompt: params.prompt };

    try {
      const response = await apiFetch('minimax', 'POST', `${BASE_URL}/images/generations`, { headers: { Authorization: `Bearer ${apiKey}` }, body: JSON.stringify(requestBody), description: 'images_generations' });
      if (!response.ok) {
        const err: any = await response.json().catch(() => ({}));
        throw new ProviderError(`MiniMax API error: ${err.error?.message || response.statusText}`, 'minimax', response.status);
      }
      const data: any = await response.json();
      return { url: data.data[0].url, outputPath: await downloadFile(data.data[0].url, params.outputPath), metadata: { provider: 'minimax', model } };
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new NetworkError(`MiniMax API request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },


  async batchGenerateImages(params: BatchImageParams): Promise<BatchImageResult[]> {
    getApiKey('minimax');
    if (!existsSync(params.batchFile)) throw new ProviderError(`Batch file not found: ${params.batchFile}`, 'minimax');
    const batchItems = JSON.parse(readFileSync(params.batchFile, 'utf-8'));
    if (!Array.isArray(batchItems)) throw new ProviderError('Batch file must contain a JSON array', 'minimax');

    const results: BatchImageResult[] = [];
    const concurrency = params.jobs || 4;
    for (let i = 0; i < batchItems.length; i += concurrency) {
      const batch = batchItems.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(async (item: any) => {
          const result = await this.generateImage({ prompt: item.prompt, outputPath: item.output, model: item.model });
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
    const requestBody: any = { model, text: params.text, voice_setting: { voice_id: params.voice || '冰糖' } };
    if (params.speed) requestBody.voice_setting.speed = params.speed;
    if (params.pitch) requestBody.voice_setting.pitch = params.pitch;

    try {
      const response = await apiFetch('minimax', 'POST', `${BASE_URL}/t2a_v2`, { headers: { Authorization: `Bearer ${apiKey}` }, body: JSON.stringify(requestBody), description: 't2a_v2' });
      if (!response.ok) {
        const err: any = await response.json().catch(() => ({}));
        throw new ProviderError(`MiniMax TTS API error: ${err.error?.message || response.statusText}`, 'minimax', response.status);
      }
      const data: any = await response.json();
      const audioBuffer = Buffer.from(data.data.audio, 'hex');
      const outputDir = dirname(params.outputPath);
      if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
      writeFileSync(params.outputPath, audioBuffer);
      return { outputPath: params.outputPath, duration: data.data.duration, metadata: { provider: 'minimax', model, voice: params.voice || '冰糖' } };
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
      const response = await apiFetch('minimax', 'POST', `${BASE_URL}/music_generation`, { headers: { Authorization: `Bearer ${apiKey}` }, body: JSON.stringify(requestBody), description: 'music_generation' });
      if (!response.ok) {
        const err: any = await response.json().catch(() => ({}));
        throw new ProviderError(`MiniMax Music API error: ${err.error?.message || response.statusText}`, 'minimax', response.status);
      }
      const data: any = await response.json();
      const audioBuffer = Buffer.from(data.data.audio, 'hex');
      const outputDir = dirname(params.outputPath);
      if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
      writeFileSync(params.outputPath, audioBuffer);
      return { outputPath: params.outputPath, duration: data.data.duration, metadata: { provider: 'minimax', model } };
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new NetworkError(`MiniMax Music API request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
};

export async function getVoices(): Promise<any[]> {
  try {
    const apiKey = getApiKey('minimax');
    const response = await apiFetch('minimax', 'POST', `${BASE_URL}/get_voice`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ voice_type: 'system' }),
      description: 'getVoices',
    });
    if (!response.ok) throw new Error('Failed to fetch voices');
    const data: any = await response.json();
    return (data.system_voice || []).map((v: any) => ({
      id: v.voice_id,
      name: v.voice_name,
      language: v.voice_id.startsWith('Chinese') ? 'Chinese' :
               v.voice_id.startsWith('English') ? 'English' :
               v.voice_id.startsWith('Japanese') ? 'Japanese' :
               v.voice_id.startsWith('Korean') ? 'Korean' : 'Other',
      gender: (v.description?.[0] || '').includes('女') ? 'Female' : 'Male',
      style: v.description?.[0] || '',
    }));
  } catch {
    // fallback: 返回常用音色
    return [
      { id: 'female-shaonv', name: '少女音色', language: 'Chinese', gender: 'Female', style: '甜美少女' },
      { id: 'female-yujie', name: '御姐音色', language: 'Chinese', gender: 'Female', style: '成熟御姐' },
      { id: 'female-chengshu', name: '成熟女性', language: 'Chinese', gender: 'Female', style: '沉稳成熟' },
      { id: 'male-qn-qingse', name: '青涩青年', language: 'Chinese', gender: 'Male', style: '青涩青春' },
      { id: 'male-qn-jingying', name: '精英青年', language: 'Chinese', gender: 'Male', style: '精英干练' },
    ];
  }
}
