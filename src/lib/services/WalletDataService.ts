/**
 * WalletDataService - Service layer for managing wallet data and calculations
 * Provides methods for calculating investments, payouts, and portfolio metrics
 */

import type { 
  WalletData, 
  WalletHolding, 
  AssetPayoutInfo, 
  WalletMetrics,
  TokenAllocation,
  MonthlyPayoutTrend,
  WalletTransaction,
  PayoutHistoryItem
} from '$lib/types/wallet';
import { dataStoreService } from '$lib/services/DataStoreService';
import type { Asset, Token } from '$lib/types/dataStore';

// Import mock wallet data
import walletData from '$lib/data/mockWallet/wallet.json';

class WalletDataService {
  private walletData: WalletData;

  constructor() {
    // Initialize with mock data
    this.walletData = walletData as WalletData;
  }

  /**
   * Get the current wallet data
   */
  getWalletData(): WalletData {
    return this.walletData;
  }

  /**
   * Calculate total invested (principal) - sum of all mint transactions
   */
  getTotalInvested(): number {
    return this.walletData.summary.totalInvested;
  }

  /**
   * Calculate total payouts earned (lifetime)
   */
  getTotalPayoutsEarned(): number {
    return this.walletData.summary.totalPayoutsEarned;
  }

  /**
   * Calculate unclaimed payouts
   */
  getUnclaimedPayouts(): number {
    return this.walletData.summary.totalUnclaimedPayouts;
  }

  /**
   * Get holdings by asset with payout information
   */
  getHoldingsByAsset(): AssetPayoutInfo[] {
    return this.walletData.holdings.map(holding => {
      const monthlyPayouts = holding.payoutsSummary.payoutHistory.map(payout => ({
        month: payout.month,
        amount: payout.amount,
        status: payout.status as 'claimed' | 'unclaimed' | 'not_eligible'
      }));

      const lastPayout = holding.payoutsSummary.payoutHistory
        .filter(p => p.status === 'claimed')
        .sort((a, b) => new Date(b.claimDate || '').getTime() - new Date(a.claimDate || '').getTime())[0];

      const roi = holding.investmentAmount > 0 
        ? (holding.payoutsSummary.totalEarned / holding.investmentAmount) * 100 
        : 0;

      return {
        assetId: holding.assetId,
        assetName: holding.assetName,
        totalInvested: holding.investmentAmount,
        totalEarned: holding.payoutsSummary.totalEarned,
        unclaimedAmount: holding.payoutsSummary.unclaimedAmount,
        lastPayoutAmount: lastPayout?.amount || 0,
        lastPayoutDate: lastPayout?.claimDate,
        roi,
        monthlyPayouts
      };
    });
  }

  /**
   * Get monthly payout history across all holdings
   */
  getMonthlyPayoutHistory(): MonthlyPayoutTrend[] {
    return this.walletData.summary.monthlyPayoutTrend;
  }

  /**
   * Get detailed monthly payout breakdown by asset
   */
  getDetailedMonthlyPayouts(): Array<{
    month: string;
    totalPayout: number;
    assetBreakdown: Array<{
      assetName: string;
      amount: number;
      status: string;
    }>;
  }> {
    // Get all unique months from holdings
    const monthsSet = new Set<string>();
    this.walletData.holdings.forEach(holding => {
      holding.payoutsSummary.payoutHistory.forEach(payout => {
        monthsSet.add(payout.month);
      });
    });

    const months = Array.from(monthsSet).sort();

    return months.map(month => {
      const assetBreakdown = this.walletData.holdings.map(holding => {
        const monthPayout = holding.payoutsSummary.payoutHistory.find(p => p.month === month);
        return {
          assetName: holding.assetName,
          amount: monthPayout?.amount || 0,
          status: monthPayout?.status || 'not_eligible'
        };
      });

      const totalPayout = assetBreakdown.reduce((sum, asset) => sum + asset.amount, 0);

      return {
        month,
        totalPayout,
        assetBreakdown: assetBreakdown.filter(a => a.amount > 0)
      };
    });
  }

  /**
   * Get token allocation breakdown by asset
   */
  getTokenAllocation(): TokenAllocation[] {
    const totalPortfolioValue = this.getTotalInvested();

    return this.walletData.holdings.map(holding => {
      const percentageOfPortfolio = totalPortfolioValue > 0 
        ? (holding.investmentAmount / totalPortfolioValue) * 100 
        : 0;

      return {
        tokenSymbol: holding.symbol,
        assetName: holding.assetName,
        tokensOwned: holding.formattedBalance,
        percentageOfPortfolio,
        currentValue: holding.investmentAmount, // In real implementation, would fetch current market value
        totalEarned: holding.payoutsSummary.totalEarned
      };
    });
  }

