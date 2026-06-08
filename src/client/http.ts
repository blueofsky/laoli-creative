import { NetworkError, TimeoutError, ProviderError } from '../errors/codes';

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
    
    // 解析响应头
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    
    // 解析响应体
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
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new NetworkError(`Failed to download file: ${response.statusText}`);
  }
  
  const buffer = await response.arrayBuffer();
  const { writeFileSync, mkdirSync, existsSync } = await import('fs');
  const { dirname } = await import('path');
  
  // 确保输出目录存在
  const outputDir = dirname(outputPath);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  writeFileSync(outputPath, Buffer.from(buffer));
  return outputPath;
}
