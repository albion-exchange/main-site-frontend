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
  WalletPayout,
  PayoutHistoryItem,
} from "$lib/types/wallet";
import { dataStoreService } from "$lib/services/DataStoreService";
import type { Asset, Token } from "$lib/types/uiTypes";
import { formatCurrency as _formatCurrency, formatPercentage as _formatPercentage } from "$lib/utils/formatters";

// Import mock wallet data
import walletDataJson from "$lib/data/mockWallet/wallet.json";

interface SimpleWalletData {
  walletAddress: string;
  transactions: WalletTransaction[];
  payouts: WalletPayout[];
}

class WalletDataService {
  private rawData: SimpleWalletData;

  constructor() {
    // Initialize with mock data
    this.rawData = walletDataJson as SimpleWalletData;
  }

  /**
   * Get the current wallet data with computed values
   */
  getWalletData(): WalletData {
    const holdings = this.computeHoldings();
    const summary = this.computeSummary(holdings);

    return {
      walletAddress: this.rawData.walletAddress,
      holdings,
      summary,
      transactions: this.rawData.transactions,
      payouts: this.rawData.payouts,
    };
  }

  /**
   * Calculate total invested (principal) - sum of all mint transactions
   */
  getTotalInvested(): number {
    return this.rawData.transactions
      .filter((tx) => tx.type === "mint")
      .reduce((sum, tx) => sum + tx.amountUSD, 0);
  }

  /**
   * Calculate total payouts earned (lifetime) - sum of all payout amounts
   */
  getTotalPayoutsEarned(): number {
    return this.rawData.payouts.reduce((sum, payout) => sum + payout.amount, 0);
  }

  /**
   * Get total claimed amount
   */
  getTotalClaimed(): number {
    const claimTransactions = this.rawData.transactions.filter(tx => tx.type === 'claim');
    return claimTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  }

  /**
   * Calculate unclaimed payouts
   */
  getUnclaimedPayouts(): number {
    // Get all payouts
    const totalPayouts = this.getTotalPayoutsEarned();

    // Get all claimed amounts
    const totalClaimed = this.rawData.transactions
      .filter((tx) => tx.type === "claim")
      .reduce((sum, tx) => sum + tx.amount, 0);

    return totalPayouts - totalClaimed;
  }

  /**
   * Get number of active assets
   */
  getActiveAssetsCount(): number {
    const activeAssets = new Set<string>();

    // Get unique assets from transactions by looking up tokens
    this.rawData.transactions
      .filter((tx) => tx.type === "mint")
      .forEach((tx) => {
        const token = dataStoreService.getTokenByAddress(tx.address);
        if (token) {
          const asset = dataStoreService.getAssetById(token.assetId);
          if (
            asset &&
            (asset.production.status === "producing" ||
              asset.production.status === "funding")
          ) {
            activeAssets.add(token.assetId);
          }
        }
      });

    return activeAssets.size;
  }

