import type { Command, Config, Flags } from '../../types/cli';
import { history } from '../../sdk/queue';
import { info } from '../../utils/logger';

export const historyCommand: Command = {
  name: 'history',
  description: 'Show completed/failed video task history',
  usage: 'laoli video history [--limit <n>]',
  options: [
    { flag: '--limit <n>', description: 'Number of recent records', type: 'number' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
  ],
  examples: ['laoli video history', 'laoli video history --limit 5', 'laoli video history --json'],
  execute: async (_config: Config, flags: Flags) => {
    const limit = flags.limit ? parseInt(flags.limit as string, 10) : 20;
    const isJson = flags.json as boolean;

    const records = history(limit);
    if (records.length === 0) {
      info('No video task history.');
      return;
    }

    if (isJson) {
      console.log(JSON.stringify(records, null, 2));
    } else {
      console.log('\nVideo Task History (recent):\n');
      for (const r of records) {
        const icon = r.status === 'completed' ? '✓' : '✗';
        const prompt = r.prompt.length > 40 ? r.prompt.slice(0, 40) + '...' : r.prompt;
        const cost = r.costMs ? ` (${(r.costMs / 1000).toFixed(0)}s)` : '';
        console.log(`  ${icon} ${r.status.padEnd(10)} ${prompt}${cost}`);
        console.log(`     ${r.outputPath}`);
        if (r.error) console.log(`     error: ${r.error}`);
      }
      console.log('');
    }
  },
};
