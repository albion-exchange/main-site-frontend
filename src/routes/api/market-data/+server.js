import { json } from '@sveltejs/kit';

// Yahoo Finance symbols for the commodities
const SYMBOLS = {
  wti: 'CL=F',      // WTI Crude Oil
  brent: 'BZ=F',    // Brent Crude Oil
  henryHub: 'NG=F', // Natural Gas (Henry Hub)
  ttf: 'TTF=F'      // TTF Natural Gas
};

async function fetchSymbolData(symbol, key) {
  try {
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
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
    // Return N/A data for this symbol
    return {
      key,
      data: {
        price: null,
        change: null,
        changePercent: null,
        currency: key === 'ttf' ? 'EUR' : 'USD',
        unit: key === 'henryHub' || key === 'ttf' ? 'MMBtu' : 'barrel',
        lastUpdated: new Date().toISOString()
      }
    };
  }
}

export async function GET() {
  try {
    const promises = Object.entries(SYMBOLS).map(([key, symbol]) => 
      fetchSymbolData(symbol, key)
    );

    const results = await Promise.all(promises);
    
    const marketData = results.reduce((acc, result) => {
      acc[result.key] = result.data;
      return acc;
    }, {});

    return json(marketData);
  } catch (error) {
    console.error('Failed to fetch market data:', error);
    
    // Return N/A data if all fails
    const naData = {
      wti: { price: null, change: null, changePercent: null, currency: 'USD', unit: 'barrel', lastUpdated: new Date().toISOString() },
      brent: { price: null, change: null, changePercent: null, currency: 'USD', unit: 'barrel', lastUpdated: new Date().toISOString() },
      henryHub: { price: null, change: null, changePercent: null, currency: 'USD', unit: 'MMBtu', lastUpdated: new Date().toISOString() },
      ttf: { price: null, change: null, changePercent: null, currency: 'EUR', unit: 'MMBtu', lastUpdated: new Date().toISOString() }
    };
    
    return json(naData);
  }
}
