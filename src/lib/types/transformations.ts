/**
 * @fileoverview Type transformation layer
 *
 * This module provides a clear separation between different data representations:
 * - Core types: Pure data types used internally (numbers, dates, enums)
 * - Display types: Formatted types for UI presentation (strings with units)
 * - API types: Types matching backend data structures
 *
 * Principles:
 * 1. Core types use primitive values (number, Date, boolean)
 * 2. Display types use formatted strings for direct rendering
 * 3. Transformations are explicit and bidirectional where needed
 * 4. No mixed types (string | number) - pick one representation
 */

import type {
  AssetData,
  TokenMetadata,
  PayoutData,
  ReceiptsData,
} from "./MetaboardTypes";
import { ProductionStatus as MetaboardProductionStatus } from "./MetaboardTypes";
import type {
  Asset as UIAsset,
  Token as UIToken,
  AssetLocation as UIAssetLocation
} from './uiTypes';
import type { ISODateOnlyString, ISODateTimeString } from './sharedTypes';
import { formatCurrency, formatNumber, formatSmartNumber } from '../utils/formatters';

/**
 * Core domain types - pure data representation
 * These types represent the true data structure without formatting
 */
export namespace Core {
  export interface AssetTerms {
    interestType: string;
    amount: number; // Percentage as number (e.g., 3.2 for 3.2%)
    paymentFrequencyDays: number;
  }

  export interface AssetLocation {
    state: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    waterDepth: number | null; // Meters as number, null if onshore
  }

  export interface AssetTechnical {
    depth: number; // Meters as number
    fieldType: string;
    estimatedLifeMonths: number;
    firstOil?: string;
    expectedEndDate?: string;
    crudeBenchmark?: string;
    license?: string;
    infrastructure?: string;
    environmental?: string;
  }

  export interface AssetPricing {
    benchmarkPremium: number; // Dollar amount as number
    transportCosts: number; // Dollar amount as number (0 means at wellhead)
  }

  export interface Asset {
    id: string;
    name: string;
    location: AssetLocation;
    terms: AssetTerms;
    technical: AssetTechnical;
    pricing: AssetPricing;
    operator: {
      name: string;
      experienceYears: number;
    };
    production: {
      status: "funding" | "producing" | "completed";
      expectedRemainingProduction: number | null; // BOE as number
      expectedEndDate: Date | null;
    };
    monthlyReports: MonthlyReport[];
  }

  export interface MonthlyReport {
    month: Date;
    production: number;
    revenue: number;
    netIncome: number;
  }

  export interface Token {
    contractAddress: string;
    symbol: string;
    assetId: string;
    assetName: string;
    sharePercentage: number;
    pricePerToken: number;
    decimals: number;
    supply: {
      maxSupply: bigint;
      mintedSupply: bigint;
      availableSupply: bigint;
    };
  }
}

/**
 * Display types - formatted for UI presentation
 * These types contain pre-formatted strings ready for display
 */
export namespace Display {
  export interface AssetTerms {
    interestType: string;
    amount: string; // "3.2% of gross"
    paymentFrequency: string; // "Monthly within 30 days"
  }

  export interface AssetLocation {
    state: string;
    country: string;
    waterDepth: string; // "3,200m" or "Onshore"
    displayName: string; // "Texas, USA"
  }

  export interface AssetTechnical {
    depth: string; // "3,200m"
    fieldType: string;
    estimatedLife: string; // "5+ years"
    firstOil?: string;
    expectedEndDate?: string;
    crudeBenchmark?: string;
    license?: string;
    infrastructure?: string;
    environmental?: string;
  }

  export interface AssetPricing {
    benchmarkPremium: string; // "+$5" or "-$3"
    transportCosts: string; // "$2.50/BBL" or "Title transfer at well head"
  }

  export interface Asset {
    id: string;
    name: string;
    location: AssetLocation;
    terms: AssetTerms;
    technical: AssetTechnical;
    pricing: AssetPricing;
    operator: {
      name: string;
      experience: string; // "25+ years"
    };
    production: {
      status: "funding" | "producing" | "completed";
      statusDisplay: string; // "Producing"
      expectedRemainingProduction: string; // "250k BOE" or "TBD"
      expectedEndDate: string; // "Dec 2028" or "TBD"
    };
    monthlyReports: DisplayMonthlyReport[];
  }

