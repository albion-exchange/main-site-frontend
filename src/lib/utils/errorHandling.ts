/**
 * Centralized error handling utilities
 * Provides consistent error management across the application
 */

export type ErrorSeverity = 'low' | 'medium' | 'high';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  assetId?: string;
  tokenAddress?: string;
  [key: string]: any;
}

/**
 * Application error class with structured information
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly context: ErrorContext;
  public readonly timestamp: Date;
  public readonly userMessage: string;

  constructor(
    message: string,
    code: string,
    severity: ErrorSeverity = 'medium',
    context: ErrorContext = {},
    userMessage?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.severity = severity;
    this.context = context;
    this.timestamp = new Date();
    this.userMessage = userMessage || this.getDefaultUserMessage();
  }

  private getDefaultUserMessage(): string {
    switch (this.severity) {
      case 'low':
        return 'Something went wrong, but you can continue using the application.';
      case 'medium':
        return 'We encountered an issue. Please try again.';
      case 'high':
        return 'A serious error occurred. Please refresh the page or contact support.';
      default:
        return 'An unexpected error occurred.';
    }
  }
}

/**
 * Predefined error types for common scenarios
 */
export const ErrorTypes = {
  // Data loading errors
  ASSET_LOAD_FAILED: 'ASSET_LOAD_FAILED',
  TOKEN_LOAD_FAILED: 'TOKEN_LOAD_FAILED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Data validation errors
  INVALID_ASSET_DATA: 'INVALID_ASSET_DATA',
  INVALID_TOKEN_DATA: 'INVALID_TOKEN_DATA',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // User interaction errors
  EXPORT_FAILED: 'EXPORT_FAILED',
  CALCULATION_ERROR: 'CALCULATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  
  // UI errors
  COMPONENT_RENDER_ERROR: 'COMPONENT_RENDER_ERROR',
  TOOLTIP_ERROR: 'TOOLTIP_ERROR',
  CHART_RENDER_ERROR: 'CHART_RENDER_ERROR'
} as const;

/**
 * Error reporting interface
 */
export interface ErrorReporter {
  report(error: AppError): void;
  reportRaw(error: Error, context?: ErrorContext): void;
}

/**
 * Console error reporter (development)
 */
class ConsoleErrorReporter implements ErrorReporter {
  report(error: AppError): void {
    const logLevel = error.severity === 'high' ? 'error' : 
                     error.severity === 'medium' ? 'warn' : 'info';
    
    console[logLevel](`[${error.code}] ${error.message}`, {
      severity: error.severity,
      context: error.context,
      timestamp: error.timestamp,
      stack: error.stack
    });
  }

  reportRaw(error: Error, context: ErrorContext = {}): void {
    console.error('Unhandled error:', error.message, {
      context,
      stack: error.stack,
      timestamp: new Date()
    });
  }
}

/**
 * Production error reporter (could integrate with external services)
 */
class ProductionErrorReporter implements ErrorReporter {
  report(error: AppError): void {
    // In production, this could send to external error tracking service
    // For now, we'll use console with structured logging
    const logData = {
      level: error.severity,
      message: error.message,
      code: error.code,
      context: error.context,
      timestamp: error.timestamp.toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Could send to external service here
    console.error('[ERROR_SERVICE]', JSON.stringify(logData));
  }

  reportRaw(error: Error, context: ErrorContext = {}): void {
    const logData = {
      level: 'error',
      message: error.message,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      stack: error.stack
    };

    console.error('[ERROR_SERVICE]', JSON.stringify(logData));
  }
}

/**
 * Error handler service
 */
class ErrorHandlerService {
  private reporter: ErrorReporter;
  private errorCallbacks: Array<(error: AppError) => void> = [];

  constructor() {
    // Use console reporter in development, production reporter in production
    const isProduction = typeof globalThis !== 'undefined' && 
      'process' in globalThis && 
      (globalThis as any).process?.env?.NODE_ENV === 'production';
    
    this.reporter = isProduction 
      ? new ProductionErrorReporter()
      : new ConsoleErrorReporter();
  }

  /**
   * Handle an AppError
   */
  handle(error: AppError): void {
    this.reporter.report(error);
    
    // Execute any registered callbacks
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });
  }

  /**
   * Handle a raw Error by wrapping it in AppError
   */
  handleRaw(error: Error, context: ErrorContext = {}): void {
    const appError = new AppError(
      error.message,
      'UNKNOWN_ERROR',
      'medium',
      context
    );
    
    this.handle(appError);
  }

  /**
   * Register a callback to be called when errors occur
   */
  onError(callback: (error: AppError) => void): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * Create predefined error types
   */
  createError = {
    assetLoadFailed: (assetId: string, originalError?: Error) => new AppError(
      `Failed to load asset data for ${assetId}`,
      ErrorTypes.ASSET_LOAD_FAILED,
      'high',
      { assetId, originalError: originalError?.message },
      'Failed to load asset data. Please refresh the page.'
    ),

    tokenLoadFailed: (tokenAddress: string, originalError?: Error) => new AppError(
      `Failed to load token data for ${tokenAddress}`,
      ErrorTypes.TOKEN_LOAD_FAILED,
      'medium',
      { tokenAddress, originalError: originalError?.message },
      'Failed to load token information. Some features may not work correctly.'
    ),

    exportFailed: (exportType: string, originalError?: Error) => new AppError(
      `Failed to export ${exportType} data`,
      ErrorTypes.EXPORT_FAILED,
      'low',
      { exportType, originalError: originalError?.message },
      'Export failed. Please try again.'
    ),

    calculationError: (calculation: string, data: any) => new AppError(
      `Calculation error in ${calculation}`,
      ErrorTypes.CALCULATION_ERROR,
      'medium',
      { calculation, data },
      'Calculation error. Some metrics may be incorrect.'
    ),

    validationError: (field: string, value: any) => new AppError(
      `Validation failed for ${field}`,
      ErrorTypes.MISSING_REQUIRED_FIELD,
      'low',
      { field, value },
      `Invalid data in ${field}. Please check your input.`
    )
  };
}

// Global error handler instance
export const errorHandler = new ErrorHandlerService();

/**
 * Utility function to safely execute async operations
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: ErrorContext = {}
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof AppError) {
      errorHandler.handle(error);
    } else {
      errorHandler.handleRaw(error as Error, context);
    }
    return null;
  }
}

/**
 * Utility function to safely execute sync operations
 */
export function withErrorHandlingSync<T>(
  operation: () => T,
  context: ErrorContext = {}
): T | null {
  try {
    return operation();
  } catch (error) {
    if (error instanceof AppError) {
      errorHandler.handle(error);
    } else {
      errorHandler.handleRaw(error as Error, context);
    }
    return null;
  }
}

/**
 * HOF for wrapping functions with error handling
 */
export function withErrorBoundary<T extends (...args: any[]) => any>(
  fn: T,
  context: ErrorContext = {}
): T {
  return ((...args: any[]) => {
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.catch(error => {
          if (error instanceof AppError) {
            errorHandler.handle(error);
          } else {
            errorHandler.handleRaw(error, context);
          }
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      if (error instanceof AppError) {
        errorHandler.handle(error);
      } else {
        errorHandler.handleRaw(error as Error, context);
      }
      throw error;
    }
  }) as T;
}