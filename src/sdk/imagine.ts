import { getProvider } from '../providers';
import type { ImageParams, ImageResult, BatchImageParams, BatchImageResult } from '../types/sdk';

export async function generateImage(params: ImageParams): Promise<ImageResult> {
  const provider = getProvider(params.provider || 'agnes');
  return provider.generateImage(params);
}

export async function editImage(params: EditImageParams): Promise<ImageResult> {
  const provider = getProvider(params.provider || 'agnes');
  return provider.editImage(params);
}

export async function batchGenerateImages(params: BatchImageParams): Promise<BatchImageResult[]> {
  const provider = getProvider(params.provider || 'agnes');
  return provider.batchGenerateImages(params);
}

export interface EditImageParams {
  inputPath: string;
  prompt: string;
  outputPath: string;
  provider?: string;
  model?: string;
}
