/**
 * Portfolio Store
 * 
 * Manages wallet holdings, transactions, and portfolio analytics
 */

import { writable, derived, get, type Readable } from 'svelte/store';
import { signerAddress } from 'svelte-wagmi';
import { getAllDeposits } from '$lib/queries/getAllDeposits';
import { tokenStore, getTokenByAddress } from './tokenStore';
import type { TokenMetadata } from '$lib/types/MetaboardTypes';
import { formatEther } from 'viem';

// Portfolio Types
export interface PayoutHistoryRecord {
  date: string; // ISO date string
  amount: number; // USD amount
}

export interface TokenHolding {
  id: string; // Unique identifier for this holding (used for UI state management)
  token: TokenMetadata;
  balance: bigint;
  value: number;
  percentage: number;
  
  // Asset information (derived from token.asset)
  asset: {
    name: string;
    coverImage?: string;
    location?: {
      state?: string;
      country?: string;
    };
  };
  
  // Display properties
  tokenSymbol: string; // Token symbol for display
  tokensOwned: number; // Formatted number of tokens owned
  status: string; // Production status (e.g., 'producing', 'development')
  
  // Financial properties
  invested: number; // Original investment amount in USD
  earned: number; // Total payouts earned in USD
  capitalReturned: number; // Capital returned as percentage (0-100)
  assetDepletion: number; // Asset depletion percentage (0-100)  
  unrecoveredCapital: number; // Capital yet to be recovered in USD
  
  // Historical data
  payoutHistory: PayoutHistoryRecord[]; // Monthly payout history for charts
}

export interface PortfolioStats {
  totalValue: number;
  totalTokens: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  bestPerformer: TokenHolding | null;
  worstPerformer: TokenHolding | null;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'claim';
  tokenAddress: string;
  amount: bigint;
  value: number;
  timestamp: number;
  txHash: string;
}

export interface PortfolioState {
  address: string | null;
  holdings: TokenHolding[];
  transactions: Transaction[];
  stats: PortfolioStats;
  loading: boolean;
  error: string | null;
  lastSync: Date | null;
}

// Initialize store
const initialState: PortfolioState = {
  address: null,
  holdings: [],
  transactions: [],
  stats: {
    totalValue: 0,
    totalTokens: 0,
    totalProfitLoss: 0,
    totalProfitLossPercentage: 0,
    bestPerformer: null,
    worstPerformer: null
  },
  loading: false,
  error: null,
  lastSync: null
};

// Main store
export const portfolioStore = writable<PortfolioState>(initialState);

/**
 * Sync portfolio data for the connected wallet
 */
