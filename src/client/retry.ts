import { NetworkError, TimeoutError } from '../errors/codes';

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const { maxRetries, baseDelay, maxDelay, backoffFactor } = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options,
  };
  
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // 检查是否可重试
      if (!isRetryableError(error)) {
        throw error;
      }
      
      // 最后一次尝试失败
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 计算延迟时间
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt),
        maxDelay
      );
      
      // 添加随机抖动
      const jitter = delay * 0.1 * Math.random();
      const totalDelay = delay + jitter;
      
      await sleep(totalDelay);
    }
  }
  
  throw lastError;
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof NetworkError) {
    return true;
  }
  
  if (error instanceof TimeoutError) {
    return true;
  }
  
  if (error instanceof Error) {
    // 网络错误
    if (error.message.includes('ECONNRESET') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('fetch failed')) {
      return true;
    }
  }
  
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
