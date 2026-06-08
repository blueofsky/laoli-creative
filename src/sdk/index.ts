export { generateImage, editImage, batchGenerateImages } from './imagine';
export type { EditImageParams } from './imagine';

export { synthesizeSpeech, listVoices } from './tts';
export { generateVideo, queryVideoTask, downloadVideo, waitForVideoCompletion } from './video';
export { generateMusic } from './bgm';
export { uploadImage, savePicgoConfig, loadPicgoConfig } from './picgo';

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
  Provider,
} from '../types/sdk';

export type { PicgoUploadParams, PicgoUploadResult } from './picgo';
