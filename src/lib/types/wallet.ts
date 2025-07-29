/**
 * Wallet data types for managing user wallet information and transactions
 */

export interface MintTransaction {
  txHash: string;
  timestamp: string;
  amount: number;
  amountUSD: number;
}

export interface PayoutHistoryItem {
  month: string;
  amount: number;
  status: "claimed" | "unclaimed" | "not_eligible";
  claimTxHash?: string;
  claimDate?: string;
  note?: string;
}

export interface PayoutsSummary {
  totalEarned: number;
  claimedAmount: number;
  unclaimedAmount: number;
  lastClaimDate?: string;
  payoutHistory: PayoutHistoryItem[];
}

export interface WalletHolding {
  energyField: string; // Energy field name from ENERGY_FIELDS
  assetName: string;
  contractAddress: string;
  symbol: string;
  tokenType: "royalty" | "payment";
  balance: string; // BigInt as string
  formattedBalance: number;
  investmentAmount: number;
  mintTransactions: MintTransaction[];
  payoutsSummary: PayoutsSummary;
  assetStatus: "funding" | "producing" | "completed";
  currentMonthlyPayout: number;
  averageMonthlyPayout: number;
}

export interface PortfolioAllocation {
  energyField: string; // Energy field name from ENERGY_FIELDS
  assetName: string;
  percentage: number;
  value: number;
}

export interface MonthlyPayoutTrend {
  month: string;
  totalPayout: number;
}

export interface WalletSummary {
  totalInvested: number;
  totalPayoutsEarned: number;
  totalClaimedPayouts: number;
  totalUnclaimedPayouts: number;
  totalHoldings: number;
  portfolioAllocation: PortfolioAllocation[];
  monthlyPayoutTrend: MonthlyPayoutTrend[];
}

export interface WalletTransaction {
  id: string;
  timestamp: string;
  address: string;
  type: "mint" | "claim";
  amount: number;
  amountUSD: number;
  txHash: string;
}

export interface WalletPayout {
  id: string;
  timestamp: string;
  address: string;
  month: string;
  totalPayout: number;
  mintedSupply: number;
  walletTokens: number;
  walletShare: number;
  amount: number;
  txHash: string;
}

export interface WalletData {
  walletAddress: string;
  holdings: WalletHolding[];
  summary: WalletSummary;
  transactions: WalletTransaction[];
  payouts: WalletPayout[];
}

// Additional utility types for the service

export interface AssetPayoutInfo {
  energyField: string; // Energy field name from ENERGY_FIELDS
  assetName: string;
  totalInvested: number;
  totalEarned: number;
  unclaimedAmount: number;
  lastPayoutAmount: number;
  lastPayoutDate?: string;
  lastClaimDate?: string;
  roi: number; // Return on investment percentage
  monthlyPayouts: Array<{
    month: string;
    amount: number;
    status: "claimed" | "unclaimed" | "not_eligible";
  }>;
}

export interface WalletMetrics {
  totalValue: number;
  totalInvested: number;
  totalReturns: number;
  totalROI: number;
  averageMonthlyIncome: number;
  portfolioDiversity: number; // 0-1 score
  nextExpectedPayout: {
    estimatedDate: string;
    estimatedAmount: number;
  } | null;
}

export interface TokenAllocation {
  tokenSymbol: string;
  energyField: string; // Energy field name from ENERGY_FIELDS
  assetName: string;
  tokensOwned: number;
  percentageOfPortfolio: number;
  currentValue: number;
  totalEarned: number;
}
