import log4js from 'log4js';
import { existsSync, readFileSync, mkdirSync } from 'fs';
import { join, isAbsolute, resolve, dirname } from 'path';
import { homedir } from 'os';

const LAOLI_DIR = join(homedir(), '.laoli');
const LOG4JS_CONFIG = join(LAOLI_DIR, 'log4js.json');
const DEFAULT_LOG_DIR = join(LAOLI_DIR, 'logs');

/** log4js 允许的日志级别 */
const VALID_LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

let logger: log4js.Logger | null = null;
let configured = false;

/**
 * 从 ~/.laoli/log4js.json 加载 log4js 配置。
 * 如果文件不存在，使用内建默认配置。
 */
function loadLog4jsConfig(defaultLevel: string): log4js.Configuration {
  if (existsSync(LOG4JS_CONFIG)) {
    try {
      const content = readFileSync(LOG4JS_CONFIG, 'utf-8');
      const config = JSON.parse(content) as log4js.Configuration;

      // 将 filename 中的相对路径解析为基于 ~/.laoli/ 的绝对路径
      resolveRelativePaths(config);

      return config;
    } catch (err) {
      console.error(`Failed to load ${LOG4JS_CONFIG}, using defaults:`, err);
    }
  }

  // 默认配置
  return {
    appenders: {
      out: { type: 'stdout', layout: { type: 'colored' } },
      outInfo: { type: 'logLevelFilter', appender: 'out', level: 'info' },
      file: {
        type: 'dateFile',
        filename: join(DEFAULT_LOG_DIR, 'laoli.log'),
        pattern: 'yyyy-MM-dd',
        keepFileExt: true,
        numBackups: 30,
      },
    },
    categories: {
      default: {
        appenders: ['outInfo', 'file'],
        level: defaultLevel,
      },
    },
  };
}

/**
 * 递归遍历 appender，将相对路径的 filename 解析为绝对路径。
 * 相对路径以 ~/.laoli/ 为基准。
 */
function resolveRelativePaths(config: log4js.Configuration): void {
  const baseDir = LAOLI_DIR;
  for (const [, appender] of Object.entries(config.appenders || {})) {
    const a = appender as Record<string, any>;
    if (a.filename && typeof a.filename === 'string' && !isAbsolute(a.filename)) {
      a.filename = resolve(baseDir, a.filename);
      // 确保目录存在
      const dir = dirname(a.filename);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    }
  }
}

/** 初始化 log4js */
export function initLogging(): void {
  if (configured) return;

  // 确保 ~/.laoli 目录存在
  if (!existsSync(LAOLI_DIR)) {
    mkdirSync(LAOLI_DIR, { recursive: true });
  }

  const config = loadLog4jsConfig('info');
  log4js.configure(config);
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

  if (!logger) {
    initLogging();
  }

  (logger as log4js.Logger).level = lvl;
}

export function getLogLevel(): string {
  return logger ? logger.level.toString() : 'info';
}

function getLogger(): log4js.Logger {
  if (!logger) {
    initLogging();
  }
  return logger!;
}

// ───── 导出的日志函数，与之前保持一致的 API ─────

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

export function json(data: any): void {
  console.log(JSON.stringify(data, null, 2));
}
