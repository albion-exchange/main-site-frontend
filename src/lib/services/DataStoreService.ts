/**
 * DataStoreService - Service layer for accessing static asset and token data
 * This service provides a unified interface to the JSON data stores
 */

import type { 
  Asset, 
  Token, 
  AssetsStore, 
  TokensStore,
  MarketData,
  UserTokenBalance 
} from '$lib/types/dataStore';
import assetsData from '$lib/data/assets.json';
import tokensData from '$lib/data/tokens.json';

class DataStoreService {
  private assets: AssetsStore;
  private tokens: TokensStore;

  constructor() {
    this.assets = assetsData as AssetsStore;
    this.tokens = tokensData as TokensStore;
  }

  // Asset-related methods

  /**
   * Get all assets
   */
  getAllAssets(): Asset[] {
    return Object.values(this.assets.assets);
  }

  /**
   * Get asset by ID
   */
  getAssetById(assetId: string): Asset | null {
    return this.assets.assets[assetId] || null;
  }

  /**
   * Get assets by status
   */
  getAssetsByStatus(status: 'funding' | 'producing' | 'completed'): Asset[] {
    return this.getAllAssets().filter(asset => asset.production.status === status);
  }

  /**
   * Get assets by location (state/country)
   */
  getAssetsByLocation(location: string): Asset[] {
    return this.getAllAssets().filter(asset => 
      asset.location.state.toLowerCase().includes(location.toLowerCase()) ||
      asset.location.country.toLowerCase().includes(location.toLowerCase())
    );
  }

  /**
   * Get assets by operator
   */
  getAssetsByOperator(operatorName: string): Asset[] {
    return this.getAllAssets().filter(asset =>
      asset.operator.name.toLowerCase().includes(operatorName.toLowerCase())
    );
  }

