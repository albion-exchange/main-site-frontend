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
import assetService from "./AssetService";

// Import configuration data
import assetTokenMapping from "$lib/data/assetTokenMapping.json";

// Import all mock token metadata
import bakHf1Metadata from "$lib/data/mockTokenMetadata/bak-hf1.json";
import bakHf2Metadata from "$lib/data/mockTokenMetadata/bak-hf2.json";
import eurWr1Metadata from "$lib/data/mockTokenMetadata/eur-wr1.json";
import eurWr2Metadata from "$lib/data/mockTokenMetadata/eur-wr2.json";
import eurWr3Metadata from "$lib/data/mockTokenMetadata/eur-wr3.json";
import eurWrLegacyMetadata from "$lib/data/mockTokenMetadata/eur-wr-legacy.json";
import gomDw1Metadata from "$lib/data/mockTokenMetadata/gom-dw1.json";
import perBv1Metadata from "$lib/data/mockTokenMetadata/per-bv1.json";

interface TokenMetadataMap {
  [tokenAddress: string]: TokenMetadata;
}

class TokenService {
  private tokenMetadataMap: TokenMetadataMap;
  private allTokens: Token[] | null = null;
  private assetTokenMapping: AssetTokenMapping;

  constructor() {
    // Initialize token metadata map using contract addresses as keys
    this.tokenMetadataMap = {};
    
    // Map each token metadata by its contract address
    const tokenMetadataList = [
      bakHf1Metadata,
      bakHf2Metadata,
      eurWr1Metadata,
      eurWr2Metadata,
      eurWr3Metadata,
      eurWrLegacyMetadata,
      gomDw1Metadata,
      perBv1Metadata,
    ];
    
    tokenMetadataList.forEach(metadata => {
      this.tokenMetadataMap[metadata.contractAddress] = metadata;
    });

    this.assetTokenMapping = assetTokenMapping as AssetTokenMapping;
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
    const assetInfo = this.assetTokenMapping.assets[assetId];
    if (!assetInfo) {
      return [];
    }

    return assetInfo.tokens
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
    for (const [assetId, assetInfo] of Object.entries(this.assetTokenMapping.assets)) {
      if (assetInfo.tokens.includes(tokenAddress)) {
        return assetId;
      }
    }
    return null;
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
    return tokens.filter(token => token.tokenType === tokenType);
  }

  /**
   * Get available tokens (not sold out)
   */
  getAvailableTokens(): Token[] {
    const tokens = this.getAllTokens();
    return tokens.filter(token => 
      token.isActive && token.supply && 
      (BigInt(token.supply.maxSupply) - BigInt(token.supply.mintedSupply)) > 0n
    );
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
      token.symbol?.toLowerCase().includes(lowercaseQuery)
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

    const maxSupply = BigInt(token.supply.maxSupply);
    const mintedSupply = BigInt(token.supply.mintedSupply);
    const availableSupply = maxSupply - mintedSupply;
    
    const total = Number(maxSupply) / Math.pow(10, token.decimals);
    const available = Number(availableSupply) / Math.pow(10, token.decimals);
    const sold = Number(mintedSupply) / Math.pow(10, token.decimals);
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
    if (!token || !token.supply) {
      return false;
    }

    const availableSupply = BigInt(token.supply.maxSupply) - BigInt(token.supply.mintedSupply);
    return token.isActive && availableSupply > 0n;
  }

  /**
   * Get token payout history
   */
  getTokenPayoutHistory(tokenAddress: string): { recentPayouts: any[] } | null {
    const token = this.getTokenByAddress(tokenAddress);
    if (!token || !token.payoutHistory) {
      return null;
    }
    
    return {
      recentPayouts: token.payoutHistory.map(payout => ({
        month: payout.month,
        totalPayout: payout.totalPayout,
        payoutPerToken: payout.payoutPerToken
      }))
    };
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