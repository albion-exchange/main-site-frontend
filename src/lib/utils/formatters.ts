/**
 * @fileoverview Centralized formatting utilities
 * 
 * This module provides consistent formatting functions used throughout the application.
 * Only complex or business-specific formatting logic should be centralized here.
 * 
 * For simple cases, prefer native JavaScript methods:
 * - Use `value.toLocaleString()` for basic number formatting with commas
 * - Use `value.toFixed(n)` for simple decimal formatting
 * 
 * This module focuses on:
 * - Currency: Complex USD formatting with options (minimumFractionDigits, compact notation)
 * - Business-specific dates: Converting "YYYY-MM" to "MMM YYYY" format
 * - Percentages: With special formatting options (sign display, decimal handling)
 * - Tokens: Blockchain-specific formatting with decimal precision
 * - Domain-specific: Depth formatting, dollar amounts without cents
 */

/**
 * Formats a number as USD currency
 * @param amount - The amount to format
 * @param options - Optional formatting options
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(
  amount: number,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    compact?: boolean;
  } = {}
): string {
  const { 
    minimumFractionDigits = 2, 
    maximumFractionDigits = 2,
    compact = false 
  } = options;

  if (compact && Math.abs(amount) >= 1000000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits,
    maximumFractionDigits
  }).format(amount);
}

/**
 * Formats a date string from "YYYY-MM" to "MMM YYYY"
 * @param dateStr - Date string in "YYYY-MM" format
 * @returns Formatted date string (e.g., "Jan 2024")
 */
export function formatEndDate(dateStr: string): string {
  if (!dateStr || dateStr === 'undefined') return 'TBD';
  
  const parts = dateStr.split('-');
  if (parts.length < 2) return 'TBD';
  
  const [year, month] = parts;
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const monthIndex = parseInt(month) - 1;
  if (monthIndex < 0 || monthIndex >= 12) return 'TBD';
  
  return `${monthNames[monthIndex]} ${year}`;
}

/**
 * Formats a date to a localized string
 * @param date - Date object or date string
 * @param format - Format style ('short', 'medium', 'long')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'medium' | 'long' = 'medium'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'numeric' as const, day: 'numeric' as const, year: 'numeric' as const },
    medium: { month: 'short' as const, day: 'numeric' as const, year: 'numeric' as const },
    long: { month: 'long' as const, day: 'numeric' as const, year: 'numeric' as const }
  }[format];
  
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Formats a number with thousand separators
 * @param value - Number to format
 * @param options - Formatting options
 * @returns Formatted number string (e.g., "1,234.56")
 */
export function formatNumber(
  value: number,
  options: {
    decimals?: number;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const { 
    decimals,
    minimumFractionDigits = decimals ?? 0,
    maximumFractionDigits = decimals ?? 0
  } = options;
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value);
}

/**
 * Formats a percentage value
 * @param value - Percentage value (e.g., 0.1234 for 12.34%)
 * @param options - Formatting options
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  options: {
    decimals?: number;
    showSign?: boolean;
    isAlreadyPercentage?: boolean;
  } = {}
): string {
  const { 
    decimals = 2, 
    showSign = false,
    isAlreadyPercentage = false 
  } = options;
  
  // If value is already a percentage (e.g., 12.34 instead of 0.1234)
  const percentValue = isAlreadyPercentage ? value / 100 : value;
  
  if (showSign && value > 0) {
    return '+' + new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(percentValue);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(percentValue);
}

/**
 * Simple percentage formatting for display values
 * @param value - Percentage value (already in percentage form, e.g., 12.5 for 12.5%)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string (e.g., "12.5%")
 */
export function formatSimplePercentage(
  value: number,
  decimals: number = 1
): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats blockchain token amounts with proper decimal handling
 * @param amount - Raw token amount (as string for precision)
 * @param decimals - Token decimals (default: 18 for ETH)
 * @returns Formatted token amount
 */
export function formatTokenAmount(
  amount: string | number,
  decimals: number = 18
): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  const adjustedValue = value / Math.pow(10, decimals);
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
    // Remove trailing zeros
    trailingZeroDisplay: 'stripIfInteger'
  } as Intl.NumberFormatOptions).format(adjustedValue);
}

/**
 * Formats large numbers in compact notation
 * @param value - Number to format
 * @param decimals - Maximum decimal places in compact form
 * @returns Formatted string (e.g., "1.2M", "3.5K")
 */
export function formatCompactNumber(
  value: number,
  decimals: number = 1
): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Formats a value with optional prefix and suffix
 * Useful for chart tooltips and custom displays
 * @param value - Value to format
 * @param prefix - String to prepend
 * @param suffix - String to append
 * @returns Formatted string
 */
export function formatWithAffixes(
  value: string | number,
  prefix: string = '',
  suffix: string = ''
): string {
  const formattedValue = typeof value === 'number' 
    ? value.toLocaleString('en-US') 
    : value;
    
  return `${prefix}${formattedValue}${suffix}`;
}

/**
 * Formats a depth value in meters
 * @param depth - Depth in meters
 * @returns Formatted depth string (e.g., "3,200m")
 */
export function formatDepth(depth: number): string {
  return `${formatNumber(depth)}m`;
}

/**
 * Formats a dollar amount without cents
 * @param amount - Amount to format
 * @returns Formatted string (e.g., "$1,234")
 */
export function formatDollarAmount(amount: number): string {
  return `$${formatNumber(Math.round(amount))}`;
}

/**
 * Utility type guards for safe formatting
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

export function isValidDate(date: unknown): boolean {
  if (!date) return false;
  const dateObj = date instanceof Date ? date : new Date(date as string);
  return !isNaN(dateObj.getTime());
}