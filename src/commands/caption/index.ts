import type { Command, CommandGroup, Config, Flags } from '../../types/cli';
import { getProvider } from '../../providers';
import { CLIError, ExitCode } from '../../errors/codes';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

export const captionCommand: Command = {
  name: 'caption',
  description: 'Transcribe audio to text (speech recognition)',
  usage: 'laoli caption --input <path> --output <path> [options]',
  options: [
    { flag: '--input <path>', description: 'Audio file path (wav/mp3)', required: true },
    { flag: '--output <path>', description: 'Output text file path (optional, prints to console if omitted)' },
    { flag: '--provider <name>', description: 'Provider (default: mimo)' },
    { flag: '--model <id>', description: 'Model ID (default: mimo-v2.5-asr)' },
    { flag: '--lang <lang>', description: 'Language hint: auto (default), zh, en' },
  ],
  examples: [
    'laoli caption --input speech.mp3 --output transcript.txt',
    'laoli caption --input audio.wav --output sub.txt --lang zh',
  ],
  execute: async (_config: Config, flags: Flags) => {
    const input = flags.input as string;
    const output = flags.output as string;
    const providerName = (flags.provider as string) || 'mimo';
    const model = flags.model as string;
    const language = flags.lang as 'auto' | 'zh' | 'en' | undefined;

    if (!input) throw new CLIError('Missing required argument: --input', ExitCode.INVALID_ARGS);

    const provider = getProvider(providerName);
    if (!provider.transcribeAudio) {
      throw new CLIError(`Provider "${providerName}" does not support speech recognition`, ExitCode.PROVIDER_ERROR);
    }

    if (output) {
      const outputDir = dirname(output);
      if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
    }

    const result = await provider.transcribeAudio({ input, outputPath: output, model, language });

    if (output) {
      console.log(`\nTranscription saved to: ${output}\n`);
    } else {
      console.log(`\n${result.text}\n`);
    }
  },
};

export const captionCommands: CommandGroup = {
  name: 'caption',
  description: 'Audio transcription / speech recognition (ASR)',
  defaultCommand: 'caption',
  commands: [captionCommand],
};
