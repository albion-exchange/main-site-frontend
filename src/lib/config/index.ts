/**
 * Centralized Configuration Management
 * 
 * Consolidates all configuration from scattered JSON files
 * Provides type-safe configuration access
 * Supports environment-specific overrides
 * Enables configuration validation
 */

import marketData from '$lib/data/marketData.json';
import platformStats from '$lib/data/platformStats.json';
import companyInfo from '$lib/data/companyInfo.json';
import assetTokenMapping from '$lib/data/assetTokenMapping.json';

// === Configuration Interfaces ===

export interface MarketConfig {
  oilPrice: {
    current: number;
    currency: string;
    lastUpdated: string;
    trend: 'up' | 'down' | 'stable';
  };
  gasPrice: {
    current: number;
    currency: string;
    lastUpdated: string;
    trend: 'up' | 'down' | 'stable';
  };
  marketCap: {
    total: number;
    currency: string;
  };
  tradingVolume: {
    daily: number;
    currency: string;
  };
}

export interface PlatformConfig {
  totalAssets: number;
  totalTokens: number;
  totalUsers: number;
  totalPayouts: {
    amount: number;
    currency: string;
  };
  averageAPY: number;
  platformFee: number;
  performance: {
    uptime: number;
    responseTime: number;
  };
}

export interface CompanyConfig {
  name: string;
  description: string;
  founded: string;
  headquarters: string;
  website: string;
  email: string;
  phone: string;
  social: {
    twitter?: string;
    linkedin?: string;
    discord?: string;
    telegram?: string;
  };
  legal: {
    termsOfService: string;
    privacyPolicy: string;
    regulatoryCompliance: string[];
  };
}

export interface AssetMapping {
  assets: Record<string, {
    name: string;
    tokens: string[];
    status: 'active' | 'inactive' | 'pending';
  }>;
}

export interface CacheConfig {
  assets: {
    ttl: number; // milliseconds
    maxSize: number;
  };
  tokens: {
    ttl: number;
    maxSize: number;
  };
  market: {
    ttl: number;
    maxSize: number;
  };
}

export interface FeatureFlags {
  enableNewAssetPage: boolean;
  enableTokenTrading: boolean;
  enableAdvancedCharts: boolean;
  enableNotifications: boolean;
  enableBetaFeatures: boolean;
}

export interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  version: string;
  market: MarketConfig;
  platform: PlatformConfig;
  company: CompanyConfig;
  assets: AssetMapping;
  cache: CacheConfig;
  features: FeatureFlags;
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    currency: 'USD' | 'EUR' | 'GBP';
    dateFormat: 'US' | 'EU' | 'ISO';
    pageSize: number;
  };
}

// === Environment-specific configurations ===

const developmentConfig: Partial<AppConfig> = {
  environment: 'development',
  cache: {
    assets: { ttl: 60000, maxSize: 100 }, // 1 minute
    tokens: { ttl: 60000, maxSize: 100 },
    market: { ttl: 30000, maxSize: 50 }
  },
  features: {
    enableNewAssetPage: true,
    enableTokenTrading: false,
    enableAdvancedCharts: true,
    enableNotifications: false,
    enableBetaFeatures: true
  },
  api: {
    baseUrl: 'http://localhost:3000/api',
    timeout: 10000,
    retries: 3
  }
};

const productionConfig: Partial<AppConfig> = {
  environment: 'production',
  cache: {
    assets: { ttl: 300000, maxSize: 1000 }, // 5 minutes
    tokens: { ttl: 300000, maxSize: 1000 },
    market: { ttl: 60000, maxSize: 200 } // 1 minute
  },
  features: {
    enableNewAssetPage: true,
    enableTokenTrading: true,
    enableAdvancedCharts: true,
    enableNotifications: true,
    enableBetaFeatures: false
  },
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 15000,
    retries: 2
  }
};

const stagingConfig: Partial<AppConfig> = {
  environment: 'staging',
  cache: {
    assets: { ttl: 180000, maxSize: 500 }, // 3 minutes
    tokens: { ttl: 180000, maxSize: 500 },
    market: { ttl: 60000, maxSize: 100 }
  },
  features: {
    enableNewAssetPage: true,
    enableTokenTrading: true,
    enableAdvancedCharts: true,
    enableNotifications: false,
    enableBetaFeatures: true
  },
  api: {
    baseUrl: 'https://staging-api.example.com',
    timeout: 12000,
    retries: 3
  }
};

