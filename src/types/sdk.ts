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
  speed?: number;
  pitch?: number;
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
  downloadVideo?(taskId: string, outputPath: string): Promise<string>;
  generateMusic?(params: MusicParams): Promise<MusicResult>;
}
