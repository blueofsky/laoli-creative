import type { CommandGroup } from '../../types/cli';
import { uploadCommand } from './upload';
import { configCommand } from './config';

export const picgoCommands: CommandGroup = {
  name: 'picgo',
  description: 'Image upload to GitHub',
  commands: [
    uploadCommand,
    configCommand,
  ],
};
