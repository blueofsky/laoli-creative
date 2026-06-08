import type { Provider, ImageParams, ImageResult, EditImageParams, BatchImageParams, BatchImageResult } from '../types/sdk';
import { ProviderError, NetworkError } from '../errors/codes';
import { readFileSync, existsSync } from 'fs';
import { getApiKey, aspectRatioToSize } from './shared';
import { downloadFile } from '../client/http';

const BASE_URL = 'https://apihub.agnes-ai.com/v1';

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

    if (params.refImages && params.refImages.length > 0) {
      requestBody.image = params.refImages[0];
    }

    try {
      const response = await fetch(`${BASE_URL}/images/generations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify(requestBody),
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

  async editImage(params: EditImageParams): Promise<ImageResult> {
    const apiKey = getApiKey('agnes');
    const model = params.model || 'agnes-image-2.1-flash';
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
        throw new ProviderError(
          `Agnes API error: ${err.error?.message || response.statusText}`,
          'agnes',
          response.status
        );
      }

      const data: any = await response.json();
      const url = data.data[0].url;
      const outputPath = await downloadFile(url, params.outputPath);

      return { url, outputPath, metadata: { provider: 'agnes', model } };
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
};
