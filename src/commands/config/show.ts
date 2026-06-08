import type { Command, Config, Flags } from '../../types/cli';
import { loadConfig } from '../../config/loader';
import { json } from '../../utils/logger';

export const showCommand: Command = {
  name: 'show',
  description: 'Show current configuration',
  usage: 'laoli config show [--section <name>]',
  options: [
    { flag: '--section <name>', description: 'Show specific section' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
  ],
  examples: [
    'laoli config show',
    'laoli config show --section imagine',
    'laoli config show --json',
  ],
  execute: async (config: Config, flags: Flags) => {
    const section = flags.section as string;
    const isJson = flags.json as boolean;
    
    let displayConfig: any = config;
    
    if (section) {
      const sectionKey = section as keyof Config;
      if (config[sectionKey]) {
        displayConfig = { [section]: config[sectionKey] };
      } else {
        console.error(`Section "${section}" not found in configuration`);
        process.exit(1);
      }
    }
    
    if (isJson) {
      json(displayConfig);
    } else {
      console.log('\nCurrent Configuration:\n');
      console.log(JSON.stringify(displayConfig, null, 2));
      console.log('');
    }
  },
};
