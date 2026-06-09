#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { CLI } from './cli';
import { imagineCommands } from './commands/imagine';
import { ttsCommands } from './commands/tts';
import { videoCommands } from './commands/video';
import { bgmCommands } from './commands/bgm';
import { picgoCommands } from './commands/picgo';
import { configCommands } from './commands/config';
import { authCommands } from './commands/auth';
import { handleError } from './errors/handler';
import { logCommands } from './commands/log';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgPath = join(__dirname, '..', 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

const cli = new CLI({
  name: 'laoli',
  description: 'Laoli Recipe - AI Content Creation Toolkit',
  version: pkg.version,
  commands: [
    imagineCommands,
    ttsCommands,
    videoCommands,
    bgmCommands,
    picgoCommands,
    configCommands,
    logCommands,
    authCommands,
  ],
});

cli.run(process.argv.slice(2)).catch(handleError);
