import type { CommandGroup } from '../../types/cli';
import { showCommand } from './show';
import { setCommand } from './set';

export const configCommands: CommandGroup = {
  name: 'config',
  description: 'Configuration management',
  commands: [
    showCommand,
    setCommand,
  ],
};
