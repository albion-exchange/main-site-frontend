/**
 * Return calculation utilities for royalty tokens
 * Based on planned production data and token supply metrics
 */

import type { TokenMetadata } from "$lib/types/MetaboardTypes";
import type {
  Asset,
  Token,
  PlannedProductionProjection,
} from "$lib/types/uiTypes";

export interface TokenReturns {
  baseReturn: number; // Annual percentage
  bonusReturn: number; // Annual percentage
  impliedBarrelsPerToken: number; // Barrels per $1 token
  breakEvenOilPrice: number; // USD per barrel
}

/**
 * Calculate IRR (Internal Rate of Return) using Newton's method
 * @param cashFlows Array of cash flows where index 0 is the initial investment (negative)
 * @returns IRR as a decimal (e.g., 0.12 for 12%)
 */
function calculateIRR(cashFlows: number[]): number {
  const maxIterations = 100;
  const tolerance = 1e-7;
  let rate = 0.1; // Initial guess of 10%
  
  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;
    
    for (let j = 0; j < cashFlows.length; j++) {
      const factor = Math.pow(1 + rate, j);
      npv += cashFlows[j] / factor;
      dnpv -= j * cashFlows[j] / Math.pow(1 + rate, j + 1);
    }
    
    const newRate = rate - npv / dnpv;
    
    if (Math.abs(newRate - rate) < tolerance) {
      return newRate;
    }
    
    rate = newRate;
  }
  
  return rate;
}

/**
 * Calculate token returns based on planned production and token metrics
 * Using IRR methodology as specified
 * @param asset Asset data containing planned production
 * @param token Token data containing supply and share percentage
 * @returns Calculated returns and metrics
 */
export function calculateTokenReturns(
  asset: Asset,
  token: TokenMetadata,
): TokenReturns {
  if (!asset.plannedProduction || !token.sharePercentage) {
    return {
      baseReturn: 0,
      bonusReturn: 0,
      impliedBarrelsPerToken: 0,
      breakEvenOilPrice: 0,
    };
  }

  const { plannedProduction } = asset;
  const { projections, oilPriceAssumption } = plannedProduction;
  const sharePercentage = token.sharePercentage / 100; // Convert to decimal

  // Get pricing adjustments from asset technical data
  const benchmarkPremium = asset.technical?.pricing?.benchmarkPremium 
    ? parseFloat(asset.technical.pricing.benchmarkPremium.replace(/[^-\d.]/g, ''))
    : (token.asset?.technical?.pricing?.benchmarkPremium || 0);
  const transportCosts = asset.technical?.pricing?.transportCosts
    ? parseFloat(asset.technical.pricing.transportCosts.replace(/[^-\d.]/g, ''))
    : (token.asset?.technical?.pricing?.transportCosts || 0);

  // Calculate adjusted oil price
  const adjustedOilPrice = oilPriceAssumption + benchmarkPremium - transportCosts;

  // Convert supply to numbers
  const maxSupply =
    typeof token.supply?.maxSupply === "string"
      ? Number(BigInt(token.supply.maxSupply) / BigInt(10 ** token.decimals))
      : Number(token.supply?.maxSupply || 0);
  const mintedSupply =
    typeof token.supply?.mintedSupply === "string"
      ? Number(BigInt(token.supply.mintedSupply) / BigInt(10 ** token.decimals))
      : Number(token.supply?.mintedSupply || 0);

  // Build cash flows for IRR calculation
  // Start with initial investment of -$1 at month 0
  const baseCashFlows = [-1]; // Month 0: pay $1 per token
  const mintedCashFlows = [-1]; // Month 0: pay $1 per token
  
  let totalProduction = 0;

  for (const projection of projections) {
    // Step 1 & 2: Production * adjusted oil price (with benchmark premium and transport costs)
    const monthlyRevenue = projection.production * adjustedOilPrice;

    // Step 3: Apply token's share of asset
    const tokenShareRevenue = monthlyRevenue * sharePercentage;

    // Step 4a: Revenue per token using max supply (base case)
    const revenuePerTokenBase = tokenShareRevenue / maxSupply;
    baseCashFlows.push(revenuePerTokenBase);

    // Step 4b: Revenue per token using minted supply (bonus case)
    const revenuePerTokenMinted = mintedSupply > 0 ? tokenShareRevenue / mintedSupply : 0;
    mintedCashFlows.push(revenuePerTokenMinted);

    totalProduction += projection.production;
  }

  // Calculate monthly IRR
  const monthlyIRRBase = calculateIRR(baseCashFlows);
  const monthlyIRRMinted = mintedSupply > 0 ? calculateIRR(mintedCashFlows) : 0;

  // Convert monthly IRR to annual: (1 + monthly_rate)^12 - 1
  const baseReturn = (Math.pow(1 + monthlyIRRBase, 12) - 1) * 100;
  const mintedReturn = (Math.pow(1 + monthlyIRRMinted, 12) - 1) * 100;

  const bonusReturn = mintedReturn - baseReturn;

  // Calculate implied barrels per $1 token
  // This represents how many barrels of oil each $1 investment in the token represents
  // Formula: (Total barrels * share percentage) / (minted supply * $1 token price)
  // Since tokens are priced at $1, this simplifies to total barrels share / minted supply
  const impliedBarrelsPerToken = mintedSupply > 0
    ? (totalProduction * sharePercentage) / mintedSupply
    : 0;

  // Calculate breakeven oil price (price needed to recover $1 per token)
  // This is the oil price where total revenue equals total token investment
  // Formula: (minted supply * $1) / (total barrels * share percentage)
  const breakEvenOilPrice = totalProduction * sharePercentage > 0
    ? mintedSupply / (totalProduction * sharePercentage)
    : 0;

  return {
    baseReturn: Math.max(0, baseReturn),
    bonusReturn: Math.max(0, bonusReturn),
    impliedBarrelsPerToken,
    breakEvenOilPrice,
  };
}

/**
 * Get calculated returns for a token, with caching
 */
const returnCache = new Map<string, TokenReturns>();

export function getTokenReturns(
  asset: Asset,
  token: TokenMetadata,
): TokenReturns {
  const cacheKey = `${asset.id}-${token.contractAddress}`;

  if (returnCache.has(cacheKey)) {
    return returnCache.get(cacheKey)!;
  }

  const returns = calculateTokenReturns(asset, token);
  returnCache.set(cacheKey, returns);

  return returns;
}

/**
 * Clear the returns cache (useful when data changes)
 */
export function clearReturnsCache(): void {
  returnCache.clear();
}

export function getTokenSupply(token: TokenMetadata) {
  if (!token) return null;

  const maxSupply =
    parseFloat(token.supply.maxSupply) / Math.pow(10, token.decimals);
  const mintedSupply =
    parseFloat(token.supply.mintedSupply) / Math.pow(10, token.decimals);
  const supplyUtilization = (mintedSupply / maxSupply) * 100;

  return {
    maxSupply,
    mintedSupply,
    supplyUtilization,
    availableSupply: maxSupply - mintedSupply,
  };
}

export function getTokenPayoutHistory(
  token: TokenMetadata,
): { recentPayouts: any[] } | null {
  if (!token || !token.payoutData) {
    return null;
  }

  return {
    recentPayouts: token.payoutData.map((payout) => ({
      month: payout.month,
      totalPayout: payout.tokenPayout.totalPayout,
      payoutPerToken: payout.tokenPayout.payoutPerToken,
    })),
  };
}
