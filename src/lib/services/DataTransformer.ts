/**
 * DataTransformer - Handles data transformation between metadata and UI types
 */

import type { Asset, Token } from "$lib/types/uiTypes";
import type { TokenMetadata } from "$lib/types/MetaboardTypes";
import { ProductionStatus } from "$lib/types/MetaboardTypes";

export class DataTransformer {
  static tokenMetadataToAsset(tokenMetadata: TokenMetadata): Asset {
    return {
      id: tokenMetadata.assetId,
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
        pricing: this.formatPricing(tokenMetadata.asset.technical.pricing),
      },
      production: {
        ...tokenMetadata.asset.production,
        status: this.convertProductionStatus(tokenMetadata.asset.production.status),
        units: this.formatProductionUnits(tokenMetadata.asset.production.units),
      },
      assetTerms: {
        ...tokenMetadata.asset.assetTerms,
        operatingAgreement: tokenMetadata.asset.assetTerms.operatingAgreement || "",
        description: tokenMetadata.asset.assetTerms.description || "",
      },
      sustainabilityScore: tokenMetadata.asset.sustainabilityScore || 0,
      reservesData: tokenMetadata.asset.reservesData || {},
      futureReleases: tokenMetadata.futureReleases || [],
      tokenAddresses: [tokenMetadata.contractAddress],
    };
  }

  static tokenMetadataToToken(tokenMetadata: TokenMetadata): Token {
    return {
      contractAddress: tokenMetadata.contractAddress,
      assetId: tokenMetadata.assetId,
      symbol: tokenMetadata.symbol,
      name: tokenMetadata.releaseName,
      tokenType: tokenMetadata.tokenType === 1 ? "royalty" : "payment",
      sharePercentage: tokenMetadata.sharePercentage,
      firstPaymentDate: tokenMetadata.firstPaymentDate,
      decimals: tokenMetadata.decimals,
      supply: tokenMetadata.supply,
      monthlyData: tokenMetadata.monthlyData,
      metadata: tokenMetadata.metadata,
      coverImage: tokenMetadata.asset.coverImage,
      assetName: tokenMetadata.asset.assetName,
    };
  }

  private static formatPricing(pricing: any) {
    return {
      benchmarkPremium: pricing.benchmarkPremium < 0
        ? `-$${Math.abs(pricing.benchmarkPremium)}`
        : `+$${pricing.benchmarkPremium}`,
      transportCosts: pricing.transportCosts === 0
        ? "Title transfer at well head"
        : `$${pricing.transportCosts}`,
    };
  }

  private static formatProductionUnits(units: any) {
    return {
      production: units.production === 1
        ? "BOE (Barrels of Oil Equivalent)"
        : "MCF (Thousand Cubic Feet)",
      revenue: "USD",
    };
  }

  private static convertProductionStatus(status: ProductionStatus): "funding" | "producing" | "completed" {
    switch (status) {
      case ProductionStatus.Funding:
        return "funding";
      case ProductionStatus.Producing:
        return "producing";
      case ProductionStatus.Completed:
        return "completed";
      default:
        return "funding";
    }
  }
}