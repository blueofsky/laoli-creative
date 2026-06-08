import type { Command, Config, Flags } from '../../types/cli';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { success, json } from '../../utils/logger';

export const exportSchemaCommand: Command = {
  name: 'export-schema',
  description: 'Export configuration JSON Schema',
  usage: 'laoli config export-schema [--output <path>]',
  options: [
    { flag: '--output <path>', description: 'Output file path (default: print to stdout)' },
  ],
  examples: [
    'laoli config export-schema',
    'laoli config export-schema --output ./myschema.json',
  ],
  execute: async (_config: Config, flags: Flags) => {
    const outputPath = flags.output as string;

    // 加载内置 schema（相对于项目根目录）
    const schemaPath = new URL('../../../config/config.schema.json', import.meta.url);
    const schema = readFileSync(schemaPath, 'utf-8');

    if (outputPath) {
      const dir = dirname(outputPath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(outputPath, schema, 'utf-8');
      success(`Schema exported to ${outputPath}`);
    } else {
      json(JSON.parse(schema));
    }
  },
};
