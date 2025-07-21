import { writable, derived } from 'svelte/store';
import { marketDataService, type MarketData } from '$lib/services';

interface MarketDataState {
  data: MarketData | null;
  loading: boolean;
  error: string | null;
}

export function useMarketData() {
  // Simple state - no complex management needed
  const state = writable<MarketDataState>({
    data: null,
    loading: false,
    error: null
  });

  // Simple fetch function - no caching or retries needed
  async function fetchData() {
    state.update(s => ({ ...s, loading: true, error: null }));
    
    try {
      const data = await marketDataService.fetchCurrentData();
      state.update(s => ({ ...s, data, loading: false }));
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      state.update(s => ({ 
        ...s, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to load market data'
      }));
    }
  }

  // Format data for display - simplified without defensive checks since we control the server
  const formattedData = derived(state, ($state) => {
    if (!$state.data) return null;

    const formatPrice = (price: number, currency: string = 'USD') => 
      new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency, 
        minimumFractionDigits: 2 
      }).format(price);

    const formatChange = (change: number, changePercent: number) => {
      const isPositive = change >= 0;
      const sign = isPositive ? '+' : '';
      return {
        value: `${sign}${change.toFixed(2)}`,
        percent: `${sign}${changePercent.toFixed(2)}%`,
        isPositive
      };
    };

    return {
      wti: {
        formattedPrice: formatPrice($state.data.wti.price),
        formattedChange: formatChange($state.data.wti.change, $state.data.wti.changePercent),
        lastUpdated: $state.data.wti.lastUpdated
      },
      brent: {
        formattedPrice: formatPrice($state.data.brent.price),
        formattedChange: formatChange($state.data.brent.change, $state.data.brent.changePercent),
        lastUpdated: $state.data.brent.lastUpdated
      },
      henryHub: {
        formattedPrice: formatPrice($state.data.henryHub.price),
        formattedChange: formatChange($state.data.henryHub.change, $state.data.henryHub.changePercent),
        lastUpdated: $state.data.henryHub.lastUpdated
      },
      ttf: {
        formattedPrice: formatPrice($state.data.ttf.price),
        formattedChange: formatChange($state.data.ttf.change, $state.data.ttf.changePercent),
        lastUpdated: $state.data.ttf.lastUpdated
      }
    };
  });

  return {
    // Reactive stores
    formattedData,
    isLoading: derived(state, $state => $state.loading),
    error: derived(state, $state => $state.error),
    
    // Simple actions
    initialize: fetchData,
    refresh: fetchData
  };
}