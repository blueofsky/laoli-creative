import type { Command, Config, Flags } from '../../types/cli';
import { getProvider } from '../../providers';
import { json } from '../../utils/logger';
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
    { flag: '--voice <id>', description: 'Voice ID' },
    { flag: '--speed <n>', description: 'Speech speed (0.5~2.0)', type: 'number' },
    { flag: '--vol <n>', description: 'Volume (0~10)', type: 'number' },
    { flag: '--pitch <n>', description: 'Speech pitch (-12~12)', type: 'number' },
    { flag: '--emotion <e>', description: 'Emotion: happy/sad/angry/calm/whisper/...' },
    { flag: '--intensity <n>', description: 'Voice intensity (-100~100)', type: 'number' },
    { flag: '--format <fmt>', description: 'Audio format: mp3, pcm, flac, wav' },
    { flag: '--sample-rate <hz>', description: 'Sample rate: 8000/16000/22050/24000/32000/44100', type: 'number' },
    { flag: '--bitrate <bps>', description: 'Bitrate: 32000/64000/128000/256000', type: 'number' },
    { flag: '--channel <n>', description: 'Channels: 1 (mono) or 2 (stereo)', type: 'number' },
    { flag: '--language-boost <lang>', description: 'Language boost (e.g. Chinese)' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
    { flag: '--quiet', description: 'Suppress non-essential output', type: 'boolean' },
  ],
  examples: [
    'laoli tts synthesize --text "你好" --output hello.mp3',
    'laoli tts synthesize --text "Hello" --voice female-shaonv --output hello.mp3',
    'laoli tts synthesize --text "你好" --emotion happy --speed 1.2 --output happy.mp3',
    'laoli tts synthesize --text "晚安" --vol 5 --sample-rate 44100 --output goodnight.mp3',
  ],
  execute: async (config: Config, flags: Flags) => {
    const text = flags.text as string;
    const output = flags.output as string;

    if (!text) throw new CLIError('Missing required argument: --text', ExitCode.INVALID_ARGS);
    if (!output) throw new CLIError('Missing required argument: --output', ExitCode.INVALID_ARGS);

    const providerName = (flags.provider as string) || config.tts.defaultProvider || 'minimax';
    const provider = getProvider(providerName);

    if (!provider.synthesizeSpeech) {
      throw new CLIError(`Provider "${providerName}" does not support TTS`, ExitCode.PROVIDER_ERROR);
    }

    const params: TTSParams = {
      text,
      outputPath: output,
      provider: providerName,
      model: (flags.model as string) || config.tts.defaultModel,
      voice: (flags.voice as string) || config.tts.defaultVoice,
      speed: flags.speed ? parseFloat(flags.speed as string) : config.tts.defaultSpeed,
      vol: flags.vol ? parseFloat(flags.vol as string) : config.tts.defaultVol,
      pitch: flags.pitch ? parseFloat(flags.pitch as string) : config.tts.defaultPitch,
      emotion: flags.emotion as string,
      intensity: flags.intensity ? parseInt(flags.intensity as string, 10) : undefined,
      format: (flags.format as string) || config.tts.defaultFormat,
      sampleRate: flags['sample-rate'] ? parseInt(flags['sample-rate'] as string, 10) : undefined,
      bitrate: flags.bitrate ? parseInt(flags.bitrate as string, 10) : undefined,
      channel: flags.channel ? parseInt(flags.channel as string, 10) : undefined,
      languageBoost: flags['language-boost'] as string,
    };

    try {
      const result = await provider.synthesizeSpeech(params);

      if (flags.json as boolean) {
        json(result);
      }
    } catch (error) {
      throw new CLIError(
        `TTS synthesis failed: ${error instanceof Error ? error.message : String(error)}`,
        ExitCode.PROVIDER_ERROR
      );
    }
  },
};
