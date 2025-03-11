/**
 * CyberSentinel Logger
 * Centralized logging service with structured output and severity levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private logLevel: LogLevel = 'info';
  private appName = 'CyberSentinel';

  constructor() {
    const envLogLevel = process.env.LOG_LEVEL as LogLevel;
    if (envLogLevel && ['debug', 'info', 'warn', 'error'].includes(envLogLevel)) {
      this.logLevel = envLogLevel;
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, ...meta: any[]): void {
    if (this.shouldLog('debug')) {
      this.logToConsole('debug', message, ...meta);
    }
  }

  /**
   * Log info message
   */
  info(message: string, ...meta: any[]): void {
    if (this.shouldLog('info')) {
      this.logToConsole('info', message, ...meta);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, ...meta: any[]): void {
    if (this.shouldLog('warn')) {
      this.logToConsole('warn', message, ...meta);
    }
  }

  /**
   * Log error message
   */
  error(message: string, ...meta: any[]): void {
    if (this.shouldLog('error')) {
      this.logToConsole('error', message, ...meta);
    }
  }

  /**
   * Determine if message should be logged based on configured level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    return levels[level] >= levels[this.logLevel];
  }

  /**
   * Format and output log message
   */
  private logToConsole(level: LogLevel, message: string, ...meta: any[]): void {
    const timestamp = new Date().toISOString();
    
    // Structured log format
    const logEntry = {
      timestamp,
      level,
      app: this.appName,
      message,
      ...(meta.length && meta[0] instanceof Object ? meta[0] : {})
    };

    // Output to console with appropriate level method
    if (level === 'error') {
      console.error(JSON.stringify(logEntry));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(logEntry));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }
}

export const logger = new Logger();
