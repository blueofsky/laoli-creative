import type { CommandGroup } from '../../types/cli';
import { synthesizeCommand } from './synthesize';
import { voicesCommand } from './voices';

export const ttsCommands: CommandGroup = {
  name: 'tts',
  description: 'Text-to-speech synthesis',
  commands: [
    synthesizeCommand,
    voicesCommand,
  ],
};
