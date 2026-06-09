import type { Command, Config, Flags } from '../../types/cli';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { info } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';

const LOG_DIR = join(homedir(), '.laoli', 'logs');
const LOG_PREFIX = 'laoli.'; // 文件名前缀，如 laoli.2026-06-09.log

/** 获取日志目录下所有日志文件（按修改时间倒序） */
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

/** 获取指定日期的日志文件路径 */
function getLogFileByDate(dateStr: string): string | null {
  const files = getLogFiles();
  // 支持多种匹配：laoli.2026-06-09.log、laoli.2026-06-09、2026-06-09.log、2026-06-09
  const candidates = files.filter(f => {
    const name = f.name.replace(/\.log$/, '');
    return name === `${LOG_PREFIX}${dateStr}` || name === dateStr;
  });
  return candidates.length > 0 ? candidates[0].path : null;
}

/** 读文件的最后 N 行 */
function readTail(filePath: string, lines: number): string {
  const content = readFileSync(filePath, 'utf-8');
  const allLines = content.split('\n');
  // 移除末尾空行
  while (allLines.length > 0 && allLines[allLines.length - 1] === '') allLines.pop();
  const tail = allLines.slice(-lines);
  return tail.join('\n') + (tail.length > 0 ? '\n' : '');
}

/** 滚动监听日志文件（类似 tail -f） */
async function followLog(filePath: string, startPos: number): Promise<void> {
  const { open } = await import('fs/promises');
  const { watchFile } = await import('fs');

  let pos = startPos;
  const fd = await open(filePath, 'r');

  // 先输出当前位置之后的内容
  const stat = await fd.stat();
  if (stat.size > pos) {
    const buf = Buffer.alloc(stat.size - pos);
    await fd.read(buf, 0, buf.length, pos);
    process.stdout.write(buf.toString());
    pos = stat.size;
  }
  await fd.close();

  // 用 watchFile 监听变化
  watchFile(filePath, { interval: 500 }, (curr) => {
    if (curr.size > pos) {
      try {
        const content = readFileSync(filePath, 'utf-8');
        const newContent = content.slice(pos);
        process.stdout.write(newContent);
        pos = curr.size;
      } catch {
        // 文件可能被轮转，忽略
      }
    }
  });

  // 保持进程运行
  await new Promise(() => {});
}

export const showCommand: Command = {
  name: 'show',
  description: 'Show log file content',
  usage: 'laoli log show [options]',
  options: [
    { flag: '--lines <n>', description: 'Number of lines from the end. Default 50', type: 'number' },
    { flag: '--date <date>', description: 'Log date (e.g., 2026-06-09). Default: today' },
    { flag: '--all', description: 'Show entire log file', type: 'boolean' },
    { flag: '--follow, -f', description: 'Follow log output (tail -f mode)', type: 'boolean' },
  ],
  examples: [
    'laoli log show',
    'laoli log show --lines 100',
    'laoli log show --date 2026-06-08',
    'laoli log show --follow',
    'laoli log show --all',
  ],
  execute: async (_config: Config, flags: Flags) => {
    const dateStr = flags.date as string | undefined;
    const isFollow = (flags.follow as boolean) || (flags.f as boolean);
    const showAll = flags.all as boolean;
    const lines = flags.lines ? parseInt(flags.lines as string, 10) : 50;

    if (!existsSync(LOG_DIR)) {
      info('No log files found. Log directory does not exist yet.');
      return;
    }

    const files = getLogFiles();
    if (files.length === 0) {
      info('No log files found.');
      return;
    }

    // 确定目标文件
    let targetFile: string;
    if (dateStr) {
      const matched = getLogFileByDate(dateStr);
      if (!matched) {
        throw new CLIError(`No log file found for date: ${dateStr}`, ExitCode.INVALID_ARGS);
      }
      targetFile = matched;
    } else {
      targetFile = files[0].path; // 最新的文件
    }

    if (isFollow) {
      // 先输出最后 N 行，然后进入监听模式
      const startContent = showAll
        ? readFileSync(targetFile, 'utf-8')
        : readTail(targetFile, lines);
      process.stdout.write(startContent);
      if (!startContent.endsWith('\n')) process.stdout.write('\n');

      const pos = showAll ? 0 : Math.max(0, statSync(targetFile).size - getTailBytes(targetFile, lines));
      await followLog(targetFile, showAll ? 0 : pos);
    } else {
      // 一次性输出
      const content = showAll ? readFileSync(targetFile, 'utf-8') : readTail(targetFile, lines);
      if (content) {
        console.log(content);
      } else {
        info('Log file is empty.');
      }
    }
  },
};

/** 计算文件末尾 N 行所占字节数 */
function getTailBytes(filePath: string, lines: number): number {
  const content = readFileSync(filePath, 'utf-8');
  const allLines = content.split('\n');
  while (allLines.length > 0 && allLines[allLines.length - 1] === '') allLines.pop();
  const tail = allLines.slice(-lines);
  return tail.join('\n').length + (tail.length > 0 ? 1 : 0);
}
