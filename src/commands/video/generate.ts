import type { Command, Config, Flags } from '../../types/cli';
import { generateVideo, waitForVideoCompletion, downloadVideo } from '../../sdk/video';
import { success, json, info } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';
import type { VideoParams } from '../../types/sdk';

export const generateCommand: Command = {
  name: 'generate',
  description: 'Generate video from text prompt',
  usage: 'laoli video generate --prompt <text> --output <path> [options]',
  options: [
    { flag: '--prompt <text>', description: 'Video description', required: true },
    { flag: '--output <path>', description: 'Output video file path', required: true },
    { flag: '--provider <name>', description: 'Provider: apimart, agnes, tuzi' },
    { flag: '--model <id>', description: 'Model ID' },
    { flag: '--seconds <n>', description: 'Video duration in seconds', type: 'number' },
    { flag: '--size <WxH>', description: 'Video size (e.g., 1280x720)' },
    { flag: '--resolution <p>', description: 'Resolution: 480p, 720p, 1080p, 4k' },
    { flag: '--ref <files...>', description: 'Reference images' },
    { flag: '--async', description: 'Return task ID immediately', type: 'boolean' },
    { flag: '--poll-interval <ms>', description: 'Poll interval in milliseconds', type: 'number' },
    { flag: '--timeout <ms>', description: 'Timeout in milliseconds', type: 'number' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
    { flag: '--quiet', description: 'Suppress non-essential output', type: 'boolean' },
  ],
  examples: [
    'laoli video generate --prompt "Ocean waves" --output ocean.mp4',
    'laoli video generate --prompt "Ocean waves" --seconds 10 --output ocean.mp4',
    'laoli video generate --prompt "Ocean waves" --async --output ocean.mp4',
    'laoli video generate --prompt "Ocean waves" --provider apimart --output ocean.mp4',
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
    
    const providerName = (flags.provider as string) || config.video.defaultProvider || 'apimart';
    const model = (flags.model as string) || config.video.defaultModel;
    const seconds = flags.seconds ? parseInt(flags.seconds as string, 10) : config.video.defaultSeconds;
    const size = flags.size as string;
    const resolution = (flags.resolution as string) || config.video.defaultResolution;
    const ref = flags.ref as string[] | undefined;
    const isAsync = flags.async as boolean;
    const pollInterval = flags['poll-interval'] ? parseInt(flags['poll-interval'] as string, 10) : undefined;
    const timeout = flags.timeout ? parseInt(flags.timeout as string, 10) : undefined;
    const isJson = flags.json as boolean;
    const isQuiet = flags.quiet as boolean || config.display.quiet;
    
    try {
      const params: VideoParams = {
        prompt,
        outputPath: output,
        provider: providerName,
        model,
        seconds,
        size,
        resolution,
        refImages: ref,
      };
      
      if (!isQuiet) {
        info('Starting video generation...');
      }
      
      // 提交视频生成任务
      const result = await generateVideo(params);
      
      // 如果是异步模式，记录到队列并返回任务 ID
      if (isAsync) {
        const { push } = await import('../../sdk/queue');
        push({ taskId: result.taskId, provider: providerName, outputPath: output, prompt: prompt.slice(0, 50) });
        if (isJson) {
          json(result);
        } else if (!isQuiet) {
          info(`Video generation started. Task ID: ${result.taskId}`);
          info(`Check status with: laoli video list`);
          info(`Download with: laoli video download --task-id ${result.taskId}`);
        }
        return;
      }
      
      // 等待完成
      if (!isQuiet) {
        info('Waiting for video generation to complete...');
      }
      
      const completedResult = await waitForVideoCompletion(result.taskId, providerName, {
        pollInterval,
        timeout,
      });
      
      if (completedResult.status === 'completed' && completedResult.url) {
        // 下载视频
        if (!isQuiet) {
          info('Downloading video...');
        }
        
        await downloadVideo(result.taskId, output, providerName);
        
        if (isJson) {
          json({ ...completedResult, outputPath: output });
        } else if (!isQuiet) {
          success(`Video saved to ${output}`);
        }
      } else {
        throw new CLIError(
          `Video generation failed: ${completedResult.metadata?.error || 'Unknown error'}`,
          ExitCode.PROVIDER_ERROR
        );
      }
    } catch (error) {
      throw new CLIError(
        `Video generation failed: ${error instanceof Error ? error.message : String(error)}`,
        ExitCode.PROVIDER_ERROR
      );
    }
  },
};
