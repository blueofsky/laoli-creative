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

/** 截断过长的字符串（用于日志输出） */
function truncate(str: string, maxLen = 2000): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + `\n... [truncated, ${str.length - maxLen} more bytes]`;
}

/** 格式化 JSON 请求/响应体用于日志输出 */
function formatBody(body: any): string {
  if (!body) return '<no body>';
  try {
    const parsed = typeof body === 'string' ? JSON.parse(body) : body;
    return truncate(JSON.stringify(parsed, null, 2));
  } catch {
    const str = typeof body === 'string' ? body : String(body);
    return truncate(str);
  }
}

/** 安全读取 Response body 的副本用于日志（不消耗原始流） */
async function cloneBodyForLog(res: Response): Promise<string> {
  try {
    const clone = res.clone();
    const text = await clone.text();
    return formatBody(text);
  } catch {
    return '<unable to read body>';
  }
}

/**
 * 封装 fetch 并输出完整的请求/响应报文（DEBUG 级别）
 *
 * 所有 provider 的 API 调用都走这个函数，DEBUG 模式下能看到：
 *   → POST /v1/videos
 *   Headers: {...}
 *   Body: { prompt: "...", model: "..." }
 *   ← 200 (5234ms)
 *   Body: { video_id: "...", status: "queued" }
 */
export async function apiFetch(
  provider: string,
  method: string,
  url: string,
  options?: { headers?: Record<string, string>; body?: any; description?: string },
): Promise<Response> {
  const desc = options?.description || `${method} ${url.replace(/https?:\/\/[^/]+/, '')}`;
  const start = Date.now();

  // 构建完整的请求日志（含报文）
  const reqBody = options?.body;

  // 逐行输出请求日志，避免超大 JSON 挤在一行
  const logLines: string[] = [`[${provider}] → ${desc}`];
  if (reqBody) {
    logLines.push(`  Headers: ${JSON.stringify(sanitizeHeaders(options?.headers))}`);
    logLines.push(`  Body: ${formatBody(reqBody)}`);
  }
  debug(logLines.join('\n'));

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: options?.body,
    });
    const ms = Date.now() - start;

    if (response.ok) {
      const resBody = await cloneBodyForLog(response);
      debug(`[${provider}] ← ${desc} (${response.status}, ${ms}ms)\n  Body: ${resBody}`);
    } else {
      const resBody = await cloneBodyForLog(response);
      logError(`[${provider}] ← ${desc} (${response.status}, ${ms}ms)\n  Body: ${resBody}`);
    }
    return response;
  } catch (err) {
    const ms = Date.now() - start;
    logError(`[${provider}] ✗ ${desc} (${ms}ms): ${err instanceof Error ? err.message : String(err)}`);
    throw err;
  }
}

/** 脱敏请求头中的 Authorization，避免 API Key 泄漏到日志 */
function sanitizeHeaders(headers?: Record<string, string>): Record<string, string> {
  if (!headers) return {};
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === 'authorization') {
      sanitized[key] = value.length > 12 ? value.slice(0, 8) + '...' + value.slice(-4) : '***';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
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
