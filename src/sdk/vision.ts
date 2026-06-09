import type { VisionImageParams, VisionVideoParams, VisionResult } from '../types/sdk';
import { getProvider } from '../providers';
import { CLIError, ExitCode } from '../errors/codes';

export async function understandImage(params: VisionImageParams): Promise<VisionResult> {
  const provider = getProvider(params.provider || 'mimo');
  if (!provider.understandImage) {
    throw new CLIError(`Provider "${provider.name}" does not support image understanding`, ExitCode.PROVIDER_ERROR);
  }
  return provider.understandImage(params);
}

export async function understandVideo(params: VisionVideoParams): Promise<VisionResult> {
  const provider = getProvider(params.provider || 'mimo');
  if (!provider.understandVideo) {
    throw new CLIError(`Provider "${provider.name}" does not support video understanding`, ExitCode.PROVIDER_ERROR);
  }
  return provider.understandVideo(params);
}
