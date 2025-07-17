/**
 * Data transformation utilities
 * Clear transformation boundaries between core business types and display types
 */

import type {
  CoreAsset,
  CoreAssetTerms,
  CoreAssetLocation,
  CoreOperationalMetrics,
  CoreProductionData,
  DisplayAsset,
  DisplayAssetTerms,
  DisplayAssetLocation,
  DisplayOperationalMetrics,
  DisplayProductionData
} from '$lib/types/core';
import { formatters } from './formatters';

/**
 * Transform core asset terms to display format
 */
export const transformAssetTerms = (core: CoreAssetTerms): DisplayAssetTerms => {
  return {
    interestType: core.interestType,
    amount: formatters.business.assetTermsAmount(core.amount, core.interestType),
    paymentFrequency: formatters.business.paymentFrequency(core.paymentFrequencyDays)
  };
};

/**
 * Transform core asset location to display format
 */
export const transformAssetLocation = (core: CoreAssetLocation): DisplayAssetLocation => {
  return {
    country: core.country,
    region: core.region,
    field: core.field,
    coordinates: formatters.coordinates(core.coordinates.latitude, core.coordinates.longitude),
    waterDepth: formatters.distance.waterDepth(core.waterDepth)
  };
};

/**
 * Transform core operational metrics to display format
 */
export const transformOperationalMetrics = (core: CoreOperationalMetrics): DisplayOperationalMetrics => {
  return {
    uptime: formatters.business.uptime(core.uptime.percentage),
    dailyProduction: formatters.production.daily(core.dailyProduction.current, core.dailyProduction.unit),
    hseMetrics: {
      incidentFreeDays: formatters.period.incidentFree(core.hseMetrics.incidentFreeDays),
      lastIncidentDate: core.hseMetrics.lastIncidentDate 
        ? formatters.date.monthYear(core.hseMetrics.lastIncidentDate)
        : 'Never',
      safetyRating: core.hseMetrics.safetyRating
    }
  };
};

/**
 * Transform core production data to display format
 */
export const transformProductionData = (core: CoreProductionData): DisplayProductionData => {
  return {
    month: formatters.date.monthYear(core.month),
    production: formatters.production.withUnits(core.production),
    revenue: core.revenue ? formatters.currency(core.revenue) : undefined,
    expenses: core.expenses ? formatters.currency(core.expenses) : undefined,
    netIncome: core.netIncome ? formatters.currency(core.netIncome) : undefined
  };
};

/**
 * Transform core asset to display format
 */
export const transformAsset = (core: CoreAsset): DisplayAsset => {
  return {
    id: core.id,
    name: core.name,
    description: core.description,
    assetTerms: transformAssetTerms(core.assetTerms),
    location: transformAssetLocation(core.location),
    operationalMetrics: core.operationalMetrics 
      ? transformOperationalMetrics(core.operationalMetrics) 
      : undefined,
    expectedEndDate: core.expectedEndDate 
      ? formatters.date.monthYear(core.expectedEndDate)
      : 'TBD',
    currentProduction: formatters.production.daily(core.currentProduction),
    depth: formatters.distance.meters(core.depth),
    estimatedLife: core.estimatedLife,
    fieldType: core.fieldType
  };
};

/**
 * Reverse transformation utilities (for form handling, etc.)
 */
export const parseAssetTerms = {
  /**
   * Parse amount from display string back to number
   * "3.2% of gross" -> 3.2
   */
  amount: (displayAmount: string): number => {
    const match = displayAmount.match(/^([\d.]+)%/);
    return match ? parseFloat(match[1]) : 0;
  },

  /**
   * Parse payment frequency from display string back to days
   * "Monthly within 30 days" -> 30
   */
  paymentFrequencyDays: (displayFrequency: string): number => {
    const match = displayFrequency.match(/(\d+)\s+days/);
    return match ? parseInt(match[1]) : 30;
  }
};

/**
 * Date parsing utilities
 */
export const parseDate = {
  /**
   * Parse YYYY-MM string to Date object
   */
  fromYearMonth: (yearMonth: string): Date => {
    const [year, month] = yearMonth.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, 1);
  },

  /**
   * Parse ISO date string to Date object
   */
  fromISO: (isoString: string): Date => {
    return new Date(isoString);
  }
};

/**
 * Numeric parsing utilities
 */
export const parseNumber = {
  /**
   * Parse depth string to number
   * "3,200m" -> 3200
   */
  depth: (depthString: string): number => {
    const cleaned = depthString.replace(/[,m]/g, '');
    return parseFloat(cleaned) || 0;
  },

  /**
   * Parse production string to number
   * "1,250 bbl" -> 1250
   */
  production: (productionString: string): number => {
    const cleaned = productionString.replace(/[,\s\w]/g, '');
    return parseFloat(cleaned) || 0;
  },

  /**
   * Parse currency string to number
   * "$125,000" -> 125000
   */
  currency: (currencyString: string): number => {
    const cleaned = currencyString.replace(/[$,]/g, '');
    return parseFloat(cleaned) || 0;
  }
};

/**
 * Consolidated transform utilities
 */
export const transforms = {
  toDisplay: {
    asset: transformAsset,
    assetTerms: transformAssetTerms,
    location: transformAssetLocation,
    operationalMetrics: transformOperationalMetrics,
    productionData: transformProductionData
  },
  parse: {
    assetTerms: parseAssetTerms,
    date: parseDate,
    number: parseNumber
  }
};

export default transforms;