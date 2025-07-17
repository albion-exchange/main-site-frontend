/**
 * TokenService - Focused on token-specific operations
 * 
 * Responsibilities:
 * - Load and transform token data
 * - Token filtering and searching
 * - Token supply and payout calculations
 * - Token data caching
 * 
 * Dependencies:
 * - CacheService for data caching
 * - TransformService for data transformation
 * 
 * Data Flow:
 * Raw JSON -> Service -> Cache -> UI Types -> Components
 */

import type { TokenMetadata } from '$lib/types/MetaboardTypes';
import { TokenType } from '$lib/types/MetaboardTypes';
import type { Token } from '$lib/types/uiTypes';
import type { AssetTokenMapping } from '$lib/types/sharedTypes';
import { errorHandler } from '$lib/utils/errorHandling';
import { withErrorHandling } from '$lib/utils/errorHandling';

export interface TokenFilters {
  tokenType?: 'royalty' | 'payment';
  assetId?: string;
  isActive?: boolean;
  minSupply?: number;
  maxSupply?: number;
}

export interface TokenSearchOptions {
  query?: string;
  filters?: TokenFilters;
  sortBy?: 'symbol' | 'supply' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface TokenPayoutData {
  month: string;
  totalPayout: number;
  payoutPerToken: number;
  holdersCount: number;
  assetRevenue: number;
  assetExpenses: number;
  netIncome: number;
}

/**
 * TokenService class
 */
export class TokenService {
  private tokensCache: Map<string, Token> = new Map();
  private payoutCache: Map<string, TokenPayoutData[]> = new Map();
  private assetTokenMap: AssetTokenMapping;
  private tokenMetadataMap: Map<string, TokenMetadata> = new Map();
  private tokenToAssetMap: Map<string, string> = new Map();

  constructor(
    assetTokenMapping: AssetTokenMapping,
    tokenMetadataMap: Map<string, TokenMetadata>
  ) {
    this.assetTokenMap = assetTokenMapping;
    this.tokenMetadataMap = tokenMetadataMap;
    this.buildTokenToAssetMap();
  }

  /**
   * Build reverse mapping from token address to asset ID
   */
  private buildTokenToAssetMap(): void {
    Object.entries(this.assetTokenMap.assets).forEach(
      ([assetId, assetInfo]) => {
        assetInfo.tokens.forEach((tokenAddress) => {
          this.tokenToAssetMap.set(tokenAddress, assetId);
        });
      },
    );
  }

  /**
   * Get all tokens with error handling
   */
  async getAllTokens(): Promise<Token[]> {
    const result = await withErrorHandling(
      async () => this.getAllTokensSync(),
      { component: 'TokenService', action: 'getAllTokens' }
    );
    return result || [];
  }

  /**
   * Get all tokens synchronously (internal implementation)
   */
  private getAllTokensSync(): Token[] {
    const tokens: Token[] = [];

    this.tokenMetadataMap.forEach((tokenMetadata) => {
      try {
        const token = this.convertTokenMetadataToToken(tokenMetadata);
        tokens.push(token);
      } catch (error) {
        errorHandler.handle(
          errorHandler.createError.tokenLoadFailed(
            tokenMetadata.contractAddress,
            error as Error
          )
        );
      }
    });

    return tokens;
  }

  /**
   * Get token by contract address
   */
  async getTokenByAddress(contractAddress: string): Promise<Token | null> {
    return withErrorHandling(
      async () => this.getTokenByAddressSync(contractAddress),
      { component: 'TokenService', action: 'getTokenByAddress', tokenAddress: contractAddress }
    );
  }

  /**
   * Get token by address synchronously (internal implementation)
   */
  private getTokenByAddressSync(contractAddress: string): Token | null {
    // Check cache first
    if (this.tokensCache.has(contractAddress)) {
      return this.tokensCache.get(contractAddress)!;
    }

    const tokenMetadata = this.tokenMetadataMap.get(contractAddress);
    if (!tokenMetadata) {
      return null;
    }

    try {
      const token = this.convertTokenMetadataToToken(tokenMetadata);
      this.tokensCache.set(contractAddress, token);
      return token;
    } catch (error) {
      errorHandler.handle(
        errorHandler.createError.tokenLoadFailed(contractAddress, error as Error)
      );
      return null;
    }
  }

  /**
   * Get token by symbol
   */
  async getTokenBySymbol(symbol: string): Promise<Token | null> {
    return withErrorHandling(
      async () => {
        const tokens = await this.getAllTokens();
        return tokens.find(token => token.symbol === symbol) || null;
      },
      { component: 'TokenService', action: 'getTokenBySymbol', symbol }
    );
  }

