import type { CommandGroup } from '../../types/cli';
import { schemaCommand } from './schema';
import { getCommand } from './get';
import { setCommand } from './set';
import { initCommand } from './init';

export const recipeCommands: CommandGroup = {
  name: 'recipe',
  description: 'Recipe configuration management (laoli-recipe skills)',
  commands: [
    initCommand,
    schemaCommand,
    getCommand,
    setCommand,
  ],
};
