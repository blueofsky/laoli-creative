import type { Command, Config, Flags } from '../../types/cli';
import { readFileSync, readdirSync, statSync, existsSync, watchFile } from 'fs';
import { open } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { info } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';

const LOG_DIR = join(homedir(), '.laoli', 'logs');
const LOG_PREFIX = 'laoli.';

function getLogFiles(): { name: string; path: string; size: number; mtime: Date }[] {
  if (!existsSync(LOG_DIR)) return [];
  return readdirSync(LOG_DIR)
    .filter(f => f.endsWith('.log'))
    .map(f => {
      const path = join(LOG_DIR, f);
      const stat = statSync(path);
      return { name: f, path, size: stat.size, mtime: stat.mtime };
    })
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
}

function getLogFileByDate(dateStr: string): string | null {
  const files = getLogFiles();
  const candidates = files.filter(f => {
    const name = f.name.replace(/\.log$/, '');
    return name === `${LOG_PREFIX}${dateStr}` || name === dateStr;
  });
  return candidates.length > 0 ? candidates[0].path : null;
}

function readTail(filePath: string, lines: number): string {
  const content = readFileSync(filePath, 'utf-8');
  const allLines = content.split('\n');
  while (allLines.length > 0 && allLines[allLines.length - 1] === '') allLines.pop();
  const tail = allLines.slice(-lines);
  return tail.join('\n') + (tail.length > 0 ? '\n' : '');
}

async function followLog(filePath: string, startPos: number): Promise<void> {
  const fd = await open(filePath, 'r');
  let pos = startPos;
  const stat = await fd.stat();
  if (stat.size > pos) {
    const buf = Buffer.alloc(stat.size - pos);
    await fd.read(buf, 0, buf.length, pos);
    process.stdout.write(buf.toString());
    pos = stat.size;
  }
  await fd.close();

  watchFile(filePath, { interval: 500 }, (curr) => {
    if (curr.size > pos) {
      try {
        const content = readFileSync(filePath, 'utf-8');
        process.stdout.write(content.slice(pos));
        pos = curr.size;
      } catch { /* file may be rotated */ }
    }
  });

  await new Promise(() => {});
}

function printFileList(): void {
  if (!existsSync(LOG_DIR)) {
    info('No log files found.');
    return;
  }
  const files = getLogFiles();
  if (files.length === 0) {
    info('No log files found.');
    return;
  }

  console.log('\nLog Files:\n');
  for (const f of files) {
    const label = f.name === 'laoli.log'
      ? 'today'
      : f.name.replace(/^laoli\./, '').replace(/\.log$/, '');
    const marker = f.name === 'laoli.log' ? ' ▶' : '  ';
    const size = f.size < 1024 ? `${f.size}B` : f.size < 1048576 ? `${(f.size / 1024).toFixed(1)}KB` : `${(f.size / 1048576).toFixed(1)}MB`;
    console.log(`  ${marker} ${label.padEnd(14)} ${size.padStart(8)}  ${f.name}`);
  }
  console.log('');
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export const logCommand: Command = {
  name: 'logs',
  description: 'View and manage log files',
  usage: 'laoli logs [options]',
  options: [
    { flag: '--lines, -n <N>', description: 'Number of lines from the end. Default 50', type: 'number' },
    { flag: '--date <date>', description: 'Log date (e.g., 2026-06-09). Default: today' },
    { flag: '--follow, -f', description: 'Follow log output (tail -f mode)', type: 'boolean' },
    { flag: '--all', description: 'Show entire log file', type: 'boolean' },
    { flag: '--list, -l', description: 'List available log files', type: 'boolean' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
  ],
  examples: [
    'laoli logs',
    'laoli logs -n 100',
    'laoli logs -f',
    'laoli logs --date 2026-06-08',
    'laoli logs --list',
    'laoli logs --all',
  ],
  execute: async (_config: Config, flags: Flags) => {
    // --list / -l → 列出日志文件
    if (flags.list || flags.l) {
      const isJson = flags.json as boolean;
      if (!existsSync(LOG_DIR)) {
        info('No log files found.');
        return;
      }
      const files = getLogFiles();
      if (files.length === 0) {
        info('No log files found.');
        return;
      }
      if (isJson) {
        console.log(JSON.stringify(files.map(f => ({
          name: f.name,
          size: f.size,
          sizeHuman: formatSize(f.size),
          modified: f.mtime.toISOString(),
        })), null, 2));
      } else {
        printFileList();
      }
      return;
    }

    // 默认显示日志内容
    const dateStr = flags.date as string | undefined;
    const isFollow = (flags.follow as boolean) || (flags.f as boolean);
    const showAll = flags.all as boolean;
    const lines = flags.lines ? parseInt(flags.lines as string, 10) : (flags.n ? parseInt(flags.n as string, 10) : 50);

    if (!existsSync(LOG_DIR)) {
      info('No log files found. Log directory does not exist yet.');
      return;
    }

    const files = getLogFiles();
    if (files.length === 0) {
      info('No log files found.');
      return;
    }

    let targetFile: string;
    if (dateStr) {
      const matched = getLogFileByDate(dateStr);
      if (!matched) {
        throw new CLIError(`No log file found for date: ${dateStr}`, ExitCode.INVALID_ARGS);
      }
      targetFile = matched;
    } else {
      targetFile = files[0].path;
    }

    if (isFollow) {
      const startContent = showAll
        ? readFileSync(targetFile, 'utf-8')
        : readTail(targetFile, lines);
      process.stdout.write(startContent);
      if (!startContent.endsWith('\n')) process.stdout.write('\n');

      // follow 从当前文件末尾开始监听，避免重复输出已显示的内容
      const pos = statSync(targetFile).size;
      await followLog(targetFile, pos);
    } else {
      const content = showAll ? readFileSync(targetFile, 'utf-8') : readTail(targetFile, lines);
      if (content) {
        console.log(content);
      } else {
        info('Log file is empty.');
      }
    }
  },
};
