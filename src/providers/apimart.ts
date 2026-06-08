import type { Provider, ImageParams, ImageResult, EditImageParams, BatchImageParams, BatchImageResult, VideoParams, VideoResult } from '../types/sdk';
import { ProviderError, NetworkError } from '../errors/codes';
import { readFileSync, existsSync } from 'fs';
import { getApiKey, aspectRatioToSize } from './shared';
import { downloadFile } from '../client/http';

const BASE_URL = 'https://api.apimart.ai/v1';

const VIDEO_MODELS: Record<string, { maxDuration: number; sizes: string[]; resolutions: string[] }> = {
  'doubao-seedance-1-0-pro-fast': { maxDuration: 12, sizes: ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'], resolutions: ['480p', '720p', '1080p'] },
  'doubao-seedance-1-5-pro': { maxDuration: 12, sizes: ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'], resolutions: ['480p', '720p', '1080p'] },
  'doubao-seedance-2-0-fast': { maxDuration: 15, sizes: ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'], resolutions: ['480p', '720p', '1080p'] },
  'veo3.1-lite': { maxDuration: 8, sizes: ['16:9', '9:16'], resolutions: ['720p', '1080p', '4k'] },
  'veo3.1-fast': { maxDuration: 8, sizes: ['16:9', '9:16'], resolutions: ['720p', '1080p', '4k'] },
  'sora-2-preview': { maxDuration: 12, sizes: ['16:9', '9:16'], resolutions: ['480p', '720p', '1080p'] },
};

const RESOLUTION_MAP: Record<string, string> = {
  '480p': '854x480',
  '720p': '1280x720',
  '1080p': '1920x1080',
  '4k': '3840x2160',
};

export const apimartProvider: Provider = {
  name: 'apimart',

  async generateImage(params: ImageParams): Promise<ImageResult> {
    const apiKey = getApiKey('apimart');
    const model = params.model || 'gpt-image-2';
    const requestBody: any = { model, prompt: params.prompt };

    if (params.size) {
      requestBody.size = params.size;
    } else if (params.aspectRatio) {
      requestBody.size = aspectRatioToSize(params.aspectRatio);
    } else {
      requestBody.size = '1024x1024';
    }
    if (params.refImages && params.refImages.length > 0) {
      requestBody.image = params.refImages[0];
    }
    if (params.quality) {
      requestBody.quality = params.quality === 'normal' ? '1k' : '2k';
    }

    try {
      const response = await fetch(`${BASE_URL}/images/generations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const err: any = await response.json().catch(() => ({}));
        throw new ProviderError(`APIMart API error: ${err.error?.message || response.statusText}`, 'apimart', response.status);
      }
      const data: any = await response.json();
      return { url: data.data[0].url, outputPath: await downloadFile(data.data[0].url, params.outputPath), metadata: { provider: 'apimart', model, size: requestBody.size } };
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new NetworkError(`APIMart API request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async editImage(params: EditImageParams): Promise<ImageResult> {
    const apiKey = getApiKey('apimart');
    const model = params.model || 'gpt-image-2';
    const imageBuffer = readFileSync(params.inputPath);
    const base64Image = imageBuffer.toString('base64');
    const requestBody = { model, prompt: params.prompt, image: `data:image/png;base64,${base64Image}` };

    try {
      const response = await fetch(`${BASE_URL}/images/edits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const err: any = await response.json().catch(() => ({}));
        throw new ProviderError(`APIMart API error: ${err.error?.message || response.statusText}`, 'apimart', response.status);
      }
      const data: any = await response.json();
      return { url: data.data[0].url, outputPath: await downloadFile(data.data[0].url, params.outputPath), metadata: { provider: 'apimart', model } };
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new NetworkError(`APIMart API request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async batchGenerateImages(params: BatchImageParams): Promise<BatchImageResult[]> {
    getApiKey('apimart');
    if (!existsSync(params.batchFile)) throw new ProviderError(`Batch file not found: ${params.batchFile}`, 'apimart');
    const batchItems = JSON.parse(readFileSync(params.batchFile, 'utf-8'));
    if (!Array.isArray(batchItems)) throw new ProviderError('Batch file must contain a JSON array', 'apimart');

    const results: BatchImageResult[] = [];
    const concurrency = params.jobs || 4;
    for (let i = 0; i < batchItems.length; i += concurrency) {
      const batch = batchItems.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(async (item: any) => {
          const result = await this.generateImage({ prompt: item.prompt, outputPath: item.output, model: item.model, aspectRatio: item.aspectRatio, size: item.size });
          return { url: result.url, outputPath: result.outputPath, metadata: result.metadata };
        })
      );
      results.push(...batchResults);
    }
    return results;
  },

  async generateVideo(params: VideoParams): Promise<VideoResult> {
    const apiKey = getApiKey('apimart');
    const model = params.model || 'doubao-seedance-1-0-pro-fast';
    const modelConfig = VIDEO_MODELS[model];
    if (!modelConfig) throw new ProviderError(`Unsupported video model: ${model}. Supported: ${Object.keys(VIDEO_MODELS).join(', ')}`, 'apimart');

    const requestBody: any = { model, prompt: params.prompt };
    const seconds = params.seconds || 5;
    if (seconds > modelConfig.maxDuration) throw new ProviderError(`Duration ${seconds}s exceeds max ${modelConfig.maxDuration}s for ${model}`, 'apimart');
    requestBody.duration = seconds;
    if (params.size) {
      requestBody.size = params.size;
    } else if (params.resolution) {
      requestBody.size = RESOLUTION_MAP[params.resolution] || RESOLUTION_MAP['1080p'];
    } else {
      requestBody.size = RESOLUTION_MAP['1080p'];
    }
    if (params.refImages && params.refImages.length > 0) requestBody.image = params.refImages[0];

    try {
      const response = await fetch(`${BASE_URL}/videos/generations`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const err: any = await response.json().catch(() => ({}));
        throw new ProviderError(`APIMart Video API error: ${err.error?.message || response.statusText}`, 'apimart', response.status);
      }
      const data: any = await response.json();
      return { taskId: data.id, status: 'pending', metadata: { provider: 'apimart', model, duration: seconds, size: requestBody.size } };
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new NetworkError(`APIMart Video API request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async queryVideoTask(taskId: string): Promise<VideoResult> {
    const apiKey = getApiKey('apimart');
    try {
      const response = await fetch(`${BASE_URL}/videos/generations/${taskId}`, { headers: { 'Authorization': `Bearer ${apiKey}` } });
      if (!response.ok) {
        const err: any = await response.json().catch(() => ({}));
        throw new ProviderError(`APIMart Video API error: ${err.error?.message || response.statusText}`, 'apimart', response.status);
      }
      const data: any = await response.json();
      let status: VideoResult['status'] = 'pending';
      if (data.status === 'succeeded') status = 'completed';
      else if (data.status === 'failed') status = 'failed';
      else if (data.status === 'processing' || data.status === 'running') status = 'processing';
      return { taskId: data.id, status, url: data.output?.video_url || data.video_url, metadata: { provider: 'apimart', model: data.model } };
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new NetworkError(`APIMart Video API request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async downloadVideo(taskId: string, outputPath: string): Promise<string> {
    const result = await this.queryVideoTask!(taskId);
    if (result.status !== 'completed' || !result.url) throw new ProviderError(`Video task ${taskId} is not completed. Status: ${result.status}`, 'apimart');
    return downloadFile(result.url!, outputPath);
  },
};
