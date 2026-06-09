import type { CommandGroup } from '../../types/cli';
import { synthesizeCommand as speakCommand } from './speak';
import { voicesCommand as voiceCommand } from './voice';

export const ttsCommands: CommandGroup = {
  name: 'tts',
  description: 'Text-to-speech synthesis',
  commands: [
    speakCommand,
    voiceCommand,
  ],
};
