/**
 * @fileoverview Simplified Error Handling Utilities
 * Provides basic error types and network error detection
 */

export enum ErrorCode {
  // Data related errors
  ASSET_NOT_FOUND = "ASSET_NOT_FOUND",
  TOKEN_NOT_FOUND = "TOKEN_NOT_FOUND",
  DATA_LOAD_FAILED = "DATA_LOAD_FAILED",
  INVALID_DATA_FORMAT = "INVALID_DATA_FORMAT",

  // Service related errors
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  CACHE_ERROR = "CACHE_ERROR",
  TRANSFORM_ERROR = "TRANSFORM_ERROR",

  // Business logic errors
  INVALID_CALCULATION = "INVALID_CALCULATION",
  INSUFFICIENT_DATA = "INSUFFICIENT_DATA",
  BUSINESS_RULE_VIOLATION = "BUSINESS_RULE_VIOLATION",

  // Network related errors
  NETWORK_ERROR = "NETWORK_ERROR",
  API_ERROR = "API_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",

  // User related errors
  INVALID_INPUT = "INVALID_INPUT",
  UNAUTHORIZED = "UNAUTHORIZED",
  PERMISSION_DENIED = "PERMISSION_DENIED",
}

export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    public context?: Record<string, any>,
    public cause?: Error,
  ) {
    super(message);
    this.name = "AppError";

    // Maintain stack trace (in V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      context: this.context,
      stack: this.stack,
      cause: this.cause?.message,
    };
  }
}

// Error boundary helpers for async operations
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorContext: { service: string; operation: string },
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    console.error(`${errorContext.service} error during ${errorContext.operation}:`, error);
    return null;
  }
}
