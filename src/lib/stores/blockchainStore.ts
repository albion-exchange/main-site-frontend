/**
 * Unified Blockchain Data Store
 * 
 * Single source of truth for all blockchain data in the application.
 * Handles fetching, transformation, caching, and reactive updates.
 */

import { writable, derived, get, type Writable, type Readable } from 'svelte/store';
import { readContract } from '@wagmi/core';
import { wagmiConfig } from 'svelte-wagmi';
import type { Hex } from 'viem';
import { formatEther } from 'viem';
import { formatSmartNumber, createUrlSlug } from '$lib/utils/formatters';

// Queries
import { getSfts } from '$lib/queries/getSfts';
import { getSftMetadata } from '$lib/queries/getSftMetadata';
import { getAllDeposits } from '$lib/queries/getAllDeposits';

// Types
import type { OffchainAssetReceiptVault } from '$lib/types/offchainAssetReceiptVaultTypes';
import type { MetaV1S } from '$lib/types/sftMetadataTypes';
import type { Asset, Token } from '$lib/types/uiTypes';
import type { TokenMetadata } from '$lib/types/MetaboardTypes';

// Helpers
import { decodeSftInformation } from '$lib/decodeMetadata/helpers';
import { 
  generateAssetInstanceFromSftMeta, 
  generateTokenInstanceFromSft,
  generateTokenMetadataInstanceFromSft 
} from '$lib/decodeMetadata/addSchemaToReceipts';
import { ENERGY_FIELDS, type EnergyField, type SftToken } from '$lib/network';
import authorizerAbi from '$lib/abi/authorizer.json';

// Types for our store structure
export interface AssetWithTokens {
  asset: Asset;
  tokens: TokenMetadata[];
  energyField: EnergyField;
}

export interface UserPortfolio {
  address: string;
  balances: Map<string, bigint>; // tokenAddress -> balance
  deposits: any[]; // User deposit history
  claimablePayouts: Map<string, bigint>; // tokenAddress -> claimable amount
}

export interface BlockchainState {
  // Raw data from blockchain/subgraphs
  rawSfts: OffchainAssetReceiptVault[];
  rawMetadata: MetaV1S[];
  
  // Processed data
  assets: Map<string, AssetWithTokens>; // assetId -> AssetWithTokens
  tokensByAddress: Map<string, TokenMetadata>; // tokenAddress -> TokenMetadata
  
  // User-specific data
  userPortfolio: UserPortfolio | null;
  
  // Loading states
  loading: boolean;
  initialized: boolean;
  error: string | null;
  lastSync: Date | null;
}

// Create the main store
const blockchainState: Writable<BlockchainState> = writable({
  rawSfts: [],
  rawMetadata: [],
  assets: new Map(),
  tokensByAddress: new Map(),
  userPortfolio: null,
  loading: false,
  initialized: false,
  error: null,
  lastSync: null
});

// Helper to get current wagmi config
async function getWagmiConfig() {
  const config = get(wagmiConfig);
  if (!config) throw new Error('Wagmi config not initialized');
  return config;
}

/**
 * Initialize and sync all blockchain data
 */
