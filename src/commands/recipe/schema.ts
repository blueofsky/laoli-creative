import { readFileSync } from 'fs';
import type { Command, Config, Flags } from '../../types/cli';
import { json } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';
import { loadSkillDefs } from '../../utils/recipe-schema';

export const schemaCommand: Command = {
  name: 'schema',
  description: 'Show recipe schema definition',
  usage: 'laoli recipe schema [--skill <name>]',
  options: [
    { flag: '--skill <name>', description: 'Show schema for a specific skill (e.g., laoli-article-illustrator)' },
  ],
  examples: [
    'laoli recipe schema',
    'laoli recipe schema --skill laoli-article-illustrator',
    'laoli recipe schema --skill laoli-cover-image',
  ],
  execute: async (config: Config, flags: Flags) => {
    const skill = flags.skill as string | undefined;

    const schemaPath = config.recipe?.schema;
    if (!schemaPath) {
      throw new CLIError(
        'recipe.schema path not configured. Use: laoli config set --key recipe.schema --value /path/to/recipe.schema.json',
        ExitCode.CONFIG_ERROR,
      );
    }

    if (skill) {
      const skillDefs = loadSkillDefs(schemaPath);
      const skillSchema = skillDefs[skill];
      if (!skillSchema) {
        throw new CLIError(`Skill "${skill}" not found in recipe schema`, ExitCode.CONFIG_ERROR);
      }
      json({ skill, schema: skillSchema, source: schemaPath });
    } else {
      const content = readFileSync(schemaPath, 'utf-8');
      json(JSON.parse(content));
    }
  },
};