  /**
   * Search assets by name or description
   */
  searchAssets(query: string): Asset[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getAllAssets().filter(asset =>
      asset.name.toLowerCase().includes(lowercaseQuery) ||
      asset.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Token-related methods

  /**
   * Get all tokens
   */
  getAllTokens(): Token[] {
    return Object.values(this.tokens.tokens);
  }

  /**
   * Get token by contract address
   */
  getTokenByAddress(contractAddress: string): Token | null {
    return this.tokens.tokens[contractAddress] || null;
  }

  /**
   * Get token by symbol
   */
  getTokenBySymbol(symbol: string): Token | null {
    return this.getAllTokens().find(token => token.symbol === symbol) || null;
  }

  /**
   * Get tokens by asset ID
   */
  getTokensByAssetId(assetId: string): Token[] {
    return this.getAllTokens().filter(token => token.assetId === assetId);
  }

  /**
   * Get tokens by type
   */
  getTokensByType(tokenType: 'royalty' | 'payment'): Token[] {
    return this.getAllTokens().filter(token => token.tokenType === tokenType);
  }

  /**
   * Get active trading tokens only
   */
  getActiveTokens(): Token[] {
    return this.getAllTokens().filter(token => token.isActive);
  }

  /**
   * Get royalty tokens (excludes payment tokens)
   */
  getRoyaltyTokens(): Token[] {
    return this.getTokensByType('royalty');
  }

  /**
   * Get payment tokens only
   */
  getPaymentTokens(): Token[] {
    return this.getTokensByType('payment');
  }

  /**
   * Get selectable tokens (available for purchase)
   */
  getSelectableTokens(): Token[] {
    return this.getAllTokens().filter(token => 
      token.isActive && token.tokenType === 'royalty'
    );
  }

  // Combined asset-token methods

  /**
   * Get asset with its associated tokens
   */
  getAssetWithTokens(assetId: string): { asset: Asset; tokens: Token[] } | null {
    const asset = this.getAssetById(assetId);
    if (!asset) return null;

    const tokens = this.getTokensByAssetId(assetId);
    return { asset, tokens };
  }

  /**
   * Get all assets with their associated tokens
   */
  getAllAssetsWithTokens(): Array<{ asset: Asset; tokens: Token[] }> {
    return this.getAllAssets().map(asset => ({
      asset,
      tokens: this.getTokensByAssetId(asset.id)
    }));
  }

  /**
   * Get token with its associated asset
   */
  getTokenWithAsset(contractAddress: string): { token: Token; asset: Asset } | null {
    const token = this.getTokenByAddress(contractAddress);
    if (!token) return null;

    const asset = this.getAssetById(token.assetId);
    if (!asset) return null;

    return { token, asset };
  }

  // Market data methods

  /**
   * Get market data for trading interface
   */
  getMarketData(): Record<string, MarketData> {
    const marketData: Record<string, MarketData> = {};
    
    this.getAllTokens().forEach(token => {
      if (token.isActive && token.tokenType === 'royalty') {
        // Generate mock market data based on token
        const basePrice = 1.0;
        const priceChange = (Math.random() - 0.5) * 0.1;
        const volume = Math.random() * 1000000;
        
        marketData[token.symbol] = {
          symbol: token.symbol,
          price: basePrice + priceChange,
          change: priceChange,
          changePercent: (priceChange / basePrice) * 100,
          volume: volume,
          bid: basePrice + priceChange - 0.01,
          ask: basePrice + priceChange + 0.01,
          spread: 0.02,
          high24h: basePrice + Math.abs(priceChange) + 0.05,
          low24h: basePrice - Math.abs(priceChange) - 0.05,
          marketCap: parseFloat(token.supply.mintedSupply) / Math.pow(10, token.decimals) * (basePrice + priceChange)
        };
      }
    });

    return marketData;
  }

  /**
   * Get market data for a specific token
   */
  getTokenMarketData(symbol: string): MarketData | null {
    const token = this.getTokenBySymbol(symbol);
    if (!token || !token.isActive) return null;

    // Generate mock market data based on token
    const basePrice = 1.0;
    const priceChange = (Math.random() - 0.5) * 0.1;
    const volume = Math.random() * 1000000;
    
    return {
      symbol: token.symbol,
      price: basePrice + priceChange,
      change: priceChange,
      changePercent: (priceChange / basePrice) * 100,
      volume: volume,
      bid: basePrice + priceChange - 0.01,
      ask: basePrice + priceChange + 0.01,
      spread: 0.02,
      high24h: basePrice + Math.abs(priceChange) + 0.05,
      low24h: basePrice - Math.abs(priceChange) - 0.05,
      marketCap: parseFloat(token.supply.mintedSupply) / Math.pow(10, token.decimals) * (basePrice + priceChange)
    };
  }

  // Utility methods

  /**
   * Get latest monthly report for an asset
   */
  getLatestMonthlyReport(assetId: string) {
    const asset = this.getAssetById(assetId);
    if (!asset || asset.monthlyReports.length === 0) return null;

    return asset.monthlyReports[asset.monthlyReports.length - 1];
  }

  /**
   * Calculate total portfolio value for given token balances
   */
  calculatePortfolioValue(balances: UserTokenBalance[]): number {
    return balances.reduce((total, balance) => total + balance.currentValue, 0);
  }

  /**
   * Get asset performance metrics
   */
  getAssetPerformanceMetrics(assetId: string) {
    const asset = this.getAssetById(assetId);
    if (!asset) return null;

    const reports = asset.monthlyReports;
    if (reports.length === 0) return null;

    const latest = reports[reports.length - 1];
    const previous = reports.length > 1 ? reports[reports.length - 2] : null;

    return {
      latestProduction: latest.production,
      latestNetIncome: latest.netIncome,
      latestPayoutPerToken: latest.payoutPerToken,
      monthOverMonthProductionChange: previous 
        ? ((latest.production - previous.production) / previous.production) * 100 
        : 0,
      monthOverMonthIncomeChange: previous 
        ? ((latest.netIncome - previous.netIncome) / previous.netIncome) * 100 
        : 0,
      totalProductionLast12Months: reports.slice(-12).reduce((sum, report) => sum + report.production, 0),
      totalIncomeLast12Months: reports.slice(-12).reduce((sum, report) => sum + report.netIncome, 0)
    };
  }

  /**
   * Format currency values
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Format percentage values
   */
  formatPercentage(value: number, decimals: number = 2): string {
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Format large numbers with appropriate suffixes
   */
  formatLargeNumber(value: number): string {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }

  // New token data structure methods

  /**
   * Get token supply information
   */
  getTokenSupply(contractAddress: string) {
    const token = this.getTokenByAddress(contractAddress);
    if (!token) return null;

    const maxSupply = parseFloat(token.supply.maxSupply) / Math.pow(10, token.decimals);
    const mintedSupply = parseFloat(token.supply.mintedSupply) / Math.pow(10, token.decimals);
    const supplyUtilization = (mintedSupply / maxSupply) * 100;

    return {
      maxSupply,
      mintedSupply,
      supplyUtilization,
      availableSupply: maxSupply - mintedSupply
    };
  }

  /**
   * Get token holder information
   */
  getTokenHolders(contractAddress: string) {
    const token = this.getTokenByAddress(contractAddress);
    if (!token) return null;

    const totalHolders = token.holders.length;
    const totalBalance = token.holders.reduce((sum, holder) => 
      sum + parseFloat(holder.balance), 0
    ) / Math.pow(10, token.decimals);
    
    return {
      totalHolders,
      totalBalance,
      holders: token.holders.map(holder => ({
        ...holder,
        formattedBalance: (parseFloat(holder.balance) / Math.pow(10, token.decimals)).toFixed(2)
      }))
    };
  }

  /**
   * Get token payout history
   */
  getTokenPayoutHistory(contractAddress: string) {
    const token = this.getTokenByAddress(contractAddress);
    if (!token) return null;

    return {
      totalPayouts: token.payoutHistory.length,
      totalPaid: token.payoutHistory.reduce((sum, payout) => sum + payout.totalPayout, 0),
      recentPayouts: token.payoutHistory.slice(-6), // Last 6 payouts
      averageMonthlyPayout: token.payoutHistory.length > 0 
        ? token.payoutHistory.reduce((sum, payout) => sum + payout.totalPayout, 0) / token.payoutHistory.length
        : 0
    };
  }

  /**
   * Get platform statistics from token data
   */
  getPlatformStatistics() {
    const allTokens = this.getAllTokens();
    const royaltyTokens = allTokens.filter(token => token.tokenType === 'royalty');
    
    const totalInvestors = royaltyTokens.reduce((sum, token) => 
      sum + token.holders.length, 0
    );
    
    // Calculate total value locked from token balances (assume $1 per token)
    const totalValueLocked = royaltyTokens.reduce((sum, token) => 
      sum + token.holders.reduce((holderSum, holder) => 
        holderSum + (parseFloat(holder.balance) / Math.pow(10, token.decimals)), 0
      ), 0
    );

    const totalPayouts = royaltyTokens.reduce((sum, token) => 
      sum + token.payoutHistory.reduce((payoutSum, payout) => 
        payoutSum + payout.totalPayout, 0
      ), 0
    );

    // Mock average yield since tokenomics data was removed
    const averageYield = 13.5; // Average estimated yield

    return {
      totalAssets: this.getAllAssets().length,
      totalInvestors,
      totalValueLocked,
      totalPayouts,
      averageYield
    };
  }
}

// Export singleton instance
export const dataStoreService = new DataStoreService();
export default dataStoreService;