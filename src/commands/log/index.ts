import type { CommandGroup } from '../../types/cli';
import { showCommand } from './show';
import { listCommand } from './list';

export const logCommands: CommandGroup = {
  name: 'log',
  description: 'View and manage log files',
  commands: [
    showCommand,
    listCommand,
  ],
};
