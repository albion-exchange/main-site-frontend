/**
 * DataStoreService - Legacy compatibility layer
 * This service now delegates to the focused services for better separation of concerns.
 * 
 * @deprecated Use the focused services directly: AssetService, TokenService, ConfigService
 * This service is maintained for backward compatibility only.
 */

import type {
  TokenMetadata,
  MonthlyData,
  AssetData,
} from "$lib/types/MetaboardTypes";
import type {
  Asset,
  Token,
  MarketData,
  UserTokenBalance,
} from "$lib/types/uiTypes";
import type {
  AssetTokenMapping,
} from "$lib/types/sharedTypes";
import {
  getTokenReturns,
  type TokenReturns,
} from "$lib/utils/returnCalculations";

// Use the new focused services
import assetService from './AssetService';
import tokenService from './TokenService';
import configService from './ConfigService';

class DataStoreService {
  constructor() {
    // Legacy service now delegates to focused services
  }

  // ============================================================================
  // ASSET METHODS - Delegate to AssetService
  // ============================================================================

  /**
   * @deprecated Use assetService.getAllAssets() directly
   */
  getAllAssets(): Asset[] {
    return assetService.getAllAssets();
  }

  /**
   * @deprecated Use assetService.getAssetById() directly
   */
  getAssetById(assetId: string): Asset | null {
    return assetService.getAssetById(assetId);
  }

  /**
   * @deprecated Use assetService.getAssetsByStatus() directly
   */
  getAssetsByStatus(status: "funding" | "producing" | "completed"): Asset[] {
    return assetService.getAssetsByStatus(status);
  }

  /**
   * @deprecated Use assetService.getAssetsByLocation() directly
   */
  getAssetsByLocation(location: string): Asset[] {
    const [country, state] = location.includes(',') ? location.split(',').map(s => s.trim()) : [location];
    return assetService.getAssetsByLocation(country, state);
  }

  /**
   * @deprecated Use assetService.searchAssets() directly
   */
  searchAssets(query: string): Asset[] {
    return assetService.searchAssets(query);
  }

  /**
   * @deprecated Use assetService.getLatestMonthlyReport() directly
   */
  getLatestMonthlyReport(assetId: string) {
    return assetService.getLatestMonthlyReport(assetId);
  }

  /**
   * @deprecated Use assetService.getAverageMonthlyRevenue() directly
   */
  getAverageMonthlyRevenue(assetId: string): number {
    return assetService.getAverageMonthlyRevenue(assetId);
  }

  // ============================================================================
  // TOKEN METHODS - Delegate to TokenService
  // ============================================================================

  /**
   * @deprecated Use tokenService.getAllTokens() directly
   */
  getAllTokens(): Token[] {
    return tokenService.getAllTokens();
  }

  /**
   * @deprecated Use tokenService.getTokenByAddress() directly
   */
  getTokenByAddress(contractAddress: string): Token | null {
    return tokenService.getTokenByAddress(contractAddress);
  }

  /**
   * @deprecated Use tokenService.searchTokens() directly
   */
  getTokenBySymbol(symbol: string): Token | null {
    const tokens = tokenService.searchTokens(symbol);
    return tokens.find(token => token.symbol === symbol) || null;
  }

  /**
   * @deprecated Use tokenService.getTokensByAssetId() directly
   */
  getTokensByAssetId(assetId: string): Token[] {
    return tokenService.getTokensByAssetId(assetId);
  }

  /**
   * @deprecated Use tokenService.getTokensByType() directly
   */
  getTokensByType(tokenType: "royalty" | "payment"): Token[] {
    return tokenService.getTokensByType(tokenType);
  }

  /**
   * @deprecated Use tokenService.getAvailableTokens() directly
   */
  getActiveTokens(): Token[] {
    return tokenService.getAvailableTokens();
  }

  /**
   * @deprecated Use tokenService.getTokensByType('royalty') directly
   */
  getRoyaltyTokens(): Token[] {
    return tokenService.getTokensByType('royalty');
  }

  /**
   * @deprecated Use tokenService.getTokensByType('payment') directly
   */
  getPaymentTokens(): Token[] {
    return tokenService.getTokensByType('payment');
  }

