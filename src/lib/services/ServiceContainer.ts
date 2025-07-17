/**
 * ServiceContainer - Dependency injection and service management
 * 
 * Responsibilities:
 * - Initialize and manage service instances
 * - Provide dependency injection
 * - Handle service lifecycle
 * - Enable service mocking for testing
 * 
 * Usage:
 * - Services access other services through the container
 * - Components access services through context
 * - Tests can mock services by replacing container instances
 */

import type { TokenMetadata } from '$lib/types/MetaboardTypes';
import type { AssetTokenMapping } from '$lib/types/sharedTypes';
import { AssetService } from './AssetService';
import { TokenService } from './TokenService';
import { CacheService, cacheService } from './CacheService';
import { errorHandler } from '$lib/utils/errorHandling';

// Import data
import assetTokenMapping from '$lib/data/assetTokenMapping.json';
import bakHf1Metadata from '$lib/data/mockTokenMetadata/bak-hf1.json';
import bakHf2Metadata from '$lib/data/mockTokenMetadata/bak-hf2.json';
import eurWr1Metadata from '$lib/data/mockTokenMetadata/eur-wr1.json';
import eurWr2Metadata from '$lib/data/mockTokenMetadata/eur-wr2.json';
import eurWr3Metadata from '$lib/data/mockTokenMetadata/eur-wr3.json';
import perBv1Metadata from '$lib/data/mockTokenMetadata/per-bv1.json';
import gomDw1Metadata from '$lib/data/mockTokenMetadata/gom-dw1.json';
import eurWrLegacyMetadata from '$lib/data/mockTokenMetadata/eur-wr-legacy.json';

export interface ServiceContainer {
  assetService: AssetService;
  tokenService: TokenService;
  cacheService: CacheService;
}

export interface ServiceContainerOptions {
  // Allow dependency injection for testing
  assetService?: AssetService;
  tokenService?: TokenService;
  cacheService?: CacheService;
  // Configuration options
  enableCaching?: boolean;
  cacheOptions?: {
    assetCacheTtl?: number;
    tokenCacheTtl?: number;
  };
}

/**
 * ServiceContainer implementation
 */
class ServiceContainerImpl implements ServiceContainer {
  public assetService: AssetService;
  public tokenService: TokenService;
  public cacheService: CacheService;

  private tokenMetadataMap: Map<string, TokenMetadata> = new Map();
  private assetTokenMap!: AssetTokenMapping;
  private initialized = false;

  constructor(options: ServiceContainerOptions = {}) {
    // Use provided services or create default ones
    this.cacheService = options.cacheService || cacheService;
    
    // Initialize data
    this.initializeData();

    // Create services with dependencies
    this.assetService = options.assetService || new AssetService(
      this.assetTokenMap,
      this.tokenMetadataMap
    );

    this.tokenService = options.tokenService || new TokenService(
      this.assetTokenMap,
      this.tokenMetadataMap
    );

    this.initialized = true;

    // Set up error handling
    this.setupErrorHandling();
  }

  /**
   * Initialize data from JSON files
   */
  private initializeData(): void {
    try {
      // Set up asset-token mapping
      this.assetTokenMap = assetTokenMapping as AssetTokenMapping;

      // Initialize token metadata with proper date conversions
      const tokenMetadataFiles = [
        bakHf1Metadata,
        bakHf2Metadata,
        eurWr1Metadata,
        eurWr2Metadata,
        eurWr3Metadata,
        perBv1Metadata,
        gomDw1Metadata,
        eurWrLegacyMetadata
      ];

      tokenMetadataFiles.forEach(metadata => {
        const convertedMetadata = this.convertJsonToTokenMetadata(metadata as any);
        this.tokenMetadataMap.set(convertedMetadata.contractAddress, convertedMetadata);
      });

    } catch (error) {
      errorHandler.handleRaw(error as Error, {
        component: 'ServiceContainer',
        action: 'initializeData'
      });
      throw error;
    }
  }

  /**
   * Convert JSON data to TokenMetadata with proper typing
   */
  private convertJsonToTokenMetadata(jsonData: any): TokenMetadata {
    const tokenMetadata: TokenMetadata = {
      contractAddress: jsonData.contractAddress,
      assetId: jsonData.assetId,
      symbol: jsonData.symbol,
      releaseName: jsonData.releaseName,
      tokenType: jsonData.tokenType,
      firstPaymentDate: jsonData.firstPaymentDate,
      sharePercentage: jsonData.sharePercentage,
      decimals: jsonData.decimals,
      supply: jsonData.supply,
      monthlyData: jsonData.monthlyData,
      metadata: jsonData.metadata,
      asset: {
        ...jsonData.asset,
        assetName: jsonData.assetName,
        documents: jsonData.documents,
        coverImage: jsonData.coverImage,
        galleryImages: jsonData.galleryImages,
      }
    };
    return tokenMetadata;
  }

  /**
   * Set up error handling for service integration
   */
  private setupErrorHandling(): void {
    errorHandler.onError((error) => {
      // Could implement service-specific error handling here
      // For example, clearing caches on data errors
      if (error.code === 'ASSET_LOAD_FAILED' || error.code === 'TOKEN_LOAD_FAILED') {
        if (error.severity === 'high') {
          // Clear all caches on high severity errors
          this.assetService.clearCache();
          this.tokenService.clearCache();
        }
      }
    });
  }

  /**
   * Check if container is properly initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get service statistics for monitoring
   */
  getServiceStats(): {
    assets: { total: number; cached: number };
    tokens: { total: number; cached: number };
    cache: Record<string, any>;
  } {
    return {
      assets: {
        total: this.tokenMetadataMap.size,
        cached: 0 // Would need to expose from AssetService
      },
      tokens: {
        total: this.tokenMetadataMap.size,
        cached: 0 // Would need to expose from TokenService
      },
      cache: this.cacheService.getAllStats()
    };
  }

  /**
   * Refresh all services (clear caches and reload data)
   */
  async refresh(): Promise<void> {
    try {
      this.assetService.clearCache();
      this.tokenService.clearCache();
      this.cacheService.clearAll();
      
      // Could reload data from source here if needed
      // For now, the data is static from JSON files
    } catch (error) {
      errorHandler.handleRaw(error as Error, {
        component: 'ServiceContainer',
        action: 'refresh'
      });
      throw error;
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.cacheService.destroy();
    this.initialized = false;
  }
}

// Global service container instance
let globalContainer: ServiceContainer | null = null;

/**
 * Get the global service container instance
 */
export function getServiceContainer(): ServiceContainer {
  if (!globalContainer) {
    globalContainer = new ServiceContainerImpl();
  }
  return globalContainer;
}

/**
 * Create a new service container (useful for testing)
 */
export function createServiceContainer(options?: ServiceContainerOptions): ServiceContainer {
  return new ServiceContainerImpl(options);
}

/**
 * Set the global service container (useful for testing)
 */
export function setServiceContainer(container: ServiceContainer): void {
  globalContainer = container;
}

/**
 * Reset the global service container
 */
export function resetServiceContainer(): void {
  if (globalContainer && 'destroy' in globalContainer) {
    (globalContainer as any).destroy();
  }
  globalContainer = null;
}

// Export the container instance for direct access
export const serviceContainer = getServiceContainer();

export default serviceContainer;