/**
 * Consolidated data store types for assets and tokens
 * These interfaces define the structure for the static JSON data stores
 */

export interface AssetLocation {
  state: string;
  county: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  waterDepth?: string | null;
}

export interface AssetOperator {
  name: string;
  website?: string;
  experience: string;
}

export interface AssetTechnical {
  fieldType: string;
  depth: string;
  license: string;
  estimatedLife: string;
  firstOil: string;
  infrastructure: string;
  environmental: string;
  expectedEndDate: string;
  crudeBenchmark: string;
  pricing: {
    benchmarkPremium: string;
    transportCosts: string;
  };
}

export interface AssetProduction {
  current: string;
  expectedRemainingProduction?: string; // Optional - calculated from planned production
  status: 'funding' | 'producing' | 'completed';
  units?: {
    production: string;
    revenue: string;
  };
}

export interface AssetTerms {
  interestType: string;
  amount: string;
  amountTooltip?: string;
  paymentFrequency: string;
}

export interface MonthlyReport {
  month: string; // YYYY-MM format
  production: number; // barrels
  revenue: number; // USD
  expenses: number; // USD
  netIncome: number; // USD
  payoutPerToken?: number; // USD per token (optional for royalty assets)
}

export interface PlannedProductionProjection {
  month: string; // YYYY-MM format
  production: number; // BOE
  revenue?: number; // USD (optional - calculated at runtime)
}

export interface ProductionHistoryRecord {
  month: string; // YYYY-MM format
  production: number; // barrels
}

export interface PlannedProduction {
  oilPriceAssumption: number;
  oilPriceAssumptionCurrency: string;
  projections: PlannedProductionProjection[];
}

export interface OperationalMetrics {
  dailyProduction: {
    current: number;
    unit: string;
  };
  uptime: {
    percentage: number;
    period: string;
  };
  hseMetrics: {
    incidentFreeDays: number;
  };
}

