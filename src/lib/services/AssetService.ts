/**
 * AssetService - Focused on asset-specific operations
 * 
 * Responsibilities:
 * - Load and transform asset data
 * - Asset filtering and searching
 * - Asset-related business logic
 * - Asset data caching
 * 
 * Dependencies:
 * - CacheService for data caching
 * - TransformService for data transformation
 * 
 * Data Flow:
 * Raw JSON -> Service -> Cache -> Core Types -> Components
 */

import type { TokenMetadata } from '$lib/types/MetaboardTypes';
import type { Asset } from '$lib/types/uiTypes';
import type { CoreAsset, CoreAssetTerms, CoreAssetLocation } from '$lib/types/core';
import type { AssetTokenMapping } from '$lib/types/sharedTypes';
import { errorHandler, type ErrorContext } from '$lib/utils/errorHandling';
import { withErrorHandling } from '$lib/utils/errorHandling';

export interface AssetFilters {
  status?: 'funding' | 'producing' | 'completed';
  location?: string;
  tokenType?: 'royalty' | 'payment';
  minProduction?: number;
  maxProduction?: number;
}

export interface AssetSearchOptions {
  query?: string;
  filters?: AssetFilters;
  sortBy?: 'name' | 'production' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * AssetService class
 */
export class AssetService {
  private assetsCache: Map<string, Asset> = new Map();
  private coreAssetsCache: Map<string, CoreAsset> = new Map();
  private assetTokenMap: AssetTokenMapping;
  private tokenMetadataMap: Map<string, TokenMetadata> = new Map();

  constructor(
    assetTokenMapping: AssetTokenMapping,
    tokenMetadataMap: Map<string, TokenMetadata>
  ) {
    this.assetTokenMap = assetTokenMapping;
    this.tokenMetadataMap = tokenMetadataMap;
  }

  /**
   * Get all assets with error handling
   */
  async getAllAssets(): Promise<Asset[]> {
    const result = await withErrorHandling(
      async () => this.getAllAssetsSync(),
      { component: 'AssetService', action: 'getAllAssets' }
    );
    return result || [];
  }

  /**
   * Get all assets synchronously (internal implementation)
   */
  private getAllAssetsSync(): Asset[] {
    const assetMap = new Map<string, Asset>();
    const assetMetadataMap = new Map<string, TokenMetadata>();

    // Group tokens by asset ID and keep the one with most recent updatedAt
    this.tokenMetadataMap.forEach((tokenMetadata) => {
      const assetId = tokenMetadata.assetId;
      const existing = assetMetadataMap.get(assetId);

      if (
        !existing ||
        tokenMetadata.metadata.updatedAt > existing.metadata.updatedAt
      ) {
        assetMetadataMap.set(assetId, tokenMetadata);
      }
    });

    // Convert to Asset objects
    assetMetadataMap.forEach((tokenMetadata) => {
      try {
        const asset = this.convertTokenMetadataToAsset(tokenMetadata);
        assetMap.set(asset.id, asset);
      } catch (error) {
        errorHandler.handle(
          errorHandler.createError.assetLoadFailed(
            tokenMetadata.assetId,
            error as Error
          )
        );
      }
    });

    return Array.from(assetMap.values());
  }

  /**
   * Get asset by ID with error handling
   */
  async getAssetById(assetId: string): Promise<Asset | null> {
    return withErrorHandling(
      async () => this.getAssetByIdSync(assetId),
      { component: 'AssetService', action: 'getAssetById', assetId }
    );
  }

  /**
   * Get asset by ID synchronously (internal implementation)
   */
  private getAssetByIdSync(assetId: string): Asset | null {
    // Check cache first
    if (this.assetsCache.has(assetId)) {
      return this.assetsCache.get(assetId)!;
    }

    // Get all token addresses for this asset
    const assetInfo = this.assetTokenMap.assets[assetId];
    if (!assetInfo || assetInfo.tokens.length === 0) {
      return null;
    }

    // Find the token metadata with the most recent updatedAt
    let mostRecentMetadata: TokenMetadata | null = null;
    assetInfo.tokens.forEach((address) => {
      const metadata = this.tokenMetadataMap.get(address);
      if (
        metadata &&
        (!mostRecentMetadata ||
          metadata.metadata.updatedAt > mostRecentMetadata.metadata.updatedAt)
      ) {
        mostRecentMetadata = metadata;
      }
    });

    if (!mostRecentMetadata) {
      return null;
    }

    try {
      const asset = this.convertTokenMetadataToAsset(mostRecentMetadata);
      this.assetsCache.set(assetId, asset);
      return asset;
    } catch (error) {
      errorHandler.handle(
        errorHandler.createError.assetLoadFailed(assetId, error as Error)
      );
      return null;
    }
  }

