// Type definitions based on merged-token-schema.json

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

type YearMonth = `${number}-${'' | '0'}${1|2|3|4|5|6|7|8|9|10|11|12}`;

export interface AssetMetadata {
  contractAddress: string;
  symbol: string;
  releaseName: string;
  assetName: string;
  tokenType: TokenType;
  firstPaymentDate: YearMonth;
  sharePercentage: number;
  decimals: number;
  supply: TokenSupply;
  monthlyData: MonthlyData[];
  asset: AssetData;
  documents: Document[];
  coverImage: string;
  metadata: Metadata;
}

export interface Document {
  name: string;
  type: DocumentType;
  ipfs: string;
}

export interface TokenSupply {
  maxSupply: string; // BigInt as string to preserve precision
  mintedSupply: string; // BigInt as string to preserve precision
}

export interface MonthlyData {
  month: YearMonth; // Format: "YYYY-MM"
  assetData: {
    production: number;
    revenue: number;
    expenses: number;
    netIncome: number;
  };
  tokenPayout: {
    date: Date; // Date object
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

export interface Location {
  state: string;
  county: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  waterDepth: string | null;
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
  firstOil: YearMonth;
  infrastructure: string;
  environmental: string;
  expectedEndDate: YearMonth; // Format: "YYYY-MM"
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
  month: YearMonth; // Format: "YYYY-MM"
  production: number;
}

export interface ProductionHistoryRecord {
  month: YearMonth; // Format: "YYYY-MM"
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
    lastIncidentDate: Date; // Date object
    safetyRating: string;
  };
}

export interface Metadata {
  createdAt: Date; // Date object
  updatedAt: Date; // Date object
}