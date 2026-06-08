import type { Command, Config, Flags } from '../../types/cli';
import { json } from '../../utils/logger';

const ALL_PROVIDERS = ['agnes', 'apimart', 'tuzi', 'minimax', 'mimo'];
const ENV_MAP: Record<string, string[]> = {
  agnes: ['AGNES_API_KEY', 'LAOLI_API_KEY'],
  apimart: ['APIMART_API_KEY', 'LAOLI_API_KEY'],
  tuzi: ['TUZI_API_KEY', 'LAOLI_API_KEY'],
  minimax: ['MINIMAX_API_KEY', 'LAOLI_API_KEY'],
  mimo: ['MIMO_API_KEY', 'LAOLI_API_KEY'],
};

function checkApiKey(providerName: string, config: Config): { source: string; exists: boolean } {
  // 环境变量
  const envVars = ENV_MAP[providerName] || [];
  for (const env of envVars) {
    if (process.env[env]) return { source: `env:${env}`, exists: true };
  }
  // 配置文件
  const cfgKey = config.providers?.[providerName]?.apiKey;
  if (cfgKey) return { source: '~/.laoli/config.json', exists: true };
  return { source: 'none', exists: false };
}

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

    const status: Record<string, { authenticated: boolean; source: string }> = {};

    for (const name of ALL_PROVIDERS) {
      const result = checkApiKey(name, config);
      status[name] = { authenticated: result.exists, source: result.source };
    }

    if (isJson) {
      json(status);
    } else {
      console.log('\nAuthentication Status:\n');
      for (const [name, info] of Object.entries(status)) {
        const icon = info.authenticated ? '✓' : '✗';
        const src = info.authenticated ? ` (${info.source})` : '';
        console.log(`  ${icon} ${name}${src}`);
      }
      console.log('');
      console.log('  Tip: laoli auth login --api-key <key> --provider <name>');
    }
  },
};
