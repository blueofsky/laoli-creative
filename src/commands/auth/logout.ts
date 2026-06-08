import type { Command, Config, Flags } from '../../types/cli';
import { saveConfig } from '../../config/loader';
import { success } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';

export const logoutCommand: Command = {
  name: 'logout',
  description: 'Remove API key',
  usage: 'laoli auth logout [--provider <name>]',
  options: [
    { flag: '--provider <name>', description: 'Provider: agnes, apimart, tuzi, minimax' },
  ],
  examples: [
    'laoli auth logout',
    'laoli auth logout --provider agnes',
  ],
  execute: async (config: Config, flags: Flags) => {
    const provider = flags.provider as string;
    
    if (provider) {
      // 清除特定 provider 的 API key
      const configUpdate: any = {
        providers: {
          [provider]: {
            apiKey: '',
          },
        },
      };
      
      saveConfig(configUpdate);
      success(`API key removed for provider: ${provider}`);
    } else {
      // 清除所有 provider 的 API key
      const configUpdate: any = {
        providers: {
          agnes: { apiKey: '' },
          apimart: { apiKey: '' },
          tuzi: { apiKey: '' },
          minimax: { apiKey: '' },
        },
      };
      
      saveConfig(configUpdate);
      success('All API keys removed');
    }
  },
};
