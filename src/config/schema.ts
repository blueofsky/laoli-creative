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
    defaultQuality: '2k',
    defaultAspectRatio: '1:1',
  },

  tts: {
    defaultProvider: 'minimax',
    defaultModel: 'speech-2.8-hd',
    defaultVoice: 'female-shaonv',
    defaultFormat: 'mp3',
  },

  video: {
    defaultProvider: 'agnes',
    defaultModel: 'agnes-video-v2.0',
    defaultSeconds: 5,
    defaultResolution: '1080p',
    pollInterval: 5000,
    batchPollInterval: 10000,
    timeout: 600000,
    batchTimeout: 3600000,
  },

  music: {
    defaultProvider: 'minimax',
    defaultModel: 'music-2.6',
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
