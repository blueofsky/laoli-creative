import type { Provider, TTSParams, TTSResult } from '../types/sdk';
import { ProviderError, NetworkError } from '../errors/codes';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { getApiKey } from './shared';
import { apiFetch } from '../client/http';

const BASE_URL = 'https://token-plan-cn.xiaomimimo.com/v1';

const VOICES = [
  { id: 'mimo_default', name: 'MiMo-默认', language: 'Chinese', gender: 'Female', style: '默认（中国集群=冰糖）' },
  { id: '冰糖', name: '冰糖', language: 'Chinese', gender: 'Female', style: '活泼少女' },
  { id: '茉莉', name: '茉莉', language: 'Chinese', gender: 'Female', style: '知性女声' },
  { id: '苏打', name: '苏打', language: 'Chinese', gender: 'Male', style: '阳光少年' },
  { id: '白桦', name: '白桦', language: 'Chinese', gender: 'Male', style: '成熟男声' },
  { id: 'Mia', name: 'Mia', language: 'English', gender: 'Female', style: 'Lively girl' },
  { id: 'Chloe', name: 'Chloe', language: 'English', gender: 'Female', style: 'Sweet Dreamy' },
  { id: 'Milo', name: 'Milo', language: 'English', gender: 'Male', style: 'Sunny boy' },
  { id: 'Dean', name: 'Dean', language: 'English', gender: 'Male', style: 'Steady Gentle' },
];

const VALID_VOICE_IDS = VOICES.map(v => v.id);

export const mimoProvider: Provider = {
  name: 'mimo',

  async synthesizeSpeech(params: TTSParams): Promise<TTSResult> {
    const apiKey = getApiKey('mimo');

    // messages: user（风格描述） + assistant（合成文本）
    const messages: any[] = [];
    if (params.context) {
      messages.push({ role: 'user', content: params.context });
    }
    messages.push({ role: 'assistant', content: params.text });

    const voice = params.voice || '冰糖';
    if (!VALID_VOICE_IDS.includes(voice)) {
      throw new ProviderError(`Invalid voice: ${voice}. Valid: ${VALID_VOICE_IDS.join(', ')}`, 'mimo');
    }

    const requestBody = {
      model: 'mimo-v2.5-tts',
      messages,
      audio: {
        format: 'wav',
        voice,
      },
    };

    try {
      const response = await apiFetch('mimo', 'POST', `${BASE_URL}/chat/completions`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify(requestBody),
        description: 'chat_completions',
      });
      if (!response.ok) {
        const err: any = await response.json().catch(() => ({}));
        throw new ProviderError(`MiMo API error: ${err.error?.message || response.statusText}`, 'mimo', response.status);
      }
      const data: any = await response.json();
      const audioBase64 = data.choices?.[0]?.message?.audio?.data;
      if (!audioBase64) {
        throw new ProviderError('MiMo API returned no audio data', 'mimo');
      }
      const audioBuffer = Buffer.from(audioBase64, 'base64');
      const outputDir = dirname(params.outputPath);
      if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
      writeFileSync(params.outputPath, audioBuffer);
      return { outputPath: params.outputPath, metadata: { provider: 'mimo', voice } };
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new NetworkError(`MiMo API request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async generateImage(): Promise<any> {
    throw new ProviderError('Image generation not supported by MiMo provider', 'mimo');
  },

  async batchGenerateImages(): Promise<any> {
    throw new ProviderError('Image generation not supported by MiMo provider', 'mimo');
  },
};

export function getVoices() {
  return VOICES;
}