  /**
   * Search and filter assets
   */
  async searchAssets(options: AssetSearchOptions = {}): Promise<Asset[]> {
    const result = await withErrorHandling(
      async () => this.searchAssetsSync(options),
      { component: 'AssetService', action: 'searchAssets', options }
    );
    return result || [];
  }

  /**
   * Search assets synchronously (internal implementation)
   */
  private searchAssetsSync(options: AssetSearchOptions): Asset[] {
    let assets = this.getAllAssetsSync();

    // Apply text search
    if (options.query) {
      const searchTerm = options.query.toLowerCase();
      assets = assets.filter(
        (asset) =>
          asset.name.toLowerCase().includes(searchTerm) ||
          asset.description.toLowerCase().includes(searchTerm) ||
          asset.location.state.toLowerCase().includes(searchTerm) ||
          asset.location.county.toLowerCase().includes(searchTerm) ||
          asset.location.country.toLowerCase().includes(searchTerm)
      );
    }

    // Apply filters
    if (options.filters) {
      const { status, location, minProduction, maxProduction } = options.filters;

      if (status) {
        assets = assets.filter((asset) => asset.production.status === status);
      }

      if (location) {
        const locationTerm = location.toLowerCase();
        assets = assets.filter(
          (asset) =>
            asset.location.state.toLowerCase().includes(locationTerm) ||
            asset.location.county.toLowerCase().includes(locationTerm) ||
            asset.location.country.toLowerCase().includes(locationTerm)
        );
      }

      if (minProduction !== undefined || maxProduction !== undefined) {
        assets = assets.filter((asset) => {
          const currentProduction = asset.operationalMetrics?.dailyProduction?.current || 0;
          if (minProduction !== undefined && currentProduction < minProduction) {
            return false;
          }
          if (maxProduction !== undefined && currentProduction > maxProduction) {
            return false;
          }
          return true;
        });
      }
    }

    // Apply sorting
    if (options.sortBy) {
      assets.sort((a, b) => {
        let comparison = 0;
        
        switch (options.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'production':
            const aProd = a.operationalMetrics?.dailyProduction?.current || 0;
            const bProd = b.operationalMetrics?.dailyProduction?.current || 0;
            comparison = aProd - bProd;
            break;
          case 'updatedAt':
            const aDate = new Date(a.metadata.updatedAt).getTime();
            const bDate = new Date(b.metadata.updatedAt).getTime();
            comparison = aDate - bDate;
            break;
        }

        return options.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Apply pagination
    if (options.offset !== undefined || options.limit !== undefined) {
      const start = options.offset || 0;
      const end = options.limit ? start + options.limit : undefined;
      assets = assets.slice(start, end);
    }

    return assets;
  }

  /**
   * Get assets by status
   */
  async getAssetsByStatus(status: 'funding' | 'producing' | 'completed'): Promise<Asset[]> {
    return this.searchAssets({ filters: { status } });
  }

  /**
   * Get assets by location
   */
  async getAssetsByLocation(location: string): Promise<Asset[]> {
    return this.searchAssets({ filters: { location } });
  }

  /**
   * Get asset statistics
   */
  async getAssetStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byLocation: Record<string, number>;
    totalProduction: number;
    averageUptime: number;
  }> {
    const result = await withErrorHandling(
      async () => {
        const assets = await this.getAllAssets();
        
        const stats = {
          total: assets.length,
          byStatus: {} as Record<string, number>,
          byLocation: {} as Record<string, number>,
          totalProduction: 0,
          averageUptime: 0
        };

        let totalUptime = 0;
        let uptimeCount = 0;

        assets.forEach(asset => {
          // Count by status
          const status = asset.production.status;
          stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

          // Count by location
          const location = asset.location.state;
          stats.byLocation[location] = (stats.byLocation[location] || 0) + 1;

          // Sum production
          if (asset.operationalMetrics?.dailyProduction?.current) {
            stats.totalProduction += asset.operationalMetrics.dailyProduction.current;
          }

          // Calculate average uptime
          if (asset.operationalMetrics?.uptime?.percentage) {
            totalUptime += asset.operationalMetrics.uptime.percentage;
            uptimeCount++;
          }
        });

        if (uptimeCount > 0) {
          stats.averageUptime = totalUptime / uptimeCount;
        }

        return stats;
      },
      { component: 'AssetService', action: 'getAssetStats' }
    );
    
    return result || {
      total: 0,
      byStatus: {},
      byLocation: {},
      totalProduction: 0,
      averageUptime: 0
    };
  }

  /**
   * Clear caches (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.assetsCache.clear();
    this.coreAssetsCache.clear();
  }

  /**
   * Convert TokenMetadata to Asset (internal transformation)
   */
  private convertTokenMetadataToAsset(tokenMetadata: TokenMetadata): Asset {
    const assetId = tokenMetadata.assetId;

    // Check cache first
    if (this.assetsCache.has(assetId)) {
      return this.assetsCache.get(assetId)!;
    }

    const asset: Asset = {
      id: assetId,
      name: tokenMetadata.asset.assetName,
      description: tokenMetadata.asset.description,
      coverImage: tokenMetadata.asset.coverImage,
      images: tokenMetadata.asset.galleryImages || [],
      location: {
        ...tokenMetadata.asset.location,
        waterDepth: tokenMetadata.asset.location.waterDepth,
      },
      operator: {
        ...tokenMetadata.asset.operator,
        experience: `${tokenMetadata.asset.operator.experienceYears}+ years`,
      },
      technical: {
        ...tokenMetadata.asset.technical,
        depth: `${tokenMetadata.asset.technical.depth}m`,
        estimatedLife: `${Math.ceil(tokenMetadata.asset.technical.estimatedLifeMonths / 12)}+ years`,
        pricing: {
          benchmarkPremium:
            tokenMetadata.asset.technical.pricing.benchmarkPremium < 0
              ? `-$${Math.abs(tokenMetadata.asset.technical.pricing.benchmarkPremium)}`
              : `+$${tokenMetadata.asset.technical.pricing.benchmarkPremium}`,
          transportCosts:
            tokenMetadata.asset.technical.pricing.transportCosts === 0
              ? "Title transfer at well head"
              : `$${tokenMetadata.asset.technical.pricing.transportCosts}`,
        },
      },
      production: {
        ...tokenMetadata.asset.production,
        status: this.convertProductionStatus(tokenMetadata.asset.production.status),
        units: {
          production:
            tokenMetadata.asset.production.units.production === 1
              ? "BOE (Barrels of Oil Equivalent)"
              : "MCF (Thousand Cubic Feet)",
          revenue: "USD",
        },
      },
      assetTerms: {
        ...tokenMetadata.asset.assetTerms,
        amount: `${tokenMetadata.asset.assetTerms.amount}% of gross`,
        paymentFrequency: `Monthly within ${tokenMetadata.asset.assetTerms.paymentFrequencyDays} days`,
      },
      tokenContracts: this.getTokenContractsByAssetId(assetId),
      monthlyReports: tokenMetadata.monthlyData.map((data) => ({
        month: data.month,
        production: data.assetData.production,
        revenue: data.assetData.revenue,
        expenses: data.assetData.expenses,
        netIncome: data.assetData.netIncome,
        payoutPerToken: data.tokenPayout.payoutPerToken,
      })),
      productionHistory: tokenMetadata.asset.productionHistory,
      plannedProduction: tokenMetadata.asset.plannedProduction,
      operationalMetrics: tokenMetadata.asset.operationalMetrics
        ? {
            ...tokenMetadata.asset.operationalMetrics,
            dailyProduction: {
              ...tokenMetadata.asset.operationalMetrics.dailyProduction,
              unit: tokenMetadata.asset.operationalMetrics.dailyProduction.unit,
            },
            uptime: {
              ...tokenMetadata.asset.operationalMetrics.uptime,
              period: tokenMetadata.asset.operationalMetrics.uptime.period,
            },
            hseMetrics: {
              ...tokenMetadata.asset.operationalMetrics.hseMetrics,
              incidentFreeDays:
                tokenMetadata.asset.operationalMetrics.hseMetrics.incidentFreeDays,
            },
          }
        : undefined,
      metadata: {
        createdAt: tokenMetadata.metadata.createdAt,
        updatedAt: tokenMetadata.metadata.updatedAt,
      },
    };

    this.assetsCache.set(assetId, asset);
    return asset;
  }

  /**
   * Get token contracts by asset ID
   */
  private getTokenContractsByAssetId(assetId: string): string[] {
    const assetInfo = this.assetTokenMap.assets[assetId];
    return assetInfo?.tokens || [];
  }

  /**
   * Convert production status from enum to string
   */
  private convertProductionStatus(status: any): 'funding' | 'producing' | 'completed' {
    // Convert from ProductionStatus enum to string
    if (status === 'producing') return 'producing';
    if (status === 'development') return 'funding';
    if (status === 'exploration') return 'funding';
    if (status === 'suspended') return 'completed';
    if (status === 'decommissioned') return 'completed';
    return 'funding'; // default
  }
}