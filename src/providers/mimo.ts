import type { Provider, TTSParams, TTSResult } from '../types/sdk';
import { ProviderError, NetworkError } from '../errors/codes';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { dirname } from 'path';
import { getApiKey } from './shared';

const BASE_URL = 'https://api.xiaomimimo.com/v1';

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

export const mimoProvider: Provider = {
  name: 'mimo',

  async synthesizeSpeech(params: TTSParams): Promise<TTSResult> {
    const apiKey = getApiKey('mimo');
    const model = params.model || 'mimo-v2.5-tts';

    if (model === 'mimo-v2.5-tts') {
      return synthesizeWithPresetVoice(params, apiKey);
    } else if (model === 'mimo-v2.5-tts-voicedesign') {
      return synthesizeWithVoiceDesign(params, apiKey);
    } else if (model === 'mimo-v2.5-tts-voiceclone') {
      return synthesizeWithVoiceClone(params, apiKey);
    } else {
      throw new ProviderError(`Unsupported MiMo model: ${model}. Supported: mimo-v2.5-tts, mimo-v2.5-tts-voicedesign, mimo-v2.5-tts-voiceclone`, 'mimo');
    }
  },

  async generateImage(): Promise<any> {
    throw new ProviderError('Image generation not supported by MiMo provider', 'mimo');
  },


  async batchGenerateImages(): Promise<any> {
    throw new ProviderError('Image generation not supported by MiMo provider', 'mimo');
  },
};

async function synthesizeWithPresetVoice(params: TTSParams, apiKey: string): Promise<TTSResult> {
  const voice = params.voice || '冰糖';
  const validVoice = VOICES.find(v => v.id === voice);
  if (!validVoice) {
    throw new ProviderError(`Invalid voice: ${voice}. Valid voices: ${VOICES.map(v => v.id).join(', ')}`, 'mimo');
  }
  const requestBody: any = { model: 'mimo-v2.5-tts', input: { text: params.text }, voice };
  if (params.speed || params.pitch) {
    requestBody.voice_setting = {};
    if (params.speed) requestBody.voice_setting.speed = params.speed;
    if (params.pitch) requestBody.voice_setting.pitch = params.pitch;
  }

  try {
    const response = await fetch(`${BASE_URL}/audio/speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      const err: any = await response.json().catch(() => ({}));
      throw new ProviderError(`MiMo API error: ${err.error?.message || response.statusText}`, 'mimo', response.status);
    }
    const data: any = await response.json();
    const audioBuffer = Buffer.from(data.data.audio, 'base64');
    const outputDir = dirname(params.outputPath);
    if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
    writeFileSync(params.outputPath, audioBuffer);
    return { outputPath: params.outputPath, duration: data.data.duration, metadata: { provider: 'mimo', model: 'mimo-v2.5-tts', voice } };
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    throw new NetworkError(`MiMo API request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function synthesizeWithVoiceDesign(params: TTSParams, apiKey: string): Promise<TTSResult> {
  const requestBody: any = { model: 'mimo-v2.5-tts-voicedesign', input: { text: params.text }, voice_setting: { context: params.voice || '' } };

  try {
    const response = await fetch(`${BASE_URL}/audio/speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      const err: any = await response.json().catch(() => ({}));
      throw new ProviderError(`MiMo API error: ${err.error?.message || response.statusText}`, 'mimo', response.status);
    }
    const data: any = await response.json();
    const audioBuffer = Buffer.from(data.data.audio, 'base64');
    const outputDir = dirname(params.outputPath);
    if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
    writeFileSync(params.outputPath, audioBuffer);
    return { outputPath: params.outputPath, duration: data.data.duration, metadata: { provider: 'mimo', model: 'mimo-v2.5-tts-voicedesign' } };
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    throw new NetworkError(`MiMo API request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function synthesizeWithVoiceClone(params: TTSParams, apiKey: string): Promise<TTSResult> {
  const voiceFile = params.voice;
  if (!voiceFile || !existsSync(voiceFile)) {
    throw new ProviderError('Voice clone requires a voice sample file. Use --voice <path-to-audio-file>', 'mimo');
  }
  const audioBuffer = readFileSync(voiceFile);
  const audioBase64 = audioBuffer.toString('base64');
  const requestBody: any = { model: 'mimo-v2.5-tts-voiceclone', input: { text: params.text }, voice_setting: { voice_file: audioBase64 } };

  try {
    const response = await fetch(`${BASE_URL}/audio/speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      const err: any = await response.json().catch(() => ({}));
      throw new ProviderError(`MiMo API error: ${err.error?.message || response.statusText}`, 'mimo', response.status);
    }
    const data: any = await response.json();
    const outputAudioBuffer = Buffer.from(data.data.audio, 'base64');
    const outputDir = dirname(params.outputPath);
    if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
    writeFileSync(params.outputPath, outputAudioBuffer);
    return { outputPath: params.outputPath, duration: data.data.duration, metadata: { provider: 'mimo', model: 'mimo-v2.5-tts-voiceclone' } };
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    throw new NetworkError(`MiMo API request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function getVoices() {
  return VOICES;
}
