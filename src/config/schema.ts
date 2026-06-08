import type { Config } from '../types/cli';

export const DEFAULT_CONFIG: Config = {
  version: 1,
  defaultProvider: 'agnes',
  defaultRegion: 'cn',
  
  providers: {
    agnes: {
      baseUrl: 'https://apihub.agnes-ai.com/v1',
      defaultModel: 'agnes-image-2.1-flash',
      timeout: 30000,
      maxRetries: 3,
    },
    apimart: {
      baseUrl: 'https://api.apimart.ai/v1',
      defaultModel: 'gpt-image-2',
      timeout: 30000,
      maxRetries: 3,
    },
    tuzi: {
      baseUrl: 'https://api.tu-zi.com/v1',
      defaultModel: 'gpt-image-2',
      timeout: 30000,
      maxRetries: 3,
    },
    minimax: {
      baseUrl: 'https://api.minimax.io/v1',
      defaultModel: 'MiniMax-M2.7',
      timeout: 30000,
      maxRetries: 3,
    },
    mimo: {
      baseUrl: 'https://api.xiaomimimo.com/v1',
      defaultModel: 'mimo-v2.5-tts',
      timeout: 30000,
      maxRetries: 3,
    },
  },
  
  imagine: {
    defaultProvider: 'agnes',
    defaultModel: 'agnes-image-2.1-flash',
    defaultOutputDir: './images',
  },
  
  tts: {
    defaultProvider: 'mimo',
    defaultModel: 'mimo-v2.5-tts',
    defaultOutputDir: './audio',
    defaultVoice: '冰糖',
    defaultFormat: 'mp3',
  },
  
  video: {
    defaultProvider: 'apimart',
    defaultModel: 'doubao-seedance-1-0-pro-fast',
    defaultOutputDir: './videos',
    defaultSeconds: 5,
    defaultResolution: '1080p',
  },
  
  bgm: {
    defaultProvider: 'minimax',
    defaultModel: 'music-2.6',
    defaultOutputDir: './bgm',
  },
  
  picgo: {
    repo: '',
    branch: 'main',
    path: 'assets/images',
    customUrl: '',
  },
  
  display: {
    defaultFormat: 'text',
    quiet: false,
    noColor: false,
  },
};
