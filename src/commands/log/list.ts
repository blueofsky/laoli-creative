import type { Command, Config, Flags } from '../../types/cli';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { info, json } from '../../utils/logger';

const LOG_DIR = join(homedir(), '.laoli', 'logs');

export const listCommand: Command = {
  name: 'list',
  description: 'List available log files',
  usage: 'laoli log list [--json]',
  options: [
    { flag: '--json', description: 'JSON output', type: 'boolean' },
  ],
  examples: ['laoli log list', 'laoli log list --json'],
  execute: async (_config: Config, flags: Flags) => {
    const isJson = flags.json as boolean;

    if (!existsSync(LOG_DIR)) {
      info('No log files found. Log directory does not exist yet.');
      return;
    }

    const files = readdirSync(LOG_DIR)
      .filter(f => f.endsWith('.log'))
      .map(f => {
        const stat = statSync(join(LOG_DIR, f));
        return {
          name: f,
          size: stat.size,
          sizeHuman: formatSize(stat.size),
          modified: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) => b.modified.localeCompare(a.modified));

    if (files.length === 0) {
      info('No log files found.');
      return;
    }

    if (isJson) {
      json(files);
    } else {
      console.log('\nAvailable Log Files:\n');
      for (const f of files) {
        const date = f.name === 'laoli.log'
          ? 'today'
          : f.name.replace(/^laoli\./, '').replace(/\.log$/, '');
        const icon = date === 'today' ? '▶' : ' ';
        console.log(`  ${icon} ${date.padEnd(14)} ${f.sizeHuman.padStart(8)}  ${f.name}`);
      }
      console.log('');
    }
  },
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
