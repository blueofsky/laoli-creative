import type { Command, CommandGroup, Config, Flags } from '../../types/cli';
import { getProvider } from '../../providers';
import { CLIError, ExitCode } from '../../errors/codes';
import { uploadImage } from '../../sdk/picgo';
import { extname } from 'path';

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
const VIDEO_EXTS = ['.mp4', '.mov', '.avi', '.wmv'];

function detectMediaType(input: string): 'image' | 'video' {
  // URL 模式下尝试从路径提取扩展名
  const ext = extname(input.split('?')[0]).toLowerCase();
  if (IMAGE_EXTS.includes(ext)) return 'image';
  if (VIDEO_EXTS.includes(ext)) return 'video';
  throw new CLIError(
    `Unable to detect media type from "${input}". Supported: ${[...IMAGE_EXTS, ...VIDEO_EXTS].join(', ')}`,
    ExitCode.INVALID_ARGS
  );
}

export const visionCommand: Command = {
  name: 'vision',
  description: 'Analyze and understand image or video content (auto-detect type from file extension)',
  usage: 'laoli vision --input <path> --prompt <text> [options]',
  options: [
    { flag: '--input <path>', description: 'Image/video file path or URL', required: true },
    { flag: '--prompt <text>', description: 'Question or instruction about the media', required: true },
    { flag: '--provider <name>', description: 'Vision provider (default: mimo)' },
    { flag: '--model <id>', description: 'Model ID (default: mimo-v2.5)' },
    { flag: '--fps <n>', description: 'Video only: frames per second (0.1~10, default: 2)', type: 'string' },
    { flag: '--media-resolution <mode>', description: 'Video only: resolution mode: default or max' },
    { flag: '--mode <mode>', description: 'Local file transfer mode: base64 (default) or url (upload to GitHub)' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
  ],
  examples: [
    'laoli vision --input photo.jpg --prompt "What is in this image?"',
    'laoli vision --input video.mp4 --prompt "Describe this video"',
    'laoli vision --input large.jpg --prompt "描述" --mode url',
    'laoli vision --input video.mp4 --prompt "Describe" --fps 1 --json',
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

    // 自动检测媒体类型
    const mediaType = detectMediaType(input);

    // URL 模式：先将本地文件上传到 GitHub 获取公网 URL
    if (mode === 'url' && !input.startsWith('http://') && !input.startsWith('https://')) {
      const results = await uploadImage({ input });
      if (results.length === 0) throw new CLIError(`Failed to upload ${mediaType}`, ExitCode.FILE_ERROR);
      console.error(`  Uploaded: ${results[0].url}`);
      input = results[0].url;
    }

    const provider = getProvider(providerName);

    if (mediaType === 'image') {
      if (!provider.understandImage) {
        throw new CLIError(`Provider "${providerName}" does not support image understanding`, ExitCode.PROVIDER_ERROR);
      }
      const result = await provider.understandImage({ input, prompt, model });
      if (isJson) { console.log(JSON.stringify(result, null, 2)); }
      else { console.log(`\n${result.content}\n`); }
    } else {
      if (!provider.understandVideo) {
        throw new CLIError(`Provider "${providerName}" does not support video understanding`, ExitCode.PROVIDER_ERROR);
      }
      const fps = flags.fps ? parseFloat(flags.fps as string) : undefined;
      const mediaResolution = flags['media-resolution'] as 'default' | 'max' | undefined;
      const result = await provider.understandVideo({ input, prompt, model, fps, mediaResolution });
      if (isJson) { console.log(JSON.stringify(result, null, 2)); }
      else { console.log(`\n${result.content}\n`); }
    }
  },
};

export const visionCommands: CommandGroup = {
  name: 'vision',
  description: 'Image and video understanding (auto-detect type from file extension)',
  defaultCommand: 'vision',
  commands: [visionCommand],
};
