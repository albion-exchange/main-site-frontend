/**
 * @fileoverview Date utilities for common operations
 *
 * This module provides utilities for frequently used date operations
 * to reduce code duplication and improve consistency.
 */

/**
 * Date utility functions
 */
export const dateUtils = {
  /**
   * Converts YYYY-MM string to Date object (1st of month)
   */
  fromYearMonth: (yearMonth: string): Date => new Date(yearMonth + "-01"),

  /**
   * Compares two timestamp strings, returns difference in milliseconds
   * @param a First timestamp
   * @param b Second timestamp
   * @returns Positive if b is later than a
   */
  compareTimestamps: (a: string, b: string): number =>
    new Date(b).getTime() - new Date(a).getTime(),

  /**
   * Sorts comparator for timestamps (descending by default)
   */
  timestampComparator:
    (desc: boolean = true) =>
    (a: { timestamp: string }, b: { timestamp: string }) =>
      desc
        ? dateUtils.compareTimestamps(a.timestamp, b.timestamp)
        : dateUtils.compareTimestamps(b.timestamp, a.timestamp),

  /**
   * Formats date with standard locale options
   */
  formatDate: (
    date: Date | string,
    options?: Intl.DateTimeFormatOptions,
  ): string => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString("en-US", options);
  },

  /**
   * Creates next month date for estimated reporting
   */
  nextMonth: (fromDateStr?: string): Date => {
    const baseDate = fromDateStr ? new Date(fromDateStr + "-01") : new Date();
    return new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 15);
  },

  /**
   * Calculates days between two dates
   */
  daysBetween: (date1: string | Date, date2: string | Date): number => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.floor(
      Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24),
    );
  },

  /**
   * Gets current time string for real-time displays
   */
  currentTimeString: (): string => new Date().toLocaleTimeString(),

  /**
   * Formats date for file names (YYYY-MM-DD)
   */
  filenameDateString: (date?: Date): string =>
    (date || new Date()).toISOString().split("T")[0],
};
