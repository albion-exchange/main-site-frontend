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

import type { AssetData, MonthlyData } from "$lib/types/MetaboardTypes";
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
import gomDw1Metadata from "$lib/data/mockTokenMetadata/gom-dw1.json";
import perBv1Metadata from "$lib/data/mockTokenMetadata/per-bv1.json";

interface AssetMetadataMap {
  [tokenAddress: string]: AssetData;
}

class AssetService {
  private assetMetadataMap: AssetMetadataMap;
  private allAssets: Asset[] | null = null;

  constructor() {
    // Initialize asset metadata map - extract and enhance asset data from token metadata
    this.assetMetadataMap = {
      'bak-hf1': this.createAssetData(bakHf1Metadata as any),
      'bak-hf2': this.createAssetData(bakHf2Metadata as any),
      'eur-wr1': this.createAssetData(eurWr1Metadata as any),
      'eur-wr2': this.createAssetData(eurWr2Metadata as any),
      'eur-wr3': this.createAssetData(eurWr3Metadata as any),
      'gom-dw1': this.createAssetData(gomDw1Metadata as any),
      'per-bv1': this.createAssetData(perBv1Metadata as any),
    };
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
      productionHistory: tokenMetadata.productionHistory || [],
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
    if (this.allAssets) {
      return this.allAssets;
    }

    this.allAssets = Object.values(this.assetMetadataMap).map(assetData => 
      TypeTransformations.assetToUI(assetData)
    );

    return this.allAssets;
  }

  /**
   * Get asset by ID
   */
  getAssetById(assetId: string): Asset | null {
    const assets = this.getAllAssets();
    return assets.find(asset => asset.id === assetId) || null;
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
  getLatestMonthlyReport(assetId: string): MonthlyData | null {
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
  getProductionTimeline(assetId: string): MonthlyData[] {
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

  /**
   * Clear cache - useful for testing or data refresh
   */
  clearCache(): void {
    this.allAssets = null;
  }
}

// Export singleton instance
const assetService = new AssetService();
export default assetService;