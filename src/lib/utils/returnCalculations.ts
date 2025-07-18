/**
 * Return calculation utilities for royalty tokens
 * Based on planned production data and token supply metrics
 */

import type { Asset, Token, PlannedProductionProjection } from '$lib/types/uiTypes';

export interface TokenReturns {
  baseReturn: number; // Annual percentage
  bonusReturn: number; // Annual percentage
  impliedBarrelsPerToken: number; // Barrels per $1 token
  breakEvenOilPrice: number; // USD per barrel
}


/**
 * Calculate token returns based on planned production and token metrics
 * Using total return approach instead of IRR for simplicity and accuracy
 * @param asset Asset data containing planned production
 * @param token Token data containing supply and share percentage
 * @returns Calculated returns and metrics
 */
export function calculateTokenReturns(asset: Asset, token: Token): TokenReturns {
  if (!asset.plannedProduction || !token.sharePercentage) {
    return {
      baseReturn: 0,
      bonusReturn: 0,
      impliedBarrelsPerToken: 0,
      breakEvenOilPrice: 0
    };
  }
  
  const { plannedProduction } = asset;
  const { projections, oilPriceAssumption } = plannedProduction;
  const sharePercentage = token.sharePercentage / 100; // Convert to decimal
  
  // Convert from wei to tokens (divide by 10^decimals)
  const maxSupply = parseFloat(token.supply.maxSupply) / Math.pow(10, token.decimals);
  const mintedSupply = parseFloat(token.supply.mintedSupply) / Math.pow(10, token.decimals);
  
  // Calculate total production and revenue over the asset life
  let totalProduction = 0;
  let totalRevenueBase = 0; // Using max supply
  let totalRevenueMinted = 0; // Using minted supply
  
  for (const projection of projections) {
    // Step 1 & 2: Production * oil price
    const monthlyRevenue = projection.production * oilPriceAssumption;
    
    // Step 3: Apply token's share of asset
    const tokenShareRevenue = monthlyRevenue * sharePercentage;
    
    // Step 4a: Revenue per token using max supply (base case)
    const revenuePerTokenBase = tokenShareRevenue / maxSupply;
    totalRevenueBase += revenuePerTokenBase;
    
    // Step 4b: Revenue per token using minted supply (bonus case)
    const revenuePerTokenMinted = tokenShareRevenue / mintedSupply;
    totalRevenueMinted += revenuePerTokenMinted;
    
    totalProduction += projection.production;
  }
  
  // Calculate time period for annualization
  const monthsInProjection = projections.length;
  const yearsInProjection = monthsInProjection / 12;
  
  // Calculate returns as total return percentage, then annualize
  const totalBaseReturn = (totalRevenueBase / 1) * 100; // Total % return on $1 investment
  const totalMintedReturn = (totalRevenueMinted / 1) * 100; // Total % return on minted basis
  
  // Annualize the returns: (Total Return)^(1/years) - 1
  const baseReturn = yearsInProjection > 0 ? 
    (Math.pow(1 + totalBaseReturn / 100, 1 / yearsInProjection) - 1) * 100 : 0;
  const mintedReturn = yearsInProjection > 0 ? 
    (Math.pow(1 + totalMintedReturn / 100, 1 / yearsInProjection) - 1) * 100 : 0;
  
  const bonusReturn = mintedReturn - baseReturn;
  
  // Calculate implied barrels per token (skip step 3, use minted tokens)
  const impliedBarrelsPerToken = totalProduction / mintedSupply;
  
  // Calculate breakeven oil price
  const breakEvenOilPrice = 1 / impliedBarrelsPerToken;
  
  return {
    baseReturn: Math.max(0, baseReturn),
    bonusReturn: Math.max(0, bonusReturn),
    impliedBarrelsPerToken,
    breakEvenOilPrice
  };
}

/**
 * Get calculated returns for a token, with caching
 */
const returnCache = new Map<string, TokenReturns>();

export function getTokenReturns(asset: Asset, token: Token): TokenReturns {
  const cacheKey = `${asset.id}-${token.contractAddress}`;
  
  if (returnCache.has(cacheKey)) {
    return returnCache.get(cacheKey)!;
  }
  
  const returns = calculateTokenReturns(asset, token);
  returnCache.set(cacheKey, returns);

  console.log('returns : ', returns);
  
  return returns;
}

/**
 * Clear the returns cache (useful when data changes)
 */
export function clearReturnsCache(): void {
  returnCache.clear();
}

export function getTokenSupply(token: Token) {
  if (!token) return null;

  const maxSupply = parseFloat(token.supply.maxSupply) / Math.pow(10, token.decimals);
  const mintedSupply = parseFloat(token.supply.mintedSupply) / Math.pow(10, token.decimals);
  const supplyUtilization = (mintedSupply / maxSupply) * 100;

  return {
    maxSupply,
    mintedSupply,
    supplyUtilization,
    availableSupply: maxSupply - mintedSupply
  };
}

export function getTokenPayoutHistory(asset: Asset) {
  const assetMetadata = asset.metadata;
  if (!assetMetadata) return null;

  const recentPayouts = asset.monthlyData.map(data => ({
    month: data.month,
    date: data.tokenPayout.date.split('T')[0],
    totalPayout: data.tokenPayout.totalPayout,
    payoutPerToken: data.tokenPayout.payoutPerToken,
    oilPrice: data.realisedPrice.oilPrice,
    gasPrice: data.realisedPrice.gasPrice,
    productionVolume: data.assetData.production,
    txHash: data.tokenPayout.txHash
  }));

  const totalPayouts = recentPayouts.length;
  const averageMonthlyPayout = recentPayouts.length > 0 
    ? recentPayouts.reduce((sum, payout) => sum + payout.payoutPerToken, 0) / totalPayouts 
    : 0;

  return {
    recentPayouts,
    totalPayouts,
    averageMonthlyPayout,
    totalPaid: recentPayouts.reduce((sum, payout) => sum + payout.totalPayout, 0)
  };
}

// export function getTokenPayoutHistory(contractAddress: string) {
//   const assetMetadata = this.assetMetadata[contractAddress];
//   if (!assetMetadata) return null;

//   const recentPayouts = assetMetadata.monthlyData.map(data => ({
//     month: data.month,
//     date: data.tokenPayout.date.split('T')[0],
//     totalPayout: data.tokenPayout.totalPayout,
//     payoutPerToken: data.tokenPayout.payoutPerToken,
//     oilPrice: data.realisedPrice.oilPrice,
//     gasPrice: data.realisedPrice.gasPrice,
//     productionVolume: data.assetData.production,
//     txHash: data.tokenPayout.txHash
//   }));

//   const totalPayouts = recentPayouts.length;
//   const averageMonthlyPayout = recentPayouts.length > 0 
//     ? recentPayouts.reduce((sum, payout) => sum + payout.payoutPerToken, 0) / totalPayouts 
//     : 0;

//   return {
//     recentPayouts,
//     totalPayouts,
//     averageMonthlyPayout,
//     totalPaid: recentPayouts.reduce((sum, payout) => sum + payout.totalPayout, 0)
//   };
// }