import { NetworkError, TimeoutError, ProviderError } from '../errors/codes';
import { error as logError, debug } from '../utils/logger';

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export interface HttpResponse<T = any> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
}

/** 封装 fetch 并记录请求日志（耗时、状态） */
export async function apiFetch(
  provider: string,
  method: string,
  url: string,
  options?: { headers?: Record<string, string>; body?: any; description?: string },
): Promise<Response> {
  const desc = options?.description || `${method} ${url.replace(/https?:\/\/[^/]+/, '')}`;
  const start = Date.now();
  debug(`[${provider}] → ${desc}`);

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: options?.body,
    });
    const ms = Date.now() - start;
    if (response.ok) {
      debug(`[${provider}] ← ${desc} (${response.status}, ${ms}ms)`);
    } else {
      logError(`[${provider}] ← ${desc} (${response.status}, ${ms}ms)`);
    }
    return response;
  } catch (err) {
    const ms = Date.now() - start;
    logError(`[${provider}] ✗ ${desc} (${ms}ms): ${err instanceof Error ? err.message : String(err)}`);
    throw err;
  }
}

export async function request<T = any>(options: RequestOptions): Promise<HttpResponse<T>> {
  const { method, url, headers = {}, body, timeout = 30000 } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: controller.signal,
    };

    if (body && method !== 'GET') {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let data: any;
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else if (contentType?.includes('text/')) {
      data = await response.text();
    } else {
      data = await response.arrayBuffer();
    }

    if (!response.ok) {
      throw new ProviderError(
        `HTTP ${response.status}: ${response.statusText}`,
        'http',
        response.status,
        { url, data }
      );
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data,
    };
  } catch (error) {
    if (error instanceof ProviderError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new TimeoutError(`Request timed out after ${timeout}ms: ${url}`);
      }
      throw new NetworkError(`Network error: ${error.message}`);
    }

    throw new NetworkError(`Unknown error: ${String(error)}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function requestJson<T = any>(options: RequestOptions): Promise<T> {
  const response = await request<T>(options);
  return response.data;
}

export async function downloadFile(url: string, outputPath: string): Promise<string> {
  const start = Date.now();
  debug(`[http] → DOWNLOAD ${url}`);

  const response = await fetch(url);

  if (!response.ok) {
    logError(`[http] ← DOWNLOAD (${response.status}, ${Date.now() - start}ms)`);
    throw new NetworkError(`Failed to download file: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  const { writeFileSync, mkdirSync, existsSync } = await import('fs');
  const { dirname } = await import('path');

  const outputDir = dirname(outputPath);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  writeFileSync(outputPath, Buffer.from(buffer));
  const ms = Date.now() - start;
  debug(`[http] ← DOWNLOAD ${url} (${buffer.byteLength} bytes, ${ms}ms)`);
  return outputPath;
}
