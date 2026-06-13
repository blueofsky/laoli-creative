import { readFileSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { getProvider } from '../providers';
import type { ImageParams, ImageResult, BatchImageParams, BatchImageResult } from '../types/sdk';
import { ProviderError } from '../errors/codes';

function resolveItemPrompt(item: any, batchDir: string): string {
  if (item.prompt) return item.prompt;
  if (item.prompt_file) {
    const filePath = resolve(batchDir, item.prompt_file);
    if (!existsSync(filePath)) {
      throw new ProviderError(`prompt_file not found: ${filePath}`, 'batch');
    }
    return readFileSync(filePath, 'utf-8').trim();
  }
  throw new ProviderError(
    'Batch item missing both "prompt" and "prompt_file" fields',
    'batch',
  );
}

export async function generateImage(params: ImageParams): Promise<ImageResult> {
  const provider = getProvider(params.provider || 'agnes');
  return provider.generateImage(params);
}

export async function batchGenerateImages(params: BatchImageParams): Promise<BatchImageResult[]> {
  if (!existsSync(params.batchFile)) {
    throw new ProviderError(`Batch file not found: ${params.batchFile}`, 'batch');
  }

  const batchDir = dirname(params.batchFile);
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
        const prompt = resolveItemPrompt(item, batchDir);
        const provider = getProvider(item.provider || params.provider || 'agnes');
        const result = await provider.generateImage({
          prompt,
          outputPath: item.output,
          model: item.model,
          aspectRatio: item.aspectRatio || item.aspect_ratio,
          size: item.size,
          quality: item.quality,
          provider: item.provider || params.provider,
          refImages: item.ref ? (Array.isArray(item.ref) ? item.ref : [item.ref]) : undefined,
          n: item.n,
        });
        return { url: result.url, outputPath: result.outputPath, metadata: result.metadata };
      })
    );
    results.push(...chunkResults);
  }

  return results;
}
