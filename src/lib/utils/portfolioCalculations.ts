/**
 * Portfolio calculation utilities
 * Calculates real portfolio values based on user holdings and asset data
 */

import type { Asset, Token } from "$lib/types/uiTypes";

export interface PortfolioHolding {
  energyField: string; // Energy field name from ENERGY_FIELDS
  tokenAddress: string;
  tokensOwned: number;
  investmentAmount: number;
  currentValue: number;
  totalEarned: number;
  unclaimedAmount: number;
  lastPayout: string;
}

export interface PortfolioSummary {
  totalPortfolioValue: number;
  totalInvested: number;
  unrealizedGains: number;
  unclaimedPayout: number;
  totalEarned: number;
  totalClaimed: number;
}

/**
 * Calculate portfolio summary from user holdings
 * @param holdings Array of user holdings
 * @returns Portfolio summary with calculated totals
 */
export function calculatePortfolioSummary(
  holdings: PortfolioHolding[],
): PortfolioSummary {
  const summary = holdings.reduce(
    (acc, holding) => {
      acc.totalPortfolioValue += holding.currentValue;
      acc.totalInvested += holding.investmentAmount;
      acc.totalEarned += holding.totalEarned;
      acc.unclaimedPayout += holding.unclaimedAmount;
      return acc;
    },
    {
      totalPortfolioValue: 0,
      totalInvested: 0,
      unrealizedGains: 0,
      unclaimedPayout: 0,
      totalEarned: 0,
      totalClaimed: 0,
    },
  );

  summary.unrealizedGains = summary.totalPortfolioValue - summary.totalInvested;
  summary.totalClaimed = summary.totalEarned - summary.unclaimedPayout;

  return summary;
}

/**
 * Get mock portfolio holdings for demonstration
 * In a real app, this would fetch from blockchain or user's actual holdings
 */
export function getMockPortfolioHoldings(): PortfolioHolding[] {
  return [
    {
      energyField: "Bakken Horizon Field",
      tokenAddress: "0xd5316ca888491575befc0273a00de2186c53f760",
      tokensOwned: 18750,
      investmentAmount: 18750,
      currentValue: 19125,
      totalEarned: 2847.15,
      unclaimedAmount: 487.32,
      lastPayout: "2024-12-15",
    },
    {
      energyField: "Bakken Horizon Field",
      tokenAddress: "0xea9a6f77483a07bc287dfb8dad151042376eb153",
      tokensOwned: 12500,
      investmentAmount: 12500,
      currentValue: 12875,
      totalEarned: 2156.47,
      unclaimedAmount: 342.18,
      lastPayout: "2024-12-10",
    },
    {
      energyField: "Gulf of Mexico-4",
      tokenAddress: "0xae69a129b626b1e8fce196ef8e7d5faea3be753f",
      tokensOwned: 8750,
      investmentAmount: 8750,
      currentValue: 9062.5,
      totalEarned: 1847.21,
      unclaimedAmount: 286.74,
      lastPayout: "2024-12-20",
    },
    {
      energyField: "Permian Basin-3 Release 1",
      tokenAddress: "0xc699575fe18f00104d926f0167cd858ce6d8b32e",
      tokensOwned: 2000,
      investmentAmount: 2000,
      currentValue: 2180,
      totalEarned: 621.32,
      unclaimedAmount: 131.58,
      lastPayout: "2024-12-05",
    },
  ];
}

/**
 * Calculate unclaimed payout for a specific user and asset
 * This would typically involve checking blockchain state
 */
export function calculateUnclaimedPayout(
  userAddress: string,
  energyField: string,
): number {
  // Mock calculation - in reality this would check:
  // 1. User's token balance for the asset
  // 2. Last claimed block/timestamp
  // 3. Payouts since last claim
  // 4. User's share of each payout

  const mockHoldings = getMockPortfolioHoldings();
  const holding = mockHoldings.find((h) => h.energyField === energyField);
  return holding?.unclaimedAmount || 0;
}

/**
 * Calculate total unclaimed payout across all user holdings
 */
export function calculateTotalUnclaimedPayout(userAddress: string): number {
  const holdings = getMockPortfolioHoldings();
  return holdings.reduce(
    (total, holding) => total + holding.unclaimedAmount,
    0,
  );
}
