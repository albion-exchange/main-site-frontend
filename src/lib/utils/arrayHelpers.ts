/**
 * @fileoverview Array utilities for common operations
 */

/**
 * Array utility functions
 */
export const arrayUtils = {
  /**
   * Gets the latest item by date/timestamp
   */
  latest: <T>(array: T[], getDate: (item: T) => string | Date): T | null => {
    if (array.length === 0) return null;
    
    // Sort by date descending and return first item
    const sorted = [...array].sort((a, b) => {
      const dateA = new Date(getDate(a)).getTime();
      const dateB = new Date(getDate(b)).getTime();
      return dateB - dateA;
    });
    
    return sorted[0];
  },

  /**
   * Filters array and ensures non-null values
   */
  filterDefined: <T>(array: (T | null | undefined)[]): T[] =>
    array.filter((item): item is T => item != null),
};