/**
 * Simple logger utility
 * Can be replaced with Winston, Bunyan, or Cloud Logging later
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private formatLog(level: LogLevel, message: string, metadata?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata
    };
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    const log = this.formatLog('info', message, metadata);
    console.log(`[${log.timestamp}] INFO:`, message, metadata || '');
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    const log = this.formatLog('warn', message, metadata);
    console.warn(`[${log.timestamp}] WARN:`, message, metadata || '');
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    const log = this.formatLog('error', message, metadata);
    console.error(`[${log.timestamp}] ERROR:`, message, metadata || '');
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    const log = this.formatLog('debug', message, metadata);
    console.debug(`[${log.timestamp}] DEBUG:`, message, metadata || '');
  }
}

export const logger = new Logger();
