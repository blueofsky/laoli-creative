import type { Command, Config, Flags } from '../../types/cli';
import { generateImage } from '../../sdk/image';
import { success, json } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';

export const generateCommand: Command = {
  name: 'generate',
  description: 'Generate images using AI',
  usage: 'laoli image generate --prompt <text> --output <path> [options]',
  options: [
    { flag: '--prompt <text>', description: 'Image description', required: true },
    { flag: '--output <path>', description: 'Output file path', required: true },
    { flag: '--provider <name>', description: 'Provider: agnes, apimart, tuzi. Default from config' },
    { flag: '--model <id>', description: 'Model ID (e.g. gpt-image-2, agnes-image-2.1-flash). Default from config' },
    { flag: '--aspect-ratio <ratio>', description: 'Aspect ratio (e.g., 16:9, 1:1). Default from config' },
    { flag: '--size <WxH>', description: 'Image size (e.g., 1024x1024)' },

    { flag: '--quality <level>', description: 'Quality: normal, 2k. Default 2k' },
    { flag: '--ref <files...>', description: 'Reference images' },
    { flag: '--n <count>', description: 'Number of images. Default 1', type: 'number' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
    { flag: '--quiet', description: 'Suppress non-essential output', type: 'boolean' },
  ],
  examples: [
    'laoli image generate --prompt "A cat" --output cat.png',
    'laoli image generate --prompt "A landscape" --aspect-ratio 16:9 --output landscape.png',
    'laoli image generate --prompt "A cat" --provider agnes --output cat.png',
    'laoli image generate --prompt "A cat" --output cat.png --json',
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
    
    const provider = (flags.provider as string) || config.imagine.defaultProvider || config.defaultProvider;
    const model = (flags.model as string) || config.imagine.defaultModel;
    const aspectRatio = (flags['aspect-ratio'] as string) || config.imagine.defaultAspectRatio;
    const size = flags.size as string;
    const quality = (flags.quality as string) || config.imagine.defaultQuality || '2k';
    const ref = flags.ref as string[] | undefined;
    const n = flags.n ? parseInt(flags.n as string, 10) : undefined;
    const isJson = flags.json as boolean;
    const isQuiet = flags.quiet as boolean || config.display.quiet;
    
    try {
      const result = await generateImage({
        prompt,
        outputPath: output,
        provider,
        model,
        aspectRatio,
        size,
        quality,
        refImages: ref,
        n,
      });
      
      if (isJson) {
        json(result);
      } else if (!isQuiet) {
        success(`Image saved to ${result.outputPath}`);
      }
    } catch (error) {
      throw new CLIError(
        `Image generation failed: ${error instanceof Error ? error.message : String(error)}`,
        ExitCode.PROVIDER_ERROR
      );
    }
  },
};
