import type { Provider, TTSParams, TTSResult, VisionImageParams, VisionVideoParams, VisionResult } from '../types/sdk';
import { ProviderError, NetworkError } from '../errors/codes';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { dirname, extname } from 'path';
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

  /** 图片理解：分析图片内容 */
  async understandImage(params: VisionImageParams): Promise<VisionResult> {
    const apiKey = getApiKey('mimo');
    const model = params.model || 'mimo-v2.5';
    const imageUrl = await resolveMediaUrl(params.input, 'image');
    const messages = [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: imageUrl } },
        { type: 'text', text: params.prompt },
      ],
    }];
    return callVisionAPI(apiKey, model, messages);
  },

  /** 视频理解：分析视频内容 */
  async understandVideo(params: VisionVideoParams): Promise<VisionResult> {
    const apiKey = getApiKey('mimo');
    const model = params.model || 'mimo-v2.5';
    const videoUrl = await resolveMediaUrl(params.input, 'video');
    const messages = [{
      role: 'user',
      content: [
        { type: 'video_url', video_url: { url: videoUrl }, fps: params.fps ?? 2, media_resolution: params.mediaResolution || 'default' },
        { type: 'text', text: params.prompt },
      ],
    }];
    return callVisionAPI(apiKey, model, messages);
  },
};

// ---------- 辅助函数 ----------

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.gif': 'image/gif',
  '.webp': 'image/webp', '.bmp': 'image/bmp',
  '.mp4': 'video/mp4', '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo', '.wmv': 'video/x-ms-wmv',
};

/** 将本地文件路径转为 Base64 Data URL，URL 则原样返回 */
async function resolveMediaUrl(input: string, type: 'image' | 'video'): Promise<string> {
  if (input.startsWith('http://') || input.startsWith('https://')) return input;
  const ext = extname(input).toLowerCase();
  const mime = MIME_TYPES[ext];
  if (!mime) throw new ProviderError(`Unsupported ${type} format: ${ext}`, 'mimo');
  const data = readFileSync(input);
  const base64 = data.toString('base64');
  return `data:${mime};base64,${base64}`;
}

/** 调用 MiMo Chat Completions API 进行视觉理解 */
async function callVisionAPI(apiKey: string, model: string, messages: any[]): Promise<VisionResult> {
  const requestBody = { model, messages, max_completion_tokens: 2048 };
  try {
    const response = await apiFetch('mimo', 'POST', `${BASE_URL}/chat/completions`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(requestBody),
      description: 'vision_chat_completions',
    });
    if (!response.ok) {
      const err: any = await response.json().catch(() => ({}));
      throw new ProviderError(`MiMo Vision API error: ${err.error?.message || response.statusText}`, 'mimo', response.status);
    }
    const data: any = await response.json();
    const choice = data.choices?.[0]?.message;
    if (!choice?.content) throw new ProviderError('MiMo Vision API returned no content', 'mimo');
    return {
      content: choice.content,
      reasoningContent: choice.reasoning_content,
      usage: data.usage,
      metadata: { model, provider: 'mimo' },
    };
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    throw new NetworkError(`MiMo Vision API request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function getVoices() {
  return VOICES;
}
