import type { Command, Config, Flags } from '../../types/cli';
import { downloadVideo } from '../../sdk/video';
import { success, json, info } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';

export const downloadCommand: Command = {
  name: 'download',
  description: 'Download completed video',
  usage: 'laoli video download --task-id <id> --output <path>',
  options: [
    { flag: '--task-id <id>', description: 'Task ID', required: true },
    { flag: '--output <path>', description: 'Output file path', required: true },
    { flag: '--provider <name>', description: 'Provider: apimart, tuzi, agnes' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
    { flag: '--quiet', description: 'Suppress non-essential output', type: 'boolean' },
  ],
  examples: [
    'laoli video download --task-id 12345 --output video.mp4',
  ],
  execute: async (config: Config, flags: Flags) => {
    const taskId = flags['task-id'] as string;
    const output = flags.output as string;
    
    if (!taskId) {
      throw new CLIError('Missing required argument: --task-id', ExitCode.INVALID_ARGS);
    }
    if (!output) {
      throw new CLIError('Missing required argument: --output', ExitCode.INVALID_ARGS);
    }
    
    const providerName = (flags.provider as string) || config.video.defaultProvider || 'apimart';
    const isJson = flags.json as boolean;
    const isQuiet = flags.quiet as boolean || config.output.quiet;
    
    try {
      if (!isQuiet) {
        info('Downloading video...');
      }
      
      const outputPath = await downloadVideo(taskId, output, providerName);
      
      if (isJson) {
        json({ taskId, outputPath });
      } else if (!isQuiet) {
        success(`Video saved to ${outputPath}`);
      }
    } catch (error) {
      throw new CLIError(
        `Failed to download video: ${error instanceof Error ? error.message : String(error)}`,
        ExitCode.PROVIDER_ERROR
      );
    }
  },
};
