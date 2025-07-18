/**
 * @fileoverview Token Service
 * Handles token-related data operations and business logic
 * 
 * Responsibilities:
 * - Load and manage token data
 * - Token-specific transformations
 * - Token-related calculations
 * 
 * Dependencies:
 * - AssetService for asset data
 * - TransformService for data transformation
 */

import type { TokenMetadata } from "$lib/types/MetaboardTypes";
import type { Token } from "$lib/types/uiTypes";
import { TypeTransformations } from "$lib/types/transformations";
import type { AssetTokenMapping } from "$lib/types/sharedTypes";
import {
  getTokenReturns,
  type TokenReturns,
} from "$lib/utils/returnCalculations";

// Import configuration data
import assetTokenMapping from "$lib/data/assetTokenMapping.json";

// Import all mock token metadata
import bakHf1Metadata from "$lib/data/mockTokenMetadata/bak-hf1.json";
import bakHf2Metadata from "$lib/data/mockTokenMetadata/bak-hf2.json";
import eurWr1Metadata from "$lib/data/mockTokenMetadata/eur-wr1.json";
import eurWr2Metadata from "$lib/data/mockTokenMetadata/eur-wr2.json";
import eurWr3Metadata from "$lib/data/mockTokenMetadata/eur-wr3.json";
import gomDw1Metadata from "$lib/data/mockTokenMetadata/gom-dw1.json";
import perBv1Metadata from "$lib/data/mockTokenMetadata/per-bv1.json";

interface TokenMetadataMap {
  [tokenAddress: string]: TokenMetadata;
}

class TokenService {
  private tokenMetadataMap: TokenMetadataMap;
  private allTokens: Token[] | null = null;
  private assetTokenMap: AssetTokenMapping[];

  constructor() {
    // Initialize token metadata map
    this.tokenMetadataMap = {
      'bak-hf1': bakHf1Metadata as TokenMetadata,
      'bak-hf2': bakHf2Metadata as TokenMetadata,
      'eur-wr1': eurWr1Metadata as TokenMetadata,
      'eur-wr2': eurWr2Metadata as TokenMetadata,
      'eur-wr3': eurWr3Metadata as TokenMetadata,
      'gom-dw1': gomDw1Metadata as TokenMetadata,
      'per-bv1': perBv1Metadata as TokenMetadata,
    };

    this.assetTokenMap = assetTokenMapping as AssetTokenMapping[];
  }

  /**
   * Get all tokens in UI format
   */
  getAllTokens(): Token[] {
    if (this.allTokens) {
      return this.allTokens;
    }

    this.allTokens = Object.values(this.tokenMetadataMap).map(tokenData => 
      TypeTransformations.tokenToUI(tokenData)
    );

    return this.allTokens;
  }

  /**
   * Get token by address
   */
  getTokenByAddress(tokenAddress: string): Token | null {
    const tokenMetadata = this.tokenMetadataMap[tokenAddress];
    if (!tokenMetadata) {
      return null;
    }

    return TypeTransformations.tokenToUI(tokenMetadata);
  }

  /**
   * Get tokens by asset ID
   */
  getTokensByAssetId(assetId: string): Token[] {
    const mapping = this.assetTokenMap.find(m => m.assetId === assetId);
    if (!mapping) {
      return [];
    }

    return mapping.tokenAddresses
      .map(address => this.getTokenByAddress(address))
      .filter((token): token is Token => token !== null);
  }

  /**
   * Get token metadata by address
   */
  getTokenMetadata(tokenAddress: string): TokenMetadata | null {
    return this.tokenMetadataMap[tokenAddress] || null;
  }

  /**
   * Get asset ID for a token
   */
  getAssetIdForToken(tokenAddress: string): string | null {
    const mapping = this.assetTokenMap.find(m => 
      m.tokenAddresses.includes(tokenAddress)
    );
    return mapping?.assetId || null;
  }

  /**
   * Calculate token returns
   */
  getTokenReturns(tokenAddress: string): TokenReturns | null {
    const token = this.getTokenByAddress(tokenAddress);
    if (!token) {
      return null;
    }

    // Get associated asset for calculations
    const assetId = this.getAssetIdForToken(tokenAddress);
    if (!assetId) {
      return null;
    }

    // Import AssetService here to avoid circular dependencies
    const assetService = require('./AssetService').default;
    const asset = assetService.getAssetById(assetId);
    if (!asset) {
      return null;
    }

    return getTokenReturns(asset, token);
  }

  /**
   * Get tokens by type
   */
  getTokensByType(tokenType: string): Token[] {
    const tokens = this.getAllTokens();
    return tokens.filter(token => token.type === tokenType);
  }

  /**
   * Get available tokens (not sold out)
   */
  getAvailableTokens(): Token[] {
    const tokens = this.getAllTokens();
    return tokens.filter(token => 
      !token.soldOut && token.supply && token.supply.available > 0
    );
  }

  /**
   * Get tokens by price range
   */
  getTokensByPriceRange(minPrice: number, maxPrice: number): Token[] {
    const tokens = this.getAllTokens();
    return tokens.filter(token => {
      const price = token.price || 0;
      return price >= minPrice && price <= maxPrice;
    });
  }

  /**
   * Search tokens by name or symbol
   */
  searchTokens(query: string): Token[] {
    if (!query.trim()) {
      return this.getAllTokens();
    }

    const lowercaseQuery = query.toLowerCase();
    const tokens = this.getAllTokens();

    return tokens.filter(token => 
      token.name?.toLowerCase().includes(lowercaseQuery) ||
      token.symbol?.toLowerCase().includes(lowercaseQuery) ||
      token.description?.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get token supply information
   */
  getTokenSupply(tokenAddress: string): {
    total: number;
    available: number;
    sold: number;
    percentageSold: number;
  } | null {
    const token = this.getTokenByAddress(tokenAddress);
    if (!token?.supply) {
      return null;
    }

    const total = token.supply.total;
    const available = token.supply.available;
    const sold = total - available;
    const percentageSold = total > 0 ? (sold / total) * 100 : 0;

    return {
      total,
      available,
      sold,
      percentageSold
    };
  }

  /**
   * Check if token is available for purchase
   */
  isTokenAvailable(tokenAddress: string): boolean {
    const token = this.getTokenByAddress(tokenAddress);
    if (!token) {
      return false;
    }

    return !token.soldOut && (token.supply?.available || 0) > 0;
  }

  /**
   * Get token payout history
   */
  getTokenPayoutHistory(tokenAddress: string): any[] {
    const tokenMetadata = this.getTokenMetadata(tokenAddress);
    return tokenMetadata?.payouts || [];
  }

  /**
   * Clear cache - useful for testing or data refresh
   */
  clearCache(): void {
    this.allTokens = null;
  }
}

// Export singleton instance
const tokenService = new TokenService();
export default tokenService;