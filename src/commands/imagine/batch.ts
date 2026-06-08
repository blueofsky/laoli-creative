import type { Command, Config, Flags } from '../../types/cli';
import { batchGenerateImages } from '../../sdk/imagine';
import { success, json, info } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';

export const batchCommand: Command = {
  name: 'batch',
  description: 'Batch generate images from JSON file',
  usage: 'laoli imagine batch --batchfile <path> [options]',
  options: [
    { flag: '--batchfile <path>', description: 'JSON batch file path', required: true },
    { flag: '--jobs <count>', description: 'Number of concurrent jobs', type: 'number' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
    { flag: '--quiet', description: 'Suppress non-essential output', type: 'boolean' },
  ],
  examples: [
    'laoli imagine batch --batchfile batch.json',
    'laoli imagine batch --batchfile batch.json --jobs 4',
  ],
  execute: async (config: Config, flags: Flags) => {
    const batchfile = flags.batchfile as string;
    
    if (!batchfile) {
      throw new CLIError('Missing required argument: --batchfile', ExitCode.INVALID_ARGS);
    }
    
    const jobs = flags.jobs ? parseInt(flags.jobs as string, 10) : undefined;
    const isJson = flags.json as boolean;
    const isQuiet = flags.quiet as boolean || config.display.quiet;
    
    try {
      if (!isQuiet) {
        info('Starting batch image generation...');
      }
      
      const results = await batchGenerateImages({
        batchFile: batchfile,
        jobs,
      });
      
      if (isJson) {
        json(results);
      } else if (!isQuiet) {
        success(`Batch generation completed: ${results.length} images generated`);
        results.forEach((result, index) => {
          info(`  ${index + 1}. ${result.outputPath}`);
        });
      }
    } catch (error) {
      throw new CLIError(
        `Batch generation failed: ${error instanceof Error ? error.message : String(error)}`,
        ExitCode.PROVIDER_ERROR
      );
    }
  },
};
