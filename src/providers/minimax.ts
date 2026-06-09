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
    const voiceId = params.voice || 'female-shaonv';

    const requestBody: any = {
      model,
      text: params.text,
      stream: false,
      voice_setting: {
        voice_id: voiceId,
        speed: params.speed ?? 1.0,
        vol: params.vol ?? 3,
        pitch: params.pitch ?? 0,
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: params.format || 'mp3',
        channel: 1,
      },
      subtitle_enable: false,
      language_boost: 'Chinese',
    };

    if (params.emotion) {
      requestBody.voice_setting.emotion = params.emotion;
    }

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
      return { outputPath: params.outputPath, duration: data.data.duration, metadata: { provider: 'minimax', model, voice: voiceId } };
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

/** 从 voice_id 推断语言 */
function detectLanguage(voiceId: string): string {
  const langPrefixes: [string, string][] = [
    ['Chinese (Mandarin)', 'Chinese'],
    ['Cantonese', 'Cantonese'],
    ['English', 'English'],
    ['Japanese', 'Japanese'],
    ['Korean', 'Korean'],
    ['Spanish', 'Spanish'],
    ['Portuguese', 'Portuguese'],
    ['French', 'French'],
    ['German', 'German'],
    ['Russian', 'Russian'],
    ['Italian', 'Italian'],
    ['Arabic', 'Arabic'],
    ['Turkish', 'Turkish'],
    ['Ukrainian', 'Ukrainian'],
    ['Dutch', 'Dutch'],
    ['Vietnamese', 'Vietnamese'],
    ['Thai', 'Thai'],
    ['Polish', 'Polish'],
    ['Romanian', 'Romanian'],
    ['Greek', 'Greek'],
    ['Czech', 'Czech'],
    ['Finnish', 'Finnish'],
    ['Hindi', 'Hindi'],
    ['Indonesian', 'Indonesian'],
  ];
  for (const [prefix, lang] of langPrefixes) {
    if (voiceId.startsWith(prefix)) return lang;
  }
  // 中文拼音命名的音色
  if (/^[a-z]+_[a-z]+$/.test(voiceId) && /[a-z]/.test(voiceId)) {
    const chineseKeywords = [
      'shaonv', 'yujie', 'chengshu', 'tianmei', 'qingse', 'jingying',
      'badao', 'daxuesheng', 'bingjiao', 'nanyou', 'xuedi', 'xiongzhang',
      'shaoye', 'xiaoling', 'mengmei', 'xuemei', 'xuejie', 'didi',
    ];
    if (chineseKeywords.some(k => voiceId.includes(k))) return 'Chinese';
  }
  return 'Other';
}

/** 从 voice_id 和 description 推断性别 */
function detectGender(voiceId: string, desc: string): string {
  const femaleKeywords = [
    'female', 'girl', 'lady', 'woman', 'miss', 'heroine', 'queen',
    'sister', 'mermaid', 'princess', 'bride', 'aunt', 'goddess',
    'nun', 'witch', 'fairy', 'widow', '母', '女',
    // 中文拼音女性关键词
    'shaonv', 'yujie', 'tianmei', 'xiaoling', 'mengmei',
    'xuemei', 'xuejie', 'mei', 'jie',
  ];
  const maleKeywords = [
    'male', 'boy', 'man', 'gentleman', 'guy', 'daddy', 'hero',
    'king', 'brother', 'prince', 'uncle', 'sir', 'lord', 'father',
    'husband', '僧', '父', '男',
    // 中文拼音男性关键词
    'qingse', 'jingying', 'badao', 'daxuesheng', 'bingjiao',
    'nanyou', 'xuedi', 'xiongzhang', 'shaoye', 'didi',
  ];
  const lower = voiceId.toLowerCase();
  const lowerDesc = desc.toLowerCase();
  for (const kw of femaleKeywords) {
    if (lower.includes(kw) || lowerDesc.includes(kw)) return 'Female';
  }
  for (const kw of maleKeywords) {
    if (lower.includes(kw) || lowerDesc.includes(kw)) return 'Male';
  }
  return 'Unknown';
}

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
    return (data.system_voice || []).map((v: any) => {
      const desc = (v.description?.[0] || '');
      return {
        id: v.voice_id,
        name: v.voice_name,
        language: detectLanguage(v.voice_id),
        gender: detectGender(v.voice_id, desc),
        style: desc,
      };
    });
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
