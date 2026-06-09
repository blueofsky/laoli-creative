import type { Command, Config, Flags } from '../../types/cli';
import { getProvider } from '../../providers';
import { success, json } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';
import type { MusicParams } from '../../types/sdk';

export const generateCommand: Command = {
  name: 'generate',
  description: 'Generate music (instrumental or with lyrics)',
  usage: 'laoli music --prompt <text> --output <path> [options]',
  options: [
    { flag: '--prompt <text>', description: 'Music description', required: true },
    { flag: '--output <path>', description: 'Output audio file path', required: true },
    { flag: '--provider <name>', description: 'Provider: minimax' },
    { flag: '--model <id>', description: 'Model ID' },
    { flag: '--lyrics <text>', description: 'Lyrics text' },
    { flag: '--instrumental', description: 'Generate instrumental music', type: 'boolean' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
    { flag: '--quiet', description: 'Suppress non-essential output', type: 'boolean' },
  ],
  examples: [
    'laoli music --prompt "Upbeat pop" --output song.mp3',
    'laoli music --prompt "Cinematic" --instrumental --output music.mp3',
    'laoli music --prompt "Pop song" --lyrics "[verse] La da dee" --output song.mp3',
  ],
  execute: async (config: Config, flags: Flags) => {
    const prompt = flags.prompt as string;
    const output = flags.output as string;
    
    if (!prompt) {
      throw new CLIError('Missing required argument: --prompt', ExitCode.INVALID_ARGS);
    }
    if (!output) {
      throw new CLIError('Missing required argument: --output', ExitCode.INVALID_ARGS);
    }
    
    const providerName = (flags.provider as string) || config.music.defaultProvider || 'minimax';
    const provider = getProvider(providerName);
    
    if (!provider.generateMusic) {
      throw new CLIError(`Provider "${providerName}" does not support music generation`, ExitCode.PROVIDER_ERROR);
    }
    
    const model = (flags.model as string) || config.music.defaultModel;
    const lyrics = flags.lyrics as string;
    const instrumental = flags.instrumental as boolean;
    const isJson = flags.json as boolean;
    const isQuiet = flags.quiet as boolean || config.display.quiet;
    
    try {
      const params: MusicParams = {
        prompt,
        outputPath: output,
        provider: providerName,
        model,
        lyrics,
        instrumental,
      };
      
      const result = await provider.generateMusic(params);
      
      if (isJson) {
        json(result);
      } else if (!isQuiet) {
        success(`Music saved to ${result.outputPath}`);
      }
    } catch (error) {
      throw new CLIError(
        `Music generation failed: ${error instanceof Error ? error.message : String(error)}`,
        ExitCode.PROVIDER_ERROR
      );
    }
  },
};
