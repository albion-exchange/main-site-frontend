/**
 * @fileoverview Platform statistics composable
 * Manages platform-wide statistics and calculations
 */

import { writable, derived, type Readable, type Writable } from 'svelte/store';
import { useConfigService, useAssetService, useTokenService } from '$lib/services';
import { withSyncErrorHandling } from '$lib/utils/errorHandling';

interface PlatformStatsState {
  totalAssets: number;
  totalInvested: number;
  activeInvestors: number;
  totalRegions: number;
  monthlyGrowthRate: number;
  loading: boolean;
  error: string | null;
}

/**
 * Composable for platform statistics
 */
export function usePlatformStats() {
  const configService = useConfigService();
  const assetService = useAssetService();
  const tokenService = useTokenService();

  const state: Writable<PlatformStatsState> = writable({
    totalAssets: 0,
    totalInvested: 0,
    activeInvestors: 0,
    totalRegions: 0,
    monthlyGrowthRate: 0,
    loading: true,
    error: null
  });

  async function loadStats() {
    state.update(s => ({ ...s, loading: true, error: null }));
    
    try {
      // Get platform statistics from real data
      const stats = withSyncErrorHandling(
        () => configService.getPlatformStats(),
        { service: 'ConfigService', operation: 'getPlatformStats' }
      );
      const allAssets = withSyncErrorHandling(
        () => assetService.getAllAssets(),
        { service: 'AssetService', operation: 'getAllAssets' }
      ) || [];
      const allTokens = withSyncErrorHandling(
        () => tokenService.getAllTokens(),
        { service: 'TokenService', operation: 'getAllTokens' }
      ) || [];
      
      // Calculate total invested from all tokens' minted supply
      const totalInvested = allTokens.reduce((sum, token) => {
        const mintedTokens = parseFloat(token.supply.mintedSupply) / Math.pow(10, token.decimals);
        // Hardcoded token price as $1
        const estimatedTokenValue = 1;
        return sum + (mintedTokens * estimatedTokenValue);
      }, 0);
      
      // Get total holders from platform statistics
      const totalHolders = stats.totalHolders;
      
      // Count unique regions from asset locations
      const uniqueRegions = new Set(
        allAssets.map(asset => `${asset.location?.state || 'Unknown'}, ${asset.location?.country || 'Unknown'}`)
      );
      
      // Calculate monthly growth rate from recent asset reports
      const monthlyGrowthRate = calculateGrowthRate(allAssets);
      
      state.update(s => ({
        ...s,
        totalAssets: stats.totalAssets,
        totalInvested: totalInvested / 1000000, // Convert to millions
        activeInvestors: totalHolders,
        totalRegions: uniqueRegions.size,
        monthlyGrowthRate,
        loading: false
      }));
    } catch (error) {
      state.update(s => ({
        ...s,
        error: error instanceof Error ? error.message : 'Failed to load statistics',
        loading: false
      }));
    }
  }

  function calculateGrowthRate(assets: any[]): number {
    const assetsWithReports = assets.filter(asset => asset.monthlyReports.length >= 2);
    
    if (assetsWithReports.length === 0) {
      const marketConfig = withSyncErrorHandling(
        () => configService.getMarketConfig(),
        { service: 'ConfigService', operation: 'getMarketConfig' }
      );
      return marketConfig?.defaultGrowthRate || 0;
    }
    
    const growthRates = assetsWithReports.map(asset => {
      const reports = asset.monthlyReports;
      const latest = reports[reports.length - 1];
      const previous = reports[reports.length - 2];
      
      if ((previous.netIncome ?? 0) > 0) {
        return (((latest.netIncome ?? 0) - (previous.netIncome ?? 0)) / (previous.netIncome ?? 0)) * 100;
      }
      return 0;
    });
    
    const validGrowthRates = growthRates.filter(rate => !isNaN(rate) && isFinite(rate));
    
    if (validGrowthRates.length > 0) {
      const avgGrowth = validGrowthRates.reduce((sum, rate) => sum + rate, 0) / validGrowthRates.length;
      return Number(avgGrowth.toFixed(1));
    }
    
    const marketConfig = withSyncErrorHandling(
      () => configService.getMarketConfig(),
      { service: 'ConfigService', operation: 'getMarketConfig' }
    );
    return marketConfig?.defaultGrowthRate || 0;
  }

  // Formatted values for display
  const formattedStats = derived(state, $state => ({
    totalInvested: `$${$state.totalInvested.toFixed(1)}M`,
    totalAssets: ($state.totalAssets || 0).toString(),
    activeInvestors: ($state.activeInvestors || 0).toLocaleString(),
    regionsText: `Across ${$state.totalRegions} regions`,
    growthTrend: {
      value: $state.monthlyGrowthRate,
      positive: $state.monthlyGrowthRate >= 0
    }
  }));

  // Initialize
  loadStats();

  return {
    state: { subscribe: state.subscribe },
    formattedStats,
    loadStats
  };
}