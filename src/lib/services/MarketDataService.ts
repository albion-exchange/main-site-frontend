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


}

export const marketDataService = new MarketDataService();