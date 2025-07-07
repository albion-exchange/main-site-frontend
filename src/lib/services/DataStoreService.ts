/**
 * DataStoreService - Service layer for accessing static asset and token data
 * This service provides a unified interface to the folder-based data structure
 */

import type { 
  Asset, 
  Token, 
  MarketData,
  UserTokenBalance 
} from '$lib/types/dataStore';
import { getTokenReturns, type TokenReturns } from '$lib/utils/returnCalculations';

// Import all asset data
import europaWressleAsset from '$lib/data/assets/europa-wressle-release-1/asset.json';
import bakkenHorizonAsset from '$lib/data/assets/bakken-horizon-field/asset.json';
import permianBasinAsset from '$lib/data/assets/permian-basin-venture/asset.json';
import gulfMexicoAsset from '$lib/data/assets/gulf-mexico-deep-water/asset.json';

// Import all token data
import eurWr1Token from '$lib/data/assets/europa-wressle-release-1/tokens/eur_wr1.json';
import eurWr2Token from '$lib/data/assets/europa-wressle-release-1/tokens/eur_wr2.json';
import eurWr3Token from '$lib/data/assets/europa-wressle-release-1/tokens/eur_wr3.json';
import bakHfToken from '$lib/data/assets/bakken-horizon-field/tokens/bak_hf.json';
import bakHf2Token from '$lib/data/assets/bakken-horizon-field/tokens/bak_hf2.json';
import perBvToken from '$lib/data/assets/permian-basin-venture/tokens/per_bv.json';
import gomDwToken from '$lib/data/assets/gulf-mexico-deep-water/tokens/gom_dw.json';

class DataStoreService {
  private assets: Record<string, Asset>;
  private tokens: Record<string, Token>;

  constructor() {
    // Initialize assets
    this.assets = {
      'europa-wressle-release-1': europaWressleAsset as Asset,
      'bakken-horizon-field': bakkenHorizonAsset as Asset,
      'permian-basin-venture': permianBasinAsset as Asset,
      'gulf-mexico-deep-water': gulfMexicoAsset as Asset,
    };

    // Initialize tokens
    this.tokens = {
      [eurWr1Token.contractAddress]: eurWr1Token as Token,
      [eurWr2Token.contractAddress]: eurWr2Token as Token,
      [eurWr3Token.contractAddress]: eurWr3Token as Token,
      [bakHfToken.contractAddress]: bakHfToken as Token,
      [bakHf2Token.contractAddress]: bakHf2Token as Token,
      [perBvToken.contractAddress]: perBvToken as Token,
      [gomDwToken.contractAddress]: gomDwToken as Token,
    };
  }

  // Asset-related methods

  /**
   * Get all assets
   */
  getAllAssets(): Asset[] {
    return Object.values(this.assets);
  }

  /**
   * Get asset by ID
   */
  getAssetById(assetId: string): Asset | null {
    return this.assets[assetId] || null;
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
   * Search assets by name or description
   */
  searchAssets(query: string): Asset[] {
    const searchTerm = query.toLowerCase();
    return this.getAllAssets().filter(asset => 
      asset.name.toLowerCase().includes(searchTerm) ||
      asset.description.toLowerCase().includes(searchTerm)
    );
  }

  // Token-related methods

  /**
   * Get all tokens
   */
  getAllTokens(): Token[] {
    return Object.values(this.tokens);
  }

  /**
   * Get token by contract address
   */
  getTokenByAddress(contractAddress: string): Token | null {
    return this.tokens[contractAddress] || null;
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

  // Market data methods (mock implementations for now)

  /**
   * Get market data for all active tokens
   */
  getAllMarketData(): MarketData[] {
    const marketData: MarketData[] = [];
    
    this.getActiveTokens().forEach(token => {
      if (token.tokenType === 'royalty') {
        // Generate mock market data based on token
        const basePrice = 1.0;
        const priceChange = (Math.random() - 0.5) * 0.1;
        const volume = Math.random() * 1000000;
        
        marketData.push({
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
        });
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
   * Get calculated returns for a token based on planned production
   */
  getCalculatedTokenReturns(contractAddress: string): TokenReturns | null {
    const token = this.getTokenByAddress(contractAddress);
    if (!token) return null;

    const asset = this.getAssetById(token.assetId);
    if (!asset) return null;

    return getTokenReturns(asset, token);
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
   * Format token amounts (with decimals consideration)
   */
  formatTokenAmount(amount: string, decimals: number = 18): string {
    const value = parseFloat(amount) / Math.pow(10, decimals);
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
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
    );

    return {
      totalHolders,
      averageBalance: totalBalance / totalHolders,
      holders: token.holders.map(holder => ({
        ...holder,
        formattedBalance: this.formatTokenAmount(holder.balance, token.decimals)
      }))
    };
  }

  /**
   * Get platform statistics
   */
  getPlatformStatistics() {
    const allAssets = this.getAllAssets();
    const allTokens = this.getRoyaltyTokens();
    
    // Calculate total assets
    const totalAssets = allAssets.length;
    
    // Calculate total invested from royalty tokens' minted supply
    const totalInvested = allTokens.reduce((sum, token) => {
      const mintedTokens = parseFloat(token.supply.mintedSupply) / Math.pow(10, token.decimals);
      // Use $1 per token as base estimation
      return sum + mintedTokens;
    }, 0);
    
    // Calculate total payouts from monthly reports
    const totalPayouts = allAssets.reduce((sum, asset) => {
      return sum + asset.monthlyReports.reduce((assetSum, report) => assetSum + report.netIncome, 0);
    }, 0);
    
    // Get active token holders count
    const totalHolders = allTokens.reduce((sum, token) => sum + token.holders.length, 0);
    
    return {
      totalAssets,
      totalInvested,
      totalPayouts,
      totalHolders
    };
  }

  /**
   * Get token payout history data
   */
  getTokenPayoutHistory(contractAddress: string) {
    const token = this.getTokenByAddress(contractAddress);
    if (!token) return null;

    // Mock payout history for now
    const recentPayouts = [
      {
        month: '2024-11',
        date: '2024-11-15',
        totalPayout: 18750,
        payoutPerToken: 12.50,
        oilPrice: 72.45,
        gasPrice: 2.85,
        productionVolume: 6000,
        txHash: '0x1234567890abcdef1234567890abcdef12345678'
      },
      {
        month: '2024-10',
        date: '2024-10-15',
        totalPayout: 20160,
        payoutPerToken: 13.44,
        oilPrice: 74.20,
        gasPrice: 2.92,
        productionVolume: 6150,
        txHash: '0x2345678901bcdef01234567890abcdef23456789'
      }
    ];

    const totalPayouts = recentPayouts.length;
    const averageMonthlyPayout = recentPayouts.reduce((sum, payout) => sum + payout.payoutPerToken, 0) / totalPayouts;

    return {
      recentPayouts,
      totalPayouts,
      averageMonthlyPayout,
      totalPaid: recentPayouts.reduce((sum, payout) => sum + payout.totalPayout, 0)
    };
  }
}

// Export singleton instance
const dataStoreService = new DataStoreService();
export default dataStoreService;
export { dataStoreService };