  /**
   * Compute holdings from transactions and payouts
   */
  computeHoldings(): WalletHolding[] {
    // Group transactions by contract address
    const holdingsByAddress = new Map<
      string,
      {
        transactions: WalletTransaction[];
        payouts: WalletPayout[];
      }
    >();

    // Group mint transactions
    this.rawData.transactions
      .filter((tx) => tx.type === "mint")
      .forEach((tx) => {
        if (!holdingsByAddress.has(tx.address)) {
          holdingsByAddress.set(tx.address, { transactions: [], payouts: [] });
        }
        holdingsByAddress.get(tx.address)!.transactions.push(tx);
      });

    // Group payouts
    this.rawData.payouts.forEach((payout) => {
      if (!holdingsByAddress.has(payout.address)) {
        holdingsByAddress.set(payout.address, {
          transactions: [],
          payouts: [],
        });
      }
      holdingsByAddress.get(payout.address)!.payouts.push(payout);
    });

    // Create holdings
    const holdings: WalletHolding[] = [];

    holdingsByAddress.forEach((data, contractAddress) => {
      // Get token and asset info
      const token = dataStoreService.getTokenByAddress(contractAddress);
      if (!token) return;

      const asset = dataStoreService.getAssetById(token.assetId);
      if (!asset) return;

      // Calculate investment amount
      const investmentAmount = data.transactions
        .filter((tx) => tx.type === "mint")
        .reduce((sum, tx) => sum + tx.amountUSD, 0);

      // Calculate token balance
      const tokenBalance = data.transactions
        .filter((tx) => tx.type === "mint")
        .reduce((sum, tx) => sum + tx.amount, 0);

      // Build payout history
      const payoutHistory = this.buildPayoutHistory(
        contractAddress,
        data.payouts,
      );

      // Calculate payout summary
      const totalEarned = data.payouts.reduce((sum, p) => sum + p.amount, 0);
      const claimedAmount = this.rawData.transactions
        .filter((tx) => tx.type === "claim" && tx.address === contractAddress)
        .reduce((sum, tx) => sum + tx.amount, 0);
      const unclaimedAmount = totalEarned - claimedAmount;

      // Get last claim date
      const lastClaim = this.rawData.transactions
        .filter((tx) => tx.type === "claim" && tx.address === contractAddress)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )[0];

      // Calculate monthly averages
      const monthlyPayouts = data.payouts.map((p) => p.amount);
      const averageMonthlyPayout =
        monthlyPayouts.length > 0
          ? monthlyPayouts.reduce((sum, p) => sum + p, 0) /
            monthlyPayouts.length
          : 0;
      const currentMonthlyPayout =
        monthlyPayouts[monthlyPayouts.length - 1] || 0;

      holdings.push({
        assetId: token.assetId,
        assetName: asset.name,
        contractAddress,
        symbol: token.symbol,
        tokenType: token.tokenType,
        balance: (tokenBalance * Math.pow(10, token.decimals)).toString(),
        formattedBalance: tokenBalance,
        investmentAmount,
        mintTransactions: data.transactions
          .filter((tx) => tx.type === "mint")
          .map((tx) => ({
            txHash: tx.txHash,
            timestamp: tx.timestamp,
            amount: tx.amount,
            amountUSD: tx.amountUSD,
          })),
        payoutsSummary: {
          totalEarned,
          claimedAmount,
          unclaimedAmount,
          lastClaimDate: lastClaim?.timestamp,
          payoutHistory,
        },
        assetStatus: asset.production.status,
        currentMonthlyPayout,
        averageMonthlyPayout,
      });
    });

