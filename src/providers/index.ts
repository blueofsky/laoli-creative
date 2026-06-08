import type { Provider } from '../types/sdk';
import { CLIError, ExitCode } from '../errors/codes';

const providers: Map<string, Provider> = new Map();

export function registerProvider(provider: Provider): void {
  providers.set(provider.name, provider);
}

export function getProvider(name: string): Provider {
  const provider = providers.get(name);
  if (!provider) {
    throw new CLIError(
      `Provider "${name}" not found. Available providers: ${Array.from(providers.keys()).join(', ')}`,
      ExitCode.CONFIG_ERROR
    );
  }
  return provider;
}

export function getAllProviders(): Provider[] {
  return Array.from(providers.values());
}

export function hasProvider(name: string): boolean {
  return providers.has(name);
}

// 自动注册内置 providers
import { agnesProvider } from './agnes';
import { apimartProvider } from './apimart';
import { tuziProvider } from './tuzi';
import { minimaxProvider } from './minimax';
import { mimoProvider } from './mimo';

registerProvider(agnesProvider);
registerProvider(apimartProvider);
registerProvider(tuziProvider);
registerProvider(minimaxProvider);
registerProvider(mimoProvider);