  /**
   * @deprecated Use tokenService.getAvailableTokens() directly
   */
  getSelectableTokens(): Token[] {
    return tokenService.getAvailableTokens();
  }

  /**
   * @deprecated Use tokenService.getTokenReturns() directly
   */
  getCalculatedTokenReturns(contractAddress: string): TokenReturns | null {
    return tokenService.getTokenReturns(contractAddress);
  }

  /**
   * @deprecated Use tokenService.getTokenSupply() directly
   */
  getTokenSupply(contractAddress: string) {
    return tokenService.getTokenSupply(contractAddress);
  }

  /**
   * @deprecated Use tokenService.getTokenPayoutHistory() directly
   */
  getTokenPayoutHistory(contractAddress: string) {
    return tokenService.getTokenPayoutHistory(contractAddress);
  }

  // ============================================================================
  // CONFIGURATION METHODS - Delegate to ConfigService
  // ============================================================================

  /**
   * @deprecated Use configService.getPlatformStats() directly
   */
  getPlatformStatistics() {
    return configService.getPlatformStats();
  }

  /**
   * @deprecated Use configService.getMarketConfig() directly
   */
  getMarketData() {
    return configService.getMarketConfig();
  }

  /**
   * @deprecated Use configService.getPlatformConfig() directly
   */
  getPlatformStats() {
    return configService.getPlatformConfig();
  }

  /**
   * @deprecated Use configService.getCompanyConfig() directly
   */
  getCompanyInfo() {
    return configService.getCompanyConfig();
  }

  /**
   * @deprecated Use configService.getFutureReleases() directly
   */
  getFutureReleases() {
    return configService.getFutureReleases();
  }

  /**
   * @deprecated Use configService.getFutureReleasesByAsset() directly
   */
  getFutureReleasesByAsset(assetId: string) {
    return configService.getFutureReleasesByAsset(assetId);
  }

  /**
   * @deprecated Use configService.getFutureReleasesByAsset() directly
   */
  getFutureReleaseByAsset(assetId: string) {
    const releases = configService.getFutureReleasesByAsset(assetId);
    return releases[0] || null;
  }

  /**
   * @deprecated Use configService.getCurrentOilPrice() directly
   */
  getCurrentOilPrice(): number {
    return configService.getCurrentOilPrice();
  }

  /**
   * @deprecated Use configService.getPlatformFee() directly
   */
  getPlatformFee(): number {
    return configService.getPlatformFee();
  }

  // ============================================================================
  // LEGACY METHODS - Simplified implementations for compatibility
  // ============================================================================

  /**
   * Legacy method for market data compatibility
   * @deprecated Use configService methods for specific data
   */
  getAllMarketData(): MarketData[] {
    const marketConfig = configService.getMarketConfig();
    return [
      {
        symbol: 'OIL',
        name: 'Crude Oil',
        price: marketConfig.commodityPrices.oil.current,
        change: 0, // Would need historical data for change calculation
        changePercent: 0,
        currency: marketConfig.commodityPrices.oil.currency,
        lastUpdated: marketConfig.commodityPrices.oil.lastUpdated
      },
      {
        symbol: 'GAS',
        name: 'Natural Gas',
        price: marketConfig.commodityPrices.gas.current,
        change: 0,
        changePercent: 0,
        currency: marketConfig.commodityPrices.gas.currency,
        lastUpdated: marketConfig.commodityPrices.gas.lastUpdated
      }
    ];
  }

  /**
   * Legacy method for token market data
   * @deprecated Use getAllMarketData() and filter by symbol
   */
  getTokenMarketData(symbol: string): MarketData | null {
    const marketData = this.getAllMarketData();
    return marketData.find(data => data.symbol === symbol) || null;
  }

  /**
   * Legacy method for portfolio calculations
   * @deprecated Use utils/portfolioCalculations instead
   */
  calculatePortfolioValue(balances: UserTokenBalance[]): number {
    let totalValue = 0;
    for (const balance of balances) {
      const token = this.getTokenByAddress(balance.tokenAddress);
      if (token && token.price) {
        totalValue += balance.balance * token.price;
      }
    }
    return totalValue;
  }

