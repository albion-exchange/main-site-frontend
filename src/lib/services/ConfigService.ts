/**
 * @fileoverview Configuration Service
 * Centralizes configuration management and provides typed access to app settings
 * 
 * Responsibilities:
 * - Load and manage configuration data
 * - Provide typed access to platform settings
 * - Handle environment-specific configurations
 * 
 * Data Sources:
 * - Market data and statistics
 * - Platform configuration
 * - Company information
 * - Future release schedules
 */

// Import configuration data
import marketData from "$lib/data/marketData.json";
import platformStats from "$lib/data/platformStats.json";
import companyInfo from "$lib/data/companyInfo.json";
import futureReleasesData from "$lib/data/futureReleases.json";

export interface MarketConfig {
  commodityPrices: {
    oil: {
      current: number;
      currency: string;
      benchmark: string;
      lastUpdated: string;
    };
    gas: {
      current: number;
      currency: string;
      benchmark: string;
      lastUpdated: string;
    };
  };
  exchangeRates: {
    [currency: string]: {
      rate: number;
      lastUpdated: string;
    };
  };
  marketIndicators: {
    [indicator: string]: {
      value: number;
      change: number;
      lastUpdated: string;
    };
  };
}

export interface PlatformConfig {
  totalAssets: number;
  totalInvestors: number;
  totalDistributed: number;
  averageReturn: number;
  platformFee: number;
  minimumInvestment: number;
  supportedCurrencies: string[];
  supportedNetworks: string[];
}

export interface CompanyConfig {
  name: string;
  tagline: string;
  website: string;
  contact: {
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
  };
  social: {
    twitter: string;
    linkedin: string;
    telegram: string;
  };
  legal: {
    termsOfService: string;
    privacyPolicy: string;
    riskDisclosure: string;
  };
}

export interface FutureRelease {
  id: string;
  assetId: string;
  whenRelease: string;
  description: string;
  emoji?: string;
  estimatedTokens?: number;
  estimatedPrice?: number;
}

export interface AppConfig {
  market: MarketConfig;
  platform: PlatformConfig;
  company: CompanyConfig;
  futureReleases: FutureRelease[];
}

class ConfigService {
  private config: AppConfig;

  constructor() {
    this.config = {
      market: marketData as MarketConfig,
      platform: platformStats as PlatformConfig,
      company: companyInfo as CompanyConfig,
      futureReleases: futureReleasesData as FutureRelease[]
    };
  }

  /**
   * Get complete configuration
   */
  getConfig(): AppConfig {
    return this.config;
  }

  /**
   * Get market configuration
   */
  getMarketConfig(): MarketConfig {
    return this.config.market;
  }

  /**
   * Get platform configuration
   */
  getPlatformConfig(): PlatformConfig {
    return this.config.platform;
  }

  /**
   * Get company information
   */
  getCompanyConfig(): CompanyConfig {
    return this.config.company;
  }

  /**
   * Get future releases
   */
  getFutureReleases(): FutureRelease[] {
    return this.config.futureReleases;
  }

  /**
   * Get future releases for a specific asset
   */
  getFutureReleasesByAsset(assetId: string): FutureRelease[] {
    return this.config.futureReleases.filter(release => release.assetId === assetId);
  }

  /**
   * Get future release by ID
   */
  getFutureReleaseById(releaseId: string): FutureRelease | null {
    return this.config.futureReleases.find(release => release.id === releaseId) || null;
  }

  /**
   * Get current oil price
   */
  getCurrentOilPrice(): number {
    return this.config.market.commodityPrices.oil.current;
  }

  /**
   * Get current gas price
   */
  getCurrentGasPrice(): number {
    return this.config.market.commodityPrices.gas.current;
  }

  /**
   * Get exchange rate for currency
   */
  getExchangeRate(currency: string): number {
    return this.config.market.exchangeRates[currency]?.rate || 1;
  }

  /**
   * Get platform statistics
   */
  getPlatformStats(): {
    totalAssets: number;
    totalInvestors: number;
    totalDistributed: number;
    averageReturn: number;
  } {
    const platform = this.config.platform;
    return {
      totalAssets: platform.totalAssets,
      totalInvestors: platform.totalInvestors,
      totalDistributed: platform.totalDistributed,
      averageReturn: platform.averageReturn
    };
  }

  /**
   * Get platform fee
   */
  getPlatformFee(): number {
    return this.config.platform.platformFee;
  }

  /**
   * Get minimum investment amount
   */
  getMinimumInvestment(): number {
    return this.config.platform.minimumInvestment;
  }

  /**
   * Check if currency is supported
   */
  isCurrencySupported(currency: string): boolean {
    return this.config.platform.supportedCurrencies.includes(currency);
  }

  /**
   * Check if network is supported
   */
  isNetworkSupported(network: string): boolean {
    return this.config.platform.supportedNetworks.includes(network);
  }

  /**
   * Get company contact information
   */
  getContactInfo(): CompanyConfig['contact'] {
    return this.config.company.contact;
  }

  /**
   * Get social media links
   */
  getSocialLinks(): CompanyConfig['social'] {
    return this.config.company.social;
  }

  /**
   * Get legal document links
   */
  getLegalLinks(): CompanyConfig['legal'] {
    return this.config.company.legal;
  }

  /**
   * Get market indicator value
   */
  getMarketIndicator(indicator: string): {
    value: number;
    change: number;
    lastUpdated: string;
  } | null {
    return this.config.market.marketIndicators[indicator] || null;
  }

  /**
   * Check if data is stale (for cache invalidation)
   */
  isDataStale(lastUpdated: string, maxAgeHours: number = 24): boolean {
    const lastUpdate = new Date(lastUpdated);
    const now = new Date();
    const ageHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    return ageHours > maxAgeHours;
  }

  /**
   * Reload configuration (useful for development)
   */
  reloadConfig(): void {
    // In a real app, this might fetch from API
    // For now, we'll just re-import the JSON files
    this.config = {
      market: marketData as MarketConfig,
      platform: platformStats as PlatformConfig,
      company: companyInfo as CompanyConfig,
      futureReleases: futureReleasesData as FutureRelease[]
    };
  }
}

// Export singleton instance
const configService = new ConfigService();
export default configService;