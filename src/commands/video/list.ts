import type { Command, Config, Flags } from '../../types/cli';
import { list } from '../../sdk/queue';
import { info } from '../../utils/logger';

export const listCommand: Command = {
  name: 'list',
  description: 'List pending video generation tasks',
  usage: 'laoli video list',
  examples: ['laoli video list'],
  execute: async (_config: Config, _flags: Flags) => {
    const tasks = list();
    const active = tasks.filter(t => t.status === 'pending' || t.status === 'processing');

    if (active.length === 0) {
      info('No pending video tasks.');
      return;
    }

    console.log('\nVideo Tasks (pending):\n');
    for (const t of active) {
      const prompt = t.prompt.length > 40 ? t.prompt.slice(0, 40) + '...' : t.prompt;
      console.log(`  ⏳ ${t.status.padEnd(10)} ${t.taskId.slice(0, 30)}...  ${prompt}`);
      console.log(`     ${t.outputPath}`);
    }
    console.log('');
  },
};
