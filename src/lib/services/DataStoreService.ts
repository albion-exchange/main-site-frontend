/**
 * DataStoreService - Legacy Bridge
 * 
 * This is a compatibility layer that maintains the old DataStoreService interface
 * while using the new service architecture underneath. This allows for gradual
 * migration of components without breaking existing functionality.
 * 
 * @deprecated This is a legacy bridge. New code should use the new services directly:
 * - useAssetService() for asset operations
 * - useTokenService() for token operations  
 * - useExport() for export functionality
 */

import { serviceContainer } from './ServiceContainer';
import type { Asset, Token, MarketData } from '$lib/types/uiTypes';

class LegacyDataStoreService {
  private get assetService() {
    return serviceContainer.assetService;
  }

  private get tokenService() {
    return serviceContainer.tokenService;
  }

  /**
   * @deprecated Use assetService.getAllAssets() instead
   */
  getAllAssets(): Asset[] {
    // Convert async method to sync for compatibility
    let assets: Asset[] = [];
    this.assetService.getAllAssets().then(result => {
      assets = result;
    });
    return assets;
  }

  /**
   * @deprecated Use assetService.getAssetById() instead
   */
  getAssetById(assetId: string): Asset | null {
    // Convert async method to sync for compatibility
    let asset: Asset | null = null;
    this.assetService.getAssetById(assetId).then(result => {
      asset = result;
    });
    return asset;
  }

  /**
   * @deprecated Use assetService.searchAssets() instead
   */
  getAssetsByStatus(status: "funding" | "producing" | "completed"): Asset[] {
    let assets: Asset[] = [];
    this.assetService.getAssetsByStatus(status).then(result => {
      assets = result;
    });
    return assets;
  }

  /**
   * @deprecated Use assetService.searchAssets() instead
   */
  getAssetsByLocation(location: string): Asset[] {
    let assets: Asset[] = [];
    this.assetService.getAssetsByLocation(location).then(result => {
      assets = result;
    });
    return assets;
  }

  /**
   * @deprecated Use assetService.searchAssets() instead
   */
  searchAssets(query: string): Asset[] {
    let assets: Asset[] = [];
    this.assetService.searchAssets({ query }).then(result => {
      assets = result;
    });
    return assets;
  }

  /**
   * @deprecated Use tokenService.getAllTokens() instead
   */
  getAllTokens(): Token[] {
    let tokens: Token[] = [];
    this.tokenService.getAllTokens().then(result => {
      tokens = result;
    });
    return tokens;
  }

  /**
   * @deprecated Use tokenService.getTokenByAddress() instead
   */
  getTokenByAddress(contractAddress: string): Token | null {
    let token: Token | null = null;
    this.tokenService.getTokenByAddress(contractAddress).then(result => {
      token = result;
    });
    return token;
  }

  /**
   * @deprecated Use tokenService.getTokenBySymbol() instead
   */
  getTokenBySymbol(symbol: string): Token | null {
    let token: Token | null = null;
    this.tokenService.getTokenBySymbol(symbol).then(result => {
      token = result;
    });
    return token;
  }

  /**
   * @deprecated Use tokenService.getTokensByAssetId() instead
   */
  getTokensByAssetId(assetId: string): Token[] {
    let tokens: Token[] = [];
    this.tokenService.getTokensByAssetId(assetId).then(result => {
      tokens = result;
    });
    return tokens;
  }

  /**
   * @deprecated Use tokenService.getTokensByType() instead
   */
  getTokensByType(tokenType: "royalty" | "payment"): Token[] {
    let tokens: Token[] = [];
    this.tokenService.getTokensByType(tokenType).then(result => {
      tokens = result;
    });
    return tokens;
  }

  /**
   * @deprecated Use tokenService.getRoyaltyTokens() instead
   */
  getRoyaltyTokens(): Token[] {
    return this.getTokensByType("royalty");
  }

  /**
   * @deprecated Use tokenService.getPaymentTokens() instead
   */
  getPaymentTokens(): Token[] {
    return this.getTokensByType("payment");
  }

  /**
   * @deprecated Use tokenService.getActiveTokens() instead
   */
  getActiveTokens(): Token[] {
    let tokens: Token[] = [];
    this.tokenService.getActiveTokens().then(result => {
      tokens = result;
    });
    return tokens;
  }

  /**
   * @deprecated Use tokenService.getSelectableTokens() instead
   */
  getSelectableTokens(): Token[] {
    let tokens: Token[] = [];
    this.tokenService.getSelectableTokens().then(result => {
      tokens = result;
    });
    return tokens;
  }

  /**
   * @deprecated Use assetService and tokenService together
   */
  getAssetWithTokens(assetId: string): { asset: Asset; tokens: Token[] } | null {
    const asset = this.getAssetById(assetId);
    if (!asset) return null;
    
    const tokens = this.getTokensByAssetId(assetId);
    return { asset, tokens };
  }

  /**
   * @deprecated Use tokenService.getTokenSupply() instead
   */
  getTokenSupply(contractAddress: string) {
    let supply: any = null;
    this.tokenService.getTokenSupply(contractAddress).then(result => {
      supply = result;
    });
    return supply;
  }

  /**
   * @deprecated Use tokenService.getTokenPayoutHistory() instead
   */
  getTokenPayoutHistory(contractAddress: string) {
    let history: any = null;
    this.tokenService.getTokenPayoutHistory(contractAddress).then(result => {
      history = { recentPayouts: result };
    });
    return history;
  }

  /**
   * @deprecated Use configuration system instead
   */
  getMarketData(): any {
    return {
      defaultGrowthRate: 2.8
    };
  }

  /**
   * @deprecated Use assetService.getAssetStats() and tokenService.getTokenStats() instead
   */
  getPlatformStatistics(): any {
    return {
      totalAssets: 0,
      totalHolders: 0,
      totalPayouts: 0
    };
  }

  /**
   * @deprecated Use assetService.getAssetStats() and tokenService.getTokenStats() instead
   */
  getPlatformStats(): any {
    return this.getPlatformStatistics();
  }

  /**
   * @deprecated Use configuration system instead
   */
  getPlatformFees(): any {
    return {
      transactionFee: 0.02 // 2% default fee
    };
  }

  /**
   * @deprecated Business logic should be in services or composables
   */
  getEstimatedTokenValue(assetId: string): number {
    return 100; // Default value
  }

  /**
   * @deprecated Business logic should be in services or composables
   */
  getCalculatedRemainingProduction(assetId: string): string {
    return "N/A";
  }

  /**
   * @deprecated Business logic should be in services or composables
   */
  getCalculatedTokenReturns(contractAddress: string): any {
    return {
      monthlyReturn: 0,
      yearlyReturn: 0,
      totalReturn: 0
    };
  }
}

// Export singleton instance
const dataStoreService = new LegacyDataStoreService();
export default dataStoreService;

// Also export as named export for new imports
export { dataStoreService };