import type { CaptionParams, CaptionResult } from '../types/sdk';
import { getProvider } from '../providers';
import { CLIError, ExitCode } from '../errors/codes';

export async function transcribeAudio(params: CaptionParams): Promise<CaptionResult> {
  const provider = getProvider(params.provider || 'mimo');
  if (!provider.transcribeAudio) {
    throw new CLIError(`Provider "${provider.name}" does not support speech recognition`, ExitCode.PROVIDER_ERROR);
  }
  return provider.transcribeAudio(params);
}
