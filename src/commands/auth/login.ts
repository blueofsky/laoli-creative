import type { Command, Config, Flags } from '../../types/cli';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { success, info } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';

const ENV_KEY_MAP: Record<string, string> = {
  agnes: 'AGNES_API_KEY',
  apimart: 'APIMART_API_KEY',
  tuzi: 'TUZI_API_KEY',
  minimax: 'MINIMAX_API_KEY',
  mimo: 'MIMO_API_KEY',
};

export const loginCommand: Command = {
  name: 'login',
  description: 'Save API key to ~/.laoli/.env',
  usage: 'laoli auth login --api-key <key> [--provider <name>]',
  options: [
    { flag: '--api-key <key>', description: 'API key' },
    { flag: '--provider <name>', description: 'Provider: agnes, apimart, tuzi, minimax, mimo' },
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

    const envKey = ENV_KEY_MAP[provider];
    if (!envKey) {
      throw new CLIError(`Unknown provider: ${provider}`, ExitCode.INVALID_ARGS);
    }

    // 写入 ~/.laoli/.env
    const laoliDir = join(homedir(), '.laoli');
    if (!existsSync(laoliDir)) {
      mkdirSync(laoliDir, { recursive: true });
    }
    appendFileSync(join(laoliDir, '.env'), `\n${envKey}=${apiKey}\n`, 'utf-8');

    // 设置到当前进程环境变量，立即生效
    process.env[envKey] = apiKey;

    success(`API key saved for provider: ${provider}`);
    info(`Added ${envKey}=... to ~/.laoli/.env`);
  },
};
