import type { CommandGroup } from '../../types/cli';
import { generateCommand } from './generate';
import { editCommand } from './edit';
import { batchCommand } from './batch';

export const imagineCommands: CommandGroup = {
  name: 'imagine',
  description: 'Image generation and editing',
  commands: [
    generateCommand,
    editCommand,
    batchCommand,
  ],
};
