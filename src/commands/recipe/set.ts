import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { Command, Config, Flags } from '../../types/cli';
import { success } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';

const RECIPES_DIR = join(homedir(), '.laoli');
const RECIPES_FILE = join(RECIPES_DIR, 'recipes.json');

// 从 recipe schema 中找到指定 key 的类型定义
function getSchemaType(schema: any, skill: string, keyParts: string[]): {
  type: string | null;
  enumValues?: string[];
} {
  let node = schema?.properties?.skills?.properties?.[skill]?.properties;
  if (!node) return { type: null };

  for (let i = 0; i < keyParts.length; i++) {
    const prop = node[keyParts[i]];
    if (!prop) return { type: null };
    // 如果还有下级，继续遍历 properties
    if (i < keyParts.length - 1) {
      node = prop.properties;
      if (!node) return { type: null };
    } else {
      // 到了目标字段
      const rawType = prop.type;
      // type 可能是 "string" 或 ["string", "null"] 等形式
      let typeName: string | null = null;
      if (typeof rawType === 'string') {
        typeName = rawType;
      } else if (Array.isArray(rawType)) {
        typeName = rawType.filter(t => t !== 'null')[0] || 'string';
      }
      return {
        type: typeName,
        enumValues: prop.enum,
      };
    }
  }
  return { type: null };
}

// 根据 schema 类型解析值
function parseBySchema(value: string, schemaType: string | null, enumValues?: string[]): any {
  // 如果有 enum 约束，校验值是否合法
  if (enumValues && enumValues.length > 0) {
    if (!enumValues.includes(value)) {
      throw new CLIError(
        `Invalid value "${value}". Allowed values: ${enumValues.join(', ')}`,
        ExitCode.INVALID_ARGS,
      );
    }
    // enum 值保持字符串原样
    return value;
  }

  // 按 schema 类型解析
  switch (schemaType) {
    case 'boolean':
      if (value === 'true') return true;
      if (value === 'false') return false;
      throw new CLIError(`Invalid boolean value "${value}". Use true or false`, ExitCode.INVALID_ARGS);
    case 'integer': {
      if (!/^-?\d+$/.test(value)) {
        throw new CLIError(`Invalid integer value "${value}"`, ExitCode.INVALID_ARGS);
      }
      return parseInt(value, 10);
    }
    case 'number': {
      if (!/^-?\d+(\.\d+)?$/.test(value)) {
        throw new CLIError(`Invalid number value "${value}"`, ExitCode.INVALID_ARGS);
      }
      return value.includes('.') ? parseFloat(value) : parseInt(value, 10);
    }
    default:
      // string 或未知类型 → 保持字符串
      return value;
  }
}

export const setCommand: Command = {
  name: 'set',
  description: 'Set recipe configuration value for a skill',
  usage: 'laoli recipe set --skill <name> --key <key> --value <value>',
  options: [
    { flag: '--skill <name>', description: 'Skill name (e.g., laoli-article-illustrator)', required: true },
    { flag: '--key <key>', description: 'Configuration key (e.g., watermark.enabled)', required: true },
    { flag: '--value <value>', description: 'Configuration value', required: true },
  ],
  examples: [
    'laoli recipe set --skill laoli-article-illustrator --key watermark.enabled --value true',
    'laoli recipe set --skill laoli-cover-image --key preferred_palette --value warm',
    'laoli recipe set --skill laoli-article-illustrator --key language --value zh',
  ],
  execute: async (config: Config, flags: Flags) => {
    const skill = flags.skill as string;
    const key = flags.key as string;

    const rawValue = flags.value;
    if (rawValue === undefined || rawValue === null || typeof rawValue !== 'string') {
      throw new CLIError('Missing required argument: --value', ExitCode.INVALID_ARGS);
    }
    const value = rawValue;

    if (!skill) throw new CLIError('Missing required argument: --skill', ExitCode.INVALID_ARGS);
    if (!key) throw new CLIError('Missing required argument: --key', ExitCode.INVALID_ARGS);

    // Parse the key into parts
    const parts = key.split('.');
    if (parts.length < 1) {
      throw new CLIError('Key must be in format: key.subkey (e.g., watermark.enabled)', ExitCode.INVALID_ARGS);
    }

    // 根据 schema 解析值
    let parsedValue: any = value;

    // 加载 recipe schema 做类型校验
    const schemaPath = config.recipe?.schema;
    if (schemaPath && existsSync(schemaPath)) {
      try {
        const schemaContent = readFileSync(schemaPath, 'utf-8');
        const schema = JSON.parse(schemaContent);
        const { type: schemaType, enumValues } = getSchemaType(schema, skill, parts);
        parsedValue = parseBySchema(value, schemaType, enumValues);
      } catch (err) {
        if (err instanceof CLIError) throw err;
        // schema 加载失败时，回退到无校验模式
      }
    }

    // Load existing recipes.json
    let recipes: any = {};
    if (existsSync(RECIPES_FILE)) {
      try {
        const content = readFileSync(RECIPES_FILE, 'utf-8');
        recipes = JSON.parse(content);
      } catch {
        // Start fresh if parse error
      }
    }

    // Ensure skills object exists
    if (!recipes.skills) recipes.skills = {};
    if (!recipes.skills[skill]) recipes.skills[skill] = {};

    // Navigate and set the value
    let current = recipes.skills[skill];
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = parsedValue;

    // Ensure directory exists
    if (!existsSync(RECIPES_DIR)) {
      mkdirSync(RECIPES_DIR, { recursive: true });
    }

    // Save
    writeFileSync(RECIPES_FILE, JSON.stringify(recipes, null, 2), 'utf-8');
    success(`Recipe configuration updated: [${skill}] ${key} = ${value}`);
  },
};
