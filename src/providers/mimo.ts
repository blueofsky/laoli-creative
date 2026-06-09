import type { Provider, TTSParams, TTSResult } from '../types/sdk';
import { ProviderError, NetworkError } from '../errors/codes';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { dirname } from 'path';
import { getApiKey } from './shared';
import { apiFetch } from '../client/http';

const BASE_URL = 'https://api.xiaomimimo.com/v1';

const VOICES = [
  { id: 'female-shaonv', name: '少女音色', language: 'Chinese', gender: 'Female', style: '甜美少女' },
  { id: 'female-yujie', name: '御姐音色', language: 'Chinese', gender: 'Female', style: '成熟御姐' },
  { id: 'female-chengshu', name: '成熟女性', language: 'Chinese', gender: 'Female', style: '沉稳成熟' },
  { id: 'female-tianmei', name: '甜美女性', language: 'Chinese', gender: 'Female', style: '甜美温柔' },
  { id: 'male-qn-qingse', name: '青涩青年', language: 'Chinese', gender: 'Male', style: '青涩青春' },
  { id: 'male-qn-jingying', name: '精英青年', language: 'Chinese', gender: 'Male', style: '精英干练' },
  { id: 'male-qn-badao', name: '霸道青年', language: 'Chinese', gender: 'Male', style: '霸道强势' },
  { id: 'male-qn-daxuesheng', name: '大学生', language: 'Chinese', gender: 'Male', style: '阳光开朗' },
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
    const response = await apiFetch('mimo', 'POST', `${BASE_URL}/audio/speech`, { headers: { Authorization: `Bearer ${apiKey}` }, body: JSON.stringify(requestBody), description: 'audio_speech' });
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
    const response = await apiFetch('mimo', 'POST', `${BASE_URL}/audio/speech`, { headers: { Authorization: `Bearer ${apiKey}` }, body: JSON.stringify(requestBody), description: 'audio_speech' });
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
    const response = await apiFetch('mimo', 'POST', `${BASE_URL}/audio/speech`, { headers: { Authorization: `Bearer ${apiKey}` }, body: JSON.stringify(requestBody), description: 'audio_speech' });
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
