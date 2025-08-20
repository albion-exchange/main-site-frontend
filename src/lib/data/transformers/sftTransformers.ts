/**
 * SFT Data Transformers
 * Handles all transformations between raw data and UI types
 */

import type { OffchainAssetReceiptVault } from "$lib/types/graphql";
import type { Asset, Token, PlannedProduction } from "$lib/types/uiTypes";
import type { TokenMetadata } from "$lib/types/MetaboardTypes";
import type { ISODateTimeString } from "$lib/types/sharedTypes";
import { PINATA_GATEWAY } from "$lib/network";

/**
 * Base transformer for common SFT data
 */
class BaseSftTransformer {
  /**
   * Convert timestamp to ISO date string
   */
  protected timestampToISO(timestamp: string | number): ISODateTimeString {
    const ts = Number(timestamp);
    if (isNaN(ts) || ts <= 0) {
      return new Date().toISOString() as ISODateTimeString;
    }
    return new Date(ts * 1000).toISOString() as ISODateTimeString;
  }

  /**
   * Create metadata timestamps from SFT deploy timestamp
   */
  protected createMetadataTimestamps(sft: OffchainAssetReceiptVault) {
    const isoDate = this.timestampToISO(sft.deployTimestamp);
    return {
      createdAt: isoDate,
      updatedAt: isoDate
    };
  }

  /**
   * Validate required metadata fields
   */
  protected validateMetadata(metadata: any, requiredFields: string[]): void {
    if (!metadata) {
      throw new Error("Missing metadata");
    }

    for (const field of requiredFields) {
      const value = this.getNestedValue(metadata, field);
      if (value === undefined || value === null) {
        throw new Error(`Missing or invalid ${field}`);
      }
    }
  }

  /**
   * Get nested object value using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

/**
 * Transform SFT data to Token type
 */
export class TokenTransformer extends BaseSftTransformer {
  transform(
    sft: OffchainAssetReceiptVault,
    pinnedMetadata: any,
    maxSupply: string
  ): Token {
    const token: Token = {
      contractAddress: sft.id,
      name: sft.name,
      symbol: sft.symbol,
      decimals: 18, // All SFTs have default 18 decimals
      tokenType: "royalty",
      isActive: true,
      supply: {
        maxSupply: maxSupply.toString(),
        mintedSupply: sft.totalShares.toString(),
      },
      holders: sft.tokenHolders.map((holder) => ({
        address: holder.address,
        balance: holder.balance,
      })),
      payoutHistory: [],
      sharePercentage: pinnedMetadata?.sharePercentage || 0,
      firstPaymentDate: undefined,
      metadata: this.createMetadataTimestamps(sft),
    };

    return token;
  }
}

/**
 * Transform SFT data to TokenMetadata type
 */
export class TokenMetadataTransformer extends BaseSftTransformer {
  private readonly REQUIRED_FIELDS = [
    'releaseName',
    'tokenType',
    'sharePercentage',
    'firstPaymentDate',
    'asset'
  ];

  transform(
    sft: OffchainAssetReceiptVault,
    pinnedMetadata: any,
    maxSupply: string
  ): TokenMetadata {
    // Validate required fields
    this.validateMetadata(pinnedMetadata, this.REQUIRED_FIELDS);
    
    // Additional validation
    if (typeof pinnedMetadata.sharePercentage !== 'number' || 
        pinnedMetadata.sharePercentage < 0 || 
        pinnedMetadata.sharePercentage > 100) {
      throw new Error("Invalid sharePercentage - must be between 0 and 100");
    }

    if (pinnedMetadata.payoutData !== undefined && !Array.isArray(pinnedMetadata.payoutData)) {
      throw new Error("Invalid payoutData - must be an array");
    }

    const tokenMetadata: TokenMetadata = {
      contractAddress: sft.id,
      symbol: sft.symbol,
      releaseName: pinnedMetadata.releaseName,
      tokenType: pinnedMetadata.tokenType,
      firstPaymentDate: pinnedMetadata.firstPaymentDate,
      sharePercentage: pinnedMetadata.sharePercentage,
      decimals: typeof pinnedMetadata.decimals === 'number' ? pinnedMetadata.decimals : 18,
      supply: {
        maxSupply: maxSupply.toString(),
        mintedSupply: sft.totalShares.toString(),
      },
      payoutData: pinnedMetadata.payoutData || [],
      asset: pinnedMetadata.asset,
      metadata: pinnedMetadata.metadata || this.createMetadataTimestamps(sft),
    };

    return tokenMetadata;
  }
}

/**
 * Transform SFT data to Asset type
 */
export class AssetTransformer extends BaseSftTransformer {
  private readonly REQUIRED_FIELDS = [
    'asset.assetName',
    'asset.location',
    'asset.operator',
    'asset.technical',
    'asset.production',
    'asset.assetTerms'
  ];

