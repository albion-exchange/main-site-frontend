import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Yahoo Finance API endpoints
const YAHOO_QUOTE_API = 'https://query1.finance.yahoo.com/v7/finance/quote';
const SYMBOLS = 'CL=F,BZ=F,NG=F,TTF=F'; // WTI, Brent, Henry Hub, TTF

export const GET: RequestHandler = async ({ url, fetch }) => {
  try {
    // Add cache control headers
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=60'); // Cache for 1 minute
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET');

    // Fetch data from Yahoo Finance
    const yahooUrl = `${YAHOO_QUOTE_API}?symbols=${SYMBOLS}`;
    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none'
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Validate response structure
    if (!data.quoteResponse?.result) {
      throw new Error('Invalid response structure from Yahoo Finance API');
    }

    // Transform the data to our expected format
    const quotes = data.quoteResponse.result;
    const marketData: any = {};

    for (const quote of quotes) {
      const symbol = quote.symbol;
      const price = quote.regularMarketPrice || 0;
      const previousClose = quote.regularMarketPreviousClose || price;
      const change = price - previousClose;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

      const dataPoint = {
        symbol,
        price: Number(price.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        currency: 'USD',
        lastUpdated: new Date().toISOString()
      };

      // Map symbols to our standard names
      switch (symbol) {
        case 'BZ=F':
          marketData.brent = { 
            ...dataPoint, 
            name: 'Brent Crude',
            unit: 'barrel'
          };
          break;
        case 'CL=F':
          marketData.wti = { 
            ...dataPoint, 
            name: 'WTI Crude',
            unit: 'barrel'
          };
          break;
        case 'NG=F':
          marketData.henryHub = { 
            ...dataPoint, 
            name: 'Henry Hub Natural Gas',
            unit: 'MMBtu'
          };
          break;
        case 'TTF=F':
          marketData.ttf = { 
            ...dataPoint, 
            name: 'TTF Natural Gas',
            unit: 'MWh'
          };
          break;
      }
    }

    // Ensure all required data points are present
    if (!marketData.brent || !marketData.wti || !marketData.henryHub || !marketData.ttf) {
      throw new Error('Missing required market data points');
    }

    return json(marketData, { headers });

  } catch (error) {
    console.error('Market data API error:', error);

    // Return fallback data with error indication
    const fallbackData = {
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
      },
      _fallback: true,
      _error: error instanceof Error ? error.message : 'Unknown error'
    };

    return json(fallbackData, { 
      status: 200, // Return 200 with fallback data rather than error
      headers: {
        'Cache-Control': 'public, max-age=30', // Shorter cache for fallback data
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET'
      }
    });
  }
};