/**
 * @fileoverview Asset Service
 * Handles asset-related data operations and business logic
 * 
 * Responsibilities:
 * - Load and manage asset data
 * - Asset-specific transformations
 * - Asset-related calculations
 * 
 * Dependencies:
 * - CacheService for data caching
 * - TransformService for data transformation
 */

import type { AssetData, ReceiptsData } from "$lib/types/MetaboardTypes";
import type { Asset } from "$lib/types/uiTypes";
import { TypeTransformations } from "$lib/types/transformations";
import type { ISODateOnlyString } from "$lib/types/sharedTypes";
import { arrayUtils } from "$lib/utils/arrayHelpers";

// Import asset metadata
import bakHf1Metadata from "$lib/data/mockTokenMetadata/bak-hf1.json";
import bakHf2Metadata from "$lib/data/mockTokenMetadata/bak-hf2.json";
import eurWr1Metadata from "$lib/data/mockTokenMetadata/eur-wr1.json";
import eurWr2Metadata from "$lib/data/mockTokenMetadata/eur-wr2.json";
import eurWr3Metadata from "$lib/data/mockTokenMetadata/eur-wr3.json";
import eurWrLegacyMetadata from "$lib/data/mockTokenMetadata/eur-wr-legacy.json";
import gomDw1Metadata from "$lib/data/mockTokenMetadata/gom-dw1.json";
import perBv1Metadata from "$lib/data/mockTokenMetadata/per-bv1.json";

interface AssetMetadataMap {
  [tokenAddress: string]: AssetData;
}

class AssetService {
  private assetMetadataMap: AssetMetadataMap;
  private allAssets: Asset[] | null = null;
  private tokensByAsset: Map<string, any[]> = new Map();

  constructor() {
    // Initialize asset metadata map - deduplicate by assetId
    const tokenMetadataList = [
      bakHf1Metadata,
      bakHf2Metadata,
      eurWr1Metadata,
      eurWr2Metadata,
      eurWr3Metadata,
      eurWrLegacyMetadata,
      gomDw1Metadata,
      perBv1Metadata
    ];

    this.assetMetadataMap = {};
    
    // Group tokens by assetId to avoid duplicates
    const assetGroups = new Map<string, any[]>();
    tokenMetadataList.forEach((metadata: any) => {
      const existing = assetGroups.get(metadata.assetId) || [];
      existing.push(metadata);
      assetGroups.set(metadata.assetId, existing);
    });
    
    // Create one asset per unique assetId, aggregating receiptsData from all tokens
    assetGroups.forEach((metadataList, assetId) => {
      // Use the first token's metadata as base
      const baseAssetData = this.createAssetData(metadataList[0]);
      
      // Store token metadata for this asset (including receiptsData)
      this.tokensByAsset.set(assetId, metadataList);
      
      this.assetMetadataMap[assetId] = baseAssetData;
    });
  }

  /**
   * Create AssetData from TokenMetadata by combining asset and parent metadata
   */
  private createAssetData(tokenMetadata: any): AssetData {
    const asset = tokenMetadata.asset;
    return {
      assetName: tokenMetadata.assetName || asset.assetName || 'Unknown Asset',
      description: asset.description || '',
      location: asset.location,
      operator: asset.operator,
      technical: asset.technical,
      assetTerms: asset.assetTerms,
      production: asset.production,
      plannedProduction: asset.plannedProduction || { oilPriceAssumption: 70, oilPriceAssumptionCurrency: 'USD', projections: [] },
      historicalProduction: tokenMetadata.asset?.historicalProduction || [],
      receiptsData: tokenMetadata.asset?.receiptsData || [],
      operationalMetrics: tokenMetadata.operationalMetrics || asset.operationalMetrics || {
        uptime: { percentage: 0, unit: 'percent', period: 'N/A' },
        dailyProduction: { current: 0, target: 0, unit: 'boe' },
        hseMetrics: { incidentFreeDays: 0, lastIncidentDate: new Date().toISOString(), safetyRating: 'Unknown' }
      },
      documents: asset.documents || [],
      coverImage: tokenMetadata.coverImage || asset.coverImage || '',
      galleryImages: tokenMetadata.galleryImages || asset.galleryImages || []
    };
  }