  transform(
    sft: OffchainAssetReceiptVault,
    pinnedMetadata: any
  ): Asset {
    // Validate required fields
    this.validateMetadata(pinnedMetadata, this.REQUIRED_FIELDS);

    const assetData = pinnedMetadata.asset;
    
    const asset: Asset = {
      id: sft.id,
      name: assetData.assetName,
      description: assetData.description || "",
      coverImage: this.formatImageUrl(assetData.coverImage),
      images: this.formatGalleryImages(assetData.galleryImages),
      galleryImages: this.formatGalleryImages(assetData.galleryImages),
      location: this.transformLocation(assetData.location),
      operator: this.transformOperator(assetData.operator),
      technical: this.transformTechnical(assetData.technical),
      production: this.transformProduction(assetData),
      terms: this.transformTerms(assetData.assetTerms),
      assetTerms: this.transformTerms(assetData.assetTerms),
      tokenContracts: [sft.id],
      monthlyReports: this.transformMonthlyReports(assetData, pinnedMetadata),
      plannedProduction: this.transformPlannedProduction(assetData.plannedProduction),
      operationalMetrics: this.transformOperationalMetrics(assetData.operationalMetrics),
      metadata: this.createMetadataTimestamps(sft),
    };

    return asset;
  }

  private formatImageUrl(imageHash?: string): string {
    return imageHash ? `${PINATA_GATEWAY}/${imageHash}` : "";
  }

  private formatGalleryImages(images?: any[]): Array<{ title: string; url: string; caption: string }> {
    if (!Array.isArray(images)) return [];
    
    return images.map((image: any) => ({
      title: image?.title || "",
      url: image?.url ? `${PINATA_GATEWAY}/${image.url}` : "",
      caption: image?.caption || "",
    }));
  }

  private transformLocation(location: any) {
    return {
      state: location.state,
      county: location.county,
      country: location.country,
      coordinates: {
        lat: location.coordinates?.lat || 0,
        lng: location.coordinates?.lng || 0,
      },
      waterDepth: null,
    };
  }

  private transformOperator(operator: any) {
    return {
      name: operator.name,
      website: operator.website || "",
      experience: operator.experience || "",
    };
  }

  private transformTechnical(technical: any) {
    return {
      fieldType: technical.fieldType,
      depth: technical.depth,
      license: technical.license,
      estimatedLife: technical.estimatedLife,
      firstOil: technical.firstOil,
      infrastructure: technical.infrastructure,
      environmental: technical.environmental,
      expectedEndDate: technical.expectedEndDate,
      crudeBenchmark: technical.crudeBenchmark,
      pricing: {
        benchmarkPremium: (technical.pricing?.benchmarkPremium || 0).toString(),
        transportCosts: (technical.pricing?.transportCosts || 0).toString(),
      },
    };
  }

  private transformProduction(assetData: any) {
    // Calculate current production from most recent historical production
    let currentProduction = assetData.production?.current;
    
    if (assetData.historicalProduction && assetData.historicalProduction.length > 0) {
      const sortedProduction = [...assetData.historicalProduction].sort((a: any, b: any) => 
        b.month.localeCompare(a.month)
      );
      const mostRecentProduction = sortedProduction[0];
      currentProduction = `${mostRecentProduction.production.toFixed(0)} BOE/month`;
    }

    return {
      current: currentProduction,
      status: assetData.production?.status,
      units: {
        production: assetData.production?.units?.production || 0,
        revenue: assetData.production?.units?.revenue || 0,
      },
    };
  }

  private transformTerms(assetTerms: any) {
    return {
      interestType: assetTerms.interestType,
      amount: assetTerms.amount,
      paymentFrequency: assetTerms.paymentFrequencyDays,
    };
  }

  private transformMonthlyReports(assetData: any, pinnedMetadata: any) {
    // Try historicalProduction first (primary source of production data)
    if (Array.isArray(assetData.historicalProduction) && assetData.historicalProduction.length > 0) {
      return assetData.historicalProduction.map((record: any) => ({
        month: record?.month || '',
        production: record?.production || 0,
        revenue: 0,
        expenses: 0,
        netIncome: 0,
        payoutPerToken: 0,
      }));
    }
    // Fall back to receiptsData (legacy format with financial data)
    else if (Array.isArray(assetData.receiptsData) && assetData.receiptsData.length > 0) {
      return assetData.receiptsData.map((report: any, i: number) => ({
        month: report?.month || `2024-${String(i + 1).padStart(2, '0')}`,
        production: report?.assetData?.production || 0,
        revenue: report?.assetData?.revenue || 0,
        expenses: report?.assetData?.expenses || 0,
        netIncome: report?.assetData?.netIncome || 0,
        payoutPerToken: pinnedMetadata.payoutData?.[i]?.tokenPayout?.payoutPerToken || 0,
      }));
    }
    return [];
  }

  private transformPlannedProduction(plannedProduction: any): PlannedProduction {
    return {
      oilPriceAssumption: plannedProduction?.oilPriceAssumption || 0,
      oilPriceAssumptionCurrency: plannedProduction?.oilPriceAssumptionCurrency || "USD",
      projections: plannedProduction?.projections || [],
    };
  }

  private transformOperationalMetrics(metrics: any) {
    return metrics || {
      uptime: { percentage: 0, unit: "%", period: "unknown" },
      dailyProduction: { current: 0, target: 0, unit: "BOE" },
      hseMetrics: { 
        incidentFreeDays: 0, 
        lastIncidentDate: new Date().toISOString(), 
        safetyRating: "Unknown" 
      }
    };
  }
}

// Export singleton instances
export const tokenTransformer = new TokenTransformer();
export const tokenMetadataTransformer = new TokenMetadataTransformer();
export const assetTransformer = new AssetTransformer();