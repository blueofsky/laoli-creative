import { requestJson } from '../client/http';
import { ProviderError } from '../errors/codes';
import { loadConfig } from '../config/loader';

/**
 * Provider -> env var name mapping for API keys
 */
const API_KEY_ENV_MAP: Record<string, string[]> = {
  agnes: ['AGNES_API_KEY', 'LAOLI_API_KEY'],
  apimart: ['APIMART_API_KEY', 'LAOLI_API_KEY'],
  tuzi: ['TUZI_API_KEY', 'LAOLI_API_KEY'],
  minimax: ['MINIMAX_API_KEY', 'LAOLI_API_KEY'],
  mimo: ['MIMO_API_KEY', 'LAOLI_API_KEY'],
};

/**
 * 获取指定 Provider 的 API Key（按优先级遍历环境变量）
 */
export function getApiKey(providerName: string): string {
  const envVars = API_KEY_ENV_MAP[providerName];
  if (!envVars) {
    throw new ProviderError(`Unknown provider: ${providerName}`, providerName);
  }

  // 1. 环境变量（最高优先级）
  for (const envVar of envVars) {
    const apiKey = process.env[envVar];
    if (apiKey) return apiKey;
  }

  // 2. 配置文件 ~/.laoli/config.json -> providers.{name}.apiKey
  try {
    const config = loadConfig();
    const cfgKey = config.providers?.[providerName]?.apiKey;
    if (cfgKey) return cfgKey;
  } catch {
    // 配置文件加载失败则跳过
  }

  throw new ProviderError(
    `${capitalize(providerName)} API key not found. Try: laoli auth login --api-key <key> --provider ${providerName}`,
    providerName
  );
}

/**
 * 宽高比 -> 像素尺寸转换
 */
export function aspectRatioToSize(aspectRatio: string): string {
  const ratioMap: Record<string, string> = {
    '1:1': '1024x1024',
    '16:9': '1536x864',
    '9:16': '864x1536',
    '4:3': '1024x768',
    '3:4': '768x1024',
    '2.35:1': '1536x654',
  };
  return ratioMap[aspectRatio] || '1024x1024';
}

/**
 * 向 Provider API 发送 JSON 请求（自动附加 Authorization header）
 */
export async function makeProviderRequest<T>(
  provider: string,
  url: string,
  options: { method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; body?: any; headers?: Record<string, string>; timeout?: number } = {}
): Promise<T> {
  const apiKey = getApiKey(provider);

  return requestJson<T>({
    method: options.method || 'POST',
    url,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...options.headers,
    },
    body: options.body,
    timeout: options.timeout,
  });
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
