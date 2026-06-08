import type { Command, Config, Flags } from '../../types/cli';
import { saveConfig } from '../../config/loader';
import { success, info } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';

export const loginCommand: Command = {
  name: 'login',
  description: 'Save API key to configuration',
  usage: 'laoli auth login --api-key <key> [--provider <name>]',
  options: [
    { flag: '--api-key <key>', description: 'API key' },
    { flag: '--provider <name>', description: 'Provider: agnes, apimart, tuzi, minimax' },
  ],
  examples: [
    'laoli auth login --api-key sk-xxxxx',
    'laoli auth login --api-key sk-xxxxx --provider agnes',
  ],
  execute: async (_config: Config, flags: Flags) => {
    const apiKey = flags['api-key'] as string;
    const provider = (flags.provider as string) || 'agnes';
    
    if (!apiKey) {
      throw new CLIError('Missing required argument: --api-key', ExitCode.INVALID_ARGS);
    }
    
    // 保存 API key 到配置
    const configUpdate: any = {
      providers: {
        [provider]: {
          apiKey: apiKey,
        },
      },
    };
    
    saveConfig(configUpdate);
    
    success(`API key saved for provider: ${provider}`);
    info('You can now use this provider in your commands.');
  },
};
