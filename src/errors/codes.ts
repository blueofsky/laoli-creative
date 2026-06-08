export enum ExitCode {
  SUCCESS = 0,
  GENERAL = 1,
  INVALID_ARGS = 2,
  AUTH_ERROR = 3,
  PROVIDER_ERROR = 4,
  NETWORK_ERROR = 5,
  TIMEOUT = 6,
  FILE_ERROR = 7,
  CONFIG_ERROR = 8,
}

export class CLIError extends Error {
  code: ExitCode;
  details?: Record<string, any>;

  constructor(message: string, code: ExitCode = ExitCode.GENERAL, details?: Record<string, any>) {
    super(message);
    this.name = 'CLIError';
    this.code = code;
    this.details = details;
  }
}

export class AuthError extends CLIError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ExitCode.AUTH_ERROR, details);
    this.name = 'AuthError';
  }
}

export class ProviderError extends CLIError {
  provider: string;
  statusCode?: number;

  constructor(message: string, provider: string, statusCode?: number, details?: Record<string, any>) {
    super(message, ExitCode.PROVIDER_ERROR, { ...details, provider, statusCode });
    this.name = 'ProviderError';
    this.provider = provider;
    this.statusCode = statusCode;
  }
}

export class NetworkError extends CLIError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ExitCode.NETWORK_ERROR, details);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends CLIError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ExitCode.TIMEOUT, details);
    this.name = 'TimeoutError';
  }
}

export class FileError extends CLIError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ExitCode.FILE_ERROR, details);
    this.name = 'FileError';
  }
}

export class ConfigError extends CLIError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ExitCode.CONFIG_ERROR, details);
    this.name = 'ConfigError';
  }
}
