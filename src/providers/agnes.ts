import type { Provider, ImageParams, ImageResult, BatchImageParams, BatchImageResult, VideoParams, VideoResult } from '../types/sdk';
import { ProviderError, NetworkError } from '../errors/codes';
import { readFileSync, existsSync } from 'fs';
import { getApiKey, aspectRatioToSize } from './shared';
import { downloadFile, apiFetch } from '../client/http';

const BASE_URL = 'https://apihub.agnes-ai.com/v1';

// 视频尺寸映射 (长边 1152px)
const VIDEO_SIZE_MAP: Record<string, { width: number; height: number }> = {
  '16:9': { width: 1152, height: 648 },
  '9:16': { width: 648, height: 1152 },
  '1:1': { width: 1152, height: 1152 },
  '4:3': { width: 1152, height: 864 },
  '3:4': { width: 864, height: 1152 },
  '21:9': { width: 1152, height: 493 },
};

export const agnesProvider: Provider = {
  name: 'agnes',

  async generateImage(params: ImageParams): Promise<ImageResult> {
    const apiKey = getApiKey('agnes');
    const model = params.model || 'agnes-image-2.1-flash';

    const requestBody: any = { model, prompt: params.prompt };

    if (params.size) {
      requestBody.size = params.size;
    } else if (params.aspectRatio) {
      requestBody.size = aspectRatioToSize(params.aspectRatio);
    } else {
      requestBody.size = '1024x1024';
    }

    // 图生图：参考图片转 base64 data URL，放入 extra_body.image 数组
    if (params.refImages && params.refImages.length > 0) {
      const images: string[] = [];
      for (const ref of params.refImages) {
        if (ref.startsWith('http://') || ref.startsWith('https://')) {
          images.push(ref);
        } else {
          const buf = readFileSync(ref);
          const mime = ref.endsWith('.png') ? 'image/png' : 'image/jpeg';
          images.push(`data:${mime};base64,${buf.toString('base64')}`);
        }
      }
      requestBody.extra_body = { image: images, response_format: 'url' };
    }

    try {
      const response = await apiFetch('agnes', 'POST', `${BASE_URL}/images/generations`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(requestBody),
        description: 'generateImage',
      });

      if (!response.ok) {
        const err: any = await response.json().catch(() => ({}));
        throw new ProviderError(
          `Agnes API error: ${err.error?.message || response.statusText}`,
          'agnes',
          response.status
        );
      }

      const data: any = await response.json();
      const url = data.data[0].url;
      const outputPath = await downloadFile(url, params.outputPath);

      return { url, outputPath, metadata: { provider: 'agnes', model, size: requestBody.size } };
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new NetworkError(`Agnes API request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },


  async batchGenerateImages(params: BatchImageParams): Promise<BatchImageResult[]> {
    getApiKey('agnes');

    if (!existsSync(params.batchFile)) {
      throw new ProviderError(`Batch file not found: ${params.batchFile}`, 'agnes');
    }

    const batchContent = readFileSync(params.batchFile, 'utf-8');
    const batchItems = JSON.parse(batchContent);

    if (!Array.isArray(batchItems)) {
      throw new ProviderError('Batch file must contain a JSON array', 'agnes');
    }

    const results: BatchImageResult[] = [];
    const concurrency = params.jobs || 4;

    for (let i = 0; i < batchItems.length; i += concurrency) {
      const batch = batchItems.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(async (item: any) => {
          const result = await this.generateImage({
            prompt: item.prompt, outputPath: item.output, model: item.model,
            aspectRatio: item.aspectRatio, size: item.size,
          });
          return { url: result.url, outputPath: result.outputPath, metadata: result.metadata };
        })
      );
      results.push(...batchResults);
    }

    return results;
  },

  async generateVideo(params: VideoParams): Promise<VideoResult> {
    const apiKey = getApiKey('agnes');
    const model = params.model || 'agnes-video-v2.0';

    // 计算宽高
    let width = 648, height = 1152;
    if (params.size) {
      const [w, h] = params.size.split('x').map(Number);
      if (w && h) { width = w; height = h; }
    } else if (params.resolution) {
      // resolution 如 1080p 含宽高比信息
    } else {
      const size = VIDEO_SIZE_MAP['9:16'];
      width = size.width; height = size.height;
    }

    const seconds = params.seconds || 5;
    const frameRate = 24;
    // num_frames 必须满足 8n + 1，最大 441
    const rawFrames = Math.round(seconds * frameRate);
    const n = Math.max(1, Math.min(Math.ceil(rawFrames / 8), 55)); // 55*8+1 = 441
    const numFrames = 8 * n + 1;

    const requestBody: any = { model, prompt: params.prompt, width, height, num_frames: numFrames, frame_rate: frameRate };

    // 参考图处理：Video API 不支持 data URL，自动用 picgo CLI 上传到图床
    if (params.refImages && params.refImages.length > 0) {
      let ref = params.refImages[0];
      if (!ref.startsWith('http://') && !ref.startsWith('https://')) {
        const { execSync } = await import('child_process');
        const url = execSync(`npx picgo upload "${ref}"`, { encoding: 'utf-8' });
        // picgo 输出最后一行是 URL
        const lines = url.trim().split('\n');
        ref = lines[lines.length - 1].trim();
      }
      requestBody.image = ref;
    }

    try {
      const response = await apiFetch('agnes', 'POST', `${BASE_URL}/videos`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(requestBody),
        description: 'generateVideo',
      });
      if (!response.ok) {
        const err: any = await response.json().catch(() => ({}));
        throw new ProviderError(`Agnes Video API error: ${err.error?.message || response.statusText}`, 'agnes', response.status);
      }
      const data: any = await response.json();
      const taskId = data.video_id || data.id;
      return { taskId, status: 'pending', metadata: { provider: 'agnes', model } };
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new NetworkError(`Agnes Video API request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async queryVideoTask(taskId: string, retries = 3): Promise<VideoResult> {
    const apiKey = getApiKey('agnes');

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await apiFetch('agnes', 'GET', `${BASE_URL.replace('/v1', '')}/agnesapi?video_id=${taskId}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
          description: 'queryVideo',
        });

        if (response.status === 429) {
          // Rate limited: wait and retry
          if (attempt < retries) {
            const waitMs = (attempt + 1) * 3000;
            await new Promise(r => setTimeout(r, waitMs));
            continue;
          }
          throw new ProviderError('Agnes API rate limit exceeded. Try again later.', 'agnes', 429);
        }

        if (!response.ok) {
          const err: any = await response.json().catch(() => ({}));
          throw new ProviderError(`Agnes Video query error: ${err.error?.message || response.statusText}`, 'agnes', response.status);
        }
        const data: any = await response.json();

        let status: VideoResult['status'] = 'processing';
        if (data.status === 'completed') status = 'completed';
        else if (data.status === 'failed') status = 'failed';
        else if (data.status === 'queued') status = 'pending';

        return {
          taskId,
          status,
          url: data.remixed_from_video_id || data.video_url || data.url,
          metadata: { provider: 'agnes', progress: data.progress },
        };
      } catch (error) {
        if (error instanceof ProviderError && (error as any).statusCode !== 429) throw error;
        if (attempt >= retries) throw error;
        await new Promise(r => setTimeout(r, (attempt + 1) * 3000));
      }
    }
    throw new ProviderError('Agnes Video query failed after retries', 'agnes');
  },

  async downloadVideo(taskId: string, outputPath: string): Promise<string> {
    const result = await this.queryVideoTask!(taskId);
    if (result.status !== 'completed' || !result.url) {
      throw new ProviderError(`Video task ${taskId} not completed. Status: ${result.status}`, 'agnes');
    }
    return downloadFile(result.url, outputPath);
  },
};