export interface AssetMetadata {
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

export interface GalleryImage {
  title: string;
  url: string;
  caption?: string;
}

/**
 * Complete Asset data structure for the static data store
 */
export interface Asset {
  id: string;
  name: string;
  description: string;
  images: GalleryImage[];
  location: AssetLocation;
  operator: AssetOperator;
  technical: AssetTechnical;
  production: AssetProduction;
  assetTerms: AssetTerms;
  tokenContracts: string[]; // Array of contract addresses
  monthlyReports: MonthlyReport[];
  productionHistory?: ProductionHistoryRecord[]; // Historical production data without financial details
  plannedProduction?: PlannedProduction;
  operationalMetrics?: OperationalMetrics;
  metadata: AssetMetadata;
}

/**
 * Assets collection type for the JSON store
 */
export interface AssetsStore {
  assets: Record<string, Asset>;
}

// Token-related interfaces

export interface TokenSupply {
  maxSupply: string; // BigInt as string
  mintedSupply: string; // BigInt as string
}


export interface TokenHolder {
  address: string;
  balance: string; // BigInt as string
}

export interface TokenPayoutRecord {
  month: string; // YYYY-MM format
  date: string; // YYYY-MM-DD format
  totalPayout: number; // USD
  payoutPerToken: number; // USD per token
  oilPrice: number; // USD per barrel
  gasPrice: number; // USD per MMBtu
  productionVolume: number; // barrels or MCF
  txHash: string; // Transaction hash
}

export interface TokenMetadata {
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

export interface TokenReturns {
  baseReturn: number; // Base return percentage
  bonusReturn: number; // Bonus return percentage
}



/**
 * Complete Token data structure for the static data store
 */
export interface Token {
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  tokenType: 'royalty' | 'payment';
  assetId: string; // Links to Asset.id
  isActive: boolean;
  supply: TokenSupply;
  holders: TokenHolder[];
  payoutHistory: TokenPayoutRecord[];
  sharePercentage?: number; // Percentage of asset ownership (for royalty tokens)
  firstPaymentDate?: string; // YYYY-MM format or "Month YYYY" format
  metadata: TokenMetadata;
}

/**
 * Tokens collection type for the JSON store
 */
export interface TokensStore {
  tokens: Record<string, Token>;
}

// User portfolio/balance related interfaces (dynamic data)

export interface UserTokenBalance {
  contractAddress: string;
  balance: string; // BigInt as string
  formattedBalance: string;
  currentValue: number; // USD value
  investmentAmount: number; // Original investment USD
  unrealizedGain: number; // USD gain/loss
  unrealizedGainPercent: number; // Percentage gain/loss
  totalEarned: number; // Total payouts received
  tokensOwned: number; // Formatted token count
  lastPayout: string; // Date of last payout
  allocation: number; // Percentage of total portfolio
}

export interface TokenPayout {
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
  amount: string; // BigInt as string
  formattedAmount: string;
  recipient: string;
}

export interface UserPortfolioData {
  address: string;
  balances: UserTokenBalance[];
  payoutHistory: TokenPayout[];
  totalPortfolioValue: number;
  totalInvested: number;
  totalEarned: number;
  totalUnrealizedGain: number;
  totalUnrealizedGainPercent: number;
}

// Market data interfaces (for trading pages)

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  bid: number;
  ask: number;
  spread: number;
  high24h: number;
  low24h: number;
  marketCap: number;
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

export interface RecentTrade {
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  time: string;
  timestamp: number;
}

// Template interfaces for adding new assets/tokens

/**
 * Template for adding a new asset to the assets.json store
 * Copy this structure and fill in all required fields
 */
export interface AssetTemplate {
  id: string; // Unique identifier (kebab-case)
  name: string; // Display name
  description: string; // Detailed description
  location: {
    state: string;
    county: string;
    country: string;
    coordinates: { lat: number; lng: number };
    waterDepth?: string | null; // For offshore assets
  };
  operator: {
    name: string;
    website?: string;
    experience: string; // e.g., "15+ years"
  };
  technical: {
    fieldType: string; // e.g., "Conventional Oil", "Shale Oil"
    depth: string; // e.g., "1,200m"
    license: string; // License/permit number
    estimatedLife: string; // e.g., "15+ years"
    firstOil: string; // e.g., "2019-Q3"
    infrastructure: string;
    environmental: string;
    expectedEndDate: string; // YYYY-MM format
    crudeBenchmark: string;
    pricing: {
      benchmarkPremium: string;
      transportCosts: string;
    };
  };
  assetTerms: {
    interestType: string;
    amount: string;
    amountTooltip?: string;
    paymentFrequency: string;
  };
  production: {
    current: string;
    status: 'funding' | 'producing' | 'completed';
    units?: {
      production: string;
      revenue: string;
    };
  };
  tokenContracts: string[]; // Contract addresses of associated tokens
  monthlyReports: MonthlyReport[]; // Historical performance data
  plannedProduction?: PlannedProduction;
  metadata: {
    createdAt: string; // ISO date
    updatedAt: string; // ISO date
  };
}

/**
 * Template for adding a new token to the tokens.json store
 * Copy this structure and fill in all required fields
 */
export interface TokenTemplate {
  contractAddress: string; // Unique contract address (the key)
  name: string; // Full token name
  symbol: string; // Trading symbol (e.g., "EUR-WR1")
  decimals: number; // Token decimals (usually 18 for royalty, 6 for payment)
  tokenType: 'royalty' | 'payment';
  assetId: string; // Links to Asset.id
  isActive: boolean; // Whether token is actively trading
  firstPaymentDate?: string; // YYYY-MM format or "Month YYYY" format
  supply: {
    maxSupply: string; // BigInt as string
    mintedSupply: string; // BigInt as string
  };
  holders: {
    address: string;
    balance: string; // BigInt as string
  }[];
  payoutHistory: {
    month: string; // YYYY-MM format
    date: string; // YYYY-MM-DD format
    totalPayout: number; // USD
    payoutPerToken: number; // USD per token
    oilPrice: number; // USD per barrel
    gasPrice: number; // USD per MMBtu
    productionVolume: number; // barrels or MCF
    txHash: string; // Transaction hash
  }[];
  sharePercentage?: number; // Percentage of asset ownership (for royalty tokens)
  metadata: {
    createdAt: string; // ISO date
    updatedAt: string; // ISO date
  };
}