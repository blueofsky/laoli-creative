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
    { flag: '--mode <mode>', description: 'Local file transfer mode: base64 (default) or url (upload to GitHub)' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
  ],
  examples: [
    'laoli vision image --input photo.jpg --prompt "What is in this image?"',
    'laoli vision image --input large.jpg --prompt "描述" --mode url',
    'laoli vision image --input https://example.com/photo.png --prompt "Describe" --json',
  ],
  execute: async (config: Config, flags: Flags) => {
    let input = flags.input as string;
    const prompt = flags.prompt as string;
    const providerName = (flags.provider as string) || config.vision?.defaultProvider || 'mimo';
    const model = flags.model as string || config.vision?.defaultModel;
    const mode = (flags.mode as string) || config.vision?.defaultMode || 'base64';
    const isJson = flags.json as boolean;

    if (!input) throw new CLIError('Missing required argument: --input', ExitCode.INVALID_ARGS);
    if (!prompt) throw new CLIError('Missing required argument: --prompt', ExitCode.INVALID_ARGS);

    // URL 模式：先将本地文件上传到 GitHub 获取公网 URL
    if (mode === 'url' && !input.startsWith('http://') && !input.startsWith('https://')) {
      const results = await uploadImage({ input });
      if (results.length === 0) throw new CLIError('Failed to upload image', ExitCode.FILE_ERROR);
      console.error(`  Uploaded: ${results[0].url}`);
      input = results[0].url;
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
