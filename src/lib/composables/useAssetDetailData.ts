/**
 * @fileoverview Asset detail data composable
 * Manages data loading for asset detail pages using focused services
 */

import { writable, type Writable, get } from 'svelte/store';
import { readContract } from '@wagmi/core';
import { wagmiConfig } from 'svelte-wagmi';
import { sftMetadata, sfts } from '$lib/stores';
import { decodeSftInformation } from '$lib/decodeMetadata/helpers';
import { generateAssetInstanceFromSftMeta, generateTokenInstanceFromSft, generateTokenMetadataInstanceFromSft } from '$lib/decodeMetadata/addSchemaToReceipts';
import authorizerAbi from '$lib/abi/authorizer.json';
import type { Hex } from 'viem';
import type { MetaV1S } from '$lib/types/sftMetadataTypes';
import type { OffchainAssetReceiptVault } from '$lib/types/offchainAssetReceiptVaultTypes';
import configService from '$lib/services/ConfigService';
import type { Asset, Token } from '$lib/types/uiTypes';
import type { TokenMetadata } from '$lib/types/MetaboardTypes';

interface AssetDetailState {
  asset: Asset | null;
  tokens: TokenMetadata[];
  futureReleases: any[];
  loading: boolean;
  error: string | null;
}

/**
 * Composable for managing asset detail data
 */
export function useAssetDetailData(initialAssetId: string) {
  // State management
  const state: Writable<AssetDetailState> = writable({
    asset: null,
    tokens: [],
    futureReleases: [],
    loading: true,
    error: null
  });

  // Load asset and related data
  async function loadAssetData(assetId?: string) {
    const id = assetId || initialAssetId;

    state.update(s => ({ ...s, loading: true, error: null }));
    
    try {
      const currentSftMetadata = get(sftMetadata);
      const currentSfts = get(sfts);
      const currentWagmiConfig = get(wagmiConfig);

      
      if(!currentSftMetadata || !currentSfts) {
        throw new Error('SFT data not available');
      }
      
      const decodedMeta = currentSftMetadata.map((metaV1: MetaV1S) => decodeSftInformation(metaV1));
      const sft = currentSfts.find((sft: OffchainAssetReceiptVault) => sft.id.toLowerCase() === id.toLowerCase());
      
      if(!sft) {
        throw new Error('Asset not found in SFT data');
      }
      
      const pinnedMetadata: any = decodedMeta.find(
        (meta: any) => meta?.contractAddress === `0x000000000000000000000000${sft.id.slice(2)}`
      );
      
      if(!pinnedMetadata) {
        throw new Error('Asset metadata not found');
      }
      
      const sftMaxSharesSupply = await readContract(currentWagmiConfig, {
        abi: authorizerAbi,
        address: sft.activeAuthorizer?.address as Hex,
        functionName: 'maxSharesSupply',
        args: []
      }) as bigint;
      
      // const tokenInstance = generateTokenInstanceFromSft(sft, pinnedMetadata, sftMaxSharesSupply.toString());
      const tokenInstance = generateTokenMetadataInstanceFromSft(sft, pinnedMetadata, sftMaxSharesSupply.toString());
      const assetInstance = generateAssetInstanceFromSftMeta(sft, pinnedMetadata);
    
      console.log('assetInstance : ', JSON.stringify(assetInstance));

      // Load future releases for this asset
      const futureReleases = configService.getFutureReleasesByAsset(id);
      
      state.update(s => ({
        ...s,
        asset: assetInstance,
        tokens: [tokenInstance],
        futureReleases,
        loading: false
      }));
    } catch (err) {
      console.error(err);
      state.update(s => ({
        ...s,
        error: err instanceof Error ? err.message : 'Failed to load asset data',
        loading: false
      }));
    }
  }

  // Get latest monthly report
  function getLatestReport(assetId?: string) {
    const id = assetId || initialAssetId;
    // This should now return data from the SFT asset instance
    const currentState = get(state);
    if (currentState.asset?.monthlyReports && currentState.asset.monthlyReports.length > 0) {
      return currentState.asset.monthlyReports[currentState.asset.monthlyReports.length - 1];
    }
    return null;
  }

  // Get average monthly revenue
  function getAverageRevenue(assetId?: string) {
    const id = assetId || initialAssetId;
    // This should now calculate from SFT asset data
    const currentState = get(state);
    if (currentState.asset?.monthlyReports && currentState.asset.monthlyReports.length > 0) {
      const totalRevenue = currentState.asset.monthlyReports.reduce((sum, report) => sum + (report.revenue || 0), 0);
      return totalRevenue / currentState.asset.monthlyReports.length;
    }
    return 0;
  }

  // Get production timeline
  function getProductionTimeline(assetId?: string) {
    const id = assetId || initialAssetId;
    // This should now return data from the SFT asset instance
    const currentState = get(state);
    return currentState.asset?.monthlyReports || [];
  }

  // Check if token is available
  function isTokenAvailable(tokenAddress: string) {
    const currentState = get(state);
    const token = currentState.tokens.find(t => t.contractAddress.toLowerCase() === tokenAddress.toLowerCase());
    if (token) {
      return BigInt(token.supply.maxSupply) > BigInt(token.supply.mintedSupply);
    }
    return false;
  }

  // Get token payout history
  function getTokenPayoutHistory(tokenAddress: string) {
    const currentState = get(state);
    const token = currentState.tokens.find(t => t.contractAddress.toLowerCase() === tokenAddress.toLowerCase());
    return token?.payoutHistory || [];
  }

  // Refresh data
  async function refresh(assetId?: string) {
    await loadAssetData(assetId);
  }

  return {
    state,
    loadAssetData,
    getLatestReport,
    getAverageRevenue,
    getProductionTimeline,
    isTokenAvailable,
    getTokenPayoutHistory,
    refresh
  };
}