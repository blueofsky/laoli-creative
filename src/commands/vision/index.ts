import type { CommandGroup } from '../../types/cli';
import { visionImageCommand } from './image';
import { visionVideoCommand } from './video';

export const visionCommands: CommandGroup = {
  name: 'vision',
  description: 'Image and video understanding (vision AI)',
  commands: [
    visionImageCommand,
    visionVideoCommand,
  ],
};
