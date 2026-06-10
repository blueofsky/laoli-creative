import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { Command, Config, Flags } from '../../types/cli';
import { success } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';
import { loadSkillDefs } from '../../utils/recipe-schema';

const RECIPES_DIR = join(homedir(), '.laoli');
const RECIPES_FILE = join(RECIPES_DIR, 'recipes.json');

// 从 schema property 定义中提取默认值
function extractDefaults(properties: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, prop] of Object.entries(properties)) {
    // 如果是对象类型，递归遍历
    if (prop.properties) {
      result[key] = extractDefaults(prop.properties);
      continue;
    }

    // 有 default 字段 → 取默认值
    if ('default' in prop) {
      result[key] = prop.default;
    }
  }

  return result;
}

// 加载 schema 并获取所有 skill 定义

export const initCommand: Command = {
  name: 'init',
  description: 'Initialize recipes.json with default values from recipe schema',
  usage: 'laoli recipe init [--skill <name>] [--force]',
  options: [
    { flag: '--skill <name>', description: 'Reset only a specific skill to defaults' },
    { flag: '--force', description: 'Overwrite existing recipes.json', type: 'boolean' },
  ],
  examples: [
    'laoli recipe init',
    'laoli recipe init --force',
    'laoli recipe init --skill laoli-article-illustrator',
  ],
  execute: async (config: Config, _flags: Flags) => {
    const skill = _flags.skill as string | undefined;
    const force = _flags.force as boolean;

    // 读取 schema 路径
    const schemaPath = config.recipe?.schema;
    if (!schemaPath) {
      throw new CLIError(
        'recipe.schema path not configured. Use: laoli config set --key recipe.schema --value /path/to/recipe.schema.json',
        ExitCode.CONFIG_ERROR,
      );
    }

    const skillDefs = loadSkillDefs(schemaPath);

    if (skill) {
      // ── 单 skill 重置 ──
      const skillSchema = skillDefs[skill];
      if (!skillSchema) {
        throw new CLIError(`Skill "${skill}" not found in recipe schema`, ExitCode.INVALID_ARGS);
      }
      if (!skillSchema.properties) {
        throw new CLIError(`Skill "${skill}" has no configurable properties`, ExitCode.CONFIG_ERROR);
      }

      const defaults = extractDefaults(skillSchema.properties);

      // 加载现有 recipes.json（可能不存在）
      let recipes: any = {};
      if (existsSync(RECIPES_FILE)) {
        try {
          const content = readFileSync(RECIPES_FILE, 'utf-8');
          recipes = JSON.parse(content);
        } catch { /* ignore */ }
      }

      if (!recipes.skills) recipes.skills = {};
      recipes.skills[skill] = defaults;

      if (!existsSync(RECIPES_DIR)) {
        mkdirSync(RECIPES_DIR, { recursive: true });
      }
      writeFileSync(RECIPES_FILE, JSON.stringify(recipes, null, 2), 'utf-8');
      success(`Skill "${skill}" reset to defaults`);
    } else {
      // ── 全量初始化 ──
      if (!force && existsSync(RECIPES_FILE)) {
        throw new CLIError(
          `recipes.json already exists at ${RECIPES_FILE}. Use --force to overwrite.`,
          ExitCode.FILE_ERROR,
        );
      }

      const skills: Record<string, any> = {};
      for (const [skillName, skillSchema] of Object.entries(skillDefs) as [string, any][]) {
        if (skillSchema.properties) {
          skills[skillName] = extractDefaults(skillSchema.properties);
        }
      }

      const recipes = {
        version: 1,
        skills,
        mcp: {},
      };

      if (!existsSync(RECIPES_DIR)) {
        mkdirSync(RECIPES_DIR, { recursive: true });
      }
      writeFileSync(RECIPES_FILE, JSON.stringify(recipes, null, 2), 'utf-8');
      success(`recipes.json initialized with defaults from ${schemaPath}`);
    }
  },
};
