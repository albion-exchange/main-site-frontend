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
export function useAssetDetailData(assetId: string) {
  // State management
  const state: Writable<AssetDetailState> = writable({
    asset: null,
    tokens: [],
    futureReleases: [],
    loading: true,
    error: null
  });

  // Load asset and related data
  async function loadAssetData() {
    state.update(s => ({ ...s, loading: true, error: null }));
    
    try {
      // Load asset data
      const asset = assetService.getAssetById(assetId);
      if (!asset) {
        throw new Error('Asset not found');
      }
      
      // Load related tokens
      const tokens = tokenService.getTokensByAssetId(assetId);
      
      // Load future releases for this asset
      const futureReleases = configService.getFutureReleasesByAsset(assetId);
      
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
  function getLatestReport() {
    return assetService.getLatestMonthlyReport(assetId);
  }

  // Get average monthly revenue
  function getAverageRevenue() {
    return assetService.getAverageMonthlyRevenue(assetId);
  }

  // Get production timeline
  function getProductionTimeline() {
    return assetService.getProductionTimeline(assetId);
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
  async function refresh() {
    await loadAssetData();
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