import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { loadConfig, saveConfig } from '../config/loader';

export interface PicgoUploadParams {
  input: string;
  batch?: boolean;
}

export interface PicgoUploadResult {
  url: string;
  filename: string;
  originalPath: string;
  metadata: Record<string, any>;
}

export interface PicgoConfig {
  repo: string;
  token: string;
  path?: string;
  branch?: string;
  customUrl?: string;
}

const SUPPORTED_FORMATS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'];

export async function uploadImage(params: PicgoUploadParams): Promise<PicgoUploadResult[]> {
  const { input, batch = false } = params;

  const config = loadPicgoConfig();
  if (!config) {
    throw new Error('PicGo not configured. Run: laoli picgo config --repo <owner/repo> --token <token>');
  }

  const files = getFilesToUpload(input, batch);
  if (files.length === 0) {
    throw new Error('No supported images found');
  }

  const results: PicgoUploadResult[] = [];

  for (const file of files) {
    try {
      const result = await uploadSingleFile(file, config);
      results.push(result);
    } catch (error) {
      throw new Error(`Failed to upload ${file}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return results;
}

async function uploadSingleFile(filePath: string, config: PicgoConfig): Promise<PicgoUploadResult> {
  const fileBuffer = readFileSync(filePath);
  const filename = generateFilename(filePath);
  const path = config.path ? `${config.path}/${filename}` : filename;

  const url = `https://api.github.com/repos/${config.repo}/contents/${path}`;
  const body = {
    message: `Upload ${filename}`,
    content: fileBuffer.toString('base64'),
    branch: config.branch || 'main',
  };

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${config.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err: any = await response.json().catch(() => ({}));
    throw new Error(`GitHub API error: ${err.message || response.statusText}`);
  }

  const data: any = await response.json();

  let fileUrl: string;
  if (config.customUrl) {
    fileUrl = `${config.customUrl}/${path}`;
  } else {
    fileUrl = `https://raw.githubusercontent.com/${config.repo}/${config.branch || 'main'}/${path}`;
  }

  return {
    url: fileUrl,
    filename,
    originalPath: filePath,
    metadata: {
      repo: config.repo,
      path,
      sha: data.content?.sha,
    },
  };
}

function generateFilename(filePath: string): string {
  const ext = extname(filePath);
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const random = Math.random().toString(36).slice(2, 6);
  return `${timestamp}${random}${ext}`;
}

function getFilesToUpload(input: string, batch: boolean): string[] {
  const files: string[] = [];

  if (!existsSync(input)) {
    throw new Error(`Input path does not exist: ${input}`);
  }

  const stat = statSync(input);

  if (stat.isFile()) {
    const ext = extname(input).toLowerCase();
    if (SUPPORTED_FORMATS.includes(ext)) {
      files.push(input);
    } else {
      throw new Error(`Unsupported file format: ${ext}`);
    }
  } else if (stat.isDirectory() && batch) {
    const entries = readdirSync(input, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        if (SUPPORTED_FORMATS.includes(ext)) {
          files.push(join(input, entry.name));
        }
      }
    }
  } else if (stat.isDirectory() && !batch) {
    throw new Error('Input is a directory. Use --batch flag for batch upload.');
  }

  return files;
}

export function loadPicgoConfig(): PicgoConfig | null {
  // 1. 环境变量覆盖（运行期最高优先级）
  const envRepo = process.env.PICGO_REPO;
  const envToken = process.env.PICGO_TOKEN;
  if (envRepo && envToken) {
    return {
      repo: envRepo,
      token: envToken,
      path: process.env.PICGO_PATH,
      branch: process.env.PICGO_BRANCH,
      customUrl: process.env.PICGO_CUSTOM_URL,
    };
  }

  // 2. 从配置系统加载 (repo/path/branch/customUrl 存于 ~/.laoli/config.json)
  const config = loadConfig();
  const picgoCfg = config.picgo;
  if (picgoCfg?.repo) {
    // Token 始终从环境变量读取，不写入配置文件
    const token = process.env.PICGO_TOKEN || process.env.LAOLI_API_KEY || '';
    if (!token) return null;
    return {
      repo: picgoCfg.repo,
      token,
      path: picgoCfg.path || 'assets/images',
      branch: picgoCfg.branch || 'main',
      customUrl: picgoCfg.customUrl || '',
    };
  }

  return null;
}

export function savePicgoConfig(config: PicgoConfig): void {
  // repo/path/branch/customUrl 写入 ~/.laoli/config.json
  saveConfig({
    picgo: {
      repo: config.repo,
      branch: config.branch || 'main',
      path: config.path || 'assets/images',
      customUrl: config.customUrl || '',
    },
  });

  // Token 仅设置到当前进程的环境变量，不写入配置文件
  if (config.token) {
    process.env.PICGO_TOKEN = config.token;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
}
