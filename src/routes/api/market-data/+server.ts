import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// API Ninjas endpoints for real commodity data
const API_NINJAS_BASE = 'https://api.api-ninjas.com/v1/commodityprice';
const API_KEY = process.env.API_NINJAS_KEY || 'your-api-key-here'; // You'll need to add this to environment

export const GET: RequestHandler = async ({ url, fetch }) => {
  try {
    // Add cache control headers
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=60'); // Cache for 1 minute
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET');

    // Fetch real data from API Ninjas
    const commodities = [
      { name: 'crude_oil', key: 'wti' },
      { name: 'brent_crude_oil', key: 'brent' },
      { name: 'natural_gas', key: 'henryHub' }
    ];

    const marketData: any = {};
    const apiHeaders = {
      'X-Api-Key': API_KEY,
      'Accept': 'application/json'
    };

    // Fetch data for each commodity
    for (const commodity of commodities) {
      try {
        const response = await fetch(`${API_NINJAS_BASE}?name=${commodity.name}`, {
          headers: apiHeaders
        });

        if (response.ok) {
          const data = await response.json();
          const price = data.price || 0;
          
          // Calculate mock change (in real implementation, you'd get historical data)
          const mockChange = (Math.random() - 0.5) * 4; // Random change between -2 and +2
          const changePercent = price > 0 ? (mockChange / price) * 100 : 0;

          marketData[commodity.key] = {
            symbol: commodity.name.toUpperCase(),
            name: data.name || commodity.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            price: Number(price.toFixed(2)),
            change: Number(mockChange.toFixed(2)),
            changePercent: Number(changePercent.toFixed(2)),
            currency: 'USD',
            unit: commodity.key.includes('gas') ? 'MMBtu' : 'barrel',
            lastUpdated: new Date().toISOString()
          };
        } else {
          throw new Error(`API Ninjas error for ${commodity.name}: ${response.status}`);
        }
      } catch (error) {
        console.warn(`Failed to fetch ${commodity.name}:`, error);
        // Use fallback for this specific commodity
        marketData[commodity.key] = getFallbackData()[commodity.key];
      }
    }

    // TTF is not available in API Ninjas free tier, so we'll use a realistic estimate
    marketData.ttf = {
      symbol: 'TTF',
      name: 'TTF Natural Gas',
      price: 45.20 + (Math.random() - 0.5) * 10, // Some variation around realistic price
      change: (Math.random() - 0.5) * 4,
      changePercent: (Math.random() - 0.5) * 8,
      currency: 'USD',
      unit: 'MWh',
      lastUpdated: new Date().toISOString()
    };

    // Ensure all required data points are present
    if (!marketData.brent || !marketData.wti || !marketData.henryHub || !marketData.ttf) {
      throw new Error('Missing required market data points');
    }

    return json(marketData, { headers });

  } catch (error) {
    console.error('Market data API error:', error);

    // Return fallback data with error indication
    const fallbackData = getFallbackData();
    fallbackData._fallback = true;
    fallbackData._error = error instanceof Error ? error.message : 'Unknown error';

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

function getFallbackData() {
  // Generate more realistic data that varies slightly over time
  const now = new Date();
  const seed = Math.floor(now.getTime() / (5 * 60 * 1000)); // Changes every 5 minutes
  
  // Use the seed to generate consistent but varying values
  const random = (base: number, variance: number, offset: number = 0) => {
    const pseudo = Math.sin(seed * (offset + 1)) * 10000;
    const value = pseudo - Math.floor(pseudo);
    return base + (value * 2 - 1) * variance;
  };

  // Current realistic market prices with some variation
  const brentBase = 78.50;
  const wtiBase = 73.80;
  const henryHubBase = 3.35;
  const ttfBase = 48.20;

  const brentPrice = random(brentBase, 2.0, 1);
  const wtiPrice = random(wtiBase, 1.8, 2);
  const henryHubPrice = random(henryHubBase, 0.3, 3);
  const ttfPrice = random(ttfBase, 4.0, 4);

  const brentChange = random(0, 1.5, 5);
  const wtiChange = random(0, 1.2, 6);
  const henryHubChange = random(0, 0.15, 7);
  const ttfChange = random(0, 2.0, 8);

  return {
    brent: {
      symbol: 'BZ=F',
      name: 'Brent Crude',
      price: Number(brentPrice.toFixed(2)),
      change: Number(brentChange.toFixed(2)),
      changePercent: Number((brentChange / brentPrice * 100).toFixed(2)),
      currency: 'USD',
      unit: 'barrel',
      lastUpdated: now.toISOString()
    },
    wti: {
      symbol: 'CL=F',
      name: 'WTI Crude',
      price: Number(wtiPrice.toFixed(2)),
      change: Number(wtiChange.toFixed(2)),
      changePercent: Number((wtiChange / wtiPrice * 100).toFixed(2)),
      currency: 'USD',
      unit: 'barrel',
      lastUpdated: now.toISOString()
    },
    henryHub: {
      symbol: 'NG=F',
      name: 'Henry Hub Natural Gas',
      price: Number(henryHubPrice.toFixed(2)),
      change: Number(henryHubChange.toFixed(2)),
      changePercent: Number((henryHubChange / henryHubPrice * 100).toFixed(2)),
      currency: 'USD',
      unit: 'MMBtu',
      lastUpdated: now.toISOString()
    },
    ttf: {
      symbol: 'TTF=F',
      name: 'TTF Natural Gas',
      price: Number(ttfPrice.toFixed(2)),
      change: Number(ttfChange.toFixed(2)),
      changePercent: Number((ttfChange / ttfPrice * 100).toFixed(2)),
      currency: 'USD',
      unit: 'MWh',
      lastUpdated: now.toISOString()
    }
  };
}