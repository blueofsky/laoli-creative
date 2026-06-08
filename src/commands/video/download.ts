import type { Command, Config, Flags } from '../../types/cli';
import { queryVideoTask, downloadVideo } from '../../sdk/video';
import { update, get, remove } from '../../sdk/queue';
import { success, json, info } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';

export const downloadCommand: Command = {
  name: 'download',
  description: 'Query and download completed video',
  usage: 'laoli video download --task-id <id> [--output <path>]',
  options: [
    { flag: '--task-id <id>', description: 'Task ID (or use saved from --async)', required: true },
    { flag: '--output <path>', description: 'Output file path (override saved path)' },
    { flag: '--provider <name>', description: 'Provider: apimart, agnes, tuzi' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
  ],
  examples: [
    'laoli video download --task-id 12345',
    'laoli video download --task-id 12345 --output final.mp4',
  ],
  execute: async (config: Config, flags: Flags) => {
    const taskId = flags['task-id'] as string;
    if (!taskId) throw new CLIError('Missing required argument: --task-id', ExitCode.INVALID_ARGS);

    // 从队列读取已保存的路径和 provider
    const saved = get(taskId);
    const providerName = (flags.provider as string) || saved?.provider || config.video.defaultProvider || 'apimart';
    const output = (flags.output as string) || saved?.outputPath;
    if (!output) throw new CLIError('Missing required argument: --output', ExitCode.INVALID_ARGS);

    const isJson = flags.json as boolean;

    try {
      const result = await queryVideoTask(taskId, providerName);

      if (result.status === 'completed' && result.url) {
        // 任务完成，下载
        await downloadVideo(taskId, output, providerName);
        remove(taskId);

        if (isJson) {
          json({ ...result, outputPath: output });
        } else {
          success(`Video saved to ${output}`);
        }
      } else if (result.status === 'failed') {
        remove(taskId);
        throw new CLIError(`Video generation failed`, ExitCode.PROVIDER_ERROR);
      } else {
        // 还在处理中
        update(taskId, { status: 'processing' });
        if (isJson) {
          json({ taskId, status: result.status });
        } else {
          info(`Task ${taskId} is still ${result.status}. Check again later.`);
        }
      }
    } catch (error) {
      if (error instanceof CLIError) throw error;
      throw new CLIError(
        `Failed to download video: ${error instanceof Error ? error.message : String(error)}`,
        ExitCode.PROVIDER_ERROR
      );
    }
  },
};
