/**
 * @fileoverview Array utilities for common operations
 *
 * This module provides utilities for frequently used array operations
 * to reduce code duplication and improve consistency.
 */

/**
 * Array utility functions
 */
export const arrayUtils = {
  /**
   * Sums values from an array using a getter function
   */
  sum: <T>(array: T[], getValue: (item: T) => number): number =>
    array.reduce((sum, item) => sum + getValue(item), 0),

  /**
   * Finds the maximum value in an array using a getter function
   */
  max: <T>(array: T[], getValue: (item: T) => number): number =>
    array.length > 0 ? Math.max(...array.map(getValue)) : 0,

  /**
   * Finds the minimum value in an array using a getter function
   */
  min: <T>(array: T[], getValue: (item: T) => number): number =>
    array.length > 0 ? Math.min(...array.map(getValue)) : 0,

  /**
   * Calculates the average of values in an array
   */
  average: <T>(array: T[], getValue: (item: T) => number): number => {
    if (array.length === 0) return 0;
    return arrayUtils.sum(array, getValue) / array.length;
  },

  /**
   * Sorts array by date field
   */
  sortByDate: <T>(
    array: T[],
    getDate: (item: T) => string | Date,
    desc: boolean = true,
  ): T[] =>
    [...array].sort((a, b) => {
      const dateA = new Date(getDate(a)).getTime();
      const dateB = new Date(getDate(b)).getTime();
      return desc ? dateB - dateA : dateA - dateB;
    }),

  /**
   * Sorts array by timestamp field (optimized for timestamp strings)
   */
  sortByTimestamp: <T>(
    array: T[],
    getTimestamp: (item: T) => string,
    desc: boolean = true,
  ): T[] =>
    [...array].sort((a, b) => {
      const timeA = new Date(getTimestamp(a)).getTime();
      const timeB = new Date(getTimestamp(b)).getTime();
      return desc ? timeB - timeA : timeA - timeB;
    }),

  /**
   * Gets the latest item by date/timestamp
   */
  latest: <T>(array: T[], getDate: (item: T) => string | Date): T | null => {
    if (array.length === 0) return null;
    return arrayUtils.sortByDate(array, getDate, true)[0];
  },

  /**
   * Filters array and ensures non-null values
   */
  filterDefined: <T>(array: (T | null | undefined)[]): T[] =>
    array.filter((item): item is T => item != null),
};
