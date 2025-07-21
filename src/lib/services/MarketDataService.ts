export interface MarketDataPoint {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  unit: string;
  lastUpdated: string;
}

export interface MarketData {
  brent: MarketDataPoint;
  wti: MarketDataPoint;
  henryHub: MarketDataPoint;
  ttf: MarketDataPoint;
}

export class MarketDataService {
  private readonly symbols = {
    brent: 'BZ=F',
    wti: 'CL=F', 
    henryHub: 'NG=F',
    ttf: 'TTF=F'
  };

  private readonly symbolNames = {
    'BZ=F': 'Brent Crude',
    'CL=F': 'WTI Crude',
    'NG=F': 'Henry Hub Natural Gas',
    'TTF=F': 'TTF Natural Gas'
  };

  private readonly units = {
    'BZ=F': 'barrel',
    'CL=F': 'barrel',
    'NG=F': 'MMBtu',
    'TTF=F': 'MWh'
  };

  /**
   * Fetch current market data for all benchmarks
   */
  async fetchCurrentData(): Promise<MarketData> {
    try {
      // Use our local API proxy to avoid CORS issues
      const response = await fetch('/api/market-data');

      if (!response.ok) {
        throw new Error(`Failed to fetch market data: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if this is fallback data
      if (data._fallback) {
        console.warn('Using fallback market data:', data._error);
        // Remove the metadata fields before returning
        const { _fallback, _error, ...cleanData } = data;
        return cleanData as MarketData;
      }

      // Ensure all required data points are present
      if (!data.brent || !data.wti || !data.henryHub || !data.ttf) {
        throw new Error('Missing required market data points');
      }

      return data as MarketData;
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw error;
    }
  }

  /**
   * Fetch historical data for calculating percentage change
   * This method uses the chart API for more detailed historical data if needed
   */
  async fetchHistoricalData(symbol: string, range: string = '1d', interval: string = '1d'): Promise<number | null> {
    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch historical data: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.chart?.result?.[0]?.indicators?.quote?.[0]?.close) {
        return null;
      }

      const prices = data.chart.result[0].indicators.quote[0].close;
      const validPrices = prices.filter((price: number | null) => price !== null);
      
      return validPrices.length > 0 ? validPrices[0] : null;
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get fallback data in case the API is unavailable
   */
  getFallbackData(): MarketData {
    return {
      brent: {
        symbol: 'BZ=F',
        name: 'Brent Crude',
        price: 78.20,
        change: -0.80,
        changePercent: -1.01,
        currency: 'USD',
        unit: 'barrel',
        lastUpdated: new Date().toISOString()
      },
      wti: {
        symbol: 'CL=F',
        name: 'WTI Crude',
        price: 73.45,
        change: 1.20,
        changePercent: 1.66,
        currency: 'USD',
        unit: 'barrel',
        lastUpdated: new Date().toISOString()
      },
      henryHub: {
        symbol: 'NG=F',
        name: 'Henry Hub Natural Gas',
        price: 2.84,
        change: 0.05,
        changePercent: 1.79,
        currency: 'USD',
        unit: 'MMBtu',
        lastUpdated: new Date().toISOString()
      },
      ttf: {
        symbol: 'TTF=F',
        name: 'TTF Natural Gas',
        price: 45.20,
        change: -1.10,
        changePercent: -2.38,
        currency: 'USD',
        unit: 'MWh',
        lastUpdated: new Date().toISOString()
      }
    };
  }
}

export const marketDataService = new MarketDataService();