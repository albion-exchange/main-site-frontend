/**
 * MarketDataProvider - Handles market data and platform statistics
 */

import type { MarketData } from "$lib/types/uiTypes";
import marketData from "$lib/data/marketData.json";
import platformStats from "$lib/data/platformStats.json";
import companyInfo from "$lib/data/companyInfo.json";

export class MarketDataProvider {
  static getMarketData(): MarketData {
    return marketData as MarketData;
  }

  static getPlatformStatistics() {
    return platformStats;
  }

  static getCompanyInfo() {
    return companyInfo;
  }
}