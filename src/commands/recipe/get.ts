import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { Command, Config, Flags } from '../../types/cli';
import { json } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';
import { getValueByPath } from '../../utils/object';

const RECIPES_FILE = join(homedir(), '.laoli', 'recipes.json');

export const getCommand: Command = {
  name: 'get',
  description: 'Get recipe configuration for skills',
  usage: 'laoli recipe get [--skill <name>] [--key <key>]',
  options: [
    { flag: '--skill <name>', description: 'Get specific skill only (e.g., laoli-article-illustrator)' },
    { flag: '--key <key>', description: 'Get specific key within a skill (e.g., watermark.content)' },
  ],
  examples: [
    'laoli recipe get',
    'laoli recipe get --skill laoli-article-illustrator',
    'laoli recipe get --skill laoli-article-illustrator --key watermark.content',
    'laoli recipe get --skill laoli-article-illustrator --key watermark.enabled',
  ],
  execute: async (_config: Config, flags: Flags) => {
    const skill = flags.skill as string | undefined;
    const key = flags.key as string | undefined;

    // Load recipes.json
    if (!existsSync(RECIPES_FILE)) {
      console.log('No recipes.json found. Run "laoli recipe init" to create one.');
      return;
    }

    let recipes: Record<string, any>;
    try {
      const content = readFileSync(RECIPES_FILE, 'utf-8');
      recipes = JSON.parse(content);
    } catch {
      throw new CLIError(`Failed to parse ${RECIPES_FILE}`, ExitCode.CONFIG_ERROR);
    }

    if (skill) {
      const skillConfig = recipes.skills?.[skill];
      if (!skillConfig) {
        console.log(`No configuration found for skill "${skill}"`);
        return;
      }

      if (key) {
        const value = getValueByPath(skillConfig, key);
        if (value === undefined) {
          console.error(`Key "${key}" not found in skill "${skill}"`);
          process.exit(1);
        }
        if (typeof value === 'object' && value !== null) {
          json(value);
        } else {
          console.log(String(value));
        }
      } else {
        json({ skill, config: skillConfig });
      }
    } else {
      json(recipes);
    }
  },
};