    return holdings;
  }

  /**
   * Build payout history for a specific contract
   */
  private buildPayoutHistory(
    contractAddress: string,
    payouts: typeof this.rawData.payouts,
  ): PayoutHistoryItem[] {
    const claims = this.rawData.transactions.filter(
      (tx) => tx.type === "claim" && tx.address === contractAddress,
    );

    return payouts.map((payout) => {
      // Find matching claim
      const claim = claims.find(
        (c) =>
          Math.abs(c.amount - payout.amount) < 0.01 && // Allow small difference for rounding
          c.timestamp.substring(0, 7) === payout.month, // Same month
      );

      return {
        month: payout.month,
        amount: payout.amount,
        status: claim ? "claimed" : "unclaimed",
        claimTxHash: claim?.txHash,
        claimDate: claim?.timestamp,
      } as PayoutHistoryItem;
    });
  }

  /**
   * Compute wallet summary
   */
  private computeSummary(holdings: WalletHolding[]): WalletData["summary"] {
    const totalInvested = this.getTotalInvested();
    const totalPayoutsEarned = this.getTotalPayoutsEarned();
    const totalClaimedPayouts = this.rawData.transactions
      .filter((tx) => tx.type === "claim")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalUnclaimedPayouts = totalPayoutsEarned - totalClaimedPayouts;

    // Calculate portfolio allocation
    const portfolioAllocation = holdings.map((holding) => ({
      assetId: holding.assetId,
      assetName: holding.assetName,
      percentage:
        totalInvested > 0
          ? (holding.investmentAmount / totalInvested) * 100
          : 0,
      value: holding.investmentAmount,
    }));

    // Calculate monthly payout trend
    const monthlyPayoutTrend = this.getMonthlyPayoutHistory();

    return {
      totalInvested,
      totalPayoutsEarned,
      totalClaimedPayouts,
      totalUnclaimedPayouts,
      totalHoldings: holdings.length,
      portfolioAllocation,
      monthlyPayoutTrend,
    };
  }

  /**
   * Get holdings by asset with payout information
   */
  getHoldingsByAsset(): AssetPayoutInfo[] {
    const holdings = this.computeHoldings();

    return holdings.map((holding) => {
      const monthlyPayouts = holding.payoutsSummary.payoutHistory.map(
        (payout) => ({
          month: payout.month,
          amount: payout.amount,
          status: payout.status as "claimed" | "unclaimed" | "not_eligible",
        }),
      );

      const lastPayout = holding.payoutsSummary.payoutHistory
        .filter((p) => p.status === "claimed")
        .sort(
          (a, b) =>
            new Date(b.claimDate || "").getTime() -
            new Date(a.claimDate || "").getTime(),
        )[0];

      const roi =
        holding.investmentAmount > 0
          ? (holding.payoutsSummary.totalEarned / holding.investmentAmount) *
            100
          : 0;

      // Find last claim transaction for this asset
      const token = dataStoreService.getTokensByAssetId(holding.assetId)[0];
      const contractAddress = token?.contractAddress;
      const lastClaim = contractAddress ? this.rawData.transactions
        .filter(tx => tx.type === 'claim' && tx.address === contractAddress)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] : null;

      return {
        assetId: holding.assetId,
        assetName: holding.assetName,
        totalInvested: holding.investmentAmount,
        totalEarned: holding.payoutsSummary.totalEarned,
        unclaimedAmount: holding.payoutsSummary.unclaimedAmount,
        lastPayoutAmount: lastPayout?.amount || 0,
        lastPayoutDate: lastPayout?.claimDate,
        lastClaimDate: lastClaim?.timestamp,
        roi,
        monthlyPayouts,
      };
    });
  }

  /**
   * Get monthly payout history across all holdings
   */
  getMonthlyPayoutHistory(): MonthlyPayoutTrend[] {
    // Group payouts by month
    const payoutsByMonth = new Map<string, number>();

    this.rawData.payouts.forEach((payout) => {
      const current = payoutsByMonth.get(payout.month) || 0;
      payoutsByMonth.set(payout.month, current + payout.amount);
    });

    // Convert to array and sort
    return Array.from(payoutsByMonth.entries())
      .map(([month, totalPayout]) => ({ month, totalPayout }))
      .sort((a, b) => a.month.localeCompare(b.month));
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
    // Get all unique months
    const monthsSet = new Set<string>();
    this.rawData.payouts.forEach((payout) => monthsSet.add(payout.month));
    const months = Array.from(monthsSet).sort();

    return months.map((month) => {
      const monthPayouts = this.rawData.payouts.filter(
        (p) => p.month === month,
      );

      const assetBreakdown = monthPayouts.map((payout) => {
        const token = dataStoreService.getTokenByAddress(payout.address);
        const asset = token
          ? dataStoreService.getAssetById(token.assetId)
          : null;

        // Check if claimed
        const claim = this.rawData.transactions.find(
          (tx) =>
            tx.type === "claim" &&
            tx.address === payout.address &&
            Math.abs(tx.amount - payout.amount) < 0.01 &&
            tx.timestamp.substring(0, 7) === month,
        );

        return {
          assetName: asset?.name || "Unknown Asset",
          amount: payout.amount,
          status: claim ? "claimed" : "unclaimed",
        };
      });

      const totalPayout = assetBreakdown.reduce(
        (sum, asset) => sum + asset.amount,
        0,
      );

      return {
        month,
        totalPayout,
        assetBreakdown: assetBreakdown.filter((a) => a.amount > 0),
      };
    });
  }

  /**
   * Get token allocation breakdown by asset
   */
  getTokenAllocation(): TokenAllocation[] {
    const holdings = this.computeHoldings();
    const totalPortfolioValue = this.getTotalInvested();

    return holdings.map((holding) => {
      const percentageOfPortfolio =
        totalPortfolioValue > 0
          ? (holding.investmentAmount / totalPortfolioValue) * 100
          : 0;

      return {
        tokenSymbol: holding.symbol,
        assetId: holding.assetId,
        assetName: holding.assetName,
        tokensOwned: holding.formattedBalance,
        percentageOfPortfolio,
        currentValue: holding.investmentAmount, // In real implementation, would fetch current market value
        totalEarned: holding.payoutsSummary.totalEarned,
      };
    });
  }

  /**
   * Get comprehensive wallet metrics
   */
  getWalletMetrics(): WalletMetrics {
    const totalInvested = this.getTotalInvested();
    const totalReturns = this.getTotalPayoutsEarned();
    const totalROI =
      totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    // Calculate average monthly income
    const monthlyPayouts = this.getMonthlyPayoutHistory();
    const averageMonthlyIncome =
      monthlyPayouts.length > 0
        ? monthlyPayouts.reduce((sum, m) => sum + m.totalPayout, 0) /
          monthlyPayouts.length
        : 0;

    // Calculate portfolio diversity (simple Herfindahl index)
    const allocations = this.getTokenAllocation();
    const diversityScore =
      1 -
      allocations.reduce(
        (sum, a) => sum + Math.pow(a.percentageOfPortfolio / 100, 2),
        0,
      );

    // Estimate next payout (simple approach - takes average of last 3 months)
    const recentPayouts = monthlyPayouts.slice(-3);
    const nextExpectedAmount =
      recentPayouts.length > 0
        ? recentPayouts.reduce((sum, p) => sum + p.totalPayout, 0) /
          recentPayouts.length
        : 0;

    // Calculate next month
    const lastMonth = monthlyPayouts[monthlyPayouts.length - 1]?.month;
    let nextExpectedPayout = null;
    if (lastMonth) {
      const [year, month] = lastMonth.split("-").map(Number);
      const nextDate = new Date(year, month, 15); // 15th of next month
      nextExpectedPayout = {
        estimatedDate: nextDate.toISOString().split("T")[0],
        estimatedAmount: nextExpectedAmount,
      };
    }

    return {
      totalValue: totalInvested, // In real implementation, would be current market value
      totalInvested,
      totalReturns,
      totalROI,
      averageMonthlyIncome,
      portfolioDiversity: diversityScore,
      nextExpectedPayout,
    };
  }

  /**
   * Get all transactions sorted by date
   */
  getAllTransactions(): WalletTransaction[] {
    return this.rawData.transactions.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  /**
   * Get transactions by type
   */
  getTransactionsByType(type: "mint" | "claim"): WalletTransaction[] {
    return this.rawData.transactions
      .filter((tx) => tx.type === type)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }

  /**
   * Get transactions for a specific asset
   */
  getTransactionsByAsset(contractAddress: string): WalletTransaction[] {
    return this.rawData.transactions
      .filter((tx) => tx.address === contractAddress)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
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
    const holdings = this.computeHoldings();

    return holdings
      .map((holding) => {
        const unclaimedPayouts = holding.payoutsSummary.payoutHistory.filter(
          (p) => p.status === "unclaimed",
        );

        const totalUnclaimed = unclaimedPayouts.reduce(
          (sum, p) => sum + p.amount,
          0,
        );

        return {
          assetId: holding.assetId,
          assetName: holding.assetName,
          contractAddress: holding.contractAddress,
          unclaimedPayouts,
          totalUnclaimed,
        };
      })
      .filter((asset) => asset.totalUnclaimed > 0);
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
    const holdings = this.computeHoldings();

    return holdings
      .map((holding) => {
        const roi =
          holding.investmentAmount > 0
            ? (holding.payoutsSummary.totalEarned / holding.investmentAmount) *
              100
            : 0;

        return {
          assetName: holding.assetName,
          roi,
          totalEarned: holding.payoutsSummary.totalEarned,
          averageMonthlyPayout: holding.averageMonthlyPayout,
          lastPayoutAmount: holding.currentMonthlyPayout,
        };
      })
      .sort((a, b) => b.roi - a.roi);
  }

  /**
   * Get holdings with asset details from DataStoreService
   */
  getHoldingsWithAssetDetails(): Array<{
    holding: WalletHolding;
    asset: Asset | null;
    token: Token | null;
  }> {
    const holdings = this.computeHoldings();

    return holdings.map((holding) => {
      const asset = dataStoreService.getAssetById(holding.assetId);
      const token = dataStoreService.getTokenByAddress(holding.contractAddress);

      return {
        holding,
        asset,
        token,
      };
    });
  }

  /**
   * Calculate estimated annual income based on recent payouts
   */
  getEstimatedAnnualIncome(): number {
    const recentPayouts = this.getMonthlyPayoutHistory().slice(-6); // Last 6 months
    if (recentPayouts.length === 0) return 0;

    const averageMonthly =
      recentPayouts.reduce((sum, p) => sum + p.totalPayout, 0) /
      recentPayouts.length;
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
    const claimTransactions = this.getTransactionsByType("claim");
    const payoutDates = claimTransactions.map(
      (tx) => tx.timestamp.split("T")[0],
    );

    if (payoutDates.length < 2) {
      return {
        averageDaysBetweenPayouts: 0,
        payoutDates,
        isConsistent: false,
      };
    }

    // Calculate days between consecutive payouts
    const daysBetween: number[] = [];
    for (let i = 1; i < payoutDates.length; i++) {
      const days = Math.abs(
        (new Date(payoutDates[i]).getTime() -
          new Date(payoutDates[i - 1]).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      daysBetween.push(days);
    }

    const averageDays =
      daysBetween.reduce((sum, d) => sum + d, 0) / daysBetween.length;
    const variance =
      daysBetween.reduce((sum, d) => sum + Math.pow(d - averageDays, 2), 0) /
      daysBetween.length;
    const standardDeviation = Math.sqrt(variance);

    // Consider consistent if standard deviation is less than 7 days
    const isConsistent = standardDeviation < 7;

    return {
      averageDaysBetweenPayouts: Math.round(averageDays),
      payoutDates,
      isConsistent,
    };
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return _formatCurrency(amount);
  }

  /**
   * Get claim history
   */
  getClaimHistory(): Array<{
    date: string;
    amount: number;
    asset: string;
    txHash: string;
    status: string;
  }> {
    const claimTransactions = this.rawData.transactions.filter(tx => tx.type === 'claim');
    
    return claimTransactions.map(tx => {
      const token = dataStoreService.getTokenByAddress(tx.address);
      const asset = token ? dataStoreService.getAssetById(token.assetId) : null;
      
      return {
        date: tx.timestamp,
        amount: tx.amount,
        asset: asset ? asset.name : 'Unknown Asset',
        txHash: tx.txHash,
        status: 'completed'
      };
    });
  }

  /**
   * Format percentage for display
   */
  formatPercentage(value: number): string {
    return _formatPercentage(value / 100);
  }
}

// Export singleton instance
const walletDataService = new WalletDataService();
export default walletDataService;
export { walletDataService };