  export interface DisplayMonthlyReport {
    month: string; // "2024-03"
    production: string; // "1,234 BOE"
    revenue: string; // "$123,456"
    netIncome: string; // "$98,765"
  }

  export interface Token {
    contractAddress: string;
    symbol: string;
    assetId: string;
    assetName: string;
    sharePercentage: string; // "5%"
    pricePerToken: string; // "$100"
    supply: {
      maxSupply: string; // "1,000,000"
      mintedSupply: string; // "750,000"
      availableSupply: string; // "250,000"
    };
  }
}

/**
 * Transformation functions
 */
export class TypeTransformations {
  /**
   * Transform API/Metaboard types to Core types
   */
  static apiToCore = {
    assetData(data: AssetData): Partial<Core.Asset> {
      return {
        technical: {
          depth: data.technical.depth,
          fieldType: data.technical.fieldType,
          estimatedLifeMonths: data.technical.estimatedLifeMonths,
          firstOil: data.technical.firstOil,
          expectedEndDate: data.technical.expectedEndDate,
          crudeBenchmark: data.technical.crudeBenchmark,
          license: data.technical.license,
          infrastructure: data.technical.infrastructure,
          environmental: data.technical.environmental,
        },
        pricing: {
          benchmarkPremium: data.technical.pricing?.benchmarkPremium || 0,
          transportCosts: data.technical.pricing?.transportCosts || 0,
        },
        location: {
          state: data.location.state,
          country: data.location.country,
          coordinates: {
            latitude: data.location.coordinates.lat,
            longitude: data.location.coordinates.lng,
          },
          waterDepth:
            typeof data.location.waterDepth === "number"
              ? data.location.waterDepth
              : null,
        },
        terms: {
          interestType: data.assetTerms.interestType,
          amount: data.assetTerms.amount,
          paymentFrequencyDays: data.assetTerms.paymentFrequencyDays,
        },
        operator: {
          name: data.operator.name,
          experienceYears: data.operator.experienceYears,
        },
      };
    },

    productionStatus(
      status: MetaboardProductionStatus,
    ): Core.Asset["production"]["status"] {
      switch (status) {
        case MetaboardProductionStatus.Producing:
          return "producing";
        case MetaboardProductionStatus.Development:
        case MetaboardProductionStatus.Exploration:
          return "funding";
        case MetaboardProductionStatus.Suspended:
        case MetaboardProductionStatus.Decommissioned:
          return "completed";
        default:
          return "funding";
      }
    },

    receiptsData(data: ReceiptsData): Core.MonthlyReport {
      return {
        month: new Date(data.month + "-01"),
        production: data.assetData.production,
        revenue: data.assetData.revenue,
        netIncome: data.assetData.netIncome ?? 0,
      };
    },

    tokenSupply(
      supply: { maxSupply: string; mintedSupply: string },
      decimals: number,
    ): Core.Token["supply"] {
      return {
        maxSupply: BigInt(supply.maxSupply),
        mintedSupply: BigInt(supply.mintedSupply),
        availableSupply: BigInt(supply.maxSupply) - BigInt(supply.mintedSupply),
      };
    },

    tokenMetadata(data: TokenMetadata): Core.Token {
      return {
        contractAddress: data.contractAddress,
        symbol: data.symbol,
        assetId: data.assetId,
        assetName: data.asset.assetName,
        sharePercentage: data.sharePercentage,
        pricePerToken: 0, // TokenMetadata doesn't have pricePerToken
        decimals: data.decimals,
        supply: {
          maxSupply: BigInt(data.supply.maxSupply),
          mintedSupply: BigInt(data.supply.mintedSupply),
          availableSupply:
            BigInt(data.supply.maxSupply) - BigInt(data.supply.mintedSupply),
        },
      };
    },
  };

