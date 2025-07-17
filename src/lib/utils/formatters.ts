/**
 * Centralized formatters for consistent data presentation
 * These formatters provide a single source of truth for how data is displayed
 */

/**
 * Currency formatting with consistent options
 */
export const formatCurrency = (amount: number, options: {
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
} = {}): string => {
  const {
    currency = 'USD',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = options;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(amount);
};

/**
 * Number formatting with thousand separators
 */
export const formatNumber = (value: number, options: {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
} = {}): string => {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2
  } = options;

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value);
};

/**
 * Percentage formatting
 */
export const formatPercentage = (value: number, decimalPlaces: number = 1): string => {
  return `${value.toFixed(decimalPlaces)}%`;
};

/**
 * Date formatting utilities
 */
export const formatDate = {
  /**
   * Format date to "Dec 2023" format
   */
  monthYear: (date: Date): string => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  },

  /**
   * Format date to "Dec 15, 2023" format
   */
  full: (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  /**
   * Format ISO date string to readable format
   */
  fromISO: (isoString: string): string => {
    const date = new Date(isoString);
    return formatDate.monthYear(date);
  },

  /**
   * Format YYYY-MM string to readable format
   */
  fromYearMonth: (yearMonth: string): string => {
    const [year, month] = yearMonth.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  }
};

/**
 * Distance/depth formatting
 */
export const formatDistance = {
  /**
   * Format meters to readable string with units
   */
  meters: (meters: number): string => {
    return `${formatNumber(meters)}m`;
  },

  /**
   * Format water depth (handles null/undefined)
   */
  waterDepth: (depth: number | null | undefined): string | null => {
    if (depth == null) return null;
    return formatDistance.meters(depth);
  }
};

/**
 * Production formatting
 */
export const formatProduction = {
  /**
   * Format production with units
   */
  withUnits: (production: number, unit: string = 'bbl'): string => {
    return `${formatNumber(production)} ${unit}`;
  },

  /**
   * Format daily production
   */
  daily: (production: number, unit: string = 'bbl'): string => {
    return `${formatNumber(production)} ${unit}/day`;
  }
};

/**
 * Coordinate formatting
 */
export const formatCoordinates = (lat: number, lng: number): string => {
  return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
};

/**
 * Time period formatting
 */
export const formatPeriod = {
  /**
   * Format days to readable string
   */
  days: (days: number): string => {
    if (days === 1) return '1 day';
    return `${formatNumber(days)} days`;
  },

  /**
   * Format incident-free days
   */
  incidentFree: (days: number): string => {
    return formatPeriod.days(days);
  }
};

/**
 * Business-specific formatters
 */
export const formatBusiness = {
  /**
   * Format asset terms amount
   */
  assetTermsAmount: (amount: number, interestType: string): string => {
    return `${formatPercentage(amount)} of ${interestType.toLowerCase()}`;
  },

  /**
   * Format payment frequency
   */
  paymentFrequency: (days: number): string => {
    if (days <= 30) return `Monthly within ${days} days`;
    if (days <= 90) return `Quarterly within ${days} days`;
    return `Every ${days} days`;
  },

  /**
   * Format uptime percentage
   */
  uptime: (percentage: number): string => {
    return formatPercentage(percentage, 1);
  }
};

/**
 * Consolidated formatters object for easy import
 */
export const formatters = {
  currency: formatCurrency,
  number: formatNumber,
  percentage: formatPercentage,
  date: formatDate,
  distance: formatDistance,
  production: formatProduction,
  coordinates: formatCoordinates,
  period: formatPeriod,
  business: formatBusiness
};

export default formatters;