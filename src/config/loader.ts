import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { DEFAULT_CONFIG } from './schema';
import type { Config } from '../types/cli';

const CONFIG_DIR = join(homedir(), '.laoli');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
const ENV_FILE = join(CONFIG_DIR, '.env');

const PROJECT_CONFIG_DIR = '.laoli';
const PROJECT_CONFIG_FILE = join(PROJECT_CONFIG_DIR, 'config.json');
const PROJECT_ENV_FILE = join(PROJECT_CONFIG_DIR, '.env');

export function loadConfig(flags: Record<string, any> = {}): Config {
  // 1. 加载默认配置
  let config = { ...DEFAULT_CONFIG };
  
  // 2. 加载用户配置 (~/.laoli/config.json)
  const userConfig = loadConfigFile(CONFIG_FILE);
  if (userConfig) {
    config = mergeConfigs(config, userConfig);
  }
  
  // 3. 加载项目配置 (.laoli/config.json)
  const projectConfig = loadConfigFile(PROJECT_CONFIG_FILE);
  if (projectConfig) {
    config = mergeConfigs(config, projectConfig);
  }
  
  // 4. 加载环境变量
  loadEnvFile(ENV_FILE);
  loadEnvFile(PROJECT_ENV_FILE);
  
  // 5. 应用环境变量覆盖
  config = applyEnvVars(config);
  
  // 6. 应用 CLI 参数覆盖
  config = applyFlags(config, flags);
  
  return config;
}

function loadConfigFile(filePath: string): Partial<Config> | null {
  try {
    if (!existsSync(filePath)) {
      return null;
    }
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`Warning: Failed to load config file ${filePath}`);
    return null;
  }
}

function loadEnvFile(filePath: string): void {
  try {
    if (!existsSync(filePath)) {
      return;
    }
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }
      
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex === -1) {
        continue;
      }
      
      const key = trimmed.slice(0, equalIndex).trim();
      const value = trimmed.slice(equalIndex + 1).trim();
      
      // 只在环境变量未设置时才加载
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    // 忽略环境变量文件加载错误
  }
}

function mergeConfigs(base: Config, override: Partial<Config>): Config {
  const result = { ...base };
  
  for (const key of Object.keys(override) as Array<keyof Config>) {
    const baseValue = base[key];
    const overrideValue = override[key];
    
    if (overrideValue === undefined) {
      continue;
    }
    
    if (typeof baseValue === 'object' && baseValue !== null && !Array.isArray(baseValue) &&
        typeof overrideValue === 'object' && overrideValue !== null && !Array.isArray(overrideValue)) {
      (result as any)[key] = { ...baseValue, ...overrideValue };
    } else {
      (result as any)[key] = overrideValue;
    }
  }
  
  return result;
}

function applyEnvVars(config: Config): Config {
  const result = { ...config };
  
  // 通用配置
  if (process.env.LAOLI_DEFAULT_PROVIDER) {
    result.defaultProvider = process.env.LAOLI_DEFAULT_PROVIDER;
  }
  if (process.env.LAOLI_DEFAULT_REGION) {
    result.defaultRegion = process.env.LAOLI_DEFAULT_REGION;
  }
  if (process.env.HTTPS_PROXY) {
    result.proxy = process.env.HTTPS_PROXY;
  }
  
  // Provider API Keys
  if (process.env.AGNES_API_KEY) {
    result.providers.agnes = { ...result.providers.agnes, apiKey: process.env.AGNES_API_KEY };
  }
  if (process.env.APIMART_API_KEY) {
    result.providers.apimart = { ...result.providers.apimart, apiKey: process.env.APIMART_API_KEY };
  }
  if (process.env.TUZI_API_KEY) {
    result.providers.tuzi = { ...result.providers.tuzi, apiKey: process.env.TUZI_API_KEY };
  }
  if (process.env.MINIMAX_API_KEY) {
    result.providers.minimax = { ...result.providers.minimax, apiKey: process.env.MINIMAX_API_KEY };
  }
  if (process.env.MIMO_API_KEY) {
    result.providers.mimo = { ...result.providers.mimo, apiKey: process.env.MIMO_API_KEY };
  }
  
  // 输出配置
  if (process.env.LAOLI_OUTPUT_FORMAT) {
    result.output = { ...result.output, defaultFormat: process.env.LAOLI_OUTPUT_FORMAT as 'text' | 'json' };
  }
  if (process.env.LAOLI_QUIET === 'true') {
    result.output = { ...result.output, quiet: true };
  }
  
  return result;
}

function applyFlags(config: Config, flags: Record<string, any>): Config {
  const result = { ...config };
  
  // 应用全局标志
  if (flags.region) {
    result.defaultRegion = flags.region;
  }
  if (flags.output) {
    result.output = { ...result.output, defaultFormat: flags.output };
  }
  if (flags.quiet) {
    result.output = { ...result.output, quiet: true };
  }
  if (flags.verbose) {
    result.output = { ...result.output, quiet: false };
  }
  if (flags.proxy) {
    result.proxy = flags.proxy;
  }
  
  return result;
}

export function saveConfig(config: Partial<Config>): void {
  // 确保目录存在
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  
  // 加载现有配置
  let existingConfig: Config = DEFAULT_CONFIG;
  if (existsSync(CONFIG_FILE)) {
    try {
      const content = readFileSync(CONFIG_FILE, 'utf-8');
      existingConfig = JSON.parse(content);
    } catch (error) {
      // 忽略解析错误
    }
  }
  
  // 合并配置
  const mergedConfig = mergeConfigs(existingConfig, config);
  
  // 保存配置
  writeFileSync(CONFIG_FILE, JSON.stringify(mergedConfig, null, 2), 'utf-8');
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}

export function getProjectConfigPath(): string {
  return PROJECT_CONFIG_FILE;
}
