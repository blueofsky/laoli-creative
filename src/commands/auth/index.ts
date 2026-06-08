import type { CommandGroup } from '../../types/cli';
import { loginCommand } from './login';
import { logoutCommand } from './logout';
import { statusCommand } from './status';

export const authCommands: CommandGroup = {
  name: 'auth',
  description: 'Authentication management',
  commands: [
    loginCommand,
    logoutCommand,
    statusCommand,
  ],
};
