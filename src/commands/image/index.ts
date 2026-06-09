import type { CommandGroup } from '../../types/cli';
import { generateCommand } from './generate';
import { batchCommand } from './batch';

export const imageCommands: CommandGroup = {
  name: 'image',
  description: 'Image generation and editing',
  commands: [
    generateCommand,
    batchCommand,
  ],
};
