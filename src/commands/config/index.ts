import type { CommandGroup } from '../../types/cli';
import { showCommand } from './show';
import { getCommand } from './get';
import { setCommand } from './set';
import { exportSchemaCommand } from './export-schema';

export const configCommands: CommandGroup = {
  name: 'config',
  description: 'Configuration management',
  commands: [
    showCommand,
    getCommand,
    setCommand,
    exportSchemaCommand,
  ],
};
