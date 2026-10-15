/**
 * In-Memory Diagnostic Error Logger (errorLogger.ts)
 * Maintains a circular buffer of the last 50 events/errors for debugging and crash diagnosis.
 */

import { AppError, ErrorSeverity } from './AppError';

export interface LogEntry {
  id: string;
  timestamp: string;
  severity: ErrorSeverity;
  source: string;
  message: string;
  stack?: string;
  metadata?: Record<string, unknown>;
}

const MAX_LOG_ENTRIES = 50;
const logBuffer: LogEntry[] = [];
const subscribers = new Set<(entries: LogEntry[]) => void>();

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export const errorLogger = {
  log(severity: ErrorSeverity, source: string, message: string, options?: { stack?: string; metadata?: Record<string, unknown> }) {
    const entry: LogEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      severity,
      source,
      message,
      stack: options?.stack,
      metadata: options?.metadata,
    };

    logBuffer.unshift(entry);
    if (logBuffer.length > MAX_LOG_ENTRIES) {
      logBuffer.pop();
    }

    // Mirror to native console with appropriate log level
    const prefix = `[DRC ${source}]`;
    if (severity === 'fatal' || severity === 'error') {
      console.error(prefix, message, options?.metadata || '');
    } else if (severity === 'warning') {
      console.warn(prefix, message, options?.metadata || '');
    } else {
      console.info(prefix, message, options?.metadata || '');
    }

    subscribers.forEach((cb) => {
      try {
        cb([...logBuffer]);
      } catch {}
    });
  },

  error(source: string, errOrMsg: unknown, metadata?: Record<string, unknown>) {
    let message = 'Unknown error';
    let stack: string | undefined;

    if (errOrMsg instanceof AppError) {
      message = errOrMsg.message;
      stack = errOrMsg.stack;
      metadata = { ...errOrMsg.metadata, ...metadata };
    } else if (errOrMsg instanceof Error) {
      message = errOrMsg.message;
      stack = errOrMsg.stack;
    } else if (typeof errOrMsg === 'string') {
      message = errOrMsg;
    }

    this.log('error', source, message, { stack, metadata });
  },

  warn(source: string, message: string, metadata?: Record<string, unknown>) {
    this.log('warning', source, message, { metadata });
  },

  info(source: string, message: string, metadata?: Record<string, unknown>) {
    this.log('info', source, message, { metadata });
  },

  getRecentLogs(): LogEntry[] {
    return [...logBuffer];
  },

  clear() {
    logBuffer.length = 0;
    subscribers.forEach((cb) => cb([]));
  },

  subscribe(callback: (entries: LogEntry[]) => void): () => void {
    subscribers.add(callback);
    callback([...logBuffer]);
    return () => subscribers.delete(callback);
  },

  exportDiagnosticsReport(): string {
    const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
    const location = typeof window !== 'undefined' ? window.location.href : 'Unknown';

    const header = [
      '# DRC System Diagnostics Report',
      `Generated: ${new Date().toISOString()}`,
      `URL: ${location}`,
      `Online Status: ${online ? 'ONLINE' : 'OFFLINE'}`,
      `User Agent: ${ua}`,
      '',
      `## Recent Logged Events (${logBuffer.length})`,
      '',
    ].join('\n');

    const logs = logBuffer
      .map(
        (log, idx) =>
          `### ${idx + 1}. [${log.severity.toUpperCase()}] ${log.timestamp} - ${log.source}\n` +
          `**Message:** ${log.message}\n` +
          (log.metadata ? `**Metadata:** \`\`\`json\n${JSON.stringify(log.metadata, null, 2)}\n\`\`\`\n` : '') +
          (log.stack ? `**Stack:**\n\`\`\`\n${log.stack.slice(0, 500)}\n\`\`\`\n` : '')
      )
      .join('\n');

    return header + (logs || '_No errors logged in the current session._');
  },
};
