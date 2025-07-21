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
import platformStats from "$lib/data/platformStats.json";
import companyInfo from "$lib/data/companyInfo.json";
import futureReleasesData from "$lib/data/futureReleases.json";

// Note: Market data is now handled by the dedicated marketDataService
// This interface is kept for compatibility but is not actively used

export interface PlatformConfig {
  totalAssets: number;
  totalInvestors: number;
  totalDistributed: number;
  averageReturn: number;
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
  platform: PlatformConfig;
  company: CompanyConfig;
  futureReleases: FutureRelease[];
}

class ConfigService {
  private config: AppConfig;

  constructor() {
    this.config = {
      platform: platformStats as PlatformConfig,
      company: companyInfo as CompanyConfig,
      futureReleases: this.transformFutureReleasesData(futureReleasesData)
    };
  }

  /**
   * Transform nested future releases data into flat array
   */
  private transformFutureReleasesData(data: any): FutureRelease[] {
    const releases: FutureRelease[] = [];
    
    // Iterate through assets
    for (const [assetId, tokens] of Object.entries(data)) {
      // Iterate through tokens for each asset
      for (const [tokenId, tokenReleases] of Object.entries(tokens as any)) {
        // Add each release with proper structure
        if (Array.isArray(tokenReleases)) {
          tokenReleases.forEach((release, index) => {
            releases.push({
              id: `${assetId}-${tokenId}-${index}`,
              assetId,
              whenRelease: release.whenRelease,
              description: release.description,
              emoji: release.emoji,
              estimatedTokens: release.estimatedTokens,
              estimatedPrice: release.estimatedPrice
            });
          });
        }
      }
    }
    
    return releases;
  }

  /**
   * Get complete configuration
   */
  getConfig(): AppConfig {
    return this.config;
  }

  /**
   * Get market configuration
   * @deprecated Market data is now handled by marketDataService
   */
  getMarketConfig(): null {
    console.warn('getMarketConfig is deprecated. Use marketDataService instead.');
    return null;
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
   * @deprecated Use marketDataService instead
   */
  getCurrentOilPrice(): number {
    console.warn('getCurrentOilPrice is deprecated. Use marketDataService instead.');
    return 0;
  }

  /**
   * Get current gas price
   * @deprecated Use marketDataService instead
   */
  getCurrentGasPrice(): number {
    console.warn('getCurrentGasPrice is deprecated. Use marketDataService instead.');
    return 0;
  }

  /**
   * Get exchange rate for currency
   * @deprecated Use marketDataService instead
   */
  getExchangeRate(currency: string): number {
    console.warn('getExchangeRate is deprecated. Use marketDataService instead.');
    return 1;
  }

  /**
   * Get platform statistics
   */
  getPlatformStats(): {
    totalAssets: number;
    totalInvestors: number;
    totalDistributed: number;
    averageReturn: number;
    totalHolders: number;
  } {
    // Map from the actual platformStats.json structure
    const stats = this.config.platform as any;
    return {
      totalAssets: stats.activeAssets?.value || 4,
      totalInvestors: stats.activeInvestors?.value || 1000,
      totalDistributed: stats.totalInvestmentVolume?.value || 127400000,
      averageReturn: stats.averagePayout?.value || 11.3,
      totalHolders: stats.activeInvestors?.value || 1000
    };
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
   * @deprecated Use marketDataService instead
   */
  getMarketIndicator(indicator: string): null {
    console.warn('getMarketIndicator is deprecated. Use marketDataService instead.');
    return null;
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
      platform: platformStats as PlatformConfig,
      company: companyInfo as CompanyConfig,
      futureReleases: this.transformFutureReleasesData(futureReleasesData)
    };
  }
}

// Export singleton instance
const configService = new ConfigService();
export default configService;