  /**
   * Get tokens by asset ID
   */
  async getTokensByAssetId(assetId: string): Promise<Token[]> {
    const result = await withErrorHandling(
      async () => {
        const assetInfo = this.assetTokenMap.assets[assetId];
        if (!assetInfo) return [];

        const tokens: Token[] = [];
        for (const address of assetInfo.tokens) {
          const token = await this.getTokenByAddress(address);
          if (token) {
            tokens.push(token);
          }
        }
        return tokens;
      },
      { component: 'TokenService', action: 'getTokensByAssetId', assetId }
    );
    return result || [];
  }

  /**
   * Get tokens by type
   */
  async getTokensByType(tokenType: 'royalty' | 'payment'): Promise<Token[]> {
    const result = await withErrorHandling(
      async () => {
        const tokens = await this.getAllTokens();
        return tokens.filter(token => token.tokenType === tokenType);
      },
      { component: 'TokenService', action: 'getTokensByType', tokenType }
    );
    return result || [];
  }

  /**
   * Search and filter tokens
   */
  async searchTokens(options: TokenSearchOptions = {}): Promise<Token[]> {
    const result = await withErrorHandling(
      async () => this.searchTokensSync(options),
      { component: 'TokenService', action: 'searchTokens', options }
    );
    return result || [];
  }

