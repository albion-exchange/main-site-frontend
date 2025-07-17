/**
 * DataStoreService - Thin facade over focused data repositories
 */

import type { Asset, Token, MarketData } from "$lib/types/uiTypes";
import type { TokenReturns } from "$lib/utils/returnCalculations";
import { MetadataLoader } from "$lib/data/MetadataLoader";
import { AssetRepository } from "./AssetRepository";
import { TokenRepository } from "./TokenRepository";
import { MarketDataProvider } from "./MarketDataProvider";

class DataStoreService {
  private assetRepository: AssetRepository;
  private tokenRepository: TokenRepository;

  constructor() {
    const assetTokenMap = MetadataLoader.loadAssetTokenMapping();
    const assetMetadata = MetadataLoader.loadAllTokenMetadata();
    const tokenToAssetMap = MetadataLoader.buildTokenToAssetMap(assetTokenMap);

    this.assetRepository = new AssetRepository(assetMetadata);
    this.tokenRepository = new TokenRepository(assetMetadata, tokenToAssetMap);
  }

  // Asset Methods - delegate to AssetRepository
  getAllAssets(): Asset[] {
    return this.assetRepository.getAllAssets();
  }

  getAssetById(assetId: string): Asset | undefined {
    return this.assetRepository.getAssetById(assetId);
  }

  getAssetsByStatus(status: "funding" | "producing" | "completed"): Asset[] {
    return this.assetRepository.getAssetsByStatus(status);
  }

  getAssetsByLocation(location: string): Asset[] {
    return this.assetRepository.getAssetsByLocation(location);
  }

  searchAssets(query: string): Asset[] {
    return this.assetRepository.searchAssets(query);
  }

  // Token Methods - delegate to TokenRepository
  getAllTokens(): Token[] {
    return this.tokenRepository.getAllTokens();
  }

  getTokenByAddress(contractAddress: string): Token | undefined {
    return this.tokenRepository.getTokenByAddress(contractAddress);
  }

  getTokensByAsset(assetId: string): Token[] {
    return this.tokenRepository.getTokensByAsset(assetId);
  }

  getTokensByType(tokenType: "royalty" | "payment"): Token[] {
    return this.tokenRepository.getTokensByType(tokenType);
  }

  getActiveTokens(): Token[] {
    return this.tokenRepository.getActiveTokens();
  }

  getRoyaltyTokens(): Token[] {
    return this.tokenRepository.getRoyaltyTokens();
  }

  getPaymentTokens(): Token[] {
    return this.tokenRepository.getPaymentTokens();
  }

  getTokenReturns(contractAddress: string): TokenReturns | null {
    return this.tokenRepository.getTokenReturns(contractAddress);
  }

  getAssetIdFromToken(contractAddress: string): string | undefined {
    return this.tokenRepository.getAssetIdFromToken(contractAddress);
  }

  // Market Data Methods - delegate to MarketDataProvider
  getMarketData(): MarketData {
    return MarketDataProvider.getMarketData();
  }

  getPlatformStatistics() {
    return MarketDataProvider.getPlatformStatistics();
  }

  getCompanyInfo() {
    return MarketDataProvider.getCompanyInfo();
  }
}

// Create singleton instance
export const dataStoreService = new DataStoreService();
export default DataStoreService;
