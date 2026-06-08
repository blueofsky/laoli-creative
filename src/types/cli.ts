export interface CLIOptions {
  name: string;
  description: string;
  version: string;
  commands: CommandGroup[];
}

export interface CommandGroup {
  name: string;
  description: string;
  commands: Command[];
}

export interface Command {
  name: string;
  description: string;
  usage?: string;
  options?: OptionDef[];
  examples?: string[];
  execute: (config: Config, flags: Flags) => Promise<void>;
}

export interface OptionDef {
  flag: string;
  description: string;
  type?: 'string' | 'number' | 'boolean' | 'array';
  required?: boolean;
  default?: string | number | boolean;
}

export interface Flags {
  [key: string]: string | boolean | string[] | string[] | undefined;
  _positional?: string[];
}

export interface Config {
  version: number;
  defaultProvider: string;
  defaultRegion: string;
  providers: Record<string, ProviderConfig>;
  imagine: ImagineConfig;
  tts: TTSConfig;
  video: VideoConfig;
  bgm: ModuleConfig;
  picgo: PicgoConfig;
  display: DisplayConfig;
  proxy?: string;
}

export interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface ModuleConfig {
  defaultProvider?: string;
  defaultModel?: string;
  defaultOutputDir?: string;
}

export interface ImagineConfig extends ModuleConfig {
  defaultQuality?: string;
  defaultAspectRatio?: string;
}

export interface TTSConfig extends ModuleConfig {
  defaultVoice?: string;
  defaultFormat?: string;
}

export interface VideoConfig extends ModuleConfig {
  defaultSeconds?: number;
  defaultResolution?: string;
}

export interface PicgoConfig {
  repo?: string;
  branch?: string;
  path?: string;
  customUrl?: string;
}

export interface DisplayConfig {
  defaultFormat?: 'text' | 'json';
  quiet?: boolean;
  noColor?: boolean;
}