  /**
   * Search tokens synchronously (internal implementation)
   */
  private async searchTokensSync(options: TokenSearchOptions): Promise<Token[]> {
    let tokens = await this.getAllTokens();

    // Apply text search
    if (options.query) {
      const searchTerm = options.query.toLowerCase();
      tokens = tokens.filter(
        (token) =>
          token.name.toLowerCase().includes(searchTerm) ||
          token.symbol.toLowerCase().includes(searchTerm) ||
          token.assetId.toLowerCase().includes(searchTerm)
      );
    }

    // Apply filters
    if (options.filters) {
      const { tokenType, assetId, isActive, minSupply, maxSupply } = options.filters;

      if (tokenType) {
        tokens = tokens.filter((token) => token.tokenType === tokenType);
      }

      if (assetId) {
        tokens = tokens.filter((token) => token.assetId === assetId);
      }

      if (isActive !== undefined) {
        tokens = tokens.filter((token) => token.isActive === isActive);
      }

      if (minSupply !== undefined || maxSupply !== undefined) {
        tokens = tokens.filter((token) => {
          const supply = parseInt(token.supply.mintedSupply);
          if (minSupply !== undefined && supply < minSupply) {
            return false;
          }
          if (maxSupply !== undefined && supply > maxSupply) {
            return false;
          }
          return true;
        });
      }
    }

    // Apply sorting
    if (options.sortBy) {
      tokens.sort((a, b) => {
        let comparison = 0;
        
        switch (options.sortBy) {
          case 'symbol':
            comparison = a.symbol.localeCompare(b.symbol);
            break;
          case 'supply':
            comparison = parseInt(a.supply.mintedSupply) - parseInt(b.supply.mintedSupply);
            break;
          case 'updatedAt':
            // Note: Token doesn't have updatedAt, we'd need to get it from metadata
            comparison = 0;
            break;
        }

        return options.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Apply pagination
    if (options.offset !== undefined || options.limit !== undefined) {
      const start = options.offset || 0;
      const end = options.limit ? start + options.limit : undefined;
      tokens = tokens.slice(start, end);
    }

    return tokens;
  }

  /**
   * Get active trading tokens only
   */
  async getActiveTokens(): Promise<Token[]> {
    return this.searchTokens({ filters: { isActive: true } });
  }

  /**
   * Get royalty tokens (excludes payment tokens)
   */
  async getRoyaltyTokens(): Promise<Token[]> {
    return this.getTokensByType('royalty');
  }

  /**
   * Get payment tokens only
   */
  async getPaymentTokens(): Promise<Token[]> {
    return this.getTokensByType('payment');
  }

  /**
   * Get selectable tokens (available for purchase)
   */
  async getSelectableTokens(): Promise<Token[]> {
    return this.getActiveTokens();
  }

  /**
   * Get token supply information
   */
  async getTokenSupply(contractAddress: string): Promise<{
    maxSupply: number;
    mintedSupply: number;
    availableSupply: number;
    supplyPercentage: number;
  } | null> {
    return withErrorHandling(
      async () => {
        const token = await this.getTokenByAddress(contractAddress);
        if (!token) return null;

        const maxSupply = parseInt(token.supply.maxSupply);
        const mintedSupply = parseInt(token.supply.mintedSupply);
        const availableSupply = maxSupply - mintedSupply;
        const supplyPercentage = (mintedSupply / maxSupply) * 100;

        return {
          maxSupply,
          mintedSupply,
          availableSupply,
          supplyPercentage
        };
      },
      { component: 'TokenService', action: 'getTokenSupply', tokenAddress: contractAddress }
    );
  }

  /**
   * Get token payout history
   */
  async getTokenPayoutHistory(contractAddress: string): Promise<TokenPayoutData[]> {
    const result = await withErrorHandling(
      async () => {
        // Check cache first
        if (this.payoutCache.has(contractAddress)) {
          return this.payoutCache.get(contractAddress)!;
        }

        const tokenMetadata = this.tokenMetadataMap.get(contractAddress);
        if (!tokenMetadata) return [];

        const payoutData: TokenPayoutData[] = tokenMetadata.monthlyData.map(data => ({
          month: data.month,
          totalPayout: data.tokenPayout.totalPayout,
          payoutPerToken: data.tokenPayout.payoutPerToken,
          holdersCount: 0, // Not available in current data structure
          assetRevenue: data.assetData.revenue,
          assetExpenses: data.assetData.expenses,
          netIncome: data.assetData.netIncome
        }));

        // Cache the result
        this.payoutCache.set(contractAddress, payoutData);
        return payoutData;
      },
      { component: 'TokenService', action: 'getTokenPayoutHistory', tokenAddress: contractAddress }
    );
    return result || [];
  }

  /**
   * Get token statistics
   */
  async getTokenStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    totalSupply: number;
    totalMinted: number;
    averagePayoutPerToken: number;
  }> {
    const result = await withErrorHandling(
      async () => {
        const tokens = await this.getAllTokens();
        
        const stats = {
          total: tokens.length,
          byType: {} as Record<string, number>,
          totalSupply: 0,
          totalMinted: 0,
          averagePayoutPerToken: 0
        };

        let totalPayouts = 0;
        let payoutCount = 0;

        tokens.forEach(token => {
          // Count by type
          const type = token.tokenType;
          stats.byType[type] = (stats.byType[type] || 0) + 1;

          // Sum supplies
          stats.totalSupply += parseInt(token.supply.maxSupply);
          stats.totalMinted += parseInt(token.supply.mintedSupply);

          // Calculate average payout (would need historical data)
          // This is a simplified calculation
          if (token.payoutHistory && token.payoutHistory.length > 0) {
            const latestPayout = token.payoutHistory[token.payoutHistory.length - 1];
            if (latestPayout.payoutPerToken) {
              totalPayouts += latestPayout.payoutPerToken;
              payoutCount++;
            }
          }
        });

        if (payoutCount > 0) {
          stats.averagePayoutPerToken = totalPayouts / payoutCount;
        }

        return stats;
      },
      { component: 'TokenService', action: 'getTokenStats' }
    );
    
    return result || {
      total: 0,
      byType: {},
      totalSupply: 0,
      totalMinted: 0,
      averagePayoutPerToken: 0
    };
  }

  /**
   * Get asset ID from token address
   */
  getAssetIdFromTokenAddress(tokenAddress: string): string | undefined {
    return this.tokenToAssetMap.get(tokenAddress);
  }

  /**
   * Clear caches (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.tokensCache.clear();
    this.payoutCache.clear();
  }

  /**
   * Convert TokenMetadata to Token (internal transformation)
   */
  private convertTokenMetadataToToken(tokenMetadata: TokenMetadata): Token {
    // Check cache first
    if (this.tokensCache.has(tokenMetadata.contractAddress)) {
      return this.tokensCache.get(tokenMetadata.contractAddress)!;
    }

    const token: Token = {
      contractAddress: tokenMetadata.contractAddress,
      name: tokenMetadata.releaseName,
      symbol: tokenMetadata.symbol,
      decimals: tokenMetadata.decimals,
      tokenType:
        tokenMetadata.tokenType === TokenType.Royalty ? "royalty" : "payment",
      assetId: tokenMetadata.assetId,
      isActive: true, // All tokens are active in the current system
      supply: {
        maxSupply: tokenMetadata.supply.maxSupply,
        mintedSupply: tokenMetadata.supply.mintedSupply,
      },
      holders: [], // Not included in merged token format
      payoutHistory: tokenMetadata.monthlyData.map((data) => ({
        month: data.month,
        date: data.tokenPayout.date.split('T')[0] as any, // Convert from datetime to date-only
        totalPayout: data.tokenPayout.totalPayout,
        payoutPerToken: data.tokenPayout.payoutPerToken,
        holdersCount: 0, // Not available in current data structure
        assetRevenue: data.assetData.revenue,
        assetExpenses: data.assetData.expenses,
        netIncome: data.assetData.netIncome,
        oilPrice: data.realisedPrice.oilPrice,
        gasPrice: data.realisedPrice.gasPrice,
        productionVolume: data.assetData.production,
        txHash: data.tokenPayout.txHash
      })),
      metadata: {
        createdAt: tokenMetadata.metadata.createdAt,
        updatedAt: tokenMetadata.metadata.updatedAt,
      },
    };

    this.tokensCache.set(tokenMetadata.contractAddress, token);
    return token;
  }
}