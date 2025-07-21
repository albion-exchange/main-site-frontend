/**
 * @fileoverview Services index
 * Central export for all service classes and service infrastructure
 */

export { default as WalletDataService } from './WalletDataService';

// Focused services
export { default as AssetService } from './AssetService';
export { default as TokenService } from './TokenService';
export { default as ConfigService } from './ConfigService';
export { MarketDataService, marketDataService } from './MarketDataService';

// Service infrastructure
export { 
  serviceContainer,
  useAssetService,
  useTokenService,
  useConfigService,
  useWalletDataService,
  type ServiceContainer
} from './ServiceContainer';

// Re-export types
export type { 
  MarketConfig, 
  PlatformConfig, 
  CompanyConfig, 
  FutureRelease,
  AppConfig 
} from './ConfigService';

export type {
  MarketData,
  MarketDataPoint
} from './MarketDataService';
