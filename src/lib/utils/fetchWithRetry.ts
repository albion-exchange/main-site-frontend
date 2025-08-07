/**
 * Fetch with exponential backoff retry logic
 * 
 * Provides resilient HTTP requests with automatic retry on failure
 */

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableStatuses?: number[];
  onRetry?: (attempt: number, delay: number, error: Error) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  onRetry: () => {}
};

/**
 * Delay execution for specified milliseconds
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Determine if an error or response should trigger a retry
 */
function shouldRetry(error: unknown, retryableStatuses: number[]): boolean {
  // Network errors should always retry
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  
  // Check if response status is retryable
  if (error instanceof Response) {
    return retryableStatuses.includes(error.status);
  }
  
  return false;
}

/**
 * Fetch with automatic retry and exponential backoff
 * 
 * @param url - The URL to fetch
 * @param init - Standard fetch init options
 * @param retryOptions - Retry configuration
 * @returns Promise resolving to the Response
 */
export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  retryOptions?: RetryOptions
): Promise<Response> {
  const options = { ...DEFAULT_OPTIONS, ...retryOptions };
  let lastError: Error | undefined;
  let currentDelay = options.initialDelay;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      const response = await fetch(url, init);
      
      // Check if response status should trigger retry
      if (!response.ok && options.retryableStatuses.includes(response.status)) {
        throw response;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry if we've exhausted attempts
      if (attempt === options.maxRetries) {
        break;
      }
      
      // Don't retry if error is not retryable
      if (!shouldRetry(error, options.retryableStatuses)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const jitter = Math.random() * 200; // Add jitter to prevent thundering herd
      const delayMs = Math.min(currentDelay + jitter, options.maxDelay);
      
      // Notify about retry
      options.onRetry(attempt + 1, delayMs, lastError);
      
      // Wait before retrying
      await delay(delayMs);
      
      // Increase delay for next attempt
      currentDelay *= options.backoffMultiplier;
    }
  }
  
  throw lastError || new Error('Fetch failed after retries');
}

/**
 * Convenience wrapper for JSON requests with retry
 */
export async function fetchJsonWithRetry<T>(
  url: string,
  init?: RequestInit,
  retryOptions?: RetryOptions
): Promise<T> {
  const response = await fetchWithRetry(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers
    }
  }, retryOptions);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * GraphQL query with retry
 */
export async function graphqlWithRetry<T>(
  url: string,
  query: string,
  variables?: Record<string, any>,
  retryOptions?: RetryOptions
): Promise<T> {
  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables })
  }, retryOptions);
  
  const result = await response.json();
  
  if (result.errors) {
    throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
  }
  
  return result.data;
}