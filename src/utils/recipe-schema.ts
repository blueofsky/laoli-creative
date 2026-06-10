import { readFileSync, existsSync } from 'fs';
import { CLIError, ExitCode } from '../errors/codes';

/**
 * 加载 recipe schema 文件并返回所有 skill 定义
 * @param schemaPath recipe.schema.json 路径
 * @returns skills 节点下的所有 skill 定义
 */
export function loadSkillDefs(schemaPath: string): Record<string, any> {
  if (!existsSync(schemaPath)) {
    throw new CLIError(`Recipe schema file not found: ${schemaPath}`, ExitCode.FILE_ERROR);
  }
  let schema: any;
  try {
    const content = readFileSync(schemaPath, 'utf-8');
    schema = JSON.parse(content);
  } catch {
    throw new CLIError(`Failed to parse recipe schema: ${schemaPath}`, ExitCode.CONFIG_ERROR);
  }

  const skillDefs = schema?.properties?.skills?.properties;
  if (!skillDefs) {
    throw new CLIError('Invalid schema: no skills definitions found', ExitCode.CONFIG_ERROR);
  }
  return skillDefs;
}
