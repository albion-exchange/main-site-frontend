interface MarketDataPoint {
  price: number | null;
  change: number | null;
  changePercent: number | null;
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



// Simple function to fetch market data from our API route
export async function fetchMarketData(): Promise<MarketData> {
  try {
    const response = await fetch('/api/market-data');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as MarketData;
  } catch (error) {
    console.error('Failed to fetch market data:', error);
    // Return N/A data if fetch fails
    return getNAData();
  }
}



function getNADataForSymbol(key: keyof MarketData): MarketDataPoint {
  return {
    price: null,
    change: null,
    changePercent: null,
    currency: key === 'ttf' ? 'EUR' : 'USD',
    unit: key === 'henryHub' || key === 'ttf' ? 'MMBtu' : 'barrel',
    lastUpdated: new Date().toISOString()
  };
}

function getNAData(): MarketData {
  return {
    wti: getNADataForSymbol('wti'),
    brent: getNADataForSymbol('brent'),
    henryHub: getNADataForSymbol('henryHub'),
    ttf: getNADataForSymbol('ttf')
  };
}

export type { MarketData, MarketDataPoint };