/**
 * @fileoverview Token Supply Utilities
 * Centralized utilities for token supply calculations and BigInt conversions
 * to eliminate duplication across the codebase
 */

import type { TokenMetadata } from '$lib/types/MetaboardTypes';
import type { Token } from '$lib/types/uiTypes';

export interface FormattedTokenSupply {
  total: number;
  available: number;
  sold: number;
  availableSupply: bigint;
  totalPercentageAvailable: number;
}

/**
 * Calculate and format token supply information
 */
export function calculateTokenSupply(token: Token): FormattedTokenSupply {
  const maxSupply = BigInt(token.supply.maxSupply);
  const mintedSupply = BigInt(token.supply.mintedSupply);
  const availableSupply = maxSupply - mintedSupply;
  
  const decimals = token.decimals;
  const divisor = Math.pow(10, decimals);
  
  const total = Number(maxSupply) / divisor;
  const available = Number(availableSupply) / divisor;
  const sold = Number(mintedSupply) / divisor;
  const totalPercentageAvailable = total > 0 ? (available / total) * 100 : 0;
  
  return {
    total,
    available,
    sold,
    availableSupply,
    totalPercentageAvailable
  };
}

/**
 * Check if token has available supply
 */
export function hasAvailableSupply(token: Token, minimumAmount: number = 0): boolean {
  const supply = calculateTokenSupply(token);
  return supply.available > minimumAmount;
}

/**
 * Format supply amount for display
 */
export function formatSupplyAmount(supplyString: string, decimals: number): number {
  return parseInt(supplyString) / Math.pow(10, decimals);
}

/**
 * Convert token balance to display format
 */
export function formatTokenBalance(balance: number, decimals: number): string {
  return (balance * Math.pow(10, decimals)).toString();
}

/**
 * Get available supply as BigInt
 */
export function getAvailableSupplyBigInt(token: TokenMetadata): bigint {
  return BigInt(token.supply.maxSupply) - BigInt(token.supply.mintedSupply);
}

/**
 * Check if token supply meets minimum threshold
 */
export function meetsSupplyThreshold(token: Token, thresholdAmount: number): boolean {
  const supply = calculateTokenSupply(token);
  return supply.available >= thresholdAmount;
}