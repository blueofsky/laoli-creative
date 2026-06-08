import type { Command, Config, Flags } from '../../types/cli';
import { saveConfig } from '../../config/loader';
import { success } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';

export const setCommand: Command = {
  name: 'set',
  description: 'Set configuration value',
  usage: 'laoli config set --key <key> --value <value>',
  options: [
    { flag: '--key <key>', description: 'Configuration key (e.g., imagine.defaultProvider)', required: true },
    { flag: '--value <value>', description: 'Configuration value', required: true },
  ],
  examples: [
    'laoli config set --key imagine.defaultProvider --value agnes',
    'laoli config set --key tts.defaultVoice --value 冰糖',
    'laoli config set --key output.quiet --value true',
  ],
  execute: async (_config: Config, flags: Flags) => {
    const key = flags.key as string;
    const value = flags.value as string;

    if (!key) throw new CLIError('Missing required argument: --key', ExitCode.INVALID_ARGS);
    if (!value) throw new CLIError('Missing required argument: --value', ExitCode.INVALID_ARGS);

    const parts = key.split('.');
    if (parts.length < 2) {
      throw new CLIError('Key must be in format: section.key (e.g., imagine.defaultProvider)', ExitCode.INVALID_ARGS);
    }

    const configUpdate: any = {};
    let current = configUpdate;

    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = {};
      current = current[parts[i]];
    }

    let parsedValue: any = value;
    if (value === 'true') parsedValue = true;
    else if (value === 'false') parsedValue = false;
    else if (/^\d+$/.test(value)) parsedValue = parseInt(value, 10);
    else if (/^\d+\.\d+$/.test(value)) parsedValue = parseFloat(value);

    current[parts[parts.length - 1]] = parsedValue;
    saveConfig(configUpdate);
    success(`Configuration updated: ${key} = ${value}`);
  },
};
