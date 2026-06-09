export { generateImage, batchGenerateImages } from './image';

export { synthesizeSpeech, listVoices } from './tts';
export { generateVideo, queryVideoTask, downloadVideo, waitForVideoCompletion } from './video';
export { generateMusic } from './music';
export { uploadImage, savePicgoConfig, loadPicgoConfig } from './picgo';
export { understandImage, understandVideo } from './vision';

export type {
  ImageParams,
  ImageResult,
  BatchImageParams,
  BatchImageResult,
  TTSParams,
  TTSResult,
  VideoParams,
  VideoResult,
  MusicParams,
  MusicResult,
  VisionImageParams,
  VisionVideoParams,
  VisionResult,
  Provider,
} from '../types/sdk';

export type { PicgoUploadParams, PicgoUploadResult } from './picgo';
