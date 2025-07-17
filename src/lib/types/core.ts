/**
 * Core business domain types - Single source of truth
 * These types represent the core business concepts with consistent data contracts
 */

import type { ISODateOnlyString, ISOYearMonthString, ISODateTimeString } from './sharedTypes';

// === Core Business Types ===

/**
 * Core asset terms - Always consistent number types for calculations
 */
export interface CoreAssetTerms {
  interestType: string;
  amount: number; // Always number for calculations
  paymentFrequencyDays: number; // Always number for calculations
}

/**
 * Core asset location with consistent numeric types
 */
export interface CoreAssetLocation {
  country: string;
  region: string;
  field: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  waterDepth?: number | null; // Always number (meters) or null
}

/**
 * Core operational metrics with consistent data types
 */
export interface CoreOperationalMetrics {
  uptime: {
    percentage: number;
    period: string;
  };
  dailyProduction: {
    current: number;
    target: number;
    unit: string;
  };
  hseMetrics: {
    incidentFreeDays: number;
    lastIncidentDate: Date | null;
    safetyRating: string;
  };
}

/**
 * Core asset pricing with numeric values
 */
export interface CoreAssetPricing {
  benchmarkPremium: number; // negative means discount
  transportCosts: number;
}

/**
 * Core production data
 */
export interface CoreProductionData {
  month: Date; // Always Date object for calculations
  production: number; // Always number (barrels/BOE)
  revenue?: number; // Always number (USD)
  expenses?: number; // Always number (USD)
  netIncome?: number; // Always number (USD)
}

/**
 * Core asset data - Business domain representation
 */
export interface CoreAsset {
  id: string;
  name: string;
  description: string;
  assetTerms: CoreAssetTerms;
  location: CoreAssetLocation;
  operationalMetrics?: CoreOperationalMetrics;
  pricing: CoreAssetPricing;
  expectedEndDate: Date | null;
  productionData: CoreProductionData[];
  currentProduction: number;
  estimatedLife: string;
  fieldType: string;
  depth: number; // Always meters as number
}

/**
 * Core token data
 */
export interface CoreToken {
  contractAddress: string;
  symbol: string;
  releaseName: string;
  assetId: string;
  sharePercentage: number;
  totalSupply: number;
  decimals: number;
  firstPaymentDate: Date;
}

// === Transformation Boundaries ===

/**
 * Display types - Formatted for UI consumption
 */
export interface DisplayAssetTerms {
  interestType: string;
  amount: string; // "3.2% of gross" - formatted for display
  paymentFrequency: string; // "Monthly within 30 days"
  amountTooltip?: string;
}

export interface DisplayAssetLocation {
  country: string;
  region: string;
  field: string;
  coordinates: string; // "Lat: 40.7128, Lng: -74.0060"
  waterDepth?: string | null; // "3,200m" or null
}

export interface DisplayOperationalMetrics {
  uptime: string; // "98.5%"
  dailyProduction: string; // "1,250 bbl/day"
  hseMetrics: {
    incidentFreeDays: string; // "245 days"
    lastIncidentDate: string; // "Dec 2023" or "Never"
    safetyRating: string;
  };
}

export interface DisplayAsset {
  id: string;
  name: string;
  description: string;
  assetTerms: DisplayAssetTerms;
  location: DisplayAssetLocation;
  operationalMetrics?: DisplayOperationalMetrics;
  expectedEndDate: string; // "Dec 2028"
  currentProduction: string; // "1,250 bbl/day"
  depth: string; // "3,200m"
  estimatedLife: string;
  fieldType: string;
}

export interface DisplayProductionData {
  month: string; // "Dec 2023"
  production: string; // "1,250 bbl"
  revenue?: string; // "$125,000"
  expenses?: string; // "$25,000"
  netIncome?: string; // "$100,000"
}