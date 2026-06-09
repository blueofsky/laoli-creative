import log4js from 'log4js';
import { existsSync, readFileSync, mkdirSync } from 'fs';
import { join, isAbsolute, resolve, dirname } from 'path';
import { homedir } from 'os';

const LAOLI_DIR = join(homedir(), '.laoli');
const LOG4JS_CONFIG = join(LAOLI_DIR, 'log4js.json');
const DEFAULT_LOG_DIR = join(LAOLI_DIR, 'logs');

const VALID_LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

let logger: log4js.Logger | null = null;
let configured = false;

function loadLog4jsConfig(defaultLevel: string): log4js.Configuration {
  if (existsSync(LOG4JS_CONFIG)) {
    try {
      const content = readFileSync(LOG4JS_CONFIG, 'utf-8');
      const config = JSON.parse(content) as log4js.Configuration;
      resolveRelativePaths(config);
      return config;
    } catch (err) {
      console.error(`Failed to load ${LOG4JS_CONFIG}, using defaults:`, err);
    }
  }

  return {
    appenders: {
      file: {
        type: 'dateFile',
        filename: join(DEFAULT_LOG_DIR, 'laoli.log'),
        pattern: 'yyyy-MM-dd',
        keepFileExt: true,
        numBackups: 30,
      },
    },
    categories: {
      default: { appenders: ['file'], level: defaultLevel },
    },
  };
}

function resolveRelativePaths(config: log4js.Configuration): void {
  const baseDir = LAOLI_DIR;
  for (const [, appender] of Object.entries(config.appenders || {})) {
    const a = appender as Record<string, any>;
    if (a.filename && typeof a.filename === 'string' && !isAbsolute(a.filename)) {
      a.filename = resolve(baseDir, a.filename);
      const dir = dirname(a.filename);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    }
  }
}

export function initLogging(): void {
  if (configured) return;
  if (!existsSync(LAOLI_DIR)) mkdirSync(LAOLI_DIR, { recursive: true });
  log4js.configure(loadLog4jsConfig('info'));
  logger = log4js.getLogger();
  configured = true;
}

export function setLogLevel(level: string): void {
  const lvl = level.toLowerCase();
  if (!VALID_LEVELS.includes(lvl)) {
    console.error(`Invalid log level: ${level}. Valid values: ${VALID_LEVELS.join(', ')}`);
    return;
  }
  if (!logger) initLogging();
  (logger as log4js.Logger).level = lvl;
}

export function getLogLevel(): string {
  return logger ? logger.level.toString() : 'info';
}

function getLogger(): log4js.Logger {
  if (!logger) initLogging();
  return logger!;
}

// ───── 所有日志函数只写文件，不输出到控制台 ─────

export function debug(message: string, ...args: any[]): void {
  getLogger().debug(message, ...args);
}

export function info(message: string, ...args: any[]): void {
  getLogger().info(message, ...args);
}

export function warn(message: string, ...args: any[]): void {
  getLogger().warn(message, ...args);
}

export function error(message: string, ...args: any[]): void {
  getLogger().error(message, ...args);
}

export function success(message: string): void {
  getLogger().info(`✓ ${message}`);
}

/** JSON 纯输出到控制台，不写文件 */
export function json(data: any): void {
  console.log(JSON.stringify(data, null, 2));
}
