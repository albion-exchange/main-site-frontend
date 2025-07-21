import { writable, derived, get } from 'svelte/store';
import { marketDataService, type MarketData, type MarketDataPoint } from '$lib/services';

interface MarketDataState {
  data: MarketData | null;
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;
}

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export function useMarketData() {
  // Core state
  const state = writable<MarketDataState>({
    data: null,
    loading: false,
    error: null,
    lastFetch: null
  });

  // Derived reactive values
  const marketData = derived(state, ($state) => $state.data);
  const isLoading = derived(state, ($state) => $state.loading);
  const error = derived(state, ($state) => $state.error);
  const lastUpdated = derived(state, ($state) => $state.lastFetch);

  // Check if data needs refresh
  const needsRefresh = derived(state, ($state) => {
    if (!$state.data || !$state.lastFetch) return true;
    const timeSinceLastFetch = Date.now() - $state.lastFetch.getTime();
    return timeSinceLastFetch > CACHE_DURATION;
  });

  // Formatted data for display
  const formattedData = derived(marketData, ($marketData) => {
    if (!$marketData || !$marketData.brent || !$marketData.wti || !$marketData.henryHub || !$marketData.ttf) return null;

    try {
      return {
        brent: formatMarketDataPoint($marketData.brent),
        wti: formatMarketDataPoint($marketData.wti),
        henryHub: formatMarketDataPoint($marketData.henryHub),
        ttf: formatMarketDataPoint($marketData.ttf)
      };
    } catch (error) {
      console.error('Error formatting market data:', error);
      return null;
    }
  });

  // Format individual market data point for display
  function formatMarketDataPoint(dataPoint: MarketDataPoint) {
    const formatPrice = (price: number, unit: string) => {
      if (unit === 'barrel') {
        return `$${price.toFixed(2)}`;
      } else if (unit === 'MMBtu') {
        return `$${price.toFixed(2)}`;
      } else if (unit === 'MWh') {
        return `$${price.toFixed(2)}`;
      }
      return `$${price.toFixed(2)}`;
    };

    const formatChange = (change: number, changePercent: number) => {
      const sign = change >= 0 ? '+' : '';
      return {
        absolute: `${sign}${change.toFixed(2)}`,
        percent: `${sign}${changePercent.toFixed(2)}%`,
        isPositive: change >= 0,
        isNegative: change < 0
      };
    };

    return {
      ...dataPoint,
      formattedPrice: formatPrice(dataPoint.price, dataPoint.unit),
      formattedChange: formatChange(dataPoint.change, dataPoint.changePercent),
      displayName: dataPoint.name.replace(' Natural Gas', '').replace(' Crude', '')
    };
  }

  // Fetch market data
  async function fetchData(force = false) {
    // Get current state synchronously using get() function
    const currentState = get(state);

    // Check if we need to fetch or if we have recent data
    if (!force && currentState.data && currentState.lastFetch) {
      const timeSinceLastFetch = Date.now() - currentState.lastFetch.getTime();
      if (timeSinceLastFetch < CACHE_DURATION) {
        return;
      }
    }

    state.update(s => ({ ...s, loading: true, error: null }));

    try {
      const data = await marketDataService.fetchCurrentData();
      
      state.update(s => ({
        ...s,
        data,
        loading: false,
        error: null,
        lastFetch: new Date()
      }));

    } catch (error) {
      console.error('Failed to fetch market data:', error);
      
      // Use fallback data on error
      const fallbackData = marketDataService.getFallbackData();
      
      state.update(s => ({
        ...s,
        data: fallbackData,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch market data',
        lastFetch: new Date()
      }));
    }
  }

  // Auto-refresh mechanism
  let refreshInterval: ReturnType<typeof setInterval> | null = null;

  function startAutoRefresh() {
    if (refreshInterval) return;
    
    refreshInterval = setInterval(() => {
      fetchData(false);
    }, REFRESH_INTERVAL);
  }

  function stopAutoRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  }

  // Initialize data loading
  function initialize() {
    // Use setTimeout to ensure the component is fully mounted
    setTimeout(() => {
      fetchData(false);
      startAutoRefresh();
    }, 0);
  }

  // Cleanup
  function cleanup() {
    stopAutoRefresh();
  }

  // Refresh data manually
  function refresh() {
    return fetchData(true);
  }

  return {
    // State
    state,
    marketData,
    formattedData,
    isLoading,
    error,
    lastUpdated,
    needsRefresh,

    // Actions
    initialize,
    cleanup,
    refresh,
    fetchData,
    startAutoRefresh,
    stopAutoRefresh
  };
}