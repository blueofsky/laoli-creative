import type { Command, Config, Flags } from '../../types/cli';
import { readFileSync, existsSync } from 'fs';
import { generateVideo, waitForVideoCompletion, downloadVideo } from '../../sdk/video';
import { push } from '../../sdk/queue';
import { success, json, info } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';

export const batchCommand: Command = {
  name: 'batch',
  description: 'Batch generate videos from JSON file',
  usage: 'laoli video batch --batchfile <path> [options]',
  options: [
    { flag: '--batchfile <path>', description: 'JSON batch file path', required: true },
    { flag: '--jobs <count>', description: 'Number of concurrent jobs', type: 'number' },
    { flag: '--async', description: 'Submit all tasks without waiting', type: 'boolean' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
    { flag: '--quiet', description: 'Suppress non-essential output', type: 'boolean' },
  ],
  examples: [
    'laoli video batch --batchfile batch.json',
    'laoli video batch --batchfile batch.json --jobs 2',
    'laoli video batch --batchfile batch.json --async',
  ],
  execute: async (config: Config, flags: Flags) => {
    const batchfile = flags.batchfile as string;
    if (!batchfile) throw new CLIError('Missing required argument: --batchfile', ExitCode.INVALID_ARGS);
    if (!existsSync(batchfile)) throw new CLIError(`Batch file not found: ${batchfile}`, ExitCode.INVALID_ARGS);

    const batchItems: any[] = JSON.parse(readFileSync(batchfile, 'utf-8'));
    if (!Array.isArray(batchItems)) throw new CLIError('Batch file must contain a JSON array', ExitCode.INVALID_ARGS);

    const jobs = flags.jobs ? parseInt(flags.jobs as string, 10) : 2;
    const isAsync = flags.async as boolean;
    const isJson = flags.json as boolean;
    const isQuiet = flags.quiet as boolean || config.display.quiet;

    if (!isQuiet) info(`Starting batch video generation (${batchItems.length} tasks)...`);

    const results: Array<{ taskId: string; outputPath: string; status: string }> = [];

    for (let i = 0; i < batchItems.length; i += jobs) {
      const chunk = batchItems.slice(i, i + jobs);
      const chunkResults = await Promise.all(
        chunk.map(async (item: any) => {
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

          if (isAsync) {
            push({ taskId: result.taskId, provider: providerName, outputPath: item.output, prompt: item.prompt.slice(0, 50) });
            return { taskId: result.taskId, outputPath: item.output, status: 'submitted' };
          }

          const completed = await waitForVideoCompletion(result.taskId, providerName);
          if (completed.status === 'completed' && completed.url) {
            await downloadVideo(result.taskId, item.output, providerName);
            return { taskId: result.taskId, outputPath: item.output, status: 'completed' };
          }
          return { taskId: result.taskId, outputPath: item.output, status: 'failed' };
        })
      );
      results.push(...chunkResults);
    }

    if (isJson) {
      json(results);
    } else if (!isQuiet) {
      const done = results.filter(r => r.status === 'completed').length;
      const submitted = results.filter(r => r.status === 'submitted').length;
      success(`Batch completed: ${done} done, ${submitted} async, ${results.length - done - submitted} failed`);
      for (const r of results) {
        const icon = r.status === 'completed' ? '✓' : r.status === 'submitted' ? '⏳' : '✗';
        info(`  ${icon} ${r.outputPath}`);
      }
    }
  },
};
