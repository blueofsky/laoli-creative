import type { CommandGroup } from '../../types/cli';
import { generateCommand } from './generate';
import { queryCommand } from './query';
import { downloadCommand } from './download';
import { listCommand } from './list';

export const videoCommands: CommandGroup = {
  name: 'video',
  description: 'Video generation',
  commands: [
    generateCommand,
    queryCommand,
    downloadCommand,
    listCommand,
  ],
};
