/**
 * TokenRepository - Handles token data operations
 */

import type { Token } from "$lib/types/uiTypes";
import type { TokenMetadata } from "$lib/types/MetaboardTypes";
import { TokenType } from "$lib/types/MetaboardTypes";
import { getTokenReturns, type TokenReturns } from "$lib/utils/returnCalculations";
import { DataTransformer } from "./DataTransformer";

export class TokenRepository {
  private tokensCache = new Map<string, Token>();

  constructor(
    private assetMetadata: Record<string, TokenMetadata>,
    private tokenToAssetMap: Map<string, string>
  ) {}

  getAllTokens(): Token[] {
    return Object.values(this.assetMetadata)
      .map(metadata => DataTransformer.tokenMetadataToToken(metadata));
  }

  getTokenByAddress(contractAddress: string): Token | undefined {
    if (this.tokensCache.has(contractAddress)) {
      return this.tokensCache.get(contractAddress)!;
    }

    const metadata = this.assetMetadata[contractAddress];
    if (!metadata) return undefined;

    const token = DataTransformer.tokenMetadataToToken(metadata);
    this.tokensCache.set(contractAddress, token);
    return token;
  }

  getTokensByAsset(assetId: string): Token[] {
    return Object.values(this.assetMetadata)
      .filter(metadata => metadata.assetId === assetId)
      .map(metadata => DataTransformer.tokenMetadataToToken(metadata));
  }

  getTokensByType(tokenType: "royalty" | "payment"): Token[] {
    const assetMetadataType = tokenType === "royalty" ? TokenType.Royalty : TokenType.WorkingInterest;
    return Object.values(this.assetMetadata)
      .filter(token => token.tokenType === assetMetadataType)
      .map(token => DataTransformer.tokenMetadataToToken(token));
  }

  getActiveTokens(): Token[] {
    return this.getAllTokens(); // All tokens are active in the merged format
  }

  getRoyaltyTokens(): Token[] {
    return this.getTokensByType("royalty");
  }

  getPaymentTokens(): Token[] {
    return this.getTokensByType("payment");
  }

  getTokenReturns(contractAddress: string): TokenReturns | null {
    const metadata = this.assetMetadata[contractAddress];
    if (!metadata) return null;

    return getTokenReturns(metadata.monthlyData);
  }

  getAssetIdFromToken(contractAddress: string): string | undefined {
    return this.tokenToAssetMap.get(contractAddress);
  }
}