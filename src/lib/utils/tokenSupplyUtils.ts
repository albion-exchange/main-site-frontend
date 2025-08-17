/**
 * @fileoverview Token Supply Utilities
 * Centralized utilities for token supply calculations and BigInt conversions
 * to eliminate duplication across the codebase
 */

import type { TokenMetadata } from "$lib/types/MetaboardTypes";
import type { Token } from "$lib/types/uiTypes";

export interface FormattedTokenSupply {
  maxSupply: number;
  availableSupply: number;
  mintedSupply: number;
  availableSupplyBigInt: bigint;
  supplyUtilization: number;
}

/**
 * Calculate and format token supply information
 */
export function calculateTokenSupply(token: Token): FormattedTokenSupply {
  const maxSupplyBigInt = BigInt(token.supply.maxSupply);
  const mintedSupplyBigInt = BigInt(token.supply.mintedSupply);
  const availableSupplyBigInt = maxSupplyBigInt - mintedSupplyBigInt;

  const decimals = token.decimals;
  const divisor = Math.pow(10, decimals);

  const maxSupply = Number(maxSupplyBigInt) / divisor;
  const availableSupply = Number(availableSupplyBigInt) / divisor;
  const mintedSupply = Number(mintedSupplyBigInt) / divisor;
  const supplyUtilization = maxSupply > 0 ? (mintedSupply / maxSupply) * 100 : 0;

  return {
    maxSupply,
    availableSupply,
    mintedSupply,
    availableSupplyBigInt,
    supplyUtilization,
  };
}

/**
 * Check if token has available supply
 */
export function hasAvailableSupply(
  token: Token,
  minimumAmount: number = 0,
): boolean {
  const supply = calculateTokenSupply(token);
  return supply.availableSupply > minimumAmount;
}

/**
 * Format supply amount for display
 */
export function formatSupplyAmount(
  supplyString: string,
  decimals: number,
): number {
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
export function meetsSupplyThreshold(
  token: Token,
  thresholdAmount: number,
): boolean {
  const supply = calculateTokenSupply(token);
  return supply.availableSupply >= thresholdAmount;
}