  /**
   * Get all assets in UI format
   */
  getAllAssets(): Asset[] {
    // Always regenerate to avoid stale data during development
    this.allAssets = Object.entries(this.assetMetadataMap).map(([assetId, assetData]) => {
      const receiptsData = this.getReceiptsDataForAsset(assetId);
      const uiAsset = TypeTransformations.assetToUI(assetData, assetId, receiptsData);
      return uiAsset;
    });

    return this.allAssets;
  }
  
  /**
   * Clear cache - useful for development
   */
  clearCache() {
    this.allAssets = null;
  }

  /**
   * Get receiptsData for an asset by aggregating from its tokens
   */
  getReceiptsDataForAsset(assetId: string): any[] {
    const tokens = this.tokensByAsset.get(assetId) || [];
    
    // Get receiptsData from the first token's asset data (should be the same for all tokens of the same asset)
    if (tokens.length > 0 && tokens[0].asset.receiptsData) {
      return tokens[0].asset.receiptsData.sort((a: any, b: any) => a.month.localeCompare(b.month));
    }
    
    return [];
  }

  /**
   * Get asset by ID
   */
  getAssetById(assetId: string): Asset | null {
    // First try direct lookup in metadata map
    const assetData = this.assetMetadataMap[assetId];
    if (assetData) {
      // Get receiptsData from tokens
      const receiptsData = this.getReceiptsDataForAsset(assetId);
      const uiAsset = TypeTransformations.assetToUI(assetData, assetId, receiptsData);
      return uiAsset;
    }
    
    // Fallback to searching through all assets
    const assets = this.getAllAssets();
    const found = assets.find(asset => asset.id === assetId);
    return found || null;
  }

  /**
   * Get assets by IDs
   */
  getAssetsByIds(assetIds: string[]): Asset[] {
    const assets = this.getAllAssets();
    return assets.filter(asset => assetIds.includes(asset.id));
  }

  /**
   * Get asset metadata by token address
   */
  getAssetMetadataByTokenAddress(tokenAddress: string): AssetData | null {
    return this.assetMetadataMap[tokenAddress] || null;
  }

  /**
   * Get assets by production status
   */
  getAssetsByStatus(status: string): Asset[] {
    const assets = this.getAllAssets();
    return assets.filter(asset => asset.production?.status === status);
  }

  /**
   * Get assets by location
   */
  getAssetsByLocation(country: string, state?: string): Asset[] {
    const assets = this.getAllAssets();
    return assets.filter(asset => {
      if (state) {
        return asset.location?.country === country && asset.location?.state === state;
      }
      return asset.location?.country === country;
    });
  }

  /**
   * Get latest monthly report for an asset
   */
  getLatestMonthlyReport(assetId: string): ReceiptsData | null {
    const asset = this.getAssetById(assetId);
    if (!asset?.monthlyReports || asset.monthlyReports.length === 0) {
      return null;
    }

    // Find the most recent report
    return arrayUtils.latest(asset.monthlyReports, report => report.month + '-01');
  }

  /**
   * Calculate average monthly revenue for an asset
   */
  getAverageMonthlyRevenue(assetId: string): number {
    const asset = this.getAssetById(assetId);
    if (!asset?.monthlyReports || asset.monthlyReports.length === 0) {
      return 0;
    }

    return arrayUtils.average(asset.monthlyReports, report => report.revenue ?? 0);
  }

  /**
   * Get production timeline for an asset
   */
  getProductionTimeline(assetId: string): ReceiptsData[] {
    const asset = this.getAssetById(assetId);
    if (!asset?.monthlyReports) {
      return [];
    }

    // Sort by date
    return asset.monthlyReports.sort((a, b) => {
      const dateA = new Date(a.month + '-01');
      const dateB = new Date(b.month + '-01');
      return dateA.getTime() - dateB.getTime();
    });
  }

  /**
   * Search assets by name or description
   */
  searchAssets(query: string): Asset[] {
    if (!query.trim()) {
      return this.getAllAssets();
    }

    const lowercaseQuery = query.toLowerCase();
    const assets = this.getAllAssets();

    return assets.filter(asset => 
      asset.name?.toLowerCase().includes(lowercaseQuery) ||
      asset.description?.toLowerCase().includes(lowercaseQuery) ||
      asset.operator?.name?.toLowerCase().includes(lowercaseQuery) ||
      asset.location?.state?.toLowerCase().includes(lowercaseQuery) ||
      asset.location?.country?.toLowerCase().includes(lowercaseQuery)
    );
  }

}

// Export singleton instance
const assetService = new AssetService();
export default assetService;