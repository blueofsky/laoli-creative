import type { CommandGroup } from '../../types/cli';
import { logCommand } from './show';

export const logCommands: CommandGroup = {
  name: 'logs',
  description: 'View and manage log files',
  defaultCommand: 'logs',
  commands: [logCommand],
};