  /**
   * Legacy method for asset performance
   * @deprecated Use AssetService methods for specific metrics
   */
  getAssetPerformanceMetrics(assetId: string) {
    const asset = assetService.getAssetById(assetId);
    const latestReport = assetService.getLatestMonthlyReport(assetId);
    const avgRevenue = assetService.getAverageMonthlyRevenue(assetId);

    return {
      totalProduction: asset?.monthlyReports?.reduce((sum, report) => sum + (report.production || 0), 0) || 0,
      totalRevenue: asset?.monthlyReports?.reduce((sum, report) => sum + (report.revenue || 0), 0) || 0,
      averageMonthlyRevenue: avgRevenue,
      latestProduction: latestReport?.production || 0,
      latestRevenue: latestReport?.revenue || 0,
      productionTrend: 'stable', // Would need calculation logic
      revenueTrend: 'stable'
    };
  }

  // ============================================================================
  // UTILITY METHODS - Keep for legacy compatibility
  // ============================================================================

  /**
   * @deprecated Use formatters utility functions directly
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * @deprecated Use formatters utility functions directly
   */
  formatTokenAmount(amount: string, decimals: number = 18): string {
    const numAmount = parseFloat(amount);
    return (numAmount / Math.pow(10, decimals)).toFixed(4);
  }

  // ============================================================================
  // DEPRECATED METHODS - Remove in future versions
  // ============================================================================

  /**
   * @deprecated This functionality is now handled by the focused services
   */
  getCalculatedRemainingProduction(assetId: string, cumulativeProduction: number = 0): string {
    console.warn('getCalculatedRemainingProduction is deprecated. Use AssetService methods instead.');
    return 'N/A';
  }

  /**
   * @deprecated Use configService methods instead
   */
  getEstimatedTokenValue(assetId: string): number {
    console.warn('getEstimatedTokenValue is deprecated. Use TokenService methods instead.');
    return 0;
  }

  /**
   * @deprecated Use configService methods instead
   */
  getOilPriceScenarios() {
    console.warn('getOilPriceScenarios is deprecated. Use ConfigService methods instead.');
    return [];
  }

  /**
   * @deprecated Use configService methods instead
   */
  getPlatformFees() {
    console.warn('getPlatformFees is deprecated. Use ConfigService methods instead.');
    return {};
  }

  /**
   * @deprecated Use configService methods instead
   */
  getNextRelease() {
    console.warn('getNextRelease is deprecated. Use ConfigService methods instead.');
    return null;
  }

  // ============================================================================
  // CORE TYPE METHODS - Remove these as they're internal implementation details
  // ============================================================================

  /**
   * @deprecated Internal implementation detail, use UI types instead
   */
  getAllCoreAssets() {
    console.warn('getAllCoreAssets is deprecated. Use AssetService.getAllAssets() instead.');
    return [];
  }

  /**
   * @deprecated Internal implementation detail, use UI types instead
   */
  getCoreAssetById(assetId: string) {
    console.warn('getCoreAssetById is deprecated. Use AssetService.getAssetById() instead.');
    return null;
  }

  /**
   * @deprecated Internal implementation detail, use UI types instead
   */
  getAllCoreTokens() {
    console.warn('getAllCoreTokens is deprecated. Use TokenService.getAllTokens() instead.');
    return [];
  }

  /**
   * @deprecated Internal implementation detail, use UI types instead
   */
  getCoreTokenByAddress(contractAddress: string) {
    console.warn('getCoreTokenByAddress is deprecated. Use TokenService.getTokenByAddress() instead.');
    return null;
  }

  /**
   * @deprecated Internal implementation detail, use UI types instead
   */
  getCoreTokensByAssetId(assetId: string) {
    console.warn('getCoreTokensByAssetId is deprecated. Use TokenService.getTokensByAssetId() instead.');
    return [];
  }
}

// Export singleton instance for backward compatibility
const dataStoreService = new DataStoreService();
export default dataStoreService;
