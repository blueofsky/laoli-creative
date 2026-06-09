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

/**
 * 从 ~/.laoli/log4js.json 加载 log4js 配置（仅文件 appender）。
 * log4js 只负责写文件，控制台输出由下方函数直接用 console 处理。
 */
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

/** 初始化 log4js（仅文件日志） */
export function initLogging(): void {
  if (configured) return;
  if (!existsSync(LAOLI_DIR)) mkdirSync(LAOLI_DIR, { recursive: true });
  log4js.configure(loadLog4jsConfig('info'));
  logger = log4js.getLogger();
  configured = true;
}

/** 运行时修改日志级别 */
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

// ───── 导出的日志函数：控制台输出到 stdout，同时写文件 ─────

/** DEBUG 仅写文件，不输出到控制台 */
export function debug(message: string, ...args: any[]): void {
  getLogger().debug(message, ...args);
}

/** INFO 同时输出到控制台和文件 */
export function info(message: string, ...args: any[]): void {
  const full = args.length > 0 ? `${message} ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')}` : message;
  console.log(full);
  getLogger().info(message, ...args);
}

/** WARN 同时输出到控制台和文件 */
export function warn(message: string, ...args: any[]): void {
  console.warn(message, ...args);
  getLogger().warn(message, ...args);
}

/** ERROR 同时输出到控制台和文件 */
export function error(message: string, ...args: any[]): void {
  console.error(`Error: ${message}`, ...args);
  getLogger().error(message, ...args);
}

/** SUCCESS 同时输出到控制台和文件 */
export function success(message: string): void {
  console.log(`✓ ${message}`);
  getLogger().info(`✓ ${message}`);
}

/** JSON 纯输出到控制台，不写文件 */
export function json(data: any): void {
  console.log(JSON.stringify(data, null, 2));
}
