/**
 * AssetRepository - Handles asset data operations
 */

import type { Asset } from "$lib/types/uiTypes";
import type { TokenMetadata } from "$lib/types/MetaboardTypes";
import { ProductionStatus } from "$lib/types/MetaboardTypes";
import { DataTransformer } from "./DataTransformer";

export class AssetRepository {
  private assetsCache = new Map<string, Asset>();

  constructor(private assetMetadata: Record<string, TokenMetadata>) {}

  getAllAssets(): Asset[] {
    const uniqueAssetIds = new Set(
      Object.values(this.assetMetadata).map(token => token.assetId)
    );
    
    return Array.from(uniqueAssetIds).map(assetId => this.getAssetById(assetId)!);
  }

  getAssetById(assetId: string): Asset | undefined {
    if (this.assetsCache.has(assetId)) {
      return this.assetsCache.get(assetId)!;
    }

    const tokenMetadata = Object.values(this.assetMetadata)
      .find(token => token.assetId === assetId);

    if (!tokenMetadata) return undefined;

    const asset = DataTransformer.tokenMetadataToAsset(tokenMetadata);
    this.assetsCache.set(assetId, asset);
    return asset;
  }

  getAssetsByStatus(status: "funding" | "producing" | "completed"): Asset[] {
    return this.filterAssets(asset => asset.production.status === status);
  }

  getAssetsByLocation(location: string): Asset[] {
    const lowerLocation = location.toLowerCase();
    return this.filterAssets(asset => 
      asset.location.state.toLowerCase().includes(lowerLocation) ||
      asset.location.country.toLowerCase().includes(lowerLocation)
    );
  }

  searchAssets(query: string): Asset[] {
    const searchTerm = query.toLowerCase();
    return this.filterAssets(asset =>
      asset.name.toLowerCase().includes(searchTerm) ||
      asset.description.toLowerCase().includes(searchTerm)
    );
  }

  private filterAssets(predicate: (asset: Asset) => boolean): Asset[] {
    return this.getAllAssets().filter(predicate);
  }
}