export async function syncBlockchainData(): Promise<void> {
  blockchainState.update(state => ({ ...state, loading: true, error: null }));

  try {
    // Fetch raw data from subgraphs in parallel
    const [sftsResult, metadataResult] = await Promise.all([
      getSfts(),
      getSftMetadata()
    ]);

    if (!sftsResult || !metadataResult) {
      throw new Error('Failed to fetch blockchain data');
    }

    // Decode metadata
    const decodedMetadata = metadataResult.map((meta: MetaV1S) => 
      decodeSftInformation(meta)
    );

    // Process and transform data
    const assets = new Map<string, AssetWithTokens>();
    const tokensByAddress = new Map<string, TokenMetadata>();
    const config = await getWagmiConfig();

    // Group SFTs by energy field
    for (const energyField of ENERGY_FIELDS) {
      const fieldId = createUrlSlug(energyField.name); // Slugified for clean URLs

      // Find all SFTs for this energy field
      const fieldSfts = sftsResult.filter((sft: OffchainAssetReceiptVault) =>
        energyField.sftTokens.some((token: SftToken) =>
          token.address.toLowerCase() === sft.id.toLowerCase()
        )
      );

      if (fieldSfts.length === 0) continue;

      // Process tokens for this energy field
      const tokens: TokenMetadata[] = [];
      let assetInstance: Asset | null = null;

      for (const sft of fieldSfts) {
        const pinnedMetadata = decodedMetadata.find((meta: any) =>
          meta?.contractAddress === `0x000000000000000000000000${sft.id.slice(2)}`
        );

        if (pinnedMetadata) {
          try {
            // Get max supply from blockchain
            const sftMaxSharesSupply = await readContract(config, {
              abi: authorizerAbi,
              address: sft.activeAuthorizer?.address as Hex,
              functionName: 'maxSharesSupply',
              args: []
            }) as bigint;

            // Create token instance
            const tokenInstance = generateTokenMetadataInstanceFromSft(
              sft,
              pinnedMetadata,
              sftMaxSharesSupply.toString()
            );
            
            tokens.push(tokenInstance);
            tokensByAddress.set(tokenInstance.contractAddress.toLowerCase(), tokenInstance);

            // Create asset instance (use first token's asset data)
            if (!assetInstance) {
              assetInstance = generateAssetInstanceFromSftMeta(sft, pinnedMetadata);
            }
          } catch (error) {
            console.error(`Failed to process SFT ${sft.id}:`, error);
          }
        }
      }

      // Store processed asset with tokens
      if (assetInstance && tokens.length > 0) {
        assets.set(fieldId, {
          asset: assetInstance,
          tokens,
          energyField
        });
      }
    }

    // Update store with processed data
    blockchainState.update(state => ({
      ...state,
      rawSfts: sftsResult,
      rawMetadata: metadataResult,
      assets,
      tokensByAddress,
      loading: false,
      initialized: true,
      lastSync: new Date(),
      error: null
    }));

  } catch (error) {
    console.error('Failed to sync blockchain data:', error);
    blockchainState.update(state => ({
      ...state,
      loading: false,
      error: error instanceof Error ? error.message : 'Failed to sync blockchain data'
    }));
  }
}

/**
 * Sync user-specific data (portfolio, balances, etc.)
 */
export async function syncUserData(userAddress: string): Promise<void> {
  if (!userAddress) {
    blockchainState.update(state => ({ ...state, userPortfolio: null }));
    return;
  }

  try {
    const config = await getWagmiConfig();
    const state = get(blockchainState);
    
    // Fetch user deposits
    const deposits = await getAllDeposits(userAddress);
    
    // Calculate balances and claimable payouts
    const balances = new Map<string, bigint>();
    const claimablePayouts = new Map<string, bigint>();
    
    // Process each token the user might have
    for (const [address, token] of state.tokensByAddress) {
      try {
        // Get user balance (would need actual contract calls here)
        // This is a placeholder - you'd need the actual balance checking logic
        const balance = BigInt(0); // Replace with actual balance check
        if (balance > 0n) {
          balances.set(address, balance);
        }
        
        // Check claimable payouts (placeholder)
        const claimable = BigInt(0); // Replace with actual claimable check
        if (claimable > 0n) {
          claimablePayouts.set(address, claimable);
        }
      } catch (error) {
        console.error(`Failed to fetch balance for token ${address}:`, error);
      }
    }
    
    // Update user portfolio
    blockchainState.update(state => ({
      ...state,
      userPortfolio: {
        address: userAddress,
        balances,
        deposits: deposits || [],
        claimablePayouts
      }
    }));
    
  } catch (error) {
    console.error('Failed to sync user data:', error);
  }
}

// Derived stores for easy component access

/**
 * All assets as an array (includes the map key as 'id' for convenience)
 */
export const allAssets = derived(
  blockchainState,
  $state => Array.from($state.assets.entries()).map(([id, data]) => ({
    id,
    ...data
  }))
);

/**
 * Get asset by ID
 */
export function getAssetById(assetId: string): Readable<AssetWithTokens | null> {
  return derived(blockchainState, $state => $state.assets.get(assetId) || null);
}

/**
 * Get token by address
 */
export function getTokenByAddress(address: string): Readable<TokenMetadata | null> {
  return derived(
    blockchainState, 
    $state => $state.tokensByAddress.get(address.toLowerCase()) || null
  );
}

