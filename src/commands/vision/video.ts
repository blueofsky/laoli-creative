import type { Command, Config, Flags } from '../../types/cli';
import { getProvider } from '../../providers';
import { CLIError, ExitCode } from '../../errors/codes';

export const visionVideoCommand: Command = {
  name: 'video',
  description: 'Analyze and understand video content',
  usage: 'laoli vision video --input <path> --prompt <text> [options]',
  options: [
    { flag: '--input <path>', description: 'Video file path or URL', required: true },
    { flag: '--prompt <text>', description: 'Question or instruction about the video', required: true },
    { flag: '--provider <name>', description: 'Vision provider (default: mimo)' },
    { flag: '--model <id>', description: 'Model ID (default: mimo-v2.5)' },
    { flag: '--fps <n>', description: 'Frames per second for video sampling (0.1~10, default: 2)', type: 'string' },
    { flag: '--media-resolution <mode>', description: 'Resolution mode: default or max' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
  ],
  examples: [
    'laoli vision video --input video.mp4 --prompt "Describe this video"',
    'laoli vision video --input video.mp4 --prompt "What objects appear?" --fps 1 --json',
  ],
  execute: async (config: Config, flags: Flags) => {
    const input = flags.input as string;
    const prompt = flags.prompt as string;
    const providerName = (flags.provider as string) || config.vision?.defaultProvider || 'mimo';
    const model = flags.model as string || config.vision?.defaultModel;
    const fps = flags.fps ? parseFloat(flags.fps as string) : undefined;
    const mediaResolution = flags['media-resolution'] as 'default' | 'max' | undefined;
    const isJson = flags.json as boolean;

    if (!input) throw new CLIError('Missing required argument: --input', ExitCode.INVALID_ARGS);
    if (!prompt) throw new CLIError('Missing required argument: --prompt', ExitCode.INVALID_ARGS);

    const provider = getProvider(providerName);
    if (!provider.understandVideo) {
      throw new CLIError(`Provider "${providerName}" does not support video understanding`, ExitCode.PROVIDER_ERROR);
    }

    const result = await provider.understandVideo({ input, prompt, model, fps, mediaResolution });

    if (isJson) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`\n${result.content}\n`);
    }
  },
};
