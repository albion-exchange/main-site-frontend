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
  estimatedReserves: number;
  expectedEndDate: string;
  crudeBenchmark: string;
  pricing: {
    benchmarkPremium: string;
    transportCosts: string;
  };
}

export interface AssetProduction {
  current: string;
  expectedRemainingProduction: string;
  status: 'funding' | 'producing' | 'completed';
}


export interface AssetTerms {
  interestType: string;
  amount: string;
  paymentFrequency: string;
}


export interface MonthlyReport {
  month: string; // YYYY-MM format
  production: number; // barrels
  revenue: number; // USD
  expenses: number; // USD
  netIncome: number; // USD
  payoutPerToken: number; // USD per token
}

export interface AssetMetadata {
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

/**
 * Complete Asset data structure for the static data store
 */
export interface Asset {
  id: string;
  name: string;
  description: string;
  images: string[];
  location: AssetLocation;
  operator: AssetOperator;
  technical: AssetTechnical;
  production: AssetProduction;
  assetTerms: AssetTerms;
  tokenContracts: string[]; // Array of contract addresses
  monthlyReports: MonthlyReport[];
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
  joinedDate: string; // YYYY-MM-DD format
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
  totalExpectedReturn: number; // Sum of base + bonus
  returnType: string; // e.g., "annual"
}

export interface TokenAssetShare {
  sharePercentage: number; // Percentage of asset ownership
  royaltyRate: number; // Royalty rate percentage
  totalAssetValue: number; // Total value of the underlying asset
}

export interface TokenAvailability {
  totalAvailable: string; // BigInt as string - total tokens available
  currentlyAvailable: string; // BigInt as string - tokens currently available
  percentageAvailable: number; // Percentage of tokens still available
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
  assetName?: string; // Asset name for convenience
  isActive: boolean;
  supply: TokenSupply;
  holders: TokenHolder[];
  payoutHistory: TokenPayoutRecord[];
  returns?: TokenReturns; // Only for royalty tokens
  assetShare?: TokenAssetShare; // Only for royalty tokens
  availability?: TokenAvailability; // Only for royalty tokens
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
  images: string[]; // Array of image URLs
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
    estimatedReserves: number; // In barrels
    expectedEndDate: string; // YYYY-MM format
  };
  production: {
    capacity: string; // e.g., "2,400 bbl/day"
    current: string;
    peak: string;
    expectedRemainingProduction: string; // Formatted display
    drillingDate: string; // ISO date
    status: 'funding' | 'producing' | 'completed';
  };
  tokenContracts: string[]; // Contract addresses of associated tokens
  monthlyReports: MonthlyReport[]; // Historical performance data
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
  symbol: string; // Trading symbol (e.g., "EUR-WR1-A")
  decimals: number; // Token decimals (usually 18 for royalty, 6 for payment)
  totalSupply: string; // Total supply as string (BigInt)
  tokenType: 'royalty' | 'payment';
  tranche: {
    id: string; // "A", "B", "C", etc.
    name: string; // "Tranche A - Priority"
    payout: number; // Expected payout percentage
    minInvestment: number; // Minimum investment USD
    available: number; // Total tokens available
    sold: number; // Tokens already sold
    terms: string; // Investment terms description
    description: string;
    selectable: boolean; // Whether currently available for purchase
  } | null; // null for payment tokens
  pricing: {
    currentPrice: number; // Current market price
    priceChange: number; // 24h price change
    priceChangePercent: number; // 24h change percentage
    bid: number; // Current bid price
    ask: number; // Current ask price
    volume24h: number; // 24h trading volume
    marketCap: number; // Market capitalization
  };
  assetId: string; // Links to Asset.id
  isActive: boolean; // Whether token is actively trading
  metadata: {
    createdAt: string; // ISO date
    updatedAt: string; // ISO date
  };
}