  /**
   * Get comprehensive wallet metrics
   */
  getWalletMetrics(): WalletMetrics {
    const totalInvested = this.getTotalInvested();
    const totalReturns = this.getTotalPayoutsEarned();
    const totalROI = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    // Calculate average monthly income
    const monthlyPayouts = this.getMonthlyPayoutHistory();
    const averageMonthlyIncome = monthlyPayouts.length > 0
      ? monthlyPayouts.reduce((sum, m) => sum + m.totalPayout, 0) / monthlyPayouts.length
      : 0;

    // Calculate portfolio diversity (simple Herfindahl index)
    const allocations = this.walletData.summary.portfolioAllocation;
    const diversityScore = 1 - allocations.reduce((sum, a) => sum + Math.pow(a.percentage / 100, 2), 0);

    // Estimate next payout (simple approach - takes average of last 3 months)
    const recentPayouts = monthlyPayouts.slice(-3);
    const nextExpectedAmount = recentPayouts.length > 0
      ? recentPayouts.reduce((sum, p) => sum + p.totalPayout, 0) / recentPayouts.length
      : 0;

    // Calculate next month
    const lastMonth = monthlyPayouts[monthlyPayouts.length - 1]?.month;
    let nextExpectedPayout = null;
    if (lastMonth) {
      const [year, month] = lastMonth.split('-').map(Number);
      const nextDate = new Date(year, month, 15); // 15th of next month
      nextExpectedPayout = {
        estimatedDate: nextDate.toISOString().split('T')[0],
        estimatedAmount: nextExpectedAmount
      };
    }

    return {
      totalValue: totalInvested, // In real implementation, would be current market value
      totalInvested,
      totalReturns,
      totalROI,
      averageMonthlyIncome,
      portfolioDiversity: diversityScore,
      nextExpectedPayout
    };
  }

  /**
   * Get all transactions sorted by date
   */
  getAllTransactions(): WalletTransaction[] {
    return this.walletData.transactions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Get transactions by type
   */
  getTransactionsByType(type: 'mint' | 'claim'): WalletTransaction[] {
    return this.walletData.transactions
      .filter(tx => tx.type === type)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get transactions for a specific asset
   */
  getTransactionsByAsset(contractAddress: string): WalletTransaction[] {
    return this.walletData.transactions
      .filter(tx => tx.address === contractAddress)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get unclaimed payouts by asset
   */
  getUnclaimedPayoutsByAsset(): Array<{
    assetId: string;
    assetName: string;
    contractAddress: string;
    unclaimedPayouts: PayoutHistoryItem[];
    totalUnclaimed: number;
  }> {
    return this.walletData.holdings
      .map(holding => {
        const unclaimedPayouts = holding.payoutsSummary.payoutHistory
          .filter(p => p.status === 'unclaimed');
        
        const totalUnclaimed = unclaimedPayouts.reduce((sum, p) => sum + p.amount, 0);

        return {
          assetId: holding.assetId,
          assetName: holding.assetName,
          contractAddress: holding.contractAddress,
          unclaimedPayouts,
          totalUnclaimed
        };
      })
      .filter(asset => asset.totalUnclaimed > 0);
  }

  /**
   * Get asset performance comparison
   */
  getAssetPerformanceComparison(): Array<{
    assetName: string;
    roi: number;
    totalEarned: number;
    averageMonthlyPayout: number;
    lastPayoutAmount: number;
  }> {
    return this.walletData.holdings.map(holding => {
      const roi = holding.investmentAmount > 0 
        ? (holding.payoutsSummary.totalEarned / holding.investmentAmount) * 100 
        : 0;

      return {
        assetName: holding.assetName,
        roi,
        totalEarned: holding.payoutsSummary.totalEarned,
        averageMonthlyPayout: holding.averageMonthlyPayout,
        lastPayoutAmount: holding.currentMonthlyPayout
      };
    }).sort((a, b) => b.roi - a.roi);
  }

  /**
   * Get holdings with asset details from DataStoreService
   */
  getHoldingsWithAssetDetails(): Array<{
    holding: WalletHolding;
    asset: Asset | null;
    token: Token | null;
  }> {
    return this.walletData.holdings.map(holding => {
      const asset = dataStoreService.getAssetById(holding.assetId);
      const token = dataStoreService.getTokenByAddress(holding.contractAddress);
      
      return {
        holding,
        asset,
        token
      };
    });
  }

  /**
   * Calculate estimated annual income based on recent payouts
   */
  getEstimatedAnnualIncome(): number {
    const recentPayouts = this.getMonthlyPayoutHistory().slice(-6); // Last 6 months
    if (recentPayouts.length === 0) return 0;

    const averageMonthly = recentPayouts.reduce((sum, p) => sum + p.totalPayout, 0) / recentPayouts.length;
    return averageMonthly * 12;
  }

  /**
   * Get payout frequency analysis
   */
  getPayoutFrequency(): {
    averageDaysBetweenPayouts: number;
    payoutDates: string[];
    isConsistent: boolean;
  } {
    const claimTransactions = this.getTransactionsByType('claim');
    const payoutDates = claimTransactions.map(tx => tx.timestamp.split('T')[0]);

    if (payoutDates.length < 2) {
      return {
        averageDaysBetweenPayouts: 0,
        payoutDates,
        isConsistent: false
      };
    }

    // Calculate days between consecutive payouts
    const daysBetween: number[] = [];
    for (let i = 1; i < payoutDates.length; i++) {
      const days = Math.abs(
        (new Date(payoutDates[i]).getTime() - new Date(payoutDates[i-1]).getTime()) / (1000 * 60 * 60 * 24)
      );
      daysBetween.push(days);
    }

    const averageDays = daysBetween.reduce((sum, d) => sum + d, 0) / daysBetween.length;
    const variance = daysBetween.reduce((sum, d) => sum + Math.pow(d - averageDays, 2), 0) / daysBetween.length;
    const standardDeviation = Math.sqrt(variance);

    // Consider consistent if standard deviation is less than 7 days
    const isConsistent = standardDeviation < 7;

    return {
      averageDaysBetweenPayouts: Math.round(averageDays),
      payoutDates,
      isConsistent
    };
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Format percentage for display
   */
  formatPercentage(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  }
}

// Export singleton instance
const walletDataService = new WalletDataService();
export default walletDataService;
export { walletDataService };