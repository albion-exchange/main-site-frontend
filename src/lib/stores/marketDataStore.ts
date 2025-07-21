import { writable, derived } from 'svelte/store';
import { marketDataService, type MarketData } from '$lib/services/marketDataService';

interface MarketDataState {
  data: MarketData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const initialState: MarketDataState = {
  data: null,
  loading: false,
  error: null,
  lastUpdated: null
};

// Create the main store
function createMarketDataStore() {
  const { subscribe, set, update } = writable<MarketDataState>(initialState);

  let refreshInterval: NodeJS.Timeout | null = null;

  return {
    subscribe,
    
    // Fetch market data
    async fetch() {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const data = await marketDataService.fetchMarketData();
        update(state => ({
          ...state,
          data,
          loading: false,
          error: null,
          lastUpdated: new Date()
        }));
      } catch (error) {
        update(state => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch market data'
        }));
      }
    },

    // Start auto-refresh (every 5 minutes)
    startAutoRefresh() {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      
      // Fetch immediately
      this.fetch();
      
      // Then fetch every 5 minutes
      refreshInterval = setInterval(() => {
        this.fetch();
      }, 5 * 60 * 1000);
    },

    // Stop auto-refresh
    stopAutoRefresh() {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
      }
    },

    // Force refresh (invalidate cache)
    forceRefresh() {
      marketDataService.invalidateCache();
      this.fetch();
    },

    // Reset store
    reset() {
      set(initialState);
      this.stopAutoRefresh();
    }
  };
}

export const marketDataStore = createMarketDataStore();

// Derived store for formatted data
export const formattedMarketData = derived(marketDataStore, ($marketData) => {
  if (!$marketData.data) return null;

  const { data } = $marketData;
  
  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'EUR' ? '€' : '$';
    return `${symbol}${price}`;
  };
  
  return {
    wti: {
      name: 'WTI Crude Oil',
      price: formatPrice(data.wti.price, data.wti.currency),
      change: data.wti.change,
      changePercent: data.wti.changePercent,
      changeText: `${data.wti.change >= 0 ? '+' : ''}${data.wti.changePercent}%`,
      isPositive: data.wti.change >= 0,
      unit: data.wti.unit
    },
    brent: {
      name: 'Brent Crude',
      price: formatPrice(data.brent.price, data.brent.currency),
      change: data.brent.change,
      changePercent: data.brent.changePercent,
      changeText: `${data.brent.change >= 0 ? '+' : ''}${data.brent.changePercent}%`,
      isPositive: data.brent.change >= 0,
      unit: data.brent.unit
    },
    henryHub: {
      name: 'Henry Hub Natural Gas',
      price: formatPrice(data.henryHub.price, data.henryHub.currency),
      change: data.henryHub.change,
      changePercent: data.henryHub.changePercent,
      changeText: `${data.henryHub.change >= 0 ? '+' : ''}${data.henryHub.changePercent}%`,
      isPositive: data.henryHub.change >= 0,
      unit: data.henryHub.unit
    },
    ttf: {
      name: 'TTF Natural Gas',
      price: formatPrice(data.ttf.price, data.ttf.currency),
      change: data.ttf.change,
      changePercent: data.ttf.changePercent,
      changeText: `${data.ttf.change >= 0 ? '+' : ''}${data.ttf.changePercent}%`,
      isPositive: data.ttf.change >= 0,
      unit: data.ttf.unit
    }
  };
});