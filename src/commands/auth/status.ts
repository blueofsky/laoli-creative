import type { Command, Config, Flags } from '../../types/cli';
import { json } from '../../utils/logger';

export const statusCommand: Command = {
  name: 'status',
  description: 'Show authentication status',
  usage: 'laoli auth status [--json]',
  options: [
    { flag: '--json', description: 'JSON output', type: 'boolean' },
  ],
  examples: [
    'laoli auth status',
    'laoli auth status --json',
  ],
  execute: async (config: Config, flags: Flags) => {
    const isJson = flags.json as boolean;
    
    const status: Record<string, boolean> = {};
    
    for (const [name, provider] of Object.entries(config.providers)) {
      status[name] = !!provider.apiKey;
    }
    
    if (isJson) {
      json(status);
    } else {
      console.log('\nAuthentication Status:\n');
      for (const [name, authenticated] of Object.entries(status)) {
        const icon = authenticated ? '✓' : '✗';
        console.log(`  ${icon} ${name}`);
      }
      console.log('');
    }
  },
};
