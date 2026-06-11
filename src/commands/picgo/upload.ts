import type { Command, Config, Flags } from '../../types/cli';
import { uploadImage } from '../../sdk/picgo';
import { json } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';

export const uploadCommand: Command = {
  name: 'upload',
  description: 'Upload image to GitHub',
  usage: 'laoli picgo upload --input <path> [options]',
  options: [
    { flag: '--input <path>', description: 'Image file path', required: true },
    { flag: '--batch', description: 'Batch upload', type: 'boolean' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
  ],
  examples: [
    'laoli picgo upload --input image.png',
    'laoli picgo upload --input ./images/ --batch',
    'laoli picgo upload --input image.png --json',
  ],
  execute: async (config: Config, flags: Flags) => {
    const input = flags.input as string;
    
    if (!input) {
      throw new CLIError('Missing required argument: --input', ExitCode.INVALID_ARGS);
    }
    
    const batch = flags.batch as boolean;
    const isJson = flags.json as boolean;
    const isQuiet = flags.quiet as boolean || config.display.quiet;
    
    try {
      const results = await uploadImage({
        input,
        batch,
      });
      
      if (isJson) {
        json(results);
      } else if (!isQuiet) {
        console.log('\nUpload Results:\n');
        for (const result of results) {
          console.log(`  ${result.originalPath}`);
          console.log(`    → ${result.url}`);
          console.log('');
        }
        console.log(`✓ Uploaded ${results.length} image(s)`);
      }
    } catch (error) {
      throw new CLIError(
        `Image upload failed: ${error instanceof Error ? error.message : String(error)}`,
        ExitCode.PROVIDER_ERROR
      );
    }
  },
};
