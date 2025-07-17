/**
 * @fileoverview Asset data composable
 * Extracts asset-related business logic from components
 */

import { derived, writable, type Readable, type Writable } from 'svelte/store';
import dataStoreService from '$lib/services/DataStoreService';
import type { Asset, Token } from '$lib/types/uiTypes';

interface AssetDataState {
  asset: Asset | null;
  tokens: Token[];
  loading: boolean;
  error: string | null;
}

/**
 * Composable for managing asset data and related operations
 */
export function useAssetData(assetId: string) {
  // State management
  const state: Writable<AssetDataState> = writable({
    asset: null,
    tokens: [],
    loading: true,
    error: null
  });

  // Load asset data
  async function loadAsset() {
    state.update(s => ({ ...s, loading: true, error: null }));
    
    try {
      const asset = dataStoreService.getAssetById(assetId);
      if (!asset) {
        throw new Error('Asset not found');
      }
      
      const tokens = dataStoreService.getTokensByAssetId(assetId);
      
      state.update(s => ({
        ...s,
        asset,
        tokens,
        loading: false
      }));
    } catch (err) {
      state.update(s => ({
        ...s,
        error: err instanceof Error ? err.message : 'Failed to load asset',
        loading: false
      }));
    }
  }

  // Derived values
  const hasAvailableTokens: Readable<boolean> = derived(state, $state => {
    if (!$state.tokens.length) return false;
    
    return $state.tokens.some(token => {
      const supply = dataStoreService.getTokenSupply(token.contractAddress);
      return supply && supply.availableSupply > 0;
    });
  });

  const primaryToken: Readable<Token | null> = derived(state, $state => {
    return $state.tokens.length > 0 ? $state.tokens[0] : null;
  });

  const latestReport = derived(state, $state => {
    if (!$state.asset?.monthlyReports?.length) return null;
    return $state.asset.monthlyReports[$state.asset.monthlyReports.length - 1];
  });

  // Production metrics calculations
  const productionMetrics = derived(state, $state => {
    if (!$state.asset) return null;
    
    const reports = $state.asset.monthlyReports || [];
    if (reports.length === 0) return null;
    
    // Calculate total and average production
    const totalProduction = reports.reduce((sum, r) => sum + r.production, 0);
    const avgProduction = totalProduction / reports.length;
    
    // Calculate growth rate
    let growthRate = 0;
    if (reports.length >= 2) {
      const recent = reports.slice(-3); // Last 3 months
      const older = reports.slice(-6, -3); // Previous 3 months
      
      if (older.length > 0) {
        const recentAvg = recent.reduce((sum, r) => sum + r.production, 0) / recent.length;
        const olderAvg = older.reduce((sum, r) => sum + r.production, 0) / older.length;
        growthRate = ((recentAvg - olderAvg) / olderAvg) * 100;
      }
    }
    
    return {
      totalProduction,
      avgProduction,
      growthRate,
      reportCount: reports.length
    };
  });

  // Revenue metrics
  const revenueMetrics = derived(state, $state => {
    if (!$state.asset?.monthlyReports?.length) return null;
    
    const reports = $state.asset.monthlyReports;
    const totalRevenue = reports.reduce((sum, r) => sum + (r.revenue || 0), 0);
    const totalNetIncome = reports.reduce((sum, r) => sum + (r.netIncome || 0), 0);
    const avgMonthlyRevenue = totalRevenue / reports.length;
    
    // Calculate profit margin
    const profitMargin = totalRevenue > 0 ? (totalNetIncome / totalRevenue) * 100 : 0;
    
    return {
      totalRevenue,
      totalNetIncome,
      avgMonthlyRevenue,
      profitMargin
    };
  });

  // Chart data generation
  function getProductionChartData() {
    let asset: Asset | null = null;
    const unsubscribe = state.subscribe(s => { asset = s.asset; });
    unsubscribe();
    if (!asset?.monthlyReports?.length) return [];
    
    return asset.monthlyReports.map(report => ({
      date: report.month,
      value: report.production
    }));
  }

  function getRevenueChartData() {
    let asset: Asset | null = null;
    const unsubscribe = state.subscribe(s => { asset = s.asset; });
    unsubscribe();
    if (!asset?.monthlyReports?.length) return [];
    
    return asset.monthlyReports.map(report => ({
      date: report.month,
      revenue: report.revenue || 0,
      netIncome: report.netIncome || 0
    }));
  }

  // Initialize
  loadAsset();

  return {
    // State
    state: { subscribe: state.subscribe },
    
    // Derived values
    hasAvailableTokens,
    primaryToken,
    latestReport,
    productionMetrics,
    revenueMetrics,
    
    // Methods
    loadAsset,
    getProductionChartData,
    getRevenueChartData
  };
}