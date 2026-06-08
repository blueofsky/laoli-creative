import type { Command, Config, Flags } from '../../types/cli';
import { getProvider } from '../../providers';
import { success, json, info } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';
import type { TTSParams } from '../../types/sdk';

export const synthesizeCommand: Command = {
  name: 'synthesize',
  description: 'Synthesize speech from text',
  usage: 'laoli tts synthesize --text <text> --output <path> [options]',
  options: [
    { flag: '--text <text>', description: 'Text to synthesize', required: true },
    { flag: '--output <path>', description: 'Output audio file path', required: true },
    { flag: '--provider <name>', description: 'Provider: minimax, mimo' },
    { flag: '--model <id>', description: 'Model ID' },
    { flag: '--voice <id>', description: 'Voice ID or voice description (for mimo voicedesign)' },
    { flag: '--context <text>', description: 'Style control (mimo only)' },
    { flag: '--speed <n>', description: 'Speech speed', type: 'number' },
    { flag: '--pitch <n>', description: 'Speech pitch', type: 'number' },
    { flag: '--format <fmt>', description: 'Audio format: mp3, wav' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
    { flag: '--quiet', description: 'Suppress non-essential output', type: 'boolean' },
  ],
  examples: [
    'laoli tts synthesize --text "Hello" --output hello.mp3',
    'laoli tts synthesize --text "Hello" --voice 冰糖 --output hello.mp3',
    'laoli tts synthesize --text "Hello" --provider minimax --output hello.mp3',
    'laoli tts synthesize --text "Hello" --provider mimo --voice 冰糖 --output hello.mp3',
    'laoli tts synthesize --text "Hello" --provider mimo --model mimo-v2.5-tts-voicedesign --voice "磁性男声" --output hello.mp3',
  ],
  execute: async (config: Config, flags: Flags) => {
    const text = flags.text as string;
    const output = flags.output as string;
    
    if (!text) {
      throw new CLIError('Missing required argument: --text', ExitCode.INVALID_ARGS);
    }
    if (!output) {
      throw new CLIError('Missing required argument: --output', ExitCode.INVALID_ARGS);
    }
    
    const providerName = (flags.provider as string) || config.tts.defaultProvider || 'minimax';
    const provider = getProvider(providerName);
    
    if (!provider.synthesizeSpeech) {
      throw new CLIError(`Provider "${providerName}" does not support TTS`, ExitCode.PROVIDER_ERROR);
    }
    
    const model = (flags.model as string) || config.tts.defaultModel;
    const voice = (flags.voice as string) || config.tts.defaultVoice;
    const context = flags.context as string;
    const speed = flags.speed ? parseFloat(flags.speed as string) : undefined;
    const pitch = flags.pitch ? parseFloat(flags.pitch as string) : undefined;
    const format = (flags.format as string) || config.tts.defaultFormat;
    const isJson = flags.json as boolean;
    const isQuiet = flags.quiet as boolean || config.output.quiet;
    
    try {
      const params: TTSParams = {
        text,
        outputPath: output,
        provider: providerName,
        model,
        voice: context ? `${context} ${voice}` : voice,
        speed,
        pitch,
        format,
      };
      
      if (!isQuiet) {
        info(`Using ${providerName} / ${model || 'default'}`);
      }
      
      const result = await provider.synthesizeSpeech(params);
      
      if (isJson) {
        json(result);
      } else if (!isQuiet) {
        success(`Audio saved to ${result.outputPath}`);
      }
    } catch (error) {
      throw new CLIError(
        `TTS synthesis failed: ${error instanceof Error ? error.message : String(error)}`,
        ExitCode.PROVIDER_ERROR
      );
    }
  },
};