/**
 * User's token balances
 */
export const userBalances: Readable<Map<string, bigint>> = derived(
  blockchainState,
  $state => $state.userPortfolio?.balances || new Map()
);

/**
 * User's claimable payouts
 */
export const userClaimablePayouts: Readable<Map<string, bigint>> = derived(
  blockchainState,
  $state => $state.userPortfolio?.claimablePayouts || new Map()
);

/**
 * Total platform statistics with active investors
 */
export const platformStats = derived(blockchainState, $state => {
  let totalInvested = 0;
  let totalAssets = $state.assets.size;
  let totalCountries = new Set<string>();
  let totalTokens = 0;
  let uniqueInvestors = new Set<string>();

  // Get list of valid token addresses from ENERGY_FIELDS
  const validTokenAddresses = new Set<string>();
  for (const field of ENERGY_FIELDS) {
    for (const tokenInfo of field.sftTokens) {
      validTokenAddresses.add(tokenInfo.address.toLowerCase());
    }
  }

  for (const assetData of $state.assets.values()) {
    totalTokens += assetData.tokens.length;
    
    // Add country if available
    const country = assetData.asset.location?.country;
    if (country) totalCountries.add(country);
    
    // Calculate total invested from token supplies
    for (const token of assetData.tokens) {
      const supply = Number(formatEther(BigInt(token.supply.mintedSupply || 0)));
      totalInvested += supply;
    }
  }

  // Count unique investors from raw SFT data (token holders)
  $state.rawSfts.forEach(sft => {
    // Only process SFTs that are in ENERGY_FIELDS
    if (!validTokenAddresses.has(sft.id.toLowerCase())) {
      return; // Skip this SFT
    }
    
    if (sft.tokenHolders && Array.isArray(sft.tokenHolders)) {
      sft.tokenHolders.forEach(holder => {
        if (holder.address && holder.balance && Number(holder.balance) > 0) {
          uniqueInvestors.add(holder.address.toLowerCase());
        }
      });
    }
  });

  return {
    totalInvested,
    totalInvestedMillions: totalInvested / 1_000_000,
    totalAssets,
    totalCountries: totalCountries.size,
    totalRegions: totalCountries.size, // Alias for compatibility
    totalTokens,
    activeInvestors: uniqueInvestors.size,
    monthlyGrowthRate: 2, // Placeholder - can be calculated from historical data later
    loading: $state.loading,
    initialized: $state.initialized
  };
});

/**
 * Formatted platform statistics for display
 */
export const formattedPlatformStats = derived(platformStats, $stats => ({
  totalInvested: formatSmartNumber($stats.totalInvested, {
    prefix: "$",
    threshold: 1000000,
    forceCompact: true,
  }),
  totalAssets: ($stats.totalAssets || 0).toString(),
  activeInvestors: formatSmartNumber($stats.activeInvestors || 0, {
    threshold: 1000,
  }),
  regionsText: `Across ${$stats.totalRegions} ${$stats.totalRegions === 1 ? 'country' : 'countries'}`,
  growthTrend: {
    value: $stats.monthlyGrowthRate,
    positive: $stats.monthlyGrowthRate >= 0,
  },
}));

/**
 * Check if an asset has future releases
 */
export function hasIncompleteReleases(assetId: string): Readable<boolean> {
  return derived(blockchainState, $state => {
    const assetData = $state.assets.get(assetId);
    if (!assetData) return false;
    
    // Calculate total share percentage
    const totalShares = assetData.tokens.reduce((sum, token) => 
      sum + (token.sharePercentage || 0), 0
    );
    
    return totalShares < 100;
  });
}

/**
 * User portfolio
 */
export const userPortfolio: Readable<UserPortfolio | null> = derived(
  blockchainState,
  $state => $state.userPortfolio
);

/**
 * Loading and error states
 */
export const isLoading: Readable<boolean> = derived(
  blockchainState, 
  $state => $state.loading
);

export const isInitialized: Readable<boolean> = derived(
  blockchainState,
  $state => $state.initialized
);

export const syncError: Readable<string | null> = derived(
  blockchainState,
  $state => $state.error
);

// Export the main store for debugging/direct access if needed (TokenPurchaseWidget needs it for raw SFT data)
export { blockchainState };