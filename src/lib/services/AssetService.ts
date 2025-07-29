/**
 * @fileoverview Asset Service
 * Handles asset-related data operations and business logic
 *
 * Responsibilities:
 * - Load and manage asset data from IPFS
 * - Asset-specific transformations
 * - Asset-related calculations
 *
 * Dependencies:
 * - Stores for IPFS data
 * - TransformService for data transformation
 */

import type { AssetData, ReceiptsData } from "$lib/types/MetaboardTypes";
import type { Asset } from "$lib/types/uiTypes";
import { TypeTransformations } from "$lib/types/transformations";
import type { ISODateOnlyString } from "$lib/types/sharedTypes";
import { arrayUtils } from "$lib/utils/arrayHelpers";
import { get } from "svelte/store";
import { sfts, sftMetadata } from "$lib/stores";
import { decodeSftInformation } from "$lib/decodeMetadata/helpers";
import { generateAssetInstanceFromSftMeta } from "$lib/decodeMetadata/addSchemaToReceipts";

interface AssetMetadataMap {
  [assetId: string]: Asset;
}

class AssetService {
  private assetCache: AssetMetadataMap = {};
  private allAssets: Asset[] | null = null;

  constructor() {
    // Service now loads data dynamically from stores
  }

  /**
   * Load assets from IPFS data in stores
   */
  private loadAssetsFromStores(): Asset[] {
    const $sfts = get(sfts);
    const $sftMetadata = get(sftMetadata);
    
    if (!$sfts || $sfts.length === 0 || !$sftMetadata) {
      return [];
    }

    const assets: Asset[] = [];
    const decodedMeta = $sftMetadata.map((metaV1) => decodeSftInformation(metaV1));
    
    for (const sft of $sfts) {
      const pinnedMetadata = decodedMeta.find(
        (meta) => meta?.contractAddress === `0x000000000000000000000000${sft.id.slice(2)}`
      );
      
      if (pinnedMetadata && pinnedMetadata.asset) {
        const assetInstance = generateAssetInstanceFromSftMeta(sft, pinnedMetadata);
        assets.push(assetInstance);
        // Cache by asset ID
        this.assetCache[assetInstance.id] = assetInstance;
      }
    }
    
    return assets;
  }

  /**
   * Get all assets in UI format
   */
  getAllAssets(): Asset[] {
    // Always reload from stores to get latest data
    this.allAssets = this.loadAssetsFromStores();
    return this.allAssets;
  }

  /**
   * Clear cache - useful for development
   */
  clearCache() {
    this.allAssets = null;
    this.assetCache = {};
  }

  /**
   * Get asset by ID
   */
  getAssetById(assetId: string): Asset | null {
    // First check cache
    if (this.assetCache[assetId]) {
      return this.assetCache[assetId];
    }
    
    // Reload from stores if not in cache
    this.loadAssetsFromStores();
    
    const asset = this.assetCache[assetId];
    if (!asset) {
      console.warn(`Asset with ID ${assetId} not found`);
      return null;
    }

    return asset;
  }

  /**
   * Get assets by IDs
   */
  getAssetsByIds(assetIds: string[]): Asset[] {
    return assetIds
      .map((id) => this.getAssetById(id))
      .filter((asset): asset is Asset => asset !== null);
  }

  /**
   * Get asset by token address
   */
  getAssetByTokenAddress(tokenAddress: string): Asset | null {
    if (!this.allAssets) {
      this.getAllAssets();
    }

    const asset = this.allAssets?.find((a) =>
      a.tokenContracts.some(
        (addr) => addr.toLowerCase() === tokenAddress.toLowerCase(),
      ),
    );

    return asset || null;
  }

  /**
   * Get assets by production status
   */
  getAssetsByStatus(status: string): Asset[] {
    const assets = this.getAllAssets();
    return assets.filter((asset) => asset.production?.status === status);
  }

  /**
   * Get assets by location
   */
  getAssetsByLocation(country: string, state?: string): Asset[] {
    const assets = this.getAllAssets();
    return assets.filter((asset) => {
      if (state) {
        return (
          asset.location?.country === country && asset.location?.state === state
        );
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
    return arrayUtils.latest(
      asset.monthlyReports,
      (report) => report.month + "-01",
    );
  }

  /**
   * Calculate average monthly revenue for an asset
   */
  getAverageMonthlyRevenue(assetId: string): number {
    const asset = this.getAssetById(assetId);
    if (!asset?.monthlyReports || asset.monthlyReports.length === 0) {
      return 0;
    }

    return arrayUtils.average(
      asset.monthlyReports,
      (report) => report.revenue ?? 0,
    );
  }

  /**
   * Get production timeline for an asset
   */
  getProductionTimeline(assetId: string): ReceiptsData[] {
    const asset = this.getAssetById(assetId);
    if (!asset?.monthlyReports) {
      return [];
    }

    return [...asset.monthlyReports].sort((a, b) =>
      a.month.localeCompare(b.month),
    );
  }

  /**
   * Get cumulative production stats
   */
  getCumulativeProduction(assetId: string): {
    totalProduction: number;
    totalRevenue: number;
    monthCount: number;
  } {
    const asset = this.getAssetById(assetId);
    if (!asset?.monthlyReports || asset.monthlyReports.length === 0) {
      return {
        totalProduction: 0,
        totalRevenue: 0,
        monthCount: 0,
      };
    }

    const totalProduction = asset.monthlyReports.reduce(
      (sum, report) => sum + (report.production ?? 0),
      0,
    );

    const totalRevenue = asset.monthlyReports.reduce(
      (sum, report) => sum + (report.revenue ?? 0),
      0,
    );

    return {
      totalProduction,
      totalRevenue,
      monthCount: asset.monthlyReports.length,
    };
  }

  /**
   * Get asset performance metrics
   */
  getAssetPerformance(assetId: string): {
    averageMonthlyRevenue: number;
    productionTrend: "up" | "down" | "stable";
    lastMonthRevenue: number;
  } {
    const asset = this.getAssetById(assetId);
    if (!asset?.monthlyReports || asset.monthlyReports.length === 0) {
      return {
        averageMonthlyRevenue: 0,
        productionTrend: "stable",
        lastMonthRevenue: 0,
      };
    }

    const avgRevenue = this.getAverageMonthlyRevenue(assetId);

    // Get last two months for trend
    const sortedReports = [...asset.monthlyReports].sort((a, b) =>
      b.month.localeCompare(a.month),
    );

    const lastMonth = sortedReports[0];
    const previousMonth = sortedReports[1];

    let trend: "up" | "down" | "stable" = "stable";
    if (lastMonth && previousMonth) {
      const lastRevenue = lastMonth.revenue ?? 0;
      const prevRevenue = previousMonth.revenue ?? 0;
      if (lastRevenue > prevRevenue * 1.05) trend = "up";
      else if (lastRevenue < prevRevenue * 0.95) trend = "down";
    }

    return {
      averageMonthlyRevenue: avgRevenue,
      productionTrend: trend,
      lastMonthRevenue: lastMonth?.revenue ?? 0,
    };
  }

  /**
   * Search assets by query
   */
  searchAssets(query: string): Asset[] {
    const assets = this.getAllAssets();
    const lowerQuery = query.toLowerCase();

    return assets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(lowerQuery) ||
        asset.location?.state?.toLowerCase().includes(lowerQuery) ||
        asset.location?.country?.toLowerCase().includes(lowerQuery) ||
        asset.operator?.name?.toLowerCase().includes(lowerQuery),
    );
  }
}

// Export singleton instance
const assetService = new AssetService();
export default assetService;