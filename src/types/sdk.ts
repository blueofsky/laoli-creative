export interface ImageParams {
  prompt: string;
  outputPath: string;
  provider?: string;
  model?: string;
  aspectRatio?: string;
  size?: string;
  quality?: string;
  refImages?: string[];
  n?: number;
}

export interface ImageResult {
  url: string;
  outputPath: string;
  metadata: Record<string, any>;
}

export interface BatchImageParams {
  batchFile: string;
  provider?: string;
  jobs?: number;
}

export interface BatchImageResult {
  url: string;
  outputPath: string;
  metadata: Record<string, any>;
}

export interface TTSParams {
  text: string;
  outputPath: string;
  provider?: string;
  model?: string;
  voice?: string;
  context?: string;
  speed?: number;
  vol?: number;
  pitch?: number;
  emotion?: string;
  format?: string;
}

export interface TTSResult {
  url?: string;
  outputPath: string;
  duration?: number;
  metadata: Record<string, any>;
}

export interface VideoParams {
  prompt: string;
  outputPath: string;
  provider?: string;
  model?: string;
  seconds?: number;
  size?: string;
  resolution?: string;
  refImages?: string[];
}

export interface VideoResult {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  url?: string;
  outputPath?: string;
  metadata: Record<string, any>;
}

export interface MusicParams {
  prompt: string;
  outputPath: string;
  provider?: string;
  model?: string;
  lyrics?: string;
  instrumental?: boolean;
}

export interface MusicResult {
  url?: string;
  outputPath: string;
  duration?: number;
  metadata: Record<string, any>;
}

export interface Provider {
  name: string;
  
  generateImage(params: ImageParams): Promise<ImageResult>;
  batchGenerateImages(params: BatchImageParams): Promise<BatchImageResult[]>;
  
  synthesizeSpeech?(params: TTSParams): Promise<TTSResult>;
  generateVideo?(params: VideoParams): Promise<VideoResult>;
  queryVideoTask?(taskId: string): Promise<VideoResult>;
  downloadVideo?(taskId: string, outputPath: string, videoUrl?: string): Promise<string>;
  generateMusic?(params: MusicParams): Promise<MusicResult>;
  understandImage?(params: VisionImageParams): Promise<VisionResult>;
  understandVideo?(params: VisionVideoParams): Promise<VisionResult>;
}

export interface VisionImageParams {
  input: string;      // 图片路径或 URL
  prompt: string;     // 提问
  provider?: string;
  model?: string;
}

export interface VisionVideoParams {
  input: string;      // 视频路径或 URL
  prompt: string;     // 提问
  provider?: string;
  model?: string;
  fps?: number;
  mediaResolution?: 'default' | 'max';
}

export interface VisionResult {
  content: string;
  reasoningContent?: string;
  usage?: Record<string, any>;
  metadata: Record<string, any>;
}
