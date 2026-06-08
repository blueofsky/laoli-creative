import { getProvider } from '../providers';
import type { VideoParams, VideoResult } from '../types/sdk';

export async function generateVideo(params: VideoParams): Promise<VideoResult> {
  const provider = getProvider(params.provider || 'apimart');
  
  if (!provider.generateVideo) {
    throw new Error(`Provider "${params.provider || 'apimart'}" does not support video generation`);
  }
  
  return provider.generateVideo(params);
}

export async function queryVideoTask(taskId: string, providerName?: string): Promise<VideoResult> {
  const provider = getProvider(providerName || 'apimart');
  
  if (!provider.queryVideoTask) {
    throw new Error(`Provider "${providerName || 'apimart'}" does not support video task query`);
  }
  
  return provider.queryVideoTask(taskId);
}

export async function downloadVideo(taskId: string, outputPath: string, providerName?: string): Promise<string> {
  const provider = getProvider(providerName || 'apimart');
  
  if (!provider.downloadVideo) {
    throw new Error(`Provider "${providerName || 'apimart'}" does not support video download`);
  }
  
  return provider.downloadVideo(taskId, outputPath);
}

export async function waitForVideoCompletion(
  taskId: string,
  providerName?: string,
  options: { pollInterval?: number; timeout?: number } = {}
): Promise<VideoResult> {
  const { pollInterval = 5000, timeout = 600000 } = options; // 默认 5 秒轮询，10 分钟超时
  const startTime = Date.now();
  
  while (true) {
    const result = await queryVideoTask(taskId, providerName);
    
    if (result.status === 'completed' || result.status === 'failed') {
      return result;
    }
    
    // 检查超时
    if (Date.now() - startTime > timeout) {
      throw new Error(`Video generation timed out after ${timeout / 1000}s`);
    }
    
    // 等待后重试
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
}
