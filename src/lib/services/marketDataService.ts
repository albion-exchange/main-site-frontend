interface MarketDataPoint {
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  unit: string;
  lastUpdated: string;
}

interface MarketData {
  wti: MarketDataPoint;
  brent: MarketDataPoint;
  henryHub: MarketDataPoint;
  ttf: MarketDataPoint;
}

// Yahoo Finance symbols for the commodities
const SYMBOLS = {
  wti: 'CL=F',      // WTI Crude Oil
  brent: 'BZ=F',    // Brent Crude Oil
  henryHub: 'NG=F', // Natural Gas (Henry Hub)
  ttf: 'TTF=F'      // TTF Natural Gas
};

class MarketDataService {
  private cache: MarketData | null = null;
  private lastFetch: Date | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async fetchMarketData(): Promise<MarketData> {
    // Return cached data if it's still fresh
    if (this.cache && this.lastFetch && 
        Date.now() - this.lastFetch.getTime() < this.CACHE_DURATION) {
      return this.cache;
    }

    try {
      const promises = Object.entries(SYMBOLS).map(([key, symbol]) => 
        this.fetchSymbolData(symbol, key as keyof MarketData)
      );

      const results = await Promise.all(promises);
      
      this.cache = results.reduce((acc, result) => {
        acc[result.key] = result.data;
        return acc;
      }, {} as MarketData);

      this.lastFetch = new Date();
      return this.cache;
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      // Return fallback data if fetch fails
      return this.getFallbackData();
    }
  }

  private async fetchSymbolData(symbol: string, key: keyof MarketData): Promise<{key: keyof MarketData, data: MarketDataPoint}> {
    try {
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      
      // Yahoo Finance API endpoint (public endpoint that doesn't require API key)
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
        throw new Error('Invalid response structure from Yahoo Finance');
      }

      const result = data.chart.result[0];
      const meta = result.meta;
      
      if (!meta) {
        throw new Error('No metadata in Yahoo Finance response');
      }

      const currentPrice = meta.regularMarketPrice || meta.previousClose;
      const previousClose = meta.previousClose;
      
      if (typeof currentPrice !== 'number' || typeof previousClose !== 'number') {
        throw new Error('Invalid price data from Yahoo Finance');
      }

      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;

      let unit = 'barrel';
      let currency = 'USD';
      
      if (key === 'henryHub' || key === 'ttf') {
        unit = 'MMBtu';
      }
      
      // TTF is priced in EUR
      if (key === 'ttf') {
        currency = 'EUR';
      }

      return {
        key,
        data: {
          price: Math.round(currentPrice * 100) / 100,
          change: Math.round(change * 100) / 100,
          changePercent: Math.round(changePercent * 100) / 100,
          currency: meta.currency || currency,
          unit,
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error(`Failed to fetch data for ${symbol}:`, error);
      // Return fallback data for this symbol
      return {
        key,
        data: this.getFallbackDataForSymbol(key)
      };
    }
  }

  private getFallbackDataForSymbol(key: keyof MarketData): MarketDataPoint {
    const fallbackData = {
      wti: { price: 73.45, change: 1.2, changePercent: 1.66, currency: 'USD' },
      brent: { price: 78.20, change: -0.8, changePercent: -1.01, currency: 'USD' },
      henryHub: { price: 2.84, change: 0.05, changePercent: 1.79, currency: 'USD' },
      ttf: { price:41.00, change: -1.20, changePercent: -2.85, currency: 'EUR' }
    };

    const data = fallbackData[key];
    return {
      price: data.price,
      change: data.change,
      changePercent: data.changePercent,
      currency: data.currency,
      unit: key === 'henryHub' || key === 'ttf' ? 'MMBtu' : 'barrel',
      lastUpdated: new Date().toISOString()
    };
  }

  private getFallbackData(): MarketData {
    return {
      wti: this.getFallbackDataForSymbol('wti'),
      brent: this.getFallbackDataForSymbol('brent'),
      henryHub: this.getFallbackDataForSymbol('henryHub'),
      ttf: this.getFallbackDataForSymbol('ttf')
    };
  }

  // Method to clear cache and force refresh
  invalidateCache(): void {
    this.cache = null;
    this.lastFetch = null;
  }
}

export const marketDataService = new MarketDataService();
export type { MarketData, MarketDataPoint };