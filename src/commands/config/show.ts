import type { Command, Config, Flags } from '../../types/cli';
import { json } from '../../utils/logger';
import { getValueByPath } from '../../utils/object';

export const showCommand: Command = {
  name: 'show',
  description: 'Show current configuration',
  usage: 'laoli config show [--section <name>]',
  options: [
    { flag: '--section <name>', description: 'Show specific section (supports dot notation, e.g. recipe.schema)' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
  ],
  examples: [
    'laoli config show',
    'laoli config show --section image',
    'laoli config show --section recipe.schema',
    'laoli config show --json',
  ],
  execute: async (config: Config, flags: Flags) => {
    const section = flags.section as string;
    const isJson = flags.json as boolean;

    let displayConfig: any = config;

    if (section) {
      const value = getValueByPath(config, section);
      if (value === undefined) {
        console.error(`Section "${section}" not found in configuration`);
        process.exit(1);
      }
      displayConfig = { [section]: value };
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
