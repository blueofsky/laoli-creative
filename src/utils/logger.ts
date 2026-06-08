export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

let currentLogLevel: LogLevel = LogLevel.INFO;

export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

export function debug(message: string, ...args: any[]): void {
  if (currentLogLevel <= LogLevel.DEBUG) {
    console.debug(`[DEBUG] ${message}`, ...args);
  }
}

export function info(message: string, ...args: any[]): void {
  if (currentLogLevel <= LogLevel.INFO) {
    console.log(message, ...args);
  }
}

export function warn(message: string, ...args: any[]): void {
  if (currentLogLevel <= LogLevel.WARN) {
    console.warn(`Warning: ${message}`, ...args);
  }
}

export function error(message: string, ...args: any[]): void {
  if (currentLogLevel <= LogLevel.ERROR) {
    console.error(`Error: ${message}`, ...args);
  }
}

export function success(message: string): void {
  console.log(`✓ ${message}`);
}

export function json(data: any): void {
  console.log(JSON.stringify(data, null, 2));
}
