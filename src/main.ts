#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { CLI } from './cli';
import { imageCommands } from './commands/image';
import { ttsCommands } from './commands/tts';
import { videoCommands } from './commands/video';
import { musicCommands } from './commands/music';
import { picgoCommands } from './commands/picgo';
import { configCommands } from './commands/config';
import { authCommands } from './commands/auth';
import { handleError } from './errors/handler';
import { logCommands } from './commands/logs';
import { visionCommands } from './commands/vision';
import { asrCommands } from './commands/asr';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgPath = join(__dirname, '..', 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

const cli = new CLI({
  name: 'laoli',
  description: 'Laoli Recipe - AI Content Creation Toolkit',
  version: pkg.version,
  commands: [
    // 内容生成
    imageCommands,
    videoCommands,
    musicCommands,
    ttsCommands,
    // 内容理解
    visionCommands,
    asrCommands,
    // 工具
    picgoCommands,
    configCommands,
    logCommands,
    authCommands,
  ],
});

cli.run(process.argv.slice(2)).catch(handleError);
