/**
 * Central export for all stores
 */

import { derived, writable } from "svelte/store";
import { chainId, signerAddress } from "svelte-wagmi";
import { type Chain } from "@wagmi/core/chains";
import { base } from "@wagmi/core/chains";

// Network state stores
export const targetNetwork = writable<Chain>(base);
export const wrongNetwork = derived(
  [chainId, signerAddress, targetNetwork],
  ([$chainId, $signerAddress, $targetNetwork]) =>
    $signerAddress && $chainId !== $targetNetwork.id,
);

// Token Store - Token and asset data from IPFS and blockchain
export {
  tokenStore,
  syncTokenData,
  getAssetById,
  getTokenByAddress,
  allAssets,
  platformStats,
  formattedPlatformStats,
  hasIncompleteReleases,
  blockchainState,
  isLoading,
  isInitialized,
  syncError
} from './tokenStore';

// Portfolio Store - Wallet holdings and transactions
export {
  portfolioStore,
  syncPortfolioData,
  holdingsByAsset,
  portfolioChartData,
  recentTransactions,
  isLoadingPortfolio,
  portfolioError
} from './portfolioStore';

// Claims Store - Payout claims from CSV
export {
  claimsStore,
  syncClaimsData,
  getClaimsByField,
  unclaimedClaims,
  recentClaims,
  hasUnclaimedPayouts,
  isLoadingClaims,
  claimsError
} from './claimsStore';

// Legacy exports for backward compatibility during migration
export { syncTokenData as syncBlockchainData } from './tokenStore';
export { syncPortfolioData as syncUserData, portfolioStore as userPortfolio } from './portfolioStore';
export { hasUnclaimedPayouts as userClaimablePayouts } from './claimsStore';

/**
 * Sync all stores at once
 */
export async function syncAllStores(walletAddress?: string): Promise<void> {
  const { syncTokenData } = await import('./tokenStore');
  const { syncPortfolioData } = await import('./portfolioStore');
  const { syncClaimsData } = await import('./claimsStore');
  
  await Promise.all([
    syncTokenData(),
    walletAddress ? syncPortfolioData(walletAddress) : Promise.resolve(),
    walletAddress ? syncClaimsData(walletAddress) : Promise.resolve()
  ]);
}