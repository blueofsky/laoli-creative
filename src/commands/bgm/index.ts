import type { CommandGroup } from '../../types/cli';
import { generateCommand } from './generate';

export const bgmCommands: CommandGroup = {
  name: 'bgm',
  description: 'Background music generation',
  defaultCommand: 'generate',
  commands: [
    generateCommand,
  ],
};
