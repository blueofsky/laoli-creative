import { readFileSync, existsSync } from 'fs';
import { getProvider } from '../providers';
import type { ImageParams, ImageResult, BatchImageParams, BatchImageResult } from '../types/sdk';
import { ProviderError } from '../errors/codes';

export async function generateImage(params: ImageParams): Promise<ImageResult> {
  const provider = getProvider(params.provider || 'agnes');
  return provider.generateImage(params);
}

export async function editImage(params: EditImageParams): Promise<ImageResult> {
  const provider = getProvider(params.provider || 'agnes');
  return provider.editImage(params);
}

export async function batchGenerateImages(params: BatchImageParams): Promise<BatchImageResult[]> {
  if (!existsSync(params.batchFile)) {
    throw new ProviderError(`Batch file not found: ${params.batchFile}`, 'batch');
  }

  const batchItems: any[] = JSON.parse(readFileSync(params.batchFile, 'utf-8'));
  if (!Array.isArray(batchItems)) {
    throw new ProviderError('Batch file must contain a JSON array', 'batch');
  }

  const results: BatchImageResult[] = [];
  const concurrency = params.jobs || 4;

  for (let i = 0; i < batchItems.length; i += concurrency) {
    const chunk = batchItems.slice(i, i + concurrency);
    const chunkResults = await Promise.all(
      chunk.map(async (item: any) => {
        const provider = getProvider(item.provider || params.provider || 'agnes');
        const result = await provider.generateImage({
          prompt: item.prompt,
          outputPath: item.output,
          model: item.model,
          aspectRatio: item.aspectRatio,
          size: item.size,
          quality: item.quality,
          provider: item.provider || params.provider,
          refImages: item.ref,
          n: item.n,
        });
        return { url: result.url, outputPath: result.outputPath, metadata: result.metadata };
      })
    );
    results.push(...chunkResults);
  }

  return results;
}

export interface EditImageParams {
  inputPath: string;
  prompt: string;
  outputPath: string;
  provider?: string;
  model?: string;
}
