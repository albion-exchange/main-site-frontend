/**
 * MetadataLoader - Handles loading and converting token metadata
 */

import type { TokenMetadata, MonthlyData, AssetData } from "$lib/types/MetaboardTypes";
import type { AssetTokenMapping } from "$lib/types/sharedTypes";

// Import configuration data
import assetTokenMapping from "$lib/data/assetTokenMapping.json";

// Import all mock token metadata
import bakHf1Metadata from "$lib/data/mockTokenMetadata/bak-hf1.json";
import bakHf2Metadata from "$lib/data/mockTokenMetadata/bak-hf2.json";
import eurWr1Metadata from "$lib/data/mockTokenMetadata/eur-wr1.json";
import eurWr2Metadata from "$lib/data/mockTokenMetadata/eur-wr2.json";
import eurWr3Metadata from "$lib/data/mockTokenMetadata/eur-wr3.json";
import perBv1Metadata from "$lib/data/mockTokenMetadata/per-bv1.json";
import gomDw1Metadata from "$lib/data/mockTokenMetadata/gom-dw1.json";
import eurWrLegacyMetadata from "$lib/data/mockTokenMetadata/eur-wr-legacy.json";

const ALL_TOKEN_METADATA = [
  bakHf1Metadata, bakHf2Metadata, eurWr1Metadata, eurWr2Metadata,
  eurWr3Metadata, perBv1Metadata, gomDw1Metadata, eurWrLegacyMetadata
] as const;

export class MetadataLoader {
  static loadAssetTokenMapping(): AssetTokenMapping {
    return assetTokenMapping as AssetTokenMapping;
  }

  static loadAllTokenMetadata(): Record<string, TokenMetadata> {
    const metadata: Record<string, TokenMetadata> = {};
    ALL_TOKEN_METADATA.forEach(rawMetadata => {
      const converted = this.convertJsonToTokenMetadata(rawMetadata as any);
      metadata[converted.contractAddress] = converted;
    });
    return metadata;
  }

  static buildTokenToAssetMap(assetTokenMap: AssetTokenMapping): Map<string, string> {
    const tokenToAssetMap = new Map<string, string>();
    Object.entries(assetTokenMap.assets).forEach(([assetId, assetInfo]) => {
      assetInfo.tokens.forEach((tokenAddress) => {
        tokenToAssetMap.set(tokenAddress, assetId);
      });
    });
    return tokenToAssetMap;
  }

  private static convertJsonToTokenMetadata(jsonData: any): TokenMetadata {
    return {
      contractAddress: jsonData.contractAddress,
      assetId: jsonData.assetId,
      symbol: jsonData.symbol,
      releaseName: jsonData.releaseName,
      tokenType: jsonData.tokenType,
      firstPaymentDate: jsonData.firstPaymentDate,
      sharePercentage: jsonData.sharePercentage,
      decimals: jsonData.decimals,
      supply: jsonData.supply,
      monthlyData: jsonData.monthlyData,
      metadata: jsonData.metadata,
      asset: {
        ...jsonData.asset,
        assetName: jsonData.assetName,
        documents: jsonData.documents,
        coverImage: jsonData.coverImage,
      },
    };
  }
}