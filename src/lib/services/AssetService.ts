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
    // Initialize asset metadata map
    this.assetMetadataMap = {
      'bak-hf1': bakHf1Metadata as AssetData,
      'bak-hf2': bakHf2Metadata as AssetData,
      'eur-wr1': eurWr1Metadata as AssetData,
      'eur-wr2': eurWr2Metadata as AssetData,
      'eur-wr3': eurWr3Metadata as AssetData,
      'gom-dw1': gomDw1Metadata as AssetData,
      'per-bv1': perBv1Metadata as AssetData,
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
    return asset.monthlyReports.reduce((latest, current) => {
      const latestDate = new Date(latest.month + '-01');
      const currentDate = new Date(current.month + '-01');
      return currentDate > latestDate ? current : latest;
    });
  }

  /**
   * Calculate average monthly revenue for an asset
   */
  getAverageMonthlyRevenue(assetId: string): number {
    const asset = this.getAssetById(assetId);
    if (!asset?.monthlyReports || asset.monthlyReports.length === 0) {
      return 0;
    }

    const totalRevenue = asset.monthlyReports.reduce((sum, report) => 
      sum + (report.revenue ?? 0), 0
    );

    return totalRevenue / asset.monthlyReports.length;
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