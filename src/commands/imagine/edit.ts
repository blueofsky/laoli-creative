import type { Command, Config, Flags } from '../../types/cli';
import { editImage } from '../../sdk/imagine';
import { success, json } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';

export const editCommand: Command = {
  name: 'edit',
  description: 'Edit images using AI',
  usage: 'laoli imagine edit --input <path> --prompt <text> --output <path> [options]',
  options: [
    { flag: '--input <path>', description: 'Input image path', required: true },
    { flag: '--prompt <text>', description: 'Edit description', required: true },
    { flag: '--output <path>', description: 'Output file path', required: true },
    { flag: '--provider <name>', description: 'Provider: agnes, apimart, tuzi' },
    { flag: '--model <id>', description: 'Model ID' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
    { flag: '--quiet', description: 'Suppress non-essential output', type: 'boolean' },
  ],
  examples: [
    'laoli imagine edit --input cat.png --prompt "Add a hat" --output cat-hat.png',
    'laoli imagine edit --input photo.jpg --prompt "Make it watercolor" --output watercolor.png',
  ],
  execute: async (config: Config, flags: Flags) => {
    const input = flags.input as string;
    const prompt = flags.prompt as string;
    const output = flags.output as string;
    
    if (!input) {
      throw new CLIError('Missing required argument: --input', ExitCode.INVALID_ARGS);
    }
    if (!prompt) {
      throw new CLIError('Missing required argument: --prompt', ExitCode.INVALID_ARGS);
    }
    if (!output) {
      throw new CLIError('Missing required argument: --output', ExitCode.INVALID_ARGS);
    }
    
    const provider = (flags.provider as string) || config.imagine.defaultProvider || config.defaultProvider;
    const model = (flags.model as string) || config.imagine.defaultModel;
    const isJson = flags.json as boolean;
    const isQuiet = flags.quiet as boolean || config.output.quiet;
    
    try {
      const result = await editImage({
        inputPath: input,
        prompt,
        outputPath: output,
        provider,
        model,
      });
      
      if (isJson) {
        json(result);
      } else if (!isQuiet) {
        success(`Image saved to ${result.outputPath}`);
      }
    } catch (error) {
      throw new CLIError(
        `Image editing failed: ${error instanceof Error ? error.message : String(error)}`,
        ExitCode.PROVIDER_ERROR
      );
    }
  },
};
