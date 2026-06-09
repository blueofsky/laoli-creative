import type { CommandGroup } from '../../types/cli';
import { generateCommand } from './generate';

export const musicCommands: CommandGroup = {
  name: 'music',
  description: 'Music and background music generation',
  defaultCommand: 'generate',
  commands: [
    generateCommand,
  ],
};