  /**
   * Transform Core types to Display types
   */
  static coreToDisplay = {
    asset(asset: Core.Asset): Display.Asset {
      return {
        id: asset.id,
        name: asset.name,
        location: {
          state: asset.location.state,
          country: asset.location.country,
          waterDepth:
            asset.location.waterDepth !== null
              ? `${formatNumber(asset.location.waterDepth)}m`
              : "Onshore",
          displayName: `${asset.location.state}, ${asset.location.country}`,
        },
        terms: {
          interestType: asset.terms.interestType,
          amount: `${asset.terms.amount}% of gross`,
          paymentFrequency: `Monthly within ${asset.terms.paymentFrequencyDays} days`,
        },
        technical: {
          depth: `${formatNumber(asset.technical.depth)}m`,
          fieldType: asset.technical.fieldType,
          estimatedLife: `${Math.ceil(asset.technical.estimatedLifeMonths / 12)}+ years`,
          firstOil: asset.technical.firstOil || "",
          expectedEndDate: asset.technical.expectedEndDate || "TBD",
          crudeBenchmark: asset.technical.crudeBenchmark || "",
          license: asset.technical.license || "",
          infrastructure: asset.technical.infrastructure || "",
          environmental: asset.technical.environmental || "",
        },
        pricing: {
          benchmarkPremium:
            asset.pricing.benchmarkPremium < 0
              ? `-$${Math.abs(asset.pricing.benchmarkPremium)}`
              : `+$${asset.pricing.benchmarkPremium}`,
          transportCosts:
            asset.pricing.transportCosts === 0
              ? "Title transfer at well head"
              : `$${asset.pricing.transportCosts.toFixed(2)}/BBL`,
        },
        operator: {
          name: asset.operator.name,
          experience: `${asset.operator.experienceYears}+ years`,
        },
        production: {
          status: asset.production.status,
          statusDisplay: asset.production.status.charAt(0).toUpperCase() + asset.production.status.slice(1),
                              expectedRemainingProduction: asset.production.expectedRemainingProduction !== null ? formatSmartNumber(asset.production.expectedRemainingProduction, { suffix: ' boe' }) : 'TBD',
          expectedEndDate: asset.production.expectedEndDate
            ? this.formatEndDate(asset.production.expectedEndDate)
            : "TBD",
        },
        monthlyReports: asset.monthlyReports.map((report) =>
          this.monthlyReport(report),
        ),
      };
    },

    monthlyReport(report: Core.MonthlyReport): Display.DisplayMonthlyReport {
      return {
        month: this.formatYearMonth(report.month),
        production: `${formatNumber(report.production)} BOE`,
        revenue: formatCurrency(report.revenue, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }),
        netIncome: formatCurrency(report.netIncome, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }),
      };
    },

    token(token: Core.Token, decimals: number = 18): Display.Token {
      const divisor = BigInt(10) ** BigInt(decimals);
      return {
        contractAddress: token.contractAddress,
        symbol: token.symbol,
        assetId: token.assetId,
        assetName: token.assetName,
        sharePercentage: `${token.sharePercentage}%`,
        pricePerToken: `$${token.pricePerToken}`,
        supply: {
          maxSupply: (token.supply.maxSupply / divisor).toLocaleString(),
          mintedSupply: (token.supply.mintedSupply / divisor).toLocaleString(),
          availableSupply: (
            token.supply.availableSupply / divisor
          ).toLocaleString(),
        },
      };
    },

    formatEndDate(date: Date): string {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    },

    formatYearMonth(date: Date): string {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      return `${year}-${month}`;
    },
  };

  /**
   * Transform Core types to UI types (legacy support)
   * This maintains backward compatibility with existing UI components
   */
  static coreToUI(asset: Core.Asset): UIAsset {
    const display = this.coreToDisplay.asset(asset);
    return {
      id: asset.id,
      name: asset.name,
      description: "", // Set in assetToUI when called with AssetData
      location: {
        state: asset.location.state,
        country: asset.location.country,
        coordinates: {
          lat: asset.location.coordinates.latitude,
          lng: asset.location.coordinates.longitude,
        },
        waterDepth: display.location.waterDepth,
      } as UIAssetLocation,
      coverImage: "", // Set in assetToUI when called with AssetData
      images: [], // Legacy field
      galleryImages: [],
      terms: display.terms,
      operator: {
        name: asset.operator.name,
        experience: display.operator.experience,
      },
      production: {
        status: asset.production.status,
        expectedRemainingProduction:
          display.production.expectedRemainingProduction,
        current: "", // Set in assetToUI from latest monthly report
        units: {
          production: "BOE (Barrels of Oil Equivalent)",
          revenue: "USD",
        },
      },
      geology: {
        depth: display.technical.depth,
        type: asset.technical.fieldType,
        estimatedLife: display.technical.estimatedLife,
      },
      monthlyReports: asset.monthlyReports.map((report) => ({
        month: this.coreToDisplay.formatYearMonth(report.month),
        production: report.production,
        revenue: report.revenue,
        netIncome: report.netIncome,
        expenses: 0, // Not available in current data
        payoutPerToken: 0, // Calculated separately by TokenService
      })),
      operationalMetrics: {
        uptime: {
          percentage: 0,
          period: "N/A",
          unit: "percentage",
        },
        dailyProduction: {
          current: 0,
          target: 0,
          unit: "BOE/day",
        },
        hseMetrics: {
          incidentFreeDays: 0,
          lastIncidentDate: new Date().toISOString(),
          safetyRating: "Unknown",
        },
      },
      pricing: {
        benchmarkPremium: display.pricing.benchmarkPremium,
        transportCosts: display.pricing.transportCosts,
      },
      technical: {
        depth: display.technical.depth,
        fieldType: asset.technical.fieldType,
        estimatedLife: display.technical.estimatedLife,
        firstOil: display.technical.firstOil || "",
        expectedEndDate: display.technical.expectedEndDate || "",
        crudeBenchmark: display.technical.crudeBenchmark || "",
        license: display.technical.license || "",
        infrastructure: display.technical.infrastructure || "",
        environmental: display.technical.environmental || "",
        pricing: {
          benchmarkPremium: display.pricing.benchmarkPremium,
          transportCosts: display.pricing.transportCosts,
        },
      },
    };
  }

  /**
   * Convenience method: Transform AssetData directly to UI Asset
   */
  static assetToUI(
    assetData: AssetData,
    assetId?: string,
    receiptsData?: any[],
  ): UIAsset {
    const coreAsset = this.apiToCore.assetData(assetData);
    const fullCoreAsset: Core.Asset = {
      id:
        assetId ||
        assetData.assetName?.toLowerCase().replace(/\s+/g, "-") ||
        "unknown-asset",
      name: assetData.assetName || "Unknown Asset",
      location: coreAsset.location!,
      terms: coreAsset.terms!,
      technical: coreAsset.technical!,
      pricing: coreAsset.pricing!,
      operator: coreAsset.operator!,
      production: {
        status: this.apiToCore.productionStatus(assetData.production.status),
        expectedRemainingProduction: null, // Set below from planned production
        expectedEndDate: null, // Set from technical.expectedEndDate
      },
      monthlyReports: [], // Populated below from receiptsData
    };
    const uiAsset = this.coreToUI(fullCoreAsset);
    // Add the missing fields from assetData
    uiAsset.description = assetData.description || "";
    uiAsset.coverImage = assetData.coverImage || "";
    uiAsset.galleryImages = assetData.galleryImages || [];

    // Map monthly reports from receiptsData parameter (which contains actual payout data from tokens)
    if (receiptsData && receiptsData.length > 0) {
      uiAsset.monthlyReports = receiptsData.map((data) => {
        const report = {
          month: data.month,
          production: data.assetData.production,
          revenue: data.assetData.revenue,
          expenses: data.assetData.expenses || 0,
          netIncome: data.assetData.netIncome,
          payoutPerToken: data.tokenPayout?.payoutPerToken || 0,
        };
        return report;
      });
    }
    // No fallback to productionHistory - monthlyReports should only contain payment data

    // Set productionHistory for the production tab
    if (
      assetData.historicalProduction &&
      assetData.historicalProduction.length > 0
    ) {
      uiAsset.productionHistory = assetData.historicalProduction.map(
        (record) => ({
          month: record.month,
          production: record.production || 0,
        }),
      );
    }

    // Calculate expected remaining production from planned production
    if (assetData.plannedProduction?.projections) {
      const totalPlannedProduction = assetData.plannedProduction.projections.reduce(
        (sum, proj) => sum + proj.production, 
        0
      );
      uiAsset.production.expectedRemainingProduction = totalPlannedProduction ? formatSmartNumber(totalPlannedProduction, { suffix: ' boe' }) : 'TBD';
    }

    // Set current production from latest monthly report
    if (uiAsset.monthlyReports && uiAsset.monthlyReports.length > 0) {
      const latestReport =
        uiAsset.monthlyReports[uiAsset.monthlyReports.length - 1];
      uiAsset.production.current = `${latestReport.production.toFixed(0)} BOE/month`;
    }

    // Set planned production data
    if (assetData.plannedProduction) {
      uiAsset.plannedProduction = assetData.plannedProduction;
    }

    // Set operational metrics from actual data
    if (assetData.operationalMetrics) {
      uiAsset.operationalMetrics = {
        uptime: {
          percentage: assetData.operationalMetrics.uptime?.percentage || 0,
          period: assetData.operationalMetrics.uptime?.period || "N/A",
          unit: "percentage",
        },
        dailyProduction: {
          current: assetData.operationalMetrics.dailyProduction?.current || 0,
          target: assetData.operationalMetrics.dailyProduction?.target || 0,
          unit: "BOE/day",
        },
        hseMetrics: {
          incidentFreeDays:
            assetData.operationalMetrics.hseMetrics?.incidentFreeDays || 0,
          lastIncidentDate:
            assetData.operationalMetrics.hseMetrics?.lastIncidentDate ||
            new Date().toISOString(),
          safetyRating:
            assetData.operationalMetrics.hseMetrics?.safetyRating || "Unknown",
        },
      };
    }

    return uiAsset;
  }

  /**
   * Convenience method: Transform TokenMetadata directly to UI Token
   */
  static tokenToUI(tokenData: TokenMetadata): UIToken {
    return {
      contractAddress: tokenData.contractAddress,
      name: tokenData.releaseName || tokenData.asset.assetName, // Use releaseName or fall back to asset.assetName
      symbol: tokenData.symbol,
      decimals: tokenData.decimals,
      tokenType: "royalty", // Default type, can be enhanced later
      assetId: tokenData.assetId,
      isActive: true,
      supply: {
        maxSupply: tokenData.supply.maxSupply,
        mintedSupply: tokenData.supply.mintedSupply,
      },
      // Add converted supply values for calculations
      supplyNumbers: {
        maxSupply: Number(
          BigInt(tokenData.supply.maxSupply) / BigInt(10 ** tokenData.decimals),
        ),
        mintedSupply: Number(
          BigInt(tokenData.supply.mintedSupply) /
            BigInt(10 ** tokenData.decimals),
        ),
      },
      holders: [], // Will be populated by service layer
      payoutHistory:
        tokenData.payoutData?.map((payout) => {
          // Find corresponding receipts data for oil/gas prices and production volume
          const receipts = tokenData.asset.receiptsData?.find(
            (r) => r.month === payout.month,
          );
          return {
            month: payout.month,
            date: payout.tokenPayout.date.split("T")[0] as any, // Convert to YYYY-MM-DD format
            totalPayout: payout.tokenPayout.totalPayout,
            payoutPerToken: payout.tokenPayout.payoutPerToken,
            oilPrice: receipts?.realisedPrice.oilPrice || 0,
            gasPrice: receipts?.realisedPrice.gasPrice || 0,
            productionVolume: receipts?.assetData.production || 0,
            txHash: payout.tokenPayout.txHash,
          };
        }) || [],
      sharePercentage: tokenData.sharePercentage,
      firstPaymentDate: tokenData.firstPaymentDate,
      metadata: {
        description: `Token representing ${tokenData.sharePercentage}% ownership in ${tokenData.asset.assetName}`,
        image: "", // Will be set by service layer
        external_url: "", // Will be set by service layer
        attributes: [],
      },
    };
  }
}
