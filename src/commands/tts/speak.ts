import type { Command, Config, Flags } from '../../types/cli';
import { getProvider } from '../../providers';
import { json } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';
import type { TTSParams } from '../../types/sdk';

export const synthesizeCommand: Command = {
  name: 'speak',
  description: 'Synthesize speech from text',
  usage: 'laoli tts speak --text <text> --output <path> [options]',
  options: [
    { flag: '--text <text>', description: 'Text to synthesize', required: true },
    { flag: '--output <path>', description: 'Output audio file path', required: true },
    { flag: '--provider <name>', description: 'Provider: minimax (default), mimo' },
    { flag: '--model <id>', description: 'Model ID' },
    { flag: '--voice <id>', description: 'Voice ID' },
    { flag: '--speed <n>', description: 'Speech speed (0.5~2.0, minimax)', type: 'number' },
    { flag: '--vol <n>', description: 'Volume (0~10, minimax)', type: 'number' },
    { flag: '--pitch <n>', description: 'Speech pitch (-12~12, minimax)', type: 'number' },
    { flag: '--emotion <e>', description: 'Emotion: happy/sad/angry/calm/whisper... (minimax)' },
    { flag: '--context <text>', description: 'Style description (mimo only)' },
    { flag: '--format <fmt>', description: 'Audio format: mp3, wav' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
  ],
  examples: [
    'laoli tts speak --text "你好" --output hello.mp3',
    'laoli tts speak --text "Hello" --voice female-shaonv --output hello.mp3',
    'laoli tts speak --text "你好" --emotion happy --speed 1.2 --output happy.mp3',
    'laoli tts speak --text "晚安" --vol 5 --output goodnight.mp3',
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
      context: flags.context as string,
      speed: flags.speed ? parseFloat(flags.speed as string) : config.tts.defaultSpeed,
      vol: flags.vol ? parseFloat(flags.vol as string) : config.tts.defaultVol,
      pitch: flags.pitch ? parseFloat(flags.pitch as string) : config.tts.defaultPitch,
      emotion: (flags.emotion as string) || config.tts.defaultEmotion || undefined,
      format: (flags.format as string) || config.tts.defaultFormat,
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
