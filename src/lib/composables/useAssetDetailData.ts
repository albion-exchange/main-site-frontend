/**
 * @fileoverview Asset detail data composable
 * Manages data loading for asset detail pages using focused services
 */

import { writable, type Writable } from 'svelte/store';
import assetService from '$lib/services/AssetService';
import tokenService from '$lib/services/TokenService';
import configService from '$lib/services/ConfigService';
import type { Asset, Token } from '$lib/types/uiTypes';

interface AssetDetailState {
  asset: Asset | null;
  tokens: Token[];
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
    console.log(`useAssetDetailData: Loading data for asset ID: ${id}`);
    state.update(s => ({ ...s, loading: true, error: null }));
    
    try {
      // Load asset data
      const asset = assetService.getAssetById(id);
      console.log(`useAssetDetailData: Asset found:`, asset);
      if (!asset) {
        throw new Error('Asset not found');
      }
      
      // Load related tokens
      const tokens = tokenService.getTokensByAssetId(id);
      
      // Load future releases for this asset
      const futureReleases = configService.getFutureReleasesByAsset(id);
      
      state.update(s => ({
        ...s,
        asset,
        tokens,
        futureReleases,
        loading: false
      }));
    } catch (err) {
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
    return assetService.getLatestMonthlyReport(id);
  }

  // Get average monthly revenue
  function getAverageRevenue(assetId?: string) {
    const id = assetId || initialAssetId;
    return assetService.getAverageMonthlyRevenue(id);
  }

  // Get production timeline
  function getProductionTimeline(assetId?: string) {
    const id = assetId || initialAssetId;
    return assetService.getProductionTimeline(id);
  }

  // Check if token is available
  function isTokenAvailable(tokenAddress: string) {
    return tokenService.isTokenAvailable(tokenAddress);
  }

  // Get token payout history
  function getTokenPayoutHistory(tokenAddress: string) {
    return tokenService.getTokenPayoutHistory(tokenAddress);
  }

  // Refresh data
  async function refresh(assetId?: string) {
    await loadAssetData(assetId);
  }

  // Load initial data
  loadAssetData(initialAssetId);

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