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

import { ENERGY_FIELDS } from "$lib/network";
import tokenService from "./TokenService";



export interface FutureRelease {
  id: string;
  energyField: string; // Energy field name from ENERGY_FIELDS
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
      futureReleases: [], // Will be dynamically generated
    };
  }

  /**
   * Calculate total share percentage for an energy field
   */
  async getTotalSharePercentage(energyFieldName: string): Promise<number> {
    try {
      // Get all tokens for this energy field
      const tokens = tokenService.getTokensByEnergyField(energyFieldName);
      if (!tokens || tokens.length === 0) return 0;
      
      // Get metadata for each token to access share percentage
      const tokenMetadataPromises = tokens.map(token => 
        tokenService.getTokenMetadataByAddress(token.contractAddress)
      );
      
      const tokenMetadata = await Promise.all(tokenMetadataPromises);
      
      // Calculate total share percentage
      const totalSharePercentage = tokenMetadata.reduce((sum, metadata) => {
        return sum + (metadata?.sharePercentage || 0);
      }, 0);
      
      return totalSharePercentage;
    } catch (error) {
      console.error(`Error calculating share percentage for ${energyFieldName}:`, error);
      return 0;
    }
  }

  /**
   * Check if an energy field has future releases (< 100% shares allocated)
   */
  async hasIncompleteReleases(energyFieldName: string): Promise<boolean> {
    const totalSharePercentage = await this.getTotalSharePercentage(energyFieldName);
    return totalSharePercentage < 100;
  }

  /**
   * Get complete configuration
   */
  getConfig(): AppConfig {
    return this.config;
  }



  /**
   * Get future releases (dynamically generated)
   */
  async getFutureReleases(): Promise<FutureRelease[]> {
    const releases: FutureRelease[] = [];
    
    // Check each energy field
    for (const field of ENERGY_FIELDS) {
      const hasIncomplete = await this.hasIncompleteReleases(field.name);
      if (hasIncomplete) {
        releases.push({
          id: `${field.name}-future`,
          energyField: field.name,
          whenRelease: "",
          description: "Additional token releases planned",
          emoji: "🚀"
        });
      }
    }
    
    return releases;
  }

  /**
   * Get future releases for a specific energy field
   */
  async getFutureReleasesByAsset(energyFieldOrAssetId: string): Promise<FutureRelease[]> {
    // Find the matching energy field
    const energyField = ENERGY_FIELDS.find(field => 
      field.name === energyFieldOrAssetId ||
      field.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === energyFieldOrAssetId
    );
    
    if (!energyField) return [];
    
    const hasIncomplete = await this.hasIncompleteReleases(energyField.name);
    if (hasIncomplete) {
      const totalSharePercentage = await this.getTotalSharePercentage(energyField.name);
      const remainingPercentage = 100 - totalSharePercentage;
      
      return [{
        id: `${energyField.name}-future`,
        energyField: energyField.name,
        whenRelease: "",
        description: `${remainingPercentage.toFixed(1)}% of tokens remaining for future releases`,
        emoji: "🚀"
      }];
    }
    return [];
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
   * Get market statistics (if needed for legacy support)
   */
  getMarketStats() {
    return {
      totalInvestedMillions: 0,
      totalAssetsCount: 0,
      averageROI: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Check if market data needs refresh (placeholder for future API integration)
   */
  isMarketDataStale(maxAgeHours: number = 24): boolean {
    const lastUpdate = new Date(this.getMarketStats().lastUpdated);
    const now = new Date();
    const ageHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    return ageHours > maxAgeHours;
  }

  /**
   * Reload configuration (useful for development)
   */
  reloadConfig(): void {
    // Reset config
    this.config = {
      futureReleases: [], // Will be dynamically generated
    };
  }
}

// Export singleton instance
const configService = new ConfigService();
export default configService;