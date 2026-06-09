import type { Command, Config, Flags } from '../../types/cli';
import { getProvider } from '../../providers';
import { CLIError, ExitCode } from '../../errors/codes';
import { uploadImage } from '../../sdk/picgo';

export const visionImageCommand: Command = {
  name: 'image',
  description: 'Analyze and understand image content',
  usage: 'laoli vision image --input <path> --prompt <text> [options]',
  options: [
    { flag: '--input <path>', description: 'Image file path or URL', required: true },
    { flag: '--prompt <text>', description: 'Question or instruction about the image', required: true },
    { flag: '--provider <name>', description: 'Vision provider (default: mimo)' },
    { flag: '--model <id>', description: 'Model ID (default: mimo-v2.5)' },
    { flag: '--upload', description: 'Upload local file to GitHub first for a public URL', type: 'boolean' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
  ],
  examples: [
    'laoli vision image --input photo.jpg --prompt "What is in this image?"',
    'laoli vision image --input photo.jpg --prompt "描述" --upload',
    'laoli vision image --input https://example.com/photo.png --prompt "Describe" --json',
  ],
  execute: async (config: Config, flags: Flags) => {
    let input = flags.input as string;
    const prompt = flags.prompt as string;
    const providerName = (flags.provider as string) || config.vision?.defaultProvider || 'mimo';
    const model = flags.model as string || config.vision?.defaultModel;
    const doUpload = flags.upload as boolean;
    const isJson = flags.json as boolean;

    if (!input) throw new CLIError('Missing required argument: --input', ExitCode.INVALID_ARGS);
    if (!prompt) throw new CLIError('Missing required argument: --prompt', ExitCode.INVALID_ARGS);

    // 上传本地文件到 GitHub 获取公网 URL
    if (doUpload && !input.startsWith('http://') && !input.startsWith('https://')) {
      const results = await uploadImage({ input });
      if (results.length === 0) throw new CLIError('Failed to upload image', ExitCode.FILE_ERROR);
      input = results[0].url;
      console.error(`  Uploaded: ${input}`);
    }

    const provider = getProvider(providerName);
    if (!provider.understandImage) {
      throw new CLIError(`Provider "${providerName}" does not support image understanding`, ExitCode.PROVIDER_ERROR);
    }

    const result = await provider.understandImage({ input, prompt, model });

    if (isJson) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`\n${result.content}\n`);
    }
  },
};
