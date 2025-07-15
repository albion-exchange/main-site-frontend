// Type definitions based on merged-token-schema.json

import type { GalleryImage, TokenSupply, ISOYearMonthString, Location, Metadata, ISODateTimeString, ISODateOnlyString } from './sharedTypes';

export enum TokenType {
  Royalty = 'royalty',
  WorkingInterest = 'working-interest',
  OverridingRoyalty = 'overriding-royalty'
}

export enum ProductionStatus {
  Producing = 'producing',
  Development = 'development',
  Exploration = 'exploration',
  Suspended = 'suspended',
  Decommissioned = 'decommissioned'
}

export enum DocumentType {
  PDF = 'pdf',
  Images = 'images',
  CSV = 'csv',
  ZIP = 'zip'
}

export interface AssetMetadata {
  contractAddress: string;
  assetId: string;
  symbol: string;
  releaseName: string;
  assetName: string;
  tokenType: TokenType;
  firstPaymentDate: ISOYearMonthString;
  sharePercentage: number;
  decimals: number;
  supply: TokenSupply;
  monthlyData: MonthlyData[];
  asset: AssetData;
  documents: Document[];
  coverImage: string;
  galleryImages: GalleryImage[];
  metadata: Metadata;
}

export interface Document {
  name: string;
  type: DocumentType;
  ipfs: string;
}

// TokenSupply is imported from sharedTypes.ts

export interface MonthlyData {
  month: ISOYearMonthString; // Format: "YYYY-MM"
  assetData: {
    production: number;
    revenue: number;
    expenses: number;
    netIncome: number;
  };
  tokenPayout: {
    date: ISODateTimeString; // ISO datetime string
    totalPayout: number;
    payoutPerToken: number;
    txHash: string;
  };
  realisedPrice: {
    oilPrice: number;
    gasPrice: number;
  };
}

export interface AssetData {
  description: string;
  location: Location;
  operator: Operator;
  technical: TechnicalDetails;
  assetTerms: AssetTerms;
  production: Production;
  plannedProduction: PlannedProduction;
  productionHistory: ProductionHistoryRecord[];
  operationalMetrics: OperationalMetrics;
}


export interface Operator {
  name: string;
  website: string;
  experienceYears: number;
}

export interface TechnicalDetails {
  fieldType: string;
  depth: number;
  license: string;
  estimatedLifeMonths: number;
  firstOil: ISOYearMonthString;
  infrastructure: string;
  environmental: string;
  expectedEndDate: ISOYearMonthString; // Format: "YYYY-MM"
  crudeBenchmark: string;
  pricing: {
    benchmarkPremium: number; // negative means discount
    transportCosts: number;
  };
}

export interface AssetTerms {
  interestType: string;
  amount: number;
  amountTooltip: string;
  paymentFrequencyDays: number;
}

export interface Production {
  current: string;
  status: ProductionStatus;
  units: {
    production: number;
    revenue: number;
  };
}

export interface PlannedProduction {
  oilPriceAssumption: number;
  oilPriceAssumptionCurrency: string;
  projections: PlannedProductionProjection[];
}

export interface PlannedProductionProjection {
  month: ISOYearMonthString; // Format: "YYYY-MM"
  production: number;
}

export interface ProductionHistoryRecord {
  month: ISOYearMonthString; // Format: "YYYY-MM"
  production: number;
}

export interface OperationalMetrics {
  uptime: {
    percentage: number;
    unit: string;
    period: string;
  };
  dailyProduction: {
    current: number;
    target: number;
    unit: string;
  };
  hseMetrics: {
    incidentFreeDays: number;
    lastIncidentDate: ISODateTimeString; // ISO datetime string
    safetyRating: string;
  };
}

