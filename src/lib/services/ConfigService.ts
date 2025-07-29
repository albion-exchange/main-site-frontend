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
import futureReleasesData from "$lib/data/futureReleases.json";



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
  futureReleases: FutureRelease[];
}

class ConfigService {
  private config: AppConfig;

  constructor() {
    this.config = {
      futureReleases: this.transformFutureReleasesData(futureReleasesData),
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
              estimatedPrice: release.estimatedPrice,
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
   * Get future releases
   */
  getFutureReleases(): FutureRelease[] {
    return this.config.futureReleases;
  }

  /**
   * Get future releases for a specific asset
   */
  getFutureReleasesByAsset(assetId: string): FutureRelease[] {
    return this.config.futureReleases.filter(
      (release) => release.assetId === assetId,
    );
  }

  /**
   * Get future release by ID
   */
  getFutureReleaseById(releaseId: string): FutureRelease | null {
    return (
      this.config.futureReleases.find((release) => release.id === releaseId) ||
      null
    );
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
      futureReleases: this.transformFutureReleasesData(futureReleasesData),
    };
  }
}

// Export singleton instance
const configService = new ConfigService();
export default configService;
