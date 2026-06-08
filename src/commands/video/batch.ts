import type { Command, Config, Flags } from '../../types/cli';
import { readFileSync, existsSync } from 'fs';
import { generateVideo, queryVideoTask, downloadVideo } from '../../sdk/video';
import { push, update, list, archive } from '../../sdk/queue';
import { success, json, info } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';

export const batchCommand: Command = {
  name: 'batch',
  description: 'Batch generate videos from JSON file',
  usage: 'laoli video batch --batchfile <path> [options]',
  options: [
    { flag: '--batchfile <path>', description: 'JSON batch file path', required: true },
    { flag: '--async', description: 'Submit only, do not wait', type: 'boolean' },
    { flag: '--jobs <count>', description: 'Concurrent downloads. Default 2', type: 'number' },
    { flag: '--poll-interval <ms>', description: 'Poll interval (ms). Default 10000', type: 'number' },
    { flag: '--timeout <ms>', description: 'Per-task timeout (ms). Default 600000', type: 'number' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
    { flag: '--quiet', description: 'Suppress non-essential output', type: 'boolean' },
  ],
  examples: [
    'laoli video batch --batchfile batch.json',
    'laoli video batch --batchfile batch.json --jobs 4',
    'laoli video batch --batchfile batch.json --async',
  ],
  execute: async (config: Config, flags: Flags) => {
    const batchfile = flags.batchfile as string;
    if (!batchfile) throw new CLIError('Missing required argument: --batchfile', ExitCode.INVALID_ARGS);
    if (!existsSync(batchfile)) throw new CLIError(`Batch file not found: ${batchfile}`, ExitCode.INVALID_ARGS);

    const batchItems: any[] = JSON.parse(readFileSync(batchfile, 'utf-8'));
    if (!Array.isArray(batchItems)) throw new CLIError('Batch file must contain a JSON array', ExitCode.INVALID_ARGS);

    const isAsync = flags.async as boolean;
    const jobs = flags.jobs ? parseInt(flags.jobs as string, 10) : 2;
    const pollInterval = flags['poll-interval'] ? parseInt(flags['poll-interval'] as string, 10) : 10000;
    const taskTimeout = flags.timeout ? parseInt(flags.timeout as string, 10) : 600000; // 默认 10 分钟
    const isJson = flags.json as boolean;
    const isQuiet = flags.quiet as boolean || config.display.quiet;

    // 第一步：全量提交所有任务
    if (!isQuiet) info(`Submitting ${batchItems.length} video tasks...`);
    const results: Array<{ taskId: string; outputPath: string; status: string }> = [];

    await Promise.all(batchItems.map(async (item: any) => {
      const providerName = item.provider || config.video.defaultProvider || 'apimart';
      const params: any = {
        prompt: item.prompt,
        outputPath: item.output,
        provider: providerName,
        model: item.model || config.video.defaultModel,
        seconds: item.seconds || config.video.defaultSeconds,
        size: item.size,
        resolution: item.resolution || config.video.defaultResolution,
        refImages: item.ref,
      };
      const result = await generateVideo(params);
      push({ taskId: result.taskId, provider: providerName, outputPath: item.output, prompt: item.prompt.slice(0, 50) });
      results.push({ taskId: result.taskId, outputPath: item.output, status: 'submitted' });
    }));

    if (isAsync) {
      // 只提交不轮询
      if (isJson) {
        json(results);
      } else {
        const submitted = results.length;
        success(`All ${submitted} tasks submitted`);
        if (!isQuiet) {
          info(`Use: laoli video list`);
          info(`      laoli video download --task-id <id>`);
        }
      }
      return;
    }

    // 默认：自动轮询，完成一个下载一个
    if (!isQuiet) info('Polling and downloading...');
    const startTime = Date.now();
    const completed: string[] = [];

    while (true) {
      if (Date.now() - startTime > 3600000) {
        // 整批最多等 1 小时
        const remaining = list().length;
        throw new CLIError(`Batch timed out after 1h (${completed.length} done, ${remaining} remaining)`, ExitCode.TIMEOUT);
      }

      const pending = list().filter(t => t.status === 'pending' || t.status === 'processing');
      if (pending.length === 0) break;

      const chunk = pending.slice(0, jobs);
      await Promise.all(chunk.map(async (task) => {
        // 检查单任务超时
        const taskAge = Date.now() - new Date(task.createdAt).getTime();
        if (taskAge > taskTimeout) {
          archive(task.taskId, { status: 'failed', error: `Task timed out after ${Math.round(taskAge / 1000)}s` });
          if (!isQuiet) info(`Timed out: ${task.outputPath}`);
          return;
        }

        try {
          const status = await queryVideoTask(task.taskId, task.provider);
          if (status.status === 'completed' && status.url) {
            await downloadVideo(task.taskId, task.outputPath, task.provider);
            archive(task.taskId, { status: 'completed' });
            completed.push(task.outputPath);
            if (!isQuiet) success(`Downloaded ${task.outputPath}`);
          } else if (status.status === 'failed') {
            archive(task.taskId, { status: 'failed', error: status.metadata?.error || 'Unknown' });
            if (!isQuiet) info(`Failed: ${task.outputPath}`);
          } else {
            update(task.taskId, { status: 'processing' });
          }
        } catch (e) {
          // 网络错误跳过，下次继续
        }
      }));

      if (pending.length > 0) {
        await new Promise(r => setTimeout(r, pollInterval));
      }
    }

    // 输出结果
    if (isJson) {
      json(completed);
    } else {
      success(`Batch complete: ${completed.length}/${batchItems.length} downloaded`);
    }
  },
};
