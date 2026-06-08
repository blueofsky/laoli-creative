import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const LOG_DIR = join(homedir(), '.laoli');
const LOG_FILE = join(LOG_DIR, 'laoli.log');

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

let currentLogLevel: LogLevel = LogLevel.INFO;

// 文件日志开关（默认关闭，需要时开启）
let fileLogging = false;

export function enableFileLogging(): void {
  fileLogging = true;
  if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });
}

export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

function write(level: string, message: string, ...args: any[]): void {
  const timestamp = new Date().toISOString();
  const extra = args.length > 0 ? ' ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') : '';
  const line = `[${timestamp}] [${level}] ${message}${extra}`;

  if (fileLogging) {
    try {
      appendFileSync(LOG_FILE, line + '\n', 'utf-8');
    } catch { /* ignore write errors */ }
  }
}

export function debug(message: string, ...args: any[]): void {
  if (currentLogLevel <= LogLevel.DEBUG) {
    console.debug(`[DEBUG] ${message}`, ...args);
    write('DEBUG', message, ...args);
  }
}

export function info(message: string, ...args: any[]): void {
  if (currentLogLevel <= LogLevel.INFO) {
    console.log(message, ...args);
    write('INFO', message, ...args);
  }
}

export function warn(message: string, ...args: any[]): void {
  if (currentLogLevel <= LogLevel.WARN) {
    console.warn(`Warning: ${message}`, ...args);
    write('WARN', message, ...args);
  }
}

export function error(message: string, ...args: any[]): void {
  if (currentLogLevel <= LogLevel.ERROR) {
    console.error(`Error: ${message}`, ...args);
    write('ERROR', message, ...args);
  }
}

export function success(message: string): void {
  console.log(`✓ ${message}`);
  write('SUCCESS', message);
}

export function json(data: any): void {
  const str = JSON.stringify(data, null, 2);
  console.log(str);
  write('JSON', str);
}
