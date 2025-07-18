/**
 * @fileoverview Services index
 * Central export for all service classes
 */

export { default as DataStoreService } from './DataStoreService';
export { default as WalletDataService } from './WalletDataService';

// New focused services
export { default as AssetService } from './AssetService';
export { default as TokenService } from './TokenService';
export { default as ConfigService } from './ConfigService';

// Re-export types
export type { 
  MarketConfig, 
  PlatformConfig, 
  CompanyConfig, 
  FutureRelease,
  AppConfig 
} from './ConfigService';
