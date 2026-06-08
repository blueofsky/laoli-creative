import type { Command, Config, Flags } from '../../types/cli';
import { list } from '../../sdk/queue';
import { json, info } from '../../utils/logger';

export const listCommand: Command = {
  name: 'list',
  description: 'List pending video generation tasks',
  usage: 'laoli video list [--limit <n>] [--json]',
  options: [
    { flag: '--limit <n>', description: 'Number of recent records', type: 'number' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
  ],
  examples: ['laoli video list', 'laoli video list --limit 5', 'laoli video list --json'],
  execute: async (_config: Config, flags: Flags) => {
    const tasks = list();
    const active = tasks.filter(t => t.status === 'pending' || t.status === 'processing');
    const isJson = flags.json as boolean;
    const limit = flags.limit ? parseInt(flags.limit as string, 10) : active.length;

    const shown = active.slice(-limit);

    if (isJson) {
      json(shown);
      return;
    }

    if (shown.length === 0) {
      info('No pending video tasks.');
      return;
    }

    console.log('\nVideo Tasks (pending):\n');
    for (const t of shown) {
      const prompt = t.prompt.length > 40 ? t.prompt.slice(0, 40) + '...' : t.prompt;
      console.log(`  ⏳ ${t.status.padEnd(10)} ${t.taskId.slice(0, 30)}...  ${prompt}`);
      console.log(`     ${t.outputPath}`);
    }
    console.log('');
  },
};