// === Base configuration ===

const baseConfig: AppConfig = {
  environment: 'development',
  version: '1.0.0',
  market: marketData as any as MarketConfig,
  platform: platformStats as any as PlatformConfig,
  company: companyInfo as any as CompanyConfig,
  assets: assetTokenMapping as any as AssetMapping,
  cache: {
    assets: { ttl: 300000, maxSize: 1000 },
    tokens: { ttl: 300000, maxSize: 1000 },
    market: { ttl: 60000, maxSize: 200 }
  },
  features: {
    enableNewAssetPage: true,
    enableTokenTrading: true,
    enableAdvancedCharts: true,
    enableNotifications: true,
    enableBetaFeatures: false
  },
  api: {
    baseUrl: '/api',
    timeout: 15000,
    retries: 2
  },
  ui: {
    theme: 'light',
    currency: 'USD',
    dateFormat: 'US',
    pageSize: 20
  }
};

// === Configuration resolution ===

function getCurrentEnvironment(): 'development' | 'staging' | 'production' {
  // Check environment variables
  if (typeof globalThis !== 'undefined' && 'process' in globalThis) {
    const process = (globalThis as any).process;
    if (process?.env?.NODE_ENV === 'production') return 'production';
    if (process?.env?.NODE_ENV === 'staging') return 'staging';
  }
  
  // Check browser location for staging
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('staging')) return 'staging';
    if (window.location.hostname === 'localhost') return 'development';
    if (window.location.protocol === 'https:') return 'production';
  }
  
  return 'development';
}

function mergeConfigs(base: AppConfig, override: Partial<AppConfig>): AppConfig {
  return {
    ...base,
    ...override,
    // Deep merge nested objects
    cache: { ...base.cache, ...override.cache },
    features: { ...base.features, ...override.features },
    api: { ...base.api, ...override.api },
    ui: { ...base.ui, ...override.ui }
  };
}

// === Exported configuration ===

const environment = getCurrentEnvironment();
let envConfig: Partial<AppConfig> = {};

switch (environment) {
  case 'development':
    envConfig = developmentConfig;
    break;
  case 'staging':
    envConfig = stagingConfig;
    break;
  case 'production':
    envConfig = productionConfig;
    break;
}

export const config: AppConfig = mergeConfigs(baseConfig, envConfig);

// === Configuration utilities ===

export const configUtils = {
  /**
   * Get configuration value by path
   */
  get<T = any>(path: string): T | undefined {
    const keys = path.split('.');
    let current: any = config;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    
    return current as T;
  },

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return config.features[feature] || false;
  },

  /**
   * Get cache configuration for service
   */
  getCacheConfig(service: keyof CacheConfig): CacheConfig[keyof CacheConfig] {
    return config.cache[service];
  },

  /**
   * Get API configuration
   */
  getApiConfig() {
    return config.api;
  },

  /**
   * Get UI configuration
   */
  getUIConfig() {
    return config.ui;
  },

  /**
   * Get current environment
   */
  getEnvironment() {
    return config.environment;
  },

  /**
   * Check if running in development
   */
  isDevelopment(): boolean {
    return config.environment === 'development';
  },

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return config.environment === 'production';
  },

  /**
   * Validate configuration
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate required fields
    if (!config.company.name) errors.push('Company name is required');
    if (!config.api.baseUrl) errors.push('API base URL is required');
    if (config.cache.assets.ttl <= 0) errors.push('Asset cache TTL must be positive');
    if (config.cache.tokens.ttl <= 0) errors.push('Token cache TTL must be positive');

    // Validate API timeout
    if (config.api.timeout <= 0) errors.push('API timeout must be positive');

    // Validate page size
    if (config.ui.pageSize <= 0) errors.push('UI page size must be positive');

    return {
      valid: errors.length === 0,
      errors
    };
  }
};

// Export default configuration
export default config;