// New service architecture exports
export { AssetService } from './AssetService';
export { TokenService } from './TokenService';
export { CacheService, cacheService } from './CacheService';
export { 
  getServiceContainer, 
  createServiceContainer, 
  setServiceContainer,
  serviceContainer,
  type ServiceContainer 
} from './ServiceContainer';

// Legacy services - keep for gradual migration
export { default as DataStoreService, dataStoreService } from "./DataStoreService";
export { walletDataService } from "./WalletDataService.js";

// Export service context for components
export {
  useAssetService,
  useTokenService,
  useCacheService,
  useServices,
  useAssets,
  useTokens,
  useAssetTokenData
} from '../context/services';
