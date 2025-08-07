/**
 * Token Store
 * 
 * Unified store for all token and asset data.
 * Combines data from IPFS (metadata) and blockchain (supply, holders, etc.)
 */

import { writable, derived, get, type Readable } from 'svelte/store';
import { readContract } from '@wagmi/core';
import { wagmiConfig } from 'svelte-wagmi';
import type { Hex } from 'viem';
import { formatEther } from 'viem';

// Queries
import { getSfts } from '$lib/queries/getSfts';
import { getSftMetadata } from '$lib/queries/getSftMetadata';

// Types
import type { OffchainAssetReceiptVault } from '$lib/types/offchainAssetReceiptVaultTypes';
import type { MetaV1S } from '$lib/types/sftMetadataTypes';
import type { Asset } from '$lib/types/uiTypes';
import type { TokenMetadata } from '$lib/types/MetaboardTypes';

// Utilities
import { decodeSftInformation } from '$lib/decodeMetadata/helpers';
import { 
  generateAssetInstanceFromSftMeta, 
  generateTokenMetadataInstanceFromSft 
} from '$lib/decodeMetadata/addSchemaToReceipts';
import { ENERGY_FIELDS, type EnergyField, type SftToken } from '$lib/network';
import { createUrlSlug, formatSmartNumber } from '$lib/utils/formatters';
import authorizerAbi from '$lib/abi/authorizer.json';

// Store Types
export interface AssetWithTokens {
  asset: Asset;
  tokens: TokenMetadata[];
}

export interface TokenStoreState {
  // Raw data from sources
  rawSfts: OffchainAssetReceiptVault[];
  rawMetadata: MetaV1S[];
  
  // Processed and unified data
  assets: Map<string, AssetWithTokens>; // assetId -> AssetWithTokens
  tokensByAddress: Map<string, TokenMetadata>; // tokenAddress -> TokenMetadata
  
  // State management
  loading: boolean;
  initialized: boolean;
  error: string | null;
  lastSync: Date | null;
}

// Initialize store
const initialState: TokenStoreState = {
  rawSfts: [],
  rawMetadata: [],
  assets: new Map(),
  tokensByAddress: new Map(),
  loading: false,
  initialized: false,
  error: null,
  lastSync: null
};

// Main store
export const tokenStore = writable<TokenStoreState>(initialState);

/**
 * Sync token data from all sources
 */
export async function syncTokenData(): Promise<void> {
  tokenStore.update(state => ({ ...state, loading: true, error: null }));

  try {
    // Fetch raw data from subgraphs in parallel
    const [sftsResult, metadataResult] = await Promise.all([
      getSfts(),
      getSftMetadata()
    ]);

    if (!sftsResult || !metadataResult) {
      throw new Error('Failed to fetch token data');
    }

    // Decode metadata
    const decodedMetadata = metadataResult.map((meta: MetaV1S) => 
      decodeSftInformation(meta)
    );

    // Process and transform data
    const assets = new Map<string, AssetWithTokens>();
    const tokensByAddress = new Map<string, TokenMetadata>();
    const config = await get(wagmiConfig);

    // Group tokens by energy field
    for (const energyField of ENERGY_FIELDS) {
      const fieldId = createUrlSlug(energyField.name);

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
              functionName: 'maxShares',
              args: []
            });

            // Generate asset instance (only once per field)
            if (!assetInstance) {
              assetInstance = generateAssetInstanceFromSftMeta(pinnedMetadata);
            }

            // Generate token metadata with enriched data
            const tokenMetadata = generateTokenMetadataInstanceFromSft(
              sft,
              pinnedMetadata,
              BigInt(sftMaxSharesSupply as string)
            );

            tokens.push(tokenMetadata);
            tokensByAddress.set(sft.id.toLowerCase(), tokenMetadata);
          } catch (error) {
            console.error(`Failed to process token ${sft.id}:`, error);
          }
        }
      }

      // Store the processed asset with its tokens
      if (assetInstance && tokens.length > 0) {
        assets.set(fieldId, {
          asset: assetInstance,
          tokens: tokens.sort((a, b) => {
            const dateA = new Date(a.updatedAt || 0).getTime();
            const dateB = new Date(b.updatedAt || 0).getTime();
            return dateB - dateA;
          })
        });
      }
    }

    // Update store with processed data
    tokenStore.update(state => ({
      ...state,
      rawSfts: sftsResult,
      rawMetadata: metadataResult,
      assets,
      tokensByAddress,
      loading: false,
      initialized: true,
      error: null,
      lastSync: new Date()
    }));

  } catch (error) {
    console.error('Failed to sync token data:', error);
    tokenStore.update(state => ({
      ...state,
      loading: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }));
  }
}

/**
 * Get a specific asset by ID
 */
export function getAssetById(assetId: string): Readable<AssetWithTokens | null> {
  return derived(tokenStore, $store => 
    $store.assets.get(assetId) || null
  );
}

/**
 * Get a specific token by address
 */
export function getTokenByAddress(address: string): Readable<TokenMetadata | null> {
  return derived(tokenStore, $store => 
    $store.tokensByAddress.get(address.toLowerCase()) || null
  );
}

/**
 * All assets as an array
 */
export const allAssets = derived(
  tokenStore,
  $store => Array.from($store.assets.entries()).map(([id, data]) => ({
    id,
    ...data
  }))
);

/**
 * Platform statistics derived from token data
 */
export const platformStats = derived(tokenStore, $store => {
  let totalValueLocked = 0;
  let totalShares = 0;
  let activeInvestors = new Set<string>();
  let totalTokens = 0;

  // Calculate stats from raw SFT data
  $store.rawSfts.forEach(sft => {
    totalValueLocked += Number(sft.totalShares || 0);
    totalShares += Number(sft.totalShares || 0);
    totalTokens++;
    
    // Count unique holders
    sft.tokenHolders?.forEach(holder => {
      if (holder.address && holder.balance && Number(holder.balance) > 0) {
        activeInvestors.add(holder.address.toLowerCase());
      }
    });
  });

  return {
    totalValueLocked,
    totalShares,
    activeInvestors: activeInvestors.size,
    totalTokens,
    monthlyGrowthRate: 2 // TODO: Calculate from historical data
  };
});

/**
 * Formatted platform statistics for display
 */
export const formattedPlatformStats = derived(platformStats, $stats => ({
  totalValueLocked: formatSmartNumber($stats.totalValueLocked),
  totalShares: formatSmartNumber($stats.totalShares),
  activeInvestors: $stats.activeInvestors.toLocaleString(),
  totalTokens: $stats.totalTokens.toString(),
  monthlyGrowthRate: `${$stats.monthlyGrowthRate}%`
}));

/**
 * Check if an asset has incomplete releases (< 100% shares allocated)
 */
export function hasIncompleteReleases(assetId: string): Readable<boolean> {
  return derived(tokenStore, $store => {
    const assetData = $store.assets.get(assetId);
    if (!assetData) return false;
    
    // Calculate total share percentage
    const totalShares = assetData.tokens.reduce((sum, token) => 
      sum + (token.sharePercentage || 0), 0
    );
    
    return totalShares < 100;
  });
}

/**
 * Get the raw blockchain state (for components that need direct access)
 */
export const blockchainState = derived(tokenStore, $store => $store);

// Auto-sync on initialization
if (typeof window !== 'undefined') {
  syncTokenData();
}

// Loading state
export const isLoading = derived(tokenStore, $store => $store.loading);

// Initialized state
export const isInitialized = derived(tokenStore, $store => $store.initialized);

// Error state
export const syncError = derived(tokenStore, $store => $store.error);