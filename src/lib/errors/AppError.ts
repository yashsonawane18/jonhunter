/**
 * Standardized Application & Network Error Hierarchy (AppError.ts)
 * Provides type-safe error classification, user-facing messages, and retryability flags.
 */

export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info';

export type ApiErrorCategory =
  | 'NETWORK_OFFLINE'
  | 'TIMEOUT'
  | 'RATE_LIMITED'
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'NOT_FOUND'
  | 'SERVER_ERROR'
  | 'VALIDATION'
  | 'UNKNOWN';

export interface AppErrorOptions {
  cause?: unknown;
  severity?: ErrorSeverity;
  userMessage?: string;
  metadata?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly severity: ErrorSeverity;
  public readonly userMessage: string;
  public readonly metadata?: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = 'AppError';
    this.severity = options.severity || 'error';
    this.userMessage = options.userMessage || message;
    this.metadata = options.metadata;
    this.timestamp = new Date().toISOString();

    if (options.cause) {
      (this as any).cause = options.cause;
    }
  }
}

export class ApiError extends AppError {
  public readonly statusCode?: number;
  public readonly category: ApiErrorCategory;
  public readonly isRetryable: boolean;
  public readonly endpoint?: string;

  constructor(
    message: string,
    options: {
      statusCode?: number;
      category?: ApiErrorCategory;
      isRetryable?: boolean;
      endpoint?: string;
      userMessage?: string;
      cause?: unknown;
      metadata?: Record<string, unknown>;
    } = {}
  ) {
    const inferredCategory: ApiErrorCategory =
      options.category ||
      (options.statusCode === 401
        ? 'AUTHENTICATION'
        : options.statusCode === 403
        ? 'AUTHORIZATION'
        : options.statusCode === 404
        ? 'NOT_FOUND'
        : options.statusCode === 429
        ? 'RATE_LIMITED'
        : options.statusCode && options.statusCode >= 500
        ? 'SERVER_ERROR'
        : 'UNKNOWN');

    const inferredRetryable =
      options.isRetryable ??
      (inferredCategory === 'TIMEOUT' ||
        inferredCategory === 'NETWORK_OFFLINE' ||
        inferredCategory === 'SERVER_ERROR');

    const defaultUserMessage =
      options.userMessage ||
      (inferredCategory === 'NETWORK_OFFLINE'
        ? 'Unable to connect to the server. Please check your internet connection.'
        : inferredCategory === 'TIMEOUT'
        ? 'Request timed out while contacting the job engine. Please try again.'
        : inferredCategory === 'RATE_LIMITED'
        ? 'Too many requests. Please wait a moment before trying again.'
        : inferredCategory === 'SERVER_ERROR'
        ? 'The job discovery service is momentarily busy. Retrying with local cache...'
        : message);

    super(message, {
      cause: options.cause,
      severity: options.statusCode && options.statusCode >= 500 ? 'error' : 'warning',
      userMessage: defaultUserMessage,
      metadata: {
        statusCode: options.statusCode,
        endpoint: options.endpoint,
        category: inferredCategory,
        ...options.metadata,
      },
    });

    this.name = 'ApiError';
    this.statusCode = options.statusCode;
    this.category = inferredCategory;
    this.isRetryable = inferredRetryable;
    this.endpoint = options.endpoint;
  }
}

export class StorageError extends AppError {
  public readonly isQuotaExceeded: boolean;

  constructor(message: string, isQuotaExceeded = false, cause?: unknown) {
    super(message, {
      cause,
      severity: 'warning',
      userMessage: isQuotaExceeded
        ? 'Local storage quota reached. Older search results were cleaned automatically.'
        : 'Storage operation failed.',
    });
    this.name = 'StorageError';
    this.isQuotaExceeded = isQuotaExceeded;
  }
}

export class FileValidationError extends AppError {
  constructor(message: string, userMessage?: string) {
    super(message, {
      severity: 'warning',
      userMessage: userMessage || message,
    });
    this.name = 'FileValidationError';
  }
}

/** Predicate helper to check if an unknown error was caused by offline / network drop */
export function isNetworkError(err: unknown): boolean {
  if (!err) return false;
  if (err instanceof ApiError && (err.category === 'NETWORK_OFFLINE' || err.category === 'TIMEOUT')) {
    return true;
  }
  const msg = String((err as any)?.message || err).toLowerCase();
  return (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('connection refused') ||
    msg.includes('abort') ||
    msg.includes('timed out') ||
    (typeof navigator !== 'undefined' && !navigator.onLine)
  );
}

/** Returns a clean, user-friendly message for any caught error */
export function getUserFriendlyErrorMessage(err: unknown, fallback = 'An unexpected error occurred.'): string {
  if (!err) return fallback;
  if (err instanceof AppError && err.userMessage) {
    return err.userMessage;
  }
  if (typeof (err as any)?.message === 'string' && (err as any).message.trim().length > 0) {
    const raw = (err as any).message;
    // Suppress ugly stack trace strings or JSON dumps in user toasts
    if (raw.startsWith('{') || raw.includes('at ') || raw.length > 150) {
      return fallback;
    }
    return raw;
  }
  return fallback;
}