export async function syncPortfolioData(walletAddress?: string): Promise<void> {
  const address = walletAddress || get(signerAddress);
  
  if (!address) {
    portfolioStore.set(initialState);
    return;
  }

  portfolioStore.update(state => ({ 
    ...state, 
    loading: true, 
    error: null,
    address 
  }));

  try {
    // Fetch user deposits/transactions
    const deposits = await getAllDeposits(address);
    
    // Get current token store state
    const tokenState = get(tokenStore);
    
    // Process holdings
    const holdings: TokenHolding[] = [];
    const transactions: Transaction[] = [];
    
    // Process each deposit
    deposits?.forEach((deposit: any) => {
      // Get token metadata
      const tokenMeta = tokenState.tokensByAddress.get(
        deposit.vault.toLowerCase()
      );
      
      if (tokenMeta && deposit.shares > 0) {
        // Calculate current value (simplified - would need price data)
        const balance = BigInt(deposit.shares);
        const value = Number(formatEther(balance)) * 100; // Placeholder price
        const tokensOwned = Number(formatEther(balance));
        
        // Extract asset information from token metadata
        const assetInfo = {
          name: tokenMeta.asset?.assetName || 'Unknown Asset',
          coverImage: tokenMeta.asset?.coverImage,
          location: {
            state: tokenMeta.asset?.location?.state,
            country: tokenMeta.asset?.location?.country
          }
        };
        
        // Calculate financial metrics (placeholder calculations)
        const invested = value; // Simplified: assume current value = invested
        const earned = 0; // Would calculate from payout history
        const capitalReturned = 0; // Would calculate from payouts vs investment
        const assetDepletion = 0; // Would get from asset data
        const unrecoveredCapital = Math.max(0, invested - earned);
        
        holdings.push({
          id: `${deposit.vault}-${deposit.id}`, // Unique ID for this holding
          token: tokenMeta,
          balance,
          value,
          percentage: 0, // Will calculate after all holdings processed
          asset: assetInfo,
          tokenSymbol: tokenMeta.symbol || 'UNKNOWN',
          tokensOwned,
          status: tokenMeta.asset?.production?.status || 'unknown',
          invested,
          earned,
          capitalReturned,
          assetDepletion,
          unrecoveredCapital,
          payoutHistory: [] // Would populate from tokenMeta.payoutData
        });
      }
      
      // Track transaction
      if (deposit.transactionHash) {
        transactions.push({
          id: deposit.id,
          type: 'deposit',
          tokenAddress: deposit.vault,
          amount: BigInt(deposit.shares),
          value: Number(formatEther(BigInt(deposit.shares))) * 100,
          timestamp: deposit.timestamp,
          txHash: deposit.transactionHash
        });
      }
    });
    
    // Calculate portfolio statistics
    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
    
    // Update percentages
    holdings.forEach(holding => {
      holding.percentage = totalValue > 0 ? (holding.value / totalValue) * 100 : 0;
    });
    
    // Sort holdings by value
    holdings.sort((a, b) => b.value - a.value);
    
    // Calculate P&L (simplified - would need historical data)
    const totalInvested = transactions
      .filter(tx => tx.type === 'deposit')
      .reduce((sum, tx) => sum + tx.value, 0);
    
    const totalProfitLoss = totalValue - totalInvested;
    const totalProfitLossPercentage = totalInvested > 0 
      ? (totalProfitLoss / totalInvested) * 100 
      : 0;
    
    // Find best and worst performers
    const bestPerformer = holdings.length > 0 ? holdings[0] : null;
    const worstPerformer = holdings.length > 0 
      ? holdings[holdings.length - 1] 
      : null;
    
    // Sort transactions by timestamp
    transactions.sort((a, b) => b.timestamp - a.timestamp);
    
    // Update store
    portfolioStore.update(state => ({
      ...state,
      holdings,
      transactions,
      stats: {
        totalValue,
        totalTokens: holdings.length,
        totalProfitLoss,
        totalProfitLossPercentage,
        bestPerformer,
        worstPerformer
      },
      loading: false,
      error: null,
      lastSync: new Date()
    }));
    
  } catch (error) {
    console.error('Failed to sync portfolio:', error);
    portfolioStore.update(state => ({
      ...state,
      loading: false,
      error: error instanceof Error ? error.message : 'Failed to load portfolio'
    }));
  }
}

/**
 * Get holdings grouped by asset
 */
export const holdingsByAsset = derived(
  [portfolioStore, tokenStore],
  ([$portfolio, $tokens]) => {
    const grouped = new Map<string, TokenHolding[]>();
    
    $portfolio.holdings.forEach(holding => {
      // Find asset for this token
      for (const [assetId, assetData] of $tokens.assets) {
        const hasToken = assetData.tokens.some(
          t => t.address.toLowerCase() === holding.token.address.toLowerCase()
        );
        
        if (hasToken) {
          const existing = grouped.get(assetId) || [];
          existing.push(holding);
          grouped.set(assetId, existing);
          break;
        }
      }
    });
    
    return grouped;
  }
);

/**
 * Portfolio chart data
 */
export const portfolioChartData = derived(portfolioStore, $portfolio => {
  return $portfolio.holdings.map(holding => ({
    name: holding.token.name,
    value: holding.value,
    percentage: holding.percentage
  }));
});

/**
 * Recent transactions
 */
export const recentTransactions = derived(
  portfolioStore, 
  $portfolio => $portfolio.transactions.slice(0, 10)
);

// Auto-sync when wallet changes
signerAddress.subscribe(address => {
  if (address) {
    syncPortfolioData(address);
  } else {
    portfolioStore.set(initialState);
  }
});

// Export loading and error states
export const isLoadingPortfolio = derived(
  portfolioStore, 
  $store => $store.loading
);

export const portfolioError = derived(
  portfolioStore, 
  $store => $store.error
);