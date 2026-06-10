import type { Command, Config, Flags } from '../../types/cli';
import { json } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';
import { getValueByPath } from '../../utils/object';

export const getCommand: Command = {
  name: 'get',
  description: 'Get a specific configuration value',
  usage: 'laoli config get --key <key>',
  options: [
    { flag: '--key <key>', description: 'Configuration key (e.g., recipe.schema, image.defaultProvider)', required: true },
  ],
  examples: [
    'laoli config get --key recipe.schema',
    'laoli config get --key image.defaultProvider',
    'laoli config get --key version',
  ],
  execute: async (config: Config, flags: Flags) => {
    const key = flags.key as string;
    if (!key) throw new CLIError('Missing required argument: --key', ExitCode.INVALID_ARGS);

    const value = getValueByPath(config, key);
    if (value === undefined) {
      console.error(`Key "${key}" not found in configuration`);
      process.exit(1);
    }

    // 输出原始值：对象/数组用 JSON，基本类型直接输出字符串
    if (typeof value === 'object' && value !== null) {
      json(value);
    } else {
      console.log(String(value));
    }
  },
};
