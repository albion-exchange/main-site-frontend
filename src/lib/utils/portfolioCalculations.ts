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