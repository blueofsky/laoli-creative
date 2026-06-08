import type { Command, Config, Flags } from '../../types/cli';
import { list } from '../../sdk/queue';
import { json, info } from '../../utils/logger';

export const listCommand: Command = {
  name: 'list',
  description: 'List video generation tasks',
  usage: 'laoli video list [--status <status>]',
  options: [
    { flag: '--status <status>', description: 'Filter: pending, processing, completed, failed' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
  ],
  examples: [
    'laoli video list',
    'laoli video list --status processing',
    'laoli video list --json',
  ],
  execute: async (_config: Config, flags: Flags) => {
    const filter = flags.status as string | undefined;
    const isJson = flags.json as boolean;

    const tasks = list(filter as any);
    if (tasks.length === 0) {
      info('No video tasks found.');
      return;
    }

    if (isJson) {
      json(tasks);
    } else {
      console.log('\nVideo Tasks:\n');
      for (const t of tasks) {
        const icon = t.status === 'completed' ? '✓' : t.status === 'failed' ? '✗' : '⏳';
        const prompt = t.prompt.length > 40 ? t.prompt.slice(0, 40) + '...' : t.prompt;
        console.log(`  ${icon} ${t.status.padEnd(10)} ${t.taskId.slice(0, 30)}...  ${prompt}`);
        console.log(`     ${t.outputPath}`);
      }
      console.log('');
    }
  },
};
